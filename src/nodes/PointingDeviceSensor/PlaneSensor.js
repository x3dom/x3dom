/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/**
 * The plane sensor node translates drag gestures, performed with a pointing device like a mouse,
 * into 3D transformations.
 */


x3dom.registerNodeType(
    "PlaneSensor",
    "PointingDeviceSensor",
    defineClass(x3dom.nodeTypes.X3DDragSensorNode,

        /**
         * Constructor for PlaneSensor
         * @constructs x3dom.nodeTypes.PlaneSensor
         * @x3d 3.3
         * @component PointingDeviceSensor
         * @status experimental
         * @extends x3dom.nodeTypes.X3DDragSensorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc PlaneSensor converts pointing device motion into 2D translation, parallel to the local Z=0 plane.
         * Hint: You can constrain translation output to one axis by setting the respective minPosition and  maxPosition
         * members to equal values for that axis.
         */
        function (ctx)
        {
            x3dom.nodeTypes.PlaneSensor.superClass.call(this, ctx);

            //---------------------------------------
            // FIELDS
            //---------------------------------------
            /**
             * The local sensor coordinate system is created by additionally applying the axisRotation field value to
             * the local coordinate system of the sensor node.
             * @var {x3dom.fields.SFRotation} axisRotation
             * @memberof x3dom.nodeTypes.PlaneSensor
             * @initvalue  0,0,1,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'axisRotation', 0, 0, 1, 0);


            /**
             * The minPosition and maxPosition fields allow to constrain the 2D output of the plane sensor, along each
             * 2D component. If the value of a component in maxPosition is smaller than the value of a component in
             * minPosition, output is not constrained along the corresponding direction.
             * @var {x3dom.fields.SFVec2f} minPosition
             * @memberof x3dom.nodeTypes.PlaneSensor
             * @initvalue  0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec2f(ctx, 'minPosition',  0,  0);


            /**
             * The minPosition and maxPosition fields allow to constrain the 2D output of the plane sensor, along each
             * 2D component. If the value of a component in maxPosition is smaller than the value of a component in
             * minPosition, output is not constrained along the corresponding direction.
             * @var {x3dom.fields.SFVec2f} maxPosition
             * @memberof x3dom.nodeTypes.PlaneSensor
             * @initvalue  -1,-1
             * @field x3d
             * @instance
             */
            this.addField_SFVec2f(ctx, 'maxPosition', -1, -1);


            /**
             * Offset value that is incorporated into the translation output of the sensor.
             * This value is automatically updated if the value of the autoOffset field is 'true'.
             * @var {x3dom.fields.SFVec3f} offset
             * @memberof x3dom.nodeTypes.PlaneSensor
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'offset', 0, 0, 0);

            //route-able output fields
            //this.addField_SFVec3f(ctx, 'translation_changed', 0, 0, 0);


            //---------------------------------------
            // PROPERTIES
            //---------------------------------------

            /**
             *
             * @type {x3dom.fields.Quaternion}
             * @private
             */
            //TODO: update on change
            this._rotationMatrix = this._vf.axisRotation.toMatrix();

            /**
             * World-To-Local matrix for this node, including the axisRotation of the sensor
             */
            this._worldToLocalMatrix = null;


            /**
             * Initial intersection point with the sensor's plane, at the time the sensor was activated
             * @type {x3dom.fields.SFVec3f}
             * @private
             */
            this._initialPlaneIntersection = null;

            /**
             * Plane normal, computed on drag start and used during dragging to compute plane intersections
             * @type {x3dom.fields.SFVec3f}
             * @private
             */
            this._planeNormal = null;

            /**
             * Current viewarea that is used for dragging, needed for ray setup to compute the plane intersection
             *
             * @type {x3dom.Viewarea}
             * @private
             */
            this._viewArea = null;

            /**
             * Current translation that is produced by this drag sensor
             * @type {x3dom.fields.SFVec3f}
             * @private
             */
            this._currentTranslation = new x3dom.fields.SFVec3f(0.0, 0.0, 0.0);
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

                this._viewArea = viewarea;

                this._currentTranslation = new x3dom.fields.SFVec3f(0.0, 0.0, 0.0).add(this._vf.offset);

                //TODO: handle multi-path nodes

                //get model matrix for this node, combined with the axis rotation
                this._worldToLocalMatrix = this.getCurrentTransform().inverse();

                //remember initial point of intersection with the plane, transform it to local sensor coordinates
                this._initialPlaneIntersection = this._worldToLocalMatrix.multMatrixPnt(new x3dom.fields.SFVec3f(wx, wy, wz));

                //compute plane normal in local coordinates
                this._planeNormal = new x3dom.fields.SFVec3f(0.0, 0.0, 1.0);
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * @overrides x3dom.nodeTypes.X3DDragSensorNode._process2DDrag
             * @private
             */
            _process2DDrag: function(x, y, dx, dy)
            {
                x3dom.nodeTypes.X3DDragSensorNode.prototype._process2DDrag.call(this, x, y, dx, dy);

                var intersectionPoint;
                var minPos, maxPos;

                if (this._initialPlaneIntersection)
                {
                    //compute point of intersection with the plane
                    var viewRay = this._viewArea.calcViewRay(x, y);

                    //transform the world coordinates, used for the ray, to local sensor coordinates
                    viewRay.pos = this._worldToLocalMatrix.multMatrixPnt(viewRay.pos);
                    viewRay.dir = this._worldToLocalMatrix.multMatrixVec(viewRay.dir.normalize());

                    intersectionPoint = viewRay.intersectPlane(this._initialPlaneIntersection, this._planeNormal);

                    //allow interaction from both sides of the plane
                    if (!intersectionPoint)
                    {
                        intersectionPoint = viewRay.intersectPlane(this._initialPlaneIntersection, this._planeNormal.negate());
                    }

                    if (intersectionPoint)
                    {
                        //compute difference between new point of intersection and initial point
                        this._currentTranslation = intersectionPoint.subtract(this._initialPlaneIntersection);
                        this._currentTranslation = this._currentTranslation.add(this._vf.offset);

                        //clamp translation components, if desired
                        minPos = this._vf.minPosition;
                        maxPos = this._vf.maxPosition;

                        if (minPos.x <= maxPos.x)
                        {
                            this._currentTranslation.x = Math.min(this._currentTranslation.x, maxPos.x);
                            this._currentTranslation.x = Math.max(this._currentTranslation.x, minPos.x);
                        }
                        if (minPos.y <= maxPos.y)
                        {
                            this._currentTranslation.y = Math.min(this._currentTranslation.y, maxPos.y);
                            this._currentTranslation.y = Math.max(this._currentTranslation.y, minPos.y);
                        }

                        //output translation_changed event
                        this.postMessage('translation_changed', x3dom.fields.SFVec3f.copy(this._currentTranslation));
                    }
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
                    this._vf.offset = x3dom.fields.SFVec3f.copy(this._currentTranslation);
                    this.postMessage('offset_changed', this._vf.offset);
                }
            }

            //----------------------------------------------------------------------------------------------------------------------
        }
    )
);