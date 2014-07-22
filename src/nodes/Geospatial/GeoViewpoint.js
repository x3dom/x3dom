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
 
        },
        {
            nodeChanged: function() {
                
                this._viewMatrix = getInitViewMatrix(this._vf.orientation, this._vf.geoSystem, this._cf.geoOrigin, this._vf.position);

                // also transform centerOfRotation for initial view
                var coords = new x3dom.fields.MFVec3f();
                coords.push(this._vf.centerOfRotation);
                var transformed = x3dom.nodeTypes.GeoCoordinate.prototype.GEOtoX3D(this._vf.geoSystem, this._cf.geoOrigin, coords);
                this._vf.centerOfRotation = transformed[0];
                
                // elevation scaled speed, could go in activate()?
                var viewarea = this._nameSpace.doc._viewarea;
                viewarea._needNavigationMatrixUpdate = true;
                //x3dom.nodeTypes.X3DBindableNode.prototype.activate.call(this, prev);
                //x3dom.debug.logInfo ('activate myGeoViewBindable ' + this._DEF + '/' + this._vf.description);
                var navi = viewarea._scene.getNavigationInfo();

                // get elevation above ground
                // viewpoint position in GC
                // var coords = new x3dom.fields.MFVec3f();
                //coords.push(this._vf.position);
                //var posGC = x3dom.nodeTypes.GeoCoordinate.prototype.GEOtoX3D(this._vf.geoSystem, this._cf.geoOrigin, coords)[0];
                //lat. long. of position
                var newUp = positionGC.normalize();
                // below uses geocentric latitude but only geodetic latitude would give proper ground level
                // http://info.ogp.org.uk/geodesy/guides/docs/G7-2.pdf
                // has formulas for deriving geodetic latitude, eg a GCtoGD function
                var rad2deg = 180/Math.PI;
                // latitude as asin of z; only valid for spheres
                var lat = Math.asin(newUp.z) * rad2deg;
                // atan2 gets the sign correct for longitude; is exact since in circular section
                var lon = Math.atan2(newUp.y, newUp.x) * rad2deg;
                var coords = new x3dom.fields.MFVec3f();
                coords.push(new x3dom.fields.SFVec3f(lat, lon, 0));
                var groundGC = x3dom.nodeTypes.GeoCoordinate.prototype.GEOtoGC(this._vf.geoSystem, this._cf.geoOrigin, coords)[0];
                  //x3dom.debug.logError("GEO GD ground at: " + lat + " " + lon);
                  //x3dom.debug.logError("GEO GD        at: " + coords);
                  //x3dom.debug.logError("GEO ground at: " + groundGC);
                var elevation = groundGC.subtract(positionGC).length();
                  x3dom.debug.logInfo("Geoelevation is " + elevation);
                // at 10m above ground a speed of 1 sounds about right; is positive
                navi._vf.speed = Math.abs(elevation/10.0 * this._vf.speedFactor);
                  x3dom.debug.logInfo("Changed navigation speed to " + navi._vf.speed);

                // borrowed from Viewpoint.js
            
                this._projMatrix = null;
                this._lastAspect = 1.0;
 
                // z-ratio: a value around 5000 would be better...
                this._zRatio = 10000;
                // set to -1 to trigger automatic setting since fields do not exist
                this._zNear = -1;
                this._zFar = -1;

                // special stuff...
                this._imgPlaneHeightAtDistOne = 2.0 * Math.tan(this._vf.fieldOfView / 2.0);
                
                if (this._vf.headlight.length) {
                  x3dom.debug.logInfo("headlight field not applicable, use NavigationInfo");
                }
                if (this._vf.navType.length) {
                  x3dom.debug.logInfo("navType field not applicable, use NavigationInfo");
                }

            },
            // all borrowed from Viewpoint.js
            fieldChanged: function (fieldName) {
                if (fieldName == "position" || fieldName == "orientation") {
                    this.resetView();
                }
                else if (fieldName == "fieldOfView" ||
                    fieldName == "zNear" || fieldName == "zFar") {
                    this._projMatrix = null;   // only trigger refresh
                    // set to -1 to trigger automatic setting since fields do not exist
                    this._zNear = -1;
                    this._zFar = -1;
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
                return this._vf.centerOfRotation;
            },

            getViewMatrix: function() {
                return this._viewMatrix;
            },
            
            getInitViewMatrix: function(orientation, geoSystem, geoOrigin, position) {
                // orientation needs to rotated as in GeoLocation node
                var coords = new x3dom.fields.MFVec3f();
                coords.push(position);
                var positionGC = x3dom.nodeTypes.GeoCoordinate.prototype.GEOtoGC(geoSystem, geoOrigin, coords)[0];
                  x3dom.debug.logInfo("GEOVIEWPOINT at GC: " + positionGC);
                var rotMat = x3dom.nodeTypes.GeoLocation.prototype.getRotMat(positionGC);
                var rotOrient = rotMat.mult(orientation.toMatrix());
                var positionX3D = x3dom.nodeTypes.GeoCoordinate.prototype.GEOtoX3D(geoSystem, geoOrigin, coords)[0];
                  x3dom.debug.logInfo("GEOVIEWPOINT at X3D: " + positionX3D);
                return x3dom.fields.SFMatrix4f.translation(positionX3D).mult(rotOrient).inverse();
            },

            getFieldOfView: function() {
                return this._vf.fieldOfView;
            },

            resetView: function() {
                this._viewMatrix = getInitViewMatrix(this._vf.orientation, this._vf.geoSystem, this._cf.geoOrigin, this._vf.position);
                //also reset center of Rotation ? Not done for regular viewpoint; would need to save original
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
                // set to -1 to trigger automatic setting since fields do not exist
                var zfar = -1;
                var znear = -1;

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
                    //hm, fields do not exist, becomes non-sensical
                    //if (zfar > this._vf.zNear && this._vf.zNear > 0)
                    if (zfar > -1 && -1 > 0)
                        //znear = this._vf.zNear;
                        znear = -1;
                    //if (this._vf.zFar > znear)
                    if (-1 > znear)
                        //zfar = this._vf.zFar;
                        zfar = -1;
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