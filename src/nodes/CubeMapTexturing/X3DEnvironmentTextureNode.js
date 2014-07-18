/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DEnvironmentTextureNode ### */
x3dom.registerNodeType(
    "X3DEnvironmentTextureNode",
    "CubeMapTexturing",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
        
        /**
         * Constructor for X3DEnvironmentTextureNode
         * @constructs x3dom.nodeTypes.X3DEnvironmentTextureNode
         * @x3d x.x
         * @component CubeMapTexturing
         * @status full
         * @extends x3dom.nodeTypes.X3DTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This abstract node type is the base type for all node types that specify cubic environment map sources for texture images.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DEnvironmentTextureNode.superClass.call(this, ctx);
        
        },
        {
            getTexUrl: function() {
                return [];  //abstract accessor for gfx
            },

            getTexSize: function() {
                return -1;  //abstract accessor for gfx
            }
        }
    )
);