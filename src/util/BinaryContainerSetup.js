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
x3dom.BinaryContainerLoader = {};


/** setup/download binary geometry */
x3dom.BinaryContainerLoader.setupBinGeo = function(shape, sp, gl, viewarea, currContext)
{
    var t00 = new Date().getTime();

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
                              ((binGeo._vf.indexType == "Uint32") &&
                               (binGeo._vf.index.length > 0));

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
                    x3dom.debug.logError("Triangle strips not yet supported for per-face normals.");
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

            x3dom.debug.logInfo("makeSeparateTris.createMesh called with coord length " + dataLen);

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

            // recreate shader
            delete shape._webgl.shader;
            shape._webgl.shader = currContext.cache.getDynamicShader(gl, viewarea, shape);
        }
    };

    // index
    if (binGeo._vf.index.length > 0)
    {
        var xmlhttp0 = new XMLHttpRequest();
        xmlhttp0.open("GET", encodeURI(shape._nameSpace.getURL(binGeo._vf.index)), true);
        xmlhttp0.responseType = "arraybuffer";

        shape._nameSpace.doc.downloadCount += 1;

        xmlhttp0.send(null);

        xmlhttp0.onload = function()
        {
            if (!shape._webgl)
                return;

            var XHR_buffer = xmlhttp0.response;

            var geoNode = binGeo;
            var attribTypeStr = geoNode._vf.indexType;  //"Uint16"

            var indexArray = x3dom.Utils.getArrayBufferView(attribTypeStr, XHR_buffer);

            if (createTriangleSoup) {
                shape._webgl.makeSeparateTris.pushBuffer("index", indexArray);
                return;
            }

            var indicesBuffer = gl.createBuffer();
            shape._webgl.buffers[0] = indicesBuffer;

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);

            // Test reading Data
            //x3dom.debug.logWarning("arraybuffer[0]="+indexArray[0]+"; n="+indexArray.length);

            shape._webgl.binaryGeometry = 1;    // indexed BG

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

            shape._nameSpace.doc.downloadCount -= 1;
            shape._webgl.internalDownloadCount -= 1;
            if (shape._webgl.internalDownloadCount == 0)
                shape._nameSpace.doc.needRender = true;

            var t11 = new Date().getTime() - t00;
            x3dom.debug.logInfo("XHR0/ index load time: " + t11 + " ms");
        };
    }

    // interleaved array -- assume all attributes are given in one single array buffer
    if (binGeo._hasStrideOffset && binGeo._vf.coord.length > 0)
    {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", encodeURI(shape._nameSpace.getURL(binGeo._vf.coord)), true);
        xmlhttp.responseType = "arraybuffer";

        shape._nameSpace.doc.downloadCount += 1;

        xmlhttp.send(null);

        xmlhttp.onload = function()
        {
            if (!shape._webgl)
                return;

            var XHR_buffer = xmlhttp.response;

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

            shape._webgl.buffers[1] = buffer;

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

            shape._nameSpace.doc.downloadCount -= 1;
            shape._webgl.internalDownloadCount -= 1;
            if (shape._webgl.internalDownloadCount == 0)
                shape._nameSpace.doc.needRender = true;

            var t11 = new Date().getTime() - t00;
            x3dom.debug.logInfo("XHR/ interleaved array load time: " + t11 + " ms");
        };
    }

    // coord
    if (!binGeo._hasStrideOffset && binGeo._vf.coord.length > 0)
    {
        var xmlhttp1 = new XMLHttpRequest();
        xmlhttp1.open("GET", encodeURI(shape._nameSpace.getURL(binGeo._vf.coord)), true);
        xmlhttp1.responseType = "arraybuffer";

        shape._nameSpace.doc.downloadCount += 1;

        xmlhttp1.send(null);

        xmlhttp1.onload = function()
        {
            if (!shape._webgl)
                return;

            var XHR_buffer = xmlhttp1.response;

            var geoNode = binGeo;
            var i = 0;

            var attribTypeStr = geoNode._vf.coordType;
            shape._webgl.coordType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);

            var vertices = x3dom.Utils.getArrayBufferView(attribTypeStr, XHR_buffer);

            if (createTriangleSoup) {
                shape._webgl.makeSeparateTris.pushBuffer("coord", vertices);
                return;
            }

            var positionBuffer = gl.createBuffer();
            shape._webgl.buffers[1] = positionBuffer;
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

            gl.vertexAttribPointer(sp.position,
                geoNode._mesh._numPosComponents,
                shape._webgl.coordType, false,
                shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
            gl.enableVertexAttribArray(sp.position);

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

            shape._nameSpace.doc.downloadCount -= 1;
            shape._webgl.internalDownloadCount -= 1;
            if (shape._webgl.internalDownloadCount == 0)
                shape._nameSpace.doc.needRender = true;

            var t11 = new Date().getTime() - t00;
            x3dom.debug.logInfo("XHR1/ coord load time: " + t11 + " ms");
        };
    }

    // normal
    if (!binGeo._hasStrideOffset && binGeo._vf.normal.length > 0)
    {
        var xmlhttp2 = new XMLHttpRequest();
        xmlhttp2.open("GET", encodeURI(shape._nameSpace.getURL(binGeo._vf.normal)), true);
        xmlhttp2.responseType = "arraybuffer";

        shape._nameSpace.doc.downloadCount += 1;

        xmlhttp2.send(null);

        xmlhttp2.onload = function()
        {
            if (!shape._webgl)
                return;

            var XHR_buffer = xmlhttp2.response;

            var attribTypeStr = binGeo._vf.normalType;
            shape._webgl.normalType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);

            var normals = x3dom.Utils.getArrayBufferView(attribTypeStr, XHR_buffer);

            if (createTriangleSoup) {
                shape._webgl.makeSeparateTris.pushBuffer("normal", normals);
                return;
            }

            var normalBuffer = gl.createBuffer();
            shape._webgl.buffers[2] = normalBuffer;

            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

            gl.vertexAttribPointer(sp.normal,
                binGeo._mesh._numNormComponents,
                shape._webgl.normalType, false,
                shape._normalStrideOffset[0], shape._normalStrideOffset[1]);
            gl.enableVertexAttribArray(sp.normal);

            // Test reading Data
            //x3dom.debug.logWarning("arraybuffer[0].nx="+normals[0]);

            normals = null;

            shape._nameSpace.doc.downloadCount -= 1;
            shape._webgl.internalDownloadCount -= 1;
            if (shape._webgl.internalDownloadCount == 0)
                shape._nameSpace.doc.needRender = true;

            var t11 = new Date().getTime() - t00;
            x3dom.debug.logInfo("XHR2/ normal load time: " + t11 + " ms");
        };
    }

    // texCoord
    if (!binGeo._hasStrideOffset && binGeo._vf.texCoord.length > 0)
    {
        var xmlhttp3 = new XMLHttpRequest();
        xmlhttp3.open("GET", encodeURI(shape._nameSpace.getURL(binGeo._vf.texCoord)), true);
        xmlhttp3.responseType = "arraybuffer";

        shape._nameSpace.doc.downloadCount += 1;

        xmlhttp3.send(null);

        xmlhttp3.onload = function()
        {
            if (!shape._webgl)
                return;

            var XHR_buffer = xmlhttp3.response;

            var attribTypeStr = binGeo._vf.texCoordType;
            shape._webgl.texCoordType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);

            var texCoords = x3dom.Utils.getArrayBufferView(attribTypeStr, XHR_buffer);

            if (createTriangleSoup) {
                shape._webgl.makeSeparateTris.pushBuffer("texCoord", texCoords);
                return;
            }

            var texcBuffer = gl.createBuffer();
            shape._webgl.buffers[3] = texcBuffer;

            gl.bindBuffer(gl.ARRAY_BUFFER, texcBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

            gl.vertexAttribPointer(sp.texcoord,
                binGeo._mesh._numTexComponents,
                shape._webgl.texCoordType, false,
                shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);
            gl.enableVertexAttribArray(sp.texcoord);

            // Test reading Data
            //x3dom.debug.logWarning("arraybuffer[0].tx="+texCoords[0]);

            texCoords = null;

            shape._nameSpace.doc.downloadCount -= 1;
            shape._webgl.internalDownloadCount -= 1;
            if (shape._webgl.internalDownloadCount == 0)
                shape._nameSpace.doc.needRender = true;

            var t11 = new Date().getTime() - t00;
            x3dom.debug.logInfo("XHR3/ texCoord load time: " + t11 + " ms");
        };
    }

    // color
    if (!binGeo._hasStrideOffset && binGeo._vf.color.length > 0)
    {
        var xmlhttp4 = new XMLHttpRequest();
        xmlhttp4.open("GET", encodeURI(shape._nameSpace.getURL(binGeo._vf.color)), true);
        xmlhttp4.responseType = "arraybuffer";

        shape._nameSpace.doc.downloadCount += 1;

        xmlhttp4.send(null);

        xmlhttp4.onload = function()
        {
            if (!shape._webgl)
                return;

            var XHR_buffer = xmlhttp4.response;

            var attribTypeStr = binGeo._vf.colorType;
            shape._webgl.colorType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);

            var colors = x3dom.Utils.getArrayBufferView(attribTypeStr, XHR_buffer);

            if (createTriangleSoup) {
                shape._webgl.makeSeparateTris.pushBuffer("color", colors);
                return;
            }

            var colorBuffer = gl.createBuffer();
            shape._webgl.buffers[4] = colorBuffer;

            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

            gl.vertexAttribPointer(sp.color,
                binGeo._mesh._numColComponents,
                shape._webgl.colorType, false,
                shape._colorStrideOffset[0], shape._colorStrideOffset[1]);
            gl.enableVertexAttribArray(sp.color);

            // Test reading Data
            //x3dom.debug.logWarning("arraybuffer[0].cx="+colors[0]);

            colors = null;

            shape._nameSpace.doc.downloadCount -= 1;
            shape._webgl.internalDownloadCount -= 1;
            if (shape._webgl.internalDownloadCount == 0)
                shape._nameSpace.doc.needRender = true;

            var t11 = new Date().getTime() - t00;
            x3dom.debug.logInfo("XHR4/ color load time: " + t11 + " ms");
        };
    }
    // TODO: tangent AND binormal
};


/** setup/download pop geometry */
x3dom.BinaryContainerLoader.setupPopGeo = function(shape, sp, gl, viewarea, currContext)
{
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

/** setup/download bit-lod geometry */
x3dom.BinaryContainerLoader.setupBitLODGeo = function(shape, sp, gl, viewarea, currContext)
{
    shape._webgl.bitLODGeometry = -1;

    var bitLODGeometry = shape._cf.geometry.node;

    //Get number of components
    var numComponents = bitLODGeometry.getNumComponents();

    //Check if components available
    if(numComponents)
    {
        //Check if there are indices available
        if(bitLODGeometry.hasIndex())
        {
            //this function generates a single, large triangle buffer out of
            //  - an index buffer containing indices of TRIANGLES / TRIANGLE STRIPS
            //  - a set of data buffers containing the triangle data
            shape._webgl.generateTriangleBuffer = function() {
                if ( typeof shape._webgl.dataBuffers[0] != 'undefined' &&
                    (typeof shape._webgl.dataBuffers[1] != 'undefined' || //positions & normals
                     typeof shape._webgl.dataBuffers[3] != 'undefined' || //texcoords
                     typeof shape._webgl.dataBuffers[4] != 'undefined'    //colors
                    ))
                {
                    var indexArray = shape._webgl.dataBuffers[0];

                    var read_idx_pos_nor;
                    var read_idx_tc;
                    var read_idx_col;
                    var write_idx;
                    var i;

                    var n_theta   = 0;
                    var n_phi     = 0;
                    var accum_cnt = 0;
                    var points    = [new x3dom.fields.SFVec3f(0, 0, 0),
                        new x3dom.fields.SFVec3f(0, 0, 0),
                        new x3dom.fields.SFVec3f(0, 0, 0)];
                    var nor = new x3dom.fields.SFVec3f(0, 0, 0);
                    var v1  = new x3dom.fields.SFVec3f(0, 0, 0);
                    var v2  = new x3dom.fields.SFVec3f(0, 0, 0);

                    var coordsNormalsAvailable = (typeof shape._webgl.dataBuffers[1] != 'undefined' &&
                                                         shape._webgl.dataBuffers[1].length > 0);
                    var texCoordsAvailable     = (typeof shape._webgl.dataBuffers[3] != 'undefined' &&
                                                         shape._webgl.dataBuffers[3].length > 0);
                    var colorsAvailable        = (typeof shape._webgl.dataBuffers[4] != 'undefined' &&
                                                         shape._webgl.dataBuffers[4].length > 0);

                    var posNorEntriesPerElement = (shape._cf.geometry.node._mesh._numNormComponents == 2 ? 6 : 8);
                    var stride = posNorEntriesPerElement + (bitLODGeometry.hasTexCoord() ? 2 : 0) +
                                                           (bitLODGeometry.hasColor() ? 4 : 0);

                    if (typeof shape._webgl.triangleBuffer == 'undefined') {
                        //6 to 12 entries per element:
                        //px py pz + 0 + nt np [+ s t] [+ r g b + 0]
                        //px py pz + 0 + nx ny nz + 0 + [+ s t] [+ r g b + 0]
                        shape._webgl.triangleBuffer = new Uint16Array(indexArray.length * stride);
                    }

                    for (i = 0; i < indexArray.length; ++i) {
                        write_idx = i * stride;

                        if (coordsNormalsAvailable) {
                            read_idx_pos_nor = indexArray[i] * 6;

                            //write coords
                            shape._webgl.triangleBuffer[write_idx    ] = shape._webgl.dataBuffers[1][read_idx_pos_nor    ];
                            shape._webgl.triangleBuffer[write_idx + 1] = shape._webgl.dataBuffers[1][read_idx_pos_nor + 1];
                            shape._webgl.triangleBuffer[write_idx + 2] = shape._webgl.dataBuffers[1][read_idx_pos_nor + 2];
                            shape._webgl.triangleBuffer[write_idx + 3] = 0;

                            //write normals
                            //A: use transmitted per-vertex-normals
                            if (bitLODGeometry._vf.normalPerVertex) {
                                shape._webgl.triangleBuffer[write_idx + 4] = shape._webgl.dataBuffers[1][read_idx_pos_nor + 4];
                                shape._webgl.triangleBuffer[write_idx + 5] = shape._webgl.dataBuffers[1][read_idx_pos_nor + 5];
                            }
                            else if (shape._webgl.loadedLevels === 8) {
                                //B: on-the-fly normal computation for per-face normals (by cross product)
                                points[accum_cnt].x = shape._webgl.dataBuffers[1][read_idx_pos_nor    ];
                                points[accum_cnt].y = shape._webgl.dataBuffers[1][read_idx_pos_nor + 1];
                                points[accum_cnt].z = shape._webgl.dataBuffers[1][read_idx_pos_nor + 2];

                                if (++accum_cnt === 3) {
                                    v1 = points[1].subtract(points[0]);
                                    v2 = points[2].subtract(points[0]);

                                    nor = v1.cross(v2);
                                    nor = nor.normalize();

                                    //map to positive integers
                                    nor = nor.add(new x3dom.fields.SFVec3f(1.0, 1.0, 1.0));
                                    nor = nor.multiply(0.5);
                                    nor = nor.multiply(shape._cf.geometry.node.getPrecisionMax('normalType'));

                                    shape._webgl.triangleBuffer[write_idx + 4 - stride*2] = nor.x.toFixed(0);
                                    shape._webgl.triangleBuffer[write_idx + 5 - stride*2] = nor.y.toFixed(0);
                                    shape._webgl.triangleBuffer[write_idx + 6 - stride*2] = nor.z.toFixed(0);

                                    shape._webgl.triangleBuffer[write_idx + 4 - stride  ] = nor.x.toFixed(0);
                                    shape._webgl.triangleBuffer[write_idx + 5 - stride  ] = nor.y.toFixed(0);
                                    shape._webgl.triangleBuffer[write_idx + 6 - stride  ] = nor.z.toFixed(0);

                                    shape._webgl.triangleBuffer[write_idx + 4           ] = nor.x.toFixed(0);
                                    shape._webgl.triangleBuffer[write_idx + 5           ] = nor.y.toFixed(0);
                                    shape._webgl.triangleBuffer[write_idx + 6           ] = nor.z.toFixed(0);

                                    accum_cnt = 0;
                                }
                            }
                        }

                        write_idx += posNorEntriesPerElement;

                        if (texCoordsAvailable) {
                            read_idx_tc = indexArray[i] * 2;

                            //write texcoords
                            shape._webgl.triangleBuffer[write_idx    ] = shape._webgl.dataBuffers[3][read_idx_tc    ];
                            shape._webgl.triangleBuffer[write_idx + 1] = shape._webgl.dataBuffers[3][read_idx_tc + 1];

                            write_idx += 2;
                        }

                        if (colorsAvailable) {
                            read_idx_col = indexArray[i] * 4;

                            //write colors
                            shape._webgl.triangleBuffer[write_idx    ] = shape._webgl.dataBuffers[4][read_idx_col    ];
                            shape._webgl.triangleBuffer[write_idx + 1] = shape._webgl.dataBuffers[4][read_idx_col + 1];
                            shape._webgl.triangleBuffer[write_idx + 2] = shape._webgl.dataBuffers[4][read_idx_col + 2];
                            shape._webgl.triangleBuffer[write_idx + 3] = 0;

                            write_idx += 4;
                        }
                    }

                    //upload triangle buffer to the gpu and configure attributes
                    var glBuf = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, glBuf);
                    gl.bufferData(gl.ARRAY_BUFFER, shape._webgl.triangleBuffer, gl.STATIC_DRAW);

                    var attribTypeStr 		= bitLODGeometry._vf.coordType;
                    shape._webgl.coordType  = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);
                    shape._webgl.normalType = shape._webgl.coordType;

                    shape._coordStrideOffset[0]  = shape._normalStrideOffset[0] = stride*2;
                    shape._coordStrideOffset[1]  = 0;
                    shape._normalStrideOffset[1] = 8; //4*2

                    shape._webgl.buffers[1] = glBuf;
                    shape._webgl.buffers[2] = glBuf;
                                      
                    gl.vertexAttribPointer(sp.position, shape._cf.geometry.node._mesh._numPosComponents,
                        shape._webgl.coordType, false, shape._coordStrideOffset[0],
                        shape._coordStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.position);

                    gl.vertexAttribPointer(sp.normal, shape._cf.geometry.node._mesh._numNormComponents,
                        shape._webgl.normalType, false, shape._coordStrideOffset[0],
                        shape._coordStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.normal);

                    if (bitLODGeometry.hasTexCoord()) {
                        shape._webgl.texCoordType = shape._webgl.coordType;
                        shape._webgl.buffers[3] = glBuf;

                        shape._texCoordStrideOffset[0] = stride*2;
                        shape._texCoordStrideOffset[1] = posNorEntriesPerElement*2;

                        gl.vertexAttribPointer(sp.texcoord, shape._cf.geometry.node._mesh._numTexComponents,
                            shape._webgl.texCoordType, false, shape._texCoordStrideOffset[0],
                            shape._texCoordStrideOffset[1]);
                        gl.enableVertexAttribArray(sp.texcoord);
                    }

                    if (bitLODGeometry.hasColor()) {
                        shape._webgl.colorType  = shape._webgl.coordType;
                        shape._webgl.buffers[4] = glBuf;

                        shape._colorStrideOffset[0] = stride*2;
                        shape._colorStrideOffset[1] = bitLODGeometry.hasTexCoord() ? (posNorEntriesPerElement + 2) * 2 :
                                                                                      posNorEntriesPerElement * 2;

                        gl.vertexAttribPointer(sp.color, shape._cf.geometry.node._mesh._numColComponents,
                            shape._webgl.colorType, false, shape._colorStrideOffset[0],
                            shape._colorStrideOffset[1]);
                        gl.enableVertexAttribArray(sp.color);
                    }
                }
            };

            shape._webgl.bitLODGeometry = 1;    // indexed BLG
            var xmlhttpLOD = new XMLHttpRequest();
            xmlhttpLOD.open("GET", encodeURI(shape._nameSpace.getURL(bitLODGeometry._vf.index)), true);
            xmlhttpLOD.responseType = "arraybuffer";

            shape._nameSpace.doc.downloadCount += 1;

            xmlhttpLOD.send(null);

            xmlhttpLOD.onload = function()
            {
                var XHR_buffer = xmlhttpLOD.response;

                var indexArray;

                if (bitLODGeometry.usesClientSideNormals() && bitLODGeometry.usesVLCIndices()) {
                    
                    //variable-length decoding, indexed triangle strips are converted to indexed triangles
                    (function(){
                        if (typeof shape._webgl.dataBuffers == 'undefined')
                            shape._webgl.dataBuffers = [];

                        shape._webgl.dataBuffers[0] = [];

                        var codes = x3dom.Utils.getArrayBufferView("Uint8", XHR_buffer);
                        var i = 0;
                        var b;
                        var delta;
                        var magic_number;
                        var value = 0;

                        var vertexIdx = 0;
                        var primIdx   = 0;
                        var lastVal   = -1, preLastVal = -1;

                        while (i < codes.length) {
                            if (vertexIdx >= shape._cf.geometry.node._vf.vertexCount[primIdx]) {
                                ++primIdx;
                                vertexIdx = 0;
                            }

                            b = codes[i++];

                            delta        = 0;
                            magic_number = 128;

                            //read bytes while the marker bit (first one) is set
                            while (b >= 128) {
                                delta |= b - 128;
                                delta <<= 7;

                                magic_number <<= 7;

                                b = codes[i++];
                            }

                            delta |= b;

                            magic_number /= 2;
                            delta -= magic_number;

                            value = value + delta;

                            if (shape._webgl.primType[primIdx] == gl.TRIANGLE_STRIP) {
                                if (vertexIdx < 3) {
                                    shape._webgl.dataBuffers[0].push(value);
                                }
                                else if ((vertexIdx % 2) == 0) {
                                    shape._webgl.dataBuffers[0].push(preLastVal);
                                    shape._webgl.dataBuffers[0].push(lastVal);
                                    shape._webgl.dataBuffers[0].push(value);
                                }
                                else {
                                    shape._webgl.dataBuffers[0].push(lastVal);
                                    shape._webgl.dataBuffers[0].push(preLastVal);
                                    shape._webgl.dataBuffers[0].push(value);
                                }

                                preLastVal = lastVal;
                                lastVal    = value;
                            }
                            else {
                                shape._webgl.dataBuffers[0].push(value);
                            }

                            ++vertexIdx;
                        }
                    }());

                    //switch to non-indexed rendering
                    shape._webgl.bitLODGeometry = -1;

                    //create triangle render buffer with normals computed on-the-fly
                    //(if data is already available ...)
                    shape._webgl.generateTriangleBuffer();

                    bitLODGeometry._mesh._numFaces  = shape._webgl.dataBuffers[0].length / 3;
                    bitLODGeometry._mesh._numCoords = shape._webgl.dataBuffers[0].length;
                }
                else
                {   
                    var indicesBuffer = gl.createBuffer();
                    shape._webgl.buffers[0] = indicesBuffer;
                    
                    if (bitLODGeometry.usesVLCIndices())
                    {
                        var decodedIndices = [];

                        (function(){
                            var codes = x3dom.Utils.getArrayBufferView("Uint8", XHR_buffer);
                            var i = 0;
                            var b;
                            var delta;
                            var magic_number;
                            var value = 0;

                            var vertexIdx = 0;
                            var primIdx   = 0;
                            var lastVal   = -1, preLastVal = -1;

                            while (i < codes.length) {
                                if (vertexIdx >= shape._cf.geometry.node._vf.vertexCount[primIdx]) {
                                    ++primIdx;
                                    vertexIdx = 0;
                                }

                                b = codes[i++];

                                delta        = 0;
                                magic_number = 128;

                                //read bytes while the marker bit (first one) is set
                                while (b >= 128) {
                                    delta |= b - 128;
                                    delta <<= 7;

                                    magic_number <<= 7;

                                    b = codes[i++];
                                }

                                delta |= b;

                                magic_number /= 2;
                                delta -= magic_number;

                                value = value + delta;

                                decodedIndices.push(value);

                                ++vertexIdx;
                            }
                        }());

                        indexArray = new Uint16Array(decodedIndices);
                    }
                    else
                    {
                        indexArray = x3dom.Utils.getArrayBufferView("Uint16", XHR_buffer);
                    }

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);

                    if (bitLODGeometry.getVertexCount(0) == 0)
                        bitLODGeometry.setVertexCount(0, indexArray.length);

                    bitLODGeometry._mesh._numFaces = 0;

                    for (var p=0; p<bitLODGeometry.getNumPrimTypes(); p++) {
                        if (shape._webgl.primType[p] == gl.TRIANGLE_STRIP)
                            bitLODGeometry._mesh._numFaces += bitLODGeometry.getVertexCount(p) - 2;
                        else
                            bitLODGeometry._mesh._numFaces += bitLODGeometry.getVertexCount(p) / 3;
                    }
                }

                indexArray = null;

                shape._nameSpace.doc.downloadCount -= 1;
                shape._nameSpace.doc.needRender = true;
            };
        }

        function callBack(attributeId, bufferView)
        {
            if (typeof shape._webgl.loadedLevels == 'undefined') {
                shape._webgl.loadedLevels   = 0;
                bitLODGeometry.loadedLevels = 0;
            }

            shape._webgl.loadedLevels++;
            bitLODGeometry.loadedLevels++;

            if (bitLODGeometry.hasIndex() && bitLODGeometry.usesClientSideNormals()) {
                if (typeof shape._webgl.dataBuffers == 'undefined')
                    shape._webgl.dataBuffers = [];

                if (attributeId === 0) {
                    shape._webgl.dataBuffers[1] = bufferView;
                }
                else if (attributeId === 1) {
                    shape._webgl.dataBuffers[3] = bufferView;
                }
                else if (attributeId === 2) {
                    shape._webgl.dataBuffers[4] = bufferView;
                }

                shape._webgl.generateTriangleBuffer();
            }
            else
            {
                var buffer = gl.createBuffer();

                if (attributeId === 0) {
                    var attribTypeStr 		= bitLODGeometry._vf.coordType;

                    shape._webgl.coordType  = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);
                    shape._webgl.normalType = shape._webgl.coordType;

                    // calculate number of single data packages by including stride and type size
                    var dataLen = shape._coordStrideOffset[0] / x3dom.Utils.getDataTypeSize(attribTypeStr);
                    //@todo: we need numCoords before this callback is invoked
                    if (dataLen && bitLODGeometry._vf.normalPerVertex)
                        bitLODGeometry._mesh._numCoords = bufferView.length / dataLen;

                    //Positions
                    shape._webgl.buffers[1] = buffer;

                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, bufferView, gl.STATIC_DRAW);

                    gl.vertexAttribPointer(sp.position, shape._cf.geometry.node._mesh._numPosComponents,
                        shape._webgl.coordType, false,
                        shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.position);

                    //Normals
                    shape._webgl.buffers[2] = buffer;

                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, bufferView, gl.STATIC_DRAW);

                    gl.vertexAttribPointer(sp.normal, shape._cf.geometry.node._mesh._numNormComponents,
                        shape._webgl.normalType, false,
                        shape._normalStrideOffset[0], shape._normalStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.normal);
                }
                else if (attributeId === 1)
                {
                    shape._webgl.texCoordType = shape._webgl.coordType;
                    shape._webgl.buffers[3] = buffer;

                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, bufferView, gl.STATIC_DRAW);

                    gl.vertexAttribPointer(sp.texcoord, shape._cf.geometry.node._mesh._numTexComponents,
                        shape._webgl.texCoordType, false,
                        shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.texcoord);
                }
                else if (attributeId === 2)
                {
                    shape._webgl.colorType = shape._webgl.coordType;
                    shape._webgl.buffers[4] = buffer;

                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, bufferView, gl.STATIC_DRAW);

                    gl.vertexAttribPointer(sp.color, shape._cf.geometry.node._mesh._numColComponents,
                        shape._webgl.colorType, false,
                        shape._colorStrideOffset[0], shape._colorStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.color);
                }

                bufferView = null;
            }

            //shape._nameSpace.doc.downloadCount -= 1;
            shape._nameSpace.doc.needRender = true;

            shape._webgl.refinementJobManager.continueProcessing(attributeId);
        }

        //If there is still no BitComposer create a new one
        //shape._webgl.bitLODComposer = new x3dom.BitLODComposer();
        shape._webgl.refinementJobManager = new x3dom.RefinementJobManager();

        //allocate buffers, pass them to the refinement manager
        //@todo: method returns number of index entries - at the moment, we have no mechanism to get the
        //       real number of vertices here, so we usually allocate too much memory
        var numVerts = bitLODGeometry.getNumVertices();

        var buf = new ArrayBuffer(12 * numVerts);
        var interleavedCoordNormalBuffer = new Uint16Array(buf);

        shape._webgl.refinementJobManager.addResultBuffer(0, interleavedCoordNormalBuffer);

        for (var i = 0; i < bitLODGeometry.getCoordNormalURLs().length; ++i) {
            shape._webgl.refinementJobManager.addRefinementJob(
                0,                                     //attributeId / resultBufferId
                i,                                     //download priority
                bitLODGeometry.getCoordNormalURLs()[i],//data file url
                i,                                     //refinement level (-> important for bit shift)
                callBack,                              //'job finished'-callback
                96,                                    //stride in bits (size of a single result element)
                [3, 2],                                //number of components information array
                [6, 2],                                //bits per refinement level information array
                [0, 6],                                //read offset (bits) information array
                [0, 64]);                              //write offset (bits) information array
        }

        if(bitLODGeometry.hasTexCoord()) {
            var tBuf = new ArrayBuffer(4 * numVerts);
            var texCoordBuffer = new Uint16Array(tBuf);

            shape._webgl.refinementJobManager.addResultBuffer(1, texCoordBuffer);

            for (i = 0; i < bitLODGeometry.getTexCoordURLs().length; ++i) {
                shape._webgl.refinementJobManager.addRefinementJob(
                    1,                           		//attributeId / resultBufferId
                    i,                           		//download priority
                    bitLODGeometry.getTexCoordURLs()[i], //data file url
                    i,                           		//refinement level (-> important for bit shift)
                    callBack,  							//'job finished'-callback
                    32,                          		//stride in bits (size of a single result element)
                    [2],                         		//number of components information array
                    [8],                         		//bits per refinement level information array
                    [0],                         		//read offset (bits) information array
                    [0]);                        		//write offset (bits) information array
            }
        }

        if(bitLODGeometry.hasColor()) {
            var cBuf = new ArrayBuffer(6 * numVerts);
            var colorBuffer = new Uint16Array(cBuf);

            shape._webgl.refinementJobManager.addResultBuffer(2, colorBuffer);

            for (i = 0; i < bitLODGeometry.getColorURLs().length; ++i) {
                shape._webgl.refinementJobManager.addRefinementJob(
                    2,                           		//attributeId / resultBufferId
                    i,                           		//download priority
                    bitLODGeometry.getColorURLs()[i],	//data file url
                    i,                           		//refinement level (-> important for bit shift)
                    callBack,  							//'job finished'-callback
                    48,                          		//stride in bits (size of a single result element)
                    [3],                         		//number of components information array
                    [6],                         		//bits per refinement level information array
                    [0],                         		//read offset (bits) information array
                    [0]);                        		//write offset (bits) information array
            }
        }
    }
};

/** setup/download image geometry */
x3dom.BinaryContainerLoader.setupImgGeo = function(shape, sp, gl, viewarea, currContext)
{
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
};
