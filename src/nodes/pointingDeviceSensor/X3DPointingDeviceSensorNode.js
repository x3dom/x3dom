/**
 * The abstract pointing device sensor node class serves as a base class for all pointing device sensors.
 * Pointing device sensors catch pointing device events from all sibling nodes.
 */





x3dom.registerNodeType(
    "X3DPointingDeviceSensorNode",
    "PointingDeviceSensor",
    defineClass(x3dom.nodeTypes.X3DSensorNode,

        function (ctx)
        {
            x3dom.nodeTypes.X3DPointingDeviceSensorNode.superClass.call(this, ctx);

            //---------------------------------------
            // FIELDS
            //---------------------------------------

            //route-able output fields
            //this.addField_SFBool(ctx, 'isOver', false);


            //---------------------------------------
            // PROPERTIES
            //---------------------------------------
        },
        {
            //----------------------------------------------------------------------------------------------------------------------
            // PUBLIC FUNCTIONS
            //----------------------------------------------------------------------------------------------------------------------

            /**
             * Function that gets called if the pointing device has been pressed over a sibling node of this sensor
             * @param {DOMEvent} event - the pointer event
             * @private
             */
            pointerPressedOverSibling: function(event)
            {
                this._vf["isActive"] = true;
                this.postMessage('isActive ', true);
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * Function that gets called if the pointing device has been moved,
             * after it has been pressed over a sibling of this node
             * @param {DOMEvent} event - the pointer event
             * @private
             */
            pointerMoved: function(event)
            {

            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * Function that gets called if the pointing device has entered a sibling of this node.
             * @param {DOMEvent} event - the pointer event
             */
            pointerMovedOver: function(event)
            {
                this.postMessage('isOver ', true);
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * Function that gets called if the pointing device has left a sibling of this node.
             * @param {DOMEvent} event - the pointer event
             */
            pointerMovedOut: function(event)
            {
                this.postMessage('isOver ', false);
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * Function that gets called if the pointing device has been released,
             * after it has been pressed over a sibling of this node
             * @private
             */
            pointerReleased: function()
            {
                this._vf["isActive"] = false;
                this.postMessage('isActive ', false);
            }

            //----------------------------------------------------------------------------------------------------------------------
        }
    )
);
