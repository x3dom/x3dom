/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### LineProperties ### */
x3dom.registerNodeType(
    "LineProperties",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        function (ctx) {
            x3dom.nodeTypes.LineProperties.superClass.call(this, ctx);

            // http://www.web3d.org/files/specifications/19775-1/V3.2/Part01/components/shape.html#LineProperties
            // THINKABOUTME: to my mind, the only useful, but missing, field is linewidth (scaleFactor is overhead)
            this.addField_SFBool(ctx, 'applied', true);
            this.addField_SFInt32(ctx, 'linetype', 1);
            this.addField_SFFloat(ctx, 'linewidthScaleFactor', 0);
        }
    )
);