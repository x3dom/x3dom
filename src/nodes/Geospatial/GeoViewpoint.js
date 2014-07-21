/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### GeoViewpoint ### */
x3dom.registerNodeType(
    "GeoViewpoint",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DViewpointNode,
        
        /**
         * Constructor for GeoViewpoint
         * @constructs x3dom.nodeTypes.GeoViewpoint
         * @x3d 3.3
         * @component Geospatial
         * @status experimental
         * @extends x3dom.nodeTypes.X3DViewpointNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The GeoViewpoint node allows the specification of a viewpoint in terms of a geospatial coordinate.
         * This node can be used wherever a Viewpoint node can be used and can be combined with Viewpoint nodes in the same scene.
         */
        function (ctx) {
            x3dom.nodeTypes.GeoViewpoint.superClass.call(this, ctx);


            /**
             * The geoSystem field is used to define the spatial reference frame.
             * @var {x3dom.fields.MFString} geoSystem
             * @range {["GD", ...], ["UTM", ...], ["GC", ...]}
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue ['GD','WE']
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);

            /**
             * Preferred minimum viewing angle from this viewpoint in radians.
             * Small field of view roughly corresponds to a telephoto lens, large field of view roughly corresponds to a wide-angle lens.
             * Hint: modifying Viewpoint distance to object may be better for zooming.
             * Warning: fieldOfView may not be correct for different window sizes and aspect ratios.
             * Interchange profile hint: this field may be ignored.
             * @var {x3dom.fields.SFFloat} fieldOfView
             * @range [0, pi]
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue 0.785398
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'fieldOfView', 0.785398);

            /**
             * The orientation fields of the Viewpoint node specifies relative orientation to the default orientation.
             * @var {x3dom.fields.SFRotation} orientation
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue 0,0,1,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'orientation', 0, 0, 1, 0);

            /**
             * The centerOfRotation field specifies a center about which to rotate the user's eyepoint when in EXAMINE mode. It is provided in a format consistent with that specified by geoSystem.
             * @var {x3dom.fields.SFVec3f} centerOfRotation
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'centerOfRotation', 0, 0, 0);

            /**
             * The position fields of the Viewpoint node specifies a relative location in the local coordinate system. It is provided in a format consistent with that specified by geoSystem. 
             * @var {x3dom.fields.SFVec3d} position
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue 0,0,100000
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3d(ctx, 'position', 0, 0, 100000);

            /**
             * Enable/disable directional light that always points in the direction the user is looking. Removed in X3D V3.3. See NavigationInfo
             * @var {x3dom.fields.SFBool} headlight
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'headlight', true);

            /**
             * Specifies the navigation type. Removed in X3D V3.3. See NavigationInfo
             * @var {x3dom.fields.MFString} navType
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue 'EXAMINE'
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'navType', 'EXAMINE');

            /**
             * The speedFactor field of the GeoViewpoint node is used as a multiplier to the elevation-based velocity that the node sets internally; i.e., this is a relative value and not an absolute speed as is the case for the NavigationInfo node.
             * @var {x3dom.fields.SFFloat} speedFactor
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue 1.0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'speedFactor', 1.0);

            /**
             * The geoOrigin field is used to specify a local coordinate frame for extended precision.
             * @var {x3dom.fields.SFNode} geoOrigin
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue x3dom.nodeTypes.X3DViewpointNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.X3DViewpointNode);

            // borrowed from Viewpoint.js
           
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
        // all borrowed from Viewpoint.js
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
                return this._vf.centerOfRotation;
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