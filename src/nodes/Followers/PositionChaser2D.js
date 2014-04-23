/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### PositionChaser2D ### */
x3dom.registerNodeType(
    "PositionChaser2D",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DChaserNode,
        
        /**
         * Constructor for PositionChaser2D
         * @constructs x3dom.nodeTypes.PositionChaser2D
         * @x3d 3.3
         * @component Followers
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChaserNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The PositionChaser2D animates transitions for 2D vectors. Whenever its destination field receives
         *  a 2D vector it creates a transition from its current 2D vector value to the newly set value. It creates a
         *  smooth transition that ends duration seconds after the last 2D vector has been received.
         */
        function (ctx) {
            x3dom.nodeTypes.PositionChaser2D.superClass.call(this, ctx);


            /**
             * The field initialDestination should be set to the same value than initialValue unless a transition to a
             *  certain 2D vector value is to be created right after the scene is loaded or right after the
             *  PositionChaser2D node is created dynamically.
             * @var {x3dom.fields.SFVec2f} initialDestination
             * @memberof x3dom.nodeTypes.PositionChaser2D
             * @initvalue 0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec2f(ctx, 'initialDestination', 0, 0);

            /**
             * The field initialValue can be used to set the initial initial value.
             * @var {x3dom.fields.SFVec2f} initialValue
             * @memberof x3dom.nodeTypes.PositionChaser2D
             * @initvalue 0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec2f(ctx, 'initialValue', 0, 0);


            /**
             * The current 2D position.
             * @var {x3dom.fields.SFVec2f} value
             * @memberof x3dom.nodeTypes.PositionChaser2D
             * @initvalue 0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec2f(ctx, 'value', 0, 0);

            /**
             * The target 2D position.
             * @var {x3dom.fields.SFVec2f} destination
             * @memberof x3dom.nodeTypes.PositionChaser2D
             * @initvalue 0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec2f(ctx, 'destination', 0, 0);

            this._buffer = new x3dom.fields.MFVec2f();
            this._previousValue = new x3dom.fields.SFVec2f(0, 0);
            this._value = new x3dom.fields.SFVec2f(0, 0);

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

                    this._previousValue.setValues(this._vf.value);
                    for (var C=1; C<this._buffer.length; C++) {
                        this._buffer[C].setValues(this._vf.value);
                    }

                    this.postMessage('value', this._vf.value);

                    if (!this._vf.isActive) {
                        this.postMessage('isActive', true);
                    }
                }
            },

            /** The following handler code is copy & paste from PositionChaser
             */
            initialize: function()
            {
                if (!this._initDone)
                {
                    this._initDone = true;

                    this._vf.destination = x3dom.fields.SFVec2f.copy(this._vf.initialDestination);

                    this._buffer.length = this._numSupports;

                    this._buffer[0] = x3dom.fields.SFVec2f.copy(this._vf.initialDestination);
                    for (var C=1; C<this._buffer.length; C++) {
                        this._buffer[C] = x3dom.fields.SFVec2f.copy(this._vf.initialValue);
                    }

                    this._previousValue = x3dom.fields.SFVec2f.copy(this._vf.initialValue);

                    this._stepTime = this._vf.duration / this._numSupports;

                    var active = !this._buffer[0].equals(this._buffer[1], this._eps);
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

                    this._value = x3dom.fields.SFVec2f.copy(this._vf.initialValue);

                    this.postMessage('value', this._value);

                    return true;
                }

                var Frac = this.updateBuffer(now);

                var Output = x3dom.fields.SFVec2f.copy(this._previousValue);

                var DeltaIn = this._buffer[this._buffer.length - 1].subtract(this._previousValue);

                var DeltaOut = DeltaIn.multiply(this.stepResponse((this._buffer.length - 1 + Frac) * this._stepTime));

                Output = Output.add(DeltaOut);

                for (var C=this._buffer.length - 2; C>=0; C--)
                {
                    DeltaIn = this._buffer[C].subtract(this._buffer[C + 1]);

                    DeltaOut = DeltaIn.multiply(this.stepResponse((C + Frac) * this._stepTime));

                    Output = Output.add(DeltaOut);
                }

                if ( !Output.equals(this._value, this._eps) ) {
                    this._value.setValues(Output);

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

                    if( NumToShift < this._buffer.length)
                    {
                        this._previousValue = x3dom.fields.SFVec2f.copy(this._buffer[this._buffer.length - NumToShift]);

                        for (C=this._buffer.length - 1; C>=NumToShift; C--) {
                            this._buffer[C]= x3dom.fields.SFVec2f.copy(this._buffer[C - NumToShift]);
                        }

                        for (C=0; C<NumToShift; C++)
                        {
                            Alpha = C / NumToShift;

                            this._buffer[C] = this._buffer[NumToShift].multiply(Alpha).add(this._vf.destination.multiply((1 - Alpha)));
                        }
                    }
                    else
                    {
                        this._previousValue = x3dom.fields.SFVec2f.copy((NumToShift == this._buffer.length) ?
                            this._buffer[0] : this._vf.destination);

                        for (C= 0; C<this._buffer.length; C++) {
                            this._buffer[C] = x3dom.fields.SFVec2f.copy(this._vf.destination);
                        }
                    }

                    this._bufferEndTime += NumToShift * this._stepTime;
                }

                return Frac;
            }
        }
    )
);