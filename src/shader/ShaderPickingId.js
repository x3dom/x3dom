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
x3dom.shader.PickingIdShader = function(gl)
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
x3dom.shader.PickingIdShader.prototype.generateVertexShader = function(gl)
{
	var shader =    "attribute vec3 position;\n" +
                    "attribute vec2 texcoord;\n" +
                    "uniform vec3 bgCenter;\n" +
                    "uniform vec3 bgSize;\n" +
                    "uniform float bgPrecisionMax;\n" +
					"uniform float writeShadowIDs;\n" +
                    "uniform mat4 modelMatrix;\n" +
                    "uniform mat4 modelViewProjectionMatrix;\n" +
                    "varying vec2 idCoord;\n" +
                    
                    "void main(void) {\n" +
					"    if (writeShadowIDs > 0.0) {\n" +
					"	    idCoord = vec2((texcoord.x + writeShadowIDs) / 256.0);\n" +
    				"       idCoord.x = floor(idCoord.x) / 255.0;\n" +
    				"       idCoord.y = fract(idCoord.y) * 1.00392156862745;\n" +
					"	 }\n" +
                    "    vec3 pos = bgCenter + bgSize * position / bgPrecisionMax;\n" +
                    "    gl_Position = modelViewProjectionMatrix * vec4(pos, 1.0);\n" +
                    "}\n";

	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shader);
    gl.compileShader(vertexShader);
		
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[PickingIdShader] VertexShader " + gl.getShaderInfoLog(vertexShader));
	}
	
	return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.PickingIdShader.prototype.generateFragmentShader = function(gl)
{
    var shader = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n";
    shader    += " precision highp float;\n";
    shader    += "#else\n";
    shader    += " precision mediump float;\n";
    shader    += "#endif\n\n";

    shader   += "uniform float writeShadowIDs;\n" +
                "uniform float highBit;\n" +
                "uniform float lowBit;\n" +
                "varying vec2 idCoord;\n" +

                "void main(void) {\n" +
                "    vec4 col = vec4(0.0, 0.0, highBit, lowBit);\n" +
                "    if (writeShadowIDs > 0.0) {\n" +
                "       col.rg = idCoord;\n" +
                "	 }\n" +
                "    gl_FragColor = col;\n" +
                "}\n";

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[PickingIdShader] FragmentShader " + gl.getShaderInfoLog(fragmentShader));
	}
	
	return fragmentShader;
};
