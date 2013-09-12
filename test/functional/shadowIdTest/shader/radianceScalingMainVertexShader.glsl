attribute vec3 position;
attribute vec3 normal;
attribute vec3 color;

uniform mat4 modelViewMatrix;
uniform mat4 modelViewProjectionMatrix;

uniform vec3 fieldAmbient;
uniform vec3 fieldSpecular;
uniform vec3 fieldDiffuse;

uniform float fieldAmbientIntensity;
uniform float fieldIntensity;

uniform vec3  light0_Color;
uniform vec3  light0_Location;
uniform vec3  light0_Direction;
uniform float light0_Intensity;
uniform float light0_AmbientIntensity;

varying vec3 fragEyeVec;
varying vec3 fragLightVec;

varying vec3 fragLightAmbient;
varying vec3 fragLightIntensity;
varying vec3 fragMatDiffuse;
varying vec3 fragMatSpecular;

varying vec3 fragHalfVec;
varying vec4 fragRendTexCoord;
varying vec3 fragNormal;
varying vec4 fragColor;

uniform vec3 bgCenter;
uniform vec3 bgSize;
uniform float bgPrecisionMax;
uniform float bgPrecisionNorMax;
uniform float bgPrecisionColMax;

void main() {
	vec3 pos = bgCenter + bgSize * position / bgPrecisionMax;
	fragNormal = normal / bgPrecisionNorMax;
	fragColor = vec4(color / bgPrecisionColMax, 1.0);

	fragLightAmbient    = light0_Color * light0_AmbientIntensity;
	fragLightIntensity  = light0_Color * light0_Intensity;
	fragMatDiffuse      = vec3(1.0);	// need to be read from the material but is not supplied in this model
	fragMatSpecular     = vec3(1.0);	// need to be read from the material but is not supplied in this model

	vec3 posEC = (modelViewMatrix * vec4(pos, 1.0)).xyz;
	fragEyeVec = -posEC;
	fragLightVec = light0_Location - posEC;
	fragHalfVec = (fragLightVec + fragEyeVec) / length(fragLightVec + fragEyeVec);

	fragRendTexCoord = modelViewProjectionMatrix * vec4(pos, 1.0);

	gl_Position = fragRendTexCoord;
}