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
        function (ctx) {
            x3dom.nodeTypes.X3DLODNode.superClass.call(this, ctx);

            this.addField_SFBool (ctx, "forceTransitions", false);
            this.addField_SFVec3f(ctx, "center", 0, 0, 0);

            this._eye = new x3dom.fields.SFVec3f(0, 0, 0);
        },
        {
            collectDrawableObjects: function(transform, drawableCollection, singlePath, invalidateCache, planeMask)
            {
                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                if (singlePath && (invalidateCache = invalidateCache || this.cacheInvalid()))
                    this.invalidateCache();

                planeMask = drawableCollection.cull(transform, this.graphState(), singlePath, planeMask);
                if (planeMask <= 0) {
                    return;
                }

                // at the moment, no caching here as children may change every frame
                singlePath = false;

                this.visitChildren(transform, drawableCollection, singlePath, invalidateCache, planeMask);

                //out.LODs.push( [transform, this] );
            },

            visitChildren: function(transform, drawableCollection, singlePath, invalidateCache, planeMask) {
                // overwritten
            }
        }
    )
);