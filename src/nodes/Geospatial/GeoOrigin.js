/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

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