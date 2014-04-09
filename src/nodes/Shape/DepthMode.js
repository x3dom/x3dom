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
         * @status experimental
         * @extends x3dom.nodeTypes.X3DAppearanceChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.DepthMode.superClass.call(this, ctx);


            /**
             *
             * @var {SFBool} enableDepthTest
             * @memberof x3dom.nodeTypes.DepthMode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'enableDepthTest', true);

            /**
             *
             * @var {SFString} depthFunc
             * @memberof x3dom.nodeTypes.DepthMode
             * @initvalue "none"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'depthFunc', "none");

            /**
             *
             * @var {SFBool} readOnly
             * @memberof x3dom.nodeTypes.DepthMode
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'readOnly', false);

            /**
             *
             * @var {SFFloat} zNearRange
             * @memberof x3dom.nodeTypes.DepthMode
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'zNearRange', -1);

            /**
             *
             * @var {SFFloat} zFarRange
             * @memberof x3dom.nodeTypes.DepthMode
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'zFarRange', -1);
        
        }
    )
);