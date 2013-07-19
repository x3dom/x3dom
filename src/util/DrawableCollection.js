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
 *
 */
x3dom.DrawableCollection = function (drawableCollectionConfig) {
    this.collection = [];

    this.viewMatrix = drawableCollectionConfig.viewMatrix;
    this.projMatrix = drawableCollectionConfig.projMatrix;
    this.sceneMatrix = drawableCollectionConfig.sceneMatrix;

    this.viewarea = drawableCollectionConfig.viewArea;

    var scene = this.viewarea._scene;
    var viewpoint = scene.getViewpoint();

    this.near = viewpoint.getNear();
    this.pixelHeightAtDistOne = viewpoint.getImgPlaneHeightAtDistOne() / this.viewarea._height;

    this.context = drawableCollectionConfig.context;
    this.gl = drawableCollectionConfig.gl;

    this.viewFrustum = this.viewarea.getViewfrustum(this.sceneMatrix);
    this.worldVol = new x3dom.fields.BoxVolume();     // helper

    this.frustumCulling = drawableCollectionConfig.frustumCulling && (this.viewFrustum != null);
    this.smallFeatureThreshold = drawableCollectionConfig.smallFeatureThreshold;

    this.sortOpaque = (this.smallFeatureThreshold > 1 && scene._vf.scaleRenderedIdsOnMove < 1);
    this.sortTrans = drawableCollectionConfig.sortTrans;

    this.prioLevels = 10;
    this.maxTreshold = 100;

    this.sortBySortKey = false;
    this.sortByPriority = false;

    this.numberOfNodes = 0;

    this.length = 0;
};

/**
 *  graphState = {
 *     boundedNode:  backref to bounded node object
 *     localMatrix:  mostly identity
 *     globalMatrix: current transform
 *     volume:       local bbox
 *     worldVolume:  global bbox
 *     center:       center in eye coords
 *     coverage:     currently approx. number of pixels on screen
 *  };
 */
x3dom.DrawableCollection.prototype.cull = function (transform, graphState, singlePath, planeMask) {
    var node = graphState.boundedNode;  // get ref to SG node

    if (!node || !node._vf.render) {
        return 0;   // <0 outside, >0 inside, but can't tell in this case
    }

    var volume = node.getVolume();      // create on request
    var MASK_SET = 63;  // 2^6-1, i.e. all sides of the volume

    if (this.frustumCulling) {
        var wvol;

        if (singlePath && !graphState.worldVolume.isValid()) {
            graphState.worldVolume.transformFrom(transform, volume);
            wvol = graphState.worldVolume;  // use opportunity to update if necessary
        }
        else if (planeMask < MASK_SET) {
            this.worldVol.transformFrom(transform, volume);
            wvol = this.worldVol;
        }

        if (planeMask < MASK_SET)
            planeMask = this.viewFrustum.intersect(wvol, planeMask);
        if (planeMask <= 0) {
            return -1;      // if culled return -1; 0 should never happen
        }
    }
    else {
        planeMask = MASK_SET;
    }

    graphState.coverage = -1;    // if -1 then ignore value later on

    //@todo: save the coverage only for drawables (shapes can be shared!)
    if (this.smallFeatureThreshold > 1 || node.forceUpdateCoverage()) {
        var modelViewMat = this.viewMatrix.mult(transform);

        graphState.center = modelViewMat.multMatrixPnt(volume.getCenter());

        var rVec = modelViewMat.multMatrixVec(volume.getRadialVec());
        var r    = rVec.length();

        var dist = Math.max(-graphState.center.z - r, this.near);
        var projPixelLength = dist * this.pixelHeightAtDistOne;

        graphState.coverage = (r * 2.0) / projPixelLength;

        if (this.smallFeatureThreshold > 1 && graphState.coverage < this.smallFeatureThreshold) {
            return 0;   // differentiate between outside and this case
        }
    }

    // not culled, incr node cnt
    this.numberOfNodes++;

    return planeMask;   // >0, inside
};

/**
 * A drawable is basically a unique pair of a shape node and a global transformation.
 */
x3dom.DrawableCollection.prototype.addShape = function (shape, transform, graphState) {
    //Create a new drawable object
    var drawable = {};

    //Set the shape
    drawable.shape = shape;

    //Set the transform
    drawable.transform = transform;

    drawable.localTransform = graphState.localMatrix;

    //Set the local bounding box (reference, can be shared amongst shapes)
    drawable.localVolume = graphState.volume;

    //Set the global bbox (needs to be cloned since shape can be shared)
    drawable.worldVolume = x3dom.fields.BoxVolume.copy(graphState.worldVolume);

    //Calculate the magical object priority (though currently not very magic)
    drawable.priority = Math.max(0, graphState.coverage);
    //drawable.priority = this.calculatePriority(graphState);

    //Get shaderID from shape
    drawable.shaderID = shape.getShaderProperties(this.viewarea).id;

    var appearance = shape._cf.appearance.node;

    drawable.sortType = appearance ? appearance._vf.sortType.toLowerCase() : "opaque";
    drawable.sortKey = appearance ? appearance._vf.sortKey : 0;

    if (drawable.sortType == 'transparent') {
        if (this.smallFeatureThreshold > 1) {
            //@todo: this cannot work if the shape is shared!
            drawable.zPos = graphState.center.z;
        }
        else {
            //Calculate the z-Pos for transparent object sorting
            //if the center of the box is not available
            var center = transform.multMatrixPnt(shape.getCenter());
            center = this.viewMatrix.multMatrixPnt(center);
            drawable.zPos = center.z;
        }
    }

    //Look for sorting by sortKey
    if (!this.sortBySortKey && drawable.sortKey != 0) {
        this.sortBySortKey = true;
    }

    //Generate separate array for sortType if not exists
    if (this.collection[drawable.sortType] === undefined) {
        this.collection[drawable.sortType] = [];
    }

    //Generate separate array for sortKey if not exists
    /*if (this.collection[drawable.sortType][drawable.sortKey] === undefined) {
        this.collection[drawable.sortType][drawable.sortKey] = [];
    }

    //Generate separate array for priority if not exists
    if (this.collection[drawable.sortType][drawable.sortKey][drawable.priority] === undefined) {
        this.collection[drawable.sortType][drawable.sortKey][drawable.priority] = [];
    }

    //Generate separate array for shaderID if not exists
    if (this.collection[drawable.sortType][drawable.sortKey][drawable.priority][drawable.shaderID] === undefined) {
        this.collection[drawable.sortType][drawable.sortKey][drawable.priority][drawable.shaderID] = [];
    }*/

    //Push drawable to the collection
    this.collection[drawable.sortType].push(drawable);
    //this.collection[drawable.sortType][drawable.sortKey][drawable.priority][drawable.shaderID].push(drawable);

    //Increment collection length
    this.length++;

    //Finally setup shape directly here to avoid another loop of O(n)
    if (this.context && this.gl) {
        this.context.setupShape(this.gl, drawable, this.viewarea);
    }
    else {
        //TODO: also setup Flash?
    }
};

/**
 * A drawable is basically a unique pair of a shape node and a global transformation.
 */
x3dom.DrawableCollection.prototype.addDrawable = function (drawable) {

    //Calculate the magical object priority (though currently not very magic)
    //drawable.priority = this.calculatePriority(graphState);

    //Get shaderID from shape
    drawable.shaderID = drawable.shape.getShaderProperties(this.viewarea).id;

    var appearance = drawable.shape._cf.appearance.node;

    drawable.sortType = appearance ? appearance._vf.sortType.toLowerCase() : "opaque";
    drawable.sortKey = appearance ? appearance._vf.sortKey : 0;

    if (drawable.sortType == 'transparent') {
        //TODO set zPos for drawable for z-sorting
        //Calculate the z-Pos for transparent object sorting
        //if the center of the box is not available
        var center = drawable.transform.multMatrixPnt(drawable.shape.getCenter());
        center = this.viewMatrix.multMatrixPnt(center);
        drawable.zPos = center.z;
    }

    //Look for sorting by sortKey
    if (!this.sortBySortKey && drawable.sortKey != 0) {
        this.sortBySortKey = true;
    }

    //Generate separate array for sortType if not exists
    if (this.collection[drawable.sortType] === undefined) {
        this.collection[drawable.sortType] = [];
    }

    //Generate separate array for sortKey if not exists
    /*if (this.collection[drawable.sortType][drawable.sortKey] === undefined) {
     this.collection[drawable.sortType][drawable.sortKey] = [];
     }

     //Generate separate array for priority if not exists
     if (this.collection[drawable.sortType][drawable.sortKey][drawable.priority] === undefined) {
     this.collection[drawable.sortType][drawable.sortKey][drawable.priority] = [];
     }

     //Generate separate array for shaderID if not exists
     if (this.collection[drawable.sortType][drawable.sortKey][drawable.priority][drawable.shaderID] === undefined) {
     this.collection[drawable.sortType][drawable.sortKey][drawable.priority][drawable.shaderID] = [];
     }*/

    //Push drawable to the collection
    this.collection[drawable.sortType].push(drawable);
    //this.collection[drawable.sortType][drawable.sortKey][drawable.priority][drawable.shaderID].push(drawable);

    //Increment collection length
    this.length++;

    //Finally setup shape directly here to avoid another loop of O(n)
    if (this.context && this.gl) {
        this.context.setupShape(this.gl, drawable, this.viewarea);
    }
    else {
        //TODO: also setup Flash?
    }
};


/**
 * Calculate the magical object priority (though currently not very magic).
 */
x3dom.DrawableCollection.prototype.calculatePriority = function (graphState) {

    //Use coverage as priority
    var priority = Math.max(0, graphState.coverage);

    //Classify the priority level
    priority = Math.min( Math.round(priority / (maxTreshold / this.prioLevels-1)), this.prioLevels-1 );

    return priority;
}

/**
 *
 */
x3dom.DrawableCollection.prototype.concat = function () {
    var opaque = (this.collection['opaque'] !== undefined) ? this.collection['opaque'] : [];
    var transparent = (this.collection['transparent'] !== undefined) ? this.collection['transparent'] : [];

    //Merge opaque and transparent drawables to a single array
    this.collection = opaque.concat(transparent);
};

/**
 *
 */
x3dom.DrawableCollection.prototype.get = function (idx) {
    return this.collection[idx];
};

/**
 *
 */
x3dom.DrawableCollection.prototype.sort = function () {
    var opaque = [];
    var transparent = [];

    //Sort opaque drawables
    if (this.collection['opaque'] !== undefined) {
        // never call this for very big scenes, getting very slow; try binning approach
        if (this.sortOpaque) {
            this.collection['opaque'].sort(function (a, b) {
                if (a.sortKey == b.sortKey || !this.sortBySortKey) {
                    //Second sort criteria (priority)
                    return b.priority - a.priority;
                }
                //First sort criteria (sortKey)
                return a.sortKey - b.sortKey;
            });
        }
        opaque = this.collection['opaque'];
    }

    //Sort transparent drawables
    if (this.collection['transparent'] !== undefined) {
        if (this.sortTrans) {
            this.collection['transparent'].sort(function (a, b) {
                if (a.sortKey == b.sortKey || !this.sortBySortKey) {
                    if (a.priority == b.priority || !this.sortByPriority) {
                        //Third sort criteria (zPos)
                        return a.zPos - b.zPos;
                    }
                    //Second sort criteria (priority)
                    return b.priority - a.priority;
                }
                //First sort criteria (sortKey)
                return a.sortKey - b.sortKey;
            });
        }
        transparent = this.collection['transparent'];
    }

    //Merge opaque and transparent drawables to a single array (slow operation)
    this.collection = opaque.concat(transparent);
};

x3dom.DrawableCollection.prototype.forEach = function (fnc, maxPriority) {

    //Set maximal priority
    maxPriority = typeof maxPriority !== 'undefined' ? Math.min(maxPriority, prioLevels) : prioLevels;

    //Define run variables
    var sortKey, priority, shaderID, drawable;

    //First traverse Opaque drawables
    for (sortKey=0; sortKey<this.collection['opaque'].length; ++sortKey)
    {
        if (this.collection['opaque'][sortkey] !== undefined)
        {
            for (priority=this.collection['opaque'][sortKey].length; priority>0; --priority)
            {
                if (this.collection['opaque'][sortKey][priority] !== undefined)
                {
                    for (shaderID in this.collection['opaque'][sortKey][priority])
                    {
                        for (drawable=0; drawable<this.collection['opaque'][sortKey][priority][shaderID].lenght; ++drawable)
                        {
                            fnc( this.collection['opaque'][sortKey][priority][shaderID][drawable] );
                        }
                    }
                }
            }
        }
    }

    //Next traverse transparent drawables
    for (sortKey=0; sortKey<this.collection['transparent'].length; ++sortKey)
    {
        if (this.collection['transparent'][sortkey] !== undefined)
        {
            for (priority=this.collection['transparent'][sortKey].length; priority>0; --priority)
            {
                if (this.collection['transparent'][sortKey][priority] !== undefined)
                {
                    for (shaderId in this.collection['transparent'][sortKey][priority])
                    {
                        //Sort transparent drawables by z-Pos
                        this.collection['transparent'][sortKey][priority][shaderId].sort(function(a, b) {
                            return a.zPos - b.zPos
                        });

                        for (drawable=0; drawable<this.collection['transparent'][sortKey][priority][shaderId].lenght; ++drawable)
                        {
                            fnc( this.collection['transparent'][sortKey][priority][shaderId][drawable] );
                        }
                    }
                }
            }
        }
    }
};
