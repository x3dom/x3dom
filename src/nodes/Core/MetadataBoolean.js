/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### MetadataBoolean ### */
x3dom.registerNodeType(
    "MetadataBoolean",
    "Core",
    defineClass(x3dom.nodeTypes.X3DMetadataObject,
        function (ctx) {
            x3dom.nodeTypes.MetadataBoolean.superClass.call(this, ctx);

            this.addField_MFBoolean(ctx, 'value', []);
        }
    )
);