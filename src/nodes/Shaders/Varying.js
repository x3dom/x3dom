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
    "Varying",
    "Shaders",
    defineClass(x3dom.nodeTypes.Field,
        
        /**
         * Constructor for Varying
         * @constructs x3dom.nodeTypes.Varying
         * @x3d x.x
         * @component Shaders
         * @extends x3dom.nodeTypes.Field
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Node representing a Varying.
         */
        function (ctx) {
            x3dom.nodeTypes.Varying.superClass.call(this, ctx);
        
        }
    )
);
