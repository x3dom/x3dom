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
             * @param {DOMEvent] event - the pointer event
             * @private
             */
            _pointerPressedOverSibling: function(event, sibling)
            {
                x3dom.nodeTypes.X3DPointingDeviceSensorNode.prototype._pointerPressedOverSibling.call(this, event, sibling);

                //temporarily disable navigation during dragging
                //===============================================
                //that._navType = that._runtime.navigationType();
                //that._runtime.noNav();
                //===============================================

                this._lastX = event.clientX;
                this._lastY = event.clientX;

                this._startDragging(event.clientX, event.clientY);
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * @overrides x3dom.nodeTypes.X3DPointingDeviceSensorNode.prototype._pointerMoved
             * @param {DOMEvent] event - the pointer event
             * @private
             */
            _pointerMoved: function(event)
            {
                x3dom.nodeTypes.X3DPointingDeviceSensorNode.prototype._pointerMoved.call(this, event);

                this._process2DDrag(event.clientX-this._lastX, event.clientX-this._lastY);
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

                //reset navigation to its state before the dragging was started
                //===============================================
                //var navi = that._runtime.canvas.doc._scene.getNavigationInfo();
                //navi.setType(that._navType);
                //that._runtime.getCanvas().style.cursor = "pointer";
                //===============================================

                this._stopDragging();
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