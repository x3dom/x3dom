/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */


/* ### ExternalGeometry ### */
x3dom.registerNodeType(
    "ExternalGeometry",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,

        /**
         * Constructor for ExternalGeometry
         * @constructs x3dom.nodeTypes.ExternalGeometry
         * @x3d x.x
         * @component Geometry3D
         * @extends x3dom.nodeTypes.X3DSpatialGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The ExternalGeometry node loads data from a Shape Resource Container (SRC). The used data can be progressively updated during transmission.
         */
         function (ctx) {
            x3dom.nodeTypes.ExternalGeometry.superClass.call(this, ctx);

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


            //initialization of rendering-related X3DOM structures
            this._mesh._invalidate = false;
            this._mesh._numCoords  = 0;
            this._mesh._numFaces   = 0;


            //index of the current URL, used to download data - if downloading fails, this index is increased
            this._currentURLIdx = 0;
        },
        {
            //----------------------------------------------------------------------------------------------------------
            // PUBLIC FUNCTIONS
            //----------------------------------------------------------------------------------------------------------

            /**
             * Updates the render data, stored in the given objects, with data from this ExternalGeometry.
             * If necessary, the referenced file is downloaded first.
             *
             * @param {Object} shape - x3dom shape node
             * @param {Object} shaderProgram - x3dom shader program
             * @param {Object} gl - WebGL context
             * @param {Object} viewarea - x3dom view area
             * @param {Object} context - x3dom context object
             */
            update: function(shape, shaderProgram, gl, viewarea, context) {
                var that = this;
                var xhr;

                if (this._vf['url'].length == 0 ||
                    this._currentURLIdx >= this._vf['url'].length)
                {
                    return;
                }

                //check if there is still memory available
                if (x3dom.BinaryContainerLoader.outOfMemory) {
                    return;
                }

                //TODO: check SOURCE child nodes
                shape._webgl.internalDownloadCount  = 1;
                shape._nameSpace.doc.downloadCount  = 1;

                //post request
                xhr = new XMLHttpRequest();

                xhr.open("GET", shape._nameSpace.getURL(this._vf['url'][this._currentURLIdx]), true);

                xhr.responseType = "arraybuffer";

                xhr.send(null);

                xhr.onerror = function() {
                    x3dom.debug.logError("Unable to load SRC data from URL \"" + that._vf['url'][that._currentURLIdx] + "\"");
                };

                xhr.onload = function() {
                    shape._webgl.internalDownloadCount  = 0;
                    shape._nameSpace.doc.downloadCount  = 0;

                    shape._webgl.primType    = [];
                    shape._webgl.indexOffset = [];
                    shape._webgl.drawCount   = [];

                    if ((xhr.status == 200 || xhr.status == 0)) {
                        var glTF = new x3dom.glTF.glTFLoader(xhr.response, true);

                        if (glTF.header.sceneLength > 0)
                        {
                            glTF.loaded = {};
                            glTF.loaded.meshes = {};
                            glTF.loaded.meshCount = 0;

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
                                that._mesh[key] = glTF._mesh[key];
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
            } ,

            //----------------------------------------------------------------------------------------------------------

            //----------------------------------------------------------------------------------------------------------
            // PRIVATE FUNCTIONS
            //----------------------------------------------------------------------------------------------------------
            

            
            /**
             * Returns the node's local volume
             * @returns {x3dom.fields.BoxVolume} the local, axis-aligned bounding volume
             */
            getVolume: function()
            {
                var vol = this._mesh._vol;
                var shapeNode;

                if (!vol.isValid())
                {
                    //an ExternalGeometry node must _always_ be a child of (at least) one shape node
                    //for multiple Shape nodes using a single ExternalGeometry node,
                    //we assume that either all of them, or no one have specified a bounding volume
                    shapeNode = this._parentNodes[0];

                    if (typeof shapeNode._vf["bboxCenter"] != 'undefined' &&
                        typeof shapeNode._vf["bboxSize"]   != 'undefined'   )
                    {
                        vol.setBoundsByCenterSize(shapeNode._vf["bboxCenter"], shapeNode._vf["bboxSize"]);
                    }
                    //if no bbox information was specified for the Shape node, use information from the SRC header
                    else
                    {
                        //TODO: implement
                    }
                }

                return vol;
            }
        }        
    )
);
