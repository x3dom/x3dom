attribute vec3 position;
attribute vec3 normal;
attribute vec3 color;
attribute vec2 texcoord;			// texcoord.x -> id

uniform vec3 bgCenter;           // position
uniform vec3 bgSize;             // size
uniform float bgPrecisionMax;    // 32767.0
uniform float bgPrecisionNorMax; // 127.0
//uniform float bgPrecisionColMax;

uniform mat4 modelViewMatrix;
uniform mat4 modelViewProjectionMatrix;
uniform mat4 normalMatrix;


uniform float fieldPickId;
uniform float fieldPickIdListLength;
uniform vec3  fieldPickCol;

uniform sampler2D fieldRenderedTex;

varying vec3 fragNormal;
varying vec3 fragPosition;

varying vec4 fragColor;


bool isSelected(float id);

void main() {
	vec3 vertPosition = bgCenter + bgSize * position.xyz / bgPrecisionMax;
    vec3 vertNormal = normal / bgPrecisionNorMax;

    fragNormal = (normalMatrix * vec4(vertNormal, 0.0)).xyz;
    fragPosition = (modelViewMatrix * vec4(vertPosition, 1.0)).xyz;
	//fragColor = vec4(color / bgPrecisionColMax, 1.0);

	gl_Position = modelViewProjectionMatrix * vec4(vertPosition, 1.0);


    vec3 color = vec3(0.0, 0.0, 0.0);

    if(!isSelected(texcoord.x)){
        float id = texcoord.x;

        // (32)^(1/3) = 3,2 -> 4 colors per chanel
        // better with modulo operations
        float x = 0.0;
        id += 0.1;
        for (float r = 0.25; r < 1.0; r += 0.25) {
            for (float g = 0.0; g < 1.0; g += 0.25) {
                for (float b = 0.0; b < 1.0; b += 0.25) {
                    if(x < id){
                        color = vec3(1.0 - r, 1.0 - g, 1.0 - b);
                    }
                    x++;
                }
            }
        }
    }
    else {
        color = fieldPickCol;
    }

    //float pixel = 1.0 / 16.0;
    //float startPixel = pixel / 2.0;
    //color = texture2D(fieldRenderedTex, vec2(startPixel + pixel * 0.0, startPixel + pixel * 0.0)).xyz;

    fragColor = vec4(color, 1.0);
}


// **** CHECK IF THIS VERTEX IS IN THE CURRENT SELECTION (TO BE MODIFIED) ****
    // index 0 dose not work
bool isSelected(float id) {
    if(id - 0.5 < fieldPickId && fieldPickId < id + 0.5){
        return true;
    }


    float pickId = -1.0;
    vec4 texId = vec4(-1.0);

    float pixel = 1.0 / 16.0;
    float startPixel = pixel / 2.0;

    for (float i = 0.0; i < 11.0; i++){
        texId = texture2D(fieldRenderedTex, vec2(startPixel + pixel * i, startPixel + pixel * 0.0));

        pickId = texId.x * 256.0;
        if(id - 0.5 < pickId && pickId < id + 0.5){
            return true;
        }
    }



	return false;
}
