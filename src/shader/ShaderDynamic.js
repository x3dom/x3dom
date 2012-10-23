/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/**
 * Generate the final Shader program
 */
x3dom.shader.DynamicShader = function(gl, properties)
{
	this.program = gl.createProgram();
	
	var vertexShader 	= this.generateVertexShader(gl, properties);
	var fragmentShader 	= this.generateFragmentShader(gl, properties);
	
	gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
	gl.linkProgram(this.program);
	
	return this.program;
};

/**
 * Generate the vertex shader
 */
x3dom.shader.DynamicShader.prototype.generateVertexShader = function(gl, properties)
{
	var shader = "";
	
	/*******************************************************************************
	* Generate dynamic attributes & uniforms & varyings
	********************************************************************************/
	
	//Default Matrices
	shader += "uniform mat4 modelViewMatrix;\n";
    shader += "uniform mat4 modelViewProjectionMatrix;\n";
	
	//Positions
	if(properties.POSCOMPONENTS == 3) {
		shader += "attribute vec3 position;\n";
	} else if(properties.POSCOMPONENTS == 4) {
		shader += "attribute vec4 position;\n";
	}
	
	if(properties.IMAGEGEOMETRY) {
		shader += "uniform vec3 IG_bboxMin;\n";
		shader += "uniform vec3 IG_bboxMax;\n";
		shader += "uniform float IG_coordTextureWidth;\n";
		shader += "uniform float IG_coordTextureHeight;\n";
		shader += "uniform float IG_implicitMeshSize;\n";
		
		for( var i = 0; i < properties.IG_PRECISION; i++ ) {
			shader += "uniform sampler2D IG_coords" + i + "\n;";
		}
		
		if(properties.IG_INDEXED) {
			shader += "uniform sampler2D IG_index;\n";
			shader += "uniform float IG_indexTextureWidth;\n";
			shader += "uniform float IG_indexTextureHeight;\n";
		}
	}
	
	//Normals
	if(properties.LIGHTS) {
		shader += "varying vec3 fragNormal;\n";
		shader += "uniform mat4 normalMatrix;\n";
		if(properties.IMAGEGEOMETRY) {		
			shader += "uniform sampler2D IG_normals;\n";	
		} else {
			if(properties.NORCOMPONENTS == 2) {
				if(properties.POSCOMPONENTS != 4) {
					shader += "attribute vec2 normal;\n";
				}
			} else if(properties.NORCOMPONENTS == 3) {
				shader += "attribute vec3 normal;\n";
			}
		}
	}
		
	//Colors
	if(properties.VERTEXCOLOR) {	
		if(properties.IMAGEGEOMETRY) {
			shader += "uniform sampler2D IG_colors;\n";
			if(properties.COLCOMPONENTS == 3) {
				shader += "varying vec3 fragColor;\n";
			} else if(properties.COLCOMPONENTS == 4) {
				shader += "varying vec4 fragColor;\n";
			}
		} else {
			if(properties.COLCOMPONENTS == 3) {
				shader += "attribute vec3 color;\n";
				shader += "varying vec3 fragColor;\n";
			} else if(properties.COLCOMPONENTS == 4) {
				shader += "attribute vec4 color;\n";
				shader += "varying vec4 fragColor;\n";
			}
		}
	}

	//Textures
	if(properties.TEXTURED || properties.CSSHADER) {
		shader += "varying vec2 fragTexcoord;\n";
		if(!properties.SPHEREMAPPING) {
			if(properties.IMAGEGEOMETRY) {
				shader += "uniform sampler2D IG_texCoords;\n";
			} else {
				shader += "attribute vec2 texcoord;\n";
			}
		}
		if(properties.TEXTRAFO){
			shader += "uniform mat4 texTrafoMatrix;\n";
		}
		if(properties.NORMALMAP){
			shader += "attribute vec3 tangent;\n";
			shader += "attribute vec3 binormal;\n";
			shader += "varying vec3 fragTangent;\n";
			shader += "varying vec3 fragBinormal;\n";
		}
		if(properties.CUBEMAP) {
			shader += "varying vec3 fragViewDir;\n";
			shader += "uniform mat4 viewMatrix;\n";
		}
	}
	
	//Lights & Shadows & Fog
	if(properties.LIGHTS || properties.FOG){
		shader += "uniform vec3 eyePosition;\n";
		shader += "varying vec3 fragPosition;\n";
		if(properties.FOG) {
			shader += "varying vec3 fragEyePosition;\n";
		}
		if(properties.SHADOW) {
			shader += "uniform mat4 matPV;\n";
			shader += "varying vec4 projCoord;\n";
		}
	}
	
	//Bounding Boxes
	if(properties.REQUIREBBOX) {
		shader += "uniform vec3 bgCenter;\n";
		shader += "uniform vec3 bgSize;\n";
		shader += "uniform float bgPrecisionMax;\n";
	}
	if(properties.REQUIREBBOXNOR) {
		shader += "uniform float bgPrecisionNorMax;\n";
	}
	if(properties.REQUIREBBOXCOL) {
		shader += "uniform float bgPrecisionColMax;\n";
	}
	if(properties.REQUIREBBOXTEX) {
		shader += "uniform float bgPrecisionTexMax;\n";
	}
	
	/*******************************************************************************
	* Generate main function
	********************************************************************************/
	shader += "void main(void) {\n";
	
	//Set point size
	shader += "gl_PointSize = 2.0;\n";
	
	/*******************************************************************************
	* Start of ImageGeometry switch
	********************************************************************************/
	if(properties.IMAGEGEOMETRY) {
		//Indices
		if(properties.IG_INDEXED) {
			shader += "vec2 halfPixel = vec2(0.5/IG_indexTextureWidth,0.5/IG_indexTextureHeight);\n";
			shader += "vec2 IG_texCoord = vec2(position.x*(IG_implicitMeshSize/IG_indexTextureWidth), position.y*(IG_implicitMeshSize/IG_indexTextureHeight)) + halfPixel;\n";
			shader += "vec2 IG_indices = texture2D( IG_index, IG_texCoord ).rg;\n";
			shader += "halfPixel = vec2(0.5/IG_coordTextureWidth,0.5/IG_coordTextureHeight);\n";
			shader += "IG_texCoord = (IG_indices * 0.996108948) + halfPixel;\n";
		} else {
			shader += "vec2 halfPixel = vec2(0.5/IG_coordTextureWidth, 0.5/IG_coordTextureHeight);\n";
			shader += "vec2 IG_texCoord = vec2(position.x*(IG_implicitMeshSize/IG_coordTextureWidth), position.y*(IG_implicitMeshSize/IG_coordTextureHeight)) + halfPixel;\n";
		}
		
		//Positions
		shader += "vec3 temp = vec3(0.0, 0.0, 0.0);\n";
		shader += "vec3 vertPosition = vec3(0.0, 0.0, 0.0);\n";
		
		for(var i=0; i<properties.IG_PRECISION; i++) {
			shader += "temp = 255.0 * texture2D( IG_coords" + i + ", IG_texCoord ).rgb;\n";
			shader += "vertPosition *= 256.0;\n";
			shader += "vertPosition += temp;\n";
		}
		
		shader += "vertPosition /= (pow(2.0, 8.0 * " + properties.IG_PRECISION + ".0) - 1.0);\n";
		
		// comment out if transformMatrix() from Shape is used for generating model matrix
		shader += "vertPosition = vertPosition * (IG_bboxMax - IG_bboxMin) + IG_bboxMin;\n";
	
		//Normals
		if(properties.LIGHTS) {
			shader += "vec3 vertNormal = texture2D( IG_normals, IG_texCoord ).rgb;\n";
			shader += "vertNormal = vertNormal * 2.0 - 1.0;\n";
		}
		
		//Colors
		if(properties.VERTEXCOLOR) {
			if(properties.COLCOMPONENTS == 3) {
				shader += "fragColor = texture2D( IG_colors, IG_texCoord ).rgb;\n";
			} else if(properties.COLCOMPONENTS == 4) {
				shader += "fragColor = texture2D( IG_colors, IG_texCoord ).rgba;\n";
			}
			
		}
		
		//TexCoords
		if(properties.TEXTURED || properties.CSSHADER) {
			shader += "vec4 IG_doubleTexCoords = texture2D( IG_texCoords, IG_texCoord );\n";
			shader += "vec2 vertTexCoord;";
			shader += "vertTexCoord.r = (IG_doubleTexCoords.r * 0.996108948) + (IG_doubleTexCoords.b * 0.003891051);\n";
			shader += "vertTexCoord.g = (IG_doubleTexCoords.g * 0.996108948) + (IG_doubleTexCoords.a * 0.003891051);\n";
		}
	} else {
		//Positions
		shader += "vec3 vertPosition = position.xyz;\n";
		if(properties.REQUIREBBOX || properties.BITLODGEOMETRY) {
			shader += "vertPosition = bgCenter + bgSize * vertPosition / bgPrecisionMax;\n";
		}
		
		//Normals
		if(properties.LIGHTS) {
			if(properties.NORCOMPONENTS == 2) {
				if (properties.POSCOMPONENTS == 4) {
					// (theta, phi) encoded in low/high byte of position.w
					shader += "vec3 vertNormal = vec3(position.w / 256.0); \n";
					shader += "vertNormal.x = floor(vertNormal.x) / 255.0; \n";
					shader += "vertNormal.y = fract(vertNormal.y) * 1.00392156862745; \n"; //256.0 / 255.0
				}
				else if (properties.REQUIREBBOXNOR && !properties.BITLODGEOMETRY) {
					shader += "vec3 vertNormal = vec3(normal.xy, 0.0) / bgPrecisionNorMax;\n";
				}
				else {
					shader += "vec3 vertNormal = vec3(normal.xy, 0.0);\n";
				}

				shader += "vec2 thetaPhi = 3.14159265358979 * vec2(vertNormal.x, vertNormal.y*2.0-1.0); \n";
				shader += "vec4 sinCosThetaPhi = sin( vec4(thetaPhi, thetaPhi + 1.5707963267949) ); \n";

				shader += "vertNormal.x = sinCosThetaPhi.x * sinCosThetaPhi.w; \n";
				shader += "vertNormal.y = sinCosThetaPhi.x * sinCosThetaPhi.y; \n";
				shader += "vertNormal.z = sinCosThetaPhi.z; \n";
			} else {
				shader += "vec3 vertNormal = normal;\n";
				if (properties.REQUIREBBOXNOR) {
					shader += "vertNormal = vertNormal / bgPrecisionNorMax;\n";
				}
			}
		}
		
		//Colors
		if(properties.VERTEXCOLOR){
			shader += "fragColor = color;\n";
			if(properties.REQUIREBBOXCOL) {
				shader += "fragColor = fragColor / bgPrecisionColMax;\n";
			}
		}
		
		//TexCoords
		if( (properties.TEXTURED || properties.CSSHADER) && !properties.SPHEREMAPPING) {
			shader += "vec2 vertTexCoord = texcoord;\n";
			if(properties.REQUIREBBOXTEX) {
				shader += "vertTexCoord = vertTexCoord / bgPrecisionTexMax;\n";
			}
		}
	}
	
	/*******************************************************************************
	* End of ImageGeometry switch
	********************************************************************************/
	
	
	//Normals
	if(properties.LIGHTS) {
		shader += "fragNormal = (normalMatrix * vec4(vertNormal, 0.0)).xyz;\n";
	}
    
	//Textures
	if(properties.TEXTURED || properties.CSSHADER){
		if(properties.CUBEMAP) {
			shader += "fragViewDir = (viewMatrix[3].xyz);\n";
		} else if (properties.SPHEREMAPPING) {
			shader += " fragTexcoord = 0.5 + fragNormal.xy / 2.0;\n";
		} else if(properties.TEXTRAFO) {
			shader += " fragTexcoord = (texTrafoMatrix * vec4(vertTexCoord, 1.0, 1.0)).xy;\n";
		} else {
			shader += " fragTexcoord = vertTexCoord;\n";
		}
		if(properties.NORMALMAP){
			shader += "fragTangent  = (normalMatrix * vec4(tangent, 0.0)).xyz;\n";
			shader += "fragBinormal = (normalMatrix * vec4(binormal, 0.0)).xyz;\n";
		}
	}
	
	//Lights & Shadows & Fog
	if(properties.LIGHTS || properties.FOG){    
		shader += "fragPosition = (modelViewMatrix * vec4(vertPosition, 1.0)).xyz;\n";
		if (properties.FOG) {
			shader += "fragEyePosition = eyePosition - fragPosition;\n";
		}
		if(properties.SHADOW) {
			shader += "projCoord = matPV * vec4(vertPosition+0.5*normalize(vertNormal), 1.0);\n";
		}
	}
	
	//Positions
	shader += "gl_Position = modelViewProjectionMatrix * vec4(vertPosition, 1.0);\n";
	
	//END OF SHADER
	shader += "}\n";
	
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shader);
    gl.compileShader(vertexShader);
		
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("VertexShader " + gl.getShaderInfoLog(vertexShader));		
	}
	//x3dom.debug.logInfo(shader);
	return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.DynamicShader.prototype.generateFragmentShader = function(gl, properties)
{
	shader = "#ifdef GL_ES\n" +
			 "  precision highp float;\n" +
			 "#endif\n\n";
	
	
	/*******************************************************************************
	* Generate dynamic uniforms & varyings
	********************************************************************************/
	
	//Default Matrices
	shader += "uniform mat4 modelMatrix;\n";
    shader += "uniform mat4 modelViewMatrix;\n";
	
	//Material
	shader += x3dom.shader.material();
	
	//Colors
	if(properties.VERTEXCOLOR){
		if(properties.COLCOMPONENTS == 3){
			shader += "varying vec3 fragColor;  \n";
		}else if(properties.COLCOMPONENTS == 4){
			shader += "varying vec4 fragColor;  \n";
		}
	}
	
	//Textures
	if(properties.TEXTURED || properties.CSSHADER) {
		shader += "varying vec2 fragTexcoord;\n";
		if((properties.TEXTURED || properties.DIFFUSEMAP) && !properties.CUBEMAP) {
			shader += "uniform sampler2D diffuseMap;\n";
		} else if(properties.CUBEMAP) {
			shader += "uniform samplerCube cubeMap;\n";
			shader += "varying vec3 fragViewDir;\n";
			shader += "uniform mat4 modelViewMatrixInverse;\n";
		}
		if(properties.NORMALMAP){
			shader += "uniform sampler2D normalMap;\n";
			shader += "varying vec3 fragTangent;\n";
			shader += "varying vec3 fragBinormal;\n";
		}
		if(properties.SPECMAP){
			shader += "uniform sampler2D specularMap;\n";
		}
	}
	
	//Fog
	if(properties.FOG) {
		shader += x3dom.shader.fog();
	}
	
	//Lights & Shadows
	if(properties.LIGHTS) {
		shader += "varying vec3 fragNormal;\n";
        shader += "varying vec3 fragPosition;\n";
		shader += x3dom.shader.light(properties.LIGHTS);
		if(properties.SHADOW) {
			shader += x3dom.shader.shadow();
		}
	}
	
	/*******************************************************************************
	* Generate main function
	********************************************************************************/
	shader += "void main(void) {\n";
	
	//Init color
	shader += "vec4 color;\n";
	shader += "color.rgb = diffuseColor;\n";
	shader += "color.a = 1.0 - transparency;\n";
			
	if(properties.VERTEXCOLOR) {
		if(properties.COLCOMPONENTS == 3){
			shader += "color.rgb = fragColor;\n";
		}else if(properties.COLCOMPONENTS == 4){
			shader += "color = fragColor;\n";
		}
	}
	
	if(properties.LIGHTS) {
		shader += "vec3 ambient   = vec3(0.07, 0.07, 0.07);\n";
		shader += "vec3 diffuse   = vec3(0.0, 0.0, 0.0);\n";
		shader += "vec3 specular  = vec3(0.0, 0.0, 0.0);\n";
		shader += "vec3 normal 	  = normalize(fragNormal);\n";
		shader += "vec3 eye 	  = -fragPosition;\n";
		
		//Init Shadows
		if(properties.SHADOW){
			shader += "float shadowed = 1.0;\n";
			shader += "float oneShadowAlreadyExists = 0.0;\n";
		}
		
		//Normalmap
		if(properties.NORMALMAP){                
			shader += "vec3 t = normalize( fragTangent );\n";
			shader += "vec3 b = normalize( fragBinormal );\n";
			shader += "vec3 n = normalize( fragNormal );\n";
		
			shader += "mat3 tangentToWorld = mat3(t, b, n);\n";
		
			shader += "normal = texture2D( normalMap, vec2(fragTexcoord.x, 1.0-fragTexcoord.y) ).rgb;\n";
			shader += "normal = 2.0 * normal - 1.0;\n";
			shader += "normal = normalize( normal * tangentToWorld );\n";
			
			shader += "normal.y = -normal.y;\n";
			shader += "normal.x = -normal.x;\n";
		}
		
		//Solid
		if(!properties.SOLID) {
			shader += "if (dot(normal, eye) < 0.0) {\n";
			shader += "  normal *= -1.0;\n";
			shader += "}\n";
		}
		
		//Calculate lights & shadows
		for(var l=0; l<properties.LIGHTS; l++) {
			shader += " lighting(light"+l+"_Type, " +
								"light"+l+"_Location, " +
								"light"+l+"_Direction, " +
								"light"+l+"_Color, " + 
								"light"+l+"_Attenuation, " +
								"light"+l+"_Intensity, " + 
								"light"+l+"_AmbientIntensity, " +
								"light"+l+"_BeamWidth, " +
								"light"+l+"_CutOffAngle, " +
								"normal, eye, ambient, diffuse, specular);\n";
			if(properties.SHADOW){
				shader += " if(light"+l+"_ShadowIntensity > 0.0 && oneShadowAlreadyExists == 0.0){\n";
				shader += "     vec3 projectiveBiased = projCoord.xyz / projCoord.w;\n";
				shader += "     shadowed = PCF_Filter(light"+l+"_ShadowIntensity, projectiveBiased, 0.002);\n";
				shader += "     oneShadowAlreadyExists = 1.0;\n";
				shader += " }\n";
			}
		}
		
		//Specularmap
		if(properties.SPECMAP) {
			shader += "specular *= texture2D(specularMap, vec2(fragTexcoord.x, 1.0-fragTexcoord.y)).rgb;\n";
		}
		
		//Textures
		if(properties.TEXTURED || properties.DIFFUSEMAP){
			if(properties.CUBEMAP) {
				shader += "vec3 viewDir = normalize(fragViewDir);\n";
				shader += "vec3 reflected = reflect(viewDir, normal);\n"
				shader += "reflected = (modelViewMatrixInverse * vec4(reflected,0.0)).xyz;\n"
				shader += "vec4 texColor = textureCube(cubeMap, reflected);\n";
				shader += "color.a *= texColor.a;\n";
			} else {
				shader += "vec2 texCoord = vec2(fragTexcoord.x, 1.0-fragTexcoord.y);\n";
				shader += "vec4 texColor = texture2D(diffuseMap, texCoord);\n";
				shader += "color.a *= texColor.a;\n";
			}
			if(properties.BLENDING){
				shader += "color.rgb = (emissiveColor + ambient*color.rgb + diffuse*color.rgb + specular*specularColor);\n";
				if(properties.CUBEMAP) {
					shader += "color.rgb = mix(color.rgb, texColor.rgb, vec3(0.75));\n";
				} else {
					shader += "color.rgb *= texColor.rgb;\n";
				}
			}else{
				shader += "color.rgb = (emissiveColor + ambient*texColor.rgb + diffuse*texColor.rgb + specular*specularColor);\n";
			}
		}else{
			shader += "color.rgb = (emissiveColor + ambient*color.rgb + diffuse*color.rgb + specular*specularColor);\n";
		}
		
		//Add shadows
		if(properties.SHADOW) {
			shader += "color.rgb *= shadowed;\n";
		}
	} else {
		if(properties.TEXTURED || properties.DIFFUSEMAP){
			shader += "vec2 texCoord = vec2(fragTexcoord.x, 1.0-fragTexcoord.y);\n";
			shader += "vec4 texColor = texture2D(diffuseMap, texCoord);\n";
			shader += "color.a = texColor.a;\n";
			if(properties.BLENDING){
				shader += "color.rgb += emissiveColor.rgb;\n";
				shader += "color.rgb *= texColor.rgb;\n";
			} else {
				shader += "color = texColor;\n";
			}
		} else if(!properties.VERTEXCOLOR){
			shader += "color.rgb += emissiveColor;\n";
		}
	}
	
	//Fog
	if(properties.FOG){
		shader += "float f0 = calcFog(fragEyePosition);\n";
		shader += "color.rgb = fogColor * (1.0-f0) + f0 * (color.rgb);\n";
	}
	
	//Kill pixel
	if(properties.TEXT) {
		shader += "if (color.a <= 0.5) discard;\n";
	} else {
		shader += "if (color.a <= 0.1) discard;\n";
	}
	
	//shader += "color = clamp(color, 0.0, 1.0);\n";
    
	//Output
    shader += "gl_FragColor = color;\n";
	
	//End Of Shader
	shader += "}\n";

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("FragmentShader " + gl.getShaderInfoLog(fragmentShader));		
	}
	
	return fragmentShader;
};
