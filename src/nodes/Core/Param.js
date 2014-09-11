/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// deprecated, will be removed in 1.5
// ### Param ###
x3dom.registerNodeType(
    "Param",
    "Core",
    defineClass(x3dom.nodeTypes.X3DNode,
        
        /**
         * Constructor for Param
         * @constructs x3dom.nodeTypes.Param
         * @x3d x.x
         * @component Core
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * DEPRECATED: Param element needs to be child of X3D element {@link http://x3dom.org/docs/latest/configuration.html}
         */
        function (ctx) {
            x3dom.nodeTypes.Param.superClass.call(this, ctx);

            x3dom.debug.logWarning('DEPRECATED: Param element needs to be child of X3D element '
                + '[<a href="http://x3dom.org/docs/latest/configuration.html">DOCS</a>]');
        
        }
    )
);