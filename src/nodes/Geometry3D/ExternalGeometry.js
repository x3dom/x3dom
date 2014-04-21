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
         * @status experimental
         * @extends x3dom.nodeTypes.X3DSpatialGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
         function (ctx) {
            x3dom.nodeTypes.ExternalGeometry.superClass.call(this, ctx);

            /**
             *
             * @var {SFString} url
             * @memberof x3dom.nodeTypes.Geometry3D
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'url',  "");

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
                var indexViews     = srcHeaderObj["accessors"]["indexViews"];
                var meshes         = srcHeaderObj["meshes"];

                //the meta data object is currently unused
                //var metadataObj = srcHeaderObj["meta"];


                //create buffers and GL buffer views, and store their identifiers in a map
                var viewIDsToGLBufferIDs = {};

                //TODO: distinction between ELEMENT_ARRAY and ARRAY buffers
                this._createGLBuffersFromSRCChunks(gl,
                                                   srcHeaderObj["bufferChunks"], srcHeaderObj["bufferViews"],
                                                   srcBodyView, viewIDsToGLBufferIDs);

                //create GL attribute pointers for the vertex attributes
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

                //TODO: make it right
                // 0 : no EG,  1 : indexed EG, -1 : non-indexed EG
                shape._webgl.externalGeometry = -1;

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
             * @param {Object} viewIDsToGLBufferIDs - map that will be filled with a GL buffer ID for each bufferView ID
             * @private
             */
            _createGLBuffersFromSRCChunks: function(gl, bufferChunksObj, bufferViewsObj, srcBodyView,
                                                    viewIDsToGLBufferIDs)
            {
                var i;
                var currentChunkData;
                var chunkDataList       = [];
                var chunkIDToChunkIndex = {};

                var bufferView;
                var chunkList;
                var coherentChunks;
                var lastChunkIndex, currentChunkIndex;

                var newBuffer;
                var chunkDataView;
                var currentChunkDataOffset;

                //temporary structure for sorting of chunks
                var chunkData = function(bufferChunkID, bufferChunkObj)
                {
                    this._offset = bufferChunkObj["byteOffset"];
                    this._length = bufferChunkObj["byteLength"];
                    this._id     = bufferChunkID;
                };

                for (var bufferChunkID in bufferChunksObj)
                {
                    currentChunkData = new chunkData(bufferChunkID, bufferChunksObj[bufferChunkID]);

                    chunkDataList.push(currentChunkData);
                }

                //sort chunks by offset, to ensure the same order as in the SRC body
                chunkDataList.sort(function(a, b){
                    return a._offset - b._offset;
                });

                //remember, for each chunk ID, its index in the chunk data list
                for (i = 0; i < chunkDataList.length; ++i)
                {
                    chunkIDToChunkIndex[chunkDataList[i]._id] = i;
                }


                //for each buffer view object, create and fill a GL buffer from its buffer chunks
                for (var bufferViewID in bufferViewsObj)
                {
                    bufferView = bufferViewsObj[bufferViewID];

                    chunkList = bufferView["chunks"];

                    //sort chunks of this buffer view by their occurrence in the SRC body
                    chunkList.sort(function(a, b){
                       return chunkIDToChunkIndex[a] - chunkIDToChunkIndex[b];
                    });

                    //check if the chunks of the buffer are coherent
                    coherentChunks = true;

                    lastChunkIndex    = -1;
                    currentChunkIndex = 0;

                    for (i = 0; i < chunkList.length; ++i)
                    {
                        currentChunkIndex = chunkIDToChunkIndex[chunkList[i]];

                        if (lastChunkIndex != -1 && Math.abs(currentChunkIndex - lastChunkIndex) > 1)
                        {
                            coherentChunks = false;
                            break;
                        }

                        lastChunkIndex = currentChunkIndex;
                    }

                    //TODO: is this distinction of cases, to save some WebGL calls, really worth all the JS effort? :-)
                    //      let's simply replace it by a check if there is more than one chunk
                    //case 1: single chunk, or coherent, successive chunks -> single GPU upload
                    if (coherentChunks)
                    {
                        chunkDataView = new Uint8Array(srcBodyView.buffer, chunkList[0]._offset, bufferView["byteLength"]);

                        newBuffer = gl.createBuffer();

                        gl.bindBuffer(gl.ARRAY_BUFFER, newBuffer);

                        //upload all chunk data to GPU
                        gl.bufferData(gl.ARRAY_BUFFER, chunkDataView, gl.STATIC_DRAW);

                        viewIDsToGLBufferIDs[bufferViewID] = newBuffer;
                    }
                    //case 2: multiple chunks, not directly successive -> multiple GPU uploads
                    else
                    {
                        newBuffer = gl.createBuffer();

                        gl.bindBuffer(gl.ARRAY_BUFFER, newBuffer);

                        //reserve GPU memory for all chunks
                        gl.bufferData(gl.ARRAY_BUFFER, bufferView["byteLength"], gl.STATIC_DRAW);

                        currentChunkDataOffset = 0;

                        for (i = 0; i < chunkList.length; ++i)
                        {
                            chunkDataView = new Uint8Array(srcBodyView.buffer, chunkList[i]._offset, bufferView["byteLength"]);

                            //upload chunk data to GPU
                            gl.bufferSubData(gl.ARRAY_BUFFER, currentChunkDataOffset, chunkDataView);

                            currentChunkDataOffset += chunkList[i]._length;
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
