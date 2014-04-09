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
        function (ctx) {
            x3dom.nodeTypes.X3DDamperNode.superClass.call(this, ctx);

            this.addField_SFTime(ctx, 'tau', 0.3);
            this.addField_SFFloat(ctx, 'tolerance', -1);
            this.addField_SFInt32(ctx, 'order', 3);

            this._eps = this._vf.tolerance < 0 ? this._eps : this._vf.tolerance;
            this._lastTick = 0;
        }
    )
);