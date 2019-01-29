/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### PositionInterpolator ###
x3dom.registerNodeType(
    "PositionInterpolator",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        
        /**
         * Constructor for PositionInterpolator
         * @constructs x3dom.nodeTypes.PositionInterpolator
         * @x3d 3.3
         * @component Interpolation
         * @status full
         * @extends x3dom.nodeTypes.X3DInterpolatorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The PositionInterpolator node linearly interpolates among a list of 3D vectors to produce an SFVec3f value_changed event. The keyValue field shall contain exactly as many values as in the key field.
         */
        function (ctx) {
            x3dom.nodeTypes.PositionInterpolator.superClass.call(this, ctx);


            /**
             * Defines the set of data points, that are used for interpolation.
             * @var {x3dom.fields.MFVec3f} keyValue
             * @memberof x3dom.nodeTypes.PositionInterpolator
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
                    var value;
       
                    if (this._vf.interpolation === 'CUBICSPLINE')
                    {
                        value = this.cubicSplineInterp(this._vf.set_fraction, function (startInTangent, start, endOutTangent, end, h00, h10, h01, h11) {

                            function _applyBasis(axis)//p0, m0, p1, m1, axis)
                            {                                   
                                return h00 * start[axis] + h10 * startInTangent[axis] + h01 * end[axis] + h11 * endOutTangent[axis];
                            }
                            
                            var result = new x3dom.fields.SFVec3f();

                            // do not use SFVec3f methods to avoid generating objects

                            result.x = _applyBasis('x');
                            result.y = _applyBasis('y');
                            result.z = _applyBasis('z');
                            return result;
                        });
                    }
                    else
                    {
                        value = this.linearInterp(this._vf.set_fraction, function (a, b, t) {
                            var result = a.multiply(1.0-t);
                            result.x += t*b.x;
                            result.y += t*b.y;
                            result.z += t*b.z;
                            return result;//a.multiply(1.0-t).add(b.multiply(t));
                        });
                    }
                                        
                    if(value != undefined && value != this._lastValue)
                    {
                        this._lastValue = value;
                        this.postMessage('value_changed', value);
                    }
                }
            },
            
            keyValueFromAccessor: function(array)
            {
                keyValue = new x3dom.fields.MFVec3f();
                array.forEach( function (val, i)
                {
                    if (i%3 == 2) {
                        keyValue.push( new x3dom.fields.SFVec3f (
                            array[i-2],
                            array[i-1],
                            val
                        ));  
                    }
                })
                return keyValue;
            }
        }
    )
);
