/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### SurfaceShaderTexture ### */
x3dom.registerNodeType(
    "SurfaceShaderTexture",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
        function (ctx) {
            x3dom.nodeTypes.SurfaceShaderTexture.superClass.call(this, ctx);

            this.addField_SFInt32(ctx, 'textureCoordinatesId', 0);
            this.addField_SFString(ctx, 'channelMask', "DEFAULT");
            this.addField_SFBool(ctx, 'isSRGB', false);
            this.addField_SFNode('texture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('textureTransform', x3dom.nodeTypes.X3DTextureTransformNode);
        }
    )
);