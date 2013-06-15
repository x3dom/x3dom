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

/*****************************************************************************
* 
*****************************************************************************/
x3dom.Utils = {};
x3dom.Utils.measurements = [];


// http://gent.ilcore.com/2012/06/better-timer-for-javascript.html
window.performance = window.performance || {};
performance.now = (function() {
  return performance.now       ||
         performance.mozNow    ||
         performance.msNow     ||
         performance.oNow      ||
         performance.webkitNow ||
         function() { return new Date().getTime(); };
})();

x3dom.Utils.startMeasure = function(name) {
  var uname = name.toUpperCase();
  if ( !x3dom.Utils.measurements[uname] ) {
    if ( performance && performance.now ) {
      x3dom.Utils.measurements[uname] = performance.now();
    } else {
      x3dom.Utils.measurements[uname] = new Date().getTime();
    }
  }
};

x3dom.Utils.stopMeasure = function(name) { 
  var uname = name.toUpperCase();
  if ( x3dom.Utils.measurements[uname] ) {
    var startTime = x3dom.Utils.measurements[uname];
    delete x3dom.Utils.measurements[uname];
    if ( performance && performance.now ) {
      return performance.now() - startTime;
    } else {
      return new Date().getTime() - startTime;
    }
  }
  return 0;
};

/*****************************************************************************
 *
 *****************************************************************************/
x3dom.Utils.isNumber = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

/*****************************************************************************
* 
*****************************************************************************/
x3dom.Utils.createTexture2D = function(gl, doc, src, bgnd, withCredentials)
{
	doc.downloadCount++;

	var texture = gl.createTexture();
	
	var image = new Image();
	image.crossOrigin = withCredentials ? 'use-credentials' : '';
	image.src = src;
	
	image.onload = function() {
	
		image = x3dom.Utils.scaleImage( image );
		
		if(bgnd == true) {
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		}
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.bindTexture(gl.TEXTURE_2D, null);
		if(bgnd == true) {
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		}
		
		//Save image Size
		texture.width  = image.width;
		texture.height = image.height;
		texture.ready = true;
		
		doc.downloadCount--;
		doc.needRender = true;
	};
	
	image.onerror = function() {
		x3dom.debug.logError("[Utils|createTexture2D] Can't load Image: " + src);
		doc.downloadCount--;
	};
	
	return texture;
};

/*****************************************************************************
 *
 *****************************************************************************/
x3dom.Utils.generateNonIndexedTriangleData = function(indices, positions, normals, texCoords, colors,
                                                      newPositions, newNormals, newTexCoords, newColors)
{
    //@todo: add support for RGBA colors and 3D texture coordinates
    //@todo: if there is any need for that, add multi-index support

    for (i = 0; i < indices.length; i+=3) {
        var i0 = indices[i  ],
            i1 = indices[i+1],
            i2 = indices[i+2];

        if (positions) {
            var p0 = new x3dom.fields.SFVec3f(),
                p1 = new x3dom.fields.SFVec3f(),
                p2 = new x3dom.fields.SFVec3f();

            p0.setValues(positions[i0]);
            p1.setValues(positions[i1]);
            p2.setValues(positions[i2]);

            newPositions.push(p0);
            newPositions.push(p1);
            newPositions.push(p2);
        }

        if (normals) {
            var n0 = new x3dom.fields.SFVec3f(),
                n1 = new x3dom.fields.SFVec3f(),
                n2 = new x3dom.fields.SFVec3f();

            n0.setValues(normals[i0]);
            n1.setValues(normals[i1]);
            n2.setValues(normals[i2]);

            newNormals.push(n0);
            newNormals.push(n1);
            newNormals.push(n2);
        }

        if (texCoords) {
            var t0 = new x3dom.fields.SFVec2f(),
                t1 = new x3dom.fields.SFVec2f(),
                t2 = new x3dom.fields.SFVec2f();

            t0.setValues(texCoords[i0]);
            t1.setValues(texCoords[i1]);
            t1.setValues(texCoords[i2]);

            newTexCoords.push(t0);
            newTexCoords.push(t1);
            newTexCoords.push(t2);
        }

        if (colors) {
            var c0 = new x3dom.fields.SFVec3f(),
                c1 = new x3dom.fields.SFVec3f(),
                c2 = new x3dom.fields.SFVec3f();

            c0.setValues(texCoords[i0]);
            c1.setValues(texCoords[i1]);
            c1.setValues(texCoords[i2]);

            newColors.push(c0);
            newColors.push(c1);
            newColors.push(c2);
        }
    }
};

/*****************************************************************************
* 
*****************************************************************************/
x3dom.Utils.createTextureCube = function(gl, doc, url, bgnd, withCredentials) 
{
	var texture = gl.createTexture();

	var faces;
	if (bgnd) {
		faces = [gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 
				 gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
				 gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X];
	}
	else
	{
		//       back, front, bottom, top, left, right
		faces = [gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
				 gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
				 gl.TEXTURE_CUBE_MAP_NEGATIVE_X, gl.TEXTURE_CUBE_MAP_POSITIVE_X];
	}
	
    texture.pendingTextureLoads = -1;
    texture.textureCubeReady = false;
        
    var width = 0, height = 0;
        
	for (var i=0; i<faces.length; i++) {
		var face = faces[i];
		var image = new Image();
		image.crossOrigin = withCredentials ? 'use-credentials' : '';
		texture.pendingTextureLoads++;
		doc.downloadCount++;
		
		image.onload = function(texture, face, image, swap) {
			return function() {
				if (width == 0 && height == 0) {
					width = image.width;
					height = image.height;
				}
				else if (width != image.width || height != image.height) {
					x3dom.debug.logWarning("[Utils|createTextureCube] Rescaling CubeMap images, which are of different size!");
					image = x3dom.Utils.rescaleImage(image, width, height);
				}
				
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, swap);
				gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
				gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
				gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
				
				texture.pendingTextureLoads--;
				doc.downloadCount--;
				if (texture.pendingTextureLoads < 0) {
					texture.textureCubeReady = true;
					x3dom.debug.logInfo("[Utils|createTextureCube] Loading CubeMap finished...");
					doc.needRender = true;
				}
			};
		}( texture, face, image, bgnd );

		image.onerror = function()
		{
			doc.downloadCount--;

			x3dom.debug.logError("[Utils|createTextureCube] Can't load CubeMap!");
		};
		
		// backUrl, frontUrl, bottomUrl, topUrl, leftUrl, rightUrl (for bgnd)
		image.src = url[i];
	}
	
	return texture;
};

/*****************************************************************************
* 
*****************************************************************************/
x3dom.Utils.getFileName = function(url)
{
	var filename;
	
	if( url.lastIndexOf("/") > -1 ) {
		filename = url.substr( url.lastIndexOf("/") + 1 );
	}
	else if( url.lastIndexOf("\\") > -1 ) {
		filename = url.substr( url.lastIndexOf("\\") + 1 );
	}
	else {
		filename = url;
	}

	return filename;
};

/*****************************************************************************
* 
*****************************************************************************/
x3dom.Utils.findTextureByName = function(texture, name)
{
	for ( var i=0; i<texture.length; ++i )
	{
		if ( name == texture[i].samplerName )
			return texture[i];
	}
	return false;
};

/*****************************************************************************
* Rescale image to given size
*****************************************************************************/
x3dom.Utils.rescaleImage = function(image, width, height)
{
	var canvas = document.createElement("canvas");
	canvas.width = width; canvas.height = height;
	canvas.getContext("2d").drawImage(image,
				0, 0, image.width, image.height,
				0, 0, canvas.width, canvas.height);
	return canvas;
};

/*****************************************************************************
* Scale image to next best power of two
*****************************************************************************/
x3dom.Utils.scaleImage = function(image)
{
	if (!x3dom.Utils.isPowerOfTwo(image.width) || !x3dom.Utils.isPowerOfTwo(image.height)) {
		var canvas = document.createElement("canvas");
		canvas.width = x3dom.Utils.nextHighestPowerOfTwo(image.width);
		canvas.height = x3dom.Utils.nextHighestPowerOfTwo(image.height);
		var ctx = canvas.getContext("2d");
		ctx.drawImage(image,
					  0, 0, image.width, image.height,
					  0, 0, canvas.width, canvas.height);
		image = canvas;
	}
	return image;
}


/*****************************************************************************
* Check if value is power of two
*****************************************************************************/
x3dom.Utils.isPowerOfTwo = function(x) 
{
	return ((x & (x - 1)) === 0);
};


/*****************************************************************************
* Return next highest power of two
*****************************************************************************/
x3dom.Utils.nextHighestPowerOfTwo = function(x) 
{
	--x;
	for (var i = 1; i < 32; i <<= 1) {
		x = x | x >> i;
	}
	return (x + 1);
};


/*****************************************************************************
* Return next best power of two
*****************************************************************************/
x3dom.Utils.nextBestPowerOfTwo = function(x)
{
	var log2x = Math.log(x) / Math.log(2);
	return Math.pow(2, Math.round(log2x));
};

/*****************************************************************************
* Return data type size in byte
*****************************************************************************/
x3dom.Utils.getDataTypeSize = function(type) 
{
	switch(type)
	{
		case "Int8":
		case "Uint8":
			return 1;
		case "Int16":
		case "Uint16":
			return 2;
		case "Int32":
		case "Uint32":
		case "Float32":
			return 4;
		case "Float64":
		default:
			return 8;
	}
};

/*****************************************************************************
* Return this.gl-Type
*****************************************************************************/
x3dom.Utils.getVertexAttribType = function(type, gl)
{
	var dataType = gl.NONE;

	switch(type)
	{
		case "Int8":
			dataType = gl.BYTE;
			break;
		case "Uint8":
			dataType = gl.UNSIGNED_BYTE;
			break;
		case "Int16":
			dataType = gl.SHORT;
			break;
		case "Uint16":
			dataType = gl.UNSIGNED_SHORT;
			break;
		case "Int32":
			dataType = gl.INT;
			break;
		case "Uint32":
			dataType = gl.UNSIGNED_INT;
			break;
		case "Float32":
			dataType = gl.FLOAT;
			break;
		case "Float64":
		default:
			x3dom.debug.logError("Can't find this.gl data type for " + type + ", getting FLOAT...");
			dataType = gl.FLOAT;
			break;
	}

	return dataType;
};

/*****************************************************************************
* Return TypedArray View
*****************************************************************************/
x3dom.Utils.getArrayBufferView = function(type, buffer)
{
	var array = null;
	
	switch(type)
	{
		case "Int8":
			array = new Int8Array(buffer);
			break;
		case "Uint8":
			array = new Uint8Array(buffer);
			break;
		case "Int16":
			array = new Int16Array(buffer);
			break;
		case "Uint16":
			array = new Uint16Array(buffer);
			break;
		case "Int32":
			array = new Int32Array(buffer);
			break;
		case "Uint32":
			array = new Uint32Array(buffer);
			break;
		case "Float32":
			array = new Float32Array(buffer);
			break;
		case "Float64":
			array = new Float64Array(buffer);
			break;
		default:
			x3dom.debug.logError("Can't create typed array view of type " + type + ", trying Float32...");
			array = new Float32Array(buffer);
			break;
	}

	return array;
};

/*****************************************************************************
* Checks whether a TypedArray View Type with the given name string is unsigned
*****************************************************************************/
x3dom.Utils.isUnsignedType = function (str)
{
  return (str == "Uint8" || str == "Uint16" || str == "Uint16" || str == "Uint32");
};


/*****************************************************************************
* Checks for lighting
*****************************************************************************/
x3dom.Utils.checkDirtyLighting = function (viewarea)
{
	return (viewarea.getLights().length + viewarea._scene.getNavigationInfo()._vf.headlight);
};

/*****************************************************************************
* Get GL min filter
*****************************************************************************/
x3dom.Utils.minFilterDic = function(gl, minFilter)
{
	switch(minFilter)
	{ 
		case "NEAREST":                      return gl.NEAREST;
		case "LINEAR":                       return gl.LINEAR;
		case "NEAREST_MIPMAP_NEAREST":       return gl.NEAREST_MIPMAP_NEAREST;
		case "NEAREST_MIPMAP_LINEAR":        return gl.NEAREST_MIPMAP_LINEAR;
		case "LINEAR_MIPMAP_NEAREST":        return gl.LINEAR_MIPMAP_NEAREST;
		case "LINEAR_MIPMAP_LINEAR":         return gl.LINEAR_MIPMAP_LINEAR;
		case "AVG_PIXEL":                    return gl.LINEAR;
		case "AVG_PIXEL_AVG_MIPMAP":         return gl.LINEAR_MIPMAP_LINEAR;
		case "AVG_PIXEL_NEAREST_MIPMAP":     return gl.LINEAR_MIPMAP_NEAREST;
		case "DEFAULT":                      return gl.LINEAR_MIPMAP_LINEAR;
		case "FASTEST":                      return gl.NEAREST;
		case "NEAREST_PIXEL":                return gl.NEAREST;
		case "NEAREST_PIXEL_AVG_MIPMAP":     return gl.NEAREST_MIPMAP_LINEAR;
		case "NEAREST_PIXEL_NEAREST_MIPMAP": return gl.NEAREST_MIPMAP_NEAREST;
		case "NICEST":                       return gl.LINEAR_MIPMAP_LINEAR;
		default:							 return gl.LINEAR;
	}
};

/*****************************************************************************
* Get GL mag filter
*****************************************************************************/
x3dom.Utils.magFilterDic = function(gl, magFilter)
{
	switch(magFilter)
	{	
		case "NEAREST": 		return gl.NEAREST;
		case "LINEAR":			return gl.LINEAR;
		case "AVG_PIXEL":		return gl.LINEAR;
		case "DEFAULT":			return gl.LINEAR;
		case "FASTEST":			return gl.NEAREST;
		case "NEAREST_PIXEL":	return gl.NEAREST;
		case "NICEST":			return gl.LINEAR;
		default:				return gl.LINEAR;
	}
};

/*****************************************************************************
* Get GL boundary mode
*****************************************************************************/
x3dom.Utils.boundaryModesDic = function(gl, mode) 
{
	switch(mode)
	{ 
		case "CLAMP":             return gl.CLAMP_TO_EDGE;
		case "CLAMP_TO_EDGE":     return gl.CLAMP_TO_EDGE;
		case "CLAMP_TO_BOUNDARY": return gl.CLAMP_TO_EDGE;       
		case "MIRRORED_REPEAT":   return gl.MIRRORED_REPEAT;
		case "REPEAT":            return gl.REPEAT;
		default:				  return gl.REPEAT;
	}
};

/*****************************************************************************
* 
*****************************************************************************/
x3dom.Utils.generateProperties = function (viewarea, shape) 
{
	var property = {};

	var geometry 	= shape._cf.geometry.node;
	var appearance 	= shape._cf.appearance.node;
	var texture 	= appearance ? appearance._cf.texture.node : null;
	var material    = appearance ? shape._cf.appearance.node._cf.material.node : null;

	//Check if it's a composed shader
	if (appearance && appearance._shader &&
        x3dom.isa(appearance._shader, x3dom.nodeTypes.ComposedShader)) {
		property.CSHADER   = shape._objectID;
        //property.CSHADER_V = shape._cf.appearance.node._shader._vertex._vf.url[0];
        //property.CSHADER_F = shape._cf.appearance.node._shader._fragment._vf.url[0];
	}
    else if (geometry) {

		property.CSHADER			    = -1;
		property.SOLID				    = (shape.isSolid()) ? 1 : 0;
		property.TEXT				      = (x3dom.isa(geometry, x3dom.nodeTypes.Text)) ? 1 : 0;
		property.POPGEOMETRY  	  = (x3dom.isa(geometry, x3dom.nodeTypes.PopGeometry)) ? 1 : 0;
		property.BITLODGEOMETRY	  = (x3dom.isa(geometry, x3dom.nodeTypes.BitLODGeometry)) ? 1 : 0;
		property.IMAGEGEOMETRY	  = (x3dom.isa(geometry, x3dom.nodeTypes.ImageGeometry))  ? 1 : 0;
		property.IG_PRECISION		  = (property.IMAGEGEOMETRY) ? geometry.numCoordinateTextures() : 0;
		property.IG_INDEXED			  = (property.IMAGEGEOMETRY && geometry.getIndexTexture() != null) ? 1 : 0;
		property.POINTLINE2D		  = x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.PointSet) ||
                                x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.IndexedLineSet) ||
                                x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.Polypoint2D) ||
                                x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.Polyline2D) ||
                                x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.Arc2D) ||
                                x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.Circle2D) ? 1 : 0;					  
		 
		property.SHADOW				    = (viewarea.getLightsShadow()) ? 1 : 0;
		property.FOG				      = (viewarea._scene.getFog()._vf.visibilityRange > 0) ? 1 : 0;
		property.CSSHADER			    = (appearance && appearance._shader && x3dom.isa(appearance._shader, x3dom.nodeTypes.CommonSurfaceShader)) ? 1 : 0;
		property.LIGHTS				    = (!property.POINTLINE2D && appearance && (material || property.CSSHADER)) ? (viewarea.getLights().length) + (viewarea._scene.getNavigationInfo()._vf.headlight) : 0;
		property.TEXTURED			    = (texture || property.TEXT) ? 1 : 0;
		property.TEXTRAFO			    = (appearance && appearance._cf.textureTransform.node) ? 1 : 0;
		property.DIFFUSEMAP			  = (property.CSSHADER && appearance._shader.getDiffuseMap()) ? 1 : 0; 
		property.NORMALMAP			  = (property.CSSHADER && appearance._shader.getNormalMap()) ? 1 : 0; 
		property.SPECMAP			    = (property.CSSHADER && appearance._shader.getSpecularMap()) ? 1 : 0;
    property.DISPLACEMENTMAP	= (property.CSSHADER && appearance._shader.getDisplacementMap()) ? 1 : 0;
		property.CUBEMAP			    = (texture && x3dom.isa(texture, x3dom.nodeTypes.X3DEnvironmentTextureNode)) ? 1 : 0;
		property.BLENDING			    = (property.TEXT || property.CUBEMAP || (texture && texture._blending)) ? 1 : 0;
		property.REQUIREBBOX		  = (geometry._vf.coordType !== undefined && geometry._vf.coordType != "Float32") ? 1 : 0;
		property.REQUIREBBOXNOR   = (geometry._vf.normalType !== undefined && geometry._vf.normalType != "Float32") ? 1 : 0;
		property.REQUIREBBOXCOL   = (geometry._vf.colorType !== undefined && geometry._vf.colorType != "Float32") ? 1 : 0;
		property.REQUIREBBOXTEX   = (geometry._vf.texCoordType !== undefined && geometry._vf.texCoordType != "Float32") ? 1 : 0;    
		property.COLCOMPONENTS		= geometry._mesh._numColComponents;
		property.NORCOMPONENTS		= geometry._mesh._numNormComponents;
		property.POSCOMPONENTS		= geometry._mesh._numPosComponents;
		property.SPHEREMAPPING		= (geometry._cf.texCoord !== undefined && 
                                 geometry._cf.texCoord.node !== null && 
                                 geometry._cf.texCoord.node._vf.mode &&
                                 geometry._cf.texCoord.node._vf.mode.toLowerCase() == "sphere") ? 1 : 0;
		property.VERTEXCOLOR		  = (geometry._mesh._colors[0].length > 0 || 
                                (property.IMAGEGEOMETRY && geometry.getColorTexture()) || 
                                (property.BITLODGEOMETRY && geometry.hasColor()) || 
                                (property.POPGEOMETRY    && geometry.hasColor()) ||
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
};

/*****************************************************************************
* Returns "shader" such that "shader.foo = [1,2,3]" magically sets the 
* appropriate uniform
*****************************************************************************/
x3dom.Utils.wrapProgram = function (gl, program)
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
				//shader.__defineSetter__(obj.name, 
				//	(function (loc) { return function (val) { gl.uniform1f(loc, val); }; })(loc));
                /*
                 * Passing a MFFloat type into uniform.
                 * by Sofiane Benchaa, 2012.
                 * 
                 * Based on OpenGL specification.
                 * url: http://www.opengl.org/sdk/docs/man/xhtml/glGetUniformLocation.xml 
                 *
                 * excerpt : Except if the last part of name indicates a uniform variable array, 
                 * the location of the first element of an array can be retrieved by using the name of the array, 
                 * or by using the name appended by "[0]".
                 * 
                 * Detecting the float array and extracting its uniform name without the brackets.
                 */
				if (obj.name.indexOf("[0]") != -1)
					shader.__defineSetter__(obj.name.substring(0, obj.name.length-3), 
						(function (loc) { return function (val) { gl.uniform1fv(loc, new Float32Array(val)); }; })(loc));
				else
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
};
