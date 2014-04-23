/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DVertexAttributeNode ### */
x3dom.registerNodeType(
    "X3DVertexAttributeNode",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        
        /**
         * Constructor for X3DVertexAttributeNode
         * @constructs x3dom.nodeTypes.X3DVertexAttributeNode
         * @x3d 3.3
         * @component Shaders
         * @status full
         * @extends x3dom.nodeTypes.X3DGeometricPropertyNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This abstract node type is the base type for all node types that specify per-vertex attribute
         *  information to the shader.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DVertexAttributeNode.superClass.call(this, ctx);


            /**
             * The name field describes a name that is mapped to the shading language-specific name for describing
             *  per-vertex data. The appropriate shader language annex contains language-specific binding information.
             * @var {x3dom.fields.SFString} name
             * @memberof x3dom.nodeTypes.X3DVertexAttributeNode
             * @initvalue ""
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'name', "");
        
        }
    )
);