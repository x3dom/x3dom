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
            this._draggingUpVec    = null;
        },
        {
            //----------------------------------------------------------------------------------------------------------------------
            // PRIVATE FUNCTIONS
            //----------------------------------------------------------------------------------------------------------------------

            /**
             * @overrides x3dom.nodeTypes.X3DPointingDeviceSensorNode.prototype._startDragging
             * @param {Double} x - 2D pointer x coordinate at the time of the dragging initiation
             * @param {Double} y - 2D pointer y coordinate at the time of the dragging initiation
             * @private
             */
            _startDragging: function(x, y)
            {
                //get model matrix for this node
                //...

                //apply the axis rotation
                //...

                //get view matrix
                //...

                //compute drag vectors
                //...
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * @overrides x3dom.nodeTypes.X3DPointingDeviceSensorNode.prototype._process2DDrag
             * @private
             */
            _process2DDrag: function(dx, dy)
            {
                //apply drag vectors to current transformation
                //...

                //fire out field routing event
                //...
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