/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009, 2017, A. Plesch, Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### IntegerSequencer ###
x3dom.registerNodeType(
    "IntegerSequencer",
    "EventUtilities",
    defineClass(x3dom.nodeTypes.X3DSequencerNode,
        
        /**
         * Constructor for IntegerSequencer
         * @constructs x3dom.nodeTypes.IntegerSequencer
         * @x3d 3.3
         * @component EventUtilities
         * @status experimental
         * @extends x3dom.nodeTypes.X3DSequencerNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The IntegerSequencer node generates sequential discrete value_changed events selected from the keyValue field in response to each set_fraction, next, or previous event.
         */
         
        function (ctx) {
            x3dom.nodeTypes.IntegerSequencer.superClass.call(this, ctx);
            
            /**
             * Defines the set of integers, that are used for sequencing.
             * @var {x3dom.fields.MFInt32} keyValue
             * @memberof x3dom.nodeTypes.IntegerSequencer
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFInt32(ctx, 'keyValue', []);
        
        },
        {
        // all in base class
        }
    )
);
