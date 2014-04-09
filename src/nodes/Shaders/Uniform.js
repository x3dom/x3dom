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
        function (ctx) {
            x3dom.nodeTypes.Uniform.superClass.call(this, ctx);
        }
    )
);