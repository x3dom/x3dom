/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### NormalInterpolator ###
x3dom.registerNodeType(
    "NormalInterpolator",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        
        /**
         * Constructor for NormalInterpolator
         * @constructs x3dom.nodeTypes.NormalInterpolator
         * @x3d 3.3
         * @component Interpolation
         * @status full
         * @extends x3dom.nodeTypes.X3DInterpolatorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The NormalInterpolator node interpolates among a list of normal vector sets specified by the keyValue field to produce an MFVec3f value_changed event.
         * The output vector, value_changed, shall be a set of normalized vectors.
         * Values in the keyValue field shall be of unit length.
         * The number of normals in the keyValue field shall be an integer multiple of the number of key frames in the key field.
         * That integer multiple defines how many normals will be contained in the value_changed events.
         */
        function (ctx) {
            x3dom.nodeTypes.NormalInterpolator.superClass.call(this, ctx);


            /**
             * Defines the set of data points, that are used for interpolation.
             * Values in the keyValue field shall be of unit length.
             * @var {x3dom.fields.MFVec3f} keyValue
             * @memberof x3dom.nodeTypes.NormalInterpolator
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec3f(ctx, 'keyValue', []);
        
        },
        {
            fieldChanged: function(fieldName)
            {
                if(fieldName === "set_fraction")
                {
                    var value = this.linearInterp(this._vf.set_fraction, function (a, b, t) {
                        return a.multiply(1.0-t).add(b.multiply(t)).normalize();
                    });

                    this.postMessage('value_changed', value);
                }
            }
        }
    )
);