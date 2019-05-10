x3dom.shader.FRAG_COLOR = "x3dom_fragColor";

x3dom.shader.convertVertexShader = function ( shader )
{
    //Converts all "attribute" to "in"
    shader = shader.replace(/attribute/g, "in");

    //Converts all "varying" to "out"
    shader = shader.replace(/varying/g, "out");

    //Converts all "texture2D" to "texture"
    shader = shader.replace(/texture2D/g, "texture");

    return "#version 300 es\n" + shader;
}

x3dom.shader.convertFragmentShader = function ( shader )
{
    shader = shader.replace(/varying/g, "in");

    shader = shader.replace(/textureCubeLodEXT/g, "textureLod");

    shader = shader.replace(/texture2D|textureCube/g, "texture");

    shader = shader.replace(/\/\/@insertFragColor/g, "out vec4 " + x3dom.shader.FRAG_COLOR + ";\n");

    shader = shader.replace(/gl_FragColor/g, x3dom.shader.FRAG_COLOR);

    return "#version 300 es\n" + shader;
}