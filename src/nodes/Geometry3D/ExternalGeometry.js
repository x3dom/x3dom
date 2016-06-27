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
             * Defines the url to the Shape Resource Container (SRC) file.
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
            updateRenderData: function(shape, shaderProgram, gl, viewarea, context) {
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

                //TODO: check this object - when is it called, where is it really needed?
                //shape._webgl.makeSeparateTris = {...};


                //post request
                xhr = new XMLHttpRequest();

                xhr.open("GET", shape._nameSpace.getURL(this._vf['url'][this._currentURLIdx]), true);

                xhr.responseType = "arraybuffer";

                xhr.send(null);

                xhr.onerror = function() {
                    x3dom.debug.logError("Unable to load SRC data from URL \"" + that._vf['url'][that._currentURLIdx] + "\"");
                };

                //TODO: currently, we assume that the referenced file is always an SRC file
                xhr.onload = function() {
                    shape._webgl.internalDownloadCount  = 0;
                    shape._nameSpace.doc.downloadCount  = 0;

                    shape._webgl.primType    = [];
                    shape._webgl.indexOffset = [];
                    shape._webgl.drawCount   = [];

                    var header = that._readHeader(xhr.response);
                    

                    if ((xhr.status == 200 || xhr.status == 0)) {
                        if (header.sceneLength > 0)
                        {
                            var scene = that._readScene(xhr.response, header);
                            var body = that._readBody(xhr.response, header);

                            var glTF = {};
                            glTF.header = header;
                            glTF.json = scene;

                            glTF.body = body;

                            glTF.loaded = {};
                            glTF.loaded.meshes = {};
                            glTF.loaded.meshCount = 0;

                            that._updateRenderData(shape, shaderProgram, gl, glTF);
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
                                that.updateRenderData(shape, shaderProgram, gl, viewarea, context);
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
                            that.updateRenderData(shape, shaderProgram, gl, viewarea, context);
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

            _updateRenderData: function(shape, shaderProgram, gl, glTF)
            {
                shape._webgl.externalGeometry = -1;
                glTF.loaded.bufferViews = this._loadBufferViews(shape, gl, glTF);

                var defaultScene = glTF.json["scene"];
                var scene = glTF.json.scenes[defaultScene];

                var nodes = scene["nodes"];

                for(var i = 0; i<nodes.length;++i)
                {
                    var nodeID = nodes[i];
                    this._traverseNode(shape, shaderProgram, gl, glTF, glTF.json.nodes[nodeID]);
                }
                   
            },

            _traverseNode: function(shape, shaderProgram, gl, glTF, node)
            {
                var children = node["children"];
                if(children!=null)
                    for(var i = 0; i<children.length;++i)
                    {
                        var childID = children[i];
                        this._traverseNode(shape, shaderProgram, gl, glTF, glTF.json.nodes[childID]);
                    }

                var meshes = node["meshes"];
                if(meshes != null && meshes.length > 0)
                    for (var i = 0; i < meshes.length; ++i) {
                        var meshID = meshes[i];
                        if (glTF.loaded.meshes[meshID] == null) {
                            this._updateMesh(shape, shaderProgram, gl, glTF, glTF.json.meshes[meshID]);
                            glTF.loaded.meshes[meshID] = 1;
                        }
                    }
            },

            _updateMesh: function(shape, shaderProgram, gl, glTF, mesh)
            {
                console.log(mesh);

                var primitives = mesh["primitives"];
                for(var i = 0; i<primitives.length; ++i){
                    this._loadPrimitive(shape, shaderProgram, gl, glTF, primitives[i]);                    
                }
            },

            _loadPrimitive: function(shape, shaderProgram, gl, glTF, primitive)
            {
                var INDEX_BUFFER_IDX    = 0;
                var POSITION_BUFFER_IDX = 1;
                var NORMAL_BUFFER_IDX   = 2;
                var TEXCOORD_BUFFER_IDX = 3;
                var COLOR_BUFFER_IDX    = 4;

                var x3domTypeID, x3domShortTypeID;

                var meshIdx = glTF.loaded.meshCount;
                var bufferOffset = meshIdx * 6;
                shape._webgl.primType[meshIdx] = primitive["mode"];

                var indexed = (primitive.indices != null && primitive.indices != "");

                if(indexed == true){
                    var indicesAccessor = glTF.json.accessors[primitive.indices];

                    shape._webgl.indexOffset[meshIdx] = indicesAccessor["byteOffset"];
                    shape._webgl.drawCount[meshIdx]   = indicesAccessor["count"];

                    shape._webgl.buffers[INDEX_BUFFER_IDX + bufferOffset] =
                        glTF.loaded.bufferViews[indicesAccessor["bufferView"]];

                    //TODO: add support for LINES and POINTS
                    this._mesh._numFaces += indicesAccessor["count"] / 3;
                }

                var attributes = primitive["attributes"];

                for (var attributeID in attributes)
                {
                    var accessorName = attributes[attributeID];
                    var accessor = glTF.json.accessors[accessorName];

                    //the current renderer does not support generic vertex attributes, so simply look for useable cases
                    switch (attributeID)
                    {
                        case "POSITION":
                            x3domTypeID      = "coord";
                            x3domShortTypeID = "Pos";
                            shape._webgl.buffers[POSITION_BUFFER_IDX + bufferOffset] =
                                glTF.loaded.bufferViews[accessor["bufferView"]];
                            //for non-indexed rendering, we assume that all attributes have the same count
                            if (indexed == false)
                            {
                                shape._webgl.drawCount[meshIdx] = accessor["count"];
                                //TODO: add support for LINES and POINTS
                                this._mesh._numFaces += accessor["count"] / 3;
                            }
                            this._mesh._numCoords += accessor["count"];
                            break;

                        case "NORMAL":
                            x3domTypeID      = "normal";
                            x3domShortTypeID = "Norm";
                            shape._webgl.buffers[NORMAL_BUFFER_IDX + bufferOffset] =
                                glTF.loaded.bufferViews[accessor["bufferView"]];
                            break;

                        case "TEXCOORD_0":
                            x3domTypeID      = "texCoord";
                            x3domShortTypeID = "Tex";
                            shape._webgl.buffers[TEXCOORD_BUFFER_IDX + bufferOffset] =
                                glTF.loaded.bufferViews[accessor["bufferView"]];
                            break;

                        case "COLOR":
                            x3domTypeID      = "color";
                            x3domShortTypeID = "Col";
                            shape._webgl.buffers[COLOR_BUFFER_IDX + bufferOffset] =
                                glTF.loaded.bufferViews[accessor["bufferView"]];
                            break;
                    }

                    if(x3domTypeID != null){
                        shape["_" + x3domTypeID + "StrideOffset"][meshIdx] = [];

                        shape["_" + x3domTypeID + "StrideOffset"][meshIdx][0] = accessor["byteStride"];
                        shape["_" + x3domTypeID + "StrideOffset"][meshIdx][1] = accessor["byteOffset"];
                        shape._webgl[x3domTypeID + "Type"]           = accessor["componentType"];

                        var numComponents = x3dom.nodeTypes.ExternalGeometry._findNumComponentsForSRCAccessorType(accessor["type"]);
                        this._mesh["_num" + x3domShortTypeID + "Components"] = numComponents;
                    }
                }

                glTF.loaded.meshCount += 1;

                shape._dirty.shader = true;
                shape._nameSpace.doc.needRender = true;
                x3dom.BinaryContainerLoader.checkError(gl);
            },

            _loadBufferViews: function(shape, gl, glTF)
            {
                var buffers = {};

                var bufferViews = glTF.json.bufferViews;
                for(var bufferId in bufferViews)
                {
                    if(!bufferViews.hasOwnProperty(bufferId)) continue;

                    var bufferView = bufferViews[bufferId];

                    // do not use Buffer for Skin or animation data
                    if(bufferView.target == null && bufferView.target != gl.ARRAY_BUFFER && bufferView.target != gl.ELEMENT_ARRAY_BUFFER)
                        continue;

                    if(bufferView.target == gl.ELEMENT_ARRAY_BUFFER)
                        shape._webgl.externalGeometry = 1;

                    var data = new Uint8Array(glTF.body.buffer,
                                            glTF.header.bodyOffset + bufferView["byteOffset"],
                                            bufferView["byteLength"]);

                    var newBuffer = gl.createBuffer();
                    gl.bindBuffer(bufferView["target"], newBuffer);

                    //upload all chunk data to GPU
                    gl.bufferData(bufferView["target"], data, gl.STATIC_DRAW);

                    buffers[bufferId] = newBuffer;
                }

                return buffers;
            },

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

                var MAX_NUM_BUFFERS_PER_DRAW = 6;

                var indexViews = srcHeaderObj["accessors"]["indexViews"];


                var attributeViews = srcHeaderObj["accessors"]["attributeViews"];
                var attributes;
                var attributeID, attributeView;
                var x3domTypeID, x3domShortTypeID, numComponents;

                var meshes = srcHeaderObj["meshes"];
                var mesh, meshID;
                var meshIdx, bufferOffset;


                //1. create GL buffers for bufferChunks / bufferViews

                //create buffers and GL buffer views, and store their identifiers in a map
                var viewIDsToGLBufferIDs = {};

                this._createGLBuffersFromSRCChunks(gl, srcHeaderObj["bufferViews"],
                                                   srcBodyView, viewIDsToGLBufferIDs);


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

                shape._webgl.primType    = [];
                shape._webgl.indexOffset = [];
                shape._webgl.drawCount   = [];

                //hints for stats display
                this._mesh._numCoords   = 0;
                this._mesh._numFaces    = 0;

                for (meshID in meshes)
                {
                    mesh = meshes[meshID];

                    //setup indices, if any
                    indexViewID = mesh["indices"];
                    //TODO: allow the renderer to switch between indexed and non-indexed rendering, for one extGeo
                    if (indexViewID != "")
                    {
                        shape._webgl.externalGeometry =  1; //indexed EG

                        indexView = indexViews[indexViewID];

                        shape._webgl.indexOffset[meshIdx] = indexView["byteOffset"];
                        shape._webgl.drawCount[meshIdx]   = indexView["count"];

                        shape._webgl.buffers[INDEX_BUFFER_IDX + bufferOffset] =
                            viewIDsToGLBufferIDs[indexView["bufferView"]];

                        //TODO: add support for LINES and POINTS
                        this._mesh._numFaces += indexView["count"] / 3;
                    }
                    else
                    {
                        shape._webgl.externalGeometry = -1; //non-indexed EG
                    }

                    //setup primType
                    shape._webgl.primType[meshIdx] = mesh["primitive"];

                    //setup attributes
                    attributes = mesh["attributes"];

                    for (attributeID in attributes)
                    {
                        attributeView = attributeViews[attributes[attributeID]];

                        //the current renderer does not support generic vertex attributes, so simply look for useable cases
                        switch (attributeID)
                        {
                            case "position":
                                x3domTypeID      = "coord";
                                x3domShortTypeID = "Pos";
                                shape._webgl.buffers[POSITION_BUFFER_IDX + bufferOffset] =
                                    viewIDsToGLBufferIDs[attributeView["bufferView"]];
                                //for non-indexed rendering, we assume that all attributes have the same count
                                if (mesh["indices"] == "")
                                {
                                    shape._webgl.drawCount[meshIdx] = attributeView["count"];
                                    //TODO: add support for LINES and POINTS
                                    this._mesh._numFaces += attributeView["count"] / 3;
                                }
                                this._mesh._numCoords += attributeView["count"];
                                break;

                            case "normal":
                                x3domTypeID      = "normal";
                                x3domShortTypeID = "Norm";
                                shape._webgl.buffers[NORMAL_BUFFER_IDX + bufferOffset] =
                                    viewIDsToGLBufferIDs[attributeView["bufferView"]];
                                break;

                            case "texcoord":
                                x3domTypeID      = "texCoord";
                                x3domShortTypeID = "Tex";
                                shape._webgl.buffers[TEXCOORD_BUFFER_IDX + bufferOffset] =
                                    viewIDsToGLBufferIDs[attributeView["bufferView"]];
                                break;

                            case "color":
                                x3domTypeID      = "color";
                                x3domShortTypeID = "Col";
                                shape._webgl.buffers[COLOR_BUFFER_IDX + bufferOffset] =
                                    viewIDsToGLBufferIDs[attributeView["bufferView"]];
                                break;

                            case "id":
                                x3domTypeID      = "id";
                                x3domShortTypeID = "Id";
                                shape._webgl.buffers[ID_BUFFER_IDX + bufferOffset] =
                                    viewIDsToGLBufferIDs[attributeView["bufferView"]];
                                shape._cf.geometry.node._vf.idsPerVertex = true;
                                break;
                        }

                        shape["_" + x3domTypeID + "StrideOffset"][0] = attributeView["byteStride"];
                        shape["_" + x3domTypeID + "StrideOffset"][1] = attributeView["byteOffset"];
                        shape._webgl[x3domTypeID + "Type"]           = attributeView["componentType"];

                        numComponents = x3dom.nodeTypes.ExternalGeometry._findNumComponentsForSRCAccessorType(attributeView["type"]);
                        this._mesh["_num" + x3domShortTypeID + "Components"] = numComponents;
                    }

                    ++meshIdx;
                    bufferOffset += MAX_NUM_BUFFERS_PER_DRAW;
                }


                //4. notify renderer

                shape._dirty.shader = true;

                shape._nameSpace.doc.needRender = true;

                x3dom.BinaryContainerLoader.checkError(gl);
            },

            //----------------------------------------------------------------------------------------------------------

            /**
             * Helper function, creating WebGL buffers for the given SRC data structures.
             * The result is stored in the given map from bufferView IDs to GL buffer IDs.
             *
             * @param {Object} gl - WebGL context
             * @param {Object} bufferViewsObj - the SRC header's bufferViews object
             * @param {Uint8Array} srcBodyView - a typed array view on the body of the SRC file
             * @param {Object} indexViewBufferIDs - an object which holds the IDs of all index data bufferViews
             * @param {Object} viewIDsToGLBufferIDs - map that will be filled with a GL buffer ID for each bufferView ID
             * @private
             */
            _createGLBuffersFromSRCChunks: function(gl, bufferViewsObj, srcBodyView,
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
            },

            _readHeader: function(response)
            {
                var header = {};
                var magicBytes = new Uint8Array(response, 0, 4);
                var versionBytes = new Uint32Array(response, 4, 1);
                var lengthBytes = new Uint32Array(response, 8, 1);
                var sceneLengthBytes = new Uint32Array(response, 12, 1);
                var sceneFormatBytes = new Uint32Array(response, 16, 1);

                header.magic = new TextDecoder("ascii").decode(magicBytes);
                if(versionBytes[0] == 1)
                    header.version = "Version 1";
                
                header.length = lengthBytes[0];
                header.sceneLength = sceneLengthBytes[0];

                if(sceneFormatBytes[0] == 0)
                    header.sceneFormat = "JSON";


                header.bodyOffset = header.sceneLength + 20;

                console.log(header);

                return header;
            },

            _readScene: function(response, header)
            {
                var sceneBytes = new Uint8Array(response, 20, header.sceneLength);

                var json = JSON.parse(new TextDecoder("utf-8").decode(sceneBytes));

                return json;
            },
            _readBody: function(response, header)
            {
                var offset = header.sceneLength + 20;
                var body = new Uint8Array(response, offset, header.length-offset);

                return body;
            }

        }        
    )
);


//----------------------------------------------------------------------------------------------------------------------
// PUBLIC STATIC FUNCTIONS
//----------------------------------------------------------------------------------------------------------------------



//----------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------------
// PRIVATE STATIC FUNCTIONS
//----------------------------------------------------------------------------------------------------------------------

/**
 *
 * @param {STRING} type - accessor type, must be "SCALAR", "VEC2", "VEC3" or "VEC4"
 * @private
 */
x3dom.nodeTypes.ExternalGeometry._findNumComponentsForSRCAccessorType = function(type)
{
    switch (type)
    {
        case "SCALAR": return 1;
        case "VEC2":   return 2;
        case "VEC3":   return 3;
        case "VEC4":   return 4;
        default:       return 0;
    }
};

//----------------------------------------------------------------------------------------------------------------------
