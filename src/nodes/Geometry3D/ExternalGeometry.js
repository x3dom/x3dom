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
         * @classdesc The ExternalGeometry node loads data from a Shape Resource Container (typically a binary glTF / .glb file). The used data can be progressively updated during transmission.
         */
         function (ctx) {
            x3dom.nodeTypes.ExternalGeometry.superClass.call(this, ctx);

            /**
             * Defines the url to the openGL Transfer Format (glTF) file.
             * A suffix with a leading # can be used to reference single meshes inside an SRC: "path/to/data.src#mesh0".
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

                var currentURL = shape._nameSpace.getURL(this._vf['url'][this._currentURLIdx]);

                // check if this is a legacy SRC container,
                // and use the respective loader in that case
                var urlSuffix = currentURL.substr(currentURL.lastIndexOf('.'));

                if (urlSuffix.substr(0, 4) == '.src')
                {
                    var srcUsedWarnMessage = "Legacy SRC format used for content for \"" + currentURL + "\". " +
                                             "It is recommended to use a binary-glTF-conformant .glb container instead.";
                    x3dom.debug.logWarning(srcUsedWarnMessage);
                    console.warn(srcUsedWarnMessage);

                    // actually, this._currentURLIdx should always be 0 here
                    ExternalGeometrySRC.updateRenderData(shape, shaderProgram, gl, viewarea, context,
                                                         this._mesh, this._vf['url'], this._currentURLIdx);
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

                xhr.open("GET", currentURL, true);

                xhr.responseType = "arraybuffer";

                //xhr.send(null);
                x3dom.RequestManager.addRequest(xhr);

                xhr.onerror = function() {
                    x3dom.debug.logError("Unable to load GLB data from URL \"" + currentURL + "\"");
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

                            if(currentURL.includes('#'))
                            {
                                var split = currentURL.split('#');
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
                                x3dom.debug.logWarning("Invalid GLB data, loaded from URL \"" +
                                                       currentURL +
                                                       "\", trying next specified URL");

                                //try next URL
                                ++that._currentURLIdx;
                                that.update(shape, shaderProgram, gl, viewarea, context);
                            }
                            else
                            {
                                x3dom.debug.logError("Invalid GLB data, loaded from URL \"" +
                                                     currentURL + "\"," +
                                                     " no other URLs left to try.");
                            }
                        }
                    }
                    else
                    {
                        if ((that._currentURLIdx + 1) < that._vf['url'].length)
                        {
                            x3dom.debug.logWarning("Invalid GLB data, loaded from URL \"" +
                                                   currentURL +
                                                   "\", trying next specified URL");

                            //try next URL
                            ++that._currentURLIdx;
                            that.update(shape, shaderProgram, gl, viewarea, context);
                        }
                        else
                        {
                            x3dom.debug.logError("Invalid GLB data, loaded from URL \"" +
                                                 currentURL + "\"," +
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
                    //if no bbox information was specified for the Shape node, use information from the GLB header
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




/////////////////////////////////////////////////
//             LEGACY SRC SUPPORT              //
/////////////////////////////////////////////////

// helper namespace to support legacy SRC format
var ExternalGeometrySRC =
{
    /*
     * Updates the render data, stored in the given objects, with data from this ExternalGeometry.
     * If necessary, the referenced file is downloaded first.
     *
     * @param {Object} shape - x3dom shape node
     * @param {Object} shaderProgram - x3dom shader program
     * @param {Object} gl - WebGL context
     * @param {Object} viewarea - x3dom view area
     * @param {Object} context - x3dom context object
     */
    updateRenderData :  function(shape, shaderProgram, gl, viewarea, context,
                                 x3domMesh, urls, currentURLIndex)
    {
        var xhr;

        if (urls.length == 0 ||
            currentURLIndex >= urls.length)
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

        //TODO: check this object - when is it called, where is it really needed?
        //shape._webgl.makeSeparateTris = {...};


        //post request
        xhr = new XMLHttpRequest();

        xhr.open("GET", shape._nameSpace.getURL(urls[currentURLIndex]), true);

        xhr.responseType = "arraybuffer";

        xhr.send(null);

        xhr.onerror = function() {
            x3dom.debug.logError("Unable to load SRC data from URL \"" + urls[currentURLIndex] + "\"");
        };

        //TODO: currently, we assume that the referenced file is always an SRC file
        xhr.onload = function() {
            shape._webgl.internalDownloadCount  = 0;
            shape._nameSpace.doc.downloadCount  = 0;

            var responseBeginUint32 = new Uint32Array(xhr.response, 0, 12);

            var srcHeaderSize, srcBodySize, srcBodyOffset;
            var srcHeaderView, srcBodyView;

            var srcHeaderObj;

            if ((xhr.status == 200 || xhr.status == 0) && responseBeginUint32.length >= 3) {

                srcHeaderSize = responseBeginUint32[2];
                srcBodyOffset = srcHeaderSize + 12;
                srcBodySize   = xhr.response.byteLength - srcBodyOffset;

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

                    ExternalGeometrySRC._updateRenderDataFromSRC(shape, shaderProgram, gl, srcHeaderObj, srcBodyView,
                        x3domMesh);
                }
                else
                {
                    if ((currentURLIndex + 1) < urls.length)
                    {
                        x3dom.debug.logWarning("Invalid SRC data, loaded from URL \"" +
                            urls[currentURLIndex] +
                            "\", trying next specified URL");

                        //try next URL
                        ++currentURLIndex;
                        ExternalGeometrySRC.updateRenderData(shape, shaderProgram, gl, viewarea, context,
                            urls, currentURLIndex);
                    }
                    else
                    {
                        x3dom.debug.logError("Invalid SRC data, loaded from URL \"" +
                            urls[currentURLIndex] + "\"," +
                            " no other URLs left to try.");
                    }
                }
            }
            else
            {
                if ((currentURLIndex + 1) < urls.length)
                {
                    x3dom.debug.logWarning("Invalid SRC data, loaded from URL \"" +
                        urls[currentURLIndex] +
                        "\", trying next specified URL");

                    //try next URL
                    ++currentURLIndex;
                    ExternalGeometrySRC.updateRenderData(shape, shaderProgram, gl, viewarea, context,
                        urls, currentURLIndex);
                }
                else
                {
                    x3dom.debug.logError("Invalid SRC data, loaded from URL \"" +
                        urls[currentURLIndex] + "\"," +
                        " no other URLs left to try.");
                }
            }
        };
    },

    /*
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
    _updateRenderDataFromSRC: function(shape, shaderProgram, gl, srcHeaderObj, srcBodyView, x3domMesh)
    {
        shape.meshes = [];

        var INDEX_BUFFER_IDX    = 0;
        var POSITION_BUFFER_IDX = 1;
        var NORMAL_BUFFER_IDX   = 2;
        var TEXCOORD_BUFFER_IDX = 3;
        var COLOR_BUFFER_IDX    = 4;
        var ID_BUFFER_IDX       = 5;

        var MAX_NUM_BUFFERS_PER_DRAW = 6;

        var indexViews = srcHeaderObj["accessors"]["indexViews"];
        var indexViewID, indexView;

        var attributeViews = srcHeaderObj["accessors"]["attributeViews"];
        var attributes;
        var attributeID, attributeView;
        var x3domTypeID, x3domShortTypeID, numComponents;

        var meshes = srcHeaderObj["meshes"];
        var mesh, meshID;
        var meshIdx, bufferOffset;


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

        ExternalGeometrySRC._createGLBuffersFromSRCChunks(gl,
            srcHeaderObj["bufferChunks"], srcHeaderObj["bufferViews"],
            srcBodyView, indexViewBufferIDs, viewIDsToGLBufferIDs);


        //2. remember GL index buffer properties, if any

        for (indexViewID in indexViews)
        {
            indexView = indexViews[indexViewID];

            //we currently assume 16 bit index data
            if (indexView["componentType"] != gl.UNSIGNED_SHORT)
            {
                x3dom.debug.logWarning("SRC index componentType " + indexView["componentType"] +
                    " is not UNSIGNED_SHORT. " +
                    "Ignoring given value and assuming UNSIGNED_SHORT indices.");
            }
            shape._webgl.indexType = gl.UNSIGNED_SHORT;
        }


        //3. remember necessary information to setup GL draw parameters and attribute pointers

        meshIdx      = 0;
        bufferOffset = 0;

        //hints for stats display
        x3domMesh._numCoords   = 0;
        x3domMesh._numFaces    = 0;

        for (meshID in meshes)
        {
            var renderMesh = new x3dom.glTF.glTFMesh();

            mesh = meshes[meshID];

            //setup indices, if any
            indexViewID = mesh["indices"];
            //TODO: allow the renderer to switch between indexed and non-indexed rendering, for one extGeo
            if (indexViewID != "")
            {
                shape._webgl.externalGeometry =  1; //indexed EG

                indexView = indexViews[indexViewID];

                renderMesh.indexOffset = indexView["byteOffset"];
                renderMesh.drawCount   = indexView["count"];

                //TODO: add support for LINES and POINTS
                renderMesh.numFaces  = indexView["count"] / 3;
                x3domMesh._numFaces += indexView["count"] / 3;

                renderMesh.buffers[INDEX_BUFFER_IDX + bufferOffset] = {};
                renderMesh.buffers[INDEX_BUFFER_IDX + bufferOffset].offset = indexView["byteOffset"];
                renderMesh.buffers[INDEX_BUFFER_IDX + bufferOffset].type   = indexView["componentType"];
                renderMesh.buffers[INDEX_BUFFER_IDX + bufferOffset].idx    = viewIDsToGLBufferIDs[indexView["bufferView"]];
            }
            else
            {
                shape._webgl.externalGeometry = -1; //non-indexed EG
            }

            //setup primType
            renderMesh.primitiveType = mesh["primitive"];

            //setup attributes
            attributes = mesh["attributes"];

            for (attributeID in attributes)
            {
                attributeView = attributeViews[attributes[attributeID]];

                //the current renderer does not support generic vertex attributes, so simply look for useable cases
                var idx = 0;
                switch (attributeID)
                {
                    case "position":
                        x3domTypeID      = "coord";
                        x3domShortTypeID = "Pos";
                        idx = POSITION_BUFFER_IDX + bufferOffset;
                        //for non-indexed rendering, we assume that all attributes have the same count
                        if (mesh["indices"] == "")
                        {
                            renderMesh.drawCount[meshIdx] = attributeView["count"];
                            //TODO: add support for LINES and POINTS
                            x3domMesh._numFaces += attributeView["count"] / 3;
                            renderMesh.numFaces = attributeView["count"] / 3;
                        }
                        x3domMesh._numCoords += attributeView["count"];
                        break;

                    case "normal":
                        x3domTypeID      = "normal";
                        x3domShortTypeID = "Norm";
                        idx = NORMAL_BUFFER_IDX + bufferOffset;
                        break;

                    case "texcoord":
                        x3domTypeID      = "texCoord";
                        x3domShortTypeID = "Tex";
                        idx = TEXCOORD_BUFFER_IDX + bufferOffset;
                        break;

                    case "color":
                        x3domTypeID      = "color";
                        x3domShortTypeID = "Col";
                        idx = COLOR_BUFFER_IDX + bufferOffset;
                        break;

                    case "id":
                        x3domTypeID      = "id";
                        x3domShortTypeID = "Id";
                        idx = ID_BUFFER_IDX + bufferOffset;
                        shape._cf.geometry.node._vf.idsPerVertex = true;
                        break;
                }

                shape["_" + x3domTypeID + "StrideOffset"][0] = attributeView["byteStride"];
                shape["_" + x3domTypeID + "StrideOffset"][1] = attributeView["byteOffset"];
                shape._webgl[x3domTypeID + "Type"]           = attributeView["componentType"];


                numComponents = ExternalGeometrySRC._findNumComponentsForSRCAccessorType(attributeView["type"]);
                x3domMesh["_num" + x3domShortTypeID + "Components"] = numComponents;

                renderMesh.buffers[idx] = {};
                renderMesh.buffers[idx].idx    = viewIDsToGLBufferIDs[attributeView["bufferView"]];
                renderMesh.buffers[idx].offset = attributeView["byteOffset"];
                renderMesh.buffers[idx].stride = attributeView["byteStride"];
                renderMesh.buffers[idx].type   = attributeView["componentType"];
                renderMesh.buffers[idx].numComponents = numComponents;
            }

            ++meshIdx;
            bufferOffset += MAX_NUM_BUFFERS_PER_DRAW;

            shape.meshes.push(renderMesh);
        }


        //4. notify renderer

        shape._dirty.shader = true;

        shape._nameSpace.doc.needRender = true;

        x3dom.BinaryContainerLoader.checkError(gl);
    },

    //----------------------------------------------------------------------------------------------------------

    /*
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

                chunkDataView = new Uint8Array(srcBodyView.buffer,
                    srcBodyView.byteOffset + chunk["byteOffset"],
                    chunk["byteLength"]);

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

                    chunkDataView = new Uint8Array(srcBodyView.buffer,
                        srcBodyView.byteOffset + chunk["byteOffset"],
                        chunk["byteLength"]);

                    //upload chunk data to GPU
                    gl.bufferSubData(bufferType, currentChunkDataOffset, chunkDataView);

                    currentChunkDataOffset += chunk["byteLength"];
                }

                viewIDsToGLBufferIDs[bufferViewID] = newBuffer;
            }
        }
    },


    /*
     * Helper to encapsulate the number of components per accessor type
     * @param {STRING} type - accessor type, must be "SCALAR", "VEC2", "VEC3" or "VEC4"
     * @private
     */
    _findNumComponentsForSRCAccessorType : function(type)
    {
        switch (type)
        {
            case "SCALAR": return 1;
            case "VEC2":   return 2;
            case "VEC3":   return 3;
            case "VEC4":   return 4;
            default:       return 0;
        }
    }
};
