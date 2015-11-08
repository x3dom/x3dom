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
 * TwoSidedMaterial
 ********************************************************************************/
x3dom.shader.twoSidedMaterial = function() {
    var shaderPart = "uniform vec3  backDiffuseColor;\n" +
                     "uniform vec3  backSpecularColor;\n" +
                     "uniform vec3  backEmissiveColor;\n" +
                     "uniform float backShininess;\n" +
                     "uniform float backTransparency;\n" +
                     "uniform float backAmbientIntensity;\n";

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
 * Clipplane
 ********************************************************************************/
x3dom.shader.clipPlanes = function(numClipPlanes) {
    var shaderPart = "", c;

    for(c=0; c<numClipPlanes; c++) {
        shaderPart += 	"uniform vec4 clipPlane"+c+"_Plane;\n";
        shaderPart += 	"uniform float clipPlane"+c+"_CappingStrength;\n";
        shaderPart += 	"uniform vec3 clipPlane"+c+"_CappingColor;\n";
    }

    shaderPart += "vec3 calculateClipPlanes() {\n";

    for(c=0; c<numClipPlanes; c++) {
        shaderPart += "    vec4 clipPlane" + c + " = clipPlane" + c + "_Plane * viewMatrixInverse;\n";
        shaderPart += "    float dist" + c + " = dot(fragPosition, clipPlane" + c + ");\n";
    }

    shaderPart += "    if( ";

    for(c=0; c<numClipPlanes; c++) {
        if(c!=0) {
            shaderPart += " || ";
        }
        shaderPart += "dist" + c + " < 0.0" ;
    }

    shaderPart += " ) ";
    shaderPart += "{ discard; }\n";

    for (c = 0; c < numClipPlanes; c++) {
        shaderPart += "    if( abs(dist" + c + ") < clipPlane" + c + "_CappingStrength ) ";
        shaderPart += "{ return clipPlane" + c + "_CappingColor; }\n";
    }

    shaderPart += "    return vec3(-1.0, -1.0, -1.0);\n";

    shaderPart += "}\n";

    return shaderPart;
};

/*******************************************************************************
* Gamma correction support: initial declaration
********************************************************************************/
x3dom.shader.gammaCorrectionDecl = function(properties) {
	var shaderPart = "";
    if (properties.GAMMACORRECTION === "none") {
        // do not emit any declaration. 1.0 shall behave 'as without gamma'.
    } else if (properties.GAMMACORRECTION === "fastlinear") {
        // This is a slightly optimized gamma correction
        // which uses a gamma of 2.0 instead of 2.2. Gamma 2.0 is less costly
        // to encode in terms of cycles as sqrt() is usually optimized
        // in hardware.
        shaderPart += "vec4 gammaEncode(vec4 color){\n" +
                      "  vec4 tmp = sqrt(color);\n" +
                      "  return vec4(tmp.rgb, color.a);\n" +
                      "}\n";

        shaderPart += "vec4 gammaDecode(vec4 color){\n" +
                      "  vec4 tmp = color * color;\n" +
                      "  return vec4(tmp.rgb, color.a);\n" +
                      "}\n";

        shaderPart += "vec3 gammaEncode(vec3 color){\n" +
                      "  return sqrt(color);\n" +
                      "}\n";

        shaderPart += "vec3 gammaDecode(vec3 color){\n" +
                      "  return (color * color);\n" +
                      "}\n";
    } else {
        // The preferred implementation compensating for a gamma of 2.2, which closely
        // follows sRGB; alpha remains linear
        // minor opt: 1.0 / 2.2 = 0.4545454545454545
        shaderPart += "const vec4 gammaEncode4Vector = vec4(0.4545454545454545, 0.4545454545454545, 0.4545454545454545, 1.0);\n";
        shaderPart += "const vec4 gammaDecode4Vector = vec4(2.2, 2.2, 2.2, 1.0);\n";

        shaderPart += "vec4 gammaEncode(vec4 color){\n" +
                      "    return pow(color, gammaEncode4Vector);\n" +
                      "}\n";

        shaderPart += "vec4 gammaDecode(vec4 color){\n" +
                      "    return pow(color, gammaDecode4Vector);\n" +
                      "}\n";

        // RGB; minor opt: 1.0 / 2.2 = 0.4545454545454545
        shaderPart += "const vec3 gammaEncode3Vector = vec3(0.4545454545454545, 0.4545454545454545, 0.4545454545454545);\n";
        shaderPart += "const vec3 gammaDecode3Vector = vec3(2.2, 2.2, 2.2);\n";

        shaderPart += "vec3 gammaEncode(vec3 color){\n" +
                      "    return pow(color, gammaEncode3Vector);\n" +
                      "}\n";

        shaderPart += "vec3 gammaDecode(vec3 color){\n" +
                      "    return pow(color, gammaDecode3Vector);\n" +
                      "}\n";
    }
	return shaderPart;
};

/*******************************************************************************
* Gamma correction support: encoding and decoding of given expressions
* 
* Unlike other shader parts these javascript functions wrap the same-named gamma
* correction shader functions (if applicable). When gamma correction is  not used,
* the expression will be returned verbatim. Consequently, any terminating semicolon
* is to be issued by the caller.
********************************************************************************/
x3dom.shader.encodeGamma = function(properties, expr) {
    if (properties.GAMMACORRECTION === "none") {
        // Naive implementation: no-op, return verbatim
        return expr;
    } else {
        // The 2.0 and 2.2 cases are transparent at the call site
        return "gammaEncode (" + expr + ")";
    }
};

x3dom.shader.decodeGamma = function(properties, expr) {
    if (properties.GAMMACORRECTION === "none") {
        // Naive implementation: no-op, return verbatim
        return expr;
    } else {
        // The 2.0 and 2.2 cases are transparent at the call site
        return "gammaDecode (" + expr + ")";
    }
};

/*******************************************************************************
* Shadow
********************************************************************************/
x3dom.shader.rgbaPacking = function() {
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
				"float lCutOffAngle, float lBeamWidth, vec3 lAttenuation, float lRadius, vec3 eyeCoords) {\n" +
				"	if (lOn == 0.0 || lShadowIntensity == 0.0){ return 0.0;\n" +
				"	} else if (lType == 0.0) {\n" +
				"		return 1.0;\n" +
				"	} else {\n" +
				"   	float attenuation = 0.0;\n" +
				"   	vec3 lightVec = (lLocation - (eyeCoords));\n" +
				"   	float distance = length(lightVec);\n" +
				"		lightVec = normalize(lightVec);\n" +
				"		eyeCoords = normalize(-eyeCoords);\n" +
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
	if (!x3dom.caps.FP_TEXTURES  || x3dom.caps.MOBILE)
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
				"void getShadowValuesCascaded(inout vec4 shadowMapValues, inout float viewSampleDepth, in vec4 worldCoords, in float eyeDepth, in mat4 lMatrix_0, in mat4 lMatrix_1, in mat4 lMatrix_2,"+
				"in mat4 lMatrix_3, in mat4 lMatrix_4, in mat4 lMatrix_5, in sampler2D shadowMap_0, in sampler2D shadowMap_1, in sampler2D shadowMap_2,"+
				"in sampler2D shadowMap_3, in sampler2D shadowMap_4, in sampler2D shadowMap_5, in float split_0, in float split_1, in float split_2, in float split_3, in float split_4){\n" +
				"	if (eyeDepth < split_0) getShadowValues(shadowMapValues, viewSampleDepth, lMatrix_0, worldCoords, shadowMap_0);\n" +
				"	else if (eyeDepth < split_1) getShadowValues(shadowMapValues, viewSampleDepth, lMatrix_1, worldCoords, shadowMap_1);\n" +
				"	else if (eyeDepth < split_2) getShadowValues(shadowMapValues, viewSampleDepth, lMatrix_2, worldCoords, shadowMap_2);\n" +
				"	else if (eyeDepth < split_3) getShadowValues(shadowMapValues, viewSampleDepth, lMatrix_3, worldCoords, shadowMap_3);\n" +
				"	else if (eyeDepth < split_4) getShadowValues(shadowMapValues, viewSampleDepth, lMatrix_4, worldCoords, shadowMap_4);\n" +
				"	else getShadowValues(shadowMapValues, viewSampleDepth, lMatrix_5, worldCoords, shadowMap_5);\n" +																
				"}\n";	
				
	shaderPart += 	
				"float ESM(float shadowMapDepth, float viewSampleDepth, float offset){\n";
	if (!x3dom.caps.FP_TEXTURES || x3dom.caps.MOBILE)
			shaderPart += 	"	return exp(-80.0*(1.0-offset)*(viewSampleDepth - shadowMapDepth));\n";
	else 	shaderPart += 	"	return shadowMapDepth * exp(-80.0*(1.0-offset)*viewSampleDepth);\n";
	shaderPart +="}\n";	


	shaderPart += 	
				"float VSM(vec2 moments, float viewSampleDepth, float offset){\n"+
				"	viewSampleDepth = (viewSampleDepth + 1.0) * 0.5;\n" +
				"	if (viewSampleDepth <= moments.x) return 1.0;\n" +
				"	float variance = moments.y - moments.x * moments.x;\n" +
				"	variance = max(variance, 0.00002 + offset*0.01);\n" +
				"	float d = viewSampleDepth - moments.x;\n" +
				"	return variance/(variance + d*d);\n" +
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
	
	shaderPart += 	"vec3 lighting(in float lType, in vec3 lLocation, in vec3 lDirection, in vec3 lColor, in vec3 lAttenuation, " +
					"in float lRadius, in float lIntensity, in float lAmbientIntensity, in float lBeamWidth, " +
					"in float lCutOffAngle, in vec3 N, in vec3 V, float shin, float ambIntensity)\n" +
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
					"   float NdotL = clamp(dot(L, N), 0.0, 1.0);\n" +
					"   float NdotH = clamp(dot(H, N), 0.0, 1.0);\n" +
					
					"   float ambientFactor  = lAmbientIntensity * ambIntensity;\n" +
					"   float diffuseFactor  = lIntensity * NdotL;\n" +
					"   float specularFactor = lIntensity * pow(NdotH, shin*128.0);\n" +
                    "   return vec3(ambientFactor, diffuseFactor, specularFactor) * attentuation * spot;\n" +
					//"   ambient  += lColor * ambientFactor * attentuation * spot;\n" +
					//"   diffuse  += lColor * diffuseFactor * attentuation * spot;\n" +
					//"   specular += lColor * specularFactor * attentuation * spot;\n" +
                    "}\n";
						
	return shaderPart;
};

/*******************************************************************************
 * cotangent_frame
 ********************************************************************************/
x3dom.shader.TBNCalculation = function() {
    var shaderPart = "";

    shaderPart += "mat3 cotangent_frame(vec3 N, vec3 p, vec2 uv)\n" +
        "{\n" +
        "    // get edge vectors of the pixel triangle\n" +
        "    vec3 dp1 = dFdx( p );\n" +
        "    vec3 dp2 = dFdy( p );\n" +
        "    vec2 duv1 = dFdx( uv );\n" +
        "    vec2 duv2 = dFdy( uv );\n" +
        "\n" +
        "    // solve the linear system\n" +
        "    vec3 dp2perp = cross( dp2, N );\n" +
        "    vec3 dp1perp = cross( N, dp1 );\n" +
        "    vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;\n" +
        "    vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;\n" +
        "\n" +
        "    // construct a scale-invariant frame\n" +
        "    float invmax = inversesqrt( max( dot(T,T), dot(B,B) ) );\n" +
        "    return mat3( T * invmax, B * invmax, N );\n" +
        "}\n\n";

    shaderPart += "vec3 perturb_normal( vec3 N, vec3 V, vec2 texcoord )\n" +
        "{\n" +
        "    // assume N, the interpolated vertex normal and\n" +
        "    // V, the view vector (vertex to eye)\n" +
        "    vec3 map = texture2D(normalMap, texcoord ).xyz;\n" +
		"    map = 2.0 * map - 1.0;\n" +
        "    mat3 TBN = cotangent_frame(N, -V, texcoord);\n" +
        "    return normalize(TBN * map);\n" +
        "}\n\n";

    return shaderPart;
};
