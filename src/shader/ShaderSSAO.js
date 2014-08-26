/**
 * Generate the final ShadowShader program
 */
x3dom.shader.SSAOShader = function(gl)
{
	this.program = gl.createProgram();
	
	var vertexShader 	= this.generateVertexShader(gl);
	var fragmentShader 	= this.generateFragmentShader(gl);
	
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
x3dom.shader.SSAOShader.prototype.generateVertexShader = function(gl)
{
	var shader = 	"attribute vec3 position;\n" +
					"varying vec2 fragTexCoord;\n" +
					"varying vec2 randomTexCoord;\n"+
					"uniform vec2 randomTextureTilingFactor;\n"+
					"\n" +
					"void main(void) {\n" +
					"    vec2 texCoord = (position.xy + 1.0) * 0.5;\n" +
					"    fragTexCoord = texCoord;\n" +
					"	 randomTexCoord = randomTextureTilingFactor*texCoord;\n"+
					"    gl_Position = vec4(position.xy, 0.0, 1.0);\n" +
					"}\n";

	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shader);
    gl.compileShader(vertexShader);
		
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[SSAOShader] VertexShader " + gl.getShaderInfoLog(vertexShader));		
	}
	
	return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.SSAOShader.prototype.generateFragmentShader = function(gl)
{
  var shader = 	"#ifdef GL_FRAGMENT_PRECISION_HIGH\n";
  shader += 	"precision highp float;\n";
  shader += 	"#else\n";
  shader += 	" precision mediump float;\n";
  shader += 	"#endif\n\n";

	shader += 	"uniform sampler2D depthTexture;\n" +
				"uniform sampler2D randomTexture;\n"+
				"uniform float nearPlane;\n"+
				"uniform float farPlane;\n"+
				"uniform float radius;\n"+
				"varying vec2 fragTexCoord;\n" +
				"varying vec2 randomTexCoord;\n"+
				"\n"+
				"vec3 samples[16];\n";// = vec3[]( vec3(0.25166067217123755,0.13077722880292653,-0.47842480208047955), vec3(0.1336390011607076,0.23139745222339658,0.4709501590616245), vec3(-0.19051150018588014,0.6328770569503113,0.5266116404428918), vec3(-0.46385667289008925,0.34936580309717313,0.7532159792668025), vec3(0.04965137195031821,0.33038286809402595,0.6204585133133012), vec3(0.6629761573815169,-0.2059003026677475,-0.060087399946977316), vec3(0.8127750013391202,0.3503059975577929,-0.13902848335602092), vec3(0.7785122585974273,-0.02526342203464771,0.6027046154401532) );\n";
	
	if (!x3dom.caps.FP_TEXTURES || x3dom.caps.MOBILE) 
		shader += 	x3dom.shader.rgbaPacking();
		
	shader+= 	"float getDepth(vec2 fragTexCoord) {\n"+
				"    vec4 col = texture2D(depthTexture, fragTexCoord);\n"+
				"    float d;\n";
	
	if (!x3dom.caps.FP_TEXTURES || x3dom.caps.MOBILE){
		shader+="    d = unpackDepth(col);\n";
	} else {
		shader+="    d = col.b;\n"
	}	
	shader+=    "    float a = (farPlane+nearPlane)/(nearPlane-farPlane);\n"
	shader+=    "    float b = (2.0*farPlane*nearPlane)/(nearPlane-farPlane);\n"
	shader+=    "    d = b/(a+d);\n"
	shader+=	"    return d;//mix(nearPlane,farPlane,d);\n";
	shader+=	"}\n";

		
	shader+=	"void main(void) {\n" +
				"    samples[0] = vec3(0.03800223814729654,0.10441029119843426,0.39953456286640554);\n"+
				"    samples[1] = vec3(-0.03800223814729654,-0.10441029119843426,-0.39953456286640554);\n"+
				"    samples[2] = vec3(-0.17023209847088397,0.1428416910414532,0.26276184289416693);\n"+
				"    samples[3] = vec3(0.17023209847088397,-0.1428416910414532,-0.26276184289416693);\n"+
				"    samples[4] = vec3(-0.288675134594813,-0.16666666666666646,0.034013126463970034);\n"+
				"    samples[5] = vec3(0.288675134594813,0.16666666666666646,-0.034013126463970034);\n"+
				"    samples[6] = vec3(0.07717696785196887,-0.43769233467209245,0.5399550311629946);\n"+
				"    samples[7] = vec3(-0.07717696785196887,0.43769233467209245,-0.5399550311629946);\n"+
				"    samples[8] = vec3(0.5471154183401156,-0.09647120981496134,-0.7739778114115472);\n"+
				"    samples[9] = vec3(-0.5471154183401156,0.09647120981496134,0.7739778114115472);\n"+
				"    samples[10] = vec3(0.3333333333333342,0.5773502691896253,-0.4254346075746447);\n"+
				"    samples[11] = vec3(-0.3333333333333342,-0.5773502691896253,0.4254346075746447);\n"+
				"    samples[12] = vec3(-0.49994591864508653,0.5958123446480936,0.5129126360239229);\n"+
				"    samples[13] = vec3(0.49994591864508653,-0.5958123446480936,-0.5129126360239229);\n"+
				"    samples[14] = vec3(-0.8352823295874743,-0.3040179051783715,-0.18003418237922397);\n"+
				"    samples[15] = vec3(0.8352823295874743,0.3040179051783715,0.18003418237922397);\n"+
				"    float referenceDepth = getDepth(fragTexCoord);\n" +
				"    if(referenceDepth == 1.0)\n"+ //background
                "    {\n"+
                "        gl_FragColor = vec4(1.0,1.0,1.0, 1.0);\n"+
                "        return;\n"+
                "    }\n"+
				"    int numOcclusions = 0;\n"+
				//"    const float scale = 0.005;\n"+
				"    for(int i = 0; i<16; ++i){\n"+
				"        vec3 samplepos = reflect(samples[i],texture2D(randomTexture,randomTexCoord).xyz*2.0-vec3(1.0,1.0,1.0));\n"+
				"        float sampleDepth = getDepth(fragTexCoord+samplepos.xy*radius*float(i));\n"+
				"        if( sampleDepth < referenceDepth) {\n"+
				"            ++numOcclusions;\n"+
				"        }\n"+
				"    }\n"+
				"    float r = 1.0-float(numOcclusions)/16.0;\n"+
				"    r*=2.0;\n"+
				"    gl_FragColor = vec4(r,r,r, 1.0);\n" +
				"}\n";

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[SSAOhader] FragmentShader " + gl.getShaderInfoLog(fragmentShader));		
	}
	
	return fragmentShader;
};

