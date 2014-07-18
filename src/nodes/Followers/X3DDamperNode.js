/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DDamperNode ### */
x3dom.registerNodeType(
    "X3DDamperNode",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DFollowerNode,
        
        /**
         * Constructor for X3DDamperNode
         * @constructs x3dom.nodeTypes.X3DDamperNode
         * @x3d 3.3
         * @component Followers
         * @status experimental
         * @extends x3dom.nodeTypes.X3DFollowerNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The X3DDamperNode abstract node type creates an IIR response that approaches the destination
         *  value according to the shape of the e-function only asymptotically but very quickly. An X3DDamperNode node
         *  is parameterized by the tau, order and tolerance fields. Internally, it consists of a set of linear
         *  first-order filters each of which processes the output of the previous filter.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DDamperNode.superClass.call(this, ctx);


            /**
             * The field tau specifies the time-constant of the internal filters and thus the speed that the output of
             *  an X3DDamperNode responds to the input. A value of zero for tau means immediate response and the events
             *  received on set_destination are forwarded directly. The field tau specifies how long it takes the output
             *  of an internal filter to reach the value of its input by 63% (1 - 1/e). The remainder after that period
             *  is reduced by 63% during another period of tau seconds provided that the input of the filter does not
             *  change. This behavior can be exposed if order is set to one.
             * @var {x3dom.fields.SFTime} tau
             * @memberof x3dom.nodeTypes.X3DDamperNode
             * @initvalue 0.3
             * @range [0,inf)
             * @field x3d
             * @instance
             */
            this.addField_SFTime(ctx, 'tau', 0.3);

            /**
             * If tolerance is set to its default value -1, the browser implementation is allowed to find a good way for
             *  detecting the end of a transition. Browsers that do not have an elaborate algorithm can just use .001 as
             *  the tolerance value instead. If a value larger than zero is specified for tolerance, the browser shall
             *  calculate the difference between output and input for each internal filter being used and stop the
             *  animation only when all filters fall below that limit or are equal to it. If zero is specified for
             *  tolerance, a transition should be stopped only if input and output match exactly for all internal
             *  filters.
             * @var {x3dom.fields.SFFloat} tolerance
             * @memberof x3dom.nodeTypes.X3DDamperNode
             * @initvalue -1
             * @range -1 or [0,inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'tolerance', -1);

            /**
             * The order field specifies the smoothness of the transition.
             * @var {x3dom.fields.SFInt32} order
             * @memberof x3dom.nodeTypes.X3DDamperNode
             * @initvalue 3
             * @range [0..5]
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, 'order', 3);

            this._eps = this._vf.tolerance < 0 ? this._eps : this._vf.tolerance;
            this._lastTick = 0;
        
        }
    )
);