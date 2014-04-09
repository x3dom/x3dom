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
        function (ctx) {
            x3dom.nodeTypes.X3DSpatialGeometryNode.superClass.call(this, ctx);
        }
    )
);