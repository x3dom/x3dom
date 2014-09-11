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
         * @x3d 3.3
         * @component Texturing3D
         * @status full
         * @extends x3dom.nodeTypes.X3DTexture3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The ComposedTexture3D node defines a 3D image-based texture map as a collection of 2D texture sources at various depths and parameters controlling tiling repetition of the texture onto geometry.
         */
        function (ctx) {
            x3dom.nodeTypes.ComposedTexture3D.superClass.call(this, ctx);


            /**
             * The texture values are interpreted with the first image being at depth 0 and each following image representing an increasing depth value in the R direction.
             * A user shall provide 2^n source textures in this array. The individual source textures will ignore their repeat field values.
             * @var {x3dom.fields.MFNode} texture
             * @memberof x3dom.nodeTypes.ComposedTexture3D
             * @initvalue x3dom.nodeTypes.X3DTexture3DNode
             * @field x3d
             * @instance
             */
            this.addField_MFNode('texture', x3dom.nodeTypes.X3DTexture3DNode);
        
        }
    )
);