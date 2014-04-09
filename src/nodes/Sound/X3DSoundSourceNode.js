/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DSoundSourceNode ### */
x3dom.registerNodeType(
    "X3DSoundSourceNode",
    "Sound",
    defineClass(x3dom.nodeTypes.X3DTimeDependentNode,
        function (ctx) {
            x3dom.nodeTypes.X3DSoundSourceNode.superClass.call(this, ctx);
        }
    )
);