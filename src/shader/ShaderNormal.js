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
x3dom.shader.NormalShader = function(gl)
{
	this.program = gl.createProgram();
	
	var vertexShader   = this.generateVertexShader(gl);
	var fragmentShader = this.generateFragmentShader(gl);
	
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
x3dom.shader.NormalShader.prototype.generateVertexShader = function(gl)
{
	var shader =    "attribute vec3 position;\n" +
                    "attribute vec3 normal;\n" +
                    "uniform vec3 bgCenter;\n" +
                    "uniform vec3 bgSize;\n" +
                    "uniform float bgPrecisionMax;\n" +
                    "uniform float bgPrecisionNorMax;\n" +
                    "uniform mat4 normalMatrix;\n" +
                    "uniform mat4 modelViewProjectionMatrix;\n" +
                    "varying vec3 fragNormal;\n" +
                    
                    "void main(void) {\n" +
                    "    vec3 pos = bgCenter + bgSize * position / bgPrecisionMax;\n" +
                    "    fragNormal = (normalMatrix * vec4(normal / bgPrecisionNorMax, 0.0)).xyz;\n" +
                    //"    fragNormal = normal;\n" +
                    "    gl_Position = modelViewProjectionMatrix * vec4(pos, 1.0);\n" +
                    "}\n";

	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shader);
    gl.compileShader(vertexShader);
		
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[NormalShader] VertexShader " + gl.getShaderInfoLog(vertexShader));		
	}
	
	return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.NormalShader.prototype.generateFragmentShader = function(gl)
{
	var shader =	"#ifdef GL_ES\n" +
					"  precision highp float;\n" +
					"#endif\n" +
					"\n" +
                    "varying vec3 fragNormal;\n" +
					
					"void main(void) {\n" +
					"    gl_FragColor = vec4(normalize(fragNormal) / 2.0 + 0.5, 1.0);\n" +
					"}\n";

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[NormalShader] FragmentShader " + gl.getShaderInfoLog(fragmentShader));		
	}
	
	return fragmentShader;
};
