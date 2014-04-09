/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### ColorMaskMode ### */
x3dom.registerNodeType(
    "ColorMaskMode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        function (ctx) {
            x3dom.nodeTypes.ColorMaskMode.superClass.call(this, ctx);

            this.addField_SFBool(ctx, 'maskR', true);
            this.addField_SFBool(ctx, 'maskG', true);
            this.addField_SFBool(ctx, 'maskB', true);
            this.addField_SFBool(ctx, 'maskA', true);
        }
    )
);