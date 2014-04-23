/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### LineProperties ### */
x3dom.registerNodeType(
    "LineProperties",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        
        /**
         * Constructor for LineProperties
         * @constructs x3dom.nodeTypes.LineProperties
         * @x3d x.x
         * @component Shape
         * @status experimental
         * @extends x3dom.nodeTypes.X3DAppearanceChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.LineProperties.superClass.call(this, ctx);

            // http://www.web3d.org/files/specifications/19775-1/V3.2/Part01/components/shape.html#LineProperties
            // THINKABOUTME: to my mind, the only useful, but missing, field is linewidth (scaleFactor is overhead)

            /**
             *
             * @var {x3dom.fields.SFBool} applied
             * @memberof x3dom.nodeTypes.LineProperties
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'applied', true);

            /**
             *
             * @var {x3dom.fields.SFInt32} linetype
             * @memberof x3dom.nodeTypes.LineProperties
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'linetype', 1);

            /**
             *
             * @var {x3dom.fields.SFFloat} linewidthScaleFactor
             * @memberof x3dom.nodeTypes.LineProperties
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'linewidthScaleFactor', 0);
        
        }
    )
);