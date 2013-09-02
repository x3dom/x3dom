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
    function(debug, showDebugBoxVolumes,bvhType, maxObjectsPerNode, maxDepth, minRelBBoxSize)
    {
        this.debug = debug;
        this.showDebugBoxVolumes = showDebugBoxVolumes;
        this.bvhType = bvhType;
        this.maxObjectsPerNode = maxObjectsPerNode;
        this.maxDepth = maxDepth;
        this.minRelativeBBoxSize = minRelBBoxSize !== 'undefined' ? minRelBBoxSize : 0.01;
        this.MASK_SET = 63;
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
 * Base class for jsBVHs
 */
x3dom.bvh.Base = defineClass(
    null,
    function(settings)
    {
        /*Data Members*/
        this.dataNodes = [];
        this.drawableCollection = null;
        this.coveredBoxVolume = null;
        this.settings = settings;
    },
    {
        /*add Drawable as DataNode to BVH */
        addDrawable : function(drawable)
        {
            this.dataNodes.push(new x3dom.bvh.DataNode(drawable));
        },
        /*get Node BoxVolume - to be overwritten for actual hierarchies*/
        getHierarchyNodeBoxVolume : function(id)
        {
            if(this.dataNodes.length  > id)
            {
                return this.dataNodes[id].bbox;
            }
            return null;
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
                return "z";
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
        },
        calculateCoverage : function(bbox)
        {
            //small feature culling
            var modelViewMat = this.drawableCollection.viewMatrix;
            var center = modelViewMat.multMatrixPnt(bbox.getCenter());
            var rVec = modelViewMat.multMatrixVec(bbox.getRadialVec());
            var r    = rVec.length();
            var dist = Math.max(-center.z - r, this.drawableCollection.near);
            var projPixelLength = dist * this.drawableCollection.pixelHeightAtDistOne;
            return (r * 2.0) / projPixelLength;
        }
    }
);

//---------------------------------------------------------------------------------------------------------------------

/**
 * Decorator for BVH- Debugging
 */
x3dom.bvh.DebugDecorator = defineClass(
    null,
    function(bvh,scene,settings)
    {
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
        compile : function()
        {
            if(this.bvh.settings.showDebugBoxVolumes && this.scene != null)
            {
                this.createDebugShape();
            }
            if(this.bvh.settings.bvhType == 'jsBIH')
                x3dom.Utils.startMeasure("buildBVH");
            //compile
            this.bvh.compile();

            if(this.bvh.settings.debug && this.bvh.settings.bvhType == 'jsBIH')
            {
                console.log("Compile time: "+x3dom.Utils.stopMeasure("buildBVH"));
                console.log("BVH : %o",this.bvh);
            }
            if(this.bvh.settings.showDebugBoxVolumes)
            {
                if(this.bvh.settings.bvhType == 'jsBIH')
                    this.addHierarchyBoxVolumes();
                this.createLineRenderersFromBoxVolumes();
            }
        },
        showCompileStats : function()
        {
            this.bvh.showCompileStats();
        },
        collectDrawables : function(drawableCollection)
        {
            /*var getDCSize = function(drawableCollection)
            {
                var count = 0;
                for(var i = 0, n = drawableCollection.collection.length; i < n; ++i)
                {
                    count +=  drawableCollection.collection[i].length;
                }
                return count;
            };*/

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

            this.bvh.geo = null,
            this.bvh.coords = null;

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
                this.bvh.geo = new x3dom.nodeTypes.IndexedLineSet();
                this.bvh.coords = new x3dom.nodeTypes.Coordinate();
            }
        },
        addHierarchyBoxVolumes : function()
        {
            //add data from real bvh
            var id = 0;
            var boxVolume;
            while( (boxVolume = this.bvh.getHierarchyNodeBoxVolume(id)) != null)
            {

                this.addBoxVolumeToGeometry(boxVolume,this.bvh.geo);
                id++;
            }
        },
        createLineRenderersFromBoxVolumes : function()
        {
            //add data to frontend elements
            for(var i = 0, n = this.bvh.geo._mesh._positions[0].length; i < n; ++i)
            {
                this.bvh.coords._vf.point.push(this.bvh.geo._mesh._positions[0][i]);
            }

            for(var i = 0, n = this.bvh.geo._mesh._indices[0].length; i < n; ++i)
            {
                this.bvh.geo._vf.coordIndex.push(this.bvh.geo._mesh._indices[0][i]);
                this.bvh.geo._vf.colorIndex.push(0);
            }
            this.bvh.geo.addChild(this.bvh.coords);
            this.debugShape.addChild(this.bvh.geo);
            this.bvh.geo.nodeChanged();
            this.scene.addChild(this.debugShape);
            this.debugShape.nodeChanged();
            this.scene.nodeChanged();
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
        },
        showTraverseStats : function(runtime)
        {
            this.bvh.showTraverseStats(runtime);
        }
    }
);

//---------------------------------------------------------------------------------------------------------------------

/*******************************************
 * Bounding Interval Hierarchy -
 ******************************************/


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

        this.bbox = null;

        /* only set in leafs */
        this.dataIndex = [0,0];

    }
);

/**
 * Bounding Interval Hierarchy -
 */
x3dom.bvh.BIH = defineClass(
    x3dom.bvh.Base,
    function(scene, settings)
    {
        x3dom.bvh.BIH.superClass.call(this, settings);
        this.bihNodes = [];
        this.index = [];

        this.env = scene.getEnvironment();
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
            node.bbox = bbox;

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

            var relativeBBoxToSmall = (bbox.getDiameter()/ this.coveredBoxVolume.getDiameter()) <= this.settings.minRelativeBBoxSize;

            //get box volumes from split
            var voxel = this.splitBoxVolume(bbox, node.split_axis, node.clip[0], node.clip[1]); //splitCenter could be faster

            //subdivide or store leaves
            if((numLeft > this.settings.maxObjectsPerNode) && (depth < this.settings.maxDepth) && !relativeBBoxToSmall )
            {
                node.leftChild = this.processNode(this.bihNodes.length,startObjIndex,numLeft,voxel[0],depth+1);
            }
            else
            {
                //store in new Node
                node.leftChild = this.getNodeForIndex(this.bihNodes.length);
                node.leftChild.bbox = (numLeft == 1)? this.dataNodes[this.index[startObjIndex]].bbox : voxel[0];

                node.leftChild.dataIndex[0] = startObjIndex;
                node.leftChild.dataIndex[1] = numLeft;
            }

            if((numRight > this.settings.maxObjectsPerNode) && (depth < this.settings.maxDepth) && !relativeBBoxToSmall)
            {
               node.rightChild = this.processNode(this.bihNodes.length,startObjIndex +numLeft,numRight,voxel[1],depth+1);
            }
            else
            {
                //store in new Node
                node.rightChild = this.getNodeForIndex(this.bihNodes.length);
                node.rightChild.bbox = (numRight == 1)? this.dataNodes[this.index[startObjIndex+numLeft]].bbox : voxel[1];

                node.rightChild .dataIndex[0] = startObjIndex + numLeft;
                node.rightChild .dataIndex[1] = numRight;
            }

            return node;
        },
        /*get Node BoxVolume*/
        getHierarchyNodeBoxVolume : function(id)
        {
            if(this.bihNodes.length  > id)
            {
                return this.bihNodes[id].bbox;
            }
            return null;
        },

        /* compiles nodes into bih tree */
        compile : function()
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
        showCompileStats : function()
        {

        },
        /* return drawables to webgl for rendering */
        collectDrawables : function(drawableCollection)
        {
            this.drawableCollection = drawableCollection;

            if(this.bihNodes.length > 0)
            {
                var planeMask = 0;
                this.intersect(this.bihNodes[0], planeMask);
            }
        },
        calculateCoverage : function(bbox)
        {
            var modelViewMatrix = this.drawableCollection.viewMatrix;//.mult(transform);
            var center = modelViewMatrix.multMatrixPnt(bbox.getCenter());
            var rVec = modelViewMatrix.multMatrixVec(bbox.getRadialVec());
            var r    = rVec.length();
            var dist = Math.max(-center.z - r, this.drawableCollection.near);
            var projPixelLength = dist * this.drawableCollection.pixelHeightAtDistOne;
            return (r * 2.0) / projPixelLength;
        },
        intersect : function(node, planeMask)
        {
            //viewfrustum intersection test
            if(planeMask < this.settings.MASK_SET)
                planeMask = this.drawableCollection.viewFrustum.intersect(node.bbox,planeMask);
            if(planeMask >= 0)
            {
                //leaf node - add drawables
                if(node.split_axis == -1)
                {
                    //add all drawables of datanodes between indices of node (dataIndex[0] - dataIndex[1])
                    //if they cover enough pixels
                    for(var i = 0, n = node.dataIndex[1]; i < n; ++i)
                    {
                        var dataNode = this.dataNodes[this.index[node.dataIndex[0]+i]];
                        var coverage = this.calculateCoverage(dataNode.bbox);

                        if( coverage >= this.env._vf.smallFeatureThreshold )
                        {
                            dataNode.drawable.priority = coverage;
                            this.drawableCollection.addDrawable(dataNode.drawable);
                        }
                    }
                }
                else
                {
                    var coverage = this.calculateCoverage(node.bbox);
                    if (coverage >= this.env._vf.smallFeatureThreshold )
                    {
                        //traverse children
                        this.intersect(node.leftChild, planeMask);
                        this.intersect(node.rightChild, planeMask);
                    }
                }
            }
        },
        showTraverseStats : function(runtime)
        {

        }
    }
);

//---------------------------------------------------------------------------------------------------------------------

/**
 * Wrapper for cross-compiled Culler
 */
x3dom.bvh.Culler = defineClass(
    null,
    function(drawableCollection, scene, settings)
    {
        this.drawableCollection = drawableCollection;
        this.scene = scene;
        this.settings = settings;
        this.frameId = 0;

        this.compileSetup = new Module.CompileSetup();
        this.compileSetup.poolSize = this.drawableCollection.length;
        this.compileSetup.debug = this.settings.debug;
        this.compileSetup.showDebugBoxVolumes = this.settings.showDebugBoxVolumes;
        this.compileSetup.dataStructureType = this.settings.bvhType == "OCTREE" ? Module.DataStructureType.OCTREE : Module.DataStructureType.BIH;
        this.compileSetup.maxObjectsPerNode = this.settings.maxObjectsPerNode;
        this.compileSetup.maxDepth = this.settings.maxDepth;

        var that = this;

        var jsFuncs =
        {
            addStructureBoxVolume : function(depth, volume)
            {
                var volMin = volume.min, volMax = volume.max;

                var min = new x3dom.fields.SFVec3f(volMin.x, volMin.y, volMin.z),
                    max = new x3dom.fields.SFVec3f(volMax.x, volMax.y, volMax.z);


                var startId = that.geo._mesh._positions[0].length;
                that.geo._mesh._positions[0].push(
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
                that.geo._mesh._indices[0].push(
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
            },

            timeNow: function()
            {
                return performance.now();
            }
        };

        this.compileSetup.setJsCallbacks(Module.JsCallbacks.implement(jsFuncs));
        this.culler = new Module.Culler(this.compileSetup);

        this.traverseSetup = new Module.TraverseSetup();
    },
    {
        addDrawable : function(drawable)
        {
            var that = this;

            var funcs =
            {
                drawable: drawable,

                addDrawableToCollection : function(coverage)
                {
                    this.drawable.priority = coverage;
                    that.drawableCollection.addDrawable(this.drawable);
                },

                createBoxVolume : function()
                {
                    var bbox = new x3dom.fields.BoxVolume();
                    bbox.transformFrom(this.drawable.transform, this.drawable.shape.getVolume());
                    this.drawable.worldVolume = x3dom.fields.BoxVolume.copy(bbox);

                    var min = new x3dom.fields.SFVec3f(),max = new x3dom.fields.SFVec3f();
                    bbox.getBounds(min,max);

                    var boxVol = new Module.BoxVolume(new Module.SFVec3f(min.x,min.y,min.z),new Module.SFVec3f(max.x,max.y,max.z));
                    return boxVol;
                }
            };
            var dc = new Module.DrawableContainer.implement(funcs);
            this.culler.addDrawable(dc);
        },

        compile : function()
        {
            this.culler.compile();
        },
        showCompileStats : function()
        {
            console.log(this.culler.stats());
        },
        /* return drawables to webgl for rendering */
        collectDrawables : function(drawableCollection)
        {
            this.drawableCollection = drawableCollection;
            var viewFrustum = this.drawableCollection.viewFrustum;
            var modelViewMatrix = this.drawableCollection.viewMatrix;

            var mvm = new Module.SFMatrix4f(
                modelViewMatrix._00,modelViewMatrix._01,modelViewMatrix._02,modelViewMatrix._03,
                modelViewMatrix._10,modelViewMatrix._11,modelViewMatrix._12,modelViewMatrix._13,
                modelViewMatrix._20,modelViewMatrix._21,modelViewMatrix._22,modelViewMatrix._23,
                modelViewMatrix._30,modelViewMatrix._31,modelViewMatrix._32,modelViewMatrix._33);
            this.traverseSetup.setModelViewMatrix(mvm);


            var vf = new Module.FrustumVolume(
                viewFrustum.planeNormals[0].x,viewFrustum.planeNormals[0].y,viewFrustum.planeNormals[0].z, viewFrustum.planeDistances[0],
                viewFrustum.planeNormals[1].x,viewFrustum.planeNormals[1].y,viewFrustum.planeNormals[1].z, viewFrustum.planeDistances[1],
                viewFrustum.planeNormals[2].x,viewFrustum.planeNormals[2].y,viewFrustum.planeNormals[2].z, viewFrustum.planeDistances[2],
                viewFrustum.planeNormals[3].x,viewFrustum.planeNormals[3].y,viewFrustum.planeNormals[3].z, viewFrustum.planeDistances[3],
                viewFrustum.planeNormals[4].x,viewFrustum.planeNormals[4].y,viewFrustum.planeNormals[4].z, viewFrustum.planeDistances[4],
                viewFrustum.planeNormals[5].x,viewFrustum.planeNormals[5].y,viewFrustum.planeNormals[5].z, viewFrustum.planeDistances[5]
            );
            this.traverseSetup.setViewFrustum(vf);

            //set calculation parameters
            this.traverseSetup.pixelHeightAtDistOne = this.drawableCollection.pixelHeightAtDistOne;
            this.traverseSetup.nearClippingPlane = this.drawableCollection.near;

            var env = this.scene.getEnvironment();

            //setup culling methods
            this.traverseSetup.viewFrustumCulling = env._vf.frustumCulling;
            this.traverseSetup.smallFeatureCulling = env._vf.smallFeatureCulling;
            this.traverseSetup.occlusionCulling = env._vf.occlusionCulling;

            //set up parameters
            this.traverseSetup.smallFeatureThreshold = env._vf.smallFeatureThreshold;
            //this.traverseSetup.occlusionCoveredThreshold = env.occlusionVisibilityThreshold;

            //set up traverser
            this.traverseSetup.useRenderQueue = false;
            this.traverseSetup.frameId = this.frameId++;
            this.traverseSetup.traverserType = Module.TraverserType.DistanceQueue;

            this.culler.cull(this.traverseSetup);

            mvm.delete();
            vf.delete();
        },
        showTraverseStats : function( runtime)
        {
            var cullingStats = this.culler.stats().culling;
            runtime.addInfo('#CNodes Visited', cullingStats.nodesVisited);
            runtime.addInfo('#Cull Frustum', cullingStats.nodesViewFrustumCulled);
            runtime.addInfo('#Cull SFeature', cullingStats.nodesSmallFeatureCulled);
            runtime.addInfo('#Cull OCC', cullingStats.nodesOcclusionCulled);
            runtime.addInfo('#Drawables SF', cullingStats.drawablesSmallFeatureCulled);
        }
    }
);
