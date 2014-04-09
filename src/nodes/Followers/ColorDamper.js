/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### ColorDamper ### */
x3dom.registerNodeType(
    "ColorDamper",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        function (ctx) {
            x3dom.nodeTypes.ColorDamper.superClass.call(this, ctx);

            this.addField_SFColor(ctx, 'initialDestination', 0.8, 0.8, 0.8);
            this.addField_SFColor(ctx, 'initialValue', 0.8, 0.8, 0.8);

            this.addField_SFColor(ctx, 'value', 0, 0, 0);
            this.addField_SFColor(ctx, 'destination', 0, 0, 0);

            this._value0 = new x3dom.fields.SFColor(0, 0, 0);
            this._value1 = new x3dom.fields.SFColor(0, 0, 0);
            this._value2 = new x3dom.fields.SFColor(0, 0, 0);
            this._value3 = new x3dom.fields.SFColor(0, 0, 0);
            this._value4 = new x3dom.fields.SFColor(0, 0, 0);
            this._value5 = new x3dom.fields.SFColor(0, 0, 0);

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
                    if ( !this._value0.equals(this._vf.destination, this._eps) ) {
                        this._value0 = this._vf.destination;

                        if (!this._vf.isActive) {
                            //this._lastTick = 0;
                            this.postMessage('isActive', true);
                        }
                    }
                }
                else if (fieldName.indexOf("value") >= 0)
                {
                    this._value1.setValues(this._vf.value);
                    this._value2.setValues(this._vf.value);
                    this._value3.setValues(this._vf.value);
                    this._value4.setValues(this._vf.value);
                    this._value5.setValues(this._vf.value);
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
                this._value0.setValues(this._vf.initialDestination);
                this._value1.setValues(this._vf.initialValue);
                this._value2.setValues(this._vf.initialValue);
                this._value3.setValues(this._vf.initialValue);
                this._value4.setValues(this._vf.initialValue);
                this._value5.setValues(this._vf.initialValue);
                this._lastTick = 0;

                var active = !this._value0.equals(this._value1, this._eps);
                if (this._vf.isActive !== active) {
                    this.postMessage('isActive', active);
                }
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
                    this._value0.add(this._value1.subtract(this._value0).multiply(alpha)) :
                    new x3dom.fields.SFColor(this._value0.r, this._value0.g, this._value0.b);

                this._value2 = this._vf.order > 1 && this._vf.tau ?
                    this._value1.add(this._value2.subtract(this._value1).multiply(alpha)) :
                    new x3dom.fields.SFColor(this._value1.r, this._value1.g, this._value1.b);

                this._value3 = this._vf.order > 2 && this._vf.tau ?
                    this._value2.add(this._value3.subtract(this._value2).multiply(alpha)) :
                    new x3dom.fields.SFColor(this._value2.r, this._value2.g, this._value2.b);

                this._value4 = this._vf.order > 3 && this._vf.tau ?
                    this._value3.add(this._value4.subtract(this._value3).multiply(alpha)) :
                    new x3dom.fields.SFColor(this._value3.r, this._value3.g, this._value3.b);

                this._value5 = this._vf.order > 4 && this._vf.tau ?
                    this._value4.add(this._value5.subtract(this._value4).multiply(alpha)) :
                    new x3dom.fields.SFColor(this._value4.r, this._value4.g, this._value4.b);

                var dist = this.distance(this._value1, this._value0);

                if (this._vf.order > 1)
                {
                    var dist2 = this.distance(this._value2, this._value1);
                    if (dist2 > dist) { dist = dist2; }
                }
                if (this._vf.order > 2)
                {
                    var dist3 = this.distance(this._value3, this._value2);
                    if (dist3 > dist) { dist = dist3; }
                }
                if (this._vf.order > 3)
                {
                    var dist4 = this.distance(this._value4, this._value3);
                    if (dist4 > dist) { dist = dist4; }
                }
                if (this._vf.order > 4)
                {
                    var dist5 = this.distance(this._value5, this._value4);
                    if (dist5 > dist) { dist = dist5; }
                }

                if (dist <= this._eps)
                {
                    this._value1.setValues(this._value0);
                    this._value2.setValues(this._value0);
                    this._value3.setValues(this._value0);
                    this._value4.setValues(this._value0);
                    this._value5.setValues(this._value0);

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