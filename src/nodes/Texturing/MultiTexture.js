/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### MultiTexture ### */
x3dom.registerNodeType(
    "MultiTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
        function (ctx) {
            x3dom.nodeTypes.MultiTexture.superClass.call(this, ctx);

            this.addField_MFNode('texture', x3dom.nodeTypes.X3DTextureNode);
        },
        {
            getTexture: function(pos) {
                if (pos >= 0 && pos < this._cf.texture.nodes.length) {
                    return this._cf.texture.nodes[pos];
                }
                return null;
            },

            getTextures: function() {
                return this._cf.texture.nodes;
            },

            size: function() {
                return this._cf.texture.nodes.length;
            }
        }
    )
);