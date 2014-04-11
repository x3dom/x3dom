/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DInfoNode ### */
x3dom.registerNodeType(
    "X3DInfoNode",
    "Core",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        
        /**
         * Constructor for X3DInfoNode
         * @constructs x3dom.nodeTypes.X3DInfoNode
         * @x3d 3.3
         * @component Core
         * @status full
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This is the base node type for all nodes that contain only information without visual semantics.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DInfoNode.superClass.call(this, ctx);
        
        }
    )
);