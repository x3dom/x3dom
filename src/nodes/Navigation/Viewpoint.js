/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Viewpoint ### */
x3dom.registerNodeType(
    "Viewpoint",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DViewpointNode,
        
        /**
         * Constructor for Viewpoint
         * @constructs x3dom.nodeTypes.Viewpoint
         * @x3d 3.3
         * @component Navigation
         * @status experimental
         * @extends x3dom.nodeTypes.X3DViewpointNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Viewpoint provides a specific location and direction where the user may view the scene.
         * The principalPoint extention allows to set asymmetric frustums.
         */
        function (ctx) {
            x3dom.nodeTypes.Viewpoint.superClass.call(this, ctx);


            /**
             * Preferred minimum viewing angle from this viewpoint in radians.
             * Small field of view roughly corresponds to a telephoto lens, large field of view roughly corresponds to a wide-angle lens.
             * Hint: modifying Viewpoint distance to object may be better for zooming.
             * Warning: fieldOfView may not be correct for different window sizes and aspect ratios.
             * Interchange profile hint: this field may be ignored.
             * @var {x3dom.fields.SFFloat} fieldOfView
             * @range [0, pi]
             * @memberof x3dom.nodeTypes.Viewpoint
             * @initvalue 0.785398
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'fieldOfView', 0.785398);

            /**
             * The position fields of the Viewpoint node specifies a relative location in the local coordinate system. Position is relative to the coordinate system's origin (0,0,0),
             * @var {x3dom.fields.SFVec3f} position
             * @memberof x3dom.nodeTypes.Viewpoint
             * @initvalue 0,0,10
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'position', 0, 0, 10);

            /**
             * The orientation fields of the Viewpoint node specifies relative orientation to the default orientation.
             * @var {x3dom.fields.SFRotation} orientation
             * @memberof x3dom.nodeTypes.Viewpoint
             * @initvalue 0,0,1,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'orientation', 0, 0, 1, 0);

            /**
             * The centerOfRotation field specifies a center about which to rotate the user's eyepoint when in EXAMINE mode.
             * @var {x3dom.fields.SFVec3f} centerOfRotation
             * @memberof x3dom.nodeTypes.Viewpoint
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'centerOfRotation', 0, 0, 0);

            /**
             * Specifies the near plane.
             * @var {x3dom.fields.SFFloat} zNear
             * @range -1 or [0, inf]
             * @memberof x3dom.nodeTypes.Viewpoint
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'zNear', -1); //0.1);

            /**
             * Specifies the far plane.
             * @var {x3dom.fields.SFFloat} zFar
             * @range -1 or [0, inf]
             * @memberof x3dom.nodeTypes.Viewpoint
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'zFar', -1);  //100000);

            //this._viewMatrix = this._vf.orientation.toMatrix().transpose().
            //    mult(x3dom.fields.SFMatrix4f.translation(this._vf.position.negate()));
            this._viewMatrix = x3dom.fields.SFMatrix4f.translation(this._vf.position).
                mult(this._vf.orientation.toMatrix()).inverse();

            this._projMatrix = null;
            this._lastAspect = 1.0;

            // z-ratio: a value around 5000 would be better...
            this._zRatio = 10000;
            this._zNear = this._vf.zNear;
            this._zFar = this._vf.zFar;

            // special stuff...
            this._imgPlaneHeightAtDistOne = 2.0 * Math.tan(this._vf.fieldOfView / 2.0);
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "position" || fieldName == "orientation") {
                    this.resetView();
                }
                else if (fieldName == "fieldOfView" ||
                    fieldName == "zNear" || fieldName == "zFar") {
                    this._projMatrix = null;   // only trigger refresh
                    this._zNear = this._vf.zNear;
                    this._zFar = this._vf.zFar;
                    this._imgPlaneHeightAtDistOne = 2.0 * Math.tan(this._vf.fieldOfView / 2.0);
                }
                else if (fieldName.indexOf("bind") >= 0) {
                    // FIXME; call parent.fieldChanged();
                    this.bind(this._vf.bind);
                }
            },

            setProjectionMatrix: function(matrix)
            {
                this._projMatrix = matrix;
            },

            getCenterOfRotation: function() {
                return this.getCurrentTransform().multMatrixPnt(this._vf.centerOfRotation);
            },

            getViewMatrix: function() {
                return this._viewMatrix;
            },

            getFieldOfView: function() {
                return this._vf.fieldOfView;
            },

            resetView: function() {
                this._viewMatrix = x3dom.fields.SFMatrix4f.translation(this._vf.position).
                    mult(this._vf.orientation.toMatrix()).inverse();

				//Reset navigation helpers of the viewarea
                if (this._vf.isActive && this._nameSpace && this._nameSpace.doc._viewarea) {
                    this._nameSpace.doc._viewarea.resetNavHelpers();
                }
            },

            getNear: function() {
                return this._zNear;
            },

            getFar: function() {
                return this._zFar;
            },

            getImgPlaneHeightAtDistOne: function() {
                return this._imgPlaneHeightAtDistOne;
            },

            getProjectionMatrix: function(aspect)
            {
                var fovy = this._vf.fieldOfView;
                var zfar = this._vf.zFar;
                var znear = this._vf.zNear;

                if (znear <= 0 || zfar <= 0)
                {
                    var nearScale = 0.8, farScale = 1.2;
                    var viewarea = this._nameSpace.doc._viewarea;
                    var scene = viewarea._scene;

                    // Doesn't work if called e.g. from RenderedTexture with different sub-scene
                    var min = x3dom.fields.SFVec3f.copy(scene._lastMin);
                    var max = x3dom.fields.SFVec3f.copy(scene._lastMax);

                    var dia = max.subtract(min);
                    var sRad = dia.length() / 2;

                    var mat = viewarea.getViewMatrix().inverse();
                    var vp = mat.e3();

                    // account for scales around the viewpoint
                    var translation = new x3dom.fields.SFVec3f(0,0,0),
                        scaleFactor = new x3dom.fields.SFVec3f(1,1,1);
                    var rotation = new x3dom.fields.Quaternion(0,0,1,0),
                        scaleOrientation = new x3dom.fields.Quaternion(0,0,1,0);

                    // unfortunately, decompose is a rather expensive operation
                    mat.getTransform(translation, rotation, scaleFactor, scaleOrientation);

                    var minScal = scaleFactor.x, maxScal = scaleFactor.x;

                    if (maxScal < scaleFactor.y) maxScal = scaleFactor.y;
                    if (minScal > scaleFactor.y) minScal = scaleFactor.y;
                    if (maxScal < scaleFactor.z) maxScal = scaleFactor.z;
                    if (minScal > scaleFactor.z) minScal = scaleFactor.z;

                    if (maxScal > 1)
                        nearScale /= maxScal;
                    else if (minScal > x3dom.fields.Eps && minScal < 1)
                        farScale /= minScal;
                    // near/far scale adaption done

                    var sCenter = min.add(dia.multiply(0.5));
                    var vDist = (vp.subtract(sCenter)).length();

                    if (sRad) {
                        if (vDist > sRad)
                            znear = (vDist - sRad) * nearScale;  // Camera outside scene
                        else
                            znear = 0;                           // Camera inside scene

                        zfar = (vDist + sRad) * farScale;
                    }
                    else {
                        znear = 0.1;
                        zfar = 100000;
                    }

                    var zNearLimit = zfar / this._zRatio;
                    znear = Math.max(znear, Math.max(x3dom.fields.Eps, zNearLimit));

                    if (zfar > this._vf.zNear && this._vf.zNear > 0)
                        znear = this._vf.zNear;
                    if (this._vf.zFar > znear)
                        zfar = this._vf.zFar;

                    if (zfar <= znear)
                        zfar = znear + 1;
                    //x3dom.debug.logInfo("near: " + znear + " -> far:" + zfar);
                }

                if (this._projMatrix == null)
                {
                    this._projMatrix = x3dom.fields.SFMatrix4f.perspective(fovy, aspect, znear, zfar);
                }
                else if (this._zNear != znear || this._zFar != zfar)
                {
                    var div = znear - zfar;
                    this._projMatrix._22 = (znear + zfar) / div;
                    this._projMatrix._23 = 2 * znear * zfar / div;
                }
                else if (this._lastAspect != aspect)
                {
                    this._projMatrix._00 = (1 / Math.tan(fovy / 2)) / aspect;
                    this._lastAspect = aspect;
                }

                // also needed for being able to ask for near and far
                this._zNear = znear;
                this._zFar = zfar;

                return this._projMatrix;
            }
        }
    )
);
