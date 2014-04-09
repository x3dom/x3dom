/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Fog ### */
x3dom.registerNodeType(
    "Fog",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DFogNode,
        
        /**
         * Constructor for Fog
         * @constructs x3dom.nodeTypes.Fog
         * @x3d x.x
         * @component EnvironmentalEffects
         * @status experimental
         * @extends x3dom.nodeTypes.X3DFogNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Fog.superClass.call(this, ctx);


            /**
             *
             * @var {SFColor} color
             * @memberof x3dom.nodeTypes.Fog
             * @initvalue 1,1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'color', 1, 1, 1);

            /**
             *
             * @var {SFString} fogType
             * @memberof x3dom.nodeTypes.Fog
             * @initvalue "LINEAR"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'fogType', "LINEAR");

            /**
             *
             * @var {SFFloat} visibilityRange
             * @memberof x3dom.nodeTypes.Fog
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'visibilityRange', 0);
        
        },
        {
        }
    )
);