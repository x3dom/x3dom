/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### X3DSensorNode ###
x3dom.registerNodeType(
    "X3DSensorNode",
    "Core",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        
        /**
         * Constructor for X3DSensorNode
         * @constructs x3dom.nodeTypes.X3DSensorNode
         * @x3d 3.3
         * @component Core
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This abstract node type is the base type for all sensors.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DSensorNode.superClass.call(this, ctx);
        
		
            /**
             * Specifies whether this sensor is enabled. A disabled sensor does not produce any output.
             * @var {x3dom.fields.SFBool} enabled
             * @memberof x3dom.nodeTypes.X3DSensorNode
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'enabled', true);
			
			
        }
    )
);