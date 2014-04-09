/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

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