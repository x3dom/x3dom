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
        function (ctx) {
            x3dom.nodeTypes.ImageTexture3D.superClass.call(this, ctx);
        }
    )
);