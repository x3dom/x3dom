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
x3dom.shader.ShadowRenderingShader = function(gl,shadowedLights)
{
	this.program = gl.createProgram();
	var vertexShader 	= this.generateVertexShader(gl);
	var fragmentShader 	= this.generateFragmentShader(gl,shadowedLights);
	
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
x3dom.shader.ShadowRenderingShader.prototype.generateVertexShader = function(gl)
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
		x3dom.debug.logError("[ShadowRendering] VertexShader " + gl.getShaderInfoLog(vertexShader));		
	}
	
	return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.ShadowRenderingShader.prototype.generateFragmentShader = function(gl,shadowedLights)
{
  var shader = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n";
  shader += "precision highp float;\n";
  shader += "#else\n";
  shader += " precision mediump float;\n";
  shader += "#endif\n\n";

	shader += "uniform mat4 inverseViewProj;\n";
	shader += "uniform mat4 inverseProj;\n";
	shader += "varying vec2 vPosition;\n";
	shader += "uniform sampler2D sceneMap;\n";  
	for (var i=0; i<5; i++)
		shader += "uniform float cascade"+i+"_Depth;\n";
	
	
	for(var l=0; l<shadowedLights.length; l++) {
	shader +=	"uniform float light"+l+"_On;\n" +
				"uniform float light"+l+"_Type;\n" +
				"uniform vec3  light"+l+"_Location;\n" +
				"uniform vec3  light"+l+"_Direction;\n" +
				"uniform vec3  light"+l+"_Attenuation;\n" +
				"uniform float light"+l+"_Radius;\n" +
				"uniform float light"+l+"_BeamWidth;\n" +
				"uniform float light"+l+"_CutOffAngle;\n" +
				"uniform float light"+l+"_ShadowIntensity;\n" +
				"uniform float light"+l+"_ShadowOffset;\n" +
				"uniform mat4 light"+l+"_ViewMatrix;\n";
		for (var j=0; j<6; j++){
			shader += "uniform mat4 light"+l+"_"+j+"_Matrix;\n";
			shader += "uniform sampler2D light"+l+"_"+j+"_ShadowMap;\n"; 
		}
		for (var j=0; j<5; j++)
			shader += "uniform float light"+l+"_"+j+"_Split;\n"; 

		
	}
	if (!x3dom.caps.FP_TEXTURES || x3dom.caps.MOBILE) 
		shader += 	x3dom.shader.rgbaPacking();				
	
	shader += x3dom.shader.shadowRendering();
    
    shader += x3dom.shader.gammaCorrectionDecl({});  //TODO shader properties?
	
	shader += 	"void main(void) {\n" +
				"	float shadowValue = 1.0;\n" +
				"	vec2 texCoordsSceneMap = (vPosition + 1.0)*0.5;\n" +
				"	vec4 projCoords = texture2D(sceneMap, texCoordsSceneMap);\n" +
				"	if (projCoords != vec4(1.0,1.0,1.0,0.0)){\n";
	if (!x3dom.caps.FP_TEXTURES || x3dom.caps.MOBILE){ 
		shader += 	"	projCoords.z = unpackDepth(projCoords);\n" +
					"	projCoords.w = 1.0;\n";
	}
	
	//reconstruct world and view coordinates from scene map
	shader += 	"	projCoords = projCoords / projCoords.w;\n" +
				"	projCoords.xy = vPosition;\n" +
				"	vec4 eyeCoords = inverseProj*projCoords;\n" +
				"	vec4 worldCoords = inverseViewProj*projCoords;\n" +
				"	float lightInfluence = 0.0;\n";
	
	for(var l=0; l<shadowedLights.length; l++) {
		shader += 
				"	lightInfluence = getLightInfluence(light"+l+"_Type, light"+l+"_ShadowIntensity, light"+l+"_On, light"+l+"_Location, light"+l+"_Direction, " +
						"light"+l+"_CutOffAngle, light"+l+"_BeamWidth, light"+l+"_Attenuation, light"+l+"_Radius, eyeCoords.xyz/eyeCoords.w);\n" +
				"	if (lightInfluence != 0.0){\n" +
				"		vec4 shadowMapValues;\n" +
				"		float viewSampleDepth;\n";
				

		if (!x3dom.isa(shadowedLights[l], x3dom.nodeTypes.PointLight)){
			shader += "		getShadowValuesCascaded(shadowMapValues, viewSampleDepth, worldCoords, -eyeCoords.z/eyeCoords.w,"+
								"light"+l+"_0_Matrix,light"+l+"_1_Matrix,light"+l+"_2_Matrix,light"+l+"_3_Matrix,light"+l+"_4_Matrix,light"+l+"_5_Matrix,"+
								"light"+l+"_0_ShadowMap,light"+l+"_1_ShadowMap,light"+l+"_2_ShadowMap,light"+l+"_3_ShadowMap,"+
								"light"+l+"_4_ShadowMap,light"+l+"_5_ShadowMap, light"+l+"_0_Split, light"+l+"_1_Split, light"+l+"_2_Split, light"+l+"_3_Split, \n"+
								"light"+l+"_4_Split);\n";
		} else {
			shader += "		getShadowValuesPointLight(shadowMapValues, viewSampleDepth, light"+l+"_Location, worldCoords, light"+l+"_ViewMatrix, "+
								"light"+l+"_0_Matrix,light"+l+"_1_Matrix,light"+l+"_2_Matrix,light"+l+"_3_Matrix,light"+l+"_4_Matrix,light"+l+"_5_Matrix,"+
								"light"+l+"_0_ShadowMap,light"+l+"_1_ShadowMap,light"+l+"_2_ShadowMap,light"+l+"_3_ShadowMap,"+
								"light"+l+"_4_ShadowMap,light"+l+"_5_ShadowMap);\n";
		}		
	
		if (!x3dom.caps.FP_TEXTURES || x3dom.caps.MOBILE)	
			shader += 	"	shadowValue *= clamp(ESM(shadowMapValues.z, viewSampleDepth, light"+l+"_ShadowOffset), "+
						"				1.0 - light"+l+"_ShadowIntensity*lightInfluence, 1.0);\n";
		else
			shader += 	" 	shadowValue *= clamp(VSM(shadowMapValues.zy, viewSampleDepth, light"+l+"_ShadowOffset), "+
						"				1.0 - light"+l+"_ShadowIntensity*lightInfluence, 1.0);\n";				
		shader += 		"	}\n";
		
	}
					
	shader += 	"}\n" + 
                // In principle we should fix the place where this is multplied in instead
                // of overcompensating for the subsequent error from here. This way of doing
                // gamma correction explots the rule that (a*b)^x = a^x * b^x (x being the
                // gamma coefficient), i.e. the umbra is corrected for now, the penumbra
                // is incorrect and full light is zero here so unaffected as well.
				"	gl_FragColor = " + x3dom.shader.encodeGamma({}, "vec4(shadowValue, shadowValue, shadowValue, 1.0)") + ";\n" +
				"}\n";

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[ShadowRendering] FragmentShader " + gl.getShaderInfoLog(fragmentShader));		
	}
	
	return fragmentShader;
};
