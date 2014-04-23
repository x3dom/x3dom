/** @namespace x3dom.nodeTypes */
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
        
        /**
         * Constructor for X3DChaserNode
         * @constructs x3dom.nodeTypes.X3DChaserNode
         * @x3d 3.3
         * @component Followers
         * @status experimental
         * @extends x3dom.nodeTypes.X3DFollowerNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The X3DChaserNode abstract node type calculates the output on value_changed as a finite impulse
         *  response (FIR).
         */
        function (ctx) {
            x3dom.nodeTypes.X3DChaserNode.superClass.call(this, ctx);


            /**
             * Duration of the transition
             * @var {x3dom.fields.SFTime} duration
             * @memberof x3dom.nodeTypes.X3DChaserNode
             * @initvalue 1
             * @field x3d
             * @instance
             */
            this.addField_SFTime(ctx, 'duration', 1);

            this._initDone = false;
            this._stepTime = 0;
            this._currTime = 0;
            this._bufferEndTime = 0;
            this._numSupports = 60;
        
        }
    )
);