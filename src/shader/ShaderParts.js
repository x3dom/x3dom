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
					 "}";
					 
	return shaderPart;
};
					
/*******************************************************************************
* Shadow
********************************************************************************/
x3dom.shader.shadow = function() {

	var shaderPart =    "uniform sampler2D sh_tex;\n" +
						"varying vec4 projCoord;\n" +
						"float PCF_Filter(float lShadowIntensity, vec3 projectiveBiased, float filterWidth)\n" +
						"{" +
						"    float stepSize = 2.0 * filterWidth / 3.0;\n" +
						"    float blockerCount = 0.0;\n" +
						"    projectiveBiased.x -= filterWidth;\n" +
						"    projectiveBiased.y -= filterWidth;\n" +
						"    for (float i=0.0; i<3.0; i++)\n" +
						"    {\n" +
						"        for (float j=0.0; j<3.0; j++)\n" +
						"        {\n" +
						"            projectiveBiased.x += (j*stepSize);\n" +
						"            projectiveBiased.y += (i*stepSize);\n" +
						"            vec4 zCol = texture2D(sh_tex, (1.0+projectiveBiased.xy)*0.5);\n";
                            
	if (!x3dom.caps.FP_TEXTURES) {
		shaderPart +=   "            float fromFixed = 256.0 / 255.0;\n" +
						"            float z = zCol.r * fromFixed;\n" +
						"            z += zCol.g * fromFixed / (255.0);\n" +
						"            z += zCol.b * fromFixed / (255.0 * 255.0);\n" +
						"            z += zCol.a * fromFixed / (255.0 * 255.0 * 255.0);\n";
	}
	else {
		shaderPart +=   "            float z = zCol.b;\n";
	}
                            
	shaderPart +=       "            if (z < projectiveBiased.z) blockerCount += 1.0;\n" +
						"            projectiveBiased.x -= (j*stepSize);\n" +
						"            projectiveBiased.y -= (i*stepSize);\n" +
						"        }\n" +
						"    }" +
						"    float result = 1.0 - lShadowIntensity * blockerCount / 9.0;\n" +
						"    return result;\n" +
						"}\n";
						
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
					" 			   in float lRadius, in float lIntensity, in float lAmbientIntensity, in float lBeamWidth, " +
					" 			   in float lCutOffAngle, in vec3 N, in vec3 V, inout vec3 ambient, inout vec3 diffuse, " +
					"			   inout vec3 specular) {" +
					"   vec3 L;\n" +
					"   float spot = 1.0, attentuation = 0.0;\n" +
					"   if(lType == 0.0) {\n" +
					"       L = -normalize(lDirection);\n" +
					"		V = normalize(V);\n" +
					"		attentuation = 1.0;\n" +
					"   }else{\n" +
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
					"   float diffuseFactor  = lIntensity * NdotL;" +
					"   float specularFactor = lIntensity * NdotL * pow(NdotH, shininess*128.0);\n" +
					"   ambient  += lColor * ambientFactor * attentuation * spot;\n" +
					"   diffuse  += lColor * diffuseFactor * attentuation * spot;\n" +
					"   specular += lColor * specularFactor * attentuation * spot;\n" +  
                    "}\n";
						
	return shaderPart;
};