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
					"varying vec2 depthTexCoord;\n" +
					"varying vec2 randomTexCoord;\n"+
					"uniform vec2 randomTextureTilingFactor;\n"+
					"\n" +
					"void main(void) {\n" +
					"    vec2 texCoord = (position.xy + 1.0) * 0.5;\n" +
					"    depthTexCoord = texCoord;\n" +
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
 * Returns the code for a function "getDepth(vec2 depthTexCoord)" that returns the linear depth.
 * It also introduces two uniform floats depthReconstructionConstantA and depthReconstructionConstantB,
 * which are needed for the depth reconstruction.
 */
x3dom.shader.SSAOShader.depthReconsructionFunctionCode = function()
{
	var code = 	"uniform float depthReconstructionConstantA;\n"+
				"uniform float depthReconstructionConstantB;\n";
	if (!x3dom.caps.FP_TEXTURES || x3dom.caps.MOBILE) 
		code += 	x3dom.shader.rgbaPacking();
		
	code+= 	"float getDepth(vec2 depthTexCoord) {\n"+
				"    vec4 col = texture2D(depthTexture, depthTexCoord);\n"+
				"    float d;\n";
	
	if (!x3dom.caps.FP_TEXTURES || x3dom.caps.MOBILE){
		code+="    d = unpackDepth(col);\n";
	} else {
		code+="    d = col.b;\n"
	}
	code+=    "    return depthReconstructionConstantB/(depthReconstructionConstantA+d);\n";
	code+=	"}\n";
	return code;
}

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
				"uniform float depthBufferEpsilon;\n"+
				"uniform vec3 samples[16];\n"+
				"varying vec2 depthTexCoord;\n" +
				"varying vec2 randomTexCoord;\n";

	shader += 	x3dom.shader.SSAOShader.depthReconsructionFunctionCode();
		
	shader+=	"void main(void) {\n" +
				"    float referenceDepth = getDepth(depthTexCoord);\n" +
				"    if(referenceDepth == 1.0)\n"+ //background
                "    {\n"+
                "        gl_FragColor = vec4(1.0,1.0,1.0, 1.0);\n"+
                "        return;\n"+
                "    }\n"+
				"    int numOcclusions = 0;\n"+
				"    for(int i = 0; i<16; ++i){\n"+
				"        float scale  = 1.0/referenceDepth;\n"+
				"        vec3 samplepos = reflect(samples[i],texture2D(randomTexture,randomTexCoord).xyz*2.0-vec3(1.0,1.0,1.0));\n"+
				"        float sampleDepth = getDepth(depthTexCoord+samplepos.xy*scale*radius);\n"+
				"        //if(abs(sampleDepth-referenceDepth)<=radius*(1.0/nearPlane))\n"+ //leads to bright halos
				"        if( sampleDepth < referenceDepth-depthBufferEpsilon) {\n"+
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

