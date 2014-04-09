/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### CoordinateDamper ### */
x3dom.registerNodeType(
    "CoordinateDamper",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        function (ctx) {
            x3dom.nodeTypes.CoordinateDamper.superClass.call(this, ctx);

            this.addField_MFVec3f(ctx, 'initialDestination', []);
            this.addField_MFVec3f(ctx, 'initialValue', []);

            this.addField_MFVec3f(ctx, 'value', []);
            this.addField_MFVec3f(ctx, 'destination', []);

            x3dom.debug.logWarning("CoordinateDamper NYI");
        }
    )
);