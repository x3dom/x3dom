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
 * Generate the final ShadowShader program
 */
x3dom.shader.BackgroundCubeTextureShader = function(gl)
{
	this.program = gl.createProgram();
	
	var vertexShader 	= this.generateVertexShader(gl);
	var fragmentShader 	= this.generateFragmentShader(gl);
	
	gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
	gl.linkProgram(this.program);
	
	return this.program;
};

/**
 * Generate the vertex shader
 */
x3dom.shader.BackgroundCubeTextureShader.prototype.generateVertexShader = function(gl)
{
	var shader = 	"attribute vec3 position;\n" +
					"uniform mat4 modelViewProjectionMatrix;\n" +
					"varying vec3 fragNormal;\n" +
					"\n" +
					"void main(void) {\n" +
					"    fragNormal = normalize(position);\n" +
					"    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);\n" +
					"}\n";

	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shader);
    gl.compileShader(vertexShader);
		
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[BackgroundCubeTextureShader] VertexShader " + gl.getShaderInfoLog(vertexShader));		
	}
	
	return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.BackgroundCubeTextureShader.prototype.generateFragmentShader = function(gl)
{
	shader =	"#ifdef GL_ES\n" +
				"  precision highp float;\n" +
				"#endif\n" +
				"\n" +
				"uniform samplerCube tex;\n" +
				"varying vec3 fragNormal;\n" +
				"\n" +
				"float magn(float val) {\n" +
				"    return ((val >= 0.0) ? val : -1.0 * val);\n" +
				"}" +
				"\n" +
				"void main(void) {\n" +
				"    vec3 normal = -reflect(normalize(fragNormal), vec3(0.0,0.0,1.0));\n" +
				"    if (magn(normal.y) >= magn(normal.x) && magn(normal.y) >= magn(normal.z))\n" +
				"        normal.xz = -normal.xz;\n" +
				"    gl_FragColor = textureCube(tex, normal);\n" +
				"}\n";

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[BackgroundCubeTextureShader] FragmentShader " + gl.getShaderInfoLog(fragmentShader));		
	}
	
	return fragmentShader;
};

