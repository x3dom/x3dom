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
         * @x3d 3.3
         * @component Navigation
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Collision detects camera-to-object contact using current Viewpoint and NavigationInfo avatarSize.
         * Collision is a Grouping node that handles collision detection for its children.
         * Collision can contain a single proxy child node for substitute collision-detection geometry.
         * Note: proxy geometry is not rendered.
         * Note: PointSet, IndexedLineSet, LineSet and Text do not trigger collisions.
         * Hint: improve performance using proxy for simpler contact-calculation geometry.
         * Hint: NavigationInfo types ''WALK' 'FLY'' support camera-to-object collision detection.
         * Hint: insert a Shape node before adding geometry or Appearance.
         */
        function (ctx) {
            x3dom.nodeTypes.Collision.superClass.call(this, ctx);


            /**
             * Enables/disables collision detection for children and all descendants. Hint: former name quotecollidequote in VRML 97 specification.
             * @var {x3dom.fields.SFBool} enabled
             * @memberof x3dom.nodeTypes.Collision
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool (ctx, "enabled", true);

            /**
             * alternate object to be checked for collision, in place of the children of this node.
             * @var {x3dom.fields.SFNode} proxy
             * @memberof x3dom.nodeTypes.Collision
             * @initvalue x3dom.nodeTypes.X3DGroupingNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode ("proxy", x3dom.nodeTypes.X3DGroupingNode);


            // TODO; add Slots: collideTime, isActive
            /**
             * NOT YET IMPLEMENTED. The time of collision.
             * @var {x3dom.fields.SFTime} collideTime
             * @memberof x3dom.nodeTypes.Collision
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFTime (ctx, "collideTime", 0);

            /**
             * NOT YET IMPLEMENTED. The value of the isActive field indicates the current state of the Collision node.
             * An isActive TRUE event is generated when a collision occurs. An isActive FALSE event is generated when a collision no longer occurs.
             * @var {x3dom.fields.SFBool} isActive
             * @memberof x3dom.nodeTypes.Collision
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool (ctx, "isActive", true);
        },
        {
            collectDrawableObjects: function (transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes)
            {
                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                if (singlePath && (invalidateCache = invalidateCache || this.cacheInvalid()))
                    this.invalidateCache();

                planeMask = drawableCollection.cull(transform, this.graphState(), singlePath, planeMask);
                if (planeMask < 0) {
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
                        cnode.collectDrawableObjects(childTransform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes);
                    }
                }
            }
        }
    )
);
