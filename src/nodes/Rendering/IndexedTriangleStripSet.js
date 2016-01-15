/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### IndexedTriangleStripSet ### */
x3dom.registerNodeType(
    "IndexedTriangleStripSet",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DComposedGeometryNode,
        
        /**
         * Constructor for IndexedTriangleStripSet
         * @constructs x3dom.nodeTypes.IndexedTriangleStripSet
         * @x3d 3.3
         * @component Rendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DComposedGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc IndexedTriangleStripSet is a geometry node that can contain a Color, Coordinate, Normal and TextureCoordinate node.
         * Hint: insert a Shape node before adding geometry or Appearance. You can also substitute a type-matched ProtoInstance for content.
         */
        function (ctx) {
            x3dom.nodeTypes.IndexedTriangleStripSet.superClass.call(this, ctx);


            /**
             * Index specifies triangles by connecting Coordinate vertices.
             * @var {x3dom.fields.MFInt32} index
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.IndexedTriangleStripSet
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFInt32(ctx, 'index', []);

            this._hasIndexOffset = false;
            this._indexOffset = null;
        
        },
        {
            hasIndexOffset: function() {
                return this._hasIndexOffset;
            },

            nodeChanged: function()
            {
                this.handleAttribs();   // check if method is still functional

                var hasNormal = false, hasTexCoord = false, hasColor = false;

                var colPerVert = this._vf.colorPerVertex;
                var normPerVert = this._vf.normalPerVertex;

                var indexes = this._vf.index;
                //Last index value should be -1.
                if (indexes.length && indexes[indexes.length-1] != -1)
                {
                    indexes.push(-1);
                }
                var positions, normals, texCoords, colors;

                var coordNode = this._cf.coord.node;
                x3dom.debug.assert(coordNode);
                positions = coordNode._vf.point;

                var normalNode = this._cf.normal.node;
                if (normalNode) {
                    hasNormal = true;
                    normals = normalNode._vf.vector;
                }
                else {
                    hasNormal = false;
                }

                var texMode = "", numTexComponents = 2;
                var texCoordNode = this._cf.texCoord.node;
                if (x3dom.isa(texCoordNode, x3dom.nodeTypes.MultiTextureCoordinate)) {
                    if (texCoordNode._cf.texCoord.nodes.length)
                        texCoordNode = texCoordNode._cf.texCoord.nodes[0];
                }
                if (texCoordNode) {
                    if (texCoordNode._vf.point) {
                        hasTexCoord = true;
                        texCoords = texCoordNode._vf.point;

                        if (x3dom.isa(texCoordNode, x3dom.nodeTypes.TextureCoordinate3D)) {
                            numTexComponents = 3;
                        }
                    }
                    else if (texCoordNode._vf.mode) {
                        texMode = texCoordNode._vf.mode;
                    }
                }
                else {
                    hasTexCoord = false;
                }
                this._mesh._numTexComponents = numTexComponents;

                var numColComponents = 3;
                var colorNode = this._cf.color.node;
                if (colorNode) {
                    hasColor = true;
                    colors = colorNode._vf.color;

                    if (x3dom.isa(colorNode, x3dom.nodeTypes.ColorRGBA)) {
                        numColComponents = 4;
                    }
                }
                else {
                    hasColor = false;
                }
                this._mesh._numColComponents = numColComponents;

                this._mesh._indices[0] = [];
                this._mesh._positions[0] = [];
                this._mesh._normals[0] = [];
                this._mesh._texCoords[0] = [];
                this._mesh._colors[0] = [];

                this.invalidateVolume();
                this._mesh._numFaces = 0;
                this._mesh._numCoords = 0;

                var faceCnt = 0, cnt = 0;

                if (hasNormal && positions.length <= x3dom.Utils.maxIndexableCoords)
                {
                    this._hasIndexOffset = true;
                    this._indexOffset = [];
                    this._mesh._primType = 'TRIANGLESTRIP';

                    var indexOffset = [ 0 ];

                    for (i=0; i<indexes.length; i++)
                    {
                        if (indexes[i] == -1) {
                            faceCnt++;
                            indexOffset.push(this._mesh._indices[0].length);
                        }
                        else {
                            this._mesh._indices[0].push(+indexes[i]);

                            if(!normPerVert) {
                                this._mesh._normals[0].push(normals[faceCnt].x);
                                this._mesh._normals[0].push(normals[faceCnt].y);
                                this._mesh._normals[0].push(normals[faceCnt].z);
                            }
                            if(!colPerVert) {
                                this._mesh._colors[0].push(colors[faceCnt].r);
                                this._mesh._colors[0].push(colors[faceCnt].g);
                                this._mesh._colors[0].push(colors[faceCnt].b);
                                if (numColComponents === 4) {
                                    this._mesh._colors[0].push(colors[faceCnt].a);
                                }
                            }
                        }
                    }

                    this._mesh._positions[0] = positions.toGL();

                    if(normPerVert) {
                        this._mesh._normals[0] = normals.toGL();
                    }

                    if (hasTexCoord) {
                        this._mesh._texCoords[0] = texCoords.toGL();
                        this._mesh._numTexComponents = numTexComponents;
                    }
                    else {
                        x3dom.debug.logWarning("IndexedTriangleStripSet: no texCoords given and won't calculate!");
                    }

                    if (hasColor) {
                        if(colPerVert) {
                            this._mesh._colors[0] = colors.toGL();
                        }
                        this._mesh._numColComponents = numColComponents;
                    }

                    for (i=1; i<indexOffset.length; i++) {
                        var triCnt = indexOffset[i] - indexOffset[i-1];
                        this._indexOffset.push( {
                            count: triCnt,
                            offset: 2 * indexOffset[i-1]
                        } );

                        this._mesh._numFaces += (triCnt - 2);
                    }
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;
                }
                else
                {
                    this._hasIndexOffset = false;

                    var p1, p2 , p3, n1, n2, n3, t1, t2, t3, c1, c2, c3;

                    var swapOrder = false;

                    for (var i=1; i < indexes.length-2; ++i)
                    {
                        if (indexes[i+1] == -1) {
                            i = i+2;
                            faceCnt++;
                            continue;
                        }

                        // care for counterclockwise point order
                        if (swapOrder) {
                            p1 = indexes[i];
                            p2 = indexes[i-1];
                            p3 = indexes[i+1];
                        }
                        else {
                            p1 = indexes[i-1];
                            p2 = indexes[i];
                            p3 = indexes[i+1];
                        }
                        swapOrder = !swapOrder;

                        if (normPerVert) {
                            n1 = p1;
                            n2 = p2;
                            n3 = p3;
                        } else if (!normPerVert) {
                            n1 = n2 = n3 = faceCnt;
                        }

                        t1 = p1;
                        t2 = p2;
                        t3 = p3;

                        if (colPerVert) {
                            c1 = p1;
                            c2 = p2;
                            c3 = p3;
                        } else if (!colPerVert) {
                            c1 = c2 = c3 = faceCnt;
                        }

                        this._mesh._indices[0].push(cnt++, cnt++, cnt++);

                        this._mesh._positions[0].push(positions[p1].x);
                        this._mesh._positions[0].push(positions[p1].y);
                        this._mesh._positions[0].push(positions[p1].z);
                        this._mesh._positions[0].push(positions[p2].x);
                        this._mesh._positions[0].push(positions[p2].y);
                        this._mesh._positions[0].push(positions[p2].z);
                        this._mesh._positions[0].push(positions[p3].x);
                        this._mesh._positions[0].push(positions[p3].y);
                        this._mesh._positions[0].push(positions[p3].z);

                        if (hasNormal) {
                            this._mesh._normals[0].push(normals[n1].x);
                            this._mesh._normals[0].push(normals[n1].y);
                            this._mesh._normals[0].push(normals[n1].z);
                            this._mesh._normals[0].push(normals[n2].x);
                            this._mesh._normals[0].push(normals[n2].y);
                            this._mesh._normals[0].push(normals[n2].z);
                            this._mesh._normals[0].push(normals[n3].x);
                            this._mesh._normals[0].push(normals[n3].y);
                            this._mesh._normals[0].push(normals[n3].z);
                        }

                        if (hasColor) {
                            this._mesh._colors[0].push(colors[c1].r);
                            this._mesh._colors[0].push(colors[c1].g);
                            this._mesh._colors[0].push(colors[c1].b);
                            if (numColComponents === 4) {
                                this._mesh._colors[0].push(colors[c1].a);
                            }
                            this._mesh._colors[0].push(colors[c2].r);
                            this._mesh._colors[0].push(colors[c2].g);
                            this._mesh._colors[0].push(colors[c2].b);
                            if (numColComponents === 4) {
                                this._mesh._colors[0].push(colors[c2].a);
                            }
                            this._mesh._colors[0].push(colors[c3].r);
                            this._mesh._colors[0].push(colors[c3].g);
                            this._mesh._colors[0].push(colors[c3].b);
                            if (numColComponents === 4) {
                                this._mesh._colors[0].push(colors[c3].a);
                            }
                        }

                        if (hasTexCoord) {
                            this._mesh._texCoords[0].push(texCoords[t1].x);
                            this._mesh._texCoords[0].push(texCoords[t1].y);
                            if (numTexComponents === 3) {
                                this._mesh._texCoords[0].push(texCoords[t1].z);
                            }
                            this._mesh._texCoords[0].push(texCoords[t2].x);
                            this._mesh._texCoords[0].push(texCoords[t2].y);
                            if (numTexComponents === 3) {
                                this._mesh._texCoords[0].push(texCoords[t2].z);
                            }
                            this._mesh._texCoords[0].push(texCoords[t3].x);
                            this._mesh._texCoords[0].push(texCoords[t3].y);
                            if (numTexComponents === 3) {
                                this._mesh._texCoords[0].push(texCoords[t3].z);
                            }
                        }
                    }

                    if (!hasNormal) {
                        this._mesh.calcNormals(Math.PI);
                    }

                    if (!hasTexCoord) {
                        this._mesh.calcTexCoords(texMode);
                    }

                    this._mesh.splitMesh();

                    this.invalidateVolume();

                    for (i=0; i<this._mesh._indices.length; i++) {
                        this._mesh._numFaces += this._mesh._indices[i].length / 3;
                        this._mesh._numCoords += this._mesh._positions[i].length / 3;
                    }
                }
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName != "coord" && fieldName != "normal" &&
                    fieldName != "texCoord" && fieldName != "color")
                {
                    x3dom.debug.logWarning("IndexedTriangleStripSet: fieldChanged for " +
                        fieldName + " not yet implemented!");
                    return;
                }

                var pnts = this._cf.coord.node._vf.point;

                if ((this._cf.normal.node === null) || (pnts.length > x3dom.Utils.maxIndexableCoords))
                {
                    if (fieldName == "coord") {
                        this._mesh._positions[0] = [];
                        this._mesh._indices[0] =[];
                        this._mesh._normals[0] = [];
                        this._mesh._texCoords[0] =[];

                        var hasNormal = false, hasTexCoord = false, hasColor = false;

                        var colPerVert = this._vf.colorPerVertex;
                        var normPerVert = this._vf.normalPerVertex;

                        var indexes = this._vf.index;
                        var positions, normals, texCoords, colors;

                        var coordNode = this._cf.coord.node;
                        x3dom.debug.assert(coordNode);
                        positions = coordNode._vf.point;

                        var normalNode = this._cf.normal.node;
                        if (normalNode) {
                            hasNormal = true;
                            normals = normalNode._vf.vector;
                        }
                        else {
                            hasNormal = false;
                        }

                        var texMode = "", numTexComponents = 2;
                        var texCoordNode = this._cf.texCoord.node;
                        if (x3dom.isa(texCoordNode, x3dom.nodeTypes.MultiTextureCoordinate)) {
                            if (texCoordNode._cf.texCoord.nodes.length)
                                texCoordNode = texCoordNode._cf.texCoord.nodes[0];
                        }
                        if (texCoordNode) {
                            if (texCoordNode._vf.point) {
                                hasTexCoord = true;
                                texCoords = texCoordNode._vf.point;

                                if (x3dom.isa(texCoordNode, x3dom.nodeTypes.TextureCoordinate3D)) {
                                    numTexComponents = 3;
                                }
                            }
                            else if (texCoordNode._vf.mode) {
                                texMode = texCoordNode._vf.mode;
                            }
                        }
                        else {
                            hasTexCoord = false;
                        }
                        this._mesh._numTexComponents = numTexComponents;

                        var numColComponents = 3;
                        var colorNode = this._cf.color.node;
                        if (colorNode) {
                            hasColor = true;
                            colors = colorNode._vf.color;

                            if (x3dom.isa(colorNode, x3dom.nodeTypes.ColorRGBA)) {
                                numColComponents = 4;
                            }
                        }
                        else {
                            hasColor = false;
                        }
                        this._mesh._numColComponents = numColComponents;

                        this._mesh._indices[0] = [];
                        this._mesh._positions[0] = [];
                        this._mesh._normals[0] = [];
                        this._mesh._texCoords[0] = [];
                        this._mesh._colors[0] = [];

                        var faceCnt = 0, cnt = 0;
                        var p1, p2 , p3, n1, n2, n3, t1, t2, t3, c1, c2, c3;
                        var swapOrder = false;

                        if ( hasNormal  || hasTexCoord || hasColor) {

                            for (var i=1; i < indexes.length-2; ++i)
                            {
                                if (indexes[i+1] == -1) {
                                    i = i+2;
                                    faceCnt++;
                                    continue;
                                }

                                if (swapOrder) {
                                    p1 = indexes[i];
                                    p2 = indexes[i-1];
                                    p3 = indexes[i+1];
                                }
                                else {
                                    p1 = indexes[i-1];
                                    p2 = indexes[i];
                                    p3 = indexes[i+1];
                                }
                                swapOrder = !swapOrder;

                                if (normPerVert) {
                                    n1 = p1;
                                    n2 = p2;
                                    n3 = p3;
                                } else if (!normPerVert) {
                                    n1 = n2 = n3 = faceCnt;
                                }

                                t1 = p1;
                                t2 = p2;
                                t3 = p3;

                                if (colPerVert) {
                                    c1 = p1;
                                    c2 = p2;
                                    c3 = p3;
                                } else if (!colPerVert) {
                                    c1 = c2 = c3 = faceCnt;
                                }

                                this._mesh._indices[0].push(cnt++, cnt++, cnt++);

                                this._mesh._positions[0].push(positions[p1].x);
                                this._mesh._positions[0].push(positions[p1].y);
                                this._mesh._positions[0].push(positions[p1].z);
                                this._mesh._positions[0].push(positions[p2].x);
                                this._mesh._positions[0].push(positions[p2].y);
                                this._mesh._positions[0].push(positions[p2].z);
                                this._mesh._positions[0].push(positions[p3].x);
                                this._mesh._positions[0].push(positions[p3].y);
                                this._mesh._positions[0].push(positions[p3].z);

                                if (hasNormal) {
                                    this._mesh._normals[0].push(normals[n1].x);
                                    this._mesh._normals[0].push(normals[n1].y);
                                    this._mesh._normals[0].push(normals[n1].z);
                                    this._mesh._normals[0].push(normals[n2].x);
                                    this._mesh._normals[0].push(normals[n2].y);
                                    this._mesh._normals[0].push(normals[n2].z);
                                    this._mesh._normals[0].push(normals[n3].x);
                                    this._mesh._normals[0].push(normals[n3].y);
                                    this._mesh._normals[0].push(normals[n3].z);
                                }

                                if (hasColor) {
                                    this._mesh._colors[0].push(colors[c1].r);
                                    this._mesh._colors[0].push(colors[c1].g);
                                    this._mesh._colors[0].push(colors[c1].b);
                                    if (numColComponents === 4) {
                                        this._mesh._colors[0].push(colors[c1].a);
                                    }
                                    this._mesh._colors[0].push(colors[c2].r);
                                    this._mesh._colors[0].push(colors[c2].g);
                                    this._mesh._colors[0].push(colors[c2].b);
                                    if (numColComponents === 4) {
                                        this._mesh._colors[0].push(colors[c2].a);
                                    }
                                    this._mesh._colors[0].push(colors[c3].r);
                                    this._mesh._colors[0].push(colors[c3].g);
                                    this._mesh._colors[0].push(colors[c3].b);
                                    if (numColComponents === 4) {
                                        this._mesh._colors[0].push(colors[c3].a);
                                    }
                                }

                                if (hasTexCoord) {
                                    this._mesh._texCoords[0].push(texCoords[t1].x);
                                    this._mesh._texCoords[0].push(texCoords[t1].y);
                                    if (numTexComponents === 3) {
                                        this._mesh._texCoords[0].push(texCoords[t1].z);
                                    }
                                    this._mesh._texCoords[0].push(texCoords[t2].x);
                                    this._mesh._texCoords[0].push(texCoords[t2].y);
                                    if (numTexComponents === 3) {
                                        this._mesh._texCoords[0].push(texCoords[t2].z);
                                    }
                                    this._mesh._texCoords[0].push(texCoords[t3].x);
                                    this._mesh._texCoords[0].push(texCoords[t3].y);
                                    if (numTexComponents === 3) {
                                        this._mesh._texCoords[0].push(texCoords[t3].z);
                                    }
                                }
                            }

                            if (!hasNormal) {
                                this._mesh.calcNormals(Math.PI);
                            }

                            if (!hasTexCoord) {
                                this._mesh.calcTexCoords(texMode);
                            }

                            this._mesh.splitMesh();

                        } else {
                            var swapOrder = false;
                            for (var i = 1; i < indexes.length; ++i)
                            {
                                if (indexes[i+1] == -1) {
                                    i = i+2;
                                    continue;
                                }

                                if (swapOrder) {
                                    this._mesh._indices[0].push(indexes[i]);
                                    this._mesh._indices[0].push(indexes[i-1]);
                                    this._mesh._indices[0].push(indexes[i+1]);
                                }
                                else {
                                    this._mesh._indices[0].push(indexes[i-1]);
                                    this._mesh._indices[0].push(indexes[i]);
                                    this._mesh._indices[0].push(indexes[i+1]);
                                }
                                swapOrder = !swapOrder;
                            }

                            this._mesh._positions[0] = positions.toGL();

                            if (hasNormal) {
                                this._mesh._normals[0] = normals.toGL();
                            }
                            else {
                                this._mesh.calcNormals(Math.PI);
                            }
                            if (hasTexCoord) {
                                this._mesh._texCoords[0] = texCoords.toGL();
                                this._mesh._numTexComponents = numTexComponents;
                            }
                            else {
                                this._mesh.calcTexCoords(texMode);
                            }
                            if (hasColor) {
                                this._mesh._colors[0] = colors.toGL();
                                this._mesh._numColComponents = numColComponents;
                            }

                        }

                        this.invalidateVolume();
                        this._mesh._numFaces = 0;
                        this._mesh._numCoords = 0;

                        for (i=0; i<this._mesh._indices.length; i++) {
                            this._mesh._numFaces += this._mesh._indices[i].length / 3;
                            this._mesh._numCoords += this._mesh._positions[i].length / 3;
                        }

                        Array.forEach(this._parentNodes, function (node) {
                            node.setAllDirty();
                            node.invalidateVolume();
                        });
                    }
                    else if (fieldName == "color") {
                        var col = this._cf.color.node._vf.color;
                        var faceCnt = 0;
                        var c1 = c2 = c3 = 0;

                        var numColComponents = 3;

                        if (x3dom.isa(this._cf.color.node, x3dom.nodeTypes.ColorRGBA)) {
                            numColComponents = 4;
                        }

                        this._mesh._colors[0] = [];

                        var indexes = this._vf.index;
                        var swapOrder = false;

                        for (i=1; i < indexes.length-2; ++i)
                        {
                            if (indexes[i+1] == -1) {
                                i = i+2;
                                faceCnt++;
                                continue;
                            }

                            if (this._vf.colorPerVertex) {
                                if (swapOrder) {
                                    c1 = indexes[i];
                                    c2 = indexes[i-1];
                                    c3 = indexes[i+1];
                                }
                                else {
                                    c1 = indexes[i-1];
                                    c2 = indexes[i];
                                    c3 = indexes[i+1];
                                }
                                swapOrder = !swapOrder;
                            } else if (!this._vf.colorPerVertex) {
                                c1 = c2 = c3 = faceCnt;
                            }
                            this._mesh._colors[0].push(col[c1].r);
                            this._mesh._colors[0].push(col[c1].g);
                            this._mesh._colors[0].push(col[c1].b);
                            if (numColComponents === 4) {
                                this._mesh._colors[0].push(col[c1].a);
                            }
                            this._mesh._colors[0].push(col[c2].r);
                            this._mesh._colors[0].push(col[c2].g);
                            this._mesh._colors[0].push(col[c2].b);
                            if (numColComponents === 4) {
                                this._mesh._colors[0].push(col[c2].a);
                            }
                            this._mesh._colors[0].push(col[c3].r);
                            this._mesh._colors[0].push(col[c3].g);
                            this._mesh._colors[0].push(col[c3].b);
                            if (numColComponents === 4) {
                                this._mesh._colors[0].push(col[c3].a);
                            }
                        }

                        Array.forEach(this._parentNodes, function (node) {
                            node._dirty.colors = true;
                        });
                    }
                    else if (fieldName == "normal") {
                        var nor = this._cf.normal.node._vf.vector;
                        var faceCnt = 0;
                        var n1 = n2 = n3 = 0;

                        this._mesh._normals[0] = [];

                        var indexes = this._vf.index;
                        var swapOrder = false;

                        for (i=1; i < indexes.length-2; ++i)
                        {
                            if (indexes[i+1] == -1) {
                                i = i+2;
                                faceCnt++;
                                continue;
                            }

                            if (this._vf.normalPerVertex) {
                                if (swapOrder) {
                                    n1 = indexes[i];
                                    n2 = indexes[i-1];
                                    n3 = indexes[i+1];
                                }
                                else {
                                    n1 = indexes[i-1];
                                    n2 = indexes[i];
                                    n3 = indexes[i+1];
                                }
                                swapOrder = !swapOrder;
                            } else if (!this._vf.normalPerVertex) {
                                n1 = n2 = n3 = faceCnt;
                            }
                            this._mesh._normals[0].push(nor[n1].x);
                            this._mesh._normals[0].push(nor[n1].y);
                            this._mesh._normals[0].push(nor[n1].z);
                            this._mesh._normals[0].push(nor[n2].x);
                            this._mesh._normals[0].push(nor[n2].y);
                            this._mesh._normals[0].push(nor[n2].z);
                            this._mesh._normals[0].push(nor[n3].x);
                            this._mesh._normals[0].push(nor[n3].y);
                            this._mesh._normals[0].push(nor[n3].z);
                        }

                        Array.forEach(this._parentNodes, function (node) {
                            node._dirty.normals = true;
                        });
                    }
                    else if (fieldName == "texCoord") {
                        var texCoordNode = this._cf.texCoord.node;
                        if (x3dom.isa(texCoordNode, x3dom.nodeTypes.MultiTextureCoordinate)) {
                            if (texCoordNode._cf.texCoord.nodes.length)
                                texCoordNode = texCoordNode._cf.texCoord.nodes[0];
                        }
                        var tex = texCoordNode._vf.point;
                        var t1 = t2 = t3 = 0;

                        var numTexComponents = 2;

                        if (x3dom.isa(texCoordNode, x3dom.nodeTypes.TextureCoordinate3D)) {
                            numTexComponents = 3;
                        }

                        this._mesh._texCoords[0] = [];
                        var indexes = this._vf.index;
                        var swapOrder = false;

                        for (i=1; i < indexes.length-2; ++i)
                        {
                            if (indexes[i+1] == -1) {
                                i = i+2;
                                continue;
                            }

                            if (swapOrder) {
                                t1 = indexes[i];
                                t2 = indexes[i-1];
                                t3 = indexes[i+1];
                            }
                            else {
                                t1 = indexes[i-1];
                                t2 = indexes[i];
                                t3 = indexes[i+1];
                            }
                            swapOrder = !swapOrder;

                            this._mesh._texCoords[0].push(tex[t1].x);
                            this._mesh._texCoords[0].push(tex[t1].y);
                            if (numTexComponents === 3) {
                                this._mesh._texCoords[0].push(tex[t1].z);
                            }
                            this._mesh._texCoords[0].push(tex[t2].x);
                            this._mesh._texCoords[0].push(tex[t2].y);
                            if (numTexComponents === 3) {
                                this._mesh._texCoords[0].tex(col[t2].z);
                            }
                            this._mesh._texCoords[0].push(tex[t3].x);
                            this._mesh._texCoords[0].push(tex[t3].y);
                            if (numTexComponents === 3) {
                                this._mesh._texCoords[0].push(tex[t3].z);
                            }
                        }

                        Array.forEach(this._parentNodes, function (node) {
                            node._dirty.texcoords = true;
                        });
                    }
                }
                else
                {
                    if (fieldName == "coord")
                    {
                        this._mesh._positions[0] = pnts.toGL();

                        // tells the mesh that its bbox requires update
                        this.invalidateVolume();

                        Array.forEach(this._parentNodes, function (node) {
                            node._dirty.positions = true;
                            node.invalidateVolume();
                        });
                    }
                    else if (fieldName == "color")
                    {
                        pnts = this._cf.color.node._vf.color;

                        if (this._vf.colorPerVertex) {

                            this._mesh._colors[0] = pnts.toGL();

                        } else if (!this._vf.colorPerVertex) {

                            var faceCnt = 0;
                            var numColComponents = 3;

                            if (x3dom.isa(this._cf.color.node, x3dom.nodeTypes.ColorRGBA)) {
                                numColComponents = 4;
                            }

                            this._mesh._colors[0] = [];

                            var indexes = this._vf.index;
                            for (i=0; i < indexes.length; ++i)
                            {
                                if (indexes[i] == -1) {
                                    faceCnt++;
                                    continue;
                                }

                                this._mesh._colors[0].push(pnts[faceCnt].r);
                                this._mesh._colors[0].push(pnts[faceCnt].g);
                                this._mesh._colors[0].push(pnts[faceCnt].b);
                                if (numColComponents === 4) {
                                    this._mesh._colors[0].push(pnts[faceCnt].a);
                                }
                            }
                        }

                        Array.forEach(this._parentNodes, function (node) {
                            node._dirty.colors = true;
                        });
                    }
                    else if (fieldName == "normal")
                    {
                        pnts = this._cf.normal.node._vf.vector;

                        if (this._vf.normalPerVertex) {

                            this._mesh._normals[0] = pnts.toGL();

                        } else if (!this._vf.normalPerVertex) {

                            var indexes = this._vf.index;
                            this._mesh._normals[0] = [];

                            var faceCnt = 0;
                            for (i=0; i < indexes.length; ++i)
                            {
                                if (indexes[i] == -1) {
                                    faceCnt++;
                                    continue;
                                }

                                this._mesh._normals[0].push(pnts[faceCnt].x);
                                this._mesh._normals[0].push(pnts[faceCnt].y);
                                this._mesh._normals[0].push(pnts[faceCnt].z);
                            }
                        }

                        Array.forEach(this._parentNodes, function (node) {
                            node._dirty.normals = true;
                        });
                    }
                    else if (fieldName == "texCoord")
                    {
                        var texCoordNode = this._cf.texCoord.node;
                        if (x3dom.isa(texCoordNode, x3dom.nodeTypes.MultiTextureCoordinate)) {
                            if (texCoordNode._cf.texCoord.nodes.length)
                                texCoordNode = texCoordNode._cf.texCoord.nodes[0];
                        }
                        pnts = texCoordNode._vf.point;

                        this._mesh._texCoords[0] = pnts.toGL();

                        Array.forEach(this._parentNodes, function (node) {
                            node._dirty.texcoords = true;
                        });
                    }
                }
            }
        }
    )
);
