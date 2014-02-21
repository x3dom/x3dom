/**
 * The abstract drag sensor node class serves as a base class for all drag-style pointing device sensors.
 */


x3dom.registerNodeType(
    "X3DDragSensorNode",
    "PointingDeviceSensor",
    defineClass(x3dom.nodeTypes.X3DPointingDeviceSensorNode,

        /**
         * Constructor.
         * @abstract
         * @constructs x3dom.nodeTypes.X3DDragSensorNode
         * @x3d x.x
         * @component PointingDeviceSensor
         * @status experimental
         * @extends x3dom.nodeTypes.X3DPointingDeviceSensorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx)
        {
            x3dom.nodeTypes.X3DDragSensorNode.superClass.call(this, ctx);

        }
    )
);