/**
 * The plane sensor node translates drag gestures, performed with a pointing device like a mouse,
 * into 3D transformations.
 */


x3dom.registerNodeType(
    "PlaneSensor",
    "PointingDeviceSensor",
    defineClass(x3dom.nodeTypes.X3DDragSensorNode,

        function (ctx)
        {
            x3dom.nodeTypes.PlaneSensor.superClass.call(this, ctx);

            //---------------------------------------
            // FIELDS
            //---------------------------------------

            this.addField_SFRotation(ctx, 'axisRotation', 0, 0, 1, 0);

            this.addField_SFVec2f(ctx, 'minPosition',  0,  0);
            this.addField_SFVec2f(ctx, 'maxPosition', -1, -1);

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
            this._rotationMatrix = this._vf['axisRotation'].toMatrix();

            /**
             * Initial intersection point with the sensor's plane, at the time the sensor was activated
             * @type {x3dom.fields.SFVec3f}
             * @private
             */
            this._initialPlaneIntersection = null;

            /**
             * Plane anchor point, computed on drag start and used during dragging to compute plane intersections
             * @type {x3dom.fields.SFVec3f}
             * @private
             */
            this._planeAnchor = null;

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
             * @param {Double} x - 2D pointer x coordinate at the time of the dragging initiation
             * @param {Double} y - 2D pointer y coordinate at the time of the dragging initiation
             * @private
             */
            _startDragging: function(viewarea, x, y)
            {
                x3dom.nodeTypes.X3DDragSensorNode.prototype._startDragging.call(this, viewarea, x, y);

                //TODO: check
                this._currentTranslation = new x3dom.fields.SFVec3f(0.0, 0.0, 0.0);


                //TODO: handle multi-path nodes

                //get model matrix for this node, combined with the axis rotation
                var matrix = this.getCurrentTransform();

                //apply view matrix of the view that started the drag
                matrix.mult(viewarea.getViewMatrix());

                this._viewArea = viewarea;

                //compute plane parameters in view coordinates
                this._planeAnchor = matrix.multMatrixPnt(new x3dom.fields.SFVec3f(0.0, 0.0, 0.0));
                this._planeNormal = matrix.multMatrixVec(new x3dom.fields.SFVec3f(0.0, 0.0, 1.0));


                //compute and remember initial point of intersection with the plane
                var viewRay = viewarea.calcViewRay(x, y);

                this._initialPlaneIntersection = viewRay.intersectPlane(this._planeAnchor, this._planeNormal);

                //allow projection on the negative side of the plane
                if (!this._initialPlaneIntersection)
                {
                    this._planeNormal = this._planeNormal.negate();
                    this._initialPlaneIntersection = viewRay.intersectPlane(this._planeAnchor, this._planeNormal);
                }
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
                    intersectionPoint = viewRay.intersectPlane(this._planeAnchor, this._planeNormal);

                    if (intersectionPoint)
                    {
                        //compute difference between new point of intersection and initial point
                        this._currentTranslation = intersectionPoint.subtract(this._initialPlaneIntersection);
                        this._currentTranslation = this._currentTranslation.add(this._vf["offset"]);

                        //clamp translation components, if desired
                        minPos = this._vf["minPosition"];
                        maxPos = this._vf["maxPosition"];

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

                        //fire out field routing event
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

                if (this._vf["autoOffset"])
                {
                    this._vf["offset"] = this._currentTranslation;

                    this.postMessage('offset_changed', x3dom.fields.SFVec3f.copy(this._currentTranslation));
                }

                this._currentTranslation = new x3dom.fields.SFVec3f(0.0, 0.0, 0.0);
            }

            //----------------------------------------------------------------------------------------------------------------------
        }
    )
);