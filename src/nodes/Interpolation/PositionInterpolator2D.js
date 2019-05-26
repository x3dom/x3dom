/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### PositionInterpolator2D ###
x3dom.registerNodeType(
    "PositionInterpolator2D",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        
        /**
         * Constructor for PositionInterpolator2D
         * @constructs x3dom.nodeTypes.PositionInterpolator2D
         * @x3d 3.3
         * @component Interpolation
         * @status full
         * @extends x3dom.nodeTypes.X3DInterpolatorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The PositionInterpolator2D node linearly interpolates among a list of 2D vectors to produce an SFVec2f value_changed event. The keyValue field shall contain exactly as many values as in the key field.
         */
        function (ctx) {
            x3dom.nodeTypes.PositionInterpolator2D.superClass.call(this, ctx);


            /**
             * Defines the set of data points, that are used for interpolation.
             * @var {x3dom.fields.MFVec3f} keyValue
             * @memberof x3dom.nodeTypes.PositionInterpolator2D
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec2f(ctx, 'keyValue', []);
        
        },
        {
            fieldChanged: function(fieldName)
            {
                if(fieldName === "set_fraction")
                {
                    var value = this.linearInterp(this._vf.set_fraction, function (a, b, t) {
                        return a.multiply(1.0-t).add(b.multiply(t));
                    });

                    this.postMessage('value_changed', value);
                }
            }
        }
    )
);
