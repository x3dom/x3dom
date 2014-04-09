/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### ImageTextureAtlas ### */
x3dom.registerNodeType(
    "ImageTextureAtlas",
    "Texturing",
    defineClass(x3dom.nodeTypes.Texture,
        function (ctx) {
            x3dom.nodeTypes.ImageTextureAtlas.superClass.call(this, ctx);

            this.addField_SFInt32(ctx, 'numberOfSlices', 0);
            this.addField_SFInt32(ctx, 'slicesOverX', 0);
            this.addField_SFInt32(ctx, 'slicesOverY', 0);
            // Special helper node to represent tiles for volume rendering
        }
    )
);