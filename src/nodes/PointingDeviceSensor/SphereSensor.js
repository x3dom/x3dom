/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

x3dom.registerNodeType(
    "SphereSensor",
    "PointingDeviceSensor",
    defineClass(x3dom.nodeTypes.X3DDragSensorNode,

        /**
         * Constructor for SphereSensor
         * @constructs x3dom.nodeTypes.SphereSensor
         * @x3d 3.3
         * @component PointingDeviceSensor
         * @status experimental
         * @extends x3dom.nodeTypes.X3DDragSensorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc SphereSensor converts pointing device motion into a spherical rotation around the origin of the
         * local coordinate system.
         */
        function (ctx)
        {
            x3dom.nodeTypes.SphereSensor.superClass.call(this, ctx);

            //---------------------------------------
            // FIELDS
            //---------------------------------------
            /**
             * Offset value that is incorporated into the rotation output of the sensor.
             * This value is automatically updated if the value of the autoOffset field is 'true'.
             * @var {x3dom.fields.SFRotation} offset
             * @memberof x3dom.nodeTypes.SphereSensor
             * @initvalue 0,1,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'offset', 0, 1, 0, 0);

            //route-able output fields
            //this.addField_SFVec3f(ctx, 'rotation_changed', 0, 0, 0);


            //---------------------------------------
            // PROPERTIES
            //---------------------------------------

            /**
             * Current rotation that is produced by this sphere sensor
             * @type {x3dom.fields.Quaternion}
             * @private
             */
            this._currentRotation = new x3dom.fields.Quaternion();
        },
        {
            //----------------------------------------------------------------------------------------------------------------------
            // PUBLIC FUNCTIONS
            //----------------------------------------------------------------------------------------------------------------------



            //----------------------------------------------------------------------------------------------------------------------
            // PRIVATE FUNCTIONS
            //----------------------------------------------------------------------------------------------------------------------

            /**
             * @overrides x3dom.nodeTypes.X3DDragSensorNode.prototype._startDragging
             * @private
             */
            _startDragging: function(viewarea, x, y, z)
            {
                x3dom.nodeTypes.X3DDragSensorNode.prototype._startDragging.call(this, viewarea, x, y, z);

            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * @overrides x3dom.nodeTypes.X3DDragSensorNode._process2DDrag
             * @private
             */
            _process2DDrag: function(x, y, dx, dy)
            {
                x3dom.nodeTypes.X3DDragSensorNode.prototype._process2DDrag.call(this, x, y, dx, dy);


            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * @overrides x3dom.nodeTypes.X3DDragSensorNode._stopDragging
             * @private
             */
            _stopDragging: function()
            {
                x3dom.nodeTypes.X3DDragSensorNode.prototype._stopDragging.call(this);

                if (this._vf["autoOffset"])
                {
                    //TODO: implement
                    //this._vf["offset"] = this._currentRotation;

                    //this.postMessage('offset_changed', x3dom.fields.Quaternion.copy(this._currentRotation));
                }

                this._currentRotation = new x3dom.fields.Quaternion();
            }

            //----------------------------------------------------------------------------------------------------------------------
        }
    )
);