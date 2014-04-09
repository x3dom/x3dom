/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### DepthMode ### */
x3dom.registerNodeType(
    "DepthMode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        function (ctx) {
            x3dom.nodeTypes.DepthMode.superClass.call(this, ctx);

            this.addField_SFBool(ctx, 'enableDepthTest', true);
            this.addField_SFString(ctx, 'depthFunc', "none");
            this.addField_SFBool(ctx, 'readOnly', false);
            this.addField_SFFloat(ctx, 'zNearRange', -1);
            this.addField_SFFloat(ctx, 'zFarRange', -1);
        }
    )
);