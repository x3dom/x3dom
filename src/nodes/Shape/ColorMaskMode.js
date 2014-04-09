/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### ColorMaskMode ### */
x3dom.registerNodeType(
    "ColorMaskMode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        
        /**
         * Constructor for ColorMaskMode
         * @constructs x3dom.nodeTypes.ColorMaskMode
         * @x3d x.x
         * @component Shape
         * @status experimental
         * @extends x3dom.nodeTypes.X3DAppearanceChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.ColorMaskMode.superClass.call(this, ctx);


            /**
             *
             * @var {SFBool} maskR
             * @memberof x3dom.nodeTypes.ColorMaskMode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'maskR', true);

            /**
             *
             * @var {SFBool} maskG
             * @memberof x3dom.nodeTypes.ColorMaskMode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'maskG', true);

            /**
             *
             * @var {SFBool} maskB
             * @memberof x3dom.nodeTypes.ColorMaskMode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'maskB', true);

            /**
             *
             * @var {SFBool} maskA
             * @memberof x3dom.nodeTypes.ColorMaskMode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'maskA', true);
        
        }
    )
);