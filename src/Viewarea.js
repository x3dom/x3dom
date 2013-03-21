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

// ### Viewarea ###
x3dom.Viewarea = function (document, scene) {
    this._doc = document; // x3ddocument
    this._scene = scene; // FIXME: updates ?!

    document._nodeBag.viewarea.push(this);

    this._pickingInfo = {
        pickPos: new x3dom.fields.SFVec3f(0, 0, 0),
        pickNorm: new x3dom.fields.SFVec3f(0, 0, 1),
        pickObj: null,
        lastObj: null,
        lastClickObj: null
    };

    this._relMat = x3dom.fields.SFMatrix4f.identity();

    this._needNavigationMatrixUpdate = true;
    this._deltaT = 0;

    this._pitch = 0;
    this._yaw = 0;
    this._eyePos = new x3dom.fields.SFVec3f(0, 0, 0);

    this._width = 400;
    this._height = 300;
    
    this._dx = 0;
    this._dy = 0;
    this._lastX = -1;
    this._lastY = -1;
    this._pressX = -1;
    this._pressY = -1;
    this._lastButton = 0;
    this._hasTouches = false;
    
    this._numRenderedNodes = 0;
    
    this._pick = new x3dom.fields.SFVec3f(0, 0, 0);
    this._pickNorm = new x3dom.fields.SFVec3f(0, 0, 1);
    
    this._isAnimating = false;
    this._lastTS = 0;
    this._mixer = new x3dom.MatrixMixer();
};

x3dom.Viewarea.prototype.tick = function(timeStamp)
{
    var needMixAnim = false;

    if (this._mixer._beginTime > 0)
    {
        needMixAnim = true;

        if (timeStamp >= this._mixer._beginTime)
        {
            if (timeStamp <= this._mixer._endTime)
            {
                var mat = this._mixer.mix(timeStamp);

                this._scene.getViewpoint().setView(mat);
            }
            else {
                this._mixer._beginTime = 0;
                this._mixer._endTime = 0;

                this._scene.getViewpoint().setView(this._mixer._endMat);
            }
        }
        else {
            this._mixer._beginTime = 0;
            this._mixer._endTime = 0;
            
            this._scene.getViewpoint().setView(this._mixer._beginMat);
        }
    }

    var needNavAnim = this.navigateTo(timeStamp);
    var lastIsAnimating = this._isAnimating;

    this._lastTS = timeStamp;
    this._isAnimating = (needMixAnim || needNavAnim);

    return (this._isAnimating || lastIsAnimating);
};

x3dom.Viewarea.prototype.isMoving = function()
{
    return (this._lastButton > 0 || this._hasTouches || this._isAnimating);
};

x3dom.Viewarea.prototype.navigateTo = function(timeStamp)
{
    var navi = this._scene.getNavigationInfo();
    var needNavAnim = ( navi._vf.type[0].toLowerCase() === "game" ||
                        (this._lastButton > 0 &&
                        (navi._vf.type[0].toLowerCase() === "fly" ||
                         navi._vf.type[0].toLowerCase() === "walk" ||
                         navi._vf.type[0].toLowerCase() === "helicopter" ||
                         navi._vf.type[0].toLowerCase().substr(0, 5) === "looka")) );
    
    this._deltaT = timeStamp - this._lastTS;

    if (needNavAnim)
    {
        var avatarRadius = 0.25;
        var avatarHeight = 1.6;
        var avatarKnee = 0.75;  // TODO; check max. step size

        if (navi._vf.avatarSize.length > 2) {
            avatarRadius = navi._vf.avatarSize[0];
            avatarHeight = navi._vf.avatarSize[1];
            avatarKnee = navi._vf.avatarSize[2];
        }

        // get current view matrix
        var currViewMat = this.getViewMatrix();
        var dist = 0;

        // check if forwards or backwards (on right button)
        var step = (this._lastButton & 2) ? -1 : 1;
        step *= (this._deltaT * navi._vf.speed);

        var phi = Math.PI * this._deltaT * (this._pressX - this._lastX) / this._width;
        var theta = Math.PI * this._deltaT * (this._pressY - this._lastY) / this._height;

        if (this._needNavigationMatrixUpdate === true)
        {
            this._needNavigationMatrixUpdate = false;
          
            // reset examine matrix to identity
            this._relMat = x3dom.fields.SFMatrix4f.identity();

            var angleX = 0;
            var angleY = Math.asin(currViewMat._02);
            var C = Math.cos(angleY);
            
            if (Math.abs(C) > 0.0001) {
                angleX = Math.atan2(-currViewMat._12 / C, currViewMat._22 / C);
            }

            // too many inversions here can lead to distortions
            this._flyMat = currViewMat.inverse();
            
            this._from = this._flyMat.e3();
            this._at = this._from.subtract(this._flyMat.e2());

            if (navi._vf.type[0].toLowerCase() === "helicopter")
                this._at.y = this._from.y;
            
            if (navi._vf.type[0].toLowerCase().substr(0, 5) !== "looka")
                this._up = new x3dom.fields.SFVec3f(0, 1, 0);
            else
                this._up = this._flyMat.e1();

            this._pitch = angleX * 180 / Math.PI;
            this._yaw = angleY * 180 / Math.PI;
            this._eyePos = this._from.negate();
        }

        var tmpAt = null, tmpUp = null, tmpMat = null;
        var q, temp, fin;
        var lv, sv, up;

        if (navi._vf.type[0].toLowerCase() === "game")
        {
            this._pitch += this._dy;
            this._yaw   += this._dx;

            if (this._pitch >=  89) this._pitch = 89;
            if (this._pitch <= -89) this._pitch = -89;
            if (this._yaw >=  360) this._yaw -= 360;
            if (this._yaw < 0) this._yaw = 360 + this._yaw;
            
            this._dx = 0;
            this._dy = 0;

            var xMat = x3dom.fields.SFMatrix4f.rotationX(this._pitch / 180 * Math.PI);
            var yMat = x3dom.fields.SFMatrix4f.rotationY(this._yaw / 180 * Math.PI);

            var fPos = x3dom.fields.SFMatrix4f.translation(this._eyePos);

            this._flyMat = xMat.mult(yMat).mult(fPos);

            // Finally check floor for terrain following (TODO: optimize!)
            var flyMat = this._flyMat.inverse();

            var tmpFrom = flyMat.e3();
            tmpUp = new x3dom.fields.SFVec3f(0, -1, 0);

            tmpAt = tmpFrom.add(tmpUp);
            tmpUp = flyMat.e0().cross(tmpUp).normalize();

            tmpMat = x3dom.fields.SFMatrix4f.lookAt(tmpFrom, tmpAt, tmpUp);
            tmpMat = tmpMat.inverse();

            this._scene._nameSpace.doc.ctx.pickValue(this, this._width/2, this._height/2,
                        this._lastButton, tmpMat, this.getProjectionMatrix().mult(tmpMat));

            if (this._pickingInfo.pickObj)
            {
                dist = this._pickingInfo.pickPos.subtract(tmpFrom).length();
                //x3dom.debug.logWarning("Floor collision at dist=" + dist.toFixed(4));

                tmpFrom.y += (avatarHeight - dist);
                flyMat.setTranslate(tmpFrom);

                this._eyePos = flyMat.e3().negate();
                this._flyMat = flyMat.inverse();

                this._pickingInfo.pickObj = null;
            }

            this._scene.getViewpoint().setView(this._flyMat);

            return needNavAnim;
        }   // game
        else if (navi._vf.type[0].toLowerCase() === "helicopter")
        {
            var typeParams = navi.getTypeParams();

            if (this._lastButton & 2)
            {
                var stepUp = this._deltaT * this._deltaT * navi._vf.speed;
                stepUp *= 0.1 * (this._pressY - this._lastY) * Math.abs(this._pressY - this._lastY);
                typeParams[1] += stepUp;

                navi.setTypeParams(typeParams);
            }

            if (this._lastButton & 1) {
                step *= this._deltaT * (this._pressY - this._lastY) * Math.abs(this._pressY - this._lastY);
            }
            else {
                step = 0;
            }

            theta = typeParams[0];
            this._from.y = typeParams[1];
            this._at.y = this._from.y;

            // rotate around the up vector
            q = x3dom.fields.Quaternion.axisAngle(this._up, phi);
            temp = q.toMatrix();

            fin = x3dom.fields.SFMatrix4f.translation(this._from);
            fin = fin.mult(temp);

            temp = x3dom.fields.SFMatrix4f.translation(this._from.negate());
            fin = fin.mult(temp);

            this._at = fin.multMatrixPnt(this._at);

            // rotate around the side vector
            lv = this._at.subtract(this._from).normalize();
            sv = lv.cross(this._up).normalize();
            up = sv.cross(lv).normalize();

            lv = lv.multiply(step);

            this._from = this._from.add(lv);
            this._at = this._at.add(lv);

            // rotate around the side vector
            q = x3dom.fields.Quaternion.axisAngle(sv, theta);
            temp = q.toMatrix();

            fin = x3dom.fields.SFMatrix4f.translation(this._from);
            fin = fin.mult(temp);

            temp = x3dom.fields.SFMatrix4f.translation(this._from.negate());
            fin = fin.mult(temp);

            var at = fin.multMatrixPnt(this._at);

            this._flyMat = x3dom.fields.SFMatrix4f.lookAt(this._from, at, up);

            this._scene.getViewpoint().setView(this._flyMat.inverse());

            return needNavAnim;
        }   // helicopter

        // rotate around the up vector
        q = x3dom.fields.Quaternion.axisAngle(this._up, phi);
        temp = q.toMatrix();

        fin = x3dom.fields.SFMatrix4f.translation(this._from);
        fin = fin.mult(temp);

        temp = x3dom.fields.SFMatrix4f.translation(this._from.negate());
        fin = fin.mult(temp);

        this._at = fin.multMatrixPnt(this._at);

        // rotate around the side vector
        lv = this._at.subtract(this._from).normalize();
        sv = lv.cross(this._up).normalize();
        up = sv.cross(lv).normalize();
        //this._up = up;

        q = x3dom.fields.Quaternion.axisAngle(sv, theta);
        temp = q.toMatrix();

        fin = x3dom.fields.SFMatrix4f.translation(this._from);
        fin = fin.mult(temp);

        temp = x3dom.fields.SFMatrix4f.translation(this._from.negate());
        fin = fin.mult(temp);

        this._at = fin.multMatrixPnt(this._at);

        // forward along view vector
        if (navi._vf.type[0].toLowerCase().substr(0, 5) !== "looka")
        {
            var currProjMat = this.getProjectionMatrix();

            if (step < 0) {
                // backwards: negate viewing direction
                tmpMat = new x3dom.fields.SFMatrix4f();
                tmpMat.setValue(this._last_mat_view.e0(), this._last_mat_view.e1(), 
                                this._last_mat_view.e2().negate(), this._last_mat_view.e3());
                
                this._scene._nameSpace.doc.ctx.pickValue(this, this._width/2, this._height/2,
                            this._lastButton, tmpMat, currProjMat.mult(tmpMat));
            }
            else {
                this._scene._nameSpace.doc.ctx.pickValue(this, this._width/2, this._height/2, this._lastButton);
            }

            if (this._pickingInfo.pickObj)
            {
                dist = this._pickingInfo.pickPos.subtract(this._from).length();

                if (dist <= avatarRadius) {
                    step = 0;
                }
            }

            lv = this._at.subtract(this._from).normalize().multiply(step);

            this._at = this._at.add(lv);
            this._from = this._from.add(lv);

            // finally attach to ground when walking
            if (navi._vf.type[0].toLowerCase() === "walk")
            {
                tmpAt = this._from.addScaled(up, -1.0);
                tmpUp = sv.cross(up.negate()).normalize();  // lv

                tmpMat = x3dom.fields.SFMatrix4f.lookAt(this._from, tmpAt, tmpUp);
                tmpMat = tmpMat.inverse();

                this._scene._nameSpace.doc.ctx.pickValue(this, this._width/2, this._height/2,
                            this._lastButton, tmpMat, currProjMat.mult(tmpMat));

                if (this._pickingInfo.pickObj)
                {
                    dist = this._pickingInfo.pickPos.subtract(this._from).length();

                    this._at = this._at.add(up.multiply(avatarHeight - dist));
                    this._from = this._from.add(up.multiply(avatarHeight - dist));
                }
            }
            this._pickingInfo.pickObj = null;
        }
        
        this._flyMat = x3dom.fields.SFMatrix4f.lookAt(this._from, this._at, up);

        this._scene.getViewpoint().setView(this._flyMat.inverse());
    }

    return needNavAnim;
};

x3dom.Viewarea.prototype.moveFwd = function()
{
    var navi = this._scene.getNavigationInfo();

    if (navi._vf.type[0].toLowerCase() === "game")
    {
        var avatarRadius = 0.25;
        var avatarHeight = 1.6;

        if (navi._vf.avatarSize.length > 2) {
            avatarRadius = navi._vf.avatarSize[0];
            avatarHeight = navi._vf.avatarSize[1];
        }

        var speed = 5 * this._deltaT * navi._vf.speed;
        var yRotRad = (this._yaw / 180 * Math.PI);
        var xRotRad = (this._pitch / 180 * Math.PI);

        var dist = 0;
        var fMat = this._flyMat.inverse();

        // check front for collisions
        this._scene._nameSpace.doc.ctx.pickValue(this, this._width/2, this._height/2, this._lastButton);

        if (this._pickingInfo.pickObj)
        {
            dist = this._pickingInfo.pickPos.subtract(fMat.e3()).length();

            if (dist <= 2 * avatarRadius) {
                //x3dom.debug.logWarning("Collision at dist=" + dist.toFixed(4));
            }
            else {
                this._eyePos.x -= Math.sin(yRotRad) * speed;
                this._eyePos.z += Math.cos(yRotRad) * speed;
                this._eyePos.y += Math.sin(xRotRad) * speed;
            }
        }
    }
};

x3dom.Viewarea.prototype.moveBwd = function()
{
    var navi = this._scene.getNavigationInfo();

    if (navi._vf.type[0].toLowerCase() === "game")
    {
        var speed = 5 * this._deltaT * navi._vf.speed;
        var yRotRad = (this._yaw / 180 * Math.PI);
        var xRotRad = (this._pitch / 180 * Math.PI);

        this._eyePos.x += Math.sin(yRotRad) * speed;
        this._eyePos.z -= Math.cos(yRotRad) * speed;
        this._eyePos.y -= Math.sin(xRotRad) * speed;
    }
};

x3dom.Viewarea.prototype.strafeRight = function()
{
    var navi = this._scene.getNavigationInfo();

    if (navi._vf.type[0].toLowerCase() === "game")
    {
        var speed = 5 * this._deltaT * navi._vf.speed;
        var yRotRad = (this._yaw / 180 * Math.PI);

        this._eyePos.x -= Math.cos(yRotRad) * speed;
        this._eyePos.z -= Math.sin(yRotRad) * speed;
    }
};

x3dom.Viewarea.prototype.strafeLeft = function()
{
    var navi = this._scene.getNavigationInfo();

    if (navi._vf.type[0].toLowerCase() === "game")
    {
        var speed = 5 * this._deltaT * navi._vf.speed;
        var yRotRad = (this._yaw / 180 * Math.PI);

        this._eyePos.x += Math.cos(yRotRad) * speed;
        this._eyePos.z += Math.sin(yRotRad) * speed;
    }
};

x3dom.Viewarea.prototype.animateTo = function(target, prev, dur)
{
    var navi = this._scene.getNavigationInfo();

    if (x3dom.isa(target, x3dom.nodeTypes.X3DViewpointNode)) {
        target = target.getViewMatrix();
    }

    if (navi._vf.transitionType[0].toLowerCase() !== "teleport" && navi.getType() !== "game")
    {
        if (prev && x3dom.isa(prev, x3dom.nodeTypes.X3DViewpointNode)) {
            prev = this._relMat.inverse().
                     mult(prev.getViewMatrix().mult(prev.getCurrentTransform().inverse()));
            
            this._mixer._beginTime = this._lastTS;

            if (arguments.length >= 3) {
                 // for lookAt to assure travel speed of 1 m/s
                this._mixer._endTime = this._lastTS + dur;
            }
            else {
                this._mixer._endTime = this._lastTS + navi._vf.transitionTime;
            }

            this._mixer.setBeginMatrix (prev);
            this._mixer.setEndMatrix (target);
            
            this._scene.getViewpoint().setView(prev);
        }
        else {
            this._scene.getViewpoint().setView(target);
        }
    }
    else
    {
        this._scene.getViewpoint().setView(target);
    }
    this._relMat = x3dom.fields.SFMatrix4f.identity();
    this._needNavigationMatrixUpdate = true;
};

x3dom.Viewarea.prototype.getLights = function () {
    return this._doc._nodeBag.lights;
};

x3dom.Viewarea.prototype.getLightsShadow = function () {
	var lights = this._doc._nodeBag.lights;
	for(var l=0; l<lights.length; l++) {
		if(lights[l]._vf.shadowIntensity > 0.0){
            return true;
        }
	}
};

x3dom.Viewarea.prototype.updateSpecialNavigation = function (viewpoint, mat_viewpoint) {
    var navi = this._scene.getNavigationInfo();
    
    // helicopter mode needs to manipulate view matrix specially
    if (navi._vf.type[0].toLowerCase() == "helicopter" && !navi._heliUpdated)
    {
        var typeParams = navi.getTypeParams();
        var theta = typeParams[0];
        var currViewMat = viewpoint.getViewMatrix().mult(mat_viewpoint.inverse()).inverse();

        this._from = currViewMat.e3();
        this._at = this._from.subtract(currViewMat.e2());
        this._up = new x3dom.fields.SFVec3f(0, 1, 0);

        this._from.y = typeParams[1];
        this._at.y = this._from.y;

        var sv = currViewMat.e0();
        var q = x3dom.fields.Quaternion.axisAngle(sv, theta);
        var temp = q.toMatrix();

        var fin = x3dom.fields.SFMatrix4f.translation(this._from);
        fin = fin.mult(temp);

        temp = x3dom.fields.SFMatrix4f.translation(this._from.negate());
        fin = fin.mult(temp);

        this._at = fin.multMatrixPnt(this._at);

        this._flyMat = x3dom.fields.SFMatrix4f.lookAt(this._from, this._at, this._up);
        this._scene.getViewpoint().setView(this._flyMat.inverse());

        navi._heliUpdated = true;
    }
};

x3dom.Viewarea.prototype.getViewpointMatrix = function () {
    var viewpoint = this._scene.getViewpoint();
    var mat_viewpoint = viewpoint.getCurrentTransform();
    
    this.updateSpecialNavigation(viewpoint, mat_viewpoint);
    
    return viewpoint.getViewMatrix().mult(mat_viewpoint.inverse());
};

x3dom.Viewarea.prototype.getViewMatrix = function () {
    return this._relMat.inverse().
             mult(this.getViewpointMatrix());
};

x3dom.Viewarea.prototype.getLightMatrix = function ()
{
    var lights = this._doc._nodeBag.lights;
    var i, n = lights.length;

    if (n > 0)
    {
        var min = x3dom.fields.SFVec3f.MAX();
        var max = x3dom.fields.SFVec3f.MIN();
        var ok = this._scene.getVolume(min, max, false);    //TODO; FFF optimize

        if (ok)
        {
            var l_arr = [];
            var viewpoint = this._scene.getViewpoint();
            var fov = viewpoint.getFieldOfView();

            var dia = max.subtract(min);
            var dist1 = (dia.y/2.0) / Math.tan(fov/2.0) + (dia.z/2.0);
            var dist2 = (dia.x/2.0) / Math.tan(fov/2.0) + (dia.z/2.0);

            dia = min.add(dia.multiply(0.5));

            for (i=0; i<n; i++)
            {
                if (x3dom.isa(lights[i], x3dom.nodeTypes.PointLight)) {
                    var wcLoc = lights[i].getCurrentTransform().multMatrixPnt(lights[i]._vf.location);
                    dia = dia.subtract(wcLoc).normalize();
                }
                else {
                    var dir = lights[i].getCurrentTransform().multMatrixVec(lights[i]._vf.direction);
                    dir = dir.normalize().negate();
                    dia = dia.add(dir.multiply(1.2 * (dist1 > dist2 ? dist1 : dist2)));
                }

                l_arr[i] = lights[i].getViewMatrix(dia);
            }

            return l_arr;
        }
    }

    //TODO, this is only for testing
    return [ this.getViewMatrix() ];
};

x3dom.Viewarea.prototype.getWCtoLCMatrix = function(lMat)
{
    var proj = this.getProjectionMatrix();
    var view;

    if (arguments.length === 0) {
        view = this.getLightMatrix()[0];
    }
    else {
        view = lMat;
    }

    return proj.mult(view);
};

x3dom.Viewarea.prototype.getProjectionMatrix = function()
{
    var viewpoint = this._scene.getViewpoint();

    return viewpoint.getProjectionMatrix(this._width/this._height);
};

x3dom.Viewarea.prototype.getViewfrustum = function(clipMat)
{
    if (this._scene._vf.frustumCulling == true)
    {
        if (arguments.length == 0) {
            var proj = this.getProjectionMatrix();
            var view = this.getViewMatrix();
    
            return new x3dom.fields.FrustumVolume(proj.mult(view));
        }
        else {
            return new x3dom.fields.FrustumVolume(clipMat);
        }
    }
    else {
        return null;
    }
};

x3dom.Viewarea.prototype.getWCtoCCMatrix = function()
{
    var view = this.getViewMatrix();
    var proj = this.getProjectionMatrix();

    return proj.mult(view);
};

x3dom.Viewarea.prototype.getCCtoWCMatrix = function()
{
    var mat = this.getWCtoCCMatrix();

    return mat.inverse();
};

x3dom.Viewarea.prototype.calcViewRay = function(x, y)
{
    var cctowc = this.getCCtoWCMatrix();

    var rx = x / (this._width - 1.0) * 2.0 - 1.0;
    var ry = (this._height - 1.0 - y) / (this._height - 1.0) * 2.0 - 1.0;

    var from = cctowc.multFullMatrixPnt(new x3dom.fields.SFVec3f(rx, ry, -1));
    var at = cctowc.multFullMatrixPnt(new x3dom.fields.SFVec3f(rx, ry,  1));
    var dir = at.subtract(from);

    return new x3dom.fields.Line(from, dir);
};

x3dom.Viewarea.prototype.showAll = function(axis)
{
    var min = x3dom.fields.SFVec3f.MAX();
    var max = x3dom.fields.SFVec3f.MIN();
	
    var ok = this._scene.getVolume(min, max, true);
    	
    if (ok)
    {
        var x = "x", y = "y", z = "z";
        var sign = 1;
        var to, from = new x3dom.fields.SFVec3f(0, 0, -1);
        
        switch (axis) {
            case "posX":
            sign = -1;
            case "negX":
            z = "x"; x = "y"; y = "z";
            to = new x3dom.fields.SFVec3f(sign, 0, 0);
            break;
            case "posY":
            sign = -1;
            case "negY":
            z = "y"; x = "z"; y = "x";
            to = new x3dom.fields.SFVec3f(0, sign, 0);
            break;
            case "posZ":
            sign = -1;
            case "negZ":
            default:
            to = new x3dom.fields.SFVec3f(0, 0, -sign);
            break;
        }
        
        var quat = x3dom.fields.Quaternion.rotateFromTo(from, to);
        var viewmat = quat.toMatrix();
        
        var viewpoint = this._scene.getViewpoint();
        var fov = viewpoint.getFieldOfView();

        var dia = max.subtract(min);
        var dist1 = (dia[y]/2.0) / Math.tan(fov/2.0) - sign * (dia[z]/2.0);
        var dist2 = (dia[x]/2.0) / Math.tan(fov/2.0) - sign * (dia[z]/2.0);

        dia = min.add(dia.multiply(0.5));
        dia[z] += sign * (dist1 > dist2 ? dist1 : dist2) * 1.001;
        
        viewmat = viewmat.mult(x3dom.fields.SFMatrix4f.translation(dia.multiply(-1)));

        this.animateTo(viewmat, viewpoint);
    }
};

x3dom.Viewarea.prototype.resetView = function()
{
    var navi = this._scene.getNavigationInfo();

    if (navi._vf.transitionType[0].toLowerCase() !== "teleport" && navi.getType() !== "game")
    {
        // EXPERIMENTAL (TODO: parent trafo of vp)
        this._mixer._beginTime = this._lastTS;
        this._mixer._endTime = this._lastTS + navi._vf.transitionTime;

        this._mixer.setBeginMatrix(this.getViewMatrix());
        this._scene.getViewpoint().resetView();
        this._mixer.setEndMatrix(this._scene.getViewpoint().getViewMatrix());
    }
    else
    {
        this._scene.getViewpoint().resetView();
    }
    this._relMat = x3dom.fields.SFMatrix4f.identity();
    this._needNavigationMatrixUpdate = true;
    navi._heliUpdated = false;
};

x3dom.Viewarea.prototype.uprightView = function()
{
    var mat = this.getViewMatrix().inverse();

    var from = mat.e3();
    var at = from.subtract(mat.e2());
    var up = new x3dom.fields.SFVec3f(0, 1, 0);

    var s = mat.e2().cross(up).normalize();
    var v = s.cross(up).normalize();
    at = from.add(v);

    mat = x3dom.fields.SFMatrix4f.lookAt(from, at, up);
    mat = mat.inverse();

    this.animateTo(mat, this._scene.getViewpoint());
};

x3dom.Viewarea.prototype.callEvtHandler = function (node, eventType, event)
{
    if (!node || !node._xmlNode)
        return;
        
    event.target = node._xmlNode;
    var attrib = node._xmlNode[eventType];

    try {
        if (typeof(attrib) === "function") {
            attrib.call(node._xmlNode, event);
        }
        else {
            var funcStr = node._xmlNode.getAttribute(eventType);
            var func = new Function('event', funcStr);
            func.call(node._xmlNode, event);
        }

        var list = node._listeners[event.type];
        if (list) {
            for (var it=0; it<list.length; it++) {
                list[it].call(node._xmlNode, event);
            }
        }
    }
    catch(e) {
        x3dom.debug.logException(e);
    }

    return event.cancelBubble;
};

x3dom.Viewarea.prototype.checkEvents = function (obj, x, y, buttonState, eventType)
{
    var that = this;
    var needRecurse = true;

    var event = {
        target: {},
        type: eventType.substr(2, eventType.length-2),
        button: buttonState,
        layerX: x,
        layerY: y,
        worldX: that._pick.x,
        worldY: that._pick.y,
        worldZ: that._pick.z,
        normalX: that._pickNorm.x,
        normalY: that._pickNorm.y,
        normalZ: that._pickNorm.z,
        hitPnt: that._pick.toGL(), // for convenience
        hitObject: obj._xmlNode ? obj._xmlNode : null,
        cancelBubble: false,
        stopPropagation: function() { this.cancelBubble = true; },
		preventDefault: function() { this.cancelBubble = true; }
    };
    //x3dom.debug.logInfo(event.type + ", " + event.worldX.toFixed(2) + ", " +
    //    event.worldY.toFixed(2) + ", " + event.worldZ.toFixed(2) + ", " + event.button);

    try {
        var anObj = obj;
        
        if ( anObj && anObj._xmlNode && anObj._cf.geometry &&
             !anObj._xmlNode[eventType] &&
             !anObj._xmlNode.hasAttribute(eventType) &&
             !anObj._listeners[event.type]) {
            anObj = anObj._cf.geometry.node;
        }
        
        if (anObj && that.callEvtHandler(anObj, eventType, event) === true) {
            needRecurse = false;
        }
    }
    catch(e) {
        x3dom.debug.logException(e);
    }

    var recurse = function(obj) {
        Array.forEach(obj._parentNodes, function (node) {
            if ( node._xmlNode && (node._xmlNode[eventType] ||
                 node._xmlNode.hasAttribute(eventType) ||
                 node._listeners[event.type]) )
            {
                if (that.callEvtHandler(node, eventType, event) === true) {
                    needRecurse = false;
                }
            }
            if (x3dom.isa(node, x3dom.nodeTypes.Anchor) && eventType === 'onclick') {
                node.handleTouch();
                needRecurse = false;
            }
            else if (needRecurse) {
                recurse(node);
            }
        });
    };

    if (needRecurse) {
        recurse(obj);
    }
	
	return needRecurse;
};

x3dom.Viewarea.prototype.initMouseState = function()
{
    this._deltaT = 0;
    this._dx = 0;
    this._dy = 0;
    this._lastX = -1;
    this._lastY = -1;
    this._pressX = -1;
    this._pressY = -1;
    this._lastButton = 0;
    this._needNavigationMatrixUpdate = true;
}

x3dom.Viewarea.prototype.onMousePress = function (x, y, buttonState)
{
    this._needNavigationMatrixUpdate = true;

    this.prepareEvents(x, y, buttonState, "onmousedown");
    this._pickingInfo.lastClickObj = this._pickingInfo.pickObj;

    this._dx = 0;
    this._dy = 0;
    this._lastX = x;
    this._lastY = y;
    this._pressX = x;
    this._pressY = y;
    this._lastButton = buttonState;
};

x3dom.Viewarea.prototype.onMouseRelease = function (x, y, buttonState)
{
    var tDist = 3.0;  // distance modifier for lookat, could be param
    var dir;
    var navi = this._scene.getNavigationInfo();

    if (this._scene._vf.pickMode.toLowerCase() !== "box") {
        this.prepareEvents(x, y, buttonState, "onmouseup");

        // click means that mousedown _and_ mouseup were detected on same element
        if (this._pickingInfo.pickObj &&
            this._pickingInfo.pickObj === this._pickingInfo.lastClickObj) {
            this.prepareEvents(x, y, buttonState, "onclick");
        }
    }
    else {
        var t0 = new Date().getTime();
        var line = this.calcViewRay(x, y);
        var isect = this._scene.doIntersect(line);
        var obj = line.hitObject;

        if (isect && obj)
        {
            this._pick.setValues(line.hitPoint);

            this.checkEvents(obj, x, y, buttonState, "onclick");

            x3dom.debug.logInfo("Hit '" + obj._xmlNode.localName + "/ " +
                                obj._DEF + "' at dist=" + line.dist.toFixed(4));
            x3dom.debug.logInfo("Ray hit at position " + this._pick);
        }

        var t1 = new Date().getTime() - t0;
        x3dom.debug.logInfo("Picking time (box): " + t1 + "ms");

        if (!isect) {
            dir = this.getViewMatrix().e2().negate();
            var u = dir.dot(line.pos.negate()) / dir.dot(line.dir);
            this._pick = line.pos.add(line.dir.multiply(u));
            //x3dom.debug.logInfo("No hit at position " + this._pick);
        }
    }

    if (this._pickingInfo.pickObj && navi._vf.type[0].toLowerCase() === "lookat" &&
        this._pressX === x && this._pressY === y)
    {
        var step = (this._lastButton & 2) ? -1 : 1;
        var dist = this._pickingInfo.pickPos.subtract(this._from).length() / tDist;

        var laMat = new x3dom.fields.SFMatrix4f();
        laMat.setValues(this.getViewMatrix());
        laMat = laMat.inverse();

        var from = laMat.e3();
        var at = from.subtract(laMat.e2());
        var up = laMat.e1();

        dir = this._pickingInfo.pickPos.subtract(from);
        var len = dir.length();
        dir = dir.normalize();

        //var newUp = new x3dom.fields.SFVec3f(0, 1, 0);
        var newAt = from.addScaled(dir, len);

        var s = dir.cross(up).normalize();
        dir = s.cross(up).normalize();

        if (step < 0) {
            dist = (0.5 + len + dist) * 2;
        }
        var newFrom = newAt.addScaled(dir, dist);

        laMat = x3dom.fields.SFMatrix4f.lookAt(newFrom, newAt, up);
        laMat = laMat.inverse();

        dist = newFrom.subtract(from).length();
        var dur = Math.max(0.5, Math.log((1 + dist) / navi._vf.speed));

        this.animateTo(laMat, this._scene.getViewpoint(), dur);
    }

    this._dx = 0;
    this._dy = 0;
    this._lastX = x;
    this._lastY = y;
    this._lastButton = buttonState;
};

x3dom.Viewarea.prototype.onMouseOver = function (x, y, buttonState)
{
    this._dx = 0;
    this._dy = 0;
    this._lastButton = 0;
    this._lastX = x;
    this._lastY = y;
    this._deltaT = 0;
};

x3dom.Viewarea.prototype.onMouseOut = function (x, y, buttonState)
{
    this._dx = 0;
    this._dy = 0;
    this._lastButton = 0;
    this._lastX = x;
    this._lastY = y;
    this._deltaT = 0;
};

x3dom.Viewarea.prototype.onDoubleClick = function (x, y)
{
    if (this._doc.properties.getProperty('disableDoubleClick', 'false') === 'true') {
        return;
    }
    
    var navi = this._scene.getNavigationInfo();
    if (navi._vf.type[0].length <= 1 || navi._vf.type[0].toLowerCase() == "none") {
        return;
    }

    if ((this._scene._vf.pickMode.toLowerCase() === "color" ||
         this._scene._vf.pickMode.toLowerCase() === "texcoord")) {
         return;
    }

    var viewpoint = this._scene.getViewpoint();

    viewpoint._vf.centerOfRotation.setValues(this._pick);
    x3dom.debug.logInfo("New center of Rotation:  " + this._pick);

    var mat = this.getViewMatrix().inverse();

    var from = mat.e3();
    var at = this._pick;
    var up = mat.e1();

    var norm = mat.e0().cross(up).normalize();
    // get distance between look-at point and viewing plane
    var dist = norm.dot(this._pick.subtract(from));
    
    from = at.addScaled(norm, -dist);
    mat = x3dom.fields.SFMatrix4f.lookAt(from, at, up);
    
    x3dom.debug.logInfo("New camera position:  " + from);
    this.animateTo(mat.inverse(), viewpoint);
};

x3dom.Viewarea.prototype.handleMoveEvt = function (x, y, buttonState)
{
    this.prepareEvents(x, y, buttonState, "onmousemove");

    if (this._pickingInfo.pickObj !== this._pickingInfo.lastObj)
    {
        if (this._pickingInfo.lastObj) {
            var obj = this._pickingInfo.pickObj;
            this._pickingInfo.pickObj = this._pickingInfo.lastObj;

            // call event for lastObj
            this.prepareEvents(x, y, buttonState, "onmouseout");
            this._pickingInfo.pickObj = obj;
        }

        if (this._pickingInfo.pickObj) {
            // call event for pickObj
            this.prepareEvents(x, y, buttonState, "onmouseover");
        }

        this._pickingInfo.lastObj = this._pickingInfo.pickObj;
    }
};

x3dom.Viewarea.prototype.onMove = function (x, y, buttonState)
{
    this.handleMoveEvt(x, y, buttonState);

    if (this._lastX < 0 || this._lastY < 0) {
        this._lastX = x;
        this._lastY = y;
    }
    this._dx = x - this._lastX;
    this._dy = y - this._lastY;
    this._lastX = x;
    this._lastY = y;
};

x3dom.Viewarea.prototype.onMoveView = function (translation, rotation)
{
	var navi = this._scene.getNavigationInfo();
	var viewpoint = this._scene.getViewpoint();

	if (navi._vf.type[0].toLowerCase() === "examine")
	{
		if (translation)
		{
			var distance = 10;
			
			if (this._scene._lastMin && this._scene._lastMax)
			{
				distance = (this._scene._lastMax.subtract(this._scene._lastMin)).length();
				distance = (distance < x3dom.fields.Eps) ? 1 : distance;
			}
			
			translation = translation.multiply(distance);
			this._relMat = this_relMat.mult(x3dom.fields.SFMatrix4f.translation(translation));
				
		}
		
		if (rotation)
        {            
            var center = viewpoint.getCenterOfRotation();           
            this._relMat = this._relMat.
                mult(x3dom.fields.SFMatrix4f.translation(center)).                
                mult(rotation).
                mult(x3dom.fields.SFMatrix4f.translation(center.negate()));
		}
	}
};

x3dom.Viewarea.prototype.onDrag = function (x, y, buttonState)
{
    // should onmouseover/-out be handled on drag?
    this.handleMoveEvt(x, y, buttonState);

    var navi = this._scene.getNavigationInfo();
    if (navi._vf.type[0].length <= 1 || navi._vf.type[0].toLowerCase() === "none") {
        return;
    }

    var dx = x - this._lastX;
    var dy = y - this._lastY;
    var min, max, ok, d, vec;

    if (navi._vf.type[0].toLowerCase() === "examine")
    {
        if (buttonState & 1) //left
        {
	  this.orbitH(dx);
	  this.orbitV(dy);
        }
        if (buttonState & 4) //middle
        {
			if (this._scene._lastMin && this._scene._lastMax)
			{
				d = (this._scene._lastMax.subtract(this._scene._lastMin)).length();
			}
			else
			{
				min = x3dom.fields.SFVec3f.MAX();
				max = x3dom.fields.SFVec3f.MIN();
				
				ok = this._scene.getVolume(min, max, true);
				if (ok) {
                    this._scene._lastMin = min;
                    this._scene._lastMax = max;
                }
				
				d = ok ? (max.subtract(min)).length() : 10;
			}
			d = ((d < x3dom.fields.Eps) ? 1 : d) * navi._vf.speed;

            vec = new x3dom.fields.SFVec3f(d*dx/this._width, d*(-dy)/this._height, 0);
            this.pan(vec);
        }
        if (buttonState & 2) //right
        {
			if (this._scene._lastMin && this._scene._lastMax)
			{
				d = (this._scene._lastMax.subtract(this._scene._lastMin)).length();
			}
			else
			{
				min = x3dom.fields.SFVec3f.MAX();
				max = x3dom.fields.SFVec3f.MIN();
				
				ok = this._scene.getVolume(min, max, true);
				if (ok) {
                    this._scene._lastMin = min;
                    this._scene._lastMax = max;
                }
				
				d = ok ? (max.subtract(min)).length() : 10;
			}
			d = ((d < x3dom.fields.Eps) ? 1 : d) * navi._vf.speed;

            vec = new x3dom.fields.SFVec3f(0, 0, d*(dx+dy)/this._height);
            this.zoom(vec);
        }
    }

    this._dx = dx;
    this._dy = dy;

    this._lastX = x;
    this._lastY = y;
};

x3dom.Viewarea.prototype.prepareEvents = function (x, y, buttonState, eventType)
{
    var avoidTraversal = (this._scene._vf.pickMode.toLowerCase().indexOf("idbuf") == 0 ||
                          this._scene._vf.pickMode.toLowerCase() === "color" ||
                          this._scene._vf.pickMode.toLowerCase() === "texcoord");

    if (avoidTraversal) {
        var obj = this._pickingInfo.pickObj;

        if (obj) {
            this._pick.setValues(this._pickingInfo.pickPos);
            this._pickNorm.setValues(this._pickingInfo.pickNorm);

            this.checkEvents(obj, x, y, buttonState, eventType);

            if (eventType === "onclick") {  // debug
                if (obj._xmlNode)
                    x3dom.debug.logInfo("Hit \"" + obj._xmlNode.localName + "/ " + obj._DEF + "\"");
                x3dom.debug.logInfo("Ray hit at position " + this._pick);
            }
        }
    }
};


x3dom.Viewarea.prototype.rotateH = function(right)
{
  this._relMat = this._relMat.mult(x3dom.fields.SFMatrix4f.parseRotation("0, 1, 0," + ((right) ? "-0.05" : "0.05")));
}

x3dom.Viewarea.prototype.rotateV = function(down)
{
  this._relMat = this._relMat.mult(x3dom.fields.SFMatrix4f.parseRotation("1, 0, 0," + ((down) ? "-0.05" : "0.05")));			      
}

x3dom.Viewarea.prototype.pan = function(vec)
{
  this._relMat = this._relMat.
                     mult(x3dom.fields.SFMatrix4f.translation(vec));      
}

x3dom.Viewarea.prototype.zoom = function(vec)
{
  this._relMat = this._relMat.
		     mult(x3dom.fields.SFMatrix4f.translation(vec));
}

x3dom.Viewarea.prototype.orbitH = function(dx)
{
  var beta = - (dx * 2 * Math.PI) / this._height;
  var mat = this.getViewMatrix().inverse();

  var pos = mat.e3();
  var at = pos.subtract(mat.e2());
  var up = mat.e1();

  var viewpoint = this._scene.getViewpoint();
  var center = viewpoint.getCenterOfRotation();
  var radius = center.subtract(pos);

  var m = new x3dom.fields.SFMatrix4f.translation(radius);

  m = m.mult(x3dom.fields.SFMatrix4f.parseRotation(up.x + ", " + up.y + ", " + up.z + ", " + beta));
  m = m.mult(x3dom.fields.SFMatrix4f.translation(radius.negate()));

  pos = center.subtract(m.multMatrixVec(radius));
  at = m.multMatrixVec(at);
  up = m.multMatrixVec(up);

  m = x3dom.fields.SFMatrix4f.lookAt(pos, at, up);  
  this._relMat = this.getViewpointMatrix().mult(m);
}

x3dom.Viewarea.prototype.orbitV = function(dy)
{
  var alpha = (dy * 2 * Math.PI) / this._width;

  var mat = this.getViewMatrix().inverse();
  var pos = mat.e3();
  var at = pos.subtract(mat.e2());
  var up = mat.e1();

  var viewpoint = this._scene.getViewpoint();
  var center = viewpoint.getCenterOfRotation();
  var radius = center.subtract(pos);

  var m = new x3dom.fields.SFMatrix4f.translation(radius);
  var rotVec = at.cross(up);
  m = m.mult(x3dom.fields.SFMatrix4f.parseRotation(rotVec.x + ", " + rotVec.y + ", " + rotVec.z + ", " + alpha));
  m = m.mult(x3dom.fields.SFMatrix4f.translation(radius.negate()));

  pos = center.subtract(m.multMatrixVec(radius));
  at = m.multMatrixVec(at);
  up = m.multMatrixVec(up);

  m = x3dom.fields.SFMatrix4f.lookAt(pos, at, up);  
  this._relMat = this.getViewpointMatrix().mult(m);
}
