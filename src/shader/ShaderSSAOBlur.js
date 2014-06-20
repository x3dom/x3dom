/**
 * Generate the final ShadowShader program
 */
x3dom.shader.SSAOBlurShader = function(gl)
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
x3dom.shader.SSAOBlurShader.prototype.generateVertexShader = function(gl)
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
		x3dom.debug.logError("[SSAOShader] VertexShader " + gl.getShaderInfoLog(vertexShader));		
	}
	
	return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.SSAOBlurShader.prototype.generateFragmentShader = function(gl)
{
  var shader = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n";
  shader += "precision highp float;\n";
  shader += "#else\n";
  shader += " precision mediump float;\n";
  shader += "#endif\n\n";
  

	shader += "uniform sampler2D tex;\n" +
		  "varying vec2 fragTexCoord;\n";

		
	shader+=	"void main(void) {\n" +
"float sum = 0.0;\n"+
"for(int i = -2; i<2;i++){\n"+
"    for(int j = -2; j<2;j++){\n"+
"        sum+= texture2D(tex,fragTexCoord+vec2(1.0/800.0*float(i),1.0/800.0*float(j))).r;}}\n"+
				"    gl_FragColor = vec4(sum/16.0,sum/16.0,sum/16.0,1.0);\n"+
				"}\n";

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[SSAOhader] FragmentShader " + gl.getShaderInfoLog(fragmentShader));		
	}
	
	return fragmentShader;
};

