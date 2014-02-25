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

            this.addField_SFVec2f(ctx, 'minPosition', -1, -1);
            this.addField_SFVec2f(ctx, 'maxPosition',  0,  0);

            this.addField_SFVec3f(ctx, 'offset', 0, 0, 0);

            //route-able output fields
            //this.addField_SFVec3f(ctx, 'translation_changed', 0, 0, 0);


            //---------------------------------------
            // PROPERTIES
            //---------------------------------------

            /**
             * 3D vector which is associated with a drag action the x-axis in screen coordinates
             * @type {x3dom.fields.SFVec3f}
             * @private
             */
            this._draggingRightVec = null;

            /**
             * 3D vector which is associated with a drag action the y-axis in screen coordinates
             * @type {x3dom.fields.SFVec3f}
             * @private
             */
            this._draggingUpVec = null;

            /**
             *
             * @type {x3dom.fields.Quaternion}
             * @private
             */
            this._rotationMatrix = this._vf['axisRotation'].toMatrix();

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
                var parentTransform = x3dom.nodeTypes.X3DPointingDeviceSensorNode.prototype.getCurrentTransform.call(this);

                return parentTransform.mult(this._rotationMatrix);
            },

            //----------------------------------------------------------------------------------------------------------------------
            // PRIVATE FUNCTIONS
            //----------------------------------------------------------------------------------------------------------------------

            /**
             * @overrides x3dom.nodeTypes.X3DPointingDeviceSensorNode.prototype._startDragging
             * @param {Double} x - 2D pointer x coordinate at the time of the dragging initiation
             * @param {Double} y - 2D pointer y coordinate at the time of the dragging initiation
             * @private
             */
            _startDragging: function(viewarea, x, y)
            {
                //TODO: handle multi-path nodes

                //get model matrix for this node, combined with the axis rotation
                var matrix = this.getCurrentTransform();

                //apply view matrix of the view that started the drag
                matrix.mult(viewarea.getViewMatrix());

                //compute plane normal in view coordinates
                var planeNormal = matrix.multMatrixVec(new x3dom.fields.SFVec3f(0.0, 0.0, 1.0));


                //compute and remember initial point of intersection with the plane
                var viewRay = viewarea.calcViewRay(x, y);
                //...


                //=================

                /*
                //compute the world coordinates of drag vectors from the sensor's local coordinate system


                this._draggingRightVec = matrix.multMatrixVec(new x3dom.fields.SFVec3f(1.0, 0.0, 0.0));
                this._draggingUpVec    = matrix.multMatrixVec(new x3dom.fields.SFVec3f(0.0, 1.0, 0.0));

                //compute magnification factor (size of a world unit in pixels)
                //...
                 */
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * @overrides x3dom.nodeTypes.X3DPointingDeviceSensorNode.prototype._process2DDrag
             * @private
             */
            _process2DDrag: function(dx, dy)
            {
                x3dom.debug.logInfo("PlaneSensor Received drag event with mouse delta " + dy + ", " + dy);


                //compute point of intersection with the plane
                //...

                //compute difference between new point of intersection and initial point
                //...

                //fire out field routing event
                //...


                //=================


                /*var pixelsToMeters = 0.002;

                //apply drag vectors to current transformation
                this._currentTranslation = this._currentTranslation.add(this._draggingRightVec.multiply(dx * pixelsToMeters));
                this._currentTranslation = this._currentTranslation.add(this._draggingUpVec.multiply(  -dy * pixelsToMeters));


                console.log(this._currentTranslation);

                //fire out field routing event
                this.postMessage('translation_changed', x3dom.fields.SFVec3f.copy(this._currentTranslation));
                */
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * @overrides x3dom.nodeTypes.X3DPointingDeviceSensorNode.prototype._stopDragging
             * @private
             */
            _stopDragging: function()
            {

            }

            //----------------------------------------------------------------------------------------------------------------------
        }
    )
);