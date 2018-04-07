/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * (C)2016 Andreas Plesch, Waltham, MA, U.S.A
 * Dual licensed under the MIT and GPL
 */

/* ### GeoLOD ### */
x3dom.registerNodeType(
    "GeoLOD",
    "Geospatial",
    //defineClass(x3dom.nodeTypes.X3DLODNode,
    //official derivation, is not a real grouping node since it may not have children, only url references
    defineClass(x3dom.nodeTypes.X3DBoundedObject,
        
        /**
         * Constructor for GeoLOD
         * @constructs x3dom.nodeTypes.GeoLOD
         * @x3d 3.3
         * @component Geospatial
         * @status experimental
         * @extends x3dom.nodeTypes.X3DLODNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The GeoLOD node provides a terrain-specialized form of the LOD node.
         * It is a grouping node that specifies two different levels of detail for an object using a tree structure, where 0 to 4 children can be specified, and also efficiently manages the loading and unloading of these levels of detail.
         */
        function (ctx) {
            x3dom.nodeTypes.GeoLOD.superClass.call(this, ctx);


            /**
             * The geoSystem field is used to define the spatial reference frame.
             * @var {x3dom.fields.MFString} geoSystem
             * @range {["GD", ...], ["UTM", ...], ["GC", ...]}
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue ['GD','WE']
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);

            /**
             * The rootUrl and rootNode fields provide two different ways to specify the geometry of the root tile.
             * You may use one or the other. The rootNode field lets you include the geometry for the root tile directly within the X3D file.
             * @var {x3dom.fields.MFString} rootUrl
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'rootUrl', []);

            /**
             * When the viewer enters the specified range, this geometry is replaced with the contents of the four children files defined by child1Url through child4Url.
             * The four children files are loaded into memory only when the user is within the specified range. Similarly, these are unloaded from memory when the user leaves this range.
             * @var {x3dom.fields.MFString} child1Url
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'child1Url', []);

            /**
             * When the viewer enters the specified range, this geometry is replaced with the contents of the four children files defined by child1Url through child4Url.
             * The four children files are loaded into memory only when the user is within the specified range. Similarly, these are unloaded from memory when the user leaves this range.
             * @var {x3dom.fields.MFString} child2Url
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'child2Url', []);

            /**
             * When the viewer enters the specified range, this geometry is replaced with the contents of the four children files defined by child1Url through child4Url.
             * The four children files are loaded into memory only when the user is within the specified range. Similarly, these are unloaded from memory when the user leaves this range.
             * @var {x3dom.fields.MFString} child3Url
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'child3Url', []);

            /**
             * When the viewer enters the specified range, this geometry is replaced with the contents of the four children files defined by child1Url through child4Url.
             * The four children files are loaded into memory only when the user is within the specified range. Similarly, these are unloaded from memory when the user leaves this range.
             * @var {x3dom.fields.MFString} child4Url
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'child4Url', []);
            
            /**
             * The level of detail is switched depending upon whether the user is closer or farther than range length base units from the geospatial coordinate center.
             * @var {x3dom.fields.SFFloat} range
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue 10
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'range', 10);
        
            /**
             * outputOnly field which is emitted when the level changes to another range. Event with value 0 or 1, where 0 indicates the rootNode field and 1 indicates the nodes specified by the child1Url, child2Url, child3Url, and child4Url fields.
             * @var {x3dom.fields.SFInt32} level_changed
             * @range [0, 1]
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, "level_changed", 0);

            /**
             *
             * @var {x3dom.fields.SFString} referenceBindableDescription
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'referenceBindableDescription', []);

            /**
             * The geoOrigin field is used to specify a local coordinate frame for extended precision.
             * @var {x3dom.fields.SFNode} geoOrigin
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue x3dom.nodeTypes.X3DChildNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.GeoOrigin);

            /**
             * The rootUrl and rootNode fields provide two different ways to specify the geometry of the root tile. The rootUrl field lets you specify a URL for a file that contains the geometry.
             * @var {x3dom.fields.SFNode} rootNode
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue x3dom.nodeTypes.X3DChildNode
             * @field x3d
             * @instance
             */
            this.addField_MFNode('rootNode', x3dom.nodeTypes.X3DChildNode);

             /**
             * The center field is a translation offset in the local coordinate system that specifies the centre of the LOD node for distance calculations. The level of detail is switched depending upon whether the user is closer or farther than range length base units from the geospatial coordinate center. The center field should be specified as described in 25.2.4 Specifying geospatial coordinates.
             * @var {x3dom.fields.SFVec3f} center
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue 0,0,0
             * @field x3d
             * @instance
            */
            
            this.addField_SFVec3f(ctx, "center", 0, 0, 0);
            
            // loosely based on LOD implementation
            
            this._eye = new x3dom.fields.SFVec3f(0, 0, 0); //from X3DLODNode
            
            this._x3dcenter = new x3dom.fields.SFVec3f(0, 0, 0); 
            
            this._child1added = false;
            this._child2added = false;
            this._child3added = false;
            this._child4added = false;
            this._rootNodeLoaded = true;
            this._childUrlNodes = new x3dom.fields.MFNode(x3dom.nodeTypes.X3DChildNode);
        
            this._lastRangePos = -1;
        },
        {
            collectDrawableObjects: function(transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes)
                {
                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;
                if (singlePath && (invalidateCache = invalidateCache || this.cacheInvalid()))
                    this.invalidateCache();
                planeMask = drawableCollection.cull(transform, this.graphState(), singlePath, planeMask);
                if (planeMask <= 0) {
                    return;
                    }
                // at the moment, no caching here as children may change every frame
                singlePath = false;
                this.visitChildren(transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes);
                },
                
            visitChildren: function(transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes)
                {
                var i=0, n=0, cnodes, cnode;
                var mat_view = drawableCollection.viewMatrix;
                var center = new x3dom.fields.SFVec3f(0, 0, 0); // eye
                center = mat_view.inverse().multMatrixPnt(center);
                //transform eye point to the LOD node's local coordinate system
                this._eye = transform.inverse().multMatrixPnt(center);
                var len = this._x3dcenter.subtract(this._eye).length();
                
                //TODO: preload when close = 0.9 * range
                //- just load but do not add to drawables
                //- then at range just add to drawable
                //TODO: unload inlines if out of range and after (configurable) timeout (1 minute?)
                // - loaded = false and childurlnodes = null, childurlnodes = new mfnode should suffice ?
                
                if (len > this._vf.range) {
                    
                    i = 0;
                    if(!this._rootNodeLoaded) {
                        this._rootNodeLoaded = true;
                    }
                    //rootNode already has rootUrl node if empty, see nodeChanged()
                    cnodes = this._cf.rootNode.nodes;
                }
                
                else {
                    
                    i = 1;
                    if (!this._child1added) {
                        this._child1added = true;
                        this.addInlineChild(this._vf.child1Url);
                    }
                    if (!this._child2added) {
                        this._child2added = true;
                        this.addInlineChild(this._vf.child2Url);
                    }
                    if (!this._child3added) {
                        this._child3added = true;
                        this.addInlineChild(this._vf.child3Url);
                    }
                    if (!this._child4added) {
                        this._child4added = true;
                        this.addInlineChild(this._vf.child4Url);
                    }
                    
                    if (this._rootNodeLoaded) {
                        this._rootNodeLoaded = false;
                        //never null rootNode (?)
                    }
                    
                    cnodes = this._childUrlNodes.nodes;
                    
                }
                    
                if (i !== this._lastRangePos) {
                    //x3dom.debug.logInfo('Changed from '+this._lastRangePos+' th range to '+i+' th.');
                    this.postMessage('level_changed', i);
                }
                    
                this._lastRangePos = i;
                    
                n = cnodes.length;
                                
                //probably not necessary to check if there are any child nodes
                if (n && cnodes)
                    {
                        var childTransform = this.transformMatrix(transform);
                        
                        /* not in original LOD, may work for GeoLOD as well
                        
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
                        */
                        
                        for (i = 0; i < n; i++) {
                            if ( (cnode = cnodes[i]) ) {
                            cnode.collectDrawableObjects(childTransform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes);
                            }
                        }
                    }
                },
            
            addInlineChild: function(url)
            {
                //check if url empty
                var inline = this.newInlineNode(url);
                this._childUrlNodes.addLink(inline);
            },
            
            newInlineNode: function(url)
            {
                var inline = new x3dom.nodeTypes.Inline();
                inline._vf.url = url;
                inline._nameSpace = this._nameSpace; // pass on nameSpace
                //inline.initDone = false; // these need to be initialized?
                //inline.count = 0;
                //inline.numRetries = x3dom.nodeTypes.Inline.MaximumRetries;
                x3dom.debug.logInfo("add url: " + url);
                inline.nodeChanged(); //is necessary and loads the inline scene
                return inline;
            },
            
            getVolume: function()
            {
                var vol = this._graph.volume;
                //below may not apply for GeoLOD
                if (!this.volumeValid() && this._vf.render)
                {
                    var child, childVol;
                    // use childUrlNodes ?
                        for (var i=0, n=this._childNodes.length; i<n; i++)
                        {
                        if (!(child = this._childNodes[i]) || child._vf.render !== true)
                            continue;
                        childVol = child.getVolume();
                        if (childVol && childVol.isValid())
                            vol.extendBounds(childVol.min, childVol.max);
                        }
                    //}
                }
                return vol;
            },
            
            nodeChanged: function() {
                //this._needReRender = true;
                //do geo-conversion
                
                var coords = new x3dom.fields.MFVec3f();
                coords.push(this._vf.center);
                this._x3dcenter = x3dom.nodeTypes.GeoCoordinate.prototype.GEOtoX3D(this._vf.geoSystem,this._cf.geoOrigin, coords)[0];
                
                //only rootNodes are ever shapes; childUrls have their own rootNodes
                //append rootnode field with inline rooturl if empty
                if (!this._cf.rootNode.nodes.length) {
                    var inline = this.newInlineNode(this._vf.rootUrl);
                    this._cf.rootNode.addLink(inline);
                }
                
                this.invalidateVolume();
            },
            
            fieldChanged: function(fieldName) {
                //this._needReRender = true;
                if (fieldName == "render" || fieldName == "range") {
                    this.invalidateVolume();
                }
                if (fieldname == "center") {                
                    var coords = new x3dom.fields.MFVec3f();
                    coords.push(this._vf.center);
                    this._x3dcenter = x3dom.nodeTypes.GeoCoordinate.prototype.GEOtoX3D(this._vf.geoSystem,this._cf.geoOrigin, coords)[0];
                
                    this.invalidateVolume();
                }
            }
        }
    )
);
