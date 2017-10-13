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
    "IntegerTrigger",
    "EventUtilities",
    defineClass(x3dom.nodeTypes.X3DTriggerNode,
        
        /**
         * Constructor for IntegerTrigger
         * @constructs x3dom.nodeTypes.IntegerTrigger
         * @x3d 3.3
         * @component EventUtilities
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc generates Integer events upon receiving Boolean events
         */
         
        function (ctx) {
            x3dom.nodeTypes.IntegerTrigger.superClass.call(this, ctx);
            
            /**
             * input boolean to trigger output.
             * @var {x3dom.fields.SFBool} set_boolean
             * @memberof x3dom.nodeTypes.IntegerTrigger
             * @initvalue None
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'set_boolean');
            
            /**
             * integer value to be output upon input; can be reset
             * @var {x3dom.fields.SFInt32} integerKey
             * @memberof x3dom.nodeTypes.IntegerTrigger
             * @initvalue -1
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, 'integerKey', -1);
      
            /**
             * output field name; probably needed only as event name since output only; not 'physically'
             * @var {x3dom.fields.SFInt32} triggerValue
             * @memberof x3dom.nodeTypes.IntegerTrigger
             * @initvalue none
             * @field x3d
             * @instance
             */
            //this.addField_SFInt32(ctx, 'triggerValue');
            
        },
        {
            fieldChanged: function(fieldName)
            {
                if (fieldName === 'set_boolean') { //for any boolean input
                  //if (this._vf.set_boolean) //Mantis 519 proposal: only if true
                    this.postMessage('triggerValue', this._vf.integerKey);
                }
                return;
            }
        }
    )
);
