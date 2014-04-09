/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DTexture3DNode ### */
x3dom.registerNodeType(
    "X3DTexture3DNode",
    "Texturing3D",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
        function (ctx) {
            x3dom.nodeTypes.X3DTexture3DNode.superClass.call(this, ctx);
        }
    )
);