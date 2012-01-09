/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
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
            this.addField_SFFloat(ctx, 'zNear', 0.1);
            this.addField_SFFloat(ctx, 'zFar', 100000);

            //this._viewMatrix = this._vf.orientation.toMatrix().transpose().
            //    mult(x3dom.fields.SFMatrix4f.translation(this._vf.position.negate()));
            this._viewMatrix = x3dom.fields.SFMatrix4f.translation(this._vf.position).
                mult(this._vf.orientation.toMatrix()).inverse();

            this._projMatrix = null;
            this._lastAspect = 1.0;
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
                }
                else if (fieldName === "set_bind") {
                    // FIXME; call parent.fieldChanged();
                    this.bind(this._vf.set_bind);
                }
            },

            activate: function (prev) {
                if (prev) {
                    this._nameSpace.doc._viewarea.animateTo(this, prev);
                }
                x3dom.nodeTypes.X3DViewpointNode.prototype.activate.call(this,prev);
                this._nameSpace.doc._viewarea._needNavigationMatrixUpdate = true;
                //x3dom.debug.logInfo ('activate ViewBindable ' + this._DEF);
            },

            deactivate: function (prev) {
                x3dom.nodeTypes.X3DViewpointNode.prototype.deactivate.call(this,prev);
                //x3dom.debug.logInfo ('deactivate ViewBindable ' + this._DEF);
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

            getProjectionMatrix: function(aspect)
            {
                if (this._projMatrix == null)
                {
                    var fovy = this._vf.fieldOfView;
                    var zfar = this._vf.zFar;
                    var znear = this._vf.zNear;

                    var f = 1/Math.tan(fovy/2);
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
                    this._projMatrix._00 = (1 / Math.tan(this._vf.fieldOfView / 2)) / aspect;
                    this._lastAspect = aspect;
                }

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
            this.addField_MFFloat(ctx, 'avatarSize', [0.25,1.6,0.75]);
            this.addField_SFFloat(ctx, 'speed', 1.0);
            this.addField_SFFloat(ctx, 'visibilityLimit', 0.0);
            this.addField_SFTime(ctx, 'transitionTime', 1.0);
            this.addField_MFString(ctx, 'transitionType', ["LINEAR"]);

            //TODO; use avatarSize + visibilityLimit for projection matrix
            x3dom.debug.logInfo("NavType: " + this._vf.type[0].toLowerCase());
        },
        {
            fieldChanged: function(fieldName) {
            },

            getType: function() {
                return this._vf.type[0].toLowerCase();
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
            this._eyeLook = new x3dom.fields.SFVec3f(0,0,0);

            this._viewAlignedMat = x3dom.fields.SFMatrix4f.identity();
        },
        {
            collectDrawableObjects: function (transform, out)
            {
                if (!this._vf.render) {
                    return;
                }

                // TODO; optimize getting volume
                var min = x3dom.fields.SFVec3f.MAX();
                var max = x3dom.fields.SFVec3f.MIN();
                var ok = this.getVolume(min, max, true);
                var rotMat = x3dom.fields.SFMatrix4f.identity();

                var mid = (max.add(min).multiply(0.5)).add(new x3dom.fields.SFVec3f(0, 0, 0));
                var billboard_to_viewer = this._eye.subtract(mid);

                if(this._vf.axisOfRotation.equals(new x3dom.fields.SFVec3f(0, 0, 0), x3dom.fields.Eps)){
                    var rot1 = x3dom.fields.Quaternion.rotateFromTo(
                                billboard_to_viewer, new x3dom.fields.SFVec3f(0, 0, 1));
                    rotMat = rot1.toMatrix().transpose();

                    var yAxis = rotMat.multMatrixPnt(new x3dom.fields.SFVec3f(0, 1, 0)).normalize();
                    var zAxis = rotMat.multMatrixPnt(new x3dom.fields.SFVec3f(0, 0, 1)).normalize();


                    if(!this._eyeViewUp.equals(new x3dom.fields.SFVec3f(0, 0, 0), x3dom.fields.Eps)){
                        // var rot2 = x3dom.fields.Quaternion.rotateFromTo(this._eyeViewUp, yAxis);
                        // rotMat = rot2.toMatrix().transpose().mult(rotMat);
                        var rot2 = x3dom.fields.Quaternion.rotateFromTo(this._eyeLook, zAxis); // new local z-axis aligned with camera z-axis
                        var rotatedyAxis = rot2.toMatrix().transpose().multMatrixVec(yAxis); // new: local y-axis rotated by rot2
                        var rot3 = x3dom.fields.Quaternion.rotateFromTo(this._eyeViewUp, rotatedyAxis); // new: rotated local y-axis aligned with camera y-axis
                        rotMat = rot2.toMatrix().transpose().mult(rotMat); // new
                        rotMat = rot3.toMatrix().transpose().mult(rotMat); // new
                    }
                }
                else{
                    var normalPlane = this._vf.axisOfRotation.cross(billboard_to_viewer);
                    normalPlane = normalPlane.normalize();

                    if(this._eye.z < 0) {
                        normalPlane = normalPlane.multiply(-1);
                    }

                    var degreesToRotate = Math.asin(normalPlane.dot(new x3dom.fields.SFVec3f(0, 0, 1)));

                    if(this._eye.z < 0) {
                        degreesToRotate += Math.PI;
                    }

                        rotMat = x3dom.fields.SFMatrix4f.parseRotation(
                            this._vf.axisOfRotation.x + ", " + this._vf.axisOfRotation.y + ", " + this._vf.axisOfRotation.z + ", " + degreesToRotate*(-1));
                }

                for (var i=0; i<this._childNodes.length; i++) {
                    if (this._childNodes[i]) {
                        var childTransform = this._childNodes[i].transformMatrix(transform.mult(rotMat));
                        this._childNodes[i].collectDrawableObjects(childTransform, out);
                    }
                }

                if (out !== null) {
                    //optimization, exploit coherence and do it for next frame (see LOD)
                    out.Billboards.push( [transform, this] );
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
            collectDrawableObjects: function (transform, out)
            {
                for (var i=0; i<this._childNodes.length; i++)
                {
                    if (this._childNodes[i] && (this._childNodes[i] !== this._cf.proxy.node))
                    {
                        var childTransform = this._childNodes[i].transformMatrix(transform);
                        this._childNodes[i].collectDrawableObjects(childTransform, out);
                    }
                }
            }
        }
    )
);

// ### LOD ###
x3dom.registerNodeType(
    "LOD",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.LOD.superClass.call(this, ctx);

            this.addField_SFBool (ctx, "forceTransitions", false);
            this.addField_SFVec3f(ctx, 'center', 0, 0, 0);
            this.addField_MFFloat(ctx, "range", []);

            this._eye = new x3dom.fields.SFVec3f(0, 0, 0);
        },
        {
            collectDrawableObjects: function (transform, out)
            {
                var i=0, n=this._childNodes.length;

                var min = x3dom.fields.SFVec3f.MAX();
                var max = x3dom.fields.SFVec3f.MIN();
                var ok = this.getVolume(min, max, true);

                var mid = (max.add(min).multiply(0.5)).add(this._vf.center);
                var len = mid.subtract(this._eye).length();

                //calculate range check for viewer distance d (with range in local coordinates)
                //N+1 children nodes for N range values (L0, if d < R0, ... Ln-1, if d >= Rn-1)
                while (i < this._vf.range.length && len > this._vf.range[i]) {
                    i++;
                }
                if (i && i >= n) {
                    i = n - 1;
                }

                if (n && this._childNodes[i])
                {
                    var childTransform = this._childNodes[i].transformMatrix(transform);
                    this._childNodes[i].collectDrawableObjects(childTransform, out);
                }

                if (out !== null)
                {
                    //optimization, exploit coherence and do it for next frame
                    out.LODs.push( [transform, this] );
                }
            }
        }
    )
);

