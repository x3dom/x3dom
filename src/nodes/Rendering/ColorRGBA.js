/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### ColorRGBA ### */
x3dom.registerNodeType(
    "ColorRGBA",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DColorNode,
        
        /**
         * Constructor for ColorRGBA
         * @constructs x3dom.nodeTypes.ColorRGBA
         * @x3d 3.3
         * @component Rendering
         * @status full
         * @extends x3dom.nodeTypes.X3DColorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This node defines a set of RGBA colours to be used in the fields of another node.
         * RGBA color nodes are only used to specify multiple colours with alpha for a single geometric shape, such as colours for the faces or vertices of an IndexedFaceSet.
         * A Material node is used to specify the overall material parameters of lit geometry.
         * If both a Material node and a ColorRGBA node are specified for a geometric shape, the colours shall replace the diffuse and transparency components of the material.
         * RGB or RGBA textures take precedence over colours; specifying both an RGB or RGBA texture and a ColorRGBA node for geometric shape will result in the ColorRGBA node being ignored.
         */
        function (ctx) {
            x3dom.nodeTypes.ColorRGBA.superClass.call(this, ctx);


            /**
             * The set of RGBA colors
             * @var {x3dom.fields.MFColorRGBA} color
             * @range [0, 1]
             * @memberof x3dom.nodeTypes.ColorRGBA
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFColorRGBA(ctx, 'color', []);
        
        }
    )
);