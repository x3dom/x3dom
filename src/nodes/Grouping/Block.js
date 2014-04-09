/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### Block ###
x3dom.registerNodeType(
    "Block",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Block.superClass.call(this, ctx);

            this.addField_MFString(ctx, 'nameSpaceName', []);
        }
    )
);