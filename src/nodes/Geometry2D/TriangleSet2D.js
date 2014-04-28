/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 */

/* ### TriangleSet2D ### */
x3dom.registerNodeType(
    "TriangleSet2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DPlanarGeometryNode,
        
        /**
         * Constructor for TriangleSet2D
         * @constructs x3dom.nodeTypes.TriangleSet2D
         * @x3d 3.3
         * @component Geometry2D
         * @status full
         * @extends x3dom.nodeTypes.X3DPlanarGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The TriangleSet2D node specifies a set of triangles in the local 2D coordinate system.
         */
        function (ctx) {
            x3dom.nodeTypes.TriangleSet2D.superClass.call(this, ctx);


            /**
             * The vertices field specifies the triangles to be displayed. The number of vertices provided shall be
             *  evenly divisible by three.
             * @var {x3dom.fields.MFVec2f} vertices
             * @memberof x3dom.nodeTypes.TriangleSet2D
             * @initvalue []
             * @range (-inf, inf)
             * @field x3d
             * @instance
             */
            this.addField_MFVec2f(ctx, 'vertices', []);

            
            var x = 0, y = 0;
            if (this._vf.vertices.length) {
                x = this._vf.vertices[0].x;
                y = this._vf.vertices[0].y;
            }

            var geoCacheID = 'TriangleSet2D_' + x + '-' + y;

            if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using TriangleSet2D from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            }
            else {
                var minx = 0, miny = 0, maxx = 0, maxy = 0;

                if (this._vf.vertices.length) {
                    minx = this._vf.vertices[0].x;
                    miny = this._vf.vertices[0].y;
                    maxx = this._vf.vertices[0].x;
                    maxy = this._vf.vertices[0].y;
                }

                for (var i = 0; i < this._vf.vertices.length; i++) {
                    if (this._vf.vertices[i].x < minx) {
                        minx = this._vf.vertices[i].x
                    }
                    if (this._vf.vertices[i].y < miny) {
                        miny = this._vf.vertices[i].y
                    }
                    if (this._vf.vertices[i].x > maxx) {
                        maxx = this._vf.vertices[i].x
                    }
                    if (this._vf.vertices[i].y > maxy) {
                        maxy = this._vf.vertices[i].y
                    }
                }

                for (var i = 0; i < this._vf.vertices.length; i++) {
                    x = this._vf.vertices[i].x;
                    y = this._vf.vertices[i].y;
                    this._mesh._positions[0].push(x);
                    this._mesh._positions[0].push(y);
                    this._mesh._positions[0].push(0.0);

                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(1);

                    this._mesh._texCoords[0].push((x - minx) / (maxx - minx));
                    this._mesh._texCoords[0].push((y - miny) / (maxy - miny));
                }

                for (var j = 0; j < this._vf.vertices.length; j += 3) {
                    this._mesh._indices[0].push(j);
                    this._mesh._indices[0].push(j + 2);
                    this._mesh._indices[0].push(j + 1);
                }

                this._mesh._numTexComponents = 2;
                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "vertices") {
                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] = [];
                    this._mesh._normals[0] = [];
                    this._mesh._texCoords[0] = [];

                    var minx = this._vf.vertices[0].x;
                    var miny = this._vf.vertices[0].y;
                    var maxx = this._vf.vertices[0].x;
                    var maxy = this._vf.vertices[0].y;

                    for (var i = 0; i < this._vf.vertices.length; i++) {
                        if (this._vf.vertices[i].x < minx) {
                            minx = this._vf.vertices[i].x
                        }
                        if (this._vf.vertices[i].y < miny) {
                            miny = this._vf.vertices[i].y
                        }
                        if (this._vf.vertices[i].x > maxx) {
                            maxx = this._vf.vertices[i].x
                        }
                        if (this._vf.vertices[i].y > maxy) {
                            maxy = this._vf.vertices[i].y
                        }
                    }

                    for (var i = 0; i < this._vf.vertices.length; i++) {
                        var x = this._vf.vertices[i].x;
                        var y = this._vf.vertices[i].y;
                        this._mesh._positions[0].push(x);
                        this._mesh._positions[0].push(y);
                        this._mesh._positions[0].push(0.0);

                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(1);

                        this._mesh._texCoords[0].push((x - minx) / (maxx - minx));
                        this._mesh._texCoords[0].push((y - miny) / (maxy - miny));
                    }

                    for (var j = 0; j < this._vf.vertices.length; j += 3) {
                        this._mesh._indices[0].push(j);
                        this._mesh._indices[0].push(j + 2);
                        this._mesh._indices[0].push(j + 1);
                    }

                    this._mesh._numTexComponents = 2;
                    this.invalidateVolume();
                    this._mesh._numFaces = this._mesh._indices[0].length / 3;
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                    });
                }
            }
        }
    )
);
