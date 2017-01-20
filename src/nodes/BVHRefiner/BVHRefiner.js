/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */


// ### BVHRefiner ###
x3dom.registerNodeType(
    "BVHRefiner",
    "BVHRefiner",
    defineClass(x3dom.nodeTypes.X3DLODNode,
        
        /**
         * Constructor for BVHRefiner
         * @constructs x3dom.nodeTypes.BVHRefiner
         * @x3d x.x
         * @component BVHRefiner
         * @extends x3dom.nodeTypes.X3DLODNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The node handles wmts conform datasets like e.g. terrain-data, city-data, point-clouds etc.
         */
        function (ctx) {
            x3dom.nodeTypes.BVHRefiner.superClass.call(this, ctx);


            /**
             * Parameter to influence refinement behaviour. The higher, the better the performance but quality gets more worse.
             * @var {x3dom.fields.SFFloat} factor
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'factor', 1.0);

            /**
             * Maximum refinement depth of dataset.
             * @var {x3dom.fields.SFInt32} maxDepth
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue 3
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'maxDepth', 3);

            /**
             * Minimum depth that should be rendered.
             * @var {x3dom.fields.SFInt32} minDepth
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'minDepth', 0);

            /**
             * Factor to reduce loading speed to get interactive framerates during interaction.
             * @var {x3dom.fields.SFInt32} smoothLoading
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'smoothLoading', 1);

            /**
             * Depth that should be rendered during interaction.
             * @var {x3dom.fields.SFInt32} interactionDepth
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue this._vf.maxDepth
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'interactionDepth', this._vf.maxDepth);

            /**
             * Size of the geometry in case of using terrain datasets.
             * @var {x3dom.fields.SFVec2f} size
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue 1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec2f(ctx, 'size', 1, 1);
            // TODO: delete if octree will be deleted

            /**
             * Size of octree dataset.
             * @var {x3dom.fields.SFVec3f} octSize
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue 1,1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'octSize', 1, 1, 1);

            /**
             * Subdivision of datasets in case of terrain to define the quality of the rendered dataset.
             * @var {x3dom.fields.SFVec2f} subdivision
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue 1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec2f(ctx, 'subdivision', 1, 1);

            /**
             * Url to the dataset.
             * @var {x3dom.fields.SFString} url
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'url', "");

            /**
             * Url to the elevation dataset in case of terrain.
             * @var {x3dom.fields.SFString} elevationUrl
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'elevationUrl', "");

            /**
             * Url to the surface texture dataset in case of terrain.
             * @var {x3dom.fields.SFString} textureUrl
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'textureUrl', "");

            /**
             * Url to the normal dataset in case of terrain.
             * @var {x3dom.fields.SFString} normalUrl
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'normalUrl', "");

            /**
             * Defines if 2d dataset or 3d dataset is utilized.
             * @var {x3dom.fields.SFString} mode
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue "3d"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'mode', "3d");

            /**
             * Defines the structure of the dataset that should be exploited.
             * @var {x3dom.fields.SFString} subMode
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue "wmts"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'subMode', "wmts");

            /**
             * Image format of the images in elevation dataset.
             * @var {x3dom.fields.SFString} elevationFormat
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue "png"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'elevationFormat', "png");

            /**
             * Image format of surface texture dataset.
             * @var {x3dom.fields.SFString} textureFormat
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue "png"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'textureFormat', "png");

            /**
             * Image format of normal texture dataset.
             * @var {x3dom.fields.SFString} normalFormat
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue "png"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'normalFormat', "png");

            /**
             * Maximum elevation that is defined through color white in elevation dataset images.
             * @var {x3dom.fields.SFFloat} maxElevation
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'maxElevation', 1.0);

            /**
             * Should be true if a normal dataset is required.
             * @var {x3dom.fields.SFBool} useNormals
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'useNormals', true);

            /**
             * Specifies whether this geometry should be rendered with or without lighting.
             * @var {x3dom.fields.SFBool} lit
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'lit', true);

            /**
             * Defines the count of divisions that should be produced. Creates dynamic datastructure for pot counts.
             * @var {x3dom.fields.SFInt32} bvhCount
             * @memberof x3dom.nodeTypes.BVHRefiner
             * @initvalue 8
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'bvhCount', 8);

            this.creationSmooth = 0;
            this.togglePoints = true;
            this.nodeProducer = new NodeProducer();
            // calculation of the array-size for storing the quad-pointers
            var nodeListSize = 0;
            for (var x = 0; x <= this._vf.maxDepth; x++) {
                nodeListSize += Math.pow(4, x);
            }
            this.nodeList = new Array(nodeListSize);

            if (this._vf.mode === "bin") {
                // creating the root-node of the quadtree
                this.rootNode = new QuadtreeNodeBin(ctx, this, 0, 0, 0, null);
            }
            else if (this._vf.mode === "3d" || this._vf.mode === "2d") {
                // 2D-Mesh that will represent the geometry of this node
                var geometry = new x3dom.nodeTypes.Plane(ctx);
                // definition the parameters of the geometry
                geometry._vf.subdivision.setValues(this._vf.subdivision);
                geometry.fieldChanged("subdivision");
                geometry._vf.size.setValues(this._vf.size);
                //geometry._vf.center.setValues(this._vf.center);

                if (this._vf.mode === "2d") {
                    if (this._vf.subMode === "wmts"){
                        // creating the root-node of the quadtree
                        this.rootNode = new QuadtreeNode2dWMTS(ctx, this, 0, 0,
                            x3dom.fields.SFMatrix4f.identity(),
                            0, 0, geometry);
                    }
                    else {
                        // creating the root-node of the quadtree
                        this.rootNode = new QuadtreeNode2D(ctx, this, 0, 0,
                            x3dom.fields.SFMatrix4f.identity(),
                            0, 0, geometry, "/", 1);
                    }
                }
                else {
                    if (this._vf.subMode === "32bit"){
                        this.rootNode = new QuadtreeNode3D_32bit(ctx, this, 0, 0,
                            x3dom.fields.SFMatrix4f.identity(),
                            0, 0, geometry);
                    }
                    else {
                        geometry = new x3dom.nodeTypes.Patch(ctx);
                        this.rootNode = new QuadtreeNode3D(ctx, this, 0, 0,
                            x3dom.fields.SFMatrix4f.identity(),
                            0, 0, geometry);
                    }
                }
            }
            else if (this._vf.mode === "bvh"){
                // creating the root-node of the quadtree
                this.rootNode = new BVHNode(ctx, this, 0, "/", 1, this._vf.bvhCount);
            }
            else {
                x3dom.debug.logError("Error attribute mode. Value: '" + this._vf.mode +
                    "' isn't conform. Please use type 'bin', '2d' or '3d'");
            }
        
        },
        {
            visitChildren: function(transform, drawableCollection, singlePath, invalidateCache, planeMask) {
                var x3dElement = this._nameSpace.doc._x3dElem;

                if (this._vf.mode === "oct") {
                    if (x3dElement.runtime.isReady && this.togglePoints){
                        x3dElement.runtime.togglePoints();
                        this.togglePoints = false;
                        this.view = drawableCollection.viewarea;
                    }
                    this.creationSmooth++;
                    singlePath = false;         // TODO (specify if unique node path or multi-parent)
                    invalidateCache = true;     // TODO (reuse world transform and volume cache)
                    this.rootNode.collectDrawables(transform, drawableCollection, singlePath, invalidateCache, planeMask);

                    if (!this.view.isMovingOrAnimating() && ((this.creationSmooth % this._vf.smoothLoading) === 0)) {
                        this.nodeProducer.CreateNewNode();
                    }
                }
                else {
                    if (x3dElement.runtime.isReady && this.togglePoints){
                        this.view = x3dElement.runtime.canvas.doc._viewarea;
                        this.togglePoints = false;
                    }
                    this.createChildren = 0;
                    this.creationSmooth++;
                    singlePath = false;         // TODO (specify if unique node path or multi-parent)
                    invalidateCache = true;     // TODO (reuse world transform and volume cache)
                    this.rootNode.collectDrawables(transform, drawableCollection, singlePath, invalidateCache, planeMask);
                    if (!this.view.isMovingOrAnimating() && ((this.creationSmooth % this._vf.smoothLoading) === 0)) {
                        this.nodeProducer.CreateNewNode();
                    }
                }
            },

            getVolume: function()
            {
                var vol = this._graph.volume;

                if (!this.volumeValid() && this._vf.render)
                {
                    var childVol = this.rootNode.getVolume();
                    if (childVol && childVol.isValid())
                        vol.extendBounds(childVol.min, childVol.max);
                }

                return vol;
            }
        }
    )
);

/*
 * All bvh-nodes must login at this element if they want to
 * create their children on next frame. This node decides what node
 * has the highest priority and creates its four children on the next
 * frame. On the next frame the same course will happen till all children
 * are created.
 * @returns {NodeProducer}
 */
function NodeProducer()
{
    // Node thats children should be created after current frame is rendered
    var nextNode        = null;
    // Distance of the node that should be created after current frame
    var nearestDistance = 1000000;
    // Depth of the node that should be created after current frame
    var smallestDepth   = 1000000;



    /*
     * Decides if the given node has a smaller or the same depth as the
     * current "nextNode", and if this is true if the distance to camera
     * is less. In this case it will be new "nextNode"
     * @param {Node of BVHRefiner} node node that will create children
     * @param {type} distance distance of the node to camera
     * @returns {null}
     */
    this.AddNewNode = function(node, distance){
        if (node.Level() < smallestDepth) {
            smallestDepth = node.Level();
            nextNode = node;
        }
        if (node.Level() === smallestDepth){
            if (distance < nearestDistance){
                distance = nearestDistance;
                nextNode = node;
            }
        }
    };



    /*
     * Creates the children of the node with highest priority in the last frame
     * @returns {null}
     */
    this.CreateNewNode = function(){
        if (nextNode !== null) {
            nextNode.CreateChildren();
        }
        nextNode = null;
        smallestDepth = 1000;
    };
}


/*******************************************************************************
 *******************************************************************************
 **************************** QuadtreeNode2dWMTS *******************************
 *******************************************************************************
 *******************************************************************************
 *
 * Defines one 2D node (plane) of a quadtree that represents a part
 * (nxn vertices) of the whole mesh.
 * @param {object} ctx context
 * @param {x3dom.nodeTypes.BVHRefiner} bvhRefiner root bvhRefiner node
 * @param {number} level level of the node within the quadtree
 * @param {number} nodeNumber id of the node within the level
 * @param {x3dom.fields.SFMatrix4f} nodeTransformation transformation matrix
 *                                  that defines scale and position
 * @param {number} columnNr column number in the wmts matrix within the level
 * @param {number} rowNr row number in the wmts matrix within the level
 * @param {x3dom.nodeTypes.Plane} geometry plane
 * @returns {QuadtreeNode2dWMTS}
 */
function QuadtreeNode2dWMTS(ctx, bvhRefiner, level, nodeNumber, nodeTransformation,
                            columnNr, rowNr, geometry)
{
    // array with the maximal four child nodes
    var children = [];
    // drawable component of this node
    var shape = new x3dom.nodeTypes.Shape();
    // position of the node in world space
    var position = null;
    // true if this component is available and renderable
    var readyState = false;
    // checks if children are ready
    var childrenReadyState = false;
    // url of the data source
    var url = bvhRefiner._vf.textureUrl + "/" + level + "/" + columnNr +
        "/" + rowNr + "." + (bvhRefiner._vf.textureFormat).toLowerCase();
    // defines the resizing factor
    var resizeFac = (bvhRefiner._vf.size.x + bvhRefiner._vf.size.y) / 2.0;
    // object that stores all information to do a frustum culling
    var cullObject = {};



    /*
     * Initializes all nodeTypes that are needed to create the drawable
     * component for this node
     * @returns {null}
     */
    function initialize() {

        // appearance of the drawable component of this node
        var appearance = new x3dom.nodeTypes.Appearance(ctx);
        // texture that should represent the surface-data of this node
        var texture = new x3dom.nodeTypes.ImageTexture(ctx);

        // definition of the nameSpace of this shape
        shape._nameSpace = bvhRefiner._nameSpace;

        // create height-data
        var texProp = new x3dom.nodeTypes.TextureProperties(ctx);
        texProp._vf.boundaryModeS = "CLAMP_TO_EDGE";
        texProp._vf.boundaryModeT = "CLAMP_TO_EDGE";
        texProp._vf.boundaryModeR = "CLAMP_TO_EDGE";
        texProp._vf.minificationFilter = "LINEAR";
        texProp._vf.magnificationFilter = "LINEAR";
        texture.addChild(texProp, "textureProperties");
        texture.nodeChanged();
        // definition of texture
        texture._nameSpace = bvhRefiner._nameSpace;
        texture._vf.url[0] = url;

        // calculate the average position of the node
        position = nodeTransformation.e3();

        // add textures to the appearence of this node
        appearance.addChild(texture);
        texture.nodeChanged();

        // create shape with geometry and appearance data
        shape.addChild(appearance);
        appearance.nodeChanged();
        shape.addChild(geometry);
        geometry.nodeChanged();

        // add shape to bvhRefiner object
        bvhRefiner.addChild(shape);
        shape.nodeChanged();

        // definition the static properties of cullObject
        cullObject.boundedNode = shape;
        cullObject.volume = shape.getVolume();
    }



    /*
     * Creates the four children
     * @returns {null}
     */
    this.CreateChildren = function () {
        create();
    };



    /*
     * Creates the four children
     * @returns {null}
     */
    function create() {

        // calculation of children number nodeNumber within their level
        var deltaR = Math.sqrt(Math.pow(4, level));
        var deltaR1 = Math.sqrt(Math.pow(4, level + 1));
        var lt = Math.floor(nodeNumber / deltaR) * 4 * deltaR +
            (nodeNumber % deltaR) * 2;
        var rt = lt + 1;
        var lb = lt + deltaR1;
        var rb = lb + 1;

        // calculation of the scaling factor
        var s = (bvhRefiner._vf.size).multiply(0.25);

        // creation of all children
        children.push(new QuadtreeNode2dWMTS(ctx, bvhRefiner, (level + 1), lt,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(-s.x, s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2), geometry));
        children.push(new QuadtreeNode2dWMTS(ctx, bvhRefiner, (level + 1), rt,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(s.x, s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2), geometry));
        children.push(new QuadtreeNode2dWMTS(ctx, bvhRefiner, (level + 1), lb,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(-s.x, -s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2 + 1), geometry));
        children.push(new QuadtreeNode2dWMTS(ctx, bvhRefiner, (level + 1), rb,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(s.x, -s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2 + 1), geometry));
    }



    /*
     * Returns the shape of this node
     * @returns {x3dom.nodeTypes.Shape}
     */
    this.Shape = function () {
        return shape;
    };



    /*
     * Runs only local ready() method. This is needed from parent to ask if
     * all children are ready to render or not
     * @returns {Boolean} true if ready to render, else false
     */
    this.Ready = function(){
        if (shape._webgl !== undefined && shape._webgl.texture !== undefined) {
            return ready();
        }

        return false;
    };



    /*
     * Iterates through all textures of this node and sets readState parameter
     * to true if all textures have been loaded to gpu yet, false if not.
     * @returns {Boolean} true if ready to render, else false
     */
    function ready() {
        readyState = true;
        for (var i = 0; i < shape._webgl.texture.length; i++){
            if (!shape._webgl.texture[i].texture.ready){
                readyState = false;
            }


        }

        return readyState;
    }



    /*
     * Updates the loading state of children and initializes this node
     * if this wasn't done before
     * @param {x3dom.DrawableCollection} drawableCollection
     * @param {x3dom.fields.SFMatrix4f} transform outer transformation matrix
     * @returns {null}
     */
    function updateLoadingState(drawableCollection, transform){

        childrenReadyState = true;
        for (var i = 0; i < children.length; i++){
            if (!children[i].Ready()) {
                childrenReadyState = false;
            }
        }

        if (children.length < 4){
            childrenReadyState = false;
        }
        else if (childrenReadyState) {
            for (var i = 0; i < children.length; i++){
                children[i].Shape()._vf.render = true;
            }
        }

        if (shape._webgl === undefined || shape._webgl.texture === undefined) {
            drawableCollection.context.setupShape(drawableCollection.gl,
                {shape:shape,
                    transform:transform},
                drawableCollection.viewarea);
        }
        else {
            ready();
        }
    }



    /*
     * Decides to create new children and if the node shoud be drawn or not
     * @param {x3dom.fields.SFMatrix4f} transform outer transformation matrix
     * @param {x3dom.DrawableCollection} drawableCollection
     * @param {bool} singlePath
     * @param {bool} invalidateCache
     * @param {number} planeMask
     * @returns {null}
     */
    this.collectDrawables = function (transform, drawableCollection,
                                      singlePath, invalidateCache, planeMask) {

        // definition the actual transformation of the node
        cullObject.localMatrix = nodeTransformation;
        // calculation of new plane mask
        planeMask = drawableCollection.cull(nodeTransformation, cullObject, singlePath, planeMask);

        // Checks the actual loading state of itself and children if something wasn't loaded in last frame
        if (!readyState || !childrenReadyState)
            updateLoadingState(drawableCollection, nodeTransformation);

        if (readyState && planeMask >= 0) {
            var mat_view = drawableCollection.viewMatrix;
            var vPos = mat_view.multMatrixPnt(nodeTransformation.multMatrixPnt(position));
            var distanceToCamera = Math.sqrt(Math.pow(vPos.x, 2) + Math.pow(vPos.y, 2) + Math.pow(vPos.z, 2));

            if ((distanceToCamera < Math.pow((bvhRefiner._vf.maxDepth - level), 2) * resizeFac / bvhRefiner._vf.factor) || level < bvhRefiner._vf.minDepth) {
                if (bvhRefiner.view.isMovingOrAnimating() && children.length === 0 ||
                    bvhRefiner.view.isMovingOrAnimating() && level >= bvhRefiner._vf.interactionDepth) {
                    shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask, []);
                }
                else {
                    if (children.length === 0) {
                        bvhRefiner.nodeProducer.AddNewNode(that, distanceToCamera);
                        shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask, []);
                    }
                    else {
                        if (childrenReadyState) {
                            for (var i = 0; i < children.length; i++) {
                                children[i].collectDrawables(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                            }
                        }
                        else {
                            shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask, []);
                            for (var i = 0; i < children.length; i++) {
                                children[i].collectDrawables(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                                children[i].Shape()._vf.render = false;
                            }
                        }
                    }
                }
            }
            else {
                shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask, []);
            }
        }
    };



    /*
     * Returns the volume of this node
     * @returns {x3dom.fields.BoxVolume}
     */
    this.getVolume = function() {
        return shape.getVolume();
    };


    /*
     * Returns the level of this node
     * @returns {number}
     */
    this.Level = function () {
        return level;
    };


    // reference to get access to public methods within this node
    var that = this;
    // initializes this node directly after creating
    initialize();
}



/*******************************************************************************
 *******************************************************************************
 **************************** QuadtreeNode2D ***********************************
 *******************************************************************************
 *******************************************************************************
 *
 * Defines one 2D node (plane) of a quadtree that represents a part
 * (nxn vertices) of the whole mesh.
 * @param {object} ctx context
 * @param {x3dom.nodeTypes.BVHRefiner} bvhRefiner root bvhRefiner node
 * @param {number} level level of the node within the quadtree
 * @param {number} nodeNumber id of the node within the level
 * @param {x3dom.fields.SFMatrix4f} nodeTransformation transformation matrix
 *                                  that defines scale and position
 * @param {number} columnNr column number in the wmts matrix within the level
 * @param {number} rowNr row number in the wmts matrix within the level
 * @param {x3dom.nodeTypes.Plane} geometry plane
 * @param {string} path path to the nodes data
 * @param {type} imgNumber number of the image within the path
 * @returns {QuadtreeNode2D}
 */
function QuadtreeNode2D(ctx, bvhRefiner, level, nodeNumber, nodeTransformation,
                        columnNr, rowNr, geometry, path, imgNumber)
{

    // array with the maximal four child nodes
    var children = [];
    // drawable component of this node
    var shape = new x3dom.nodeTypes.Shape();
    // position of the node in world space
    var position = null;
    // true if this component is available and renderable
    var readyState = false;
    // checks if children are ready
    var childrenReadyState = false;
    // true if components are available and renderable
    var exists = true;
    // url of the data source
    var url = bvhRefiner._vf.textureUrl + path + imgNumber + "." + bvhRefiner._vf.textureFormat;
    // defines the resizing factor
    var resizeFac = (bvhRefiner._vf.size.x + bvhRefiner._vf.size.y) / 2.0;
    // object that stores all information to do a frustum culling
    var cullObject = {};



    /*
     * Initializes all nodeTypes that are needed to create the drawable
     * component for this node
     * @returns {null}
     */
    function initialize() {

        // appearance of the drawable component of this node
        var appearance = new x3dom.nodeTypes.Appearance(ctx);
        // texture that should represent the surface-data of this node
        var texture = new x3dom.nodeTypes.ImageTexture(ctx);

        // definition of the nameSpace of this shape
        shape._nameSpace = bvhRefiner._nameSpace;

        // create height-data
        var texProp = new x3dom.nodeTypes.TextureProperties(ctx);
        texProp._vf.boundaryModeS = "CLAMP_TO_EDGE";
        texProp._vf.boundaryModeT = "CLAMP_TO_EDGE";
        texProp._vf.boundaryModeR = "CLAMP_TO_EDGE";
        texProp._vf.minificationFilter = "LINEAR";
        texProp._vf.magnificationFilter = "LINEAR";
        texture.addChild(texProp, "textureProperties");
        texture.nodeChanged();
        // definition of texture
        texture._nameSpace = bvhRefiner._nameSpace;
        texture._vf.url[0] = url;

        // calculate the average position of the node
        position = nodeTransformation.e3();

        // add textures to the appearence of this node
        appearance.addChild(texture);
        texture.nodeChanged();

        // create shape with geometry and appearance data
        shape.addChild(appearance);
        appearance.nodeChanged();
        shape.addChild(geometry);
        geometry.nodeChanged();

        // add shape to bvhRefiner object
        bvhRefiner.addChild(shape);
        shape.nodeChanged();

        // definition the static properties of cullObject
        cullObject.boundedNode = shape;
        cullObject.volume = shape.getVolume();
    }



    /*
     * Creates the four children
     * @returns {null}
     */
    this.CreateChildren = function () {
        create();
    };



    /*
     * Creates the four children
     * @returns {null}
     */
    function create() {

        // calculation of children number nodeNumber within their level
        var deltaR = Math.sqrt(Math.pow(4, level));
        var deltaR1 = Math.sqrt(Math.pow(4, level + 1));
        var lt = Math.floor(nodeNumber / deltaR) * 4 * deltaR +
            (nodeNumber % deltaR) * 2;
        var rt = lt + 1;
        var lb = lt + deltaR1;
        var rb = lb + 1;

        // calculation of the scaling factor
        var s = (bvhRefiner._vf.size).multiply(0.25);

        // creation of all children
        children.push(new QuadtreeNode2D(ctx, bvhRefiner, (level + 1), lt,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(-s.x, s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2), geometry, path + imgNumber + "/", 1));
        children.push(new QuadtreeNode2D(ctx, bvhRefiner, (level + 1), rt,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(s.x, s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2), geometry, path + imgNumber + "/", 3));
        children.push(new QuadtreeNode2D(ctx, bvhRefiner, (level + 1), lb,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(-s.x, -s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2 + 1), geometry, path + imgNumber + "/", 2));
        children.push(new QuadtreeNode2D(ctx, bvhRefiner, (level + 1), rb,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(s.x, -s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2 + 1), geometry, path + imgNumber + "/", 4));
    }



    /*
     * Returns the shape of this node
     * @returns {x3dom.nodeTypes.Shape}
     */
    this.Shape = function () {
        return shape;
    };



    /*
     * Runs only local ready() method. This is needed from parent to ask if
     * all children are ready to render or not
     * @returns {Boolean} true if ready to render, else false
     */
    this.Ready = function(){
        if (shape._webgl !== undefined && shape._webgl.texture !== undefined) {
            return ready();
        }

        return false;
    };



    /*
     * Iterates through all textures of this node and sets readState parameter
     * to true if all textures have been loaded to gpu yet, false if not.
     * @returns {Boolean} true if ready to render, else false
     */
    function ready() {
        readyState = true;
        for (var i = 0; i < shape._webgl.texture.length; i++){
            if (!shape._webgl.texture[i].texture.ready){
                readyState = false;
            }


        }

        return readyState;
    }



    /*
     * Updates the loading state of children and initializes this node
     * if this wasn't done before
     * @param {x3dom.DrawableCollection} drawableCollection
     * @param {x3dom.fields.SFMatrix4f} transform outer transformation matrix
     * @returns {null}
     */
    function updateLoadingState(drawableCollection, transform){

        childrenReadyState = true;
        for (var i = 0; i < children.length; i++){
            if (!children[i].Ready()) {
                childrenReadyState = false;
            }
        }

        if (children.length < 4){
            childrenReadyState = false;
        }
        else if (childrenReadyState) {
            for (var i = 0; i < children.length; i++){
                children[i].Shape()._vf.render = true;
            }
        }


        if (shape._webgl === undefined || shape._webgl.texture === undefined) {
            drawableCollection.context.setupShape(drawableCollection.gl,
                {shape:shape, transform:transform},
                drawableCollection.viewarea);
        }
        else {
            ready();
        }

    }



    /*
     * Decides to create new children and if the node shoud be drawn or not
     * @param {x3dom.fields.SFMatrix4f} transform outer transformation matrix
     * @param {x3dom.DrawableCollection} drawableCollection
     * @param {bool} singlePath
     * @param {bool} invalidateCache
     * @param {number} planeMask
     * @returns {null}
     */
    this.collectDrawables = function (transform, drawableCollection,
                                      singlePath, invalidateCache, planeMask) {

        // definition the actual transformation of the node
        cullObject.localMatrix = nodeTransformation;
        // Checks the actual loading state of itself and children if something wasn't loaded in last frame
        if (!readyState || !childrenReadyState) { updateLoadingState(drawableCollection, nodeTransformation); }

        if (readyState && (planeMask = drawableCollection.cull(nodeTransformation, cullObject, singlePath, planeMask)) > 0) {
            var mat_view = drawableCollection.viewMatrix;
            var vPos = mat_view.multMatrixPnt(nodeTransformation.multMatrixPnt(position));
            var distanceToCamera = Math.sqrt(Math.pow(vPos.x, 2) + Math.pow(vPos.y, 2) + Math.pow(vPos.z, 2));

            if ((distanceToCamera < Math.pow((bvhRefiner._vf.maxDepth - level), 2) * resizeFac / bvhRefiner._vf.factor) || level < bvhRefiner._vf.minDepth) {
                if (bvhRefiner.view.isMovingOrAnimating() && children.length === 0 ||
                    bvhRefiner.view.isMovingOrAnimating() && level >= bvhRefiner._vf.interactionDepth) {
                    shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask, []);
                }
                else {
                    if (children.length === 0) {
                        bvhRefiner.nodeProducer.AddNewNode(that, distanceToCamera);
                        shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask, []);
                    }
                    else {
                        if (childrenReadyState) {
                            for (var i = 0; i < children.length; i++) {
                                children[i].collectDrawables(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                            }
                        }
                        else {
                            shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask, []);
                            for (var i = 0; i < children.length; i++) {
                                children[i].collectDrawables(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                                children[i].Shape()._vf.render = false;
                            }
                        }
                    }
                }
            }
            else {
                shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask, []);
            }
        }
    };



    /*
     * Returns the volume of this node
     * @returns {x3dom.fields.BoxVolume}
     */
    this.getVolume = function() {
        return shape.getVolume();
    };


    /*
     * Returns the level of this node
     * @returns {number}
     */
    this.Level = function () {
        return level;
    };



    // reference to get access to public methods within this node
    var that = this;
    // initializes this node directly after creating
    initialize();
}



/*******************************************************************************
 *******************************************************************************
 **************************** QuadtreeNode3D ***********************************
 *******************************************************************************
 *******************************************************************************
 *
 * Defines one 3D node (plane with displacement) of a quadtree that represents
 * a part (nxn vertices) of the whole mesh.
 * @param {object} ctx context
 * @param {x3dom.nodeTypes.BVHRefiner} bvhRefiner root bvhRefiner node
 * @param {number} level level of the node within the quadtree
 * @param {number} nodeNumber id of the node within the level
 * @param {x3dom.fields.SFMatrix4f} nodeTransformation transformation matrix
 *                                  that defines scale and position
 * @param {number} columnNr column number in the wmts matrix within the level
 * @param {number} rowNr row number in the wmts matrix within the level
 * @param {x3dom.nodeTypes.Plane} geometry plane
 * @returns {QuadtreeNode3D}
 */
function QuadtreeNode3D(ctx, bvhRefiner, level, nodeNumber, nodeTransformation,
                        columnNr, rowNr, geometry)
{
    // array with the maximal four child nodes
    var children = [];
    // neighborhood of the node (0=left, 1=right, 2=bottom, 3=top)
    var neighbors = [];
    // drawable component of this node
    var shape = new x3dom.nodeTypes.Shape();
    // position of the node in world space
    var position = null;
    // address of the image for the bvhRefiner surface
    var imageAddressColor = bvhRefiner._vf.textureUrl + "/" + level + "/" +
        columnNr + "/" + rowNr + "." +
        (bvhRefiner._vf.textureFormat).toLowerCase();
    // address of the image for the bvhRefiner height-data
    var imageAddressHeight = bvhRefiner._vf.elevationUrl + "/" + level + "/" +
        columnNr + "/" + rowNr + "." +
        (bvhRefiner._vf.elevationFormat).toLowerCase();
    if (bvhRefiner._vf.normalUrl !== "")
    // address of the image for the bvhRefiner normal-data
        var imageAddressNormal = bvhRefiner._vf.normalUrl + "/" + level + "/" +
            columnNr + "/" + rowNr + "." +
            (bvhRefiner._vf.normalFormat).toLowerCase();
    // true if this component is available and renderable
    var readyState = false;
    // checks if children are ready
    var childrenReadyState = false;
    // defines the resizing factor
    var resizeFac = (bvhRefiner._vf.size.x + bvhRefiner._vf.size.y) / 2.0;
    // object that stores all information to do a frustum culling
    var cullObject = {};
    // last indice number of mesh
    var lastIndice = 0;
    // triangulation attributes --> offset and count of triangulation buffer
    var triangulationAttributes = null;



    /*
     * Initializes all nodeTypes that are needed to create the drawable
     * component for this node
     */
    function initialize() {

        // appearance of the drawable component of this node
        var appearance = new x3dom.nodeTypes.Appearance(ctx);
        // multiTexture to get heightmap and colormap to gpu
        var textures = new x3dom.nodeTypes.MultiTexture(ctx);
        // texture that should represent the surface-data of this node
        var colorTexture = new x3dom.nodeTypes.ImageTexture(ctx);
        // texture that should represent the height-data of this node
        var heightTexture = new x3dom.nodeTypes.ImageTexture(ctx);
        // texture that should represent the normal-data of this node
        var normalTexture = new x3dom.nodeTypes.ImageTexture(ctx);
        // creating the special shader for these nodes
        var composedShader = new x3dom.nodeTypes.ComposedShader(ctx);

        // definition of the nameSpace of this shape
        shape._nameSpace = bvhRefiner._nameSpace;

        // calculate the average position of the node
        position = nodeTransformation.e3();
        position.z = bvhRefiner._vf.maxElevation / 2;

        // creating the special vertex-shader for bvhRefiner-nodes
        var vertexShader = new x3dom.nodeTypes.ShaderPart(ctx);
        vertexShader._vf.type = 'vertex';
        vertexShader._vf.url[0] = createVertexShader();

        // creating the special fragment-shader for bvhRefiner-nodes
        var fragmentShader = new x3dom.nodeTypes.ShaderPart(ctx);
        fragmentShader._vf.type = 'fragment';
        fragmentShader._vf.url[0] = createFragmentShader();

        // create complete-shader with vertex- and fragment-shader
        composedShader.addChild(vertexShader, 'parts');
        composedShader.addChild(fragmentShader, 'parts');

        var colorTexProp = new x3dom.nodeTypes.TextureProperties(ctx);
        colorTexProp._vf.boundaryModeS = "CLAMP_TO_EDGE";
        colorTexProp._vf.boundaryModeT = "CLAMP_TO_EDGE";
        colorTexProp._vf.boundaryModeR = "CLAMP_TO_EDGE";
        colorTexProp._vf.minificationFilter = "LINEAR";
        colorTexProp._vf.magnificationFilter = "LINEAR";
        colorTexture.addChild(colorTexProp, "textureProperties");
        colorTexture.nodeChanged();
        // create texture-data of this node with url's of the texture data
        colorTexture._nameSpace = bvhRefiner._nameSpace;
        colorTexture._vf.url[0] = imageAddressColor;
        colorTexture._vf.repeatT = false;
        colorTexture._vf.repeatS = false;
        textures.addChild(colorTexture, 'texture');
        colorTexture.nodeChanged();
        var colorTextureField = new x3dom.nodeTypes.Field(ctx);
        colorTextureField._vf.name = 'texColor';
        colorTextureField._vf.type = 'SFInt32';
        colorTextureField._vf.value = 0;
        composedShader.addChild(colorTextureField, 'fields');
        colorTextureField.nodeChanged();

        // create height-data
        var heightTexProp = new x3dom.nodeTypes.TextureProperties(ctx);
        heightTexProp._vf.boundaryModeS = "CLAMP_TO_EDGE";
        heightTexProp._vf.boundaryModeT = "CLAMP_TO_EDGE";
        heightTexProp._vf.boundaryModeR = "CLAMP_TO_EDGE";
        heightTexProp._vf.minificationFilter = "NEAREST";
        heightTexProp._vf.magnificationFilter = "NEAREST";
        heightTexture.addChild(heightTexProp, "textureProperties");
        heightTexture.nodeChanged();
        heightTexture._nameSpace = bvhRefiner._nameSpace;
        heightTexture._vf.url[0] = imageAddressHeight;
        heightTexture._vf.repeatT = false;
        heightTexture._vf.repeatS = false;
        heightTexture._vf.scale = false;
        textures.addChild(heightTexture, 'texture');
        heightTexture.nodeChanged();
        var heightTextureField = new x3dom.nodeTypes.Field(ctx);
        heightTextureField._vf.name = 'texHeight';
        heightTextureField._vf.type = 'SFInt32';
        heightTextureField._vf.value = 1;
        composedShader.addChild(heightTextureField, 'fields');
        heightTextureField.nodeChanged();

        if (bvhRefiner._vf.normalUrl !== "") {
            var normalTexProp = new x3dom.nodeTypes.TextureProperties(ctx);
            normalTexProp._vf.boundaryModeS = "CLAMP_TO_EDGE";
            normalTexProp._vf.boundaryModeT = "CLAMP_TO_EDGE";
            normalTexProp._vf.boundaryModeR = "CLAMP_TO_EDGE";
            normalTexProp._vf.minificationFilter = "LINEAR";
            normalTexProp._vf.magnificationFilter = "LINEAR";
            normalTexture.addChild(normalTexProp, "textureProperties");
            normalTexture.nodeChanged();
            // create normal-data
            normalTexture._nameSpace = bvhRefiner._nameSpace;
            normalTexture._vf.url[0] = imageAddressNormal;
            normalTexture._vf.repeatT = false;
            normalTexture._vf.repeatS = false;
            textures.addChild(normalTexture, 'texture');
            normalTexture.nodeChanged();
            var normalTextureField = new x3dom.nodeTypes.Field(ctx);
            normalTextureField._vf.name = 'texNormal';
            normalTextureField._vf.type = 'SFInt32';
            normalTextureField._vf.value = 2;
            composedShader.addChild(normalTextureField, 'fields');
            normalTextureField.nodeChanged();
        }

        // transmit maximum elevation value to gpu
        var maxHeight = new x3dom.nodeTypes.Field(ctx);
        maxHeight._vf.name = 'maxElevation';
        maxHeight._vf.type = 'SFFloat';
        maxHeight._vf.value = bvhRefiner._vf.maxElevation;
        composedShader.addChild(maxHeight, 'fields');
        maxHeight.nodeChanged();

        // add textures to the appearence of this node
        appearance.addChild(textures);
        textures.nodeChanged();
        appearance.addChild(composedShader);
        composedShader.nodeChanged();

        // create shape with geometry and appearance data
        shape.addChild(appearance);
        appearance.nodeChanged();
        shape.addChild(geometry);

        // add shape to bvhRefiner object
        bvhRefiner.addChild(shape);
        shape.nodeChanged();

        // definition the static properties of cullObject
        cullObject.boundedNode = shape;
        cullObject.volume = shape.getVolume();
        // setting max and min in z-direction to get the complete volume
        cullObject.volume.max.z = bvhRefiner._vf.maxElevation;
        cullObject.volume.min.z = 0;

        cullObject.volume.center = cullObject.volume.min.add(cullObject.volume.max).multiply(0.5);
        cullObject.volume.transform(nodeTransformation);
        //shape._graph.volume = cullObject.volume;

        calculateNeighborhood();
    }



    function calculateNeighborhood() {

        // stores the start-ID of this level in quadList
        var levelStartID = 0;

        // calculate id in quadList where to store this quad
        for (var i = 0; i < level; i++) {
            levelStartID += Math.pow(4, i);
        }
        var sid = levelStartID + nodeNumber;
        bvhRefiner.nodeList[sid] = that;

        var c = Math.sqrt(Math.pow(4, level));
        // calculate neighbor-IDs
        // on the left side of the quad
        neighbors[0] = levelStartID + (Math.ceil(((nodeNumber + 1) / c) - 1) * c + ((nodeNumber + (c - 1)) % c));
        // on the right side of the quad
        neighbors[1] = levelStartID + (Math.ceil(((nodeNumber + 1) / c) - 1) * c + ((nodeNumber + 1) % c));
        // on the top side of the quad
        neighbors[3] = levelStartID + (nodeNumber + (c * (c - 1))) % (Math.pow(4, level));
        // on the bottom side of the quad
        neighbors[2] = levelStartID + (nodeNumber + c) % (Math.pow(4, level));

        if (columnNr === 0) { neighbors[0] = -1; }
        if (rowNr === 0) { neighbors[3] = -1; }
        if (columnNr === c - 1) { neighbors[1] = -1; }
        if (rowNr === c - 1) { neighbors[2] = -1; }
    }



    /*
     * Creates the code for the vertex shader
     * @returns {String} code of the vertex shader
     */
    function createVertexShader() {
        if (bvhRefiner._vf.normalUrl !== "")
            return "attribute vec3 position;\n" +
                "attribute vec3 texcoord;\n" +
                "uniform mat4 modelViewMatrix;\n" +
                "uniform mat4 modelViewProjectionMatrix;\n" +
                "uniform sampler2D texColor;\n" +
                "uniform sampler2D texHeight;\n" +
                "uniform float maxElevation;\n" +
                "uniform sampler2D texNormal;\n" +
                "varying vec2 texC;\n" +
                "varying vec3 vLight;\n" +
                "const float shininess = 32.0;\n" +
                "\n" +
                "void main(void) {\n" +
                "    vec3 uLightPosition = vec3(160.0, -9346.0, 4806.0);\n" +
                "    vec4 colr = texture2D(texColor, vec2(texcoord[0], 1.0-texcoord[1]));\n" +
                "    vec3 uAmbientMaterial = vec3(1.0, 1.0, 0.9);" +
                "    vec3 uAmbientLight = vec3(0.5, 0.5, 0.5);" +
                "    vec3 uDiffuseMaterial = vec3(0.7, 0.7, 0.7);" +
                "    vec3 uDiffuseLight = vec3(1.0, 1.0, 1.0);" +
                "    vec4 vertexPositionEye4 = modelViewMatrix * vec4(position, 1.0);" +
                "    vec3 vertexPositionEye3 = vec3((modelViewMatrix * vec4(vertexPositionEye4.xyz, 1.0)).xyz);" +
                "    vec3 vectorToLightSource = normalize(uLightPosition - vertexPositionEye3);" +
                "    vec4 height = texture2D(texHeight, vec2(texcoord[0], 1.0 - texcoord[1]));\n" +
                "    vec4 normalEye = 2.0 * texture2D(texNormal, vec2(texcoord[0], 1.0-texcoord[1])) - 1.0;\n" +
                "    float diffuseLightWeighting = max(dot(normalEye.xyz, vectorToLightSource), 0.0);" +
                "    texC = vec2(texcoord[0], 1.0-texcoord[1]);\n" +
                "    vec3 diffuseReflectance = uDiffuseMaterial * uDiffuseLight * diffuseLightWeighting;" +
                "    vec3 uSpecularMaterial = vec3(0.0, 0.0, 0.0);" +
                "    vec3 uSpecularLight = vec3(1.0, 1.0, 1.0);" +
                "    vec3 reflectionVector = normalize(reflect(-vectorToLightSource, normalEye.xyz));" +
                "    vec3 viewVectorEye = -normalize(vertexPositionEye3);" +
                "    float rdotv = max(dot(reflectionVector, viewVectorEye), 0.0);" +
                "    float specularLightWeight = pow(rdotv, shininess);" +
                "    vec3 specularReflection = uSpecularMaterial * uSpecularLight * specularLightWeight;" +
                "    vLight = vec4(uAmbientMaterial * uAmbientLight + diffuseReflectance + specularReflection, 1.0).xyz;" +
                "    gl_Position = modelViewProjectionMatrix * vec4(position.xy, height.x * maxElevation, 1.0);\n" +
                "}\n";
        else
            return "attribute vec3 position;\n" +
                "attribute vec3 texcoord;\n" +
                "uniform mat4 modelViewProjectionMatrix;\n" +
                "uniform sampler2D texHeight;\n" +
                "uniform float maxElevation;\n" +
                "varying vec2 texC;\n" +
                "\n" +
                "void main(void) {\n" +
                "    vec4 height = texture2D(texHeight, vec2(texcoord[0], 1.0 - texcoord[1]));\n" +
                "    texC = vec2(texcoord[0], 1.0-texcoord[1]);\n" +
                "    gl_Position = modelViewProjectionMatrix * vec4(position.xy, height.x * maxElevation, 1.0);\n" +
                "}\n";
    }



    /*
     * Creates the code for the fragment shader
     * @returns {String} code of the fragment shader
     */
    function createFragmentShader() {
        if (bvhRefiner._vf.normalUrl !== "")
            return "#ifdef GL_ES\n" +
                "precision highp float;\n" +
                "#endif\n" +
                "uniform sampler2D texColor;\n" +
                "uniform sampler2D texNormal;\n" +
                "varying vec2 texC;\n" +
                "varying vec3 vLight;\n" +
                "\n" +
                "\n" +
                "void main(void) {\n" +
                "    vec4 normal = 2.0 * texture2D(texNormal, texC) - 1.0;\n" +
                "    vec4 colr = texture2D(texColor, texC);\n" +
                "    gl_FragColor = vec4(colr.xyz * vLight, colr.w);\n" +
                "}\n";
        else
            return "#ifdef GL_ES\n" +
                "precision highp float;\n" +
                "#endif\n" +
                "uniform sampler2D texColor;\n" +
                "varying vec2 texC;\n" +
                "\n" +
                "\n" +
                "void main(void) {\n" +
                "    gl_FragColor = texture2D(texColor, texC);\n" +
                "}\n";
    }



    this.CreateChildren = function() {
        create();
    };



    /*
     * Creates the four children
     */
    function create() {

        // calculation of children number nodeNumber within their level
        var deltaR = Math.sqrt(Math.pow(4, level));
        var deltaR1 = Math.sqrt(Math.pow(4, level + 1));
        var lt = Math.floor(nodeNumber / deltaR) * 4 * deltaR +
            (nodeNumber % deltaR) * 2;
        var rt = lt + 1;
        var lb = lt + deltaR1;
        var rb = lb + 1;

        // calculation of the scaling factor
        var s = (bvhRefiner._vf.size).multiply(0.25);

        // creation of all children
        children.push(new QuadtreeNode3D(ctx, bvhRefiner, (level + 1), lt,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(-s.x, s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2), geometry));
        children.push(new QuadtreeNode3D(ctx, bvhRefiner, (level + 1), rt,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(s.x, s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2), geometry));
        children.push(new QuadtreeNode3D(ctx, bvhRefiner, (level + 1), lb,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(-s.x, -s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2 + 1), geometry));
        children.push(new QuadtreeNode3D(ctx, bvhRefiner, (level + 1), rb,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(s.x, -s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2 + 1), geometry));
    }



    this.Shape = function(){
        return shape;
    };



    /*
     * Returns if the children of this node exist and are ready to render
     */
    this.ChildrenReady = function(){
        return childrenReadyState;
    };



    /*
     * Runs only local ready() method. This is needed from parent to ask if
     * all children are ready to render or not
     */
    this.Ready = function(){
        if (shape._webgl !== undefined && shape._webgl.texture !== undefined) {
            return ready();
        }

        return false;
    };



    /*
     * Iterates through all textures of this node and sets readState parameter
     * to true if all textures have been loaded to gpu yet, false if not.
     */
    function ready() {
        readyState = true;
        for (var i = 0; i < shape._webgl.texture.length; i++){
            if (!shape._webgl.texture[i].texture.ready){
                readyState = false;
            }
        }

        return readyState;
    }



    /*
     * Updates the loading state of children and initializes this node
     * if this wasn't done before
     */
    function updateLoadingState(drawableCollection, transform){

        childrenReadyState = true;
        for (var i = 0; i < children.length; i++){
            if (!children[i].Ready()) {
                childrenReadyState = false;
            }
        }

        if (children.length < 4){
            childrenReadyState = false;
        }
        else if (childrenReadyState) {
            for (var i = 0; i < children.length; i++){
                children[i].Shape()._vf.render = true;
            }
        }

        if (shape._webgl === undefined || shape._webgl.texture === undefined) {
            drawableCollection.context.setupShape(drawableCollection.gl,
                {shape:shape, transform:transform},
                drawableCollection.viewarea);
        }
        else {
            ready();
        }

    }




    /*
     * Decides to create new children and if the node shoud be drawn or not
     * @param {x3dom.fields.SFMatrix4f} transform outer transformation matrix
     * @param {x3dom.DrawableCollection} drawableCollection
     * @param {bool} singlePath
     * @param {bool} invalidateCache
     * @param {number} planeMask
     * @returns {null}
     */
    this.collectDrawables = function (transform, drawableCollection, singlePath, invalidateCache, planeMask) {

        // TODO: IMPLEMENT RIGHT
        drawableCollection.frustumCulling = false;


        // definition the actual transformation of the node
        cullObject.localMatrix = nodeTransformation;
        // Checks the actual loading state of itself and children if something wasn't loaded in last frame
        if (!readyState || !childrenReadyState) {
            updateLoadingState(drawableCollection, nodeTransformation);
        }
        var mat_view = drawableCollection.viewMatrix;
        var vPos = mat_view.multMatrixPnt(nodeTransformation.multMatrixPnt(position));
        var distanceToCamera = Math.sqrt(Math.pow(vPos.x, 2) + Math.pow(vPos.y, 2) + Math.pow(vPos.z, 2));

        //if (readyState && (planeMask = drawableCollection.cull(nodeTransformation, shape.graphState(), singlePath, planeMask)) > 0) {
        if (readyState && vPos.z - (cullObject.volume.diameter / 2) < 0) {
            if ((distanceToCamera < Math.pow((bvhRefiner._vf.maxDepth - level), 2) * resizeFac / bvhRefiner._vf.factor) ||
                level < bvhRefiner._vf.minDepth) {
                if (bvhRefiner.view.isMovingOrAnimating() && (children.length == 0 || level >= bvhRefiner._vf.interactionDepth)){
                    render(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                }
                else {
                    if (children.length === 0) {
                        bvhRefiner.nodeProducer.AddNewNode(that, distanceToCamera);
                        render(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                    }
                    else {
                        if (childrenReadyState){
                            for (var i = 0; i < children.length; i++) {
                                children[i].collectDrawables(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                            }
                        }
                        else {
                            render(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                            for (var i = 0; i < children.length; i++) {
                                children[i].collectDrawables(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                                children[i].Shape()._vf.render = false;
                            }
                        }
                    }
                }
            }
            else {
                render(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
            }
        }
    };



    /*
     * Decides if this node should be rendered or the children of this node
     * @param {x3dom.DrawableCollection} drawableCollection
     * @returns {Boolean}
     */
    this.hasHigherRenderLevel = function(drawableCollection){

        var mat_view = drawableCollection.viewMatrix;
        var vPos = mat_view.multMatrixPnt(nodeTransformation.multMatrixPnt(position));
        var distanceToCamera = Math.sqrt(Math.pow(vPos.x, 2) + Math.pow(vPos.y, 2) + Math.pow(vPos.z, 2));

        if (distanceToCamera < Math.pow((bvhRefiner._vf.maxDepth - level), 2) * resizeFac / bvhRefiner._vf.factor){
            return true;
        }


        return false;
    };



    /*
     * Renders the object with the required patch version
     * @param {x3dom.fields.SFMatrix4f} transform outer transformation matrix
     * @param {x3dom.DrawableCollection} drawableCollection
     * @param {bool} singlePath
     * @param {bool} invalidateCache
     * @param {number} planeMask
     * @returns {null}
     */
    function render(transform, drawableCollection, singlePath, invalidateCache, planeMask){

        var hasNeighborHigherResolution = [];
        // Calculation if neighbors levels
        for (var i = 0; i < neighbors.length; i++){
            if (bvhRefiner.nodeList[neighbors[i]] !== undefined) {
                if (bvhRefiner.nodeList[neighbors[i]].ChildrenReady() &&
                    bvhRefiner.nodeList[neighbors[i]].hasHigherRenderLevel(drawableCollection))
                    hasNeighborHigherResolution.push(true);
                else
                    hasNeighborHigherResolution.push(false);
            }
            else {
                hasNeighborHigherResolution.push(false);
            }
        }

        var indiceNumber = 0;
        //hasNeighborHigherResolution --> 0=left, 1=right, 2=bottom, 3=top
        if (hasNeighborHigherResolution[3]) {
            if (hasNeighborHigherResolution[1]) {
                indiceNumber = 5;
            }
            else if (hasNeighborHigherResolution[0]) {
                indiceNumber = 6;
            }
            else {
                indiceNumber = 4;
            }
        }
        else if (hasNeighborHigherResolution[2]) {
            if (hasNeighborHigherResolution[1]) {
                indiceNumber = 8;
            }
            else if (hasNeighborHigherResolution[0]) {
                indiceNumber = 7;
            }
            else {
                indiceNumber = 3;
            }
        }
        else if (hasNeighborHigherResolution[0]) {
            indiceNumber = 1;
        }
        else if (hasNeighborHigherResolution[1]) {
            indiceNumber = 2;
        }

        if (lastIndice !== indiceNumber || triangulationAttributes === null){
            triangulationAttributes = shape._cf.geometry.node.getTriangulationAttributes(indiceNumber);
            lastIndice = indiceNumber;
        }
        shape._tessellationProperties = [ triangulationAttributes ];
        shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask, []);
    }



    /*
     * Returns the volume of this node
     */
    this.getVolume = function() {
        // TODO; implement correctly, for now just use first shape as workaround
        return shape.getVolume();
    };



    this.Level = function() {
        return level;
    };


    var that = this;
    // initializes this node directly after creating
    initialize();
}




/*****************************************************************************************************************************
 *****************************************************************************************************************************
 ************************************************ QuadtreeNodeBin ************************************************************
 *****************************************************************************************************************************
 ****************************************************************************************************************************/

/*
 * Defines one node of a quadtree that represents a part (nxn vertices) of
 * the whole mesh, that represents a binary geometry object.
 * @param {object} ctx context
 * @param {x3dom.nodeTypes.BVHRefiner} bvhRefiner root bvhRefiner node
 * @param {number} level level of the node within the quadtree
 * @param {number} columnNr column number in the wmts matrix within the level
 * @param {number} rowNr row number in the wmts matrix within the level
 * @param {number} resizeFac defines the resizing factor. Can be null on init
 * @returns {QuadtreeNodeBin}
 */
function QuadtreeNodeBin(ctx, bvhRefiner, level, columnNr, rowNr, resizeFac)
{
    // object that stores all information to do a frustum culling
    var cullObject = {};
    // temporary variable to store the view matrix
    var mat_view;
    // temporary position of this node in view space
    var vPos;
    // temporary distance to camera in view space
    var distanceToCamera;
    // factor redefinition to get a view about the whole scene on level three
    var fac = ((1 / 4 * Math.pow(level, 2) + 1.5) * 0.1) * bvhRefiner._vf.factor;
    // array with the maximal four child nodes
    var children = [];
    // true if a file for the children is available
    var childrenExist = false;
    // true if this component is available and renderable
    var readyState = false;
    // checks if children are ready
    var childrenReadyState = false;
    // path to x3d-file that should be loaded
    var path = bvhRefiner._vf.url + "/" + level + "/" + columnNr + "/";
    // address of the image for the bvhRefiner height-data
    var file = path + rowNr + ".x3d";
    // position of the node in world space
    var position = new x3dom.fields.SFVec3f(0.0, 0.0, 0.0);
    // stores if file has been loaded
    var exists = false;
    // drawable component of this node
    var shape = new x3dom.nodeTypes.Shape(ctx);


    // loader for binary geometry files
    var xhr = new XMLHttpRequest();
    xhr.open("GET", file, false);
    // Try to load the binary geometry files
    try {
        //xhr.send();
        x3dom.RequestManager.addRequest(xhr);

        var xmlDoc = xhr.responseXML;
        if (xmlDoc !== null) {
            var replacer = new RegExp("\"", "g");
            createGeometry(shape);
            initialize();
            exists = true;
        }
    }
    catch (exp) {
        x3dom.debug.logException("Error loading file '" + file + "': " + exp);
    }


    this.Exists = function () {
        return exists;
    };


    this.Shape = function () {
        return shape;
    };



    /*
     * creates the geometry of this node
     */
    function createGeometry(parent) {
        // definition of nameSpace
        this._nameSpace = new x3dom.NodeNameSpace("", bvhRefiner._nameSpace.doc);
        this._nameSpace.setBaseURL(bvhRefiner._nameSpace.baseURL + path);
        var tempShape = xmlDoc.getElementsByTagName("Shape")[0];
        shape = this._nameSpace.setupTree(tempShape);
        if (!bvhRefiner._vf.useNormals) {
            var appearance = new x3dom.nodeTypes.Appearance(ctx);
            var material = new x3dom.nodeTypes.Material(ctx);
            appearance.addChild(material);
            shape._cf.appearance = appearance;
        }
        position = x3dom.fields.SFVec3f.copy(shape._cf.geometry.node._vf.position);
    }



    /*
     * creates the appearance for this node and add it to the dom tree
     */
    function initialize() {

        // bind static cull-properties to cullObject
        cullObject.boundedNode = shape;
        cullObject.volume = shape.getVolume();
    }



    this.CreateChildren = function () {
        create();
    };



    /*
     * creates the four child-nodes
     */
    function create() {
        children.push(new QuadtreeNodeBin(ctx, bvhRefiner, (level + 1), (columnNr * 2), (rowNr * 2), resizeFac));
        children.push(new QuadtreeNodeBin(ctx, bvhRefiner, (level + 1), (columnNr * 2 + 1), (rowNr * 2), resizeFac));
        children.push(new QuadtreeNodeBin(ctx, bvhRefiner, (level + 1), (columnNr * 2), (rowNr * 2 + 1), resizeFac));
        children.push(new QuadtreeNodeBin(ctx, bvhRefiner, (level + 1), (columnNr * 2 + 1), (rowNr * 2 + 1), resizeFac));
    }



    /*
     * Runs only local ready() method. This is needed from parent to ask if
     * all children are ready to render or not
     */
    this.Ready = function () {
        if (shape._webgl !== undefined && shape._webgl.internalDownloadCount !== undefined) {
            return ready();
        }

        return false;
    };



    /*
     * Iterates through all textures of this node and sets readState parameter
     * to true if all textures have been loaded to gpu yet, false if not.
     */
    function ready() {
        readyState = true;

        if (shape._webgl.internalDownloadCount > 0) {
            readyState = false;
        }

        return readyState;
    }



    /*
     * Updates the loading state of children and initializes this node
     * if this wasn't done before
     */
    function updateLoadingState(drawableCollection, transform) {

        childrenReadyState = true;
        for (var i = 0; i < children.length; i++) {
            if (!children[i].Ready()) {
                childrenReadyState = false;
            }
        }

        if (childrenReadyState){
            for (var i = 0; i < children.length; i++){
                children[i].Shape()._vf.render = true;
            }
        }

        if (shape._cf.geometry.node !== null) {
            if (shape._webgl === undefined || shape._webgl.internalDownloadCount === undefined) {
                drawableCollection.context.setupShape(drawableCollection.gl,
                    { shape: shape, transform: transform },
                    drawableCollection.viewarea);
            }
            else {
                ready();
            }
        }
    }



    /*
     * Decides to create new children and if the node shoud be drawn or not
     */
    this.collectDrawables = function (transform, drawableCollection, singlePath, invalidateCache, planeMask) {

        // THIS CALC IS ONLY FOR THE DEMO AND HAS TO BE DELETED AFTER IT
        fac = ((1 / 4 * Math.pow(level, 2) + 1.5) * 0.1) * bvhRefiner._vf.factor;

        // definition the actual transformation of the node
        cullObject.localMatrix = transform;

        // Checks the actual loading state of itself and children if something wasn't loaded in last frame
        if (!readyState || !childrenReadyState) { updateLoadingState(drawableCollection, transform); }

        if (readyState && exists && (planeMask = drawableCollection.cull(transform, cullObject, singlePath, planeMask)) > 0) {
            mat_view = drawableCollection.viewMatrix;
            vPos = mat_view.multMatrixPnt(transform.multMatrixPnt(position));
            distanceToCamera = Math.sqrt(Math.pow(vPos.x, 2) + Math.pow(vPos.y, 2) + Math.pow(vPos.z, 2));

            if ((distanceToCamera < Math.pow((bvhRefiner._vf.maxDepth - level), 2) / fac * 1000) || level < bvhRefiner._vf.minDepth) {
                if (bvhRefiner.view.isMovingOrAnimating() && level >= bvhRefiner._vf.interactionDepth) {
                    shape.collectDrawableObjects(transform, drawableCollection, singlePath, invalidateCache, planeMask, []);
                }
                else {
                    if (children.length === 0) {
                        bvhRefiner.nodeProducer.AddNewNode(that, distanceToCamera);
                        shape.collectDrawableObjects(transform, drawableCollection, singlePath, invalidateCache, planeMask, []);
                    }
                    else if (children.length === 0 && bvhRefiner.createChildren > 0) {
                        shape.collectDrawableObjects(transform, drawableCollection, singlePath, invalidateCache, planeMask, []);
                    }
                    else {
                        if (!childrenExist) {
                            for (var i = 0; i < children.length; i++) {
                                if (children[i].Exists()) {
                                    childrenExist = true;
                                    break;
                                }
                            }
                        }
                        if (childrenExist && childrenReadyState) {
                            for (var i = 0; i < children.length; i++) {
                                children[i].collectDrawables(transform, drawableCollection, singlePath, invalidateCache, planeMask);
                            }
                        }
                        else {
                            for (var i = 0; i < children.length; i++) {
                                children[i].collectDrawables(transform, drawableCollection, singlePath, invalidateCache, planeMask);
                                children[i].Shape()._vf.render = false;
                            }
                            shape.collectDrawableObjects(transform, drawableCollection, singlePath, invalidateCache, planeMask, []);
                        }
                    }
                }
            }
            else {
                shape.collectDrawableObjects(transform, drawableCollection, singlePath, invalidateCache, planeMask, []);
            }
        }
    };



    /*
     * Returns the volume of this node
     */
    this.getVolume = function () {
        // TODO; implement correctly, for now just use first shape as workaround
        return shape.getVolume();
    };



    this.Level = function () {
        return level;
    };


    var that = this;
    // initializes this node directly after creating
    initialize();
}




/*****************************************************************************************************************************
 *****************************************************************************************************************************
 ***************************************************** BVHNode ***************************************************************
 *****************************************************************************************************************************
 ****************************************************************************************************************************/

/*
 * Defines one node of an arbitrary tree that represents a part (nxn vertices)
 * of the entire point cloud
 * @param {object} ctx context
 * @param {x3dom.nodeTypes.BVHRefiner} bvhRefiner root bvhRefiner node
 * @param {number} level level of the node within the quadtree
 * @param {number} columnNr column number in the wmts matrix within the level
 * @param {number} rowNr row number in the wmts matrix within the level
 * @param {number} resizeFac defines the resizing factor. Can be null on init
 * @returns {OctreeNode}
 */
function BVHNode(ctx, bvhRefiner, level, path, imgNumber, count)
{
    // object that stores all information to do a frustum culling
    var cullObject = {};
    // temporary variable to store the view matrix
    var mat_view;
    // temporary position of this node in view space
    var vPos;
    // temporary distance to camera in view space
    var distanceToCamera;
    // factor redefinition to get a view about the whole scene on level three
    var fac = ((1/4 * Math.pow(level, 2) + 1.5) * 0.1) * bvhRefiner._vf.factor;
    // array with the maximal four child nodes
    var children = [];
    // true if a file for the children is available
    var childrenExist = false;
    // true if this component is available and renderable
    var readyState = false;
    // checks if children are ready
    var childrenReadyState = false;
    // address of the image for the bvhRefiner height-data
    var file = bvhRefiner._vf.url + path + imgNumber + ".x3d";
    // position of the node in world space
    var position = new x3dom.fields.SFVec3f(0.0, 0.0, 0.0);
    // stores if file has been loaded
    var exists = false;
    // drawable component of this node
    var shape = new x3dom.nodeTypes.Shape(ctx);


    this.RecalcFactor = function() {
        fac = ((1/4 * Math.pow(level, 2) + 1.5) * 0.1) * bvhRefiner._vf.factor;
        for (var i = 0; i < children.length; i++){
            children[i].RecalcFactor();
        }
    };



    // loader for binary geometry files
    var xhr = new XMLHttpRequest();
    xhr.open("GET", file, false);
    // Try to load the binary geometry files
    try {
        //xhr.send();
        x3dom.RequestManager.addRequest(xhr);

        var xmlDoc = xhr.responseXML;
        if (xmlDoc !== null) {
            var replacer = new RegExp("\"", "g");
            createGeometry(shape);
            initialize();
            exists = true;
        }
    }
    catch (exp) {
        x3dom.debug.logException("Error loading file '" + file + "': " + exp);
    }


    this.Exists = function()
    {
        return exists;
    };


    this.Shape = function(){
        return shape;
    };



    /*
     * creates the geometry of this node
     */
    function createGeometry(parent) {
        // definition of nameSpace
        this._nameSpace = new x3dom.NodeNameSpace("", bvhRefiner._nameSpace.doc);
        this._nameSpace.setBaseURL(bvhRefiner._nameSpace.baseURL + bvhRefiner._vf.url + path);
        var tempShape = xmlDoc.getElementsByTagName("Shape")[0];
        shape = this._nameSpace.setupTree(tempShape);
        if (!bvhRefiner._vf.useNormals){
            var appearance = new x3dom.nodeTypes.Appearance(ctx);
            var material = new x3dom.nodeTypes.Material(ctx);
            appearance.addChild(material);
            shape._cf.appearance = appearance;
        }
        position = x3dom.fields.SFVec3f.copy(shape._cf.geometry.node._vf.position);
    }



    /*
     * creates the appearance for this node and add it to the dom tree
     */
    function initialize() {

        // bind static cull-properties to cullObject
        cullObject.boundedNode = shape;
        cullObject.volume = shape.getVolume();
    }



    this.CreateChildren = function() {
        create();
    };



    /*
     * creates the four child-nodes
     */
    function create() {
        for (var i = 0; i < count; i++){
            children.push(new BVHNode(ctx, bvhRefiner, (level + 1),
                    path + imgNumber + "/",
                    i + 1, count));
        }
    }



    /*
     * Runs only local ready() method. This is needed from parent to ask if
     * all children are ready to render or not
     */
    this.Ready = function(){
        if (shape._webgl !== undefined && shape._webgl.internalDownloadCount !== undefined) {
            return ready();
        }

        return false;
    };



    /*
     * Iterates through all textures of this node and sets readState parameter
     * to true if all textures have been loaded to gpu yet, false if not.
     */
    function ready() {
        return (shape._webgl.internalDownloadCount <= 0);
    }



    /*
     * Updates the loading state of children and initializes this node
     * if this wasn't done before
     */
    function updateLoadingState(drawableCollection, transform){

        for (var i = 0; i < children.length; i++) {
            childrenReadyState = true;
            if (!children[i].Ready()) {
                childrenReadyState = false;
            }
            else {
                children[i].Shape()._vf.render = true;
            }
        }

        if (shape._cf.geometry.node !== null) {
            if (shape._webgl === undefined || shape._webgl.internalDownloadCount === undefined) {
                drawableCollection.context.setupShape(drawableCollection.gl,
                    {shape:shape, transform:transform},
                    drawableCollection.viewarea);
            }
            else {
                ready();
            }
        }
    }



    /*
     * Decides to create new children and if the node shoud be drawn or not
     */
    this.collectDrawables = function (transform, drawableCollection, singlePath, invalidateCache, planeMask) {

        // THIS CALC IS ONLY FOR THE DEMO AND HAS TO BE DELETED AFTER IT
        fac = ((1/4 * Math.pow(level, 2) + 1.5) * 0.1) * bvhRefiner._vf.factor;

        // definition the actual transformation of the node
        cullObject.localMatrix = transform;

        // Checks the actual loading state of itself and children if something wasn't loaded in last frame
        if (!readyState || !childrenReadyState) { updateLoadingState(drawableCollection, transform); }

        if (readyState && exists && (planeMask = drawableCollection.cull(transform, cullObject, singlePath, planeMask)) > 0) {
            mat_view = drawableCollection.viewMatrix;
            vPos = mat_view.multMatrixPnt(transform.multMatrixPnt(position));
            distanceToCamera = Math.sqrt(Math.pow(vPos.x, 2) + Math.pow(vPos.y, 2) + Math.pow(vPos.z, 2));

            if ((distanceToCamera < Math.pow((bvhRefiner._vf.maxDepth - level), 2) / fac) || level < bvhRefiner._vf.minDepth) {
                if (bvhRefiner.view.isMovingOrAnimating() && level >= bvhRefiner._vf.interactionDepth) {
                    shape.collectDrawableObjects(transform, drawableCollection, singlePath, invalidateCache, planeMask, []);
                }
                else {
                    if (children.length === 0) {
                        bvhRefiner.nodeProducer.AddNewNode(that, distanceToCamera);
                        shape.collectDrawableObjects(transform, drawableCollection, singlePath, invalidateCache, planeMask, []);
                    }
                    else if (children.length === 0 && bvhRefiner.createChildren > 0) {
                        shape.collectDrawableObjects(transform, drawableCollection, singlePath, invalidateCache, planeMask, []);
                    }
                    else {
                        if (!childrenExist){
                            for (var i = 0; i < children.length; i++) {
                                if (children[i].Exists()) {
                                    childrenExist = true;
                                    break;
                                }
                            }
                        }
                        if (childrenExist && childrenReadyState){
                            for (var i = 0; i < children.length; i++) {
                                children[i].collectDrawables(transform, drawableCollection, singlePath, invalidateCache, planeMask);
                            }
                        }
                        else {
                            for (var i = 0; i < children.length; i++) {
                                children[i].collectDrawables(transform, drawableCollection, singlePath, invalidateCache, planeMask);
                                children[i].Shape()._vf.render = false;
                            }
                            shape.collectDrawableObjects(transform, drawableCollection, singlePath, invalidateCache, planeMask, []);
                        }
                    }
                }
            }
            else {
                shape.collectDrawableObjects(transform, drawableCollection, singlePath, invalidateCache, planeMask, []);
            }
        }
    };



    /*
     * Returns the volume of this node
     */
    this.getVolume = function() {
        // TODO; implement correctly, for now just use first shape as workaround
        return shape.getVolume();
    };



    this.Level = function() {
        return level;
    };


    var that = this;
    // initializes this node directly after creating
    initialize();
}





/*
 * Defines one 3D node (plane with displacement) of a quadtree that represents
 * a part (nxn vertices) of the whole mesh.
 * @param {object} ctx context
 * @param {x3dom.nodeTypes.BVHRefiner} bvhRefiner root bvhRefiner node
 * @param {number} level level of the node within the quadtree
 * @param {number} nodeNumber id of the node within the level
 * @param {x3dom.fields.SFMatrix4f} nodeTransformation transformation matrix that defines scale and position
 * @param {number} columnNr column number in the wmts matrix within the level
 * @param {number} rowNr row number in the wmts matrix within the level
 * @param {x3dom.nodeTypes.Plane} geometry plane
 * @returns {QuadtreeNode3D}
 */
function QuadtreeNode3D_NEW(ctx, bvhRefiner, level, nodeNumber, nodeTransformation,
                            columnNr, rowNr, geometry)
{
    // array with the maximal four child nodes
    var children = [];
    // drawable component of this node
    var shape = new x3dom.nodeTypes.Shape();
    // position of the node in world space
    var position = null;
    // address of the image for the bvhRefiner surface
    var imageAddressColor = bvhRefiner._vf.textureUrl + "/" + level + "/" +
        columnNr + "/" + rowNr + "." +
        (bvhRefiner._vf.textureFormat).toLowerCase();
    // address of the image for the bvhRefiner height-data
    var imageAddressHeight = bvhRefiner._vf.elevationUrl + "/" + level + "/" +
        columnNr + "/" + rowNr + "." +
        (bvhRefiner._vf.elevationFormat).toLowerCase();
    // address of the image for the bvhRefiner normal-data
    var imageAddressNormal = bvhRefiner._vf.normalUrl + "/" + level + "/" +
        columnNr + "/" + rowNr + "." +
        (bvhRefiner._vf.normalFormat).toLowerCase();
    // true if components are available and renderable
    var exists = true;
    // defines the resizing factor
    var resizeFac = (bvhRefiner._vf.size.x + bvhRefiner._vf.size.y) / 2.0;
    // object that stores all information to do a frustum culling
    var cullObject = {};



    /*
     * Initializes all nodeTypes that are needed to create the drawable
     * component for this node
     */
    function initialize() {

        // appearance of the drawable component of this node
        var appearance = new x3dom.nodeTypes.Appearance(ctx);
        // multiTexture to get heightmap and colormap to gpu
        var shader = new x3dom.nodeTypes.CommonSurfaceShader(ctx);
        var ssTexColor = new x3dom.nodeTypes.SurfaceShaderTexture(ctx);
        // texture that should represent the surface-data of this node
        var colorTexture = new x3dom.nodeTypes.ImageTexture(ctx);
        var ssTexDisplace = new x3dom.nodeTypes.SurfaceShaderTexture(ctx);
        // texture that should represent the height-data of this node
        var heightTexture = new x3dom.nodeTypes.ImageTexture(ctx);

        // definition of the nameSpace of this shape
        shape._nameSpace = bvhRefiner._nameSpace;

        // calculate the average position of the node
        position = nodeTransformation.e3();

        shader._vf.displacementFactor = bvhRefiner._vf.maxElevation;

        // create texture-data of this node with url's of the texture data
        colorTexture._nameSpace = bvhRefiner._nameSpace;
        colorTexture._vf.url[0] = imageAddressColor;
        colorTexture._vf.repeatT = false;
        colorTexture._vf.repeatS = false;
        ssTexColor.addChild(colorTexture, 'texture');
        colorTexture.nodeChanged();
        shader.addChild(ssTexColor, 'diffuseTexture');
        ssTexColor.nodeChanged();

        // create height-data
        heightTexture._nameSpace = bvhRefiner._nameSpace;
        heightTexture._vf.url[0] = imageAddressHeight;
        heightTexture._vf.repeatT = false;
        heightTexture._vf.repeatS = false;
        ssTexDisplace.addChild(heightTexture, 'texture');
        heightTexture.nodeChanged();
        shader.addChild(ssTexDisplace, 'displacementTexture');
        heightTexture.nodeChanged();

        appearance.addChild(shader, 'shaders');
        shader.nodeChanged();

        // create shape with geometry and appearance data
        shape.addChild(appearance);
        appearance.nodeChanged();
        shape.addChild(geometry);
        geometry.nodeChanged();

        // add shape to bvhRefiner object
        bvhRefiner.addChild(shape);
        shape.nodeChanged();

        // definition the static properties of cullObject
        cullObject.boundedNode = shape;
        cullObject.volume = shape.getVolume();
        // setting max and min in z-direction to get the complete volume
        cullObject.volume.max.z = Math.round(bvhRefiner._vf.maxElevation / 2);
        cullObject.volume.min.z = -cullObject.volume.max.z;
    }



    /*
     * Creates the code for the vertex shader
     * @returns {String} code of the vertex shader
     */
    function createVertexShader() {
        return "attribute vec3 position;\n" +
            "attribute vec3 texcoord;\n" +
            "uniform mat4 modelViewMatrix;\n" +
            "uniform mat4 modelViewProjectionMatrix;\n" +
            "uniform sampler2D texColor;\n" +
            "uniform sampler2D texHeight;\n" +
            "uniform float maxElevation;\n" +
            "uniform sampler2D texNormal;\n" +
            "varying vec2 texC;\n" +
            "varying vec3 vLight;\n" +
            "const float shininess = 32.0;\n" +
            "\n" +
            "void main(void) {\n" +
            "    vec3 uLightPosition = vec3(160.0, -9346.0, 4806.0);\n" +
            "    vec4 colr = texture2D(texColor, vec2(texcoord[0], 1.0-texcoord[1]));\n" +
            "    vec3 uAmbientMaterial = vec3(1.0, 1.0, 0.9);" +
            "    vec3 uAmbientLight = vec3(0.5, 0.5, 0.5);" +
            "    vec3 uDiffuseMaterial = vec3(0.7, 0.7, 0.7);" +
            "    vec3 uDiffuseLight = vec3(1.0, 1.0, 1.0);" +
            "    vec4 vertexPositionEye4 = modelViewMatrix * vec4(position, 1.0);" +
            "    vec3 vertexPositionEye3 = vec3((modelViewMatrix * vec4(vertexPositionEye4.xyz, 1.0)).xyz);" +
            "    vec3 vectorToLightSource = normalize(uLightPosition - vertexPositionEye3);" +
            "    vec4 height = texture2D(texHeight, vec2(texcoord[0], 1.0 - texcoord[1]));\n" +
            "    vec4 normalEye = 2.0 * texture2D(texNormal, vec2(texcoord[0], 1.0-texcoord[1])) - 1.0;\n" +
            "    float diffuseLightWeighting = max(dot(normalEye.xyz, vectorToLightSource), 0.0);" +
            "    texC = vec2(texcoord[0], 1.0-texcoord[1]);\n" +
            "    vec3 diffuseReflectance = uDiffuseMaterial * uDiffuseLight * diffuseLightWeighting;" +
            "    vec3 uSpecularMaterial = vec3(0.0, 0.0, 0.0);" +
            "    vec3 uSpecularLight = vec3(1.0, 1.0, 1.0);" +
            "    vec3 reflectionVector = normalize(reflect(-vectorToLightSource, normalEye.xyz));" +
            "    vec3 viewVectorEye = -normalize(vertexPositionEye3);" +
            "    float rdotv = max(dot(reflectionVector, viewVectorEye), 0.0);" +
            "    float specularLightWeight = pow(rdotv, shininess);" +
            "    vec3 specularReflection = uSpecularMaterial * uSpecularLight * specularLightWeight;" +
            "    vLight = vec4(uAmbientMaterial * uAmbientLight + diffuseReflectance + specularReflection, 1.0).xyz;" +
            "    gl_Position = modelViewProjectionMatrix * vec4(position.xy, height.x * maxElevation, 1.0);\n" +
            "}\n";
    }



    /*
     * Creates the code for the fragment shader
     * @returns {String} code of the fragment shader
     */
    function createFragmentShader() {
        return "#ifdef GL_ES\n" +
            "precision highp float;\n" +
            "#endif\n" +
            "uniform sampler2D texColor;\n" +
            "uniform sampler2D texNormal;\n" +
            "varying vec2 texC;\n" +
            "varying vec3 vLight;\n" +
            "\n" +
            "\n" +
            "void main(void) {\n" +
            "    vec4 normal = 2.0 * texture2D(texNormal, texC) - 1.0;\n" +
            "    vec4 colr = texture2D(texColor, texC);\n" +
            "    gl_FragColor = vec4(colr.xyz * vLight, colr.w);\n" +
            "}\n";
    }



    /*
     * Creates the four children
     */
    function create() {

        // calculation of children number nodeNumber within their level
        var deltaR = Math.sqrt(Math.pow(4, level));
        var deltaR1 = Math.sqrt(Math.pow(4, level + 1));
        var lt = Math.floor(nodeNumber / deltaR) * 4 * deltaR +
            (nodeNumber % deltaR) * 2;
        var rt = lt + 1;
        var lb = lt + deltaR1;
        var rb = lb + 1;

        // calculation of the scaling factor
        var s = (bvhRefiner._vf.size).multiply(0.25);

        // creation of all children
        children.push(new QuadtreeNode3D_NEW(ctx, bvhRefiner, (level + 1), lt,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(-s.x, s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2), geometry));
        children.push(new QuadtreeNode3D_NEW(ctx, bvhRefiner, (level + 1), rt,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(s.x, s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2), geometry));
        children.push(new QuadtreeNode3D_NEW(ctx, bvhRefiner, (level + 1), lb,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(-s.x, -s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2 + 1), geometry));
        children.push(new QuadtreeNode3D_NEW(ctx, bvhRefiner, (level + 1), rb,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(s.x, -s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2 + 1), geometry));
    }



    /*
     * Decides to create new children and if the node shoud be drawn or not
     */
    this.collectDrawables = function (transform, drawableCollection, singlePath, invalidateCache, planeMask) {

        // definition the actual transformation of the node
        cullObject.localMatrix = nodeTransformation;

        if (exists && (planeMask = drawableCollection.cull(transform, cullObject, singlePath, planeMask)) > 0) {
            var mat_view = drawableCollection.viewMatrix;
            var vPos = mat_view.multMatrixPnt(transform.multMatrixPnt(position));
            var distanceToCamera = Math.sqrt(Math.pow(vPos.x, 2) + Math.pow(vPos.y, 2) + Math.pow(vPos.z, 2));
            if ((distanceToCamera < Math.pow((bvhRefiner._vf.maxDepth - level), 2) * resizeFac / bvhRefiner._vf.factor)) {
                if (children.length === 0 && bvhRefiner.createChildren === 0) {
                    bvhRefiner.createChildren++;
                    create();
                    shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask, []);
                }
                else if (children.length === 0 && bvhRefiner.createChildren > 0) {
                    shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask, []);
                }
                else {
                    for (var i = 0; i < children.length; i++) {
                        children[i].collectDrawables(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                    }
                }
            }
            else {
                shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask, []);
            }
        }
    };



    /*
     * Returns the volume of this node
     */
    this.getVolume = function() {
        // TODO; implement correctly, for now just use first shape as workaround
        return shape.getVolume();
    };



    // initializes this node directly after creating
    initialize();
}




/*
 * Defines one node of an octree that represents a part (nxn vertices) of
 * the whole point cloud
 * @param {object} ctx context
 * @param {x3dom.nodeTypes.BVHRefiner} bvhRefiner root bvhRefiner node
 * @param {number} level level of the node within the quadtree
 * @param {number} columnNr column number in the wmts matrix within the level
 * @param {number} rowNr row number in the wmts matrix within the level
 * @param {number} resizeFac defines the resizing factor. Can be null on init
 * @returns {QuadtreeNodeBin}
 */
function OctreeNode(ctx, bvhRefiner, level, nodeTransformation)
{
    // array with the maximal four child nodes
    var children = [];
    // position of the node in world space
    var position = nodeTransformation.e3();
    // drawable component of this node
    var shape = new x3dom.nodeTypes.Shape(ctx);
    // object that stores all information to do a frustum culling
    var cullObject = {};
    // defines the resizing factor
    var resizeFac = (bvhRefiner._vf.octSize.x + bvhRefiner._vf.octSize.y + bvhRefiner._vf.octSize.z) / 3.0;



    /*
     * creates the appearance for this node and add it to the dom tree
     */
    function initialize() {

        // appearance of the drawable component of this node
        var appearance = new x3dom.nodeTypes.Appearance(ctx);
        var geometry = new x3dom.nodeTypes.Box(ctx);

        geometry._vf.size = bvhRefiner._vf.octSize;
        geometry.fieldChanged('size');

        // definition of nameSpace
        shape._nameSpace = new x3dom.NodeNameSpace("", bvhRefiner._nameSpace.doc);
        shape._nameSpace.setBaseURL(bvhRefiner._nameSpace.baseURL);

        shape.addChild(appearance);
        appearance.nodeChanged();
        shape.addChild(geometry);
        geometry.nodeChanged();

        //bvhRefiner.addChild(shape);
        shape.nodeChanged();

        // bind static cull-properties to cullObject
        cullObject.boundedNode = shape;
        cullObject.volume = shape.getVolume();
    }



    /*
     * creates the four child-nodes
     */
    function create() {
        // calculation of the scaling factor
        var s = bvhRefiner._vf.octSize.multiply(0.25);

        // creation of all children
        children.push(new OctreeNode(ctx, bvhRefiner, (level + 1),
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(-s.x, s.y, s.z))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 0.5)))));
        children.push(new OctreeNode(ctx, bvhRefiner, (level + 1),
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(s.x, s.y, s.z))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 0.5)))));
        children.push(new OctreeNode(ctx, bvhRefiner, (level + 1),
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(-s.x, -s.y, s.z))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 0.5)))));
        children.push(new OctreeNode(ctx, bvhRefiner, (level + 1),
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(s.x, -s.y, s.z))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 0.5)))));
        children.push(new OctreeNode(ctx, bvhRefiner, (level + 1),
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(-s.x, s.y, -s.z))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 0.5)))));
        children.push(new OctreeNode(ctx, bvhRefiner, (level + 1),
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(s.x, s.y, -s.z))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 0.5)))));
        children.push(new OctreeNode(ctx, bvhRefiner, (level + 1),
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(-s.x, -s.y, -s.z))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 0.5)))));
        children.push(new OctreeNode(ctx, bvhRefiner, (level + 1),
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(s.x, -s.y, -s.z))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 0.5)))));
    }



    /*
     * Decides to create new children and if the node shoud be drawn or not
     */
    this.collectDrawables = function (transform, drawableCollection, singlePath, invalidateCache, planeMask) {

        // definition the actual transformation of the node
        cullObject.localMatrix = nodeTransformation;

        if ((planeMask = drawableCollection.cull(transform, cullObject, singlePath, planeMask)) > 0) {

            var mat_view = drawableCollection.viewMatrix;
            var vPos = mat_view.multMatrixPnt(transform.multMatrixPnt(position));
            var distanceToCamera = Math.sqrt(Math.pow(vPos.x, 2) + Math.pow(vPos.y, 2) + Math.pow(vPos.z, 2));

            // bvhRefiner._vf.factor instead (level * 16)
            if ((distanceToCamera < Math.pow((bvhRefiner._vf.maxDepth - level), 2) * resizeFac / bvhRefiner._vf.factor)) {
                if (children.length === 0){
                    create();
                }
                else {
                    for (var i = 0; i < children.length; i++) {
                        children[i].collectDrawables(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                    }
                }
            }
            else {
                shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask, []);
            }
        }
    };



    /*
     * Returns the volume of this node
     */
    this.getVolume = function() {
        // TODO; implement correctly, for now just use first box as workaround
        return shape.getVolume();
    };



    // initializes this node directly after creating
    initialize();
}



/*
 * Defines one 3D node (plane with displacement) of a quadtree that represents
 * a part (nxn vertices) of the whole mesh.
 * @param {object} ctx context
 * @param {x3dom.nodeTypes.BVHRefiner} bvhRefiner root bvhRefiner node
 * @param {number} level level of the node within the quadtree
 * @param {number} nodeNumber id of the node within the level
 * @param {x3dom.fields.SFMatrix4f} nodeTransformation transformation matrix that defines scale and position
 * @param {number} columnNr column number in the wmts matrix within the level
 * @param {number} rowNr row number in the wmts matrix within the level
 * @param {x3dom.nodeTypes.Plane} geometry plane
 * @returns {QuadtreeNode3D}
 */
function QuadtreeNode3D_32bit(ctx, bvhRefiner, level, nodeNumber, nodeTransformation,
                              columnNr, rowNr, geometry)
{
    // array with the maximal four child nodes
    var children = [];
    // drawable component of this node
    var shape = new x3dom.nodeTypes.Shape();
    // position of the node in world space
    var position = null;
    // address of the image for the bvhRefiner surface
    var imageAddressColor = bvhRefiner._vf.textureUrl + "/" + level + "/" +
        columnNr + "/" + rowNr + "." +
        (bvhRefiner._vf.textureFormat).toLowerCase();
    // address of the image for the bvhRefiner height-data
    var imageAddressHeight = bvhRefiner._vf.elevationUrl + "/" + level + "/" +
        columnNr + "/" + rowNr + "." +
        (bvhRefiner._vf.elevationFormat).toLowerCase();
    // address of the image for the bvhRefiner normal-data
    var imageAddressNormal = bvhRefiner._vf.normalUrl + "/" + level + "/" +
        columnNr + "/" + rowNr + "." +
        (bvhRefiner._vf.normalFormat).toLowerCase();
    // true if components are available and renderable
    var exists = true;
    // defines the resizing factor
    var resizeFac = (bvhRefiner._vf.size.x + bvhRefiner._vf.size.y) / 2.0;
    // object that stores all information to do a frustum culling
    var cullObject = {};



    /*
     * Initializes all nodeTypes that are needed to create the drawable
     * component for this node
     */
    function initialize() {

        // appearance of the drawable component of this node
        var appearance = new x3dom.nodeTypes.Appearance(ctx);
        // multiTexture to get heightmap and colormap to gpu
        var textures = new x3dom.nodeTypes.MultiTexture(ctx);
        // texture that should represent the surface-data of this node
        var colorTexture = new x3dom.nodeTypes.ImageTexture(ctx);
        // texture that should represent the height-data of this node
        var heightTexture = new x3dom.nodeTypes.ImageTexture(ctx);
        // texture that should represent the normal-data of this node
        var normalTexture = new x3dom.nodeTypes.ImageTexture(ctx);
        // creating the special shader for these nodes
        var composedShader = new x3dom.nodeTypes.ComposedShader(ctx);

        // definition of the nameSpace of this shape
        shape._nameSpace = bvhRefiner._nameSpace;

        // calculate the average position of the node
        position = nodeTransformation.e3();

        // creating the special vertex-shader for bvhRefiner-nodes
        var vertexShader = new x3dom.nodeTypes.ShaderPart(ctx);
        vertexShader._vf.type = 'vertex';
        vertexShader._vf.url[0] = createVertexShader();

        // creating the special fragment-shader for bvhRefiner-nodes
        var fragmentShader = new x3dom.nodeTypes.ShaderPart(ctx);
        fragmentShader._vf.type = 'fragment';
        fragmentShader._vf.url[0] = createFragmentShader();

        // create complete-shader with vertex- and fragment-shader
        composedShader.addChild(vertexShader, 'parts');
        composedShader.addChild(fragmentShader, 'parts');

        // create texture-data of this node with url's of the texture data
        colorTexture._nameSpace = bvhRefiner._nameSpace;
        colorTexture._vf.url[0] = imageAddressColor;
        colorTexture._vf.repeatT = false;
        colorTexture._vf.repeatS = false;
        colorTexture._vf.generateMipMaps = false;
        textures.addChild(colorTexture, 'texture');
        colorTexture.nodeChanged();
        var colorTextureField = new x3dom.nodeTypes.Field(ctx);
        colorTextureField._vf.name = 'texColor';
        colorTextureField._vf.type = 'SFInt32';
        colorTextureField._vf.value = 0;
        composedShader.addChild(colorTextureField, 'fields');
        colorTextureField.nodeChanged();

        // create height-data
        heightTexture._nameSpace = bvhRefiner._nameSpace;
        heightTexture._vf.url[0] = imageAddressHeight;
        heightTexture._vf.repeatT = false;
        heightTexture._vf.repeatS = false;

        /*heightTexture._cf.textureProperties.node = new x3dom.nodeTypes.TextureProperties(ctx);
         heightTexture._cf.textureProperties.node._vf.minificationFilter = 'NEAREST';
         heightTexture._cf.textureProperties.node._vf.magnificationFilter = 'NEAREST';
         heightTexture._cf.textureProperties.node._vf.generateMipMaps = false;
         heightTexture._cf.textureProperties.node._vf.boundaryModeS = 'MIRRORED_REPEAT';
         heightTexture._cf.textureProperties.node._vf.boundaryModeT = 'MIRRORED_REPEAT';
         heightTexture._cf.textureProperties.node._vf.boundaryModeR = 'MIRRORED_REPEAT';*/

        textures.addChild(heightTexture, 'texture');
        heightTexture.nodeChanged();
        var heightTextureField = new x3dom.nodeTypes.Field(ctx);
        heightTextureField._vf.name = 'texHeight';
        heightTextureField._vf.type = 'SFInt32';
        heightTextureField._vf.value = 1;
        composedShader.addChild(heightTextureField, 'fields');
        heightTextureField.nodeChanged();

        // create normal-data
        normalTexture._nameSpace = bvhRefiner._nameSpace;
        normalTexture._vf.url[0] = imageAddressNormal;
        normalTexture._vf.repeatT = false;
        normalTexture._vf.repeatS = false;
        textures.addChild(normalTexture, 'texture');
        normalTexture.nodeChanged();
        var normalTextureField = new x3dom.nodeTypes.Field(ctx);
        normalTextureField._vf.name = 'texNormal';
        normalTextureField._vf.type = 'SFInt32';
        normalTextureField._vf.value = 2;
        composedShader.addChild(normalTextureField, 'fields');
        normalTextureField.nodeChanged();

        // transmit maximum elevation value to gpu
        var maxHeight = new x3dom.nodeTypes.Field(ctx);
        maxHeight._vf.name = 'maxElevation';
        maxHeight._vf.type = 'SFFloat';
        maxHeight._vf.value = bvhRefiner._vf.maxElevation;
        composedShader.addChild(maxHeight, 'fields');
        maxHeight.nodeChanged();

        // add textures to the appearence of this node
        appearance.addChild(textures);
        textures.nodeChanged();
        appearance.addChild(composedShader);
        composedShader.nodeChanged();

        // create shape with geometry and appearance data
        shape.addChild(appearance);
        appearance.nodeChanged();
        shape.addChild(geometry);
        geometry.nodeChanged();

        // add shape to bvhRefiner object
        bvhRefiner.addChild(shape);
        shape.nodeChanged();

        // definition the static properties of cullObject
        cullObject.boundedNode = shape;
        cullObject.volume = shape.getVolume();
        // setting max and min in z-direction to get the complete volume
        cullObject.volume.max.z = Math.round(bvhRefiner._vf.maxElevation);
        cullObject.volume.min.z = -cullObject.volume.max.z;
    }



    /*
     * Creates the code for the vertex shader
     * @returns {String} code of the vertex shader
     */
    function createVertexShader() {
        return "attribute vec3 position;\n" +
            "attribute vec3 texcoord;\n" +
            "uniform mat4 modelViewMatrix;\n" +
            "uniform mat4 modelViewProjectionMatrix;\n" +
            "uniform sampler2D texColor;\n" +
            "uniform sampler2D texHeight;\n" +
            "uniform float maxElevation;\n" +
            "uniform sampler2D texNormal;\n" +
            "varying vec2 texC;\n" +
            "varying vec3 vLight;\n" +
            "const float shininess = 32.0;\n" +
            "\n" +
            "void main(void) {\n" +
            "    vec3 uLightPosition = vec3(160.0, -9346.0, 4806.0);\n" +
            "    vec4 colr = texture2D(texColor, vec2(texcoord[0], 1.0-texcoord[1]));\n" +
            "    vec3 uAmbientMaterial = vec3(1.0, 1.0, 0.9);" +
            "    vec3 uAmbientLight = vec3(0.5, 0.5, 0.5);" +
            "    vec3 uDiffuseMaterial = vec3(0.7, 0.7, 0.7);" +
            "    vec3 uDiffuseLight = vec3(1.0, 1.0, 1.0);" +
            "    vec4 vertexPositionEye4 = modelViewMatrix * vec4(position, 1.0);" +
            "    vec3 vertexPositionEye3 = vec3((modelViewMatrix * vec4(vertexPositionEye4.xyz, 1.0)).xyz);" +
            "    vec3 vectorToLightSource = normalize(uLightPosition - vertexPositionEye3);" +
            "    vec4 height = texture2D(texHeight, vec2(texcoord[0], 1.0 - texcoord[1]));\n" +
            "    vec4 normalEye = 2.0 * texture2D(texNormal, vec2(texcoord[0], 1.0-texcoord[1])) - 1.0;\n" +
            "    float diffuseLightWeighting = max(dot(normalEye.xyz, vectorToLightSource), 0.0);" +
            "    texC = vec2(texcoord[0], 1.0-texcoord[1]);\n" +
            "    vec3 diffuseReflectance = uDiffuseMaterial * uDiffuseLight * diffuseLightWeighting;" +
            "    vec3 uSpecularMaterial = vec3(0.0, 0.0, 0.0);" +
            "    vec3 uSpecularLight = vec3(1.0, 1.0, 1.0);" +
            "    vec3 reflectionVector = normalize(reflect(-vectorToLightSource, normalEye.xyz));" +
            "    vec3 viewVectorEye = -normalize(vertexPositionEye3);" +
            "    float rdotv = max(dot(reflectionVector, viewVectorEye), 0.0);" +
            "    float specularLightWeight = pow(rdotv, shininess);" +
            "    vec3 specularReflection = uSpecularMaterial * uSpecularLight * specularLightWeight;" +
            "    vLight = vec4(uAmbientMaterial * uAmbientLight + diffuseReflectance + specularReflection, 1.0).xyz;" +
            "    gl_Position = modelViewProjectionMatrix * vec4(position.xy, ((height.g * 256.0)+height.b) * maxElevation, 1.0);\n" +
            "}\n";
    }



    /*
     * Creates the code for the fragment shader
     * @returns {String} code of the fragment shader
     */
    function createFragmentShader() {
        return "#ifdef GL_ES\n" +
            "precision highp float;\n" +
            "#endif\n" +
            "uniform sampler2D texColor;\n" +
            "uniform sampler2D texNormal;\n" +
            "varying vec2 texC;\n" +
            "varying vec3 vLight;\n" +
            "\n" +
            "\n" +
            "void main(void) {\n" +
            "    vec4 normal = 2.0 * texture2D(texNormal, texC) - 1.0;\n" +
            "    vec4 colr = texture2D(texColor, texC);\n" +
            "    float coler = ((colr.g * 256.0)+colr.b);" +
            "    gl_FragColor = vec4(vLight * coler, 1.0);\n" +
            "}\n";
    }



    /*
     * Creates the four children
     */
    function create() {

        // calculation of children number nodeNumber within their level
        var deltaR = Math.sqrt(Math.pow(4, level));
        var deltaR1 = Math.sqrt(Math.pow(4, level + 1));
        var lt = Math.floor(nodeNumber / deltaR) * 4 * deltaR +
            (nodeNumber % deltaR) * 2;
        var rt = lt + 1;
        var lb = lt + deltaR1;
        var rb = lb + 1;

        // calculation of the scaling factor
        var s = (bvhRefiner._vf.size).multiply(0.25);

        // creation of all children
        children.push(new QuadtreeNode3D_32bit(ctx, bvhRefiner, (level + 1), lt,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(-s.x, s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2), geometry));
        children.push(new QuadtreeNode3D_32bit(ctx, bvhRefiner, (level + 1), rt,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(s.x, s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2), geometry));
        children.push(new QuadtreeNode3D_32bit(ctx, bvhRefiner, (level + 1), lb,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(-s.x, -s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2 + 1), geometry));
        children.push(new QuadtreeNode3D_32bit(ctx, bvhRefiner, (level + 1), rb,
            nodeTransformation.mult(x3dom.fields.SFMatrix4f.translation(
                new x3dom.fields.SFVec3f(s.x, -s.y, 0.0))).mult(x3dom.fields.SFMatrix4f.scale(
                new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2 + 1), geometry));
    }



    /*
     * Decides to create new children and if the node shoud be drawn or not
     */
    this.collectDrawables = function (transform, drawableCollection, singlePath, invalidateCache, planeMask) {

        // definition the actual transformation of the node
        cullObject.localMatrix = nodeTransformation;

        if (exists && (planeMask = drawableCollection.cull(transform, cullObject, singlePath, planeMask)) > 0) {
            var mat_view = drawableCollection.viewMatrix;
            var vPos = mat_view.multMatrixPnt(transform.multMatrixPnt(position));
            var distanceToCamera = Math.sqrt(Math.pow(vPos.x, 2) + Math.pow(vPos.y, 2) + Math.pow(vPos.z, 2));
            if ((distanceToCamera < Math.pow((bvhRefiner._vf.maxDepth - level), 2) * resizeFac / bvhRefiner._vf.factor)) {
                if (children.length === 0 && bvhRefiner.createChildren === 0) {
                    bvhRefiner.createChildren++;
                    create();
                    shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask, []);
                }
                else if (children.length === 0 && bvhRefiner.createChildren > 0) {
                    shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask, []);
                }
                else {
                    for (var i = 0; i < children.length; i++) {
                        children[i].collectDrawables(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                    }
                }
            }
            else {
                shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask, []);
            }
        }
    };


    /*
     * Returns the volume of this node
     */
    this.getVolume = function() {
        // TODO; implement correctly, for now just use first shape as workaround
        return shape.getVolume();
    };


    // initializes this node directly after creating
    initialize();
}
