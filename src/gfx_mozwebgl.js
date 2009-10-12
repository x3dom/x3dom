x3dom.gfx_mozwebgl = (function () { 

	var winWidth = 400, winHeight = 300;
	
	function Context(ctx3d) {
		this.ctx3d = ctx3d;
	}

	Context.prototype.getName = function() {
		return "moz-webgl";
	}

	function setupContext(canvas, winSize) {
		x3dom.debug.logInfo("setupContext: canvas=" + canvas);
		winWidth = winSize.w;
		winHeight = winSize.h;
		x3dom.debug.logInfo("Creating gfx_mozwebgl with size " + winWidth + "/" + winHeight);
		try {
			var ctx = canvas.getContext('moz-webgl');
			if (ctx)
				return new Context(ctx);
		} catch (e) {}
	}

	var g_shaders = {};
	var g_shadersState = 0; // 0 = unloaded, 1 = loading XML, 2 = loaded XML
	var g_shadersPendingOnload = [];
	
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
		"uniform mat4 modelMatrix;" +
		"uniform vec3 lightPosition;" +
		"uniform vec3 eyePosition;" +
		"" +
		"void main(void) {" +
		"    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);" +
		"    fragNormal = normalize(vec3(modelMatrix * vec4(normal, 0.0)));" +
		"    fragLightVector = lightPosition - vec3(modelMatrix * vec4(position, 1.0));" +
		"    fragEyeVector = eyePosition - vec3(modelMatrix * vec4(position, 1.0));" +
		"    fragTexCoord = texcoord;" +
		"}"
		};
		
	g_shaders['fs-x3d-textured'] = { type: "fragment", data:
		"uniform float ambientIntensity;" +
		"uniform vec3 diffuseColor;" +
		"uniform vec3 emissiveColor;" +
		"uniform float shininess;" +
		"uniform vec3 specularColor;" +
		"uniform float alpha;" +
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
		"    float diffuse = max(0.0, dot(normal, light));" +
		"    float specular = pow(max(0.0, dot(normal, normalize(light+eye))), shininess*128.0);" +
		"    vec3 rgb = emissiveColor + diffuse*diffuseColor + specular*specularColor;" +
		"    gl_FragColor = vec4(rgb, texture2D(tex, fragTexCoord.xy).a);" +
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
		"uniform mat4 modelMatrix;" +
		"uniform vec3 lightPosition;" +
		"uniform vec3 eyePosition;" +
		"" +
		"void main(void) {" +
		"    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);" +
		"    fragNormal = normalize(vec3(modelMatrix * vec4(normal, 0.0)));" +
		"    fragLightVector = lightPosition - vec3(modelMatrix * vec4(position, 1.0));" +
		"    fragEyeVector = eyePosition - vec3(modelMatrix * vec4(position, 1.0));" +
		"}"
		};
		
	g_shaders['fs-x3d-untextured'] = { type: "fragment", data:
		"uniform float ambientIntensity;" +
		"uniform vec3 diffuseColor;" +
		"uniform vec3 emissiveColor;" +
		"uniform float shininess;" +
		"uniform vec3 specularColor;" +
		"uniform float alpha;" +
		"" +
		"varying vec3 fragNormal;" +
		"varying vec3 fragLightVector;" +
		"varying vec3 fragEyeVector;" +
		"" +
		"void main(void) {" +
		"    vec3 normal = normalize(fragNormal);" +
		"    vec3 light = normalize(fragLightVector);" +
		"    vec3 eye = normalize(fragEyeVector);" +
		"    float diffuse = 0.5*(max(0.0, dot(normal, light)) + max(0.0, dot(normal, eye)));" +
		"    float specular = pow(max(0.0, dot(normal, normalize(light+eye))), shininess*128.0);" +
		"    vec3 rgb = emissiveColor + diffuse*diffuseColor + specular*specularColor;" +
		"    gl_FragColor = vec4(rgb, 1.0);" +
		"}"
		};

	g_shaders['fs-x3d-shownormal'] = { type: "fragment", data:
		"uniform float ambientIntensity;" +
		"uniform vec3 diffuseColor;" +
		"uniform vec3 emissiveColor;" +
		"uniform float shininess;" +
		"uniform vec3 specularColor;" +
		"uniform float alpha;" +
		"uniform sampler2D tex;" +
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
			

	function getShader(env, gl, id, onload) {
		if (g_shaders[id]) {
			var shader;
			if (g_shaders[id].type == 'vertex')
				shader = gl.createShader(gl.VERTEX_SHADER);
			else if (g_shaders[id].type == 'fragment')
				shader = gl.createShader(gl.FRAGMENT_SHADER);
			else {
				x3dom.debug.logError('Invalid shader type '+g_shaders[id].type);
				return;
			}
			gl.shaderSource(shader, g_shaders[id].data);
			gl.compileShader(shader);
			//env.log(gl.getShaderInfoLog(shader));
			onload(shader);
		}
		else if (g_shadersState == 0) {
			g_shadersState = 1;
			g_shadersPendingOnload.push(function () { getShader(env, gl, id, onload) });
			var xhr = new XMLHttpRequest();
			xhr.open('GET', 'shaders.xml');
			xhr.onreadystatechange = function () {
				if (xhr.readyState != 4) return;
				if (xhr.status !== 200) return; // TODO: report error
				var xml = this.responseXML;
				var els = xml.getElementsByTagName('vs');
				for (var i = 0; i < els.length; ++i)
					g_shaders[els[i].getAttribute('id')] = { type: 'vertex', data: els[i].textContent };
				var els = xml.getElementsByTagName('fs');
				for (var i = 0; i < els.length; ++i)
					g_shaders[els[i].getAttribute('id')] = { type: 'fragment', data: els[i].textContent };
				for (var i = 0; i < g_shadersPendingOnload.length; ++i)
					g_shadersPendingOnload[i]();
			};
			xhr.send('');
		}
		else if (g_shadersState == 1) {
			g_shadersPendingOnload.push(function () { getShader(env, gl, id, onload) });
		}
		else {
			x3dom.debug.logError('Cannot find shader '+id);
		}
	}

	var defaultVS =
		"attribute vec3 position;" +
		"uniform mat4 modelViewProjectionMatrix;" +
		"void main(void) {" +
		"    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);" +
		"}";

	var defaultFS =
		"uniform vec3 diffuseColor;" +
		"uniform float alpha;" +
		"void main(void) {" +
		"    gl_FragColor = vec4(diffuseColor, alpha);" +
		"}";

	function getDefaultShaderProgram(env, gl) {
		var prog = gl.createProgram();
		var vs = gl.createShader(gl.VERTEX_SHADER);
		var fs = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(vs, defaultVS);
		gl.shaderSource(fs, defaultFS);
		gl.compileShader(vs);
		gl.compileShader(fs);
		gl.attachShader(prog, vs);
		gl.attachShader(prog, fs);
		gl.linkProgram(prog);
		var msg = gl.getProgramInfoLog(prog);
		if (msg) x3dom.debug.logError(msg);
		var sp = wrapShaderProgram(env, gl, prog);
		return sp;
	}

	function getShaderProgram(env, gl, ids, onload) {
		getShader(env, gl, ids[0], function (vs) {
			getShader(env, gl, ids[1], function (fs) {
				var prog = gl.createProgram();
				gl.attachShader(prog, vs);
				gl.attachShader(prog, fs);
				gl.linkProgram(prog);
				var msg = gl.getProgramInfoLog(prog);
				if (msg) x3dom.debug.logError(msg);
				var sp = wrapShaderProgram(env, gl, prog);
				onload(sp);
			})
		});
	}

	function setCamera(fovy, aspect, zfar, znear)
	{
		var f = 1/Math.tan(fovy/2);
		var m = new x3dom.fields.SFMatrix4(
			f/aspect, 0, 0, 0,
			0, f, 0, 0,
			0, 0, (znear+zfar)/(znear-zfar), 2*znear*zfar/(znear-zfar),
			0, 0, -1, 0
		);
		return m;
	};
	
	function makeFrustum(left, right, bottom, top, znear, zfar)
	{
		var X = 2*znear/(right-left);
		var Y = 2*znear/(top-bottom);
		var A = (right+left)/(right-left);
		var B = (top+bottom)/(top-bottom);
		var C = -(zfar+znear)/(zfar-znear);
		var D = -2*zfar*znear/(zfar-znear);

		var m = new x3dom.fields.SFMatrix4(
				X, 0, A, 0,
				0, Y, B, 0,
				0, 0, C, D,
				0, 0, -1, 0
		);
		return m;
	}

	// Returns "shader" such that "shader.foo = [1,2,3]" magically sets the appropriate uniform
	function wrapShaderProgram(env, gl, sp) {
		var shader = {};
		shader.bind = function () { gl.useProgram(sp) };
		for (var i = 0; ; ++i) {
			try {
				var obj = gl.getActiveUniform(sp, i);
				// x3dom.debug.logInfo("uniform #" + i + " obj=" + obj.name );
			}
			catch (e) {}

			if (gl.getError() != 0) break; // XXX: GetProgramiv(ACTIVE_ATTRIBUTES) is not implemented, so just loop until error

			var loc = gl.getUniformLocation(sp, obj.name);
			switch (obj.type) {
				case gl.SAMPLER_2D:
					shader.__defineSetter__(obj.name, (function (loc) { return function (val) { gl.uniformi(loc, [val]) } })(loc));
					break;
				case gl.FLOAT:
					shader.__defineSetter__(obj.name, (function (loc) { return function (val) { gl.uniform1f(loc, val) } })(loc));
					break;
				case gl.FLOAT_VEC2:
					shader.__defineSetter__(obj.name, (function (loc) { return function (val) { gl.uniform2f(loc, val[0], val[1]) } })(loc));           
					break;
				case gl.FLOAT_VEC3:
					shader.__defineSetter__(obj.name, (function (loc) { return function (val) { gl.uniform3f(loc, val[0], val[1], val[2]) } })(loc));
					break;
				case gl.FLOAT_VEC4:
					shader.__defineSetter__(obj.name, (function (loc) { return function (val) { gl.uniform4f(loc, val[0], val[1], val[2], val[3]) } })(loc));
					break;
				case gl.FLOAT_MAT2:
					shader.__defineSetter__(obj.name, (function (loc) { return function (val) { gl.uniformMatrix2fv(loc, 1, gl.FALSE, val) } })(loc));
					break;
				case gl.FLOAT_MAT3:
					shader.__defineSetter__(obj.name, (function (loc) { return function (val) { gl.uniformMatrix3fv(loc, 1, gl.FALSE, val) } })(loc));
					break;
				case gl.FLOAT_MAT4:
					// x3dom.debug.logError("gl.FLOAT_MAT4 fixme!");
					shader.__defineSetter__(obj.name, (function (loc) { return function (val) { gl.uniformMatrix4fv(loc, false, new CanvasFloatArray(val)) } })(loc));
					break;
				default:
					x3dom.debug.logInfo('GLSL program variable '+obj.name+' has unknown type '+obj.type);
			}
		}
		for (var i = 0; ; ++i) {
			try {
				var obj = gl.getActiveAttrib(sp, i);
			}
			catch (e) {
				// PE: now catching excpetion... just looping does not work :(
				//     
			}
			if (gl.getError() != 0) break; // XXX: as above			

			var loc = gl.getAttribLocation(sp, obj.name);
			shader[obj.name] = loc;
		}
		return shader;
	};


function setupShape(env, gl, shape) 
{
    if (x3dom.isa(shape._geometry, Text)) {
        var text_canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
        var text_ctx = text_canvas.getContext('2d');
        var fontStyle = shape._geometry._fontStyle;
        var font_family = Array.map(fontStyle._family, function (s) {
            if (s == 'SANS') return 'sans-serif';
            else if (s == 'SERIF') return 'serif';
            else if (s == 'TYPEWRITER') return 'monospace';
            else return '"'+s+'"';
        }).join(', ');
        text_ctx.mozTextStyle = '48px '+font_family;

        var text_w = 0;
        var string = shape._geometry._string;
        for (var i = 0; i < string.length; ++i)
            text_w = Math.max(text_w, text_ctx.mozMeasureText(string[i]));

        var line_h = 1.2 * text_ctx.mozMeasureText('M'); // XXX: this is a hacky guess
        var text_h = line_h * shape._geometry._string.length;

        text_canvas.width = Math.pow(2, Math.ceil(Math.log(text_w)/Math.log(2)));
        text_canvas.height = Math.pow(2, Math.ceil(Math.log(text_h)/Math.log(2)));
        text_ctx.fillStyle = '#000';
        text_ctx.translate(0, line_h);
        for (var i = 0; i < string.length; ++i) {
            text_ctx.mozDrawText(string[i]);
            text_ctx.translate(0, line_h);
        }
        var ids = gl.genTextures(1);
        gl.bindTexture(gl.TEXTURE_2D, ids[0]);
        gl.texParameter(gl.TEXTURE_2D, gl.GENERATE_MIPMAP, true);
        gl.texImage2DHTML(gl.TEXTURE_2D, text_canvas);

        var w = text_w/text_h;
        var h = 1;
        var u = text_w/text_canvas.width;
        var v = text_h/text_canvas.height;
        shape._webgl = {
            positions: [-w,-h,0, w,-h,0, w,h,0, -w,h,0],
            normals: [0,0,1, 0,0,1, 0,0,1, 0,0,1],
            indexes: [0,1,2, 2,3,0],
            texcoords: [0,v, u,v, u,0, 0,0],
            mask_texture: ids[0],
        };

        getShaderProgram(env, gl, ['vs-x3d-textured', 'fs-x3d-textured'], 
				function (sp) { shape._webgl.shader = sp });
    } 
	else 
	{
        var coords = shape._geometry._positions;
        var idxs = shape._geometry._indexes;
        var vertFaceNormals = [];
		var vertNormals = [];
		
        for (var i = 0; i < coords.length/3; ++i)
            vertFaceNormals[i] = [];

        for (var i = 0, k=0, l=0; i < idxs.length; i += 3) {
            var a = new x3dom.fields.SFVec3(
					coords[idxs[i  ]*3], coords[idxs[i  ]*3+1], coords[idxs[i  ]*3+2]).
                subtract(new x3dom.fields.SFVec3(
					coords[idxs[i+1]*3], coords[idxs[i+1]*3+1], coords[idxs[i+1]*3+2]));
            var b = new x3dom.fields.SFVec3(
					coords[idxs[i+1]*3], coords[idxs[i+1]*3+1], coords[idxs[i+1]*3+2]).
                subtract(new x3dom.fields.SFVec3(
					coords[idxs[i+2]*3], coords[idxs[i+2]*3+1], coords[idxs[i+2]*3+2]));
			
            var n = a.cross(b).normalised();
			
            vertFaceNormals[idxs[i  ]].push(n);
            vertFaceNormals[idxs[i+1]].push(n);
            vertFaceNormals[idxs[i+2]].push(n);
        }
		
        for (var i = 0; i < coords.length; i += 3) {
            var n = new x3dom.fields.SFVec3(0, 0, 0);
            for (var j = 0; j < vertFaceNormals[i/3].length; ++j)
                n = n.add(vertFaceNormals[i/3][j]);
			
            n = n.normalised();
            vertNormals[i  ] = n.x;
            vertNormals[i+1] = n.y;
            vertNormals[i+2] = n.z;
        }
		
        shape._webgl = {
            positions: coords,
            normals: vertNormals,
            indexes: idxs,
        };
		
		/*
		if (x3dom.isa(shape._geometry, x3dom.nodeTypes.IndexedFaceSet)) {
			x3dom.debug.logInfo(shape._webgl.indexes.length+" GL-Indices:   "+shape._webgl.indexes);
			x3dom.debug.logInfo(shape._webgl.positions.length+" GL-Positions: "+shape._webgl.positions);
			x3dom.debug.logInfo(shape._webgl.normals.length+" GL_Normals:   "+shape._webgl.normals);
		}
		*/

		// 'fs-x3d-untextured'],  //'fs-x3d-shownormal'],
        getShaderProgram(env, gl, ['vs-x3d-untextured', 'fs-x3d-untextured'], 
							function (sp) { shape._webgl.shader = sp });
    }
}

	Context.prototype.renderScene = function (env, scene, t) 
	{
		var gl = this.ctx3d;

		//FIXME; the width/height property is overwritten by succeeding x3d elems?!
		//x3dom.debug.logInfo("w=" + winWidth + ", h=" + winHeight);		
		//gl.viewport(0,0,winWidth,winHeight);
		
		var bgCol = scene.getSkyColor();
		//x3dom.debug.logInfo("bgCol=" + bgCol);
		
		gl.clearColor(bgCol[0], bgCol[1], bgCol[2], 1.0);
		gl.clearDepthf(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		gl.enable(gl.CULL_FACE);

		var sp = getDefaultShaderProgram(env, gl);
		if (!scene._webgl) {
			// alert("no scene?!");
			var sp = getDefaultShaderProgram(env, gl);
			scene._webgl = {
				shader: sp,
			};
		}
		
		var fov = scene.getFieldOfView();
		//x3dom.debug.logInfo("fov=" + fov);
		
		var mat_projection = setCamera(fov, winWidth/winHeight, 1000, 0.1);
		//var mat_projection = makeFrustum(0, winWidth-1, 0, winHeight-1, 1000, 1);
		var mat_view = scene.getViewMatrix();

		var drawableObjects = [];
		scene._collectDrawableObjects(x3dom.fields.SFMatrix4.identity(), drawableObjects);
		Array.forEach(drawableObjects, function (obj) 
		{
			var transform = obj[0];
			var shape = obj[1];

			if (! shape._webgl)
				setupShape(env, gl, shape);

			var sp = shape._webgl.shader;
			if (! sp)
				sp = scene._webgl.shader;
			sp.bind();

			//sp.lightPosition = [10*Math.sin(t), 10, 10*Math.cos(t)];
			sp.lightPosition = [0, 100, 800];
			sp.eyePosition = scene.getViewPosition().toGL();

			var mat = shape._appearance._material;
			if (mat) {
				sp.ambientIntensity = mat._ambientIntensity;
				sp.diffuseColor = mat._diffuseColor.toGL();
				sp.emissiveColor = mat._emissiveColor.toGL();
				sp.shininess = mat._shininess;
				sp.specularColor = mat._specularColor.toGL();
				sp.alpha = 1.0 - mat._transparency;
			} 
			else {
				// TODO: should disable lighting and set to 1,1,1 when no Material
			}

			if (shape._webgl.mask_texture) 
			{
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, shape._webgl.mask_texture);
				sp.tex = 0;
				gl.vertexAttribPointer(sp.texcoord, 2, gl.FLOAT, false, 0, new CanvasFloatArray(shape._webgl.texcoords));
				gl.enableVertexAttribArray(sp.texcoord);
				gl.enable(gl.BLEND);
				gl.blendFuncSeparate(
					gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
					gl.ONE_MINUS_DST_ALPHA, gl.ONE // TODO: is this sensible?
				);
				//gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			} 
			else {
				gl.disable(gl.BLEND);
			}

			sp.modelMatrix = transform.toGL();
			sp.modelViewMatrix = mat_view.mult(transform).toGL();
			sp.modelViewProjectionMatrix = mat_projection.mult(mat_view).mult(transform).toGL();
			
			if (sp.position !== undefined) 
			{
				var positionBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
				gl.bufferData(gl.ARRAY_BUFFER, 
						new CanvasFloatArray(shape._webgl.positions), gl.STATIC_DRAW);
				gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
				gl.vertexAttribPointer(sp.position, 3, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(sp.position);
				
				// bind indizes for drawElements() call
				var indicesBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 
						new CanvasUnsignedShortArray(shape._webgl.indexes), gl.STATIC_DRAW);
			}
			if (sp.normal !== undefined) 
			{
				gl.vertexAttribPointer(sp.normal, 3, gl.FLOAT, false, 0, new CanvasFloatArray(shape._webgl.normals));
				gl.enableVertexAttribArray(sp.normal);
			}
			
			// x3dom.debug.logInfo("shape._webgl.indexes=" + shape._webgl.indexes.length);
			
			//gl.drawArrays(gl.TRIANGLES, 0, shape._webgl.positions.length/3);
			gl.drawElements(gl.TRIANGLES, shape._webgl.indexes.length, gl.UNSIGNED_SHORT, 0);
			
			// TODO: make this state-cleanup nicer
			if (sp.position !== undefined) {
				gl.disableVertexAttribArray(sp.position);
				gl.deleteBuffer(positionBuffer);
				gl.deleteBuffer(indicesBuffer);
			}
			if (sp.normal !== undefined) {
				gl.disableVertexAttribArray(sp.normal);
			}
		});
			
		// XXX: nasty hack to fix Firefox compositing the non-premultiplied canvas as if it were premultiplied
		gl.enable(gl.BLEND);
		gl.blendFuncSeparate( // just multiply dest RGB by its A
			gl.ZERO, gl.DST_ALPHA,
			gl.ZERO, gl.ONE
		); 
		gl.disable(gl.DEPTH_TEST);
		
		//x3dom.debug.logInfo(gl.getString(gl.VENDOR)+"/"+gl.getString(gl.RENDERER)+"/"+
		//					gl.getString(gl.VERSION)+"/"+gl.getString(gl.EXTENSIONS)+);
		//gl.flush();
	};

	return setupContext;

})();
