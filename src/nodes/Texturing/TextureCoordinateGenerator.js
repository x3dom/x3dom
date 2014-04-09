/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### TextureCoordinateGenerator ### */
x3dom.registerNodeType(
    "TextureCoordinateGenerator",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureCoordinateNode,
        function (ctx) {
            x3dom.nodeTypes.TextureCoordinateGenerator.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'mode', "SPHERE");
            this.addField_MFFloat(ctx, 'parameter', []);
        }
    )
);