/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2018 A. Plesch, Waltham, MA USA
 * Dual licensed under the MIT and GPL
 */
/*
 * Ayam, a free 3D modeler for the RenderMan interface.
 *
 * Ayam is copyrighted 1998-2016 by Randolf Schultz
 * (randolf.schultz@gmail.com) and others.
 *
 * All rights reserved.
 *
 * See the file License for details.
 *
 */

/* ### ContourPolyline2D ### */
x3dom.registerNodeType(
    "ContourPolyline2D",
    "NURBS",
    defineClass( x3dom.nodeTypes.X3DGroupingNode, //X3DNurbsControlCurveNode

        /**
         * Constructor for ContourPolyline2D
         * @constructs x3dom.nodeTypes.ContourPolyline2D
         * @x3d 3.3
         * @component NURBS
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGroupingNode //X3DNurbsControlCurveNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The ContourPolyline2D node defines a piecewise linear curve segment as a part of a
         *  trimming contour in the u,v domain of a surface.
         */

        function ( ctx )
        {
            x3dom.nodeTypes.ContourPolyline2D.superClass.call( this, ctx );

            /**
             * The 2D coordinates shall be interpreted to lie in the (u, v) coordinate space defined by the NURBS surface.
             * @var {x3dom.fields.MFVec2d} controlPoint
             * @memberof x3dom.nodeTypes.ContourPolyline2D
             * @initvalue []
             * @range [-inf, inf]
             * @field x3d
             * @instance
             */
            this.addField_MFVec2f( ctx, "controlPoint", [] ); //should be MFVec2d
        }, { }
    )
);
