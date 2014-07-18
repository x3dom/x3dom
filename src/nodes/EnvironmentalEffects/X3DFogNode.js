/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DFogNode ### */
x3dom.registerNodeType(
    "X3DFogNode",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        
        /**
         * Constructor for X3DFogNode
         * @constructs x3dom.nodeTypes.X3DFogNode
         * @x3d 3.3
         * @component EnvironmentalEffects
         * @status full
         * @extends x3dom.nodeTypes.X3DBindableNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc X3DFogObject is the abstract type that describes a node that influences the lighting equation
         * through the use of fog semantics.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DFogNode.superClass.call(this, ctx);

            /**
             * Objects located outside the visibilityRange from the viewer are drawn with a constant colour of color.
             * Objects very close to the viewer are blended very little with the fog color.
             * @var {x3dom.fields.SFColor} color
             * @memberof x3dom.nodeTypes.X3DFogNode
             * @initvalue (1,1,1)
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFColor(ctx, 'color', 1, 1, 1);

            /**
             * The fogType field controls how much of the fog colour is blended with the object as a function of
             * distance. If fogType is "LINEAR", the amount of blending is a linear function of the distance, resulting
             * in a depth cueing effect. If fogType is "EXPONENTIAL," an exponential increase in blending is used,
             * resulting in a more natural fog appearance.
             * @var {x3dom.fields.SFString} fogType
             * @memberof x3dom.nodeTypes.X3DFogNode
             * @initvalue "LINEAR"
             * @range {"LINEAR","EXPONENTIAL"}
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'fogType', "LINEAR");

            /**
             * The visibilityRange specifies the distance in length base units (in the local coordinate system) at
             * which objects are totally obscured by the fog. A visibilityRange of 0.0 disables the Fog node.
             * The visibilityRange is affected by the scaling transformations of the Fog node's parents; translations
             * and rotations have no affect on visibilityRange.
             * @var {x3dom.fields.SFFloat} visibilityRange
             * @memberof x3dom.nodeTypes.X3DFogNode
             * @initvalue 0
             * @range [0, -inf]
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'visibilityRange', 0);
        
        },
        {
        }
    )
);