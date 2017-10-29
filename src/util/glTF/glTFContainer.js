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
        this._bindVertexAttribPointer(gl, this.material.program[mapping[glTF_BUFFER_IDX.POSITION]], this.buffers[glTF_BUFFER_IDX.POSITION]);
        this._bindVertexAttribPointer(gl, this.material.program[mapping[glTF_BUFFER_IDX.NORMAL]], this.buffers[glTF_BUFFER_IDX.NORMAL]);
        this._bindVertexAttribPointer(gl, this.material.program[mapping[glTF_BUFFER_IDX.TEXCOORD]], this.buffers[glTF_BUFFER_IDX.TEXCOORD]);
        this._bindVertexAttribPointer(gl, this.material.program[mapping[glTF_BUFFER_IDX.COLOR]], this.buffers[glTF_BUFFER_IDX.COLOR]);
    }
    else
    {
        this._bindVertexAttribPointer(gl, shaderProgram.position, this.buffers[glTF_BUFFER_IDX.POSITION]);
        this._bindVertexAttribPointer(gl, shaderProgram.normal, this.buffers[glTF_BUFFER_IDX.NORMAL]);
        this._bindVertexAttribPointer(gl, shaderProgram.texcoord, this.buffers[glTF_BUFFER_IDX.TEXCOORD]);
        this._bindVertexAttribPointer(gl, shaderProgram.color, this.buffers[glTF_BUFFER_IDX.COLOR]);
    }
};

x3dom.glTF.glTFMesh.prototype.bindVertexAttribPointerPosition = function(gl, shaderProgram, useMaterial)
{
    if(this.buffers[glTF_BUFFER_IDX.INDEX]){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers[glTF_BUFFER_IDX.INDEX].idx);
    }

    if(useMaterial == true && this.material != null && this.material.attributeMapping != null)
    {
        var mapping = this.material.attributeMapping;
        this._bindVertexAttribPointer(gl, this.material.program[mapping[glTF_BUFFER_IDX.POSITION]], this.buffers[glTF_BUFFER_IDX.POSITION]);
    }
    else
    {
        this._bindVertexAttribPointer(gl, shaderProgram.position, this.buffers[glTF_BUFFER_IDX.POSITION]);
    }
};

x3dom.glTF.glTFMesh.prototype._bindVertexAttribPointer = function(gl, shaderPosition, buffer)
{
    if(shaderPosition!=null)
    {
        if(buffer != null){
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.idx);

        gl.vertexAttribPointer(shaderPosition,
            buffer.numComponents, buffer.type, false,
            buffer.stride, buffer.offset);
        gl.enableVertexAttribArray(shaderPosition);
        }else{
            gl.disableVertexAttribArray(shaderPosition);
        }
    }
};

x3dom.glTF.glTFMesh.prototype.render = function(gl, polyMode)
{
    if(this.material != null && !this.material.created())
        return;

    if(polyMode == null || polyMode > this.primitiveType)
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

x3dom.glTF.glTFTexture.prototype.needsPowerOfTwo = function(gl)
{
    var resize = true;
    resize &= (this.sampler.magFilter == gl.LINEAR || this.sampler.magFilter == gl.NEAREST);
    resize &= (this.sampler.minFilter == gl.LINEAR || this.sampler.minFilter == gl.NEAREST);
    resize &= (this.sampler.wrapS == gl.CLAMP_TO_EDGE);
    resize &= (this.sampler.wrapT == gl.CLAMP_TO_EDGE);

    return !resize;
};

x3dom.glTF.glTFTexture.prototype.needsMipMaps = function(gl)
{
    var need = true;
    need &= (this.sampler.magFilter == gl.LINEAR || this.sampler.magFilter == gl.NEAREST);
    need &= (this.sampler.minFilter == gl.LINEAR || this.sampler.minFilter == gl.NEAREST);

    return !need;
};

x3dom.glTF.glTFTexture.prototype.create = function(gl)
{
    if(this.image.complete == false)
        return;

    this.glTexture = gl.createTexture();

    var imgSrc = this.image;

    if(this.needsPowerOfTwo(gl)){
        var width = this.image.width;
        var height = this.image.height;

        var aspect = width / height;

        imgSrc = x3dom.Utils.scaleImage(this.image);

        var aspect2 = imgSrc.width / imgSrc.height;

        if(Math.abs(aspect - aspect2) > 0.01){
            console.warn("Image "+this.image.src+" was resized to power of two, but has unsupported aspect ratio and may be distorted!");
        }
    }

    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, this.internalFormat, this.format, this.type, imgSrc);


    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.sampler.magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.sampler.minFilter);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.sampler.wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.sampler.wrapT);

    //}

    if(this.needsMipMaps(gl))
        gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

    this.created = true;
};

x3dom.glTF.glTFTexture.prototype.bind = function(gl, textureUnit, shaderProgram, uniformName)
{
    gl.activeTexture(gl.TEXTURE0+textureUnit);

    if(!this.created)
        this.create(gl);

    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, uniformName), textureUnit);
};


x3dom.glTF.glTFKHRMaterialCommons = function()
{
    this.diffuse = [0.3,0.1,0.1,1];
    this.diffuseTex = null;

    this.emission = [0.0,0.0,0.0,1];
    this.emissionTex = null;

    this.specular = [0.8,0.8,0.8,1];
    this.specularTex = null;

    this.ambient = [0,0,0,1];

    this.shininess = 2;
    this.transparency = 0.0;

    this.globalAmbient = [0,0,0,1];
    this.lightVector = [1,0,0,1];

    this.doubleSided = false;

    this.technique = glTF_KHR_MATERIAL_COMMON_TECHNIQUE.CONSTANT;

    this.attributeMapping = {};
    this.attributeMapping[glTF_BUFFER_IDX.POSITION] = "position";
    this.attributeMapping[glTF_BUFFER_IDX.NORMAL] = "normal";
    this.attributeMapping[glTF_BUFFER_IDX.TEXCOORD] = "texcoord";
    this.attributeMapping[glTF_BUFFER_IDX.COLOR] = "color";
};

x3dom.glTF.glTFKHRMaterialCommons.prototype.created = function()
{
    if(this.diffuseTex != null && this.diffuseTex.created != true)
        return false;

    if(this.emissionTex != null && this.emissionTex.created != true)
        return false;

    if(this.specularTex != null && this.specularTex.created != true)
        return false;

    return true;
};

x3dom.glTF.glTFKHRMaterialCommons.prototype.setShader = function(gl, cache, shape, properties)
{

    properties.EMPTY_SHADER = 0;

    properties.KHR_MATERIAL_COMMONS = 1;

    if(this.diffuseTex != null)
        properties.USE_DIFFUSE_TEX = 1;
    else
        properties.USE_DIFFUSE_TEX = 0;

    if(this.emissionTex != null)
        properties.USE_SPECULAR_TEX = 1;
    else
        properties.USE_SPECULAR_TEX = 0;

    if(this.specularTex != null)
        properties.USE_EMISSION_TEX = 1;
    else
        properties.USE_EMISSION_TEX = 0;

    properties.toIdentifier();

    this.program = cache.getShaderByProperties(gl, shape, properties);

};

x3dom.glTF.glTFKHRMaterialCommons.prototype.bind = function(gl, shaderProgram)
{
    this.program.bind();

    // set all used Shader Parameter
    for(var key in shaderProgram){
        if(!shaderProgram.hasOwnProperty(key))
            continue;

        if(this.program.hasOwnProperty(key))
            this.program[key] = this.updateTransforms(key, shaderProgram[key]);
    }

    if(this.diffuseTex != null)
        this.diffuseTex.bind(gl, 0, this.program.program, "diffuseTex");
    else
        this.program.diffuse = this.diffuse;

    if(this.emissionTex != null)
        this.emissionTex.bind(gl, 0, this.program.program, "emissionTex");
    else
        this.program.emission = this.emission;

    if(this.specularTex != null)
        this.specularTex.bind(gl, 0, this.program.program, "specularTex");
    else
        this.program.specular = this.specular;

    this.program.shininess = this.shininess;
    this.program.transparency = this.transparency;
    this.program.globalAmbient = this.globalAmbient;
    this.program.lightVector = this.lightVector;

    this.program.technique = this.technique;
};

x3dom.glTF.glTFKHRMaterialCommons.prototype.updateTransforms = function(uniform, value)
{
    var matrix4f = new x3dom.fields.SFMatrix4f();
    
    function glMultMatrix4 (gl, m) {
        matrix4f.setFromArray(gl);
        return matrix4f.mult(m).toGL(); //optimize by multiplying gl matrixes directly
    };
    
    switch(uniform){
        case "modelViewInverseTransposeMatrix":
            //do modelviewinverse
            var worldInverse = this.worldTransform.inverse();
            matrix4f.setFromArray(value);
            //mult in, transpose and to GL
            var mat = worldInverse.mult(matrix4f).transpose().toGL();
            var model_view_inv_gl = [
                mat[0], mat[1], mat[2],
                mat[4],mat[5],mat[6],
                mat[8],mat[9],mat[10]];
            return model_view_inv_gl;
            break;
        case "modelViewInverseMatrix":
            // work with worldTransform.inverse
            // (VM x W)-1 = W-1 x VM-1
            var worldInverse = this.worldTransform.inverse();
            matrix4f.setFromArray(value);
            return worldInverse.mult(matrix4f);
            break;
        case "modelViewMatrix":
        case "modelViewProjectionMatrix":
        case "modelMatrix":
        case "model":
            return glMultMatrix4(value, this.worldTransform);
            break;
        case "viewMatrix":
        case "projectionMatrix":
            return value;
            break;
        default:
            return value;
            break;
    }
    
	console.warn("switch default not encountered ?");
	return value;
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
                        this.semanticMapping[key] = "modelViewMatrix";
                        break;
                    case "MODELVIEWINVERSETRANSPOSE":
                        this.semanticMapping[key] = "modelViewInverseTransposeMatrix";
                        break;
                    case "PROJECTION":
                        this.semanticMapping[key] = "projectionMatrix";
                        break;
                    case "MODEL":
                        this.semanticMapping[key] = "modelMatrix";
                        break;
                    case "MODELVIEWPROJECTION":
                        this.semanticMapping[key] = "modelViewProjectionMatrix";
                        break;
                    case "VIEW":
                        this.semanticMapping[key] = "viewMatrix";
                        break;
                    case "MODELVIEWINVERSE":
                        this.semanticMapping[key] = "modelViewInverseMatrix";
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

x3dom.glTF.glTFMaterial.prototype.created = function()
{
    for(var key in this.textures){
      if(!this.textures.hasOwnProperty(key)) continue;

      if(this.textures[key].created != true)
          return false;
    }

    return true;
};

x3dom.glTF.glTFMaterial.prototype.bind = function(gl, shaderParameter)
{
    if(this.program != null)
        this.program.bind();

    this.updateTransforms(shaderParameter);

    var texUnit = 0;

    for(var key in this.technique.uniforms)
        if(this.technique.uniforms.hasOwnProperty(key))
        {
            var uniformName = this.technique.uniforms[key];
            if(this.textures[uniformName] != null){
                var texture = this.textures[uniformName];
                texture.bind(gl, texUnit, this.program.program, key);
                texUnit++;
            }
            else if(this.values[uniformName] != null)
                this.program[key] = this.values[uniformName];
        }
};

x3dom.glTF.glTFMaterial.prototype.updateTransforms = function(shaderParameter)
{
    var matrix4f = new x3dom.fields.SFMatrix4f();
    
    function glMultMatrix4 (gl, m) {
        matrix4f.setFromArray(gl);
        return matrix4f.mult(m).toGL(); //optimize by multiplying gl matrixes directly
    }
    
    if(this.program !== null)
    {
        this.program.bind();

        for(var key in this.semanticMapping){
            if(!this.semanticMapping.hasOwnProperty(key))continue;

            var mapping = this.semanticMapping[key];

            switch(mapping){
                case "modelViewMatrix":
                    this.program[key] = glMultMatrix4(shaderParameter.modelViewMatrix, this.worldTransform);
                    break;
                case "viewMatrix":
                    this.program[key] = shaderParameter.viewMatrix;
                    break;
                case "modelViewInverseTransposeMatrix":
                    //var mat = shaderParameter.normalMatrix;
                    //do modelviewinverse
                    var worldInverse = this.worldTransform.inverse();
                    matrix4f.setFromArray(shaderParameter.modelViewMatrixInverse);
                    //mult in, transpose and to GL
                    var mat = worldInverse.mult(matrix4f).transpose().toGL();

                    var model_view_inv_gl =
                        [mat[0], mat[1], mat[2],
                            mat[4],mat[5],mat[6],
                            mat[8],mat[9],mat[10]];

                    this.program[key] = model_view_inv_gl;
                    break;
                case "modelViewInverseMatrix":
                    // work with worldTransform.inverse
                    // (VM x W)-1 = W-1 x VM-1
                    var worldInverse = this.worldTransform.inverse();
                    matrix4f.setFromArray(shaderParameter.modelViewMatrixInverse);
                    this.program[key] = worldInverse.mult(matrix4f);
                    break;
                case "modelViewProjectionMatrix":
                    this.program[key] = glMultMatrix4(shaderParameter.modelViewProjectionMatrix, this.worldTransform);
                    break;
                case "modelMatrix":
                    this.program[key] = glMultMatrix4(shaderParameter.model, this.worldTransform);
                    break;
                case "projectionMatrix":
                    this.program[key] = shaderParameter.projectionMatrix;
                    break;
                default:
                    break;
            }
        }
    }
};
