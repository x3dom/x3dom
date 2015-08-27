/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DShapeNode ### */
x3dom.registerNodeType(
    "X3DShapeNode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DBoundedObject,
        
        /**
         * Constructor for X3DShapeNode
         * @constructs x3dom.nodeTypes.X3DShapeNode
         * @x3d 3.3
         * @component Shape
         * @status full
         * @extends x3dom.nodeTypes.X3DBoundedObject
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This is the base node type for all Shape nodes.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DShapeNode.superClass.call(this, ctx);


            /**
             * Defines whether the shape is pickable.
             * @var {x3dom.fields.SFBool} isPickable
             * @memberof x3dom.nodeTypes.X3DShapeNode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'isPickable', true);

            /**
             * Holds the id offset for MultiPart picking.
             * @var {x3dom.fields.SFInt32} isPickable
             * @memberof x3dom.nodeTypes.X3DShapeNode
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'idOffset', 0);

            /**
             * Holds the appearance node.
             * @var {x3dom.fields.SFNode} appearance
             * @memberof x3dom.nodeTypes.X3DShapeNode
             * @initvalue x3dom.nodeTypes.X3DAppearanceNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('appearance', x3dom.nodeTypes.X3DAppearanceNode);

            /**
             * Holds the geometry node.
             * @var {x3dom.fields.SFNode} geometry
             * @memberof x3dom.nodeTypes.X3DShapeNode
             * @initvalue x3dom.nodeTypes.X3DGeometryNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('geometry', x3dom.nodeTypes.X3DGeometryNode);

            this._objectID = 0;
            this._shaderProperties = null;
            this._clipPlanes = [];

            // in WebGL-based renderer a clean-up function is attached
            this._cleanupGLObjects = null;

            this._dirty = {
                positions: true,
                normals: true,
                texcoords: true,
                colors: true,
                specialAttribs: true,   // e.g., particleSize, IDs,...
                indexes: true,
                texture: true,
                material: true,
                text: true,
                shader: true,
                ids: true
            };

            // FIXME; move somewhere else and allow generic values!!!
            this._coordStrideOffset = [0, 0];
            this._normalStrideOffset = [0, 0];
            this._texCoordStrideOffset = [0, 0];
            this._colorStrideOffset = [0, 0];
            this._idStrideOffset = [0, 0];

            this._tessellationProperties = [];
        },
        {
            collectDrawableObjects: function (transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes)
            {
                // attention, in contrast to other collectDrawableObjects()
                // this one has boolean return type to better work with RSG
                var graphState = this.graphState();

                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                if (singlePath && (invalidateCache = invalidateCache || this.cacheInvalid()))
                    this.invalidateCache();

                if (!this._cf.geometry.node ||
                    drawableCollection.cull(transform, graphState, singlePath, planeMask) <= 0) {
                    return false;
                }

                if (singlePath && !this._graph.globalMatrix)
                    this._graph.globalMatrix = transform;

                if (this._clipPlanes.length != clipPlanes.length)
                {
                    this._dirty.shader = true;
                }

                this._clipPlanes = clipPlanes;

                drawableCollection.addShape(this, transform, graphState);

                return true;
            },

            getVolume: function()
            {
                var vol = this._graph.volume;

                if (!this.volumeValid() && this._vf.render)
                {
                    var geo = this._cf.geometry.node;
                    var childVol = geo ? geo.getVolume() : null;

                    if (childVol && childVol.isValid())
                        vol.extendBounds(childVol.min, childVol.max);
                }

                return vol;
            },

            getCenter: function() {
                var geo = this._cf.geometry.node;
                return (geo ? geo.getCenter() : new x3dom.fields.SFVec3f(0,0,0));
            },

            getDiameter: function() {
                var geo = this._cf.geometry.node;
                return (geo ? geo.getDiameter() : 0);
            },

            doIntersect: function(line) {
                return this._cf.geometry.node.doIntersect(line);
            },

            forceUpdateCoverage: function()
            {
                var geo = this._cf.geometry.node;
                return (geo ? geo.forceUpdateCoverage() : false);
            },

            tessellationProperties: function()
            {
                // some geometries require offset and count into index array
                var geo = this._cf.geometry.node;
                if (geo && geo._indexOffset)
                    return geo._indexOffset;      // IndexedTriangleStripSet
                else
                    return this._tessellationProperties; // BVHRefiner-Patch
            },

            isLit: function() {
                return this._cf.geometry.node._vf.lit;
            },

            isSolid: function() {
                var twoSidedMat = (this._cf.appearance.node && this._cf.appearance.node._cf.material.node &&
                                   x3dom.isa(this._cf.appearance.node._cf.material.node, x3dom.nodeTypes.TwoSidedMaterial));
                return this._cf.geometry.node._vf.solid && !twoSidedMat;
            },

            isCCW: function() {
                return this._cf.geometry.node._vf.ccw;
            },

            parentRemoved: function(parent) {
                for (var i=0, n=this._childNodes.length; i<n; i++) {
                    var child = this._childNodes[i];
                    if (child) {
                        child.parentRemoved(this);
                    }
                }

                if (parent)
                    parent.invalidateVolume();
                if (this._parentNodes.length > 0)
                    this.invalidateVolume();

                // Cleans all GL objects for WebGL-based renderer
                if (this._cleanupGLObjects) {
                    this._cleanupGLObjects();
                }
            },

            unsetDirty: function () {
                // vertex attributes
                this._dirty.positions = false;
                this._dirty.normals = false;
                this._dirty.texcoords = false;
                this._dirty.colors = false;
                this._dirty.specialAttribs = false;
                // indices/topology
                this._dirty.indexes = false;
                // appearance properties
                this._dirty.texture = false;
                this._dirty.material = false;
                this._dirty.text = false;
                this._dirty.shader = false;
            },

            unsetGeoDirty: function () {
                this._dirty.positions = false;
                this._dirty.normals = false;
                this._dirty.texcoords = false;
                this._dirty.colors = false;
                this._dirty.specialAttribs = false;
                this._dirty.indexes = false;
            },

            setAllDirty: function () {
                // vertex attributes
                this._dirty.positions = true;
                this._dirty.normals = true;
                this._dirty.texcoords = true;
                this._dirty.colors = true;
                this._dirty.specialAttribs = true;
                // indices/topology
                this._dirty.indexes = true;
                // appearance properties
                this._dirty.texture = true;
                this._dirty.material = true;
                this._dirty.text = true;
                this._dirty.shader = true;
                // finally invalidate volume
                this.invalidateVolume();
            },

            setAppDirty: function () {
                // appearance properties
                this._dirty.texture = true;
                this._dirty.material = true;
                //this._dirty.text = true;
                this._dirty.shader = true;
            },

            setGeoDirty: function () {
                this._dirty.positions = true;
                this._dirty.normals = true;
                this._dirty.texcoords = true;
                this._dirty.colors = true;
                this._dirty.specialAttribs = true;
                this._dirty.indexes = true;
                // finally invalidate volume
                this.invalidateVolume();
            },

            getShaderProperties: function(viewarea)
            {
                if (this._shaderProperties == null ||
                    this._dirty.shader == true     ||
                    (this._webgl !== undefined &&
                     this._webgl.dirtyLighting != x3dom.Utils.checkDirtyLighting(viewarea) ) ||
                    x3dom.Utils.checkDirtyEnvironment(viewarea, this._shaderProperties) == true)
                {
                    this._shaderProperties = x3dom.Utils.generateProperties(viewarea, this);

                    this._dirty.shader = false;
                    if (this._webgl !== undefined)
                    {
                        this._webgl.dirtyLighting = x3dom.Utils.checkDirtyLighting(viewarea);
                    }
                }

                return this._shaderProperties;
            },

            getTextures: function() {
                var textures = [];

                var appearance = this._cf.appearance.node;
                if (appearance) {
                    var tex = appearance._cf.texture.node;
                    if(tex) {
                        if(x3dom.isa(tex, x3dom.nodeTypes.MultiTexture)) {
                            textures = textures.concat(tex.getTextures());
                        }
                        else {
                            textures.push(tex);
                        }
                    }

                    var shader = appearance._cf.shaders.nodes[0];
                    if(shader) {
                        if(x3dom.isa(shader, x3dom.nodeTypes.CommonSurfaceShader)) {
                            textures = textures.concat(shader.getTextures());
                        }
                    }
                }

                var geometry = this._cf.geometry.node;
                if (geometry) {
                    if(x3dom.isa(geometry, x3dom.nodeTypes.ImageGeometry)) {
                        textures = textures.concat(geometry.getTextures());
                    }
                    else if(x3dom.isa(geometry, x3dom.nodeTypes.Text)) {
                        textures = textures.concat(geometry);
                    }
                }

                return textures;
            }
        }
    )
);
