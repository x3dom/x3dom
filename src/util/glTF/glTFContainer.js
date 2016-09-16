/**
 * Created by skluge on 27.06.2016.
 */
if(x3dom.glTF == null)
    x3dom.glTF = {};

glTF_BUFFER_IDX =
{
    INDEX : 0,
    POSITION : 1,
    NORMAL : 2,
    TEXCOORD : 3,
    COLOR : 4
};

glTF_KHR_MATERIAL_COMMON_TECHNIQUE =
{
    BLINN : 0,
    PHONG : 1,
    LAMBERT : 2,
    CONSTANT : 3
};

x3dom.glTF.glTFMesh = function()
{
    this.indexOffset = 0;
    this.drawCount = 0;

    this.numFaces = 0;
    this.primitiveType = 0;

    this.numCoords = 0;

    this.buffers = {};

    this.material = null;
};

x3dom.glTF.glTFMesh.prototype.bindVertexAttribPointer = function(gl, shaderProgram)
{
    if(this.buffers[glTF_BUFFER_IDX.INDEX]){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers[glTF_BUFFER_IDX.INDEX].idx);
    }

    if(this.material != null && this.material.attributeMapping != null)
    {
        var mapping = this.material.attributeMapping;
        this._bindVertexAttribPointer(gl, shaderProgram[mapping[glTF_BUFFER_IDX.POSITION]], this.buffers[glTF_BUFFER_IDX.POSITION]);
        this._bindVertexAttribPointer(gl, shaderProgram[mapping[glTF_BUFFER_IDX.NORMAL]], this.buffers[glTF_BUFFER_IDX.NORMAL]);
        this._bindVertexAttribPointer(gl, shaderProgram[mapping[glTF_BUFFER_IDX.TEXCOORD]], this.buffers[glTF_BUFFER_IDX.TEXCOORD]);
        this._bindVertexAttribPointer(gl, shaderProgram[mapping[glTF_BUFFER_IDX.COLOR]], this.buffers[glTF_BUFFER_IDX.COLOR]);
    }
    else
    {
        this._bindVertexAttribPointer(gl, shaderProgram.position, this.buffers[glTF_BUFFER_IDX.POSITION]);
        this._bindVertexAttribPointer(gl, shaderProgram.normal, this.buffers[glTF_BUFFER_IDX.NORMAL]);
        this._bindVertexAttribPointer(gl, shaderProgram.texcoord, this.buffers[glTF_BUFFER_IDX.TEXCOORD]);
        this._bindVertexAttribPointer(gl, shaderProgram.color, this.buffers[glTF_BUFFER_IDX.COLOR]);
    }
};

x3dom.glTF.glTFMesh.prototype._bindVertexAttribPointer = function(gl, shaderPosition, buffer)
{
    if(shaderPosition!=null && buffer != null)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.idx);
        gl.vertexAttribPointer(shaderPosition,
            buffer.numComponents, buffer.type, false,
            buffer.stride, buffer.offset);
        gl.enableVertexAttribArray(shaderPosition);
    }
};

x3dom.glTF.glTFMesh.prototype.render = function(gl, polyMode)
{
    if(polyMode == null)
        polyMode = this.primitiveType;

    if(this.buffers[glTF_BUFFER_IDX.INDEX])
        gl.drawElements(polyMode, this.drawCount, this.buffers[glTF_BUFFER_IDX.INDEX].type, this.buffers[glTF_BUFFER_IDX.INDEX].offset);
    else
        gl.drawArrays(polyMode, 0, this.drawCount);
};

x3dom.glTF.glTFTexture = function(gl, format, internalFormat, sampler, target, type, image)
{
    this.format = format;
    this.internalFormat = internalFormat;
    this.sampler = sampler;
    this.target = target;
    this.type = type;
    this.image = image;

    this.created = false;

    this.create(gl);
};

x3dom.glTF.glTFTexture.prototype.isPowerOfTwo = function(x)
{
    var powerOfTwo = !(x == 0) && !(x & (x - 1));
    return powerOfTwo;
};

x3dom.glTF.glTFTexture.prototype.create = function(gl)
{
    if(this.image.complete == false)
        return;

    this.glTexture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, this.internalFormat, this.format, this.type, this.image);

    if(this.sampler.magFilter != null)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.sampler.magFilter);

    if(this.sampler.minFilter != null)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.sampler.minFilter);

    //if(!this.isPowerOfTwo(this.image.width)||!this.isPowerOfTwo(this.image.height)){
        // gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        // Prevents s-coordinate wrapping (repeating).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        // Prevents t-coordinate wrapping (repeating).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //}

    //gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

    this.created = true;
};

x3dom.glTF.glTFTexture.prototype.bind = function(gl, textureUnit, shaderProgram, uniformName)
{
    if(!this.created)
        this.create(gl);

    gl.activeTexture(gl.TEXTURE0+textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, uniformName), textureUnit);
};


x3dom.glTF.glTFKHRMaterialCommons = function()
{
    this.diffuse = [0.3,0.1,0.1,1];
    this.diffuseTex = null;

    this.emission = [0.4,0.0,0.0,1];
    this.emissionTex = null;

    this.specular = [0.8,0.8,0.8,1];
    this.specularTex = null;

    this.ambient = [0,0,0,1];

    this.shininess = 2;
    this.transparency = 0.0;

    this.globalAmbient = [0,0,0,1];
    this.lightVector = [1,0,0,1];

    this.doubleSided = false;

    this.technique = glTF_KHR_MATERIAL_COMMON_TECHNIQUE.BLINN;
};

x3dom.glTF.glTFKHRMaterialCommons.prototype.bind = function(gl, shaderProgram)
{
    shaderProgram.bind();

    if(this.diffuseTex != null)
        shaderProgram.diffuseTex = this.diffuseTex.unit;
    else
        shaderProgram.diffuse = this.diffuse;

    if(this.emissionTex != null)
        shaderProgram.emissionTex = this.emissionTex.unit;
    else
        shaderProgram.emission = this.emission;

    if(this.specularTex != null)
        shaderProgram.specularTex = this.specularTex.unit;
    else
        shaderProgram.specular = this.specular;

    shaderProgram.shininess = this.shininess;
    shaderProgram.transparency = this.transparency;
    shaderProgram.globalAmbient = this.globalAmbient;
    shaderProgram.lightVector = this.lightVector;

    shaderProgram.technique = this.technique;
};

x3dom.glTF.glTFMaterial = function(technique)
{
    this.technique = technique;
    this.values = {};
    this.semanticMapping = {};
    this.attributeMapping = {};
    this.textures = {};

    for(var key in this.technique.uniforms)
    {
        if(this.technique.uniforms.hasOwnProperty(key))
        {
            var parameter = this.technique.parameters[this.technique.uniforms[key]];
            if(parameter.semantic != null)
                switch(parameter.semantic)
                {
                    case "MODELVIEW":
                        this.semanticMapping["modelViewMatrix"] = key;
                        break;
                    case "MODELVIEWINVERSETRANSPOSE":
                        this.semanticMapping["normalMatrix"] = key;
                        break;
                    case "PROJECTION":
                        this.semanticMapping["projectionMatrix"] = key;
                        break;
                    case "MODEL":
                        this.semanticMapping["model"] = key;
                        break;
                    case "MODELVIEWPROJECTION":
                        this.semanticMapping["modelViewProjectionMatrix"] = key;
                        break;
                    case "VIEW":
                        this.semanticMapping["viewMatrix"] = key;
                        break;
                    case "MODELVIEWINVERSE":
                        this.semanticMapping["modelViewMatrixInverse"] = key;
                        break;
                    default:
                        break;
                }
        }
    }

    for(var key in this.technique.attributes) {
        if (this.technique.attributes.hasOwnProperty(key)) {
            var parameter = this.technique.parameters[this.technique.attributes[key]];
            if (parameter.semantic != null)
                switch (parameter.semantic) {
                    case "POSITION":
                        this.attributeMapping[glTF_BUFFER_IDX.POSITION] = key;
                        break;
                    case "NORMAL":
                        this.attributeMapping[glTF_BUFFER_IDX.NORMAL] = key;
                        break;
                    case "TEXCOORD_0":
                        this.attributeMapping[glTF_BUFFER_IDX.TEXCOORD] = key;
                        break;
                    case "COLOR":
                        this.attributeMapping[glTF_BUFFER_IDX.COLOR] = key;
                        break;
                    default:
                        break;
                }
        }
    }
};

x3dom.glTF.glTFMaterial.prototype.bind = function(gl, shaderProgram)
{
    if(this.program != null)
        this.program.bind();

    for(var key in this.technique.uniforms)
        if(this.technique.uniforms.hasOwnProperty(key))
        {
            var uniformName = this.technique.uniforms[key];
            if(this.textures[uniformName] != null){
                var texture = this.textures[uniformName];
                texture.bind(gl, 0, shaderProgram.program, key);
            }
            else if(this.values[uniformName] != null)
                shaderProgram[key] = this.values[uniformName];
        }
};

x3dom.glTF.glTFMaterial.prototype.updateTransforms = function(mat_view, mat_scene, mat_proj, transform)
{
    if(this.program != null)
    {
        this.program.bind();

        var model_view = mat_view.mult(transform);
        var model_view_inv = model_view.inverse();

        if(this.semanticMapping["modelViewMatrix"] != null)
            this.program[this.semanticMapping["modelViewMatrix"]] = model_view.toGL();

        if(this.semanticMapping["viewMatrix"] != null)
            this.program[this.semanticMapping["viewMatrix"]] = mat_view.toGL();

        if(this.semanticMapping["normalMatrix"] != null) {
            var mat = model_view_inv.transpose()
            var model_view_inv_gl = [mat._00, mat._10, mat._20,
                                    mat._01, mat._11, mat._21,
                                    mat._02, mat._12, mat._22];

            this.program[this.semanticMapping["normalMatrix"]] = model_view_inv_gl;
        }

        if(this.semanticMapping["modelViewMatrixInverse"] != null)
            this.program[this.semanticMapping["modelViewMatrixInverse"]] = model_view_inv.toGL();


        if(this.semanticMapping["modelViewProjectionMatrix"] != null)
            this.program[this.semanticMapping["modelViewProjectionMatrix"]] = mat_scene.mult(transform).toGL();

        if(this.semanticMapping["model"] != null)
            this.program[this.semanticMapping["model"]] = transform.toGL();

        if(this.semanticMapping["projectionMatrix"] != null)
            this.program[this.semanticMapping["projectionMatrix"]] = mat_proj.toGL();
    }
};