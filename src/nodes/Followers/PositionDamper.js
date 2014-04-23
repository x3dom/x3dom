/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### PositionDamper ### */
x3dom.registerNodeType(
    "PositionDamper",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        
        /**
         * Constructor for PositionDamper
         * @constructs x3dom.nodeTypes.PositionDamper
         * @x3d 3.3
         * @component Followers
         * @status experimental
         * @extends x3dom.nodeTypes.X3DDamperNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The PositionDamper animates transitions for 3D vectors. If its value field is routed to a
         *  translation field of a Transform node that contains an object, then, whenever the destination field receives
         *  a 3D position, the PositionDamper node moves the object from its current position to the newly set position.
         */
        function (ctx) {
            x3dom.nodeTypes.PositionDamper.superClass.call(this, ctx);


            /**
             * The field initialDestination should be set to the same value than initialvalue unless a transition to a
             *  certain position is to be created right after the scene is loaded or right after the PositionDamper node
             *  is created dynamically.
             * @var {x3dom.fields.SFVec3f} initialDestination
             * @memberof x3dom.nodeTypes.PositionDamper
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'initialDestination', 0, 0, 0);

            /**
             * The field initialValue can be used to set the initial position of the object.
             * @var {x3dom.fields.SFVec3f} initialValue
             * @memberof x3dom.nodeTypes.PositionDamper
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'initialValue', 0, 0, 0);


            /**
             * The current position value.
             * @var {x3dom.fields.SFVec3f} value
             * @memberof x3dom.nodeTypes.PositionDamper
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'value', 0, 0, 0);

            /**
             * The target position value.
             * @var {x3dom.fields.SFVec3f} destination
             * @memberof x3dom.nodeTypes.PositionDamper
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'destination', 0, 0, 0);

            this._value0 = new x3dom.fields.SFVec3f(0, 0, 0);
            this._value1 = new x3dom.fields.SFVec3f(0, 0, 0);
            this._value2 = new x3dom.fields.SFVec3f(0, 0, 0);
            this._value3 = new x3dom.fields.SFVec3f(0, 0, 0);
            this._value4 = new x3dom.fields.SFVec3f(0, 0, 0);
            this._value5 = new x3dom.fields.SFVec3f(0, 0, 0);

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
                    this._value0.add(this._value1.subtract(this._value0).multiply(alpha)) :
                    new x3dom.fields.SFVec3f(this._value0.x, this._value0.y, this._value0.z);

                this._value2 = this._vf.order > 1 && this._vf.tau ?
                    this._value1.add(this._value2.subtract(this._value1).multiply(alpha)) :
                    new x3dom.fields.SFVec3f(this._value1.x, this._value1.y, this._value1.z);

                this._value3 = this._vf.order > 2 && this._vf.tau ?
                    this._value2.add(this._value3.subtract(this._value2).multiply(alpha)) :
                    new x3dom.fields.SFVec3f(this._value2.x, this._value2.y, this._value2.z);

                this._value4 = this._vf.order > 3 && this._vf.tau ?
                    this._value3.add(this._value4.subtract(this._value3).multiply(alpha)) :
                    new x3dom.fields.SFVec3f(this._value3.x, this._value3.y, this._value3.z);

                this._value5 = this._vf.order > 4 && this._vf.tau ?
                    this._value4.add(this._value5.subtract(this._value4).multiply(alpha)) :
                    new x3dom.fields.SFVec3f(this._value4.x, this._value4.y, this._value4.z);

                var dist = this._value1.subtract(this._value0).length();

                if (this._vf.order > 1)
                {
                    var dist2 = this._value2.subtract(this._value1).length();
                    if (dist2 > dist) {dist = dist2;}
                }
                if (this._vf.order > 2)
                {
                    var dist3 = this._value3.subtract(this._value2).length();
                    if (dist3 > dist) {dist = dist3;}
                }
                if (this._vf.order > 3)
                {
                    var dist4 = this._value4.subtract(this._value3).length();
                    if (dist4 > dist) {dist = dist4;}
                }
                if (this._vf.order > 4)
                {
                    var dist5 = this._value5.subtract(this._value4).length();
                    if (dist5 > dist) {dist = dist5;}
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