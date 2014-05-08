/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Color ### */
x3dom.registerNodeType(
    "Color",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DColorNode,
        
        /**
         * Constructor for Color
         * @constructs x3dom.nodeTypes.Color
         * @x3d 3.3
         * @component Rendering
         * @status full
         * @extends x3dom.nodeTypes.X3DColorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This node defines a set of RGB colors to be used in the fields of another node.
         * Color nodes are only used to specify multiple colours for a single geometric shape, such as colours for the faces or vertices of an IndexedFaceSet.
         * A Material node is used to specify the overall material parameters of lit geometry.
         * If both a Material node and a Color node are specified for a geometric shape, the colours shall replace the diffuse component of the material.
         * RGB or RGBA textures take precedence over colours; specifying both an RGB or RGBA texture and a Color node for geometric shape will result in the Color node being ignored.
         */
        function (ctx) {
            x3dom.nodeTypes.Color.superClass.call(this, ctx);


            /**
             * The RGB colors.
             * @var {x3dom.fields.MFColor} color
             * @range [0, 1]
             * @memberof x3dom.nodeTypes.Color
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFColor(ctx, 'color', []);
        
        }
    )
);