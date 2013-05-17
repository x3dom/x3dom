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
 * Base class for BVHs
 */
x3dom.BVH = function()
{
    this.dataNodes = [];
};

/**
 * Node containing AABB, matrix, and drawable shape
 */
x3dom.BVH.DataNode = function(drawable)
{
    this.drawable = drawable;
    this.bbox = new x3dom.fields.BoxVolume();
    this.bbox.transformFrom(drawable.transform, drawable.shape.getVolume());
    drawable.worldVolume = x3dom.fields.BoxVolume.copy(this.bbox);
};

/*
 * Add shapes to bvh
 */
x3dom.BVH.prototype.addDrawable = function(drawable)
{
    this.dataNodes.push(new x3dom.BVH.DataNode(drawable));
};

/*
 * interface function - build bvh
 */
x3dom.BVH.prototype.build = function()
{
    console.log(" - build - not implemented for chosen bvh");
};

/*
 * interface function - collect drawables to be painted
 */
x3dom.BVH.prototype.collectDrawables = function(params)
{
    console.log(" - collectDrawables - not implemented for chosen bvh");
};

/*
 * return longest axis of box : 0=x, 1=y, 2=z
 */
x3dom.BVH.prototype.boxGetLongestAxis = function(box)
{
    var min = new x3dom.fields.SFVec3f, max = new x3dom.fields.SFVec3f;
    box.getBounds(min,max);
    var length =  Math.abs(max.x-min.x);
    var ret = "x";
    var difY = Math.abs(max.y - min.y);
    var difZ = Math.abs(max.z - min.z);
    if(difY > length)
    {
        length = difY;
        ret = "y";
    }
    if(difZ > length)
    {
        length = difZ;
        ret ="z";
    }
    return ret;
};

/* calculate boundingBox for all drawables */
x3dom.BVH.prototype.calculateNodesBBox = function(box)
{
    var min = new x3dom.fields.SFVec3f(),max = new x3dom.fields.SFVec3f();
    box.getBounds(min,max);

    for(var node in this.dataNodes)
    {
        var nMin = new x3dom.fields.SFVec3f(), nMax = new x3dom.fields.SFVec3f();
        this.dataNodes[node].bbox.getBounds(nMin,nMax);

        if(nMin.x < min.x)
            min.x = nMin.x;
        if(nMax.x > max.x)
            max.x = nMax.x;
        if(nMin.y < min.y)
            min.y = nMin.y;
        if(nMax.y > max.y)
            max.y = nMax.y;
        if(nMin.z < min.z)
            min.z = nMin.z;
        if(nMax.z > max.z)
            max.z = nMax.z;
    }
    box.setBounds(min,max);
    return box;
};

x3dom.BVH.prototype.splitBoxVolume = function(bbox, axis, leftSplit, rightSplit)
{
    var min= new x3dom.fields.SFVec3f,
        max= new x3dom.fields.SFVec3f;

    bbox.getBounds(min,max);

    var leftMin = new x3dom.fields.SFVec3f(min.x,min.y,min.z),
        leftMax = new x3dom.fields.SFVec3f(max.x,max.y,max.z),
        rightMin = new x3dom.fields.SFVec3f(min.x,min.y,min.z),
        rightMax = new x3dom.fields.SFVec3f(max.x,max.y,max.z);


    leftMax[axis] = leftSplit;
    rightMin[axis] = rightSplit;

    return [new x3dom.fields.BoxVolume(leftMin,leftMax),new x3dom.fields.BoxVolume(rightMin,rightMax)];
};




/*******************************************
 * Bounding Interval Hierarchy -
 ******************************************/

/**
 * Bounding Interval Hierarchy -
 */
x3dom.BIH = function()
{
    this.max_obj_per_node = 1;
    this.max_depth = 50;

    this.bbox = new x3dom.fields.BoxVolume();
    this.dataNodes = [];
    this.bihNodes = [];
    this.index = [];

    this.traverseTime = 0;
};

x3dom.BIH.prototype = new x3dom.BVH();

x3dom.BIH.BIHNode = function()
{

    //for debugginh
    this.index = -1;

    this.rightChild = null;
    this.leftChild = null;

    /* is split axis or leaf node : 0=x,1=y,2=z,-1=leaf */
    this.split_axis = -1;

    /* clipping planes */
    this.clip = [0,0];

    /* only set in leafs */
    this.dataIndex = [0,0];
};

/*gets BIHNode for id or creates if not present */
x3dom.BIH.prototype.getNodeForIndex = function(index)
{
    while(this.bihNodes.length <= index)
    {

        var node  = new x3dom.BIH.BIHNode();
        node.index = this.bihNodes.length;
        this.bihNodes.push(node);

        //this.bihNodes.push(new x3dom.BIH.BIHNode());

    }
    return this.bihNodes[index];
};

/* sorts given number of objects from start inplace and returns number in "left" space */
x3dom.BIH.prototype.bucketSort = function(startIndex, number, pivot, axis)
{
    var numLeft = 0;
    var center, dataNode;


    //sort into subspaces
    for(var i = 0; i < number; ++i)
    {
        //get center of bounding box
        /*dataNode = this.dataNodes[this.index[startIndex+i]];
        center  = dataNode.bbox.center;*/
        center = this.dataNodes[this.index[startIndex+i]].bbox.center;

        //console.log("comparing "+center[axis]+" "+(center[axis]< pivot ? "left " : "right"));
        var swap = -1;
        if( center[axis] < pivot )
        {
            //swap
            swap = this.index[startIndex+i];
            this.index[startIndex+i] = this.index[startIndex+numLeft];
            this.index[startIndex+numLeft] = swap;

            numLeft += 1;
        }
    }
    //console.log("Bucketsorting result from "+startIndex +" "+number+" -> left: " +numLeft);
    return numLeft;
}


/*
 * recursively divides set of geometry into subnodes

 */
x3dom.BIH.prototype.processNode = function(nodeIndex, startObjIndex, numObjs, box, depth)
{

    var node = this.getNodeForIndex(nodeIndex);

    /*console.log("processing node for index: " +nodeIndex + " and box from: %s %s %s to %s %s %s ",
        parseInt(box.min.x),parseInt(box.min.y),parseInt(box.min.z), parseInt(box.max.x), parseInt(box.max.y),parseInt(box.max.z));*/


    //calculate split axis and split at center of AABB
    node.split_axis = this.boxGetLongestAxis(box);
    var splitCenter = box.getCenter()[node.split_axis];

    //bucket sort objects into subspaces
    var numLeft = this.bucketSort(startObjIndex,numObjs,splitCenter,node.split_axis);
    var numRight = numObjs - numLeft;

    //adjust splitting planes to really fit both subspaces
    node.clip[0] = box.min[node.split_axis];
    node.clip[1] = box.max[node.split_axis];

    var centerIndex = startObjIndex + numLeft;
    var i= 0, val= 0;
    for(i = startObjIndex; i < centerIndex; ++i)
    {
        val = this.dataNodes[this.index[i]].bbox.max[node.split_axis];
        if(val > node.clip[0])
            node.clip[0] = val;
    }

    for(i = centerIndex; i < startObjIndex + numObjs; ++i)
    {
        val = this.dataNodes[this.index[i]].bbox.min[node.split_axis];
        if(val < node.clip[1])
            node.clip[1] = val;
    }

    //enlarge sub-spaces by 1%
    var delta = (box.max[node.split_axis] - box.min[node.split_axis]) * 0.01;
    node.clip[0] += delta;
    node.clip[1] -= delta;


    var min= new x3dom.fields.SFVec3f(),
        max= new x3dom.fields.SFVec3f(),
        voxel;


    //subdivide or store leaves
    if((numLeft > this.max_obj_per_node) && (depth < this.max_depth))
    {
        //subdivide
        box.getBounds(min,max);
        max[node.split_axis] = splitCenter; //clip[0]; is slower
        voxel = new x3dom.fields.BoxVolume();
        voxel.setBounds(min,max);

        node.leftChild = this.processNode(this.bihNodes.length,startObjIndex,numLeft,voxel,depth+1);
    }
    else
    {
        //store in new Index
        node.leftChild = this.getNodeForIndex(this.bihNodes.length);
        node.leftChild.split_axis = -1;
        node.leftChild.index_right_child = -1;

        node.leftChild.dataIndex[0] = startObjIndex;
        node.leftChild.dataIndex[1] = numLeft;

        //console.log("Left leaf %o",leaf);
        //TODO statistics ?
    }

    if((numRight > this.max_obj_per_node) && (depth < this.max_depth))
    {
        //subdivide
        box.getBounds(min,max);
        min[node.split_axis] = splitCenter; //clip[1]; is slower
        voxel = new x3dom.fields.BoxVolume();
        voxel.setBounds(min,max);

        node.rightChild = this.processNode(this.bihNodes.length,startObjIndex +numLeft,numRight,voxel,depth+1);
    }
    else
    {
        //store in new Node
        node.rightChild = this.getNodeForIndex(this.bihNodes.length);
        node.rightChild .split_axis = -1;
        node.rightChild .index_right_child = -1;

        node.rightChild .dataIndex[0] = startObjIndex + numLeft;
        node.rightChild .dataIndex[1] = numRight;
        //console.log("Right leaf %o",leaf);
    }

    return node;
}


/* compiles nodes into bih tree */
x3dom.BIH.prototype.build = function()
{
    if(this.dataNodes.length == 0)
        return;

    //calculate overall boundingbox
    this.calculateNodesBBox(this.bbox);

    for(var i = 0; i < this.dataNodes.length; ++i)
    {
        this.index.push(i);
    }
    this.processNode(0,0,this.dataNodes.length,this.bbox,0);
    console.log("DataNodes: "+this.dataNodes.length + " BihNodes: "+this.bihNodes.length);
    console.log("BIH : %o",this);
    //this.printTree();
}


/* return drawables to webgl for rendering */
x3dom.BIH.prototype.collectDrawables = function(drawableCollection)
{
    var frustum = drawableCollection.viewFrustum;

    var drawables = [];

    if(this.bihNodes.length > 0)
    {
        this.intersect(this.bihNodes[0],drawables,this.bbox, frustum);
        for(var i =0, n = drawables.length; i < n; ++i)
        {
            drawableCollection.addDrawable(drawables[i].drawable);
        }
    }
};

x3dom.BIH.prototype.intersect = function(node, drawables, bbox, frustum)
{
    //leaf node - add drawables
    if(node.split_axis == -1)
    {
        for(var i = 0; i < node.dataIndex[1]; ++i)
        {
            drawables.push(this.dataNodes[node.dataIndex[0]+i]);
        }
    }
    else
    {
        //if intersects box
        if(frustum.intersect(bbox))
        {
            //get box volumes for split
            var boxVolumes = this.splitBoxVolume(bbox, node.split_axis,node.clip[0],node.clip[1]);

            //call with children
            if(node.leftChild != null)
                this.intersect(node.leftChild,drawables,boxVolumes[0],frustum);

            if(node.rightChild != null)
                this.intersect(node.rightChild,drawables,boxVolumes[1],frustum);
        }
    }
}


x3dom.BIH.prototype.printTree= function()
{
    for(var i = 0; i < this.bihNodes.length; ++i)
    {
        var node = this.bihNodes[i];
        console.log("--------------------------------------------------");
        if(node.split_axis != -1)
             console.log("Node "+node.index+" for axis %s clips %i %i",node.split_axis, node.clip[0], node.clip[1]);
        else
            console.log("Leaf "+node.index+" : "+node.dataIndex[0]+"  -> "+node.dataIndex[1]);

        if(node.leftChild != null)
        {
            console.log("left child: "+node.leftChild.index);
        }
        if(node.rightChild != null)
        {
            console.log("right child: "+node.rightChild.index);
        }
    }
};


/* gfx_webgl snippet

 //TODO remove after test
 if(window["bvh"] !== undefined && window["bvh"] != null)
 {
 bvh.collectDrawables(scene.drawableCollection);
 }
 */
