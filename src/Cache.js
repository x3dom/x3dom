/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
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
x3dom.Cache.prototype.getTexture2D = function(gl, doc, url, bgnd)
{
	var textureIdentifier = url;
	
	if( this.textures[textureIdentifier] === undefined )
	{
		this.textures[textureIdentifier] = x3dom.Utils.createTexture2D(gl, doc, url, bgnd);
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
x3dom.Cache.prototype.getTextureCube = function(gl, doc, url, bgnd) 
{
	var textureIdentifier = "";

	for ( var i=0; i<url.length; ++i )
	{
		textureIdentifier += url[i] + "|";
	}
	
	if( this.textures[textureIdentifier] === undefined )
	{
		this.textures[textureIdentifier] = x3dom.Utils.createTextureCube(gl, doc, url, bgnd);
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
		if(shaderIdentifier == x3dom.shader.PICKING) {
			program = new x3dom.shader.PickingShader(gl);
			this.shaders[shaderIdentifier] = x3dom.Utils.wrapProgram(gl, program);			
		} else if(shaderIdentifier == x3dom.shader.PICKING_COLOR) {
			program = new x3dom.shader.PickingColorShader(gl);
			this.shaders[shaderIdentifier] = x3dom.Utils.wrapProgram(gl, program);
		} else if(shaderIdentifier == x3dom.shader.PICKING_TEXCOORD) {
			program = new x3dom.shader.PickingTexcoordShader(gl);
			this.shaders[shaderIdentifier] = x3dom.Utils.wrapProgram(gl, program);
		} else if(shaderIdentifier == x3dom.shader.FRONTGROUND_TEXTURE) {
			program = new x3dom.shader.FrontgroundTextureShader(gl);
			this.shaders[shaderIdentifier] = x3dom.Utils.wrapProgram(gl, program);
		} else if(shaderIdentifier == x3dom.shader.BACKGROUND_TEXTURE) {
			program = new x3dom.shader.BackgroundTextureShader(gl);
			this.shaders[shaderIdentifier] = x3dom.Utils.wrapProgram(gl, program);
		} else if(shaderIdentifier == x3dom.shader.BACKGROUND_SKYTEXTURE) {
			program = new x3dom.shader.BackgroundSkyTextureShader(gl);
			this.shaders[shaderIdentifier] = x3dom.Utils.wrapProgram(gl, program);
		} else if(shaderIdentifier == x3dom.shader.BACKGROUND_CUBETEXTURE) {
			program = new x3dom.shader.BackgroundCubeTextureShader(gl);
			this.shaders[shaderIdentifier] = x3dom.Utils.wrapProgram(gl, program);
		} else if(shaderIdentifier == x3dom.shader.SHADOW) {
			program = new x3dom.shader.ShadowShader(gl)
			this.shaders[shaderIdentifier] = x3dom.Utils.wrapProgram(gl, program);
		} else if(shaderIdentifier == x3dom.shader.DEPTH) {
			//program = new x3dom.shader.DepthShader(gl);
			//this.shaders[shaderIdentifier] = x3dom.Utils.wrapProgram(gl, program);
		} else if(shaderIdentifier == x3dom.shader.NORMAL) {
			//program = new x3dom.shader.new NormalShader(gl);
			//this.shaders[shaderIdentifier] = x3dom.Utils.wrapProgram(gl, program);
		}
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
		if(properties.CSHADER >= 0) {
			var program = new x3dom.shader.ComposedShader(gl, shape);
			this.shaders[properties.toIdentifier()] =  x3dom.Utils.wrapProgram(gl, program);
		} else {
			var program = (x3dom.caps.MOBILE && !properties.CSSHADER) ? new x3dom.shader.DynamicMobileShader(gl, properties) : 
																		new x3dom.shader.DynamicShader(gl, properties);
			this.shaders[properties.toIdentifier()] = x3dom.Utils.wrapProgram(gl, program);
		}
	}
	/* else {
		x3dom.debug.logInfo("[Cache] Using Shader from Cache");
	} */
	
	return this.shaders[properties.toIdentifier()];
};

/**
 * Release texture and shader resources
 */
x3dom.Cache.prototype.Release = function ()
{
	for(var texture in this.textures) { 
		gl.deleteTexture(this.textures[texture]);
	}

	for(var shader in this.textures) { 
		gl.deleteProgram(this.shaders[shader]);
	}
};
