/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

x3dom.registerNodeType(
    "X3DTouchSensorNode",
    "PointingDeviceSensor",
    defineClass(x3dom.nodeTypes.X3DPointingDeviceSensorNode,

        /**
         * Constructor for X3DTouchSensorNode
         * @constructs x3dom.nodeTypes.X3DTouchSensorNode
         * @x3d 3.3
         * @component PointingDeviceSensor
         * @status experimental
         * @extends x3dom.nodeTypes.X3DPointingDeviceSensorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc An abstract base class for all sensors that process touch events.
         */
        function (ctx)
        {
            x3dom.nodeTypes.X3DTouchSensorNode.superClass.call(this, ctx);

            //---------------------------------------
            // FIELDS
            //---------------------------------------

            //route-able output fields
            //this.addField_SFTime(ctx, 'touchTime', 0);


            //---------------------------------------
            // PROPERTIES
            //---------------------------------------
        },
        {
            //----------------------------------------------------------------------------------------------------------------------
            // PUBLIC FUNCTIONS
            //----------------------------------------------------------------------------------------------------------------------


        }
    )
);
