/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */


// ### CADAssembly ###
x3dom.registerNodeType(
    "CADAssembly",
    "CADGeometry",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.CADAssembly.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'name', "");
        }
    )
);