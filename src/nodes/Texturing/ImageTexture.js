/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### ImageTexture ### */
x3dom.registerNodeType(
    "ImageTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.Texture,
        
        /**
         * Constructor for ImageTexture
         * @constructs x3dom.nodeTypes.ImageTexture
         * @x3d 3.3
         * @component Texturing
         * @status full
         * @extends x3dom.nodeTypes.Texture
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc ImageTexture maps a 2D-image file onto a geometric shape.
         * Texture maps have a 2D coordinate system (s, t) horizontal and vertical, with (s, t) values in range [0.0, 1.0] for opposite corners of the image.
         */
        function (ctx) {
            x3dom.nodeTypes.ImageTexture.superClass.call(this, ctx);
        
        }
    )
);
