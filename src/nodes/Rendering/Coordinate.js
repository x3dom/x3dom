/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Coordinate ### */
x3dom.registerNodeType(
    "Coordinate",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DCoordinateNode,
        
        /**
         * Constructor for Coordinate
         * @constructs x3dom.nodeTypes.Coordinate
         * @x3d 3.3
         * @component Rendering
         * @status full
         * @extends x3dom.nodeTypes.X3DCoordinateNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Coordinate builds geometry using a set of 3D coordinates.
         * Coordinate is used by IndexedFaceSet, IndexedLineSet, LineSet and PointSet.
         */
        function (ctx) {
            x3dom.nodeTypes.Coordinate.superClass.call(this, ctx);


            /**
             * Contains the 3D coordinates
             * @var {x3dom.fields.MFVec3f} point
             * @memberof x3dom.nodeTypes.Coordinate
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec3f(ctx, 'point', []);
        
        },
        {
            getPoints: function() {
                return this._vf.point;
            }
        }
    )
);
