/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DAppearanceChildNode ### */
x3dom.registerNodeType(
    "X3DAppearanceChildNode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DNode,
        
        /**
         * Constructor for X3DAppearanceChildNode
         * @constructs x3dom.nodeTypes.X3DAppearanceChildNode
         * @x3d 3.3
         * @component Shape
         * @status full
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This is the base node type for the child nodes of the X3DAppearanceNode type.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DAppearanceChildNode.superClass.call(this, ctx);
        
        }
    )
);