/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### MultiTextureCoordinate ### */
x3dom.registerNodeType(
    "MultiTextureCoordinate",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureCoordinateNode,
        
        /**
         * Constructor for MultiTextureCoordinate
         * @constructs x3dom.nodeTypes.MultiTextureCoordinate
         * @x3d 3.3
         * @component Texturing
         * @status full
         * @extends x3dom.nodeTypes.X3DTextureCoordinateNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc MultiTextureCoordinate supplies multiple texture coordinates per vertex. This node can be used to set the texture coordinates for the different texture channels.
         */
        function (ctx) {
            x3dom.nodeTypes.MultiTextureCoordinate.superClass.call(this, ctx);


            /**
             * Each entry in the texCoord field may contain a TextureCoordinate or TextureCoordinateGenerator node.
             * @var {x3dom.fields.MFNode} texCoord
             * @memberof x3dom.nodeTypes.MultiTextureCoordinate
             * @initvalue x3dom.nodeTypes.X3DTextureCoordinateNode
             * @field x3d
             * @instance
             */
            this.addField_MFNode('texCoord', x3dom.nodeTypes.X3DTextureCoordinateNode);
        
        }
    )
);
