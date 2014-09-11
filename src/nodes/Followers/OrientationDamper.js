/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### OrientationDamper ### */
x3dom.registerNodeType(
    "OrientationDamper",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        
        /**
         * Constructor for OrientationDamper
         * @constructs x3dom.nodeTypes.OrientationDamper
         * @x3d 3.3
         * @component Followers
         * @status experimental
         * @extends x3dom.nodeTypes.X3DDamperNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The OrientationDamper animates transitions of orientations. If its value is routed to an
         *  orientation field of a Transform node that contains an object, then, whenever the destination field receives
         *  an orientation, the OrientationDamper node rotates the object from its current orientation to the newly set
         *  orientation. It creates a transition that approaches the newly set orientation asymptotically during a time
         *  period of approximately three to four times the value of the field tau depending on the desired accuracy and
         *  the value of order. Through this asymptotic approach of the destination orientation, a very smooth
         *  transition is created.
         */
        function (ctx) {
            x3dom.nodeTypes.OrientationDamper.superClass.call(this, ctx);


            /**
             * The field initialDestination should be set to the same value than initialValue unless a transition to a
             *  certain orientation is to be created right after the scene is loaded or right after the
             *  OrientationDamper node is created dynamically.
             * @var {x3dom.fields.SFRotation} initialDestination
             * @memberof x3dom.nodeTypes.OrientationDamper
             * @initvalue 0,1,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'initialDestination', 0, 1, 0, 0);

            /**
             * The field initialValue can be used to set the initial orientation of the object.
             * @var {x3dom.fields.SFRotation} initialValue
             * @memberof x3dom.nodeTypes.OrientationDamper
             * @initvalue 0,1,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'initialValue', 0, 1, 0, 0);


            /**
             * The current orientation value.
             * @var {x3dom.fields.SFRotation} value
             * @memberof x3dom.nodeTypes.OrientationDamper
             * @initvalue 0,1,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'value', 0, 1, 0, 0);

            /**
             * The target orientation value
             * @var {x3dom.fields.SFRotation} destination
             * @memberof x3dom.nodeTypes.OrientationDamper
             * @initvalue 0,1,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'destination', 0, 1, 0, 0);

            this._value0 = new x3dom.fields.Quaternion(0, 1, 0, 0);
            this._value1 = new x3dom.fields.Quaternion(0, 1, 0, 0);
            this._value2 = new x3dom.fields.Quaternion(0, 1, 0, 0);
            this._value3 = new x3dom.fields.Quaternion(0, 1, 0, 0);
            this._value4 = new x3dom.fields.Quaternion(0, 1, 0, 0);
            this._value5 = new x3dom.fields.Quaternion(0, 1, 0, 0);

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
                    this._value0.slerp(this._value1, alpha) :
                    new x3dom.fields.Quaternion(this._value0.x, this._value0.y, this._value0.z, this._value0.w);

                this._value2 = this._vf.order > 1 && this._vf.tau ?
                    this._value1.slerp(this._value2, alpha) :
                    new x3dom.fields.Quaternion(this._value1.x, this._value1.y, this._value1.z, this._value1.w);

                this._value3 = this._vf.order > 2 && this._vf.tau ?
                    this._value2.slerp(this._value3, alpha) :
                    new x3dom.fields.Quaternion(this._value2.x, this._value2.y, this._value2.z, this._value2.w);

                this._value4 = this._vf.order > 3 && this._vf.tau ?
                    this._value3.slerp(this._value4, alpha) :
                    new x3dom.fields.Quaternion(this._value3.x, this._value3.y, this._value3.z, this._value3.w);

                this._value5 = this._vf.order > 4 && this._vf.tau ?
                    this._value4.slerp(this._value5, alpha) :
                    new x3dom.fields.Quaternion(this._value4.x, this._value4.y, this._value4.z, this._value4.w);

                var dist = Math.abs(this._value1.inverse().multiply(this._value0).angle());

                if(this._vf.order > 1)
                {
                    var dist2 = Math.abs(this._value2.inverse().multiply(this._value1).angle());
                    if (dist2 > dist)  { dist = dist2; }
                }
                if(this._vf.order > 2)
                {
                    var dist3 = Math.abs(this._value3.inverse().multiply(this._value2).angle());
                    if (dist3 > dist) { dist = dist3; }
                }
                if(this._vf.order > 3)
                {
                    var dist4 = Math.abs(this._value4.inverse().multiply(this._value3).angle());
                    if (dist4 > dist)  { dist = dist4; }
                }
                if(this._vf.order > 4)
                {
                    var dist5 = Math.abs(this._value5.inverse().multiply(this._value4).angle());
                    if (dist5 > dist)  { dist = dist5; }
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