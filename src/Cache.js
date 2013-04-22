/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */


/**
 * @namespace Cache namespace
 */
x3dom.Cache = function()
{
	this.textures = [];
	this.shaders = [];
};

/**
 * Returns a Texture 2D
 */
x3dom.Cache.prototype.getTexture2D = function(gl, doc, url, bgnd, withCredentials)
{
	var textureIdentifier = url;
	
	if( this.textures[textureIdentifier] === undefined )
	{
		this.textures[textureIdentifier] = x3dom.Utils.createTexture2D(gl, doc, url, bgnd, withCredentials);
	} 
	/* else 
	{
		x3dom.debug.logInfo("[Cache] Using Texture from Cache");
	}*/
	
	return this.textures[textureIdentifier];
};

/**
 * Returns a Cube Texture
 */
x3dom.Cache.prototype.getTextureCube = function(gl, doc, url, bgnd, withCredentials) 
{
	var textureIdentifier = "";

	for ( var i=0; i<url.length; ++i )
	{
		textureIdentifier += url[i] + "|";
	}
	
	if( this.textures[textureIdentifier] === undefined )
	{
		this.textures[textureIdentifier] = x3dom.Utils.createTextureCube(gl, doc, url, bgnd, withCredentials);
	}
	/* else 
	{
		x3dom.debug.logInfo("[Cache] Using Texture from Cache");
	}*/
	
	return this.textures[textureIdentifier];
};

/**
 * Returns one of the default shader programs
 */
x3dom.Cache.prototype.getShader = function (gl, shaderIdentifier)
{
	var program = null;

	//Check if shader is in cache
	if( this.shaders[shaderIdentifier] === undefined )
	{
		//Choose shader based on identifier
        switch(shaderIdentifier)
        {
            case x3dom.shader.PICKING:
                program = new x3dom.shader.PickingShader(gl);
                break;
            case x3dom.shader.PICKING_24:
                program = new x3dom.shader.Picking24Shader(gl);
                break;
            case x3dom.shader.PICKING_COLOR:
                program = new x3dom.shader.PickingColorShader(gl);
                break;
            case x3dom.shader.PICKING_TEXCOORD:
                program = new x3dom.shader.PickingTexcoordShader(gl);
                break;
            case x3dom.shader.FRONTGROUND_TEXTURE:
                program = new x3dom.shader.FrontgroundTextureShader(gl);
                break;
            case x3dom.shader.BACKGROUND_TEXTURE:
                program = new x3dom.shader.BackgroundTextureShader(gl);
                break;
            case x3dom.shader.BACKGROUND_SKYTEXTURE:
                program = new x3dom.shader.BackgroundSkyTextureShader(gl);
                break;
            case x3dom.shader.BACKGROUND_CUBETEXTURE:
                program = new x3dom.shader.BackgroundCubeTextureShader(gl);
                break;
            case x3dom.shader.SHADOW:
                program = new x3dom.shader.ShadowShader(gl);
                break;
			case x3dom.shader.BLUR:
				program = new x3dom.shader.BlurShader(gl);
				break;				
            case x3dom.shader.DEPTH:
                //program = new x3dom.shader.DepthShader(gl);
                break;
            case x3dom.shader.NORMAL:
                program = new x3dom.shader.NormalShader(gl);
                break;
            default:
                break;
        }

        if (program)
            this.shaders[shaderIdentifier] = x3dom.Utils.wrapProgram(gl, program);
	}
	
	return this.shaders[shaderIdentifier];
};

/**
 * Returns a dynamic generated shader program
 */
x3dom.Cache.prototype.getDynamicShader = function (gl, viewarea, shape)
{
	//Generate Properties
	var properties = x3dom.Utils.generateProperties(viewarea, shape);
	//x3dom.debug.logInfo(properties.toString());
	
	if( this.shaders[properties.toIdentifier()] === undefined )
	{
        var program;
		if (properties.CSHADER >= 0) {
			program = new x3dom.shader.ComposedShader(gl, shape);
		} else {
			program = (x3dom.caps.MOBILE && !properties.CSSHADER) ? new x3dom.shader.DynamicMobileShader(gl, properties) :
																	new x3dom.shader.DynamicShader(gl, properties);
		}
        this.shaders[properties.toIdentifier()] = x3dom.Utils.wrapProgram(gl, program);
	}
	/* else {
		x3dom.debug.logInfo("[Cache] Using Shader from Cache");
	} */
	
	return this.shaders[properties.toIdentifier()];
};

/** 
 * Returns the dynamically created shadow rendering shader 
 */
x3dom.Cache.prototype.getShadowRenderingShader = function (gl, shadowedLights)
{
	var ID = "shadow";
	for (var i = 0; i<shadowedLights.length; i++){
			if(x3dom.isa(shadowedLights[i], x3dom.nodeTypes.SpotLight))
				ID += "S";
			else if (x3dom.isa(shadowedLights[i], x3dom.nodeTypes.PointLight))
				ID += "P";
			else 
				ID += "D";
		}
		

	if (this.shaders[ID]===undefined){
		var program = new x3dom.shader.ShadowRenderingShader(gl, shadowedLights);
		this.shaders[ID] = x3dom.Utils.wrapProgram(gl, program);
		}
	return this.shaders[ID];
}

/**
 * Release texture and shader resources
 */
x3dom.Cache.prototype.Release = function ()
{
	for (var texture in this.textures) {
		gl.deleteTexture(this.textures[texture]);
	}

	for (var shader in this.shaders) {
		gl.deleteProgram(this.shaders[shader]);
	}
};
