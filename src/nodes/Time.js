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
            this.addField_SFTime(ctx, 'elapsedTime', 0);
            this.addField_SFFloat(ctx, 'fraction_changed', 0);
            this.addField_SFBool(ctx, 'isActive', false);
            this.addField_SFBool(ctx, 'isPaused', false);
            this.addField_SFTime(ctx, 'time', 0);

            this.addField_SFBool(ctx,'first', true);
            this.addField_SFFloat(ctx,'firstCycle', 0.0);

            this._prevCycle = -1;
            this._lastTime = 0;
            this._cycleStopTime = 0;
            this._activatedTime = 0;

            if (this._vf.startTime > 0) {
                this._updateCycleStopTime();
            }

            this._backupStartTime = this._vf.startTime;
            this._backupStopTime = this._vf.stopTime;
            this._backupCycleInterval = this._vf.cycleInterval;
        },
        {
            tick: function (time)
            {
                if (!this._vf.enabled) {
                    this._lastTime = time;
                    return false;
                }

                var isActive = ( this._vf.cycleInterval > 0 &&
                    time >= this._vf.startTime &&
                    (time < this._vf.stopTime || this._vf.stopTime <= this._vf.startTime) &&
                    (this._vf.loop == true || (this._vf.loop == false && time < this._cycleStopTime)) );

                if (isActive && !this._vf.isActive) {
                    this.postMessage('isActive', true);
                    this._activatedTime = time;
                }

                // Checking for this._vf.isActive allows the dispatch of 'final events' (before deactivation)
                if (isActive || this._vf.isActive) {
                    this.postMessage('elapsedTime', time - this._activatedTime);

                    var isPaused = ( time >= this._vf.pauseTime && this._vf.pauseTime > this._vf.resumeTime );

                    if (isPaused && !this._vf.isPaused) {
                        this.postMessage('isPaused', true);
                        this.postMessage('pauseTime', time);
                    } else if (!isPaused && this._vf.isPaused) {
                        this.postMessage('isPaused', false);
                        this.postMessage('resumeTime', time);
                    }

                    if (!isPaused) {
                        var cycleFrac = this._getCycleAt(time);
                        var cycle = Math.floor(cycleFrac);

                        var cycleTime = this._vf.startTime + cycle*this._vf.cycleInterval;
                        var adjustTime = 0;

                        if (this._vf.stopTime > this._vf.startTime &&
                            this._lastTime < this._vf.stopTime && time >= this._vf.stopTime)
                            adjustTime = this._vf.stopTime;
                        else if (this._lastTime < cycleTime && time >= cycleTime)
                            adjustTime = cycleTime;

                        if( adjustTime > 0 ) {
                            time = adjustTime;
                            cycleFrac = this._getCycleAt(time);
                            cycle = Math.floor(cycleFrac);
                        }

                        var fraction = cycleFrac - cycle;

                        if (fraction < x3dom.fields.Eps) {
                            fraction = ( this._lastTime < this._vf.startTime ? 0.0 : 1.0 );
                            this.postMessage('cycleTime', time);
                        }

                        this.postMessage('fraction_changed', fraction);

                        this.postMessage('time', time);
                    }
                }

                if (!isActive && this._vf.isActive)
                    this.postMessage('isActive', false);

                this._lastTime = time;
                
                return true;
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName == "enabled") {
                    // TODO; eval other relevant outputs
                    if (!this._vf.enabled && this._vf.isActive) {
                        this.postMessage('isActive', false);
                    }
                }
                else if (fieldName == "startTime") {
                    // Spec: Should be ignored when active. (Restore old value)
                    if (this._vf.isActive) {
                        this._vf.startTime = this._backupStartTime;
                        return;
                    }

                    this._backupStartTime = this._vf.startTime;
                    this._updateCycleStopTime();
                }
                else if (fieldName == "stopTime") {
                    // Spec: Should be ignored when active and less than startTime. (Restore old value)
                    if (this._vf.isActive && this._vf.stopTime <= this._vf.startTime) {
                        this._vf.stopTime = this._backupStopTime;
                        return;
                    }

                    this._backupStopTime = this._vf.stopTime;
                }
                else if (fieldName == "cycleInterval") {
                    // Spec: Should be ignored when active. (Restore old value)
                    if (this._vf.isActive) {
                        this._vf.cycleInterval = this._backupCycleInterval;
                        return;
                    }

                    this._backupCycleInterval = this._vf.cycleInterval;
                    this._updateCycleStopTime();
                }
                else if (fieldName == "loop") {
                    this._updateCycleStopTime();
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
            },

            _getCycleAt: function(time)
            {
                return Math.max( 0.0, time - this._vf.startTime ) / this._vf.cycleInterval;
            },

            _updateCycleStopTime: function()
            {
                if (this._vf.loop == false) {
                    var now = new Date().getTime() / 1000;
                    var cycleToStop = Math.floor(this._getCycleAt(now)) + 1;

                    this._cycleStopTime = this._vf.startTime + cycleToStop*this._vf.cycleInterval;
                }
                else {
                    this._cycleStopTime = 0;
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
