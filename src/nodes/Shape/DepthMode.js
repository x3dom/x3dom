/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### DepthMode ### */
x3dom.registerNodeType(
    "DepthMode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        
        /**
         * Constructor for DepthMode
         * @constructs x3dom.nodeTypes.DepthMode
         * @x3d x.x
         * @component Shape
         * @extends x3dom.nodeTypes.X3DAppearanceChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The depth mode contains the parameters that are specific for depth control, like the value used for depth buffer comparisons.
         */
        function (ctx) {
            x3dom.nodeTypes.DepthMode.superClass.call(this, ctx);


            /**
             * Whether the depth test should be enabled or not.
             * @var {x3dom.fields.SFBool} enableDepthTest
             * @memberof x3dom.nodeTypes.DepthMode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'enableDepthTest', true);

            /**
             * The depth function to use. If "none", it's not changed, the default is "lequal".
             * @var {x3dom.fields.SFString} depthFunc
             * @range [NONE, NEVER, LESS, EQUAL, LEQUAL, GREATER, NOTEQUAL, GEQUAL, ALWAYS]
             * @memberof x3dom.nodeTypes.DepthMode
             * @initvalue "none"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'depthFunc', "none");

            /**
             * Whether the depth buffer is enabled for writing or not.
             * @var {x3dom.fields.SFBool} readOnly
             * @memberof x3dom.nodeTypes.DepthMode
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'readOnly', false);

            /**
             * The near value for the depth range. Ignored if less than 0, defaults to -1.
             * @var {x3dom.fields.SFFloat} zNearRange
             * @range [0, 1]
             * @memberof x3dom.nodeTypes.DepthMode
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'zNearRange', -1);

            /**
             * The far value for the depth range. Ignored if less than 0, defaults to -1.
             * @var {x3dom.fields.SFFloat} zFarRange
             * @range [0, 1]
             * @memberof x3dom.nodeTypes.DepthMode
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'zFarRange', -1);
        
        }
    )
);