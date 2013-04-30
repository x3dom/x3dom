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
        },
        {
        }
    )
);

/* ### X3DNavigationInfoNode ### */
// FIXME; in X3D there is no X3DNavigationInfoNode.
//        So do we really need this abstract class?
x3dom.registerNodeType(
    "X3DNavigationInfoNode",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        function (ctx) {
            x3dom.nodeTypes.X3DNavigationInfoNode.superClass.call(this, ctx);
        },
        {
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
                if (fieldName == "position" || 
					fieldName == "orientation") {
                    this.resetView();
                }
                else if (fieldName == "fieldOfView" ||
                         fieldName == "zNear" || 
						 fieldName == "zFar") {
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

            activate: function (prev) {
                if (prev) {
                    this._nameSpace.doc._viewarea.animateTo(this, prev._autoGen ? null : prev);
                }
                x3dom.nodeTypes.X3DViewpointNode.prototype.activate.call(this, prev);
                this._nameSpace.doc._viewarea._needNavigationMatrixUpdate = true;
                //x3dom.debug.logInfo ('activate ViewBindable ' + this._DEF + '/' + this._vf.description);
            },

            deactivate: function (prev) {
                x3dom.nodeTypes.X3DViewpointNode.prototype.deactivate.call(this, prev);
                //x3dom.debug.logInfo ('deactivate ViewBindable ' + this._DEF + '/' + this._vf.description);
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

            setView: function(newView) {
                var mat = this.getCurrentTransform();
                mat = mat.inverse();
                this._viewMatrix = mat.mult(newView);
            },
            
            resetView: function() {
                //this._viewMatrix = this._vf.orientation.toMatrix().transpose().
                //    mult(x3dom.fields.SFMatrix4f.translation(this._vf.position.negate()));
                this._viewMatrix = x3dom.fields.SFMatrix4f.translation(this._vf.position).
                    mult(this._vf.orientation.toMatrix()).inverse();
            },

            getTransformation: function() {
                return this.getCurrentTransform();
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
                    
                    var min = new x3dom.fields.SFVec3f();
                    min.setValues(viewarea._scene._lastMin);
                    
                    var max = new x3dom.fields.SFVec3f();
                    max.setValues(viewarea._scene._lastMax);
                    
                    var dia = max.subtract(min);
                    var sRad = dia.length() / 2;
                    
                    var mat = viewarea.getViewMatrix().inverse();
                    var vp = mat.e3();

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
                    //x3dom.debug.logInfo("near: " + znear + " -> far:" + zfar);
                    
                    if (this._vf.zFar > 0)
                        zfar = this._vf.zFar;
                    if (this._vf.zNear > 0)
                        znear = this._vf.zNear;
                    
                    var div = znear - zfar;
                    
                    if (this._projMatrix != null && div != 0)
                    {
                        this._projMatrix._22 = (znear + zfar) / div;
                        this._projMatrix._23 = 2 * znear * zfar / div;
                    }
                }
                
                // needed for being able to ask for near and far
                this._zNear = znear;
                this._zFar = zfar;

                if (this._projMatrix == null)
                {
                    var f = 1 / Math.tan(fovy / 2);
                    
                    this._projMatrix = new x3dom.fields.SFMatrix4f(
                        f/aspect, 0, 0, 0,
                        0, f, 0, 0,
                        0, 0, (znear+zfar)/(znear-zfar), 2*znear*zfar/(znear-zfar),
                        0, 0, -1, 0
                    );
                    
                    this._lastAspect = aspect;
                }
                else if (this._lastAspect !== aspect)
                {
                    this._projMatrix._00 = (1 / Math.tan(fovy / 2)) / aspect;
                    this._lastAspect = aspect;
                }

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
                if (fieldName == "position" || 
					fieldName == "orientation") {
                    this.resetView();
                }
                else if (fieldName == "fieldOfView" ||
                         fieldName == "zNear" || 
						 fieldName == "zFar") {
                    this._projMatrix = null;   // trigger refresh
                    this.resetView();
                }
                else if (fieldName.indexOf("bind") >= 0) {
                    this.bind(this._vf.bind);
                }
            },

            activate: function (prev) {
                if (prev) {
                    this._nameSpace.doc._viewarea.animateTo(this, prev);
                }
                x3dom.nodeTypes.X3DViewpointNode.prototype.activate.call(this, prev);
                this._nameSpace.doc._viewarea._needNavigationMatrixUpdate = true;
            },

            deactivate: function (prev) {
                x3dom.nodeTypes.X3DViewpointNode.prototype.deactivate.call(this, prev);
            },

            getCenterOfRotation: function() {
                return this._vf.centerOfRotation;
            },
            
            getViewMatrix: function() {
                return this._viewMatrix;
            },
            
            getFieldOfView: function() {
                return 1.57079633;
            },

            setView: function(newView) {
                var mat = this.getCurrentTransform();
                mat = mat.inverse();
                this._viewMatrix = mat.mult(newView);
            },
            
            resetView: function() {
                var offset = x3dom.fields.SFMatrix4f.translation(new x3dom.fields.SFVec3f(
                                (this._vf.fieldOfView[0] + this._vf.fieldOfView[2]) / 2, 
                                (this._vf.fieldOfView[1] + this._vf.fieldOfView[3]) / 2, 0));
                
                this._viewMatrix = x3dom.fields.SFMatrix4f.translation(this._vf.position).
                                                    mult(this._vf.orientation.toMatrix());
                this._viewMatrix = this._viewMatrix.mult(offset).inverse();
            },

            getTransformation: function() {
                return this.getCurrentTransform();
            },
            
            getNear: function() {
                return this._vf.zNear;
            },
            
            getFar: function() {
                return this._vf.zFar;
            },

            getImgPlaneHeightAtDistOne: function() {
                return 2.0;
            },
            
            getProjectionMatrix: function(aspect)
            {
                if (this._projMatrix == null)
                {
                    var near = this.getNear();
                    var far = this.getFar();
                    
                    var left = this._vf.fieldOfView[0];
                    var bottom = this._vf.fieldOfView[1];
                    var right = this._vf.fieldOfView[2];
                    var top = this._vf.fieldOfView[3];
                    
                    var rl = (right - left) / 2;    // hs
                    var tb = (top - bottom) / 2;    // vs
                    var fn = far - near;
                    
                    if (aspect < (rl / tb))
                        tb = rl / aspect;
                    else
                        rl = tb * aspect;
                    
                    left = -rl;
                    right = rl;
                    bottom = -tb;
                    top = tb;
                    
                    rl *= 2;
                    tb *= 2;
                    
                    this._projMatrix = new x3dom.fields.SFMatrix4f(
                                        2 / rl, 0, 0,  -(right+left) / rl,
                                        0, 2 / tb, 0,  -(top+bottom) / tb,
                                        0, 0, -2 / fn, -(far+near) / fn,
                                        0, 0, 0, 1);
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
            
            this._viewMatrix = this._vf.modelview.inverse();
            this._projMatrix = this._vf.projection;
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "modelview") {
                    this._viewMatrix = this._vf.modelview.inverse();
                }
                else if (fieldName == "projection") {
                    this._projMatrix = this._vf.projection;
                }
                else if (fieldName.indexOf("bind") >= 0) {
                    this.bind(this._vf.bind);
                }
            },

            activate: function (prev) {
                if (prev) {
                    this._nameSpace.doc._viewarea.animateTo(this, prev);
                }
                x3dom.nodeTypes.X3DViewpointNode.prototype.activate.call(this,prev);
                this._nameSpace.doc._viewarea._needNavigationMatrixUpdate = true;
            },

            deactivate: function (prev) {
                x3dom.nodeTypes.X3DViewpointNode.prototype.deactivate.call(this,prev);
            },

            getCenterOfRotation: function() {
                return new x3dom.fields.SFVec3f(0, 0, 0);
            },
            
            getViewMatrix: function() {
                return this._viewMatrix;
            },
            
            getFieldOfView: function() {
                return (2.0 * Math.atan(1.0 / this._projMatrix._11));
            },

            getNear: function() {
                return 0.1;     // FIXME; derive from matrix!
            },

            getFar: function() {
                return 10000;   // FIXME; derive from matrix!
            },

            getImgPlaneHeightAtDistOne: function() {
                return 2.0 / this._projMatrix._11;
            },

            setView: function(newView) {
                var mat = this.getCurrentTransform();
                mat = mat.inverse();
                this._viewMatrix = mat.mult(newView);
            },
            
            resetView: function() {
                this._viewMatrix = this._vf.modelview.inverse();
            },

            getTransformation: function() {
                return this.getCurrentTransform();
            },

            getProjectionMatrix: function(aspect) {
                return this._projMatrix;
            }
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
            this.addField_MFFloat(ctx, 'typeParams', [-0.4, 60]);   // view angle and height for helicopter mode
            this.addField_MFFloat(ctx, 'avatarSize', [0.25,1.6,0.75]);
            this.addField_SFFloat(ctx, 'speed', 1.0);
            this.addField_SFFloat(ctx, 'visibilityLimit', 0.0);
            this.addField_SFTime(ctx, 'transitionTime', 1.0);
            this.addField_MFString(ctx, 'transitionType', ["LINEAR"]);

            //TODO; use avatarSize + visibilityLimit for projection matrix
            x3dom.debug.logInfo("NavType: " + this._vf.type[0].toLowerCase());

            this._heliUpdated = false;
        },
        {
            fieldChanged: function(fieldName) {
                if (fieldName == "typeParams") {
                    this._heliUpdated = false;
                }
                else if (fieldName == "type") {
                    var type = this._vf.type[0].toLowerCase();
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
                    x3dom.debug.logInfo("Switch to " + type + " mode.");
                }
            },

            getType: function() {
                return this._vf.type[0].toLowerCase();
            },

            getTypeParams: function() {
                var theta  = (this._vf.typeParams.length >= 1) ? this._vf.typeParams[0] : 0;
                var height = (this._vf.typeParams.length >= 2) ? this._vf.typeParams[1] : 0;

                return [theta, height];
            },

            setTypeParams: function(params) {
                for (var i=0; i<params.length; i++) {
                    this._vf.typeParams[i] = params[i];
                }
            },

            setType: function(type, viewarea) {
                var navType = type.toLowerCase();
                switch (navType) {
                    case 'game':
                        if (this._vf.type[0].toLowerCase() !== navType) {
                            if (viewarea)
                                viewarea.initMouseState();
                            else
                                this._nameSpace.doc._viewarea.initMouseState();
                        }
                        break;
                    case 'helicopter':
                        if (this._vf.type[0].toLowerCase() !== navType) {
                            this._heliUpdated = false;
                        }
                        break;
                    default:
                        break;
                }
                this._vf.type[0] = navType;
                x3dom.debug.logInfo("Switch to " + navType + " mode.");
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
            collectDrawableObjects: function (transform, drawableCollection, singlePath)
            {
                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                if (!this._vf.render || !drawableCollection ||
                    drawableCollection.cull(transform, this.graphState(), singlePath)) {
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
                        cnode.collectDrawableObjects(childTransform, drawableCollection, singlePath);
                    }
                }

                /*if (out !== null) {
                    //optimization, exploit coherence and do it for next frame (see LOD)
                    out.Billboards.push( [transform, this] );
                }*/
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
            collectDrawableObjects: function (transform, drawableCollection, singlePath)
            {
                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                if (!this._vf.render || !drawableCollection ||
                    drawableCollection.cull(transform, this.graphState(), singlePath)) {
                    return;
                }

                var cnode, childTransform;

                // rebuild cache on change and reuse world transform
                if (singlePath) {
                    if (!this._graph.globalMatrix)
                        this._graph.globalMatrix = this.transformMatrix(transform);

                    childTransform = this._graph.globalMatrix;
                }
                else {
                    childTransform = this.transformMatrix(transform);
                }

                for (var i=0, i_n=this._childNodes.length; i<i_n; i++)
                {
                    if ((cnode = this._childNodes[i]) && (cnode !== this._cf.proxy.node)) {
                        cnode.collectDrawableObjects(childTransform, drawableCollection, singlePath);
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
            collectDrawableObjects: function(transform, drawableCollection, singlePath)
            {
                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                if (!this._vf.render || !drawableCollection ||
                    drawableCollection.cull(transform, this.graphState(), singlePath)) {
                    return;
                }

                // at the moment, no caching here as children may change every frame
                singlePath = false;

                this.visitChildren(transform, drawableCollection, singlePath);

                //out.LODs.push( [transform, this] );
            },
            
            visitChildren: function(transform, drawableCollection, singlePath) {}
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
            
            this._needReRender = true;
            this._lastRangePos = -1;
        },
        {
            visitChildren: function(transform, drawableCollection, singlePath)
            {
                var i=0, n=this._childNodes.length;

                var vol = this.getVolume(); 

                var min = x3dom.fields.SFVec3f.MAX();
                var max = x3dom.fields.SFVec3f.MIN();
                vol.getBounds(min, max);

                var mat_view = drawableCollection.viewMatrix;
                
                var center = new x3dom.fields.SFVec3f(0, 0, 0); // eye
                center = mat_view.inverse().multMatrixPnt(center);
                
                var mat_view_model = mat_view.mult(transform);
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
                    cnode.collectDrawableObjects(childTransform, drawableCollection, singlePath);
                }
                
                // eye position invalid in first frame
                if (this._needReRender) {
                    this._needReRender = false;
                    this._nameSpace.doc.needRender = true;
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
                this._needReRender = true;
                this.invalidateVolume();
            },
            
            fieldChanged: function(fieldName) {
                this._needReRender = true;

                if (fieldName == "render" || fieldName == "center" || fieldName == "range") {
                    this.invalidateVolume();
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
            
            visitChildren: function(transform, drawableCollection, singlePath)
            {
                var root = this._cf.root.node;
                
                if (root == null)
                    return;
                    
                var mat_view = drawableCollection.viewMatrix;
                
                var center = new x3dom.fields.SFVec3f(0, 0, 0); // eye
                center = mat_view.inverse().multMatrixPnt(center);
                
                var mat_view_model = mat_view.mult(transform);
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
                            this._childNodes[l].collectDrawableObjects(transform, drawableCollection, singlePath);
                        }
                    }
                }
                else {
                    root.collectDrawableObjects(transform, drawableCollection, singlePath);
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
