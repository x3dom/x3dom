/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### CoordinateInterpolator ###
x3dom.registerNodeType(
    "CoordinateInterpolator",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        function (ctx) {
            x3dom.nodeTypes.CoordinateInterpolator.superClass.call(this, ctx);

            this.addField_MFVec3f(ctx, 'keyValue', []);

            if (ctx && ctx.xmlNode.hasAttribute('keyValue')) {
                this._vf.keyValue = [];     // FIXME!!!

                var arr = x3dom.fields.MFVec3f.parse(ctx.xmlNode.getAttribute('keyValue'));
                var key = this._vf.key.length > 0 ? this._vf.key.length : 1;
                var len = arr.length / key;
                for (var i=0; i<key; i++) {
                    var val = new x3dom.fields.MFVec3f();
                    for (var j=0; j<len; j++) {
                        val.push( arr[i*len+j] );
                    }
                    this._vf.keyValue.push(val);
                }
            }
        },
        {
            fieldChanged: function(fieldName)
            {
                if(fieldName === "set_fraction")
                {
                    var value = this.linearInterp(this._vf.set_fraction, function (a, b, t) {
                        var val = new x3dom.fields.MFVec3f();
                        for (var i=0; i<a.length; i++)
                            val.push(a[i].multiply(1.0-t).add(b[i].multiply(t)));

                        return val;
                    });

                    this.postMessage('value_changed', value);
                }
            }
        }
    )
);
