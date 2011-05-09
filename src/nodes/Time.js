// ### TimeSensor ###
x3dom.registerNodeType(
    "TimeSensor",
    "Time",
    defineClass(x3dom.nodeTypes.X3DSensorNode,
        function (ctx) {
            x3dom.nodeTypes.TimeSensor.superClass.call(this, ctx);

            ctx.doc._nodeBag.timer.push(this);

            this.addField_SFTime(ctx, 'cycleInterval', 1);
            this.addField_SFBool(ctx, 'enabled', true);
            this.addField_SFBool(ctx, 'loop', false);
            this.addField_SFTime(ctx, 'startTime', 0);
            this.addField_SFTime(ctx, 'stopTime', 0);

            this.addField_SFTime(ctx, 'cycleTime', 0);
            this.addField_SFFloat(ctx, 'fraction_changed', 0);
            this.addField_SFBool(ctx, 'isActive', false);
            this.addField_SFTime(ctx, 'time', 0);

            this._prevCycle = -1;
        },
        {
            onframe: function (ts)
            {
                if (!this._vf.enabled) {
                    return;
                }

                var isActive = (ts >= this._vf.startTime);
                var cycleFrac, cycle, fraction;

                if (isActive && this._vf.cycleInterval > 0) {
                    cycleFrac = (ts - this._vf.startTime) / this._vf.cycleInterval;
                    cycle = Math.floor(cycleFrac);
                    fraction = cycleFrac - cycle;

                    if (fraction < x3dom.fields.Eps) {
                        if (ts > this._vf.startTime) {
                            fraction = 1.0;
                        }
                    }
                }

                if (isActive) {
                    if (!this._vf.isActive) {
                        this.postMessage('isActive', true);
                    }

                    this.postMessage('fraction_changed', fraction);
                    this.postMessage('time', ts);

                    if (this._prevCycle != cycle) {
                        this._prevCycle = cycle;

                        this.postMessage('cycleTime', ts);

                        // TODO: this._vf.loop
                    }
                }
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName == "enabled") {
                    // TODO; eval relevant outputs
                    if (!this._vf.enabled && this._vf.isActive) {
                        this.postMessage('isActive', false);
                    }
                }
            },

            parentRemoved: function(parent)
            {
                if (this._parentNodes.length === 0) {
                    var doc = this.findX3DDoc();

                    for (var i=0, n=doc._nodeBag.timer.length; i<n; i++) {
                        if (doc._nodeBag.timer[i] === this) {
                            doc._nodeBag.timer.splice(i, 1);
                        }
                    }
                }
            }
        }
    )
);
