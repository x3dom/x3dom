/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### ScalarDamper ### */
x3dom.registerNodeType(
    "ScalarDamper",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        
        /**
         * Constructor for ScalarDamper
         * @constructs x3dom.nodeTypes.ScalarDamper
         * @x3d 3.3
         * @component Followers
         * @status experimental
         * @extends x3dom.nodeTypes.X3DDamperNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The ScalarDamper animates transitions for single float values. If the value field is routed to a
         *  transparency field of a Material node, then, whenever the destination field receives a single float value,
         *  the ScalarDamper node creates a transition from its current value to the newly set value.
         */
        function (ctx) {
            x3dom.nodeTypes.ScalarDamper.superClass.call(this, ctx);


            /**
             * The field initialDestination should be set to the same value than initialValue unless a transition to a
             *  certain value is to be created right after the scene is loaded or right after the ScalarDamper node is
             *  created dynamically.
             * @var {x3dom.fields.SFFloat} initialDestination
             * @memberof x3dom.nodeTypes.ScalarDamper
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'initialDestination', 0);

            /**
             * The field initialValue can be used to set the initial value of the node.
             * @var {x3dom.fields.SFFloat} initialValue
             * @memberof x3dom.nodeTypes.ScalarDamper
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'initialValue', 0);


            /**
             * The current value.
             * @var {x3dom.fields.SFFloat} value
             * @memberof x3dom.nodeTypes.ScalarDamper
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'value', 0);

            /**
             * The target value.
             * @var {x3dom.fields.SFFloat} destination
             * @memberof x3dom.nodeTypes.ScalarDamper
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'destination', 0);

            this._value0 = 0;
            this._value1 = 0;
            this._value2 = 0;
            this._value3 = 0;
            this._value4 = 0;
            this._value5 = 0;

            this.initialize();
        
        },
        {
            fieldChanged: function(fieldName)
            {
                if (fieldName === "tolerance")
                {
                    this._eps = this._vf.tolerance < 0 ? 0.001 : this._vf.tolerance;
                }
                else if (fieldName.indexOf("destination") >= 0)
                {
                    if (Math.abs(this._value0 - this._vf.destination) > this._eps) {
                        this._value0 = this._vf.destination;

                        if (!this._vf.isActive) {
                            //this._lastTick = 0;
                            this.postMessage('isActive', true);
                        }
                    }
                }
                else if (fieldName.indexOf("value") >= 0)
                {
                    this._value1 = this._vf.value;
                    this._value2 = this._vf.value;
                    this._value3 = this._vf.value;
                    this._value4 = this._vf.value;
                    this._value5 = this._vf.value;
                    this._lastTick = 0;

                    this.postMessage('value', this._value5);

                    if (!this._vf.isActive) {
                        this._lastTick = 0;
                        this.postMessage('isActive', true);
                    }
                }
            },

            initialize: function()
            {
                this._value0 = this._vf.initialDestination;
                this._value1 = this._vf.initialValue;
                this._value2 = this._vf.initialValue;
                this._value3 = this._vf.initialValue;
                this._value4 = this._vf.initialValue;
                this._value5 = this._vf.initialValue;
                this._lastTick = 0;

                var active = (Math.abs(this._value0 - this._value1) > this._eps);
                if (this._vf.isActive !== active) {
                    this.postMessage('isActive', active);
                }
            },

            tick: function(now)
            {
                //if (!this._vf.isActive)
                //    return false;

                if (!this._lastTick)
                {
                    this._lastTick = now;
                    return false;
                }

                var delta = now - this._lastTick;

                var alpha = Math.exp(-delta / this._vf.tau);

                this._value1 = this._vf.order > 0 && this._vf.tau ?
                    this._value0 + alpha * (this._value1 - this._value0) : this._value0;

                this._value2 = this._vf.order > 1 && this._vf.tau ?
                    this._value1 + alpha * (this._value2 - this._value1) : this._value1;

                this._value3 = this._vf.order > 2 && this._vf.tau ?
                    this._value2 + alpha * (this._value3 - this._value2) : this._value2;

                this._value4 = this._vf.order > 3 && this._vf.tau ?
                    this._value3 + alpha * (this._value4 - this._value3) : this._value3;

                this._value5 = this._vf.order > 4 && this._vf.tau ?
                    this._value4 + alpha * (this._value5 - this._value4) : this._value4;

                var dist = Math.abs(this._value1 - this._value0);

                if (this._vf.order > 1)
                {
                    var dist2 = Math.abs(this._value2 - this._value1);
                    if (dist2 > dist) {dist = dist2;}
                }
                if (this._vf.order > 2)
                {
                    var dist3 = Math.abs(this._value3 - this._value2);
                    if (dist3 > dist) {dist = dist3;}
                }
                if (this._vf.order > 3)
                {
                    var dist4 = Math.abs(this._value4 - this._value3);
                    if (dist4 > dist) {dist = dist4;}
                }
                if (this._vf.order > 4)
                {
                    var dist5 = Math.abs(this._value5 - this._value4);
                    if (dist5 > dist) {dist = dist5;}
                }

                if (dist <= this._eps)
                {
                    this._value1 = this._value0;
                    this._value2 = this._value0;
                    this._value3 = this._value0;
                    this._value4 = this._value0;
                    this._value5 = this._value0;

                    this.postMessage('value', this._value0);
                    this.postMessage('isActive', false);

                    this._lastTick = 0;

                    return false;
                }

                this.postMessage('value', this._value5);

                this._lastTick = now;

                return true;
            }
        }
    )
);