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
         * @x3d 3.3
         * @component Texturing3D
         * @status full
         * @extends x3dom.nodeTypes.X3DTextureTransformNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The TextureTransform3D node specifies a 3D transformation that is applied to texture coordinates.
         * This node affects the way texture coordinates are applied to the geometric surface.
         * The transformation consists of a transformation matrix.
         */
        function (ctx) {
            x3dom.nodeTypes.TextureTransformMatrix3D.superClass.call(this, ctx);


            /**
             * The matrix field specifies a generalized, unfiltered 4×4 transformation matrix that can be used to modify the texture. Any set of values is permitted.
             * @var {x3dom.fields.SFMatrix4f} matrix
             * @memberof x3dom.nodeTypes.TextureTransformMatrix3D
             * @initvalue 1,0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFMatrix4f(ctx, 'matrix',
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1);
        
        }
    )
);