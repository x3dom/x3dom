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
         * @x3d x.x
         * @component Texturing3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureTransformNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.TextureTransform3D.superClass.call(this, ctx);


            /**
             *
             * @var {SFVec3f} center
             * @memberof x3dom.nodeTypes.TextureTransform3D
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'center', 0, 0, 0);

            /**
             *
             * @var {SFRotation} rotation
             * @memberof x3dom.nodeTypes.TextureTransform3D
             * @initvalue 0,0,1,0
             * @field x3dom
             * @instance
             */
            this.addField_SFRotation(ctx, 'rotation', 0, 0, 1, 0);

            /**
             *
             * @var {SFVec3f} scale
             * @memberof x3dom.nodeTypes.TextureTransform3D
             * @initvalue 1,1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'scale', 1, 1, 1);

            /**
             *
             * @var {SFVec3f} translation
             * @memberof x3dom.nodeTypes.TextureTransform3D
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'translation', 0, 0, 0);

            /**
             *
             * @var {SFRotation} scaleOrientation
             * @memberof x3dom.nodeTypes.TextureTransform3D
             * @initvalue 0,0,1,0
             * @field x3dom
             * @instance
             */
            this.addField_SFRotation(ctx, 'scaleOrientation', 0, 0, 1, 0);
        
        }
    )
);