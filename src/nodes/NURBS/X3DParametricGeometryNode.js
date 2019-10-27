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

/* ### NurbsTrimmedSurface ### */
x3dom.registerNodeType(
    "X3DParametricGeometryNode",
    "NURBS",
    defineClass( x3dom.nodeTypes.X3DGeometryNode,

        /**
         * Constructor for X3DParametricGeometryNode
         * @constructs x3dom.nodeTypes.X3DParametricGeometryNode
         * @x3d 3.3
         * @component NURBS
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The X3DParametricGeometryNode abstract node type is the base type for all geometry node types
         * that are created parametrically and use control points to describe the final shape of the surface. How the
         * control points are described and interpreted shall be a property of the individual node type.
         *
         */

        function ( ctx )
        {
            x3dom.nodeTypes.X3DParametricGeometryNode.superClass.call( this, ctx );
        }, { }
    )
);
