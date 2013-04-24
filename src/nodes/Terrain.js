/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Michael Englert
 */

// ### Terrain ###
x3dom.registerNodeType(
    "Terrain",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DLODNode,
        function (ctx) {
            x3dom.nodeTypes.Terrain.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'scale', 1.0);
            this.addField_SFFloat(ctx, 'factor', 1.0);
            this.addField_SFFloat(ctx, 'maxDepth', 3.0);
            this.addField_SFVec2f(ctx, 'size', 1, 1);
            this.addField_SFVec2f(ctx, 'subdivision', 10, 10);
            this.addField_SFString(ctx, 'heightUrl', "");
            this.addField_SFString(ctx, 'colorUrl', "");

            this.maxChildren = 2;
            this.test = 0;
            this.createChildren = 0;
            this.cnt = 0;

            // creating the root-node of the quadtree
            this.rootNode = new QuadtreeNode(ctx, this, this._vf.colorUrl, this._vf.heightUrl,
                                             this._vf.maxDepth, 0, 0, this._vf.factor,
                                             new x3dom.fields.SFMatrix4f.identity(),
                                             null, 0, 0);

        },
        {

            visitChildren: function (transform, out) {
                if (this.cnt > 5) {
                    if (this.test == 4) {
                        this.createChildren = 0;
                        this.test = 0;
                    }
                    else {
                        this.test++;
                    }
                    this.rootNode.CollectDrawables(transform, out);
                }
                else {
                    this.cnt++;
                }
            }
        }
    )
);



/*
 * Defines one node of a quadtree that represents a part (nxn vertices) of the whole mesh.
 */
function QuadtreeNode(ctx, navigation, colorUrl, heightUrl, maxDepth, level, nodeNumber,
                      factor, nodeTransformation, shader, columnNr, rowNr) {
    // array with the maximal four child nodes
    var children = [];
    // path to x3d-file that should be loaded
    var path = colorUrl + "/" + level + "/" + columnNr + "/";
    // drawable component of this node
    var shape = new x3dom.nodeTypes.Shape();
    // 2D-Mesh that will represent the geometry of this node
    var geometry = new x3dom.nodeTypes.BinaryGeometry(ctx);
    // position of the node in world space
    var position;
    // stores if file has been loaded
    var isPossible = false;
    // address of the image for the terrain height-data
    var file = path + rowNr + ".x3d";
    // loader for binary geometry files
    var xhr = new XMLHttpRequest();
    xhr.open("GET", file, false);

    try {
        xhr.send();
        var xmlDoc = xhr.responseXML;
        if (xmlDoc != null) {
            var replacer = new RegExp("\"", "g");
            createGeometry();
            isPossible = true;
        }
        var imgAddress = path + (xmlDoc.getElementsByTagName("ImageTexture")[0].attributes.url.nodeValue.replace(replacer, ""));
    }
    catch (exp) { }



    function createGeometry() {
        try {
            var binGeo = xmlDoc.getElementsByTagName("BinaryGeometry")[0];
            var temp = binGeo.attributes.vertexCount.nodeValue.split(" ");
            geometry._vf.vertexCount = new x3dom.fields.MFInt32(temp);
            var strArr = ["TRIANGLESTRIP", "TRIANGLES"];
            geometry._vf.primType = new x3dom.fields.MFString(strArr);
            temp = binGeo.attributes.size.nodeValue.split(" ");
            geometry._vf.size = new x3dom.fields.SFVec3f(temp[0].replace(replacer, ""), temp[1].replace(replacer, ""), temp[2].replace(replacer, ""));
            temp = binGeo.attributes.position.nodeValue.split(" ");
            geometry._vf.position = new x3dom.fields.SFVec3f(temp[0].replace(replacer, ""), temp[1].replace(replacer, ""), temp[2].replace(replacer, ""));
            // calculate the average position of the node
            position = geometry._vf.position;
            geometry._vf.index = path + binGeo.attributes.index.nodeValue;
            geometry._vf.coord = path + binGeo.attributes.coord.nodeValue;
            geometry._vf.normal = path + binGeo.attributes.normal.nodeValue;
            geometry._vf.texCoord = path + binGeo.attributes.texCoord.nodeValue;
        } catch (exp) {}
    }


    function initialize() {

        // appearance of the drawable component of this node
        var appearance = new x3dom.nodeTypes.Appearance(ctx);
        // multiTexture to get heightmap and colormap to gpu
        var textures = new x3dom.nodeTypes.MultiTexture(ctx);
        // texture that should represent the surface-data of this node
        var colorTexture = new x3dom.nodeTypes.ImageTexture(ctx);
        // texture that should represent the height-data of this node
        var heightTexture = new x3dom.nodeTypes.ImageTexture(ctx);

        // definition of the nameSpace of this shape
        shape._nameSpace = navigation._nameSpace;

        colorTexture._nameSpace = navigation._nameSpace;
        colorTexture._vf.url[0] = imgAddress;
        colorTexture._vf.repeatT = false;
        colorTexture._vf.repeatS = false;
        textures.addChild(colorTexture, 'texture');
        colorTexture.nodeChanged();

        appearance.addChild(textures);
        textures.nodeChanged();
        shape.addChild(appearance);
        appearance.nodeChanged();
        shape.addChild(geometry);
        geometry.nodeChanged();
    }



    function createVertexShader() {
        return "attribute vec3 position;\n" +
            "attribute vec3 texcoord;\n" +
            "uniform mat4 modelViewProjectionMatrix;\n" +
            "uniform sampler2D texHeight;\n" +
            "varying vec3 col;\n" +
            "varying vec2 texC;\n" +
            "\n" +
            "void main(void) {\n" +
            "    vec4 height = texture2D(texHeight, vec2(texcoord[0], 1.0-texcoord[1]));\n" +
            "    texC = vec2(texcoord[0], 1.0-texcoord[1]);\n" +
            "    col.x = height[0];\n" +
            "    col.y = height[1];\n" +
            "    col.z = height[2];\n" +
            "    gl_Position = modelViewProjectionMatrix * vec4(position.x, position.y, height.x * 0.1, 1.0);\n" +
            "}\n";
    }



    function createFragmentShader() {
        return "#ifdef GL_ES\n" +
            "  precision highp float;\n" +
            "#endif\n" +
            "uniform sampler2D texColor;\n" +
            "varying vec2 texC;\n" +
            "varying vec3 col;\n" +
            "\n" +
            "\n" +
            "void main(void) {\n" +
            "    vec4 colr = texture2D(texColor, texC);\n" +
            "    gl_FragColor = vec4(colr.x, colr.y, colr.z, 1.0);\n" +
            "}\n";
    }



    // creates the four child-nodes
    function create() {

        // CREATE ALL FOUR CHILDREN
        var deltaR = Math.sqrt(Math.pow(4, level));
        var deltaR1 = Math.sqrt(Math.pow(4, level + 1));
        var lt = Math.floor(nodeNumber / deltaR) * 4 * deltaR + (nodeNumber % deltaR) * 2;
        var rt = lt + 1;
        var lb = lt + deltaR1;
        var rb = lb + 1;
        var s = (navigation._vf.size).multiply(0.25);

        children.push(new QuadtreeNode(ctx, navigation, colorUrl, heightUrl, maxDepth, (level + 1), lt, factor, nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(new x3dom.fields.SFVec3f(-s.x, s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), shader, (columnNr * 2), (rowNr * 2)));
        children.push(new QuadtreeNode(ctx, navigation, colorUrl, heightUrl, maxDepth, (level + 1), rt, factor, nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(new x3dom.fields.SFVec3f(s.x, s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), shader, (columnNr * 2 + 1), (rowNr * 2)));
        children.push(new QuadtreeNode(ctx, navigation, colorUrl, heightUrl, maxDepth, (level + 1), lb, factor, nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(new x3dom.fields.SFVec3f(-s.x, -s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), shader, (columnNr * 2), (rowNr * 2 + 1)));
        children.push(new QuadtreeNode(ctx, navigation, colorUrl, heightUrl, maxDepth, (level + 1), rb, factor, nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(new x3dom.fields.SFVec3f(s.x, -s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), shader, (columnNr * 2 + 1), (rowNr * 2 + 1)));
    }



    // here the decision is taken if new children should be created
    // and which should be rendered
    this.CollectDrawables = function (transform, out) {

        if (isPossible) {

            var distanceToCamera = position.subtract(navigation._eye).length();

            if ((distanceToCamera < Math.pow((maxDepth - level), 5) / factor)) {
                if (children.length == 0 && navigation.createChildren == 0) {
                    navigation.createChildren++;
                    create();
                }
                else if (children.length == 0 && navigation.createChildren > 0) {
                    shape.collectDrawableObjects(nodeTransformation, out);
                }
                else {
                    for (var i = 0; i < children.length; i++) {
                        children[i].CollectDrawables(transform, out);
                    }
                }
            }
            else {
                shape.collectDrawableObjects(transform, out);
            }
        }
    }



    // initializes this node directly after creating
    initialize();
}
