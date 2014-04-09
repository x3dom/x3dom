/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### TextureTransform3D ### */
x3dom.registerNodeType(
    "TextureTransform3D",
    "Texturing3D",
    defineClass(x3dom.nodeTypes.X3DTextureTransformNode,
        function (ctx) {
            x3dom.nodeTypes.TextureTransform3D.superClass.call(this, ctx);

            this.addField_SFVec3f(ctx, 'center', 0, 0, 0);
            this.addField_SFRotation(ctx, 'rotation', 0, 0, 1, 0);
            this.addField_SFVec3f(ctx, 'scale', 1, 1, 1);
            this.addField_SFVec3f(ctx, 'translation', 0, 0, 0);
            this.addField_SFRotation(ctx, 'scaleOrientation', 0, 0, 1, 0);
        }
    )
);