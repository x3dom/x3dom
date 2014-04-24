/** @namespace x3dom.nodeTypes */
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
        
        /**
         * Constructor for TextureTransform3D
         * @constructs x3dom.nodeTypes.TextureTransform3D
         * @x3d 3.3
         * @component Texturing3D
         * @status full
         * @extends x3dom.nodeTypes.X3DTextureTransformNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * The TextureTransform3D node specifies a 3D transformation that is applied to texture coordinates.
         * This node affects the way texture coordinates are applied to the geometric surface. The transformation consists of (in order):
         * a translation; a rotation about the centre point; and a non-uniform scale about the centre point.
         */
        function (ctx) {
            x3dom.nodeTypes.TextureTransform3D.superClass.call(this, ctx);


            /**
             * The center field specifies a translation offset in texture coordinate space about which the rotation and scale fields are applied.
             * @var {x3dom.fields.SFVec3f} center
             * @memberof x3dom.nodeTypes.TextureTransform3D
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'center', 0, 0, 0);

            /**
             * The rotation field specifies a rotation in angle base units of the texture coordinates about the center point after the scale has been applied.
             * A positive rotation value makes the texture coordinates rotate counterclockwise about the centre, thereby rotating the appearance of the texture itself clockwise.
             * @var {x3dom.fields.SFRotation} rotation
             * @memberof x3dom.nodeTypes.TextureTransform3D
             * @initvalue 0,0,1,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'rotation', 0, 0, 1, 0);

            /**
             * The scale field specifies a scaling factor in S and T of the texture coordinates about the center point.
             * @var {x3dom.fields.SFVec3f} scale
             * @memberof x3dom.nodeTypes.TextureTransform3D
             * @initvalue 1,1,1
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'scale', 1, 1, 1);

            /**
             * The translation field specifies a translation of the texture coordinates.
             * @var {x3dom.fields.SFVec3f} translation
             * @memberof x3dom.nodeTypes.TextureTransform3D
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'translation', 0, 0, 0);

            /**
             *
             * @var {x3dom.fields.SFRotation} scaleOrientation
             * @memberof x3dom.nodeTypes.TextureTransform3D
             * @initvalue 0,0,1,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'scaleOrientation', 0, 0, 1, 0);
        
        }
    )
);