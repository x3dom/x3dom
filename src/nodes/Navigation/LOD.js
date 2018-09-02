/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### LOD ###
x3dom.registerNodeType(
    "LOD",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DLODNode,
        
        /**
         * Constructor for LOD
         * @constructs x3dom.nodeTypes.LOD
         * @x3d 3.3
         * @component Navigation
         * @status experimental
         * @extends x3dom.nodeTypes.X3DLODNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc LOD (Level Of Detail) uses camera-to-object distance to switch among contained child levels.
         * (Contained nodes are now called 'children' rather than 'level', for consistent naming among all GroupingNodeType nodes.)
         * LOD range values go from near to far (as child geometry gets simpler for better performance).
         * For n range values, you must have n+1 children levels! Only the currently selected children level is rendered, but all levels continue to send/receive events.
         */
        function (ctx) {
            x3dom.nodeTypes.LOD.superClass.call(this, ctx);


            /**
             * Camera-to-object distance transitions for each child level, where range values go from near to far. For n range values, you must have n+1 child levels! Hint: can add an empty Group node as nonrendering final child.
             * @var {x3dom.fields.MFFloat} range
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.LOD
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFFloat(ctx, "range", []);

            /**
             * outputOnly field which is emitted when the level changes to another range index. When L(d) is activated for display, the LOD node generates a level_changed event with value i where the value of i identifies which value of L was activated for display. Indicates current level of LOD children when activated.
             * @var {x3dom.fields.SFInt32} level_changed
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.LOD
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, "level_changed", 0);

            this._lastRangePos = -1;
        
        },
        {
            visitChildren: function(transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes)
            {
                var i=0, n=this._childNodes.length;

                var mat_view = drawableCollection.viewMatrix;

                var center = new x3dom.fields.SFVec3f(0, 0, 0); // eye
                center = mat_view.inverse().multMatrixPnt(center);

                //transform eye point to the LOD node's local coordinate system
                this._eye = transform.inverse().multMatrixPnt(center);

                var len = this._vf.center.subtract(this._eye).length();

                //calculate range check for viewer distance d (with range in local coordinates)
                //N+1 children nodes for N range values (L0, if d < R0, ... Ln-1, if d >= Rn-1)
                while (i < this._vf.range.length && len > this._vf.range[i]) {
                    i++;
                }
                if (i && i >= n) {
                    i = n - 1;
                }
              
                if (i !== this._lastRangePos) {
                    //x3dom.debug.logInfo('Changed from '+this._lastRangePos+' th range to '+i+' th.');
                    this.postMessage('level_changed', i);
                }
              
                this._lastRangePos = i;

                var cnode = this._childNodes[i];
                if (n && cnode)
                {
                    var childTransform = this.transformMatrix(transform);
                    cnode.collectDrawableObjects(childTransform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes);
                }
            },

            getVolume: function()
            {
                var vol = this._graph.volume;

                if (!this.volumeValid() && this._vf.render)
                {
                    var child, childVol;

                    if (this._lastRangePos >= 0) {
                        child = this._childNodes[this._lastRangePos];

                        childVol = (child && child._vf.render === true) ? child.getVolume() : null;

                        if (childVol && childVol.isValid())
                            vol.extendBounds(childVol.min, childVol.max);
                    }
                    else {  // first time we're here
                        for (var i=0, n=this._childNodes.length; i<n; i++)
                        {
                            if (!(child = this._childNodes[i]) || child._vf.render !== true)
                                continue;

                            childVol = child.getVolume();

                            if (childVol && childVol.isValid())
                                vol.extendBounds(childVol.min, childVol.max);
                        }
                    }
                }

                return vol;
            },

            nodeChanged: function() {
                //this._needReRender = true;
                this.invalidateVolume();
                //this.invalidateCache();
            },

            fieldChanged: function(fieldName) {
                //this._needReRender = true;
                if (fieldName == "render" ||
                    fieldName == "center" ||
                    fieldName == "range") {
                    this.invalidateVolume();
                    //this.invalidateCache();
                }
            }
        }
    )
);
