/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DTextureCoordinateNode ### */
x3dom.registerNodeType(
    "X3DTextureCoordinateNode",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        function (ctx) {
            x3dom.nodeTypes.X3DTextureCoordinateNode.superClass.call(this, ctx);
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName === "texCoord" || fieldName === "point" ||
                    fieldName === "parameter" || fieldName === "mode")
                {
                    Array.forEach(this._parentNodes, function (node) {
                        node.fieldChanged("texCoord");
                    });
                }
            },

            parentAdded: function(parent) {
                if (parent._mesh && //parent._cf.coord.node &&
                    parent._cf.texCoord.node !== this) {
                    parent.fieldChanged("texCoord");
                }
            }
        }
    )
);