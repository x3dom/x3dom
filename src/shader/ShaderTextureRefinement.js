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
 * Generate the final shader program
 * TODO: NOT YET USEFUL, IMPLEMENT SHADERS
 */
x3dom.shader.TextureRefinementShader = function (gl) {
    this.program = gl.createProgram();

    var vertexShader = this.generateVertexShader(gl);
    var fragmentShader = this.generateFragmentShader(gl);

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
x3dom.shader.TextureRefinementShader.prototype.generateVertexShader = function (gl) {
    var shader = "attribute vec2 position;\n" +
                 "varying vec2 fragTexCoord;\n" +
                 "\n" +
                 "void main(void) {\n" +
                 "    fragTexCoord = (position.xy + 1.0) / 2.0;\n" +
                 "    gl_Position = vec4(position, -1.0, 1.0);\n" +
                 "}\n";

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, shader);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        x3dom.debug.logError("[TextureRefinementShader] VertexShader " + gl.getShaderInfoLog(vertexShader));
    }

    return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.TextureRefinementShader.prototype.generateFragmentShader = function (gl) {
    var shader = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n" +
                 " precision highp float;\n" +
                 "#else\n" +
                 " precision mediump float;\n" +
                 "#endif\n\n";

    shader += "uniform sampler2D stamp;\n" +
              "uniform sampler2D lastTex;\n" +
              "uniform sampler2D curTex;\n" +
              "uniform int mode;\n" +
              "uniform vec2 repeat;\n" +
              "varying vec2 fragTexCoord;\n" +
              "\n" +
              "void init(void);\n" +
              "void refine(void);\n" +
              "void main(void) {\n" +
              "    if (mode == 0) { init(); }\n" +
              "    else { refine(); }\n" +
              "}\n" +
              "\n" +
              "void init(void) {\n" +
              "    gl_FragColor = texture2D(curTex, fragTexCoord);\n" +
              "}\n" +
              "\n" +
              "void refine(void) {\n" +
              "    vec3 red = texture2D(stamp, vec2(repeat.x*fragTexCoord.x," +
              "                                     repeat.y*fragTexCoord.y)).rgb;\n" +
              "    vec3 v1 = texture2D(lastTex, fragTexCoord).rgb;\n" +
              "    vec3 v2 = texture2D(curTex, fragTexCoord).rgb;\n" +
              "    if (red.r <= 0.5) {\n" +
              "        gl_FragColor = vec4(v1.rgb, 1.0);\n" +
              "    }\n" +
              "    else {\n" +
              "        gl_FragColor = vec4(v2.rgb, 1.0);\n" +
              "    }\n" +
              "}\n";

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        x3dom.debug.logError("[TextureRefinementShader] FragmentShader " + gl.getShaderInfoLog(fragmentShader));
    }

    return fragmentShader;
};
