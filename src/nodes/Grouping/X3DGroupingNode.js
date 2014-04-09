/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### X3DGroupingNode ###
x3dom.registerNodeType(
    "X3DGroupingNode",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DBoundedNode,
        
        /**
         * Constructor for X3DGroupingNode
         * @constructs x3dom.nodeTypes.X3DGroupingNode
         * @x3d x.x
         * @component Grouping
         * @status experimental
         * @extends x3dom.nodeTypes.X3DBoundedNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DGroupingNode.superClass.call(this, ctx);


            /**
             *
             * @var {MFNode} children
             * @memberof x3dom.nodeTypes.X3DGroupingNode
             * @initvalue x3dom.nodeTypes.X3DChildNode
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode);
            // FIXME; add addChild and removeChild slots ?
        
        },
        {
            collectDrawableObjects: function (transform, drawableCollection, singlePath, invalidateCache, planeMask)
            {
                // check if multi parent sub-graph, don't cache in that case
                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                // an invalid world matrix or volume needs to be invalidated down the hierarchy
                if (singlePath && (invalidateCache = invalidateCache || this.cacheInvalid()))
                    this.invalidateCache();

                // check if sub-graph can be culled away or render flag was set to false
                planeMask = drawableCollection.cull(transform, this.graphState(), singlePath, planeMask);
                if (planeMask <= 0) {
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

                for (var i=0, n=this._childNodes.length; i<n; i++) {
                    if ( (cnode = this._childNodes[i]) ) {
                        cnode.collectDrawableObjects(childTransform, drawableCollection, singlePath, invalidateCache, planeMask);
                    }
                }
            }
        }
    )
);