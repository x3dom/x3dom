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
 * ShaderCache
 */
x3dom.shader.ShaderCache = function(gl)
{
	this.gl = gl;
    this.cache = [];
};

/**
 * Returns one of the default shader programs
 */
x3dom.shader.ShaderCache.prototype.getShader = function (shaderIdentifier)
{
	//Check if shader is in cache
	if( this.cache[shaderIdentifier] == undefined ) 
	{
		//Choose shader based on identifier
		if(shaderIdentifier == x3dom.shader.PICKING) {
			var program = new x3dom.shader.PickingShader(this.gl);
			this.cache[shaderIdentifier] = this.wrapProgram(this.gl, program);			
		} else if(shaderIdentifier == x3dom.shader.PICKING_COLOR) {
			var program = new x3dom.shader.PickingColorShader(this.gl);
			this.cache[shaderIdentifier] = this.wrapProgram(this.gl, program);
		} else if(shaderIdentifier == x3dom.shader.PICKING_TEXCOORD) {
			var program = new x3dom.shader.PickingTexcoordShader(this.gl);
			this.cache[shaderIdentifier] = this.wrapProgram(this.gl, program);
		} else if(shaderIdentifier == x3dom.shader.FRONTGROUND_TEXTURE) {
			var program = new x3dom.shader.FrontgroundTextureShader(this.gl);
			this.cache[shaderIdentifier] = this.wrapProgram(this.gl, program);
		} else if(shaderIdentifier == x3dom.shader.BACKGROUND_TEXTURE) {
			var program = new x3dom.shader.BackgroundTextureShader(this.gl);
			this.cache[shaderIdentifier] = this.wrapProgram(this.gl, program);
		} else if(shaderIdentifier == x3dom.shader.BACKGROUND_SKYTEXTURE) {
			var program = new x3dom.shader.BackgroundSkyTextureShader(this.gl);
			this.cache[shaderIdentifier] = this.wrapProgram(this.gl, program);
		} else if(shaderIdentifier == x3dom.shader.BACKGROUND_CUBETEXTURE) {
			var program = new x3dom.shader.BackgroundCubeTextureShader(this.gl);
			this.cache[shaderIdentifier] = this.wrapProgram(this.gl, program);
		} else if(shaderIdentifier == x3dom.shader.SHADOW) {
			var program = new x3dom.shader.ShadowShader(this.gl)
			this.cache[shaderIdentifier] = this.wrapProgram(this.gl, program);
		} else if(shaderIdentifier == x3dom.shader.DEPTH) {
			//var program = new x3dom.shader.DepthShader(this.gl);
			//this.cache[shaderIdentifier] = this.wrapProgram(this.gl, program);
		} else if(shaderIdentifier == x3dom.shader.NORMAL) {
			//var program = new x3dom.shader.new NormalShader(this.gl);
			//this.cache[shaderIdentifier] = this.wrapProgram(this.gl, program);
		}
	}
	
	return this.cache[shaderIdentifier];
};

/**
 * Returns a dynamic generated shader program
 */
x3dom.shader.ShaderCache.prototype.getDynamicShader = function (viewarea, shape)
{
	//Generate Properties
	var properties = this.generateProperties(viewarea, shape);
	
	x3dom.debug.logInfo(properties.toString());
	
	if( this.cache[properties.toIdentifier()] == undefined ) 
	{
		if(properties.CSHADER >= 0) {
			var program = new x3dom.shader.ComposedShader(this.gl, shape);
			this.cache[properties.toIdentifier()] =  this.wrapProgram(this.gl, program);
		} else {
			var program = (x3dom.caps.MOBILE && !properties.CSSHADER) ? new x3dom.shader.DynamicMobileShader(this.gl, properties) : 
																		new x3dom.shader.DynamicShader(this.gl, properties);
			this.cache[properties.toIdentifier()] =  this.wrapProgram(this.gl, program);
		}
	} else {
		x3dom.debug.logInfo("[ShaderCache] Using Shader from Cache");
	}
	
	return this.cache[properties.toIdentifier()];
};

/**
 * Returns ...
 */
x3dom.shader.ShaderCache.prototype.generateProperties = function (viewarea, shape) 
{
	var property = {};
	
	var geometry 	= shape._cf.geometry.node;
	var appearance 	= shape._cf.appearance.node;
	var texture		= appearance._cf.texture.node;
	
	//Check if it's a composed shader
	if(appearance._shader && x3dom.isa(appearance._shader, x3dom.nodeTypes.ComposedShader)) {
		property.CSHADER			= shape._objectID;
	} else {
		property.CSHADER			= -1;
		property.SOLID				= (shape.isSolid()) ? 1 : 0;
		property.TEXT				= (x3dom.isa(geometry, x3dom.nodeTypes.Text)) ? 1 : 0;
		property.BITLODGEOMETRY		= (x3dom.isa(geometry, x3dom.nodeTypes.BitLODGeometry)) ? 1 : 0;
		property.IMAGEGEOMETRY		= (x3dom.isa(geometry, x3dom.nodeTypes.ImageGeometry)) ? 1 : 0;
		property.IG_PRECISION		= (property.IMAGEGEOMETRY) ? geometry.numCoordinateTextures() : 0;
		property.IG_INDEXED			= (property.IMAGEGEOMETRY && geometry.getIndexTexture() != null) ? 1 : 0;
		property.POINTLINE2D		= x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.PointSet) ||
									  x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.IndexedLineSet) ||
									  x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.Polypoint2D) ||
									  x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.Polyline2D) ||
									  x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.Arc2D) ||
									  x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.Circle2D) ? 1 : 0;					  
		property.LIGHTS				= (!property.POINTLINE2D) ? (viewarea.getLights().length) + (viewarea._scene.getNavigationInfo()._vf.headlight) : 0; 
		property.SHADOW				= (viewarea.getLightsShadow()) ? 1 : 0;
		property.FOG				= (viewarea._scene.getFog()._vf.visibilityRange > 0) ? 1 : 0;
		property.CSSHADER			= (appearance._shader && x3dom.isa(appearance._shader, x3dom.nodeTypes.CommonSurfaceShader)) ? 1 : 0;
		property.TEXTURED			= (texture || property.TEXT) ? 1 : 0;
		property.TEXTRAFO			= (appearance._cf.textureTransform.node !== null) ? 1 : 0;
		property.DIFFUSEMAP			= (property.CSSHADER && appearance._shader.getDiffuseMap()) ? 1 : 0; 
		property.NORMALMAP			= (property.CSSHADER && appearance._shader.getNormalMap()) ? 1 : 0; 
		property.SPECMAP			= (property.CSSHADER && appearance._shader.getSpecularMap()) ? 1 : 0;
		property.CUBEMAP			= (texture && x3dom.isa(texture, x3dom.nodeTypes.X3DEnvironmentTextureNode)) ? 1 : 0;
		property.BLENDING			= (property.TEXT || property.CUBEMAP || (texture && texture._blending)) ? 1 : 0;
		property.REQUIREBBOX		= (geometry._vf.coordType !== undefined && geometry._vf.coordType != "Float32") ? 1 : 0;
		property.REQUIREBBOXNOR     = (geometry._vf.normalType !== undefined && geometry._vf.normalType != "Float32") ? 1 : 0;
		property.REQUIREBBOXCOL     = (geometry._vf.colorType !== undefined && geometry._vf.colorType != "Float32") ? 1 : 0;
		property.REQUIREBBOXTEX     = (geometry._vf.texCoordType !== undefined && geometry._vf.texCoordType != "Float32") ? 1 : 0;
		property.COLCOMPONENTS		= geometry._mesh._numColComponents;
		property.NORCOMPONENTS		= geometry._mesh._numNormComponents;
		property.POSCOMPONENTS		= geometry._mesh._numPosComponents;
		property.SPHEREMAPPING		= (geometry._cf.texCoord !== undefined && 
									   geometry._cf.texCoord.node !== null && 
									   geometry._cf.texCoord.node._vf.mode &&
									   geometry._cf.texCoord.node._vf.mode.toLowerCase() == "sphere") ? 1 : 0;
		property.VERTEXCOLOR		= (geometry._mesh._colors[0].length > 0 || 
									  (property.IMAGEGEOMETRY && geometry.getColorTexture()) || 
									  (property.BITLODGEOMETRY && geometry.hasColor()) || 
									  (geometry._vf.color !== undefined && geometry._vf.color.length > 0)) ? 1 : 0;
	}
	
	property.toIdentifier = function() { 
		var id = "";
		for(var p in this) { 
			if(this[p] != this.toIdentifier && this[p] != this.toString) {
				id += this[p];
			}
		}
		return id;
	};
	
	property.toString = function() { 
		var str = "";
		for(var p in this) { 
			if(this[p] != this.toIdentifier && this[p] != this.toString) {
				str += p + ": " + this[p] + ", ";
			}
		}
		return str;
	};

	return property;
}

/**
 * Returns "shader" such that "shader.foo = [1,2,3]" magically sets the appropriate uniform
 */
x3dom.shader.ShaderCache.prototype.wrapProgram = function (gl, program)
{
	var shader = {};
        
	shader.bind = function () { 
		gl.useProgram(program); 
	};
	
	var i 	= 0;
	var loc = null;
	var obj = null;
	var glErr;
	
	var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
	
	for (i=0; i < numUniforms; ++i) {
		try {
			obj = gl.getActiveUniform(program, i);
		}
		catch (eu) {}

		glErr = gl.getError();
		
		if (glErr !== 0) {
			x3dom.debug.logError("GL-Error (on searching uniforms): " + glErr);
		}

		loc = gl.getUniformLocation(program, obj.name);	
		
		switch (obj.type) {
			case gl.SAMPLER_2D:
				shader.__defineSetter__(obj.name, 
					(function (loc) { return function (val) { gl.uniform1i(loc, val); }; })(loc));
				break;
			case gl.SAMPLER_CUBE:
				shader.__defineSetter__(obj.name, 
					(function (loc) { return function (val) { gl.uniform1i(loc, val); }; })(loc));
				break;
			case gl.BOOL:
				shader.__defineSetter__(obj.name, 
					(function (loc) { return function (val) { gl.uniform1i(loc, val); }; })(loc));
				break;
			case gl.FLOAT:
				shader.__defineSetter__(obj.name, 
					(function (loc) { return function (val) { gl.uniform1f(loc, val); }; })(loc));
				break;
			case gl.FLOAT_VEC2:
				shader.__defineSetter__(obj.name, 
					(function (loc) { return function (val) { gl.uniform2f(loc, val[0], val[1]); }; })(loc));           
				break;
			case gl.FLOAT_VEC3:
				shader.__defineSetter__(obj.name, 
					(function (loc) { return function (val) { gl.uniform3f(loc, val[0], val[1], val[2]); }; })(loc));
				break;
			case gl.FLOAT_VEC4:
				shader.__defineSetter__(obj.name, 
					(function (loc) { return function (val) { gl.uniform4f(loc, val[0], val[1], val[2], val[3]); }; })(loc));
				break;
			case gl.FLOAT_MAT2:
				shader.__defineSetter__(obj.name, 
					(function (loc) { return function (val) { gl.uniformMatrix2fv(loc, false, new Float32Array(val)); }; })(loc));
				break;
			case gl.FLOAT_MAT3:
				shader.__defineSetter__(obj.name, 
					(function (loc) { return function (val) { gl.uniformMatrix3fv(loc, false, new Float32Array(val)); }; })(loc));
				break;
			case gl.FLOAT_MAT4:
				shader.__defineSetter__(obj.name, 
					(function (loc) { return function (val) { gl.uniformMatrix4fv(loc, false, new Float32Array(val)); }; })(loc));
				break;
			case gl.INT:
				shader.__defineSetter__(obj.name,
					(function (loc) { return function (val) { gl.uniform1i(loc, val); }; }) (loc));
				break;
			default:
				x3dom.debug.logWarning('GLSL program variable '+obj.name+' has unknown type '+obj.type);
		}
	}
	
	var numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
	
	for (i=0; i < numAttribs; ++i) {
		try {
			obj = gl.getActiveAttrib(program, i);
		}
		catch (ea) {}
		
		glErr = gl.getError();
		
		if (glErr !== 0) {
			x3dom.debug.logError("GL-Error (on searching attributes): " + glErr);   
		}

		loc = gl.getAttribLocation(program, obj.name);
		shader[obj.name] = loc;
	}
	
	return shader;

}