/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Uniform ### */
x3dom.registerNodeType(
    "Uniform",
    "Shaders",
    defineClass(x3dom.nodeTypes.Field,
        
        /**
         * Constructor for Uniform
         * @constructs x3dom.nodeTypes.Uniform
         * @x3d x.x
         * @component Shaders
         * @extends x3dom.nodeTypes.Field
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Node representing a uniform.
         */
        function (ctx) {
            x3dom.nodeTypes.Uniform.superClass.call(this, ctx);
        
        }
    )
);