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
             * The centerOfRotation field specifies a center about which to rotate the user's eyepoint when in EXAMINE mode.
             * The coordinates are provided in the coordinate system specified by geoSystem.
             * @var {x3dom.fields.SFVec3f} centerOfRotation
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'centerOfRotation', 0, 0, 0);

            /**
             * The position fields of the Viewpoint node specifies a relative location in the local coordinate system.
             * The coordinates are provided in the coordinate system specified by geoSystem. 
             * @var {x3dom.fields.SFVec3d} position
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue 0,0,100000
             * @field x3d
             * @instance
             */
            this.addField_SFVec3d(ctx, 'position', 0, 0, 100000);

            /**
             * Enable/disable directional light that always points in the direction the user is looking.
             * Removed in X3D V3.3. See NavigationInfo
             * still supported but required changing default to undefined since could be already given by NavigationInfo
             * @var {x3dom.fields.SFBool} headlight
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue undefined
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'headlight', undefined);

            /**
             * Specifies the navigation type.
             * Removed in X3D V3.3. See NavigationInfo
             * still supported but required changing default to undefined since could be already given by NavigationInfo
             * @var {x3dom.fields.MFString} navType
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue undefined
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'navType', undefined);

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
            this.addField_SFFloat(ctx, 'zFar', -1); //100000);
                        
            /**
             * Enable/disable elevation scaled speed for automatic adjustment of user movement as recommended in spec. 
             * Custom field to allow disabling for performance
             * @var {x3dom.fields.SFBool} elevationScaling
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'elevationScaling', true);

            /**
             * The geoOrigin field is used to specify a local coordinate frame for extended precision.
             * @var {x3dom.fields.SFNode} geoOrigin
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue x3dom.nodeTypes.X3DViewpointNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.GeoOrigin);
            
            // save centerOfRotation field for reset
            this._geoCenterOfRotation = this._vf.centerOfRotation ;
            this._viewMatrix = x3dom.fields.SFMatrix4f.identity(); // needs to be initialized for Inline
        },
        {
            // redefine activate function to save initial speed
            // from X3DViewpoint.js
            activate: function (prev) {
                var viewarea = this._nameSpace.doc._viewarea;
                
                if (prev) {
                    viewarea.animateTo(this, prev._autoGen ? null : prev);
                }
                viewarea._needNavigationMatrixUpdate = true;
                
                x3dom.nodeTypes.X3DBindableNode.prototype.activate.call(this, prev);
                
                var navi = viewarea._scene.getNavigationInfo();
                this._initSpeed = navi._vf.speed;
                this._examineSpeed = navi._vf.speed;
                this._lastSpeed = navi._vf.speed;
                this._userSpeedFactor = 1.0;
                this._lastNavType = navi.getType();
                x3dom.debug.logInfo("initial navigation speed: " + this._initSpeed);
                // x3dom.debug.logInfo(this._xmlNode.hasAttribute('headlight'));
                // set headlight and navType here if they are given (but removed from spec.)
                // is there a way to check if fields are given in the document ? (dom has default values if not given)
                if (this._vf.headlight !== undefined) {navi._vf.headlight = this._vf.headlight;}
                if (this._vf.navType !== undefined) {navi._vf.navType = this._vf.navType;}
                
            },
            
            // redefine deactivate to restore initial speed
            deactivate: function (prev) {
                var viewarea = this._nameSpace.doc._viewarea;
                var navi = viewarea._scene.getNavigationInfo();
                //retain examine mode speed modifications
                navi._vf.speed = this._examineSpeed;
                x3dom.debug.logInfo("navigation speed restored to: " + this._examineSpeed);
                x3dom.nodeTypes.X3DBindableNode.prototype.deactivate.call(this, prev);
                // somehow this.getViewMatrix gets called one more time after deactivate and resets speed, check there
            },
            
            // redefine, otherwise in X3DBindableNode
            nodeChanged: function() {
                
                this._stack = this._nameSpace.doc._bindableBag.addBindable(this);
                
                // for local use
                this._geoOrigin = this._cf.geoOrigin;
                this._geoSystem = this._vf.geoSystem;
                this._position = this._vf.position;
                this._orientation = this._vf.orientation;
                
                // needs to be here because of GeoOrigin subnode
                this._viewMatrix = this.getInitViewMatrix(this._orientation, this._geoSystem, this._geoOrigin, this._position);

                // also transform centerOfRotation for initial view                
                this._vf.centerOfRotation = this.getGeoCenterOfRotation(this._geoSystem, this._geoOrigin, this._geoCenterOfRotation);
                
                // borrowed from Viewpoint.js
            
                this._projMatrix = null;
                this._lastAspect = 1.0;
 
                // z-ratio: a value around 5000 would be better...
                this._zRatio = 10000;
                // set to -1 to trigger automatic setting
                this._zNear = this._vf.zNear;
                this._zFar = this._vf.zFar ;
                
                // special stuff...
                this._imgPlaneHeightAtDistOne = 2.0 * Math.tan(this._vf.fieldOfView / 2.0);
                
            },
            
            // all borrowed from Viewpoint.js
            fieldChanged: function (fieldName) {
                if (fieldName == "position" || fieldName == "orientation") {
                    this.resetView();
                }
                else if (fieldName == "fieldOfView" ||
                    fieldName == "zNear" || fieldName == "zFar") {
                    this._projMatrix = null;   // only trigger refresh
                    this._zNear = this._vf.zNear;
                    this._zFar = this._vf.zFar ;
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
                // is already transformed to GC
                // return is expected in world coords.
                return this.getCurrentTransform().multMatrixPnt(this._vf.centerOfRotation);
            },
            
            getGeoCenterOfRotation: function(geoSystem, geoOrigin, geoCenterOfRotation) {
                var coords = new x3dom.fields.MFVec3f();
                coords.push(geoCenterOfRotation);
                var transformed = x3dom.nodeTypes.GeoCoordinate.prototype.GEOtoX3D(geoSystem, geoOrigin, coords);
                return transformed[0];
            },
            
            isExamineMode: function(navType) {
                return (navType == 'examine' || navType == 'turntable' || navType == 'lookaround' || navType == 'lookat');
            },
            
            getViewMatrix: function() {
                // called a lot from viewarea.js; (ab)use for updating elevation scaled speed
                // do only if elevationScaling is enabled
                // skip frames for performance ? do only every 0.1s or so ?
                // gets called once even after being deactivated
                if (this._vf.isActive && this._vf.elevationScaling) {
                    var viewarea = this._nameSpace.doc._viewarea;
                    var navi = viewarea._scene.getNavigationInfo();
                    var navType = navi.getType();
                    // manage examine mode: do not use elevation scaled speed and keep own speed
                    if (this.isExamineMode(navType)) {
                        if (!this.isExamineMode(this._lastNavType)) {
                            navi._vf.speed = this._examineSpeed;
                        }
                        this._lastNavType = navType;
                    }
                    else {
                        if (this.isExamineMode(this._lastNavType)) {
                            this._examineSpeed = navi._vf.speed;
                            x3dom.debug.logInfo("back from examine mode, resume speed: " + this._lastSpeed);
                            navi._vf.speed = this._lastSpeed;
                        }
                        this._lastNavType = navType;
                        // check if speed was modified interactively
                        if (navi._vf.speed != this._lastSpeed) {
                            this._userSpeedFactor *= navi._vf.speed / this._lastSpeed;
                            x3dom.debug.logInfo("interactive speed factor changed: " + this._userSpeedFactor);
                        }
                        
                        // get elevation above ground
                        // current position in x3d 
                        // borrowed from webgl_gfx.js
                        var viewtrafo = viewarea._scene.getViewpoint().getCurrentTransform();
                        viewtrafo = viewtrafo.inverse().mult(this._viewMatrix);
                        var position = viewtrafo.inverse().e3();
                        
                        var geoOrigin = this._geoOrigin;
                        var geoSystem = this._geoSystem;
                        // assume GC
                        var positionGC = position;
                        
                        if (geoOrigin.node) {
                            var origin = x3dom.nodeTypes.GeoCoordinate.prototype.OriginToGC(geoOrigin);
                            // first rotate if requested 
                            if(geoOrigin.node._vf.rotateYUp) {
                                // rotation is GeoLocation rotation
                                var rotmat = x3dom.nodeTypes.GeoLocation.prototype.getGeoRotMat(geoSystem, origin);
                                positionGC = rotmat.multMatrixPnt(position);
                                }
                            // then translate
                            positionGC = positionGC.add(origin);
                        }
                        
                        // x3dom.debug.logInfo("viewpoint position " + positionGC);
                        
                        var coords = new x3dom.fields.MFVec3f();
                        coords.push(positionGC);
                        // could be a bit optimized since geoSystem does not change
                        // eg., move initial settings of GCtoGD outside 
                        var positionGD = x3dom.nodeTypes.GeoCoordinate.prototype.GCtoGD(geoSystem, coords)[0];
                        // at 10m above ground a speed of 1 sounds about right; make positive if below ground                      
                        var elevationSpeed = Math.abs(positionGD.z/10);
                        // keep above 1 to be able to move close to the ground
                        elevationSpeed = elevationSpeed > 1 ? elevationSpeed : 1;
                        navi._vf.speed = elevationSpeed * this._vf.speedFactor * this._userSpeedFactor;
                        this._lastSpeed = navi._vf.speed;
                    }
                }
                return this._viewMatrix;
            },
            
            getInitViewMatrix: function(orientation, geoSystem, geoOrigin, position) {
                // orientation needs to rotated as in GeoLocation node
                var coords = new x3dom.fields.MFVec3f();
                coords.push(position);
                var positionGC = x3dom.nodeTypes.GeoCoordinate.prototype.GEOtoGC(geoSystem, geoOrigin, coords)[0];
                // x3dom.debug.logInfo("GEOVIEWPOINT at GC: " + positionGC);
                var orientMatrix = orientation.toMatrix();
                var rotMat = x3dom.nodeTypes.GeoLocation.prototype.getGeoRotMat(geoSystem, positionGC);
                var rotOrient = rotMat.mult(orientMatrix);
                // inverse for rotateYUp
                if(geoOrigin.node) {
                    if(geoOrigin.node._vf.rotateYUp) {
                        var origin = x3dom.nodeTypes.GeoCoordinate.prototype.OriginToGC(geoOrigin);
                        var rotMatOrigin = x3dom.nodeTypes.GeoLocation.prototype.getGeoRotMat(geoSystem, origin);
                        rotOrient = rotMatOrigin.inverse().mult(rotOrient);
                    }
                }
                var positionX3D = x3dom.nodeTypes.GeoCoordinate.prototype.GEOtoX3D(geoSystem, geoOrigin, coords)[0];
                // x3dom.debug.logInfo("GEOVIEWPOINT at X3D: " + positionX3D);
                return x3dom.fields.SFMatrix4f.translation(positionX3D).mult(rotOrient).inverse();
            },

            getFieldOfView: function() {
                return this._vf.fieldOfView;
            },

            resetView: function() {
                this._viewMatrix = this.getInitViewMatrix(this._vf.orientation, this._vf.geoSystem, this._cf.geoOrigin, this._vf.position);
                // also reset center of Rotation; is not done for regular viewpoint
                this._vf.centerOfRotation = this.getGeoCenterOfRotation(this._vf.geoSystem, this._cf.geoOrigin, this._geoCenterOfRotation);
                //Reset navigation helpers of the viewarea
                if(this._nameSpace.doc._viewarea) {
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

                var zfar = this._vf.zFar ;
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
