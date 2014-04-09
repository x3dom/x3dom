/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### TexCoordDamper2D ### */
x3dom.registerNodeType(
    "TexCoordDamper2D",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        function (ctx) {
            x3dom.nodeTypes.TexCoordDamper2D.superClass.call(this, ctx);

            this.addField_MFVec2f(ctx, 'initialDestination', []);
            this.addField_MFVec2f(ctx, 'initialValue', []);

            this.addField_MFVec2f(ctx, 'value', []);
            this.addField_MFVec2f(ctx, 'destination', []);

            x3dom.debug.logWarning("TexCoordDamper2D NYI");
        }
    )
);