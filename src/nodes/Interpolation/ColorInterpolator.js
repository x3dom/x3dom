/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### ColorInterpolator ###
x3dom.registerNodeType(
    "ColorInterpolator",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        function (ctx) {
            x3dom.nodeTypes.ColorInterpolator.superClass.call(this, ctx);

            this.addField_MFColor(ctx, 'keyValue', []);
        },
        {
            fieldChanged: function(fieldName)
            {
                if(fieldName === "set_fraction")
                {
                    // FIXME; perform color interpolation in HSV space
                    var value = this.linearInterp(this._vf.set_fraction, function (a, b, t) {
                        return a.multiply(1.0-t).add(b.multiply(t));
                    });

                    this.postMessage('value_changed', value);
                }
            }
        }
    )
);