/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DVertexAttributeNode ### */
x3dom.registerNodeType(
    "X3DVertexAttributeNode",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        function (ctx) {
            x3dom.nodeTypes.X3DVertexAttributeNode.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'name', "");
        }
    )
);