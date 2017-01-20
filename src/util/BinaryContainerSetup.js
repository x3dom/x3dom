/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */


/** used from within gfx_webgl.js */
x3dom.BinaryContainerLoader = {
    outOfMemory: false,     // try to prevent browser crashes

    checkError: function(gl) {
        var glErr = gl.getError();
        if (glErr) {
            if (glErr == gl.OUT_OF_MEMORY) {
                this.outOfMemory = true;
                x3dom.debug.logError("GL-Error " + glErr + " on loading binary container (out of memory).");
                console.error("WebGL: OUT_OF_MEMORY");
            }
            else {
                x3dom.debug.logError("GL-Error " + glErr + " on loading binary container.");
            }
        }
    }
};


/** setup/download binary geometry */
x3dom.BinaryContainerLoader.setupBinGeo = function(shape, sp, gl, viewarea, currContext)
{
    if (this.outOfMemory) {
        return;
    }

    var t00 = new Date().getTime();
    var that = this;

    var binGeo = shape._cf.geometry.node;

    // 0 := no BG, 1 := indexed BG, -1 := non-indexed BG
    shape._webgl.binaryGeometry = -1;

    shape._webgl.internalDownloadCount = ((binGeo._vf.index.length > 0) ? 1 : 0) +
        ((binGeo._hasStrideOffset && binGeo._vf.coord.length > 0) ? 1 : 0) +
        ((!binGeo._hasStrideOffset && binGeo._vf.coord.length > 0) ? 1 : 0) +
        ((!binGeo._hasStrideOffset && binGeo._vf.normal.length > 0) ? 1 : 0) +
        ((!binGeo._hasStrideOffset && binGeo._vf.texCoord.length > 0) ? 1 : 0) +
        ((!binGeo._hasStrideOffset && binGeo._vf.color.length > 0) ? 1 : 0);

    var createTriangleSoup = (binGeo._vf.normalPerVertex == false) ||
                              ((binGeo._vf.index.length > 0) && (binGeo._vf.indexType == "Int32" ||
                                (binGeo._vf.indexType == "Uint32" && !x3dom.caps.INDEX_UINT)));

    shape._webgl.makeSeparateTris = {
        index: null,
        coord: null,
        normal: null,
        texCoord: null,
        color: null,

        pushBuffer: function(name, buf) {
            this[name] = buf;

            if (--shape._webgl.internalDownloadCount == 0) {
                if (this.coord)
                    this.createMesh();
                shape._nameSpace.doc.needRender = true;
            }
            if (--shape._nameSpace.doc.downloadCount == 0)
                shape._nameSpace.doc.needRender = true;
        },

        createMesh: function() {
            var geoNode = binGeo;

            if (geoNode._hasStrideOffset) {
                x3dom.debug.logError(geoNode._vf.indexType +
                    " index type and per-face normals not supported for interleaved arrays.");
                return;
            }

            for (var k=0; k<shape._webgl.primType.length; k++) {
                if (shape._webgl.primType[k] == gl.TRIANGLE_STRIP) {
                    x3dom.debug.logError("makeSeparateTris: triangle strips not yet supported for per-face normals.");
                    return;
                }
            }

            var attribTypeStr = geoNode._vf.coordType;
            shape._webgl.coordType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);

            // remap vertex data
            var bgCenter, bgSize, bgPrecisionMax;

            if (shape._webgl.coordType != gl.FLOAT)
            {
                if (geoNode._mesh._numPosComponents == 4 &&
                    x3dom.Utils.isUnsignedType(geoNode._vf.coordType))
                    bgCenter = x3dom.fields.SFVec3f.copy(geoNode.getMin());
                else
                    bgCenter = x3dom.fields.SFVec3f.copy(geoNode._vf.position);

                bgSize = x3dom.fields.SFVec3f.copy(geoNode._vf.size);
                bgPrecisionMax = geoNode.getPrecisionMax('coordType');
            }
            else
            {
                bgCenter = new x3dom.fields.SFVec3f(0, 0, 0);
                bgSize = new x3dom.fields.SFVec3f(1, 1, 1);
                bgPrecisionMax = 1.0;
            }

            // check types
            var dataLen = shape._coordStrideOffset[0] / x3dom.Utils.getDataTypeSize(geoNode._vf.coordType);
            dataLen = (dataLen == 0) ? 3 : dataLen;

            x3dom.debug.logWarning("makeSeparateTris.createMesh called with coord length " + dataLen);

            if (this.color && dataLen != shape._colorStrideOffset[0] / x3dom.Utils.getDataTypeSize(geoNode._vf.colorType))
            {
                this.color = null;
                x3dom.debug.logWarning("Color format not supported.");
            }

            var texDataLen = this.texCoord ? (shape._texCoordStrideOffset[0] /
                                              x3dom.Utils.getDataTypeSize(geoNode._vf.texCoordType)) : 0;

            // set data types
            //geoNode._vf.coordType = "Float32";
            geoNode._vf.normalType = "Float32";

            //shape._webgl.coordType = gl.FLOAT;
            shape._webgl.normalType = gl.FLOAT;

            //geoNode._mesh._numPosComponents = 3;
            geoNode._mesh._numNormComponents = 3;

            //shape._coordStrideOffset = [0, 0];
            shape._normalStrideOffset = [0, 0];

            // create non-indexed mesh
            var posBuf = [], normBuf = [], texcBuf = [], colBuf = [];
            var i, j, l, n = this.index ? (this.index.length - 2) : (this.coord.length / 3 - 2);

            for (i=0; i<n; i+=3)
            {
                j = dataLen * (this.index ? this.index[i] : i);
                var p0 = new x3dom.fields.SFVec3f(bgSize.x * this.coord[j  ] / bgPrecisionMax,
                                                  bgSize.y * this.coord[j+1] / bgPrecisionMax,
                                                  bgSize.z * this.coord[j+2] / bgPrecisionMax);
                // offset irrelevant for normal calculation
                //p0 = bgCenter.add(p0);

                posBuf.push(this.coord[j  ]);
                posBuf.push(this.coord[j+1]);
                posBuf.push(this.coord[j+2]);
                if (dataLen > 3) posBuf.push(this.coord[j+3]);

                if (this.color) {
                    colBuf.push(this.color[j  ]);
                    colBuf.push(this.color[j+1]);
                    colBuf.push(this.color[j+2]);
                    if (dataLen > 3) colBuf.push(this.color[j+3]);
                }

                if (this.texCoord) {
                    l = texDataLen * (this.index ? this.index[i] : i);

                    texcBuf.push(this.texCoord[l  ]);
                    texcBuf.push(this.texCoord[l+1]);
                    if (texDataLen > 3) {
                        texcBuf.push(this.texCoord[l+2]);
                        texcBuf.push(this.texCoord[l+3]);
                    }
                }

                j = dataLen * (this.index ? this.index[i+1] : i+1);
                var p1 = new x3dom.fields.SFVec3f(bgSize.x * this.coord[j  ] / bgPrecisionMax,
                                                  bgSize.y * this.coord[j+1] / bgPrecisionMax,
                                                  bgSize.z * this.coord[j+2] / bgPrecisionMax);
                //p1 = bgCenter.add(p1);

                posBuf.push(this.coord[j  ]);
                posBuf.push(this.coord[j+1]);
                posBuf.push(this.coord[j+2]);
                if (dataLen > 3) posBuf.push(this.coord[j+3]);

                if (this.color) {
                    colBuf.push(this.color[j  ]);
                    colBuf.push(this.color[j+1]);
                    colBuf.push(this.color[j+2]);
                    if (dataLen > 3) colBuf.push(this.color[j+3]);
                }

                if (this.texCoord) {
                    l = texDataLen * (this.index ? this.index[i+1] : i+1);

                    texcBuf.push(this.texCoord[l  ]);
                    texcBuf.push(this.texCoord[l+1]);
                    if (texDataLen > 3) {
                        texcBuf.push(this.texCoord[l+2]);
                        texcBuf.push(this.texCoord[l+3]);
                    }
                }

                j = dataLen * (this.index ? this.index[i+2] : i+2);
                var p2 = new x3dom.fields.SFVec3f(bgSize.x * this.coord[j  ] / bgPrecisionMax,
                                                  bgSize.y * this.coord[j+1] / bgPrecisionMax,
                                                  bgSize.z * this.coord[j+2] / bgPrecisionMax);
                //p2 = bgCenter.add(p2);

                posBuf.push(this.coord[j  ]);
                posBuf.push(this.coord[j+1]);
                posBuf.push(this.coord[j+2]);
                if (dataLen > 3) posBuf.push(this.coord[j+3]);

                if (this.color) {
                    colBuf.push(this.color[j  ]);
                    colBuf.push(this.color[j+1]);
                    colBuf.push(this.color[j+2]);
                    if (dataLen > 3) colBuf.push(this.color[j+3]);
                }

                if (this.texCoord) {
                    l = texDataLen * (this.index ? this.index[i+2] : i+2);

                    texcBuf.push(this.texCoord[l  ]);
                    texcBuf.push(this.texCoord[l+1]);
                    if (texDataLen > 3) {
                        texcBuf.push(this.texCoord[l+2]);
                        texcBuf.push(this.texCoord[l+3]);
                    }
                }

                var a = p0.subtract(p1);
                var b = p1.subtract(p2);
                var norm = a.cross(b).normalize();

                for (j=0; j<3; j++) {
                    normBuf.push(norm.x);
                    normBuf.push(norm.y);
                    normBuf.push(norm.z);
                }
            }

            // coordinates
            var buffer = gl.createBuffer();
            shape._webgl.buffers[1] = buffer;

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER,
                x3dom.Utils.getArrayBufferView(geoNode._vf.coordType, posBuf), gl.STATIC_DRAW);

            gl.vertexAttribPointer(sp.position, geoNode._mesh._numPosComponents,
                shape._webgl.coordType, false,
                shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
            gl.enableVertexAttribArray(sp.position);

            // normals
            buffer = gl.createBuffer();
            shape._webgl.buffers[2] = buffer;

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normBuf), gl.STATIC_DRAW);

            gl.vertexAttribPointer(sp.normal, geoNode._mesh._numNormComponents,
                shape._webgl.normalType, false,
                shape._normalStrideOffset[0], shape._normalStrideOffset[1]);
            gl.enableVertexAttribArray(sp.normal);

            // tex coords
            if (this.texCoord)
            {
                buffer = gl.createBuffer();
                shape._webgl.buffers[3] = buffer;

                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER,
                    x3dom.Utils.getArrayBufferView(geoNode._vf.texCoordType, texcBuf),
                    gl.STATIC_DRAW);

                gl.vertexAttribPointer(sp.texcoord, geoNode._mesh._numTexComponents,
                    shape._webgl.texCoordType, false,
                    shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);
                gl.enableVertexAttribArray(sp.texcoord);
            }

            // colors
            if (this.color)
            {
                buffer = gl.createBuffer();
                shape._webgl.buffers[4] = buffer;

                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER,
                    x3dom.Utils.getArrayBufferView(geoNode._vf.colorType, colBuf),
                    gl.STATIC_DRAW);

                gl.vertexAttribPointer(sp.color, geoNode._mesh._numColComponents,
                    shape._webgl.colorType, false,
                    shape._colorStrideOffset[0], shape._colorStrideOffset[1]);
                gl.enableVertexAttribArray(sp.color);
            }

            // adjust sizes
            geoNode._vf.vertexCount = [];
            geoNode._vf.vertexCount[0] = posBuf.length / dataLen;

            geoNode._mesh._numCoords = geoNode._vf.vertexCount[0];
            geoNode._mesh._numFaces = geoNode._vf.vertexCount[0] / 3;

            shape._webgl.primType = [];
            shape._webgl.primType[0] = gl.TRIANGLES;

            // cleanup
            posBuf = null;
            normBuf = null;
            texcBuf = null;
            colBuf = null;

            this.index = null;
            this.coord = null;
            this.normal = null;
            this.texCoord = null;
            this.color = null;

            that.checkError(gl);

            // recreate shader
            delete shape._webgl.shader;
            shape._webgl.shader = currContext.cache.getDynamicShader(gl, viewarea, shape);
        }
    };

    // index
    if (binGeo._vf.index.length > 0)
    {
        shape._webgl.binaryGeometry = 1;    // indexed BG

        var xmlhttp0 = new XMLHttpRequest();
        xmlhttp0.open("GET", shape._nameSpace.getURL(binGeo._vf.index), true);
        xmlhttp0.responseType = "arraybuffer";

        shape._nameSpace.doc.downloadCount += 1;

        //xmlhttp0.send(null);
        x3dom.RequestManager.addRequest( xmlhttp0 );

        xmlhttp0.onload = function()
        {
            shape._nameSpace.doc.downloadCount -= 1;
            shape._webgl.internalDownloadCount -= 1;

            if (xmlhttp0.status != 200) {
                x3dom.debug.logError( "XHR1/ index load failed with status: " + xmlhttp0.status );
                return;
            }

            if (!shape._webgl)
                return;

            var XHR_buffer = binGeo._vf.compressed == true ? x3dom.Utils.gunzip(xmlhttp0.response) : xmlhttp0.response;

            var geoNode = binGeo;
            var attribTypeStr = geoNode._vf.indexType;  //"Uint16"

            var indexArray = x3dom.Utils.getArrayBufferView(attribTypeStr, XHR_buffer);

            if (createTriangleSoup) {
                shape._webgl.makeSeparateTris.pushBuffer("index", indexArray);
                return;
            }

            var indicesBuffer = gl.createBuffer();


            if (x3dom.caps.INDEX_UINT && attribTypeStr == "Uint32") {
                //indexArray is Uint32Array
                shape._webgl.indexType = gl.UNSIGNED_INT;
            }
            else {
                //indexArray is Uint16Array
                shape._webgl.indexType = gl.UNSIGNED_SHORT;
            }

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

            // Test reading Data
            //x3dom.debug.logWarning("arraybuffer[0]="+indexArray[0]+"; n="+indexArray.length);

            if (geoNode._vf.vertexCount[0] == 0)
                geoNode._vf.vertexCount[0] = indexArray.length;

            geoNode._mesh._numFaces = 0;

            for (var i=0; i<geoNode._vf.vertexCount.length; i++) {
                if (shape._webgl.primType[i] == gl.TRIANGLE_STRIP)
                    geoNode._mesh._numFaces += geoNode._vf.vertexCount[i] - 2;
                else
                    geoNode._mesh._numFaces += geoNode._vf.vertexCount[i] / 3;
            }

            indexArray = null;

            if (shape._webgl.internalDownloadCount == 0)
            {
                shape._nameSpace.doc.needRender = true;
            }

            that.checkError(gl);

            var t11 = new Date().getTime() - t00;
            x3dom.debug.logInfo("XHR0/ index load time: " + t11 + " ms");

            shape._webgl.buffers[0] = indicesBuffer;
        };
    }

    // interleaved array -- assume all attributes are given in one single array buffer
    if (binGeo._hasStrideOffset && binGeo._vf.coord.length > 0)
    {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", shape._nameSpace.getURL(binGeo._vf.coord), true);
        xmlhttp.responseType = "arraybuffer";

        shape._nameSpace.doc.downloadCount += 1;

        //xmlhttp.send(null);
        x3dom.RequestManager.addRequest( xmlhttp );

        xmlhttp.onload = function()
        {
            shape._nameSpace.doc.downloadCount -= 1;
            shape._webgl.internalDownloadCount -= 1;

            if (xmlhttp.status != 200) {
                x3dom.debug.logError( "XHR1/ interleaved array load failed with status: " + xmlhttp.status );
                return;
            }

            if (!shape._webgl)
                return;

            var XHR_buffer = binGeo._vf.compressed == true ? x3dom.Utils.gunzip(xmlhttp.response) : xmlhttp.response;

            var geoNode = binGeo;
            var attribTypeStr = geoNode._vf.coordType;

            // assume same data type for all attributes (but might be wrong)
            shape._webgl.coordType    = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);
            shape._webgl.normalType   = shape._webgl.coordType;
            shape._webgl.texCoordType = shape._webgl.coordType;
            shape._webgl.colorType    = shape._webgl.coordType;

            var attributes = x3dom.Utils.getArrayBufferView(attribTypeStr, XHR_buffer);

            // calculate number of single data packages by including stride and type size
            var dataLen = shape._coordStrideOffset[0] / x3dom.Utils.getDataTypeSize(attribTypeStr);
            if (dataLen)
                geoNode._mesh._numCoords = attributes.length / dataLen;

            if (geoNode._vf.index.length == 0) {
                for (var i=0; i<geoNode._vf.vertexCount.length; i++) {
                    if (shape._webgl.primType[i] == gl.TRIANGLE_STRIP)
                        geoNode._mesh._numFaces += geoNode._vf.vertexCount[i] - 2;
                    else
                        geoNode._mesh._numFaces += geoNode._vf.vertexCount[i] / 3;
                }
            }

            var buffer = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, attributes, gl.STATIC_DRAW);

            gl.vertexAttribPointer(sp.position, geoNode._mesh._numPosComponents,
                shape._webgl.coordType, false,
                shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
            gl.enableVertexAttribArray(sp.position);

            if (geoNode._vf.normal.length > 0)
            {
                shape._webgl.buffers[2] = buffer;

                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, attributes, gl.STATIC_DRAW);

                gl.vertexAttribPointer(sp.normal, geoNode._mesh._numNormComponents,
                    shape._webgl.normalType, false,
                    shape._normalStrideOffset[0], shape._normalStrideOffset[1]);
                gl.enableVertexAttribArray(sp.normal);
            }

            if (geoNode._vf.texCoord.length > 0)
            {
                shape._webgl.buffers[3] = buffer;

                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, attributes, gl.STATIC_DRAW);

                gl.vertexAttribPointer(sp.texcoord, geoNode._mesh._numTexComponents,
                    shape._webgl.texCoordType, false,
                    shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);
                gl.enableVertexAttribArray(sp.texcoord);
            }

            if (geoNode._vf.color.length > 0)
            {
                shape._webgl.buffers[4] = buffer;

                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, attributes, gl.STATIC_DRAW);

                gl.vertexAttribPointer(sp.color, geoNode._mesh._numColComponents,
                    shape._webgl.colorType, false,
                    shape._colorStrideOffset[0], shape._colorStrideOffset[1]);
                gl.enableVertexAttribArray(sp.color);
            }

            attributes = null;  // delete data block in CPU memory

            if (shape._webgl.internalDownloadCount == 0)
            {
                shape._nameSpace.doc.needRender = true;
            }

            that.checkError(gl);

            var t11 = new Date().getTime() - t00;
            x3dom.debug.logInfo("XHR/ interleaved array load time: " + t11 + " ms");

            shape._webgl.buffers[1] = buffer;

        };
    }

    // coord
    if (!binGeo._hasStrideOffset && binGeo._vf.coord.length > 0)
    {
        var xmlhttp1 = new XMLHttpRequest();
        xmlhttp1.open("GET", shape._nameSpace.getURL(binGeo._vf.coord), true);
        xmlhttp1.responseType = "arraybuffer";

        shape._nameSpace.doc.downloadCount += 1;

        //xmlhttp1.send(null);
        x3dom.RequestManager.addRequest( xmlhttp1 );

        xmlhttp1.onload = function()
        {
            shape._nameSpace.doc.downloadCount -= 1;
            shape._webgl.internalDownloadCount -= 1;

            if (xmlhttp1.status != 200) {
                x3dom.debug.logError( "XHR1/ coord load failed with status: " + xmlhttp1.status );
                return;
            }

            if (!shape._webgl)
                return;

            var XHR_buffer = binGeo._vf.compressed == true ? x3dom.Utils.gunzip(xmlhttp1.response) : xmlhttp1.response;

            var geoNode = binGeo;
            var i = 0;

            var attribTypeStr = geoNode._vf.coordType;
            shape._webgl.coordType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);

            var vertices = x3dom.Utils.getArrayBufferView(attribTypeStr, XHR_buffer);

            if (createTriangleSoup) {
                shape._webgl.makeSeparateTris.pushBuffer("coord", vertices);
                return;
            }

            gl.bindAttribLocation(sp.program, 0, "position");

            var positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            geoNode._mesh._numCoords = vertices.length / geoNode._mesh._numPosComponents;

            if (geoNode._vf.index.length == 0) {
                for (i=0; i<geoNode._vf.vertexCount.length; i++) {
                    if (shape._webgl.primType[i] == gl.TRIANGLE_STRIP)
                        geoNode._mesh._numFaces += geoNode._vf.vertexCount[i] - 2;
                    else
                        geoNode._mesh._numFaces += geoNode._vf.vertexCount[i] / 3;
                }
            }

            // Test reading Data
            //x3dom.debug.logWarning("arraybuffer[0].vx="+vertices[0]);

            if ((attribTypeStr == "Float32") &&
                (shape._vf.bboxSize.x < 0 || shape._vf.bboxSize.y < 0 || shape._vf.bboxSize.z < 0))
            {
                var min = new x3dom.fields.SFVec3f(vertices[0],vertices[1],vertices[2]);
                var max = new x3dom.fields.SFVec3f(vertices[0],vertices[1],vertices[2]);

                for (i=3; i<vertices.length; i+=3)
                {
                    if (min.x > vertices[i+0]) { min.x = vertices[i+0]; }
                    if (min.y > vertices[i+1]) { min.y = vertices[i+1]; }
                    if (min.z > vertices[i+2]) { min.z = vertices[i+2]; }

                    if (max.x < vertices[i+0]) { max.x = vertices[i+0]; }
                    if (max.y < vertices[i+1]) { max.y = vertices[i+1]; }
                    if (max.z < vertices[i+2]) { max.z = vertices[i+2]; }
                }

                // TODO; move to mesh for all cases?
                shape._vf.bboxCenter.setValues(min.add(max).multiply(0.5));
                shape._vf.bboxSize.setValues(max.subtract(min));
            }

            vertices = null;

            if (shape._webgl.internalDownloadCount == 0)
            {
                shape._nameSpace.doc.needRender = true;
            }

            that.checkError(gl);

            var t11 = new Date().getTime() - t00;
            x3dom.debug.logInfo("XHR1/ coord load time: " + t11 + " ms");

            shape._webgl.buffers[1] = positionBuffer;
        };
    }

    // normal
    if (!binGeo._hasStrideOffset && binGeo._vf.normal.length > 0)
    {
        var xmlhttp2 = new XMLHttpRequest();
        xmlhttp2.open("GET", shape._nameSpace.getURL(binGeo._vf.normal), true);
        xmlhttp2.responseType = "arraybuffer";

        shape._nameSpace.doc.downloadCount += 1;

        //xmlhttp2.send(null);
        x3dom.RequestManager.addRequest( xmlhttp2 );

        xmlhttp2.onload = function()
        {
            shape._nameSpace.doc.downloadCount -= 1;
            shape._webgl.internalDownloadCount -= 1;

            if (xmlhttp2.status != 200) {
                x3dom.debug.logError( "XHR2/ normal load failed with status: " + xmlhttp2.status );
                return;
            }

            if (!shape._webgl)
                return;

            var XHR_buffer = binGeo._vf.compressed == true ? x3dom.Utils.gunzip(xmlhttp2.response) : xmlhttp2.response;

            var attribTypeStr = binGeo._vf.normalType;
            shape._webgl.normalType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);

            var normals = x3dom.Utils.getArrayBufferView(attribTypeStr, XHR_buffer);

            if (createTriangleSoup) {
                shape._webgl.makeSeparateTris.pushBuffer("normal", normals);
                return;
            }

            var normalBuffer = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            // Test reading Data
            //x3dom.debug.logWarning("arraybuffer[0].nx="+normals[0]);

            normals = null;

            if (shape._webgl.internalDownloadCount == 0)
            {
                shape._nameSpace.doc.needRender = true;
            }

            that.checkError(gl);

            var t11 = new Date().getTime() - t00;
            x3dom.debug.logInfo("XHR2/ normal load time: " + t11 + " ms");

            shape._webgl.buffers[2] = normalBuffer;
        };
    }

    // texCoord
    if (!binGeo._hasStrideOffset && binGeo._vf.texCoord.length > 0)
    {
        var xmlhttp3 = new XMLHttpRequest();
        xmlhttp3.open("GET", shape._nameSpace.getURL(binGeo._vf.texCoord), true);
        xmlhttp3.responseType = "arraybuffer";

        shape._nameSpace.doc.downloadCount += 1;

        //xmlhttp3.send(null);
        x3dom.RequestManager.addRequest( xmlhttp3 );

        xmlhttp3.onload = function()
        {
            var i, j;
            var tmp;

            shape._nameSpace.doc.downloadCount -= 1;
            shape._webgl.internalDownloadCount -= 1;

            if (xmlhttp3.status != 200) {
                x3dom.debug.logError( "XHR3/ texcoord load failed with status: " + xmlhttp3.status );
                return;
            }

            if (!shape._webgl)
                return;

            var XHR_buffer = binGeo._vf.compressed == true ? x3dom.Utils.gunzip(xmlhttp3.response) : xmlhttp3.response;

            var attribTypeStr = binGeo._vf.texCoordType;
            shape._webgl.texCoordType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);

            var texCoords = x3dom.Utils.getArrayBufferView(attribTypeStr, XHR_buffer);

            if (createTriangleSoup) {
                shape._webgl.makeSeparateTris.pushBuffer("texCoord", texCoords);
                return;
            }


            //if IDs are given in texture coordinates, interpret texcoords as ID buffer
            if (binGeo._vf["idsPerVertex"])
            {
                var idBuffer = gl.createBuffer();

                gl.bindBuffer(gl.ARRAY_BUFFER, idBuffer);

                //Create a buffer for the ids with half size of the texccoord buffer
                var ids = x3dom.Utils.getArrayBufferView("Float32", texCoords.length/2);

                //swap x and y, in order to interpret tex coords as FLOAT later on
                for (i = 0, j= 0; i < texCoords.length; i+=2, j++)
                {
                    ids[j] = texCoords[i+1] * 65536 + texCoords[i];
                }

                gl.bufferData(gl.ARRAY_BUFFER, ids, gl.STATIC_DRAW);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);

                shape._webgl.buffers[5] = idBuffer;
            }
            else
            {
                var texcBuffer = gl.createBuffer();

                gl.bindBuffer(gl.ARRAY_BUFFER, texcBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);

                shape._webgl.buffers[3] = texcBuffer;
            }
            // Test reading Data
            //x3dom.debug.logWarning("arraybuffer[0].tx="+texCoords[0]);

            texCoords = null;

            if (shape._webgl.internalDownloadCount == 0)
            {
                shape._nameSpace.doc.needRender = true;
            }

            that.checkError(gl);

            var t11 = new Date().getTime() - t00;
            x3dom.debug.logInfo("XHR3/ texCoord load time: " + t11 + " ms");
        };
    }

    // color
    if (!binGeo._hasStrideOffset && binGeo._vf.color.length > 0)
    {
        var xmlhttp4 = new XMLHttpRequest();
        xmlhttp4.open("GET", shape._nameSpace.getURL(binGeo._vf.color), true);
        xmlhttp4.responseType = "arraybuffer";

        shape._nameSpace.doc.downloadCount += 1;

        //xmlhttp4.send(null);
        x3dom.RequestManager.addRequest( xmlhttp4 );

        xmlhttp4.onload = function()
        {
            shape._nameSpace.doc.downloadCount -= 1;
            shape._webgl.internalDownloadCount -= 1;

            if (xmlhttp4.status != 200) {
                x3dom.debug.logError( "XHR4/ color load failed with status: " + xmlhttp4.status );
                return;
            }

            if (!shape._webgl)
                return;

            var XHR_buffer = binGeo._vf.compressed == true ? x3dom.Utils.gunzip(xmlhttp4.response) : xmlhttp4.response;

            var attribTypeStr = binGeo._vf.colorType;
            shape._webgl.colorType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);

            var colors = x3dom.Utils.getArrayBufferView(attribTypeStr, XHR_buffer);

            if (createTriangleSoup) {
                shape._webgl.makeSeparateTris.pushBuffer("color", colors);
                return;
            }

            var colorBuffer = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            // Test reading Data
            //x3dom.debug.logWarning("arraybuffer[0].cx="+colors[0]);

            colors = null;

            if (shape._webgl.internalDownloadCount == 0)
            {
                shape._nameSpace.doc.needRender = true;
            }

            that.checkError(gl);

            var t11 = new Date().getTime() - t00;
            x3dom.debug.logInfo("XHR4/ color load time: " + t11 + " ms");

            shape._webgl.buffers[4] = colorBuffer;
        };
    }
    // TODO: tangent AND binormal
};

/** setup/download pop geometry */
x3dom.BinaryContainerLoader.setupPopGeo = function(shape, sp, gl, viewarea, currContext)
{
    if (this.outOfMemory) {
        return;
    }

    var popGeo = shape._cf.geometry.node;

    //reserve space for vertex buffer (and index buffer if any) on the gpu
    if (popGeo.hasIndex()) {
        shape._webgl.popGeometry = 1;

        shape._webgl.buffers[0] = gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape._webgl.buffers[0]);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, popGeo.getTotalNumberOfIndices()*2, gl.STATIC_DRAW);

        //this is a workaround to mimic gl_VertexID
        shape._webgl.buffers[5] = gl.createBuffer();

        var idBuffer = new Float32Array(popGeo._vf.vertexBufferSize);

        (function(){ for (var i = 0; i < idBuffer.length; ++i) idBuffer[i] = i; })();

        gl.bindBuffer(gl.ARRAY_BUFFER, shape._webgl.buffers[5]);
        gl.bufferData(gl.ARRAY_BUFFER, idBuffer, gl.STATIC_DRAW);
    }
    else {
        shape._webgl.popGeometry = -1;
    }

    shape._webgl.buffers[1] = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, shape._webgl.buffers[1]);
    gl.bufferData(gl.ARRAY_BUFFER, (popGeo._vf.attributeStride * popGeo._vf.vertexBufferSize), gl.STATIC_DRAW);


    //setup general render settings
    var attribTypeStr      = popGeo._vf.coordType;
    shape._webgl.coordType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);

    shape._coordStrideOffset[0] = popGeo.getAttributeStride();
    shape._coordStrideOffset[1] = popGeo.getPositionOffset();

    gl.vertexAttribPointer(sp.position, shape._cf.geometry.node._mesh._numPosComponents, shape._webgl.coordType,
                           false, shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
    gl.enableVertexAttribArray(sp.position);

    if (popGeo.hasNormal()) {
        attribTypeStr           = popGeo._vf.normalType;
        shape._webgl.normalType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);

        shape._normalStrideOffset[0] = popGeo.getAttributeStride();
        shape._normalStrideOffset[1] = popGeo.getNormalOffset();

        shape._webgl.buffers[2] = shape._webgl.buffers[1]; //use interleaved vertex data buffer

        gl.vertexAttribPointer(sp.normal, shape._cf.geometry.node._mesh._numNormComponents, shape._webgl.normalType,
                               false, shape._normalStrideOffset[0], shape._normalStrideOffset[1]);
        gl.enableVertexAttribArray(sp.normal);
    }
    if (popGeo.hasTexCoord()) {
        attribTypeStr             = popGeo._vf.texCoordType;
        shape._webgl.texCoordType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);

        shape._webgl.buffers[3] = shape._webgl.buffers[1]; //use interleaved vertex data buffer

        shape._texCoordStrideOffset[0] = popGeo.getAttributeStride();
        shape._texCoordStrideOffset[1] = popGeo.getTexCoordOffset();

        gl.vertexAttribPointer(sp.texcoord, shape._cf.geometry.node._mesh._numTexComponents, shape._webgl.texCoordType,
                               false, shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);
        gl.enableVertexAttribArray(sp.texcoord);
    }
    if (popGeo.hasColor()) {
        attribTypeStr          = popGeo._vf.colorType;
        shape._webgl.colorType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);

        shape._webgl.buffers[4] = shape._webgl.buffers[1]; //use interleaved vertex data buffer

        shape._colorStrideOffset[0] = popGeo.getAttributeStride();
        shape._colorStrideOffset[1] = popGeo.getColorOffset();

        gl.vertexAttribPointer(sp.color, shape._cf.geometry.node._mesh._numColComponents, shape._webgl.colorType,
                               false, shape._colorStrideOffset[0], shape._colorStrideOffset[1]);
        gl.enableVertexAttribArray(sp.color);
    }

    shape._webgl.currentNumIndices  = 0;
    shape._webgl.currentNumVertices = 0;
    shape._webgl.numVerticesAtLevel = [];
    shape._webgl.levelsAvailable    = 0;

    this.checkError(gl);

    shape._webgl.levelLoaded = [];
    (function() {
        for (var i = 0; i < popGeo.getNumLevels(); ++i)
            shape._webgl.levelLoaded.push(false);
    })();

    //download callback, used to simply upload received vertex data to the GPU
    var uploadDataToGPU = function(data, lvl) {
        //x3dom.debug.logInfo("PopGeometry: Received data for level " + lvl + " !\n");

        shape._webgl.levelLoaded[lvl] = true;
        shape._webgl.numVerticesAtLevel[lvl] = 0;

        if (data) {
            //perform gpu data upload
            var indexDataLengthInBytes = 0;
            var redrawNeeded = false;

            if (popGeo.hasIndex()) {
                indexDataLengthInBytes = popGeo.getNumIndicesByLevel(lvl)*2;

                if (indexDataLengthInBytes > 0) {
                    redrawNeeded = true;

                    var indexDataView = new Uint8Array(data, 0, indexDataLengthInBytes);

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape._webgl.buffers[0]);
                    //index data is always placed where it belongs, as we have to keep the order of rendering
                    (function() {
                        var indexDataOffset = 0;

                        for (var i = 0; i < lvl; ++i) { indexDataOffset += popGeo.getNumIndicesByLevel(i); }

                        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, indexDataOffset*2, indexDataView);
                    })();
                }
            }

            var vertexDataLengthInBytes = data.byteLength - indexDataLengthInBytes;

            if (vertexDataLengthInBytes > 0) {
                redrawNeeded = true;

                var attributeDataView = new Uint8Array(data, indexDataLengthInBytes, vertexDataLengthInBytes);

                gl.bindBuffer(gl.ARRAY_BUFFER, shape._webgl.buffers[1]);
                if (!popGeo.hasIndex()) {
                    //on non-indexed rendering, vertex data is just appended, the order of vertex data packages doesn't matter
                    gl.bufferSubData(gl.ARRAY_BUFFER, shape._webgl.currentNumVertices       * popGeo.getAttributeStride(),
                                     attributeDataView);
                }
                else {
                    //on indexed rendering, vertex data is always placed where it belongs, as we have to keep the indexed order
                    gl.bufferSubData(gl.ARRAY_BUFFER,popGeo.getVertexDataBufferOffset(lvl) * popGeo.getAttributeStride(),
                                     attributeDataView);
                }

                //adjust render settings: vertex data
                shape._webgl.numVerticesAtLevel[lvl] = vertexDataLengthInBytes / popGeo.getAttributeStride();
                shape._webgl.currentNumVertices += shape._webgl.numVerticesAtLevel[lvl];
            }

            //compute number of valid indices
            (function() {
                var numValidIndices = 0;

                for (var i = shape._webgl.levelsAvailable; i < popGeo.getNumLevels(); ++i) {
                    if (shape._webgl.levelLoaded[i] === false) {
                        break;
                    }
                    else {
                        numValidIndices += popGeo.getNumIndicesByLevel(i);
                        ++shape._webgl.levelsAvailable;
                    }
                }

                //adjust render settings: index data
                shape._webgl.currentNumIndices = numValidIndices;
            })();

            //here, we tell X3DOM how many faces / vertices get displayed in the stats
            popGeo._mesh._numCoords = shape._webgl.currentNumVertices;
            //@todo: this assumes pure TRIANGLES data
            popGeo._mesh._numFaces  = (popGeo.hasIndex() ? shape._webgl.currentNumIndices : shape._webgl.currentNumVertices) / 3;

            //here, we tell X3DOM how many vertices get rendered
            //@todo: this assumes pure TRIANGLES data
            popGeo.adaptVertexCount(popGeo.hasIndex() ? popGeo._mesh._numFaces * 3 : popGeo._mesh._numCoords);
            //x3dom.debug.logInfo("PopGeometry: Loaded level " + lvl + " data to gpu, model has now " +
            //    popGeo._mesh._numCoords + " vertices and " + popGeo._mesh._numFaces + " triangles, " +
            //    (new Date().getTime() - shape._webgl.downloadStartTimer) + " ms after posting download requests");

            //request redraw, if necessary
            if (redrawNeeded) {
                shape._nameSpace.doc.needRender = true;
            }
        }
    };

    //post XHRs
    var dataURLs = popGeo.getDataURLs();

    var downloadCallbacks = [];
    var priorities        = [];

    shape._webgl.downloadStartTimer = new Date().getTime();

    //CODE WITH DL MANAGER
    //use the DownloadManager to prioritize loading

    for (var i = 0; i < dataURLs.length; ++i) {
        shape._nameSpace.doc.downloadCount += 1;

        (function(idx) {
            downloadCallbacks.push(function(data) {
                shape._nameSpace.doc.downloadCount -= 1;
                return uploadDataToGPU(data, idx);
            });
        })(i);

        priorities.push(i);
    }

    x3dom.DownloadManager.get(dataURLs, downloadCallbacks, priorities);
    //END CODE WITH DL MANAGER
};

/** setup/download image geometry */
x3dom.BinaryContainerLoader.setupImgGeo = function(shape, sp, gl, viewarea, currContext)
{
    if (this.outOfMemory) {
        return;
    }

    var imageGeometry = shape._cf.geometry.node;

    if ( imageGeometry.getIndexTexture() ) {
        shape._webgl.imageGeometry = 1;
    } else {
        shape._webgl.imageGeometry = -1;
    }

    imageGeometry.unsetGeoDirty();

    if (currContext.IG_PositionBuffer == null) {
        currContext.IG_PositionBuffer = gl.createBuffer();
    }

    shape._webgl.buffers[1] = currContext.IG_PositionBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, currContext.IG_PositionBuffer);

    var vertices = new Float32Array(shape._webgl.positions[0]);

    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, currContext.IG_PositionBuffer);

    gl.vertexAttribPointer(sp.position, imageGeometry._mesh._numPosComponents,
        shape._webgl.coordType, false,
        shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
    gl.enableVertexAttribArray(sp.position);

    vertices = null;

    this.checkError(gl);
};
