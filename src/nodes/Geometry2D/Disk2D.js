/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 */

/* ### Disk2D ### */
x3dom.registerNodeType(
    "Disk2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DPlanarGeometryNode,
        
        /**
         * Constructor for Disk2D
         * @constructs x3dom.nodeTypes.Disk2D
         * @x3d 3.3
         * @component Geometry2D
         * @status full
         * @extends x3dom.nodeTypes.X3DPlanarGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Disk2D node specifies a circular disk which is centred at (0, 0) in the local coordinate
         *  system. If innerRadius is equal to outerRadius, a solid circular line shall be drawn using the current line
         *  properties. If innerRadius is zero, the Disk2D is completely filled. Otherwise, the area within the
         *  innerRadius forms a hole in the Disk2D.
         */
        function (ctx) {
            x3dom.nodeTypes.Disk2D.superClass.call(this, ctx);


            /**
             * The innerRadius field specifies the inner dimension of the Disk2D. The value of innerRadius shall be
             *  greater than or equal to zero and less than or equal to outerRadius.
             * @var {x3dom.fields.SFFloat} innerRadius
             * @memberof x3dom.nodeTypes.Disk2D
             * @initvalue 0
             * @range [0, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'innerRadius', 0);

            /**
             * The outerRadius field specifies the radius of the outer dimension of the Disk2D. The value of outerRadius
             *  shall be greater than zero.
             * @var {x3dom.fields.SFFloat} outerRadius
             * @memberof x3dom.nodeTypes.Disk2D
             * @initvalue 1
             * @range [0, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'outerRadius', 1);

            /**
             * Number of segments of the disc
             * @var {x3dom.fields.SFFloat} subdivision
             * @memberof x3dom.nodeTypes.Arc2D
             * @initvalue 32
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'subdivision', 32);

            var ir = this._vf.innerRadius;
            var or = this._vf.outerRadius;

            var geoCacheID = 'Disk2D_' + ir + or;

            if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using Disk2D from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            } else {

                var anzahl = this._vf.subdivision;
                for (var i = 0; i <= anzahl; i++) {

                    var theta = i * ((2 * Math.PI) / anzahl);

                    var ox = Math.cos(theta) * or;
                    var oy = Math.sin(theta) * or;
                    var ix = Math.cos(theta) * ir;
                    var iy = Math.sin(theta) * ir;
                    this._mesh._positions[0].push(ox);
                    this._mesh._positions[0].push(oy);
                    this._mesh._positions[0].push(0.0);

                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(1);

                    this._mesh._texCoords[0].push((ox + or) / (2 * or));
                    this._mesh._texCoords[0].push((oy + or) / (2 * or));

                    this._mesh._positions[0].push(ix);
                    this._mesh._positions[0].push(iy);
                    this._mesh._positions[0].push(0.0);

                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(1);
                    this._mesh._texCoords[0].push((ix + or) / (2 * or));
                    this._mesh._texCoords[0].push((iy + or) / (2 * or));
                }

                for (i = 0; i < anzahl * 2; i = i + 2) {
                    if (i == (anzahl * 2) - 2) {
                        this._mesh._indices[0].push(i + 1);
                        this._mesh._indices[0].push(i);
                        this._mesh._indices[0].push(1);

                        this._mesh._indices[0].push(1);
                        this._mesh._indices[0].push(i);
                        this._mesh._indices[0].push(0);
                    } else {
                        this._mesh._indices[0].push(i + 1);
                        this._mesh._indices[0].push(i);
                        this._mesh._indices[0].push(i + 3);

                        this._mesh._indices[0].push(i + 3);
                        this._mesh._indices[0].push(i);
                        this._mesh._indices[0].push(i + 2);
                    }
                }

                this._mesh._numTexComponents = 2;
                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 2;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "innerRadius" || fieldName == "outerRadius" ||
                    fieldName == "subdivision") {
                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] = [];
                    this._mesh._normals[0] = [];
                    this._mesh._texCoords[0] = [];

                    var ir = this._vf.innerRadius;
                    var or = this._vf.outerRadius;

                    var anzahl = this._vf.subdivision;
                    for (var i = 0; i <= anzahl; i++) {

                        var theta = i * ((2 * Math.PI) / anzahl);

                        var ox = Math.cos(theta) * or;
                        var oy = Math.sin(theta) * or;
                        var ix = Math.cos(theta) * ir;
                        var iy = Math.sin(theta) * ir;
                        this._mesh._positions[0].push(ox);
                        this._mesh._positions[0].push(oy);
                        this._mesh._positions[0].push(0.0);

                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(1);

                        this._mesh._texCoords[0].push((ox + or) / (2 * or));
                        this._mesh._texCoords[0].push((oy + or) / (2 * or));

                        this._mesh._positions[0].push(ix);
                        this._mesh._positions[0].push(iy);
                        this._mesh._positions[0].push(0.0);

                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(1);
                        this._mesh._texCoords[0].push((ix + or) / (2 * or));
                        this._mesh._texCoords[0].push((iy + or) / (2 * or));
                    }

                    for (i = 0; i < anzahl * 2; i = i + 2) {
                        if (i == (anzahl * 2) - 2) {
                            this._mesh._indices[0].push(i + 1);
                            this._mesh._indices[0].push(i);
                            this._mesh._indices[0].push(1);

                            this._mesh._indices[0].push(1);
                            this._mesh._indices[0].push(i);
                            this._mesh._indices[0].push(0);
                        } else {
                            this._mesh._indices[0].push(i + 1);
                            this._mesh._indices[0].push(i);
                            this._mesh._indices[0].push(i + 3);

                            this._mesh._indices[0].push(i + 3);
                            this._mesh._indices[0].push(i);
                            this._mesh._indices[0].push(i + 2);
                        }
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