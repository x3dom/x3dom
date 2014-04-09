/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### BlendMode ### */
x3dom.registerNodeType(
    "BlendMode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        function (ctx) {
            x3dom.nodeTypes.BlendMode.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'srcFactor', "src_alpha");
            this.addField_SFString(ctx, 'destFactor', "one_minus_src_alpha");
            this.addField_SFColor(ctx, 'color', 1, 1, 1);
            this.addField_SFFloat(ctx, 'colorTransparency', 0);
            this.addField_SFString(ctx, 'alphaFunc', "none");
            this.addField_SFFloat(ctx, 'alphaFuncValue', 0);
            this.addField_SFString(ctx, 'equation', "none");
        }
    )
);