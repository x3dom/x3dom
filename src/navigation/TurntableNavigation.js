
x3dom.TurntableNavigation = function(navigationNode)
{
    x3dom.DefaultNavigation.call(this, navigationNode);
};

x3dom.TurntableNavigation.prototype = Object.create(x3dom.DefaultNavigation.prototype);
x3dom.TurntableNavigation.prototype.constructor = x3dom.TurntableNavigation;

x3dom.TurntableNavigation.prototype.onDrag = function(view, x, y, buttonState)
{ 
    navi = this.navi; 
    
    if (!view._flyMat)
        this.initTurnTable(view, false);
    
    var navType = navi.getType();       
    var navRestrict = navi.getExplorationMode();

    if (navType === "none" || navRestrict == 0) {
        return;
    }    

    var dx = x - view._lastX;
    var dy = y - view._lastY;
    
    var d, vec, cor, mat = null;
    var alpha, beta;

    buttonState = (!navRestrict || (navRestrict != 7 && buttonState == 1)) ? navRestrict : buttonState;
    
    if (buttonState & 1) //left
    {
        alpha = (dy * 2 * Math.PI) / view._height;
        beta = (dx * 2 * Math.PI) / view._width;
        
        this.rotate(view, alpha, beta);
    }
    else if (buttonState & 2) //right
    {
        d = (view._scene._lastMax.subtract(view._scene._lastMin)).length();
        d = ((d < x3dom.fields.Eps) ? 1 : d) * navi._vf.speed;

        var zoomAmount = d * (dx + dy) / view._height;

        this.zoom(view, zoomAmount);        
    }
    else if (buttonState & 4) //middle
    {
        
        d = (view._scene._lastMax.subtract(view._scene._lastMin)).length();
        d = ((d < x3dom.fields.Eps) ? 1 : d) * navi._vf.speed * 0.75;

        var tx = -d * dx / view._width;
        var ty =  d * dy / view._height;

        this.pan(view, tx, ty);
    }

    view._isMoving = true;
    
    view._dx = dx;
    view._dy = dy;

    view._lastX = x;
    view._lastY = y;
}

x3dom.TurntableNavigation.prototype.pan = function(view, tx, ty)
{
    var target = document.getElementById(navi._vf.target);        
    var bbox  = target._x3domNode.getVolume();
    
    var viewpoint = view._scene.getViewpoint();
    
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
};

x3dom.TurntableNavigation.prototype.rotate = function(view, alpha, beta)
{
    var viewpoint = view._scene.getViewpoint();
    
    view._flyMat = this.calcOrbit(view, alpha, beta);
    viewpoint.setView(view._flyMat.inverse());
};

x3dom.TurntableNavigation.prototype.zoom = function(view, zoomAmount)
{
    var navi = this.navi;
    var viewpoint = view._scene.getViewpoint();
    
    view._up   = view._flyMat.e1();
    view._from = view._flyMat.e3(); // eye

    // zoom in/out
    cor = view._at;

    var lastDir  = cor.subtract(view._from);
    var lastDirL = lastDir.length();
    lastDir = lastDir.normalize();
    
    // maintain minimum distance (value given in typeParams[4]) to prevent orientation flips
    var newDist = Math.min(zoomAmount, lastDirL - navi._vf.typeParams[4]);
    newDist = Math.max(newDist, lastDirL - navi._vf.typeParams[5]);
    
    // move along viewing ray, scaled with zoom factor
    view._from = view._from.addScaled(lastDir, newDist);

    // move along viewing ray, scaled with zoom factor
    //view._from = view._from.addScaled(lastDir, zoomAmount);

    // update camera matrix with lookAt() and invert again
    view._flyMat = x3dom.fields.SFMatrix4f.lookAt(view._from, cor, view._up);
    viewpoint.setView(view._flyMat.inverse());
};

x3dom.TurntableNavigation.prototype.calcOrbit = function (view, alpha, beta)
{
    navi = this.navi;
    
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
    theta = Math.max(navi._vf.typeParams[2], Math.min(navi._vf.typeParams[3], theta));
    phi = Math.max(navi._vf.typeParams[6], Math.min(navi._vf.typeParams[7], phi));

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

x3dom.TurntableNavigation.prototype.initTurnTable = function(view, flyTo)
{
    var navi = this.navi;
    
    flyTo = (flyTo == undefined) ? true : flyTo;

    var currViewMat = view.getViewMatrix();

    var viewpoint = view._scene.getViewpoint();
    var center = x3dom.fields.SFVec3f.copy(viewpoint.getCenterOfRotation());

    view._flyMat = currViewMat.inverse();

    view._from = viewpoint._vf.position;
    view._at = center;
    view._up = new x3dom.fields.SFVec3f(0,1,0);

    view._flyMat = x3dom.fields.SFMatrix4f.lookAt(view._from, view._at, view._up);
    view._flyMat = this.calcOrbit(view, 0, 0);

    var dur = 0.0;

    if (flyTo) {
        dur = 0.2 / navi._vf.speed;   // fly to pivot point
    }

    view.animateTo(view._flyMat.inverse(), viewpoint, dur);
    view.resetNavHelpers();
};

x3dom.TurntableNavigation.prototype.onMousePress = function(view,x, y, buttonState)
{
    if (!view._flyMat)
        this.initTurnTable(view, false);
};

x3dom.TurntableNavigation.prototype.init = function(view, flyTo)
{
    this.initTurnTable(view, false);
};

x3dom.TurntableNavigation.prototype.resetView = function(view)
{
    view._mixer._beginTime = view._lastTS;
    view._mixer._endTime = view._lastTS + this.navi._vf.transitionTime;

    view._mixer.setBeginMatrix(view.getViewMatrix());

    var target = view._scene.getViewpoint();
    target.resetView();
    
    target = x3dom.fields.SFMatrix4f.lookAt(target._vf.position, target.getCenterOfRotation(), new x3dom.fields.SFVec3f(0,1,0));

    view._mixer.setEndMatrix(target.inverse());
    
    this.updateFlyMat(view);
}

x3dom.TurntableNavigation.prototype.updateFlyMat = function(view, nextViewpoint)
{
    if (!view._flyMat)
        this.initTurnTable(view, false);
    
    var currViewMat = view.getViewMatrix();
    
    var viewpoint = nextViewpoint;
    if(viewpoint == null || !x3dom.isa(viewpoint,x3dom.nodeTypes.X3DViewpointNode))
        viewpoint = view._scene.getViewpoint();
    var center = x3dom.fields.SFVec3f.copy(viewpoint.getCenterOfRotation());

    view._flyMat = currViewMat.inverse();

    view._from = viewpoint._vf.position;
    view._at = center;
    view._up = new x3dom.fields.SFVec3f(0,1,0);
    
    view._flyMat = x3dom.fields.SFMatrix4f.lookAt(view._from, view._at, view._up);    
}

x3dom.TurntableNavigation.prototype.animateTo = function(view, target, prev, dur)
{
    var navi = this.navi;
    
    if (x3dom.isa(target, x3dom.nodeTypes.X3DViewpointNode)) {
        targetMat = x3dom.fields.SFMatrix4f.lookAt(target._vf.position, target.getCenterOfRotation(), new x3dom.fields.SFVec3f(0,1,0));        
    }

    if (navi._vf.transitionType[0].toLowerCase() !== "teleport" && dur != 0 && navi.getType() !== "game")
    {
        if (prev && x3dom.isa(prev, x3dom.nodeTypes.X3DViewpointNode)) {
            prev = prev.getViewMatrix().mult(prev.getCurrentTransform().inverse()).
                         mult(view._transMat).mult(view._rotMat);

            view._mixer._beginTime = view._lastTS;

            if (arguments.length >= 4 && arguments[3] != null) {
                // for lookAt to assure travel speed of 1 m/s
                view._mixer._endTime = view._lastTS + dur;
            }
            else {
                view._mixer._endTime = view._lastTS + navi._vf.transitionTime;
            }

            view._mixer.setBeginMatrix (prev);
            view._mixer.setEndMatrix (targetMat.inverse());
            
            view._scene.getViewpoint().setView(prev);
        }
        else {
            view._scene.getViewpoint().setView(targetMat.inverse());
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
    
    this.updateFlyMat(view, target);
}

x3dom.DefaultNavigation.prototype.onTouchStart = function(view, evt, touches)
{
    console.log("touchStart "+evt.touches.length);
    console.log(evt);
    
    view._numTouches = evt.touches.length;
    
    view._lastX = evt.touches[0].screenX;
    view._lastY = evt.touches[0].screenY;
};

x3dom.TurntableNavigation.prototype.onTouchDrag = function(view, evt, touches, translation, rotation)
{
    if (view._currentInputType == x3dom.InputTypes.NAVIGATION)
    {
        if(evt.touches.length == 1)
        {
            var dx = (evt.touches[0].screenX - view._lastX);
            var dy = (evt.touches[0].screenY - view._lastY);
            
            var alpha = (dy * 2 * Math.PI) / view._height;
            var beta = (dx * 2 * Math.PI) / view._width;
        
            this.rotate(view, alpha, beta);
        
            view._lastX = evt.touches[0].screenX;
            view._lastY = evt.touches[0].screenY;            
        }
        else if(evt.touches.length >= 2)
        {
            this.pan(view, -translation.x * 4.0, -translation.y * 4.0);
            
            this.zoom(view, translation.z * 4.0);
        }
    }
};

x3dom.DefaultNavigation.prototype.onTouchEnd = function(view, evt, touches)
{
    console.log("touchEnd "+evt.touches.length);
    console.log(evt);

    if (view._numTouches == 2 && evt.touches.length == 1){
        view._lastX = evt.touches[0].screenX;
        view._lastY = evt.touches[0].screenY;
    }
    
    view._numTouches = evt.touches.length;
};