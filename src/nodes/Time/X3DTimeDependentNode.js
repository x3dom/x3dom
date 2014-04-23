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
         * @x3d 3.3
         * @component Time
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This abstract node type is the base node type from which all time-dependent nodes are derived.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DTimeDependentNode.superClass.call(this, ctx);


            /**
             * Specifies whether the timer cycle loops.
             * @var {x3dom.fields.SFBool} loop
             * @memberof x3dom.nodeTypes.X3DTimeDependentNode
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'loop', false);
        
        }
    )
);