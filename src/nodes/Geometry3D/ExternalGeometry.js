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
             * Defines the url to the Shape Resource Container. A suffix with a leading # can be used to reference single meshes inside a SRC: "path/to/data.src#mesh0".
             * @var {SFString} url
             * @memberof x3dom.nodeTypes.Geometry3D
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'url',  "");


            //initialization of rendering-related X3DOM structures
            this._mesh._invalidate = false;
            this._mesh._numCoords  = 0;
            this._mesh._numFaces   = 0;
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
            updateRenderData: function(shape, shaderProgram, gl, viewarea, context) {
                var that = this;
                var xhr;

                if (this._vf['url'] == "") {
                    return;
                }

                //check if there is still memory available
                if (x3dom.BinaryContainerLoader.outOfMemory) {
                    return;
                }

                //TODO: check SOURCE child nodes
                shape._webgl.internalDownloadCount  = 1;
                shape._nameSpace.doc.downloadCount  = 1;

                //TODO: check this object - when is it called, where is it really needed?
                //shape._webgl.makeSeparateTris = {...};


                //post request
                xhr = new XMLHttpRequest();

                xhr.open("GET", encodeURI(this._vf['url']), true);

                xhr.responseType = "arraybuffer";

                xhr.send(null);

                xhr.onerror = function() {
                    x3dom.debug.logError("Unable to load SRC data from URL \"" + encodeURI(that._vf['url']) + "\"");
                };

                //TODO: currently, we assume that the referenced file is always an SRC file
                xhr.onload = function() {
                    shape._webgl.internalDownloadCount  = 0;
                    shape._nameSpace.doc.downloadCount  = 0;

                    var responseUint32 = new Uint32Array(xhr.response);

                    var srcHeaderSize, srcBodySize, srcBodyOffset;
                    var srcHeaderView, srcBodyView;

                    var srcHeaderObj;

                    if (xhr.status == 200 && responseUint32.length >= 3) {

                        srcHeaderSize = responseUint32[2];
                        srcBodyOffset = srcHeaderSize + 12;
                        srcBodySize   = responseUint32.buffer.byteLength - srcBodyOffset;

                        if (srcHeaderSize > 0 &&  srcBodySize >= 0)
                        {
                            srcHeaderView = new Uint8Array(xhr.response, 12,            srcHeaderSize);
                            srcBodyView   = new Uint8Array(xhr.response, srcBodyOffset, srcBodySize  );

                            //decode SRC header
                            //currently, we assume ASCII JSON encoding
                            try
                            {
                                srcHeaderObj = JSON.parse(String.fromCharCode.apply(null, srcHeaderView));
                            }
                            catch (exc)
                            {
                                x3dom.debug.logError("Unable to parse SRC header: " + exc);
                                return;
                            }

                            that._updateRenderDataFromSRC(shape, shaderProgram, gl, srcHeaderObj, srcBodyView);
                        }
                        else
                        {
                            x3dom.debug.logError("Invalid SRC data, loaded from URL \"" +
                                                 encodeURI(that._vf['url']) + "\"");
                            return;
                        }
                    }
                    else
                    {
                        x3dom.debug.logError("Unable to load SRC data from URL \"" + encodeURI(that._vf['url']) + "\"");
                    }
                };
            } ,

            //----------------------------------------------------------------------------------------------------------

            //----------------------------------------------------------------------------------------------------------
            // PRIVATE FUNCTIONS
            //----------------------------------------------------------------------------------------------------------

            //TODO: we currently assume that we always read data from exactly one SRC (i.e., no Source nodes)
            /**
             * Helper function, updating the render data, stored in the given objects,
             * with data read from the given SRC.
             *
             * @param {Object} shape - x3dom shape node
             * @param {Object} shaderProgram - x3dom shader program
             * @param {Object} gl - WebGL context
             * @param {Object} srcHeaderObj - the JS object which was created from the SRC header
             * @param {Uint8Array} srcBodyView - a typed array view on the body of the SRC file
             * @private
             */
            _updateRenderDataFromSRC: function(shape, shaderProgram, gl, srcHeaderObj, srcBodyView)
            {
                var INDEX_BUFFER_IDX    = 0;
                var POSITION_BUFFER_IDX = 1;
                var NORMAL_BUFFER_IDX   = 2;
                var TEXCOORD_BUFFER_IDX = 3;
                var COLOR_BUFFER_IDX    = 4;
                var ID_BUFFER_IDX       = 5;

                var indexViews     = srcHeaderObj["accessors"]["indexViews"];
                var indexViewID, indexView;
                var meshes         = srcHeaderObj["meshes"];

                //the meta data object is currently unused
                //var metadataObj = srcHeaderObj["meta"];


                //1. create GL buffers for bufferChunks / bufferViews

                //create buffers and GL buffer views, and store their identifiers in a map
                var viewIDsToGLBufferIDs = {};

                //due to the differentiation between targets ARRAY and ELEMENT_ARRAY, we need to check the usage
                //of the buffer view objects here first, before uploading them for the matching target
                var indexViewBufferIDs = {};
                for (indexViewID in indexViews)
                {
                    indexView = indexViews[indexViewID];
                    indexViewBufferIDs[indexView["bufferView"]] = true;
                }

                this._createGLBuffersFromSRCChunks(gl,
                                                   srcHeaderObj["bufferChunks"], srcHeaderObj["bufferViews"],
                                                   srcBodyView, indexViewBufferIDs, viewIDsToGLBufferIDs);


                //2. remember GL index buffer properties, if any

                for (indexViewID in indexViews)
                {
                    indexView = indexViews[indexViewID];

                    shape._webgl.buffers[INDEX_BUFFER_IDX] = viewIDsToGLBufferIDs[indexView["bufferView"]];

                    //we currently assume 16 bit index data
                    shape._webgl.indexType = gl.UNSIGNED_SHORT;
                }

                if (indexViews.length > 0)
                {
                    shape._webgl.externalGeometry =  1; //indexed EG
                }
                else
                {
                    shape._webgl.externalGeometry = -1; //non-indexed EG
                }

                //TODO: setup this hints
                //this._vf.vertexCount[0] = 2342;
                //this._mesh._numCoords   = 23;
                //this._mesh._numFaces    = 42;


                //3. create GL attribute pointers for the vertex attributes

                this._createGLAttribPointersFromSRCChunks(gl,
                                                          srcHeaderObj["accessors"]["attributeViews"],
                                                          srcBodyView, viewIDsToGLBufferIDs);





                var attributes;

                var mesh;
                var attribute;

                for (var meshID in meshes)
                {
                    mesh = meshes[meshID];

                    attributes = mesh["attributes"];

                    for (var attributeKey in attributes)
                    {
                        attribute = attributes[attributeKey];

                        //...
                    }
                }

                //...



                //notify renderer
                shape._nameSpace.doc.needRender = true;

                x3dom.BinaryContainerLoader.checkError(gl);
            },

            //----------------------------------------------------------------------------------------------------------

            /**
             * Helper function, creating WebGL buffers for the given SRC data structures.
             * The result is stored in the given map from bufferView IDs to GL buffer IDs.
             *
             * @param {Object} gl - WebGL context
             * @param {Object} bufferChunksObj - the SRC header's bufferChunks object
             * @param {Object} bufferViewsObj - the SRC header's bufferViews object
             * @param {Uint8Array} srcBodyView - a typed array view on the body of the SRC file
             * @param {Object} indexViewBufferIDs - an object which holds the IDs of all index data bufferViews
             * @param {Object} viewIDsToGLBufferIDs - map that will be filled with a GL buffer ID for each bufferView ID
             * @private
             */
            _createGLBuffersFromSRCChunks: function(gl, bufferChunksObj, bufferViewsObj, srcBodyView,
                                                    indexViewBufferIDs, viewIDsToGLBufferIDs)
            {
                var i;
                var bufferView;
                var chunkIDList;
                var bufferType;

                var chunk;
                var newBuffer;
                var chunkDataView;
                var currentChunkDataOffset;

                //for each buffer view object, create and fill a GL buffer from its buffer chunks
                for (var bufferViewID in bufferViewsObj)
                {
                    bufferType = (typeof indexViewBufferIDs[bufferViewID] !== 'undefined') ? gl.ELEMENT_ARRAY_BUFFER :
                                                                                             gl.ARRAY_BUFFER;

                    bufferView = bufferViewsObj[bufferViewID];

                    chunkIDList = bufferView["chunks"];

                    //case 1: single chunk
                    if (chunkIDList.length == 1)
                    {
                        chunk = bufferChunksObj[chunkIDList[0]];

                        chunkDataView = new Uint8Array(srcBodyView.buffer, chunk["byteOffset"], bufferView["byteLength"]);

                        newBuffer = gl.createBuffer();

                        gl.bindBuffer(bufferType, newBuffer);

                        //upload all chunk data to GPU
                        gl.bufferData(bufferType, chunkDataView, gl.STATIC_DRAW);

                        viewIDsToGLBufferIDs[bufferViewID] = newBuffer;
                    }
                    //case 2: multiple chunks
                    else
                    {
                        newBuffer = gl.createBuffer();

                        gl.bindBuffer(bufferType, newBuffer);

                        //reserve GPU memory for all chunks
                        gl.bufferData(bufferType, bufferView["byteLength"], gl.STATIC_DRAW);

                        currentChunkDataOffset = 0;

                        for (i = 0; i < chunkIDList.length; ++i)
                        {
                            chunk = bufferChunksObj[chunkIDList[i]];

                            chunkDataView = new Uint8Array(srcBodyView.buffer, chunk["byteOffset"], bufferView["byteLength"]);

                            //upload chunk data to GPU
                            gl.bufferSubData(bufferType, currentChunkDataOffset, chunkDataView);

                            currentChunkDataOffset += chunk["byteLength"];
                        }

                        viewIDsToGLBufferIDs[bufferViewID] = newBuffer;
                    }
                }
            },

            //----------------------------------------------------------------------------------------------------------

            /**
             * Helper function, creating WebGL vertex attribute pointers from the given SRC data.
             *
             * @param {Object} gl - WebGL context
             * @param {Object} attributeViewsObj - the SRC header's attributeViews object
             * @param viewIDsToGLBufferIDs - map that contains a GL buffer ID for each bufferView ID
             * @private
             */
            _createGLAttribPointersFromSRCChunks: function(gl, attributeViewsObj, viewIDsToGLBufferIDs)
            {
                //...
            }

            //----------------------------------------------------------------------------------------------------------

            /*nodeChanged: function()
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
            }*/

        }
    )
);
