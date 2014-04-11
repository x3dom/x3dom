
x3dom.registerNodeType(
    "SphereSensor",
    "PointingDeviceSensor",
    defineClass(x3dom.nodeTypes.X3DDragSensorNode,

        function (ctx)
        {
            x3dom.nodeTypes.SphereSensor.superClass.call(this, ctx);

            //---------------------------------------
            // FIELDS
            //---------------------------------------
            this.addField_SFRotation(ctx, 'offset', 0, 0, 0);

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