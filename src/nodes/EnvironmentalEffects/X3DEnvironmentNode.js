/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DEnvironmentNode ### */
x3dom.registerNodeType(
    "X3DEnvironmentNode",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        
        /**
         * Constructor for X3DEnvironmentNode
         * @constructs x3dom.nodeTypes.X3DEnvironmentNode
         * @x3d x.x
         * @component EnvironmentalEffects
         * @status full
         * @extends x3dom.nodeTypes.X3DBindableNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Base class for environment nodes
         */
        function (ctx) {
            x3dom.nodeTypes.X3DEnvironmentNode.superClass.call(this, ctx);
        
        }
    )
);