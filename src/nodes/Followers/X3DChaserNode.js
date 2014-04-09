/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DChaserNode ### */
x3dom.registerNodeType(
    "X3DChaserNode",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DFollowerNode,
        function (ctx) {
            x3dom.nodeTypes.X3DChaserNode.superClass.call(this, ctx);

            this.addField_SFTime(ctx, 'duration', 1);

            this._initDone = false;
            this._stepTime = 0;
            this._currTime = 0;
            this._bufferEndTime = 0;
            this._numSupports = 60;
        }
    )
);