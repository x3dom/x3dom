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
         * @x3d 3.3
         * @component EnvironmentalEffects
         * @status experimental
         * @extends x3dom.nodeTypes.X3DFogNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Fog node provides a way to simulate atmospheric effects by blending objects with the colour
         * specified by the color field based on the distances of the various objects from the viewer. The distances
         * are calculated in the coordinate space of the Fog node.
         */
        function (ctx) {
            x3dom.nodeTypes.Fog.superClass.call(this, ctx);

        },
        {
        }
    )
);