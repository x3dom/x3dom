#ifdef GL_ES
	precision highp float;
#endif

varying vec3 fragEyeVec;
varying vec3 fragLightVec;
varying vec3 fragHalfVec;
varying vec3 fragNormal;


varying vec3 fragLightAmbient;
varying vec3 fragLightIntensity;
varying vec3 fragMatDiffuse;
varying vec3 fragMatSpecular;

varying vec4 fragRendTexCoord;

varying vec4 fragColor;

uniform sampler2D 	tex;

uniform float       fieldSpecularPower;			// ist das shinynes?
uniform float       fieldAlpha;
uniform float       fieldGamma;


float curvature(vec2 proj);
float scaled(in float impfunc,in float beta);
vec4 blinnPhong(in vec3 norm, in vec3 lightDir, in vec3 eyeDir);

void main() {
	vec3 eye      = normalize( fragEyeVec );		// im Objectspace
	vec3 lightDir = normalize( fragLightVec );	// im Objectspace

	vec2 proj = fragRendTexCoord.xy / fragRendTexCoord.w;
	proj = (1.0 + proj) / 2.0;
	vec3 normal = texture2D(tex, proj).xyz * 2.0 - 1.0;


	vec4 phongCol = blinnPhong(normal, lightDir, eye);	
	vec4 color = fragColor * (phongCol +  scaled(length(phongCol.xyz), curvature(proj)) );
	float scale = scaled(length(phongCol.xyz), curvature(proj));
	//color = vec4(scale, scale, scale, 1.0);
	//gl_FragColor = fragColor * phongCol;
	gl_FragColor = color;
}

// **** PHONG ****
vec4 blinnPhong(in vec3 norm, in vec3 lightDir, in vec3 eyeDir){
	vec4  fvTotalAmbient  = vec4(fragLightAmbient, 1.0);

	float nDotL           = dot( norm, lightDir );
	vec4  fvTotalDiffuse  = vec4(fragMatDiffuse * fragLightIntensity * max(nDotL, 0.0), 1.0);

	vec3  h               = normalize(lightDir + eyeDir);
	float nDotH           = dot(norm, h);
	vec4  fvTotalSpecular = vec4(fragMatSpecular * fragLightIntensity, 1.0) * ( pow( max(nDotH, 0.0), fieldSpecularPower ) );

	return fvTotalAmbient + fvTotalDiffuse + fvTotalSpecular;
}




// **** SCALING FUNCTION ****
float scaled(in float delta,in float kappa) {
	float k = sign(kappa) * pow(kappa, 1.0 / fieldGamma);
	return delta * k * (fieldAlpha * 2.0 - 1.0);
}
/*
float scaled(in float delta,in float kappa) {
	float alpha = clamp(fieldAlpha, 0.0001, 0.9999);
	float expbeta  = exp(-kappa * fieldGamma);
	float aexpbeta = alpha * expbeta;
	return (aexpbeta+delta*(1.0 - alpha - aexpbeta)) /
		   (alpha + delta * (expbeta - alpha - aexpbeta));
}
*/
							
// **** CURVATURE CALCULATION ****
float curvature(vec2 proj) {
	float size = 1.0 / 1024.0;
	// | |n| |		// original ist anders !! das ist der normalenvector nicht die kruemmung!!!
	// |w|x|e|
	// | |s| |

	float e = texture2D(tex, vec2(proj.x + size, proj.y)).x * 2.0 - 1.0;
	float w = texture2D(tex, vec2(proj.x - size, proj.y)).x * 2.0 - 1.0;
	float n = texture2D(tex, vec2(proj.x, proj.y + size)).y * 2.0 - 1.0;
	float s = texture2D(tex, vec2(proj.x, proj.y - size)).y * 2.0 - 1.0;

	float erg = s - n + w - e;
	//if(erg < -0.98 || erg > 0.98) { erg = 0.0; }

	return 0.25 * erg;
}
