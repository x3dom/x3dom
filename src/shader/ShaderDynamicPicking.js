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
x3dom.shader.DynamicShaderPicking = function ( gl, properties, pickMode )
{
    this.program = gl.createProgram();

    var vertexShader   = this.generateVertexShader( gl, properties, pickMode );
    var fragmentShader = this.generateFragmentShader( gl, properties, pickMode );

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
x3dom.shader.DynamicShaderPicking.prototype.generateVertexShader = function ( gl, properties, pickMode )
{
    var shader = "";

    /*******************************************************************************
    * Generate dynamic attributes & uniforms & varyings
    ********************************************************************************/

    //Default Matrices
    shader += "uniform mat4 modelMatrix;\n";
    shader += "uniform mat4 modelViewProjectionMatrix;\n";

    shader += "uniform mat4 modelMatrix2;\n";
    shader += "uniform mat4 modelViewProjectionMatrix2;\n";

    shader += "uniform float isVR;\n";
    shader += "attribute float eyeIdx;\n";
    shader += "varying float vrOffset;\n";
    shader += "varying float fragEyeIdx;\n";

    shader += "attribute vec3 position;\n";
    shader += "uniform vec3 from;\n";
    shader += "varying vec3 worldCoord;\n";

    if ( pickMode == 1 )
    { // Color Picking
        shader += "attribute vec3 color;\n";
        shader += "varying vec3 fragColor;\n";
    }
    else if ( pickMode == 2 )
    { //TexCoord Picking
        shader += "attribute vec2 texcoord;\n";
        shader += "varying vec3 fragColor;\n";
    }

    //Bounding stuff
    if ( properties.REQUIREBBOX )
    {
        shader += "uniform vec3 bgCenter;\n";
        shader += "uniform vec3 bgSize;\n";
        shader += "uniform float bgPrecisionMax;\n";
    }
    if ( properties.REQUIREBBOXCOL )
    {
        shader += "uniform float bgPrecisionColMax;\n";
    }
    if ( properties.REQUIREBBOXTEX )
    {
        shader += "uniform float bgPrecisionTexMax;\n";
    }

    //ShadowID stuff
    if ( properties.VERTEXID )
    {
        shader += "uniform float shadowIDs;\n";

        if ( pickMode == 3 )
        { //24bit
            shader += "varying vec3 idCoord;\n";
        }
        else
        {
            shader += "varying vec2 idCoord;\n";
        }
        shader += "varying float fragID;\n";
        shader += "attribute float id;\n";
    }

    //PopGeometry
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

    if ( properties.IS_PARTICLE )
    {
        shader += "attribute vec3 particleSize;\n";
    }

    //PointProperties
    if ( properties.POINTPROPERTIES )
    {
        shader += "uniform vec3 pointSizeAttenuation;\n";
        shader += "uniform float pointSizeFactor;\n";
        shader += "uniform float minPointSize;\n";
        shader += "uniform float maxPointSize;\n";
    }

    //ClipPlane stuff
    if ( properties.CLIPPLANES || properties.POINTPROPERTIES )
    {
        shader += "uniform mat4 modelViewMatrix;\n";
        shader += "uniform mat4 modelViewMatrix2;\n";
        shader += "uniform vec3 eyePosition;\n";
        shader += "varying vec4 fragPosition;\n";
        shader += "varying vec4 fragPositionWS;\n";
    }

    /*******************************************************************************
    * Generate main function
    ********************************************************************************/

    shader += "void main(void) {\n";

    shader += "fragEyeIdx = eyeIdx;\n";

    shader += "vec3 pos = position;\n";

    if ( properties.VERTEXID )
    {
        if ( pickMode == 0 )
        { //Default Picking
            shader += "idCoord = vec2((id + shadowIDs) / 256.0);\n";
            shader += "idCoord.x = floor(idCoord.x) / 255.0;\n";
            shader += "idCoord.y = fract(idCoord.y) * 1.00392156862745;\n";
            shader += "fragID = id;\n";
        }
        else if ( pickMode == 3 )
        { //Picking with 24bit precision
            //composed id is at least 32 (= 2*16) bit + num bits for max-orig-shape-id
            shader += "float ID = id + shadowIDs;\n";
            //however, let's ignore this and assume a maximum of 24 bits for all id's
            shader += "float h = floor(ID / 256.0);\n";
            shader += "idCoord.x = ID - (h * 256.0);\n";
            shader += "idCoord.z = floor(h / 256.0);\n";
            shader += "idCoord.y = h - (idCoord.z * 256.0);\n";
            shader += "idCoord = idCoord.zyx / 255.0;\n";
            shader += "fragID = id;\n";
        }
        else if ( pickMode == 4 )
        { //Picking with 32bit precision
            shader += "idCoord = vec2((id + shadowIDs) / 256.0);\n";
            shader += "idCoord.x = floor(idCoord.x) / 255.0;\n";
            shader += "idCoord.y = fract(idCoord.y) * 1.00392156862745;\n";
            shader += "fragID = id;\n";
        }
    }

    /*******************************************************************************
     * Start of special Geometry switch
     ********************************************************************************/
    if ( properties.POPGEOMETRY )
    { //PopGeometry
        shader += "vec3 offsetVec = step(pos / bgPrecisionMax, PG_bbMaxModF) * PG_bboxShiftVec;\n";
        shader += "if (PG_precisionLevel <= 2.0) {\n";
        shader += "pos = floor(pos / PG_powPrecision) * PG_powPrecision;\n";
        shader += "pos /= (65536.0 - PG_powPrecision);\n";
        shader += "}\n";
        shader += "else {\n";
        shader += "pos /= bgPrecisionMax;\n";
        shader += "}\n";
        shader += "pos = (pos + offsetVec + PG_bbMin) * PG_maxBBSize;\n";
    }
    else
    {
        if ( properties.REQUIREBBOX )
        {
            shader += "pos = bgCenter + bgSize * pos / bgPrecisionMax;\n";
        }

        if ( pickMode == 1 && !properties.REQUIREBBOXCOL )
        { //Color Picking
            shader += "fragColor = color;\n";
        }
        else if ( pickMode == 1 && properties.REQUIREBBOXCOL )
        { //Color Picking
            shader += "fragColor = color / bgPrecisionColMax;\n";
        }
        else  if ( pickMode == 2 && !properties.REQUIREBBOXTEX )
        { //TexCoord Picking
            shader += "fragColor = vec3(abs(texcoord.x), abs(texcoord.y), 0.0);\n";
        }
        else if ( pickMode == 2 && properties.REQUIREBBOXTEX )
        { //TexCoord Picking
            shader += "vec2 texCoord = texcoord / bgPrecisionTexMax;\n";
            shader += "fragColor = vec3(abs(texCoord.x), abs(texCoord.y), 0.0);\n";
        }
    }

    if ( properties.CLIPPLANES || properties.POINTPROPERTIES )
    {
        shader += "if(eyeIdx == 1.0){\n";
        shader += "    fragPosition = (modelViewMatrix2 * vec4(pos, 1.0));\n";
        shader += "}else{\n";
        shader += "    fragPosition = (modelViewMatrix * vec4(pos, 1.0));\n";
        shader += "}\n";
    }

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

    shader += "worldCoord = (modelMatrix * vec4(pos, 1.0)).xyz - from;\n";

    shader += "if(eyeIdx == 1.0){\n";
    shader += "    gl_Position = modelViewProjectionMatrix2 * vec4(pos, 1.0);\n";
    shader += "}else{\n";
    shader += "    gl_Position = modelViewProjectionMatrix * vec4(pos, 1.0);\n";
    shader += "}\n";

    shader += "if(isVR == 1.0){\n";
    shader += "    vrOffset = eyeIdx * 0.5;\n";
    shader += "    gl_Position.x *= 0.5;\n";
    shader += "    gl_Position.x += vrOffset * gl_Position.w;\n";
    shader += "}\n";

    //END OF SHADER
    shader += "}\n";

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
x3dom.shader.DynamicShaderPicking.prototype.generateFragmentShader = function ( gl, properties, pickMode )
{
    var shader = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n";
    shader += " precision highp float;\n";
    shader += "#else\n";
    shader += " precision mediump float;\n";
    shader += "#endif\n\n";

    /*******************************************************************************
    * Generate dynamic uniforms & varyings
    ********************************************************************************/

    shader += "uniform float highBit;\n";
    shader += "uniform float lowBit;\n";
    shader += "uniform float sceneSize;\n";
    shader += "varying vec3 worldCoord;\n";

    shader += "uniform float isVR;\n";
    shader += "varying float vrOffset;\n";
    shader += "varying float fragEyeIdx;\n";
    shader += "uniform float screenWidth;\n";

    if ( pickMode == 1 || pickMode == 2 )
    {
        shader += "varying vec3 fragColor;\n";
    }

    //ShadowID stuff
    if ( properties.VERTEXID )
    {
        if ( pickMode == 3 )
        { //24bit
            shader += "varying vec3 idCoord;\n";
        }
        else
        {
            shader += "varying vec2 idCoord;\n";
        }
        shader += "varying float fragID;\n";
    }

    //ClipPlane stuff
    if ( properties.CLIPPLANES )
    {
        shader += "uniform mat4 viewMatrixInverse;\n";
        shader += "uniform mat4 viewMatrixInverse2;\n";
        shader += "varying vec4 fragPosition;\n";
    }

    if ( properties.CLIPPLANES )
    {
        shader += x3dom.shader.clipPlanes( properties.CLIPPLANES );
    }

    /*******************************************************************************
    * Generate main function
    ********************************************************************************/
    shader += "void main(void) {\n";

    shader += "if ( isVR == 1.0) {\n";
    shader += "    if ( ( step( 0.5, gl_FragCoord.x / screenWidth ) - 0.5 ) * vrOffset < 0.0 ) discard;\n";
    shader += "}\n";

    if ( properties.CLIPPLANES )
    {
        shader += "calculateClipPlanes();\n";
    }

    if ( pickMode == 1 || pickMode == 2 )
    { //Picking Color || Picking TexCoord
        shader += "vec4 color = vec4(fragColor, lowBit);\n";
    }
    else if ( pickMode == 4 )
    { //Picking with 32bit precision
        shader += "vec4 color = vec4(highBit, lowBit, 0.0, 0.0);\n";
    }
    else
    {
        shader += "vec4 color = vec4(0.0, 0.0, highBit, lowBit);\n";
    }

    if ( properties.VERTEXID )
    {
        if ( pickMode == 0 || pickMode == 4 )
        { //Default Picking || Picking with 32bit precision
            shader += "color.ba = idCoord;\n";
        }
        else if ( pickMode == 3 )
        { //Picking with 24bit precision
            shader += "color.gba = idCoord;\n";
        }
    }

    if ( pickMode != 1 && pickMode != 2 )
    {
        shader += "float d = length(worldCoord) / sceneSize;\n";
    }

    if ( pickMode == 0 )
    { //Default Picking
        shader += "vec2 comp = fract(d * vec2(256.0, 1.0));\n";
        shader += "color.rg = comp - (comp.rr * vec2(0.0, 1.0/256.0));\n";
    }
    else if ( pickMode == 3 )
    { //Picking with 24bit precision
        shader += "color.r = d;\n";
    }

    if ( ( properties.POINTPROPERTIES || properties.IS_PARTICLE ) && !properties.TEXTURED )
    {
        shader += "float pAlpha = 1.0 - clamp(length((gl_PointCoord - 0.5) * 2.0), 0.0, 1.0);\n";
        shader += "if ( pAlpha < 0.01 ) discard;\n";
    }

    shader += "gl_FragColor = color;\n";

    //END OF SHADER
    shader += "}\n";

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
