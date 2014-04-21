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
            //----------------------------------------------------------------------------------------------------------
            // PUBLIC FUNCTIONS
            //----------------------------------------------------------------------------------------------------------

            /**
             * @overrides x3dom.nodeTypes.X3DPointingDeviceSensorNode._pointerPressedOverSibling
             * @param {DOMEvent} event - the pointer event
             * @private
             */
            pointerPressedOverSibling: function(event)
            {
                x3dom.nodeTypes.X3DPointingDeviceSensorNode.prototype.pointerPressedOverSibling.call(this, event);

                this._lastX = event.layerX;
                this._lastY = event.layerY;

                this._startDragging(event.viewarea, event.layerX, event.layerX, event.worldX, event.worldY, event.worldZ);
            },

            //----------------------------------------------------------------------------------------------------------

            /**
             * @overrides x3dom.nodeTypes.X3DPointingDeviceSensorNode._pointerMoved
             * @param {DOMEvent] event - the pointer event
             * @private
             */
            pointerMoved: function(event)
            {
                x3dom.nodeTypes.X3DPointingDeviceSensorNode.prototype.pointerMoved.call(this, event);

                if (this._vf["isActive"] && this._vf["enabled"])
                {
                    this._process2DDrag(event.layerX,
                                        event.layerY,
                                        event.layerX-this._lastX,
                                        event.layerY-this._lastY);
                }
            },

            //----------------------------------------------------------------------------------------------------------

            /**
             * @overrides x3dom.nodeTypes.X3DPointingDeviceSensorNode._pointerReleased
             * @param {DOMEvent] event - the pointer event
             * @private
             */
            pointerReleased: function()
            {
                x3dom.nodeTypes.X3DPointingDeviceSensorNode.prototype.pointerReleased.call(this);

                this._stopDragging();
            },

            //----------------------------------------------------------------------------------------------------------

            //----------------------------------------------------------------------------------------------------------
            // PRIVATE FUNCTIONS
            //----------------------------------------------------------------------------------------------------------

            /**
             * Function that is called as soon as a drag action is initiated.
             * @param {x3dom.Viewarea} viewarea - the viewarea which initiated the drag operation
             * @param {Double} x - 2D pointer x coordinate at the time of the dragging initiation
             * @param {Double} y - 2D pointer y coordinate at the time of the dragging initiation
             * @param {Double} wx - 3D world x pick coordinate on the sensor geometry at the time of the dragging initiation
             * @param {Double} wy - 3D world x pick coordinate on the sensor geometry at the time of the dragging initiation
             * @param {Double} wz - 3D world z pick coordinate on the sensor geometry at the time of the dragging initiation
             * @private
             */
            _startDragging: function(viewarea, x, y, wx, wy, wz)
            {

            },

            //----------------------------------------------------------------------------------------------------------

            /**
             * Processes a 2D drag action, using the given 2D delta values.
             * @param {Double} x - 2D pointer x coordinate at the time of the dragging initiation
             * @param {Double} y - 2D pointer y coordinate at the time of the dragging initiation
             * @param {Double} dx - delta of x, with respect to the last time the function was invoked
             * @param {Double} dY - delta of Y, with respect to the last time the function was invoked
             * @private
             */
            _process2DDrag: function(x, y, dx, dy)
            {

            },

            //----------------------------------------------------------------------------------------------------------

            /**
             * Function that is called as soon as a drag action is initiated.
             * @private
             */
            _stopDragging: function()
            {

            }

            //----------------------------------------------------------------------------------------------------------
        }
    )
);