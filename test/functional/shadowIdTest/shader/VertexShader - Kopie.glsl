attribute vec3 position;
attribute vec3 normal;
attribute vec3 color;

uniform vec3 bgCenter;           // position
uniform vec3 bgSize;             // size
uniform float bgPrecisionMax;    // 32767.0
uniform float bgPrecisionNorMax; // 127.0
//uniform float bgPrecisionColMax;

uniform mat4 modelViewMatrix;
uniform mat4 modelViewProjectionMatrix;
uniform mat4 normalMatrix;

varying vec3 fragNormal;
varying vec3 fragPosition;
varying vec4 fragColor;

void main() {
	vec3 vertPosition = bgCenter + bgSize * position.xyz / bgPrecisionMax;
    vec3 vertNormal = normal / bgPrecisionNorMax;

    fragNormal = (normalMatrix * vec4(vertNormal, 0.0)).xyz;
    fragPosition = (modelViewMatrix * vec4(vertPosition, 1.0)).xyz;
	//fragColor = vec4(color / bgPrecisionColMax, 1.0);

	gl_Position = modelViewProjectionMatrix * vec4(vertPosition, 1.0);

}