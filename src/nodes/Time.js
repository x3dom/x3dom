/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

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
            this.addField_SFTime(ctx, 'pauseTime', 0);
            this.addField_SFTime(ctx, 'resumeTime', 0);

            this.addField_SFTime(ctx, 'cycleTime', 0);
            this.addField_SFFloat(ctx, 'fraction_changed', 0);
            this.addField_SFBool(ctx, 'isActive', false);
            this.addField_SFTime(ctx, 'time', 0);

            this.addField_SFBool(ctx,'first',true);
            this.addField_SFFloat(ctx,'firstCycle',0.0);

            this._prevCycle = -1;
        },
        {
            onframe: function (ts)
            {
                // http://www.web3d.org/x3d/specifications/ISO-IEC-19775-1.2-X3D-AbstractSpecification/Part01/components/time.html#Timecycles
                // (startTime >= stopTime && loop == false): isActive(true) at startTime, isActiveFalse(after 1st cycle)
                // startTime >= stopTime && loop == True: isActive(true) at startTime, cycle forever
                // startTime < stopTime && loop == True: isActive(true) at startTime, cycle to stopTime, isActive(false) at stopTime
                // set_stopTime && loop == True: isActive(true) at startTime, cycle to new stopTime, isActive(false) at new stopTime
                // loop == True, then setLoop(false): isActive(true) at startTime, cycle, when loop false, isActive(false) at end of current cycle

                if (!this._vf.enabled) {
                    return;
                }

                var doRun = (ts >= this._vf.startTime);
                var doPaused = (ts >= this._vf.pauseTime) && (this._vf.pauseTime > this._vf.resumeTime);

                var cycleFrac, cycle, fraction, elapsed;
                var isActive = (ts >= this._vf.startTime);

                // fix from here:
                // http://sourceforge.net/projects/x3dom/forums/forum/957286/topic/4566541
                if (isActive && this._vf.cycleInterval > 0) {
                    cycleFrac = (ts - this._vf.startTime) / this._vf.cycleInterval;
                    cycle = Math.floor(cycleFrac);
                    if (this._vf.first == true) {
                        firstCycle=cycle;
                    }
                    this._vf.first=false;
                    if (((cycle - firstCycle) > 0) && (this._vf.loop == false)) {
	                    fraction = 1.0;
                    } else {
	                    fraction = cycleFrac - cycle;
	                    if (fraction < x3dom.fields.Eps) {
		                    if (ts > this._vf.startTime) {
			                    fraction = 1.0;
		                    }
	                   }
                    }
                }

//                if (isActive && this._vf.cycleInterval > 0) {
//                    cycleFrac = (ts - this._vf.startTime) / this._vf.cycleInterval;
//                    cycle = Math.floor(cycleFrac);
//                    fraction = cycleFrac - cycle;
//
//                    if (fraction < x3dom.fields.Eps) {
//                        if (ts > this._vf.startTime) {
//                            fraction = 1.0;
//                        }
//                    }
//
//                }
//



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
                        if (!this._vf.loop) {
                            this.postMessage('isActive', false);
                        }
                        return;

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

/* ### X3DTimeDependentNode ### */
x3dom.registerNodeType(
    "X3DTimeDependentNode",
    "Time",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DTimeDependentNode.superClass.call(this, ctx);

            this.addField_SFBool(ctx, 'loop', false);
        }
    )
);
