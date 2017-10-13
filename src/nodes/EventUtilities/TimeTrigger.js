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
    "TimeTrigger",
    "EventUtilities",
    defineClass(x3dom.nodeTypes.X3DTriggerNode,
        
        /**
         * Constructor for TimeTrigger
         * @constructs x3dom.nodeTypes.TimeTrigger
         * @x3d 3.3
         * @component EventUtilities
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc generates Time events upon receiving Boolean events
         */
         
        function (ctx) {
            x3dom.nodeTypes.TimeTrigger.superClass.call(this, ctx);
            
            /**
             * input boolean to trigger output.
             * @var {x3dom.fields.SFBool} set_boolean
             * @memberof x3dom.nodeTypes.TimeTrigger
             * @initvalue None
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'set_boolean');
            
            /**
             * output field name; probably needed only as event name since output only; not 'physically'
             * @var {x3dom.fields.SFTime} triggerTime
             * @memberof x3dom.nodeTypes.TimeTrigger
             * @initvalue none
             * @field x3d
             * @instance
             */
            //this.addField_SFTime(ctx, 'triggerTime');
            
        },
        {
            fieldChanged: function(fieldName)
            {
                if (fieldName === 'set_boolean') { //for any boolean input
                  //if (this._vf.set_boolean) //Mantis 519 proposal
                    this.postMessage('triggerTime', Date.now()/1000);
                }
                return;
            }
        }
    )
);
