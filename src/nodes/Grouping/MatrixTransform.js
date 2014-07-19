/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### MatrixTransform ###
x3dom.registerNodeType(
    "MatrixTransform",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DTransformNode,
        
        /**
         * Constructor for MatrixTransform
         * @constructs x3dom.nodeTypes.MatrixTransform
         * @x3d x.x
         * @component Grouping
         * @extends x3dom.nodeTypes.X3DTransformNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The MatrixTransform node is a grouping node that defines a coordinate system for its children that is relative to the coordinate systems of its ancestors.
         * The transformation is given as a matrix.
         */
        function (ctx) {
            x3dom.nodeTypes.MatrixTransform.superClass.call(this, ctx);


            /**
             * Defines the transformation matrix.
             * @var {x3dom.fields.SFMatrix4f} matrix
             * @memberof x3dom.nodeTypes.MatrixTransform
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

                    this.invalidateVolume();
                    //this.invalidateCache();
                }
                else if (fieldName == "render") {
                    this.invalidateVolume();
                    //this.invalidateCache();
                }
            }
        }
    )
);