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


/**
 * Input types - X3DOM allows either navigation or interaction.
 * During each frame, only interaction of the current type is being processed, it is not possible to
 * perform interaction (for instance, selecting or dragging objects) and navigation at the same time
 */
x3dom.InputTypes = {
    NAVIGATION:  1,
    INTERACTION: 2
};


/**
* Constructor.
*
* @class represents a view area
* @param {x3dom.X3DDocument} document - the target X3DDocument
* @param {Object} scene - the scene
*/
// ### Viewarea ###
x3dom.Viewarea = function (document, scene) {
    this._doc = document; // x3ddocument
    this._scene = scene; // FIXME: updates ?!

    document._nodeBag.viewarea.push(this);

    /**
     * picking informations containing
     * pickingpos, pickNorm, pickObj, firstObj, lastObj, lastClickObj, shadowObjId
     * @var {Object} _pickingInfo
     * @memberof x3dom.Viewarea
     * @instance
     * @protected
     */
    this._pickingInfo = {
        pickPos: new x3dom.fields.SFVec3f(0, 0, 0),
        pickNorm: new x3dom.fields.SFVec3f(0, 0, 1),
        pickObj: null,
        firstObj: null,
        lastObj: null,
        lastClickObj: null,
        shadowObjectId: -1
    };

    this._currentInputType = x3dom.InputTypes.NAVIGATION;

    /**
     * rotation matrix
     * @var {x3dom.fields.SFMatrix4f} _rotMat
     * @memberof x3dom.Viewarea
     * @instance
     * @protected
     */
    this._rotMat = x3dom.fields.SFMatrix4f.identity();

    /**
     * translation matrix
     * @var {x3dom.fields.SFMatrix4f} _transMat
     * @memberof x3dom.Viewarea
     * @instance
     * @protected
     */
    this._transMat = x3dom.fields.SFMatrix4f.identity();

    /**
     * movement vector
     * @var {x3dom.fields.SFVec3f} _movement
     * @memberof x3dom.Viewarea
     * @instance
     * @protected
     */
    this._movement = new x3dom.fields.SFVec3f(0, 0, 0);

    /**
     * flag to signal a needed NavigationMatrixUpdate
     * @var {Boolean} _needNavigationMatrixUpdate
     * @memberof x3dom.Viewarea
     * @instance
     * @protected
     */
    this._needNavigationMatrixUpdate = true;

    /**
     * time passed since last update
     * @var {Number} _deltaT
     * @memberof x3dom.Viewarea
     * @instance
     * @protected
     */
    this._deltaT = 0;

    this._flyMat = null;

    this._pitch = 0;
    this._yaw = 0;

    /**
     * eye position of the view area
     * @var {x3dom.fields.SFVec3f} _eyePos
     * @memberof x3dom.Viewarea
     * @instance
     * @protected
     */
    this._eyePos = new x3dom.fields.SFVec3f(0, 0, 0);

    /**
     * width of the view area
     * @var {Number} _width
     * @memberof x3dom.Viewarea
     * @instance
     * @protected
     */
    this._width = 400;

    /**
     * height of the view area
     * @var {Number} _height
     * @memberof x3dom.Viewarea
     * @instance
     * @protected
     */
    this._height = 300;
    
    this._dx = 0;
    this._dy = 0;
    this._lastX = -1;
    this._lastY = -1;
    this._pressX = -1;
    this._pressY = -1;
    this._lastButton = 0;

    this._points = 0;   // old render mode flag (but think of better name!)
    this._numRenderedNodes = 0;
    
    this._pick = new x3dom.fields.SFVec3f(0, 0, 0);
    this._pickNorm = new x3dom.fields.SFVec3f(0, 0, 1);
    
    this._isAnimating = false;
    this._isMoving = false;
    this._lastTS = 0;
    this._mixer = new x3dom.MatrixMixer();
	this._interpolator = new x3dom.FieldInterpolator();

    this.arc = null;
};

/**
 * Method gets called every frame with the current timestamp
 * @param {Number} timeStamp - current time stamp
 * @return {Boolean} view area animation state
 */
x3dom.Viewarea.prototype.tick = function(timeStamp)
{
    var needMixAnim = false;
    var env = this._scene.getEnvironment();

    if (env._vf.enableARC && this.arc == null)
    {
        this.arc = new x3dom.arc.AdaptiveRenderControl(this._scene);
    }

    if (this._mixer.isActive() )
    {
		var mat = this._mixer.mix( timeStamp );
		this._scene.getViewpoint().setView( mat );
    }
	
	if ( this._interpolator.isActive() )
	{
		var value = this._interpolator.interpolate( timeStamp );
		this._scene.getViewpoint().setZoom( value );
	}

    var needNavAnim = this.navigateTo(timeStamp);
    var lastIsAnimating = this._isAnimating;

    this._lastTS = timeStamp;
    this._isAnimating = (this._mixer.isMixing || this._interpolator.isInterpolating || needNavAnim);

    if (this.arc != null )
    {
        this.arc.update(this.isMovingOrAnimating() ? 1 : 0, this._doc._x3dElem.runtime.getFPS());
    }

    return (this._isAnimating || lastIsAnimating);
};

/**
 * Returns moving state of view are
 * @return {Boolean} moving state of view area
 */
x3dom.Viewarea.prototype.isMoving = function()
{
    return this._isMoving;
};

/**
 * Returns animation state of view area
 * @return {Boolean} animation state of view area
 */
x3dom.Viewarea.prototype.isAnimating = function()
{
    return this._isAnimating;
};

/**
 * is view area moving or animating
 * @return {Boolean} view area moving or animating state
 */
x3dom.Viewarea.prototype.isMovingOrAnimating = function()
{
    return (this._isMoving || this._isAnimating);
};

/**
 * triggers view area to move to something by passing the timestamp
 * returning a flag if the view area needs a navigation animation
 * @return {Boolean} flag if the view area need a navigation state
 */
x3dom.Viewarea.prototype.navigateTo = function(timeStamp)
{
    var navi = this._scene.getNavigationInfo();
    return navi._impl.navigateTo(this, timeStamp);
};

x3dom.Viewarea.prototype.moveFwd = function()
{
    var navi = this._scene.getNavigationInfo();
    navi._impl.moveForward(this);
};

x3dom.Viewarea.prototype.moveBwd = function()
{
    var navi = this._scene.getNavigationInfo();
    navi._impl.moveBackwards(this);    
};

x3dom.Viewarea.prototype.strafeRight = function()
{
    var navi = this._scene.getNavigationInfo();
    navi._impl.strafeRight(this);
    
};

x3dom.Viewarea.prototype.strafeLeft = function()
{
    var navi = this._scene.getNavigationInfo();
    navi._impl.strafeLeft(this);
    
};

x3dom.Viewarea.prototype.animateTo = function(target, prev, dur)
{
    var navi = this._scene.getNavigationInfo();
    navi._impl.animateTo(this, target, prev, dur);
};

x3dom.Viewarea.prototype.orthoAnimateTo = function( target, prev, duration )
{
    var navi = this._scene.getNavigationInfo();
    navi._impl.orthoAnimateTo(this, target, prev, duration);
};

x3dom.Viewarea.prototype.getLights = function () {
    var enabledLights = [];
    for (var i=0; i<this._doc._nodeBag.lights.length; i++)
    {
        if (this._doc._nodeBag.lights[i]._vf.on == true)
        {
            enabledLights.push(this._doc._nodeBag.lights[i]);
        }
    }
    return enabledLights;
};

x3dom.Viewarea.prototype.getLightsShadow = function () {
	var lights = this._doc._nodeBag.lights;
	for(var l=0; l<lights.length; l++) {
		if(lights[l]._vf.shadowIntensity > 0.0){
            return true;
        }
	}
    return false;
};

x3dom.Viewarea.prototype.updateSpecialNavigation = function (viewpoint, mat_viewpoint) {
    var navi = this._scene.getNavigationInfo();
    var navType = navi.getType();
    
    // helicopter mode needs to manipulate view matrix specially
    if (navType == "helicopter" && !navi._heliUpdated)
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

/**
 * Get the view areas view point matrix
 * @return {x3dom.fields.SFMatrix4f} view areas view point matrix
 */
x3dom.Viewarea.prototype.getViewpointMatrix = function ()
{
    var viewpoint = this._scene.getViewpoint();
    var mat_viewpoint = viewpoint.getCurrentTransform();
    
    this.updateSpecialNavigation(viewpoint, mat_viewpoint);
    
    return viewpoint.getViewMatrix().mult(mat_viewpoint.inverse());
};

/**
 * Get the view areas view matrix
 * @return {x3dom.fields.SFMatrix4f} view areas view matrix
 */
x3dom.Viewarea.prototype.getViewMatrix = function ()
{
    return this.getViewpointMatrix().mult(this._transMat).mult(this._rotMat);
};

x3dom.Viewarea.prototype.getLightMatrix = function ()
{
    var lights = this._doc._nodeBag.lights;
    var i, n = lights.length;

    if (n > 0)
    {
        var vol = this._scene.getVolume();

        if (vol.isValid())
        {
            var min = x3dom.fields.SFVec3f.MAX();
            var max = x3dom.fields.SFVec3f.MIN();
            vol.getBounds(min, max);

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

/**
 * Get six WCtoLCMatrices for point light
 * @param {x3dom.fields.SFMatrix4f} view - the view matrix
 * @param {x3dom.nodeTypes.X3DNode} lightNode - the light node
 * @param {x3dom.fields.SFMatrix4f} mat_proj - the projection matrix
 * @return {Array} six WCtoLCMatrices
 */
x3dom.Viewarea.prototype.getWCtoLCMatricesPointLight = function(view, lightNode, mat_proj)
{	 
	var zNear = lightNode._vf.zNear;
	var zFar = lightNode._vf.zFar;
	
	var proj = this.getLightProjectionMatrix(view, zNear, zFar, false, mat_proj);
	
	//set projection matrix to 90 degrees FOV (vertical and horizontal)
	proj._00 = 1;
	proj._11 = 1;
	
	var matrices = [];
	
	//create six matrices to cover all directions of point light
	matrices[0] = proj.mult(view);
		
	var rotationMatrix;
	
	//y-rotation
	for (var i=1; i<=3; i++){	
		rotationMatrix = x3dom.fields.SFMatrix4f.rotationY(i*Math.PI/2);
		matrices[i] = proj.mult(rotationMatrix.mult(view));
	}
	
	//x-rotation
	rotationMatrix = x3dom.fields.SFMatrix4f.rotationX(Math.PI/2);
	matrices[4] = proj.mult(rotationMatrix.mult(view));
	
	rotationMatrix = x3dom.fields.SFMatrix4f.rotationX(3*Math.PI/2);
	matrices[5] = proj.mult(rotationMatrix.mult(view));
	
    return matrices;
};

/*
 * Get WCToLCMatrices for cascaded light
 */
x3dom.Viewarea.prototype.getWCtoLCMatricesCascaded = function(view, lightNode, mat_proj)
{
	var numCascades = Math.max(1, Math.min(lightNode._vf.shadowCascades, 6));
	var splitFactor = Math.max(0, Math.min(lightNode._vf.shadowSplitFactor, 1));
	var splitOffset = Math.max(0, Math.min(lightNode._vf.shadowSplitOffset, 1));

	var isSpotLight = x3dom.isa(lightNode, x3dom.nodeTypes.SpotLight);
	var zNear = lightNode._vf.zNear;
	var zFar = lightNode._vf.zFar;
	
	var proj = this.getLightProjectionMatrix(view, zNear, zFar, true, mat_proj);
	
	if (isSpotLight){
		//set FOV to 90 degrees
		proj._00 = 1;
		proj._11 = 1;
	}	
	
	//get view projection matrix
	var viewProj = proj.mult(view);	
	
	var matrices = [];

	if (numCascades == 1){
		//return if only one cascade
		matrices[0] = viewProj;
		return matrices;
	}
	
	//compute split positions of view frustum
	var cascadeSplits = this.getShadowSplitDepths(numCascades, splitFactor, splitOffset, true, mat_proj);
	
	//calculate fitting matrices and multiply with view projection
	for (var i=0; i<numCascades; i++){
		var fittingMat = this.getLightFittingMatrix(viewProj, cascadeSplits[i], cascadeSplits[i+1], mat_proj);
		matrices[i] = fittingMat.mult(viewProj);
	}	
	
	return matrices;
};

x3dom.Viewarea.prototype.getLightProjectionMatrix = function(lMat, zNear, zFar, highPrecision, mat_proj)
{
    var proj = x3dom.fields.SFMatrix4f.copy(mat_proj);
	
	if (!highPrecision || zNear > 0 || zFar > 0) {
		//replace near and far plane of projection matrix
		//by values adapted to the light position
		
		var lightPos = lMat.inverse().e3();
		
		var nearScale = 0.8;
		var farScale = 1.2;
		
		var min = x3dom.fields.SFVec3f.copy(this._scene._lastMin);
		var max = x3dom.fields.SFVec3f.copy(this._scene._lastMax); 

		var dia = max.subtract(min);
		var sRad = dia.length() / 2;
		
		var sCenter = min.add(dia.multiply(0.5));
		var vDist = (lightPos.subtract(sCenter)).length();
		
		var near, far;
		
		if (sRad) {
			if (vDist > sRad)
				near = (vDist - sRad) * nearScale; 
			else
				near = 1;                           
			far = (vDist + sRad) * farScale;
		}
		if (zNear > 0) near = zNear;
		if (zFar > 0) far = zFar;

		proj._22 = -(far+near)/(far-near);
		proj._23 = -2.0*far*near / (far-near);
		
		return proj;
	}
    else {
		//should be more accurate, but also more expensive
		var cropMatrix = this.getLightCropMatrix(proj.mult(lMat));
		
		return cropMatrix.mult(proj);
	}
};

x3dom.Viewarea.prototype.getProjectionMatrix = function()
{
    var viewpoint = this._scene.getViewpoint();

    return viewpoint.getProjectionMatrix(this._width/this._height);
};

/**
 * Get the view frustum for a given clipping matrix
 * @param {x3dom.fields.SFMatrix4f} clipMat - the clipping matrix
 * @return {x3dom.fields.FrustumVolume} the resulting view frustum
 */
x3dom.Viewarea.prototype.getViewfrustum = function(clipMat)
{
    var env = this._scene.getEnvironment();

    if (env._vf.frustumCulling == true)
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

    return null;
};

/**
 * Get the world coordinates to clipping coordinates matrix by multiplying the projection and view matrices
 * @return {x3dom.fields.SFMatrix4f} world coordinates to clipping coordinates matrix
 */
x3dom.Viewarea.prototype.getWCtoCCMatrix = function()
{
    var view = this.getViewMatrix();
    var proj = this.getProjectionMatrix();

    return proj.mult(view);
};

/**
 * Get the clipping coordinates to world coordinates matrix by multiplying the projection and view matrices
 * @return {x3dom.fields.SFMatrix4f} clipping coordinates to world coordinates  matrix
 */
x3dom.Viewarea.prototype.getCCtoWCMatrix = function()
{
    var mat = this.getWCtoCCMatrix();

    return mat.inverse();
};

x3dom.Viewarea.prototype.calcViewRay = function(x, y, mat)
{
    var cctowc = mat ? mat : this.getCCtoWCMatrix();

    var rx = x / (this._width - 1.0) * 2.0 - 1.0;
    var ry = (this._height - 1.0 - y) / (this._height - 1.0) * 2.0 - 1.0;

    var from = cctowc.multFullMatrixPnt(new x3dom.fields.SFVec3f(rx, ry, -1));
    var at = cctowc.multFullMatrixPnt(new x3dom.fields.SFVec3f(rx, ry,  1));
    var dir = at.subtract(from);

    return new x3dom.fields.Ray(from, dir);
};

x3dom.Viewarea.prototype.showAll = function(axis, updateCenterOfRotation)
{
    if (axis === undefined)
        axis = "negZ";

    if (updateCenterOfRotation === undefined) {
        updateCenterOfRotation = false;
    }

    var scene = this._scene;
    scene.updateVolume();

    var min = x3dom.fields.SFVec3f.copy(scene._lastMin);
    var max = x3dom.fields.SFVec3f.copy(scene._lastMax);

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

    var viewpoint = scene.getViewpoint();
    var fov = viewpoint.getFieldOfView();

    var dia = max.subtract(min); 
    var dia2 = dia.multiply(0.5);
    var center = min.add(dia2);

    if (updateCenterOfRotation) {
        viewpoint.setCenterOfRotation(center);
    }

    var diaz2 = dia[z] / 2.0, tanfov2 = Math.tan(fov / 2.0);

    var dist1 = (dia[y] / 2.0) / tanfov2 + diaz2;
    var dist2 = (dia[x] / 2.0) / tanfov2 + diaz2;

    dia = min.add(dia.multiply(0.5));

    dia[z] += sign * (dist1 > dist2 ? dist1 : dist2) * 1.01;

    var quat = x3dom.fields.Quaternion.rotateFromTo(from, to);

    var viewmat = quat.toMatrix();
    viewmat = viewmat.mult(x3dom.fields.SFMatrix4f.translation(dia.negate()));

    if ( x3dom.isa(viewpoint, x3dom.nodeTypes.OrthoViewpoint) )
    {
        this.orthoAnimateTo( dist1, Math.abs(viewpoint._fieldOfView[0]) );
        this.animateTo( viewmat, viewpoint );
    }
    else
    {
        this.animateTo( viewmat, viewpoint );
    }
};

x3dom.Viewarea.prototype.fit = function(min, max, updateCenterOfRotation)
{
    if (updateCenterOfRotation === undefined) {
        updateCenterOfRotation = true;
    }

    var dia2 = max.subtract(min).multiply(0.5);    // half diameter
    var center = min.add(dia2);                    // center in wc
    var bsr = dia2.length();                       // bounding sphere radius

    var viewpoint = this._scene.getViewpoint();
    var fov = viewpoint.getFieldOfView();

    var viewmat = x3dom.fields.SFMatrix4f.copy(this.getViewMatrix());

    var rightDir = new x3dom.fields.SFVec3f(viewmat._00, viewmat._01, viewmat._02);
    var upDir = new x3dom.fields.SFVec3f(viewmat._10, viewmat._11, viewmat._12);
    var viewDir = new x3dom.fields.SFVec3f(viewmat._20, viewmat._21, viewmat._22);

    var tanfov2 = Math.tan(fov / 2.0);
    var dist = bsr / tanfov2;

    var eyePos = center.add(viewDir.multiply(dist));

    viewmat._03 = -rightDir.dot(eyePos);
    viewmat._13 = -upDir.dot(eyePos);
    viewmat._23 = -viewDir.dot(eyePos);

    if (updateCenterOfRotation) {
        viewpoint.setCenterOfRotation(center);
    }

    if (x3dom.isa(viewpoint, x3dom.nodeTypes.OrthoViewpoint))
    {
        this.orthoAnimateTo( dist, Math.abs(viewpoint._fieldOfView[0]) );
        this.animateTo( viewmat, viewpoint );
    }
    else
    {
        this.animateTo(viewmat, viewpoint);
    }
};

x3dom.Viewarea.prototype.resetView = function()
{
    var navi = this._scene.getNavigationInfo();
    navi._impl.resetView(this);    
};

x3dom.Viewarea.prototype.resetNavHelpers = function()
{
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
    if (!node || !node._xmlNode)
        return null;

    try {
        var attrib = node._xmlNode[eventType];

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
    var childNode;
    var i, n;
    var target = (obj && obj._xmlNode) ? obj._xmlNode : {};


    var affectedPointingSensorsList = this._doc._nodeBag.affectedPointingSensors;


    var event = {
        viewarea: that,
        target: target,
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
        hitObject: target,         // deprecated, remove!
        shadowObjectId: that._pickingInfo.shadowObjectId,
        cancelBubble: false,
        stopPropagation: function() { this.cancelBubble = true; },
		preventDefault: function() { this.cancelBubble = true; }
    };

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

            //find the lowest pointing device sensors in the hierarchy that might be affected
            //(note that, for X3DTouchSensors, 'affected' does not necessarily mean 'activated')
            if (buttonState == 0 && affectedPointingSensorsList.length == 0 &&
                (eventType == 'onmousemove' || eventType == 'onmouseover' || eventType == 'onmouseout') )
            {
                n = node._childNodes.length;

                for (i = 0; i < n; ++i)
                {
                    childNode = node._childNodes[i];

                    if (x3dom.isa(childNode, x3dom.nodeTypes.X3DPointingDeviceSensorNode) && childNode._vf.enabled)
                    {
                        affectedPointingSensorsList.push(childNode);
                    }
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

    if (needRecurse && obj) {
        recurse(obj);
    }

	return needRecurse;
};


/**
 * Notifies all pointing device sensors that are currently affected by mouse events, if any, about the given event
 * @param {DOMEvent} event - a mouse event, enriched by X3DOM-specific members
 */
x3dom.Viewarea.prototype._notifyAffectedPointingSensors = function(event)
{
    var funcDict = {
        "mousedown" : "pointerPressedOverSibling",
        "mousemove" : "pointerMoved",
        "mouseover" : "pointerMovedOver",
        "mouseout"  : "pointerMovedOut"
    };

    var func = funcDict[event.type];
    var affectedPointingSensorsList = this._doc._nodeBag.affectedPointingSensors;
    var i, n = affectedPointingSensorsList.length;

    if (n > 0 && func !== undefined)
    {
        for (i = 0; i < n; i++)
            affectedPointingSensorsList[i][func](event);
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
    this._isMoving = false;
    this._needNavigationMatrixUpdate = true;
};

x3dom.Viewarea.prototype.onMousePress = function (x, y, buttonState)
{
    this._needNavigationMatrixUpdate = true;

    this.prepareEvents(x, y, buttonState, "onmousedown");
    this._pickingInfo.lastClickObj = this._pickingInfo.pickObj;
    this._pickingInfo.firstObj = this._pickingInfo.pickObj;

    this._dx = 0;
    this._dy = 0;
    this._lastX = x;
    this._lastY = y;
    this._pressX = x;
    this._pressY = y;
    this._lastButton = buttonState;
    this._isMoving = false;

    if (this._currentInputType == x3dom.InputTypes.NAVIGATION)
    {
        var navi = this._scene.getNavigationInfo();
        navi._impl.onMousePress(this, x, y, buttonState);
    }
};

x3dom.Viewarea.prototype.onMouseRelease = function (x, y, buttonState, prevButton)
{
    var i;
    //if the mouse is released, reset the list of currently affected pointing sensors
    var affectedPointingSensorsList = this._doc._nodeBag.affectedPointingSensors;
    for (i = 0; i < affectedPointingSensorsList.length; ++i)
    {
        affectedPointingSensorsList[i].pointerReleased();
    }
    this._doc._nodeBag.affectedPointingSensors = [];

    var tDist = 3.0;  // distance modifier for lookat, could be param
    var dir;
    var navi = this._scene.getNavigationInfo();
    var navType = navi.getType();

    if (this._scene._vf.pickMode.toLowerCase() !== "box") {
        this.prepareEvents(x, y, prevButton, "onmouseup");

        // click means that mousedown _and_ mouseup were detected on same element
        if (this._pickingInfo.pickObj &&
            this._pickingInfo.pickObj === this._pickingInfo.lastClickObj)
        {
            this.prepareEvents(x, y, prevButton, "onclick");
        }
        else if (!this._pickingInfo.pickObj && !this._pickingInfo.lastClickObj &&
                 !this._pickingInfo.firstObj)   // press and release outside object
        {
            var eventType = "backgroundClicked";
            try {
                if ( this._scene._xmlNode &&
                    (this._scene._xmlNode["on" + eventType] ||
                        this._scene._xmlNode.hasAttribute("on" + eventType) ||
                        this._scene._listeners[eventType]) ) {
                    var event = {
                        target: this._scene._xmlNode, type: eventType,
                        button: prevButton, layerX: x, layerY: y,
                        cancelBubble: false,
                        stopPropagation: function () { this.cancelBubble = true; },
                        preventDefault:  function () { this.cancelBubble = true; }
                    };
                    this._scene.callEvtHandler(("on" + eventType), event);
                }
            }
            catch (e) { x3dom.debug.logException("backgroundClicked: " + e); }
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
    this._pickingInfo.firstObj = null;

    if (this._currentInputType == x3dom.InputTypes.NAVIGATION &&
        (this._pickingInfo.pickObj || this._pickingInfo.shadowObjectId >= 0) &&
        navType === "lookat" && this._pressX === x && this._pressY === y)
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
    this._isMoving = false;
};

x3dom.Viewarea.prototype.onMouseOver = function (x, y, buttonState)
{
    this._dx = 0;
    this._dy = 0;
    this._lastButton = 0;
    this._isMoving = false;
    this._lastX = x;
    this._lastY = y;
    this._deltaT = 0;
};

x3dom.Viewarea.prototype.onMouseOut = function (x, y, buttonState)
{
    this._dx = 0;
    this._dy = 0;
    this._lastButton = 0;
    this._isMoving = false;
    this._lastX = x;
    this._lastY = y;
    this._deltaT = 0;

    //if the mouse is moved out of the canvas, reset the list of currently affected pointing sensors
    //(this behaves similar to a mouse release inside the canvas)
    var i;
    var affectedPointingSensorsList = this._doc._nodeBag.affectedPointingSensors;
    for (i = 0; i < affectedPointingSensorsList.length; ++i)
    {
        affectedPointingSensorsList[i].pointerReleased();
    }
    this._doc._nodeBag.affectedPointingSensors = [];
};

x3dom.Viewarea.prototype.onDoubleClick = function (x, y)
{
    if (this._doc._x3dElem.hasAttribute('disableDoubleClick') &&
        this._doc._x3dElem.getAttribute('disableDoubleClick') === 'true') {
        return;
    }
    
    var navi = this._scene.getNavigationInfo();
    navi._impl.onDoubleClick(this, x,y);
};

x3dom.Viewarea.prototype.handleMoveEvt = function (x, y, buttonState)
{
    //pointing sensors might still be in use, if the mouse has previously been pressed over sensor geometry
    //(in general, transitions between INTERACTION and NAVIGATION require that the mouse is not pressed)
    if (buttonState == 0)
    {
        this._doc._nodeBag.affectedPointingSensors = [];
    }

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

// multi-touch version of examine mode, called from X3DCanvas.js
x3dom.Viewarea.prototype.onMoveView = function (translation, rotation)
{
    if (this._currentInputType == x3dom.InputTypes.NAVIGATION)
    {
        var navi = this._scene.getNavigationInfo();
        var viewpoint = this._scene.getViewpoint();

        if (navi.getType() === "examine")
        {
            if (translation)
            {
                var distance = (this._scene._lastMax.subtract(this._scene._lastMin)).length();
                distance = ((distance < x3dom.fields.Eps) ? 1 : distance) * navi._vf.speed;

                translation = translation.multiply(distance);
                this._movement = this._movement.add(translation);

                this._transMat = viewpoint.getViewMatrix().inverse().
                    mult(x3dom.fields.SFMatrix4f.translation(this._movement)).
                    mult(viewpoint.getViewMatrix());
            }

            if (rotation)
            {
                var center = viewpoint.getCenterOfRotation();
                var mat = this.getViewMatrix();
                mat.setTranslate(new x3dom.fields.SFVec3f(0,0,0));

                this._rotMat = this._rotMat.
                               mult(x3dom.fields.SFMatrix4f.translation(center)).
                               mult(mat.inverse()).mult(rotation).mult(mat).
                               mult(x3dom.fields.SFMatrix4f.translation(center.negate()));
            }

            this._isMoving = true;
        }
    }
};

x3dom.Viewarea.prototype.onDrag = function (x, y, buttonState)
{
    // should onmouseover/-out be handled on drag?
    this.handleMoveEvt(x, y, buttonState);

    if (this._currentInputType == x3dom.InputTypes.NAVIGATION)
    {
        this._scene.getNavigationInfo()._impl.onDrag(this,x,y,buttonState);
    }

};

x3dom.Viewarea.prototype.prepareEvents = function (x, y, buttonState, eventType)
{
    var affectedPointingSensorsList = this._doc._nodeBag.affectedPointingSensors;
    var pickMode                    = this._scene._vf.pickMode.toLowerCase();
    var avoidTraversal              = (pickMode.indexOf("idbuf") == 0 ||
                                       pickMode == "color" || pickMode == "texcoord");

    var obj = null;

    if (avoidTraversal) {
        obj = this._pickingInfo.pickObj;

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

    //TODO: this is pretty redundant - but from where should we obtain this event object?
    //      this also needs to work if there is no picked object, and independent from "avoidTraversal"?

    // FIXME;  avoidTraversal is only to distinguish between the ancient box and the other render-based pick modes,
    //         thus it seems the cleanest thing to just remove the old traversal-based and non-functional box mode.
    //         Concerning background: what about if we unify the onbackgroundClicked event such that there is also
    //         an onbackgroundMoved event etc?

    var event = {
        viewarea: this,
        target: {},     // should be hit xml element
        type: eventType.substr(2, eventType.length-2),
        button: buttonState,
        layerX: x,
        layerY: y,
        worldX: this._pick.x,
        worldY: this._pick.y,
        worldZ: this._pick.z,
        normalX: this._pickNorm.x,
        normalY: this._pickNorm.y,
        normalZ: this._pickNorm.z,
        hitPnt: this._pick.toGL(), // for convenience
        hitObject: (obj && obj._xmlNode) ? obj._xmlNode : null,
        shadowObjectId: this._pickingInfo.shadowObjectId,
        cancelBubble: false,
        stopPropagation: function() { this.cancelBubble = true; },
        preventDefault: function() { this.cancelBubble = true; }
    };

    //forward event to affected pointing device sensors
    this._notifyAffectedPointingSensors(event);

    //switch between navigation and interaction
    if (affectedPointingSensorsList.length > 0)
    {
        this._currentInputType = x3dom.InputTypes.INTERACTION;
    }
    else
    {
        this._currentInputType = x3dom.InputTypes.NAVIGATION;
    }
};


x3dom.Viewarea.prototype.getRenderMode = function()
{
    // this._points == 0 ? TRIANGLES or TRIANGLE_STRIP
    // this._points == 1 ? gl.POINTS
    // this._points == 2 ? gl.LINES
    // TODO: 3 :== surface with additional wireframe render mode
    return this._points;
};


x3dom.Viewarea.prototype.getShadowedLights = function()
{	
	var shadowedLights = [];
	var shadowIndex = 0;
	var slights = this.getLights();
	for (var i=0; i<slights.length; i++){
		if (slights[i]._vf.shadowIntensity > 0.0){
			shadowedLights[shadowIndex] = slights[i];
			shadowIndex++;
		}
	}
	return shadowedLights;
};


/**
 * Calculate view frustum split positions for the given number of cascades
 * @param {Number} numCascades - the number of cascades
 * @param {Number} splitFactor - the splitting factor
 * @param {Number} splitOffset - the offset for the splits
 * @param {Array} postProject - the post projection something
 * @param {x3dom.fields.SFMatrix4f} mat_proj - the projection matrix
 * @return {Array} the post projection something
 */
x3dom.Viewarea.prototype.getShadowSplitDepths = function(numCascades, splitFactor, splitOffset, postProject, mat_proj)
{
	var logSplit;
	var practSplit = [];
	
	var viewPoint = this._scene.getViewpoint();
	
	var zNear = viewPoint.getNear();
	var zFar = viewPoint.getFar();

	practSplit[0] = zNear;
	
	//pseudo near plane for bigger cascades near camera
	zNear = zNear + splitOffset*(zFar-zNear)/10;
	
	//calculate split depths according to "practical split scheme"
	for (var i=1;i<numCascades;i++){
		logSplit = zNear * Math.pow((zFar / zNear), i / numCascades);
		practSplit[i] = splitFactor * logSplit + (1 - splitFactor) * (zNear + i / (numCascades * (zNear-zFar)));
	}
	practSplit[numCascades] = zFar;
	
	//return in view coords
	if (!postProject)
        return practSplit;
	
	//return in post projective coords
	var postProj = [];
	
	for (var j=0; j<=numCascades; j++){
		postProj[j] = mat_proj.multFullMatrixPnt(new x3dom.fields.SFVec3f(0,0,-practSplit[j])).z;
	}
	
	return postProj;
};


/*
 * calculate a matrix to enhance the placement of 
 * the near and far planes of the light projection matrix
*/
x3dom.Viewarea.prototype.getLightCropMatrix = function(WCToLCMatrix)
{	
	//get corner points of scene bounds
	var sceneMin = x3dom.fields.SFVec3f.copy(this._scene._lastMin);
	var sceneMax = x3dom.fields.SFVec3f.copy(this._scene._lastMax);
	
	var sceneCorners = [];
	sceneCorners[0] = new x3dom.fields.SFVec3f(sceneMin.x, sceneMin.y, sceneMin.z);
	sceneCorners[1] = new x3dom.fields.SFVec3f(sceneMin.x, sceneMin.y, sceneMax.z);
	sceneCorners[2] = new x3dom.fields.SFVec3f(sceneMin.x, sceneMax.y, sceneMin.z);
	sceneCorners[3] = new x3dom.fields.SFVec3f(sceneMin.x, sceneMax.y, sceneMax.z);
	sceneCorners[4] = new x3dom.fields.SFVec3f(sceneMax.x, sceneMin.y, sceneMin.z);
	sceneCorners[5] = new x3dom.fields.SFVec3f(sceneMax.x, sceneMin.y, sceneMax.z);
	sceneCorners[6] = new x3dom.fields.SFVec3f(sceneMax.x, sceneMax.y, sceneMin.z);
	sceneCorners[7] = new x3dom.fields.SFVec3f(sceneMax.x, sceneMax.y, sceneMax.z);
	
	//transform scene bounds into light space
    var i;
	for (i=0; i<8; i++){
		sceneCorners[i] = WCToLCMatrix.multFullMatrixPnt(sceneCorners[i]);
	}
	
	//determine min and max values in light space
	var minScene = x3dom.fields.SFVec3f.copy(sceneCorners[0]);
	var maxScene = x3dom.fields.SFVec3f.copy(sceneCorners[0]);
	
	for (i=1; i<8; i++){
		minScene.z = Math.min(sceneCorners[i].z, minScene.z); 
		maxScene.z = Math.max(sceneCorners[i].z, maxScene.z); 
	}

	var scaleZ = 2.0 / (maxScene.z - minScene.z);
	var offsetZ = -(scaleZ * (maxScene.z + minScene.z)) / 2.0;	
		
	//var scaleZ = 1.0 / (maxScene.z - minScene.z);
	//var offsetZ = -minScene.z * scaleZ;

	var cropMatrix = x3dom.fields.SFMatrix4f.identity();
	
	cropMatrix._22 = scaleZ;
	cropMatrix._23 = offsetZ;	
	
	return cropMatrix;	
};
	

/*
 * Calculate a matrix to fit the given wctolc-matrix to the split boundaries
 */
x3dom.Viewarea.prototype.getLightFittingMatrix = function(WCToLCMatrix, zNear, zFar, mat_proj)
{
	var mat_view = this.getViewMatrix();
	var mat_view_proj = mat_proj.mult(mat_view);
	var mat_view_proj_inverse = mat_view_proj.inverse();
	
	//define view frustum corner points in post perspective view space
	var frustumCorners = [];
	frustumCorners[0] = new x3dom.fields.SFVec3f(-1, -1, zFar);
	frustumCorners[1] = new x3dom.fields.SFVec3f(-1, -1, zNear);
	frustumCorners[2] = new x3dom.fields.SFVec3f(-1,  1, zFar);
	frustumCorners[3] = new x3dom.fields.SFVec3f(-1,  1, zNear);
	frustumCorners[4] = new x3dom.fields.SFVec3f( 1, -1, zFar);
	frustumCorners[5] = new x3dom.fields.SFVec3f( 1, -1, zNear);
	frustumCorners[6] = new x3dom.fields.SFVec3f( 1,  1, zFar);
	frustumCorners[7] = new x3dom.fields.SFVec3f( 1,  1, zNear);
	

	//transform corner points into post perspective light space
    var i;
	for (i=0; i<8; i++){
		frustumCorners[i] = mat_view_proj_inverse.multFullMatrixPnt(frustumCorners[i]);
		frustumCorners[i] = WCToLCMatrix.multFullMatrixPnt(frustumCorners[i]);
	}
	
	//calculate minimum and maximum values
	var minFrustum = x3dom.fields.SFVec3f.copy(frustumCorners[0]);
	var maxFrustum = x3dom.fields.SFVec3f.copy(frustumCorners[0]);

	for (i=1; i<8; i++){
		minFrustum.x = Math.min(frustumCorners[i].x, minFrustum.x); 
		minFrustum.y = Math.min(frustumCorners[i].y, minFrustum.y);
		minFrustum.z = Math.min(frustumCorners[i].z, minFrustum.z); 
		
		maxFrustum.x = Math.max(frustumCorners[i].x, maxFrustum.x); 
		maxFrustum.y = Math.max(frustumCorners[i].y, maxFrustum.y); 
		maxFrustum.z = Math.max(frustumCorners[i].z, maxFrustum.z); 
	}
	
	
	//clip values to box (-1,-1,-1),(1,1,1)
	function clip(min,max)
    {
		var xMin = min.x;
		var yMin = min.y;
		var zMin = min.z;
		var xMax = max.x;
		var yMax = max.y;
		var zMax = max.z;
		
		if (xMin > 1.0 || xMax < -1.0) {
			xMin = -1.0;
			xMax =  1.0;
		} else {
			xMin = Math.max(xMin,-1.0);
			xMax = Math.min(xMax, 1.0);
		}
		
		if (yMin > 1.0 || yMax < -1.0) {
			yMin = -1.0;
			yMax =  1.0;
		} else {
			yMin = Math.max(yMin,-1.0);
			yMax = Math.min(yMax, 1.0);
		}
					   
		if (zMin > 1.0 || zMax < -1.0){
			zMin = -1.0;
			zMax = 1.0;
		} else {
			zMin = Math.max(zMin,-1.0);
			zMax = Math.min(zMax, 1.0);
		}
		var minValues = new x3dom.fields.SFVec3f(xMin,yMin,zMin);
		var maxValues = new x3dom.fields.SFVec3f(xMax,yMax,zMax);

		return new x3dom.fields.BoxVolume(minValues,maxValues);
	}
	
	var frustumBB = clip(minFrustum, maxFrustum);

	//define fitting matrix
	var scaleX = 2.0 / (frustumBB.max.x - frustumBB.min.x);
	var scaleY = 2.0 / (frustumBB.max.y - frustumBB.min.y);
	var offsetX = -(scaleX * (frustumBB.max.x + frustumBB.min.x)) / 2.0;
	var offsetY = -(scaleY * (frustumBB.max.y + frustumBB.min.y)) / 2.0;
	
	var fittingMatrix = x3dom.fields.SFMatrix4f.identity();
	
	fittingMatrix._00 = scaleX;
	fittingMatrix._11 = scaleY;
	fittingMatrix._03 = offsetX;
	fittingMatrix._13 = offsetY;

	return fittingMatrix;
};
