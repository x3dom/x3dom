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
         * @x3d x.x
         * @component Interpolation
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DInterpolatorNode.superClass.call(this, ctx);


            /**
             *
             * @var {MFFloat} key
             * @memberof x3dom.nodeTypes.X3DInterpolatorNode
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'key', []);

            /**
             *
             * @var {SFFloat} set_fraction
             * @memberof x3dom.nodeTypes.X3DInterpolatorNode
             * @initvalue 0
             * @field x3dom
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