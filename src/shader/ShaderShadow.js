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
x3dom.shader.ShadowShader = function(gl)
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
x3dom.shader.ShadowShader.prototype.generateVertexShader = function(gl)
{
	var shader = 	"attribute vec3 position;\n" +
					"uniform mat4 modelViewProjectionMatrix;\n" +
					"varying vec4 projCoord;\n" +
					"void main(void) {\n" +
					"   projCoord = modelViewProjectionMatrix * vec4(position, 1.0);\n" +
					"   gl_Position = projCoord;\n" +
					"}"

	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shader);
    gl.compileShader(vertexShader);
		
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[ShadowShader] VertexShader " + gl.getShaderInfoLog(vertexShader));		
	}
	
	return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.ShadowShader.prototype.generateFragmentShader = function(gl)
{
	shader =	"#ifdef GL_ES\n" +
				"  precision highp float;\n" +
				"#endif\n" +
				"\n" +
				"varying vec4 projCoord;\n" +
				"void main(void) {\n" +
				"    vec3 proj = (projCoord.xyz / projCoord.w);\n";
				if(!x3dom.caps.FP_TEXTURES) {
	shader +=	"    vec4 outVal = vec4(0.0);\n" +
				"    float toFixed = 255.0 / 256.0;\n" +
				"    outVal.r = fract(proj.z * toFixed);\n" +
				"    outVal.g = fract(proj.z * toFixed * 255.0);\n" +
				"    outVal.b = fract(proj.z * toFixed * 255.0 * 255.0);\n" +
				"    outVal.a = fract(proj.z * toFixed * 255.0 * 255.0 * 255.0);\n" +
				"    gl_FragColor = outVal;\n";
				} else {
	shader +=	"	gl_FragColor = vec4(proj, 1.0);";
				}
	shader +=	"}"

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[ShadowShader] FragmentShader " + gl.getShaderInfoLog(fragmentShader));		
	}
	
	return fragmentShader;
};

