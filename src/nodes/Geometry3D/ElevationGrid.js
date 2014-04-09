/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### ElevationGrid ### */
x3dom.registerNodeType(
    "ElevationGrid",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        
        /**
         * Constructor for ElevationGrid
         * @constructs x3dom.nodeTypes.ElevationGrid
         * @x3d x.x
         * @component Geometry3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.ElevationGrid.superClass.call(this, ctx);


            /**
             *
             * @var {SFBool} colorPerVertex
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'colorPerVertex', true);

            /**
             *
             * @var {SFBool} normalPerVertex
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'normalPerVertex', true);

            /**
             *
             * @var {SFFloat} creaseAngle
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'creaseAngle', 0);


            /**
             *
             * @var {MFNode} attrib
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue x3dom.nodeTypes.X3DVertexAttributeNode
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('attrib', x3dom.nodeTypes.X3DVertexAttributeNode);

            /**
             *
             * @var {SFNode} normal
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue x3dom.nodeTypes.Normal
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('normal', x3dom.nodeTypes.Normal);

            /**
             *
             * @var {SFNode} color
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue x3dom.nodeTypes.X3DColorNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('color', x3dom.nodeTypes.X3DColorNode);

            /**
             *
             * @var {SFNode} texCoord
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue x3dom.nodeTypes.X3DTextureCoordinateNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('texCoord', x3dom.nodeTypes.X3DTextureCoordinateNode);


            /**
             *
             * @var {MFFloat} height
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'height', []);

            /**
             *
             * @var {SFInt32} xDimension
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'xDimension', 0);

            /**
             *
             * @var {SFFloat} xSpacing
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'xSpacing', 1.0);

            /**
             *
             * @var {SFInt32} zDimension
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'zDimension', 0);

            /**
             *
             * @var {SFFloat} zSpacing
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'zSpacing', 1.0);
        
        },
        {
            nodeChanged: function()
            {
                this._mesh._indices[0] = [];
                this._mesh._positions[0] = [];
                this._mesh._normals[0] = [];
                this._mesh._texCoords[0] = [];
                this._mesh._colors[0] = [];

                var x = 0, y = 0;
                var subx = this._vf.xDimension-1;
                var suby = this._vf.zDimension-1;

                var h = this._vf.height;

                x3dom.debug.assert((h.length === this._vf.xDimension*this._vf.zDimension));

                var normals = null, texCoords = null, colors = null;

                if (this._cf.normal.node) {
                    normals = this._cf.normal.node._vf.vector;
                }

                var numTexComponents = 2;

                var texCoordNode = this._cf.texCoord.node;
                if (x3dom.isa(texCoordNode, x3dom.nodeTypes.MultiTextureCoordinate)) {
                    if (texCoordNode._cf.texCoord.nodes.length)
                        texCoordNode = texCoordNode._cf.texCoord.nodes[0];
                }

                if (texCoordNode) {
                    if (texCoordNode._vf.point) {
                        texCoords = texCoordNode._vf.point;
                        if (x3dom.isa(texCoordNode, x3dom.nodeTypes.TextureCoordinate3D)) {
                            numTexComponents = 3;
                        }
                    }
                }

                var numColComponents = 3;
                if (this._cf.color.node) {
                    colors = this._cf.color.node._vf.color;
                    if (x3dom.isa(this._cf.color.node, x3dom.nodeTypes.ColorRGBA)) {
                        numColComponents = 4;
                    }
                }

                var c = 0;

                for (y = 0; y <= suby; y++)
                {
                    for (x = 0; x <= subx; x++)
                    {
                        this._mesh._positions[0].push(x * this._vf.xSpacing);
                        this._mesh._positions[0].push(h[c]);
                        this._mesh._positions[0].push(y * this._vf.zSpacing);

                        if (normals) {
                            this._mesh._normals[0].push(normals[c].x);
                            this._mesh._normals[0].push(normals[c].y);
                            this._mesh._normals[0].push(normals[c].z);
                        }

                        if (texCoords) {
                            this._mesh._texCoords[0].push(texCoords[c].x);
                            this._mesh._texCoords[0].push(texCoords[c].y);
                            if (numTexComponents === 3) {
                                this._mesh._texCoords[0].push(texCoords[c].z);
                            }
                        }
                        else {
                            this._mesh._texCoords[0].push(x / subx);
                            this._mesh._texCoords[0].push(y / suby);
                        }

                        if (colors) {
                            this._mesh._colors[0].push(colors[c].r);
                            this._mesh._colors[0].push(colors[c].g);
                            this._mesh._colors[0].push(colors[c].b);
                            if (numColComponents === 4) {
                                this._mesh._colors[0].push(colors[c].a);
                            }
                        }

                        c++;
                    }
                }

                for (y = 1; y <= suby; y++) {
                    for (x = 0; x < subx; x++) {
                        this._mesh._indices[0].push((y - 1) * (subx + 1) + x);
                        this._mesh._indices[0].push(y * (subx + 1) + x);
                        this._mesh._indices[0].push((y - 1) * (subx + 1) + x + 1);

                        this._mesh._indices[0].push(y * (subx + 1) + x);
                        this._mesh._indices[0].push(y * (subx + 1) + x + 1);
                        this._mesh._indices[0].push((y - 1) * (subx + 1) + x + 1);
                    }
                }

                // TODO; handle at least per quad normals
                //       (corresponds to creaseAngle = 0)
                //this._mesh.calcNormals(this._vf.creaseAngle, this._vf.ccw);
                if (!normals)
                    this._mesh.calcNormals(Math.PI, this._vf.ccw);

                this.invalidateVolume();
                this._mesh._numTexComponents = numTexComponents;
                this._mesh._numColComponents = numColComponents;
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
            },

            fieldChanged: function(fieldName)
            {
                var normals = null;

                if (this._cf.normal.node) {
                    normals = this._cf.normal.node._vf.vector;
                }

                if (fieldName == "height")
                {
                    var i, n = this._mesh._positions[0].length / 3;
                    var h = this._vf.height;

                    for (i=0; i<n; i++) {
                        this._mesh._positions[0][3*i+1] = h[i];
                    }

                    if (!normals) {
                        this._mesh._normals[0] = [];
                        this._mesh.calcNormals(Math.PI, this._vf.ccw);
                    }

                    this.invalidateVolume();

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        if (!normals)
                            node._dirty.normals = true;
                        node.invalidateVolume();
                    });
                }
                // TODO: handle other cases!
            }
        }
    )
);