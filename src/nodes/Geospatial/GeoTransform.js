/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

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