/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### OrientationInterpolator ###
x3dom.registerNodeType(
    "OrientationInterpolator",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        
        /**
         * Constructor for OrientationInterpolator
         * @constructs x3dom.nodeTypes.OrientationInterpolator
         * @x3d x.x
         * @component Interpolation
         * @status experimental
         * @extends x3dom.nodeTypes.X3DInterpolatorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.OrientationInterpolator.superClass.call(this, ctx);


            /**
             *
             * @var {MFRotation} keyValue
             * @memberof x3dom.nodeTypes.OrientationInterpolator
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFRotation(ctx, 'keyValue', []);
        
        },
        {
            fieldChanged: function(fieldName)
            {
                if(fieldName === "set_fraction")
                {
                    var value = this.linearInterp(this._vf.set_fraction, function (a, b, t) {
                        return a.slerp(b, t);
                    });
                    this.postMessage('value_changed', value);
                }
            }
        }
    )
);