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
    "BooleanFilter",
    "EventUtilities",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        
        /**
         * Constructor for BooleanFilter
         * @constructs x3dom.nodeTypes.BooleanFilter
         * @x3d 3.3
         * @component EventUtilities
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc filters Boolean events, allowing for selective routing of TRUE or FALSE values and negation.
         */
         
        function (ctx) {
            x3dom.nodeTypes.BooleanFilter.superClass.call(this, ctx);
            
            /**
             * input bool event to be filtered.
             * @var {x3dom.fields.SFBool} set_boolean
             * @memberof x3dom.nodeTypes.BooleanFilter
             * @initvalue None
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'set_boolean');
            
            /**
             * output if input is false
             * @var {x3dom.fields.SFBool} inputFalse
             * @memberof x3dom.nodeTypes.BooleanFilter
             * @initvalue None
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'inputFalse');
            
            /**
             * output if input is true
             * @var {x3dom.fields.SFBool} inputTrue
             * @memberof x3dom.nodeTypes.BooleanFilter
             * @initvalue None
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'inputTrue');
            
            /**
             * output negated input
             * @var {x3dom.fields.SFBool} inputNegate
             * @memberof x3dom.nodeTypes.BooleanFilter
             * @initvalue None
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'inputNegate');
        },
        {
            fieldChanged: function(fieldName)
            {
                if (fieldName === 'set_boolean') { //ignore attempted input to all other fields
                    var input = this._vf.set_boolean;
                    this._vf.inputNegate = !input;
                    this.postMessage('inputNegate', !input);
                    if (input) {
                        this._vf.inputTrue = true;
                        this.postMessage('inputTrue', true);
                        return;
                    }
                    this._vf.inputFalse = false; // confirmed with other browsers
                    this.postMessage('inputFalse', false);
                    return;
                }
            }
        }
    )
);
