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
 
 
/*******************************************************************************
* Material
********************************************************************************/
 x3dom.shader.material = function() {
	var shaderPart = "uniform vec3  diffuseColor;\n" +
					 "uniform vec3  specularColor;\n" +
					 "uniform vec3  emissiveColor;\n" +
					 "uniform float shininess;\n" +
					 "uniform float transparency;\n" +
					 "uniform float ambientIntensity;\n";
					 
	return shaderPart;
};
						 
/*******************************************************************************
* Fog
********************************************************************************/						 
x3dom.shader.fog = function() {

	var shaderPart = "uniform vec3  fogColor;\n" +
					 "uniform float fogType;\n" +
					 "uniform float fogRange;\n" +
					 "varying vec3 fragEyePosition;\n" +
					 "float calcFog(in vec3 eye) {\n" +
					 "   float f0 = 0.0;\n" +      
					 "   if(fogType == 0.0) {\n" +
					 "       if(length(eye) < fogRange){\n" +
					 "           f0 = (fogRange-length(eye)) / fogRange;\n" +
					 "       }\n" +
					 "   }else{\n" +
					 "       if(length(eye) < fogRange){\n" +
					 "           f0 = exp(-length(eye) / (fogRange-length(eye) ) );\n" +
					 "       }\n" +
					 "   }\n" +
					 "   f0 = clamp(f0, 0.0, 1.0);\n" +
					 "   return f0;\n" +
					 "}\n";
					 
	return shaderPart;
};
					
/*******************************************************************************
* Shadow
********************************************************************************/
x3dom.shader.shadow = function() {
	var shaderPart = "";
		shaderPart += 	
					"vec4 packDepth(float depth){\n" +
					"	depth = (depth + 1.0)*0.5;\n" +
					"	vec4 outVal = vec4(1.0, 255.0, 65025.0, 160581375.0) * depth;\n" +
					"	outVal = fract(outVal);\n" +
					"  	outVal -= outVal.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0);\n" +
					"  	return outVal;\n" +
					"}\n";
		
		shaderPart += 	
					"float unpackDepth(vec4 color){\n" +
					"	float depth = dot(color, vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/160581375.0));\n" +
					"	return (2.0*depth - 1.0);\n" + 
					"}\n";
	return shaderPart;
};

x3dom.shader.shadowRendering = function(){
	//determine if and how much a given position is influenced by given light
	var shaderPart = "";
	shaderPart +=
				"float getLightInfluence(float lType, float lShadowIntensity, float lOn, vec3 lLocation, vec3 lDirection, " + 
				"float lCutOffAngle, float lBeamWidth, vec3 lAttenuation, float lRadius, vec3 viewCoords) {\n" +
				"	if (lOn == 0.0 || lShadowIntensity == 0.0){ return 0.0;\n" +
				"	} else if (lType == 0.0) {\n" +
				"		return 1.0;\n" +
				"	} else {\n" +
				"   	float attenuation = 0.0;\n" +
				"   	vec3 lightVec = (lLocation - (viewCoords));\n" +
				"   	float distance = length(lightVec);\n" +
				"		lightVec = normalize(lightVec);\n" +
				"		viewCoords = normalize(-viewCoords);\n" +
				"   	if(lRadius == 0.0 || distance <= lRadius) {\n" +
				"       	attenuation = 1.0 / max(lAttenuation.x + lAttenuation.y * distance + lAttenuation.z * (distance * distance), 1.0);\n" +
				"		}\n" +
				" 		if (lType == 1.0) return attenuation;\n" +
				"   	float spotAngle = acos(max(0.0, dot(-lightVec, normalize(lDirection))));\n" +
				"   	if(spotAngle >= lCutOffAngle) return 0.0;\n" +
				"   	else if(spotAngle <= lBeamWidth) return attenuation;\n" +
				"   	else return attenuation * (spotAngle - lCutOffAngle) / (lBeamWidth - lCutOffAngle);\n" +
				"	}\n" +
				"}\n";
	
	// get light space depth of view sample and all entries of the shadow map
	shaderPart += 	
				"void getShadowValues(inout vec4 shadowMapValues, inout float viewSampleDepth, in mat4 lightMatrix, in vec4 worldCoords, in sampler2D shadowMap){\n" +
				"	vec4 lightSpaceCoords = lightMatrix*worldCoords;\n" +
				"	vec3 lightSpaceCoordsCart = lightSpaceCoords.xyz / lightSpaceCoords.w;\n" +
				"	vec2 textureCoords = (lightSpaceCoordsCart.xy + 1.0)*0.5;\n" +
				"	viewSampleDepth = lightSpaceCoordsCart.z;\n" +	
				"	shadowMapValues = texture2D(shadowMap, textureCoords);\n";
	if (!x3dom.caps.FP_TEXTURES)
		shaderPart +=	"	shadowMapValues = vec4(1.0,1.0,unpackDepth(shadowMapValues),1.0);\n";
	shaderPart +="}\n";

	
	// get light space depth of view sample and all entries of the shadow map for point lights
	shaderPart += 	
				"void getShadowValuesPointLight(inout vec4 shadowMapValues, inout float viewSampleDepth, in vec3 lLocation, in vec4 worldCoords, in mat4 lightViewMatrix," +
				"in mat4 lMatrix_0, in mat4 lMatrix_1, in mat4 lMatrix_2, in mat4 lMatrix_3, in mat4 lMatrix_4, in mat4 lMatrix_5," +
				"in sampler2D shadowMap_0, in sampler2D shadowMap_1, in sampler2D shadowMap_2, in sampler2D shadowMap_3,"+
				"in sampler2D shadowMap_4, in sampler2D shadowMap_5){\n" +
				"	vec4 transformed = lightViewMatrix * worldCoords;\n" +
				"	vec3 lightVec = normalize(transformed.xyz/transformed.w);\n"+
				"	vec3 lightVecAbs = abs(lightVec);\n" +
				"	float maximum = max(max(lightVecAbs.x, lightVecAbs.y),lightVecAbs.z);\n" +
				"	if (lightVecAbs.x == maximum) {\n" +
				"		if (lightVec.x < 0.0) getShadowValues(shadowMapValues, viewSampleDepth, lMatrix_3,worldCoords,shadowMap_3);\n"+		//right
				"		else getShadowValues(shadowMapValues, viewSampleDepth, lMatrix_1,worldCoords,shadowMap_1);\n" +						//left
				"	}\n" +
				"	else if (lightVecAbs.y == maximum) {\n" +
				"		if (lightVec.y < 0.0) getShadowValues(shadowMapValues, viewSampleDepth, lMatrix_4,worldCoords,shadowMap_4);\n"+		//front
				"		else getShadowValues(shadowMapValues, viewSampleDepth, lMatrix_5,worldCoords,shadowMap_5);\n" +						//back
				"	}\n" +
				"	else if (lightVec.z < 0.0) getShadowValues(shadowMapValues, viewSampleDepth, lMatrix_0,worldCoords,shadowMap_0);\n"+	//bottom
				"	else getShadowValues(shadowMapValues, viewSampleDepth, lMatrix_2,worldCoords,shadowMap_2);\n" +							//top
				"}\n";	

	// get light space depth of view sample and all entries of the shadow map
	shaderPart += 	
				"void getShadowValuesCascaded(inout vec4 shadowMapValues, inout float viewSampleDepth, in vec4 worldCoords, in float viewDepth, in mat4 lMatrix_0, in mat4 lMatrix_1, in mat4 lMatrix_2,"+
				"in mat4 lMatrix_3, in mat4 lMatrix_4, in mat4 lMatrix_5, in sampler2D shadowMap_0, in sampler2D shadowMap_1, in sampler2D shadowMap_2,"+
				"in sampler2D shadowMap_3, in sampler2D shadowMap_4, in sampler2D shadowMap_5, in float split_0, in float split_1, in float split_2, in float split_3, in float split_4){\n" +
				"	if (viewDepth < split_0) getShadowValues(shadowMapValues, viewSampleDepth, lMatrix_0, worldCoords, shadowMap_0);\n" +
				"	else if (viewDepth < split_1) getShadowValues(shadowMapValues, viewSampleDepth, lMatrix_1, worldCoords, shadowMap_1);\n" +
				"	else if (viewDepth < split_2) getShadowValues(shadowMapValues, viewSampleDepth, lMatrix_2, worldCoords, shadowMap_2);\n" +
				"	else if (viewDepth < split_3) getShadowValues(shadowMapValues, viewSampleDepth, lMatrix_3, worldCoords, shadowMap_3);\n" +
				"	else if (viewDepth < split_4) getShadowValues(shadowMapValues, viewSampleDepth, lMatrix_4, worldCoords, shadowMap_4);\n" +
				"	else getShadowValues(shadowMapValues, viewSampleDepth, lMatrix_5, worldCoords, shadowMap_5);\n" +																
				"}\n";	
				
	shaderPart += 	
				"float ESM(float shadowMapDepth, float viewSampleDepth){\n";
	if (!x3dom.caps.FP_TEXTURES)
			shaderPart += 	"	return exp(-80.0*(viewSampleDepth - shadowMapDepth));\n";
	else 	shaderPart += 	"	return shadowMapDepth * exp(-80.0*(viewSampleDepth));\n";
	shaderPart +="}\n";						
	
	return shaderPart;
};


/*******************************************************************************
* Light
********************************************************************************/
x3dom.shader.light = function(numLights) {

	var shaderPart = "";

	for(var l=0; l<numLights; l++) {
		shaderPart += 	"uniform float light"+l+"_On;\n" +
						"uniform float light"+l+"_Type;\n" +
						"uniform vec3  light"+l+"_Location;\n" +
						"uniform vec3  light"+l+"_Direction;\n" +
						"uniform vec3  light"+l+"_Color;\n" +
						"uniform vec3  light"+l+"_Attenuation;\n" +
						"uniform float light"+l+"_Radius;\n" +
						"uniform float light"+l+"_Intensity;\n" +
						"uniform float light"+l+"_AmbientIntensity;\n" +
						"uniform float light"+l+"_BeamWidth;\n" +
						"uniform float light"+l+"_CutOffAngle;\n" +
						"uniform float light"+l+"_ShadowIntensity;\n";
	}
	
	shaderPart += 	"void lighting(in float lType, in vec3 lLocation, in vec3 lDirection, in vec3 lColor, in vec3 lAttenuation, " + 
					"in float lRadius, in float lIntensity, in float lAmbientIntensity, in float lBeamWidth, " +
					"in float lCutOffAngle, in vec3 N, in vec3 V, inout vec3 ambient, inout vec3 diffuse, " +
					"inout vec3 specular)\n" +
					"{\n" +
					"   vec3 L;\n" +
					"   float spot = 1.0, attentuation = 0.0;\n" +
					"   if(lType == 0.0) {\n" +
					"       L = -normalize(lDirection);\n" +
					"		V = normalize(V);\n" +
					"		attentuation = 1.0;\n" +
					"   } else{\n" +
					"       L = (lLocation - (-V));\n" +
					"       float d = length(L);\n" +
					"		L = normalize(L);\n" +
					"		V = normalize(V);\n" +
					"       if(lRadius == 0.0 || d <= lRadius) {\n" +
					"       	attentuation = 1.0 / max(lAttenuation.x + lAttenuation.y * d + lAttenuation.z * (d * d), 1.0);\n" +
					"		}\n" +
					"       if(lType == 2.0) {\n" +
					"           float spotAngle = acos(max(0.0, dot(-L, normalize(lDirection))));\n" +
					"           if(spotAngle >= lCutOffAngle) spot = 0.0;\n" +
					"           else if(spotAngle <= lBeamWidth) spot = 1.0;\n" +
					"           else spot = (spotAngle - lCutOffAngle ) / (lBeamWidth - lCutOffAngle);\n" +
					"       }\n" +
					"   }\n" +
					
					"   vec3  H = normalize( L + V );\n" +
					"   float NdotL = max(0.0, dot(L, N));\n" +
					"   float NdotH = max(0.0, dot(H, N));\n" +
					
					"   float ambientFactor  = lAmbientIntensity * ambientIntensity;\n" +
					"   float diffuseFactor  = lIntensity * NdotL;\n" +
					"   float specularFactor = lIntensity * pow(NdotH, shininess*128.0);\n" +
					"   ambient  += lColor * ambientFactor * attentuation * spot;\n" +
					"   diffuse  += lColor * diffuseFactor * attentuation * spot;\n" +
					"   specular += lColor * specularFactor * attentuation * spot;\n" +  
                    "}\n";
						
	return shaderPart;
};
