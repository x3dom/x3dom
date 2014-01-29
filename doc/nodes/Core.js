/**
 * @namespace x3dom.nodeTypes
 */
x3dom.nodeTypes = {};

x3dom.registerNodeType(
    "X3DNode",
    "Core",
    defineClass(null, 
	/**
	 * Constructor for X3DNode passing a context object
	 * @constructs x3dom.nodeTypes.X3DNode
     * @x3d 3.2
     * @component Core
     * @status full
	 * @param {Object} [ctx=null] - context object containing initial settings (namespace).
	 */
	function (ctx) {

        /**
         * reference to DOM element
         * @var {DOMNode} _xmlNode
         * @memberof x3dom.nodeTypes.X3DNode
         * @instance
         * @protected
         */
        this._xmlNode = null;

        /**
         * holds a link to the node name
         * @var {String} _DEF
         * @memberof x3dom.nodeTypes.X3DNode
         * @instance
         * @protected
         */
        this._DEF = null;

        /**
         * links the nameSpace
         * @var {x3dom.NodeNameSpace} _nameSpace
         * @memberof x3dom.nodeTypes.X3DNode
         * @instance
         * @protected
         */
        this._nameSpace = (ctx && ctx.nameSpace) ? ctx.nameSpace : null;

        /**
         * holds all value fields (e.g. SFFloat, MFVec3f, ...)
         * @var {Object} _vf
         * @memberof x3dom.nodeTypes.X3DNode
         * @instance
         * @protected
         */
        this._vf = {};

        /**
         * stores the value fields types
         * @var {Object} _vfFieldTypes
         * @memberof x3dom.nodeTypes.X3DNode
         * @instance
         * @protected
         */
        this._vfFieldTypes = {};
        
        /**
         * holds all child fields ( SFNode and MFNode )
         * @var {Object} _cf
         * @memberof x3dom.nodeTypes.X3DNode
         * @instance
         * @protected
         */
        this._cf = {};

        /**
         * stores the child fields types
         * @var {Object} _cfFieldTypes
         * @memberof x3dom.nodeTypes.X3DNode
         * @instance
         * @protected
         */
        this._cfFieldTypes = {};



        /**
         * fields that are being watched
         * @var {Object} _fieldWatchers
         * @memberof x3dom.nodeTypes.X3DNode
         * @instance
         * @protected
         */
        this._fieldWatchers = {};

        /**
         * routes to the node (?)
         * @var {Object} _routes
         * @memberof x3dom.nodeTypes.X3DNode
         * @instance
         * @protected
         */
        this._routes = {};


        /**
         * list of listeners
         * @var {Object} _listeners
         * @memberof x3dom.nodeTypes.X3DNode
         * @instance
         * @protected
         */
        this._listeners = {};

        /**
         * list of parent nodes
         * @var {Array} _parentNodes
         * @memberof x3dom.nodeTypes.X3DNode
         * @instance
         * @protected
         */
        this._parentNodes = [];

        /**
		 * @var {x3dom.nodeTypes.X3DMetadataObject} metadata
		 * @memberof x3dom.nodeTypes.X3DNode
         * @field x3d
         * @instance
		 */
		this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
    },
    {
		/**
		 * Returns the constructor
		 * @memberof x3dom.nodeTypes.X3DNode
		 * @instance
		 * @returns {Object}
		 */
		type: function () {
            return this.constructor;
        },
        
		/**
		 * Returns the constructors typename
		 * @memberof x3dom.nodeTypes.X3DNode
		 * @instance
		 * @returns {String}
		 */
        typeName: function () {
            return this.constructor._typeName;
        },

		/**
		 * Add the child node to the container field
		 * @memberof x3dom.nodeTypes.X3DNode
		 * @instance
		 * @function
		 * @function
		 * @virtual
		 * @param {Object} node - The node to be added as child 
		 * @param {String} containerFieldName - The name of the field to child is added to 
		 * @returns {Boolean}
		 */
        addChild: function (node, containerFieldName) {
            return false;
        },

		/**
		 * Remove the given child node 
		 * @memberof x3dom.nodeTypes.X3DNode
		 * @instance
		 * @function
		 * @virtual
		 * @param {Object} node - The child node to be removed 
		 * @returns {Boolean} [=false]
		 */
        removeChild: function (node) {           
            return false;
        },

		/**
		 * Function is called after a parent has been added 
		 * @memberof x3dom.nodeTypes.X3DNode
		 * @instance
		 * @function
		 * @virtual
		 * @param {Object} parent - The new parent node 
		 */
        parentAdded: function(parent) {
            // to be overwritten by concrete classes
        },

		/**
		 * Function is called after a parent has been removed 
		 * @memberof x3dom.nodeTypes.X3DNode
		 * @instance
		 * @function
		 * @virtual
		 * @param {Object} node - The old parent node
		 */
        parentRemoved: function(parent) {
            //...
        },

		
		/**
		 * Returns the current transform 
		 * @memberof x3dom.nodeTypes.X3DNode
		 * @instance
		 * @function
		 * @virtual
		 * @returns {x3dom.fields.SFMatrix4f} 
		 */
        getCurrentTransform: function () {            
            return x3dom.fields.SFMatrix4f.identity();
        },

		/**
		 * Returns the given transform - no idea what this is for yet ;)
		 * @memberof x3dom.nodeTypes.X3DNode
		 * @instance
		 * @param {x3dom.fields.SFMatrix4f} transform -  the transform that is returned ?!?
		 * @returns {x3dom.fields.SFMatrix4f} 
		 */
        transformMatrix: function (transform) {
            return transform;
        },

		/**
		 * Returns the world volume of the current node 
		 * @memberof x3dom.nodeTypes.X3DNode
		 * @instance
		 * @function
		 * @virtual 
		 * @returns {x3dom.fields.BoxVolume} return null for unbounded node
		 */
        getVolume: function () {
            //x3dom.debug.logWarning("Called getVolume for unbounded node!");
            return null;
        },

		/**
		 * Invalidates the current volume so it gets revalidated lazily
		 * @memberof x3dom.nodeTypes.X3DNode
		 * @instance
		 * @function
		 * @virtual 
		 */
        invalidateVolume: function() {
            // overwritten
        },

        /**
		 * Invalidates the cache
		 * @memberof x3dom.nodeTypes.X3DNode
		 * @instance
		 * @function
		 * @virtual 
		 */
        invalidateCache: function() {
            // overwritten
        },

        /**
		 * Gets the volumes validation state
		 * @memberof x3dom.nodeTypes.X3DNode
		 * @instance
		 * @function
		 * @virtual 
		 * @returns {FALSE}
		 */
        volumeValid: function() {
            return false;
        },

        /**
		 * Collects all drawable objects during traversal, explicitly does nothing on collect traversal for (most) nodes
		 * @memberof x3dom.nodeTypes.X3DNode
		 * @instance
		 * @function
		 * @virtual 
		 * @param {x3dom.fields.SFMatrix4f} transform - the current transform stack ?
		 * @param {x3dom.DrawableCollection} drawableCollection - the collection the drawable objects are added to
		 * @param {Boolean} invalidateCache - should the cache be invalidated ?
		 * @param {Number} planeMask - the plane mask used for view frustum culling
		 */
        collectDrawableObjects: function (transform, drawableCollection, singlePath, invalidateCache, planeMask) {
            // explicitly do nothing on collect traversal for (most) nodes
        },
        
		
        /**
		 * Highlights the node with the given color.
		 * @memberof x3dom.nodeTypes.X3DNode
		 * @instance
		 * @function
		 * @virtual 
		 * @param {Boolean} enable - status of highlighting
		 * @param {SFColor} color - the color used for highlighting
		 */
		highlight: function(enable, color)
        {
            //...
        },

		/**
		 * Returns the X3DDocument connected to the nodes namespace
		 * @memberof x3dom.nodeTypes.X3DNode
		 * @instance
		 * @returns {X3DDocument} 
		 */
        findX3DDoc: function () {
            return this._nameSpace.doc;
        },

		/**
		 * Test against intersection with a given line
		 * @memberof x3dom.nodeTypes.X3DNode
		 * @instance
		 * @function
		 * @virtual
		 * @params {Object} line - the line to be tested for intersection
		 * @returns {Boolean} 
		 */
        doIntersect: function(line) {
            var isect = false;
            for (var i=0; i<this._childNodes.length; i++) {
                //...
            }
            return isect;
        },

       
        /**
		 * Method for handling of field updates
		 * @memberof x3dom.nodeTypes.X3DNode
		 * @instance
		 * @params {String} field - the field to be updated
		 * @params {String} msg - the updated value
		 */ 
        updateField: function (field, msg) {
            var f = this._vf[field];

            //...
        },
		
		/**
		 * Add single field of type Integer32
		 * @memberof x3dom.nodeTypes.X3DNode
		 * @instance
		 * @params {Object} ctx - the context 
		 * @params {String} name - the name for the new field
		 * @params {Number} n - the initial value of the new field
		 */ 
        addField_SFInt32: function (ctx, name, n) {
            //...
        },
    
		/**
		 * Add single field of type Float
		 * @memberof x3dom.nodeTypes.X3DNode
		 * @instance
		 * @params {Object} ctx - the context 
		 * @params {String} name - the name for the new field
		 * @params {Number} n - the initial value of the new field
		 */     
        addField_SFFloat: function (ctx, name, n) {
            //...
        },
        
		/**
		 * Add single field of type x3dom.SFMatrix4f
		 * @memberof x3dom.nodeTypes.X3DNode
         * @instance
		 * @params {Object} ctx - the context 
		 * @params {String} name - the name for the new field
		 * @params {Number} [_00 - _33] - the initial values of the new field
		 */ 
        addField_SFMatrix4f: function (ctx, name, _00, _01, _02, _03,
                                                  _10, _11, _12, _13,
                                                  _20, _21, _22, _23,
                                                  _30, _31, _32, _33) {
            //...
        },

        /**
         * Signals a changed field
         * @memberof x3dom.nodeTypes.X3DNode
         * @instance
         * @virtual
         * @params {String} fieldName - the name of the changed field
         */
        fieldChanged: function(fieldName) {
            //...
        }
    }
));


x3dom.registerNodeType(
    "X3DMetadataObject",
    "Core",
	defineClass(x3dom.nodeTypes.X3DNode,
        /**
		 * Constructor for X3DMetadataObject passing a context object
		 * @constructs x3dom.nodeTypes.X3DMetadataObject
         * @x3d 3.2
         * @component Core
         * @status full
         * @extends x3dom.nodeTypes.X3DNode
		 * @param {Object} ctx - context object containing initial settings
		 */
		function (ctx) {
            x3dom.nodeTypes.X3DMetadataObject.superClass.call(this, ctx);

            /**
             * the name of the meta data object
             * @var {x3dom.fields.SFString} name
             * @initvalue ""
             * @memberof x3dom.nodeTypes.X3DMetadataObject
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'name', "");

            /**
             * the reference name of the meta data object ?
             * @var {x3dom.fields.SFString} reference
             * @initvalue ""
             * @memberof x3dom.nodeTypes.X3DMetadataObject
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'reference', "");
        }
    )
);


x3dom.registerNodeType(
    "MetadataBoolean",
    "Core",
	defineClass(x3dom.nodeTypes.X3DMetadataObject,
		/**
		 * Constructor for MetadataBoolean passing a context object
		 * @constructs x3dom.nodeTypes.MetadataBoolean         
		 *
         * @classdesc A node for simple boolean metadata.
         *
         * @extends x3dom.nodeTypes.X3DMetadataObject
         * @x3d 3.2
         * @component Core
         * @status experimental
		 * @param {Object} ctx - context object containing initial settings
		 */
		function (ctx) {
            x3dom.nodeTypes.MetadataBoolean.superClass.call(this, ctx);

            /**
             * boolean values of the meta data node
             * @var {x3dom.fields.MFBoolean} value
             * @memberof x3dom.nodeTypes.MetadataBoolean
             * @field x3d
             * @initvalue []
             * @instance
             * @x3d 3.2
             */
            this.addField_MFBoolean(ctx, 'value', []);
        }
    )
);


x3dom.registerNodeType(
    "MetadataFloat",
    "Core",	
	defineClass(x3dom.nodeTypes.X3DMetadataObject,
		/**
		 * Constructor for MetadataFloat passing a context object
		 * @constructs x3dom.nodeTypes.MetadataFloat
         * @x3d 3.2
         * @component Core
         * @status full
         * @extends x3dom.nodeTypes.X3DMetadataObject
		 * @param {Object} ctx - context object containing initial settings
		 */
        function (ctx) {
            x3dom.nodeTypes.MetadataFloat.superClass.call(this, ctx);

            /**
             * float values of the meta data node
             * @var {x3dom.fields.MFFloat} value
             * @memberof x3dom.nodeTypes.MetadataFloat
             * @field x3d
             * @instance
             */
            this.addField_MFFloat(ctx, 'value', []);
        }
    )
);


x3dom.registerNodeType(
    "Field",
    "Core",
	
	defineClass(x3dom.nodeTypes.X3DNode,
        /**
         * Constructor for Field node passing a context object
         * @constructs x3dom.nodeTypes.Field
         * @x3d 3.2
         * @component Core
         * @status full
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} ctx - context object containing initial settings
         */

        function (ctx) {
            x3dom.nodeTypes.Field.superClass.call(this, ctx);

            /**
             * name of the field node
             * @var {x3dom.fields.SFString} name
             * @memberof x3dom.nodeTypes.Field
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'name', "");

            /**
             * type of the field node
             * @var {x3dom.fields.SFString} type
             * @memberof x3dom.nodeTypes.Field
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'type', "");

            /**
             * value of the field node
             * @var {x3dom.fields.SFString} value
             * @memberof x3dom.nodeTypes.Field
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'value', "");
        },
        {
            /**
             * Signals a changed field
             * @memberof x3dom.nodeTypes.Field
             * @instance
             * @virtual
             * @params {String} fieldName - the name of the changed field
             */
            fieldChanged: function(fieldName) {
               //...
            }
        }
    )
);


x3dom.registerNodeType(
    "X3DChildNode",
    "Core",

    /**
     * Constructor for X3DChildNode
     * @constructs x3dom.nodeTypes.X3DChildNode
     * @x3d 3.2
     * @component Core
     * @status full
     * @extends x3dom.nodeTypes.X3DNode
     * @param {Object} ctx - context object containing initial settings
     */
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DChildNode.superClass.call(this, ctx);
        }
    )
);



/* ### X3DBoundedNode ### */
x3dom.registerNodeType(
    "X3DBoundedNode",
    "Core",

    /**
     * Constructor for X3DBoundedNode
     * @constructs x3dom.nodeTypes.X3DBoundedNode
     * @x3d 3.2
     * @component Core
     * @status full
     * @extends x3dom.nodeTypes.X3DNode
     * @param {Object} ctx - context object containing initial settings
     */
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DBoundedNode.superClass.call(this, ctx);


            /**
             * render status of the node
             * @var {x3dom.fields.SFBool} render
             * @memberof x3dom.nodeTypes.X3DBoundedNode
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'render', true);

            /**
             * center of the nodes bounding volume
             * @var {x3dom.fields.SFVec3f} bboxCenter
             * @memberof x3dom.nodeTypes.X3DBoundedNode
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'bboxCenter', 0, 0, 0);

            /**
             * size of the nodes bounding volume
             * @var {x3dom.fields.SFVec3f} bboxSize
             * @memberof x3dom.nodeTypes.X3DBoundedNode
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'bboxSize', -1, -1, -1);


            /**
             * graph object containing the nodes itself,
             * local and global matrix, (world-)volume, center and coverage
             * @var {x3dom.fields.SFVec3f} _graph
             * @memberof x3dom.nodeTypes.X3DBoundedNode
             * @instance
             * @protected
             */
            this._graph = {
                boundedNode:  this,    // backref to node object
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
             * Recalculates the bounding volumes
             * @memberof x3dom.nodeTypes.X3DBoundedNode
             * @instance
             * @virtual
             * @params {String} fieldName - the name of the changed field
             */
            fieldChanged: function (fieldName) {
                //...
            },

            /**
             * signals that the node has changed
             * @memberof x3dom.nodeTypes.X3DBoundedNode
             * @instance
             * @function
             * @virtual
             */
            nodeChanged: function () {
               //...
            },

            /**
             * Function is called after a parent has been added
             * @memberof x3dom.nodeTypes.X3DBoundedNode
             * @instance
             * @function
             * @virtual
             * @param {Object} parent - The new parent node
             */
            parentAdded: function(parent) {
                // to be overwritten by concrete classes
            },

            /**
             * Returns the world volume of the current node
             * @memberof x3dom.nodeTypes.X3DBoundedNode
             * @instance
             * @function
             * @virtual
             * @returns {x3dom.fields.BoxVolume} the volume of the node
             */
            getVolume: function()
            {
                //...

                return vol;
            },

            /**
             * Invalidates the current volume so it gets revalidated lazily
             * @memberof x3dom.nodeTypes.X3DBoundedNode
             * @instance
             * @function
             * @virtual
             */
            invalidateVolume: function() {
                // overwritten
            },

            /**
             * Invalidates the cache
             * @memberof x3dom.nodeTypes.X3DBoundedNode
             * @instance
             * @function
             * @virtual
             */
            invalidateCache: function()
            {
                //...
            },

            /**
             * Returns the validation state of the cache
             * @memberof x3dom.nodeTypes.X3DBoundedNode
             * @instance
             * @function
             * @virtual
             * @returns {Boolean} - validation state of the cache
             */
            cacheInvalid: function()
            {
                return ( this._graph.globalMatrix == null ||
                        !this._graph.worldVolume.isValid() );
            },

            /**
             * Returns the validation state of the volume
             * @memberof x3dom.nodeTypes.X3DBoundedNode
             * @instance
             * @function
             * @returns {Boolean} - validation state of the volume
             */
            volumeValid: function()
            {
                return this._graph.volume.isValid();
            },


            /**
             * Returns the graph state object
             * @memberof x3dom.nodeTypes.X3DBoundedNode
             * @instance
             * @function
             * @returns {Object} - the nodes graph state
             */
            graphState: function()
            {
                return this._graph;
            }
        }
    )
);
