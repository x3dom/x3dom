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
x3dom.shader.DynamicShader = function(gl, properties)
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
		
	//Init Colors. In the vertex shader we do not compute any color so
    //is is safe to ignore gamma here.
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

		if(properties.NORMALMAP && !x3dom.caps.STD_DERIVATIVES) {

            x3dom.debug.logWarning("Your System doesn't support the 'OES_STANDARD_DERIVATIVES' Extension. " +
                                   "You must set tangents and binormals manually via the FloatVertexAttribute-Node " +
                                   "to use normal maps");

			shader += "attribute vec3 tangent;\n";
			shader += "attribute vec3 binormal;\n";
			shader += "varying vec3 fragTangent;\n";
			shader += "varying vec3 fragBinormal;\n";
		}

		if(properties.CUBEMAP) {
			shader += "varying vec3 fragViewDir;\n";
			shader += "uniform mat4 viewMatrix;\n";
		}
        if (properties.DISPLACEMENTMAP) {
          shader += "uniform sampler2D displacementMap;\n";
          shader += "uniform float displacementFactor;\n";
          shader += "uniform float displacementWidth;\n";
          shader += "uniform float displacementHeight;\n";
            shader += "uniform float displacementAxis;\n";
        }
        if (properties.DIFFPLACEMENTMAP) {
            shader += "uniform sampler2D diffuseDisplacementMap;\n";
            shader += "uniform float displacementFactor;\n";
            shader += "uniform float displacementWidth;\n";
            shader += "uniform float displacementHeight;\n";
            shader += "uniform float displacementAxis;\n";
        }
	}
	
	//Lights & Fog
	if(properties.LIGHTS || properties.FOG){
		shader += "uniform vec3 eyePosition;\n";
		shader += "varying vec3 fragPosition;\n";
		if(properties.FOG) {
			shader += "varying vec3 fragEyePosition;\n";
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
	* Start of special Geometry switch
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
		if(properties.LIGHTS) {
			if(properties.NORCOMPONENTS == 2) {
				if (properties.POSCOMPONENTS == 4) {
					// (theta, phi) encoded in low/high byte of position.w
					shader += "vec3 vertNormal = vec3(position.w / 256.0); \n";
					shader += "vertNormal.x = floor(vertNormal.x) / 255.0; \n";
					shader += "vertNormal.y = fract(vertNormal.y) * 1.00392156862745; \n"; //256.0 / 255.0
				}
				else if (properties.REQUIREBBOXNOR) {
					shader += "vec3 vertNormal = vec3(normal.xy, 0.0) / bgPrecisionNorMax;\n";                    
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
                if (properties.BITLODGEOMETRY || properties.POPGEOMETRY) {
                    shader += "vertNormal = 2.0*vertNormal - 1.0;\n";
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
	* End of special Geometry switch
	********************************************************************************/
	
	
	//Normals
	if(properties.LIGHTS) {
        if (properties.DISPLACEMENTMAP || properties.DIFFPLACEMENTMAP && !properties.NORMALMAP) {
          //Map-Tile Size
          shader += "float dx = 1.0 / displacementWidth;\n";
          shader += "float dy = 1.0 / displacementHeight;\n";

          //Get the 4 Vertex Neighbours
          if (properties.DISPLACEMENTMAP)
          {
              shader += "float s1 = texture2D(displacementMap, vec2(vertTexCoord.x - dx, 1.0 - vertTexCoord.y)).r;\n";		 //left
              shader += "float s2 = texture2D(displacementMap, vec2(vertTexCoord.x, 1.0 - vertTexCoord.y - dy)).r;\n";		 //bottom
              shader += "float s3 = texture2D(displacementMap, vec2(vertTexCoord.x + dx, 1.0 - vertTexCoord.y)).r;\n";	   //right
              shader += "float s4 = texture2D(displacementMap, vec2(vertTexCoord.x, 1.0 - vertTexCoord.y + dy)).r;\n";		 //top
          }
          else if (properties.DIFFPLACEMENTMAP)
          {
              shader += "float s1 = texture2D(diffuseDisplacementMap, vec2(vertTexCoord.x - dx, 1.0 - vertTexCoord.y)).a;\n";		 //left
              shader += "float s2 = texture2D(diffuseDisplacementMap, vec2(vertTexCoord.x, 1.0 - vertTexCoord.y - dy)).a;\n";		 //bottom
              shader += "float s3 = texture2D(diffuseDisplacementMap, vec2(vertTexCoord.x + dx, 1.0 - vertTexCoord.y)).a;\n";	   //right
              shader += "float s4 = texture2D(diffuseDisplacementMap, vec2(vertTexCoord.x, 1.0 - vertTexCoord.y + dy)).a;\n";		 //top
          }

          //Coeffiecent for smooth/sharp Normals
          shader += "float coef = displacementFactor;\n";

          //Calculate the Normal
          shader += "vec3 calcNormal;\n";

          shader += "if (displacementAxis == 0.0) {\n"; //X
          shader += "calcNormal = vec3((s1 - s3) * coef, -5.0, (s2 - s4) * coef);\n";
          shader += "} else if(displacementAxis == 1.0) {\n"; //Y
          shader += "calcNormal = vec3((s1 - s3) * coef, -5.0, (s2 - s4) * coef);\n";
          shader += "} else {\n"; //Z
          shader += "calcNormal = vec3((s1 - s3) * coef, -(s2 - s4) * coef, 5.0);\n";
          shader += "}\n";


          //normalized Normal
          shader += "calcNormal = normalize(calcNormal);\n";
          shader += "fragNormal = (normalMatrix * vec4(calcNormal, 0.0)).xyz;\n";
        }
        else
        {
            shader += "fragNormal = (normalMatrix * vec4(vertNormal, 0.0)).xyz;\n";
        }
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
			
			// LOD LUT HACK ###
			if (properties.POPGEOMETRY && x3dom.debug.usePrecisionLevelAsTexCoord === true)
			    // remap texCoords to texel middle with w = 16 and tc' := 1 / (2 * w) + tc * (w - 1) / w
                shader += "fragTexcoord = vec2(0.03125 + 0.9375 * (PG_precisionLevel / 16.0), 1.0);";
			// LOD LUT HACK ###
		}

		if(properties.NORMALMAP  && !x3dom.caps.STD_DERIVATIVES) {
			shader += "fragTangent  = (normalMatrix * vec4(tangent, 0.0)).xyz;\n";
			shader += "fragBinormal = (normalMatrix * vec4(binormal, 0.0)).xyz;\n";
		}
	}
	
	//Lights & Fog
	if(properties.LIGHTS || properties.FOG){    
		shader += "fragPosition = (modelViewMatrix * vec4(vertPosition, 1.0)).xyz;\n";
		if (properties.FOG) {
			shader += "fragEyePosition = eyePosition - fragPosition;\n";
		}
	}
  
	//Displacement
    if (properties.DISPLACEMENTMAP) {
        shader += "vertPosition += normalize(vertNormal) * texture2D(displacementMap, vec2(fragTexcoord.x, 1.0-fragTexcoord.y)).r * displacementFactor;\n";
    }
    else if (properties.DIFFPLACEMENTMAP)
    {
        shader += "vertPosition += normalize(vertNormal) * texture2D(diffuseDisplacementMap, vec2(fragTexcoord.x, 1.0-fragTexcoord.y)).a * displacementFactor;\n";
    }
  
  //Positions
	shader += "gl_Position = modelViewProjectionMatrix * vec4(vertPosition, 1.0);\n";
  
	//END OF SHADER
	shader += "}\n";
	
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shader);
    gl.compileShader(vertexShader);
		
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        x3dom.debug.logInfo("VERTEX:\n" + shader);
		x3dom.debug.logError("VertexShader " + gl.getShaderInfoLog(vertexShader));		
	}
	
	return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.DynamicShader.prototype.generateFragmentShader = function(gl, properties)
{
	/*var shader = "#ifdef GL_ES\n" +
    			 "  precision highp float;\n" +
    			 "#endif\n\n";*/
    
  var shader = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n";
  shader += " precision highp float;\n";
  shader += "#else\n";
  shader += " precision mediump float;\n";
  shader += "#endif\n\n";
	
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
		if(properties.SPECMAP){
			shader += "uniform sampler2D specularMap;\n";
		}
        if (properties.DISPLACEMENTMAP) {
          shader += "uniform sampler2D displacementMap;\n";
          shader += "uniform float displacementWidth;\n";
          shader += "uniform float displacementHeight;\n";
        }
        if (properties.DIFFPLACEMENTMAP) {
            shader += "uniform sampler2D diffuseDisplacementMap;\n";
            shader += "uniform float displacementWidth;\n";
            shader += "uniform float displacementHeight;\n";
        }
        if(properties.NORMALMAP){
            shader += "uniform sampler2D normalMap;\n";

            if(x3dom.caps.STD_DERIVATIVES) {
                shader += "#extension GL_OES_standard_derivatives:enable\n";
                shader += x3dom.shader.TBNCalculation();
            } else {
                shader += "varying vec3 fragTangent;\n";
                shader += "varying vec3 fragBinormal;\n";
            }
        }
	}
	
	//Fog
	if(properties.FOG) {
		shader += x3dom.shader.fog();
	}
	
	//Lights
	if(properties.LIGHTS) {
		shader += "varying vec3 fragNormal;\n";
    shader += "varying vec3 fragPosition;\n";
		shader += x3dom.shader.light(properties.LIGHTS);
	}

    // Declare gamma correction for color computation (see property "GAMMACORRECTION")
    shader += x3dom.shader.gammaCorrectionDecl(properties);
 
 
	/*******************************************************************************
	* Generate main function
	********************************************************************************/
	shader += "void main(void) {\n";
	
	//Init color. In the fragment shader we are treating color linear by
    //gamma-adjusting actively before doing lighting computations. At the end
    //the color value is encoded again. See shader propery GAMMACORRECTION.
    shader += "vec4 color;\n";
	shader += "color.rgb = " + x3dom.shader.decodeGamma(properties, "diffuseColor") + ";\n";
	shader += "color.a = 1.0 - transparency;\n";
			
	if(properties.VERTEXCOLOR) {
		if(properties.COLCOMPONENTS === 3){
			shader += "color.rgb = " + x3dom.shader.decodeGamma(properties,"fragColor") + ";\n";
		}else if(properties.COLCOMPONENTS === 4){
			shader += "color = " + x3dom.shader.decodeGamma(properties, "fragColor") + ";\n";
		}
	}
	
	if(properties.LIGHTS) {
		shader += "vec3 ambient   = vec3(0.0, 0.0, 0.0);\n";
		shader += "vec3 diffuse   = vec3(0.0, 0.0, 0.0);\n";
		shader += "vec3 specular  = vec3(0.0, 0.0, 0.0);\n";
		shader += "vec3 normal 	  = normalize(fragNormal);\n";
		shader += "vec3 eye 	  = -fragPosition;\n";
		
		//Normalmap
		if(properties.NORMALMAP){
			shader += "vec3 n = normalize( fragNormal );\n";

            if (x3dom.caps.STD_DERIVATIVES) {
                shader += "normal = perturb_normal( n, fragPosition, vec2(fragTexcoord.x, 1.0-fragTexcoord.y) );\n";
            } else {
                shader += "vec3 t = normalize( fragTangent );\n";
                shader += "vec3 b = normalize( fragBinormal );\n";
                shader += "mat3 tangentToWorld = mat3(t, b, n);\n";

                shader += "normal = texture2D( normalMap, vec2(fragTexcoord.x, 1.0-fragTexcoord.y) ).rgb;\n";
                shader += "normal = 2.0 * normal - 1.0;\n";
                shader += "normal = normalize( normal * tangentToWorld );\n";

                shader += "normal.y = -normal.y;\n";
                shader += "normal.x = -normal.x;\n";
            }
		}
		
		//Solid
		if(!properties.SOLID) {
			shader += "if (dot(normal, eye) < 0.0) {\n";
			shader += "  normal *= -1.0;\n";
			shader += "}\n";
		}
		
		//Calculate lights
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
                                    "normal, eye);\n";
                shader += "   ambient  += " + lightCol + " * ads.r;\n" +
                          "   diffuse  += " + lightCol + " * ads.g;\n" +
                          "   specular += " + lightCol + " * ads.b;\n";
            }
        }
		
		//Specularmap
		if(properties.SPECMAP) {
			shader += "specular *= " + x3dom.shader.decodeGamma(properties, "texture2D(specularMap, vec2(fragTexcoord.x, 1.0-fragTexcoord.y)).rgb") + ";\n";
		}
		
		//Textures
		if(properties.TEXTURED || properties.DIFFUSEMAP || properties.DIFFPLACEMENTMAP){
			if(properties.CUBEMAP) {
				shader += "vec3 viewDir = normalize(fragViewDir);\n";
				shader += "vec3 reflected = reflect(viewDir, normal);\n";
				shader += "reflected = (modelViewMatrixInverse * vec4(reflected,0.0)).xyz;\n";
				shader += "vec4 texColor = " + x3dom.shader.decodeGamma(properties, "textureCube(cubeMap, reflected)") + ";\n";
				shader += "color.a *= texColor.a;\n";
			}
            else if (properties.DIFFPLACEMENTMAP)
            {
                shader += "vec2 texCoord = vec2(fragTexcoord.x, 1.0-fragTexcoord.y);\n";
                shader += "vec4 texColor = texture2D(diffuseDisplacementMap, texCoord);\n";
            }
            else
            {
				shader += "vec2 texCoord = vec2(fragTexcoord.x, 1.0-fragTexcoord.y);\n";
				shader += "vec4 texColor = " + x3dom.shader.decodeGamma(properties, "texture2D(diffuseMap, texCoord)") + ";\n";
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
		
	} else {
		if (properties.APPMAT && !properties.VERTEXCOLOR) {
			shader += "color = vec4(0.0, 0.0, 0.0, 1.0 - transparency);\n";
		}
		
		if(properties.TEXTURED || properties.DIFFUSEMAP){
			shader += "vec2 texCoord = vec2(fragTexcoord.x, 1.0-fragTexcoord.y);\n";
			shader += "vec4 texColor = " + x3dom.shader.decodeGamma(properties, "texture2D(diffuseMap, texCoord)") + ";\n";
			shader += "color.a = texColor.a;\n";
			if(properties.BLENDING){
				shader += "color.rgb += emissiveColor.rgb;\n";
				shader += "color.rgb *= texColor.rgb;\n";
			} else {
				shader += "color = texColor;\n";
			}
		} else if(!properties.VERTEXCOLOR && !properties.POINTLINE2D){
			shader += "color.rgb += emissiveColor;\n";
		} else if(!properties.VERTEXCOLOR && properties.POINTLINE2D){
			shader += "color.rgb = emissiveColor;\n";
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

    //Output the gamma encoded result.
    shader += "gl_FragColor = " + x3dom.shader.encodeGamma(properties, "color") + ";\n";
	
	//End Of Shader
	shader += "}\n";

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        x3dom.debug.logInfo("FRAGMENT:\n" + shader);
		x3dom.debug.logError("FragmentShader " + gl.getShaderInfoLog(fragmentShader));
	}

	return fragmentShader;
};
