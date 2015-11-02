/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### Switch ###
x3dom.registerNodeType(
    "Switch",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        
        /**
         * Constructor for Switch
         * @constructs x3dom.nodeTypes.Switch
         * @x3d 3.3
         * @component Grouping
         * @status full
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Switch grouping node traverses zero or one of the nodes specified in the children field.
         * All nodes under a Switch continue to receive and send events regardless of the value of whichChoice.
         * For example, if an active TimeSensor is contained within an inactive choice of an Switch, the TimeSensor sends events regardless of the Switch's state.
         */
        function (ctx) {
            x3dom.nodeTypes.Switch.superClass.call(this, ctx);


            /**
             * The whichChoice field specifies the index of the child to traverse, with the first child having index 0.
             * If whichChoice is less than zero or greater than the number of nodes in the children field, nothing is chosen.
             * @var {x3dom.fields.SFInt32} whichChoice
             * @memberof x3dom.nodeTypes.Switch
             * @initvalue -1
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, 'whichChoice', -1);
        
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "whichChoice") {
                    this.invalidateVolume();
                    //this.invalidateCache();
                }
            },

            getVolume: function()
            {
                var vol = this._graph.volume;

                if (!this.volumeValid() && this._vf.render)
                {
                    if (this._vf.whichChoice >= 0 &&
                        this._vf.whichChoice < this._childNodes.length)
                    {
                        var child = this._childNodes[this._vf.whichChoice];

                        var childVol = (child && child._vf.render === true) ? child.getVolume() : null;

                        if (childVol && childVol.isValid())
                            vol.extendBounds(childVol.min, childVol.max);
                    }
                }

                return vol;
            },

            collectDrawableObjects: function (transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes)
            {
                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                if (singlePath && (invalidateCache = invalidateCache || this.cacheInvalid()))
                    this.invalidateCache();

                if (this._vf.whichChoice < 0 || this._vf.whichChoice >= this._childNodes.length ||
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

                if ( (cnode = this._childNodes[this._vf.whichChoice]) ) {
                    cnode.collectDrawableObjects(childTransform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes);
                }
            },

            doIntersect: function(line)
            {
                if (this._vf.whichChoice < 0 ||
                    this._vf.whichChoice >= this._childNodes.length) {
                    return false;
                }

                var child = this._childNodes[this._vf.whichChoice];
                if (child) {
                    return child.doIntersect(line);
                }

                return false;
            }
        }
    )
);
