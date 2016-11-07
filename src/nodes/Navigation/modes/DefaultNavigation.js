

x3dom.DefaultNavigation = function(navigationNode)
{
    this.navi = navigationNode;
};

x3dom.DefaultNavigation.prototype.onMousePress = function(view,x, y, buttonState)
{
    
};

x3dom.DefaultNavigation.prototype.onMouseReleased = function(view,x, y, buttonState, prevButton)
{
    
};

x3dom.DefaultNavigation.prototype.init = function(view, flyTo)
{
    
};

x3dom.DefaultNavigation.prototype.moveForward = function(view)
{
     var navi = this.navi;
    
    if (navi.getType() === "game")
    {
        var avatarRadius = 0.25;
        var avatarHeight = 1.6;

        if (navi._vf.avatarSize.length > 2) {
            avatarRadius = navi._vf.avatarSize[0];
            avatarHeight = navi._vf.avatarSize[1];
        }

        var speed = 5 * view._deltaT * navi._vf.speed;
        var yRotRad = (view._yaw / 180 * Math.PI);
        var xRotRad = (view._pitch / 180 * Math.PI);

        var dist = 0;
        var fMat = view._flyMat.inverse();

        // check front for collisions
        view._scene._nameSpace.doc.ctx.pickValue(view, view._width/2, view._height/2, view._lastButton);

        if (view._pickingInfo.pickObj)
        {
            dist = view._pickingInfo.pickPos.subtract(fMat.e3()).length();

            if (dist <= 2 * avatarRadius) {
                //x3dom.debug.logWarning("Collision at dist=" + dist.toFixed(4));
            }
            else {
                view._eyePos.x -= Math.sin(yRotRad) * speed;
                view._eyePos.z += Math.cos(yRotRad) * speed;
                view._eyePos.y += Math.sin(xRotRad) * speed;
            }
        }
    }
};

x3dom.DefaultNavigation.prototype.moveBackwards = function(view)
{
    var navi = this.navi;
    
    if (navi.getType() === "game")
    {
        var speed = 5 * view._deltaT * navi._vf.speed;
        var yRotRad = (view._yaw / 180 * Math.PI);
        var xRotRad = (view._pitch / 180 * Math.PI);

        view._eyePos.x += Math.sin(yRotRad) * speed;
        view._eyePos.z -= Math.cos(yRotRad) * speed;
        view._eyePos.y -= Math.sin(xRotRad) * speed;
    }
};

x3dom.DefaultNavigation.prototype.strafeLeft = function(view)
{
    var navi = this.navi;
    
    if (navi.getType() === "game")
    {
        var speed = 5 * view._deltaT * navi._vf.speed;
        var yRotRad = (view._yaw / 180 * Math.PI);

        view._eyePos.x += Math.cos(yRotRad) * speed;
        view._eyePos.z += Math.sin(yRotRad) * speed;
    }
};

x3dom.DefaultNavigation.prototype.strafeRight = function(view)
{
    var navi = this.navi;
    
    if (navi.getType() === "game")
    {
        var speed = 5 * view._deltaT * navi._vf.speed;
        var yRotRad = (view._yaw / 180 * Math.PI);

        view._eyePos.x -= Math.cos(yRotRad) * speed;
        view._eyePos.z -= Math.sin(yRotRad) * speed;
    }
};

x3dom.DefaultNavigation.prototype.navigateTo = function(view, timeStamp)
{
    var navi = this.navi;
    var navType = navi.getType();
    var savedPickingInfo = null;
    
    var needNavAnim = (view._currentInputType == x3dom.InputTypes.NAVIGATION) &&
                      ( navType === "game" ||
                        (view._lastButton > 0 &&
                        (navType.indexOf("fly") >= 0 ||
                         navType === "walk" ||
                         navType === "helicopter" ||
                         navType.substr(0, 5) === "looka")) );
    
    view._deltaT = timeStamp - view._lastTS;
    
    var removeZeroMargin = function(val, offset) {
        if (val > 0) {
            if (val <= offset) {
                return 0;
            } else {
                return val - offset;
            }
        } else if (val <= 0) {
            if (val >= -offset) {
                return 0;
            } else {
                return val + offset;
            }
        }
    };
    
    // slightly increasing slope function
    var humanizeDiff = function(scale, diff) {
        return ((diff < 0) ? -1 : 1 ) * Math.pow(scale * Math.abs(diff), 1.65 /*lower is easier on the novice*/);
    };

    if (needNavAnim)
    {

        //Save picking info if available
        if( view._pickingInfo.pickObj !== null ) {

            savedPickingInfo = {
                pickPos: view._pickingInfo.pickPos,
                pickNorm: view._pickingInfo.pickNorm,
                pickObj: view._pickingInfo.pickObj,
                firstObj: view._pickingInfo.firstObj,
                lastObj: view._pickingInfo.lastObj,
                lastClickObj: view._pickingInfo.lastClickObj,
                shadowObjectId: view._pickingInfo.shadowObjectId
            };
        }

        var avatarRadius = 0.25;
        var avatarHeight = 1.6;
        var avatarKnee = 0.75;  // TODO; check max. step size

        if (navi._vf.avatarSize.length > 2) {
            avatarRadius = navi._vf.avatarSize[0];
            avatarHeight = navi._vf.avatarSize[1];
            avatarKnee = navi._vf.avatarSize[2];
        }
        
        

        // get current view matrix
        var currViewMat = view.getViewMatrix();
        var dist = 0;
        
        // estimate one screen size for motion puposes so navigation behaviour
        // is less dependent on screen geometry. view makes no sense for very
        // anisotropic cases, so it should probably be configurable.
        var screenSize = Math.min(view._width, view._height);
        var rdeltaX = removeZeroMargin((view._pressX - view._lastX) / screenSize, 0.01);
        var rdeltaY = removeZeroMargin((view._pressY - view._lastY) / screenSize, 0.01);
        
        var userXdiff = humanizeDiff(1, rdeltaX);
        var userYdiff = humanizeDiff(1, rdeltaY);

        // check if forwards or backwards (on right button)
        var step = (view._lastButton & 2) ? -1 : 1;
        step *= (view._deltaT * navi._vf.speed);
        
        // factor in delta time and the nav speed setting
        var userXstep = view._deltaT * navi._vf.speed * userXdiff;
        var userYstep = view._deltaT * navi._vf.speed * userYdiff;
        
        var phi = Math.PI * view._deltaT * userXdiff;
        var theta = Math.PI * view._deltaT * userYdiff;
        
        if (view._needNavigationMatrixUpdate === true)
        {
            view._needNavigationMatrixUpdate = false;
          
            // reset examine matrices to identity
            view._rotMat = x3dom.fields.SFMatrix4f.identity();
            view._transMat = x3dom.fields.SFMatrix4f.identity();
            view._movement = new x3dom.fields.SFVec3f(0, 0, 0);

            var angleX = 0;
            var angleY = Math.asin(currViewMat._02);
            var C = Math.cos(angleY);
            
            if (Math.abs(C) > 0.0001) {
                angleX = Math.atan2(-currViewMat._12 / C, currViewMat._22 / C);
            }

            // too many inversions here can lead to distortions
            view._flyMat = currViewMat.inverse();
            
            view._from = view._flyMat.e3();
            view._at = view._from.subtract(view._flyMat.e2());

            if (navType === "helicopter")
                view._at.y = view._from.y;

            /*

             //lookat, lookaround
             if (navType.substr(0, 5) === "looka")
             {
             view._up = view._flyMat.e1();
             }
             //all other modes
             else
             {
             //initially read up-vector from current orientation and keep it
             if (typeof view._up == 'undefined')
             {
             view._up = view._flyMat.e1();
             }
             }

             */

            view._up = view._flyMat.e1();

            view._pitch = angleX * 180 / Math.PI;
            view._yaw = angleY * 180 / Math.PI;
            view._eyePos = view._from.negate();
        }

        var tmpAt = null, tmpUp = null, tmpMat = null;
        var q, temp, fin;
        var lv, sv, up;

        if (navType === "game")
        {
            view._pitch += view._dy;
            view._yaw   += view._dx;

            if (view._pitch >=  89) view._pitch = 89;
            if (view._pitch <= -89) view._pitch = -89;
            if (view._yaw >=  360) view._yaw -= 360;
            if (view._yaw < 0) view._yaw = 360 + view._yaw;
            
            view._dx = 0;
            view._dy = 0;

            var xMat = x3dom.fields.SFMatrix4f.rotationX(view._pitch / 180 * Math.PI);
            var yMat = x3dom.fields.SFMatrix4f.rotationY(view._yaw / 180 * Math.PI);

            var fPos = x3dom.fields.SFMatrix4f.translation(view._eyePos);

            view._flyMat = xMat.mult(yMat).mult(fPos);

            // Finally check floor for terrain following (TODO: optimize!)
            var flyMat = view._flyMat.inverse();

            var tmpFrom = flyMat.e3();
            tmpUp = new x3dom.fields.SFVec3f(0, -1, 0);

            tmpAt = tmpFrom.add(tmpUp);
            tmpUp = flyMat.e0().cross(tmpUp).normalize();

            tmpMat = x3dom.fields.SFMatrix4f.lookAt(tmpFrom, tmpAt, tmpUp);
            tmpMat = tmpMat.inverse();

            view._scene._nameSpace.doc.ctx.pickValue(view, view._width/2, view._height/2,
                        view._lastButton, tmpMat, view.getProjectionMatrix().mult(tmpMat));

            if (view._pickingInfo.pickObj)
            {
                dist = view._pickingInfo.pickPos.subtract(tmpFrom).length();
                //x3dom.debug.logWarning("Floor collision at dist=" + dist.toFixed(4));

                tmpFrom.y += (avatarHeight - dist);
                flyMat.setTranslate(tmpFrom);

                view._eyePos = flyMat.e3().negate();
                view._flyMat = flyMat.inverse();

                view._pickingInfo.pickObj = null;
            }

            view._scene.getViewpoint().setView(view._flyMat);

            return needNavAnim;
        }   // game
        else if (navType === "helicopter") {
            var typeParams = navi.getTypeParams();

            

            if (view._lastButton & 2) // up/down levelling
            {
                var stepUp = 200 * userYstep;
                typeParams[1] += stepUp;
                navi.setTypeParams(typeParams);
            }

            if (view._lastButton & 1) {  // forward/backward motion
                step = 300 * userYstep;
            }
            else {
                step = 0;
            }
            
            theta = typeParams[0];
            view._from.y = typeParams[1];
            view._at.y = view._from.y;

            // rotate around the up vector
            q = x3dom.fields.Quaternion.axisAngle(view._up, phi);
            temp = q.toMatrix();

            fin = x3dom.fields.SFMatrix4f.translation(view._from);
            fin = fin.mult(temp);

            temp = x3dom.fields.SFMatrix4f.translation(view._from.negate());
            fin = fin.mult(temp);

            view._at = fin.multMatrixPnt(view._at);

            // rotate around the side vector
            lv = view._at.subtract(view._from).normalize();
            sv = lv.cross(view._up).normalize();
            up = sv.cross(lv).normalize();

            lv = lv.multiply(step);

            view._from = view._from.add(lv);
            view._at = view._at.add(lv);

            // rotate around the side vector
            q = x3dom.fields.Quaternion.axisAngle(sv, theta);
            temp = q.toMatrix();

            fin = x3dom.fields.SFMatrix4f.translation(view._from);
            fin = fin.mult(temp);

            temp = x3dom.fields.SFMatrix4f.translation(view._from.negate());
            fin = fin.mult(temp);

            var at = fin.multMatrixPnt(view._at);

            view._flyMat = x3dom.fields.SFMatrix4f.lookAt(view._from, at, up);

            view._scene.getViewpoint().setView(view._flyMat.inverse());

            return needNavAnim;
        }   // helicopter

        // rotate around the up vector
        q = x3dom.fields.Quaternion.axisAngle(view._up, phi);
        temp = q.toMatrix();

        fin = x3dom.fields.SFMatrix4f.translation(view._from);
        fin = fin.mult(temp);

        temp = x3dom.fields.SFMatrix4f.translation(view._from.negate());
        fin = fin.mult(temp);

        view._at = fin.multMatrixPnt(view._at);

        // rotate around the side vector
        lv = view._at.subtract(view._from).normalize();
        sv = lv.cross(view._up).normalize();
        up = sv.cross(lv).normalize();
        //view._up = up;

        q = x3dom.fields.Quaternion.axisAngle(sv, theta);
        temp = q.toMatrix();

        fin = x3dom.fields.SFMatrix4f.translation(view._from);
        fin = fin.mult(temp);

        temp = x3dom.fields.SFMatrix4f.translation(view._from.negate());
        fin = fin.mult(temp);

        view._at = fin.multMatrixPnt(view._at);

        // forward along view vector
        if (navType.substr(0, 5) !== "looka")
        {
            var currProjMat = view.getProjectionMatrix();

            if (navType !== "freefly") {
                if (step < 0) {
                    // backwards: negate viewing direction
                    tmpMat = new x3dom.fields.SFMatrix4f();
                    tmpMat.setValue(view._last_mat_view.e0(), view._last_mat_view.e1(),
                                    view._last_mat_view.e2().negate(), view._last_mat_view.e3());

                    view._scene._nameSpace.doc.ctx.pickValue(view, view._width/2, view._height/2,
                                view._lastButton, tmpMat, currProjMat.mult(tmpMat));
                }
                else {
                    view._scene._nameSpace.doc.ctx.pickValue(view, view._width/2, view._height/2, view._lastButton);
                }
                if (view._pickingInfo.pickObj)
                {
                    dist = view._pickingInfo.pickPos.subtract(view._from).length();

                    if (dist <= avatarRadius) {
                        step = 0;
                    }
                }
            }

            lv = view._at.subtract(view._from).normalize().multiply(step);

            view._at = view._at.add(lv);
            view._from = view._from.add(lv);

            // finally attach to ground when walking
            if (navType === "walk")
            {
                tmpAt = view._from.addScaled(up, -1.0);
                tmpUp = sv.cross(up.negate()).normalize();  // lv

                tmpMat = x3dom.fields.SFMatrix4f.lookAt(view._from, tmpAt, tmpUp);
                tmpMat = tmpMat.inverse();

                view._scene._nameSpace.doc.ctx.pickValue(view, view._width/2, view._height/2,
                            view._lastButton, tmpMat, currProjMat.mult(tmpMat));

                if (view._pickingInfo.pickObj)
                {
                    dist = view._pickingInfo.pickPos.subtract(view._from).length();

                    view._at = view._at.add(up.multiply(avatarHeight - dist));
                    view._from = view._from.add(up.multiply(avatarHeight - dist));
                }
            }
            view._pickingInfo.pickObj = null;
        }
        
        view._flyMat = x3dom.fields.SFMatrix4f.lookAt(view._from, view._at, up);

        view._scene.getViewpoint().setView(view._flyMat.inverse());

        //Restore picking info if available
        if( savedPickingInfo !== null ) {

            view._pickingInfo = savedPickingInfo;
            
        }
    }

    return needNavAnim;
};

x3dom.DefaultNavigation.prototype.animateTo = function(view, target, prev, dur)
{
    var navi = this.navi;
    
    if (x3dom.isa(target, x3dom.nodeTypes.X3DViewpointNode)) {
        target = target.getViewMatrix().mult(target.getCurrentTransform().inverse());
    }

    if (navi._vf.transitionType[0].toLowerCase() !== "teleport" && dur != 0 && navi.getType() !== "game")
    {
        if (prev && x3dom.isa(prev, x3dom.nodeTypes.X3DViewpointNode)) {
            prev = prev.getViewMatrix().mult(prev.getCurrentTransform().inverse()).
                         mult(view._transMat).mult(view._rotMat);

            view._mixer.beginTime = view._lastTS;

            if (arguments.length >= 4 && arguments[3] != null) {
                // for lookAt to assure travel speed of 1 m/s
                view._mixer.endTime = view._lastTS + dur;
            }
            else {
                view._mixer.endTime = view._lastTS + navi._vf.transitionTime;
            }

            view._mixer.setBeginMatrix (prev);
            view._mixer.setEndMatrix (target);
            
            view._scene.getViewpoint().setView(prev);
        }
        else {
            view._scene.getViewpoint().setView(target);
        }
    }
    else
    {
        view._scene.getViewpoint().setView(target);
    }

    view._rotMat = x3dom.fields.SFMatrix4f.identity();
    view._transMat = x3dom.fields.SFMatrix4f.identity();
    view._movement = new x3dom.fields.SFVec3f(0, 0, 0);
    view._needNavigationMatrixUpdate = true;
};

x3dom.DefaultNavigation.prototype.orthoAnimateTo = function( view, target, prev, duration )
{
    var navi = this.navi;

    duration = duration || navi._vf.transitionTime;

    view._interpolator.beginValue = prev;
    view._interpolator.endValue = target;

    view._interpolator.beginTime = view._lastTS;
    view._interpolator.endTime = view._lastTS + duration;
};

x3dom.DefaultNavigation.prototype.resetView = function(view)
{
    var navi = this.navi;

    if (navi._vf.transitionType[0].toLowerCase() !== "teleport" && navi.getType() !== "game")
    {
		var viewpoint = view._scene.getViewpoint();
		
        view._mixer.beginTime = view._lastTS;
        view._mixer.endTime = view._lastTS + navi._vf.transitionTime;

        view._mixer.setBeginMatrix(view.getViewMatrix());
		
		if (x3dom.isa(viewpoint, x3dom.nodeTypes.OrthoViewpoint))
		{
			this.orthoAnimateTo(view, Math.abs(viewpoint._vf.fieldOfView[0]), Math.abs(viewpoint._fieldOfView[0]));
		}

        var target = view._scene.getViewpoint();
        target.resetView();

        target = target.getViewMatrix().mult(target.getCurrentTransform().inverse());

        view._mixer.setEndMatrix(target);
    } else
    {
        view._scene.getViewpoint().resetView();
    }

    view.resetNavHelpers();
    navi._heliUpdated = false;
};

x3dom.DefaultNavigation.prototype.onDrag = function(view, x, y, buttonState)
{
    var navi = this.navi;

    var navType = navi.getType();
    var navRestrict = navi.getExplorationMode();

    if (navType === "none" || navRestrict == 0) {
        return;
    }

    var viewpoint = view._scene.getViewpoint();

    var dx = x - view._lastX;
    var dy = y - view._lastY;
    var d, vec, cor, mat = null;
    var alpha, beta;

    buttonState = (!navRestrict || (navRestrict != 7 && buttonState == 1)) ? navRestrict : buttonState;
    
    if (buttonState & 1) //left
    {
        alpha = (dy * 2 * Math.PI) / view._width;
        beta = (dx * 2 * Math.PI) / view._height;
        mat = view.getViewMatrix();

        var mx = x3dom.fields.SFMatrix4f.rotationX(alpha);
        var my = x3dom.fields.SFMatrix4f.rotationY(beta);

        var center = viewpoint.getCenterOfRotation();
        mat.setTranslate(new x3dom.fields.SFVec3f(0,0,0));

        view._rotMat = view._rotMat.
                        mult(x3dom.fields.SFMatrix4f.translation(center)).
                        mult(mat.inverse()).mult(mx).mult(my).mult(mat).
                        mult(x3dom.fields.SFMatrix4f.translation(center.negate()));
    }
    if (buttonState & 4) //middle
    {
        d = (view._scene._lastMax.subtract(view._scene._lastMin)).length();
        d = ((d < x3dom.fields.Eps) ? 1 : d) * navi._vf.speed;

        vec = new x3dom.fields.SFVec3f(d*dx/view._width, d*(-dy)/view._height, 0);
        view._movement = view._movement.add(vec);

        mat = view.getViewpointMatrix().mult(view._transMat);
        //TODO; move real distance along viewing plane
        view._transMat = mat.inverse().
                            mult(x3dom.fields.SFMatrix4f.translation(view._movement)).
                            mult(mat);
    }
    if (buttonState & 2) //right
    {
            d = (view._scene._lastMax.subtract(view._scene._lastMin)).length();
            d = ((d < x3dom.fields.Eps) ? 1 : d) * navi._vf.speed;

        vec = new x3dom.fields.SFVec3f(0, 0, d*(dx+dy)/view._height);

        if (x3dom.isa(viewpoint, x3dom.nodeTypes.OrthoViewpoint))
        {
            viewpoint.setZoom( Math.abs( viewpoint._fieldOfView[0] ) - vec.z );
        }
        else
        {
            if ( navi._vf.typeParams.length >= 6 ) {

                var min = -navi._vf.typeParams[ 5 ];
                var max =  navi._vf.typeParams[ 4 ];

                view._movement.z = Math.min( Math.max( view._movement.z, min ), max );

            }

            view._movement = view._movement.add(vec);
            mat = view.getViewpointMatrix().mult(view._transMat);
            //TODO; move real distance along viewing ray
            view._transMat = mat.inverse().
                                mult(x3dom.fields.SFMatrix4f.translation(view._movement)).
                                mult(mat);
        }
    }

    view._isMoving = true;
    
    
    view._dx = dx;
    view._dy = dy;

    view._lastX = x;
    view._lastY = y;
};

x3dom.DefaultNavigation.prototype.onTouchStart = function(view, evt, touches)
{
    
};

x3dom.DefaultNavigation.prototype.onTouchDrag = function(view,evt, touches, translation, rotation)
{
    if (view._currentInputType == x3dom.InputTypes.NAVIGATION)
    {
        var navi = this.navi;
        var viewpoint = view._scene.getViewpoint();

        if (navi.getType() === "examine")
        {
            if (translation)
            {
                var distance = (view._scene._lastMax.subtract(view._scene._lastMin)).length();
                distance = ((distance < x3dom.fields.Eps) ? 1 : distance) * navi._vf.speed;

                translation = translation.multiply(distance);
                view._movement = view._movement.add(translation);

                view._transMat = viewpoint.getViewMatrix().inverse().
                    mult(x3dom.fields.SFMatrix4f.translation(view._movement)).
                    mult(viewpoint.getViewMatrix());
            }

            if (rotation)
            {
                var center = viewpoint.getCenterOfRotation();
                var mat = view.getViewMatrix();
                mat.setTranslate(new x3dom.fields.SFVec3f(0,0,0));

                view._rotMat = view._rotMat.
                               mult(x3dom.fields.SFMatrix4f.translation(center)).
                               mult(mat.inverse()).mult(rotation).mult(mat).
                               mult(x3dom.fields.SFMatrix4f.translation(center.negate()));
            }

            view._isMoving = true;
        }
    }
};

x3dom.DefaultNavigation.prototype.onTouchEnd = function(evt, touches)
{
    
};

x3dom.DefaultNavigation.prototype.onDoubleClick = function (view, x, y)
{
    if (view._doc._x3dElem.hasAttribute('disableDoubleClick') &&
        view._doc._x3dElem.getAttribute('disableDoubleClick') === 'true') {
        return;
    }
    
    var navi = view._scene.getNavigationInfo();
    
    if (navi.getType() == "none") {
        return;
    }

    var pickMode = view._scene._vf.pickMode.toLowerCase();

    if ((pickMode == "color" || pickMode == "texcoord")) {
         return;
    }

    var viewpoint = view._scene.getViewpoint();

    viewpoint.setCenterOfRotation(view._pick);
    x3dom.debug.logInfo("New center of Rotation:  " + view._pick);

    var mat = view.getViewMatrix().inverse();

    var from = mat.e3();
    var at = view._pick;
    var up = mat.e1();

    var norm = mat.e0().cross(up).normalize();
    // get distance between look-at point and viewing plane
    var dist = norm.dot(view._pick.subtract(from));
    
    from = at.addScaled(norm, -dist);
    mat = x3dom.fields.SFMatrix4f.lookAt(from, at, up);
    
    x3dom.debug.logInfo("New camera position:  " + from);
    view.animateTo(mat.inverse(), viewpoint);
};