/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### BlendMode ### */
x3dom.registerNodeType(
    "BlendMode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        
        /**
         * Constructor for BlendMode
         * @constructs x3dom.nodeTypes.BlendMode
         * @x3d x.x
         * @component Shape
         * @extends x3dom.nodeTypes.X3DAppearanceChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The BlendMode controls blending and alpha test.
         * Pixels can be drawn using a function that blends the incoming (source) RGBA values with the RGBA values that are already in the frame buffer (the destination values).
         */
        function (ctx) {
            x3dom.nodeTypes.BlendMode.superClass.call(this, ctx);


            /**
             * The incoming pixel is scaled according to the method defined by the source factor.
             * @var {x3dom.fields.SFString} srcFactor
             * @range [none, zero, one, dst_color, src_color, one_minus_dst_color, one_minus_src_color, src_alpha, one_minus_src_alpha, dst_alpha, one_minus_dst_alpha, src_alpha_saturate, constant_color, one_minus_constant_color, constant_alpha, one_minus_constant_alpha]
             * @memberof x3dom.nodeTypes.BlendMode
             * @initvalue "src_alpha"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'srcFactor', "src_alpha");

            /**
             * The frame buffer pixel is scaled according to the method defined by the destination factor.
             * @var {x3dom.fields.SFString} destFactor
             * @range [none, zero, one, dst_color, src_color, one_minus_dst_color, one_minus_src_color, src_alpha, one_minus_src_alpha, dst_alpha, one_minus_dst_alpha, src_alpha_saturate, constant_color, one_minus_constant_color, constant_alpha, one_minus_constant_alpha]
             * @memberof x3dom.nodeTypes.BlendMode
             * @initvalue "one_minus_src_alpha"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'destFactor', "one_minus_src_alpha");

            /**
             * This is the constant color used by blend modes constant.
             * @var {x3dom.fields.SFColor} color
             * @memberof x3dom.nodeTypes.BlendMode
             * @initvalue 1,1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'color', 1, 1, 1);

            /**
             * This is the constant alpha used by blend modes constant.
             * @var {x3dom.fields.SFFloat} colorTransparency
             * @memberof x3dom.nodeTypes.BlendMode
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'colorTransparency', 0);

            /**
             *
             * @var {x3dom.fields.SFString} alphaFunc
             * @memberof x3dom.nodeTypes.BlendMode
             * @initvalue "none"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'alphaFunc', "none");

            /**
             * The alphaFunc defines how fragments which do not fulfill a certain condition are handled.
             * @var {x3dom.fields.SFFloat} alphaFuncValue
             * @range [none, never, less, equal, lequal, greater, notequal, gequal, always]
             * @memberof x3dom.nodeTypes.BlendMode
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'alphaFuncValue', 0);

            /**
             * An additional equation used to combine source, destination and the constant value.
             * @var {x3dom.fields.SFString} equation
             * @range [none, func_add, func_subtract, func_reverse_subtract, min, max, logic_op]
             * @memberof x3dom.nodeTypes.BlendMode
             * @initvalue "none"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'equation', "none");
        
        }
    )
);