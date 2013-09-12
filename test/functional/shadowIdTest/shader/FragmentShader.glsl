#ifdef GL_ES
	precision highp float;
#endif

varying vec4 fragColor;


void main() {
	gl_FragColor = fragColor;
}
