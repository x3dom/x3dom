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
         * @x3d 3.3
         * @component Grouping
         * @status full
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc A Group node contains children nodes without introducing a new transformation.
         * It is equivalent to a Transform node containing an identity transform.
         */
        function (ctx) {
            x3dom.nodeTypes.Group.superClass.call(this, ctx);
        
        }
    )
);