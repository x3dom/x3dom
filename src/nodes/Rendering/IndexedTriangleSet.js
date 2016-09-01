/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### IndexedTriangleSet ### */
x3dom.registerNodeType(
    "IndexedTriangleSet",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DComposedGeometryNode,
        
        /**
         * Constructor for IndexedTriangleSet
         * @constructs x3dom.nodeTypes.IndexedTriangleSet
         * @x3d 3.3
         * @component Rendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DComposedGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc IndexedTriangleSet is a geometry node that can contain a Color, Coordinate, Normal and TextureCoordinate node.
         * Hint: insert a Shape node before adding geometry or Appearance.
         * You can also substitute a type-matched ProtoInstance for content.
         */
        function (ctx) {
            x3dom.nodeTypes.IndexedTriangleSet.superClass.call(this, ctx);


            /**
             * index specifies triangles by connecting Coordinate vertices.
             * @var {x3dom.fields.MFInt32} index
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.IndexedTriangleSet
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFInt32(ctx, 'index', []);
        
        },
        {
            nodeChanged: function()
            {
                var time0 = new Date().getTime();

                this.handleAttribs();

                var colPerVert  = this._vf.colorPerVertex;
                var normPerVert = this._vf.normalPerVertex;
                var ccw = this._vf.ccw;

                var indexes = this._vf.index;

                var hasNormal = false, hasTexCoord = false, hasColor = false;
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

                this._mesh._indices[0] = [];
                this._mesh._positions[0] = [];
                this._mesh._normals[0] = [];
                this._mesh._texCoords[0] = [];
                this._mesh._colors[0] = [];

                var i, t, cnt, faceCnt, posMax;
                var p0, p1, p2, n0, n1, n2, t0, t1, t2, c0, c1, c2;

                // if positions array too short add degenerate triangle
                while (positions.length % 3 > 0) {
                    positions.push(positions.length-1);
                }
                posMax = positions.length;

                //resolve indices, if necessary
                if (!normPerVert || !colPerVert || posMax > x3dom.Utils.maxIndexableCoords)
                {
                    t = 0;
                    cnt = 0;
                    faceCnt = 0;
                    this._mesh._multiIndIndices = [];
                    this._mesh._posSize = positions.length;

                    for (i=0; i < indexes.length; ++i)
                    {
                        // Convert non-triangular polygons to a triangle fan
                        // (TODO: this assumes polygons are convex)

                        if ((i > 0) && (i % 3 === 0 )) {
                            t = 0;
                            faceCnt++;
                        }

                        //TODO: OPTIMIZE but think about cache coherence regarding arrays!!!
                        switch (t)
                        {
                            case 0:
                                p0 = +indexes[i];
                                if (normPerVert) {
                                    n0 = p0;
                                } else if (!normPerVert) {
                                    n0 = faceCnt;
                                }
                                t0 = p0;
                                if (colPerVert) {
                                    c0 = p0;
                                } else if (!colPerVert) {
                                    c0 = faceCnt;
                                }
                                t = 1;
                                break;
                            case 1:
                                p1 = +indexes[i];
                                if (normPerVert) {
                                    n1 = p1;
                                } else if (!normPerVert) {
                                    n1 = faceCnt;
                                }
                                t1 = p1;
                                if (colPerVert) {
                                    c1 = p1;
                                } else if (!colPerVert) {
                                    c1 = faceCnt;
                                }
                                t = 2;
                                break;
                            case 2:
                                p2 = +indexes[i];
                                if (normPerVert) {
                                    n2 = p2;
                                } else if (!normPerVert) {
                                    n2 = faceCnt;
                                }
                                t2 = p2;
                                if (colPerVert) {
                                    c2 = p2;
                                } else if (!colPerVert) {
                                    c2 = faceCnt;
                                }
                                t = 3;

                                this._mesh._indices[0].push(cnt++, cnt++, cnt++);

                                this._mesh._positions[0].push(positions[p0].x);
                                this._mesh._positions[0].push(positions[p0].y);
                                this._mesh._positions[0].push(positions[p0].z);
                                this._mesh._positions[0].push(positions[p1].x);
                                this._mesh._positions[0].push(positions[p1].y);
                                this._mesh._positions[0].push(positions[p1].z);
                                this._mesh._positions[0].push(positions[p2].x);
                                this._mesh._positions[0].push(positions[p2].y);
                                this._mesh._positions[0].push(positions[p2].z);

                                if (hasNormal) {
                                    this._mesh._normals[0].push(normals[n0].x);
                                    this._mesh._normals[0].push(normals[n0].y);
                                    this._mesh._normals[0].push(normals[n0].z);
                                    this._mesh._normals[0].push(normals[n1].x);
                                    this._mesh._normals[0].push(normals[n1].y);
                                    this._mesh._normals[0].push(normals[n1].z);
                                    this._mesh._normals[0].push(normals[n2].x);
                                    this._mesh._normals[0].push(normals[n2].y);
                                    this._mesh._normals[0].push(normals[n2].z);
                                }
                                else {
                                    this._mesh._multiIndIndices.push(p0, p1, p2);
                                    //this._mesh._multiIndIndices.push(cnt-3, cnt-2, cnt-1);
                                }

                                if (hasColor) {
                                    this._mesh._colors[0].push(colors[c0].r);
                                    this._mesh._colors[0].push(colors[c0].g);
                                    this._mesh._colors[0].push(colors[c0].b);
                                    if (numColComponents === 4) {
                                        this._mesh._colors[0].push(colors[c0].a);
                                    }
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
                                }

                                if (hasTexCoord) {
                                    this._mesh._texCoords[0].push(texCoords[t0].x);
                                    this._mesh._texCoords[0].push(texCoords[t0].y);
                                    if (numTexComponents === 3) {
                                        this._mesh._texCoords[0].push(texCoords[t0].z);
                                    }
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
                                }

                                //faceCnt++;
                                break;
                            default:
                        }
                    }

                    if (!hasNormal) {
                        this._mesh.calcNormals(normPerVert ? Math.PI : 0);
                        //normalsPerFace case needs testing
                        //this._mesh.calcNormals(normPerVert ? Math.PI : 0, ccw);
                    }
                    if (!hasTexCoord) {
                        this._mesh.calcTexCoords(texMode);
                    }

                    this._mesh.splitMesh();

                    //x3dom.debug.logInfo(this._mesh._indices.length);
                } // if isMulti
                else
                {
                    faceCnt = 0;
                    for (i=0; i<indexes.length; i++)
                    {
                        if ((i > 0) && (i % 3 === 0 )) {
                            faceCnt++;
                        }

                        this._mesh._indices[0].push(indexes[i]);

                        if(!normPerVert && hasNormal) {
                            this._mesh._normals[0].push(normals[faceCnt].x);
                            this._mesh._normals[0].push(normals[faceCnt].y);
                            this._mesh._normals[0].push(normals[faceCnt].z);
                        }
                        if(!colPerVert && hasColor) {
                            this._mesh._colors[0].push(colors[faceCnt].r);
                            this._mesh._colors[0].push(colors[faceCnt].g);
                            this._mesh._colors[0].push(colors[faceCnt].b);
                            if (numColComponents === 4) {
                                this._mesh._colors[0].push(colors[faceCnt].a);
                            }
                        }
                    }

                    this._mesh._positions[0] = positions.toGL();

                    if (hasNormal) {
                        this._mesh._normals[0] = normals.toGL();
                    }
                    else {
                        this._mesh.calcNormals(normPerVert ? Math.PI : 0, ccw);
                    }

                    if (hasTexCoord) {
                        this._mesh._texCoords[0] = texCoords.toGL();
                        this._mesh._numTexComponents = numTexComponents;
                    }
                    else {
                        this._mesh.calcTexCoords(texMode);
                    }

                    if (hasColor && colPerVert) {
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

                var time1 = new Date().getTime() - time0;
                //x3dom.debug.logInfo("Mesh load time: " + time1 + " ms");
            },

            fieldChanged: function(fieldName)
            {
                var pnts = this._cf.coord.node._vf.point;

                if ( pnts.length > x3dom.Utils.maxIndexableCoords )  // are there other problematic cases?
                {
                    // TODO; implement
                    x3dom.debug.logWarning("IndexedTriangleSet: fieldChanged with " +
                        "too many coordinates not yet implemented!");
                    return;
                }

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
                        for (var i=0; i < indexes.length; ++i)
                        {
                            if ((i > 0) && (i % 3 === 0 )) {
                                faceCnt++;
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
                        for (var i=0; i < indexes.length; ++i)
                        {
                            if ((i > 0) && (i % 3 === 0 )) {
                                faceCnt++;
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
                // TODO: index
            }
        }
    )
);
