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
x3dom.shader.BackgroundSkyTextureShader = function(gl)
{
	this.program = gl.createProgram();
	
	var vertexShader 	= this.generateVertexShader(gl);
	var fragmentShader 	= this.generateFragmentShader(gl);
	
	gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    
    // optional, but position should be at location 0 for performance reasons
    gl.bindAttribLocation(this.program, 0, "position");
    
	gl.linkProgram(this.program);
	
	return this.program;
};

/**
 * Generate the vertex shader
 */
x3dom.shader.BackgroundSkyTextureShader.prototype.generateVertexShader = function(gl)
{
	var shader = 	"attribute vec3 position;\n" +
					"attribute vec2 texcoord;\n" +
					"uniform mat4 modelViewProjectionMatrix;\n" +
					"varying vec2 fragTexCoord;\n" +
					"\n" +
					"void main(void) {\n" +
					"    fragTexCoord = texcoord;\n" +
					"    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);\n" +
					"}\n";

	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shader);
    gl.compileShader(vertexShader);
		
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[BackgroundSkyTextureShader] VertexShader " + gl.getShaderInfoLog(vertexShader));		
	}
	
	return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.BackgroundSkyTextureShader.prototype.generateFragmentShader = function(gl)
{
	shader =	"#ifdef GL_ES\n" +
				"  precision highp float;\n" +
				"#endif\n" +
				"\n" +
				"uniform sampler2D tex;\n" +
				"varying vec2 fragTexCoord;\n" +
				"\n" +
				"void main(void) {\n" +
				"    gl_FragColor = texture2D(tex, fragTexCoord);\n" +
				"}\n";

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[BackgroundSkyTextureShader] FragmentShader " + gl.getShaderInfoLog(fragmentShader));		
	}
	
	return fragmentShader;
};

