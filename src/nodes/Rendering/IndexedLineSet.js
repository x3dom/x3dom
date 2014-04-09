/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### IndexedLineSet ### */
x3dom.registerNodeType(
    "IndexedLineSet",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.IndexedLineSet.superClass.call(this, ctx);

            this.addField_SFBool(ctx, 'colorPerVertex', true);  // TODO

            this.addField_MFNode('attrib', x3dom.nodeTypes.X3DVertexAttributeNode);
            this.addField_SFNode('coord', x3dom.nodeTypes.X3DCoordinateNode);
            this.addField_SFNode('color', x3dom.nodeTypes.X3DColorNode);

            this.addField_MFInt32(ctx, 'coordIndex', []);
            this.addField_MFInt32(ctx, 'colorIndex', []);

            this._mesh._primType = 'LINES';
            x3dom.Utils.needLineWidth = true;
        },
        {
            nodeChanged: function()
            {
                var time0 = new Date().getTime();

                // this.handleAttribs();

                var indexes = this._vf.coordIndex;
                var colorInd = this._vf.colorIndex;

                var hasColor = false, hasColorInd = false;

                // TODO; implement colorPerVertex also for single index
                var colPerVert = this._vf.colorPerVertex;

                if (colorInd.length > 0)
                {
                    hasColorInd = true;
                }

                var positions, colors;

                var coordNode = this._cf.coord.node;
                x3dom.debug.assert(coordNode);

                positions = coordNode.getPoints();

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

                this._mesh._indices[0] = [];
                this._mesh._positions[0] = [];
                this._mesh._colors[0] = [];

                var i, t, cnt, lineCnt;
                var p0, p1, c0, c1;

                // Found MultiIndex Mesh OR LineSet with too many vertices for 16 bit
                if ( (hasColor && hasColorInd) || positions.length > x3dom.Utils.maxIndexableCoords )
                {
                    t = 0;
                    cnt = 0;
                    lineCnt = 0;

                    for (i=0; i < indexes.length; ++i)
                    {
                        if (indexes[i] === -1) {
                            t = 0;
                            continue;
                        }

                        if (hasColorInd) {
                            x3dom.debug.assert(colorInd[i] != -1);
                        }

                        switch (t)
                        {
                            case 0:
                                p0 = +indexes[i];
                                if (hasColorInd && colPerVert) { c0 = +colorInd[i]; }
                                else { c0 = p0; }
                                t = 1;
                                break;
                            case 1:
                                p1 = +indexes[i];
                                if (hasColorInd && colPerVert) { c1 = +colorInd[i]; }
                                else if (hasColorInd && !colPerVert) { c1 = +colorInd[lineCnt]; }
                                else { c1 = p1; }

                                this._mesh._indices[0].push(cnt++, cnt++);

                                this._mesh._positions[0].push(positions[p0].x);
                                this._mesh._positions[0].push(positions[p0].y);
                                this._mesh._positions[0].push(positions[p0].z);
                                this._mesh._positions[0].push(positions[p1].x);
                                this._mesh._positions[0].push(positions[p1].y);
                                this._mesh._positions[0].push(positions[p1].z);

                                if (hasColor) {
                                    if (!colPerVert) {
                                        c0 = c1;
                                    }
                                    this._mesh._colors[0].push(colors[c0].r);
                                    this._mesh._colors[0].push(colors[c0].g);
                                    this._mesh._colors[0].push(colors[c0].b);
                                    this._mesh._colors[0].push(colors[c1].r);
                                    this._mesh._colors[0].push(colors[c1].g);
                                    this._mesh._colors[0].push(colors[c1].b);
                                }

                                t = 2;
                                lineCnt++;
                                break;
                            case 2:
                                p0 = p1;
                                c0 = c1;
                                p1 = +indexes[i];
                                if (hasColorInd && colPerVert) { c1 = +colorInd[i]; }
                                else if (hasColorInd && !colPerVert) { c1 = +colorInd[lineCnt]; }
                                else { c1 = p1; }

                                this._mesh._indices[0].push(cnt++, cnt++);

                                this._mesh._positions[0].push(positions[p0].x);
                                this._mesh._positions[0].push(positions[p0].y);
                                this._mesh._positions[0].push(positions[p0].z);
                                this._mesh._positions[0].push(positions[p1].x);
                                this._mesh._positions[0].push(positions[p1].y);
                                this._mesh._positions[0].push(positions[p1].z);

                                if (hasColor) {
                                    if (!colPerVert) {
                                        c0 = c1;
                                    }
                                    this._mesh._colors[0].push(colors[c0].r);
                                    this._mesh._colors[0].push(colors[c0].g);
                                    this._mesh._colors[0].push(colors[c0].b);
                                    this._mesh._colors[0].push(colors[c1].r);
                                    this._mesh._colors[0].push(colors[c1].g);
                                    this._mesh._colors[0].push(colors[c1].b);
                                }

                                lineCnt++;
                                break;
                            default:
                        }
                    }

                    //if the LineSet is too large for 16 bit indices, split it!
                    if (positions.length > x3dom.Utils.maxIndexableCoords)
                        this._mesh.splitMesh(2);
                } // if isMulti
                else
                {
                    var n = indexes.length;
                    t = 0;

                    for (i=0; i < n; ++i)
                    {
                        if (indexes[i] == -1) {
                            t = 0;
                            continue;
                        }

                        switch (t) {
                            case 0: p0 = +indexes[i]; t = 1; break;
                            case 1: p1 = +indexes[i]; t = 2; this._mesh._indices[0].push(p0, p1); break;
                            case 2: p0 = p1; p1 = +indexes[i]; this._mesh._indices[0].push(p0, p1); break;
                        }
                    }

                    this._mesh._positions[0] = positions.toGL();

                    if (hasColor) {
                        this._mesh._colors[0] = colors.toGL();
                        this._mesh._numColComponents = numColComponents;
                    }
                }

                this.invalidateVolume();
                this._mesh._numCoords = 0;

                for (i=0; i<this._mesh._indices.length; i++) {
                    this._mesh._numCoords += this._mesh._positions[i].length / 3;
                }

                var time1 = new Date().getTime() - time0;
                //x3dom.debug.logInfo("Mesh load time: " + time1 + " ms");
            },

            fieldChanged: function(fieldName)
            {
                var pnts = null;

                if (fieldName == "coord")
                {
                    pnts = this._cf.coord.node._vf.point;

                    this._mesh._positions[0] = pnts.toGL();

                    this.invalidateVolume();

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
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
                else if (fieldName == "coordIndex") {
                    this._mesh._indices[0] = [];

                    var indexes = this._vf.coordIndex;
                    var p0, p1, t = 0;

                    for (var i=0, n=indexes.length; i < n; ++i) {
                        if (indexes[i] == -1) {
                            t = 0;
                        }
                        else {
                            switch (t) {
                                case 0: p0 = +indexes[i]; t = 1; break;
                                case 1: p1 = +indexes[i]; t = 2; this._mesh._indices[0].push(p0, p1); break;
                                case 2: p0 = p1; p1 = +indexes[i]; this._mesh._indices[0].push(p0, p1); break;
                            }
                        }
                    }

                    this.invalidateVolume();

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.indexes = true;
                        node.invalidateVolume();
                    });
                }
            }
        }
    )
);