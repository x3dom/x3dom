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

	shader = this.injectVRPartsVS(shader);	

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

	shader = this.injectVRPartsFS(shader);	

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[ComposedShader] FragmentShader " + gl.getShaderInfoLog(fragmentShader));		
	}
	
	return fragmentShader;
};

x3dom.shader.ComposedShader.prototype.injectVRPartsVS = function(shader)
{
	var vrPart01 = "attribute float eyeIdx;\n" +
				   "uniform   float isVR;\n"+
				   "uniform   mat4  modelViewProjectionMatrix2;\n" +
				   "uniform   mat4  modelViewProjectionInverseMatrix;\n" +
				   "varying   float vrOffset;\n"+
				   "varying   float fragEyeIdx;\n";
				   
	var vrPart02 = "fragEyeIdx = eyeIdx;\n" +

				   "if(isVR == 1.0)\n" +
				   "{\n" +
				   "    vec4 webVRPos = modelViewProjectionInverseMatrix * gl_Position;\n" +
				   "    webVRPos.xyz = webVRPos.xyz / webVRPos.w;\n" +
				   "    if(fragEyeIdx == -1.0) {\n" +
				   "        gl_Position = modelViewProjectionMatrix * webVRPos;\n" +
				   "    } else if(fragEyeIdx == -1.0) {\n" +
				   "        gl_Position = modelViewProjectionMatrix2 * webVRPos;\n" +
                   "    }\n" +
				   "    vrOffset = fragEyeIdx * 0.5;\n" +
				   "    gl_Position.x *= 0.5;\n" +
				   "    gl_Position.x += vrOffset * gl_Position.w;\n" +
				   "}";

    var sections = this.extractShaderSections(shader);

	return sections.before + 
		   vrPart01 + 
		   sections.mainStart + 
		   sections.main + 
		   vrPart02 + 
		   sections.mainEnd;
};

x3dom.shader.ComposedShader.prototype.injectVRPartsFS = function(shader)
{
	var vrPart01 = "uniform   float isVR;\n"+
				   "uniform   float screenWidth;\n" +
	               "varying   float vrOffset;\n"+
				   "varying   float fragEyeIdx;\n";
				   
	var vrPart02 = "if ( isVR == 1.0) {\n" +
		           "    if ( ( step( 0.5, gl_FragCoord.x / screenWidth ) - 0.5 ) * vrOffset < 0.0 ) discard;\n" +
				   "}\n";

    var sections = this.extractShaderSections(shader);

	return sections.before + 
		   vrPart01 + 
		   sections.mainStart + 
		   vrPart02 + 
		   sections.main + 
		   sections.mainEnd;
};

x3dom.shader.ComposedShader.prototype.extractShaderSections = function(shader)
{
	var regex = /void\s*main\s*\(\)\s*{[\s\S]*}/;

	var match = regex.exec( shader );

	var start = match[0].indexOf("{") + match.index + 1;
	var end   = match[0].lastIndexOf("}") + match.index;

	var before    = shader.substring(0, match.index);
	var mainStart = shader.substring(match.index, start);
	var main      = shader.substring(start, end);
	var mainEnd   = shader.substring(end, shader.lebgth);

	return {
		before:	   before,	
		mainStart: mainStart,
		main:      main,
		mainEnd:   mainEnd
	};
};
