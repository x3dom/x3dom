/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009, 2017, A. Plesch, Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### BooleanSequencer ###
x3dom.registerNodeType(
    "BooleanSequencer",
    "EventUtilities",
    defineClass(x3dom.nodeTypes.X3DSequencerNode,
        
        /**
         * Constructor for BooleanSequencer
         * @constructs x3dom.nodeTypes.BooleanSequencer
         * @x3d 3.3
         * @component EventUtilities
         * @status experimental
         * @extends x3dom.nodeTypes.X3DSequencerNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc BooleanSequencer generates sequential value_changed events selected from the keyValue field when driven from a TimeSensor clock. Among other actions, it can enable/disable lights and sensors, or bind/unbind viewpoints and other X3DBindableNode nodes using set_bind events.
         */
         
        function (ctx) {
            x3dom.nodeTypes.BooleanSequencer.superClass.call(this, ctx);
            
            /**
             * Defines the set of Booleans, that are used for sequencing.
             * Is made up of a list of FALSE and TRUE values.
             * @var {x3dom.fields.MFBoolean} keyValue
             * @memberof x3dom.nodeTypes.BooleanSequencer
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFBoolean(ctx, 'keyValue', []);
        
        },
        {
        // all in base class
        }
    )
);
