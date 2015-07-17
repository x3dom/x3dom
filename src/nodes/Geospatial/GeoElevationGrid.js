/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### GeoElevationGrid ### */
x3dom.registerNodeType(
    "GeoElevationGrid",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        
        /**
         * Constructor for GeoElevationGrid
         * @constructs x3dom.nodeTypes.GeoElevationGrid
         * @x3d 3.3
         * @component Geospatial
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The GeoElevationGrid node specifies a uniform grid of elevation values within some spatial reference frame.
         * These are then transparently transformed into a geocentric, curved-earth representation.
         */
        function (ctx) {
            x3dom.nodeTypes.GeoElevationGrid.superClass.call(this, ctx);

            /**
            * The texCoord field specifies per-vertex texture coordinates for the GeoElevationGrid node. If texCoord is NULL, default texture coordinates are applied to the geometry.
            * @var {x3dom.fields.SFNode} texCoord
            * @memberof x3dom.nodeTypes.GeoElevationGrid
            * @initvalue x3dom.nodeTypes.X3DTextureCoordinateNode
            * @field x3d
            * @instance
            */
            this.addField_SFNode('texCoord', x3dom.nodeTypes.X3DTextureCoordinateNode);

            /**
             * The geoSystem field is used to define the spatial reference frame.
             * @var {x3dom.fields.MFString} geoSystem
             * @range {["GD", ...], ["UTM", ...], ["GC", ...]}
             * @memberof x3dom.nodeTypes.GeoElevationGrid
             * @initvalue ['GD','WE']
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);

            /**
             * The geoGridOrigin field specifies the geographic coordinate for the south-west corner (bottom-left) of the dataset.
             * @var {x3dom.fields.SFVec3d} geoGridOrigin
             * @memberof x3dom.nodeTypes.GeoElevationGrid
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'geoGridOrigin', 0, 0, 0);

            /**
             * The height array contains xDimension × zDimension floating point values that represent elevation above the ellipsoid or the geoid, as appropriate.
             * These values are given in row-major order from west to east, south to north.
             * @var {x3dom.fields.MFDouble} height
             * @memberof x3dom.nodeTypes.GeoElevationGrid
             * @initvalue 0,0
             * @field x3d
             * @instance
             */
            this.addField_MFDouble(ctx, 'height', 0, 0);

            /**
             * The ccw field defines the ordering of the vertex coordinates of the geometry with respect to user-given or automatically generated normal vectors used in the lighting model equations.
             * @var {x3dom.fields.SFBool} ccw
             * @memberof x3dom.nodeTypes.GeoElevationGrid
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'ccw', true);
            //this.addField_SFBool(ctx, 'colorPerVertex', true);

            /**
             * The creaseAngle field affects how default normals are generated.
             * If the angle between the geometric normals of two adjacent faces is less than the crease angle, normals shall be calculated so that the faces are shaded smoothly across the edge; otherwise, normals shall be calculated so that a lighting discontinuity across the edge is produced.
             * Crease angles shall be greater than or equal to 0.0 angle base units.
             * @var {x3dom.fields.SFDouble} creaseAngle
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.GeoElevationGrid
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFDouble(ctx, 'creaseAngle', 0);
            //this.addField_SFBool(ctx, 'normalPerVertex', true);
            //this.addField_SFBool(ctx, 'solid', true);

            /**
             * Defines the grid size in x.
             * @var {x3dom.fields.SFInt32} xDimension
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.GeoElevationGrid
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, 'xDimension', 0);

            /**
             * When the geoSystem is "GD", xSpacing refers to the number of units of longitude in angle base units between adjacent height values.
             * When the geoSystem is "UTM", xSpacing refers to the number of eastings (length base units) between adjacent height values
             * @var {x3dom.fields.SFDouble} xSpacing
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.GeoElevationGrid
             * @initvalue 1.0
             * @field x3d
             * @instance
             */
            this.addField_SFDouble(ctx, 'xSpacing', 1.0);

            /**
             * The yScale value can be used to produce a vertical exaggeration of the data when it is displayed. If this value is set greater than 1.0, all heights will appear larger than actual.
             * @var {x3dom.fields.SFFloat} yScale
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.GeoElevationGrid
             * @initvalue 1
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'yScale', 1);

            /**
             * Defines the grid size in z.
             * @var {x3dom.fields.SFInt32} zDimension
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.GeoElevationGrid
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, 'zDimension', 0);

            /**
             * When the geoSystem is "GD", zSpacing refers to the number of units of latitude in angle base units between vertical height values.
             * When the geoSystem is "UTM", zSpacing refers to the number of northings (length base units) between vertical height values.
             * @var {x3dom.fields.SFDouble} zSpacing
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.GeoElevationGrid
             * @initvalue 1.0
             * @field x3d
             * @instance
             */
            this.addField_SFDouble(ctx, 'zSpacing', 1.0);
            // this.addField_SFNode('color', x3dom.nodeTypes.PropertySetGeometry);
            // this.addField_SFNode('normal', x3dom.nodeTypes.PropertySetGeometry);
            // this.addField_SFNode('texCoord', x3dom.nodeTypes.PropertySetGeometry);

            /**
             * The geoOrigin field is used to specify a local coordinate frame for extended precision.
             * @var {x3dom.fields.SFNode} geoOrigin
             * @memberof x3dom.nodeTypes.GeoElevationGrid
             * @initvalue x3dom.nodeTypes.GeoOrigin
             * @field x3d
             * @instance
             */
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.GeoOrigin);

            /**
             * Specifies whether this geometry should be rendered with or without lighting.
             * @var {x3dom.fields.SFBool} lit
             * @memberof x3dom.nodeTypes.GeoElevationGrid
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'lit', true);
        
        },
        {
            nodeChanged: function()
            {
                var geoSystem = this._vf.geoSystem;
                var geoOrigin = this._cf.geoOrigin;

                var height = this._vf.height;

                var yScale = this._vf.yScale;
                var xDimension = this._vf.xDimension;
                var zDimension = this._vf.zDimension;
                var xSpacing = this._vf.xSpacing;
                var zSpacing = this._vf.zSpacing;
                var geoGridOrigin = this._vf.geoGridOrigin;

                // check for no height == dimensions
                if(height.length !== (xDimension * zDimension))
                    x3dom.debug.logError('GeoElevationGrid: height.length(' + height.length +
                        ') != x/zDimension(' + xDimension + '*' + zDimension + ')');

                var longitude_first = x3dom.nodeTypes.GeoCoordinate.prototype.isLogitudeFirst(geoSystem);
                var easting_first = x3dom.nodeTypes.GeoCoordinate.prototype.isUTMEastingFirst(geoSystem);
                
                var ccw = this._vf.ccw;

                // coords, texture coords
                var delta_x = 1 / (xDimension-1);
                var delta_z = 1 / (zDimension-1);
                
                //from elevationgrid.js
                var numTexComponents = 2;

                var texCoordNode = this._cf.texCoord.node;
                var texPoints;
                if (x3dom.isa(texCoordNode, x3dom.nodeTypes.MultiTextureCoordinate)) {
                    if (texCoordNode._cf.texCoord.nodes.length)
                        texCoordNode = texCoordNode._cf.texCoord.nodes[0];
                }

                if (texCoordNode) {
                    if (texCoordNode._vf.point) {
                        texPoints = texCoordNode._vf.point;
                        if (x3dom.isa(texCoordNode, x3dom.nodeTypes.TextureCoordinate3D)) {
                            numTexComponents = 3;
                        }
                    }
                }
                
                var positions = new x3dom.fields.MFVec3f();
                        
                var texCoords = new x3dom.fields.MFVec2f();
                        
                for(var z=0; z<zDimension; ++z)
                    for(var x=0; x<xDimension; ++x)
                    {
                        // texture coord
                        var tex_coord = new x3dom.fields.SFVec2f();
                        tex_coord.x = x*delta_x;
                        tex_coord.y = z*delta_z;
                        texCoords.push(tex_coord);

                        // coord
                        var coord = new x3dom.fields.SFVec3f();
                        if(longitude_first||easting_first)
                        {
                            coord.x = x * xSpacing;
                            coord.y = z * zSpacing;
                        }
                        else
                        // xSpacing is always east-west axis but geoSystem wants x north-south 
                        {
                            coord.x = z * zSpacing;
                            coord.y = x * xSpacing;
                        }
                        coord.z = height[(z*xDimension)+x] * yScale;
                        coord = coord.add(geoGridOrigin);
                        positions.push(coord);
                    }

                // indices
                var indices = new x3dom.fields.MFInt32();
                for(var z=0; z<(zDimension-1); z++)
                {
                    for(var x=0; x<(xDimension-1); x++)
                    {
                        var p0 = x + (z * xDimension);
                        var p1 = x + (z * xDimension) + 1;
                        var p2 = x + ((z + 1) * xDimension) + 1;
                        var p3 = x + ((z + 1) * xDimension);

                        if(ccw)
                        {
                            indices.push(p0);
                            indices.push(p1);
                            indices.push(p2);

                            indices.push(p0);
                            indices.push(p2);
                            indices.push(p3);
                        }
                        else
                        {
                            indices.push(p0);
                            indices.push(p3);
                            indices.push(p2);

                            indices.push(p0);
                            indices.push(p2);
                            indices.push(p1);
                        }
                    }
                }

                // convert to x3dom coord system
                var transformed = x3dom.nodeTypes.GeoCoordinate.prototype.GEOtoX3D(geoSystem, geoOrigin, positions);

                //if we want flat shading, we have to duplicate some vertices here
                //(as webgl does only support single-indexed rendering)
                if (this._vf.creaseAngle <= x3dom.fields.Eps) {

                    var that = this;

                    (function (){
                        var indicesFlat   = new x3dom.fields.MFInt32(),
                            positionsFlat = new x3dom.fields.MFVec3f(),
                            texCoordsFlat = new x3dom.fields.MFVec2f(); //typo? was 3f

                        if (texPoints) {
                            that.generateNonIndexedTriangleData(indices, transformed, null, texPoints, null,
                            positionsFlat, null, texCoordsFlat, null);
                        }
                        else {
                            that.generateNonIndexedTriangleData(indices, transformed, null, texCoords, null,
                            positionsFlat, null, texCoordsFlat, null);
                        }
                        for (var i = 0; i < positionsFlat.length; ++i) {
                            indicesFlat.push(i);
                        }

                        that._mesh._indices[0]   = indicesFlat.toGL();
                        that._mesh._positions[0] = positionsFlat.toGL();
                        that._mesh._texCoords[0] = texCoordsFlat.toGL();
                        that._mesh._numTexComponents = 2; //3 not yet generated
                    })();

                    this._mesh.calcNormals(0);
                }
                //smooth shading
                else {
                    this._mesh._indices[0]   = indices.toGL();
                    this._mesh._positions[0] = transformed.toGL();
                    if (texPoints)  {this._mesh._texCoords[0] = texPoints.toGL();}
                    else            {this._mesh._texCoords[0] = texCoords.toGL();}
                    this._mesh._numTexComponents = numTexComponents;
                    this._mesh.calcNormals(Math.PI);
                }

                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
            },

            generateNonIndexedTriangleData: function(indices, positions, normals, texCoords, colors,
                                                     newPositions, newNormals, newTexCoords, newColors)
            {
                //@todo: add support for RGBA colors and 3D texture coordinates
                //@todo: if there is any need for that, add multi-index support

                for (var i = 0; i < indices.length; i+=3) {
                    var i0 = indices[i  ],
                        i1 = indices[i+1],
                        i2 = indices[i+2];

                    if (positions) {
                        var p0 = new x3dom.fields.SFVec3f(),
                            p1 = new x3dom.fields.SFVec3f(),
                            p2 = new x3dom.fields.SFVec3f();

                        p0.setValues(positions[i0]);
                        p1.setValues(positions[i1]);
                        p2.setValues(positions[i2]);

                        newPositions.push(p0);
                        newPositions.push(p1);
                        newPositions.push(p2);
                    }

                    if (normals) {
                        var n0 = new x3dom.fields.SFVec3f(),
                            n1 = new x3dom.fields.SFVec3f(),
                            n2 = new x3dom.fields.SFVec3f();

                        n0.setValues(normals[i0]);
                        n1.setValues(normals[i1]);
                        n2.setValues(normals[i2]);

                        newNormals.push(n0);
                        newNormals.push(n1);
                        newNormals.push(n2);
                    }

                    if (texCoords) {
                        var t0 = new x3dom.fields.SFVec2f(),
                            t1 = new x3dom.fields.SFVec2f(),
                            t2 = new x3dom.fields.SFVec2f();

                        t0.setValues(texCoords[i0]);//ignores .z if 3d
                        t1.setValues(texCoords[i1]);
                        t2.setValues(texCoords[i2]); //typo? was t1

                        newTexCoords.push(t0);
                        newTexCoords.push(t1);
                        newTexCoords.push(t2);
                    }

                    if (colors) {
                        var c0 = new x3dom.fields.SFVec3f(),
                            c1 = new x3dom.fields.SFVec3f(),
                            c2 = new x3dom.fields.SFVec3f();

                        c0.setValues(texCoords[i0]);
                        c1.setValues(texCoords[i1]);
                        c1.setValues(texCoords[i2]);

                        newColors.push(c0);
                        newColors.push(c1);
                        newColors.push(c2);
                    }
                }
            }
        }
    )
);
