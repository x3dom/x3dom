/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

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