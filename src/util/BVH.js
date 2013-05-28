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

//---------------------------------------------------------------------------------------------------------------------

//namespace
x3dom.bvh = {};

//---------------------------------------------------------------------------------------------------------------------

/**
 * BVH Settings class
 */
x3dom.bvh.Settings = defineClass(
    null,
    function()
    {
        this.debug = true;
        this.MASK_SET = 63;  // 2^6-1, i.e. all sides of the volume

    }
);

//---------------------------------------------------------------------------------------------------------------------

/**
 * Node containing AABB and drawable shape
 */
x3dom.bvh.DataNode = defineClass(
    null,
    function(drawable)
    {
        this.drawable = drawable;
        this.bbox = new x3dom.fields.BoxVolume();
        this.bbox.transformFrom(drawable.transform, drawable.shape.getVolume());
        drawable.worldVolume = x3dom.fields.BoxVolume.copy(this.bbox);
    }
);

//---------------------------------------------------------------------------------------------------------------------

/**
 * Base class for BVHs
 */
x3dom.bvh.Base = defineClass(
    null,
    function()
    {
        /*Data Members*/
        this.dataNodes = [];
        this.drawableCollection = null;
        this.coveredBoxVolume = null;
        this.settings = new x3dom.bvh.Settings();
    },
    {
        /*add Drawable as DataNode to BVH */
        addDrawable : function(drawable)
        {
            this.dataNodes.push(new x3dom.bvh.DataNode(drawable));
        },
        /*
         * interface functions
         */
        build : function(){},
        collectDrawables : function(drawableCollection){},
        /*
         * return longest axis of box : 0=x, 1=y, 2=z
         */
        getLongestAxisForBox : function(box)
        {
            var min = new x3dom.fields.SFVec3f,
                max = new x3dom.fields.SFVec3f;
            box.getBounds(min,max);

            var length =  Math.abs(max.x-min.x),
                y = Math.abs(max.y - min.y),
                z = Math.abs(max.z - min.z),
                ret = "x";

            if( y > length)
            {
                length = y;
                ret = "y";
            }
            if( z > length)
            {
                length = z;
                ret ="z";
            }
            return ret;
        },
        /* calculate boundingBox for all data nodes */
        calculateBBoxForDataNodes : function()
        {
            var box = x3dom.fields.BoxVolume.copy(this.dataNodes[0].bbox),
                min = new x3dom.fields.SFVec3f(),
                max = new x3dom.fields.SFVec3f(),
                nMin = new x3dom.fields.SFVec3f(),
                nMax = new x3dom.fields.SFVec3f();

            box.getBounds(min,max);

            for(var i = 1, n = this.dataNodes.length; i < n; ++i)
            {
                this.dataNodes[i].bbox.getBounds(nMin,nMax);

                if(nMin.x < min.x) min.x = nMin.x;
                if(nMax.x > max.x) max.x = nMax.x;
                if(nMin.y < min.y) min.y = nMin.y;
                if(nMax.y > max.y) max.y = nMax.y;
                if(nMin.z < min.z) min.z = nMin.z;
                if(nMax.z > max.z) max.z = nMax.z;
            }
            box.setBounds(min,max);
            return box;
        },
        splitBoxVolume : function(bbox, axis, leftSplit, rightSplit)
        {
            var min = new x3dom.fields.SFVec3f,
                max = new x3dom.fields.SFVec3f;

            bbox.getBounds(min,max);

            var leftMin = x3dom.fields.SFVec3f.copy(min),
                leftMax = x3dom.fields.SFVec3f.copy(max),
                rightMin = x3dom.fields.SFVec3f.copy(min),
                rightMax = x3dom.fields.SFVec3f.copy(max);

            leftMax[axis] = leftSplit;
            rightMin[axis] = rightSplit;

            return [new x3dom.fields.BoxVolume(leftMin,leftMax),new x3dom.fields.BoxVolume(rightMin,rightMax)];
        }
    }
);

//---------------------------------------------------------------------------------------------------------------------

/**
 * Base class for BVHs
 */
x3dom.bvh.DebugComposite = defineClass(
    x3dom.bvh.Base,
    function(bvh,scene,params)
    {
        x3dom.bvh.DebugComposite.superClass.call(this,params);
        this.bvh = bvh;
        this.scene = scene;
        this.debugShape = null;


        this.renderedDrawablesCount = 0;

    },
    {
        /*add Drawable as DataNode to BVH */
        addDrawable : function(drawable)
        {
            this.bvh.addDrawable(drawable);
        },
        /*
         * measure build time and create debugging elements
         */
        build : function()
        {
            console.log("debugger build");
            x3dom.Utils.startMeasure("buildBVH");
            this.bvh.build();
            console.log("Time for BVH creation: "+x3dom.Utils.stopMeasure("buildBVH")+" : %o",this.bvh);
            console.log("DataNodes: "+this.bvh.dataNodes.length + " BihNodes: "+this.bvh.bihNodes.length);

            if(this.scene != null)
            {
                this.createDebugShape();
            }
        },
        collectDrawables : function(drawableCollection)
        {
            var getDCSize = function(drawableCollection)
            {
                var count = 0;
                for(var i = 0, n = drawableCollection.collection.length; i < n; ++i)
                {
                    count +=  drawableCollection.collection[i].length;
                }
                return count;
            };

            this.renderedDrawablesCount = drawableCollection.length;//getDCSize(drawableCollection);
            this.bvh.collectDrawables(drawableCollection);
            this.renderedDrawablesCount = drawableCollection.length - this.renderedDrawablesCount;
            //console.log("added drawables: "+this.renderedDrawablesCount);
        },
        //create shape for debugging
        createDebugShape : function()
        {
            this.debugShape = new x3dom.nodeTypes.Shape();
            this.debugShape._nameSpace = this.scene._nameSpace;

            var geo = null,
                coords = null;

            if(!this.debugShape._cf.appearance.node)
            {
                var appearance = x3dom.nodeTypes.Appearance.defaultNode();
                var material = x3dom.nodeTypes.Material.defaultNode();
                material._vf.diffuseColor = new x3dom.fields.SFColor(1,0,0);
                material._vf.specularColor = new x3dom.fields.SFColor(1,0,0);
                material._vf.emissiveColor = new x3dom.fields.SFColor(1,0,0);

                appearance.addChild(material);
                this.debugShape.addChild(appearance);
            }
            if(!this.debugShape._cf.geometry.node)
            {
                geo = new x3dom.nodeTypes.IndexedLineSet();
                coords = new x3dom.nodeTypes.Coordinate();
            }

            //add data from real bvh
            //this.addBoxVolumeToGeometry(this.bvh.coveredBoxVolume, geo);
            //this.addAllDataNodeBoxVolumes(geo);
            this.addBihNodeBoxVolume(geo, this.bvh.bihNodes[0],this.bvh.coveredBoxVolume);

            //add data to frontend elements
            for(var i = 0, n = geo._mesh._positions[0].length; i < n; ++i)
            {
                coords._vf.point.push(geo._mesh._positions[0][i]);
            }

            for(var i = 0, n = geo._mesh._indices[0].length; i < n; ++i)
            {
                geo._vf.coordIndex.push(geo._mesh._indices[0][i]);
                geo._vf.colorIndex.push(0);
            }
            geo.addChild(coords);
            this.debugShape.addChild(geo);
            geo.nodeChanged();
            this.scene.addChild(this.debugShape);
            this.debugShape.nodeChanged();
            this.scene.nodeChanged();
        },
        addBihNodeBoxVolume: function(geo, node, boxVolume)
        {
            this.addBoxVolumeToGeometry(boxVolume,geo);
            if(node.split_axis != -1)
            {
                //get box volumes from split
                var boxVolumes = this.splitBoxVolume(boxVolume, node.split_axis, node.clip[0], node.clip[1]);

                //call with children
                this.addBihNodeBoxVolume(geo,node.leftChild, boxVolumes[0]);

                this.addBihNodeBoxVolume(geo,node.rightChild, boxVolumes[1]);

            }
        },
        addAllDataNodeBoxVolumes : function(geo)
        {
            for(var i = 0, n = this.bvh.dataNodes.length; i < n; ++i)
            {
                this.addBoxVolumeToGeometry(this.bvh.dataNodes[i].bbox, geo);
            }
        },
        //adds a boxvolume to a geometry
        addBoxVolumeToGeometry : function(boxVolume, geo)
        {

            var min = new x3dom.fields.SFVec3f(),
                max = new x3dom.fields.SFVec3f();

            boxVolume.getBounds(min,max);

            var startId = geo._mesh._positions[0].length;
            geo._mesh._positions[0].push(
                new x3dom.fields.SFVec3f(min.x, min.y, min.z), // 0 links unten hinten
                new x3dom.fields.SFVec3f(min.x, min.y, max.z), // 1 links unten vorne
                new x3dom.fields.SFVec3f(min.x, max.y, min.z), // 2 links oben hinten
                new x3dom.fields.SFVec3f(min.x, max.y, max.z), // 3 links oben vorne
                new x3dom.fields.SFVec3f(max.x, min.y, min.z), // 4 rechts unten hinten
                new x3dom.fields.SFVec3f(max.x, min.y, max.z), // 5 rechts unten vorne
                new x3dom.fields.SFVec3f(max.x, max.y, min.z), // 6 rechts oben hinten
                new x3dom.fields.SFVec3f(max.x, max.y, max.z)  // 7 rechts oben vorne
            );

            //set indices
            geo._mesh._indices[0].push(
                startId, startId+1, -1,
                startId, startId+2, -1,
                startId, startId+4, -1,
                startId+1, startId+3, -1,
                startId+1, startId+5, -1,
                startId+2, startId+3, -1,
                startId+2, startId+6, -1,
                startId+4, startId+5, -1,
                startId+4, startId+6, -1,
                startId+7, startId+3, -1,
                startId+7, startId+5, -1,
                startId+7, startId+6, -1
            );
        }
    }
);

//---------------------------------------------------------------------------------------------------------------------

/*******************************************
 * Bounding Interval Hierarchy -
 ******************************************/

/**
 * Extended settings
 */
x3dom.bvh.BihSettings = defineClass(
    x3dom.bvh.Settings,
    function()
    {
        x3dom.bvh.BihSettings.superClass.call(this);
        /* Bih building settings */
        this.max_obj_per_node = 1;
        this.max_depth = 25;
        this.min_relative_bbox_size = 0.001;
    }
);

//---------------------------------------------------------------------------------------------------------------------

x3dom.bvh.BihNode = defineClass(
    null,
    function()
    {
        this.rightChild = null;
        this.leftChild = null;

        /* is split axis or leaf node : 0=x,1=y,2=z,-1=leaf */
        this.split_axis = -1;

        /* clipping planes */
        this.clip = [0,0];

        /* only set in leafs */
        this.dataIndex = [0,0];
    }
);


/**
 * Bounding Interval Hierarchy -
 */
x3dom.bvh.BIH = defineClass(
    x3dom.bvh.Base,
    function(params)
    {
        x3dom.bvh.BIH.superClass.call(this, params);
        this.bihNodes = [];
        this.index = [];
        this.settings = new x3dom.bvh.BihSettings();
    },
    {
        /*gets BIHNode for id or creates if not present */
        getNodeForIndex : function(index)
        {
            while(this.bihNodes.length <= index)
            {
                this.bihNodes.push(new x3dom.bvh.BihNode());
            }
            return this.bihNodes[index];
        },
        /* sorts given number of objects from start inplace and returns number in "left" space */
        bucketSort : function(startIndex, number, pivot, axis)
        {
            var numLeft = 0,
                center,
                swap;

            //sort into subspaces
            for(var i = 0; i < number; ++i)
            {
                //get center of bounding box
                center = this.dataNodes[this.index[startIndex+i]].bbox.getCenter();

                swap = -1;
                if( center[axis] < pivot )
                {   //swap
                    swap = this.index[startIndex+i];
                    this.index[startIndex+i] = this.index[startIndex+numLeft];
                    this.index[startIndex+numLeft] = swap;
                    numLeft += 1;
                }
            }
            return numLeft;
        },
        /*
         * recursively divides set of geometry into subnodes
         */
        processNode : function(nodeIndex, startObjIndex, numObjs, bbox, depth)
        {
            var node = this.getNodeForIndex(nodeIndex);

            //calculate split axis and split at center of AABB
            node.split_axis = this.getLongestAxisForBox(bbox);
            var splitCenter = bbox.getCenter()[node.split_axis];

            //bucket sort objects into subspaces
            var numLeft = this.bucketSort(startObjIndex,numObjs,splitCenter,node.split_axis);
            var numRight = numObjs - numLeft;

            //adjust splitting planes to really fit both subspaces
            node.clip[0] = bbox.min[node.split_axis];
            node.clip[1] = bbox.max[node.split_axis];

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

            //enlarge sub-spaces by X%
            /*var delta = (bbox.max[node.split_axis] - bbox.min[node.split_axis]) * this.settings.bboxEnlargement;
            node.clip[0] += delta;
            node.clip[1] -= delta;
            */

            var min= new x3dom.fields.SFVec3f(),
                max= new x3dom.fields.SFVec3f(),
                voxel,
                relativeBBoxToSmall = (bbox.getDiameter()/ this.coveredBoxVolume.getDiameter()) <= this.settings.min_relative_bbox_size;

            //subdivide or store leaves
            if((numLeft > this.settings.max_obj_per_node) && (depth < this.settings.max_depth) && !relativeBBoxToSmall )
            {
                //subdivide
                bbox.getBounds(min,max);
                max[node.split_axis] = node.clip[0];//splitCenter; //clip[0]; is slower
                voxel = new x3dom.fields.BoxVolume();
                voxel.setBounds(min,max);

                node.leftChild = this.processNode(this.bihNodes.length,startObjIndex,numLeft,voxel,depth+1);
            }
            else
            {
                //store in new Node
                node.leftChild = this.getNodeForIndex(this.bihNodes.length);
                node.leftChild.split_axis = -1;
                node.leftChild.index_right_child = -1;

                node.leftChild.dataIndex[0] = startObjIndex;
                node.leftChild.dataIndex[1] = numLeft;

                //TODO statistics ?
            }

            if((numRight > this.settings.max_obj_per_node) && (depth < this.settings.max_depth) && !relativeBBoxToSmall)
            {
                //subdivide
                bbox.getBounds(min,max);
                min[node.split_axis] = node.clip[1];//splitCenter; //clip[1]; is slower
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
            }

            return node;
        },
        /* compiles nodes into bih tree */
        build : function()
        {
            if(this.dataNodes.length == 0)
                return;

            //calculate covered area boundingbox
            this.coveredBoxVolume = this.calculateBBoxForDataNodes();

            //add to index for bucket sorting
            for(var i = 0, n = this.dataNodes.length; i < n; ++i)
            {
                this.index.push(i);
            }
            this.processNode(0,0,this.dataNodes.length,this.coveredBoxVolume,0);
        },
        /* return drawables to webgl for rendering */
        collectDrawables : function(drawableCollection)
        {
            this.drawableCollection = drawableCollection;

            if(this.bihNodes.length > 0)
            {
                var planeMask = 0;
                this.intersect(this.bihNodes[0],this.coveredBoxVolume, planeMask);
            }
        },
        intersect : function(node,bbox, planeMask)
        {
            //viewfrustum intersection test
            if(planeMask < this.settings.MASK_SET)
                planeMask = this.drawableCollection.viewFrustum.intersect(bbox,planeMask);
            if(planeMask >= 0)
            {
                //small feature culling
                var modelViewMat = this.drawableCollection.viewMatrix;//.mult(transform);
                var center = modelViewMat.multMatrixPnt(bbox.getCenter());
                var rVec = modelViewMat.multMatrixVec(bbox.getRadialVec());
                var r    = rVec.length();
                var dist = Math.max(-center.z - r, this.drawableCollection.near);
                var projPixelLength = dist * this.drawableCollection.pixelHeightAtDistOne;
                var coverage = (r * 2.0) / projPixelLength;

                if (coverage < 250 /*this.drawableCollection.smallFeatureThreshol*/ )
                {
                    return;   // differentiate between outside and this case
                }

                //leaf node - add drawables
                if(node.split_axis == -1)
                {
                    //add all drawables of datanodes between indices of node (dataIndex[0] - dataIndex[1])
                    for(var i = 0, n = node.dataIndex[1]; i < n; ++i)
                    {
                        this.drawableCollection.addDrawable(this.dataNodes[this.index[node.dataIndex[0]+i]].drawable);
                    }
                }
                else
                {
                    //get box volumes from split
                    var boxVolumes = this.splitBoxVolume(bbox, node.split_axis, node.clip[0], node.clip[1]);

                    //call with children
                    this.intersect(node.leftChild,  boxVolumes[0], planeMask);

                    this.intersect(node.rightChild, boxVolumes[1], planeMask);
                }
            }
        }
    }
);
