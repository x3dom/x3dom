/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2017 A. Plesch, Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Coordinate ### */
x3dom.registerNodeType(
    "CoordinateDouble",
    "Nurbs",
    defineClass(x3dom.nodeTypes.X3DCoordinateNode,
        
        /**
         * Constructor for CoordinateDouble
         * @constructs x3dom.nodeTypes.CoordinateDouble
         * @x3d 3.3
         * @component Nurbs
         * @status full
         * @extends x3dom.nodeTypes.X3DCoordinateNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Coordinate builds geometry using a set of double precision 3D coordinates.
         * X3DCoordinateNode is used by IndexedFaceSet, IndexedLineSet, LineSet and PointSet.
         */
        function (ctx) {
            x3dom.nodeTypes.CoordinateDouble.superClass.call(this, ctx);

            /**
             * Contains the 3D coordinates
             * @var {x3dom.fields.MFVec3d} point
             * @memberof x3dom.nodeTypes.Coordinate
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec3d(ctx, 'point', []);
        
        },
        {
            getPoints: function() {
                return this._vf.point;
            }
        }
    )
);
