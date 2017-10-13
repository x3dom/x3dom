/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009, 2017, A. Plesch, Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### BooleanFilter ###
x3dom.registerNodeType(
    "BooleanTrigger",
    "EventUtilities",
    defineClass(x3dom.nodeTypes.X3DTriggerNode,
        
        /**
         * Constructor for BooleanTrigger
         * @constructs x3dom.nodeTypes.BooleanTrigger
         * @x3d 3.3
         * @component EventUtilities
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc generates true Boolean events upon receiving time events
         */
         
        function (ctx) {
            x3dom.nodeTypes.BooleanTrigger.superClass.call(this, ctx);
            
            /**
             * input time in event to trigger output.
             * @var {x3dom.fields.SFBool} set_triggerTime
             * @memberof x3dom.nodeTypes.BooleanTrigger
             * @initvalue None
             * @field x3d
             * @instance
             */
            this.addField_SFTime(ctx, 'set_triggerTime');
            
            /**
             * output field name; probably needed only as event name since output only; not 'physically'
             * @var {x3dom.fields.SFBool} triggerTrue
             * @memberof x3dom.nodeTypes.BooleanTrigger
             * @initvalue None
             * @field x3d
             * @instance
             */
            //this.addField_SFBool(ctx, 'triggerTrue');
            
        },
        {
            fieldChanged: function(fieldName)
            {
                if (fieldName === 'set_triggerTime') { //for any time input
                    this.postMessage('triggerTrue', true);
                }
                return;
            }
        }
    )
);
