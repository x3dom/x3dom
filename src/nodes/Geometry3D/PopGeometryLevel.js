/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### PopGeometryLevel ### */
x3dom.registerNodeType(
    "PopGeometryLevel",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        function (ctx) {
            x3dom.nodeTypes.PopGeometryLevel.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'src', "");
            this.addField_SFInt32(ctx, 'numIndices', 0);
            this.addField_SFInt32(ctx, 'vertexDataBufferOffset', 0);
        },
        {
            getSrc: function () {
                return this._vf.src;
            },

            getNumIndices: function () {
                return this._vf.numIndices;
            },

            getVertexDataBufferOffset: function () {
                return this._vf.vertexDataBufferOffset;
            }
        }
    )
);