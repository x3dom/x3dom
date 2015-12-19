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
 * c'tor
 */
x3dom.DrawableCollection = function (drawableCollectionConfig) {
    this.collection = [];

    this.viewMatrix = drawableCollectionConfig.viewMatrix;
    this.projMatrix = drawableCollectionConfig.projMatrix;
    this.sceneMatrix = drawableCollectionConfig.sceneMatrix;

    this.viewarea = drawableCollectionConfig.viewArea;

    var scene = this.viewarea._scene;
    var env = scene.getEnvironment();
    var viewpoint = scene.getViewpoint();

    this.near = viewpoint.getNear();
    this.pixelHeightAtDistOne = viewpoint.getImgPlaneHeightAtDistOne() / this.viewarea._height;

    this.context = drawableCollectionConfig.context;
    this.gl = drawableCollectionConfig.gl;

    this.viewFrustum = this.viewarea.getViewfrustum(this.sceneMatrix);
    this.worldVol = new x3dom.fields.BoxVolume();     // helper

    this.frustumCulling = drawableCollectionConfig.frustumCulling && (this.viewFrustum != null);
    this.smallFeatureThreshold = drawableCollectionConfig.smallFeatureThreshold;

    // if (lowPriorityThreshold < 1) sort all potentially visible objects according to priority
    this.sortOpaque = (this.smallFeatureThreshold > 0 && env._lowPriorityThreshold < 1);
    this.sortTrans = drawableCollectionConfig.sortTrans;

    this.prioLevels = 10;
    this.maxTreshold = 100;

    this.sortBySortKey = false;
    this.sortByPriority = false;

    this.numberOfNodes = 0;

    this.length = 0;
};

/**
 * Returns the result of the culling process, including view frustum culling and small feature culling.
 * A value > 0 identifies a plane mask, indicating that the object is inside the frustum with respect to
 * the respective planes (and large enough), -1 means the object was culled
 * "0" is a rare case, indicating that the object intersects with all planes of the frustum
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
        return -1;
    }

    var volume = node.getVolume();      // create on request
    var MASK_SET = 63;  // 2^6-1, i.e. all sides of the volume

    if (this.frustumCulling && graphState.needCulling) {
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

        //-1 indicates that the object has been culled
        if (planeMask == -1)
        {
            return -1;
        }
    }
    else {
        planeMask = MASK_SET;
    }

    graphState.coverage = -1;    // if -1 then ignore value later on

    // TODO: save the coverage only for drawables, which are unique (shapes can be shared!)
    if (this.smallFeatureThreshold > 0 || node.forceUpdateCoverage()) {
        var modelViewMat = this.viewMatrix.mult(transform);

        graphState.center = modelViewMat.multMatrixPnt(volume.getCenter());

        var rVec = modelViewMat.multMatrixVec(volume.getRadialVec());
        var r    = rVec.length();

        var dist = Math.max(-graphState.center.z - r, this.near);
        var projPixelLength = dist * this.pixelHeightAtDistOne;

        graphState.coverage = (r * 2.0) / projPixelLength;

        if (this.smallFeatureThreshold > 0 && graphState.coverage < this.smallFeatureThreshold && 
            graphState.needCulling) {
            return -1;
        }
    }

    // not culled, incr node cnt
    this.numberOfNodes++;
    
    return planeMask;   // >= 0 means inside or overlap
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
        if (this.smallFeatureThreshold > 0) {
            // TODO: center was previously set in cull, which is called first, but this
            // might be problematic if scene is traversed in parallel and node is shared
            // (though currently traversal is sequential, so everything is fine)
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

    //Push drawable to the collection
    this.collection[drawable.sortType].push(drawable);
    //this.collection[drawable.sortType][drawable.sortKey][drawable.priority][drawable.shaderID].push(drawable);

    //Increment collection length
    this.length++;

    //Finally setup shape directly here to avoid another loop of O(n)
    if (this.context && this.gl) {
        this.context.setupShape(this.gl, drawable, this.viewarea);
    }
    //TODO: what about Flash? Shall we also setup structures here?
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

    //Push drawable to the collection
    this.collection[drawable.sortType].push(drawable);
    //this.collection[drawable.sortType][drawable.sortKey][drawable.priority][drawable.shaderID].push(drawable);

    //Increment collection length
    this.length++;

    //Finally setup shape directly here to avoid another loop of O(n)
    if (this.context && this.gl) {
        this.context.setupShape(this.gl, drawable, this.viewarea);
    }
};


/**
 * Calculate the magical object priority (though currently not very magic).
 */
x3dom.DrawableCollection.prototype.calculatePriority = function (graphState) {
    //Use coverage as priority
    var priority = Math.max(0, graphState.coverage);

    //Classify the priority level
    var pl = this.prioLevels - 1;   // Can this be <= 0? Then FIXME!
    priority = Math.min( Math.round(priority / (this.maxTreshold / pl)), pl );

    return priority;
};

/**
 *  Concatenate opaque and transparent drawables
 */
x3dom.DrawableCollection.prototype.concat = function () {
    var opaque = (this.collection['opaque'] !== undefined) ? this.collection['opaque'] : [];
    var transparent = (this.collection['transparent'] !== undefined) ? this.collection['transparent'] : [];

    //Merge opaque and transparent drawables to a single array
    this.collection = opaque.concat(transparent);
};

/**
 *  Get drawable for id
 */
x3dom.DrawableCollection.prototype.get = function (idx) {
    return this.collection[idx];
};

/**
 * Sort the DrawableCollection
 */
x3dom.DrawableCollection.prototype.sort = function () {
    var opaque = [];
    var transparent = [];
    var that = this;

    //Sort opaque drawables
    if (this.collection['opaque'] !== undefined) {
        // never call this for very big scenes, getting very slow; try binning approach
        if (this.sortOpaque) {
            this.collection['opaque'].sort(function (a, b) {
                if (a.sortKey == b.sortKey || !that.sortBySortKey) {
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
                if (a.sortKey == b.sortKey || !that.sortBySortKey) {
                    if (a.priority == b.priority || !that.sortByPriority) {
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
    maxPriority = (maxPriority !== undefined) ? Math.min(maxPriority, this.prioLevels) : this.prioLevels;

    //Define run variables
    var sortKey, priority, shaderID, drawable;

    //First traverse Opaque drawables
    // TODO; FIXME; this is wrong, sortKey can also be negative!
    for (sortKey=0; sortKey<this.collection['opaque'].length; ++sortKey)
    {
        if (this.collection['opaque'][sortKey] !== undefined)
        {
            for (priority=this.collection['opaque'][sortKey].length; priority>0; --priority)
            {
                if (this.collection['opaque'][sortKey][priority] !== undefined)
                {
                    for (shaderID in this.collection['opaque'][sortKey][priority])
                    {
                        for (drawable=0; drawable<this.collection['opaque'][sortKey][priority][shaderID].length; ++drawable)
                        {
                            fnc( this.collection['opaque'][sortKey][priority][shaderID][drawable] );
                        }
                    }
                }
            }
        }
    }

    //Next traverse transparent drawables
    // TODO; FIXME; this is wrong, sortKey can also be negative!
    for (sortKey=0; sortKey<this.collection['transparent'].length; ++sortKey)
    {
        if (this.collection['transparent'][sortKey] !== undefined)
        {
            for (priority=this.collection['transparent'][sortKey].length; priority>0; --priority)
            {
                if (this.collection['transparent'][sortKey][priority] !== undefined)
                {
                    for (var shaderId in this.collection['transparent'][sortKey][priority])
                    {
                        //Sort transparent drawables by z-Pos
                        this.collection['transparent'][sortKey][priority][shaderId].sort(function(a, b) {
                            return a.zPos - b.zPos
                        });

                        for (drawable=0; drawable<this.collection['transparent'][sortKey][priority][shaderId].length; ++drawable)
                        {
                            fnc( this.collection['transparent'][sortKey][priority][shaderId][drawable] );
                        }
                    }
                }
            }
        }
    }
};
