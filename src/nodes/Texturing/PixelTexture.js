/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### PixelTexture ### */
x3dom.registerNodeType(
    "PixelTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
        
        /**
         * Constructor for PixelTexture
         * @constructs x3dom.nodeTypes.PixelTexture
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.PixelTexture.superClass.call(this, ctx);


            /**
             *
             * @var {SFImage} image
             * @memberof x3dom.nodeTypes.PixelTexture
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFImage(ctx, 'image', 0, 0, 0);
        
        },
        {
            fieldChanged: function(fieldName)
            {
                if (fieldName == "image") {
                    this.invalidateGLObject();
                }
            },

            getWidth: function() {
                return this._vf.image.width;
            },

            getHeight: function() {
                return this._vf.image.height;
            },

            getComponents: function() {
                return this._vf.image.comp;
            },

            setPixel: function(x, y, color) {
                this._vf.image.setPixel(x, y, color);
                this.invalidateGLObject();
            },

            getPixel: function(x, y) {
                return this._vf.image.getPixel(x, y);
            },

            setPixels: function(pixels) {
                this._vf.image.setPixels(pixels);
                this.invalidateGLObject();
            },

            getPixels: function() {
                return this._vf.image.getPixels();
            }
        }
    )
);