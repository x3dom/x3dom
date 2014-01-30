/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/* ### X3DTexture3DNode ### */
x3dom.registerNodeType(
    "X3DTexture3DNode",
    "Texturing3D",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
        
        /**
         * Constructor for X3DTexture3DNode
         * @constructs x3dom.nodeTypes.X3DTexture3DNode
         * @x3d x.x
         * @component Texturing3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DTexture3DNode.superClass.call(this, ctx);
        
        }
    )
);

/* ### ComposedTexture3D ### */
x3dom.registerNodeType(
    "ComposedTexture3D",
    "Texturing3D",
    defineClass(x3dom.nodeTypes.X3DTexture3DNode,
        
        /**
         * Constructor for ComposedTexture3D
         * @constructs x3dom.nodeTypes.ComposedTexture3D
         * @x3d x.x
         * @component Texturing3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTexture3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.ComposedTexture3D.superClass.call(this, ctx);


            /**
             *
             * @var {MFNode} texture
             * @memberof x3dom.nodeTypes.ComposedTexture3D
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('texture', x3dom.nodeTypes.X3DTexture3DNode);
        
        }
    )
);

/* ### ImageTexture3D ### */
x3dom.registerNodeType(
    "ImageTexture3D",
    "Texturing3D",
    defineClass(x3dom.nodeTypes.X3DTexture3DNode,
        
        /**
         * Constructor for ImageTexture3D
         * @constructs x3dom.nodeTypes.ImageTexture3D
         * @x3d x.x
         * @component Texturing3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTexture3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.ImageTexture3D.superClass.call(this, ctx);
        
        }
    )
);

/* ### PixelTexture3D ### */
x3dom.registerNodeType(
    "PixelTexture3D",
    "Texturing3D",
    defineClass(x3dom.nodeTypes.X3DTexture3DNode,
        
        /**
         * Constructor for PixelTexture3D
         * @constructs x3dom.nodeTypes.PixelTexture3D
         * @x3d x.x
         * @component Texturing3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTexture3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.PixelTexture3D.superClass.call(this, ctx);
        
        }
    )
);

/* ### TextureCoordinate3D ### */
x3dom.registerNodeType(
    "TextureCoordinate3D",
    "Texturing3D",
    defineClass(x3dom.nodeTypes.X3DTextureCoordinateNode,
        
        /**
         * Constructor for TextureCoordinate3D
         * @constructs x3dom.nodeTypes.TextureCoordinate3D
         * @x3d x.x
         * @component Texturing3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureCoordinateNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.TextureCoordinate3D.superClass.call(this, ctx);


            /**
             *
             * @var {MFVec3f} point
             * @memberof x3dom.nodeTypes.TextureCoordinate3D
             * @field x3dom
             * @instance
             */
            this.addField_MFVec3f(ctx, 'point', []);
        
        }
    )
);

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
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'center', 0, 0, 0);

            /**
             *
             * @var {SFRotation} rotation
             * @memberof x3dom.nodeTypes.TextureTransform3D
             * @field x3dom
             * @instance
             */
            this.addField_SFRotation(ctx, 'rotation', 0, 0, 1, 0);

            /**
             *
             * @var {SFVec3f} scale
             * @memberof x3dom.nodeTypes.TextureTransform3D
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'scale', 1, 1, 1);

            /**
             *
             * @var {SFVec3f} translation
             * @memberof x3dom.nodeTypes.TextureTransform3D
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'translation', 0, 0, 0);

            /**
             *
             * @var {SFRotation} scaleOrientation
             * @memberof x3dom.nodeTypes.TextureTransform3D
             * @field x3dom
             * @instance
             */
            this.addField_SFRotation(ctx, 'scaleOrientation', 0, 0, 1, 0);
        
        }
    )
);

/* ### TextureTransformMatrix3D ### */
x3dom.registerNodeType(
    "TextureTransformMatrix3D",
    "Texturing3D",
    defineClass(x3dom.nodeTypes.X3DTextureTransformNode,
        
        /**
         * Constructor for TextureTransformMatrix3D
         * @constructs x3dom.nodeTypes.TextureTransformMatrix3D
         * @x3d x.x
         * @component Texturing3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureTransformNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.TextureTransformMatrix3D.superClass.call(this, ctx);


            /**
             *
             * @var {SFMatrix4f} matrix
             * @memberof x3dom.nodeTypes.TextureTransformMatrix3D
             * @field x3dom
             * @instance
             */
            this.addField_SFMatrix4f(ctx, 'matrix', 1, 0, 0, 0,
                                                    0, 1, 0, 0,
                                                    0, 0, 1, 0,
                                                    0, 0, 0, 1);
        
        }
    )
);

/* ### ImageTextureAtlas ### */
x3dom.registerNodeType(
    "ImageTextureAtlas",
    "Texturing",
    defineClass(x3dom.nodeTypes.Texture,
        
        /**
         * Constructor for ImageTextureAtlas
         * @constructs x3dom.nodeTypes.ImageTextureAtlas
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.Texture
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.ImageTextureAtlas.superClass.call(this, ctx);


            /**
             *
             * @var {SFInt32} numberOfSlices
             * @memberof x3dom.nodeTypes.ImageTextureAtlas
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'numberOfSlices', 0);

            /**
             *
             * @var {SFInt32} slicesOverX
             * @memberof x3dom.nodeTypes.ImageTextureAtlas
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'slicesOverX', 0);

            /**
             *
             * @var {SFInt32} slicesOverY
             * @memberof x3dom.nodeTypes.ImageTextureAtlas
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'slicesOverY', 0);
            // Special helper node to represent tiles for volume rendering
        
        }
    )
);
