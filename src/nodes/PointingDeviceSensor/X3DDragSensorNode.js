/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/**
 * The abstract drag sensor node class serves as a base class for all drag-style pointing device sensors.
 */

x3dom.registerNodeType(
    "X3DDragSensorNode",
    "PointingDeviceSensor",
    defineClass(x3dom.nodeTypes.X3DPointingDeviceSensorNode,

        /**
         * Constructor for X3DDragSensorNode
         * @constructs x3dom.nodeTypes.X3DDragSensorNode
         * @x3d 3.3
         * @component PointingDeviceSensor
         * @status experimental
         * @extends x3dom.nodeTypes.X3DPointingDeviceSensorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc An abstract base class for all sensors that are processing drag gestures of the pointer.
         */
        function (ctx)
        {
            x3dom.nodeTypes.X3DDragSensorNode.superClass.call(this, ctx);

            //---------------------------------------
            // FIELDS
            //---------------------------------------

            /**
             * Determines whether offset values from previous drag gestures are remembered / accumulated.
             * @var {x3dom.fields.SFBool} autoOffset
             * @memberof x3dom.nodeTypes.X3DDragSensorNode
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'autoOffset', true);

            //route-able output fields
            //this.addField_SFVec3f(ctx, 'trackPoint_changed', 0, 0, 0);


            //---------------------------------------
            // PROPERTIES
            //---------------------------------------

            //TODO: revise if those are still needed
            /**
             * Last mouse position in x direction.
             * @var {Double} _lastX
             * @private
             */
            this._lastX = -1;

            /**
             * Last mouse position in y direction.
             * @var {Double} _lastY
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

                if (this._vf.isActive && this._vf.enabled)
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
             * @param {Double} dy - delta of Y, with respect to the last time the function was invoked
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
