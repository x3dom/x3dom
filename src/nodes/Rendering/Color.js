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
         * @x3d x.x
         * @component Rendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DColorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Color.superClass.call(this, ctx);


            /**
             *
             * @var {MFColor} color
             * @memberof x3dom.nodeTypes.Color
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFColor(ctx, 'color', []);
        
        }
    )
);