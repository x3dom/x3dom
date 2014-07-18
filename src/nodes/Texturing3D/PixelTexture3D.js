/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### PixelTexture3D ### */
x3dom.registerNodeType(
    "PixelTexture3D",
    "Texturing3D",
    defineClass(x3dom.nodeTypes.X3DTexture3DNode,
        
        /**
         * Constructor for PixelTexture3D
         * @constructs x3dom.nodeTypes.PixelTexture3D
         * @x3d 3.3
         * @component Texturing3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTexture3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The PixelTexture3D node defines a 3D image-based texture map as an explicit array of pixel values (image field) and parameters controlling tiling repetition of the texture onto geometry.
         */
        function (ctx) {
            x3dom.nodeTypes.PixelTexture3D.superClass.call(this, ctx);
        
        }
    )
);