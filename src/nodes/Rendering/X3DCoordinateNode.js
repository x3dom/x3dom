/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DCoordinateNode ### */
x3dom.registerNodeType(
    "X3DCoordinateNode",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        
        /**
         * Constructor for X3DCoordinateNode
         * @constructs x3dom.nodeTypes.X3DCoordinateNode
         * @x3d 3.3
         * @component Rendering
         * @status full
         * @extends x3dom.nodeTypes.X3DGeometricPropertyNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This is the base node type for all coordinate node types in X3D.
         * All coordinates are specified in nodes derived from this abstract node type.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DCoordinateNode.superClass.call(this, ctx);
        
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName === "coord" || fieldName === "point") {
                    Array.forEach(this._parentNodes, function (node) {
                        node.fieldChanged("coord");
                    });
                }
            },

            parentAdded: function (parent) {
                if (parent._mesh && parent._cf.coord.node !== this) {
                    parent.fieldChanged("coord");
                }
            }
        }
    )
);