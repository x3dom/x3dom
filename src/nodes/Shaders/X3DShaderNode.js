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
         * @x3d 3.3
         * @component Shaders
         * @status experimental
         * @extends x3dom.nodeTypes.X3DAppearanceChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This abstract node type is the base type for all node types that specify a programmable shader.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DShaderNode.superClass.call(this, ctx);


            /**
             * The language field is used to indicate to the browser which shading language is used for the source
             *  file(s). This field may be used as a hint for the browser if the shading language is not immediately
             *  determinable from the source (e.g., a generic MIME type of text/plain is returned). A browser may use
             *  this field for determining which node instance will be selected and to ignore languages that it is not
             *  capable of supporting. Three basic language types are defined for this specification and others may be
             *  optionally supported by a browser.
             * @var {x3dom.fields.SFString} language
             * @memberof x3dom.nodeTypes.X3DShaderNode
             * @initvalue ""
             * @range ["Cg"|"GLSL"|"HLSL"|...]
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'language', "");
        
        }
    )
);