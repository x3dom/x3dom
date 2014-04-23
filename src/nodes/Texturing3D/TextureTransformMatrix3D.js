/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### TextureTransformMatrix3D ### */
x3dom.registerNodeType(
    "TextureTransformMatrix3D",
    "Texturing3D",
    defineClass(x3dom.nodeTypes.X3DTextureTransformNode,
        
        /**
         * Constructor for TextureTransformMatrix3D
         * @constructs x3dom.nodeTypes.TextureTransformMatrix3D
         * @x3d x.x
         * @component Texturing3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureTransformNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.TextureTransformMatrix3D.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.SFMatrix4f} matrix
             * @memberof x3dom.nodeTypes.TextureTransformMatrix3D
             * @initvalue 1,0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFMatrix4f(ctx, 'matrix', 1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1);
        
        }
    )
);