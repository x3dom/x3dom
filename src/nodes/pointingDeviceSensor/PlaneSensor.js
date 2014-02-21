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

            this.addField_SFRotation(ctx, 'axisRotation', 0, 0, 1, 0);

            this.addField_SFVec2f(ctx, 'minPosition', -1, -1);
            this.addField_SFVec2f(ctx, 'maxPosition',  0,  0);

            this.addField_SFVec3f(ctx, 'offset', 0, 0, 0);

            //route-able output fields
            //this.addField_SFVec3f(ctx, 'translation_changed', 0, 0, 0);
        },
        {
            //----------------------------------------------------------------------------------------------------------------------
            // PRIVATE FUNCTIONS
            //----------------------------------------------------------------------------------------------------------------------

            _pointerPressedOverSibling: function(event, sibling)
            {
                x3dom.nodeTypes.X3DDragSensorNode.prototype._pointerPressedOverSibling.call(this, event, sibling);

                //TODO: document, implement
            },

            //----------------------------------------------------------------------------------------------------------------------

            _pointerMoved: function(event)
            {
                x3dom.nodeTypes.X3DDragSensorNode.prototype._pointerMoved.call(this, event);

                //TODO: document, implement
                //currently, nothing is done here
                console.log(event.clientX + ", " + event.clientY);
            }

            //----------------------------------------------------------------------------------------------------------------------
        }
    )
);