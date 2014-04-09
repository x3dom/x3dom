/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DBoundedNode ### */
x3dom.registerNodeType(
    "X3DBoundedNode",
    "Core",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        
        /**
         * Constructor for X3DBoundedNode
         * @constructs x3dom.nodeTypes.X3DBoundedNode
         * @x3d x.x
         * @component Core
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DBoundedNode.superClass.call(this, ctx);


            /**
             *
             * @var {SFBool} render
             * @memberof x3dom.nodeTypes.X3DBoundedNode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'render', true);

            /**
             *
             * @var {SFVec3f} bboxCenter
             * @memberof x3dom.nodeTypes.X3DBoundedNode
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'bboxCenter', 0, 0, 0);

            /**
             *
             * @var {SFVec3f} bboxSize
             * @memberof x3dom.nodeTypes.X3DBoundedNode
             * @initvalue -1,-1,-1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'bboxSize', -1, -1, -1);

            this._graph = {
                boundedNode:  this,    // backref to node object
                localMatrix:  x3dom.fields.SFMatrix4f.identity(),   // usually identity
                globalMatrix: null,    // new x3dom.fields.SFMatrix4f();
                volume:       new x3dom.fields.BoxVolume(),     // local bbox
                worldVolume:  new x3dom.fields.BoxVolume(),     // global bbox
                center:       new x3dom.fields.SFVec3f(0,0,0),  // center in eye coords
                coverage:     -1,       // currently approx. number of pixels on screen
                needCulling:  true      // to be able to disable culling per node
            };
        
        },
        {
            fieldChanged: function (fieldName) {
                // TODO; wait for sync traversal to invalidate en block
                if (this._vf.hasOwnProperty(fieldName)) {
                    this.invalidateVolume();
                    //this.invalidateCache();
                }
            },

            nodeChanged: function () {
                // TODO; wait for sync traversal to invalidate en block
                this.invalidateVolume();
                //this.invalidateCache();
            },

            parentAdded: function(parent) {
                // some default behavior if not overwitten
                this.invalidateVolume();
                //this.invalidateCache();
            },

            getVolume: function()
            {
                var vol = this._graph.volume;

                if (!this.volumeValid() && this._vf.render)
                {
                    for (var i=0, n=this._childNodes.length; i<n; i++)
                    {
                        var child = this._childNodes[i];
                        // render could be undefined, but undefined != true
                        if (!child || child._vf.render !== true)
                            continue;

                        var childVol = child.getVolume();

                        if (childVol && childVol.isValid())
                            vol.extendBounds(childVol.min, childVol.max);
                    }
                }

                return vol;
            },

            invalidateVolume: function()
            {
                var graph = this._graph;

                graph.volume.invalidate();

                // also clear cache
                graph.worldVolume.invalidate();
                graph.globalMatrix = null;

                // set parent volumes invalid, too
                for (var i=0, n=this._parentNodes.length; i<n; i++) {
                    var node = this._parentNodes[i];
                    if (node && node.volumeValid())
                        node.invalidateVolume();
                }
            },

            invalidateCache: function()
            {
                var graph = this._graph;

                //if (graph.volume.isValid() &&
                //    graph.globalMatrix == null && !graph.worldVolume.isValid())
                //    return;     // stop here, we're already done

                graph.worldVolume.invalidate();
                graph.globalMatrix = null;

                // clear children's cache, too
                //for (var i=0, n=this._childNodes.length; i<n; i++) {
                //    var node = this._childNodes[i];
                //    if (node)
                //        node.invalidateCache();
                //}
            },

            cacheInvalid: function()
            {
                return ( this._graph.globalMatrix == null ||
                    !this._graph.worldVolume.isValid() );
            },

            volumeValid: function()
            {
                return this._graph.volume.isValid();
            },

            graphState: function()
            {
                return this._graph;
            },

            forceUpdateCoverage: function()
            {
                return false;
            }
        }
    )
);