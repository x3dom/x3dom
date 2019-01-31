/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### X3DInterpolatorNode ###
x3dom.registerNodeType(
    "X3DInterpolatorNode",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        
        /**
         * Constructor for X3DInterpolatorNode
         * @constructs x3dom.nodeTypes.X3DInterpolatorNode
         * @x3d 3.3
         * @component Interpolation
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The abstract node X3DInterpolatorNode forms the basis for all types of interpolators.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DInterpolatorNode.superClass.call(this, ctx);


            /**
             * The key field contains the list of key times, the keyValue field contains values for the target field, one complete set of values for each key.
             * Interpolator nodes containing no keys in the key field shall not produce any events.
             * However, an input event that replaces an empty key field with one that contains keys will cause the interpolator node to produce events the next time that a set_fraction event is received.
             * @var {x3dom.fields.MFFloat} key
             * @memberof x3dom.nodeTypes.X3DInterpolatorNode
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFFloat(ctx, 'key', []);

            /**
             * The set_fraction inputOnly field receives an SFFloat event and causes the interpolator node function to evaluate, resulting in a value_changed output event of the specified type with the same timestamp as the set_fraction event.
             * @var {x3dom.fields.SFFloat} set_fraction
             * @memberof x3dom.nodeTypes.X3DInterpolatorNode
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'set_fraction', 0);

             /**
             * The url to the binary file, that contains the buffer data.
             * @var {x3dom.fields.SFString} buffer
             * @memberof x3dom.nodeTypes.X3DInterpolatorNode
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'buffer', "");

            /**
             * Contains the interpolation method
             * @var {x3dom.fields.SFString} interpolation
             * @memberof x3dom.nodeTypes.X3DInterpolatorNode
             * @initvalue "LINEAR"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'interpolation', "LINEAR");

            /**
             * Specifies the duration
             * @var {x3dom.fields.SFString} duration
             * @memberof x3dom.nodeTypes.X3DInterpolatorNode
             * @initvalue "0"
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'duration', 0);

            this.addField_MFNode('views', x3dom.nodeTypes.BufferView );
            this.addField_MFNode('accessors', x3dom.nodeTypes.BufferAccessor );

            this._lastValue = undefined;

            this.normalizeFromType = {
                "5120": function(c) {return Math.max(c / 127.0, -1.0)},
                "5121": function(c) {return c / 255.0;},
                "5122": function(c) {return Math.max(c / 32767.0, -1.0)},
                "5123": function(c) {return c / 65535.0;},
                "5125": function(c) {return c / 4294967295;},
                "5126": function(c) {return c;},
            };
        
        },
        {
            nodeChanged: function ()
            {
                if (this._vf.buffer)
                {
                    x3dom.BinaryContainerLoader.setupBufferInterpolator(this);
                }
            },

            linearInterp: function (time, interp)
            {
                if(this._vf.key.length == 0)
                {
                    return;
                }

                if (time <= this._vf.key[0])
                {
                    return this._vf.keyValue[0];
                }
                else if (time >= this._vf.key[this._vf.key.length-1])
                {
                    return this._vf.keyValue[this._vf.key.length-1];
                }
                    
                for (var i = 0, n = this._vf.key.length-1; i<n; ++i)
                {
                    if ((this._vf.key[i] < time) && (time <= this._vf.key[i+1]))
                    {
                        return interp( this._vf.keyValue[i],
                                       this._vf.keyValue[i+1],
                                       (time - this._vf.key[i]) / (this._vf.key[i+1] - this._vf.key[i]) );
                    }            
                }

                return this._vf.keyValue[0];
            },

            cubicSplineInterp: function (time, interp)
            {
                if(this._vf.key.length == 0)
                {
                    return;
                }

                var i, i3, interval, basis, t, intervalInSeconds; 

                if (time <= this._vf.key[0])
                {
                    return this._vf.keyValue[1];
                }
                else if (time >= this._vf.key[this._vf.key.length-1])
                {
                    return this._vf.keyValue[this._vf.keyValue.length-2];
                }
                    
                for (i = 0, n = this._vf.key.length-1; i < n; ++i)
                {
                    if ((this._vf.key[i] < time) && (time <= this._vf.key[i+1]))
                    {
                        i3                = i*3;
                        interval          = this._vf.key[i+1] - this._vf.key[i];
                        t                 = (time - this._vf.key[i]) / interval;
                        intervalInSeconds = interval * this._vf.duration;
                        basis             = this.cubicSplineBasis( t, intervalInSeconds );

                        return interp( this._vf.keyValue[i3+2],
                                       this._vf.keyValue[i3+1],
                                       this._vf.keyValue[i3+3],
                                       this._vf.keyValue[i3+4],
                                       basis.h00,
                                       basis.h10,
                                       basis.h01,
                                       basis.h11 );
                    }
                }

                return this._vf.keyValue[0];
            },

            cubicSplineBasis: function (t, intervalInSeconds)
            {
                var t2 = t*t;
                var t3 = t2*t;
                var h01 = -2*t3 + 3*t2;
                var h11 = t3 - t2;
                var h00 = 1 - h01; //2*t3 - 3*t2 + 1;
                var h10 = h11 - t2 + t; //t3 - 2*t2 + t;
                
                return {
                    'h00':h00,
                    'h10': intervalInSeconds * h10,
                    'h01':h01,
                    'h11': intervalInSeconds * h11
                };
            },

            keyValueFromArray: function (array) // to be redefined by interpolators
            {
                return array;
            }
        }
    )
);
//global XHR cache
x3dom.XHRCache = {}; // unify with x3dom.BinaryContainerLoader.bufferGeoCache
