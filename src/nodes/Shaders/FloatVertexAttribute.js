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
         * @x3d x.x
         * @component Shaders
         * @status experimental
         * @extends x3dom.nodeTypes.X3DVertexAttributeNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.FloatVertexAttribute.superClass.call(this, ctx);


            /**
             *
             * @var {SFInt32} numComponents
             * @memberof x3dom.nodeTypes.FloatVertexAttribute
             * @initvalue 4
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'numComponents', 4);

            /**
             *
             * @var {MFFloat} value
             * @memberof x3dom.nodeTypes.FloatVertexAttribute
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'value', []);
        
        }
    )
);