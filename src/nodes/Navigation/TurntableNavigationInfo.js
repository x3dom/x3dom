/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### NavigationInfo ### */
x3dom.registerNodeType(
    "TurntableNavigationInfo",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DNavigationInfoNode,
        
        /**
         * Constructor for NavigationInfo
         * @constructs x3dom.nodeTypes.NavigationInfo
         * @x3d 3.3
         * @component Navigation
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNavigationInfoNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc NavigationInfo describes the viewing model and physical characteristics of the viewer's avatar.
         * Hint: for inspection of simple objects, usability often improves with type='EXAMINE' 'ANY' Hint: NavigationInfo types ''WALK' 'FLY'' support camera-to-object collision detection.
         * Background, Fog, NavigationInfo, TextureBackground and Viewpoint are bindable nodes.
         */
        function (ctx) {
            x3dom.nodeTypes.TurntableNavigationInfo.superClass.call(this, ctx);


            /**
             * Enable/disable directional light that always points in the direction the user is looking.
             * @var {x3dom.fields.SFBool} headlight
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'headlight', true);

            /**
             * Specifies the view angle and height for helicopter mode and min/max rotation angle for turntable in ]0, PI[, starting from +y (0) down to -y (PI)
             * @var {x3dom.fields.MFFloat} typeParams
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue [-0.4,60,0.05,2.8]
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'typeParams', [-0.4, 60, 0.05, 2.8]);

            /**
             * allows restricting examine and turntable navigation, overrides mouse buttons (useful for special viewers)
             * @range [all, pan, zoom, rotate, none]
             * @var {x3dom.fields.SFString} explorationMode
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue 'all'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'explorationMode', 'all');
            // TODO; use avatarSize + visibilityLimit for projection matrix (near/far)

            /**
             * avatarSize triplet values are:
             * (a) collision distance between user and geometry (near culling plane of the view frustrum)
             * (b) viewer height above terrain
             * (c) tallest height viewer can WALK over.
             * Hint: keep (avatarSize.CollisionDistance / visibilityLimit) less then; 10,000 to avoid aliasing artifacts (i.e. polygon 'tearing').
             * Interchange profile hint: this field may be ignored.
             * @var {x3dom.fields.MFFloat} avatarSize
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue [0.25,1.6,0.75]
             * @field x3d
             * @instance
             */
            this.addField_MFFloat(ctx, 'avatarSize', [0.25, 1.6, 0.75]);

            /**
             * Geometry beyond the visibilityLimit may not be rendered (far culling plane of the view frustrum).
             * visibilityLimit=0.0 indicates an infinite visibility limit.
             * Hint: keep visibilityLimit greater than zero.
             * Hint: keep (avatarSize.CollisionDistance / visibilityLimit) less than 10,000 to avoid aliasing artifacts (i.e. polygon 'tearing').
             * Interchange profile hint: this field may be ignored.
             * @var {x3dom.fields.SFFloat} visibilityLimit
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue 0.0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'visibilityLimit', 0.0);

            /**
             * Default rate at which viewer travels through scene, meters/second.
             * Warning: default 1 m/s usually seems slow for ordinary navigation.
             * Interchange profile hint: this field may be ignored.
             * @var {x3dom.fields.SFFloat} speed
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue 1.0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'speed', 1.0);
            // for 'jumping' between viewpoints (bind transition time)

            /**
             * The transitionTime field specifies the duration of any viewpoint transition
             * @var {x3dom.fields.SFTime} transitionTime
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue 1.0
             * @field x3d
             * @instance
             */
            this.addField_SFTime(ctx, 'transitionTime', 1.0);

            /**
             * Specifies the transition mode.
             * @var {x3dom.fields.MFString} transitionType
             * @range [LINEAR, TELEPORT, ANIMATE, ...]
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue ["LINEAR"]
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'transitionType', ["LINEAR"]);
            
            this.addField_SFString(ctx, 'target', "");
            
            this.addField_MFFloat(ctx, 'angularRestrictions', [-3.15, 3.15, -3.15, 3.15]);

            var type = this.setType(this.getType());
            x3dom.debug.logInfo("NavType: " + type);
        
        },
        {
            fieldChanged: function(fieldName) {
                if (fieldName == "typeParams") {
                    this._heliUpdated = false;
                }                
            },

            setType: function(type, viewarea) {
                var navType = this.getType();
                
                if(this._nameSpace.doc._viewarea)
                    this.initTurnTable(this._nameSpace.doc._viewarea); 
                
                x3dom.debug.logInfo("Switch to " + navType + " mode.");
            },

            getType: function() {
                return "specialTurntable";
            },

            getTypeParams: function() {
                var length = this._vf.typeParams.length;

                var theta  = (length >= 1) ? this._vf.typeParams[0] : -0.4;
                var height = (length >= 2) ? this._vf.typeParams[1] : 60.0;
                var minAngle = (length >= 3) ? this._vf.typeParams[2] : x3dom.fields.Eps;
                var maxAngle = (length >= 4) ? this._vf.typeParams[3] : Math.PI - x3dom.fields.Eps;

                // experimental HACK to switch between clamp to CoR (params[4]>0) and CoR translation in turntable mode
               var params = [theta, height, minAngle, maxAngle];
               if (length >= 5)
               {
                   // adding rest parameters
                   params.push(...this._vf.typeParams.slice(4));
               }
               
               return params;
            },

            setTypeParams: function(params) {
                for (var i=0; i<params.length; i++) {
                    this._vf.typeParams[i] = params[i];
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
            },
            
            onMousePress: function(view, flyTo)
            {
                if (!view._flyMat)
                    this.initTurnTable(view, false);        
            },
            
            initTurnTable: function(view, flyTo)
            {
                flyTo = (flyTo == undefined) ? true : flyTo;

                var currViewMat = view.getViewMatrix();

               
                var viewpoint = view._scene.getViewpoint();
                var center = x3dom.fields.SFVec3f.copy(viewpoint.getCenterOfRotation());

                view._flyMat = currViewMat.inverse();

                view._from = view._flyMat.e3();               
                view._at = center;
                view._up = view._flyMat.e1();

                view._flyMat = x3dom.fields.SFMatrix4f.lookAt(view._from, view._at, view._up);
                view._flyMat = view.calcOrbit(0, 0, this);

                var dur = 0.0;

                if (flyTo) {
                    dur = 0.2 / this._vf.speed;   // fly to pivot point
                }

                view.animateTo(view._flyMat.inverse(), viewpoint, dur);
                view.resetNavHelpers();
            },
            
            updateFlyMat: function(view)
            {
                if (!view._flyMat)
                    this.initTurnTable(view, false);
                
                var currViewMat = view.getViewMatrix();

               
                var viewpoint = view._scene.getViewpoint();
                var center = x3dom.fields.SFVec3f.copy(viewpoint.getCenterOfRotation());

                view._flyMat = currViewMat.inverse();

                view._from = view._flyMat.e3();               
                view._at = center;
                view._up = view._flyMat.e1();
                
                view._flyMat = x3dom.fields.SFMatrix4f.lookAt(view._from, view._at, view._up);
                view._flyMat = view.calcOrbit(0, 0, this);                
            },
            
            onDrag: function(view, dx, dy,buttonState)
            { 
                if (!view._flyMat)
                    this.initTurnTable(view, false);
                                
                var viewpoint = view._scene.getViewpoint();
                
                if (buttonState & 1) //left
                {
                    alpha = (dy * 2 * Math.PI) / view._height;
                    beta = (dx * 2 * Math.PI) / view._width;
                    
                    view._flyMat = this.calcOrbit(view, alpha, beta);                    
                    
                    //view._rotMat = view._flyMat;
                    viewpoint.setViewAbsolute(view._flyMat.inverse());
                }
                else if (buttonState & 2) //right
                {
                    d = (view._scene._lastMax.subtract(view._scene._lastMin)).length();
                    d = ((d < x3dom.fields.Eps) ? 1 : d) * this._vf.speed;

                    view._up   = view._flyMat.e1();
                    view._from = view._flyMat.e3(); // eye

                    // zoom in/out
                    cor = view._at;

                    var lastDir  = cor.subtract(view._from);
                    var lastDirL = lastDir.length();
                    lastDir = lastDir.normalize();
                    
                    var zoomAmount = d * (dx + dy) / view._height;
                    
                    // FIXME: very experimental HACK to switch between both versions (clamp to CoR and CoR translation)
                    if (this._vf.typeParams.length >= 5 && this._vf.typeParams[4] > 0)
                    {
                        // maintain minimum distance (value given in typeParams[4]) to prevent orientation flips
                        var newDist = Math.min(zoomAmount, lastDirL - this._vf.typeParams[4]);
                        newDist = Math.min(newDist, this._vf.typeParams[5]);

                        // move along viewing ray, scaled with zoom factor
                        view._from = view._from.addScaled(lastDir, newDist);
                    }
                    else
                    {
                        // add z offset to look-at position, alternatively clamp
                        var diff = zoomAmount - lastDirL + 0.01;
                        if (diff >= 0) {
                            cor = cor.addScaled(lastDir, diff);
                            view._at = cor;
                        }

                        // move along viewing ray, scaled with zoom factor
                        view._from = view._from.addScaled(lastDir, zoomAmount);
                    }

                    // move along viewing ray, scaled with zoom factor
                    //view._from = view._from.addScaled(lastDir, zoomAmount);

                    // update camera matrix with lookAt() and invert again
                    view._flyMat = x3dom.fields.SFMatrix4f.lookAt(view._from, cor, view._up);
                    viewpoint.setView(view._flyMat.inverse());
                }
                else if (buttonState & 4) //middle
                {
                    target = document.getElementById(this._vf.target);
                    
                    bbox  = target._x3domNode.getVolume();
                    
                    
                    d = (view._scene._lastMax.subtract(view._scene._lastMin)).length();
                    d = ((d < x3dom.fields.Eps) ? 1 : d) * this._vf.speed * 0.75;

                    var tx = -d * dx / view._width;
                    var ty =  d * dy / view._height;

                    view._up   = view._flyMat.e1();
                    view._from = view._flyMat.e3(); // eye
                    var s = view._flyMat.e0();                   
                
                    // add xy offset to look-at position  ^
                    cor = view._at;     
                             
                    cor = cor.addScaled(new x3dom.fields.SFVec3f(0,1,0), ty);
                    var temp = cor;
                    if(cor.y > bbox.max.y || cor.y < bbox.min.y )
                        temp = view._at;
                    else
                        view._from = view._from.addScaled(new x3dom.fields.SFVec3f(0,1,0), ty);
                    
                    
                    cor = temp.addScaled(new x3dom.fields.SFVec3f(1,0,0), tx); 
                    if(cor.x > bbox.max.x || cor.x < bbox.min.x )
                        cor = temp;
                    else
                        view._from = view._from.addScaled(new x3dom.fields.SFVec3f(1,0,0), tx);
                                   
                    view._at = cor;
                    
                    // update camera matrix with lookAt() and invert
                    view._flyMat = x3dom.fields.SFMatrix4f.lookAt(view._from, cor, view._up);
                    viewpoint.setViewAbsolute(view._flyMat.inverse());
                    
                     
                }

                view._isMoving = true;
            },
            
            resetView:function(view)
            {
               
                view._mixer._beginTime = view._lastTS;
                view._mixer._endTime = view._lastTS + this._vf.transitionTime;

                view._mixer.setBeginMatrix(view.getViewMatrix());

                var target = view._scene.getViewpoint();
                target.resetView();
                
                target = x3dom.fields.SFMatrix4f.lookAt(target._vf.position, target.getCenterOfRotation(), new x3dom.fields.SFVec3f(0,1,0));

                view._mixer.setEndMatrix(target.inverse());
                
                this.updateFlyMat(view);
            },
            
            calcOrbit: function (view, alpha, beta)
            {
                view._up   = view._flyMat.e1();
                view._from = view._flyMat.e3();

                var offset = view._from.subtract(view._at);

                // angle in xz-plane
                var phi = Math.atan2(offset.x, offset.z);

                // angle from y-axis
                var theta = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);

                phi -= beta;
                theta -= alpha;

                // clamp theta
                theta = Math.max(this._vf.angularRestrictions[0], Math.min(this._vf.angularRestrictions[1], theta));
                phi = Math.max(this._vf.angularRestrictions[2], Math.min(this._vf.angularRestrictions[3], phi));

                var radius = offset.length();

                // calc new cam position
                var rSinPhi = radius * Math.sin(theta);

                offset.x = rSinPhi * Math.sin(phi);
                offset.y = radius  * Math.cos(theta);
                offset.z = rSinPhi * Math.cos(phi);

                offset = view._at.add(offset);

                // calc new up vector
                theta -= Math.PI / 2;

                var sinPhi = Math.sin(theta);
                var cosPhi = Math.cos(theta);
                var up = new x3dom.fields.SFVec3f(sinPhi * Math.sin(phi), cosPhi, sinPhi * Math.cos(phi));

                if (up.y < 0)
                    up = up.negate();

                return x3dom.fields.SFMatrix4f.lookAt(offset, view._at, up);
            }
        }
    )
);