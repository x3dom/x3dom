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

/* ### NurbsCurve2D ### */
x3dom.registerNodeType(
    "NurbsCurve2D",
    "NURBS",
    defineClass( x3dom.nodeTypes.X3DGroupingNode, //X3DNurbsControlCurveNode

        /**
         * Constructor for NurbsCurve2D
         * @constructs x3dom.nodeTypes.NurbsCurve2D
         * @x3d 3.3
         * @component NURBS
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGroupingNode //X3DNurbsControlCurveNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The NurbsCurve2D node defines a trimming segment that is part of a trimming contour
         *  in the u,v domain of the surface. NurbsCurve2D nodes are used as children of the Contour2D group.
         */

        function ( ctx )
        {
            x3dom.nodeTypes.NurbsCurve2D.superClass.call( this, ctx );

            /**
             * the order of the curve.
             * @var {x3dom.fields.SFInt32} order
             * @memberof x3dom.nodeTypes.NurbsCurve2D
             * @initvalue 3
             * @range [2, inf]
             * @field x3d
             * @instance
             */
            this.addField_SFInt32( ctx, "order", 3 );

            /**
             * the knot values of the curve.
             * @var {x3dom.fields.SFInt32} knot
             * @memberof x3dom.nodeTypes.NurbsCurve2D
             * @initvalue []
             * @range [-inf, inf]
             * @field x3d
             * @instance
             */
            this.addField_MFDouble( ctx, "knot", [] );

            /**
             * The 2D coordinates shall be interpreted to lie in the (u, v) coordinate space defined by the NURBS surface.
             * @var {x3dom.fields.MFVec2d} controlPoint
             * @memberof x3dom.nodeTypes.NurbsCurve2D
             * @initvalue []
             * @range [-inf, inf]
             * @field x3d
             * @instance
             */
            this.addField_MFVec2f( ctx, "controlPoint", [] ); //should be MFVec2d, was MFDouble

            /**
             * control point weights: P[i].w = weight[ i ]
             * @var {x3dom.fields.MFDouble} weight
             * @memberof x3dom.nodeTypes.NurbsCurve2D
             * @initvalue []
             * @range [0, inf]
             * @field x3d
             * @instance
             */
            this.addField_MFDouble( ctx, "weight", [] );

            /**
             * NYI: whether or not the curve is to be evaluated as a closed curve
             * @var {x3dom.fields.SFBool} closed
             * @memberof x3dom.nodeTypes.NurbsCurve2D
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool( ctx, "closed", false ); //NYI
        }, { }
    )
);
