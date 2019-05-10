/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/**
 * Generate the final Shader program
 */
x3dom.shader.PBRMaterialShader = function(gl, properties)
{
	this.program = gl.createProgram();
	
	var vertexShader   = this.generateVertexShader(gl, properties);
	var fragmentShader = this.generateFragmentShader(gl, properties);
	
	gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    
    // optional, but position should be at location 0 for performance reasons
    //gl.bindAttribLocation(this.program, 0, "position");
    
	gl.linkProgram(this.program);
	
	return this.program;
};

/**
 * Generate the vertex shader
 */
x3dom.shader.PBRMaterialShader.prototype.generateVertexShader = function(gl, properties)
{
	var shader =    "attribute vec3 position;"+
                    "attribute vec3 normal;"+
                    "attribute vec2 texcoord;"+
                    "attribute vec4 tangent;"+
                    "uniform mat4 normalMatrix;\n"+
                    "uniform mat4 modelViewProjectionMatrix;\n"+
                    "varying vec2 fragTexcoord;\n"+
                    "varying vec3 fragNormal;\n"+
                    "varying vec3 fragTangent;\n"+
                    "varying vec3 fragBitangent;\n"+

                    "void main(void) {\n" +
                    "   fragTexcoord = texcoord;\n" +
                    "   vec3 bitangent = cross(normal, tangent.xyz);\n" +
                    "   fragBitangent = (normalMatrix * vec4(bitangent, 0.0)).xyz;\n" +
                    "   fragNormal = (normalMatrix * vec4(normal, 0.0)).xyz;\n" +
                    "   fragTangent = (normalMatrix * vec4(tangent.xyz, 0.0)).xyz;\n" +
                    "   gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);\n" +
                    "}\n";

	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shader);
    gl.compileShader(vertexShader);
		
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[PBRMaterialShader] VertexShader " + gl.getShaderInfoLog(vertexShader));
	}
	
	return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.PBRMaterialShader.prototype.generateFragmentShader = function(gl, properties)
{
    var shader = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n";
    shader += "precision highp float;\n";
    shader += "#else\n";
    shader += " precision mediump float;\n";
    shader += "#endif\n\n";

    if(properties.USE_BASECOLOR_TEX)
    {
        shader += "uniform sampler2D baseColorTex;\n";
    }

    if(properties.USE_METALLIC_TEX)
    {
        shader += "uniform sampler2D metallicTex;\n";
    }

    if(properties.USE_ROUGHNESS_TEX)
    {
        shader += "uniform sampler2D roughnessTex;\n";
    }

    if(properties.USE_NORMAL_TEX)
    {
        shader += "uniform sampler2D normalTex;\n";
    }

    if(properties.USE_OCCLUSION_TEX)
    {
        shader += "uniform sampler2d occlusionTex;\n";
    }

    shader += "uniform vec4 baseColorFactor;\n";
    shader += "uniform float metallicFactor;\n";
    shader += "uniform float roughnessFactor;\n";

    shader += "varying vec2 fragTexcoord;\n";
    shader += "varying vec3 fragTangent;\n";
    shader += "varying vec3 fragBitangent;\n";
    shader += "varying vec3 fragNormal;\n";


    shader += "void main(void) {\n";
    shader += "    vec3 T = normalize(fragTangent);\n";

    shader += "    vec3 N = normalize(fragNormal);\n";

    shader += "    vec3 B = normalize(cross(fragNormal, fragTangent));\n";

    shader += "    mat3 TBN = mat3(T, B, N);\n";

    shader += "    vec3 normal = texture2D( normalTex, vec2(fragTexcoord.x, 1.0-fragTexcoord.y) ).rgb;\n";
    shader += "    normal = 2.0 * normal - 1.0;\n";
    shader += "    N = normalize( normal * TBN );\n";

    shader += "    vec4 baseColor = texture2D( baseColorTex, vec2(fragTexcoord.x, 1.0-fragTexcoord.y) );\n";

    shader += "    vec3 L = normalize(vec3(0,0,1));\n";
    shader += "    float NdotL =  clamp(dot( N, L ), 0.0, 1.0);\n";
    shader += "    vec3 diffuse = baseColor.rgb * NdotL;\n";
    shader += "    gl_FragColor = vec4(diffuse, 1.0);\n";
    shader += "}\n";

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[PBRMaterialShader] FragmentShader " + gl.getShaderInfoLog(fragmentShader));
	}
	
	return fragmentShader;
};
