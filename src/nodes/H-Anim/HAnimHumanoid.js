/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### HAnimHumanoid ###
x3dom.registerNodeType(
    "HAnimHumanoid",
    "H-Anim",
    defineClass(x3dom.nodeTypes.Transform,
        function (ctx) {
            x3dom.nodeTypes.HAnimHumanoid.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'name', "");
            this.addField_SFString(ctx, 'version', "");
            this.addField_MFString(ctx, 'info', []);

            this.addField_MFNode('joints', x3dom.nodeTypes.HAnimJoint);
            this.addField_MFNode('segments', x3dom.nodeTypes.HAnimSegment);
            this.addField_MFNode('sites', x3dom.nodeTypes.HAnimSite);
            this.addField_MFNode('skeleton', x3dom.nodeTypes.HAnimJoint);
            this.addField_MFNode('skin', x3dom.nodeTypes.X3DChildNode);
            this.addField_MFNode('skinCoord', x3dom.nodeTypes.X3DCoordinateNode);
            this.addField_MFNode('skinNormal', x3dom.nodeTypes.X3DNormalNode);
            this.addField_MFNode('viewpoints', x3dom.nodeTypes.HAnimSite);
        },
        {
            // TODO skeleton   contains the HumanoidRoot Joint object functionality: map similar to children of Group
            // TODO skeleton   add functionality for HAnimSite also (unaffected by internal transformations)
            // TODO joints     add functionality
            // TODO segments   add functionality
            // TODO sites      add functionality
            // TODO skin...    add functionality
            // TODO viewpoints add functionality
        }
    )
);