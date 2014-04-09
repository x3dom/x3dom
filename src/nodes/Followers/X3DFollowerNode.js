/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DFollowerNode ### */
x3dom.registerNodeType(
    "X3DFollowerNode",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        
        /**
         * Constructor for X3DFollowerNode
         * @constructs x3dom.nodeTypes.X3DFollowerNode
         * @x3d x.x
         * @component Followers
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DFollowerNode.superClass.call(this, ctx);

            if (ctx)
                ctx.doc._nodeBag.followers.push(this);
            else
                x3dom.debug.logWarning("X3DFollowerNode: No runtime context found!");


            /**
             *
             * @var {SFBool} isActive
             * @memberof x3dom.nodeTypes.X3DFollowerNode
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'isActive', false);

            // http://www.web3d.org/files/specifications/19775-1/V3.3/Part01/components/followers.html
            // [S|M]F<type> [in]     set_destination
            // [S|M]F<type> [in]     set_value
            // [S|M]F<type> [out]    value
            // SFBool       [out]    isActive
            // [S|M]F<type> []       initialDestination
            // [S|M]F<type> []       initialValue

            this._eps = x3dom.fields.Eps; //0.001;
        
        },
        {
            parentRemoved: function(parent)
            {
                if (this._parentNodes.length === 0) {
                    var doc = this.findX3DDoc();

                    for (var i=0, n=doc._nodeBag.followers.length; i<n; i++) {
                        if (doc._nodeBag.followers[i] === this) {
                            doc._nodeBag.followers.splice(i, 1);
                        }
                    }
                }
            },

            tick: function(t) {
                return false;
            },

            stepResponse: function(t)
            {
                if (t <= 0) {
                    return 0;
                }

                if (t >= this._vf.duration) {
                    return 1;
                }

                // When optimizing for speed, the above two if(.) cases can be omitted,
                // as this function will not be called for values outside of 0..duration.
                return this.stepResponseCore(t / this._vf.duration);
            },

            // This function defines the shape of how the output responds to the initialDestination.
            // It must accept values for T in the range 0 <= T <= 1.
            // In this._vf.order to create a smooth animation, it should return 0 for T == 0,
            // 1 for T == 1 and be sufficient smooth in the range 0 <= T <= 1.
            //
            // It should be optimized for speed, in this._vf.order for high performance. It's
            // executed _buffer.length + 1 times each simulation tick.
            stepResponseCore: function(T)
            {
                return 0.5 - 0.5 * Math.cos(T * Math.PI);
            }
        }
    )
);