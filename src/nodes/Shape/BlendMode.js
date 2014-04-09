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
         * @status experimental
         * @extends x3dom.nodeTypes.X3DAppearanceChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.BlendMode.superClass.call(this, ctx);


            /**
             *
             * @var {SFString} srcFactor
             * @memberof x3dom.nodeTypes.BlendMode
             * @initvalue "src_alpha"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'srcFactor', "src_alpha");

            /**
             *
             * @var {SFString} destFactor
             * @memberof x3dom.nodeTypes.BlendMode
             * @initvalue "one_minus_src_alpha"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'destFactor', "one_minus_src_alpha");

            /**
             *
             * @var {SFColor} color
             * @memberof x3dom.nodeTypes.BlendMode
             * @initvalue 1,1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'color', 1, 1, 1);

            /**
             *
             * @var {SFFloat} colorTransparency
             * @memberof x3dom.nodeTypes.BlendMode
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'colorTransparency', 0);

            /**
             *
             * @var {SFString} alphaFunc
             * @memberof x3dom.nodeTypes.BlendMode
             * @initvalue "none"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'alphaFunc', "none");

            /**
             *
             * @var {SFFloat} alphaFuncValue
             * @memberof x3dom.nodeTypes.BlendMode
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'alphaFuncValue', 0);

            /**
             *
             * @var {SFString} equation
             * @memberof x3dom.nodeTypes.BlendMode
             * @initvalue "none"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'equation', "none");
        
        }
    )
);