/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### HAnimSegment ###
x3dom.registerNodeType(
    "HAnimSegment",
    "H-Anim",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.HAnimSegment.superClass.call(this, ctx);

            this.addField_SFString(ctx,'name', "");
            this.addField_SFVec3f(ctx, 'centerOfMass', 0, 0, 0);
            this.addField_SFFloat(ctx, 'mass', 0);
            this.addField_MFFloat(ctx, 'momentsOfInertia', [0, 0, 0, 0, 0, 0, 0, 0, 0]);

            this.addField_SFNode('coord', x3dom.nodeTypes.X3DCoordinateNode);
            this.addField_MFNode('displacers', x3dom.nodeTypes.HAnimDisplacer);
        },
        {
            // TODO coord      add functionality
            // TODO displacers add functionality
        }
    )
);