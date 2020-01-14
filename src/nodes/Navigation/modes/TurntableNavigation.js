
x3dom.TurntableNavigation = function ( navigationNode )
{
    x3dom.DefaultNavigation.call( this, navigationNode );

    this.panAxisX = null;
    this.panAxisY = null;

    this.panEnabled = true;
};

x3dom.TurntableNavigation.prototype = Object.create( x3dom.DefaultNavigation.prototype );
x3dom.TurntableNavigation.prototype.constructor = x3dom.TurntableNavigation;

x3dom.TurntableNavigation.prototype.onDrag = function ( view, x, y, buttonState )
{
    var navi = this.navi;

    if ( !view._flyMat )
    {this.initTurnTable( view, false );}

    var navType = navi.getType();
    var navRestrict = navi.getExplorationMode();

    if ( navType === "none" || navRestrict == 0 )
    {
        return;
    }

    var dx = x - view._lastX;
    var dy = y - view._lastY;

    var d = null;
    var alpha,
        beta;

    //buttonState = ( !navRestrict || ( navRestrict != 7 && buttonState == 1 ) ) ? navRestrict : buttonState;
    buttonState = buttonState & navRestrict;

    if ( buttonState & 1 ) //left
    {
        alpha = ( dy * 2 * Math.PI ) / view._height;
        beta = ( dx * 2 * Math.PI ) / view._width;

        this.rotate( view, alpha, beta );
    }
    else if ( buttonState & 2 ) //right
    {
        d = ( view._scene._lastMax.subtract( view._scene._lastMin ) ).length();
        d = ( ( d < x3dom.fields.Eps ) ? 1 : d ) * navi._vf.speed;

        var zoomAmount = d * ( dx + dy ) / view._height;

        this.zoom( view, zoomAmount );
    }
    else if ( ( buttonState & 4 ) && this.panEnabled == true ) //middle
    {
        d = ( view._scene._lastMax.subtract( view._scene._lastMin ) ).length();
        d = ( ( d < x3dom.fields.Eps ) ? 1 : d ) * navi._vf.speed * 0.75;

        var tx = -d * dx / view._width;
        var ty =  d * dy / view._height;

        this.pan( view, tx, ty );
    }

    view._isMoving = true;

    view._dx = dx;
    view._dy = dy;

    view._lastX = x;
    view._lastY = y;
};

x3dom.TurntableNavigation.prototype.pan = function ( view, tx, ty )
{
    var viewpoint = view._scene.getViewpoint();

    if ( this.target != null )
    {
        var target = this.target;
        var bbox = target._x3domNode.getVolume();

        view._up = view._flyMat.e1();
        view._from = view._flyMat.e3(); // eye

        // add xy offset to look-at position  ^
        var cor = view._at;

        cor = cor.addScaled( this.panAxisY, ty );
        var temp = cor;
        if ( cor.y > bbox.max.y || cor.y < bbox.min.y )
        {temp = view._at;}
        else
        {view._from = view._from.addScaled( this.panAxisY, ty );}

        cor = temp.addScaled( this.panAxisX, tx );
        if ( cor.x > bbox.max.x || cor.x < bbox.min.x )
        {cor = temp;}
        else
        {view._from = view._from.addScaled( this.panAxisX, tx );}

        view._at = cor;

        // update camera matrix with lookAt() and invert
        view._flyMat = x3dom.fields.SFMatrix4f.lookAt( view._from, cor, view._up );
        viewpoint.setViewAbsolute( view._flyMat.inverse() );
    }
    else if ( this.panAxisX != null && this.panAxisY != null )
    {
        view._up = view._flyMat.e1();
        view._from = view._flyMat.e3(); // eye

        // add xy offset to look-at position  ^
        var cor = view._at;

        cor = cor.addScaled( this.panAxisY, ty );
        var temp = cor;
        view._from = view._from.addScaled( this.panAxisY, ty );

        cor = temp.addScaled( this.panAxisX, tx );
        view._from = view._from.addScaled( this.panAxisX, tx );

        view._at = cor;

        // update camera matrix with lookAt() and invert
        view._flyMat = x3dom.fields.SFMatrix4f.lookAt( view._from, cor, view._up );
        viewpoint.setViewAbsolute( view._flyMat.inverse() );
    }
    else
    {
        view._up = view._flyMat.e1();
        view._from = view._flyMat.e3(); // eye

        var xAxis = view._up.cross( view._from ).normalize();
        var yAxis = view._from.cross( xAxis ).normalize();

        // add xy offset to look-at position  ^
        var cor = view._at;

        cor = cor.addScaled( yAxis, ty );
        var temp = cor;
        view._from = view._from.addScaled( yAxis, ty );

        cor = temp.addScaled( xAxis, tx );
        view._from = view._from.addScaled( xAxis, tx );

        view._at = cor;

        // update camera matrix with lookAt() and invert
        view._flyMat = x3dom.fields.SFMatrix4f.lookAt( view._from, cor, view._up );
        viewpoint.setViewAbsolute( view._flyMat.inverse() );
    }
};

x3dom.TurntableNavigation.prototype.rotate = function ( view, alpha, beta )
{
    var viewpoint = view._scene.getViewpoint();

    view._flyMat = this.calcOrbit( view, alpha, beta );
    viewpoint.setView( view._flyMat.inverse() );
};

x3dom.TurntableNavigation.prototype.zoom = function ( view, zoomAmount )
{
    var navi = this.navi;
    var viewpoint = view._scene.getViewpoint();

    view._up   = view._flyMat.e1();
    view._from = view._flyMat.e3(); // eye

    // zoom in/out
    var cor = view._at;

    var lastDir  = cor.subtract( view._from );
    var lastDirL = lastDir.length();
    lastDir = lastDir.normalize();

    var newDist = zoomAmount;
    if ( navi._vf.typeParams[ 6 ] )
    {newDist = Math.min( zoomAmount, lastDirL - navi._vf.typeParams[ 6 ] );}
    if ( navi._vf.typeParams[ 7 ] )
    {newDist = Math.max( newDist, lastDirL - navi._vf.typeParams[ 7 ] );}

    // move along viewing ray, scaled with zoom factor
    view._from = view._from.addScaled( lastDir, newDist );

    // move along viewing ray, scaled with zoom factor
    //view._from = view._from.addScaled(lastDir, zoomAmount);

    // update camera matrix with lookAt() and invert again
    view._flyMat = x3dom.fields.SFMatrix4f.lookAt( view._from, cor, view._up );
    viewpoint.setViewAbsolute( view._flyMat.inverse() );
};

x3dom.TurntableNavigation.prototype.calcOrbit = function ( view, alpha, beta, absolute )
{
    var navi = this.navi;

    view._up   = view._flyMat.e1();
    view._from = view._flyMat.e3();

    var offset = view._from.subtract( view._at );

    var phi,
        theta;
    if ( absolute == true )
    {
        phi = beta;
        theta = alpha;
    }
    else
    {
        // angle in xz-plane
        phi = Math.atan2( offset.x, offset.z );

        // angle from y-axis
        theta = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

        phi -= beta;
        theta -= alpha;
    }

    // clamp theta
    theta = Math.max( navi._vf.typeParams[ 2 ], Math.min( navi._vf.typeParams[ 3 ], theta ) );

    if ( navi._vf.typeParams[ 4 ] <= navi._vf.typeParams[ 5 ] )
    {phi = Math.max( navi._vf.typeParams[ 4 ], Math.min( navi._vf.typeParams[ 5 ], phi ) );}
    else
    {
        if ( beta > 0 && phi < navi._vf.typeParams[ 4 ] && phi > navi._vf.typeParams[ 5 ] ) {phi = navi._vf.typeParams[ 4 ];}
        else if ( beta < 0 && phi > navi._vf.typeParams[ 5 ] && phi < navi._vf.typeParams[ 4 ] ) {phi = navi._vf.typeParams[ 5 ];}
    }

    var radius = offset.length();

    // calc new cam position
    var rSinPhi = radius * Math.sin( theta );

    offset.x = rSinPhi * Math.sin( phi );
    offset.y = radius  * Math.cos( theta );
    offset.z = rSinPhi * Math.cos( phi );

    offset = view._at.add( offset );

    // calc new up vector
    theta -= Math.PI / 2;

    var sinPhi = Math.sin( theta );
    var cosPhi = Math.cos( theta );
    var up = new x3dom.fields.SFVec3f( sinPhi * Math.sin( phi ), cosPhi, sinPhi * Math.cos( phi ) );

    if ( up.y < 0 )
    {up = up.negate();}

    return x3dom.fields.SFMatrix4f.lookAt( offset, view._at, up );
};

x3dom.TurntableNavigation.prototype.initTurnTable = function ( view, flyTo )
{
    var navi = this.navi;

    flyTo = ( flyTo == undefined ) ? true : flyTo;

    var currViewMat = view.getViewMatrix();
    view._rotMat = x3dom.fields.SFMatrix4f.identity();
    view._transMat = x3dom.fields.SFMatrix4f.identity();

    var viewpoint = view._scene.getViewpoint();
    var center = x3dom.fields.SFVec3f.copy( viewpoint.getCenterOfRotation() );

    view._flyMat = currViewMat.inverse();

    view._from = viewpoint._vf.position;
    view._at = center;
    view._up = new x3dom.fields.SFVec3f( 0, 1, 0 );

    view._flyMat = x3dom.fields.SFMatrix4f.lookAt( view._from, view._at, view._up );

    var _from = currViewMat.inverse().e3();

    var offset = _from.subtract( view._at );
    var phi = Math.atan2( offset.x, offset.z );
    // angle from y-axis
    var theta = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

    view._flyMat = this.calcOrbit( view, theta, phi, true );

    var dur = 0.0;

    if ( flyTo )
    {
        dur = 0.2 / navi._vf.speed;   // fly to pivot point
        this.animateTo( view, view._flyMat.inverse(), currViewMat, dur );
    }

    view.resetNavHelpers();
};

x3dom.TurntableNavigation.prototype.onMousePress = function ( view, x, y, buttonState )
{
    if ( !view._flyMat )
    {this.initTurnTable( view, false );}
};

x3dom.TurntableNavigation.prototype.init = function ( view, flyTo )
{
    this.initTurnTable( view, true );
};

x3dom.TurntableNavigation.prototype.resetView = function ( view )
{
    view._mixer.beginTime = view._lastTS;
    view._mixer.endTime = view._lastTS + this.navi._vf.transitionTime;

    view._mixer.setBeginMatrix( view.getViewMatrix() );

    var target = view._scene.getViewpoint();
    target.resetView();

    target = x3dom.fields.SFMatrix4f.lookAt( target._vf.position, target.getCenterOfRotation(), new x3dom.fields.SFVec3f( 0, 1, 0 ) );

    view._mixer.setEndMatrix( target.inverse() );

    this.updateFlyMat( view );
};

x3dom.TurntableNavigation.prototype.updateFlyMat = function ( view, nextViewpoint, overrideMat )
{
    if ( !view._flyMat )
    {this.initTurnTable( view, false );}

    var currViewMat = view.getViewMatrix();

    var viewpoint = nextViewpoint;
    if ( viewpoint == null || !x3dom.isa( viewpoint, x3dom.nodeTypes.X3DViewpointNode ) )
    {viewpoint = view._scene.getViewpoint();}
    var center = x3dom.fields.SFVec3f.copy( viewpoint.getCenterOfRotation() );

    view._flyMat = currViewMat.inverse();

    if ( overrideMat )
    {view._from = overrideMat.inverse().e3();}
    else
    {view._from = viewpoint._vf.position;}

    view._at = center;
    view._up = new x3dom.fields.SFVec3f( 0, 1, 0 );

    view._flyMat = x3dom.fields.SFMatrix4f.lookAt( view._from, view._at, view._up );

    var _from = currViewMat.inverse().e3();

    var offset = _from.subtract( view._at );
    var phi = Math.atan2( offset.x, offset.z );
    // angle from y-axis
    var theta = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

    view._flyMat = this.calcOrbit( view, theta, phi, true );
};

x3dom.TurntableNavigation.prototype.animateTo = function ( view, target, prev, dur )
{
    var navi = this.navi;
    var targetMat;

    if ( x3dom.isa( target, x3dom.nodeTypes.X3DViewpointNode ) )
    {
        targetMat = x3dom.fields.SFMatrix4f.lookAt( target._vf.position, target.getCenterOfRotation(), new x3dom.fields.SFVec3f( 0, 1, 0 ) );
    }
    else
    {targetMat = target;}

    if ( navi._vf.transitionType[ 0 ].toLowerCase() !== "teleport" && dur != 0 && navi.getType() !== "game" )
    {
        if ( prev && x3dom.isa( prev, x3dom.nodeTypes.X3DViewpointNode ) )
        {
            prev = prev.getViewMatrix().mult( prev.getCurrentTransform().inverse() ).
                mult( view._transMat ).mult( view._rotMat );

            view._mixer.beginTime = view._lastTS;

            if ( arguments.length >= 4 && arguments[ 3 ] != null )
            {
                // for lookAt to assure travel speed of 1 m/s
                view._mixer.endTime = view._lastTS + dur;
            }
            else
            {
                view._mixer.endTime = view._lastTS + navi._vf.transitionTime;
            }

            view._mixer.setBeginMatrix( prev );
            view._mixer.setEndMatrix( targetMat );

            view._scene.getViewpoint().setViewAbsolute( prev );
        }
        else if ( prev )
        {
            view._mixer.beginTime = view._lastTS;

            if ( arguments.length >= 4 && arguments[ 3 ] != null )
            {
                // for lookAt to assure travel speed of 1 m/s
                view._mixer.endTime = view._lastTS + dur;
            }
            else
            {
                view._mixer.endTime = view._lastTS + navi._vf.transitionTime;
            }

            view._mixer.setBeginMatrix( prev );
            view._mixer.setEndMatrix( targetMat );

            view._scene.getViewpoint().setViewAbsolute( prev );
        }
        else
        {
            view._scene.getViewpoint().setViewAbsolute( targetMat );
        }
    }
    else
    {
        view._scene.getViewpoint().setViewAbsolute( target );
    }

    view._rotMat = x3dom.fields.SFMatrix4f.identity();
    view._transMat = x3dom.fields.SFMatrix4f.identity();
    view._movement = new x3dom.fields.SFVec3f( 0, 0, 0 );
    view._needNavigationMatrixUpdate = true;

    this.updateFlyMat( view, target, targetMat );
};

x3dom.TurntableNavigation.prototype.onTouchStart = function ( view, evt, touches )
{
    view._numTouches = evt.touches.length;

    view._lastX = evt.touches[ 0 ].screenX;
    view._lastY = evt.touches[ 0 ].screenY;
};

x3dom.TurntableNavigation.prototype.onTouchDrag = function ( view, evt, touches, translation, rotation )
{
    if ( view._currentInputType == x3dom.InputTypes.NAVIGATION )
    {
        if ( evt.touches.length == 1 )
        {
            var dx = ( evt.touches[ 0 ].screenX - view._lastX );
            var dy = ( evt.touches[ 0 ].screenY - view._lastY );

            var alpha = ( dy * 2 * Math.PI ) / view._height;
            var beta = ( dx * 2 * Math.PI ) / view._width;

            this.rotate( view, alpha, beta );

            view._lastX = evt.touches[ 0 ].screenX;
            view._lastY = evt.touches[ 0 ].screenY;
        }
        else if ( evt.touches.length >= 2 )
        {
            if ( this.panEnabled == true )
            {this.pan( view, -translation.x * 4.0, -translation.y * 4.0 );}

            this.zoom( view, translation.z * 4.0 );
        }
    }
};

x3dom.TurntableNavigation.prototype.onTouchEnd = function ( view, evt, touches )
{
    if ( view._numTouches == 2 && evt.touches.length == 1 )
    {
        view._lastX = evt.touches[ 0 ].screenX;
        view._lastY = evt.touches[ 0 ].screenY;
    }

    view._numTouches = evt.touches.length;
};

x3dom.TurntableNavigation.prototype.setPanTarget = function ( target )
{
    this.target = target;
};

x3dom.TurntableNavigation.prototype.setPanAxis = function ( a, b )
{
    this.panAxisX = a;
    this.panAxisY = b;
};

x3dom.TurntableNavigation.prototype.setPanEnabled = function ( enabled )
{
    this.panEnabled = enabled;
};

x3dom.TurntableNavigation.prototype.onDoubleClick = function ( view, x, y )
{
    if ( view._doc._x3dElem.hasAttribute( "disableDoubleClick" ) &&
        view._doc._x3dElem.getAttribute( "disableDoubleClick" ) === "true" )
    {
        return;
    }

    var navi = view._scene.getNavigationInfo();

    if ( navi.getType() == "none" )
    {
        return;
    }

    var pickMode = view._scene._vf.pickMode.toLowerCase();

    if ( ( pickMode == "color" || pickMode == "texcoord" ) )
    {
        return;
    }

    var viewpoint = view._scene.getViewpoint();

    viewpoint.setCenterOfRotation( view._pick );
    x3dom.debug.logInfo( "New center of Rotation:  " + view._pick );

    var mat = view.getViewMatrix().inverse();

    view._from = mat.e3();
    view._up = mat.e1();

    view._at = view._pick;

    view._flyMat = x3dom.fields.SFMatrix4f.lookAt( view._from, view._at, view._up );

    var offset = view._from.subtract( view._at );
    var phi = Math.atan2( offset.x, offset.z );
    // angle from y-axis
    var theta = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

    view._flyMat = this.calcOrbit( view, theta, phi, true );

    x3dom.debug.logInfo( "New camera position:  " + view._from );
    this.animateTo( view, view._flyMat.inverse(), view.getViewMatrix() );
};
