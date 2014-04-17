/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/* ### X3DPlanarGeometryNode ### */
x3dom.registerNodeType(
    "X3DPlanarGeometryNode",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.X3DPlanarGeometryNode.superClass.call(this, ctx);
        }
    )
);