/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */


// ### CADFace ###
x3dom.registerNodeType(
    "CADFace",
    "CADGeometry",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        
        /**
         * Constructor for CADFace
         * @constructs x3dom.nodeTypes.CADFace
         * @x3d 3.3
         * @component CADGeometry
         * @status full
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The CADFace node holds the geometry representing a face of a part.
         */
        function (ctx) {
            x3dom.nodeTypes.CADFace.superClass.call(this, ctx);


            /**
             * The name field specifies the name of the CADFace.
             * @var {x3dom.fields.SFString} name
             * @memberof x3dom.nodeTypes.CADFace
             * @initvalue ""
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'name', "");

            /**
             * The shape field contains the geometry and appearance for the face or an LOD node containing different
             * detail levels of the shape. If an LOD node is provided, each child of the LOD node shall be a single
             * Shape of varying complexity.
             * @var {x3dom.fields.SFNode} shape
             * @memberof x3dom.nodeTypes.CADFace
             * @initvalue X3DShapeNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode('shape', x3dom.nodeTypes.X3DShapeNode);
        
        },
        {
            getVolume: function()
            {
                var vol = this._graph.volume;

                if (!this.volumeValid() && this._vf.render)
                {
                    var child = this._cf.shape.node;
                    var childVol = (child && child._vf.render === true) ? child.getVolume() : null;

                    if (childVol && childVol.isValid())
                        vol.extendBounds(childVol.min, childVol.max);
                }

                return vol;
            },

            collectDrawableObjects: function (transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes)
            {
                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                if (singlePath && (invalidateCache = invalidateCache || this.cacheInvalid()))
                    this.invalidateCache();

                if (!this._cf.shape.node ||
                    (planeMask = drawableCollection.cull(transform, this.graphState(), singlePath, planeMask)) < 0) {
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

                if ( (cnode = this._cf.shape.node) ) {
                    cnode.collectDrawableObjects(childTransform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes);
                }
            }
        }
    )
);
