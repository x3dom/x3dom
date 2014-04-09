/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### GeoLocation ### */
x3dom.registerNodeType(
    "GeoLocation",
    "Geospatial",
    //was X3DGroupingNode which is how the node is defined in the spec
    defineClass(x3dom.nodeTypes.X3DTransformNode,
        function (ctx) {
            x3dom.nodeTypes.GeoLocation.superClass.call(this, ctx);

            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);
            this.addField_SFVec3d(ctx, 'geoCoords', 0, 0, 0);
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.X3DChildNode);

            // similar to what transform in Grouping.js does
            var position = this._vf.geoCoords;
            var geoSystem = this._vf.geoSystem;
            var geoOrigin = this._cf.geoOrigin;

            this._trafo =  this.getGeoTransRotMat(geoSystem, geoOrigin, position);
        },
        {
            getGeoRotMat: function (positionGC)
            {
                //returns transformation matrix to align coordinate system with geoposition as required:
                //2 rotations to get required orientation
                //Up (Y) to skywards, and depth (-Z) to North
                //1) around X to point up by
                //angle between Z and new up plus 90
                //(angle between Z and orig. up)
                //2) around Z to get orig. up on longitude

                var newUp = positionGC.normalize();
                var Xaxis = new  x3dom.fields.SFVec3f(1,0,0);
                // below uses geocentric latitude but only geodetic latitude would give exact tangential plane
                // http://info.ogp.org.uk/geodesy/guides/docs/G7-2.pdf
                // has formulas for deriving geodetic latitude, eg a GCtoGD function

                var rotlat = Math.PI - Math.asin(newUp.z); // latitude as asin of z; only valid for spheres
                var rotUpQuat = new x3dom.fields.Quaternion.axisAngle(Xaxis, rotlat);
                var rotlon = Math.PI/2 + Math.atan2(newUp.y, newUp.x);// 90 to get to prime meridian; atan2 gets the sign correct for longitude; is exact since in circular section
                var Zaxis = new x3dom.fields.SFVec3f(0,0,1);
                var rotZQuat = new x3dom.fields.Quaternion.axisAngle(Zaxis, rotlon);
                //return rotZQuat.toMatrix().mult(rotUpQuat.toMatrix();
                return rotZQuat.multiply(rotUpQuat).toMatrix();

            },
            getGeoTransRotMat: function (geoSystem, geoOrigin, position)
            {
                //accept geocoords, returntranslation/rotation transform matrix
                var coords = new x3dom.fields.MFVec3f();
                coords.push(position);

                var transformed = x3dom.nodeTypes.GeoCoordinate.prototype.GEOtoX3D(geoSystem, geoOrigin, coords)[0];
                var rotMat = this.getGeoRotMat(transformed);
                return x3dom.fields.SFMatrix4f.translation(transformed).mult(rotMat);

            },
            //mimic what transform node does
            fieldChanged: function (fieldName)
            {
                if (fieldName == "geoSystem" || fieldName == "geoCoords" ||
                    fieldName == "geoOrigin")
                {
                    var position = this._vf.geoCoords;
                    var geoSystem = this._vf.geoSystem;
                    var geoOrigin = this._cf.geoOrigin;
                    this._trafo =  this.getGeoTransRotMat(geoSystem, geoOrigin, position);

                    this.invalidateVolume();
                    //this.invalidateCache();
                }
                else if (fieldName == "render") {
                    this.invalidateVolume();
                    //this.invalidateCache();
                }
            }
            //deal with geolocation in geolocation here? behaviour is undefined in spec

        }
    )
);