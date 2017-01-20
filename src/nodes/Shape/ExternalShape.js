/** @namespace x3dom.nodeTypes */
/**
 * Created by Sven Kluge on 27.06.2016.
 */
x3dom.registerNodeType(
    "ExternalShape",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DShapeNode,

        /**
         * Constructor for ExternalShape
         * @constructs x3dom.nodeTypes.ExternalShape
         * @x3d 3.3
         * @component Shape
         * @status full
         * @extends x3dom.nodeTypes.X3DShapeNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc
         */
        function (ctx) {
            x3dom.nodeTypes.ExternalShape.superClass.call(this, ctx);

            /**
             * Defines the url to the openGL Transfer Format (glTF) file.
             * A suffix with a leading # can be used to reference single meshes inside a SRC: "path/to/data.src#mesh0".
             * Multiple urls specify alternatives (if downloading fails).
             *
             * @var {x3dom.fields.MFString} url
             * @memberof x3dom.nodeTypes.ExternalGeometry
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'url', []);

            this._currentURLIdx = 0;
            this._cf.geometry.node = new x3dom.nodeTypes.X3DSpatialGeometryNode(ctx);
            this.loaded = false;
        },
        {
            update: function(shape, shaderProgram, gl, viewarea, context) {
                var that = this;

                if (this._vf['url'].length == 0 ||
                    this._currentURLIdx >= this._vf['url'].length)
                {
                    return;
                }

                var xhr = new XMLHttpRequest();

                xhr.open("GET", this._nameSpace.getURL(this._vf['url'][this._currentURLIdx]), true);

                xhr.responseType = "arraybuffer";

                xhr.send(null);

                xhr.onerror = function() {
                    x3dom.debug.logError("Unable to load SRC data from URL \"" + that._vf['url'][that._currentURLIdx] + "\"");
                };

                xhr.onload = function() {

                    if ((xhr.status == 200 || xhr.status == 0)) {
                        var glTF = new x3dom.glTF.glTFLoader(xhr.response);

                        if (glTF.header.sceneLength > 0)
                        {
                            glTF.loaded = {};
                            glTF.loaded.meshes = {};
                            glTF.loaded.meshCount = 0;

                            that.glTF = glTF;

                            var url = that._vf['url'][that._currentURLIdx];
                            if(url.includes('#'))
                            {
                                var split = url.split('#');
                                var meshName = split[split.length-1];
                                glTF.getMesh(shape, shaderProgram, gl, meshName);
                            }
                            else
                            {
                                glTF.getScene(shape, shaderProgram, gl);
                            }

                            for(var key in glTF._mesh){
                                if(!glTF._mesh.hasOwnProperty(key))continue;
                                that._cf.geometry.node._mesh[key] = glTF._mesh[key];
                            }

                        }
                        else
                        {
                            if ((that._currentURLIdx + 1) < that._vf['url'].length)
                            {
                                x3dom.debug.logWarning("Invalid SRC data, loaded from URL \"" +
                                    that._vf['url'][that._currentURLIdx] +
                                    "\", trying next specified URL");

                                //try next URL
                                ++that._currentURLIdx;
                                that.update(shape, shaderProgram, gl, viewarea, context);
                            }
                            else
                            {
                                x3dom.debug.logError("Invalid SRC data, loaded from URL \"" +
                                    that._vf['url'][that._currentURLIdx] + "\"," +
                                    " no other URLs left to try.");
                            }
                        }
                    }
                    else
                    {
                        if ((that._currentURLIdx + 1) < that._vf['url'].length)
                        {
                            x3dom.debug.logWarning("Invalid SRC data, loaded from URL \"" +
                                that._vf['url'][that._currentURLIdx] +
                                "\", trying next specified URL");

                            //try next URL
                            ++that._currentURLIdx;
                            that.update(shape, shaderProgram, gl, viewarea, context);
                        }
                        else
                        {
                            x3dom.debug.logError("Invalid SRC data, loaded from URL \"" +
                                that._vf['url'][that._currentURLIdx] + "\"," +
                                " no other URLs left to try.");
                        }
                    }
                };
            },


            collectDrawableObjects: function (transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes)
            {
                // attention, in contrast to other collectDrawableObjects()
                // this one has boolean return type to better work with RSG
                var graphState = this.graphState();

                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                if (singlePath && (invalidateCache = invalidateCache || this.cacheInvalid()))
                    this.invalidateCache();

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

            getShaderProperties: function(viewarea)
            {
                
                var properties = x3dom.Utils.generateProperties(viewarea, this);
                properties.CSHADER = -1;

                properties.LIGHTS = viewarea.getLights().length + (viewarea._scene.getNavigationInfo()._vf.headlight);

                properties.EMPTY_SHADER = 1;

                return properties;
            },

            nodeChanged: function ()
            {
                if (!this._objectID) {
                    this._objectID = ++x3dom.nodeTypes.Shape.objectID;
                    x3dom.nodeTypes.Shape.idMap.nodeID[this._objectID] = this;
                }
            }
        }
    )
);
