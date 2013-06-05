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
 * Generate the final Shader program
 */
x3dom.shader.PickingTexcoordShader = function(gl)
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
x3dom.shader.PickingTexcoordShader.prototype.generateVertexShader = function(gl)
{
	var shader = 	"attribute vec3 position;\n" +
					"attribute vec2 texcoord;\n" +
					"varying vec3 fragColor;\n" +
					"uniform mat4 modelViewProjectionMatrix;\n" +
					"" +
					"void main(void) {\n" +
					"    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);\n" +
					"    fragColor = vec3(abs(texcoord.x), abs(texcoord.y), 0.0);\n" +
					"}\n";

	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shader);
    gl.compileShader(vertexShader);
		
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[PickingTexcoordShader] VertexShader " + gl.getShaderInfoLog(vertexShader));		
	}
	
	return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.PickingTexcoordShader.prototype.generateFragmentShader = function(gl)
{
  var shader = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n";
  shader += "precision highp float;\n";
  shader += "#else\n";
  shader += " precision mediump float;\n";
  shader += "#endif\n\n";

	shader += "uniform float lowBit;\n" +
					"varying vec3 fragColor;\n" +
					"\n" +
					"void main(void) {\n" +
					"    gl_FragColor = vec4(fragColor, lowBit);\n" +
					"}\n";

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[PickingTexcoordShader] FragmentShader " + gl.getShaderInfoLog(fragmentShader));		
	}
	
	return fragmentShader;
};
