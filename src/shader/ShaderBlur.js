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
 * Generate the final BlurShader program
 * (gaussian blur for 3x3, 5x5 and 7x7 kernels)
 */
x3dom.shader.BlurShader = function ( gl )
{
    this.program = gl.createProgram();

    var vertexShader   = this.generateVertexShader( gl );
    var fragmentShader = this.generateFragmentShader( gl );

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
x3dom.shader.BlurShader.prototype.generateVertexShader = function ( gl )
{
    var shader = "";
    shader += "attribute vec2 position;\n";

    shader += "varying vec2 vPosition;\n";

    shader += "void main(void) {\n";
    shader += " vPosition = position;\n";
    shader += " gl_Position = vec4(position, -1.0, 1.0);\n";
    shader += "}\n";

    var vertexShader = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource( vertexShader, shader );
    gl.compileShader( vertexShader );

    if ( !gl.getShaderParameter( vertexShader, gl.COMPILE_STATUS ) )
    {
        x3dom.debug.logError( "[BlurShader] VertexShader " + gl.getShaderInfoLog( vertexShader ) );
    }

    return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.BlurShader.prototype.generateFragmentShader = function ( gl )
{
    var shader = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n";
    shader += "precision highp float;\n";
    shader += "#else\n";
    shader += " precision mediump float;\n";
    shader += "#endif\n\n";

    shader += "varying vec2 vPosition;\n" +
                    "uniform sampler2D texture;\n" +
                    "uniform bool horizontal;\n" +
                    "uniform float pixelSizeHor;\n" +
                    "uniform float pixelSizeVert;\n" +
                    "uniform int filterSize;\n";

    if ( !x3dom.caps.FP_TEXTURES )
    {
        shader +=        x3dom.shader.rgbaPacking() +

                    "void main(void) {\n" +
                    "    vec2 texCoords = (vPosition + 1.0)*0.5;\n" +
                    "    vec2 offset;\n" +
                    "    if (horizontal) offset = vec2(pixelSizeHor, 0.0);\n" +
                    "    else offset = vec2(0.0, pixelSizeVert);\n" +
                    "    vec4 packedDepth = texture2D(texture, texCoords);\n" +
                    "    const vec4 clearColor = vec4(1.0, 1.0, 1.0, 0.0);\n" +
                    "    if ( packedDepth == clearColor ) { discard; };\n" +
                    "    float depth = unpackDepth(packedDepth);\n" +
                    "    if (filterSize == 3){\n" +
                    "        vec4 packedDn1 = texture2D(texture, texCoords-offset);\n" +
                    "        vec4 packedDp1 = texture2D(texture, texCoords+offset);\n" +
                    //"        if ( packedDn1 == clearColor || packedDp1 == clearColor ) { discard; };\n" +
                    "        if ( (packedDn1 - clearColor) * (packedDp1 - clearColor) == vec4(0.0) ) { discard; };\n" +
                    "        depth = depth * 0.3844;\n" +
                    "        depth += 0.3078*unpackDepth(packedDn1);\n" +
                    "        depth += 0.3078*unpackDepth(packedDp1);\n" +
                    "    } else if (filterSize == 5){\n" +
                    "        vec4 packedDn1 = texture2D(texture, texCoords-offset);\n" +
                    "        vec4 packedDp1 = texture2D(texture, texCoords+offset);\n" +
                    "        vec4 packedDn2 = texture2D(texture, texCoords-2.0*offset);\n" +
                    "        vec4 packedDp2 = texture2D(texture, texCoords+2.0*offset);\n" +
                    "        if ( packedDn1 == clearColor || packedDp1 == clearColor || " +
                    "             packedDn2 == clearColor || packedDp2 == clearColor ) { discard; };\n" +
                    // "        if ( ( packedDn1 - clearColor ) * ( packedDp1 - clearColor ) * " +
                    // "             ( packedDn2 - clearColor ) * ( packedDp2 - clearColor ) == vec4(0.0) ) { discard; };\n" +
                    "        depth = depth * 0.2921;\n" +
                    "        depth += 0.2339*unpackDepth(packedDn1);\n" +
                    "        depth += 0.2339*unpackDepth(packedDp1);\n" +
                    "        depth += 0.1201*unpackDepth(packedDn2);\n" +
                    "        depth += 0.1201*unpackDepth(packedDp2);\n" +
                    "    } else if (filterSize == 7){\n" +
                    "        vec4 packedDn1 = texture2D(texture, texCoords-offset);\n" +
                    "        vec4 packedDp1 = texture2D(texture, texCoords+offset);\n" +
                    "        vec4 packedDn2 = texture2D(texture, texCoords-2.0*offset);\n" +
                    "        vec4 packedDp2 = texture2D(texture, texCoords+2.0*offset);\n" +
                    "        vec4 packedDn3 = texture2D(texture, texCoords-3.0*offset);\n" +
                    "        vec4 packedDp3 = texture2D(texture, texCoords+3.0*offset);\n" +
                    "        if ( packedDn1 == clearColor || packedDp1 == clearColor || " +
                    "             packedDn2 == clearColor || packedDp2 == clearColor || " +
                    "             packedDn3 == clearColor || packedDp3 == clearColor ) { discard; };\n" +
                    "        depth = depth * 0.2161;\n" +
                    "        depth += 0.1907*unpackDepth(packedDn1);\n" +
                    "        depth += 0.1907*unpackDepth(packedDp1);\n" +
                    "        depth += 0.1311*unpackDepth(packedDn2);\n" +
                    "        depth += 0.1311*unpackDepth(packedDp2);\n" +
                    "        depth += 0.0702*unpackDepth(packedDn3);\n" +
                    "        depth += 0.0702*unpackDepth(packedDp3);\n" +
                    "    }\n" +
                    "    gl_FragColor = packDepth(depth);\n" +
                    "}\n";
    }
    else
    {
        shader +=        "void main(void) {\n" +
                    "    vec2 texCoords = (vPosition + 1.0)*0.5;\n" +
                    "    vec2 offset;\n" +
                    "    if (horizontal) offset = vec2(pixelSizeHor, 0.0);\n" +
                    "    else offset = vec2(0.0, pixelSizeVert);\n" +
                    "    vec4 color = texture2D(texture, texCoords);\n" +
                    "    if (filterSize == 3){\n" +
                    "        color = color * 0.3844;\n" +
                    "        color += 0.3078*texture2D(texture, texCoords-offset);\n" +
                    "        color += 0.3078*texture2D(texture, texCoords+offset);\n" +
                    "    } else if (filterSize == 5){\n" +
                    "        color = color * 0.2921;\n" +
                    "        color += 0.2339*texture2D(texture, texCoords-offset);\n" +
                    "        color += 0.2339*texture2D(texture, texCoords+offset);\n" +
                    "        color += 0.1201*texture2D(texture, texCoords-2.0*offset);\n" +
                    "        color += 0.1201*texture2D(texture, texCoords+2.0*offset);\n" +
                    "    } else if (filterSize == 7){\n" +
                    "        color = color * 0.2161;\n" +
                    "        color += 0.1907*texture2D(texture, texCoords-offset);\n" +
                    "        color += 0.1907*texture2D(texture, texCoords+offset);\n" +
                    "        color += 0.1311*texture2D(texture, texCoords-2.0*offset);\n" +
                    "        color += 0.1311*texture2D(texture, texCoords+2.0*offset);\n" +
                    "        color += 0.0702*texture2D(texture, texCoords-3.0*offset);\n" +
                    "        color += 0.0702*texture2D(texture, texCoords+3.0*offset);\n" +
                    "    }\n" +
                    "    gl_FragColor = color;\n" +
                    "}\n";
    }

    var fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource( fragmentShader, shader );
    gl.compileShader( fragmentShader );

    if ( !gl.getShaderParameter( fragmentShader, gl.COMPILE_STATUS ) )
    {
        x3dom.debug.logError( "[BlurShader] FragmentShader " + gl.getShaderInfoLog( fragmentShader ) );
    }

    return fragmentShader;
};
