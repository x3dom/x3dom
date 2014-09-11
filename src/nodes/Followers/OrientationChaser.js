/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### OrientationChaser ### */
x3dom.registerNodeType(
    "OrientationChaser",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DChaserNode,
        
        /**
         * Constructor for OrientationChaser
         * @constructs x3dom.nodeTypes.OrientationChaser
         * @x3d 3.3
         * @component Followers
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChaserNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The OrientationChaser animates transitions for orientations. If it is routed to a rotation field
         *  of a Transform node that contains an object, whenever the set_destination field receives an orientation, the
         *  OrientationChaser node rotates the object from its current orientation to the newly set orientation.
         *  It creates a smooth transition that ends duration seconds after the last orientation has been received.
         */
        function (ctx) {
            x3dom.nodeTypes.OrientationChaser.superClass.call(this, ctx);


            /**
             * The field initialDestination should be set to the same value than initialValue unless a transition to a
             *  certain orientation is to be created right after the scene is loaded or right after the
             *  OrientationChaser node is created dynamically.
             * @var {x3dom.fields.SFRotation} initialDestination
             * @memberof x3dom.nodeTypes.OrientationChaser
             * @initvalue 0,1,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'initialDestination', 0, 1, 0, 0);

            /**
             * The field initialValue can be used to set the initial orientation of the object.
             * @var {x3dom.fields.SFRotation} initialValue
             * @memberof x3dom.nodeTypes.OrientationChaser
             * @initvalue 0,1,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'initialValue', 0, 1, 0, 0);


            /**
             * The current orientation value.
             * @var {x3dom.fields.SFRotation} value
             * @memberof x3dom.nodeTypes.OrientationChaser
             * @initvalue 0,1,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'value', 0, 1, 0, 0);

            /**
             * The target orientation value.
             * @var {x3dom.fields.SFRotation} destination
             * @memberof x3dom.nodeTypes.OrientationChaser
             * @initvalue 0,1,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'destination', 0, 1, 0, 0);

            this._numSupports = 30;
            this._buffer = new x3dom.fields.MFRotation();
            this._previousValue = new x3dom.fields.Quaternion(0, 1, 0, 0);
            this._value = new x3dom.fields.Quaternion(0, 1, 0, 0);

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

            /** The following handler code was basically taken from
             *  http://www.hersto.com/X3D/Followers
             */
            initialize: function()
            {
                if (!this._initDone)
                {
                    this._initDone = true;

                    this._vf.destination = x3dom.fields.Quaternion.copy(this._vf.initialDestination);

                    this._buffer.length = this._numSupports;

                    this._buffer[0] = x3dom.fields.Quaternion.copy(this._vf.initialDestination);
                    for (var C=1; C<this._buffer.length; C++) {
                        this._buffer[C] = x3dom.fields.Quaternion.copy(this._vf.initialValue);
                    }

                    this._previousValue = x3dom.fields.Quaternion.copy(this._vf.initialValue);

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
                    this._bufferEndTime = now; // first event we received, so we are in the initialization phase.

                    this._value = x3dom.fields.Quaternion.copy(this._vf.initialValue);

                    this.postMessage('value', this._value);

                    return true;
                }

                var Frac = this.updateBuffer(now);
                // Frac is a value in   0 <= Frac < 1.

                // now we can calculate the output.
                // This means we calculate the delta between each entry in _buffer and its previous
                // entries, calculate the step response of each such step and add it to form the output.

                // The oldest value _buffer[_buffer.length - 1] needs some extra thought, because it has
                // no previous value. More exactly, we haven't stored a previous value anymore.
                // However, the step response of that missing previous value has already reached its
                // destination, so we can - would we have that previous value - use this as a start point
                // for adding the step responses.
                // Actually updateBuffer(.) maintains this value in

                var Output = x3dom.fields.Quaternion.copy(this._previousValue);

                var DeltaIn = this._previousValue.inverse().multiply(this._buffer[this._buffer.length - 1]);

                Output = Output.slerp(Output.multiply(DeltaIn), this.stepResponse((this._buffer.length - 1 + Frac) * this._stepTime));

                for (var C=this._buffer.length - 2; C>=0; C--)
                {
                    DeltaIn = this._buffer[C + 1].inverse().multiply(this._buffer[C]);

                    Output = Output.slerp(Output.multiply(DeltaIn), this.stepResponse((C + Frac) * this._stepTime));
                }

                if ( !Output.equals(this._value, this._eps) ) {
                    Output = Output.normalize(Output);
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
                // is normally < 1. When it has grown to be larger than 1, we have to shift the array because the step response
                // of the oldest entry has already reached its destination, and it's time for a newer entry.
                // In the case of a very low frame rate, or a very short _stepTime we may need to shift by more than one entry.

                if (Frac >= 1)
                {
                    NumToShift = Math.floor(Frac);
                    Frac -= NumToShift;

                    if( NumToShift < this._buffer.length)
                    {
                        // normal case
                        this._previousValue = x3dom.fields.Quaternion.copy(this._buffer[this._buffer.length - NumToShift]);

                        for (C=this._buffer.length - 1; C>=NumToShift; C--) {
                            this._buffer[C] = x3dom.fields.Quaternion.copy(this._buffer[C - NumToShift]);
                        }

                        for (C=0; C<NumToShift; C++)
                        {
                            // Hmm, we have a destination value, but don't know how it has
                            // reached the current state.
                            // Therefore we do a linear interpolation from the latest value in the buffer to destination.
                            Alpha = C / NumToShift;

                            this._buffer[C] = this._vf.destination.slerp(this._buffer[NumToShift], Alpha);
                        }
                    }
                    else
                    {
                        // degenerated case:
                        //
                        // We have a _VERY_ low frame rate...
                        // we can only guess how we should fill the array.
                        // Maybe we could write part of a linear interpolation
                        // from this._buffer[0] to destination, that goes from this._bufferEndTime to now
                        // (possibly only the end of the interpolation is to be written),
                        // but if we reach here we are in a very degenerate case...
                        // Thus we just write destination to the buffer.

                        this._previousValue = x3dom.fields.Quaternion.copy((NumToShift == this._buffer.length) ?
                            this._buffer[0] : this._vf.destination);

                        for (C= 0; C<this._buffer.length; C++) {
                            this._buffer[C] = x3dom.fields.Quaternion.copy(this._vf.destination);
                        }
                    }

                    this._bufferEndTime += NumToShift * this._stepTime;
                }

                return Frac;
            }
        }
    )
);