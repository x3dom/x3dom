/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DNavigationInfoNode ### */
x3dom.registerNodeType(
    "X3DNavigationInfoNode",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        
        /**
         * Constructor for X3DNavigationInfoNode
         * @constructs x3dom.nodeTypes.X3DNavigationInfoNode
         * @x3d x.x
         * @component Navigation
         * @extends x3dom.nodeTypes.X3DBindableNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DNavigationInfoNode.superClass.call(this, ctx);
        
        }
    )
);