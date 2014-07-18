/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### FloatVertexAttribute ### */
x3dom.registerNodeType(
    "FloatVertexAttribute",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DVertexAttributeNode,
        
        /**
         * Constructor for FloatVertexAttribute
         * @constructs x3dom.nodeTypes.FloatVertexAttribute
         * @x3d 3.3
         * @component Shaders
         * @status experimental
         * @extends x3dom.nodeTypes.X3DVertexAttributeNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The FloatVertexAttribute node defines a set of per-vertex single-precision floating point
         *  attributes.
         */
        function (ctx) {
            x3dom.nodeTypes.FloatVertexAttribute.superClass.call(this, ctx);


            /**
             * The numComponents field specifies how many consecutive floating point values should be grouped together
             *  per vertex. The length of the value field shall be a multiple of numComponents.
             * @var {x3dom.fields.SFInt32} numComponents
             * @memberof x3dom.nodeTypes.FloatVertexAttribute
             * @initvalue 4
             * @range [1..4]
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, 'numComponents', 4);

            /**
             * The value field specifies an arbitrary collection of floating point values that will be passed to the
             *  shader as per-vertex information. The specific type mapping to the individual shading language data
             *  types is in the appropriate language-specific annex.
             * @var {x3dom.fields.MFFloat} value
             * @memberof x3dom.nodeTypes.FloatVertexAttribute
             * @initvalue []
             * @range (-inf, inf)
             * @field x3d
             * @instance
             */
            this.addField_MFFloat(ctx, 'value', []);
        
        }
    )
);