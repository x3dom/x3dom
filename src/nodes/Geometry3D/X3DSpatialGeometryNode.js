/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DSpatialGeometryNode ### */
x3dom.registerNodeType(
    "X3DSpatialGeometryNode",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        
        /**
         * Constructor for X3DSpatialGeometryNode
         * @constructs x3dom.nodeTypes.X3DSpatialGeometryNode
         * @x3d x.x
         * @component Geometry3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This is the abstract node for spatial geometry nodes.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DSpatialGeometryNode.superClass.call(this, ctx);
        
        }
    )
);