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
         * @x3d 3.3
         * @component Navigation
         * @status experimental
         * @extends x3dom.nodeTypes.X3DViewpointNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The OrthoViewpoint node defines a viewpoint that provides an orthographic view of the scene.
         * An orthographic view is one in which all projectors are parallel to the projector from centerOfRotation to position.
         */
        function (ctx) {
            x3dom.nodeTypes.OrthoViewpoint.superClass.call(this, ctx);


            /**
             * The fieldOfView field specifies minimum and maximum extents of the view in units of the local coordinate system
             * @var {x3dom.fields.MFFloat} fieldOfView
             * @memberof x3dom.nodeTypes.OrthoViewpoint
             * @initvalue [-1,-1,1,1]
             * @field x3d
             * @instance
             */
            this.addField_MFFloat(ctx, 'fieldOfView', [-1, -1, 1, 1]);

            /**
             * Position (x, y, z in meters) relative to local coordinate system.
             * @var {x3dom.fields.SFVec3f} position
             * @memberof x3dom.nodeTypes.OrthoViewpoint
             * @initvalue 0,0,10
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'position', 0, 0, 10);

            /**
             * Rotation (axis, angle in radians) of Viewpoint, relative to default -Z axis direction in local coordinate system.
             * Hint: this is orientation _change_ from default direction (0 0 -1).
             * Hint: complex rotations can be accomplished axis-by-axis using parent Transforms.
             * @var {x3dom.fields.SFRotation} orientation
             * @range [-1, 1] or [-inf, inf]
             * @memberof x3dom.nodeTypes.OrthoViewpoint
             * @initvalue 0,0,0,1
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'orientation', 0, 0, 0, 1);

            /**
             * centerOfRotation point relates to NavigationInfo EXAMINE mode.
             * @var {x3dom.fields.SFVec3f} centerOfRotation
             * @memberof x3dom.nodeTypes.OrthoViewpoint
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'centerOfRotation', 0, 0, 0);

            /**
             * z-near position; used for clipping
             * @var {x3dom.fields.SFFloat} zNear
             * @memberof x3dom.nodeTypes.OrthoViewpoint
             * @initvalue 0.1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'zNear', 0.1);

            /**
             * z-far position; used for clipping
             * @var {x3dom.fields.SFFloat} zFar
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
                return this.getCurrentTransform().multMatrixPnt(this._vf.centerOfRotation);
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
				
				//Reset navigation helpers of the viewarea
                if (this._nameSpace && this._nameSpace.doc._viewarea) {
                    this._nameSpace.doc._viewarea.resetNavHelpers();
                }
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
