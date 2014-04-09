/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Normal ### */
x3dom.registerNodeType(
    "Normal",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        
        /**
         * Constructor for Normal
         * @constructs x3dom.nodeTypes.Normal
         * @x3d x.x
         * @component Rendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometricPropertyNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Normal.superClass.call(this, ctx);


            /**
             *
             * @var {MFVec3f} vector
             * @memberof x3dom.nodeTypes.Normal
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFVec3f(ctx, 'vector', []);
        
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName === "normal" || fieldName === "vector") {
                    Array.forEach(this._parentNodes, function (node) {
                        node.fieldChanged("normal");
                    });
                }
            },

            parentAdded: function (parent) {
                if (parent._mesh && //parent._cf.coord.node &&
                    parent._cf.normal.node !== this) {
                    parent.fieldChanged("normal");
                }
            }
        }
    )
);