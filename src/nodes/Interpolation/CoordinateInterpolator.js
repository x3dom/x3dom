/** @namespace x3dom.nodeTypes */
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
        
        /**
         * Constructor for CoordinateInterpolator
         * @constructs x3dom.nodeTypes.CoordinateInterpolator
         * @x3d 3.3
         * @component Interpolation
         * @status full
         * @extends x3dom.nodeTypes.X3DInterpolatorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The CoordinateInterpolator node linearly interpolates among a list of MFVec3f values to produce an MFVec3f value_changed event.
         * The number of coordinates in the keyValue field shall be an integer multiple of the number of key frames in the key field.
         * That integer multiple defines how many coordinates will be contained in the value_changed events.
         */
        function (ctx) {
            x3dom.nodeTypes.CoordinateInterpolator.superClass.call(this, ctx);


            /**
             * Defines the set of data points, that are used for interpolation.
             * @var {x3dom.fields.MFVec3f} keyValue
             * @memberof x3dom.nodeTypes.CoordinateInterpolator
             * @initvalue []
             * @field x3d
             * @instance
             */
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
