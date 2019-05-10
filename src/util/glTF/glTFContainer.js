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
    COLOR : 4,
    TANGENT : 6,
    BITANGENT : 7
};

glTF_KHR_MATERIAL_COMMON_TECHNIQUE =
{
    BLINN : 0,
    PHONG : 1,
    LAMBERT : 2,
    CONSTANT : 3
};

PBR_MATERIAL_TECHNIQUE =
{
    METALLICROUGHNESS : 0,
    SPECULARGLOSSINESS : 1
};

x3dom.glTF.glTFMesh = function()
{
    this.indexOffset = 0;
    this.drawCount = 0;

    this.numFaces = 0;
    this.primitiveType = 0;

    this.numCoords = 0;

    this.buffers = {};
    
    this.transform = new x3dom.fields.SFMatrix4f();

    this.material = null;
};

x3dom.glTF.glTFMesh.prototype.bindVertexAttribPointer = function(gl, shaderProgram)
{
    if(this.buffers[x3dom.BUFFER_IDX.INDEX]){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers[x3dom.BUFFER_IDX.INDEX].idx);
    }

    if(this.material != null && this.material.attributeMapping != null)
    {
        var mapping = this.material.attributeMapping;
        this._bindVertexAttribPointer(gl, this.material.program[mapping[x3dom.BUFFER_IDX.POSITION]], this.buffers[x3dom.BUFFER_IDX.POSITION]);
        this._bindVertexAttribPointer(gl, this.material.program[mapping[x3dom.BUFFER_IDX.NORMAL]], this.buffers[x3dom.BUFFER_IDX.NORMAL]);
        this._bindVertexAttribPointer(gl, this.material.program[mapping[x3dom.BUFFER_IDX.TEXCOORD]], this.buffers[x3dom.BUFFER_IDX.TEXCOORD]);
        this._bindVertexAttribPointer(gl, this.material.program[mapping[x3dom.BUFFER_IDX.COLOR]], this.buffers[x3dom.BUFFER_IDX.COLOR]);
        this._bindVertexAttribPointer(gl, this.material.program[mapping[x3dom.BUFFER_IDX.TANGENT]], this.buffers[x3dom.BUFFER_IDX.TANGENT]);
        this._bindVertexAttribPointer(gl, this.material.program[mapping[x3dom.BUFFER_IDX.BITANGENT]], this.buffers[x3dom.BUFFER_IDX.BITANGENT]);
    }
    else
    {
        this._bindVertexAttribPointer(gl, shaderProgram.position, this.buffers[x3dom.BUFFER_IDX.POSITION]);
        this._bindVertexAttribPointer(gl, shaderProgram.normal, this.buffers[x3dom.BUFFER_IDX.NORMAL]);
        this._bindVertexAttribPointer(gl, shaderProgram.texcoord, this.buffers[x3dom.BUFFER_IDX.TEXCOORD]);
        this._bindVertexAttribPointer(gl, shaderProgram.color, this.buffers[x3dom.BUFFER_IDX.COLOR]);
        this._bindVertexAttribPointer(gl, shaderProgram.tangent, this.buffers[x3dom.BUFFER_IDX.TANGENT]);
        this._bindVertexAttribPointer(gl, shaderProgram.bitangent, this.buffers[x3dom.BUFFER_IDX.BITANGENT]);
    }
};

x3dom.glTF.glTFMesh.prototype.bindVertexAttribPointerPosition = function(gl, shaderProgram, useMaterial)
{
    if(this.buffers[x3dom.BUFFER_IDX.INDEX]){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers[x3dom.BUFFER_IDX.INDEX].idx);
    }

    if(useMaterial == true && this.material != null && this.material.attributeMapping != null)
    {
        var mapping = this.material.attributeMapping;
        this._bindVertexAttribPointer(gl, this.material.program[mapping[x3dom.BUFFER_IDX.POSITION]], this.buffers[x3dom.BUFFER_IDX.POSITION]);
    }
    else
    {
        this._bindVertexAttribPointer(gl, shaderProgram.position, this.buffers[x3dom.BUFFER_IDX.POSITION]);
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

    if(this.buffers[x3dom.BUFFER_IDX.INDEX])
        gl.drawElements(polyMode, this.drawCount, this.buffers[x3dom.BUFFER_IDX.INDEX].type, this.buffers[x3dom.BUFFER_IDX.INDEX].offset);
    else
        gl.drawArrays(polyMode, 0, this.drawCount);

};

x3dom.glTF.glTFTexture = function(gl, format, internalFormat, sampler, target, type, image, flip)
{
    this.format = format;
    this.internalFormat = internalFormat;
    this.sampler = sampler;
    this.target = target;
    this.type = type;
    this.image = image;
    this.flip = flip;

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
    
    if (this.flip)
    {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    }

    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, this.internalFormat, this.format, this.type, imgSrc);


    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.sampler.magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.sampler.minFilter);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.sampler.wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.sampler.wrapT);

    

    if(this.needsMipMaps(gl))
    {
        gl.generateMipmap(gl.TEXTURE_2D);
    }
        
    if (this.flip)
    {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    }
    
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

x3dom.glTF.PBRMaterial = function()
{
    this.baseColorFactor = [0.3,0.1,0.1,1];
    this.baseColorTex = null;

    this.metallicFactor = 0;
    this.metallicTex = null;

    this.roughnessFactor = 0.2;
    this.roughnessTex = null;

    this.normalTex = null;
    this.occlusionTex = null;

    this.doubleSided = false;

    this.technique = PBR_MATERIAL_TECHNIQUE.METALLICROUGHNESS;

    this.attributeMapping = {};
    this.attributeMapping[x3dom.BUFFER_IDX.POSITION] = "position";
    this.attributeMapping[x3dom.BUFFER_IDX.NORMAL] = "normal";
    this.attributeMapping[x3dom.BUFFER_IDX.TEXCOORD] = "texcoord";
    this.attributeMapping[x3dom.BUFFER_IDX.TANGENT] = "tangent";
    this.attributeMapping[x3dom.BUFFER_IDX.BITANGENT] = "bitangent";
};

x3dom.glTF.PBRMaterial.prototype.created = function()
{
    if(this.baseColorTex != null && this.baseColorTex.created != true)
        return false;

    if(this.metallicTex != null && this.metallicTex.created != true)
        return false;

    if(this.roughnessTex != null && this.roughnessTex.created != true)
        return false;

    if(this.normalTex != null && this.normalTex.created != true)
        return false;

    if(this.occlusionTex != null && this.occlusionTex.created != true)
        return false;

    return true;
};

x3dom.glTF.PBRMaterial.prototype.setShader = function(gl, cache, shape, properties)
{

    properties.EMPTY_SHADER = 0;

    properties.PBR_MATERIAL = 1;

    if(this.baseColorTex != null)
        properties.USE_BASECOLOR_TEX = 1;
    else
        properties.USE_BASECOLOR_TEX = 0;

    if(this.metallicTex != null)
        properties.USE_METALLIC_TEX = 1;
    else
        properties.USE_METALLIC_TEX = 0;

    if(this.roughnessTex != null)
        properties.USE_ROUGHNESS_TEX = 1;
    else
        properties.USE_ROUGHNESS_TEX = 0;

    if(this.normalTex != null)
        properties.USE_NORMAL_TEX = 1;
    else
        properties.USE_NORMAL_TEX = 0;

    if(this.occlusionTex != null)
        properties.USE_OCCLUSION_TEX = 1;
    else
        properties.USE_OCCLUSION_TEX = 0;

    properties.toIdentifier();

    this.program = cache.getShaderByProperties(gl, shape, properties);

};

x3dom.glTF.PBRMaterial.prototype.bind = function(gl, shaderProgram)
{
    this.program.bind();

    // set all used Shader Parameter
    for(var key in shaderProgram){
        if(!shaderProgram.hasOwnProperty(key))
            continue;

        if(this.program.hasOwnProperty(key))
            this.program[key] = shaderProgram[key];
    }

    if(this.baseColorTex != null)
        this.baseColorTex.bind(gl, 0, this.program.program, "baseColorTex");

    if(this.metallicTex != null)
        this.metallicTex.bind(gl, 1, this.program.program, "metallicTex");

    if(this.roughnessTex != null)
        this.roughnessTex.bind(gl, 2, this.program.program, "roughnessTex");

    if(this.normalTex != null)
        this.normalTex.bind(gl, 3, this.program.program, "normalTex");

    if(this.occlusionTex != null)
        this.occlusionTex.bind(gl, 4, this.program.program, "occlusionTex");

    this.program.baseColorFactor = this.baseColorFactor;
    this.program.metallicFactor = this.metallicFactor;
    this.program.roughnessFactor = this.roughnessFactor;

    this.program.technique = this.technique;
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

    this.technique = glTF_KHR_MATERIAL_COMMON_TECHNIQUE.PHONG;

    this.attributeMapping = {};
    this.attributeMapping[x3dom.BUFFER_IDX.POSITION] = "position";
    this.attributeMapping[x3dom.BUFFER_IDX.NORMAL] = "normal";
    this.attributeMapping[x3dom.BUFFER_IDX.TEXCOORD] = "texcoord";
    this.attributeMapping[x3dom.BUFFER_IDX.COLOR] = "color";
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
                        this.attributeMapping[x3dom.BUFFER_IDX.POSITION] = key;
                        break;
                    case "NORMAL":
                        this.attributeMapping[x3dom.BUFFER_IDX.NORMAL] = key;
                        break;
                    case "TEXCOORD_0":
                        this.attributeMapping[x3dom.BUFFER_IDX.TEXCOORD] = key;
                        break;
                    case "COLOR":
                        this.attributeMapping[x3dom.BUFFER_IDX.COLOR] = key;
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

            var worldInverse;
            var mapping = this.semanticMapping[key];

            switch(mapping){
                case "modelViewMatrix":
                    this.program[key] = shaderParameter.modelViewMatrix;
                    break;
                case "viewMatrix":
                    this.program[key] = shaderParameter.viewMatrix;
                    break;
                case "modelViewInverseTransposeMatrix":
                    //var mat = shaderParameter.normalMatrix;
                    //do modelviewinverse
                    worldInverse = this.worldTransform.inverse();
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
                    worldInverse = shaderParameter.model.inverse();
                    matrix4f.setFromArray(shaderParameter.modelViewMatrixInverse);
                    this.program[key] = worldInverse.mult(matrix4f);
                    break;
                case "modelViewProjectionMatrix":
                    this.program[key] = shaderParameter.modelViewProjectionMatrix;
                    break;
                case "modelMatrix":
                    this.program[key] = shaderParameter.model;
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
