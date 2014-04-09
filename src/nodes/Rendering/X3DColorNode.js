/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DColorNode ### */
x3dom.registerNodeType(
    "X3DColorNode",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        function (ctx) {
            x3dom.nodeTypes.X3DColorNode.superClass.call(this, ctx);
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName === "color") {
                    Array.forEach(this._parentNodes, function (node) {
                        node.fieldChanged("color");
                    });
                }
            },

            parentAdded: function (parent) {
                if (parent._mesh && //parent._cf.coord.node &&
                    parent._cf.color.node !== this) {
                    parent.fieldChanged("color");
                }
            }
        }
    )
);