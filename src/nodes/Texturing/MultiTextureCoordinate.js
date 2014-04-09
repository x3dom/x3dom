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
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureCoordinateNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.MultiTextureCoordinate.superClass.call(this, ctx);


            /**
             *
             * @var {MFNode} texCoord
             * @memberof x3dom.nodeTypes.MultiTextureCoordinate
             * @initvalue x3dom.nodeTypes.X3DTextureCoordinateNode
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('texCoord', x3dom.nodeTypes.X3DTextureCoordinateNode);
        
        }
    )
);
