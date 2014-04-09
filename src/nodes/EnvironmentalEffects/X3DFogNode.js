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
         * @x3d x.x
         * @component EnvironmentalEffects
         * @status experimental
         * @extends x3dom.nodeTypes.X3DBindableNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DFogNode.superClass.call(this, ctx);
        
        },
        {
        }
    )
);