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
    defineClass(x3dom.nodeTypes.X3DBoundedObject,
        
        /**
         * Constructor for X3DGroupingNode
         * @constructs x3dom.nodeTypes.X3DGroupingNode
         * @x3d 3.3
         * @component Grouping
         * @status experimental
         * @extends x3dom.nodeTypes.X3DBoundedObject
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This abstract node type indicates that concrete node types derived from it contain children nodes
         * and is the basis for all aggregation.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DGroupingNode.superClass.call(this, ctx);


            /**
             * Grouping nodes have a field that contains a list of children nodes. Each grouping node defines a
             * coordinate space for its children. This coordinate space is relative to the coordinate space of the node
             * of which the group node is a child. Such a node is called a parent node. This means that transformations
             * accumulate down the scene graph hierarchy.
             * @var {x3dom.fields.MFNode} children
             * @memberof x3dom.nodeTypes.X3DGroupingNode
             * @initvalue X3DChildNode
             * @field x3d
             * @instance
             */
            this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode);
            // FIXME; add addChild and removeChild slots ?
        
        },
        {
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

                var n = this._childNodes.length;

                if (x3dom.nodeTypes.ClipPlane.count > 0) {
                    var localClipPlanes = [];

                    for (var j = 0; j < n; j++) {
                        if ( (cnode = this._childNodes[j]) ) {
                            if (x3dom.isa(cnode, x3dom.nodeTypes.ClipPlane) && cnode._vf.on && cnode._vf.enabled) {
                                localClipPlanes.push({plane: cnode, trafo: childTransform});
                            }
                        }
                    }

                    clipPlanes = localClipPlanes.concat(clipPlanes);
                }

                for (var i=0; i<n; i++) {
                    if ( (cnode = this._childNodes[i]) ) {
                        cnode.collectDrawableObjects(childTransform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes);
                    }
                }
            }
        }
    )
);
