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
	shader+=	"    return mix(nearPlane,farPlane,d);\n";
	shader+=	"}\n";

		
	shader+=	"void main(void) {\n" +
 				"    samples[0] = vec3(0.05321558340367116,-0.1484831519915224,-0.2537120167549982);\n"+
 				"    samples[1] = vec3(0.8209238308831208,0.4621383772237,0.01420302717301758);\n"+
 				"    samples[2] = vec3(0.2824569505083492,-0.22548493941684122,0.26238855115619875);\n"+
 				"    samples[3] = vec3(-0.5511315197604212,0.7873317713765675,-0.11848608848470632);\n"+
 				"    samples[4] = vec3(-0.05512143428761074,-0.44097357355082223,-0.04131305212952752);\n"+
 				"    samples[5] = vec3(-0.8895590476182322,0.03845623743944615,0.3750465397944722);\n"+
 				"    samples[6] = vec3(0.4181054005990452,0.14877902084310146,-0.055753188334787485);\n"+
 				"    samples[7] = vec3(-0.20384359937237462,0.010926043056574963,0.5463411912474865);\n"+
 				"    samples[8] = vec3(0.6726079724246901,0.19781238642138366,0.33685113554538204);\n"+
 				"    samples[9] = vec3(0.33755603408988666,-0.2725971226642312,0.8241252431474626);\n"+
 				"    samples[10] = vec3(0.3614672194239865,-0.6537224237259849,0.029740097021131673);\n"+
 				"    samples[11] = vec3(0.40190333196049877,0.13003016094061248,-0.38019870745175965);\n"+
 				"    samples[12] = vec3(-0.038635611492950916,0.5256678612805712,0.35684153069140945);\n"+
 				"    samples[13] = vec3(-0.1528817138322467,0.6009893969064872,-0.1600424201092996);\n"+
 				"    samples[14] = vec3(0.810479517216903,-0.4531867678260544,0.1271270379069398);\n"+
 				"    samples[15] = vec3(-0.5474223108033605,-0.13473101761932615,0.5159944178424483);\n"+
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

