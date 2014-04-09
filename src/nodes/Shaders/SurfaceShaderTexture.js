/** @namespace x3dom.nodeTypes */
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
        
        /**
         * Constructor for SurfaceShaderTexture
         * @constructs x3dom.nodeTypes.SurfaceShaderTexture
         * @x3d x.x
         * @component Shaders
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.SurfaceShaderTexture.superClass.call(this, ctx);


            /**
             *
             * @var {SFInt32} textureCoordinatesId
             * @memberof x3dom.nodeTypes.SurfaceShaderTexture
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'textureCoordinatesId', 0);

            /**
             *
             * @var {SFString} channelMask
             * @memberof x3dom.nodeTypes.SurfaceShaderTexture
             * @initvalue "DEFAULT"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'channelMask', "DEFAULT");

            /**
             *
             * @var {SFBool} isSRGB
             * @memberof x3dom.nodeTypes.SurfaceShaderTexture
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'isSRGB', false);

            /**
             *
             * @var {SFNode} texture
             * @memberof x3dom.nodeTypes.SurfaceShaderTexture
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('texture', x3dom.nodeTypes.X3DTextureNode);

            /**
             *
             * @var {SFNode} textureTransform
             * @memberof x3dom.nodeTypes.SurfaceShaderTexture
             * @initvalue x3dom.nodeTypes.X3DTextureTransformNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('textureTransform', x3dom.nodeTypes.X3DTextureTransformNode);
        
        }
    )
);