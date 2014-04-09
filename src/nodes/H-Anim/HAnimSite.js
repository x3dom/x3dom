/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### HAnimSite ###
x3dom.registerNodeType(
    "HAnimSite",
    "H-Anim",
    defineClass(x3dom.nodeTypes.Transform,
        function (ctx) {
            x3dom.nodeTypes.HAnimSite.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'name', "");
        }
    )
);