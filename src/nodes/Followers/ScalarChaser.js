/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### ScalarChaser ### */
x3dom.registerNodeType(
    "ScalarChaser",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DChaserNode,
        
        /**
         * Constructor for ScalarChaser
         * @constructs x3dom.nodeTypes.ScalarChaser
         * @x3d 3.3
         * @component Followers
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChaserNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The ScalarChaser animates transitions for single float values. Whenever the destination field
         *  receives a floating point number, it creates a transition from its current value to the newly set number.
         *  It creates a smooth transition that ends duration seconds after the last number has been received.
         */
        function (ctx) {
            x3dom.nodeTypes.ScalarChaser.superClass.call(this, ctx);


            /**
             * The field initialDestination should be set to the same value than initialValue unless a transition to a
             *  certain value is to be created right after the scene is loaded or right after the ScalarChaser node is
             *  created dynamically.
             * @var {x3dom.fields.SFFloat} initialDestination
             * @memberof x3dom.nodeTypes.ScalarChaser
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'initialDestination', 0);

            /**
             * The field initialValue can be used to set the initial initial value.
             * @var {x3dom.fields.SFFloat} initialValue
             * @memberof x3dom.nodeTypes.ScalarChaser
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'initialValue', 0);


            /**
             * The current value.
             * @var {x3dom.fields.SFFloat} value
             * @memberof x3dom.nodeTypes.ScalarChaser
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'value', 0);

            /**
             * The target value.
             * @var {x3dom.fields.SFFloat} destination
             * @memberof x3dom.nodeTypes.ScalarChaser
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'destination', 0);

            this._buffer = [];
            this._previousValue = 0;
            this._value = 0;

            this.initialize();
        
        },
        {
            fieldChanged: function(fieldName)
            {
                if (fieldName.indexOf("destination") >= 0)
                {
                    this.initialize();
                    this.updateBuffer(this._currTime);

                    if (!this._vf.isActive) {
                        this.postMessage('isActive', true);
                    }
                }
                else if (fieldName.indexOf("value") >= 0)
                {
                    this.initialize();

                    this._previousValue = this._vf.value;
                    for (var C=1; C<this._buffer.length; C++) {
                        this._buffer[C] = this._vf.value;
                    }

                    this.postMessage('value', this._vf.value);

                    if (!this._vf.isActive) {
                        this.postMessage('isActive', true);
                    }
                }
            },

            initialize: function()
            {
                if (!this._initDone)
                {
                    this._initDone = true;

                    this._vf.destination = this._vf.initialDestination;

                    this._buffer.length = this._numSupports;

                    this._buffer[0] = this._vf.initialDestination;
                    for (var C=1; C<this._buffer.length; C++) {
                        this._buffer[C] = this._vf.initialValue;
                    }

                    this._previousValue = this._vf.initialValue;

                    this._stepTime = this._vf.duration / this._numSupports;

                    var active = (Math.abs(this._buffer[0] - this._buffer[1]) > this._eps);
                    if (this._vf.isActive !== active) {
                        this.postMessage('isActive', active);
                    }
                }
            },

            tick: function(now)
            {
                this.initialize();
                this._currTime = now;

                //if (!this._vf.isActive)
                //    return false;

                if (!this._bufferEndTime)
                {
                    this._bufferEndTime = now;

                    this._value = this._vf.initialValue;

                    this.postMessage('value', this._value);

                    return true;
                }

                var Frac = this.updateBuffer(now);

                var Output = this._previousValue;

                var DeltaIn = this._buffer[this._buffer.length - 1] - this._previousValue;

                var DeltaOut = DeltaIn * (this.stepResponse((this._buffer.length - 1 + Frac) * this._stepTime));

                Output = Output + DeltaOut;

                for (var C=this._buffer.length - 2; C>=0; C--)
                {
                    DeltaIn = this._buffer[C] - this._buffer[C + 1];

                    DeltaOut = DeltaIn * (this.stepResponse((C + Frac) * this._stepTime));

                    Output = Output + DeltaOut;
                }

                if (Math.abs(Output - this._value) > this._eps) {
                    this._value = Output;

                    this.postMessage('value', this._value);
                }
                else {
                    this.postMessage('isActive', false);
                }

                return this._vf.isActive;
            },

            updateBuffer: function(now)
            {
                var Frac = (now - this._bufferEndTime) / this._stepTime;
                var C;
                var NumToShift;
                var Alpha;

                if (Frac >= 1)
                {
                    NumToShift = Math.floor(Frac);
                    Frac -= NumToShift;

                    if (NumToShift < this._buffer.length)
                    {
                        this._previousValue = this._buffer[this._buffer.length - NumToShift];

                        for (C=this._buffer.length - 1; C>=NumToShift; C--) {
                            this._buffer[C] = this._buffer[C - NumToShift];
                        }

                        for (C=0; C<NumToShift; C++)
                        {
                            Alpha = C / NumToShift;

                            this._buffer[C] = this._buffer[NumToShift] * Alpha + this._vf.destination * (1 - Alpha);
                        }
                    }
                    else
                    {
                        this._previousValue = (NumToShift == this._buffer.length) ? this._buffer[0] : this._vf.destination;

                        for (C = 0; C<this._buffer.length; C++) {
                            this._buffer[C] = this._vf.destination;
                        }
                    }

                    this._bufferEndTime += NumToShift * this._stepTime;
                }

                return Frac;
            }
        }
    )
);