/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */
/* ### CustomAttributeNode ### */
x3dom.registerNodeType(
    "CustomAttributeNode",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,

        /**
         * Constructor for CustomAttributNode
         * @constructs x3dom.nodeTypes.CustomAttributNode
         * @x3d 3.2
         * @component Rendering
         * @status ?
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The threshold field allows to hide part of the mesh.
         * The hidden part is when the given is are higer or lower
         * than a given value
         */
        function (ctx) {
            x3dom.nodeTypes.CustomAttributeNode.superClass.call(this, ctx);
            /**
             * List of uniforms for the shaders
             * @var {x3dom.fields.MFNode} uniforms
             * @memberof x3dom.nodeTypes.X3DComposedGeometryNode
             * @initvalue x3dom.nodeTypes.X3DVertexAttributeNode
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('uniforms', x3dom.nodeTypes.Uniform);

            /**
             * Part of the vertex shaders to set the attributes and varing
             * @var {x3dom.fields.SFString} type
             * @memberof x3dom.nodeTypes.Field
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'vertexShaderPartInit', "");
            /**
             * Part of the vertex shaders main
             * @var {x3dom.fields.SFString} type
             * @memberof x3dom.nodeTypes.Field
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'vertexShaderPartMain', "");
            /**
             * Part of the fragment shaders to set the attributes and varing
             * @var {x3dom.fields.SFString} type
             * @memberof x3dom.nodeTypes.Field
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'fragmentShaderPartInit', "");
            /**
             * Part of the fragment shaders main
             * @var {x3dom.fields.SFString} type
             * @memberof x3dom.nodeTypes.Field
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'fragmentShaderPartMain', "");

        }
    )
);
