/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### ComposedTexture3D ### */
x3dom.registerNodeType(
    "ComposedTexture3D",
    "Texturing3D",
    defineClass(x3dom.nodeTypes.X3DTexture3DNode,
        function (ctx) {
            x3dom.nodeTypes.ComposedTexture3D.superClass.call(this, ctx);

            this.addField_MFNode('texture', x3dom.nodeTypes.X3DTexture3DNode);
        }
    )
);