/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Viewfrustum ### */
x3dom.registerNodeType(
    "Viewfrustum",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DViewpointNode,
        
        /**
         * Constructor for Viewfrustum
         * @constructs x3dom.nodeTypes.Viewfrustum
         * @x3d x.x
         * @component Navigation
         * @extends x3dom.nodeTypes.X3DViewpointNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Viewfrustum node allows to define a camera position and projection utilizing a standard OpenGL projection/modelview pair.
         */
        function (ctx) {
            x3dom.nodeTypes.Viewfrustum.superClass.call(this, ctx);


            /**
             * Camera modelview matrix
             * @var {x3dom.fields.SFMatrix4f} modelview
             * @memberof x3dom.nodeTypes.Viewfrustum
             * @initvalue 1,0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFMatrix4f(ctx, 'modelview',
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1);

            /**
             * Camera projection matrix
             * @var {x3dom.fields.SFMatrix4f} projection
             * @memberof x3dom.nodeTypes.Viewfrustum
             * @initvalue 1,0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFMatrix4f(ctx, 'projection',
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1);

            this._viewMatrix = this._vf.modelview.transpose().inverse();
            this._projMatrix = this._vf.projection.transpose();

            this._centerOfRotation = new x3dom.fields.SFVec3f(0, 0, 0);
            // FIXME; derive near/far from current matrix, if requested!
        
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "modelview") {
                    this.resetView();
                }
                else if (fieldName == "projection") {
                    this._projMatrix = this._vf.projection.transpose();
                }
                else if (fieldName.indexOf("bind") >= 0) {
                    this.bind(this._vf.bind);
                }
            },

            getCenterOfRotation: function() {
                return this.getCurrentTransform().multMatrixPnt(this._centerOfRotation);  // this field is only a little helper for examine mode
            },

            setCenterOfRotation: function(cor) {
                this._centerOfRotation.setValues(cor);   // update internal helper field
            },

            getViewMatrix: function() {
                return this._viewMatrix;
            },

            getFieldOfView: function() {
                return (2.0 * Math.atan(1.0 / this._projMatrix._11));
            },

            getImgPlaneHeightAtDistOne: function() {
                return 2.0 / this._projMatrix._11;
            },

            resetView: function() {
                this._viewMatrix = this._vf.modelview.transpose().inverse();
                this._centerOfRotation = new x3dom.fields.SFVec3f(0, 0, 0);       // reset helper, too
            },

            getProjectionMatrix: function(aspect) {
                return this._projMatrix;
            }
        }
    )
);
