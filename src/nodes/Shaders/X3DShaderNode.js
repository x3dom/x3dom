/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DShaderNode ### */
x3dom.registerNodeType(
    "X3DShaderNode",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        
        /**
         * Constructor for X3DShaderNode
         * @constructs x3dom.nodeTypes.X3DShaderNode
         * @x3d x.x
         * @component Shaders
         * @status experimental
         * @extends x3dom.nodeTypes.X3DAppearanceChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DShaderNode.superClass.call(this, ctx);


            /**
             *
             * @var {SFString} language
             * @memberof x3dom.nodeTypes.X3DShaderNode
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'language', "");
        
        }
    )
);