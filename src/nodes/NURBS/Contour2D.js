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

/* ### Contour2D ### */
x3dom.registerNodeType(
    "Contour2D",
    "NURBS",
    defineClass(x3dom.nodeTypes.X3DGroupingNode, //X3DNode
    
        /**
         * Constructor for Contour2D
         * @constructs x3dom.nodeTypes.Contour2D 
         * @x3d 3.3
         * @component NURBS
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGroupingNode //X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Contour2D node groups a set of curve segments to a composite contour. The children form a closed loop.
         *  The 2D coordinates used by the node shall be interpreted to lie in the (u, v) coordinate space defined by the NURBS surface.
         */
         
        function (ctx) {
            x3dom.nodeTypes.Contour2D.superClass.call(this, ctx);
            
            /**
             * The children shall form a closed loop with the first point of the first child repeated as the last point
             * of the last child and the last point of a segment repeated as the first point of the consecutive one.
             * The segments shall be defined by concrete nodes that implement the X3DNurbsControlCurveNode abstract type nodes
             * and shall be enumerated in the child field in consecutive order according to the topology of the contour.
             * @var {x3dom.fields.MFNode} children
             * @memberof x3dom.nodeTypes.Contour2D
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode);//X3DNurbsControlCurveNode
	      }, { }
    )
);
