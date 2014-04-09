/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DGeometricPropertyNode ### */
x3dom.registerNodeType(
    "X3DGeometricPropertyNode",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DNode,
        
        /**
         * Constructor for X3DGeometricPropertyNode
         * @constructs x3dom.nodeTypes.X3DGeometricPropertyNode
         * @x3d x.x
         * @component Rendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DGeometricPropertyNode.superClass.call(this, ctx);
        
        }
    )
);