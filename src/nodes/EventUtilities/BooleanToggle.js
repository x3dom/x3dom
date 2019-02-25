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
    "BooleanToggle",
    "EventUtilities",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        
        /**
         * Constructor for BooleanToggle
         * @constructs x3dom.nodeTypes.BooleanToggle
         * @x3d 3.3
         * @component EventUtilities
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc stores and toggles boolean value
         */
         
        function (ctx) {
            x3dom.nodeTypes.BooleanToggle.superClass.call(this, ctx);
            
            /**
             * input bool in event to cause toggling.
             * @var {x3dom.fields.SFBool} set_boolean
             * @memberof x3dom.nodeTypes.BooleanToggle
             * @initvalue None
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'set_boolean');
            
            /**
             * stored value to toggle and output; resetable
             * @var {x3dom.fields.SFBool} toggle
             * @memberof x3dom.nodeTypes.BooleanToggle
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'toggle', false);
            
        },
        {
            fieldChanged: function(fieldName)
            {
                if (fieldName === 'set_boolean') { //resetting toggle happens elsewhere 
                    if (this._vf.set_boolean) { //ignore false as input
                      var toggled = ! this._vf.toggle; //minimize property access
                      this._vf.toggle = toggled;
                      this.postMessage('toggle', toggled);
                    }
                    return;
                }
            }
        }
    )
);
