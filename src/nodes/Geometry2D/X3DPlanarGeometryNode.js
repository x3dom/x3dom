/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 */

/* ### X3DPlanarGeometryNode ### */
x3dom.registerNodeType(
    "X3DPlanarGeometryNode",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        
        /**
         * Constructor for X3DPlanarGeometryNode
         * @constructs x3dom.nodeTypes.X3DPlanarGeometryNode
         * @x3d x.x
         * @component Geometry2D
         * @extends x3dom.nodeTypes.X3DGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DPlanarGeometryNode.superClass.call(this, ctx);
        
        }
    )
);