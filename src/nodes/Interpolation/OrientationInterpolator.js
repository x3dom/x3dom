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
         * @x3d 3.3
         * @component Interpolation
         * @status full
         * @extends x3dom.nodeTypes.X3DInterpolatorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The OrientationInterpolator node interpolates among a list of rotation values specified in the keyValue field to produce an SFRotation value_changed event.
         * These rotations are absolute in object space and therefore are not cumulative.
         * The keyValue field shall contain exactly as many rotations as there are key frames in the key field.
         * An orientation represents the final position of an object after a rotation has been applied.
         * An OrientationInterpolator interpolates between two orientations by computing the shortest path on the unit sphere between the two orientations.
         * The interpolation is linear in arc length along this path. The results are undefined if the two orientations are diagonally opposite.
         */
        function (ctx) {
            x3dom.nodeTypes.OrientationInterpolator.superClass.call(this, ctx);


            /**
             * Defines the set of data points, that are used for interpolation.
             * If two consecutive keyValue values exist such that the arc length between them is greater than π, the interpolation will take place on the arc complement.
             * For example, the interpolation between the orientations (0, 1, 0, 0) and (0, 1, 0, 5.0) is equivalent to the rotation between the orientations (0, 1, 0, 2π) and (0, 1, 0, 5.0).
             * @var {x3dom.fields.MFRotation} keyValue
             * @memberof x3dom.nodeTypes.OrientationInterpolator
             * @initvalue []
             * @field x3d
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