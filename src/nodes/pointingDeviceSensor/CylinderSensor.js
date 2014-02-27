
x3dom.registerNodeType(
    "CylinderSensor",
    "PointingDeviceSensor",
    defineClass(x3dom.nodeTypes.X3DDragSensorNode,

        function (ctx)
        {
            x3dom.nodeTypes.CylinderSensor.superClass.call(this, ctx);

            //---------------------------------------
            // FIELDS
            //---------------------------------------
            this.addField_SFFloat(ctx, 'offset', 0);

            this.addField_SFRotation(ctx, 'axisRotation', 0, 0, 1, 0);

            this.addField_SFFloat(ctx, 'diskAngle', 0.262); //this is the official default value, PI/12

            this.addField_SFFloat(ctx, 'minAngle', 0);

            this.addField_SFFloat(ctx, 'maxAngle', -1);

            //route-able output fields
            //this.addField_SFVec3f(ctx, 'rotation_changed', 0, 0, 0);


            //---------------------------------------
            // PROPERTIES
            //---------------------------------------

            /**
             * Rotation matrix, derived from the current value of the axisRotation field
             * @type {x3dom.fields.Quaternion}
             * @private
             */
            this._rotationMatrix = this._vf['axisRotation'].toMatrix();

            /**
             * Initial intersection point with the sensor's virtual cylinder, at the time the sensor was activated
             * @type {x3dom.fields.SFVec3f}
             * @private
             */
            this._initialCylinderIntersection = null;

            /**
             * Current radius of the virtual cylinder.
             * @type {number}
             * @private
             */
            this._cylinderRadius = 0.0;

            /**
             * A line that specifies the current local, virtual y-Axis of this sensor, given in world coordinates.
             * @type {x3dom.fields.Line}
             * @private
             */
            this._yAxisLine = null;

            /**
             * Specifies whether we are currently using cylinder behavior or disk behavior.
             * @type {boolean}
             * @private
             */
            this._cylinderMode = true;

            /**
             * Current rotation angle that is produced by this cylinder sensor
             * @type {Double}
             * @private
             */
            this._currentRotationAngle = 0.0;
        },
        {
            //----------------------------------------------------------------------------------------------------------------------
            // PUBLIC FUNCTIONS
            //----------------------------------------------------------------------------------------------------------------------

            /**
             * This function returns the parent transformation of this node, combined with its current axisRotation
             * @overrides x3dom.nodeTypes.X3DPointingDeviceSensorNode.getCurrentTransform
             */
            getCurrentTransform: function ()
            {
                var parentTransform = x3dom.nodeTypes.X3DDragSensorNode.prototype.getCurrentTransform.call(this);

                return parentTransform.mult(this._rotationMatrix);
            },

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

                this._initialCylinderIntersection = new x3dom.fields.SFVec3f(x, y, z);

                //compute local coordinate system origin and y-axis direction, both in world space
                var matrix         = this.getCurrentTransform();
                var localOrigin    = matrix.multMatrixPnt(new x3dom.fields.SFVec3f(0.0, 0.0, 0.0));
                var yAxisDirection = matrix.multMatrixVec(new x3dom.fields.SFVec3f(0.0, 1.0, 0.0));
                this._yAxisLine    = new x3dom.fields.Line(localOrigin, yAxisDirection.normalize());

                //TODO: add disk mode

                //compute distance between point of intersection and y-axis

                this._cylinderRadius = this._yAxisLine.shortestDistance(this._initialCylinderIntersection);
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * @overrides x3dom.nodeTypes.X3DDragSensorNode._process2DDrag
             * @private
             */
            _process2DDrag: function(x, y, dx, dy)
            {
                x3dom.nodeTypes.X3DDragSensorNode.prototype._process2DDrag.call(this, x, y, dx, dy);

                //cylinder mode
                if (this._cylinderMode)
                {
                    //compute hit point on virtual cylinder geometry
                    //...

                    //TODO: output trackPoint_changed event

                    //compute angle between initial intersection point and new hit point
                    //...
                    //this._initialCylinderIntersection

                    var currentRotation = x3dom.fields.Quaternion.axisAngle(new x3dom.fields.SFVec3f(0, 1, 0), 1.0);

                    //output rotationChanged_event
                    this.postMessage('rotation_changed', x3dom.fields.Quaternion.copy(currentRotation));
                }
                //disk mode
                else
                {
                    //TODO: implement
                }
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
                    this._vf["offset"] = this._currentRotation;

                    this.postMessage('offset_changed', x3dom.fields.Quaternion.copy(this._currentRotation));
                }

                this._currentRotation = new x3dom.fields.Quaternion();
            }

            //----------------------------------------------------------------------------------------------------------------------
        }
    )
);