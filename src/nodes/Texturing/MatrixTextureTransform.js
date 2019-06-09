/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### TextureTransform ### */
x3dom.registerNodeType(
    "MatrixTextureTransform",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureTransformNode,
        
        /**
         * Constructor for MatrixTextureTransform
         * @constructs x3dom.nodeTypes.MatrixTextureTransform
         * @x3dom
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureTransformNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The MatrixTextureTransform node defines a 2D transformation as a 4x4 matrix that is applied to texture coordinates.
         * This node affects the way textures coordinates are applied to the geometric surface.
         */
        function (ctx) {
            x3dom.nodeTypes.MatrixTextureTransform.superClass.call(this, ctx);


            /**
            * Defines the texture coordinate transformation matrix.
            * @var {x3dom.fields.SFMatrix4f} matrix
            * @memberof x3dom.nodeTypes.MatrixTextureTransform
            * @initvalue 1,0,0,0
            * @field x3dom
            * @instance
            */
            this.addField_SFMatrix4f(ctx, 'matrix',
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1);
        
            this._trafo = this._vf.matrix.transpose();
            
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "matrix") {
                    this._trafo = this._vf.matrix.transpose();
                }
            }
            
        }
    )
);
