/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Color ### */
x3dom.registerNodeType(
    "Color",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DColorNode,
        function (ctx) {
            x3dom.nodeTypes.Color.superClass.call(this, ctx);

            this.addField_MFColor(ctx, 'color', []);
        }
    )
);