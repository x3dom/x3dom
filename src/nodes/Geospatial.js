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


/* ### GeoCoordinate ### */
x3dom.registerNodeType(
    "GeoCoordinate",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DCoordinateNode,
        function (ctx) {
            x3dom.nodeTypes.GeoCoordinate.superClass.call(this, ctx);

            this.addField_MFVec3f(ctx, 'point', []);
            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.GeoOrigin);
        },
        {
            elipsoideParameters:
            {
                'AA' : [ 'Airy 1830', '6377563.396', '299.3249646' ],
                'AM' : [ 'Modified Airy', '6377340.189', '299.3249646' ],
                'AN' : [ 'Australian National', '6378160', '298.25' ],
                'BN' : [ 'Bessel 1841 (Namibia)', '6377483.865', '299.1528128' ],
                'BR' : [ 'Bessel 1841 (Ethiopia Indonesia...)', '6377397.155', '299.1528128' ],
                'CC' : [ 'Clarke 1866', '6378206.4', '294.9786982' ],
                'CD' : [ 'Clarke 1880', '6378249.145', '293.465' ],
                'EA' : [ 'Everest (India 1830)', '6377276.345', '300.8017' ],
                'EB' : [ 'Everest (Sabah & Sarawak)', '6377298.556', '300.8017' ],
                'EC' : [ 'Everest (India 1956)', '6377301.243', '300.8017' ],
                'ED' : [ 'Everest (W. Malaysia 1969)', '6377295.664', '300.8017' ],
                'EE' : [ 'Everest (W. Malaysia & Singapore 1948)', '6377304.063', '300.8017' ],
                'EF' : [ 'Everest (Pakistan)', '6377309.613', '300.8017' ],
                'FA' : [ 'Modified Fischer 1960', '6378155', '298.3' ],
                'HE' : [ 'Helmert 1906', '6378200', '298.3' ],
                'HO' : [ 'Hough 1960', '6378270', '297' ],
                'ID' : [ 'Indonesian 1974', '6378160', '298.247' ],
                'IN' : [ 'International 1924', '6378388', '297' ],
                'KA' : [ 'Krassovsky 1940', '6378245', '298.3' ],
                'RF' : [ 'Geodetic Reference System 1980 (GRS 80)', '6378137', '298.257222101' ],
                'SA' : [ 'South American 1969', '6378160', '298.25' ],
                'WD' : [ 'WGS 72', '6378135', '298.26' ],
                'WE' : [ 'WGS 84', '6378137', '298.257223563' ]
            },
            
            fieldChanged: function(fieldName) {
                if (fieldName == "point" || fieldName == "geoSystem") {
                    Array.forEach(this._parentNodes, function (node) {
                        node.fieldChanged("coord");
                    });
                }
            },

            isLogitudeFirst: function(geoSystem) {
              for(var i=0; i<geoSystem.length; ++i)
                if(geoSystem[i] == 'longitude_first')
                  return true;
              
              return false;
            },

            getElipsoideCode: function(geoSystem)
            {
              for(var i=0; i<geoSystem.length; ++i)
              {
                var code = geoSystem[i];
                if(this.elipsoideParameters[code])
                  return code;
              }
              //default elipsoide code
              return 'WE';
            },

            getElipsoide: function(geoSystem)
            {
              return this.elipsoideParameters[this.getElipsoideCode(geoSystem)];
            },

            getReferenceFrame: function(geoSystem)
            {
              for(var i=0; i<geoSystem.length; ++i)
              {
                var code = geoSystem[i];

                if(code == 'GD' || code == 'GDC')
                  return 'GD';
                if(code == 'GC' || code == 'GCC')
                  return 'GC';
                if(code == 'UTM')
                  return 'UTM';

                else
                  x3dom.debug.logError('Unknown GEO system: [' + geoSystem + ']');
              }

              // default elipsoide
              return this.elipsoideParameters['WE'];
            },

            getUTMZone: function(geoSystem)
            {
              for(var i=0; i<geoSystem.length; ++i)
                {
                  var code = geoSystem[i];

                  if(code[0] == 'Z')
                    return code.substring(1);
                }
              // no zone found
              x3dom.debug.logError('no UTM zone but is required:' + geoSystem);
            },

            getUTMHemisphere: function(geoSystem)
            {
              for(var i=0; i<geoSystem.length; ++i)
                {
                  var code = geoSystem[i];

                  if(code == 'S')
                    return code;
                }
              // North by default according to spec
              return 'N';
            },

            isUTMEastingFirst: function(geoSystem)
            {
              for(var i=0; i<geoSystem.length; ++i)
                {
                  var code = geoSystem[i];
                  if(code == 'easting_first')
                    return true;
                }
              // Northing first by default according to spec
              return false;
            },

            UTMtoGC: function(geoSystem, coords)
            {
              //parse UTM projection parameters             
              var utmzone = this.getUTMZone(geoSystem);
              if(utmzone < 1 || utmzone > 60 || utmzone === undefined) 
                return x3dom.debug.logError('invalid UTM zone: ' + utmzone + ' in geosystem ' + geoSystem);
              var hemisphere = this.getUTMHemisphere(geoSystem);
              var elipsoide = this.getElipsoide(geoSystem);
              //below from U.W. Green Bay Prof. Dutch; returns coordinates in the input ell., not WGS84
              var a = elipsoide[1];
              var f = 1/elipsoide[2];
              var k0 = 0.9996; //scale on central meridian
              var b = a * (1 - f); //polar axis.
              var esq = (1 - (b/a)*(b/a)); //e squared for use in expansions
              var e = Math.sqrt(esq); //eccentricity
              var e0 = e/Math.sqrt(1 - esq); //Called e prime in reference
              var e0sq = esq/(1 - esq); // e0 squared - always even powers
              var zcm = 3 + 6 * (utmzone - 1) - 180; //Central meridian of zone
              var e1 = (1 - Math.sqrt(1 - esq))/(1 + Math.sqrt(1 - esq)); //Called e1 in USGS PP 1395 also
              var e1sq = e1*e1;
              //var M0 = 0; //In case origin other than zero lat - not needed for standard UTM
              var output = new x3dom.fields.MFVec3f();
              var rad2deg = 180/Math.PI;

              var f3o64 = 3/64;
              var f5o256 = 5/256;
              var f27o32 = 27/32;
              var f21o16 = 21/16;
              var f55o32 = 55/32;
              var f151o96 = 151/96;
              var f1097o512 = 1097/512;
              
              
              for(var i=0; i<coords.length; ++i)
              {
                var x = (eastingFirst ? coords[i].x : coords[i].y);
                var y = (eastingFirst ? coords[i].y : coords[i].x);
                var z = coords[i].z;
                
                var current = new x3dom.fields.SFVec3f();
                //var M = M0 + y/k0; //Arc length along standard meridian. 
                //var M = y/k0;
                //if (hemisphere == "S"){ M = M0 + (y - 10000000)/k; }
                var M = (hemisphere == "S" ? (y - 10000000) : y )/k0 ;
                //TODO: compute constant factors outside
                var mu = M/(a * (1 - esq*(0.25 + esq*(f3o64 + f5o256*esq))));
                var phi1 = mu + e1*(1.5 - f27o32*e1sq)*Math.sin(2*mu) + e1sq*(f21o16 - f55o32*e1sq)*Math.sin(4*mu); //Footprint Latitude
                phi1 = phi1 + e1*(e1sq*(Math.sin(6*mu)*f151o96 + Math.sin(8*mu)*f1097o512));
                //
                var cosphi1 = Math.cos(phi1);
                var C1 = e0sq*cosphi1*cosphi1;
                var tanphi1 = Math.tan(phi1);
                var T1 = tanphi1*tanphi1;
                var T1sq = T1*T1;
                var esinphi1 = e*Math.sin(phi1);
                var oneesinphi1 = 1 - esinphi1*esinphi1;
                var N1 = a/Math.sqrt(oneesinphi1);
                var R1 = N1*(1-e*e)/oneesinphi1;
                var D = (x-500000)/(N1*k0);
                var Dsq = D*D;
                var C1sq = C1*C1;
                var phi = Dsq*(0.5 - Dsq*(5 + 3*T1 + 10*C1 - 4*C1sq - 9*e0sq)/24);
                phi = phi + Math.pow(D,6)*(61 + 90*T1 + 298*C1 + 45*T1sq -252*e0sq - 3*C1sq)/720;
                phi = phi1 - (N1*tanphi1/R1)*phi;
                var lng = D*(1 + Dsq*((-1 -2*T1 -C1)/6 + Dsq*(5 - 2*C1 + 28*T1 - 3*C1sq +8*e0sq + 24*T1sq)/120))/cosphi1;
                current.x = zcm + rad2deg*lng;
                current.y = rad2deg*phi;
                current.z = coords[i].z;
                output.push(current);
              }
              //x3dom.debug.logInfo('transformed coords ' + output);
              
              //GD to GC and return
              var GDgeoSystem = new x3dom.fields.MFString();
              // there may be a better way to construct this geoSystem
              GDgeoSystem.push("GD");
              GDgeoSystem.push(this.getElipsoideCode(geoSystem));
              GDgeoSystem.push("longitude_first");
              return this.GDtoGC(GDgeoSystem, output);             
            },
            
            GDtoGC: function(geoSystem, coords) {
            
              var output = new x3dom.fields.MFVec3f();
              
              var elipsoide = this.getElipsoide(geoSystem);
              var radius = elipsoide[1];
              var eccentricity = elipsoide[2];

              var longitudeFirst = this.isLogitudeFirst(geoSystem);

              // large parts of this code from freeWRL
              var A = radius;
              var A2 = radius*radius;
              var F = 1.0/eccentricity;
              var C = A*(1.0-F);
              var C2 = C*C;
              var Eps2 = F*(2.0-F);
              var Eps25 = 0.25*Eps2;
              
              var radiansPerDegree = 0.0174532925199432957692;

              // for (current in coords)
              for(var i=0; i<coords.length; ++i)
              {
                var current = new x3dom.fields.SFVec3f();
                
                var source_lat = radiansPerDegree * (longitudeFirst == true ? coords[i].y : coords[i].x);
                var source_lon = radiansPerDegree * (longitudeFirst == true ? coords[i].x : coords[i].y);

                var slat = Math.sin(source_lat);
                var slat2 = slat*slat;
                var clat = Math.cos(source_lat);

                /* square root approximation for Rn */
                /* replaced by real sqrt
                var Rn = A / ( (0.25 - Eps25 * slat2 + 0.9999944354799/4.0) + 
                        (0.25-Eps25 * slat2)/(0.25 - Eps25 * slat2 + 0.9999944354799/4.0));
                */

                // with real sqrt; really slower ?
                var Rn = A / Math.sqrt(1.0 - Eps2 * slat2);

                var RnPh = Rn + coords[i].z;
                
                current.x = RnPh * clat * Math.cos(source_lon);
                current.y = RnPh * clat * Math.sin(source_lon);
                current.z = ((C2 / A2) * Rn + coords[i].z) * slat;

                output.push(current);
              }
              
              return output;
            },

            GEOtoGC: function(geoSystem, geoOrigin, coords)
            {
              var referenceFrame = this.getReferenceFrame(geoSystem);

              if(referenceFrame == 'GD')
                return this.GDtoGC(geoSystem, coords);
              
              else if(referenceFrame == 'UTM')
                return this.UTMtoGC(geoSystem, coords);

              else if(referenceFrame ==  'GC')
              {
                // Performance Hack
                // Normaly GDtoGC & UTMtoGC will create a copy
                // If we are already in GC & have an origin: we have to copy here
                // Else Origin will change original DOM elements

                if(geoOrigin.node)
                {
                  var copy = new x3dom.fields.MFVec3f();
                  for(var i=0; i<coords.length; ++i)
                  {
                    var current = new x3dom.fields.SFVec3f();
                    
                    current.x = coords[i].x;
                    current.y = coords[i].y;
                    current.z = coords[i].z;
                    
                    copy.push(current);
                  }
                  return copy;
                }
                else
                  return coords;
              }
              else {
                x3dom.debug.logError('Unknown geoSystem: ' + geoSystem[0]);
                return new x3dom.fields.MFVec3f();
              }
            },

            OriginToGC: function(geoOrigin)
            {
              // dummy function to send a scalar to an array function
              var geoCoords = geoOrigin.node._vf.geoCoords;
              var geoSystem = geoOrigin.node._vf.geoSystem;

              var point = new x3dom.fields.SFVec3f;
              point.x = geoCoords.x;
              point.y = geoCoords.y;
              point.z = geoCoords.z;

              var temp = new x3dom.fields.MFVec3f;
              temp.push(point);

              // transform origin to GeoCentric
              var origin = this.GEOtoGC(geoSystem, geoOrigin, temp);
              
              return origin[0];
            },

            GEOtoX3D: function(geoSystem, geoOrigin, coords)
            {
              // transform points to GeoCentric
              var gc = this.GEOtoGC(geoSystem, geoOrigin, coords);

              // transform by origin
              if(geoOrigin.node)
              {
                // transform points by origin
                var origin = this.OriginToGC(geoOrigin);

                var matrix = x3dom.fields.SFMatrix4f.translation(origin);
                matrix = matrix.inverse();

                for(var i=0; i<coords.length; ++i)
                  gc[i] = matrix.multMatrixPnt(gc[i]);
              }

              return gc;
            },
            
            getPoints: function()
            {
              return this.GEOtoX3D(this._vf.geoSystem, this._cf.geoOrigin, this._vf.point);
            }
        }
    )
);

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

/* ### GeoLOD ### */
x3dom.registerNodeType(
    "GeoLOD",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DLODNode,
        function (ctx) {
            x3dom.nodeTypes.GeoLOD.superClass.call(this, ctx);

            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);
            this.addField_MFString(ctx, 'rootUrl', []);
            this.addField_MFString(ctx, 'child1Url', []);
            this.addField_MFString(ctx, 'child2Url', []);
            this.addField_MFString(ctx, 'child3Url', []);
            this.addField_MFString(ctx, 'child4Url', []);
            //this.addField_SFVec3d(ctx, 'center', 0, 0, 0);
            this.addField_SFFloat(ctx, 'range', 10);
            this.addField_SFString(ctx, 'referenceBindableDescription', []);
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.X3DChildNode);
            this.addField_SFNode('rootNode', x3dom.nodeTypes.X3DChildNode);
            this.addField_SFNode('privateChild1Node', x3dom.nodeTypes.X3DChildNode);
            this.addField_SFNode('privateChild2Node', x3dom.nodeTypes.X3DChildNode);
            this.addField_SFNode('privateChild3Node', x3dom.nodeTypes.X3DChildNode);
            this.addField_SFNode('privateChild4Node', x3dom.nodeTypes.X3DChildNode);
            this.addField_SFNode('privateRootNode', x3dom.nodeTypes.X3DChildNode);
        }
    )
);

/* ### GeoLocation ### */
x3dom.registerNodeType(
    "GeoLocation",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.GeoLocation.superClass.call(this, ctx);

            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);
            this.addField_SFVec3d(ctx, 'geoCoords', 0, 0, 0);
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.X3DChildNode);
        }
    )
);

/* ### GeoMetadata ### */
x3dom.registerNodeType(
    "GeoMetadata",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DInfoNode,
        function (ctx) {
            x3dom.nodeTypes.GeoMetadata.superClass.call(this, ctx);

            this.addField_MFString(ctx, 'url', []);
            this.addField_MFNode('data', x3dom.nodeTypes.X3DInfoNode);
            this.addField_MFString(ctx, 'summary', []);
        }
    )
);

/* ### GeoOrigin ### */
x3dom.registerNodeType(
    "GeoOrigin",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.GeoOrigin.superClass.call(this, ctx);

            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);
            this.addField_SFVec3d(ctx, 'geoCoords', 0, 0, 0);
            this.addField_SFBool(ctx, 'rotateYUp', false);
        }
    )
);

/* ### GeoPositionInterpolator ### */
x3dom.registerNodeType(
    "GeoPositionInterpolator",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        function (ctx) {
            x3dom.nodeTypes.GeoPositionInterpolator.superClass.call(this, ctx);

            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);
            this.addField_MFVec3d(ctx, 'keyValue', []);
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.X3DInterpolatorNode);
        }
    )
);

/* ### GeoTransform ### */
x3dom.registerNodeType(
    "GeoTransform",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.GeoTransform.superClass.call(this, ctx);

            this.addField_SFVec3d(ctx, 'geoCenter', 0, 0, 0);
            this.addField_SFRotation(ctx, 'rotation', 0, 0, 1, 0);
            this.addField_SFVec3f(ctx, 'scale', 1, 1, 1);
            this.addField_SFRotation(ctx, 'scaleOrientation', 0, 0, 1, 0);
            this.addField_SFVec3f(ctx, 'translation', 0, 0, 0);
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.Transform);
            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);
        }
    )
);

/* ### GeoViewpoint ### */
x3dom.registerNodeType(
    "GeoViewpoint",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DViewpointNode,
        function (ctx) {
            x3dom.nodeTypes.GeoViewpoint.superClass.call(this, ctx);

            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);
            this.addField_SFFloat(ctx, 'fieldOfView', 0.785398);
            this.addField_SFRotation(ctx, 'orientation', 0, 0, 1, 0);
            this.addField_SFVec3d(ctx, 'position', 0, 0, 100000);
            this.addField_SFBool(ctx, 'headlight', true);
            this.addField_MFString(ctx, 'navType', 'EXAMINE');
            this.addField_SFFloat(ctx, 'speedFactor', 1.0);
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.X3DViewpointNode);
        }
    )
);
