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

// ### Viewarea ###
x3dom.Viewarea = function (document, scene) {
    this._doc = document; // x3ddocument
    this._scene = scene; // FIXME: updates ?!

    document._nodeBag.viewarea.push(this);

    this._pickingInfo = {
        pickPos: {},
        pickObj: null,
        lastObj: null,
        lastClickObj: null
    };

    this._rotMat = x3dom.fields.SFMatrix4f.identity();
    this._transMat = x3dom.fields.SFMatrix4f.identity();
    this._movement = new x3dom.fields.SFVec3f(0, 0, 0);

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
    this._pick = new x3dom.fields.SFVec3f(0, 0, 0);

    this._lastTS = 0;
    this._mixer = new x3dom.MatrixMixer();

	//Geometry cache for primitives (Sphere, Box, etc.)
	this._geoCache = [];
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
            this._scene.getViewpoint().setView(this._mixer._beginMat);
        }
    }

    var needNavAnim = this.navigateTo(timeStamp);

    this._lastTS = timeStamp;

    return (needMixAnim || needNavAnim);
};

x3dom.Viewarea.prototype.navigateTo = function(timeStamp)
{
    var navi = this._scene.getNavigationInfo();
    var needNavAnim = ( navi._vf.type[0].toLowerCase() === "game" ||
                        (this._lastButton > 0 &&
                        (navi._vf.type[0].toLowerCase() === "fly" ||
                         navi._vf.type[0].toLowerCase() === "walk" ||
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
            
            // reset examine matrices to identity
            this._rotMat = x3dom.fields.SFMatrix4f.identity();
            this._transMat = x3dom.fields.SFMatrix4f.identity();
            this._movement = new x3dom.fields.SFVec3f(0, 0, 0);

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
            //this._up = this._flyMat.e1();
            this._up = new x3dom.fields.SFVec3f(0, 1, 0);

            this._pitch = angleX * 180 / Math.PI;
            this._yaw = angleY * 180 / Math.PI;
            this._eyePos = this._from.negate();
        }

        var tmpAt = null, tmpUp = null, tmpMat = null;

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
                        tmpMat, this.getProjectionMatrix().mult(tmpMat));

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
        }

        // rotate around the up vector
        var q = x3dom.fields.Quaternion.axisAngle(this._up, phi);
        var temp = q.toMatrix();

        var fin = x3dom.fields.SFMatrix4f.translation(this._from);
        fin = fin.mult(temp);

        temp = x3dom.fields.SFMatrix4f.translation(this._from.negate());
        fin = fin.mult(temp);

        this._at = fin.multMatrixPnt(this._at);

        // rotate around the side vector
        var lv = this._at.subtract(this._from).normalize();
        var sv = lv.cross(this._up).normalize();
        var up = sv.cross(lv).normalize();
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
            this._scene._nameSpace.doc.ctx.pickValue(this, this._width/2, this._height/2);

            if (this._pickingInfo.pickObj)
            {
                dist = this._pickingInfo.pickPos.subtract(this._from).length();

                if (step > 0 && dist <= avatarRadius) {
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
                            tmpMat, this.getProjectionMatrix().mult(tmpMat));

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
        this._scene._nameSpace.doc.ctx.pickValue(this, this._width/2, this._height/2);

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

    if (x3dom.isa(target, x3dom.nodeTypes.Viewpoint)) {
        target = target.getViewMatrix();
    }

    if (navi._vf.transitionType[0].toLowerCase() !== "teleport" && navi.getType() !== "game")
    {
        if (prev && x3dom.isa(prev, x3dom.nodeTypes.Viewpoint)) {
            prev = prev.getCurrentTransform().mult(prev.getViewMatrix()).
                         mult(this._transMat).mult(this._rotMat);
        }
        else {
            //prev = x3dom.fields.SFMatrix4f.identity();
            return;
        }

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
    }
    else
    {
        this._scene.getViewpoint().setView(target);
    }

    this._rotMat = x3dom.fields.SFMatrix4f.identity();
    this._transMat = x3dom.fields.SFMatrix4f.identity();
    this._movement = new x3dom.fields.SFVec3f(0, 0, 0);
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

x3dom.Viewarea.prototype.getViewpointMatrix = function () {
    var viewpoint = this._scene.getViewpoint();
    var mat_viewpoint = viewpoint.getCurrentTransform();

    //return mat_viewpoint.mult(viewpoint.getViewMatrix());
    return viewpoint.getViewMatrix().mult(mat_viewpoint.inverse());
};

x3dom.Viewarea.prototype.getViewMatrix = function () {
    return this.getViewpointMatrix().
            mult(this._transMat).
            mult(this._rotMat);
};

x3dom.Viewarea.prototype.getLightMatrix = function ()
{
    var lights = this._doc._nodeBag.lights;
    var i, n = lights.length;

    if (n > 0)
    {
        var min = x3dom.fields.SFVec3f.MAX();
        var max = x3dom.fields.SFVec3f.MIN();
        var ok = this._scene.getVolume(min, max, true);    //TODO; FFF optimize

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
                //FIXME; lights might be influenced by parent transformation
                if (x3dom.isa(lights[i], x3dom.nodeTypes.PointLight)) {
                    dia = dia.subtract(lights[i]._vf.location).normalize();
                }
                else {
                    var dir = lights[i]._vf.direction.normalize().negate();
                    dia = dia.add(dir.multiply(1.2*(dist1 > dist2 ? dist1 : dist2)));
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

x3dom.Viewarea.prototype.showAll = function()
{
    var min = x3dom.fields.SFVec3f.MAX();
    var max = x3dom.fields.SFVec3f.MIN();
	
    var ok = this._scene.getVolume(min, max, true);
	
    if (ok)
    {
        var viewpoint = this._scene.getViewpoint();
        var fov = viewpoint.getFieldOfView();

        var dia = max.subtract(min);
        var dist1 = (dia.y/2.0) / Math.tan(fov/2.0) + (dia.z/2.0);
        var dist2 = (dia.x/2.0) / Math.tan(fov/2.0) + (dia.z/2.0);

        dia = min.add(dia.multiply(0.5));
        dia.z += (dist1 > dist2 ? dist1 : dist2);

        this.animateTo(x3dom.fields.SFMatrix4f.translation(dia.multiply(-1)), viewpoint);
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

    this._rotMat = x3dom.fields.SFMatrix4f.identity();
    this._transMat = x3dom.fields.SFMatrix4f.identity();
    this._movement = new x3dom.fields.SFVec3f(0, 0, 0);
    this._needNavigationMatrixUpdate = true;
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
    catch(ex) {
        x3dom.debug.logException(ex);
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
        hitPnt: that._pick.toGL(), // for convenience
        hitObject: obj._xmlNode ? obj._xmlNode : null,
        cancelBubble: false,
        stopPropagation: function() { this.cancelBubble = true; }
    };
    //x3dom.debug.logInfo(event.type + ", " + event.worldX.toFixed(2) + ", " +
    //    event.worldY.toFixed(2) + ", " + event.worldZ.toFixed(2) + ", " + event.button);

    try {
        var anObj = obj;

        if ( !anObj._xmlNode[eventType] &&
             !anObj._xmlNode.hasAttribute(eventType) &&
             !anObj._listeners[event.type]) {
            anObj = anObj._cf.geometry.node;
        }

        if (that.callEvtHandler(anObj, eventType, event) === true) {
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

        var newUp = new x3dom.fields.SFVec3f(0, 1, 0);
        var newAt = from.addScaled(dir, len);

        var s = dir.cross(newUp).normalize();
        dir = s.cross(newUp).normalize();

        if (step < 0) {
            dist = (0.5 + len + dist) * 2;
        }
        var newFrom = newAt.addScaled(dir, dist);

        laMat = x3dom.fields.SFMatrix4f.lookAt(newFrom, newAt, newUp);
        laMat = laMat.inverse();

        dist = newFrom.subtract(from).length();
        var dur = Math.log(dist / navi._vf.speed);

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
			
			if (this._scene._lastMin !== undefined && this._scene._lastMax !== undefined)
			{
				distance = (this._scene._lastMax.subtract(this._scene._lastMin)).length();
				distance = (distance < x3dom.fields.Eps) ? 1 : distance;
			}
			
			translation = translation.multiply(distance);
			this._movement = this._movement.add(translation);
			
			this._transMat = viewpoint.getViewMatrix().inverse().
				mult(x3dom.fields.SFMatrix4f.translation(this._movement)).
				mult(viewpoint.getViewMatrix());
		}
		
		if (rotation) {
			this._rotMat = rotation.mult(this._rotMat);
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
    var viewpoint = this._scene.getViewpoint();

    if (navi._vf.type[0].toLowerCase() === "examine")
    {
        if (buttonState & 1) //left
        {
            var alpha = (dy * 2 * Math.PI) / this._width;
            var beta = (dx * 2 * Math.PI) / this._height;
            var mat = this.getViewMatrix();

            var mx = x3dom.fields.SFMatrix4f.rotationX(alpha);
            var my = x3dom.fields.SFMatrix4f.rotationY(beta);

            var center = viewpoint.getCenterOfRotation();
            mat.setTranslate(new x3dom.fields.SFVec3f(0,0,0));

            this._rotMat = this._rotMat.
                mult(x3dom.fields.SFMatrix4f.translation(center)).
                mult(mat.inverse()).
                mult(mx).mult(my).
                mult(mat).
                mult(x3dom.fields.SFMatrix4f.translation(center.negate()));
        }
        if (buttonState & 4) //middle
        {
			if (this._scene._lastMin !== undefined && this._scene._lastMax !== undefined)
			{
				d = (this._scene._lastMax.subtract(this._scene._lastMin)).length();
				d = (d < x3dom.fields.Eps) ? 1 : d;
			}
			else
			{
				min = x3dom.fields.SFVec3f.MAX();
				max = x3dom.fields.SFVec3f.MIN();
				ok = this._scene.getVolume(min, max, true);
				
				d = ok ? (max.subtract(min)).length() : 10;
				d = (d < x3dom.fields.Eps) ? 1 : d;
			}
            //x3dom.debug.logInfo("PAN: " + min + " / " + max + " D=" + d);
            //x3dom.debug.logInfo("w="+this._width+", h="+this._height);

            vec = new x3dom.fields.SFVec3f(d*dx/this._width,d*(-dy)/this._height,0);
            this._movement = this._movement.add(vec);

            //TODO; move real distance along viewing plane
            this._transMat = viewpoint.getViewMatrix().inverse().
                mult(x3dom.fields.SFMatrix4f.translation(this._movement)).
                mult(viewpoint.getViewMatrix());
        }
        if (buttonState & 2) //right
        {
			if (this._scene._lastMin !== undefined && this._scene._lastMax !== undefined)
			{
				d = (this._scene._lastMax.subtract(this._scene._lastMin)).length();
				d = (d < x3dom.fields.Eps) ? 1 : d;
			}
			else
			{
				min = x3dom.fields.SFVec3f.MAX();
				max = x3dom.fields.SFVec3f.MIN();
				ok = this._scene.getVolume(min, max, true);
				
				d = ok ? (max.subtract(min)).length() : 10;
				d = (d < x3dom.fields.Eps) ? 1 : d;
			}
            //x3dom.debug.logInfo("ZOOM: " + min + " / " + max + " D=" + d);
            //x3dom.debug.logInfo((dx+dy)+" w="+this._width+", h="+this._height);

            vec = new x3dom.fields.SFVec3f(0,0,d*(dx+dy)/this._height);
            this._movement = this._movement.add(vec);

            //TODO; move real distance along viewing ray
            this._transMat = viewpoint.getViewMatrix().inverse().
                mult(x3dom.fields.SFMatrix4f.translation(this._movement)).
                mult(viewpoint.getViewMatrix());
        }
    }

    this._dx = dx;
    this._dy = dy;

    this._lastX = x;
    this._lastY = y;
};


x3dom.Viewarea.prototype.prepareEvents = function (x, y, buttonState, eventType)
{
    var avoidTraversal = (this._scene._vf.pickMode.toLowerCase() === "idbuf" ||
                          this._scene._vf.pickMode.toLowerCase() === "color" ||
                          this._scene._vf.pickMode.toLowerCase() === "texcoord");

    if (avoidTraversal) {
        var obj = this._pickingInfo.pickObj;

        if (obj) {
            this._pick.setValues(this._pickingInfo.pickPos);

            this.checkEvents(obj, x, y, buttonState, eventType);

            if (eventType === "onclick") {  // debug
                x3dom.debug.logInfo("Hit \"" + obj._xmlNode.localName + "/ " + obj._DEF + "\"");
                x3dom.debug.logInfo("Ray hit at position " + this._pick);
            }
        }
    }
};
