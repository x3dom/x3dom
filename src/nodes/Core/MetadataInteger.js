/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### MetadataInteger ### */
x3dom.registerNodeType(
    "MetadataInteger",
    "Core",
    defineClass(x3dom.nodeTypes.X3DMetadataObject,
        function (ctx) {
            x3dom.nodeTypes.MetadataInteger.superClass.call(this, ctx);

            this.addField_MFInt32(ctx, 'value', []);
        }
    )
);