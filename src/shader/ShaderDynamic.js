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
x3dom.shader.DynamicShader = function ( gl, properties )
{
    this.program = gl.createProgram();

    var vertexShader     = this.generateVertexShader( gl, properties, x3dom.caps.WEBGL_VERSION );
    var fragmentShader   = this.generateFragmentShader( gl, properties, x3dom.caps.WEBGL_VERSION );

    gl.attachShader( this.program, vertexShader );
    gl.attachShader( this.program, fragmentShader );

    // optional, but position should be at location 0 for performance reasons
    gl.bindAttribLocation( this.program, 0, "position" );

    gl.linkProgram( this.program );

    return this.program;
};

/**
 * Generate the vertex shader
 */
x3dom.shader.DynamicShader.prototype.generateVertexShader = function ( gl, properties, version )
{
    var shader = "";

    /*******************************************************************************
    * Generate dynamic attributes & uniforms & varyings
    ********************************************************************************/

    //Default Matrices
    shader += "uniform mat4 modelMatrix;\n";
    shader += "uniform mat4 modelViewMatrix;\n";
    shader += "uniform mat4 modelViewProjectionMatrix;\n";

    shader += "uniform mat4 modelViewMatrix2;\n";
    shader += "uniform mat4 modelViewProjectionMatrix2;\n";

    shader += "uniform float isVR;\n";
    shader += "attribute float eyeIdx;\n";
    shader += "varying float vrOffset;\n";
    shader += "varying float fragEyeIdx;\n";

    //Positions
    if ( properties.POSCOMPONENTS == 3 )
    {
        shader += "attribute vec3 position;\n";
    }
    else if ( properties.POSCOMPONENTS == 4 )
    {
        shader += "attribute vec4 position;\n";
    }

    //PG stuff
    if ( properties.POPGEOMETRY )
    {
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
    if ( properties.LIGHTS || properties.PBR_MATERIAL )
    {
        if ( properties.NORMALMAP && properties.NORMALSPACE == "OBJECT" )
        {
            //do nothing
        }
        else
        {
            shader += "varying vec3 fragNormal;\n";
            shader += "uniform mat4 normalMatrix;\n";
            shader += "uniform mat4 normalMatrix2;\n";

            if ( properties.NORCOMPONENTS == 2 )
            {
                if ( properties.POSCOMPONENTS != 4 )
                {
                    shader += "attribute vec2 normal;\n";
                }
            }
            else if ( properties.NORCOMPONENTS == 3 )
            {
                shader += "attribute vec3 normal;\n";
            }
        }
    }

    //Init Colors. In the vertex shader we do not compute any color so
    //is is safe to ignore gamma here.
    if ( properties.VERTEXCOLOR )
    {
        if ( properties.COLCOMPONENTS == 3 )
        {
            shader += "attribute vec3 color;\n";
            shader += "varying vec3 fragColor;\n";
        }
        else if ( properties.COLCOMPONENTS == 4 )
        {
            shader += "attribute vec4 color;\n";
            shader += "varying vec4 fragColor;\n";
        }
    }

    //Textures
    if ( properties.TEXTURED )
    {
        shader += "varying vec2 fragTexcoord;\n";

        if ( properties.MULTITEXCOORD )
        {
            shader += "varying vec2 fragTexcoord2;\n";
        }

        if ( !properties.SPHEREMAPPING )
        {
            if ( !properties.IS_PARTICLE )
            {
                shader += "attribute vec2 texcoord;\n";

                if ( properties.MULTITEXCOORD )
                {
                    shader += "attribute vec2 texcoord2;\n";
                }
            }
        }
        if ( properties.TEXTRAFO )
        {
            shader += "uniform mat4 texTrafoMatrix;\n";
        }

        if ( properties.NORMALMAP && properties.NORMALSPACE == "TANGENT" )
        {
            if ( !properties.TANGENTDATA && !x3dom.caps.STD_DERIVATIVES )
            {
                x3dom.debug.logWarning( "Your System doesn't support the 'OES_STANDARD_DERIVATIVES' Extension. " +
                    "You must set tangents and binormals manually via the FloatVertexAttribute-Node " +
                    "to use normal maps" );
            }

            shader += "attribute vec3 tangent;\n";
            shader += "attribute vec3 binormal;\n";
            shader += "varying vec3 fragTangent;\n";
            shader += "varying vec3 fragBinormal;\n";
        }

        if ( properties.DISPLACEMENTMAP )
        {
            shader += "uniform sampler2D displacementMap;\n";
            shader += "uniform float displacementFactor;\n";
            shader += "uniform float displacementWidth;\n";
            shader += "uniform float displacementHeight;\n";
            shader += "uniform float displacementAxis;\n";
        }
        if ( properties.DIFFPLACEMENTMAP )
        {
            shader += "uniform sampler2D diffuseDisplacementMap;\n";
            shader += "uniform float displacementFactor;\n";
            shader += "uniform float displacementWidth;\n";
            shader += "uniform float displacementHeight;\n";
            shader += "uniform float displacementAxis;\n";
        }
    }

    if ( properties.CUBEMAP || properties.PBR_MATERIAL )
    {
        shader += "varying vec3 fragViewDir;\n";
        shader += "uniform mat4 viewMatrix;\n";
        shader += "uniform mat4 viewMatrix2;\n";
    }

    if ( properties.VERTEXID )
    {
        shader += "attribute float id;\n";
        shader += "varying float fragID;\n";
    }

    if ( properties.IS_PARTICLE )
    {
        shader += "attribute vec3 particleSize;\n";
    }

    if ( properties.POINTPROPERTIES )
    {
        shader += "uniform vec3 pointSizeAttenuation;\n";
        shader += "uniform float pointSizeFactor;\n";
        shader += "uniform float minPointSize;\n";
        shader += "uniform float maxPointSize;\n";
    }

    //Lights & Fog
    if ( properties.LIGHTS || properties.FOG || properties.CLIPPLANES || properties.POINTPROPERTIES )
    {
        shader += "uniform vec3 eyePosition;\n";
        shader += "varying vec4 fragPosition;\n";
        shader += "varying vec4 fragPositionWS;\n";
        if ( properties.FOG )
        {
            shader += "varying vec3 fragEyePosition;\n";
        }
    }

    //Bounding Boxes
    if ( properties.REQUIREBBOX )
    {
        shader += "uniform vec3 bgCenter;\n";
        shader += "uniform vec3 bgSize;\n";
        shader += "uniform float bgPrecisionMax;\n";
    }
    if ( properties.REQUIREBBOXNOR )
    {
        shader += "uniform float bgPrecisionNorMax;\n";
    }
    if ( properties.REQUIREBBOXCOL )
    {
        shader += "uniform float bgPrecisionColMax;\n";
    }
    if ( properties.REQUIREBBOXTEX )
    {
        shader += "uniform float bgPrecisionTexMax;\n";
    }

    /*******************************************************************************
    * Generate main function
    ********************************************************************************/
    shader += "void main(void) {\n";

    //Positions
    shader += "mat4 mat_mvp = modelViewProjectionMatrix;\n";
    shader += "mat4 mat_mv  = modelViewMatrix;\n";
    shader += "fragEyeIdx = eyeIdx;\n";

    if ( properties.CUBEMAP || properties.PBR_MATERIAL )
    {
        shader += "mat4 mat_v   = viewMatrix;\n";
    }

    if ( properties.LIGHTS || properties.PBR_MATERIAL )
    {
        if ( properties.NORMALMAP && properties.NORMALSPACE == "OBJECT" )
        {
            //do nothing
        }
        else
        {
            shader += "mat4 mat_n   = normalMatrix;\n";
        }
    }

    shader += "if(eyeIdx == 1.0){\n";
    shader += "    mat_mvp = modelViewProjectionMatrix2;\n";

    if ( properties.CUBEMAP || properties.PBR_MATERIAL )
    {
        shader += "    mat_v   = viewMatrix2;\n";
    }

    if ( properties.LIGHTS || properties.PBR_MATERIAL )
    {
        if ( properties.NORMALMAP && properties.NORMALSPACE == "OBJECT" )
        {
            //do nothing
        }
        else
        {
            shader += "mat4 mat_n   = normalMatrix2;\n";
        }
    }

    shader += "}\n";

    //Positions
    shader += "vec3 vertPosition = position.xyz;\n";

    if ( properties.POPGEOMETRY )
    {
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
    else if ( properties.REQUIREBBOX )
    {
        shader += "vertPosition = bgCenter + bgSize * vertPosition / bgPrecisionMax;\n";
    }

    //Normals
    if ( properties.LIGHTS )
    {
        if ( properties.NORCOMPONENTS == 2 )
        {
            if ( properties.POSCOMPONENTS == 4 )
            {
                // (theta, phi) encoded in low/high byte of position.w
                shader += "vec3 vertNormal = vec3(position.w / 256.0); \n";
                shader += "vertNormal.x = floor(vertNormal.x) / 255.0; \n";
                shader += "vertNormal.y = fract(vertNormal.y) * 1.00392156862745; \n"; //256.0 / 255.0
            }
            else if ( properties.REQUIREBBOXNOR )
            {
                shader += "vec3 vertNormal = vec3(normal.xy, 0.0) / bgPrecisionNorMax;\n";
            }

            shader += "vec2 thetaPhi = 3.14159265358979 * vec2(vertNormal.x, vertNormal.y*2.0-1.0); \n";
            shader += "vec4 sinCosThetaPhi = sin( vec4(thetaPhi, thetaPhi + 1.5707963267949) ); \n";

            shader += "vertNormal.x = sinCosThetaPhi.x * sinCosThetaPhi.w; \n";
            shader += "vertNormal.y = sinCosThetaPhi.x * sinCosThetaPhi.y; \n";
            shader += "vertNormal.z = sinCosThetaPhi.z; \n";
        }
        else
        {
            if ( properties.NORMALMAP && properties.NORMALSPACE == "OBJECT" )
            {
                //Nothing to do
            }
            else
            {
                shader += "vec3 vertNormal = normal;\n";
                if ( properties.REQUIREBBOXNOR )
                {
                    shader += "vertNormal = vertNormal / bgPrecisionNorMax;\n";
                }
                if ( properties.POPGEOMETRY )
                {
                    shader += "vertNormal = 2.0*vertNormal - 1.0;\n";
                }
            }
        }
    }

    //Colors
    if ( properties.VERTEXCOLOR )
    {
        shader += "fragColor = color;\n";

        if ( properties.REQUIREBBOXCOL )
        {
            shader += "fragColor = fragColor / bgPrecisionColMax;\n";
        }
    }

    //TexCoords
    if ( ( properties.TEXTURED ) && !properties.SPHEREMAPPING )
    {
        if ( properties.IS_PARTICLE || properties.POINTPROPERTIES )
        {
            shader += "vec2 vertTexCoord = vec2(0.0);\n";
        }
        else
        {
            shader += "vec2 vertTexCoord = texcoord;\n";

            if ( properties.MULTITEXCOORD )
            {
                shader += "vec2 vertTexCoord2 = texcoord2;\n";
            }

            if ( properties.REQUIREBBOXTEX )
            {
                shader += "vertTexCoord = vertTexCoord / bgPrecisionTexMax;\n";
            }
        }
    }

    /*******************************************************************************
    * End of special Geometry switch
    ********************************************************************************/

    //Normals
    if ( properties.LIGHTS )
    {
        if ( ( properties.DISPLACEMENTMAP || properties.DIFFPLACEMENTMAP ) && !properties.NORMALMAP )
        {
            //Map-Tile Size
            shader += "float dx = 1.0 / displacementWidth;\n";
            shader += "float dy = 1.0 / displacementHeight;\n";

            //Get the 4 Vertex Neighbours
            if ( properties.DISPLACEMENTMAP )
            {
                shader += "float s1 = texture2D(displacementMap, vec2(vertTexCoord.x - dx, 1.0 - vertTexCoord.y)).r;\n";         //left
                shader += "float s2 = texture2D(displacementMap, vec2(vertTexCoord.x, 1.0 - vertTexCoord.y - dy)).r;\n";         //bottom
                shader += "float s3 = texture2D(displacementMap, vec2(vertTexCoord.x + dx, 1.0 - vertTexCoord.y)).r;\n";       //right
                shader += "float s4 = texture2D(displacementMap, vec2(vertTexCoord.x, 1.0 - vertTexCoord.y + dy)).r;\n";         //top
            }
            else if ( properties.DIFFPLACEMENTMAP )
            {
                shader += "float s1 = texture2D(diffuseDisplacementMap, vec2(vertTexCoord.x - dx, 1.0 - vertTexCoord.y)).a;\n";         //left
                shader += "float s2 = texture2D(diffuseDisplacementMap, vec2(vertTexCoord.x, 1.0 - vertTexCoord.y - dy)).a;\n";         //bottom
                shader += "float s3 = texture2D(diffuseDisplacementMap, vec2(vertTexCoord.x + dx, 1.0 - vertTexCoord.y)).a;\n";       //right
                shader += "float s4 = texture2D(diffuseDisplacementMap, vec2(vertTexCoord.x, 1.0 - vertTexCoord.y + dy)).a;\n";         //top
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
            shader += "fragNormal = (mat_n * vec4(calcNormal, 0.0)).xyz;\n";
        }
        else if ( properties.NORMALMAP && properties.NORMALSPACE == "OBJECT" )
        {
            //Nothing to do
        }
        else
        {
            shader += "fragNormal = (mat_n * vec4(vertNormal, 0.0)).xyz;\n";
        }
    }

    if ( properties.CUBEMAP || properties.PBR_MATERIAL )
    {
        shader += "fragViewDir = (mat_v[3].xyz);\n";
    }

    //Textures
    if ( properties.TEXTURED )
    {
        if ( properties.SPHEREMAPPING )
        {
            shader += " fragTexcoord = 0.5 + fragNormal.xy / 2.0;\n";
            if ( properties.TEXTRAFO )
            {
                shader += " fragTexcoord = (texTrafoMatrix * vec4(fragTexcoord, 1.0, 1.0)).xy;\n";
            }
        }
        else if ( properties.TEXTRAFO )
        {
            shader += " fragTexcoord = (texTrafoMatrix * vec4(vertTexCoord, 1.0, 1.0)).xy;\n";
        }
        else
        {
            shader += " fragTexcoord = vertTexCoord;\n";

            if ( properties.MULTITEXCOORD )
            {
                shader += " fragTexcoord2 = vertTexCoord2;\n";
            }

            // LOD LUT HACK ###
            if ( properties.POPGEOMETRY && x3dom.debug.usePrecisionLevelAsTexCoord === true )
            // remap texCoords to texel middle with w = 16 and tc' := 1 / (2 * w) + tc * (w - 1) / w
            {shader += "fragTexcoord = vec2(0.03125 + 0.9375 * (PG_precisionLevel / 16.0), 1.0);";}
            // LOD LUT HACK ###
        }

        if ( properties.NORMALMAP && properties.NORMALSPACE == "TANGENT" )
        {
            if ( properties.TANGENTDATA )
            {
                shader += "fragTangent  = (mat_n * vec4(tangent, 0.0)).xyz;\n";
                shader += "fragBinormal = (mat_n * vec4(binormal, 0.0)).xyz;\n";
            }
        }
    }

    //Lights & Fog
    if ( properties.LIGHTS || properties.FOG || properties.CLIPPLANES || properties.POINTPROPERTIES )
    {
        shader += "fragPosition = (mat_mv * vec4(vertPosition, 1.0));\n";
        shader += "fragPositionWS = (modelMatrix * vec4(vertPosition, 1.0));\n";
        if ( properties.FOG )
        {
            shader += "fragEyePosition = eyePosition - fragPosition.xyz;\n";
        }
    }

    //Displacement
    if ( properties.DISPLACEMENTMAP )
    {
        shader += "vertPosition += normalize(vertNormal) * texture2D(displacementMap, vec2(fragTexcoord.x, 1.0-fragTexcoord.y)).r * displacementFactor;\n";
    }
    else if ( properties.DIFFPLACEMENTMAP )
    {
        shader += "vertPosition += normalize(vertNormal) * texture2D(diffuseDisplacementMap, vec2(fragTexcoord.x, 1.0-fragTexcoord.y)).a * displacementFactor;\n";
    }

    //Positions
    shader += "gl_Position = mat_mvp * vec4(vertPosition, 1.0);\n";

    shader += "if(isVR == 1.0){\n";
    shader += "    vrOffset = eyeIdx * 0.5;\n";
    shader += "    gl_Position.x *= 0.5;\n";
    shader += "    gl_Position.x += vrOffset * gl_Position.w;\n";
    shader += "}\n";

    //Set point size
    if ( properties.IS_PARTICLE )
    {
        shader += "float spriteDist = (gl_Position.w > 0.000001) ? gl_Position.w : 0.000001;\n";
        shader += "float pointSize = floor(length(particleSize) * 256.0 / spriteDist + 0.5);\n";
        shader += "gl_PointSize = clamp(pointSize, 2.0, 256.0);\n";
    }
    else if ( properties.POINTPROPERTIES )
    {
        shader += "float r = length( fragPosition.xyz );\n";
        shader += "vec3 a = pointSizeAttenuation;\n";
        shader += "float attFactor = ( a.x + a.y * r + a.z * r * r );\n";
        shader += "float pointSize =  pointSizeFactor * 1.0 / attFactor;\n";
        shader += "gl_PointSize = clamp(pointSize, minPointSize, maxPointSize);\n";
    }
    else
    {
        shader += "gl_PointSize = 2.0;\n";
    }

    //END OF SHADER
    shader += "}\n";

    if ( version == 2 )
    {
        shader = x3dom.shader.convertVertexShader( shader );
    }

    var vertexShader = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource( vertexShader, shader );
    gl.compileShader( vertexShader );

    if ( !gl.getShaderParameter( vertexShader, gl.COMPILE_STATUS ) )
    {
        x3dom.debug.logInfo( "VERTEX:\n" + shader );
        x3dom.debug.logError( "VertexShader " + gl.getShaderInfoLog( vertexShader ) );
    }

    return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.DynamicShader.prototype.generateFragmentShader = function ( gl, properties, version )
{
    var shader = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n";
    shader += " precision highp float;\n";
    shader += "#else\n";
    shader += " precision mediump float;\n";
    shader += "#endif\n\n";

    if ( properties.PBR_MATERIAL && x3dom.caps.TEXTURE_LOD )
    {
        shader += "#extension GL_EXT_shader_texture_lod : enable\n";
    }

    if ( ( properties.PBR_MATERIAL || properties.NORMALMAP ) && x3dom.caps.STD_DERIVATIVES )
    {
        shader += "#extension GL_OES_standard_derivatives:enable\n";
    }

    shader += "//@insertFragColor\n";

    /*******************************************************************************
    * Generate dynamic uniforms & varyings
    ********************************************************************************/

    shader += "uniform float isVR;\n";
    shader += "varying float vrOffset;\n";
    shader += "varying float fragEyeIdx;\n";
    shader += "uniform float screenWidth;\n";
    shader += "uniform vec3 cameraPosWS;\n";

    shader += "uniform float alphaCutoff;\n";

    //Material
    shader += x3dom.shader.material();

    shader += x3dom.shader.toneMapping();

    if ( properties.PBR_MATERIAL && !x3dom.caps.TEXTURE_LOD && x3dom.caps.WEBGL_VERSION == 1 )
    {
        shader += x3dom.shader.calcMipLevel();
    }

    if ( properties.TWOSIDEDMAT )
    {
        shader += x3dom.shader.twoSidedMaterial();
    }

    if ( properties.PBR_MATERIAL )
    {
        if ( properties.ISROUGHNESSMETALLIC )
        {
            shader += "uniform float metallicFactor;\n";
        }

        shader += "uniform sampler2D brdfMap;\n";
        shader += "uniform samplerCube diffuseEnvironmentMap;\n";
        shader += "uniform samplerCube specularEnvironmentMap;\n";
    }

    //Colors
    if ( properties.VERTEXCOLOR )
    {
        if ( properties.COLCOMPONENTS == 3 )
        {
            shader += "varying vec3 fragColor;  \n";
        }
        else if ( properties.COLCOMPONENTS == 4 )
        {
            shader += "varying vec4 fragColor;  \n";
        }
    }

    if ( properties.CUBEMAP || properties.CLIPPLANES || properties.PBR_MATERIAL )
    {
        shader += "uniform mat4 viewMatrixInverse;\n";
        shader += "uniform mat4 viewMatrixInverse2;\n";
        shader += "uniform mat4 modelViewMatrixInverse;\n";
        shader += "uniform mat4 modelViewMatrixInverse2;\n";
    }

    //VertexID
    if ( properties.VERTEXID )
    {
        shader += "varying float fragID;\n";
    }

    //Textures
    if ( properties.TEXTURED )
    {
        shader += "varying vec2 fragTexcoord;\n";

        if ( properties.MULTITEXCOORD )
        {
            shader += "varying vec2 fragTexcoord2;\n";
        }

        if ( ( properties.TEXTURED || properties.DIFFUSEMAP ) )
        {
            shader += "uniform sampler2D diffuseMap;\n";
        }
        if ( properties.CUBEMAP || properties.PBR_MATERIAL )
        {
            shader += "uniform samplerCube environmentMap;\n";
            shader += "varying vec3 fragViewDir;\n";
            if ( properties.CSSHADER )
            {
                shader += "uniform float environmentFactor;\n";
            }
        }
        if ( properties.EMISSIVEMAP )
        {
            shader += "uniform sampler2D emissiveMap;\n";
        }
        if ( properties.OCCLUSIONMAP )
        {
            shader += "uniform sampler2D occlusionMap;\n";
        }
        if ( properties.ROUGHNESSMETALLICMAP )
        {
            shader += "uniform sampler2D roughnessMetallicMap;\n";
        }
        if ( properties.SPECULARGLOSSINESSMAP )
        {
            shader += "uniform sampler2D specularGlossinessMap;\n";
        }
        if ( properties.OCCLUSIONROUGHNESSMETALLICMAP )
        {
            shader += "uniform sampler2D occlusionRoughnessMetallicMap;\n";
        }
        if ( properties.SPECMAP )
        {
            shader += "uniform sampler2D specularMap;\n";
        }
        if ( properties.SHINMAP )
        {
            shader += "uniform sampler2D shininessMap;\n";
        }
        if ( properties.DISPLACEMENTMAP )
        {
            shader += "uniform sampler2D displacementMap;\n";
            shader += "uniform float displacementWidth;\n";
            shader += "uniform float displacementHeight;\n";
        }
        if ( properties.DIFFPLACEMENTMAP )
        {
            shader += "uniform sampler2D diffuseDisplacementMap;\n";
            shader += "uniform float displacementWidth;\n";
            shader += "uniform float displacementHeight;\n";
        }
        if ( properties.NORMALMAP )
        {
            shader += "uniform sampler2D normalMap;\n";
            shader += "uniform vec3 normalBias;\n";
            if ( properties.NORMALSPACE == "TANGENT" )
            {
                if ( x3dom.caps.STD_DERIVATIVES || x3dom.caps.WEBGL_VERSION == 2 )
                {
                    shader += x3dom.shader.TBNCalculation();
                }
                else
                {
                    shader += "varying vec3 fragTangent;\n";
                    shader += "varying vec3 fragBinormal;\n";
                }
            }
            else if ( properties.NORMALSPACE == "OBJECT" )
            {
                shader += "uniform mat4 normalMatrix;\n";
                shader += "uniform mat4 normalMatrix2;\n";
            }
        }
    }

    //Fog
    if ( properties.FOG )
    {
        shader += x3dom.shader.fog();
    }

    if ( properties.LIGHTS || properties.CLIPPLANES )
    {
        shader += "varying vec4 fragPosition;\n";
        shader += "varying vec4 fragPositionWS;\n";
        shader += "uniform float isOrthoView;\n";
    }

    //Lights
    if ( properties.LIGHTS )
    {
        if ( properties.NORMALMAP && properties.NORMALSPACE == "OBJECT" )
        {
            //do nothing
        }
        else
        {
            shader += "varying vec3 fragNormal;\n";
        }

        var numLights = properties.LIGHTS;

        if ( properties.PHYSICALENVLIGHT )
        {
            numLights--;
        }

        if ( properties.PBR_MATERIAL && numLights )
        {
            shader += x3dom.shader.lightPBR( properties.LIGHTS );
        }
        else if ( numLights )
        {
            shader += x3dom.shader.light( properties.LIGHTS );
        }
    }

    if ( properties.CLIPPLANES )
    {
        shader += x3dom.shader.clipPlanes( properties.CLIPPLANES );
    }

    // Declare gamma correction for color computation (see property "GAMMACORRECTION")
    shader += x3dom.shader.gammaCorrectionDecl( properties );

    /*******************************************************************************
    * Generate main function
    ********************************************************************************/
    shader += "void main(void) {\n";

    if ( properties.CUBEMAP || properties.CLIPPLANES || properties.PBR_MATERIAL )
    {
        shader += "mat4 mat_mvi = modelViewMatrixInverse;\n";
        shader += "mat4 mat_vi  = viewMatrixInverse;\n";
    }

    if ( properties.NORMALSPACE == "OBJECT" )
    {
        shader += "mat4 mat_n = normalMatrix;\n";
    }

    shader += "if(fragEyeIdx == 1.0){\n";

    if ( properties.CUBEMAP || properties.CLIPPLANES )
    {
        shader += "    mat_mvi   = modelViewMatrixInverse2;\n";
        shader += "    mat_vi    = viewMatrixInverse2;\n";
    }
    if ( properties.NORMALSPACE == "OBJECT" )
    {
        shader += "    mat_n   = normalMatrix2;\n";
    }

    shader += "}\n";

    shader += "if ( isVR == 1.0) {\n";
    shader += "    if ( ( step( 0.5, gl_FragCoord.x / screenWidth ) - 0.5 ) * vrOffset < 0.0 ) discard;\n";
    shader += "}\n";

    if ( properties.CLIPPLANES )
    {
        shader += "vec3 cappingColor = calculateClipPlanes();\n";
    }

    //Init color. In the fragment shader we are treating color linear by
    //gamma-adjusting actively before doing lighting computations. At the end
    //the color value is encoded again. See shader propery GAMMACORRECTION.
    shader += "vec4 color;\n";
    shader += "vec4 texColor;\n";
    shader += "color.rgb = diffuseColor;\n";
    shader += "color.a = 1.0 - transparency;\n";

    shader += "vec3 _emissiveColor     = emissiveColor;\n";
    shader += "float _shininess        = shininess;\n";
    shader += "vec3 _specularColor     = specularColor;\n";
    shader += "float _ambientIntensity = ambientIntensity;\n";
    shader += "float _transparency     = transparency;\n";
    shader += "float _occlusion        = 1.0;\n";

    if ( properties.ALPHAMODE == "OPAQUE" )
    {
        shader += "color.a = 1.0;\n";
    }

    if ( properties.PBR_MATERIAL && properties.ISROUGHNESSMETALLIC )
    {
        shader += "float _metallic         = metallicFactor;\n";
    }

    if ( properties.SEPARATEBACKMAT )
    {
        shader += "  if(!gl_FrontFacing) {\n";
        shader += "    color.rgb = backDiffuseColor;\n";
        shader += "    color.a = 1.0 - backTransparency;\n";
        shader += "    _transparency = 1.0 - backTransparency;\n";
        shader += "    _shininess = backShininess;\n";
        shader += "    _emissiveColor = backEmissiveColor;\n";
        shader += "    _specularColor = backSpecularColor;\n";
        shader += "    _ambientIntensity = backAmbientIntensity;\n";
        shader += "  }\n";
    }

    if ( properties.VERTEXCOLOR )
    {
        if ( ( properties.COLCOMPONENTS === 3 || properties.ALPHAMODE == "OPAQUE" ) && properties.PBR_MATERIAL )
        {
            shader += "color.rgb *= fragColor.rgb;\n";
        }
        else if ( properties.COLCOMPONENTS === 3 && !properties.PBR_MATERIAL )
        {
            shader += "color.rgb = fragColor.rgb;\n";
        }
        else if ( properties.COLCOMPONENTS === 4 && properties.PBR_MATERIAL )
        {
            shader += "color *= fragColor;\n";
        }
        else if ( properties.COLCOMPONENTS === 4 && !properties.PBR_MATERIAL )
        {
            shader += "color = fragColor;\n";
        }
    }

    if ( properties.IS_PARTICLE || properties.POINTPROPERTIES )
    {
        shader += "vec2 texcoord = clamp(gl_PointCoord, 0.01, 0.99);\n";
        if ( properties.MULTITEXCOORD )
        {
            shader += "vec2 texcoord2 = texcoord;\n";
        }
    }
    else if ( properties.TEXTURED )
    {
        shader += "vec2 texcoord = fragTexcoord;\n";
        if ( properties.MULTITEXCOORD )
        {
            shader += "vec2 texcoord2 = fragTexcoord2;\n";
        }
    }

    if ( properties.UNLIT )
    {
        if ( properties.DIFFUSEMAP )
        {
            if ( properties.DIFFUSEMAPCHANNEL )
            {
                shader += "texColor = " + x3dom.shader.decodeGamma( properties, "texture2D(diffuseMap, vec2(texcoord2.x, 1.0 - texcoord2.y))" ) + ";\n";
            }
            else
            {
                shader += "texColor = " + x3dom.shader.decodeGamma( properties, "texture2D(diffuseMap, vec2(texcoord.x, 1.0 - texcoord.y))" ) + ";\n";
            }

            if ( properties.ALPHAMODE == "OPAQUE" )
            {
                shader += "texColor.a = 1.0;\n";
            }

            shader += "color *= texColor;\n";
        }
    }
    else if ( properties.LIGHTS )
    {
        shader += "vec3 ambient   = vec3(0.0, 0.0, 0.0);\n";
        shader += "vec3 diffuse   = vec3(0.0, 0.0, 0.0);\n";
        shader += "vec3 specular  = vec3(0.0, 0.0, 0.0);\n";
        shader += "vec3 eye;\n";
        shader += "vec3 positionVS = fragPosition.rgb;\n";
        shader += "if ( isOrthoView > 0.0 ) {\n";
        shader += "    eye = vec3(0.0, 0.0, 1.0);\n";
        shader += "} else {\n";
        shader += "    eye = -fragPosition.xyz;\n";
        shader += "}\n";

        if ( properties.NORMALMAP )
        {
            shader += "vec3 _normalBias = normalBias;\n";
        }

        if ( properties.NORMALMAP && properties.NORMALSPACE == "OBJECT" )
        {
            shader += "vec3 normal = vec3(0.0, 0.0, 0.0);\n";
        }
        else
        {
            shader += "vec3 normal = normalize(fragNormal);\n";
        }

        //Solid
        if ( !properties.SOLID || properties.TWOSIDEDMAT )
        {
            shader += "if (dot(normalize(fragNormal), eye) < 0.0) {\n";
            shader += "  normal *= -1.0;\n";
            if ( properties.NORMALMAP )
            {
                shader += "  _normalBias = _normalBias * _normalBias;\n";
            }
            shader += "}\n";
        }

        if ( properties.TEXTURED )
        {
            //Normalmap
            if ( properties.NORMALMAP )
            {
                if ( properties.NORMALSPACE == "TANGENT" )
                {
                    shader += "vec3 n = normal;\n";

                    if ( !properties.TANGENTDATA && ( x3dom.caps.STD_DERIVATIVES || x3dom.caps.WEBGL_VERSION == 2 ) )
                    {
                        shader += "normal = perturb_normal( n, fragPosition.xyz, vec2(texcoord.x, 1.0 - texcoord.y), _normalBias);\n";
                    }
                    else
                    {
                        shader += "vec3 t = normalize( fragTangent );\n";
                        shader += "vec3 b = normalize( fragBinormal );\n";
                        shader += "mat3 tangentToWorld = mat3(t, b, n);\n";

                        shader += "normal = texture2D( normalMap, vec2(texcoord.x, 1.0-texcoord.y) ).rgb;\n";
                        shader += "normal = 2.0 * normal - 1.0;\n";
                        shader += "normal = normalize( normal * tangentToWorld );\n";
                    }
                }
                else if ( properties.NORMALSPACE == "OBJECT" )
                {
                    shader += "normal = texture2D( normalMap, vec2(texcoord.x, 1.0-texcoord.y) ).rgb;\n";

                    shader += "normal = 2.0 * normal - 1.0;\n";
                    shader += "normal = (mat_n * vec4(normal, 0.0)).xyz;\n";
                    shader += "normal = normalize(normal);\n";
                }
            }

            if ( properties.CUBEMAP )
            {
                shader += "vec3 viewDir = normalize(fragViewDir);\n";
                shader += "vec3 reflected = reflect(-eye, normal);\n";
                shader += "reflected = (mat_mvi * vec4(reflected, 0.0)).xyz;\n";
                shader += "texColor = " + x3dom.shader.decodeGamma( properties, "textureCube(environmentMap, reflected)" ) + ";\n";
            }
            else if ( properties.DIFFPLACEMENTMAP )
            {
                shader += "texColor = texture2D(diffuseDisplacementMap, vec2(texcoord.x, 1.0-texcoord.y));\n";
            }
            else if ( properties.DIFFUSEMAP || properties.TEXT )
            {
                if ( properties.PIXELTEX )
                {
                    if ( properties.DIFFUSEMAPCHANNEL )
                    {
                        shader += "texColor = " + x3dom.shader.decodeGamma( properties, "texture2D(diffuseMap, texcoord2)" ) + ";\n";
                    }
                    else
                    {
                        shader += "texColor = " + x3dom.shader.decodeGamma( properties, "texture2D(diffuseMap, texcoord)" ) + ";\n";
                    }
                }
                else
                {
                    if ( properties.DIFFUSEMAPCHANNEL )
                    {
                        shader += "texColor = " + x3dom.shader.decodeGamma( properties, "texture2D(diffuseMap, vec2(texcoord2.x, 1.0 - texcoord2.y))" ) + ";\n";
                    }
                    else
                    {
                        shader += "texColor = " + x3dom.shader.decodeGamma( properties, "texture2D(diffuseMap, vec2(texcoord.x, 1.0 - texcoord.y))" ) + ";\n";
                    }
                }
            }

            if ( properties.ALPHAMODE == "OPAQUE" )
            {
                shader += "texColor.a = 1.0;\n";
            }

            if ( properties.BLENDING && ( properties.DIFFUSEMAP || properties.TEXT || properties.DIFFPLACEMENTMAP || properties.CUBEMAP ) )
            {
                if ( properties.CUBEMAP && properties.CSSHADER )
                {
                    shader += "color.rgb *= mix(vec3(1.0,1.0,1.0), texColor.rgb, environmentFactor);\n";
                }
                else
                {
                    shader += "color *= texColor;\n";
                }
            }
            else if ( !properties.BLENDING && ( properties.DIFFUSEMAP || properties.TEXT || properties.DIFFPLACEMENTMAP || properties.CUBEMAP ) )
            {
                shader += "color = texColor;\n";
            }

            if ( properties.SHINMAP )
            {
                shader += "_shininess *= texture2D( shininessMap, vec2(texcoord.x, 1.0-texcoord.y) ).r;\n";
            }

            //Specularmap
            if ( properties.SPECMAP )
            {
                shader += "_specularColor = texture2D(specularMap, vec2(texcoord.x, 1.0-texcoord.y)).rgb;\n";
            }

            //Specularmap
            if ( properties.EMISSIVEMAP )
            {
                if ( properties.EMISSIVEMAPCHANNEL )
                {
                    shader += "_emissiveColor = _emissiveColor * texture2D(emissiveMap, vec2(texcoord2.x, 1.0-texcoord2.y)).rgb;\n";
                }
                else
                {
                    shader += "_emissiveColor = _emissiveColor * texture2D(emissiveMap, vec2(texcoord.x, 1.0-texcoord.y)).rgb;\n";
                }
            }

            //Specularmap
            if ( properties.ROUGHNESSMETALLICMAP )
            {
                if ( properties.ROUGHNESSMETALLICMAPCHANNEL )
                {
                    shader += "vec3 roughnessMetallic = texture2D(roughnessMetallicMap, vec2(texcoord2.x, 1.0-texcoord2.y)).rgb;\n";
                }
                else
                {
                    shader += "vec3 roughnessMetallic = texture2D(roughnessMetallicMap, vec2(texcoord.x, 1.0-texcoord.y)).rgb;\n";
                }
                shader += "_shininess = 1.0 - (roughnessMetallic.g * (1.0 - _shininess));\n";
                shader += "_metallic  = roughnessMetallic.b * metallicFactor;\n";
            }

            if ( properties.SPECULARGLOSSINESSMAP )
            {
                if ( properties.SPECULARGLOSSINESSMAPCHANNEL )
                {
                    shader += "vec4 specularGlossiness = " + x3dom.shader.decodeGamma( properties, "texture2D(specularGlossinessMap, vec2(texcoord2.x, 1.0 - texcoord2.y))" ) + ";\n";
                }
                else
                {
                    shader += "vec4 specularGlossiness = " + x3dom.shader.decodeGamma( properties, "texture2D(specularGlossinessMap, vec2(texcoord.x, 1.0 - texcoord.y))" ) + ";\n";
                }
                shader += "_shininess = specularGlossiness.a * _shininess;\n";
            }

            //Specularmap
            if ( properties.OCCLUSIONROUGHNESSMETALLICMAP )
            {
                if ( properties.OCCLUSIONROUGHNESSMETALLICMAPCHANNEL )
                {
                    shader += "vec3 occlusionRoughnessMetallic = texture2D(occlusionRoughnessMetallicMap, vec2(texcoord2.x, 1.0-texcoord2.y)).rgb;\n";
                }
                else
                {
                    shader += "vec3 occlusionRoughnessMetallic = texture2D(occlusionRoughnessMetallicMap, vec2(texcoord.x, 1.0-texcoord.y)).rgb;\n";
                }

                shader += "_occlusion = occlusionRoughnessMetallic.r;\n";
                shader += "_shininess = 1.0 - occlusionRoughnessMetallic.g;\n";
                shader += "_metallic  = occlusionRoughnessMetallic.b;\n";
            }

            //Specularmap
            if ( properties.OCCLUSIONMAP )
            {
                if ( properties.OCCLUSIONMAPCHANNEL )
                {
                    shader += "_occlusion = texture2D(occlusionMap, vec2(texcoord2.x, 1.0-texcoord2.y)).r;\n";
                }
                else
                {
                    shader += "_occlusion = texture2D(occlusionMap, vec2(texcoord.x, 1.0-texcoord.y)).r;\n";
                }
            }
        }

        if ( properties.PBR_MATERIAL && properties.ISROUGHNESSMETALLIC )
        {
            shader += "_specularColor = mix(vec3(0.04, 0.04, 0.04), color.rgb, _metallic);\n";
            shader += "color.rgb *= (1.0 - _metallic);\n";
        }
        else if ( properties.PBR_MATERIAL && properties.SPECULARGLOSSINESSMAP )
        {
            shader += "_specularColor = specularGlossiness.rgb * _specularColor;\n";
        }

        //Calculate lights
        if ( numLights )
        {
            for ( var l = 0; l < numLights; l++ )
            {
                var lightCol = "light" + l + "_Color";
                shader += " lighting(light" + l + "_Type, " +
                                    "light" + l + "_Location, " +
                                    "light" + l + "_Direction, " +
                                    lightCol + ", " +
                                    "light" + l + "_Attenuation, " +
                                    "light" + l + "_Radius, " +
                                    "light" + l + "_Intensity, " +
                                    "light" + l + "_AmbientIntensity, " +
                                    "light" + l + "_BeamWidth, " +
                                    "light" + l + "_CutOffAngle, " +
                                    "positionVS, normal, eye, _shininess, _ambientIntensity, _specularColor, ambient, diffuse, specular);\n";
            }

            shader += "ambient = max(ambient, 0.0);\n";
            shader += "diffuse = max(diffuse, 0.0);\n";
            shader += "specular = max(specular, 0.0);\n";
        }

        if ( properties.PBR_MATERIAL )
        {
            //shader += "_specularColor = vec3(1.0);\n";
            if ( properties.PHYSICALENVLIGHT )
            {
                shader += "float camDistance = length(cameraPosWS.xyz - fragPositionWS.xyz);\n";
                shader += "vec3 N = (mat_vi * vec4(normal, 0.0)).rgb;\n";
                shader += "vec3 V = normalize ( cameraPosWS.xyz - fragPositionWS.xyz );\n";
                shader += "vec3 R = normalize( reflect ( -V, N ) );\n";

                shader += "float roughness  =  1.0 - _shininess;\n";
                shader += "float NoV = clamp(dot( N, V ), 0.0, 1.0);\n";
                shader += "float lod = roughness * 6.0;";

                shader += "diffuse = textureCube( diffuseEnvironmentMap, N ).rgb;\n";

                if ( x3dom.caps.TEXTURE_LOD || x3dom.caps.WEBGL_VERSION == 2 )
                {
                    shader += "specular = textureCubeLodEXT( specularEnvironmentMap, R, lod ).rgb;\n";
                }
                else
                {
                    shader += "float level = calcMipLevel(dirToCubeUV(R));\n";
                    shader += "float bias  = lod - level;\n";
                    shader += "specular    = textureCube( specularEnvironmentMap, R, bias ).rgb;\n";
                }

                //Calculate specular lighting from precomputed maps
                shader += "vec3 brdf      = texture2D( brdfMap, vec2( NoV, roughness ) ).rgb;\n";
                shader += "_specularColor = ( _specularColor * brdf.x + brdf.y );\n";
            }
        }

        shader += "color.rgb = _emissiveColor + ((ambient + diffuse) * color.rgb + specular * _specularColor) * _occlusion;\n";
        if ( properties.IS_PARTICLE || properties.POINTPROPERTIES )
        {
            if ( properties.TEXTURED )
            {
                shader += "if (color.a < 0.01 ) discard;\n";
            }
            else
            {
                shader += "float pAlpha = 1.0 - clamp(length((gl_PointCoord - 0.5) * 2.0), 0.0, 1.0);\n";
                shader += "if ( pAlpha < 0.01 ) discard;\n";
            }
        }
    }
    else
    {
        if ( properties.APPMAT && !properties.VERTEXCOLOR && !properties.TEXTURED && !properties.PBR_MATERIAL )
        {
            shader += "color = vec4(0.0, 0.0, 0.0, 1.0 - _transparency);\n";
        }

        if ( properties.TEXTURED && ( properties.DIFFUSEMAP || properties.DIFFPLACEMENTMAP || properties.TEXT ) )
        {
            if ( properties.PIXELTEX )
            {
                if ( properties.IS_PARTICLE || properties.POINTPROPERTIES )
                {
                    shader += "vec2 texCoord = clamp(gl_PointCoord, 0.01, 0.99);\n";
                }
                else
                {
                    shader += "vec2 texCoord = fragTexcoord;\n";
                }
            }
            else
            {
                if ( properties.IS_PARTICLE || properties.POINTPROPERTIES )
                {
                    shader += "vec2 texCoord = clamp(gl_PointCoord, 0.01, 0.99);\n";
                    shader += "texCoord.y = 1.0 - texCoord.y;\n";
                }
                else
                {
                    shader += "vec2 texCoord = vec2(fragTexcoord.x, 1.0-fragTexcoord.y);\n";
                }
            }
            shader += "texColor = " + x3dom.shader.decodeGamma( properties, "texture2D(diffuseMap, texCoord)" ) + ";\n";
            shader += "color.a = texColor.a;\n";

            if ( properties.BLENDING || properties.IS_PARTICLE || properties.POINTPROPERTIES )
            {
                shader += "if (color.a < 0.01 ) discard;\n";
                shader += "color.rgb += _emissiveColor.rgb;\n";
                shader += "color.rgb *= texColor.rgb;\n";
            }
            else
            {
                shader += "color = texColor;\n";
            }
        }
        else if ( !properties.VERTEXCOLOR && !properties.PBR_MATERIAL && !properties.POINTLINE2D )
        {
            shader += "color.rgb += _emissiveColor;\n";
        }
        else if ( !properties.VERTEXCOLOR && !properties.PBR_MATERIAL && properties.POINTLINE2D )
        {
            shader += "color.rgb = _emissiveColor;\n";
            if ( properties.IS_PARTICLE )
            {
                shader += "float pAlpha = 1.0 - clamp(length((gl_PointCoord - 0.5) * 2.0), 0.0, 1.0);\n";
                shader += "color.rgb *= vec3(pAlpha);\n";
                shader += "color.a = pAlpha;\n";
            }
            else if ( properties.POINTPROPERTIES && !properties.TEXTURED )
            {
                shader += "float pAlpha = 1.0 - clamp(length((gl_PointCoord - 0.5) * 2.0), 0.0, 1.0);\n";
                shader += "if ( pAlpha < 0.01 ) discard;\n";
            }
        }
        else if ( properties.IS_PARTICLE )
        {
            shader += "float pAlpha = 1.0 - clamp(length((gl_PointCoord - 0.5) * 2.0), 0.0, 1.0);\n";
            shader += "color.rgb *= vec3(pAlpha);\n";
            shader += "color.a = pAlpha;\n";
        }
        else if ( properties.POINTPROPERTIES && !properties.TEXTURED )
        {
            shader += "float pAlpha = 1.0 - clamp(length((gl_PointCoord - 0.5) * 2.0), 0.0, 1.0);\n";
            shader += "if ( pAlpha < 0.01 ) discard;\n";
        }
    }

    if ( properties.CLIPPLANES )
    {
        shader += "if (cappingColor.r != -1.0) {\n";
        shader += "    color.rgb = cappingColor;\n";
        shader += "}\n";
    }

    //Kill pixel
    if ( properties.TEXT )
    {
        shader += "if (color.a < (1.0 - _transparency) * 0.5) discard;\n";
    }
    else if ( properties.ALPHAMASK )
    {
        shader += "if (color.a <= alphaCutoff) discard;\n";
        shader += "color.a = 1.0;\n";
    }
    else
    {
        shader += "if (color.a <= alphaCutoff) discard;\n";
    }

    //Output the gamma encoded result.
    shader += "if(tonemappingOperator == 1.0) {\n";
    shader += "       color.rgb = tonemapReinhard(color.rgb);\n";
    shader += "    }\n";
    shader += "    if(tonemappingOperator == 2.0) {\n";
    shader += "       color.rgb = tonemapUncharted2(color.rgb);\n";
    shader += "    }\n";
    shader += "    if(tonemappingOperator == 3.0) {\n";
    shader += "       color.rgb = tonemapeFilmic(color.rgb);\n";
    shader += "    }\n";

    shader += "color = " + x3dom.shader.encodeGamma( properties, "color" ) + ";\n";

    //Fog
    if ( properties.FOG )
    {
        shader += "float f0 = calcFog(fragEyePosition);\n";
        shader += "color.rgb = fogColor * (1.0-f0) + f0 * (color.rgb);\n";
    }

    shader += "gl_FragColor = color;\n";

    //End Of Shader
    shader += "}\n";

    if ( version == 2 )
    {
        shader = x3dom.shader.convertFragmentShader( shader );
    }

    var fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource( fragmentShader, shader );
    gl.compileShader( fragmentShader );

    if ( !gl.getShaderParameter( fragmentShader, gl.COMPILE_STATUS ) )
    {
        x3dom.debug.logInfo( "FRAGMENT:\n" + shader );
        x3dom.debug.logError( "FragmentShader " + gl.getShaderInfoLog( fragmentShader ) );
    }

    return fragmentShader;
};
