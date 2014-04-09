/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Fog ### */
x3dom.registerNodeType(
    "Fog",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DFogNode,
        function (ctx) {
            x3dom.nodeTypes.Fog.superClass.call(this, ctx);

            this.addField_SFColor(ctx, 'color', 1, 1, 1);
            this.addField_SFString(ctx, 'fogType', "LINEAR");
            this.addField_SFFloat(ctx, 'visibilityRange', 0);
        },
        {
        }
    )
);