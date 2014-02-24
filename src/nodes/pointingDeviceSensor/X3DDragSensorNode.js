/**
 * The abstract drag sensor node class serves as a base class for all drag-style pointing device sensors.
 */


x3dom.registerNodeType(
    "X3DDragSensorNode",
    "PointingDeviceSensor",
    defineClass(x3dom.nodeTypes.X3DPointingDeviceSensorNode,

        function (ctx)
        {
            x3dom.nodeTypes.X3DDragSensorNode.superClass.call(this, ctx);

            //---------------------------------------
            // FIELDS
            //---------------------------------------

            this.addField_SFBool(ctx, 'autoOffset', false);

            //route-able output fields
            //this.addField_SFBool(ctx, 'isActive', false);
            //this.addField_SFVec3f(ctx, 'trackPoint_changed', 0, 0, 0);


            //---------------------------------------
            // PROPERTIES
            //---------------------------------------

            //TODO: revise if those are still needed
            /**
             * Last mouse position in x direction.
             * @type {Double}
             * @private
             */
            this._lastX = -1;

            /**
             * Last mouse position in y direction.
             * @type {Double}
             * @private
             */
            this._lastY = -1;
        },
        {
            //----------------------------------------------------------------------------------------------------------------------
            // PRIVATE FUNCTIONS
            //----------------------------------------------------------------------------------------------------------------------

            /**
             * @overrides x3dom.nodeTypes.X3DPointingDeviceSensorNode.prototype._pointerPressedOverSibling
             * @param {DOMEvent} event - the pointer event
             * @private
             */
            _pointerPressedOverSibling: function(event)
            {
                x3dom.nodeTypes.X3DPointingDeviceSensorNode.prototype._pointerPressedOverSibling.call(this, event, sibling);

                this._vf["isActive"] = true;
                //TODO: fire activation event?

                this._lastX = event.layerX;
                this._lastY = event.layerY;

                this._startDragging(event.layerX, event.layerY);
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * @overrides x3dom.nodeTypes.X3DPointingDeviceSensorNode.prototype._pointerMoved
             * @param {DOMEvent] event - the pointer event
             * @private
             */
            _pointerMoved: function(event)
            {
                this._process2DDrag(event.clientX-this._lastX, event.clientX-this._lastY);

                if (this._vf["isActive"] && this._vf["enabled"])
                {
                    x3dom.nodeTypes.X3DPointingDeviceSensorNode.prototype._pointerMoved.call(this, event);
                }
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * @overrides x3dom.nodeTypes.X3DPointingDeviceSensorNode.prototype._pointerReleased
             * @param {DOMEvent] event - the pointer event
             * @private
             */
            _pointerReleased: function(event)
            {
                x3dom.nodeTypes.X3DPointingDeviceSensorNode.prototype._pointerReleased.call(this, event);

                this._stopDragging();

                this._vf["isActive"] = false;
                //TODO: fire deactivation event?
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * Function that is called as soon as a drag action is initiated.
             * @param {Double} x - 2D pointer x coordinate at the time of the dragging initiation
             * @param {Double} y - 2D pointer y coordinate at the time of the dragging initiation
             * @private
             */
            _startDragging: function(x, y)
            {

            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * Processes a 2D drag action, using the given 2D delta values.
             * @private
             */
            _process2DDrag: function(dx, dy)
            {

            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * Function that is called as soon as a drag action is initiated.
             * @private
             */
            _stopDragging: function()
            {

            }

            //----------------------------------------------------------------------------------------------------------------------
        }
    )
);