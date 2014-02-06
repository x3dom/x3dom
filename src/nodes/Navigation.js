/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */


/* ### X3DViewpointNode ### */
x3dom.registerNodeType(
    "X3DViewpointNode",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        function (ctx) {
            x3dom.nodeTypes.X3DViewpointNode.superClass.call(this, ctx);

            // attach some convenience accessor methods to dom/xml node
            if (ctx && ctx.xmlNode) {
                var domNode = ctx.xmlNode;

                if (!domNode.resetView && !domNode.getFieldOfView &&
                    !domNode.getNear && !domNode.getFar)
                {
                    domNode.resetView = function() {
                        var that = this._x3domNode;

                        that.resetView();
                        that._nameSpace.doc.needRender = true;
                    };

                    domNode.getFieldOfView = function() {
                        return this._x3domNode.getFieldOfView();
                    };

                    domNode.getNear = function() {
                        return this._x3domNode.getNear();
                    };

                    domNode.getFar = function() {
                        return this._x3domNode.getFar();
                    };
                }
            }
        },
        {
            activate: function (prev) {
                var viewarea = this._nameSpace.doc._viewarea;
                if (prev) {
                    viewarea.animateTo(this, prev._autoGen ? null : prev);
                }
                viewarea._needNavigationMatrixUpdate = true;

                x3dom.nodeTypes.X3DBindableNode.prototype.activate.call(this, prev);
                //x3dom.debug.logInfo ('activate ViewBindable ' + this._DEF + '/' + this._vf.description);
            },

            deactivate: function (prev) {
                x3dom.nodeTypes.X3DBindableNode.prototype.deactivate.call(this, prev);
                //x3dom.debug.logInfo ('deactivate ViewBindable ' + this._DEF + '/' + this._vf.description);
            },

            getTransformation: function() {
                return this.getCurrentTransform();
            },

            getCenterOfRotation: function() {
                return new x3dom.fields.SFVec3f(0, 0, 0);
            },

            getFieldOfView: function() {
                return 1.57079633;
            },

            setView: function(newView) {
                var mat = this.getCurrentTransform();
                this._viewMatrix = newView.mult(mat);
            },

            resetView: function() {
                // see derived class
            },

            getNear: function() {
                return 0.1;
            },

            getFar: function() {
                return 10000;
            },

            getImgPlaneHeightAtDistOne: function() {
                return 2.0;
            },

            getViewMatrix: function() {
                return null;
            },

            getProjectionMatrix: function(aspect) {
                return null;
            }
        }
    )
);

/* ### Viewpoint ### */
x3dom.registerNodeType(
    "Viewpoint",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DViewpointNode,
        function (ctx) {
            x3dom.nodeTypes.Viewpoint.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'fieldOfView', 0.785398);
            this.addField_SFVec3f(ctx, 'position', 0, 0, 10);
            this.addField_SFRotation(ctx, 'orientation', 0, 0, 0, 1);
            this.addField_SFVec3f(ctx, 'centerOfRotation', 0, 0, 0);
            this.addField_SFFloat(ctx, 'zNear', -1); //0.1);
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
                var viewarea = this._nameSpace.doc._viewarea;
                this._viewMatrix = x3dom.fields.SFMatrix4f.translation(this._vf.position).
                    mult(this._vf.orientation.toMatrix()).inverse();
                viewarea._rotMat = x3dom.fields.SFMatrix4f.identity();
                viewarea._transMat = x3dom.fields.SFMatrix4f.identity();
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
                }

                // also needed for being able to ask for near and far
                this._zNear = znear;
                this._zFar = zfar;
                this._lastAspect = aspect;

                return this._projMatrix;
            }
        }
    )
);

/* ### OrthoViewpoint ### */
x3dom.registerNodeType(
        "OrthoViewpoint",
        "Navigation",
        defineClass(x3dom.nodeTypes.X3DViewpointNode,
        function (ctx) {
            x3dom.nodeTypes.OrthoViewpoint.superClass.call(this, ctx);

            this.addField_MFFloat(ctx, 'fieldOfView', [-1, -1, 1, 1]);
            this.addField_SFVec3f(ctx, 'position', 0, 0, 10);
            this.addField_SFRotation(ctx, 'orientation', 0, 0, 0, 1);
            this.addField_SFVec3f(ctx, 'centerOfRotation', 0, 0, 0);
            this.addField_SFFloat(ctx, 'zNear', 0.1);
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

/* ### Viewfrustum ### */
x3dom.registerNodeType(
    "Viewfrustum",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DViewpointNode,
        function (ctx) {
            x3dom.nodeTypes.Viewfrustum.superClass.call(this, ctx);
            
            this.addField_SFMatrix4f(ctx, 'modelview',  1, 0, 0, 0,
                                                        0, 1, 0, 0,
                                                        0, 0, 1, 0,
                                                        0, 0, 0, 1);
            this.addField_SFMatrix4f(ctx, 'projection', 1, 0, 0, 0,
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
                return this._centerOfRotation;  // this field is only a little helper for examine mode
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

/* ### X3DNavigationInfoNode ### */
x3dom.registerNodeType(
    "X3DNavigationInfoNode",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        function (ctx) {
            x3dom.nodeTypes.X3DNavigationInfoNode.superClass.call(this, ctx);
        }
    )
);

/* ### NavigationInfo ### */
x3dom.registerNodeType(
    "NavigationInfo",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DNavigationInfoNode,
        function (ctx) {
            x3dom.nodeTypes.NavigationInfo.superClass.call(this, ctx);

            this.addField_SFBool(ctx, 'headlight', true);
            this.addField_MFString(ctx, 'type', ["EXAMINE","ANY"]);
            // view angle and height for helicopter mode and
            // min/max rotation angle for turntable in ]0, PI[, starting from +y (0) down to -y (PI)
            this.addField_MFFloat(ctx, 'typeParams', [-0.4, 60, 0.05, 2.8]);
            // allows restricting examine and turntable navigation, overrides mouse buttons
            // can be one of [all, pan, zoom, rotate, none] (useful for special viewers)
            this.addField_SFString(ctx, 'explorationMode', 'all');
            // TODO; use avatarSize + visibilityLimit for projection matrix (near/far)
            this.addField_MFFloat(ctx, 'avatarSize', [0.25, 1.6, 0.75]);
            this.addField_SFFloat(ctx, 'visibilityLimit', 0.0);
            this.addField_SFFloat(ctx, 'speed', 1.0);
            // for 'jumping' between viewpoints (bind transition time)
            this.addField_SFTime(ctx, 'transitionTime', 1.0);
            this.addField_MFString(ctx, 'transitionType', ["LINEAR"]);

            this._validTypes = [
                "none", "examine", "turntable",
                "fly", "freefly", "lookat", "lookaround",
                "walk", "game", "helicopter", "any"
            ];
            this._heliUpdated = false;

            var type = this.checkType(this.getType());
            x3dom.debug.logInfo("NavType: " + type);
        },
        {
            fieldChanged: function(fieldName) {
                if (fieldName == "typeParams") {
                    this._heliUpdated = false;
                }
                else if (fieldName == "type") {
                    var type = this.checkType(this.getType());

                    switch (type) {
                        case 'game':
                            this._nameSpace.doc._viewarea.initMouseState();
                            break;
                        case 'helicopter':
                            this._heliUpdated = false;
                            break;
                        default:
                            break;
                    }

                    this._vf.type[0] = type;
                    x3dom.debug.logInfo("Switch to " + type + " mode.");
                }
            },

            setType: function(type, viewarea) {
                var navType = this.checkType(type.toLowerCase());
                var oldType = this.checkType(this.getType());

                switch (navType) {
                    case 'game':
                        if (oldType !== navType) {
                            if (viewarea)
                                viewarea.initMouseState();
                            else
                                this._nameSpace.doc._viewarea.initMouseState();
                        }
                        break;
                    case 'helicopter':
                        if (oldType !== navType) {
                            this._heliUpdated = false;
                        }
                        break;
                    default:
                        break;
                }

                this._vf.type[0] = navType;
                x3dom.debug.logInfo("Switch to " + navType + " mode.");
            },

            getType: function() {
                var type = this._vf.type[0].toLowerCase();
                // FIXME; the following if's aren't nice!
                if (type.length <= 1)
                    type = "none";
                else if (type == "any")
                    type = "examine";
                return type;
            },

            getTypeParams: function() {
                var length = this._vf.typeParams.length;

                var theta  = (length >= 1) ? this._vf.typeParams[0] : -0.4;
                var height = (length >= 2) ? this._vf.typeParams[1] : 60.0;
                var minAngle = (length >= 3) ? this._vf.typeParams[2] : x3dom.fields.Eps;
                var maxAngle = (length >= 4) ? this._vf.typeParams[3] : Math.PI - x3dom.fields.Eps;

                return [theta, height, minAngle, maxAngle];
            },

            setTypeParams: function(params) {
                for (var i=0; i<params.length; i++) {
                    this._vf.typeParams[i] = params[i];
                }
            },

            checkType: function(type) {
                if (this._validTypes.indexOf(type) > -1) {
                    return type;
                }
                else {
                    x3dom.debug.logWarning(type + " is no valid navigation type, use one of " +
                                           this._validTypes.toString());
                    return "examine";
                }
            },

            getExplorationMode: function() {
                switch (this._vf.explorationMode.toLowerCase()) {
                    case "all":    return 7;
                    case "rotate": return 1; //left btn
                    case "zoom":   return 2; //right btn
                    case "pan":    return 4; //middle btn
                    case "none":   return 0; //type 'none'
                    default:       return 7;
                }
            }
        }
    )
);


/* ### Billboard ### */
x3dom.registerNodeType(
    "Billboard",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Billboard.superClass.call(this, ctx);

            // When the axisOfRotation field is set to (0, 0, 0),
            // the special case of viewer-alignment is indicated.
            this.addField_SFVec3f(ctx, 'axisOfRotation', 0, 1, 0);

            this._eye = new x3dom.fields.SFVec3f(0, 0, 0);
            this._eyeViewUp = new x3dom.fields.SFVec3f(0, 0, 0);
            this._eyeLook = new x3dom.fields.SFVec3f(0, 0, 0);
        },
        {
            collectDrawableObjects: function (transform, drawableCollection, singlePath, invalidateCache, planeMask)
            {
                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                if (singlePath && (invalidateCache = invalidateCache || this.cacheInvalid()))
                    this.invalidateCache();

                planeMask = drawableCollection.cull(transform, this.graphState(), singlePath, planeMask);
                if (planeMask <= 0) {
                    return;
                }

                // no caching later on as transform changes almost every frame anyway
                singlePath = false;

                var vol = this.getVolume();

                var min = x3dom.fields.SFVec3f.MAX();
                var max = x3dom.fields.SFVec3f.MIN();
                vol.getBounds(min, max);
                
                var mat_view = drawableCollection.viewMatrix;
                
                var center = new x3dom.fields.SFVec3f(0, 0, 0); // eye
                center = mat_view.inverse().multMatrixPnt(center);
                
                var mat_view_model = mat_view.mult(transform);
                this._eye = transform.inverse().multMatrixPnt(center);
                this._eyeViewUp = new x3dom.fields.SFVec3f(mat_view_model._10, mat_view_model._11, mat_view_model._12);
                this._eyeLook = new x3dom.fields.SFVec3f(mat_view_model._20, mat_view_model._21, mat_view_model._22);
                
                var rotMat = x3dom.fields.SFMatrix4f.identity();
                var mid = max.add(min).multiply(0.5);
                var billboard_to_viewer = this._eye.subtract(mid);

                if(this._vf.axisOfRotation.equals(new x3dom.fields.SFVec3f(0, 0, 0), x3dom.fields.Eps)) {
                    var rot1 = x3dom.fields.Quaternion.rotateFromTo(
                                billboard_to_viewer, new x3dom.fields.SFVec3f(0, 0, 1));
                    rotMat = rot1.toMatrix().transpose();

                    var yAxis = rotMat.multMatrixPnt(new x3dom.fields.SFVec3f(0, 1, 0)).normalize();
                    var zAxis = rotMat.multMatrixPnt(new x3dom.fields.SFVec3f(0, 0, 1)).normalize();

                    if(!this._eyeViewUp.equals(new x3dom.fields.SFVec3f(0, 0, 0), x3dom.fields.Eps)) {
                        // new local z-axis aligned with camera z-axis
                        var rot2 = x3dom.fields.Quaternion.rotateFromTo(this._eyeLook, zAxis);
                        // new: local y-axis rotated by rot2
                        var rotatedyAxis = rot2.toMatrix().transpose().multMatrixVec(yAxis);
                        // new: rotated local y-axis aligned with camera y-axis
                        var rot3 = x3dom.fields.Quaternion.rotateFromTo(this._eyeViewUp, rotatedyAxis);
                        
                        rotMat = rot2.toMatrix().transpose().mult(rotMat);
                        rotMat = rot3.toMatrix().transpose().mult(rotMat);
                    }
                }
                else {
                    var normalPlane = this._vf.axisOfRotation.cross(billboard_to_viewer).normalize();

                    if(this._eye.z < 0) {
                        normalPlane = normalPlane.multiply(-1);
                    }

                    var degreesToRotate = Math.asin(normalPlane.dot(new x3dom.fields.SFVec3f(0, 0, 1)));

                    if(this._eye.z < 0) {
                        degreesToRotate += Math.PI;
                    }

                    rotMat = x3dom.fields.SFMatrix4f.parseRotation(
                            this._vf.axisOfRotation.x + ", " + this._vf.axisOfRotation.y + ", " + 
                            this._vf.axisOfRotation.z + ", " + degreesToRotate*(-1));
                }

                var childTransform = this.transformMatrix(transform.mult(rotMat));

                for (var i=0, i_n=this._childNodes.length; i<i_n; i++)
                {
                    var cnode = this._childNodes[i];
                    if (cnode) {
                        cnode.collectDrawableObjects(childTransform, drawableCollection, singlePath, invalidateCache, planeMask);
                    }
                }
            }
        }
    )
);

// ### Collision ###
x3dom.registerNodeType(
    "Collision",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Collision.superClass.call(this, ctx);

            this.addField_SFBool (ctx, "enabled", true);
            this.addField_SFNode ("proxy", x3dom.nodeTypes.X3DGroupingNode);

            // TODO; add Slots: collideTime, isActive
        },
        {
            collectDrawableObjects: function (transform, drawableCollection, singlePath, invalidateCache, planeMask)
            {
                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                if (singlePath && (invalidateCache = invalidateCache || this.cacheInvalid()))
                    this.invalidateCache();

                planeMask = drawableCollection.cull(transform, this.graphState(), singlePath, planeMask);
                if (planeMask <= 0) {
                    return;
                }

                var cnode, childTransform;

                if (singlePath) {
                    if (!this._graph.globalMatrix) {
                        this._graph.globalMatrix = this.transformMatrix(transform);
                    }
                    childTransform = this._graph.globalMatrix;
                }
                else {
                    childTransform = this.transformMatrix(transform);
                }

                for (var i=0, n=this._childNodes.length; i<n; i++)
                {
                    if ((cnode = this._childNodes[i]) && (cnode !== this._cf.proxy.node)) {
                        cnode.collectDrawableObjects(childTransform, drawableCollection, singlePath, invalidateCache, planeMask);
                    }
                }
            }
        }
    )
);

// ### X3DLODNode ###
x3dom.registerNodeType(
    "X3DLODNode",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.X3DLODNode.superClass.call(this, ctx);

            this.addField_SFBool (ctx, "forceTransitions", false);
            this.addField_SFVec3f(ctx, "center", 0, 0, 0);

            this._eye = new x3dom.fields.SFVec3f(0, 0, 0);
        },
        {
            collectDrawableObjects: function(transform, drawableCollection, singlePath, invalidateCache, planeMask)
            {
                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                if (singlePath && (invalidateCache = invalidateCache || this.cacheInvalid()))
                    this.invalidateCache();

                planeMask = drawableCollection.cull(transform, this.graphState(), singlePath, planeMask);
                if (planeMask <= 0) {
                    return;
                }

                // at the moment, no caching here as children may change every frame
                singlePath = false;

                this.visitChildren(transform, drawableCollection, singlePath, invalidateCache, planeMask);

                //out.LODs.push( [transform, this] );
            },
            
            visitChildren: function(transform, drawableCollection, singlePath, invalidateCache, planeMask) {
                // overwritten
            }
        }
    )
);

// ### LOD ###
x3dom.registerNodeType(
    "LOD",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DLODNode,
        function (ctx) {
            x3dom.nodeTypes.LOD.superClass.call(this, ctx);

            this.addField_MFFloat(ctx, "range", []);

            this._lastRangePos = -1;
        },
        {
            visitChildren: function(transform, drawableCollection, singlePath, invalidateCache, planeMask)
            {
                var i=0, n=this._childNodes.length;

                var vol = this.getVolume(); 

                var min = x3dom.fields.SFVec3f.MAX();
                var max = x3dom.fields.SFVec3f.MIN();
                vol.getBounds(min, max);

                var mat_view = drawableCollection.viewMatrix;
                
                var center = new x3dom.fields.SFVec3f(0, 0, 0); // eye
                center = mat_view.inverse().multMatrixPnt(center);
                
                //var mat_view_model = mat_view.mult(transform);
                this._eye = transform.inverse().multMatrixPnt(center);
                
                var mid = max.add(min).multiply(0.5).add(this._vf.center);
                var len = mid.subtract(this._eye).length();
                
                //calculate range check for viewer distance d (with range in local coordinates)
                //N+1 children nodes for N range values (L0, if d < R0, ... Ln-1, if d >= Rn-1)
                while (i < this._vf.range.length && len > this._vf.range[i]) {
                    i++;
                }
                if (i && i >= n) {
                    i = n - 1;
                }
                this._lastRangePos = i;

                var cnode = this._childNodes[i];
                if (n && cnode)
                {
                    var childTransform = this.transformMatrix(transform);
                    cnode.collectDrawableObjects(childTransform, drawableCollection, singlePath, invalidateCache, planeMask);
                }
            },

            getVolume: function()
            {
                var vol = this._graph.volume;

                if (!this.volumeValid() && this._vf.render)
                {
                    var child, childVol;

                    if (this._lastRangePos >= 0) {
                        child = this._childNodes[this._lastRangePos];

                        childVol = (child && child._vf.render === true) ? child.getVolume() : null;

                        if (childVol && childVol.isValid())
                            vol.extendBounds(childVol.min, childVol.max);
                    }
                    else {  // first time we're here
                        for (var i=0, n=this._childNodes.length; i<n; i++)
                        {
                            if (!(child = this._childNodes[i]) || child._vf.render !== true)
                                continue;

                            childVol = child.getVolume();

                            if (childVol && childVol.isValid())
                                vol.extendBounds(childVol.min, childVol.max);
                        }
                    }
                }

                return vol;
            },
            
            nodeChanged: function() {
                //this._needReRender = true;
                this.invalidateVolume();
                //this.invalidateCache();
            },
            
            fieldChanged: function(fieldName) {
                //this._needReRender = true;
                if (fieldName == "render" ||
                    fieldName == "center" ||
                    fieldName == "range") {
                    this.invalidateVolume();
                    //this.invalidateCache();
                }
            }
        }
    )
);

// ### DynamicLOD ###
x3dom.registerNodeType(
    "DynamicLOD",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DLODNode,
        function (ctx) {
            x3dom.nodeTypes.DynamicLOD.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'subScale', 0.5);
            this.addField_SFVec2f(ctx, 'size', 2, 2);
            this.addField_SFVec2f(ctx, 'subdivision', 1, 1);
            this.addField_SFNode ('root', x3dom.nodeTypes.X3DShapeNode);
            
            this.addField_SFString(ctx, 'urlHead', "http://r");
            this.addField_SFString(ctx, 'urlCenter', ".ortho.tiles.virtualearth.net/tiles/h");
            this.addField_SFString(ctx, 'urlTail', ".png?g=-1");
            
            this.rootGeometry = new x3dom.nodeTypes.Plane(ctx);
            this.level = 0;
            this.quadrant = 4;
            this.cell = "";
        },
        {
            nodeChanged: function()
            {
                var root = this._cf.root.node;
                
                if (root == null || root._cf.geometry.node != null)
                    return;
                
                this.rootGeometry._vf.size.setValues(this._vf.size);
                this.rootGeometry._vf.subdivision.setValues(this._vf.subdivision);
                this.rootGeometry._vf.center.setValues(this._vf.center);
                this.rootGeometry.fieldChanged("subdivision");   // trigger update
                
    		    this._cf.root.node.addChild(this.rootGeometry);  // add to shape
    		    this.rootGeometry.nodeChanged();
    		    
    		    this._cf.root.node.nodeChanged();
    		    
    		    this._nameSpace.doc.needRender = true;
            },
            
            visitChildren: function(transform, drawableCollection, singlePath, invalidateCache, planeMask)
            {
                var root = this._cf.root.node;
                
                if (root == null)
                    return;
                    
                var mat_view = drawableCollection.viewMatrix;
                
                var center = new x3dom.fields.SFVec3f(0, 0, 0); // eye
                center = mat_view.inverse().multMatrixPnt(center);
                
                //var mat_view_model = mat_view.mult(transform);
                this._eye = transform.inverse().multMatrixPnt(center);
                
                var l, len = this._vf.center.subtract(this._eye).length();
                
                //calculate range check for viewer distance d (with range in local coordinates)
                if (len > x3dom.fields.Eps && len * this._vf.subScale <= this._vf.size.length()) {
                    /*  Quadrants per level: (TODO; make parameterizable, e.g. 0 and 1 might be swapped)
                        0 | 1
                        -----
                        2 | 3
                    */
                    if (this._childNodes.length <= 1) {
                        var offset = new Array(
                                new x3dom.fields.SFVec3f(-0.25*this._vf.size.x,  0.25*this._vf.size.y, 0),
                                new x3dom.fields.SFVec3f( 0.25*this._vf.size.x,  0.25*this._vf.size.y, 0),
                                new x3dom.fields.SFVec3f(-0.25*this._vf.size.x, -0.25*this._vf.size.y, 0),
                                new x3dom.fields.SFVec3f( 0.25*this._vf.size.x, -0.25*this._vf.size.y, 0)
                            );
                        
                        for (l=0; l<4; l++) {
                            var node = new x3dom.nodeTypes.DynamicLOD();                        
                            
                            node._nameSpace = this._nameSpace;
                            node._eye.setValues(this._eye);
                            
                            node.level = this.level + 1;
                            node.quadrant = l;
                            node.cell = this.cell + l;
                            
                            node._vf.urlHead = this._vf.urlHead;
                            node._vf.urlCenter = this._vf.urlCenter;
                            node._vf.urlTail = this._vf.urlTail;
                            
                            node._vf.center = this._vf.center.add(offset[l]);
                            node._vf.size = this._vf.size.multiply(0.5);
                            node._vf.subdivision.setValues(this._vf.subdivision);
                            
                            var app = new x3dom.nodeTypes.Appearance();
                            
                            //var mat = new x3dom.nodeTypes.Material();
                            //mat._vf.diffuseColor = new x3dom.fields.SFVec3f(Math.random(),Math.random(),Math.random());
                            //
                            //app.addChild(mat);
                            //mat.nodeChanged();
                            
                            var tex = new x3dom.nodeTypes.ImageTexture();
                            tex._nameSpace = this._nameSpace;
                            tex._vf.url[0] = this._vf.urlHead + node.quadrant + this._vf.urlCenter + node.cell + this._vf.urlTail;
                            //x3dom.debug.logInfo(tex._vf.url[0]);
                            
                            app.addChild(tex);
                            tex.nodeChanged();
                            
                            var shape = new x3dom.nodeTypes.Shape();
                            shape._nameSpace = this._nameSpace;
                            
                            shape.addChild(app);
                            app.nodeChanged();
                            
                            node.addChild(shape, "root");
                            shape.nodeChanged();
                            
                            this.addChild(node);
                            node.nodeChanged();
                        }
                    }
                    else {
                        for (l=1; l<this._childNodes.length; l++) {
                            this._childNodes[l].collectDrawableObjects(transform, drawableCollection, singlePath, invalidateCache, planeMask);
                        }
                    }
                }
                else {
                    root.collectDrawableObjects(transform, drawableCollection, singlePath, invalidateCache, planeMask);
                }
            },

            getVolume: function() {
                var vol = this._graph.volume;

                if (!vol.isValid()) {
                    vol.min.setValues(this._vf.center);
                    vol.min.x -= 0.5 * this._vf.size.x;
                    vol.min.y -= 0.5 * this._vf.size.y;
                    vol.min.z -= x3dom.fields.Eps;

                    vol.max.setValues(this._vf.center);
                    vol.max.x += 0.5 * this._vf.size.x;
                    vol.max.y += 0.5 * this._vf.size.y;
                    vol.max.z += x3dom.fields.Eps;
                }

                return vol;
            }
        }
    )
);
