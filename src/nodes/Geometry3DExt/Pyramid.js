/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Pyramid ### */
x3dom.registerNodeType(
    "Pyramid",
    "Geometry3DExt",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        
        /**
         * Constructor for Pyramid
         * @constructs x3dom.nodeTypes.Pyramid
         * @x3d x.x
         * @component Geometry3DExt
         * @extends x3dom.nodeTypes.X3DSpatialGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Describes a pyramid shape.
         */
        function (ctx) {
            x3dom.nodeTypes.Pyramid.superClass.call(this, ctx);


            /**
             * Defines the bottom length in x direction.
             * @var {x3dom.fields.SFFloat} xbottom
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Pyramid
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'xbottom', 1);

            /**
             * Defines the bottom length in y direction.
             * @var {x3dom.fields.SFFloat} ybottom
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Pyramid
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'ybottom', 1);

            /**
             * Defines the top length in x direction.
             * @var {x3dom.fields.SFFloat} xtop
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Pyramid
             * @initvalue 0.5
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'xtop', 0.5);

            /**
             * Defines the top length in y direction.
             * @var {x3dom.fields.SFFloat} ytop
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Pyramid
             * @initvalue 0.5
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'ytop', 0.5);

            /**
             * Defines the Distance between the bottom and the top faces.
             * @var {x3dom.fields.SFFloat} height
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Pyramid
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'height', 1);

            /**
             * Defines the displacement along the x axis.
             * @var {x3dom.fields.SFFloat} xoff
             * @memberof x3dom.nodeTypes.Pyramid
             * @initvalue 0.25
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'xoff', 0.25);

            /**
             * Defines the displacement along the y axis.
             * @var {x3dom.fields.SFFloat} yoff
             * @memberof x3dom.nodeTypes.Pyramid
             * @initvalue 0.25
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'yoff', 0.25);

            var xTop = this._vf.xtop / 2;
            var yTop = this._vf.ytop / 2;
            var xBot = this._vf.xbottom / 2;
            var yBot = this._vf.ybottom / 2;
            var xOff = this._vf.xoff;
            var yOff = this._vf.yoff;
            var sy = this._vf.height / 2;

            this._mesh._positions[0] = [
                -xBot,       -sy, -yBot,        -xTop + xOff, sy, -yTop + yOff,  xTop + xOff, sy, -yTop + yOff,  xBot,       -sy, -yBot,
                -xBot,       -sy,  yBot,        -xTop + xOff, sy,  yTop + yOff,  xTop + xOff, sy,  yTop + yOff,  xBot,       -sy,  yBot,
                -xBot,       -sy, -yBot,        -xBot,       -sy,  yBot,        -xTop + xOff, sy,  yTop + yOff, -xTop + xOff, sy, -yTop + yOff,
                xBot,       -sy, -yBot,         xBot,       -sy,  yBot,         xTop + xOff, sy,  yTop + yOff,  xTop + xOff, sy, -yTop + yOff,
                    -xTop + xOff, sy, -yTop + yOff, -xTop + xOff, sy,  yTop + yOff,  xTop + xOff, sy,  yTop + yOff,  xTop + xOff, sy, -yTop + yOff,
                -xBot,       -sy, -yBot,        -xBot,       -sy,  yBot,         xBot,       -sy,  yBot,         xBot,       -sy, -yBot
            ];
            this._mesh._texCoords[0] = [
                1, 0, 1, 1, 0, 1, 0, 0,
                0, 0, 0, 1, 1, 1, 1, 0,
                0, 0, 1, 0, 1, 1, 0, 1,
                1, 0, 0, 0, 0, 1, 1, 1,
                0, 1, 0, 0, 1, 0, 1, 1,
                0, 0, 0, 1, 1, 1, 1, 0
            ];
            this._mesh._indices[0] = [
                0, 1, 2, 2, 3, 0,
                6, 5, 4, 4, 7, 6,
                8, 9, 10, 10, 11, 8,
                12, 15, 14, 14, 13, 12,
                16, 17, 18, 18, 19, 16,
                20, 23, 22, 22, 21, 20
            ];

            // attention, we share per side, therefore creaseAngle > 0
            this._mesh.calcNormals(Math.PI, this._vf.ccw);

            this._mesh._invalidate = true;
            this._mesh._numFaces = 12;
            this._mesh._numCoords = 24;
        
        },
        {
            fieldChanged: function(fieldName)
            {
                if (fieldName == "xbottom" || fieldName == "ybottom" ||
                    fieldName == "xtop" || fieldName == "ytop" ||
                    fieldName == "xoff" || fieldName == "yoff" || fieldName == "height")
                {
                    var xTop = this._vf.xtop / 2;
                    var yTop = this._vf.ytop / 2;
                    var xBot = this._vf.xbottom / 2;
                    var yBot = this._vf.ybottom / 2;
                    var xOff = this._vf.xoff;
                    var yOff = this._vf.yoff;
                    var sy = this._vf.height / 2;

                    this._mesh._positions[0] = [
                        -xBot,       -sy, -yBot,        -xTop + xOff, sy, -yTop + yOff,  xTop + xOff, sy, -yTop + yOff,  xBot,       -sy, -yBot,
                        -xBot,       -sy,  yBot,        -xTop + xOff, sy,  yTop + yOff,  xTop + xOff, sy,  yTop + yOff,  xBot,       -sy,  yBot,
                        -xBot,       -sy, -yBot,        -xBot,       -sy,  yBot,        -xTop + xOff, sy,  yTop + yOff, -xTop + xOff, sy, -yTop + yOff,
                        xBot,       -sy, -yBot,         xBot,       -sy,  yBot,         xTop + xOff, sy,  yTop + yOff,  xTop + xOff, sy, -yTop + yOff,
                            -xTop + xOff, sy, -yTop + yOff, -xTop + xOff, sy,  yTop + yOff,  xTop + xOff, sy,  yTop + yOff,  xTop + xOff, sy, -yTop + yOff,
                        -xBot,       -sy, -yBot,        -xBot,       -sy,  yBot,         xBot,       -sy,  yBot,         xBot,       -sy, -yBot
                    ];

                    this._mesh._normals[0] = [];
                    this._mesh.calcNormals(Math.PI, this._vf.ccw);

                    this.invalidateVolume();

                    Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                        node.invalidateVolume();
                    });
                }
            }
        }
    )
);