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
					"\n" +
					"void main(void) {\n" +
					"    vec2 texCoord = (position.xy + 1.0) * 0.5;\n" +
					"    fragTexCoord = texCoord;\n" +
					"    gl_Position = vec4(position.xy, 0.0, 1.0);\n" +
					"}\n";

	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shader);
    gl.compileShader(vertexShader);
		
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[FrontgroundTextureShader] VertexShader " + gl.getShaderInfoLog(vertexShader));		
	}
	
	return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.SSAOShader.prototype.generateFragmentShader = function(gl)
{
  var shader = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n";
  shader += "precision highp float;\n";
  shader += "#else\n";
  shader += " precision mediump float;\n";
  shader += "#endif\n\n";
  

	shader += "uniform sampler2D tex;\n" +
				"varying vec2 fragTexCoord;\n" +
				"\n";
	
	if (!x3dom.caps.FP_TEXTURES || x3dom.caps.MOBILE) 
		shader += 	x3dom.shader.rgbaPacking();
		
	shader+= 	"float getDepth(vec2 fragTexCoord) {\n"+
				"    vec4 col = texture2D(tex, fragTexCoord);\n";
	
	if (!x3dom.caps.FP_TEXTURES || x3dom.caps.MOBILE){
		shader+="    return unpackDepth(col);\n";
	} else {
		shader+="	 return col.b;\n"
	}
				
	shader+=	"}\n";
		
	shader+=	"void main(void) {\n" +
				"    float referenceDepth = getDepth(fragTexCoord);\n" +
				"    int numOcclusions = 0;\n"+
				"	 for(int i = -5; i <= 5; i++) {\n"+
				"        for(int j = -5; j <= 5; j++){\n"+
				"            float sampleDepth = getDepth(fragTexCoord+referenceDepth*0.0025*vec2(i,j));\n"+
				"            if( sampleDepth < referenceDepth) {\n"+
				"                ++numOcclusions;\n"+
				"            }\n"+
				"        }\n"+
				"	 }\n"+
				"    float r = 1.0-float(numOcclusions)/121.0;\n"+
				"    r*=2.0;\n"+
				"    gl_FragColor = vec4(r,r,r, 1.0);\n" +
				"}\n";

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[FrontgroundTextureShader] FragmentShader " + gl.getShaderInfoLog(fragmentShader));		
	}
	
	return fragmentShader;
};

