/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DSoundSourceNode ### */
x3dom.registerNodeType(
    "X3DSoundSourceNode",
    "Sound",
    defineClass(x3dom.nodeTypes.X3DTimeDependentNode,
        
        /**
         * Constructor for X3DSoundSourceNode
         * @constructs x3dom.nodeTypes.X3DSoundSourceNode
         * @x3d 3.3
         * @component Sound
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTimeDependentNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This abstract node type is used to derive node types that can emit audio data.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DSoundSourceNode.superClass.call(this, ctx);
        
        }
    )
);