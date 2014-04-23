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
         * @extends x3dom.nodeTypes.X3DTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc A texture reference that can be used as a child of SurfaceShader.
         */
        function (ctx) {
            x3dom.nodeTypes.SurfaceShaderTexture.superClass.call(this, ctx);


            /**
             * Texture coordinate channel to use for this texture.
             * @var {x3dom.fields.SFInt32} textureCoordinatesId
             * @memberof x3dom.nodeTypes.SurfaceShaderTexture
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'textureCoordinatesId', 0);

            /**
             * Texture channels to use for this texture in the form of a glsl swizzle (e.g. "rgb", "abgr", "a").
             *  "DEFAULT" will use the default channels for the slot ("rgb" for colors and normals, "a" for alpha,
             *  shininess, ...).
             * @var {x3dom.fields.SFString} channelMask
             * @memberof x3dom.nodeTypes.SurfaceShaderTexture
             * @initvalue "DEFAULT"
             * @range [rgb,abgr,a,..]
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'channelMask', "DEFAULT");

            /**
             * Whether texture contains sRGB content and need to be linearized (NOT IMPLEMENTED!).
             * @var {x3dom.fields.SFBool} isSRGB
             * @memberof x3dom.nodeTypes.SurfaceShaderTexture
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'isSRGB', false);

            /**
             * The texture to use.
             * @var {x3dom.fields.SFNode} texture
             * @memberof x3dom.nodeTypes.SurfaceShaderTexture
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('texture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * An optional texture transform.
             * @var {x3dom.fields.SFNode} textureTransform
             * @memberof x3dom.nodeTypes.SurfaceShaderTexture
             * @initvalue x3dom.nodeTypes.X3DTextureTransformNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('textureTransform', x3dom.nodeTypes.X3DTextureTransformNode);
        
        }
    )
);