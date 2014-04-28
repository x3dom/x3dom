/** @namespace x3dom.nodeTypes */
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
        
        /**
         * Constructor for MultiTexture
         * @constructs x3dom.nodeTypes.MultiTexture
         * @x3d 3.3
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The MultiTexture node specifies the application of several individual textures to a 3D object to achieve a more complex visual effect.
         * MultiTexture can be used as a value for the texture field in an Appearance node.
         */
        function (ctx) {
            x3dom.nodeTypes.MultiTexture.superClass.call(this, ctx);


            /**
             * The texture field contains a list of texture nodes (e.g., ImageTexture, PixelTexture, and MovieTexture). The texture field may not contain another MultiTexture node.
             * @var {x3dom.fields.MFNode} texture
             * @memberof x3dom.nodeTypes.MultiTexture
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3d
             * @instance
             */
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