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
x3dom.shader.DynamicMobileShader = function(gl, properties)
{
	this.program = gl.createProgram();
	
	var vertexShader 	= this.generateVertexShader(gl, properties);
	var fragmentShader 	= this.generateFragmentShader(gl, properties);
	
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
x3dom.shader.DynamicMobileShader.prototype.generateVertexShader = function(gl, properties)
{
	var shader = "";
	
	/*******************************************************************************
	* Generate dynamic attributes & uniforms & varyings
	********************************************************************************/
	
	//Material
	shader += x3dom.shader.material();

    if (properties.TWOSIDEDMAT ) {
        shader += x3dom.shader.twoSidedMaterial();
    }
	
	//Default Matrices
	shader += "uniform mat4 normalMatrix;\n";
	shader += "uniform mat4 modelViewMatrix;\n";
    shader += "uniform mat4 modelViewProjectionMatrix;\n";
	
	//Positions
	if(properties.POSCOMPONENTS == 3) {
		shader += "attribute vec3 position;\n";
	} else if(properties.POSCOMPONENTS == 4) {
		shader += "attribute vec4 position;\n";
	}
	
  //IG stuff
	if(properties.IMAGEGEOMETRY) {
		shader += "uniform vec3 IG_bboxMin;\n";
		shader += "uniform vec3 IG_bboxMax;\n";
		shader += "uniform float IG_coordTextureWidth;\n";
		shader += "uniform float IG_coordTextureHeight;\n";
		shader += "uniform vec2 IG_implicitMeshSize;\n";
		
		for( var i = 0; i < properties.IG_PRECISION; i++ ) {
			shader += "uniform sampler2D IG_coords" + i + "\n;";
		}
		
		if(properties.IG_INDEXED) {
			shader += "uniform sampler2D IG_index;\n";
			shader += "uniform float IG_indexTextureWidth;\n";
			shader += "uniform float IG_indexTextureHeight;\n";
		}
	}
	
    //PG stuff
    if (properties.POPGEOMETRY) {
        shader += "uniform float PG_precisionLevel;\n";
        shader += "uniform float PG_powPrecision;\n";
        shader += "uniform vec3 PG_maxBBSize;\n";
        shader += "uniform vec3 PG_bbMin;\n";
        shader += "uniform vec3 PG_bbMaxModF;\n";
        shader += "uniform vec3 PG_bboxShiftVec;\n";
        shader += "uniform float PG_numAnchorVertices;\n";
        shader += "attribute float PG_vertexID;\n";
    }
  
	//Normals
	if(!properties.POINTLINE2D) {
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
	shader += "varying vec4 fragColor;\n";
	if(properties.VERTEXCOLOR){
		if(properties.IMAGEGEOMETRY) {
			shader += "uniform sampler2D IG_colors;";
		} else {
			if(properties.COLCOMPONENTS == 3){
				shader += "attribute vec3 color;";
			} else if(properties.COLCOMPONENTS == 4) {
				shader += "attribute vec4 color;";
			}
		}
	}
	
	//Textures
	if(properties.TEXTURED) {
		shader += "varying vec2 fragTexcoord;\n";
		if(properties.IMAGEGEOMETRY) {
			shader += "uniform sampler2D IG_texCoords;";
		} else {
			shader += "attribute vec2 texcoord;\n";
		}
		if(properties.TEXTRAFO){
			shader += "uniform mat4 texTrafoMatrix;\n";
		}
		if(!properties.BLENDING) {
			shader += "varying vec3 fragAmbient;\n";
			shader += "varying vec3 fragDiffuse;\n";
		}
		if(properties.CUBEMAP) {
			shader += "varying vec3 fragViewDir;\n";
			shader += "varying vec3 fragNormal;\n";
			shader += "uniform mat4 viewMatrix;\n";
		}
	}
	
	//Fog
	if(properties.FOG) {
		shader += x3dom.shader.fog();
	}
	
	//Lights
	if(properties.LIGHTS) {
		shader += x3dom.shader.light(properties.LIGHTS);
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
			shader += "vec2 IG_texCoord = vec2(position.x*(IG_implicitMeshSize.x/IG_indexTextureWidth), position.y*(IG_implicitMeshSize.y/IG_indexTextureHeight)) + halfPixel;\n";
			shader += "vec2 IG_indices = texture2D( IG_index, IG_texCoord ).rg;\n";
			shader += "halfPixel = vec2(0.5/IG_coordTextureWidth,0.5/IG_coordTextureHeight);\n";
			shader += "IG_texCoord = (IG_indices * 0.996108948) + halfPixel;\n";
		} else {
			shader += "vec2 halfPixel = vec2(0.5/IG_coordTextureWidth, 0.5/IG_coordTextureHeight);\n";
			shader += "vec2 IG_texCoord = vec2(position.x*(IG_implicitMeshSize.x/IG_coordTextureWidth), position.y*(IG_implicitMeshSize.y/IG_coordTextureHeight)) + halfPixel;\n";
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
		shader += "vertPosition = vertPosition * (IG_bboxMax - IG_bboxMin) + IG_bboxMin;\n";
	
		//Normals
		if(!properties.POINTLINE2D) {
			shader += "vec3 vertNormal = texture2D( IG_normals, IG_texCoord ).rgb;\n";
			shader += "vertNormal = vertNormal * 2.0 - 1.0;\n";
		}
		
		//Colors
		if(properties.VERTEXCOLOR) {
			if(properties.COLCOMPONENTS == 3) {
				shader += "vec3 vertColor = texture2D( IG_colors, IG_texCoord ).rgb;";
			} else if(properties.COLCOMPONENTS  == 4) {
				shader += "vec4 vertColor = texture2D( IG_colors, IG_texCoord ).rgba;";
			}
		}
		
		//TexCoords
		if(properties.TEXTURED) {
			shader += "vec4 IG_doubleTexCoords = texture2D( IG_texCoords, IG_texCoord );\n";
			shader += "vec2 vertTexCoord;";
			shader += "vertTexCoord.r = (IG_doubleTexCoords.r * 0.996108948) + (IG_doubleTexCoords.b * 0.003891051);\n";
			shader += "vertTexCoord.g = (IG_doubleTexCoords.g * 0.996108948) + (IG_doubleTexCoords.a * 0.003891051);\n";
		}
	} else {
		//Positions
		shader += "vec3 vertPosition = position.xyz;\n";
        
        if (properties.POPGEOMETRY) {
          //compute offset using bounding box and test if vertPosition <= PG_bbMaxModF 
          shader += "vec3 offsetVec = step(vertPosition / bgPrecisionMax, PG_bbMaxModF) * PG_bboxShiftVec;\n";
          
          //coordinate truncation, computation of current maximum possible value
          //PG_vertexID currently mimics use of gl_VertexID
          shader += "if ((PG_precisionLevel <= 2.0) || PG_vertexID >= PG_numAnchorVertices) {\n";
          shader += "   vertPosition = floor(vertPosition / PG_powPrecision) * PG_powPrecision;\n";
          shader += "   vertPosition /= (65536.0 - PG_powPrecision);\n";
          shader += "}\n";
          shader += "else {\n";
          shader += "   vertPosition /= bgPrecisionMax;\n";
          shader += "}\n";
          
          //translate coordinates, where PG_bbMin := floor(bbMin / size) 
          shader += "vertPosition = (vertPosition + offsetVec + PG_bbMin) * PG_maxBBSize;\n";
        }
		else if(properties.REQUIREBBOX) {
          shader += "vertPosition = bgCenter + bgSize * vertPosition / bgPrecisionMax;\n";
		}
	
		//Normals
		if(!properties.POINTLINE2D) {
			if (properties.NORCOMPONENTS == 2) {
				if (properties.POSCOMPONENTS == 4) {
					// (theta, phi) encoded in low/high byte of position.w
					shader += "vec3 vertNormal = vec3(position.w / 256.0); \n";
					shader += "vertNormal.x = floor(vertNormal.x) / 255.0; \n";
					shader += "vertNormal.y = fract(vertNormal.y) * 1.00392156862745; \n"; //256.0 / 255.0
				} else if (properties.REQUIREBBOXNOR) {
					shader += "vec3 vertNormal = vec3(normal.xy, 0.0) / bgPrecisionNorMax;\n";
				} else {
					shader += "vec3 vertNormal = vec3(normal.xy, 0.0);\n";
				}
				
				shader += "vec2 thetaPhi = 3.14159265358979 * vec2(vertNormal.x, vertNormal.y*2.0-1.0); \n";

				// Doing approximation with Taylor series and using cos(x) = sin(x+PI/2)
				shader += "vec4 sinCosThetaPhi = vec4(thetaPhi, thetaPhi + 1.5707963267949); \n";

				shader += "vec4 thetaPhiPow2 = sinCosThetaPhi * sinCosThetaPhi; \n";
				shader += "vec4 thetaPhiPow3 =  thetaPhiPow2  * sinCosThetaPhi; \n";
				shader += "vec4 thetaPhiPow5 =  thetaPhiPow3  * thetaPhiPow2; \n";
				shader += "vec4 thetaPhiPow7 =  thetaPhiPow5  * thetaPhiPow2; \n";
				shader += "vec4 thetaPhiPow9 =  thetaPhiPow7  * thetaPhiPow2; \n";

				shader += "sinCosThetaPhi +=  -0.16666666667   * thetaPhiPow3; \n";
				shader += "sinCosThetaPhi +=   0.00833333333   * thetaPhiPow5; \n";
				shader += "sinCosThetaPhi +=  -0.000198412698  * thetaPhiPow7; \n";
				shader += "sinCosThetaPhi +=   0.0000027557319 * thetaPhiPow9; \n";

				shader += "vertNormal.x = sinCosThetaPhi.x * sinCosThetaPhi.w; \n";
				shader += "vertNormal.y = sinCosThetaPhi.x * sinCosThetaPhi.y; \n";
				shader += "vertNormal.z = sinCosThetaPhi.z; \n";
			} else {
				shader += "vec3 vertNormal = normal;\n";
				if (properties.REQUIREBBOXNOR) {
                    shader += "vertNormal = vertNormal / bgPrecisionNorMax;\n";
				}   
                if (properties.POPGEOMETRY) {
                    shader += "vertNormal = 2.0*vertNormal - 1.0;\n";                    
                }                
			}
		}
		
		//Colors
		if(properties.VERTEXCOLOR) {
			if(properties.COLCOMPONENTS == 3) {
				shader += "vec3 vertColor = color;";
			} else if(properties.COLCOMPONENTS  == 4) {
				shader += "vec4 vertColor = color;";
			}
			if(properties.REQUIREBBOXCOL) {
				shader += "vertColor = vertColor / bgPrecisionColMax;\n";
			}
		}
		
		//TexCoords
		if(properties.TEXTURED) {
			shader += "vec2 vertTexCoord = texcoord;\n";
			if(properties.REQUIREBBOXTEX) {
				shader += "vertTexCoord = vertTexCoord / bgPrecisionTexMax;\n";
			}
		}
	}
	/*******************************************************************************
	* End of ImageGeometry switch
	********************************************************************************/
	
	//positions to model-view-space
	shader += "vec3 positionMV = (modelViewMatrix * vec4(vertPosition, 1.0)).xyz;\n";
	
	//normals to model-view-space
	if(!properties.POINTLINE2D) {
		shader += "vec3 normalMV = normalize( (normalMatrix * vec4(vertNormal, 0.0)).xyz );\n";
	}
	
	shader += "vec3 eye = -positionMV;\n";
	
	//Colors
	if (properties.VERTEXCOLOR) {
		shader += "vec3 rgb = vertColor.rgb;\n";	
		if(properties.COLCOMPONENTS == 4) {
			shader += "float alpha = vertColor.a;\n";
		} else if(properties.COLCOMPONENTS == 3) {
			shader += "float alpha = 1.0 - transparency;\n";
		}
	} else {
		shader += "vec3 rgb = diffuseColor;\n";
		shader += "float alpha = 1.0 - transparency;\n";
	}
	
	//Calc TexCoords
	if(properties.TEXTURED){
		if(properties.CUBEMAP) {
			shader += "fragViewDir = viewMatrix[3].xyz;\n";
			shader += "fragNormal = normalMV;\n";
		} else if(properties.SPHEREMAPPING) {
			shader += " fragTexcoord = 0.5 + normalMV.xy / 2.0;\n";
		} else if(properties.TEXTRAFO) {
			shader += " fragTexcoord = (texTrafoMatrix * vec4(vertTexCoord, 1.0, 1.0)).xy;\n";
		} else {
			shader += " fragTexcoord = vertTexCoord;\n";
			
			// LOD LUT HACK ###
			if (properties.POPGEOMETRY && x3dom.debug.usePrecisionLevelAsTexCoord === true)
			    // remap texCoords to texel middle with w = 16 and tc' := 1 / (2 * w) + tc * (w - 1) / w
                shader += "fragTexcoord = vec2(0.03125 + 0.9375 * (PG_precisionLevel / 16.0), 1.0);";
			// LOD LUT HACK ###
		}
	}
	
	//calc lighting
	if(properties.LIGHTS) {
		shader += "vec3 ambient   = vec3(0.0, 0.0, 0.0);\n";
		shader += "vec3 diffuse   = vec3(0.0, 0.0, 0.0);\n";
		shader += "vec3 specular  = vec3(0.0, 0.0, 0.0);\n";
        shader += "float _shininess     = shininess;\n";
        shader += "vec3 _specularColor  = specularColor;\n";
        shader += "vec3 _emissiveColor  = emissiveColor;\n";
        shader += "float _ambientIntensity = ambientIntensity;\n";
		
		//Solid
		if(!properties.SOLID || properties.TWOSIDEDMAT) {
			shader += "if (dot(normalMV, eye) < 0.0) {\n";
			shader += "	 normalMV *= -1.0;\n";
            if(properties.SEPARATEBACKMAT) {
                shader += "    rgb = backDiffuseColor;\n";
                shader += "    alpha = 1.0 - backTransparency;\n";
                shader += "    _shininess = backShininess;\n";
                shader += "    _emissiveColor = backEmissiveColor;\n";
                shader += "    _specularColor = backSpecularColor;\n";
                shader += "    _ambientIntensity = backAmbientIntensity;\n";
            }
            shader += "  }\n";
		}
		
		//Calculate lighting
        if (properties.LIGHTS) {
            shader += "vec3 ads;\n";

            for(var l=0; l<properties.LIGHTS; l++) {
                var lightCol = "light"+l+"_Color";
                shader += "ads = lighting(light"+l+"_Type, " +
                          "light"+l+"_Location, " +
                          "light"+l+"_Direction, " +
                          lightCol + ", " +
                          "light"+l+"_Attenuation, " +
                          "light"+l+"_Radius, " +
                          "light"+l+"_Intensity, " +
                          "light"+l+"_AmbientIntensity, " +
                          "light"+l+"_BeamWidth, " +
                          "light"+l+"_CutOffAngle, " +
                          "normalMV, eye, _shininess, _ambientIntensity);\n";
                shader += "   ambient  += " + lightCol + " * ads.r;\n" +
                          "   diffuse  += " + lightCol + " * ads.g;\n" +
                          "   specular += " + lightCol + " * ads.b;\n";
            }

            shader += "ambient = max(ambient, 0.0);\n";
            shader += "diffuse = max(diffuse, 0.0);\n";
            shader += "specular = max(specular, 0.0);\n";
        }
		
		//Textures & blending
		if(properties.TEXTURED  && !properties.BLENDING) {
			shader += "fragAmbient = ambient;\n";
			shader += "fragDiffuse = diffuse;\n";
			shader += "fragColor.rgb = (_emissiveColor + specular*_specularColor);\n";
			shader += "fragColor.a = alpha;\n";
		} else {
			shader += "fragColor.rgb = (_emissiveColor + max(ambient + diffuse, 0.0) * rgb + specular*_specularColor);\n";
			shader += "fragColor.a = alpha;\n";
		}
	} else {
		if (properties.APPMAT && !properties.VERTEXCOLOR) {
			shader += "rgb = vec3(0.0, 0.0, 0.0);\n";
		}
		if(properties.TEXTURED && !properties.BLENDING) {
			shader += "fragAmbient = vec3(0.0);\n";
			shader += "fragDiffuse = vec3(1.0);\n";
			shader += "fragColor.rgb = vec3(0.0);\n";
			shader += "fragColor.a = alpha;\n";
		} else if(!properties.VERTEXCOLOR && properties.POINTLINE2D){
			shader += "fragColor.rgb = emissiveColor;\n";
			shader += "fragColor.a = alpha;\n";
		} else {
			shader += "fragColor.rgb = rgb + emissiveColor;\n";
			shader += "fragColor.a = alpha;\n";
		}
	}
	
	//Fog
	if(properties.FOG) {
		shader += "float f0 = calcFog(-positionMV);\n";
		shader += "fragColor.rgb = fogColor * (1.0-f0) + f0 * (fragColor.rgb);\n";
	}

	//Output
	shader += "gl_Position = modelViewProjectionMatrix * vec4(vertPosition, 1.0);\n";
	
	//End of shader
	shader += "}\n";

	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shader);
    gl.compileShader(vertexShader);
		
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[DynamicMobileShader] VertexShader " + gl.getShaderInfoLog(vertexShader));		
	}
	
	return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.DynamicMobileShader.prototype.generateFragmentShader = function(gl, properties)
{
	var shader = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n";
  shader += "precision highp float;\n";
  shader += "#else\n";
  shader += " precision mediump float;\n";
  shader += "#endif\n\n";
	
	/*******************************************************************************
	* Generate dynamic uniforms & varyings
	********************************************************************************/
	//Colors
	shader += "varying vec4 fragColor;\n";
	
	//Textures
	if(properties.TEXTURED) {
		if(properties.CUBEMAP) {
			shader += "uniform samplerCube cubeMap;\n";
			shader += "varying vec3 fragViewDir;\n";
			shader += "varying vec3 fragNormal;\n";
			shader += "uniform mat4 modelViewMatrixInverse;\n";
		} else {
			shader += "uniform sampler2D diffuseMap;           \n";
			shader += "varying vec2 fragTexcoord;       \n";
		}
		if(!properties.BLENDING) {
			shader += "varying vec3 fragAmbient;\n";
			shader += "varying vec3 fragDiffuse;\n";
		}
	}
	
	/*******************************************************************************
	* Generate main function
	********************************************************************************/
	shader += "void main(void) {\n";
	
	//Colors
	shader += "vec4 color = fragColor;\n";
	
	//Textures
	if(properties.TEXTURED){
		if(properties.CUBEMAP) {
			shader += "vec3 normal = normalize(fragNormal);\n";
			shader += "vec3 viewDir = normalize(fragViewDir);\n";
			shader += "vec3 reflected = reflect(viewDir, normal);\n";
			shader += "reflected = (modelViewMatrixInverse * vec4(reflected,0.0)).xyz;\n";
			shader += "vec4 texColor = textureCube(cubeMap, reflected);\n";
		} else {
			shader += "vec4 texColor = texture2D(diffuseMap, vec2(fragTexcoord.s, 1.0-fragTexcoord.t));\n";
		}
		if(properties.BLENDING) {
			if(properties.CUBEMAP) {
				shader += "color.rgb = mix(color.rgb, texColor.rgb, vec3(0.75));\n";
				shader += "color.a = texColor.a;\n";
			} else {
				shader += "color.rgb *= texColor.rgb;\n";
				shader += "color.a *= texColor.a;\n";
			}
		} else {
			shader += "color.rgb += max(fragAmbient + fragDiffuse, 0.0) * texColor.rgb;\n";
			shader += "color.a *= texColor.a;\n";
		}
	} 
	
	//Kill pixel
	if(properties.TEXT) {
		shader += "if (color.a <= 0.5) discard;\n";
	} else {
		shader += "if (color.a <= 0.1) discard;\n";
	}
	
	//Output
	shader += "gl_FragColor = clamp(color, 0.0, 1.0);\n";
	
	//End of shader
	shader += "}\n";

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[DynamicMobileShader] FragmentShader " + gl.getShaderInfoLog(fragmentShader));		
	}
	
	return fragmentShader;
};
