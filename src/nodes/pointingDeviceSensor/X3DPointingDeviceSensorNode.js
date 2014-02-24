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
             * Function that gets called if the pointing device has been released,
             * after it has been pressed over a sibling of this node
             * @param {DOMEvent} event - the pointer event
             * @private
             */
            pointerReleased: function(event)
            {

            }

            //----------------------------------------------------------------------------------------------------------------------
        }
    )
);
