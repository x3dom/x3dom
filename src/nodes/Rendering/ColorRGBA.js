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
         * @x3d x.x
         * @component Rendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DColorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.ColorRGBA.superClass.call(this, ctx);


            /**
             *
             * @var {MFColorRGBA} color
             * @memberof x3dom.nodeTypes.ColorRGBA
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFColorRGBA(ctx, 'color', []);
        
        }
    )
);