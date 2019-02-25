/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### GeoCoordinate ### */
x3dom.registerNodeType(
    "GeoCoordinate",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DCoordinateNode,
        
        /**
         * Constructor for GeoCoordinate
         * @constructs x3dom.nodeTypes.GeoCoordinate
         * @x3d 3.3
         * @component Geospatial
         * @status full
         * @extends x3dom.nodeTypes.X3DCoordinateNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The GeoCoordinate node specifies a list of coordinates in a spatial reference frame.
         * It is used in the coord field of vertex-based geometry nodes including IndexedFaceSet, IndexedLineSet, and PointSet.
         */
        function (ctx) {
            x3dom.nodeTypes.GeoCoordinate.superClass.call(this, ctx);


            /**
             * The point array is used to contain the actual geospatial coordinates and should be provided in a format consistent with that specified for the particular geoSystem.
             * @var {x3dom.fields.MFVec3f} point
             * @memberof x3dom.nodeTypes.GeoCoordinate
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFVec3f(ctx, 'point', []);

            /**
             * The geoSystem field is used to define the spatial reference frame.
             * @var {x3dom.fields.MFString} geoSystem
             * @range {["GD", ...], ["UTM", ...], ["GC", ...]}
             * @memberof x3dom.nodeTypes.GeoCoordinate
             * @initvalue ['GD','WE']
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);

            /**
             * The geoOrigin field is used to specify a local coordinate frame for extended precision.
             * @var {x3dom.fields.SFNode} geoOrigin
             * @memberof x3dom.nodeTypes.GeoCoordinate
             * @initvalue x3dom.nodeTypes.GeoOrigin
             * @field x3dom
             * @instance
             */
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

                // default reference frame is GD WE
                return 'GD';
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
                var eastingFirst = this.isUTMEastingFirst(geoSystem);
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
                var fmua = 1 - esq*(0.25 + esq*(f3o64 + f5o256*esq));
                var fphi11 = e1*(1.5 - f27o32*e1sq);
                var fphi12 = e1sq*(f21o16 - f55o32*e1sq);
                
                var current, x, y, z, M, mu, phi1, cosphi1, C1, tanphi1, T1, T1sq;
                var esinphi1, oneesinphi1, N1, R1, D, Dsq, C1sq, phi, lng;
                
                for(var i=0; i<coords.length; ++i)
                {
                    x = (eastingFirst ? coords[i].x : coords[i].y);
                    y = (eastingFirst ? coords[i].y : coords[i].x);
                    //z = coords[i].z; //not used

                    //var M = M0 + y/k0; //Arc length along standard meridian.
                    //var M = y/k0;
                    //if (hemisphere == "S"){ M = M0 + (y - 10000000)/k; }
                    M = (hemisphere == "S" ? (y - 10000000) : y )/k0 ;
                    mu = M/(a * fmua);
                    phi1 = mu + fphi11*Math.sin(2*mu) + fphi12*Math.sin(4*mu); //Footprint Latitude
                    phi1 = phi1 + e1*(e1sq*(Math.sin(6*mu)*f151o96 + Math.sin(8*mu)*f1097o512));
                    cosphi1 = Math.cos(phi1);
                    C1 = e0sq*cosphi1*cosphi1;
                    tanphi1 = Math.tan(phi1);
                    T1 = tanphi1*tanphi1;
                    T1sq = T1*T1;
                    esinphi1 = e*Math.sin(phi1);
                    oneesinphi1 = 1 - esinphi1*esinphi1;
                    N1 = a/Math.sqrt(oneesinphi1);
                    R1 = N1*(1-esq)/oneesinphi1;
                    D = (x-500000)/(N1*k0);
                    Dsq = D*D;
                    C1sq = C1*C1;
                    phi = Dsq*(0.5 - Dsq*(5 + 3*T1 + 10*C1 - 4*C1sq - 9*e0sq)/24);
                    phi = phi + Math.pow(D,6)*(61 + 90*T1 + 298*C1 + 45*T1sq -252*e0sq - 3*C1sq)/720;
                    phi = phi1 - (N1*tanphi1/R1)*phi;
                    lng = D*(1 + Dsq*((-1 -2*T1 -C1)/6 + Dsq*(5 - 2*C1 + 28*T1 - 3*C1sq +8*e0sq + 24*T1sq)/120))/cosphi1;
                    current = new x3dom.fields.SFVec3f();
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

            //just used for GeoPositionInterpolator; after slerp
            //for coordinates in the same UTM zone stripe, linear interpolation is almost identical
            //so this is for correctness and if UTM zone is used outside stripe
            GCtoUTM: function(geoSystem, coords) {
                // geoSystem is target UTM
                // GCtoGD
                var coordsGD = this.GCtoGD(geoSystem, coords);
                // GDtoUTM
                // parse UTM projection parameters
                var utmzone = this.getUTMZone(geoSystem);
                if(utmzone < 1 || utmzone > 60 || utmzone === undefined)
                    return x3dom.debug.logError('invalid UTM zone: ' + utmzone + ' in geosystem ' + geoSystem);
                var hemisphere = this.getUTMHemisphere(geoSystem);
                var eastingFirst = this.isUTMEastingFirst(geoSystem);
                var elipsoide = this.getElipsoide(geoSystem);
                //below from U.W. Green Bay Prof. Dutch; returns coordinates in the input ell., not WGS84
                var a = elipsoide[1];
                var f = 1/elipsoide[2];
                var k0 = 0.9996; //scale on central meridian
                var b = a * (1 - f); //polar axis.
                var esq = (1 - (b/a)*(b/a)); //e squared for use in expansions
                var e = Math.sqrt(esq); //eccentricity
                //var e0 = e/Math.sqrt(1 - esq); //Called e prime in reference
                var e0sq = esq/(1 - esq); // e0 squared - always even powers
                //var e1 = (1 - Math.sqrt(1 - esq))/(1 + Math.sqrt(1 - esq)); //Called e1 in USGS PP 1395 also
                //var e1sq = e1*e1;
                var M0 = 0; //In case origin other than zero lat - not needed for standard UTM
                var deg2rad = Math.PI/180;
                var zcmrad = (3 + 6 * (utmzone - 1) - 180)*deg2rad; //Central meridian of zone
                var coordsUTM = new x3dom.fields.MFVec3f();
                var N, T, C, A, M, x, y, phi, lng, cosphi, tanphi, Asq;
                var i, current;
                var fMphi = 1 - esq*(1/4 + esq*(3/64 + 5*esq/256));
                var fM2phi = esq*(3/8 + esq*(3/32 + 45*esq/1024));
                var fM4phi = esq*esq*(15/256 + esq*45/1024);
                var fM6phi = esq*esq*esq*(35/3072);
                for (i=0; i<coordsGD.length; ++i) {
                    current = new x3dom.fields.SFVec3f();
                    phi = coordsGD[i].y*deg2rad;
                    lng = coordsGD[i].x*deg2rad;
                    cosphi = Math.cos(phi);
                    tanphi = Math.tan(phi);
                    
                    N = a/Math.sqrt(1 - Math.pow(e * Math.sin(phi), 2));
                    T = Math.pow(tanphi, 2);
                    C = e0sq*Math.pow(cosphi, 2);
                    A = (lng - zcmrad) * cosphi;
                    //Calculate M
                    M = phi*fMphi;
                    M = M - Math.sin(2*phi)*fM2phi;
                    M = M + Math.sin(4*phi)*fM4phi;
                    M = M - Math.sin(6*phi)*fM6phi;
                    M = M * a;//Arc length along standard meridian
                    //Calculate UTM Values
                    Asq = A*A;
                    x = k0*N*A*(1 + Asq*((1 - T + C)/6 + Asq*(5 - T*(18 + T) + 72*C - 58*e0sq)/120));//Easting relative to CM
                    x = x + 500000;//Easting standard 
                    y = k0*(M - M0 + N*tanphi*(Asq*(0.5 + Asq*((5 - T + 9*C + 4*C*C)/24 + Asq*(61 - T*(58 + T) + 600*C - 330*e0sq)/720))));//Northing from equator
                    if (y < 0) {
                        if (hemisphere == "N") {
                            x3dom.debug.logError('UTM zone in northern hemisphere but coordinates in southern!');
                        }
                        y = 10000000+y;}
                    current.x = eastingFirst ? x : y;
                    current.y = eastingFirst ? y : x;
                    current.z = coordsGD[i].z;
                    coordsUTM.push(current);
                }
                return coordsUTM;    
            },
            
            GDtoGC: function(geoSystem, coords) {

                var output = new x3dom.fields.MFVec3f();

                var elipsoide = this.getElipsoide(geoSystem);
                var A = elipsoide[1];
                var eccentricity = elipsoide[2];

                var longitudeFirst = this.isLogitudeFirst(geoSystem);

                // large parts of this code from freeWRL
                // var A = radius;
                var A2 = A*A;
                var F = 1.0/eccentricity;
                var C = A*(1.0-F);
                var C2 = C*C;
                var C2oA2 = C2/A2;
                var Eps2 = F*(2.0-F);
                //var Eps25 = 0.25*Eps2;

                var radiansPerDegree = 0.0174532925199432957692;
                
                var i, current, source_lat, source_lon, slat, slat2, clat, Rn, RnPh;

                // for (current in coords)
                for(i=0; i<coords.length; ++i)
                {
                    current = new x3dom.fields.SFVec3f();

                    source_lat = radiansPerDegree * (longitudeFirst == true ? coords[i].y : coords[i].x);
                    source_lon = radiansPerDegree * (longitudeFirst == true ? coords[i].x : coords[i].y);

                    slat = Math.sin(source_lat);
                    slat2 = slat*slat;
                    clat = Math.cos(source_lat);

                    /* square root approximation for Rn */
                    /* replaced by real sqrt
                     var Rn = A / ( (0.25 - Eps25 * slat2 + 0.9999944354799/4.0) +
                     (0.25-Eps25 * slat2)/(0.25 - Eps25 * slat2 + 0.9999944354799/4.0));
                     */

                    // with real sqrt; really slower ?
                    Rn = A / Math.sqrt(1.0 - Eps2 * slat2);

                    RnPh = Rn + coords[i].z;

                    current.x = RnPh * clat * Math.cos(source_lon);
                    current.y = RnPh * clat * Math.sin(source_lon);
                    current.z = (C2oA2 * Rn + coords[i].z) * slat;

                    output.push(current);
                }

                return output;
            },
            
            GCtoGD: function(geoSystem, coords) {
                // below uses http://info.ogp.org.uk/geodesy/guides/docs/G7-2.pdf
                var output = new x3dom.fields.MFVec3f();
                var rad2deg = 180/Math.PI;
                var ellipsoide = this.getElipsoide(geoSystem);
                var a = ellipsoide[1];
                var f = 1/ellipsoide[2];
                var b = a * (1 - f); //polar axis.
                var esq = (1 - (b/a)*(b/a)); //e squared for use in expansions
                //var e = Math.sqrt(esq); //eccentricity
                var eps = esq/(1 - esq);
                var i, current, x, y, z, p, q, lat, nu, elev, lon;
                for(i=0; i<coords.length; ++i) {
                    x = coords[i].x;
                    y = coords[i].y;
                    z = coords[i].z;
                    
                    p = Math.sqrt(x*x + y*y);
                    q = Math.atan((z * a) / (p * b));
                    lat = Math.atan((z + eps * b * Math.pow(Math.sin(q),3))/(p - esq * a * Math.pow(Math.cos(q),3)));
                    nu = a / Math.sqrt(1 - esq * Math.pow(Math.sin(lat),2));
                    elev = p/Math.cos(lat) - nu;
                    // atan2 gets the sign correct for longitude; is exact since in circular section
                    lon = Math.atan2(y, x);
                    
                    current = new x3dom.fields.SFVec3f();
                    current.x = lon * rad2deg;
                    current.y = lat * rad2deg;
                    current.z = elev;

                    output.push(current);
                }                
                return output;
            },
        
            GEOtoGC: function(geoSystem, geoOrigin, coords) {
                
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

            GCtoGEO: function(geoSystem, geoOrigin, coords) {
                
                var referenceFrame = this.getReferenceFrame(geoSystem);

                if(referenceFrame == 'GD') {
                    var coordsGD = this.GCtoGD(geoSystem, coords);
                    if(!this.isLogitudeFirst(geoSystem)) {
                        var currentx;
                        for(var i=0; i<coordsGD.length; ++i) {
                            currentx = coordsGD[i].x;
                            coordsGD[i].x = coordsGD[i].y;
                            coordsGD[i].y = currentx;
                        }
                    }
                    return coordsGD;
                }

                else if(referenceFrame == 'UTM')
                    return this.GCtoUTM(geoSystem, coords);

                else if(referenceFrame ==  'GC')
                {
                    // Performance Hack
                    // Normaly GCtoGD & GCtoUTM will create a copy
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

                var point = new x3dom.fields.SFVec3f();
                point.x = geoCoords.x;
                point.y = geoCoords.y;
                point.z = geoCoords.z;

                var temp = new x3dom.fields.MFVec3f();
                temp.push(point);

                // transform origin to GeoCentric
                var origin = this.GEOtoGC(geoSystem, geoOrigin, temp);

                return origin[0];
            },
            
            GCtoX3D: function(geoSystem, geoOrigin, coords)
            {
                // needs geoSystem since GC can have different ellipsoids
                var gc = coords;
                // transform by origin
                if(geoOrigin.node)
                {
                    // transform points by origin
                    var origin = this.OriginToGC(geoOrigin);
                    //avoid expensive matrix inversion by just subtracting origin
                    var matrix = x3dom.fields.SFMatrix4f.translation(origin.negate());
                    
                    //also rotate Y up if requested
                    if(geoOrigin.node._vf.rotateYUp)
                    {
                        //rotation is inverse of GeoLocation rotation, eg. Up to Y and N to -Z
                        var rotmat = x3dom.nodeTypes.GeoLocation.prototype.getGeoRotMat(geoSystem, origin).inverse();
                        //first translate, then rotate
                        matrix = rotmat.mult(matrix);
                    }
                    
                    for(var i=0; i<coords.length; ++i)
                        gc[i] = matrix.multMatrixPnt(coords[i]);
                }
                
                return gc;
            },

            GEOtoX3D: function(geoSystem, geoOrigin, coords)
            {
                // transform points to GeoCentric
                var gc = this.GEOtoGC(geoSystem, geoOrigin, coords);
                return this.GCtoX3D(geoSystem, geoOrigin, gc);               
            },

            getPoints: function()
            {
                return this.GEOtoX3D(this._vf.geoSystem, this._cf.geoOrigin, this._vf.point);
            }
        }
    )
);
