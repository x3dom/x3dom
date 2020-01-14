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
 * Generate the final ShadowShader program
 */
x3dom.shader.BackgroundSkyTextureShader = function ( gl )
{
    this.program = gl.createProgram();

    var vertexShader    = this.generateVertexShader( gl );
    var fragmentShader  = this.generateFragmentShader( gl );

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
x3dom.shader.BackgroundSkyTextureShader.prototype.generateVertexShader = function ( gl )
{
    var shader =     "attribute vec3 position;\n" +
                    "attribute vec2 texcoord;\n" +
                    "uniform mat4 modelViewProjectionMatrix;\n" +
                    "uniform mat4 modelViewProjectionMatrix2;\n" +
                    "varying vec2 fragTexCoord;\n" +
                    "uniform float isVR;\n" +
                    "attribute float eyeIdx;\n" +
                    "varying float vrOffset;\n" +
                    "varying float fragEyeIdx;\n" +
                    "\n" +
                    "void main(void) {\n" +
                    "    fragTexCoord = texcoord;\n" +
                    "     fragEyeIdx = eyeIdx;\n" +
                    "     if(eyeIdx == 1.0){\n" +
                    "       gl_Position = modelViewProjectionMatrix2 * vec4(position, 1.0);\n" +
                    "     } else {\n" +
                    "       gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);\n" +
                    "     }\n" +
                    "     if(isVR == 1.0){\n" +
                    "        vrOffset = eyeIdx * 0.5;\n" +
                    "        gl_Position.x *= 0.5;\n" +
                    "        gl_Position.x += vrOffset * gl_Position.w;\n" +
                    "     }\n" +
                    "}\n";

    var vertexShader = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource( vertexShader, shader );
    gl.compileShader( vertexShader );

    if ( !gl.getShaderParameter( vertexShader, gl.COMPILE_STATUS ) )
    {
        x3dom.debug.logError( "[BackgroundSkyTextureShader] VertexShader " + gl.getShaderInfoLog( vertexShader ) );
    }

    return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.BackgroundSkyTextureShader.prototype.generateFragmentShader = function ( gl )
{
    var shader = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n";
    shader += "precision highp float;\n";
    shader += "#else\n";
    shader += " precision mediump float;\n";
    shader += "#endif\n\n";

    shader += "uniform float isVR;\n" +
              "varying float vrOffset;\n" +
              "varying float fragEyeIdx;\n" +
              "uniform float screenWidth;\n" + "uniform sampler2D tex;\n" +
              "varying vec2 fragTexCoord;\n" +
              "\n" +
              "void main(void) {\n" +
              "    if ( isVR == 1.0 ) {\n" +
              "        if ( ( step( 0.5, gl_FragCoord.x / screenWidth ) - 0.5 ) * vrOffset < 0.0 ) discard;\n" +
              "    }\n" +
              "    gl_FragColor = texture2D(tex, fragTexCoord);\n" +
              "}\n";

    var fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource( fragmentShader, shader );
    gl.compileShader( fragmentShader );

    if ( !gl.getShaderParameter( fragmentShader, gl.COMPILE_STATUS ) )
    {
        x3dom.debug.logError( "[BackgroundSkyTextureShader] FragmentShader " + gl.getShaderInfoLog( fragmentShader ) );
    }

    return fragmentShader;
};
