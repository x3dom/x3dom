/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Cone ### */
x3dom.registerNodeType(
    "Cone",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        
        /**
         * Constructor for Cone
         * @constructs x3dom.nodeTypes.Cone
         * @x3d x.x
         * @component Geometry3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DSpatialGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Cone.superClass.call(this, ctx);


            /**
             *
             * @var {SFFloat} bottomRadius
             * @memberof x3dom.nodeTypes.Cone
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'bottomRadius', 1.0);

            /**
             *
             * @var {SFFloat} topRadius
             * @memberof x3dom.nodeTypes.Cone
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'topRadius', 0);

            /**
             *
             * @var {SFFloat} height
             * @memberof x3dom.nodeTypes.Cone
             * @initvalue 2.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'height', 2.0);

            /**
             *
             * @var {SFBool} bottom
             * @memberof x3dom.nodeTypes.Cone
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'bottom', true);

            /**
             *
             * @var {SFBool} side
             * @memberof x3dom.nodeTypes.Cone
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'side', true);

            /**
             *
             * @var {SFBool} top
             * @memberof x3dom.nodeTypes.Cone
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'top', true);

            /**
             *
             * @var {SFFloat} subdivision
             * @memberof x3dom.nodeTypes.Cone
             * @initvalue 32
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'subdivision', 32);

            var geoCacheID = 'Cone_' + this._vf.bottomRadius + '_' + this._vf.height + '_' + this._vf.top + '_' +
                this._vf.bottom + '_' + this._vf.side + '_' + this._vf.topRadius + '_' + this._vf.subdivision;

            if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using Cone from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            }
            else {
                var bottomRadius = this._vf.bottomRadius, height = this._vf.height;
                var topRadius = this._vf.topRadius, sides = this._vf.subdivision;

                var beta, x, z;
                var delta = 2.0 * Math.PI / sides;

                var incl = (bottomRadius - topRadius) / height;
                var nlen = 1.0 / Math.sqrt(1.0 + incl * incl);

                var j = 0, k = 0;
                var h, base;

                if (this._vf.side && height > 0) {
                    var px = 0, pz = 0;

                    for (j = 0, k = 0; j <= sides; j++) {
                        beta = j * delta;
                        x = Math.sin(beta);
                        z = -Math.cos(beta);

                        if (topRadius > x3dom.fields.Eps) {
                            px = x * topRadius;
                            pz = z * topRadius;
                        }

                        this._mesh._positions[0].push(px, height / 2, pz);
                        this._mesh._normals[0].push(x / nlen, incl / nlen, z / nlen);
                        this._mesh._texCoords[0].push(1.0 - j / sides, 1);

                        this._mesh._positions[0].push(x * bottomRadius, -height / 2, z * bottomRadius);
                        this._mesh._normals[0].push(x / nlen, incl / nlen, z / nlen);
                        this._mesh._texCoords[0].push(1.0 - j / sides, 0);

                        if (j > 0) {
                            this._mesh._indices[0].push(k    );
                            this._mesh._indices[0].push(k + 2);
                            this._mesh._indices[0].push(k + 1);

                            this._mesh._indices[0].push(k + 1);
                            this._mesh._indices[0].push(k + 2);
                            this._mesh._indices[0].push(k + 3);

                            k += 2;
                        }
                    }
                }

                if (this._vf.bottom && bottomRadius > 0) {
                    base = this._mesh._positions[0].length / 3;

                    for (j = sides - 1; j >= 0; j--) {
                        beta = j * delta;
                        x = bottomRadius * Math.sin(beta);
                        z = -bottomRadius * Math.cos(beta);

                        this._mesh._positions[0].push(x, -height / 2, z);
                        this._mesh._normals[0].push(0, -1, 0);
                        this._mesh._texCoords[0].push(x / bottomRadius / 2 + 0.5, z / bottomRadius / 2 + 0.5);
                    }

                    h = base + 1;

                    for (j = 2; j < sides; j++) {
                        this._mesh._indices[0].push(h);
                        this._mesh._indices[0].push(base);

                        h = base + j;
                        this._mesh._indices[0].push(h);
                    }
                }

                if (this._vf.top && topRadius > x3dom.fields.Eps) {
                    base = this._mesh._positions[0].length / 3;

                    for (j = sides - 1; j >= 0; j--) {
                        beta = j * delta;
                        x =  topRadius * Math.sin(beta);
                        z = -topRadius * Math.cos(beta);

                        this._mesh._positions[0].push(x, height / 2, z);
                        this._mesh._normals[0].push(0, 1, 0);
                        this._mesh._texCoords[0].push(x / topRadius / 2 + 0.5, 1.0 - z / topRadius / 2 + 0.5);
                    }

                    h = base + 1;

                    for (j = 2; j < sides; j++) {
                        this._mesh._indices[0].push(base);
                        this._mesh._indices[0].push(h);

                        h = base + j;
                        this._mesh._indices[0].push(h);
                    }
                }

                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        
        },
        {
            fieldChanged: function (fieldName)
            {
                if (fieldName == "bottomRadius" || fieldName == "topRadius" ||
                    fieldName == "height" || fieldName == "subdivision" ||
                    fieldName == "bottom" || fieldName == "top" || fieldName == "side")
                {
                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] = [];
                    this._mesh._normals[0] = [];
                    this._mesh._texCoords[0] = [];

                    var bottomRadius = this._vf.bottomRadius, height = this._vf.height;
                    var topRadius = this._vf.topRadius, sides = this._vf.subdivision;

                    var beta, x, z;
                    var delta = 2.0 * Math.PI / sides;

                    var incl = (bottomRadius - topRadius) / height;
                    var nlen = 1.0 / Math.sqrt(1.0 + incl * incl);

                    var j = 0, k = 0;
                    var h, base;

                    if (this._vf.side && height > 0)
                    {
                        var px = 0, pz = 0;

                        for (j = 0, k = 0; j <= sides; j++) {
                            beta = j * delta;
                            x = Math.sin(beta);
                            z = -Math.cos(beta);

                            if (topRadius > x3dom.fields.Eps) {
                                px = x * topRadius;
                                pz = z * topRadius;
                            }

                            this._mesh._positions[0].push(px, height / 2, pz);
                            this._mesh._normals[0].push(x / nlen, incl / nlen, z / nlen);
                            this._mesh._texCoords[0].push(1.0 - j / sides, 1);

                            this._mesh._positions[0].push(x * bottomRadius, -height / 2, z * bottomRadius);
                            this._mesh._normals[0].push(x / nlen, incl / nlen, z / nlen);
                            this._mesh._texCoords[0].push(1.0 - j / sides, 0);

                            if (j > 0) {
                                this._mesh._indices[0].push(k    );
                                this._mesh._indices[0].push(k + 2);
                                this._mesh._indices[0].push(k + 1);

                                this._mesh._indices[0].push(k + 1);
                                this._mesh._indices[0].push(k + 2);
                                this._mesh._indices[0].push(k + 3);

                                k += 2;
                            }
                        }
                    }

                    if (this._vf.bottom && bottomRadius > 0)
                    {
                        base = this._mesh._positions[0].length / 3;

                        for (j = sides - 1; j >= 0; j--) {
                            beta = j * delta;
                            x = bottomRadius * Math.sin(beta);
                            z = -bottomRadius * Math.cos(beta);

                            this._mesh._positions[0].push(x, -height / 2, z);
                            this._mesh._normals[0].push(0, -1, 0);
                            this._mesh._texCoords[0].push(x / bottomRadius / 2 + 0.5, z / bottomRadius / 2 + 0.5);
                        }

                        h = base + 1;

                        for (j = 2; j < sides; j++) {
                            this._mesh._indices[0].push(h);
                            this._mesh._indices[0].push(base);

                            h = base + j;
                            this._mesh._indices[0].push(h);
                        }
                    }

                    if (this._vf.top && topRadius > x3dom.fields.Eps)
                    {
                        base = this._mesh._positions[0].length / 3;

                        for (j = sides - 1; j >= 0; j--) {
                            beta = j * delta;
                            x =  topRadius * Math.sin(beta);
                            z = -topRadius * Math.cos(beta);

                            this._mesh._positions[0].push(x, height / 2, z);
                            this._mesh._normals[0].push(0, 1, 0);
                            this._mesh._texCoords[0].push(x / topRadius / 2 + 0.5, 1.0 - z / topRadius / 2 + 0.5);
                        }

                        h = base + 1;

                        for (j = 2; j < sides; j++) {
                            this._mesh._indices[0].push(base);
                            this._mesh._indices[0].push(h);

                            h = base + j;
                            this._mesh._indices[0].push(h);
                        }
                    }

                    this.invalidateVolume();
                    this._mesh._numFaces = this._mesh._indices[0].length / 3;
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                        node.invalidateVolume();
                    });
                }
            }
        }
    )
);