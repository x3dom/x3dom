/* ### GeoCoordinate ### */
x3dom.registerNodeType(
    "GeoCoordinate",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DCoordinateNode,
        function (ctx) {
            x3dom.nodeTypes.GeoCoordinate.superClass.call(this, ctx);

            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.X3DCoordinateNode);
            this.addField_MFString(ctx, 'geoSystem', 'GD','WE');
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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
            this.addField_SFBool(ctx, 'ccw', TRUE);
            this.addField_SFBool(ctx, 'colorPerVertex', TRUE);
            this.addField_SFDouble(ctx, 'creaseAngle', 0);
            this.addField_SFBool(ctx, 'normalPerVertex', TRUE);
            this.addField_SFBool(ctx, 'solid', TRUE);
            this.addField_SFInt32(ctx, 'xDimension', 0);
            this.addField_SFDouble(ctx, 'xSpacing', 1.0);
            this.addField_SFFloat(ctx, 'yScale', 1);
            this.addField_SFInt32(ctx, 'zDimension', 0);
            this.addField_SFDouble(ctx, 'zSpacing', 1.0);
            this.addField_SFNode('color', x3dom.nodeTypes.PropertySetGeometry);
            this.addField_SFNode('normal', x3dom.nodeTypes.PropertySetGeometry);
            this.addField_SFNode('texCoord', x3dom.nodeTypes.PropertySetGeometry);
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.PropertySetGeometry);
            this.addField_SFBool(ctx, 'lit', TRUE);
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

            this.addField_MFString(ctx, 'geoSystem', 'GD','WE');
            this.addField_SFVec3d(ctx, 'geoCoords', 0, 0, 0);
            this.addField_SFBool(ctx, 'rotateYUp', FALSE);
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
            this.addField_SFBool(ctx, 'headlight', TRUE);
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
