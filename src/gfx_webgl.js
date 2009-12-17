/*!
* x3dom javascript library 0.1
* http://x3dom.org/
*
* Copyright (c) 2009 Peter Eschler, Johannes Behr, Yvonne Jung
*     based on code originally provided by Philip Taylor:
*     http://philip.html5.org
* Dual licensed under the MIT and GPL licenses.
* 
*/

// This code is for Firefox/Minefield compatibility.  WebGL
// originally used a class called CanvasFloatArray, but the
// specification has now changed, and it's called WebGLFloatArray.
// Firefox/Minefield still (as of 13 Nov 2009) uses the old
// name, but WebKit/Safari uses the new one.  The main WebGL
// code in this page uses the new name, but the compatibility
// code that follows will stay here for the time being to make 
// sure that Firefox users can view the page.
try
{
  WebGLFloatArray;
}
catch (e)
{
  try
  {
    WebGLArrayBuffer = CanvasArrayBuffer;
    WebGLByteArray = CanvasByteArray;
    WebGLUnsignedByteArray = CanvasUnsignedByteArray;
    WebGLShortArray = CanvasShortArray;
    WebGLUnsignedShortArray = CanvasUnsignedShortArray;
    WebGLIntArray = CanvasIntArray;
    WebGLUnsignedIntArray = CanvasUnsignedIntArray;
    WebGLFloatArray = CanvasFloatArray;
  }
  catch (e)
  {
    //alert("Could not find Canvas array types for WebGL.");
  }
}
// End of compatibility code


x3dom.gfx_webgl = (function () { 

	function Context(ctx3d, canvas, name) {
		this.ctx3d = ctx3d;
		this.canvas = canvas;
		this.name = name;
	}

	Context.prototype.getName = function() {
		return this.name;
	};

	function setupContext(canvas) {
		x3dom.debug.logInfo("setupContext: canvas=" + canvas);
        var ctx = null;
		try {
			ctx = canvas.getContext('moz-webgl');
			if (ctx) {
				return new Context(ctx, canvas, 'moz-webgl');
            }
		} catch (ef) {}
		try {
			ctx = canvas.getContext('webkit-3d');
			if (ctx) {
				return new Context(ctx, canvas, 'webkit-3d');
            }
		} catch (es) {}
	}

	var g_shaders = {};
	
	g_shaders['vs-x3d-textured'] = { type: "vertex", data:
		"attribute vec3 position;" +
		"attribute vec3 normal;" +
		"attribute vec2 texcoord;" +
		"varying vec3 fragNormal;" +
		"varying vec3 fragLightVector;" +
		"varying vec3 fragEyeVector;" +
		"varying vec2 fragTexCoord;" +
		"uniform mat4 modelViewProjectionMatrix;" +
		"uniform mat4 modelViewMatrix;" +
		"uniform vec3 lightDirection;" +
		"uniform vec3 eyePosition;" +
		"" +
		"void main(void) {" +
		"    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);" +
		"    fragNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;" +
		"    fragLightVector = -lightDirection;" +
		"    fragEyeVector = eyePosition - (modelViewMatrix * vec4(position, 1.0)).xyz;" +
        "    fragTexCoord = texcoord;" +
		"}"
		};
        
    g_shaders['vs-x3d-textured-tt'] = { type: "vertex", data:
		"attribute vec3 position;" +
		"attribute vec3 normal;" +
		"attribute vec2 texcoord;" +
		"varying vec3 fragNormal;" +
		"varying vec3 fragLightVector;" +
		"varying vec3 fragEyeVector;" +
		"varying vec2 fragTexCoord;" +
		"uniform mat4 texTrafoMatrix;" +
		"uniform mat4 modelViewProjectionMatrix;" +
		"uniform mat4 modelViewMatrix;" +
		"uniform vec3 lightDirection;" +
		"uniform vec3 eyePosition;" +
		"" +
		"void main(void) {" +
		"    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);" +
		"    fragNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;" +
		"    fragLightVector = -lightDirection;" +
		"    fragEyeVector = eyePosition - (modelViewMatrix * vec4(position, 1.0)).xyz;" +
        "    fragTexCoord = (texTrafoMatrix * vec4(texcoord, 1.0, 1.0)).xy;" +
		"}"
		};
		
	g_shaders['fs-x3d-textured'] = { type: "fragment", data:
		"uniform float ambientIntensity;" +
		"uniform vec3 diffuseColor;" +
		"uniform vec3 emissiveColor;" +
		"uniform float shininess;" +
		"uniform vec3 specularColor;" +
		"uniform float alpha;" +
		"uniform float lightOn;" +
		"uniform sampler2D tex;" +
		"" +
		"varying vec3 fragNormal;" +
		"varying vec3 fragLightVector;" +
		"varying vec3 fragEyeVector;" +
		"varying vec2 fragTexCoord;" +
		"" +
		"void main(void) {" +
		"    vec3 normal = normalize(fragNormal);" +
		"    vec3 light = normalize(fragLightVector);" +
		"    vec3 eye = normalize(fragEyeVector);" +
		"    vec2 texCoord = vec2(fragTexCoord.x,1.0-fragTexCoord.y);" +
		"    float diffuse = max(0.0, dot(normal, light)) * lightOn;" +
		"    diffuse += max(0.0, dot(normal, eye));" +
		"    float specular = pow(max(0.0, dot(normal, normalize(light+eye))), shininess*128.0) * lightOn;" +
		"    specular += pow(max(0.0, dot(normal, normalize(eye))), shininess*128.0);" +
		"    vec3 rgb = emissiveColor + diffuse*texture2D(tex, texCoord).rgb + specular*specularColor;" +
		"    rgb = clamp(rgb, 0.0, 1.0);" +
		"    gl_FragColor = vec4(rgb, texture2D(tex, texCoord).a);" +
		"}"
		};

	g_shaders['vs-x3d-untextured'] = { type: "vertex", data:
		"attribute vec3 position;" +
		"attribute vec3 normal;" +
		"varying vec3 fragNormal;" +
		"varying vec3 fragLightVector;" +
		"varying vec3 fragEyeVector;" +
		"uniform mat4 modelViewProjectionMatrix;" +
		"uniform mat4 modelViewMatrix;" +
		"uniform vec3 lightDirection;" +
		"uniform vec3 eyePosition;" +
		"" +
		"void main(void) {" +
		"    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);" +
		"    fragNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;" +
		"    fragLightVector = -lightDirection;" +
		"    fragEyeVector = eyePosition - (modelViewMatrix * vec4(position, 1.0)).xyz;" +
		"}"
		};
		
	g_shaders['fs-x3d-untextured'] = { type: "fragment", data:
		"uniform float ambientIntensity;" +
		"uniform vec3 diffuseColor;" +
		"uniform vec3 emissiveColor;" +
		"uniform float shininess;" +
		"uniform vec3 specularColor;" +
		"uniform float alpha;" +
		"uniform float lightOn;" +
		"" +
		"varying vec3 fragNormal;" +
		"varying vec3 fragLightVector;" +
		"varying vec3 fragEyeVector;" +
		"" +
		"void main(void) {" +
		"    vec3 normal = normalize(fragNormal);" +
		"    vec3 light = normalize(fragLightVector);" +
		"    vec3 eye = normalize(fragEyeVector);" +
		"    float diffuse = max(0.0, dot(normal, light)) * lightOn;" +
		"    diffuse += max(0.0, dot(normal, eye));" +
		"    float specular = pow(max(0.0, dot(normal, normalize(light+eye))), shininess*128.0) * lightOn;" +
		"    specular += pow(max(0.0, dot(normal, normalize(eye))), shininess*128.0);" +
		"    vec3 rgb = emissiveColor + diffuse*diffuseColor + specular*specularColor;" +
		"    rgb = clamp(rgb, 0.0, 1.0);" +
		"    gl_FragColor = vec4(rgb, alpha);" +
		"}"
		};
	
	g_shaders['vs-x3d-vertexcolor'] = { type: "vertex", data:
		"attribute vec3 position;" +
		"attribute vec3 normal;" +
		"attribute vec3 color;" +
		"varying vec3 fragNormal;" +
		"varying vec3 fragColor;" +
		"varying vec3 fragLightVector;" +
		"varying vec3 fragEyeVector;" +
		"uniform mat4 modelViewProjectionMatrix;" +
		"uniform mat4 modelViewMatrix;" +
		"uniform vec3 lightDirection;" +
		"uniform vec3 eyePosition;" +
		"" +
		"void main(void) {" +
		"    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);" +
		"    fragNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;" +
		"    fragLightVector = -lightDirection;" +
		"    fragColor = color;" +
		"    fragEyeVector = eyePosition - (modelViewMatrix * vec4(position, 1.0)).xyz;" +
		"}"
		};
	
	g_shaders['fs-x3d-vertexcolor'] = { type: "fragment", data:
		"uniform float ambientIntensity;" +
		"uniform vec3 diffuseColor;" +
		"uniform vec3 emissiveColor;" +
		"uniform float shininess;" +
		"uniform vec3 specularColor;" +
		"uniform float alpha;" +
		"uniform float lightOn;" +
		"" +
		"varying vec3 fragNormal;" +
		"varying vec3 fragColor;" +
		"varying vec3 fragLightVector;" +
		"varying vec3 fragEyeVector;" +
		"" +
		"void main(void) {" +
		"    vec3 normal = normalize(fragNormal);" +
		"    vec3 light = normalize(fragLightVector);" +
		"    vec3 eye = normalize(fragEyeVector);" +
		"    float diffuse = max(0.0, dot(normal, light)) * lightOn;" +
		"    diffuse += max(0.0, dot(normal, eye));" +
		"    float specular = pow(max(0.0, dot(normal, normalize(light+eye))), shininess*128.0) * lightOn;" +
		"    specular += pow(max(0.0, dot(normal, normalize(eye))), shininess*128.0);" +
		"    vec3 rgb = emissiveColor + diffuse*fragColor + specular*specularColor;" +
		"    rgb = clamp(rgb, 0.0, 1.0);" +
		"    gl_FragColor = vec4(rgb, alpha);" +
		"}"
		};

	g_shaders['fs-x3d-shownormal'] = { type: "fragment", data:
		"uniform float ambientIntensity;" +
		"uniform vec3 diffuseColor;" +
		"uniform vec3 emissiveColor;" +
		"uniform float shininess;" +
		"uniform vec3 specularColor;" +
		"uniform float alpha;" +
		"uniform float lightOn;" +
		"" +
		"varying vec3 fragNormal;" +
		"varying vec3 fragLightVector;" +
		"varying vec3 fragEyeVector;" +
		"varying vec2 fragTexCoord;" +
		"" +
		"void main(void) {" +
		"    vec3 normal = normalize(fragNormal);" +
		"    gl_FragColor = vec4((normal+1.0)/2.0, 1.0);" +
		"}"
		};

	g_shaders['vs-x3d-default'] = { type: "vertex", data:
		"attribute vec3 position;" +
		"uniform mat4 modelViewProjectionMatrix;" +
		"void main(void) {" +
		"    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);" +
		"}"
		};

	g_shaders['fs-x3d-default'] = { type: "fragment", data:
		"uniform vec3 diffuseColor;" +
		"uniform float alpha;" +
		"uniform float lightOn;" +
		"void main(void) {" +
		"    gl_FragColor = vec4(diffuseColor, alpha);" +
		"}"
		};

	function getDefaultShaderProgram(gl) 
	{
		var prog = gl.createProgram();
		var vs = gl.createShader(gl.VERTEX_SHADER);
		var fs = gl.createShader(gl.FRAGMENT_SHADER);
		
		gl.shaderSource(vs, g_shaders['vs-x3d-default'].data);
		gl.shaderSource(fs, g_shaders['fs-x3d-default'].data);
		gl.compileShader(vs);
		gl.compileShader(fs);
		gl.attachShader(prog, vs);
		gl.attachShader(prog, fs);
		gl.linkProgram(prog);
		
		var msg = gl.getProgramInfoLog(prog);
		if (msg) {
			x3dom.debug.logError(msg);
        }
		
		return wrapShaderProgram(gl, prog);
	}
	
	function getShaderProgram(gl, ids) 
	{
		var shader = [];
		
		for (var id=0; id<2; id++)
		{
			if (!g_shaders[ids[id]])
			{
				x3dom.debug.logError('Cannot find shader '+ids[id]);
				return;
			}
			
			if (g_shaders[ids[id]].type == 'vertex')
            {
				shader[id] = gl.createShader(gl.VERTEX_SHADER);
            }
			else if (g_shaders[ids[id]].type == 'fragment')
            {
				shader[id] = gl.createShader(gl.FRAGMENT_SHADER);
            }
			else
			{
				x3dom.debug.logError('Invalid shader type '+g_shaders[id].type);
				return;
			}
			
			gl.shaderSource(shader[id], g_shaders[ids[id]].data);
			gl.compileShader(shader[id]);
		}
		
		var prog = gl.createProgram();
		
		gl.attachShader(prog, shader[0]);
		gl.attachShader(prog, shader[1]);
		gl.linkProgram(prog);
		
		var msg = gl.getProgramInfoLog(prog);
		if (msg) {
			x3dom.debug.logError(msg);
        }
		
		return wrapShaderProgram(gl, prog);
	}

	// Returns "shader" such that "shader.foo = [1,2,3]" magically sets the appropriate uniform
	function wrapShaderProgram(gl, sp) 
	{
		var shader = {};
		
		shader.bind = function () { 
            gl.useProgram(sp); 
        };
		
        var loc = null, obj = null;
		var i = 0;
        
        var numUniforms = gl.getProgramParameter(sp, gl.ACTIVE_UNIFORMS);
		
		for (i=0; i < numUniforms; ++i) {
			try {
				obj = gl.getActiveUniform(sp, i);
				//x3dom.debug.logInfo("uniform #" + i + " obj=" + obj.name );
			}
			catch (eu) {}

			if (gl.getError() !== 0) {
				//x3dom.debug.logInfo("GetProgramiv(ACTIVE_UNIFORMS) not implemented, loop until error");
				break;
			}

			loc = gl.getUniformLocation(sp, obj.name);
			
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
						(function (loc) { return function (val) { gl.uniformMatrix2fv(loc, false, new WebGLFloatArray(val)); }; })(loc));
					break;
				case gl.FLOAT_MAT3:
					shader.__defineSetter__(obj.name, 
						(function (loc) { return function (val) { gl.uniformMatrix3fv(loc, false, new WebGLFloatArray(val)); }; })(loc));
					break;
				case gl.FLOAT_MAT4:
					shader.__defineSetter__(obj.name, 
						(function (loc) { return function (val) { gl.uniformMatrix4fv(loc, false, new WebGLFloatArray(val)); }; })(loc));
					break;
				default:
					x3dom.debug.logInfo('GLSL program variable '+obj.name+' has unknown type '+obj.type);
			}
		}
		
        numAttribs = gl.getProgramParameter(sp, gl.ACTIVE_ATTRIBUTES);
        
		for (i=0; i < numAttribs; ++i) {
			try {
				obj = gl.getActiveAttrib(sp, i);
				//x3dom.debug.logInfo("attribute #" + i + " obj=" + obj.name );
			}
			catch (ea) {}
			
			if (gl.getError() !== 0) {
				//x3dom.debug.logInfo("GetProgramiv(ACTIVE_ATTRIBUTES) not implemented, loop until error");
				break;	
			}

			loc = gl.getAttribLocation(sp, obj.name);
			shader[obj.name] = loc;
		}
		
		return shader;
	}
	
	Context.prototype.setupShape = function (gl, shape) 
	{
		if (x3dom.isa(shape._geometry, x3dom.nodeTypes.Text)) {	
			var text_canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
			var text_ctx = text_canvas.getContext('2d');
			var fontStyle = shape._geometry._fontStyle;
			var font_family = 'SANS';
			/*Array.map(fontStyle._family, function (s) {
				if (s == 'SANS') return 'sans-serif';
				else if (s == 'SERIF') return 'serif';
				else if (s == 'TYPEWRITER') return 'monospace';
				else return '"'+s+'"';
			}).join(', ');*/
			text_ctx.mozTextStyle = '48px '+font_family;

            var i = 0;
			var text_w = 0;
			var string = shape._geometry._string;
			for (i = 0; i < string.length; ++i) {
				text_w = Math.max(text_w, text_ctx.mozMeasureText(string[i]));
            }

			var line_h = 1.2 * text_ctx.mozMeasureText('M'); // XXX: this is a hacky guess
			var text_h = line_h * shape._geometry._string.length;

			text_canvas.width = Math.pow(2, Math.ceil(Math.log(text_w)/Math.log(2)));
			text_canvas.height = Math.pow(2, Math.ceil(Math.log(text_h)/Math.log(2)));
			text_ctx.fillStyle = '#000';
			text_ctx.translate(0, line_h);
			for (i = 0; i < string.length; ++i) {
				text_ctx.mozDrawText(string[i]);
				text_ctx.translate(0, line_h);
			}
			
			document.body.appendChild(text_canvas);	//dbg
			
			var ids = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, ids);
			//gl.texParameter(gl.TEXTURE_2D, gl.GENERATE_MIPMAP, true);
			gl.texImage2D(gl.TEXTURE_2D, 0, text_canvas);
			
			var w = text_w/text_h;
			var h = 1;
			var u = text_w/text_canvas.width;
			var v = text_h/text_canvas.height;
			shape._webgl = {
				positions: [-w,-h,0, w,-h,0, w,h,0, -w,h,0],
				normals: [0,0,1, 0,0,1, 0,0,1, 0,0,1],
				indexes: [0,1,2, 2,3,0],
				texcoords: [0,v, u,v, u,0, 0,0],
				mask_texture: ids
			};

			shape._webgl.shader = getShaderProgram(gl, ['vs-x3d-textured', 'fs-x3d-textured']);
		} 
		else 
		{
			if (shape._webgl !== undefined) {
				return;
            }
			
			var tex = shape._appearance._texture;
			
			if (tex)
			{
				var texture = gl.createTexture();
				
				var image = new Image();
				image.src = tex._url;
				
				image.onload = function()
				{
					shape._webgl.texture = texture;
					
					//x3dom.debug.logInfo(texture + " tex url: " + tex._url);
					
					//gl.enable(gl.TEXTURE_2D);
					//gl.activeTexture(gl.TEXTURE0);
					gl.bindTexture(gl.TEXTURE_2D, texture);
					gl.texImage2D(gl.TEXTURE_2D, 0, image);
					
					gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
					gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
					//gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
					gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
					gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
					//gl.generateMipmap(gl.TEXTURE_2D);
					//gl.bindTexture(gl.TEXTURE_2D,0);
				};
			}
            
			shape._webgl = {
				positions: shape._geometry._mesh._positions,
				normals: shape._geometry._mesh._normals,
				texcoords: shape._geometry._mesh._texCoords,
				colors: shape._geometry._mesh._colors,
				indexes: shape._geometry._mesh._indices,
				//indicesBuffer,positionBuffer,normalBuffer,texcBuffer,colorBuffer
				buffers: [{},{},{},{},{}]
			};
            
			// 'fs-x3d-untextured'],  //'fs-x3d-shownormal'],
			if (tex) {
                if (shape._appearance._textureTransform === null) {
                    shape._webgl.shader = getShaderProgram(gl, ['vs-x3d-textured', 'fs-x3d-textured']);
                }
                else {
                    shape._webgl.shader = getShaderProgram(gl, ['vs-x3d-textured-tt', 'fs-x3d-textured']);
                }
            }
			else if (shape._geometry._mesh._colors.length > 0) {
				shape._webgl.shader = getShaderProgram(gl, ['vs-x3d-vertexcolor', 'fs-x3d-vertexcolor']);
            }
			else {
				shape._webgl.shader = getShaderProgram(gl, ['vs-x3d-untextured', 'fs-x3d-untextured']);
            }
			
			var sp = shape._webgl.shader;
			
			if (sp.position !== undefined) 
			{
				var positionBuffer = gl.createBuffer();
				shape._webgl.buffers[1] = positionBuffer;
				gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
				
				var vertices = new WebGLFloatArray(shape._webgl.positions);
				
				gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
				gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
				
				gl.vertexAttribPointer(sp.position, 3, gl.FLOAT, false, 0, 0);
				//gl.enableVertexAttribArray(sp.position);
				
				// bind indices for drawElements() call
				var indicesBuffer = gl.createBuffer();
				shape._webgl.buffers[0] = indicesBuffer;
				
				var indexArray = new WebGLUnsignedShortArray(shape._webgl.indexes);
				
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
				
				delete vertices;
				delete indexArray;
			}
			if (sp.normal !== undefined) 
			{
				var normalBuffer = gl.createBuffer();
				shape._webgl.buffers[2] = normalBuffer;
				
				var normals = new WebGLFloatArray(shape._webgl.normals);
				
				gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
				gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);				
				
				gl.vertexAttribPointer(sp.normal, 3, gl.FLOAT, false, 0, 0); 
				//gl.enableVertexAttribArray(sp.normal);
				
				delete normals;
			}
			if (sp.texcoord !== undefined)
			{
				var texcBuffer = gl.createBuffer();
				shape._webgl.buffers[3] = texcBuffer;
				
				var texCoords = new WebGLFloatArray(shape._webgl.texcoords);
				
				gl.bindBuffer(gl.ARRAY_BUFFER, texcBuffer);
				gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
				
				gl.vertexAttribPointer(sp.texcoord, 2, gl.FLOAT, false, 0, 0); 
				//gl.enableVertexAttribArray(sp.texcoord);
				
				delete texCoords;
			}
			if (sp.color !== undefined)
			{
				var colorBuffer = gl.createBuffer();
				shape._webgl.buffers[4] = colorBuffer;
				
				var colors = new WebGLFloatArray(shape._webgl.colors);
				
				gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
				gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);				
				
				gl.vertexAttribPointer(sp.color, 3, gl.FLOAT, false, 0, 0); 
				//gl.enableVertexAttribArray(sp.color);
				
				delete colors;
			}
		}
	};

	Context.prototype.renderScene = function (scene) 
	{
		var gl = this.ctx3d;
        
        if (gl === null || scene === null)
        {
            return;
        }
		
		gl.viewport(0,0,this.canvas.width,this.canvas.height);
		
		var bgCol = scene.getSkyColor();
		
		gl.clearColor(bgCol[0], bgCol[1], bgCol[2], bgCol[3]);
		
		//gl.clearDepthf(1.0);
		gl.clearDepth(1.0);
			
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
		
		gl.depthFunc(gl.LEQUAL);
		gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
		
		//gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        //Workaround for WebKit & Co.
        gl.blendFuncSeparate(
					gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
					//gl.ONE_MINUS_DST_ALPHA, gl.ONE
                    gl.ONE, gl.ONE
                    //gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA
                );
        gl.enable(gl.BLEND);

		var sp = getDefaultShaderProgram(gl);
		if (!scene._webgl) {
			// alert("no scene?!");
			sp = getDefaultShaderProgram(gl);
			scene._webgl = {
				shader: sp
			};
		}
		
		var i = 0, t0, t1;
		
		// render traversal
		if (scene.drawableObjects === undefined || !scene.drawableObjects) {
			scene.drawableObjects = [];
			
			t0 = new Date().getTime();
			
			scene._collectDrawableObjects(x3dom.fields.SFMatrix4.identity(), scene.drawableObjects);
			
			t1 = new Date().getTime() - t0;
			
			if (this.canvas.parent.statDiv) {
				this.canvas.parent.statDiv.appendChild(document.createElement("br"));
				this.canvas.parent.statDiv.appendChild(document.createTextNode("traverse: " + t1));
			}
		}
		
		// sorting and stuff
		t0 = new Date().getTime();
		
		//var mat_projection = scene.getProjectionMatrix();
		var mat_view = scene.getViewMatrix();
		
		//TODO; allow for more than one additional light per scene
		var light, lightOn;
		var slights = scene.getLights();
		if (slights.length > 0) {
			light = slights[0]._direction;
            lightOn = (slights[0]._on === true) ? 1.0 : 0.0;
            lightOn = lightOn * slights[0]._intensity;
		}
		else {
			light = new x3dom.fields.SFVec3(0, -1, 0);
            lightOn = 0.0;
		}
		light = mat_view.multMatrixVec(light);
		
		
		// do z-sorting for transparency (currently no separate transparency list)
		var zPos = [];
		for (i=0, n=scene.drawableObjects.length; i<n; i++)
		{
			var trafo = scene.drawableObjects[i][0];
			var obj3d = scene.drawableObjects[i][1];
			
			var center = obj3d._getCenter();
			center = trafo.multMatrixPnt(center);
			center = mat_view.multMatrixPnt(center);
			
			zPos[i] = [i, center.z];
		}
		zPos.sort(function(a, b) { return a[1] - b[1]; });
		//zPos.reverse();
		
		t1 = new Date().getTime() - t0;
		
		if (this.canvas.parent.statDiv) {
			this.canvas.parent.statDiv.appendChild(document.createElement("br"));
			this.canvas.parent.statDiv.appendChild(document.createTextNode("sort: " + t1));
		}
		
		// rendering
		t0 = new Date().getTime();
		
		for (i=0, n=zPos.length; i<n; i++)
		//for (var i=0, n=scene.drawableObjects.length; i<n; i++)
		{
			var obj = scene.drawableObjects[zPos[i][0]];
			//var obj = scene.drawableObjects[i];
			
			var transform = obj[0];
			var shape = obj[1];

			if (!shape._webgl) {
                // init of GL objects
				this.setupShape(gl, shape);
            }

			sp = shape._webgl.shader;
			if (!sp) {
				sp = scene._webgl.shader;
            }
			sp.bind();

			sp.eyePosition = [0, 0, 0];
			sp.lightDirection = light.toGL();
            sp.lightOn = lightOn;

			var mat = shape._appearance._material;
			if (mat) {
				sp.ambientIntensity = mat._ambientIntensity;
				sp.diffuseColor = mat._diffuseColor.toGL();
				sp.emissiveColor = mat._emissiveColor.toGL();
				sp.shininess = mat._shininess;
				sp.specularColor = mat._specularColor.toGL();
				sp.alpha = 1.0 - mat._transparency;
			}

			if (shape._webgl.mask_texture !== undefined && shape._webgl.mask_texture)
			{
			/*
				//gl.activeTexture(gl.TEXTURE0);
				gl.enable(gl.TEXTURE_2D);
				gl.bindTexture(gl.TEXTURE_2D, shape._webgl.mask_texture);
				
				var texcBuffer = gl.createBuffer();
				var texcoords = new WebGLFloatArray(shape._webgl.texcoords);
				
				gl.bindBuffer(gl.ARRAY_BUFFER, texcBuffer);
				gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);
				
				gl.vertexAttribPointer(sp.texcoord, 2, gl.FLOAT, false, 2, 0); 
				gl.enableVertexAttribArray(sp.texcoord);
				
				//gl.enable(gl.BLEND);
				gl.blendFuncSeparate(
					gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
					gl.ONE_MINUS_DST_ALPHA, gl.ONE // TODO: is this sensible?
				);
				//gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			*/
				x3dom.debug.logInfo("TEXT?");	//no text visible?!
			}
            
            // transformation matrices
			sp.modelViewMatrix = mat_view.mult(transform).toGL();
			sp.modelViewProjectionMatrix = scene.getWCtoCCMatrix().mult(transform).toGL();
			
			if (shape._webgl.texture !== undefined && shape._webgl.texture)
			{
                var tex = shape._appearance._texture;
                var wrapS = gl.REPEAT, wrapT = gl.REPEAT;
                if (tex._repeatS === false) {
                    wrapS = gl.CLAMP_TO_EDGE;
                }
                if (tex._repeatT === false) {
                    wrapT = gl.CLAMP_TO_EDGE;
                }
                
				gl.enable(gl.TEXTURE_2D);
				gl.bindTexture(gl.TEXTURE_2D,shape._webgl.texture);
				
				gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
				//gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
				gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,wrapS);
				gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,wrapT);
				//gl.generateMipmap(gl.TEXTURE_2D);
                
                if (shape._appearance._textureTransform !== null)
                {
                    // use shader/ calculation due to performance issues
                    var texTrafo = shape._appearance.transformMatrix();
                    sp.texTrafoMatrix = texTrafo.toGL();
                }
			}
			
			if (sp.position !== undefined) 
			{
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape._webgl.buffers[0]);
				
				gl.bindBuffer(gl.ARRAY_BUFFER, shape._webgl.buffers[1]);
				
				gl.vertexAttribPointer(sp.position, 3, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(sp.position);
			}
			if (sp.normal !== undefined) 
			{
				gl.bindBuffer(gl.ARRAY_BUFFER, shape._webgl.buffers[2]);			
				
				gl.vertexAttribPointer(sp.normal, 3, gl.FLOAT, false, 0, 0); 
				gl.enableVertexAttribArray(sp.normal);
			}
			if (sp.texcoord !== undefined)
			{
				gl.bindBuffer(gl.ARRAY_BUFFER, shape._webgl.buffers[3]);
				
				gl.vertexAttribPointer(sp.texcoord, 2, gl.FLOAT, false, 0, 0); 
				gl.enableVertexAttribArray(sp.texcoord);
			}
			if (sp.color !== undefined)
			{
				gl.bindBuffer(gl.ARRAY_BUFFER, shape._webgl.buffers[4]);
				
				gl.vertexAttribPointer(sp.color, 3, gl.FLOAT, false, 0, 0); 
				gl.enableVertexAttribArray(sp.color);
			}
			
			if (shape._isSolid()) {
				gl.enable(gl.CULL_FACE);
            }
			else {
				gl.disable(gl.CULL_FACE);
            }
			
			//gl.drawArrays(gl.TRIANGLES, 0, shape._webgl.positions.length/3);
			
			// fixme; scene._points is dynamic and doesn't belong there!!!
			if (scene._points !== undefined && scene._points) {
			  gl.drawElements(gl.POINTS, shape._webgl.indexes.length, gl.UNSIGNED_SHORT, 0);
            }
			else {
			  gl.drawElements(gl.TRIANGLES, shape._webgl.indexes.length, gl.UNSIGNED_SHORT, 0);
            }
			
			if (shape._webgl.texture !== undefined && shape._webgl.texture)
			{
				gl.bindTexture(gl.TEXTURE_2D, null);
				gl.disable(gl.TEXTURE_2D);
			}
			
			// TODO: make this state-cleanup nicer
			if (sp.position !== undefined) {
				gl.disableVertexAttribArray(sp.position);
			}
			if (sp.normal !== undefined) {
				gl.disableVertexAttribArray(sp.normal);
			}
			if (sp.texcoord !== undefined) {
				gl.disableVertexAttribArray(sp.texcoord);
			}
		}
		//);
			
		gl.disable(gl.BLEND);
		/*gl.blendFuncSeparate( // just multiply dest RGB by its A
			gl.ZERO, gl.DST_ALPHA,
			gl.ZERO, gl.ONE
		);*/ 
		gl.disable(gl.DEPTH_TEST);
		//gl.flush();
		
		t1 = new Date().getTime() - t0;
			
		if (this.canvas.parent.statDiv) {
			this.canvas.parent.statDiv.appendChild(document.createElement("br"));
			this.canvas.parent.statDiv.appendChild(document.createTextNode("render: " + t1));
		}
		
		scene.drawableObjects = null;
	};
	
	Context.prototype.shutdown = function(scene)
	{
		var gl = this.ctx3d;
	    //alert("Shutdown scene");
        
        if (gl === null || scene === null || scene.drawableObjects === null)
        {
            return;
        }
		
		// TODO; optimize traversal, matrices are not needed for cleanup
		scene._collectDrawableObjects(x3dom.fields.SFMatrix4.identity(), scene.drawableObjects);
		
		for (var i=0, n=scene.drawableObjects.length; i<n; i++)
		{
			var shape = scene.drawableObjects[i][1];
			var sp = shape._webgl.shader;
			
			if (shape._webgl.texture !== undefined && shape._webgl.texture)
			{
				gl.deleteTexture(shape._webgl.texture);
			}
			
			if (sp.position !== undefined) 
			{
				gl.deleteBuffer(shape._webgl.buffers[1]);
				gl.deleteBuffer(shape._webgl.buffers[0]);
			}
			
			if (sp.normal !== undefined) 
			{
				gl.deleteBuffer(shape._webgl.buffers[2]);
			}
			
			if (sp.texcoord !== undefined) 
			{
				gl.deleteBuffer(shape._webgl.buffers[3]);
			}
			
			if (sp.color !== undefined)
			{
				gl.deleteBuffer(shape._webgl.buffers[4]);
			}
		}
	};

	return setupContext;

})();
