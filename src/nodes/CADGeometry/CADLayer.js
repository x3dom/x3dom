/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### CADLayer ###
x3dom.registerNodeType(
    "CADLayer",
    "CADGeometry",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.CADLayer.superClass.call(this, ctx);

            this.addField_SFString(ctx,'name', "");
            // to be implemented: the 'visible' field
            // there already is a 'render' field defined in base class
            // which basically defines visibility...
            // NOTE: bbox stuff also already defined in a base class!
        }
    )
);
