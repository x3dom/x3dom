/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 */

 /* Added support for changes of the "color" field
  * (C) 2014 Toshiba Corporation
  * Dual licensed under the MIT and GPL
  */

/* ### ElevationGrid ### */
x3dom.registerNodeType(
    "ElevationGrid",
    "Geometry3DExt",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,

        /**
         * Constructor for ElevationGrid
         * @constructs x3dom.nodeTypes.ElevationGrid
         * @x3d 3.3
         * @component Geometry3DExt
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The ElevationGrid node specifies a uniform rectangular grid of varying height in the Y=0 plane of the local coordinate system.
         * The geometry is described by a scalar array of height values that specify the height of a surface above each point of the grid.
         * The xDimension and zDimension fields indicate the number of elements of the grid height array in the X and Z directions.
         * Both xDimension and zDimension shall be greater than or equal to zero.
         * If either the xDimension or the zDimension is less than two, the ElevationGrid contains no quadrilaterals.
         * The vertex locations for the rectangles are defined by the height field and the xSpacing and zSpacing fields
         */
        function (ctx) {
            x3dom.nodeTypes.ElevationGrid.superClass.call(this, ctx);


            /**
             * The colorPerVertex field determines whether colours specified in the color field are applied to each vertex or each quadrilateral of the ElevationGrid node.
             * If colorPerVertex is FALSE and the color field is not NULL, the color field shall specify a node derived from X3DColorNode containing at least (xDimension-1)×(zDimension-1) colours; one for each quadrilateral.
             * If colorPerVertex is TRUE and the color field is not NULL, the color field shall specify a node derived from X3DColorNode containing at least xDimension × zDimension colours, one for each vertex.
             * @var {x3dom.fields.SFBool} colorPerVertex
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'colorPerVertex', true);

            /**
             * The normalPerVertex field determines whether normals are applied to each vertex or each quadrilateral of the ElevationGrid node depending on the value of normalPerVertex.
             * If normalPerVertex is FALSE and the normal node is not NULL, the normal field shall specify a node derived from X3DNormalNode containing at least (xDimension−1)×(zDimension−1) normals; one for each quadrilateral.
             * If normalPerVertex is TRUE and the normal field is not NULL, the normal field shall specify a node derived from X3DNormalNode containing at least xDimension × zDimension normals; one for each vertex.
             * @var {x3dom.fields.SFBool} normalPerVertex
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'normalPerVertex', true);

            /**
             * The creaseAngle field affects how default normals are generated.
             * If the angle between the geometric normals of two adjacent faces is less than the crease angle, normals shall be calculated so that the faces are shaded smoothly across the edge; otherwise, normals shall be calculated so that a lighting discontinuity across the edge is produced.
             * Crease angles shall be greater than or equal to 0.0 angle base units.
             * @var {x3dom.fields.SFFloat} creaseAngle
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'creaseAngle', 0);


            /**
             *
             * @var {x3dom.fields.MFNode} attrib
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue x3dom.nodeTypes.X3DVertexAttributeNode
             * @field x3d
             * @instance
             */
            this.addField_MFNode('attrib', x3dom.nodeTypes.X3DVertexAttributeNode);

            /**
             * The normal field specifies per-vertex or per-quadrilateral normals for the ElevationGrid node.
             * If the normal field is NULL, the browser shall automatically generate normals, using the creaseAngle field to determine if and how normals are smoothed across the surface.
             * @var {x3dom.fields.SFNode} normal
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue x3dom.nodeTypes.Normal
             * @field x3d
             * @instance
             */
            this.addField_SFNode('normal', x3dom.nodeTypes.Normal);

            /**
             * The color field specifies per-vertex or per-quadrilateral colours for the ElevationGrid node depending on the value of colorPerVertex.
             * If the color field is NULL, the ElevationGrid node is rendered with the overall attributes of the Shape node enclosing the ElevationGrid node.
             * @var {x3dom.fields.SFNode} color
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue x3dom.nodeTypes.X3DColorNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode('color', x3dom.nodeTypes.X3DColorNode);

            /**
             * The texCoord field specifies per-vertex texture coordinates for the ElevationGrid node. If texCoord is NULL, default texture coordinates are applied to the geometry.
             * @var {x3dom.fields.SFNode} texCoord
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue x3dom.nodeTypes.X3DTextureCoordinateNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode('texCoord', x3dom.nodeTypes.X3DTextureCoordinateNode);


            /**
             * The height field is an xDimension by zDimension array of scalar values representing the height above the grid for each vertex.
             * @var {x3dom.fields.MFFloat} height
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFFloat(ctx, 'height', []);

            /**
             * Defines the grid size in x.
             * @var {x3dom.fields.SFInt32} xDimension
             * @range [0, inf]
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, 'xDimension', 0);

            /**
             * @var {x3dom.fields.SFDouble} xSpacing
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue 1.0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'xSpacing', 1.0);

            /**
             * Defines the grid size in z.
             * @var {x3dom.fields.SFInt32} zDimension
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, 'zDimension', 0);

            /**
             * @var {x3dom.fields.SFDouble} zSpacing
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.ElevationGrid
             * @initvalue 1.0
             * @field x3d
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

                x3dom.debug.assert((h.length >= this._vf.xDimension*this._vf.zDimension),
                    "Too few height values for given x/zDimension!");

                var normals = null, texCoords = null, colors = null;

                if (this._cf.normal.node) {
                    normals = this._cf.normal.node._vf.vector;
                }

                var numTexComponents = 2;
                var texMode;
                
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
                    
                    else if (texCoordNode._vf.mode) {
                        texMode = texCoordNode._vf.mode;
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
                var faceCnt = 0;

                for (y = 0; y <= suby; y++)
                {
                    for (x = 0; x <= subx; x++)
                    {
                        this._mesh._positions[0].push(x * this._vf.xSpacing);
                        this._mesh._positions[0].push(h[c]);
                        this._mesh._positions[0].push(y * this._vf.zSpacing);

                        if (normals) {
                            if(this._vf.normalPerVertex) {
                                this._mesh._normals[0].push(normals[c].x);
                                this._mesh._normals[0].push(normals[c].y);
                                this._mesh._normals[0].push(normals[c].z);
                            }
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
                            if(this._vf.colorPerVertex) {
                                this._mesh._colors[0].push(colors[c].r);
                                this._mesh._colors[0].push(colors[c].g);
                                this._mesh._colors[0].push(colors[c].b);
                                if (numColComponents === 4) {
                                    this._mesh._colors[0].push(colors[c].a);
                                }
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

                if (texMode) {this._mesh.calcTexCoords(texMode);}
                
                this.invalidateVolume();
                this._mesh._numTexComponents = numTexComponents;
                this._mesh._numColComponents = numColComponents;
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
            },

            fieldChanged: function(fieldName)
            {
                var i, n;
                var normals = null;

                if (this._cf.normal.node) {
                    normals = this._cf.normal.node._vf.vector;
                }

                if (fieldName == "height")
                {
                    n = this._mesh._positions[0].length / 3;
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
                else if (fieldName == "xSpacing" || fieldName == "zSpacing")
                {
                    for (var y = 0; y < this._vf.zDimension; y++) {
                        for (var x = 0; x < this._vf.xDimension; x++) {
                            var j = 3 * (y * this._vf.xDimension + x);
                            this._mesh._positions[0][j  ] = x * this._vf.xSpacing;
                            this._mesh._positions[0][j+2] = y * this._vf.zSpacing;
                        }
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
                else if (fieldName == "xDimension" || fieldName == "zDimension")
                {
                    this.nodeChanged();     // re-init whole geo, changed too much

                    Array.forEach(this._parentNodes, function (node) {
                        node.setGeoDirty();
                        node.invalidateVolume();
                    });
                }
                else if (fieldName == "color")
                {
                    // TODO; FIXME: this code assumes that size has not change and color node exists.
                    n = this._mesh._colors[0].length / 3; // 3 stands for RGB. RGBA not supported yet.
                    var c = this._cf.color.node._vf.color;

                    for (i=0; i<n; i++) {
                        this._mesh._colors[0][i*3]   = c[i].r;
                        this._mesh._colors[0][i*3+1] = c[i].g;
                        this._mesh._colors[0][i*3+2] = c[i].b;
                    }

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.colors = true;
                    });
                }
                // TODO: handle other cases!
            }
        }
    )
);
