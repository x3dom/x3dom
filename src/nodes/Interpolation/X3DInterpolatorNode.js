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
        
        },
        {
            linearInterp: function (time, interp) {
                if (time <= this._vf.key[0])
                    return this._vf.keyValue[0];

                else if (time >= this._vf.key[this._vf.key.length-1])
                    return this._vf.keyValue[this._vf.key.length-1];

                for (var i = 0; i < this._vf.key.length-1; ++i) {
                    if ((this._vf.key[i] < time) && (time <= this._vf.key[i+1]))
                        return interp( this._vf.keyValue[i], this._vf.keyValue[i+1],
                                (time - this._vf.key[i]) / (this._vf.key[i+1] - this._vf.key[i]) );
                }
                return this._vf.keyValue[0];
            }
        }
    )
);