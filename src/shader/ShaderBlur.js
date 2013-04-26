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
 * Generate the final BlurShader program 
 * (gaussian blur for 3x3, 5x5 and 7x7 kernels)
 */
x3dom.shader.BlurShader = function(gl)
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
x3dom.shader.BlurShader.prototype.generateVertexShader = function(gl)
{
	var shader = "";
	shader += "attribute vec2 position;\n";

	shader += "varying vec2 vPosition;\n";
	
	shader += "void main(void) {\n";
	shader += " vPosition = position;\n";
	shader += " gl_Position = vec4(position, -1.0, 1.0);\n";
	shader += "}\n";

	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shader);
    gl.compileShader(vertexShader);
		
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[BlurShader] VertexShader " + gl.getShaderInfoLog(vertexShader));		
	}
	
	return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.BlurShader.prototype.generateFragmentShader = function(gl)
{
	var shader =	"#ifdef GL_ES\n" +
					"  precision highp float;\n" +
					"#endif\n" +
					"\n" +
					"varying vec2 vPosition;\n" +
					"uniform sampler2D texture;\n" +
					"uniform bool horizontal;\n" +
					"uniform float pixelSizeHor;\n" +
					"uniform float pixelSizeVert;\n" +
					"uniform int filterSize;\n";

	if (!x3dom.caps.FP_TEXTURES || x3dom.caps.MOBILE){
	shader +=		x3dom.shader.rgbaPacking() +
	
					"void main(void) {\n" +
					"	vec2 texCoords = (vPosition + 1.0)*0.5;\n" +
					"	vec2 offset;\n" +
					"	if (horizontal) offset = vec2(pixelSizeHor, 0.0);\n" +
					"	else offset = vec2(0.0, pixelSizeVert);\n" +
					"	float depth = unpackDepth(texture2D(texture, texCoords));\n" +
					"	if (filterSize == 3){\n" +		
					"		depth = depth * 0.3844;\n" +
					"		depth += 0.3078*unpackDepth(texture2D(texture, texCoords-offset));\n" +
					"		depth += 0.3078*unpackDepth(texture2D(texture, texCoords+offset));\n" +
					"	} else if (filterSize == 5){\n" +	
					"		depth = depth * 0.2921;\n" +
					"		depth += 0.2339*unpackDepth(texture2D(texture, texCoords-offset));\n" +
					"		depth += 0.2339*unpackDepth(texture2D(texture, texCoords+offset));\n" +	
					"		depth += 0.1201*unpackDepth(texture2D(texture, texCoords-2.0*offset));\n" +
					"		depth += 0.1201*unpackDepth(texture2D(texture, texCoords+2.0*offset));\n" +
					"	} else if (filterSize == 7){\n" +	
					"		depth = depth * 0.2161;\n" +
					"		depth += 0.1907*unpackDepth(texture2D(texture, texCoords-offset));\n" +
					"		depth += 0.1907*unpackDepth(texture2D(texture, texCoords+offset));\n" +	
					"		depth += 0.1311*unpackDepth(texture2D(texture, texCoords-2.0*offset));\n" +
					"		depth += 0.1311*unpackDepth(texture2D(texture, texCoords+2.0*offset));\n" +
					"		depth += 0.0702*unpackDepth(texture2D(texture, texCoords-3.0*offset));\n" +
					"		depth += 0.0702*unpackDepth(texture2D(texture, texCoords+3.0*offset));\n" +					
					"	}\n" + 
					"	gl_FragColor = packDepth(depth);\n" + 
					"}\n";
	} else{
	shader +=		"void main(void) {\n" +
					"	vec2 texCoords = (vPosition + 1.0)*0.5;\n" +
					"	vec2 offset;\n" +
					"	if (horizontal) offset = vec2(pixelSizeHor, 0.0);\n" +
					"	else offset = vec2(0.0, pixelSizeVert);\n" +
					"	vec4 color = texture2D(texture, texCoords);\n" +
					"	if (filterSize == 3){\n" +		
					"		color = color * 0.3844;\n" +
					"		color += 0.3078*texture2D(texture, texCoords-offset);\n" +
					"		color += 0.3078*texture2D(texture, texCoords+offset);\n" +
					"	} else if (filterSize == 5){\n" +	
					"		color = color * 0.2921;\n" +
					"		color += 0.2339*texture2D(texture, texCoords-offset);\n" +
					"		color += 0.2339*texture2D(texture, texCoords+offset);\n" +	
					"		color += 0.1201*texture2D(texture, texCoords-2.0*offset);\n" +
					"		color += 0.1201*texture2D(texture, texCoords+2.0*offset);\n" +
					"	} else if (filterSize == 7){\n" +	
					"		color = color * 0.2161;\n" +
					"		color += 0.1907*texture2D(texture, texCoords-offset);\n" +
					"		color += 0.1907*texture2D(texture, texCoords+offset);\n" +	
					"		color += 0.1311*texture2D(texture, texCoords-2.0*offset);\n" +
					"		color += 0.1311*texture2D(texture, texCoords+2.0*offset);\n" +
					"		color += 0.0702*texture2D(texture, texCoords-3.0*offset);\n" +
					"		color += 0.0702*texture2D(texture, texCoords+3.0*offset);\n" +					
					"	}\n" + 
					"	gl_FragColor = color;\n" + 
					"}\n";
	}				

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[BlurShader] FragmentShader " + gl.getShaderInfoLog(fragmentShader));		
	}
	
	return fragmentShader;
};
