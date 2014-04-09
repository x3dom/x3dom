/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### CADPart ###
// According to the CADGeometry specification,
// the CADPart node has transformation fields identical to
// those used in the Transform node, therefore just inherit it
x3dom.registerNodeType(
    "CADPart",
    "CADGeometry",
    defineClass(x3dom.nodeTypes.Transform,
        function (ctx) {
            x3dom.nodeTypes.CADPart.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'name', "");
        }
    )
);