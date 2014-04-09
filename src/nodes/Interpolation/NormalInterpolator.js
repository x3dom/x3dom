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
        function (ctx) {
            x3dom.nodeTypes.NormalInterpolator.superClass.call(this, ctx);

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