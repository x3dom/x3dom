/**
 * Constructor.
 *
 * @class represents a view area
 * @param {x3dom.X3DDocument} document - the target X3DDocument
 * @param {Object} scene - the scene
 */
x3dom.Viewarea = function (document, scene) {
    this._doc = document; // x3ddocument
    this._scene = scene; // FIXME: updates ?!

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
    
};

/**
 * Method gets called every frame with the current timestamp
 * @param {Number} timeStamp - current time stamp
 * @return {Boolean} view area animation state
 */
x3dom.Viewarea.prototype.tick = function(timeStamp)
{
    //...
    return this._isAnimating;
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
 * is view area moving but not animating
 * @return {Boolean} view area moving but not animating state
 */
x3dom.Viewarea.prototype.isMovingButNotAnimating = function()
{
    return (this._isMoving || !this._isAnimating);
};

/**
 * is view area not moving but animating
 * @return {Boolean} view area not moving but animating state
 */
x3dom.Viewarea.prototype.isNotMovingButAnimating = function()
{
    return (!this._isMoving || this._isAnimating);
};

/**
 * triggers view area to move to something by passing the timestamp
 * returning a flag if the view area needs a navigation animation
 * @return {Boolean} flag if the view area need a navigation state
 */
x3dom.Viewarea.prototype.navigateTo = function(timeStamp)
{
    //...
    return true;
};

/**
 * Get the view areas view point matrix
 * @return {x3dom.fields.SFMatrix4f} view areas view point matrix
 */
x3dom.Viewarea.prototype.getViewpointMatrix = function ()
{        
    return null;
};

/**
 * Get the view areas view matrix
 * @return {x3dom.fields.SFMatrix4f} view areas view matrix
 */
x3dom.Viewarea.prototype.getViewMatrix = function ()
{
    return this.getViewpointMatrix().mult(this._transMat).mult(this._rotMat);
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
	return null;
};

/**
 * Get the view frustum for a given clipping matrix
 * @param {x3dom.fields.SFMatrix4f} clipMat - the clipping matrix
 * @return {x3dom.fields.FrustumVolume} the resulting view frustum
 */
x3dom.Viewarea.prototype.getViewfrustum = function(clipMat)
{
    return null;
};

/**
 * Get the world coordinates to clipping coordinates matrix by multiplying the projection and view matrices
 * @return {x3dom.fields.SFMatrix4f} world coordinates to clipping coordinates matrix
 */
x3dom.Viewarea.prototype.getWCtoCCMatrix = function()
{
    return null;
};

/**
 * Get the clipping coordinates to world coordinates matrix by multiplying the projection and view matrices
 * @return {x3dom.fields.SFMatrix4f} clipping coordinates to world coordinates  matrix
 */
x3dom.Viewarea.prototype.getCCtoWCMatrix = function()
{
    return null;
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
    //...
	//return in post projective coords
	var postProj = [];
    //...
	return postProj;
};
