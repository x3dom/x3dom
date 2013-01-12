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
 * Generate the final Shader program
 */
x3dom.shader.ComposedShader = function(gl, shape)
{
	this.program = gl.createProgram();
	
	var vertexShader 	= this.generateVertexShader(gl, shape);
	var fragmentShader 	= this.generateFragmentShader(gl, shape);
	
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
x3dom.shader.ComposedShader.prototype.generateVertexShader = function(gl, shape)
{
	var shader = shape._cf.appearance.node._shader._vertex._vf.url[0];

	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shader);
    gl.compileShader(vertexShader);
		
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[ComposedShader] VertexShader " + gl.getShaderInfoLog(vertexShader));		
	}
	
	return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.ComposedShader.prototype.generateFragmentShader = function(gl, shape)
{
	var shader = shape._cf.appearance.node._shader._fragment._vf.url[0];

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[ComposedShader] FragmentShader " + gl.getShaderInfoLog(fragmentShader));		
	}
	
	return fragmentShader;
};
