/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### FloatVertexAttribute ### */
x3dom.registerNodeType(
    "FloatVertexAttribute",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DVertexAttributeNode,
        function (ctx) {
            x3dom.nodeTypes.FloatVertexAttribute.superClass.call(this, ctx);

            this.addField_SFInt32(ctx, 'numComponents', 4);
            this.addField_MFFloat(ctx, 'value', []);
        }
    )
);