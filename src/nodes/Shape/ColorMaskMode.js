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
         * @extends x3dom.nodeTypes.X3DAppearanceChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The ColorMaskMode node affects drawing in RGBA mode. The 4 masks control whether the corresponding component is written.
         */
        function (ctx) {
            x3dom.nodeTypes.ColorMaskMode.superClass.call(this, ctx);


            /**
             * Masks r color channel.
             * @var {x3dom.fields.SFBool} maskR
             * @memberof x3dom.nodeTypes.ColorMaskMode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'maskR', true);

            /**
             * Masks g color channel.
             * @var {x3dom.fields.SFBool} maskG
             * @memberof x3dom.nodeTypes.ColorMaskMode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'maskG', true);

            /**
             * Masks b color channel.
             * @var {x3dom.fields.SFBool} maskB
             * @memberof x3dom.nodeTypes.ColorMaskMode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'maskB', true);

            /**
             * Masks a color channel.
             * @var {x3dom.fields.SFBool} maskA
             * @memberof x3dom.nodeTypes.ColorMaskMode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'maskA', true);
        
        }
    )
);