/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### IndexedFaceSet ### */
x3dom.registerNodeType(
    "IndexedFaceSet",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DComposedGeometryNode,
        
        /**
         * Constructor for IndexedFaceSet
         * @constructs x3dom.nodeTypes.IndexedFaceSet
         * @x3d 3.3
         * @component Geometry3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DComposedGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * The IndexedFaceSet node represents a 3D shape formed by constructing faces (polygons) from vertices listed in the coord field.
         */
        function (ctx) {
            x3dom.nodeTypes.IndexedFaceSet.superClass.call(this, ctx);


            /**
             * The creaseAngle field affects how default normals are generated.
             * If the angle between the geometric normals of two adjacent faces is less than the crease angle, normals shall be calculated so that the faces are shaded smoothly across the edge; otherwise, normals shall be calculated so that a lighting discontinuity across the edge is produced.
             * Crease angles shall be greater than or equal to 0.0 angle base units.
             * @var {x3dom.fields.SFFloat} creaseAngle
             * @memberof x3dom.nodeTypes.IndexedFaceSet
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'creaseAngle', 0);   // TODO

            /**
             * The convex field indicates whether all polygons in the shape are convex (TRUE).
             * A polygon is convex if it is planar, does not intersect itself, and all of the interior angles at its vertices are less than 180 degrees.
             * @var {x3dom.fields.SFBool} convex
             * @memberof x3dom.nodeTypes.IndexedFaceSet
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'convex', true);


            /**
             * The index data for the coord data.
             * @var {x3dom.fields.MFInt32} coordIndex
             * @memberof x3dom.nodeTypes.IndexedFaceSet
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFInt32(ctx, 'coordIndex', []);

            /**
             * The index data for the normal data.
             * @var {x3dom.fields.MFInt32} normalIndex
             * @memberof x3dom.nodeTypes.IndexedFaceSet
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFInt32(ctx, 'normalIndex', []);

            /**
             * The index data for the color data.
             * @var {x3dom.fields.MFInt32} colorIndex
             * @memberof x3dom.nodeTypes.IndexedFaceSet
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFInt32(ctx, 'colorIndex', []);

            /**
             * The index data for the texcoord data.
             * @var {x3dom.fields.MFInt32} texCoordIndex
             * @memberof x3dom.nodeTypes.IndexedFaceSet
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFInt32(ctx, 'texCoordIndex', []);
        
        },
        {
            nodeChanged: function()
            {
                var time0 = new Date().getTime();

                this.handleAttribs();

                var indexes = this._vf.coordIndex;

                //Last index value should be -1.
                if (indexes.length && indexes[indexes.length-1] != -1)
                {
                    indexes.push(-1);
                }

                var normalInd = this._vf.normalIndex;
                var texCoordInd = this._vf.texCoordIndex;
                var colorInd = this._vf.colorIndex;

                var hasNormal = false, hasNormalInd = false;
                var hasTexCoord = false, hasTexCoordInd = false;
                var hasColor = false, hasColorInd = false;

                var colPerVert = this._vf.colorPerVertex;
                var normPerVert = this._vf.normalPerVertex;

                if (normalInd.length > 0)
                {
                    hasNormalInd = true;
                }
                if (texCoordInd.length > 0)
                {
                    hasTexCoordInd = true;
                }
                if (colorInd.length > 0)
                {
                    hasColorInd = true;
                }

                var positions, normals, texCoords, colors;

                var coordNode = this._cf.coord.node;
                x3dom.debug.assert(coordNode);
                positions = coordNode.getPoints();

                var normalNode = this._cf.normal.node;
                if (normalNode)
                {
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
                if (texCoordNode)
                {
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
                if (colorNode)
                {
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

                var i, j, t, cnt, faceCnt;
                var p0, p1, p2, n0, n1, n2, t0, t1, t2, c0, c1, c2;

                if ( (this._vf.creaseAngle <= x3dom.fields.Eps) ||  // FIXME; what to do for ipols?
                    (positions.length > x3dom.Utils.maxIndexableCoords) ||
                    (hasNormal && hasNormalInd) ||
                    (hasTexCoord && hasTexCoordInd) ||
                    (hasColor && hasColorInd) )
                {
                    if (this._vf.creaseAngle <= x3dom.fields.Eps)
                        x3dom.debug.logWarning('Fallback to inefficient multi-index mode since creaseAngle=0.');

                    // Found MultiIndex Mesh
                    if(this._vf.convex) {
                        t = 0;
                        cnt = 0;
                        faceCnt = 0;
                        this._mesh._multiIndIndices = [];
                        this._mesh._posSize = positions.length;

                        for (i=0; i < indexes.length; ++i)
                        {
                            // Convert non-triangular polygons to a triangle fan
                            // (TODO: this assumes polygons are convex)
                            if (indexes[i] == -1) {
                                t = 0;
                                faceCnt++;
                                continue;
                            }

                            if (hasNormalInd) {
                                x3dom.debug.assert(normalInd[i] != -1);
                            }
                            if (hasTexCoordInd) {
                                x3dom.debug.assert(texCoordInd[i] != -1);
                            }
                            if (hasColorInd) {
                                x3dom.debug.assert(colorInd[i] != -1);
                            }

                            //TODO: OPTIMIZE but think about cache coherence regarding arrays!!!
                            switch (t)
                            {
                                case 0:
                                    p0 = +indexes[i];
                                    if (hasNormalInd && normPerVert) { n0 = +normalInd[i]; }
                                    else if (hasNormalInd && !normPerVert) { n0 = +normalInd[faceCnt]; }
                                    else if (normPerVert) { n0 = p0; }
                                    else { n0 = faceCnt; }

                                    if (hasTexCoordInd) { t0 = +texCoordInd[i]; }
                                    else { t0 = p0; }
                                    if (hasColorInd && colPerVert) { c0 = +colorInd[i]; }
                                    else if (hasColorInd && !colPerVert) { c0 = +colorInd[faceCnt]; }
                                    else if (colPerVert) { c0 = p0; }
                                    else { c0 = faceCnt; }
                                    t = 1;
                                    break;
                                case 1:
                                    p1 = +indexes[i];
                                    if (hasNormalInd && normPerVert) { n1 = +normalInd[i]; }
                                    else if (hasNormalInd && !normPerVert) { n1 = +normalInd[faceCnt]; }
                                    else if (normPerVert) { n1 = p1; }
                                    else { n1 = faceCnt; }

                                    if (hasTexCoordInd) { t1 = +texCoordInd[i]; }
                                    else { t1 = p1; }
                                    if (hasColorInd && colPerVert) { c1 = +colorInd[i]; }
                                    else if (hasColorInd && !colPerVert) { c1 = +colorInd[faceCnt]; }
                                    else if (colPerVert) { c1 = p1; }
                                    else { c1 = faceCnt; }
                                    t = 2;
                                    break;
                                case 2:
                                    p2 = +indexes[i];
                                    if (hasNormalInd && normPerVert) { n2 = +normalInd[i]; }
                                    else if (hasNormalInd && !normPerVert) { n2 = +normalInd[faceCnt]; }
                                    else if (normPerVert) { n2 = p2; }
                                    else { n2 = faceCnt; }

                                    if (hasTexCoordInd) { t2 = +texCoordInd[i]; }
                                    else { t2 = p2; }
                                    if (hasColorInd && colPerVert) { c2 = +colorInd[i]; }
                                    else if (hasColorInd && !colPerVert) { c2 = +colorInd[faceCnt]; }
                                    else if (colPerVert) { c2 = p2; }
                                    else { c2 = faceCnt; }
                                    t = 3;

                                    //this._mesh._indices[0].push(cnt++, cnt++, cnt++);

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
                                    //else {
                                    this._mesh._multiIndIndices.push(p0, p1, p2);
                                    //this._mesh._multiIndIndices.push(cnt-3, cnt-2, cnt-1);
                                    //}

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
                                case 3:
                                    p1 = p2;
                                    t1 = t2;
                                    if (normPerVert) {
                                        n1 = n2;
                                    }
                                    if (colPerVert) {
                                        c1 = c2;
                                    }
                                    p2 = +indexes[i];

                                    if (hasNormalInd && normPerVert) {
                                        n2 = +normalInd[i];
                                    } else if (hasNormalInd && !normPerVert) {
                                        /*n2 = +normalInd[faceCnt];*/
                                    } else if (normPerVert) {
                                        n2 = p2;
                                    } else {
                                        n2 = faceCnt;
                                    }

                                    if (hasTexCoordInd) {
                                        t2 = +texCoordInd[i];
                                    } else {
                                        t2 = p2;
                                    }

                                    if (hasColorInd && colPerVert) {
                                        c2 = +colorInd[i];
                                    } else if (hasColorInd && !colPerVert) {
                                        /*c2 = +colorInd[faceCnt];*/
                                    } else if (colPerVert) {
                                        c2 = p2;
                                    } else {
                                        c2 = faceCnt;
                                    }

                                    //this._mesh._indices[0].push(cnt++, cnt++, cnt++);

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
                                    //else {
                                    this._mesh._multiIndIndices.push(p0, p1, p2);
                                    //this._mesh._multiIndIndices.push(cnt-3, cnt-2, cnt-1);
                                    //}

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
                    }
                    else {
                        var linklist = new x3dom.DoublyLinkedList();
                        var data = {};
                        cnt = 0; faceCnt = 0;

                        for (i = 0; i < indexes.length; ++i)
                        {
                            if (indexes[i] == -1) {
                                var multi_index_data = x3dom.EarClipping.getMultiIndexes(linklist);

                                for (j = 0; j < multi_index_data.indices.length; j++)
                                {
                                    this._mesh._indices[0].push(cnt);
                                    cnt++;

                                    this._mesh._positions[0].push(multi_index_data.point[j].x,
                                        multi_index_data.point[j].y,
                                        multi_index_data.point[j].z);
                                    if (hasNormal) {
                                        this._mesh._normals[0].push(multi_index_data.normals[j].x,
                                            multi_index_data.normals[j].y,
                                            multi_index_data.normals[j].z);
                                    }
                                    if (hasColor) {
                                        this._mesh._colors[0].push(multi_index_data.colors[j].r,
                                            multi_index_data.colors[j].g,
                                            multi_index_data.colors[j].b);
                                        if (numColComponents === 4) {
                                            this._mesh._colors[0].push(multi_index_data.colors[j].a);
                                        }
                                    }
                                    if (hasTexCoord) {
                                        this._mesh._texCoords[0].push(multi_index_data.texCoords[j].x,
                                            multi_index_data.texCoords[j].y);
                                        if (numTexComponents === 3) {
                                            this._mesh._texCoords[0].push(multi_index_data.texCoords[j].z);
                                        }
                                    }
                                }

                                linklist = new x3dom.DoublyLinkedList();
                                faceCnt++;
                                continue;
                            }

                            if (hasNormal) {
                                if (hasNormalInd && normPerVert) {
                                    data.normals =  normals[normalInd[i]];
                                } else if (hasNormalInd && !normPerVert) {
                                    data.normals =  normals[normalInd[faceCnt]];
                                } else {
                                    data.normals =  normals[indexes[i]];
                                }
                            }

                            if (hasColor) {
                                if (hasColorInd && colPerVert) {
                                    data.colors =  colors[colorInd[i]];
                                } else if (hasColorInd && !colPerVert) {
                                    data.colors =  colors[colorInd[faceCnt]];
                                } else if (colPerVert) {
                                    data.colors =  colors[indexes[i]];
                                } else {
                                    data.colors =  colors[faceCnt];
                                }
                            }
                            if (hasTexCoord) {
                                if (hasTexCoordInd) {
                                    data.texCoords =  texCoords[texCoordInd[i]];
                                } else {
                                    data.texCoords =  texCoords[indexes[i]];
                                }
                            }

                            linklist.appendNode(new x3dom.DoublyLinkedList.ListNode(
                                positions[indexes[i]], indexes[i], data.normals, data.colors, data.texCoords));
                        }

                        this._mesh.splitMesh();
                    }

                    if (!hasNormal) {
                        this._mesh.calcNormals(this._vf.creaseAngle, this._vf.ccw);
                    }
                    if (!hasTexCoord) {
                        this._mesh.calcTexCoords(texMode);
                    }
                } // if isMulti
                else
                {
                    t = 0;
                    if (this._vf.convex) {
                        for (i = 0; i < indexes.length; ++i)
                        {
                            // Convert non-triangular polygons to a triangle fan
                            if (indexes[i] == -1) {
                                t = 0;
                                continue;
                            }

                            switch (t) {
                                case 0: n0 = +indexes[i]; t = 1; break;
                                case 1: n1 = +indexes[i]; t = 2; break;
                                case 2: n2 = +indexes[i]; t = 3; this._mesh._indices[0].push(n0, n1, n2); break;
                                case 3: n1 = n2; n2 = +indexes[i]; this._mesh._indices[0].push(n0, n1, n2); break;
                            }

                        }
                    }
                    else {
                        //  Convert non-triangular convex polygons to a triangle fan
                        linklist = new x3dom.DoublyLinkedList();
                        for (i = 0; i < indexes.length; ++i)
                        {
                            if (indexes[i] == -1) {
                                var linklist_indices = x3dom.EarClipping.getIndexes(linklist);

                                for (j = 0; j < linklist_indices.length; j++) {
                                    this._mesh._indices[0].push(linklist_indices[j]);
                                }
                                linklist = new x3dom.DoublyLinkedList();
                                continue;
                            }

                            linklist.appendNode(new x3dom.DoublyLinkedList.ListNode(positions[indexes[i]], indexes[i]));
                        }
                    }

                    this._mesh._positions[0] = positions.toGL();

                    if (hasNormal) {
                        this._mesh._normals[0] = normals.toGL();
                    }
                    else {
                        this._mesh.calcNormals(this._vf.creaseAngle, this._vf.ccw);
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

                for (i=0; i<this._mesh._positions.length; i++) {
                    var indexLength = this._mesh._indices[i].length;
                    var numCoords = this._mesh._positions[i].length / 3;
                    this._mesh._numCoords += numCoords;
                    if (indexLength > 0)
                        this._mesh._numFaces += indexLength / 3;
                    else
                        this._mesh._numFaces += numCoords / 3;
                }

                //var time1 = new Date().getTime() - time0;
                //x3dom.debug.logInfo("Mesh load time: " + time1 + " ms");
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName != "coord" && fieldName != "normal" &&
                    fieldName != "texCoord" && fieldName != "color" &&
                    fieldName != "coordIndex")
                {
                    x3dom.debug.logWarning("IndexedFaceSet: fieldChanged for " +
                        fieldName + " not yet implemented!");
                    return;
                }

                var pnts = this._cf.coord.node._vf.point;
                var n = pnts.length;

                var texCoordNode = this._cf.texCoord.node;
                if (x3dom.isa(texCoordNode, x3dom.nodeTypes.MultiTextureCoordinate)) {
                    if (texCoordNode._cf.texCoord.nodes.length)
                        texCoordNode = texCoordNode._cf.texCoord.nodes[0];
                }

                if (((this._vf.creaseAngle <= x3dom.fields.Eps) || (n > x3dom.Utils.maxIndexableCoords) ||
                    (this._vf.normalIndex.length > 0 && this._cf.normal.node) ||
                    (this._vf.texCoordIndex.length > 0 && texCoordNode) ||
                    (this._vf.colorIndex.length > 0 && this._cf.color.node)) && this._mesh._multiIndIndices)
                {
                    var needNormals = !this._cf.normal.node && this._vf.normalUpdateMode.toLowerCase() != 'none';

                    n = this._mesh._multiIndIndices.length;

                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] =[];

                    // special coordinate interpolator handler
                    if (fieldName == "coord" && n)
                    {
                        if (needNormals) {
                            this._mesh._normals[0] = [];
                        }

                        for (i=0; i<n; i+=3) {
                            var ind0 = this._mesh._multiIndIndices[i  ];
                            var ind1 = this._mesh._multiIndIndices[i+1];
                            var ind2 = this._mesh._multiIndIndices[i+2];

                            var pos0 = pnts[ind0];
                            var pos1 = pnts[ind1];
                            var pos2 = pnts[ind2];

                            this._mesh._positions[0].push(pos0.x, pos0.y, pos0.z);
                            this._mesh._positions[0].push(pos1.x, pos1.y, pos1.z);
                            this._mesh._positions[0].push(pos2.x, pos2.y, pos2.z);

                            if (needNormals) {
                                var a = pos0.subtract(pos1);
                                var b = pos1.subtract(pos2);

                                var norm = a.cross(b).normalize();
                                if (!this._vf.ccw)
                                    norm = norm.negate();

                                this._mesh._normals[0].push(norm.x, norm.y, norm.z);
                                this._mesh._normals[0].push(norm.x, norm.y, norm.z);
                                this._mesh._normals[0].push(norm.x, norm.y, norm.z);
                            }
                        }

                        this.invalidateVolume();

                        Array.forEach(this._parentNodes, function (node) {
                            node._dirty.positions = true;
                            if (needNormals)
                                node._dirty.normals = true;
                        });

                        return;
                    }

                    // TODO; optimize this very slow and brute force code, at least for creaseAngle=0 case!
                    this._mesh._normals[0] = [];
                    this._mesh._texCoords[0] =[];
                    this._mesh._colors[0] = [];

                    var indexes = this._vf.coordIndex;
                    var normalInd = this._vf.normalIndex;
                    var texCoordInd = this._vf.texCoordIndex;
                    var colorInd = this._vf.colorIndex;
                    var hasNormal = false, hasNormalInd = false;
                    var hasTexCoord = false, hasTexCoordInd = false;
                    var hasColor = false, hasColorInd = false;

                    var colPerVert = this._vf.colorPerVertex;
                    var normPerVert = this._vf.normalPerVertex;

                    if (normalInd.length > 0)
                    {
                        hasNormalInd = true;
                    }
                    if (texCoordInd.length > 0)
                    {
                        hasTexCoordInd = true;
                    }
                    if (colorInd.length > 0)
                    {
                        hasColorInd = true;
                    }

                    var positions, normals, texCoords, colors;

                    var coordNode = this._cf.coord.node;
                    x3dom.debug.assert(coordNode);
                    positions = coordNode.getPoints();

                    var normalNode = this._cf.normal.node;
                    if (normalNode)
                    {
                        hasNormal = true;
                        normals = normalNode._vf.vector;
                    }
                    else {
                        hasNormal = false;
                    }

                    var texMode = "", numTexComponents = 2;
                    texCoordNode = this._cf.texCoord.node;
                    if (x3dom.isa(texCoordNode, x3dom.nodeTypes.MultiTextureCoordinate)) {
                        if (texCoordNode._cf.texCoord.nodes.length)
                            texCoordNode = texCoordNode._cf.texCoord.nodes[0];
                    }
                    if (texCoordNode)
                    {
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
                    if (colorNode)
                    {
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

                    var i, j, t, cnt, faceCnt;
                    var p0, p1, p2, n0, n1, n2, t0, t1, t2, c0, c1, c2;

                    if(this._vf.convex) {
                        t = 0;
                        cnt = 0;
                        faceCnt = 0;
                        this._mesh._multiIndIndices = [];
                        this._mesh._posSize = positions.length;

                        for (i=0; i < indexes.length; ++i)
                        {
                            if (indexes[i] == -1) {
                                t = 0;
                                faceCnt++;
                                continue;
                            }

                            if (hasNormalInd) {
                                x3dom.debug.assert(normalInd[i] != -1);
                            }
                            if (hasTexCoordInd) {
                                x3dom.debug.assert(texCoordInd[i] != -1);
                            }
                            if (hasColorInd) {
                                x3dom.debug.assert(colorInd[i] != -1);
                            }

                            switch (t)
                            {
                                case 0:
                                    p0 = +indexes[i];
                                    if (hasNormalInd && normPerVert) { n0 = +normalInd[i]; }
                                    else if (hasNormalInd && !normPerVert) { n0 = +normalInd[faceCnt]; }
                                    else if (normPerVert) { n0 = p0; }
                                    else { n0 = faceCnt; }

                                    if (hasTexCoordInd) { t0 = +texCoordInd[i]; }
                                    else { t0 = p0; }
                                    if (hasColorInd && colPerVert) { c0 = +colorInd[i]; }
                                    else if (hasColorInd && !colPerVert) { c0 = +colorInd[faceCnt]; }
                                    else if (colPerVert) { c0 = p0; }
                                    else { c0 = faceCnt; }
                                    t = 1;
                                    break;
                                case 1:
                                    p1 = +indexes[i];
                                    if (hasNormalInd && normPerVert) { n1 = +normalInd[i]; }
                                    else if (hasNormalInd && !normPerVert) { n1 = +normalInd[faceCnt]; }
                                    else if (normPerVert) { n1 = p1; }
                                    else { n1 = faceCnt; }

                                    if (hasTexCoordInd) { t1 = +texCoordInd[i]; }
                                    else { t1 = p1; }
                                    if (hasColorInd && colPerVert) { c1 = +colorInd[i]; }
                                    else if (hasColorInd && !colPerVert) { c1 = +colorInd[faceCnt]; }
                                    else if (colPerVert) { c1 = p1; }
                                    else { c1 = faceCnt; }
                                    t = 2;
                                    break;
                                case 2:
                                    p2 = +indexes[i];
                                    if (hasNormalInd && normPerVert) { n2 = +normalInd[i]; }
                                    else if (hasNormalInd && !normPerVert) { n2 = +normalInd[faceCnt]; }
                                    else if (normPerVert) { n2 = p2; }
                                    else { n2 = faceCnt; }

                                    if (hasTexCoordInd) { t2 = +texCoordInd[i]; }
                                    else { t2 = p2; }
                                    if (hasColorInd && colPerVert) { c2 = +colorInd[i]; }
                                    else if (hasColorInd && !colPerVert) { c2 = +colorInd[faceCnt]; }
                                    else if (colPerVert) { c2 = p2; }
                                    else { c2 = faceCnt; }
                                    t = 3;

                                    //this._mesh._indices[0].push(cnt++, cnt++, cnt++);

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
                                    //else {
                                    this._mesh._multiIndIndices.push(p0, p1, p2);
                                    //}

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
                                case 3:
                                    p1 = p2;
                                    t1 = t2;
                                    if (normPerVert) {
                                        n1 = n2;
                                    }
                                    if (colPerVert) {
                                        c1 = c2;
                                    }
                                    p2 = +indexes[i];

                                    if (hasNormalInd && normPerVert) {
                                        n2 = +normalInd[i];
                                    } else if (hasNormalInd && !normPerVert) {
                                        /*n2 = +normalInd[faceCnt];*/
                                    } else if (normPerVert) {
                                        n2 = p2;
                                    } else {
                                        n2 = faceCnt;
                                    }

                                    if (hasTexCoordInd) {
                                        t2 = +texCoordInd[i];
                                    } else {
                                        t2 = p2;
                                    }

                                    if (hasColorInd && colPerVert) {
                                        c2 = +colorInd[i];
                                    } else if (hasColorInd && !colPerVert) {
                                        /*c2 = +colorInd[faceCnt];*/
                                    } else if (colPerVert) {
                                        c2 = p2;
                                    } else {
                                        c2 = faceCnt;
                                    }

                                    //this._mesh._indices[0].push(cnt++, cnt++, cnt++);

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
                                    //else {
                                    this._mesh._multiIndIndices.push(p0, p1, p2);
                                    //}

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
                    }
                    else {
                        var linklist = new x3dom.DoublyLinkedList();
                        var data = {};
                        cnt = 0; faceCnt = 0;

                        for (i = 0; i < indexes.length; ++i)
                        {
                            if (indexes[i] == -1) {
                                var multi_index_data = x3dom.EarClipping.getMultiIndexes(linklist);

                                for (j = 0; j < multi_index_data.indices.length; j++)
                                {
                                    this._mesh._indices[0].push(cnt);
                                    cnt++;

                                    this._mesh._positions[0].push(multi_index_data.point[j].x,
                                        multi_index_data.point[j].y,
                                        multi_index_data.point[j].z);
                                    if (hasNormal) {
                                        this._mesh._normals[0].push(multi_index_data.normals[j].x,
                                            multi_index_data.normals[j].y,
                                            multi_index_data.normals[j].z);
                                    }
                                    if (hasColor) {
                                        this._mesh._colors[0].push(multi_index_data.colors[j].r,
                                            multi_index_data.colors[j].g,
                                            multi_index_data.colors[j].b);
                                        if (numColComponents === 4) {
                                            this._mesh._colors[0].push(multi_index_data.colors[j].a);
                                        }
                                    }
                                    if (hasTexCoord) {
                                        this._mesh._texCoords[0].push(multi_index_data.texCoords[j].x,
                                            multi_index_data.texCoords[j].y);
                                        if (numTexComponents === 3) {
                                            this._mesh._texCoords[0].push(multi_index_data.texCoords[j].z);
                                        }
                                    }
                                }

                                linklist = new x3dom.DoublyLinkedList();
                                faceCnt++;
                                continue;
                            }

                            if (hasNormal) {
                                if (hasNormalInd && normPerVert) {
                                    data.normals =  normals[normalInd[i]];
                                } else if (hasNormalInd && !normPerVert) {
                                    data.normals =  normals[normalInd[faceCnt]];
                                } else {
                                    data.normals =  normals[indexes[i]];
                                }
                            }

                            if (hasColor) {
                                if (hasColorInd && colPerVert) {
                                    data.colors =  colors[colorInd[i]];
                                } else if (hasColorInd && !colPerVert) {
                                    data.colors =  colors[colorInd[faceCnt]];
                                } else {
                                    data.colors =  colors[indexes[i]];
                                }
                            }
                            if (hasTexCoord) {
                                if (hasTexCoordInd) {
                                    data.texCoords =  texCoords[texCoordInd[i]];
                                } else {
                                    data.texCoords =  texCoords[indexes[i]];
                                }
                            }

                            linklist.appendNode(new x3dom.DoublyLinkedList.ListNode(
                                positions[indexes[i]], indexes[i], data.normals, data.colors, data.texCoords));
                        }

                        this._mesh.splitMesh();
                    }

                    if (!hasNormal) {
                        this._mesh.calcNormals(this._vf.creaseAngle, this._vf.ccw);
                    }
                    if (!hasTexCoord) {
                        this._mesh.calcTexCoords(texMode);
                    }

                    this.invalidateVolume();

                    this._mesh._numFaces = 0;
                    this._mesh._numCoords = 0;

                    for (i=0; i<this._mesh._positions.length; i++) {
                        var indexLength = this._mesh._indices[i].length;
                        var numCoords = this._mesh._positions[i].length / 3;
                        this._mesh._numCoords += numCoords;
                        if (indexLength > 0)
                            this._mesh._numFaces += indexLength / 3;
                        else
                            this._mesh._numFaces += numCoords / 3;
                    }

                    Array.forEach(this._parentNodes, function (node) {
                        node.setGeoDirty();
                    });
                }
                else {
                    if (fieldName == "coord")
                    {
                        var needNormals = !this._cf.normal.node && this._vf.normalUpdateMode.toLowerCase() != 'none';

                        this._mesh._positions[0] = pnts.toGL();

                        if (needNormals) {
                            // position update usually also requires update of vertex normals
                            this._mesh.calcNormals(this._vf.creaseAngle, this._vf.ccw);
                        }

                        // tells the mesh that its bbox requires update
                        this.invalidateVolume();

                        Array.forEach(this._parentNodes, function (node) {
                            node._dirty.positions = true;
                            if (needNormals)
                                node._dirty.normals = true;
                            node.invalidateVolume();
                        });
                    }
                    else if (fieldName == "color")
                    {
                        pnts = this._cf.color.node._vf.color;

                        this._mesh._colors[0] = pnts.toGL();

                        Array.forEach(this._parentNodes, function (node) {
                            node._dirty.colors = true;
                        });
                    }
                    else if (fieldName == "normal")
                    {
                        pnts = this._cf.normal.node._vf.vector;

                        this._mesh._normals[0] = pnts.toGL();

                        Array.forEach(this._parentNodes, function (node) {
                            node._dirty.normals = true;
                        });
                    }
                    else if (fieldName == "texCoord")
                    {
                        texCoordNode = this._cf.texCoord.node;
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
                    else if (fieldName == "coordIndex")
                    {
                        needNormals = !this._cf.normal.node && this._vf.normalUpdateMode.toLowerCase() != 'none';

                        indexes = this._vf.coordIndex;
                        t = 0;
                        n = indexes.length;

                        this._mesh._indices[0] = [];

                        for (i = 0; i < n; ++i) {
                            if (indexes[i] == -1) {
                                t = 0;
                            }
                            else {
                                switch (t) {
                                    case 0: p0 = +indexes[i]; t = 1; break;
                                    case 1: p1 = +indexes[i]; t = 2; break;
                                    case 2: p2 = +indexes[i]; t = 3; this._mesh._indices[0].push(p0, p1, p2); break;
                                    case 3: p1 = p2; p2 = +indexes[i]; this._mesh._indices[0].push(p0, p1, p2); break;
                                }
                            }
                        }

                        if (needNormals) {
                            // index update usually also requires update of vertex normals
                            this._mesh.calcNormals(this._vf.creaseAngle, this._vf.ccw);
                        }

                        Array.forEach(this._parentNodes, function (node) {
                            node._dirty.indexes = true;
                            if (needNormals)
                                node._dirty.normals = true;
                        });
                    }
                }
            }
        }
    )
);