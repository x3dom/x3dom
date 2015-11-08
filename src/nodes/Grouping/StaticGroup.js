/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### StaticGroup ###
x3dom.registerNodeType(
    "StaticGroup",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        
        /**
         * Constructor for StaticGroup
         * @constructs x3dom.nodeTypes.StaticGroup
         * @x3d 3.3
         * @component Grouping
         * @status full
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The StaticGroup node contains children nodes which cannot be modified.
         * StaticGroup children are guaranteed to not change, send events, receive events or contain any USE references outside the StaticGroup.
         * This allows the browser to optimize this content for faster rendering and less memory usage.
         */
        function (ctx) {
            x3dom.nodeTypes.StaticGroup.superClass.call(this, ctx);

            // Node implements optimizations; no need to maintain the children node's
            // X3D representations, as they cannot be accessed after creation time
            x3dom.debug.logWarning("StaticGroup erroneously also bakes parent transforms, if happens use Group node!"); // Blender exports to SG

            /**
             * Enables debugging.
             * @var {x3dom.fields.SFBool} debug
             * @memberof x3dom.nodeTypes.StaticGroup
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'debug', false);

            /**
             * Enable debug box volumes.
             * @var {x3dom.fields.SFBool} showDebugBoxVolumes
             * @memberof x3dom.nodeTypes.StaticGroup
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'showDebugBoxVolumes', false);

            // type of bvh to use, supported are 'jsBIH', 'BIH' and 'OCTREE'

            /**
             * Defines the type of bvh to use. Supported are 'jsBIH', 'BIH' and 'OCTREE'.
             * @var {x3dom.fields.SFString} bvhType
             * @memberof x3dom.nodeTypes.StaticGroup
             * @initvalue 'jsBIH'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'bvhType', 'jsBIH');

            /**
             *
             * @var {x3dom.fields.SFInt32} maxObjectsPerNode
             * @memberof x3dom.nodeTypes.StaticGroup
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'maxObjectsPerNode', 1);
            // -1 sets default values, other values forces maxDepth

            /**
             *
             * @var {x3dom.fields.SFInt32} maxDepth
             * @memberof x3dom.nodeTypes.StaticGroup
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'maxDepth', -1);

            /**
             *
             * @var {x3dom.fields.SFFloat} minRelativeBBoxSize
             * @memberof x3dom.nodeTypes.StaticGroup
             * @initvalue 0.01
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'minRelativeBBoxSize', 0.01);

            this.needBvhRebuild = true;
            this.drawableCollection = null;
            this.bvh = null;
        
        },
        {
            getMaxDepth : function()
            {
                if(this._vf.maxDepth == -1 )
                {
                    return (this._vf.bvhType == ('jsBIH' || 'BIH')) ? 50 : 4;
                }
                return this._vf.maxDepth;
            },

            collectDrawableObjects: function (transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes)
            {
                // check if multi parent sub-graph, don't cache in that case
                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                // an invalid world matrix or volume needs to be invalidated down the hierarchy
                if (singlePath && (invalidateCache = invalidateCache || this.cacheInvalid()))
                    this.invalidateCache();

                // check if sub-graph can be culled away or render flag was set to false
                planeMask = drawableCollection.cull(transform, this.graphState(), singlePath, planeMask);
                if (planeMask < 0) {
                    return;
                }

                var cnode, childTransform;

                if (singlePath) {
                    // rebuild cache on change and reuse world transform
                    if (!this._graph.globalMatrix) {
                        this._graph.globalMatrix = this.transformMatrix(transform);
                    }
                    childTransform = this._graph.globalMatrix;
                }
                else {
                    childTransform = this.transformMatrix(transform);
                }

                if (this.needBvhRebuild)
                {
                    var drawableCollectionConfig = {
                        viewArea: drawableCollection.viewarea,
                        sortTrans: drawableCollection.sortTrans,
                        viewMatrix: drawableCollection.viewMatrix,
                        projMatrix: drawableCollection.projMatrix,
                        sceneMatrix: drawableCollection.sceneMatrix,
                        frustumCulling: false,
                        smallFeatureThreshold: 0,//1,    // THINKABOUTME
                        context: drawableCollection.context
                    };

                    this.drawableCollection = new x3dom.DrawableCollection(drawableCollectionConfig);

                    var i, n = this._childNodes.length;
                    for (i=0; i<n; i++) {
                        if ( (cnode = this._childNodes[i]) ) {
                            //this is only used to collect all drawables once
                            cnode.collectDrawableObjects(childTransform, this.drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes);
                        }
                    }
                    this.drawableCollection.concat();

                    var scene = this._nameSpace.doc._scene;

                    //create settings
                    var bvhSettings = new x3dom.bvh.Settings(
                        this._vf.debug,
                        this._vf.showDebugBoxVolumes,
                        this._vf.bvhType,
                        this._vf.maxObjectsPerNode,
                        this.getMaxDepth(),
                        this._vf.minRelativeBBoxSize
                    );
                    //create bvh type
                    this.bvh = (this._vf.bvhType == 'jsBIH' ) ?
                        new x3dom.bvh.BIH(scene, bvhSettings) :
                        new x3dom.bvh.Culler(this.drawableCollection,scene, bvhSettings);

                    //add decorator for debug shapes
                    if(this._vf.debug || this._vf.showDebugBoxVolumes)
                        this.bvh = new x3dom.bvh.DebugDecorator(this.bvh, scene, bvhSettings);

                    //add drawables
                    n = this.drawableCollection.length;
                    for (i = 0; i < n; i++)
                    {
                        this.bvh.addDrawable(this.drawableCollection.get(i))
                    }

                    //compile bvh
                    this.bvh.compile();

                    if(this._vf.debug)
                        this.bvh.showCompileStats();

                    this.needBvhRebuild = false;    // TODO: re-evaluate if Inline node is child node
                }

                x3dom.Utils.startMeasure('bvhTraverse');
                //collect drawables
                this.bvh.collectDrawables(drawableCollection);
                var dt = x3dom.Utils.stopMeasure('bvhTraverse');
                this._nameSpace.doc.ctx.x3dElem.runtime.addMeasurement('BVH', dt);

                //show stats
                this.bvh.showTraverseStats(this._nameSpace.doc.ctx.x3dElem.runtime);
            }
        }
    )
);
