/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### ImageTexture3D ### */
x3dom.registerNodeType(
    "ImageTexture3D",
    "Texturing3D",
    defineClass(x3dom.nodeTypes.X3DTexture3DNode,
        
        /**
         * Constructor for ImageTexture3D
         * @constructs x3dom.nodeTypes.ImageTexture3D
         * @x3d 3.3
         * @component Texturing3D
         * @status full
         * @extends x3dom.nodeTypes.X3DTexture3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The ImageTexture3D node defines a texture map by specifying a single image file that contains complete 3D data and general parameters for mapping texels to geometry.
         * The texture is read from the URL specified by the url field. When the url field contains no values ([]), texturing is disabled.
         */
        function (ctx) {
            x3dom.nodeTypes.ImageTexture3D.superClass.call(this, ctx);
        
        }
    )
);