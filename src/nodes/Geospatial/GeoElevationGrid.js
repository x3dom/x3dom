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
        function (ctx) {
            x3dom.nodeTypes.GeoElevationGrid.superClass.call(this, ctx);

            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);
            this.addField_SFVec3d(ctx, 'geoGridOrigin', 0, 0, 0);
            this.addField_MFDouble(ctx, 'height', 0, 0);
            this.addField_SFBool(ctx, 'ccw', true);
            //this.addField_SFBool(ctx, 'colorPerVertex', true);
            this.addField_SFDouble(ctx, 'creaseAngle', 0);
            //this.addField_SFBool(ctx, 'normalPerVertex', true);
            //this.addField_SFBool(ctx, 'solid', true);
            this.addField_SFInt32(ctx, 'xDimension', 0);
            this.addField_SFDouble(ctx, 'xSpacing', 1.0);
            this.addField_SFFloat(ctx, 'yScale', 1);
            this.addField_SFInt32(ctx, 'zDimension', 0);
            this.addField_SFDouble(ctx, 'zSpacing', 1.0);
            // this.addField_SFNode('color', x3dom.nodeTypes.PropertySetGeometry);
            // this.addField_SFNode('normal', x3dom.nodeTypes.PropertySetGeometry);
            // this.addField_SFNode('texCoord', x3dom.nodeTypes.PropertySetGeometry);
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.GeoOrigin);
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
                var ccw = this._vf.ccw;

                // coords, texture coords
                var delta_x = 1 / (xDimension-1);
                var delta_z = 1 / (zDimension-1);

                var positions = new x3dom.fields.MFVec3f();
                var texCoords = new x3dom.fields.MFVec2f();

                for(var z=0; z<zDimension; ++z)
                    for(var x=0; x<xDimension; ++x)
                    {
                        // texture coord
                        var tex_coord = new x3dom.fields.SFVec2f(x*delta_x, z*delta_z);
                        texCoords.push(tex_coord);

                        // coord
                        var coord = new x3dom.fields.SFVec3f();
                        if(longitude_first)
                        {
                            coord.x = x * xSpacing;
                            coord.y = z * zSpacing;
                        }
                        else
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
                            texCoordsFlat = new x3dom.fields.MFVec3f();

                        that.generateNonIndexedTriangleData(indices, transformed, null, texCoords, null,
                            positionsFlat, null, texCoordsFlat, null);

                        for (var i = 0; i < positionsFlat.length; ++i) {
                            indicesFlat.push(i);
                        }

                        that._mesh._indices[0]   = indicesFlat.toGL();
                        that._mesh._positions[0] = positionsFlat.toGL();
                        that._mesh._texCoords[0] = texCoordsFlat.toGL();
                    })();

                    this._mesh.calcNormals(0);
                }
                //smooth shading
                else {
                    this._mesh._indices[0]   = indices.toGL();
                    this._mesh._positions[0] = transformed.toGL();
                    this._mesh._texCoords[0] = texCoords.toGL();

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

                        t0.setValues(texCoords[i0]);
                        t1.setValues(texCoords[i1]);
                        t1.setValues(texCoords[i2]);

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