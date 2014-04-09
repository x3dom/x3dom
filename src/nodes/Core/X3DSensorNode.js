/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### X3DSensorNode ###
x3dom.registerNodeType(
    "X3DSensorNode",
    "Core",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        
        /**
         * Constructor for X3DSensorNode
         * @constructs x3dom.nodeTypes.X3DSensorNode
         * @x3d x.x
         * @component Core
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DSensorNode.superClass.call(this, ctx);
        
        }
    )
);