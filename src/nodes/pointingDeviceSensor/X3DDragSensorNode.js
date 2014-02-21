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

            this.addField_SFBool(ctx, 'autoOffset', false);

            //route-able output fields
            //this.addField_SFBool(ctx, 'isActive', false);
            //this.addField_SFVec3f(ctx, 'trackPoint_changed', 0, 0, 0);
        }
    )
);