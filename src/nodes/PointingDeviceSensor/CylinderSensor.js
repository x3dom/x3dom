/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

x3dom.registerNodeType(
    "CylinderSensor",
    "PointingDeviceSensor",
    defineClass(x3dom.nodeTypes.X3DDragSensorNode,

        /**
         * Constructor for CylinderSensor
         * @constructs x3dom.nodeTypes.CylinderSensor
         * @x3d 3.3
         * @component PointingDeviceSensor
         * @status experimental
         * @extends x3dom.nodeTypes.X3DDragSensorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The CylinderSensor node converts pointer motion (for example, from a mouse) into rotation values,
         * using an invisible cylinder of infinite height, aligned with local Y-axis.
         */
        function (ctx)
        {
            x3dom.nodeTypes.CylinderSensor.superClass.call(this, ctx);

            //---------------------------------------
            // FIELDS
            //---------------------------------------
            /**
             * Offset value, in radians, that is incorporated into the rotation output of the sensor.
             * This value is automatically updated if the value of the autoOffset field is 'true'.
             * @var {x3dom.fields.SFFloat} offset
             * @memberof x3dom.nodeTypes.CylinderSensor
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'offset', 0);


            /**
             * The local sensor coordinate system is created by additionally applying the axisRotation field value to
             * the local coordinate system of the sensor node.
             * @var {x3dom.fields.SFRotation} axisRotation
             * @memberof x3dom.nodeTypes.CylinderSensor
             * @initvalue  0,1,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'axisRotation', 0, 1, 0, 0);


            /**
             * Specifies whether the virtual cylinder's lateral surface or end-cap disks of virtual-geometry sensor are
             * used for manipulation: If the vertical acute angle between the vector from the viewer to the point of
             * intersection with the sensor geometry and the local Y axis of the cylinder is greater than or equal to
             * the value of this field, the sensor uses a virtual cylinder to compute rotation output.
             * Otherwise, if the angle is smaller than the value of this field, the sensor uses a virtual disk instead.
             * This value of this field is specified in radians.
             *
             * ATTENTION: The value of this field is currently ignored.
             * The cylinder sensor will always operate in cylinder mode.
             *
             * @var {x3dom.fields.SFFloat} axisRotation
             * @memberof x3dom.nodeTypes.CylinderSensor
             * @initvalue  pi/2
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'diskAngle', 0.262); //this is the official default value, PI/12


            /**
             * The minAngle and maxAngle fields, given in radians, allow to constrain the rotation output of the
             * cylinder sensor.
             * If the value of maxAngle is smaller than the value of minAngle, output is not constrained.
             * @var {x3dom.fields.SFFloat} axisRotation
             * @memberof x3dom.nodeTypes.CylinderSensor
             * @initvalue  0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'minAngle', 0);


            /**
             * The minAngle and maxAngle fields, given in radians, allow to constrain the rotation output of the
             * cylinder sensor.
             * If the value of maxAngle is smaller than the value of minAngle, output is not constrained.
             * @var {x3dom.fields.SFFloat} axisRotation
             * @memberof x3dom.nodeTypes.CylinderSensor
             * @initvalue  -1
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'maxAngle', -1);

            //route-able output fields
            //this.addField_SFRotation(ctx, 'rotation_changed', 0, 0, 1, 0);


            //---------------------------------------
            // PROPERTIES
            //---------------------------------------

            /**
             * Rotation matrix, derived from the current value of the axisRotation field
             * @type {x3dom.fields.SFMatrix4f}
             * @private
             */
            //TODO: updates
            this._rotationMatrix = this._vf.axisRotation.toMatrix();

            /**
             * Current value of the matrix that transforms world coordinates to local sensor coordinates
             * @type {x3dom.fields.SFMatrix4f}
             * @private
             */
            this._inverseToWorldMatrix = null;

            /**
             * Vector from the virtual local y-Axis to the initial intersection point with the virtual cylinder,
             * at the time the sensor was activated
             * @type {x3dom.fields.SFVec3f}
             * @private
             */
            this._initialCylinderIntersectionVector = null;

            /**
             * Current viewarea that is used for dragging, needed for ray setup to compute the cylinder intersection
             *
             * @type {x3dom.Viewarea}
             * @private
             */
            this._viewArea = null;

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
             * Current rotation that is produced by this cylinder sensor
             * @type {x3dom.fields.Quaternion}
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
            _startDragging: function(viewarea, x, y, wx, wy, wz)
            {
                x3dom.nodeTypes.X3DDragSensorNode.prototype._startDragging.call(this, viewarea, x, y, wx, wy, wz);

                this._currentRotation = new x3dom.fields.Quaternion();

                this._viewArea = viewarea;

                //y axis line, in local sensor coordinates
                this._yAxisLine = new x3dom.fields.Line(new x3dom.fields.SFVec3f(0.0, 0.0, 0.0),
                                                        new x3dom.fields.SFVec3f(0.0, 1.0, 0.0));

                this._inverseToWorldMatrix = this.getCurrentTransform().inverse();

                //compute initial cylinder intersection point, in local sensor coordinates
                var firstIntersection = this._inverseToWorldMatrix.multMatrixPnt(new x3dom.fields.SFVec3f(wx, wy, wz));

                //TODO: add disk mode

                //compute distance between point of intersection and y-axis

                var closestPointOnYAxis = this._yAxisLine.closestPoint(firstIntersection);

                this._initialCylinderIntersectionVector = firstIntersection.subtract(closestPointOnYAxis);

                this._cylinderRadius = this._initialCylinderIntersectionVector.length();

                this._initialCylinderIntersectionVector = this._initialCylinderIntersectionVector.normalize();
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
                    var viewRay = this._viewArea.calcViewRay(x, y);

                    viewRay.pos = this._inverseToWorldMatrix.multMatrixPnt(viewRay.pos);
                    viewRay.dir = this._inverseToWorldMatrix.multMatrixVec(viewRay.dir);

                    //0. assume the following equation:
                    // At the point of intersection, the distance between the ray of sight and the cylinder equals
                    // the cylinder radius r.
                    // This means a ray parameter alpha must be found, so that the minimum distance between the point on
                    // the ray and the cylinder axis equals r:
                    // | ((S + alpha*V) - O) - Y*<(S + alpha*V) - O, Y> | = r
                    // with:
                    // | X | = length of vector X
                    // <X1, X2> = dot product of vectors X1, X2
                    // and variables
                    // alpha := Ray Parameter (should be found)
                    // S := Ray Origin
                    // V := Ray Direction
                    // O := Local Y-Axis Anchor Point
                    // Y := Local Y-Axis Direction

                    //1. bring equation into the following form:
                    //   | alpha * A - B | = r
                    var A = viewRay.dir.subtract(this._yAxisLine.dir.multiply(viewRay.dir.dot(this._yAxisLine.dir)));
                    var B = viewRay.pos.subtract(this._yAxisLine.pos).add(this._yAxisLine.dir.multiply(
                            this._yAxisLine.dir.dot(this._yAxisLine.pos.subtract(viewRay.pos))));

                    //2. solve quadratic formula (0, 1 or 2 solutions are possible)
                    var p = 2 * A.dot(B) / A.dot(A);
                    var q = (B.dot(B) - this._cylinderRadius*this._cylinderRadius) / A.dot(A);

                    var sqrt_part = p*p*0.25 - q;

                    var alpha_1;
                    var alpha_2;

                    //is the cylinder hit?
                    if (sqrt_part >= 0)
                    {
                        sqrt_part = Math.sqrt(sqrt_part);
                        alpha_1 = -p*0.5 + sqrt_part;
                        alpha_2 = -p*0.5 - sqrt_part;

                        //if we are inside the cylinder, do nothing, otherwise pick the closest point of intersection
                        alpha_1 = Math.min(alpha_1, alpha_2);

                        if (alpha_1 > 0.0)
                        {
                            //TODO: output trackPoint_changed event
                            var hitPoint = viewRay.pos.add(viewRay.dir.multiply(alpha_1));

                            var closestPointOnYAxis = this._yAxisLine.closestPoint(hitPoint);

                            var vecToHitPoint = hitPoint.subtract(closestPointOnYAxis).normalize();

                            this._currentRotation = x3dom.fields.Quaternion.rotateFromTo(this._initialCylinderIntersectionVector, vecToHitPoint);

                            var offsetQuat = x3dom.fields.Quaternion.axisAngle(this._yAxisLine.dir, this._vf.offset);

                            this._currentRotation = this._currentRotation.multiply(offsetQuat);

                            //output rotationChanged_event, given in local sensor coordinates
                            this.postMessage('rotation_changed', this._currentRotation);
                        }
                    }
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

                if (this._vf.autoOffset)
                {
                    this._vf.offset = this._currentRotation.angle();
                    this.postMessage('offset_changed', this._vf.offset);
                }
            }

            //----------------------------------------------------------------------------------------------------------------------
        }
    )
);