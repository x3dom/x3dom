/* ### GeoCoordinate ### */
x3dom.registerNodeType(
    "GeoCoordinate",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DCoordinateNode,
        function (ctx) {
            x3dom.nodeTypes.GeoCoordinate.superClass.call(this, ctx);

            this.addField_MFVec3f(ctx, 'point', []);
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.GeoOrigin);
            
            this.elipsoideParameters = {
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
            };
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {
                Array.forEach(this._parentNodes, function (node) {
                    node.fieldChanged("coord");
                });
            },
            
            GDtoGC: function(geoSystem, coords) {
            
              var referenceFrame = 'GD';
              var earthElipsoide = geoSystem[1];
              var longLatOrder   = geoSystem[2];
              
              var radius = this.elipsoideParameters[earthElipsoide][1];
              var eccentricity = this.elipsoideParameters[earthElipsoide][2];
              var longitudeFirst = longLatOrder;

              // large parts of this code from freeWRL
              var A = radius;
              var A2 = radius*radius;
              var F = 1.0/eccentricity;
              var C = A*(1.0 - F);
              var C2 = C*C;
              var Eps2 = F*(2.0 - F);
              var Eps25 = 0.25 * Eps2;
              
              var radiansPerDegree = 0.0174532925199432957692;

              // for (current in coords)
              for (var i=0; i<coords.length; ++i)
              {
                var source_lat = radiansPerDegree * (longitudeFirst == true ? coords[i].y : coords[i].x);
                var source_lon = radiansPerDegree * (longitudeFirst == true ? coords[i].x : coords[i].y);

                var slat = Math.sin(source_lat);
                var slat2 = slat*slat;
                var clat = Math.cos(source_lat);

                /* square root approximation for Rn */
                var Rn = A / ( (0.25 - Eps25 * slat2 + 0.9999944354799/4.0) + (0.25-Eps25 * slat2)/(0.25 - Eps25 * slat2 + 0.9999944354799/4.0));

                var RnPh = Rn + coords[i].z;

                coords[i].x = RnPh * clat * Math.cos(source_lon);
                coords[i].y = RnPh * clat * Math.sin(source_lon);
                coords[i].z = ((C2 / A2) * Rn + coords[i].z) * slat;
              }
            },
            
            getPoints: function() {
              var transformed = new x3dom.fields.MFVec3f(this._vf.point);
              var geoSystem = this._cf.geoOrigin.node._vf.geoSystem;
              
              if(geoSystem[0] == 'GD')
                this.GDtoGC(this._cf.geoOrigin.node._vf.geoSystem, transformed);
              
              return transformed;
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

            this.addField_MFString(ctx, 'geoSystem', 'GD','WE');
            this.addField_SFVec3d(ctx, 'geoGridOrigin', 0, 0, 0);
            this.addField_MFDouble(ctx, 'height', 0, 0);
            this.addField_SFBool(ctx, 'ccw', true);
            this.addField_SFBool(ctx, 'colorPerVertex', true);
            this.addField_SFDouble(ctx, 'creaseAngle', 0);
            this.addField_SFBool(ctx, 'normalPerVertex', true);
            this.addField_SFBool(ctx, 'solid', true);
            this.addField_SFInt32(ctx, 'xDimension', 0);
            this.addField_SFDouble(ctx, 'xSpacing', 1.0);
            this.addField_SFFloat(ctx, 'yScale', 1);
            this.addField_SFInt32(ctx, 'zDimension', 0);
            this.addField_SFDouble(ctx, 'zSpacing', 1.0);
            this.addField_SFNode('color', x3dom.nodeTypes.PropertySetGeometry);
            this.addField_SFNode('normal', x3dom.nodeTypes.PropertySetGeometry);
            this.addField_SFNode('texCoord', x3dom.nodeTypes.PropertySetGeometry);
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.PropertySetGeometry);
            this.addField_SFBool(ctx, 'lit', true);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### GeoLOD ### */
x3dom.registerNodeType(
    "GeoLOD",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.GeoLOD.superClass.call(this, ctx);

            this.addField_MFString(ctx, 'geoSystem', 'GD','WE');
            this.addField_MFString(ctx, 'rootUrl', []);
            this.addField_MFString(ctx, 'child1Url', []);
            this.addField_MFString(ctx, 'child2Url', []);
            this.addField_MFString(ctx, 'child3Url', []);
            this.addField_MFString(ctx, 'child4Url', []);
            this.addField_SFVec3d(ctx, 'center', 0, 0, 0);
            this.addField_SFFloat(ctx, 'range', 10);
            this.addField_SFString(ctx, 'referenceBindableDescription', []);
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.ChildGroup);
            this.addField_SFNode('rootNode', x3dom.nodeTypes.ChildGroup);
            this.addField_SFString(ctx, 'triggerName', Synchronize);
            this.addField_SFNode('privateChild1Node', x3dom.nodeTypes.ChildGroup);
            this.addField_SFNode('privateChild2Node', x3dom.nodeTypes.ChildGroup);
            this.addField_SFNode('privateChild3Node', x3dom.nodeTypes.ChildGroup);
            this.addField_SFNode('privateChild4Node', x3dom.nodeTypes.ChildGroup);
            this.addField_SFNode('privateRootNode', x3dom.nodeTypes.ChildGroup);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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

            this.addField_MFString(ctx, 'geoSystem', 'GD','WE');
            this.addField_SFVec3d(ctx, 'geoCoords', 0, 0, 0);
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.ChildGroup);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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
            this.addField_MFNode('data', x3dom.nodeTypes.InfoNode);
            this.addField_MFString(ctx, 'summary', []);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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

            this.addField_MFString(ctx, 'geoSystem', 'GD', 'WE');
            this.addField_SFVec3d(ctx, 'geoCoords', 0, 0, 0);
            this.addField_SFBool(ctx, 'rotateYUp', false);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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

            this.addField_MFString(ctx, 'geoSystem', 'GD','WE');
            this.addField_MFVec3d(ctx, 'keyValue', []);
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.LinearInterpolator);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### GeoProximitySensor ### */
x3dom.registerNodeType(
    "GeoProximitySensor",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DEnvironmentalSensorNode,
        function (ctx) {
            x3dom.nodeTypes.GeoProximitySensor.superClass.call(this, ctx);

            this.addField_SFVec3d(ctx, 'geoCenter', 0, 0, 0);
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.EnvironmentSensor);
            this.addField_MFString(ctx, 'geoSystem', 'GD','WE');
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### GeoTouchSensor ### */
x3dom.registerNodeType(
    "GeoTouchSensor",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DTouchSensorNode,
        function (ctx) {
            x3dom.nodeTypes.GeoTouchSensor.superClass.call(this, ctx);

            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.TouchSensor);
            this.addField_MFString(ctx, 'geoSystem', 'GD','WE');
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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
            this.addField_MFString(ctx, 'geoSystem', 'GD','WE');
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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

            this.addField_MFString(ctx, 'geoSystem', 'GD','WE');
            this.addField_SFFloat(ctx, 'fieldOfView', 0.785398);
            this.addField_SFRotation(ctx, 'orientation', 0, 0, 1, 0);
            this.addField_SFVec3d(ctx, 'position', 0, 0, 100000);
            this.addField_SFBool(ctx, 'headlight', true);
            this.addField_MFString(ctx, 'navType', EXAMINE);
            this.addField_SFFloat(ctx, 'speedFactor', 1.0);
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.ViewBindable);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);
