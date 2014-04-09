/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### Collision ###
x3dom.registerNodeType(
    "Collision",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        
        /**
         * Constructor for Collision
         * @constructs x3dom.nodeTypes.Collision
         * @x3d x.x
         * @component Navigation
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Collision.superClass.call(this, ctx);


            /**
             *
             * @var {SFBool} enabled
             * @memberof x3dom.nodeTypes.Collision
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool (ctx, "enabled", true);

            /**
             *
             * @var {SFNode} proxy
             * @memberof x3dom.nodeTypes.Collision
             * @initvalue x3dom.nodeTypes.X3DGroupingNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode ("proxy", x3dom.nodeTypes.X3DGroupingNode);

            // TODO; add Slots: collideTime, isActive
        
        },
        {
            collectDrawableObjects: function (transform, drawableCollection, singlePath, invalidateCache, planeMask)
            {
                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                if (singlePath && (invalidateCache = invalidateCache || this.cacheInvalid()))
                    this.invalidateCache();

                planeMask = drawableCollection.cull(transform, this.graphState(), singlePath, planeMask);
                if (planeMask <= 0) {
                    return;
                }

                var cnode, childTransform;

                if (singlePath) {
                    if (!this._graph.globalMatrix) {
                        this._graph.globalMatrix = this.transformMatrix(transform);
                    }
                    childTransform = this._graph.globalMatrix;
                }
                else {
                    childTransform = this.transformMatrix(transform);
                }

                for (var i=0, n=this._childNodes.length; i<n; i++)
                {
                    if ((cnode = this._childNodes[i]) && (cnode !== this._cf.proxy.node)) {
                        cnode.collectDrawableObjects(childTransform, drawableCollection, singlePath, invalidateCache, planeMask);
                    }
                }
            }
        }
    )
);