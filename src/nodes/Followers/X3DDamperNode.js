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
         * @x3d x.x
         * @component Followers
         * @status experimental
         * @extends x3dom.nodeTypes.X3DFollowerNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DDamperNode.superClass.call(this, ctx);


            /**
             *
             * @var {SFTime} tau
             * @memberof x3dom.nodeTypes.X3DDamperNode
             * @initvalue 0.3
             * @field x3dom
             * @instance
             */
            this.addField_SFTime(ctx, 'tau', 0.3);

            /**
             *
             * @var {SFFloat} tolerance
             * @memberof x3dom.nodeTypes.X3DDamperNode
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'tolerance', -1);

            /**
             *
             * @var {SFInt32} order
             * @memberof x3dom.nodeTypes.X3DDamperNode
             * @initvalue 3
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'order', 3);

            this._eps = this._vf.tolerance < 0 ? this._eps : this._vf.tolerance;
            this._lastTick = 0;
        
        }
    )
);