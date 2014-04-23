/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DTimeDependentNode ### */
x3dom.registerNodeType(
    "X3DTimeDependentNode",
    "Time",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        
        /**
         * Constructor for X3DTimeDependentNode
         * @constructs x3dom.nodeTypes.X3DTimeDependentNode
         * @x3d x.x
         * @component Time
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DTimeDependentNode.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.SFBool} loop
             * @memberof x3dom.nodeTypes.X3DTimeDependentNode
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'loop', false);
        
        }
    )
);