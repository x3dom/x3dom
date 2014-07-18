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
         * @x3d 3.3
         * @component Shape
         * @status experimental
         * @extends x3dom.nodeTypes.X3DAppearanceChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The LineProperties node specifies additional properties to be applied to all line geometry. The colour of the line is specified by the associated Material node.
         */
        function (ctx) {
            x3dom.nodeTypes.LineProperties.superClass.call(this, ctx);

            // http://www.web3d.org/files/specifications/19775-1/V3.2/Part01/components/shape.html#LineProperties
            // THINKABOUTME: to my mind, the only useful, but missing, field is linewidth (scaleFactor is overhead)

            /**
             * The linetype and linewidth shall only be applied when the applied field has value TRUE.
             * When the value of the applied field is FALSE, a solid line of nominal width shall be produced.
             * @var {x3dom.fields.SFBool} applied
             * @memberof x3dom.nodeTypes.LineProperties
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'applied', true);

            /**
             * The linetype field selects a line pattern.
             * @var {x3dom.fields.SFInt32} linetype
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.LineProperties
             * @initvalue 1
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, 'linetype', 1);

            /**
             * The linewidthScaleFactor is a multiplicative value that scales a the linewidth. This resulting value shall then be mapped to the nearest available line width. A value less than or equal to zero refers to the minimum available line width.
             * @var {x3dom.fields.SFFloat} linewidthScaleFactor
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.LineProperties
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'linewidthScaleFactor', 0);
        
        }
    )
);