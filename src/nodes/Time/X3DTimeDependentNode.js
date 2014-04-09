/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DTimeDependentNode ### */
x3dom.registerNodeType(
    "X3DTimeDependentNode",
    "Time",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DTimeDependentNode.superClass.call(this, ctx);

            this.addField_SFBool(ctx, 'loop', false);
        }
    )
);