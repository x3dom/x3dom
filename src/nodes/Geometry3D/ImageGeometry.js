/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### ImageGeometry ### */
x3dom.registerNodeType(
    "ImageGeometry",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DBinaryContainerGeometryNode,
        
        /**
         * Constructor for ImageGeometry
         * @constructs x3dom.nodeTypes.ImageGeometry
         * @x3d x.x
         * @component Geometry3D
         * @extends x3dom.nodeTypes.X3DBinaryContainerGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The image geometry node loads data stored in an image file.
         */
        function (ctx) {
            x3dom.nodeTypes.ImageGeometry.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.SFVec2f} implicitMeshSize
             * @memberof x3dom.nodeTypes.ImageGeometry
             * @initvalue 256,256
             * @field x3dom
             * @instance
             */
            this.addField_SFVec2f(ctx, 'implicitMeshSize', 256, 256);

            /**
             * Specifies the number of color components.
             * @var {x3dom.fields.SFInt32} numColorComponents
             * @memberof x3dom.nodeTypes.ImageGeometry
             * @initvalue 3
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'numColorComponents', 3);

            /**
             * Specifies the number of texture coordinate components.
             * @var {x3dom.fields.SFInt32} numTexCoordComponents
             * @memberof x3dom.nodeTypes.ImageGeometry
             * @initvalue 2
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'numTexCoordComponents', 2);


            /**
             * Specifies the image file that contains the index data.
             * @var {x3dom.fields.SFNode} index
             * @memberof x3dom.nodeTypes.ImageGeometry
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('index', x3dom.nodeTypes.X3DTextureNode);

            /**
             * Specifies the image file that contains the coord data.
             * @var {x3dom.fields.MFNode} coord
             * @memberof x3dom.nodeTypes.ImageGeometry
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('coord', x3dom.nodeTypes.X3DTextureNode);

            /**
             * Specifies the image file that contains the normal data.
             * @var {x3dom.fields.SFNode} normal
             * @memberof x3dom.nodeTypes.ImageGeometry
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('normal', x3dom.nodeTypes.X3DTextureNode);

            /**
             * Specifies the image file that contains the texcoord data.
             * @var {x3dom.fields.SFNode} texCoord
             * @memberof x3dom.nodeTypes.ImageGeometry
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('texCoord', x3dom.nodeTypes.X3DTextureNode);

            /**
             * Specifies the image file that contains the color data.
             * @var {x3dom.fields.SFNode} color
             * @memberof x3dom.nodeTypes.ImageGeometry
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('color', x3dom.nodeTypes.X3DTextureNode);

            this._mesh._numColComponents = this._vf.numColorComponents;
            this._mesh._numTexComponents = this._vf.numTexCoordComponents;

            if (this._vf.implicitMeshSize.y == 0)
                this._vf.implicitMeshSize.y = this._vf.implicitMeshSize.x;

            //TODO check if GPU-Version is supported (Flash, etc.)
            //Dummy mesh generation only needed for GPU-Version
            if (x3dom.caps.BACKEND == 'webgl' && x3dom.caps.MAX_VERTEX_TEXTURE_IMAGE_UNITS > 0) {

                var geoCacheID = 'ImageGeometry_' + this._vf.implicitMeshSize.x + '_' + this._vf.implicitMeshSize.y;

                if( this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined )
                {
                    //x3dom.debug.logInfo("Using ImageGeometry-Mesh from Cache");
                    this._mesh = x3dom.geoCache[geoCacheID];
                }
                else
                {
                    for(var y=0; y<this._vf.implicitMeshSize.y; y++)
                    {
                        for(var x=0; x<this._vf.implicitMeshSize.x; x++)
                        {
                            this._mesh._positions[0].push(x / this._vf.implicitMeshSize.x,
                                    y / this._vf.implicitMeshSize.y, 0);
                        }
                    }

                    //this._mesh._invalidate = true;
                    this._mesh._numFaces = this._mesh._indices[0].length / 3;
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    x3dom.geoCache[geoCacheID] = this._mesh;
                }
            }

            // needed because mesh is shared due to cache
            this._vol = new x3dom.fields.BoxVolume();

            this._dirty = {
                coord: true,
                normal: true,
                texCoord: true,
                color: true,
                index: true
            };
        
        },
        {
            setGeoDirty: function () {
                this._dirty.coord = true;
                this._dirty.normal = true;
                this._dirty.texCoords = true;
                this._dirty.color = true;
                this._dirty.index = true;
            },

            unsetGeoDirty: function () {
                this._dirty.coord = false;
                this._dirty.normal = false;
                this._dirty.texCoords = false;
                this._dirty.color = false;
                this._dirty.index = false;
            },

            nodeChanged: function()
            {
                Array.forEach(this._parentNodes, function (node) {
                    node._dirty.positions = true;
                    node._dirty.normals = true;
                    node._dirty.texcoords = true;
                    node._dirty.colors = true;
                });
                this._vol.invalidate();
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName == "index" ||fieldName == "coord" || fieldName == "normal" ||
                    fieldName == "texCoord" || fieldName == "color") {
                    this._dirty[fieldName] = true;
                    this._vol.invalidate();
                }
                else if (fieldName == "implicitMeshSize") {
                    this._vol.invalidate();
                }
            },

            getMin: function() {
                var vol = this._vol;

                if (!vol.isValid()) {
                    vol.setBoundsByCenterSize(this._vf.position, this._vf.size);
                }

                return vol.min;
            },

            getMax: function() {
                var vol = this._vol;

                if (!vol.isValid()) {
                    vol.setBoundsByCenterSize(this._vf.position, this._vf.size);
                }

                return vol.max;
            },

            getVolume: function() {
                var vol = this._vol;

                if (!vol.isValid()) {
                    vol.setBoundsByCenterSize(this._vf.position, this._vf.size);
                }

                return vol;
            },

            numCoordinateTextures: function()
            {
                return this._cf.coord.nodes.length;
            },

            getIndexTexture: function()
            {
                if(this._cf.index.node) {
                    this._cf.index.node._type = "IG_index";
                    return this._cf.index.node;
                } else {
                    return null;
                }
            },

            getIndexTextureURL: function()
            {
                if(this._cf.index.node) {
                    return this._cf.index.node._vf.url;
                } else {
                    return null;
                }
            },

            getCoordinateTexture: function(pos)
            {
                if(this._cf.coord.nodes[pos]) {
                    this._cf.coord.nodes[pos]._type = "IG_coords" + pos;
                    return this._cf.coord.nodes[pos];
                } else {
                    return null;
                }
            },

            getCoordinateTextureURL: function(pos)
            {
                if(this._cf.coord.nodes[pos]) {
                    return this._cf.coord.nodes[pos]._vf.url;
                } else {
                    return null;
                }
            },

            getCoordinateTextureURLs: function()
            {
                var urls = [];
                for(var i=0; i<this._cf.coord.nodes.length; i++)
                {
                    urls.push(this._cf.coord.nodes[i]._vf.url);
                }
                return urls;
            },

            getNormalTexture: function()
            {
                if(this._cf.normal.node) {
                    this._cf.normal.node._type = "IG_normals";
                    return this._cf.normal.node;
                } else {
                    return null;
                }
            },

            getNormalTextureURL: function()
            {
                if(this._cf.normal.node) {
                    return this._cf.normal.node._vf.url;
                } else {
                    return null;
                }
            },

            getTexCoordTexture: function()
            {
                if(this._cf.texCoord.node) {
                    this._cf.texCoord.node._type = "IG_texCoords";
                    return this._cf.texCoord.node;
                } else {
                    return null;
                }
            },

            getTexCoordTextureURL: function()
            {
                if(this._cf.texCoord.node) {
                    return this._cf.texCoord.node._vf.url;
                } else {
                    return null;
                }
            },

            getColorTexture: function()
            {
                if(this._cf.color.node) {
                    this._cf.color.node._type = "IG_colors";
                    return this._cf.color.node;
                } else {
                    return null;
                }
            },

            getColorTextureURL: function()
            {
                if(this._cf.color.node) {
                    return this._cf.color.node._vf.url;
                } else {
                    return null;
                }
            },

            getTextures: function()
            {
                var textures = [];

                var i, index = this.getIndexTexture();
                if(index) textures.push(index);

                for(i=0; i<this.numCoordinateTextures(); i++) {
                    var coord = this.getCoordinateTexture(i);
                    if(coord) textures.push(coord);
                }

                var normal = this.getNormalTexture();
                if(normal) textures.push(normal);

                var texCoord = this.getTexCoordTexture();
                if(texCoord) textures.push(texCoord);

                var color = this.getColorTexture();
                if(color) textures.push(color);

                return textures;
            }
        }
    )
);
