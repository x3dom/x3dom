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
         * @x3d 3.0
         * @component Rendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DColorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This node defines a set of RGBA colours to be used in the fields of another node.
         * RGBA color nodes are only used to specify multiple colours with alpha for a single geometric shape, such as colours for the faces or vertices of an IndexedFaceSet.
         */
        function (ctx) {
            x3dom.nodeTypes.ColorRGBA.superClass.call(this, ctx);


            /**
             * The set of RGBA colors
             * @var {MFColorRGBA} color
             * @memberof x3dom.nodeTypes.ColorRGBA
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFColorRGBA(ctx, 'color', []);
        
        }
    )
);