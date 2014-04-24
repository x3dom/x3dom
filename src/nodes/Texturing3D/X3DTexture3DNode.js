/** @namespace x3dom.nodeTypes */
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
        
        /**
         * Constructor for X3DTexture3DNode
         * @constructs x3dom.nodeTypes.X3DTexture3DNode
         * @x3d 3.3
         * @component Texturing3D
         * @status full
         * @extends x3dom.nodeTypes.X3DTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This abstract node type is the base type for all node types that specify 3D sources for texture images.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DTexture3DNode.superClass.call(this, ctx);
        
        }
    )
);