/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### HAnimJoint ###
x3dom.registerNodeType(
    "HAnimJoint",
    "H-Anim",
    defineClass(x3dom.nodeTypes.Transform,
        function (ctx) {
            x3dom.nodeTypes.HAnimJoint.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'name', "");
            this.addField_MFNode('displacers', x3dom.nodeTypes.HAnimDisplacer);

            this.addField_SFRotation(ctx, 'limitOrientation', 0, 0, 1, 0);
            this.addField_MFFloat(ctx, 'llimit', []);
            this.addField_MFFloat(ctx, 'ulimit', []);
            this.addField_MFInt32(ctx, 'skinCoordIndex', []);
            this.addField_MFFloat(ctx, 'skinCoordWeight', []);
        }
    )
);