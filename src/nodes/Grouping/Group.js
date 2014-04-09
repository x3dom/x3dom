/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### Group ###
x3dom.registerNodeType(
    "Group",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        
        /**
         * Constructor for Group
         * @constructs x3dom.nodeTypes.Group
         * @x3d x.x
         * @component Grouping
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Group.superClass.call(this, ctx);
        
        }
    )
);