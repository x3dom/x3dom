/**
 * This is a description of the foo function.
 */
function foo()
{
}


/**
 * This is a description of the bar function.
 * @deprecated since version 1.6
 */
function bar()
{
}


/**
 * Represents a book.
 * @constructor
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 */
function Book(title, author)
{
}


/**
 * A module that does pretty much
 * @exports x3derp
 */
var x3derp = {};


/**
 * Say hello.
 * @returns {string} The famous "Hello World" string
 */
x3derp.sayHello = function() {
    return 'Hello world';
};


/**
 * Core nodes
 * @namespace
 */
var Core = {}


//function call to "registerNodeType"
x3derp.registerNodeType(
    
    "X3DBoundedNode",
    
    "Core",
    
    /**     
     * @class X3DBoundedNode
     * @extends X3DChildNode
     * @abstract
     *
     * @classdesc An abstract base class for bounded nodes.
     *            See {@link https://github.com Field Description} 
     */
    defineClass(x3dom.nodeTypes.X3DChildNode,
    
        function (ctx)
        {
            x3dom.nodeTypes.X3DBoundedNode.superClass.call(this, ctx);

            /**
             * ({@link https://github.com FIELD MEMBER})
             * @memberof X3DBoundedNode
             * @member {SFBool} render
             * @default true
             * @instance             
             */   
            this.addField_SFBool(ctx, 'render', true);
            this.addField_SFVec3f(ctx, 'bboxCenter', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'bboxSize', -1, -1, -1);

            /**
             * Graph information
             * @memberof X3DBoundedNode            
             * @member {Object} _graph
             * @instance             
             */             
            this._graph = {
                /**
                 * Reference to this bounded node object.
                 * @instance
                 */
                boundedNode:  this,    // backref to node object
                
                /**
                 * Local transformation matrix.
                 */
                localMatrix:  x3dom.fields.SFMatrix4f.identity(),   // usually identity
                
                globalMatrix: null,    // new x3dom.fields.SFMatrix4f();
                volume:       new x3dom.fields.BoxVolume(),     // local bbox
                worldVolume:  new x3dom.fields.BoxVolume(),     // global bbox
                center:       new x3dom.fields.SFVec3f(0,0,0),  // center in eye coords
                coverage:     -1       // currently approx. number of pixels on screen
            };
        },
        
        {
            /**
             * 
             * Invoked on field changes.
             * @memberof X3DBoundedNode
             * @abstract
             * @instance
             */             
            fieldChanged: function(fieldName) {    //TODO: ugly, check if it's necessary and if it works everywhere
                if (this._vf.hasOwnProperty(fieldName)) {
                    this.invalidateVolume();
                }
            },

            nodeChanged: function () {                
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

