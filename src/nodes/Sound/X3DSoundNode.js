/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DSoundNode ### */
x3dom.registerNodeType(
    "X3DSoundNode",
    "Sound",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        
        /**
         * Constructor for X3DSoundNode
         * @constructs x3dom.nodeTypes.X3DSoundNode
         * @x3d 3.3
         * @component Sound
         * @status full
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @CLASSDESC This abstract node type is the base for all sound nodes.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DSoundNode.superClass.call(this, ctx);
        
        }
    )
);