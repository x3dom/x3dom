/**
 * The abstract pointing device sensor node class serves as a base class for all pointing device sensors.
 */


x3dom.registerNodeType(
    "X3DPointingDeviceSensorNode",
    "PointingDeviceSensor",
    defineClass(x3dom.nodeTypes.X3DSensorNode,

        function (ctx)
        {
            x3dom.nodeTypes.X3DPointingDeviceSensorNode.superClass.call(this, ctx);

            //route-able output fields
            //this.addField_SFBool(ctx, 'isOver', false);
        }
    )
);
