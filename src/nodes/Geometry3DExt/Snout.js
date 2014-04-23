/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Snout ### */
x3dom.registerNodeType(
    "Snout",
    "Geometry3DExt",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        
        /**
         * Constructor for Snout
         * @constructs x3dom.nodeTypes.Snout
         * @x3d x.x
         * @component Geometry3DExt
         * @extends x3dom.nodeTypes.X3DSpatialGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Describes a snout shape
         */
        function (ctx) {
            x3dom.nodeTypes.Snout.superClass.call(this, ctx);


            /**
             * Defines the diameter of the bottom surface.
             * @var {x3dom.fields.SFFloat} dbottom
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Snout
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'dbottom', 1.0);

            /**
             * Defines the diameter of the top surface.
             * @var {x3dom.fields.SFFloat} dtop
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Snout
             * @initvalue 0.5
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'dtop', 0.5);

            /**
             * Defines the perpendicular distance between surfaces.
             * @var {x3dom.fields.SFFloat} height
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Snout
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'height', 1.0);

            /**
             * Defines the displacement in x direction.
             * @var {x3dom.fields.SFFloat} xoff
             * @memberof x3dom.nodeTypes.Snout
             * @initvalue 0.25
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'xoff', 0.25);   // Displacement of axes along X-axis

            /**
             * Defines the displacement in y direction.
             * @var {x3dom.fields.SFFloat} yoff
             * @memberof x3dom.nodeTypes.Snout
             * @initvalue 0.25
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'yoff', 0.25);   // Displacement of axes along Y-axis

            /**
             * Specifies whether the bottom exists.
             * @var {x3dom.fields.SFBool} bottom
             * @memberof x3dom.nodeTypes.Snout
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'bottom', true);

            /**
             * Specifies whether the bottom exists.
             * @var {x3dom.fields.SFBool} top
             * @memberof x3dom.nodeTypes.Snout
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'top', true);

            /**
             * Specifies the number of faces that are generated to approximate the snout.
             * @var {x3dom.fields.SFFloat} subdivision
             * @memberof x3dom.nodeTypes.Snout
             * @initvalue 32
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'subdivision', 32);

            this.rebuildGeometry();
        
        },
        {
            rebuildGeometry: function()
            {
                this._mesh._positions[0] = [];
                this._mesh._normals[0]   = [];
                this._mesh._texCoords[0] = [];
                this._mesh._indices[0]   = [];

                var bottomRadius = this._vf.dbottom / 2, height = this._vf.height;
                var topRadius = this._vf.dtop / 2, sides = this._vf.subdivision;

                var beta, x, z;
                var delta = 2.0 * Math.PI / sides;

                var incl = (bottomRadius - topRadius) / height;
                var nlen = 1.0 / Math.sqrt(1.0 + incl * incl);

                var j = 0, k = 0;
                var h, base;

                if (height > 0) {
                    var px = 0, pz = 0;

                    for (j = 0, k = 0; j <= sides; j++) {
                        beta = j * delta;
                        x = Math.sin(beta);
                        z = -Math.cos(beta);

                        px = x * topRadius + this._vf.xoff;
                        pz = z * topRadius + this._vf.yoff;

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

                if (bottomRadius > 0 && this._vf.bottom) {
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

                if (topRadius > x3dom.fields.Eps && this._vf.top) {
                    base = this._mesh._positions[0].length / 3;

                    for (j = sides - 1; j >= 0; j--) {
                        beta = j * delta;
                        x =  topRadius * Math.sin(beta);
                        z = -topRadius * Math.cos(beta);

                        this._mesh._positions[0].push(x + this._vf.xoff, height / 2, z + this._vf.yoff);
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
            },

            fieldChanged: function (fieldName)
            {
                if (fieldName == "dtop" || fieldName == "dbottom" ||
                    fieldName == "height" || fieldName == "subdivision" ||
                    fieldName == "xoff" || fieldName == "yoff" ||
                    fieldName == "bottom" || fieldName == "top")
                {
                    this.rebuildGeometry();

                    Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                        node.invalidateVolume();
                    });
                }
            }
        }
    )
);