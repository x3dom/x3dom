/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### ScalarInterpolator ###
x3dom.registerNodeType(
    "ScalarInterpolator",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        
        /**
         * Constructor for ScalarInterpolator
         * @constructs x3dom.nodeTypes.ScalarInterpolator
         * @x3d 3.3
         * @component Interpolation
         * @status full
         * @extends x3dom.nodeTypes.X3DInterpolatorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The ScalarInterpolator node linearly interpolates among a list of SFFloat values to produce an SFFloat value_changed event.
         * This interpolator is appropriate for any parameter defined using a single floating point value.
         */
        function (ctx) {
            x3dom.nodeTypes.ScalarInterpolator.superClass.call(this, ctx);


            /**
             * Defines the set of data points, that are used for interpolation.
             * @var {x3dom.fields.MFFloat} keyValue
             * @memberof x3dom.nodeTypes.ScalarInterpolator
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFFloat(ctx, 'keyValue', []);
        
        },
        {
            fieldChanged: function(fieldName)
            {
                if(fieldName === "set_fraction")
                {
                    var value = this.linearInterp(this._vf.set_fraction, function (a, b, t) {
                        return (1.0-t)*a + t*b;
                    });

                    this.postMessage('value_changed', value);
                }
            }
        }
    )
);