/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */


/* ### TriangleSet ### */
x3dom.registerNodeType(
    "TriangleSet",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DComposedGeometryNode,

        /**
         * Constructor for TriangleSet
         * @constructs x3dom.nodeTypes.TriangleSet
         * @x3d 3.3
         * @component Rendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DComposedGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc TriangleSet is a geometry node that can contain a Color, Coordinate, Normal and TextureCoordinate node.
         * Hint: insert a Shape node before adding geometry or Appearance.
         * You can also substitute a type-matched ProtoInstance for content.
         */
        function (ctx) {
            x3dom.nodeTypes.TriangleSet.superClass.call(this, ctx);

        },
        {
            _buildGeometry: function()
            {
                var colPerVert = this._vf.colorPerVertex;
                var normPerVert = this._vf.normalPerVertex;
                var ccw = this._vf.ccw;

                var hasNormal = false, hasTexCoord = false, hasColor = false;
                var positions, normals, texCoords, colors;

                var coordNode = this._cf.coord.node;
                x3dom.debug.assert(coordNode);

                if(!coordNode || coordNode._vf.point.length < 3)
                {
                    this._vf.render = false;
                    return;
                }

                positions = coordNode._vf.point;

                var normalNode = this._cf.normal.node;
                if (normalNode) {
                    hasNormal = true;
                    normals = normalNode._vf.vector;
                }
                else {
                    hasNormal = false;
                }

                var texMode = "", numTexComponents = 2;
                var texCoordNode = this._cf.texCoord.node;
                if (x3dom.isa(texCoordNode, x3dom.nodeTypes.MultiTextureCoordinate)) {
                    if (texCoordNode._cf.texCoord.nodes.length)
                        texCoordNode = texCoordNode._cf.texCoord.nodes[0];
                }
                if (texCoordNode) {
                    if (texCoordNode._vf.point) {
                        hasTexCoord = true;
                        texCoords = texCoordNode._vf.point;

                        if (x3dom.isa(texCoordNode, x3dom.nodeTypes.TextureCoordinate3D)) {
                            numTexComponents = 3;
                        }
                    }
                    else if (texCoordNode._vf.mode) {
                        texMode = texCoordNode._vf.mode;
                    }
                }
                else {
                    hasTexCoord = false;
                }

                var numColComponents = 3;
                var colorNode = this._cf.color.node;
                if (colorNode) {
                    hasColor = true;
                    colors = colorNode._vf.color;

                    if (x3dom.isa(colorNode, x3dom.nodeTypes.ColorRGBA)) {
                        numColComponents = 4;
                    }
                }
                else {
                    hasColor = false;
                }

                while (positions.length % 3 > 0) {
                    positions.pop();
                }

                this._mesh._indices[0] = new Array(positions.length);
                this._mesh._positions[0] = [];
                this._mesh._normals[0] = [];
                this._mesh._texCoords[0] = [];
                this._mesh._colors[0] = [];

                var posMax = positions.length / 3;
                var faceCnt, i = 0;

                for (faceCnt=0; faceCnt<posMax; faceCnt++)
                {
                    // FIXME; get rid of useless internal index field, but this requires modification of renderer
                    this._mesh._indices[0][i] = i++;
                    this._mesh._indices[0][i] = i++;
                    this._mesh._indices[0][i] = i++;

                    if(!normPerVert && hasNormal) {
                        this._mesh._normals[0].push(normals[faceCnt].x);
                        this._mesh._normals[0].push(normals[faceCnt].y);
                        this._mesh._normals[0].push(normals[faceCnt].z);
                    }
                    if(!colPerVert && hasColor) {
                        this._mesh._colors[0].push(colors[faceCnt].r);
                        this._mesh._colors[0].push(colors[faceCnt].g);
                        this._mesh._colors[0].push(colors[faceCnt].b);
                        if (numColComponents === 4) {
                            this._mesh._colors[0].push(colors[faceCnt].a);
                        }
                    }
                }

                this._mesh._positions[0] = positions.toGL();

                if (hasNormal) {
                    this._mesh._normals[0] = normals.toGL();
                }
                else {
                    this._mesh.calcNormals(normPerVert ? Math.PI : 0, ccw);
                }

                if (hasTexCoord) {
                    this._mesh._texCoords[0] = texCoords.toGL();
                    this._mesh._numTexComponents = numTexComponents;
                }
                else {
                    this._mesh.calcTexCoords(texMode);
                }

                if (hasColor && colPerVert) {
                    this._mesh._colors[0] = colors.toGL();
                    this._mesh._numColComponents = numColComponents;
                }

                this._mesh._numFaces = posMax;
                this._mesh._numCoords = positions.length;

                this.invalidateVolume();

            },

            nodeChanged: function()
            {
                this._buildGeometry();
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName == "coord")
                {
                    this._buildGeometry();

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        node.invalidateVolume();
                    });
                }
                else if (fieldName == "color")
                {
                    this._buildGeometry();

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.colors = true;
                    });
                }
                else if (fieldName == "normal")
                {
                    this._buildGeometry();

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.normals = true;
                    });
                }
                else if (fieldName == "texCoord")
                {
                    this._buildGeometry();

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.texcoords = true;
                    });
                }
            }
        }
    )
);