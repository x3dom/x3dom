/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### X3DLODNode ###
x3dom.registerNodeType(
    "X3DLODNode",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        
        /**
         * Constructor for X3DLODNode
         * @constructs x3dom.nodeTypes.X3DLODNode
         * @x3d x.x
         * @component Navigation
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DLODNode.superClass.call(this, ctx);


            /**
             * The forceTransitions field specifies whether browsers are allowed to disregard level distances in order to provide better performance.
             * @var {x3dom.fields.SFBool} forceTransitions
             * @memberof x3dom.nodeTypes.X3DLODNode
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool (ctx, "forceTransitions", false);

            /**
             * The center field is a translation offset in the local coordinate system that specifies the centre of the LOD node for distance calculations.
             * @var {x3dom.fields.SFVec3f} center
             * @memberof x3dom.nodeTypes.X3DLODNode
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, "center", 0, 0, 0);

            this._eye = new x3dom.fields.SFVec3f(0, 0, 0);
        
        },
        {
            collectDrawableObjects: function(transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes)
            {
                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                if (singlePath && (invalidateCache = invalidateCache || this.cacheInvalid()))
                    this.invalidateCache();

                planeMask = drawableCollection.cull(transform, this.graphState(), singlePath, planeMask);
                if (planeMask < 0) {
                    return;
                }

                // at the moment, no caching here as children may change every frame
                singlePath = false;

                this.visitChildren(transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes);

                //out.LODs.push( [transform, this] );
            },

            visitChildren: function(transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes) {
                // overwritten
            }
        }
    )
);
