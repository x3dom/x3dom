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
         * @x3d 3.3
         * @component Rendering
         * @status full
         * @extends x3dom.nodeTypes.X3DGeometricPropertyNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Normal is a set of 3D surface-normal vectors Normal values are optional perpendicular directions, used per-polygon or per-vertex for lighting and shading.
         * Hint: used by IndexedFaceSet and ElevationGrid.
         */
        function (ctx) {
            x3dom.nodeTypes.Normal.superClass.call(this, ctx);


            /**
             * set of unit-length normal vectors, corresponding to indexed polygons or vertices.
             * @var {x3dom.fields.MFVec3f} vector
             * @range [-1, 1]
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