/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009, 2017, A. Plesch, Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### BooleanFilter ###
x3dom.registerNodeType(
    "X3DTriggerNode",
    "EventUtilities",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        
        /**
         * Constructor for X3DTriggerNode
         * @constructs x3dom.nodeTypes.X3DTriggerNode
         * @x3d 3.3
         * @component EventUtilities
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This abstract node type is the base node type from which all trigger nodes are derived.
         */
         
        function (ctx) {
            x3dom.nodeTypes.X3DTriggerNode.superClass.call(this, ctx);
        }
    )
);
