/** @namespace x3dom.nodeTypes */
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
        
        /**
         * Constructor for IndexedLineSet
         * @constructs x3dom.nodeTypes.IndexedLineSet
         * @x3d 3.3
         * @component Rendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc IndexedLineSet is a geometry node that can contain a Color node and a Coordinate node.
         * Color values or a Material emissiveColor is used to draw lines and points. Lines are not lit, are not texture-mapped, and do not participate in collision detection.
         * Hint: use a different color (or emissiveColor) than the background color.
         * Hint: if rendering Coordinate points originally defined for an IndexedFaceSet, index values may need to repeat each initial vertex to close each polygon outline.
         * Hint: insert a Shape node before adding geometry or Appearance. You can also substitute a type-matched ProtoInstance for content.
         */
        function (ctx) {
            x3dom.nodeTypes.IndexedLineSet.superClass.call(this, ctx);


            /**
             * Whether Color node is applied per vertex (true) or per polygon (false).
             * @var {x3dom.fields.SFBool} colorPerVertex
             * @memberof x3dom.nodeTypes.IndexedLineSet
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'colorPerVertex', true);  // TODO


            /**
             * If the "attrib" field is not empty it shall contain a list of per-vertex attribute information for programmable shaders
             * @var {x3dom.fields.MFNode} attrib
             * @memberof x3dom.nodeTypes.IndexedLineSet
             * @initvalue x3dom.nodeTypes.X3DVertexAttributeNode
             * @field x3d
             * @instance
             */
            this.addField_MFNode('attrib', x3dom.nodeTypes.X3DVertexAttributeNode);

            /**
             * Coordinate node specifiying the vertices used by the geometry.
             * @var {x3dom.fields.SFNode} coord
             * @memberof x3dom.nodeTypes.IndexedLineSet
             * @initvalue x3dom.nodeTypes.X3DCoordinateNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode('coord', x3dom.nodeTypes.X3DCoordinateNode);

            /**
             * If NULL the geometry is rendered using the Material and texture defined in the Appearance node. If not NULL the field shall contain a Color node whose colours are applied depending on the value of "colorPerVertex".
             * @var {x3dom.fields.SFNode} color
             * @memberof x3dom.nodeTypes.IndexedLineSet
             * @initvalue x3dom.nodeTypes.X3DColorNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode('color', x3dom.nodeTypes.X3DColorNode);


            /**
             * coordIndex indices provide order in which coordinates are applied.
             * Order starts at index 0, commas are optional between sets, use -1 to separate indices for each polyline.
             * Hint: if rendering Coordinate points originally defined for an IndexedFaceSet, index values may need to repeat initial each initial vertex to close the polygons.
             * @var {x3dom.fields.MFInt32} coordIndex
             * @range [0, inf] or -1
             * @memberof x3dom.nodeTypes.IndexedLineSet
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFInt32(ctx, 'coordIndex', []);

            /**
             * colorIndex indices provide order in which colors are applied.
             * Hint: if rendering Coordinate points originally defined for an IndexedFaceSet, index values may need to repeat initial each initial vertex to close the polygons.
             * @var {x3dom.fields.MFInt32} colorIndex
             * @range [0, inf] or -1
             * @memberof x3dom.nodeTypes.IndexedLineSet
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFInt32(ctx, 'colorIndex', []);

            this._mesh._primType = 'LINES';
            x3dom.Utils.needLineWidth = true;
        
        },
        {

            _buildGeometry: function ()
            {
                var time0 = new Date().getTime();

                // this.handleAttribs();

                var indexes = this._vf.coordIndex;
                var colorInd = this._vf.colorIndex;

                var hasColor = false, hasColorInd = false;

                // TODO; implement colorPerVertex also for single index
                var colPerVert = this._vf.colorPerVertex;

                if (colorInd.length == indexes.length)
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
                        //Ignore out of Range Indices
                        if(indexes[i] > positions.length-1)
                        {
                            continue;
                        }

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

            nodeChanged: function()
            {
                this._buildGeometry();
            },

            fieldChanged: function(fieldName)
            {
                var pnts = null;

                if (fieldName == "coord")
                {
                    this._buildGeometry();

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        node.invalidateVolume();
                    });
                }
                else if (fieldName == "color")
                {
                    this._buildGeometry();

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.colors = true;
                    });
                }
                else if (fieldName == "coordIndex") {
                    this._buildGeometry();

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.indexes = true;
                        node.invalidateVolume();
                    });
                }
                else if (fieldName == "colorIndex") {
                    this._buildGeometry();

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.colors = true;
                        node.invalidateVolume();
                    });
                }
            }
        }
    )
);