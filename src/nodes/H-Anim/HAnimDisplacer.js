/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### HAnimDisplacer ###
x3dom.registerNodeType(
    "HAnimDisplacer",
    "H-Anim",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        function (ctx) {
            x3dom.nodeTypes.HAnimDisplacer.superClass.call(this, ctx);

            this.addField_SFString(ctx,'name', "");
            this.addField_SFFloat(ctx, 'weight', 0);
            this.addField_MFInt32(ctx, 'coordIndex', []);
            this.addField_MFVec3f(ctx, 'displacements', []);

            // TODO displacement (add functionality e.g. via matrix palette skinning in shader)
            x3dom.debug.logWarning("HAnimDisplacer NYI!");
        }
    )
);