/** @namespace x3dom.nodeTypes */
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
        
        /**
         * Constructor for ComposedTexture3D
         * @constructs x3dom.nodeTypes.ComposedTexture3D
         * @x3d x.x
         * @component Texturing3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTexture3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.ComposedTexture3D.superClass.call(this, ctx);


            /**
             *
             * @var {MFNode} texture
             * @memberof x3dom.nodeTypes.ComposedTexture3D
             * @initvalue x3dom.nodeTypes.X3DTexture3DNode
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('texture', x3dom.nodeTypes.X3DTexture3DNode);
        
        }
    )
);