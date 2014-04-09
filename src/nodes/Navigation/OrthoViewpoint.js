/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### OrthoViewpoint ### */
x3dom.registerNodeType(
    "OrthoViewpoint",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DViewpointNode,
        
        /**
         * Constructor for OrthoViewpoint
         * @constructs x3dom.nodeTypes.OrthoViewpoint
         * @x3d x.x
         * @component Navigation
         * @status experimental
         * @extends x3dom.nodeTypes.X3DViewpointNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.OrthoViewpoint.superClass.call(this, ctx);


            /**
             *
             * @var {MFFloat} fieldOfView
             * @memberof x3dom.nodeTypes.OrthoViewpoint
             * @initvalue [-1,-1,1,1]
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'fieldOfView', [-1, -1, 1, 1]);

            /**
             *
             * @var {SFVec3f} position
             * @memberof x3dom.nodeTypes.OrthoViewpoint
             * @initvalue 0,0,10
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'position', 0, 0, 10);

            /**
             *
             * @var {SFRotation} orientation
             * @memberof x3dom.nodeTypes.OrthoViewpoint
             * @initvalue 0,0,0,1
             * @field x3dom
             * @instance
             */
            this.addField_SFRotation(ctx, 'orientation', 0, 0, 0, 1);

            /**
             *
             * @var {SFVec3f} centerOfRotation
             * @memberof x3dom.nodeTypes.OrthoViewpoint
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'centerOfRotation', 0, 0, 0);

            /**
             *
             * @var {SFFloat} zNear
             * @memberof x3dom.nodeTypes.OrthoViewpoint
             * @initvalue 0.1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'zNear', 0.1);

            /**
             *
             * @var {SFFloat} zFar
             * @memberof x3dom.nodeTypes.OrthoViewpoint
             * @initvalue 10000
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'zFar', 10000);

            this._viewMatrix = null;
            this._projMatrix = null;
            this._lastAspect = 1.0;

            this.resetView();
        
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "position" || fieldName == "orientation") {
                    this.resetView();
                }
                else if (fieldName == "fieldOfView" ||
                    fieldName == "zNear" || fieldName == "zFar") {
                    this._projMatrix = null;   // trigger refresh
                    this.resetView();
                }
                else if (fieldName.indexOf("bind") >= 0) {
                    this.bind(this._vf.bind);
                }
            },

            getCenterOfRotation: function() {
                return this._vf.centerOfRotation;
            },

            getViewMatrix: function() {
                return this._viewMatrix;
            },

            resetView: function() {
                var offset = x3dom.fields.SFMatrix4f.translation(new x3dom.fields.SFVec3f(
                        (this._vf.fieldOfView[0] + this._vf.fieldOfView[2]) / 2,
                        (this._vf.fieldOfView[1] + this._vf.fieldOfView[3]) / 2, 0));

                this._viewMatrix = x3dom.fields.SFMatrix4f.translation(this._vf.position).
                    mult(this._vf.orientation.toMatrix());
                this._viewMatrix = this._viewMatrix.mult(offset).inverse();
            },

            getNear: function() {
                return this._vf.zNear;
            },

            getFar: function() {
                return this._vf.zFar;
            },

            getProjectionMatrix: function(aspect)
            {
                if (this._projMatrix == null || this._lastAspect != aspect)
                {
                    var near = this.getNear();
                    var far = this.getFar();

                    var left = this._vf.fieldOfView[0];
                    var bottom = this._vf.fieldOfView[1];
                    var right = this._vf.fieldOfView[2];
                    var top = this._vf.fieldOfView[3];

                    this._projMatrix = x3dom.fields.SFMatrix4f.ortho(left, right, bottom, top, near, far, aspect);
                }
                this._lastAspect = aspect;

                return this._projMatrix;
            }
        }
    )
);