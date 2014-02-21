/**
 * The abstract pointing device sensor node class serves as a base class for all pointing device sensors.
 */


x3dom.registerNodeType(
    "X3DPointingDeviceSensorNode",
    "PointingDeviceSensor",
    defineClass(x3dom.nodeTypes.X3DSensorNode,

        /**
         * Constructor.
         * @abstract
         * @constructs x3dom.nodeTypes.X3DPointingDeviceSensorNode
         * @x3d x.x
         * @component PointingDeviceSensor
         * @status experimental
         * @extends x3dom.nodeTypes.X3DSensorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx)
        {
            x3dom.nodeTypes.X3DPointingDeviceSensorNode.superClass.call(this, ctx);

        }
    )
);
