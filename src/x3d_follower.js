/*!
* x3dom javascript library 1.0
* http://www.x3dom.org/
*
* Copyright (c) 2010 Johannes Behr, Yvonne Jung
*     based on code originally provided by Philip Taylor:
*     http://philip.html5.org
* Dual licensed under the MIT and GPL licenses.
* 
*/

/* ### X3DFollowerNode ### */
x3dom.registerNodeType(
    "X3DFollowerNode",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DFollowerNode.superClass.call(this, ctx);
            
            ctx.doc._nodeBag.followers.push(this);
            
            // TODO: implement isActive!
            // [S|M]F<type> [in]     set_destination
            // [S|M]F<type> [in]     set_value
            // SFBool       [out]    isActive
            // [S|M]F<type> [out]    value_changed
            // [S|M]F<type> []       initialDestination
            // [S|M]F<type> []       initialValue
        },
        {
            nodeChanged: function() {},
            
            fieldChanged: function(fieldName) {},
            
            tick: function(t) {
                return false;
            },
            
            stepResponse: function(t)
            {
                if (t <= 0)
                    return 0;

                if (t >= this._vf.duration)
                    return 1;

                // When optimizing for speed, the above two if(.) cases can be omitted,
                // as this funciton will not be called for values outside of 0..duration.
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

/* ### X3DChaserNode ### */
x3dom.registerNodeType(
    "X3DChaserNode",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DFollowerNode,
        function (ctx) {
            x3dom.nodeTypes.X3DChaserNode.superClass.call(this, ctx);

            this.addField_SFTime(ctx, 'duration', 0);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### X3DDamperNode ### */
x3dom.registerNodeType(
    "X3DDamperNode",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DFollowerNode,
        function (ctx) {
            x3dom.nodeTypes.X3DDamperNode.superClass.call(this, ctx);

            this.addField_SFTime(ctx, 'tau', 0);
            this.addField_SFFloat(ctx, 'tolerance', -1);
            this.addField_SFInt32(ctx, 'order', 0);
            
            this._eps = this._vf.tolerance < 0 ? 0.001 : this._vf.tolerance;
            this._lastTick = 0;
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### ColorChaser ### */
x3dom.registerNodeType(
    "ColorChaser",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DChaserNode,
        function (ctx) {
            x3dom.nodeTypes.ColorChaser.superClass.call(this, ctx);

            this.addField_SFColor(ctx, 'initialDestination', 0.8, 0.8, 0.8);
            this.addField_SFColor(ctx, 'initialValue', 0.8, 0.8, 0.8);
            
            // How to treat eventIn nicely such that external scripting is handled for set_XXX?
            this.addField_SFColor(ctx, 'set_value', 0, 0, 0);
            this.addField_SFColor(ctx, 'set_destination', 0, 0, 0);
            
            this._initDone = false;
            this._numSupports = 60;
            this._stepTime = 0;
            this._currTime = 0;
            this._bufferEndTime = 0;
            this._buffer = new x3dom.fields.MFColor();
            this._previousValue = new x3dom.fields.SFColor(0, 0, 0);
            this._value = new x3dom.fields.SFColor(0, 0, 0);
        },
        {
            nodeChanged: function() 
            {
                this.initialize();
            },
            
            fieldChanged: function(fieldName)
            {
                if (fieldName.indexOf("set_destination") >= 0)
                {
                    this.initialize();
                    this.updateBuffer(this._currTime);
                }
                else if (fieldName.indexOf("set_value") >= 0)
                {
                    this.initialize();
                    
                    this._previousValue.setValues(this._vf.set_value);
                    for (var C=1; C<this._buffer.length; C++)
                        this._buffer[C].setValues(this._vf.set_value);
                    
                    this.postMessage('value_changed', this._vf.set_value);
                }
            },
            
            /** The following handler code is copy & paste from PositionChaser
             */
            initialize: function()
            {
                if (!this._initDone)
                {
                    this._initDone = true;
                    
                    this._vf.set_destination = this._vf.initialDestination;

                    this._buffer.length = this._numSupports;

                    this._buffer[0] = this._vf.initialDestination;
                    for (var C=1; C<this._buffer.length; C++)
                        this._buffer[C] = this._vf.initialValue;

                    this._previousValue = this._vf.initialValue;

                    this._stepTime = this._vf.duration / this._numSupports;
                }
            },

            tick: function(now)
            {
                this.initialize();
                this._currTime = now;
                
                if (!this._bufferEndTime)
                {
                    this._bufferEndTime = now;

                    this._value = this._vf.initialValue;
                    
                    this.postMessage('value_changed', this._value);
                    
                    return true;
                }

                var Frac = this.updateBuffer(now);
                
                var Output = this._previousValue;

                var DeltaIn = this._buffer[this._buffer.length - 1].subtract(this._previousValue);

                var DeltaOut = DeltaIn.multiply(this.stepResponse((this._buffer.length - 1 + Frac) * this._stepTime));

                Output = Output.add(DeltaOut);

                for (var C=this._buffer.length - 2; C>=0; C--)
                {
                    DeltaIn = this._buffer[C].subtract(this._buffer[C + 1]);

                    DeltaOut = DeltaIn.multiply(this.stepResponse((C + Frac) * this._stepTime));

                    Output = Output.add(DeltaOut);
                }
                
                if ( !Output.equals(this._value, x3dom.fields.Eps) ) {
                    this._value.setValues(Output);
                    
                    this.postMessage('value_changed', this._value);
                    
                    return true;
                }
                else {
                    return false;
                }
            },
            
            updateBuffer: function(now)
            {
                var Frac = (now - this._bufferEndTime) / this._stepTime;
                
                if (Frac >= 1)
                {
                    var NumToShift = Math.floor(Frac);
                    Frac -= NumToShift;

                    if( NumToShift < this._buffer.length)
                    { 
                        this._previousValue = this._buffer[this._buffer.length - NumToShift];

                        for (var C=this._buffer.length - 1; C>=NumToShift; C--)
                            this._buffer[C] = this._buffer[C - NumToShift];

                        for (var C=0; C<NumToShift; C++)
                        {
                            var Alpha = C / NumToShift;

                            this._buffer[C] = this._buffer[NumToShift].multiply(Alpha).add(this._vf.set_destination.multiply((1 - Alpha)));
                        }
                    }
                    else
                    {
                        this._previousValue = (NumToShift == this._buffer.length) ? this._buffer[0] : this._vf.set_destination;

                        for (var C= 0; C<this._buffer.length; C++)
                            this._buffer[C] = this._vf.set_destination;
                    }

                    this._bufferEndTime += NumToShift * this._stepTime;
                }

                return Frac;
            }
        }
    )
);

/* ### ColorDamper ### */
x3dom.registerNodeType(
    "ColorDamper",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        function (ctx) {
            x3dom.nodeTypes.ColorDamper.superClass.call(this, ctx);

            this.addField_SFColor(ctx, 'initialDestination', 0.8, 0.8, 0.8);
            this.addField_SFColor(ctx, 'initialValue', 0.8, 0.8, 0.8);
            
            // How to treat eventIn nicely such that external scripting is handled for set_XXX?
            this.addField_SFColor(ctx, 'set_value', 0, 0, 0);
            this.addField_SFColor(ctx, 'set_destination', 0, 0, 0);
            
            this._value0 = new x3dom.fields.SFColor(0, 0, 0);
            this._value1 = new x3dom.fields.SFColor(0, 0, 0);
            this._value2 = new x3dom.fields.SFColor(0, 0, 0);
            this._value3 = new x3dom.fields.SFColor(0, 0, 0);
            this._value4 = new x3dom.fields.SFColor(0, 0, 0);
            this._value5 = new x3dom.fields.SFColor(0, 0, 0);
            
            this.initialize();
        },
        {
            nodeChanged: function() 
            {
            },
            
            fieldChanged: function(fieldName)
            {
                if (fieldName.indexOf("set_destination") >= 0)
                {
                    if ( !this._value0.equals(this._vf.set_destination, this._eps) ) {
                        this._value0 = this._vf.set_destination;
                        //this._lastTick = 0;
                    }
                }
                else if (fieldName.indexOf("set_value") >= 0)
                {
                    this._value1.setValues(this._vf.set_value);
                    this._value2.setValues(this._vf.set_value);
                    this._value3.setValues(this._vf.set_value);
                    this._value4.setValues(this._vf.set_value);
                    this._value5.setValues(this._vf.set_value);
                    this._lastTick = 0;
                    
                    this.postMessage('value_changed', this._value5);
                }
            },
            
            initialize: function()
            {
                this._value0.setValues(this._vf.initialDestination);
                this._value1.setValues(this._vf.initialValue);
                this._value2.setValues(this._vf.initialValue);
                this._value3.setValues(this._vf.initialValue);
                this._value4.setValues(this._vf.initialValue);
                this._value5.setValues(this._vf.initialValue);
                this._lastTick = 0;
            },
            
            distance: function(a, b)
            {
                var diff = a.subtract(b);
                return Math.sqrt(diff.r*diff.r + diff.g*diff.g + diff.b*diff.b);
            },
            
            // The ColorDamper animates SFColor values not in HSV space
            // but as proposed in the original PROTO code in RGB space.
            tick: function(now)
            {
                if (!this._lastTick)
                {
                    this._lastTick = now;
                    return false;
                }

                var delta = now - this._lastTick;

                var alpha = Math.exp(-delta / this._vf.tau);

                this._value1 = this._vf.order > 0 && this._vf.tau
                ? this._value0.add(this._value1.subtract(this._value0).multiply(alpha))
                : new x3dom.fields.SFColor(this._value0.r, this._value0.g, this._value0.b);

                this._value2 = this._vf.order > 1 && this._vf.tau
                ? this._value1.add(this._value2.subtract(this._value1).multiply(alpha))
                : new x3dom.fields.SFColor(this._value1.r, this._value1.g, this._value1.b);

                this._value3 = this._vf.order > 2 && this._vf.tau
                ? this._value2.add(this._value3.subtract(this._value2).multiply(alpha))
                : new x3dom.fields.SFColor(this._value2.r, this._value2.g, this._value2.b);

                this._value4 = this._vf.order > 3 && this._vf.tau
                ? this._value3.add(this._value4.subtract(this._value3).multiply(alpha))
                : new x3dom.fields.SFColor(this._value3.r, this._value3.g, this._value3.b);

                this._value5 = this._vf.order > 4 && this._vf.tau
                ? this._value4.add(this._value5.subtract(this._value4).multiply(alpha))
                : new x3dom.fields.SFColor(this._value4.r, this._value4.g, this._value4.b);

                var dist = this.distance(this._value1, this._value0);
                
                if (this._vf.order > 1)
                {
                    var dist2 = this.distance(this._value2, this._value1);
                    if (dist2 > dist) dist = dist2;
                }
                if (this._vf.order > 2)
                {
                    var dist3 = this.distance(this._value3, this._value2);
                    if (dist3 > dist) dist = dist3;
                }
                if (this._vf.order > 3)
                {
                    var dist4 = this.distance(this._value4, this._value3);
                    if (dist4 > dist) dist = dist4;
                }
                if (this._vf.order > 4)
                {
                    var dist5 = this.distance(this._value5, this._value4);
                    if (dist5 > dist) dist = dist5;
                }
                
                if (dist < this._eps)
                {
                    this._value1.setValues(this._value0);
                    this._value2.setValues(this._value0);
                    this._value3.setValues(this._value0);
                    this._value4.setValues(this._value0);
                    this._value5.setValues(this._value0);
                    
                    this.postMessage('value_changed', this._value0);
                    
                    this._lastTick = 0;
                    
                    return false;
                }
                
                this.postMessage('value_changed', this._value5);

                this._lastTick = now;

                return true;
            }
        }
    )
);

/* ### OrientationChaser ### */
x3dom.registerNodeType(
    "OrientationChaser",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DChaserNode,
        function (ctx) {
            x3dom.nodeTypes.OrientationChaser.superClass.call(this, ctx);

            this.addField_SFRotation(ctx, 'initialDestination', 0, 1, 0, 0);
            this.addField_SFRotation(ctx, 'initialValue', 0, 1, 0, 0);
            
            // How to treat eventIn nicely such that external scripting is handled for set_XXX?
            this.addField_SFRotation(ctx, 'set_value', 0, 1, 0, 0);
            this.addField_SFRotation(ctx, 'set_destination', 0, 1, 0, 0);
            
            this._initDone = false;
            this._numSupports = 30;
            this._stepTime = 0;
            this._currTime = 0;
            this._bufferEndTime = 0;
            this._buffer = new x3dom.fields.MFRotation();
            this._previousValue = new x3dom.fields.Quaternion(0, 1, 0, 0);
            this._value = new x3dom.fields.Quaternion(0, 1, 0, 0);
        },
        {
            nodeChanged: function() 
            {
                this.initialize();
            },
            
            fieldChanged: function(fieldName)
            {
                if (fieldName.indexOf("set_destination") >= 0)
                {
                    this.initialize();
                    this.updateBuffer(this._currTime);
                }
                else if (fieldName.indexOf("set_value") >= 0)
                {
                    this.initialize();
                    
                    this._previousValue.setValues(this._vf.set_value);
                    for (var C=1; C<this._buffer.length; C++)
                        this._buffer[C].setValues(this._vf.set_value);
                    
                    this.postMessage('value_changed', this._vf.set_value);
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
                    
                    this._vf.set_destination = this._vf.initialDestination;

                    this._buffer.length = this._numSupports;

                    this._buffer[0] = this._vf.initialDestination;
                    for (var C=1; C<this._buffer.length; C++)
                        this._buffer[C] = this._vf.initialValue;

                    this._previousValue = this._vf.initialValue;

                    this._stepTime = this._vf.duration / this._numSupports;
                }
            },

            tick: function(now)
            {
                this.initialize();
                this._currTime = now;
                
                if (!this._bufferEndTime)
                {
                    this._bufferEndTime = now; // first event we received, so we are in the initialization phase.

                    this._value = this._vf.initialValue;
                    
                    this.postMessage('value_changed', this._value);
                    
                    return true;
                }

                var Frac = this.updateBuffer(now);
                // Frac is a value in   0 <= Frac < 1.

                // now we can calculate the output.
                // This means we calculate the delta between each entry in _buffer and its previous
                // entries, calculate the step response of each such step and add it to form the output.

                // The oldest vaule _buffer[_buffer.length - 1] needs some extra thought, because it has
                // no previous value. More exactly, we haven't stored a previous value anymore.
                // However, the step response of that missing previous value has already reached its
                // destination, so we can - would we have that previous value - use this as a start point
                // for adding the step responses.
                // Actually updateBuffer(.) maintains this value in

                var Output = this._previousValue;

                var DeltaIn = this._previousValue.inverse().multiply(this._buffer[this._buffer.length - 1]);
                
                Output = Output.slerp(Output.multiply(DeltaIn), this.stepResponse((this._buffer.length - 1 + Frac) * this._stepTime));
                
                for (var C=this._buffer.length - 2; C>=0; C--)
                {
                    DeltaIn = this._buffer[C + 1].inverse().multiply(this._buffer[C]);
                    
                    Output = Output.slerp(Output.multiply(DeltaIn), this.stepResponse((C + Frac) * this._stepTime));
                }
                
                if ( !Output.equals(this._value, x3dom.fields.Eps) ) {
                    this._value.setValues(Output);
                    
                    this.postMessage('value_changed', this._value);
                    
                    return true;
                }
                else {
                    return false;
                }
            },
            
            updateBuffer: function(now)
            {
                var Frac = (now - this._bufferEndTime) / this._stepTime;
                // is normally < 1. When it has grown to be larger than 1, we have to shift the array because the step response
                // of the oldest entry has already reached its destination, and it's time for a newer entry.
                // has already reached it
                // In the case of a very low frame rate, or a very short _stepTime we may need to shift by more than one entry.

                if (Frac >= 1)
                {
                    var NumToShift = Math.floor(Frac);
                    Frac -= NumToShift;

                    if( NumToShift < this._buffer.length)
                    {   
                        // normal case
                        this._previousValue = this._buffer[this._buffer.length - NumToShift];

                        for (var C=this._buffer.length - 1; C>=NumToShift; C--)
                            this._buffer[C] = this._buffer[C - NumToShift];

                        for (var C=0; C<NumToShift; C++)
                        {
                            // Hmm, we have a destination value, but don't know how it has
                            // reached the current state.
                            // Therefore we do a linear interpolation from the latest value in the buffer to destination.
                            var Alpha = C / NumToShift;

                            this._buffer[C] = this._vf.set_destination.slerp(this._buffer[NumToShift], Alpha);
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
                        // but if we rech here we are in a very degenerate case...
                        // Thus we just write destination to the buffer.

                        this._previousValue = (NumToShift == this._buffer.length) ? this._buffer[0] : this._vf.set_destination;

                        for (var C= 0; C<this._buffer.length; C++)
                            this._buffer[C] = this._vf.set_destination;
                    }

                    this._bufferEndTime += NumToShift * this._stepTime;
                }

                return Frac;
            }
        }
    )
);

/* ### OrientationDamper ### */
x3dom.registerNodeType(
    "OrientationDamper",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        function (ctx) {
            x3dom.nodeTypes.OrientationDamper.superClass.call(this, ctx);

            this.addField_SFRotation(ctx, 'initialDestination', 0, 1, 0, 0);
            this.addField_SFRotation(ctx, 'initialValue', 0, 1, 0, 0);
            
            // How to treat eventIn nicely such that external scripting is handled for set_XXX?
            this.addField_SFRotation(ctx, 'set_value', 0, 1, 0, 0);
            this.addField_SFRotation(ctx, 'set_destination', 0, 1, 0, 0);
            
            this._value0 = new x3dom.fields.Quaternion(0, 1, 0, 0);
            this._value1 = new x3dom.fields.Quaternion(0, 1, 0, 0);
            this._value2 = new x3dom.fields.Quaternion(0, 1, 0, 0);
            this._value3 = new x3dom.fields.Quaternion(0, 1, 0, 0);
            this._value4 = new x3dom.fields.Quaternion(0, 1, 0, 0);
            this._value5 = new x3dom.fields.Quaternion(0, 1, 0, 0);
            
            this.initialize();
        },
        {
            nodeChanged: function() 
            {
            },
            
            fieldChanged: function(fieldName)
            {
                if (fieldName.indexOf("set_destination") >= 0)
                {
                    if ( !this._value0.equals(this._vf.set_destination, this._eps) ) {
                        this._value0 = this._vf.set_destination;
                        //this._lastTick = 0;
                    }
                }
                else if (fieldName.indexOf("set_value") >= 0)
                {
                    this._value1.setValues(this._vf.set_value);
                    this._value2.setValues(this._vf.set_value);
                    this._value3.setValues(this._vf.set_value);
                    this._value4.setValues(this._vf.set_value);
                    this._value5.setValues(this._vf.set_value);
                    this._lastTick = 0;
                    
                    this.postMessage('value_changed', this._value5);
                }
            },
            
            initialize: function()
            {
                this._value0.setValues(this._vf.initialDestination);
                this._value1.setValues(this._vf.initialValue);
                this._value2.setValues(this._vf.initialValue);
                this._value3.setValues(this._vf.initialValue);
                this._value4.setValues(this._vf.initialValue);
                this._value5.setValues(this._vf.initialValue);
                this._lastTick = 0;
            },
            
            tick: function(now)
            {
                if (!this._lastTick)
                {
                    this._lastTick = now;
                    return false;
                }

                var delta = now - this._lastTick;

                var alpha = Math.exp(-delta / this._vf.tau);

                this._value1 = this._vf.order > 0 && this._vf.tau
                ? this._value0.slerp(this._value1, alpha)
                : new x3dom.fields.Quaternion(
                      this._value0.x, this._value0.y, this._value0.z, this._value0.w);

                this._value2 = this._vf.order > 1 && this._vf.tau
                ? this._value1.slerp(this._value2, alpha)
                : new x3dom.fields.Quaternion(
                      this._value1.x, this._value1.y, this._value1.z, this._value1.w);

                this._value3 = this._vf.order > 2 && this._vf.tau
                ? this._value2.slerp(this._value3, alpha)
                : new x3dom.fields.Quaternion(
                      this._value2.x, this._value2.y, this._value2.z, this._value2.w);

                this._value4 = this._vf.order > 3 && this._vf.tau
                ? this._value3.slerp(this._value4, alpha)
                : new x3dom.fields.Quaternion(
                      this._value3.x, this._value3.y, this._value3.z, this._value3.w);

                this._value5 = this._vf.order > 4 && this._vf.tau
                ? this._value4.slerp(this._value5, alpha)
                : new x3dom.fields.Quaternion(
                      this._value4.x, this._value4.y, this._value4.z, this._value4.w);

                var dist = Math.abs(this._value1.inverse().multiply(this._value0).angle());
                
                if(this._vf.order > 1)
                {
                    var dist2 = Math.abs(this._value2.inverse().multiply(this._value1).angle());
                    if (dist2 > dist)  dist = dist2;
                }
                if(this._vf.order > 2)
                {
                    var dist3 = Math.abs(this._value3.inverse().multiply(this._value2).angle());
                    if (dist3 > dist)  dist = dist3;
                }
                if(this._vf.order > 3)
                {
                    var dist4 = Math.abs(this._value4.inverse().multiply(this._value3).angle());
                    if (dist4 > dist)  dist = dist4;
                }
                if(this._vf.order > 4)
                {
                    var dist5 = Math.abs(this._value5.inverse().multiply(this._value4).angle());
                    if (dist5 > dist)  dist = dist5;
                }

                if (dist < this._eps)
                {
                    this._value1.setValues(this._value0);
                    this._value2.setValues(this._value0);
                    this._value3.setValues(this._value0);
                    this._value4.setValues(this._value0);
                    this._value5.setValues(this._value0);
                    
                    this.postMessage('value_changed', this._value0);
                    
                    this._lastTick = 0;
                    
                    return false;
                }
                
                this.postMessage('value_changed', this._value5);

                this._lastTick = now;

                return true;
            }
        }
    )
);

/* ### PositionChaser ### */
x3dom.registerNodeType(
    "PositionChaser",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DChaserNode,
        function (ctx) {
            x3dom.nodeTypes.PositionChaser.superClass.call(this, ctx);
            
            this.addField_SFVec3f(ctx, 'initialDestination', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'initialValue', 0, 0, 0);
            
            // How to treat eventIn nicely such that external scripting is handled for set_XXX?
            this.addField_SFVec3f(ctx, 'set_value', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'set_destination', 0, 0, 0);
            
            this._initDone = false;
            this._numSupports = 60;
            this._stepTime = 0;
            this._currTime = 0;
            this._bufferEndTime = 0;
            this._buffer = new x3dom.fields.MFVec3f();
            this._previousValue = new x3dom.fields.SFVec3f(0, 0, 0);
            this._value = new x3dom.fields.SFVec3f(0, 0, 0);
            
            //this._fieldWatchers.destination = this._fieldWatchers.set_destination = [ function (msg) {
            //    this.set_destination(this._currTime);
            //} ];
        },
        {
            nodeChanged: function() 
            {
                this.initialize();
            },
            
            fieldChanged: function(fieldName)
            {
                if (fieldName.indexOf("set_destination") >= 0)
                {
                    this.initialize();
                    this.updateBuffer(this._currTime);
                }
                else if (fieldName.indexOf("set_value") >= 0)
                {
                    this.initialize();
                    
                    this._previousValue.setValues(this._vf.set_value);
                    for (var C=1; C<this._buffer.length; C++)
                        this._buffer[C].setValues(this._vf.set_value);
                    
                    this.postMessage('value_changed', this._vf.set_value);
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
                    
                    this._vf.set_destination = this._vf.initialDestination;

                    this._buffer.length = this._numSupports;

                    this._buffer[0] = this._vf.initialDestination;
                    for (var C=1; C<this._buffer.length; C++)
                        this._buffer[C] = this._vf.initialValue;

                    this._previousValue = this._vf.initialValue;

                    this._stepTime = this._vf.duration / this._numSupports;
                }
            },

            tick: function(now)
            {
                this.initialize();
                this._currTime = now;
                
                if (!this._bufferEndTime)
                {
                    this._bufferEndTime = now; // first event we received, so we are in the initialization phase.

                    this._value = this._vf.initialValue;
                    
                    this.postMessage('value_changed', this._value);
                    
                    return true;
                }

                var Frac = this.updateBuffer(now);
                // Frac is a value in   0 <= Frac < 1.

                // now we can calculate the output.
                // This means we calculate the delta between each entry in _buffer and its previous
                // entries, calculate the step response of each such step and add it to form the output.

                // The oldest vaule _buffer[_buffer.length - 1] needs some extra thought, because it has
                // no previous value. More exactly, we haven't stored a previous value anymore.
                // However, the step response of that missing previous value has already reached its
                // destination, so we can - would we have that previous value - use this as a start point
                // for adding the step responses.
                // Actually updateBuffer(.) maintains this value in

                var Output = this._previousValue;

                var DeltaIn = this._buffer[this._buffer.length - 1].subtract(this._previousValue);

                var DeltaOut = DeltaIn.multiply(this.stepResponse((this._buffer.length - 1 + Frac) * this._stepTime));

                Output = Output.add(DeltaOut);

                for (var C=this._buffer.length - 2; C>=0; C--)
                {
                    DeltaIn = this._buffer[C].subtract(this._buffer[C + 1]);

                    DeltaOut = DeltaIn.multiply(this.stepResponse((C + Frac) * this._stepTime));

                    Output = Output.add(DeltaOut);
                }
                
                if ( !Output.equals(this._value, x3dom.fields.Eps) ) {
                    this._value.setValues(Output);
                    
                    this.postMessage('value_changed', this._value);
                    
                    return true;
                }
                else {
                    return false;
                }
            },
            
            updateBuffer: function(now)
            {
                var Frac = (now - this._bufferEndTime) / this._stepTime;
                // is normally < 1. When it has grown to be larger than 1, we have to shift the array because the step response
                // of the oldest entry has already reached its destination, and it's time for a newer entry.
                // has already reached it
                // In the case of a very low frame rate, or a very short _stepTime we may need to shift by more than one entry.

                if (Frac >= 1)
                {
                    var NumToShift = Math.floor(Frac);
                    Frac -= NumToShift;

                    if( NumToShift < this._buffer.length)
                    {   
                        // normal case
                        this._previousValue = this._buffer[this._buffer.length - NumToShift];

                        for (var C=this._buffer.length - 1; C>=NumToShift; C--)
                            this._buffer[C] = this._buffer[C - NumToShift];

                        for (var C=0; C<NumToShift; C++)
                        {
                            // Hmm, we have a destination value, but don't know how it has
                            // reached the current state.
                            // Therefore we do a linear interpolation from the latest value in the buffer to destination.
                            var Alpha = C / NumToShift;

                            this._buffer[C] = this._buffer[NumToShift].multiply(Alpha).add(this._vf.set_destination.multiply((1 - Alpha)));
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
                        // but if we rech here we are in a very degenerate case...
                        // Thus we just write destination to the buffer.

                        this._previousValue = (NumToShift == this._buffer.length) ? this._buffer[0] : this._vf.set_destination;

                        for (var C= 0; C<this._buffer.length; C++)
                            this._buffer[C] = this._vf.set_destination;
                    }

                    this._bufferEndTime += NumToShift * this._stepTime;
                }

                return Frac;
            }
        }
    )
);

/* ### PositionChaser2D ### */
x3dom.registerNodeType(
    "PositionChaser2D",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DChaserNode,
        function (ctx) {
            x3dom.nodeTypes.PositionChaser2D.superClass.call(this, ctx);

            this.addField_SFVec2f(ctx, 'initialDestination', 0, 0);
            this.addField_SFVec2f(ctx, 'initialValue', 0, 0);
            
            // How to treat eventIn nicely such that external scripting is handled for set_XXX?
            this.addField_SFVec2f(ctx, 'set_value', 0, 0);
            this.addField_SFVec2f(ctx, 'set_destination', 0, 0);
            
            this._initDone = false;
            this._numSupports = 60;
            this._stepTime = 0;
            this._currTime = 0;
            this._bufferEndTime = 0;
            this._buffer = new x3dom.fields.MFVec2f();
            this._previousValue = new x3dom.fields.SFVec2f(0, 0);
            this._value = new x3dom.fields.SFVec2f(0, 0);
        },
        {
            nodeChanged: function() 
            {
                this.initialize();
            },
            
            fieldChanged: function(fieldName)
            {
                if (fieldName.indexOf("set_destination") >= 0)
                {
                    this.initialize();
                    this.updateBuffer(this._currTime);
                }
                else if (fieldName.indexOf("set_value") >= 0)
                {
                    this.initialize();
                    
                    this._previousValue.setValues(this._vf.set_value);
                    for (var C=1; C<this._buffer.length; C++)
                        this._buffer[C].setValues(this._vf.set_value);
                    
                    this.postMessage('value_changed', this._vf.set_value);
                }
            },
            
            /** The following handler code is copy & paste from PositionChaser
             */
            initialize: function()
            {
                if (!this._initDone)
                {
                    this._initDone = true;
                    
                    this._vf.set_destination = this._vf.initialDestination;

                    this._buffer.length = this._numSupports;

                    this._buffer[0] = this._vf.initialDestination;
                    for (var C=1; C<this._buffer.length; C++)
                        this._buffer[C] = this._vf.initialValue;

                    this._previousValue = this._vf.initialValue;

                    this._stepTime = this._vf.duration / this._numSupports;
                }
            },

            tick: function(now)
            {
                this.initialize();
                this._currTime = now;
                
                if (!this._bufferEndTime)
                {
                    this._bufferEndTime = now;

                    this._value = this._vf.initialValue;
                    
                    this.postMessage('value_changed', this._value);
                    
                    return true;
                }

                var Frac = this.updateBuffer(now);
                
                var Output = this._previousValue;

                var DeltaIn = this._buffer[this._buffer.length - 1].subtract(this._previousValue);

                var DeltaOut = DeltaIn.multiply(this.stepResponse((this._buffer.length - 1 + Frac) * this._stepTime));

                Output = Output.add(DeltaOut);

                for (var C=this._buffer.length - 2; C>=0; C--)
                {
                    DeltaIn = this._buffer[C].subtract(this._buffer[C + 1]);

                    DeltaOut = DeltaIn.multiply(this.stepResponse((C + Frac) * this._stepTime));

                    Output = Output.add(DeltaOut);
                }
                
                if ( !Output.equals(this._value, x3dom.fields.Eps) ) {
                    this._value.setValues(Output);
                    
                    this.postMessage('value_changed', this._value);
                    
                    return true;
                }
                else {
                    return false;
                }
            },
            
            updateBuffer: function(now)
            {
                var Frac = (now - this._bufferEndTime) / this._stepTime;
                
                if (Frac >= 1)
                {
                    var NumToShift = Math.floor(Frac);
                    Frac -= NumToShift;

                    if( NumToShift < this._buffer.length)
                    {
                        this._previousValue = this._buffer[this._buffer.length - NumToShift];

                        for (var C=this._buffer.length - 1; C>=NumToShift; C--)
                            this._buffer[C]= this._buffer[C - NumToShift];

                        for (var C=0; C<NumToShift; C++)
                        {
                            var Alpha = C / NumToShift;

                            this._buffer[C] = this._buffer[NumToShift].multiply(Alpha).add(this._vf.set_destination.multiply((1 - Alpha)));
                        }
                    }
                    else
                    {
                        this._previousValue = (NumToShift == this._buffer.length) ? this._buffer[0] : this._vf.set_destination;

                        for (var C= 0; C<this._buffer.length; C++)
                            this._buffer[C] = this._vf.set_destination;
                    }

                    this._bufferEndTime += NumToShift * this._stepTime;
                }

                return Frac;
            }
        }
    )
);

/* ### PositionDamper ### */
x3dom.registerNodeType(
    "PositionDamper",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        function (ctx) {
            x3dom.nodeTypes.PositionDamper.superClass.call(this, ctx);

            this.addField_SFVec3f(ctx, 'initialDestination', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'initialValue', 0, 0, 0);
            
            // How to treat eventIn nicely such that external scripting is handled for set_XXX?
            this.addField_SFVec3f(ctx, 'set_value', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'set_destination', 0, 0, 0);
            
            this._value0 = new x3dom.fields.SFVec3f(0, 0, 0);
            this._value1 = new x3dom.fields.SFVec3f(0, 0, 0);
            this._value2 = new x3dom.fields.SFVec3f(0, 0, 0);
            this._value3 = new x3dom.fields.SFVec3f(0, 0, 0);
            this._value4 = new x3dom.fields.SFVec3f(0, 0, 0);
            this._value5 = new x3dom.fields.SFVec3f(0, 0, 0);
            
            this.initialize();
        },
        {
            nodeChanged: function() 
            {
            },
            
            fieldChanged: function(fieldName)
            {
                if (fieldName.indexOf("set_destination") >= 0)
                {
                    if ( !this._value0.equals(this._vf.set_destination, this._eps) ) {
                        this._value0 = this._vf.set_destination;
                        //this._lastTick = 0;
                    }
                }
                else if (fieldName.indexOf("set_value") >= 0)
                {
                    this._value1.setValues(this._vf.set_value);
                    this._value2.setValues(this._vf.set_value);
                    this._value3.setValues(this._vf.set_value);
                    this._value4.setValues(this._vf.set_value);
                    this._value5.setValues(this._vf.set_value);
                    this._lastTick = 0;
                    
                    this.postMessage('value_changed', this._value5);
                }
            },
            
            initialize: function()
            {
                this._value0.setValues(this._vf.initialDestination);
                this._value1.setValues(this._vf.initialValue);
                this._value2.setValues(this._vf.initialValue);
                this._value3.setValues(this._vf.initialValue);
                this._value4.setValues(this._vf.initialValue);
                this._value5.setValues(this._vf.initialValue);
                this._lastTick = 0;
            },
            
            tick: function(now)
            {
                if (!this._lastTick)
                {
                    this._lastTick = now;
                    return false;
                }

                var delta = now - this._lastTick;

                var alpha = Math.exp(-delta / this._vf.tau);

                this._value1 = this._vf.order > 0 && this._vf.tau
                ? this._value0.add(this._value1.subtract(this._value0).multiply(alpha))
                : new x3dom.fields.SFVec3f(this._value0.x, this._value0.y, this._value0.z);

                this._value2 = this._vf.order > 1 && this._vf.tau
                ? this._value1.add(this._value2.subtract(this._value1).multiply(alpha))
                : new x3dom.fields.SFVec3f(this._value1.x, this._value1.y, this._value1.z);

                this._value3 = this._vf.order > 2 && this._vf.tau
                ? this._value2.add(this._value3.subtract(this._value2).multiply(alpha))
                : new x3dom.fields.SFVec3f(this._value2.x, this._value2.y, this._value2.z);

                this._value4 = this._vf.order > 3 && this._vf.tau
                ? this._value3.add(this._value4.subtract(this._value3).multiply(alpha))
                : new x3dom.fields.SFVec3f(this._value3.x, this._value3.y, this._value3.z);

                this._value5 = this._vf.order > 4 && this._vf.tau
                ? this._value4.add(this._value5.subtract(this._value4).multiply(alpha))
                : new x3dom.fields.SFVec3f(this._value4.x, this._value4.y, this._value4.z);

                var dist = this._value1.subtract(this._value0).length();
                
                if (this._vf.order > 1)
                {
                    var dist2 = this._value2.subtract(this._value1).length();
                    if (dist2 > dist) dist = dist2;
                }
                if (this._vf.order > 2)
                {
                    var dist3 = this._value3.subtract(this._value2).length();
                    if (dist3 > dist) dist = dist3;
                }
                if (this._vf.order > 3)
                {
                    var dist4 = this._value4.subtract(this._value3).length();
                    if (dist4 > dist) dist = dist4;
                }
                if (this._vf.order > 4)
                {
                    var dist5 = this._value5.subtract(this._value4).length();
                    if (dist5 > dist) dist = dist5;
                }

                if (dist < this._eps)
                {
                    this._value1.setValues(this._value0);
                    this._value2.setValues(this._value0);
                    this._value3.setValues(this._value0);
                    this._value4.setValues(this._value0);
                    this._value5.setValues(this._value0);
                    
                    this.postMessage('value_changed', this._value0);
                    
                    this._lastTick = 0;
                    
                    return false;
                }
                
                this.postMessage('value_changed', this._value5);

                this._lastTick = now;

                return true;
            }
        }
    )
);

/* ### PositionDamper2D ### */
x3dom.registerNodeType(
    "PositionDamper2D",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        function (ctx) {
            x3dom.nodeTypes.PositionDamper2D.superClass.call(this, ctx);

            this.addField_SFVec2f(ctx, 'initialDestination', 0, 0);
            this.addField_SFVec2f(ctx, 'initialValue', 0, 0);
            
            // How to treat eventIn nicely such that external scripting is handled for set_XXX?
            this.addField_SFVec2f(ctx, 'set_value', 0, 0);
            this.addField_SFVec2f(ctx, 'set_destination', 0, 0);
            
            this._value0 = new x3dom.fields.SFVec2f(0, 0);
            this._value1 = new x3dom.fields.SFVec2f(0, 0);
            this._value2 = new x3dom.fields.SFVec2f(0, 0);
            this._value3 = new x3dom.fields.SFVec2f(0, 0);
            this._value4 = new x3dom.fields.SFVec2f(0, 0);
            this._value5 = new x3dom.fields.SFVec2f(0, 0);
            
            this.initialize();
        },
        {
            nodeChanged: function() 
            {
            },
            
            fieldChanged: function(fieldName)
            {
                if (fieldName.indexOf("set_destination") >= 0)
                {
                    if ( !this._value0.equals(this._vf.set_destination, this._eps) ) {
                        this._value0 = this._vf.set_destination;
                        //this._lastTick = 0;
                    }
                }
                else if (fieldName.indexOf("set_value") >= 0)
                {
                    this._value1.setValues(this._vf.set_value);
                    this._value2.setValues(this._vf.set_value);
                    this._value3.setValues(this._vf.set_value);
                    this._value4.setValues(this._vf.set_value);
                    this._value5.setValues(this._vf.set_value);
                    this._lastTick = 0;
                    
                    this.postMessage('value_changed', this._value5);
                }
            },
            
            initialize: function()
            {
                this._value0.setValues(this._vf.initialDestination);
                this._value1.setValues(this._vf.initialValue);
                this._value2.setValues(this._vf.initialValue);
                this._value3.setValues(this._vf.initialValue);
                this._value4.setValues(this._vf.initialValue);
                this._value5.setValues(this._vf.initialValue);
                this._lastTick = 0;
            },
            
            tick: function(now)
            {
                if (!this._lastTick)
                {
                    this._lastTick = now;
                    return false;
                }

                var delta = now - this._lastTick;

                var alpha = Math.exp(-delta / this._vf.tau);

                this._value1 = this._vf.order > 0 && this._vf.tau
                ? this._value0.add(this._value1.subtract(this._value0).multiply(alpha))
                : new x3dom.fields.SFVec2f(this._value0.x, this._value0.y, this._value0.z);

                this._value2 = this._vf.order > 1 && this._vf.tau
                ? this._value1.add(this._value2.subtract(this._value1).multiply(alpha))
                : new x3dom.fields.SFVec2f(this._value1.x, this._value1.y, this._value1.z);

                this._value3 = this._vf.order > 2 && this._vf.tau
                ? this._value2.add(this._value3.subtract(this._value2).multiply(alpha))
                : new x3dom.fields.SFVec2f(this._value2.x, this._value2.y, this._value2.z);

                this._value4 = this._vf.order > 3 && this._vf.tau
                ? this._value3.add(this._value4.subtract(this._value3).multiply(alpha))
                : new x3dom.fields.SFVec2f(this._value3.x, this._value3.y, this._value3.z);

                this._value5 = this._vf.order > 4 && this._vf.tau
                ? this._value4.add(this._value5.subtract(this._value4).multiply(alpha))
                : new x3dom.fields.SFVec2f(this._value4.x, this._value4.y, this._value4.z);

                var dist = this._value1.subtract(this._value0).length();
                
                if (this._vf.order > 1)
                {
                    var dist2 = this._value2.subtract(this._value1).length();
                    if (dist2 > dist) dist = dist2;
                }
                if (this._vf.order > 2)
                {
                    var dist3 = this._value3.subtract(this._value2).length();
                    if (dist3 > dist) dist = dist3;
                }
                if (this._vf.order > 3)
                {
                    var dist4 = this._value4.subtract(this._value3).length();
                    if (dist4 > dist) dist = dist4;
                }
                if (this._vf.order > 4)
                {
                    var dist5 = this._value5.subtract(this._value4).length();
                    if (dist5 > dist) dist = dist5;
                }

                if (dist < this._eps)
                {
                    this._value1.setValues(this._value0);
                    this._value2.setValues(this._value0);
                    this._value3.setValues(this._value0);
                    this._value4.setValues(this._value0);
                    this._value5.setValues(this._value0);
                    
                    this.postMessage('value_changed', this._value0);
                    
                    this._lastTick = 0;
                    
                    return false;
                }
                
                this.postMessage('value_changed', this._value5);

                this._lastTick = now;

                return true;
            }
        }
    )
);

/* ### ScalarChaser ### */
x3dom.registerNodeType(
    "ScalarChaser",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DChaserNode,
        function (ctx) {
            x3dom.nodeTypes.ScalarChaser.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'initialDestination', 0);
            this.addField_SFFloat(ctx, 'initialValue', 0);
            
            // How to treat eventIn nicely such that external scripting is handled for set_XXX?
            this.addField_SFFloat(ctx, 'set_value', 0);
            this.addField_SFFloat(ctx, 'set_destination', 0);
            
            this._initDone = false;
            this._numSupports = 60;
            this._stepTime = 0;
            this._currTime = 0;
            this._bufferEndTime = 0;
            this._buffer = [];
            this._previousValue = 0;
            this._value = 0;
        },
        {
            nodeChanged: function() 
            {
                this.initialize();
            },
            
            fieldChanged: function(fieldName)
            {
                if (fieldName.indexOf("set_destination") >= 0)
                {
                    this.initialize();
                    this.updateBuffer(this._currTime);
                }
                else if (fieldName.indexOf("set_value") >= 0)
                {
                    this.initialize();
                    
                    this._previousValue = this._vf.set_value;
                    for (var C=1; C<this._buffer.length; C++)
                        this._buffer[C] = this._vf.set_value;
                    
                    this.postMessage('value_changed', this._vf.set_value);
                }
            },
            
            initialize: function()
            {
                if (!this._initDone)
                {
                    this._initDone = true;
                    
                    this._vf.set_destination = this._vf.initialDestination;

                    this._buffer.length = this._numSupports;

                    this._buffer[0] = this._vf.initialDestination;
                    for (var C=1; C<this._buffer.length; C++)
                        this._buffer[C] = this._vf.initialValue;

                    this._previousValue = this._vf.initialValue;

                    this._stepTime = this._vf.duration / this._numSupports;
                }
            },

            tick: function(now)
            {
                this.initialize();
                this._currTime = now;
                
                if (!this._bufferEndTime)
                {
                    this._bufferEndTime = now;

                    this._value = this._vf.initialValue;
                    
                    this.postMessage('value_changed', this._value);
                    
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
                
                if (Math.abs(Output - this._value) >= x3dom.fields.Eps) {
                    this._value = Output;
                    
                    this.postMessage('value_changed', this._value);
                    
                    return true;
                }
                else {
                    return false;
                }
            },
            
            updateBuffer: function(now)
            {
                var Frac = (now - this._bufferEndTime) / this._stepTime;
                
                if (Frac >= 1)
                {
                    var NumToShift = Math.floor(Frac);
                    Frac -= NumToShift;

                    if (NumToShift < this._buffer.length)
                    {
                        this._previousValue = this._buffer[this._buffer.length - NumToShift];

                        for (var C=this._buffer.length - 1; C>=NumToShift; C--)
                            this._buffer[C] = this._buffer[C - NumToShift];

                        for (var C=0; C<NumToShift; C++)
                        {
                            var Alpha = C / NumToShift;

                            this._buffer[C] = this._buffer[NumToShift] * Alpha + this._vf.set_destination * (1 - Alpha);
                        }
                    }
                    else
                    {
                        this._previousValue = (NumToShift == this._buffer.length) ? this._buffer[0] : this._vf.set_destination;

                        for (var C = 0; C<this._buffer.length; C++)
                            this._buffer[C] = this._vf.set_destination;
                    }

                    this._bufferEndTime += NumToShift * this._stepTime;
                }

                return Frac;
            }
        }
    )
);

/* ### ScalarDamper ### */
x3dom.registerNodeType(
    "ScalarDamper",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        function (ctx) {
            x3dom.nodeTypes.ScalarDamper.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'initialDestination', 0);
            this.addField_SFFloat(ctx, 'initialValue', 0);
            
            // How to treat eventIn nicely such that external scripting is handled for set_XXX?
            this.addField_SFFloat(ctx, 'set_value', 0);
            this.addField_SFFloat(ctx, 'set_destination', 0);
            
            this._value0 = 0;
            this._value1 = 0;
            this._value2 = 0;
            this._value3 = 0;
            this._value4 = 0;
            this._value5 = 0;
            
            this.initialize();
        },
        {
            nodeChanged: function() 
            {
            },
            
            fieldChanged: function(fieldName)
            {
                if (fieldName.indexOf("set_destination") >= 0)
                {
                    if (Math.abs(this._value0 - this._vf.set_destination) >= this._eps) {
                        this._value0 = this._vf.set_destination;
                        //this._lastTick = 0;
                    }
                }
                else if (fieldName.indexOf("set_value") >= 0)
                {
                    this._value1 = this._vf.set_value;
                    this._value2 = this._vf.set_value;
                    this._value3 = this._vf.set_value;
                    this._value4 = this._vf.set_value;
                    this._value5 = this._vf.set_value;
                    this._lastTick = 0;
                    
                    this.postMessage('value_changed', this._value5);
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
            },
            
            tick: function(now)
            {
                if (!this._lastTick)
                {
                    this._lastTick = now;
                    return false;
                }

                var delta = now - this._lastTick;

                var alpha = Math.exp(-delta / this._vf.tau);

                this._value1 = this._vf.order > 0 && this._vf.tau
                ? this._value0 + alpha * (this._value1 - this._value0)
                : this._value0;

                this._value2 = this._vf.order > 1 && this._vf.tau
                ? this._value1 + alpha * (this._value2 - this._value1)
                : this._value1;

                this._value3 = this._vf.order > 2 && this._vf.tau
                ? this._value2 + alpha * (this._value3 - this._value2)
                : this._value2;

                this._value4 = this._vf.order > 3 && this._vf.tau
                ? this._value3 + alpha * (this._value4 - this._value3)
                : this._value3;

                this._value5 = this._vf.order > 4 && this._vf.tau
                ? this._value4 + alpha * (this._value5 - this._value4)
                : this._value4;

                var dist = Math.abs(this._value1 - this._value0);
                
                if (this._vf.order > 1)
                {
                    var dist2 = Math.abs(this._value2 - this._value1);
                    if (dist2 > dist) dist = dist2;
                }
                if (this._vf.order > 2)
                {
                    var dist3 = Math.abs(this._value3 - this._value2);
                    if (dist3 > dist) dist = dist3;
                }
                if (this._vf.order > 3)
                {
                    var dist4 = Math.abs(this._value4 - this._value3);
                    if (dist4 > dist) dist = dist4;
                }
                if (this._vf.order > 4)
                {
                    var dist5 = Math.abs(this._value5 - this._value4);
                    if (dist5 > dist) dist = dist5;
                }

                if (dist < this._eps)
                {
                    this._value1 = this._value0;
                    this._value2 = this._value0;
                    this._value3 = this._value0;
                    this._value4 = this._value0;
                    this._value5 = this._value0;
                    
                    this.postMessage('value_changed', this._value0);
                    
                    this._lastTick = 0;
                    
                    return false;
                }
                
                this.postMessage('value_changed', this._value5);

                this._lastTick = now;

                return true;
            }
        }
    )
);

/* ### CoordinateDamper ### */
x3dom.registerNodeType(
    "CoordinateDamper",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        function (ctx) {
            x3dom.nodeTypes.CoordinateDamper.superClass.call(this, ctx);

            this.addField_MFVec3f(ctx, 'initialDestination', []);
            this.addField_MFVec3f(ctx, 'initialValue', []);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### TexCoordDamper2D ### */
x3dom.registerNodeType(
    "TexCoordDamper2D",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        function (ctx) {
            x3dom.nodeTypes.TexCoordDamper2D.superClass.call(this, ctx);

            this.addField_MFVec2f(ctx, 'initialDestination', []);
            this.addField_MFVec2f(ctx, 'initialValue', []);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);
