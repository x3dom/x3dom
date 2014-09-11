/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

x3dom.registerNodeType(
    "TouchSensor",
    "PointingDeviceSensor",
    defineClass(x3dom.nodeTypes.X3DTouchSensorNode,

        /**
         * Constructor for TouchSensor
         * @constructs x3dom.nodeTypes.TouchSensor
         * @x3d 3.3
         * @component PointingDeviceSensor
         * @status experimental
         * @extends x3dom.nodeTypes.X3DDragSensorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc TouchSensor tracks location and state of the pointing device, and detects when user points at
         * geometry. Hint: X3DOM, running in an HTML environment, you actually don't need this node, as you can
         * simply use HTML events (like onclick) on your nodes. However, this node is implemented to complete the
         * pointing device sensor component, and it may be useful to ensure compatibility with older X3D scene content.
         */
        function (ctx)
        {
            x3dom.nodeTypes.TouchSensor.superClass.call(this, ctx);

            //---------------------------------------
            // FIELDS
            //---------------------------------------

            //route-able output fields
            //this.addField_SFVec3f(ctx, 'hitNormal_changed',   0 0 0);
            //this.addField_SFVec3f(ctx, 'hitPoint_changed',    0 0 0);
            //this.addField_SFVec2f(ctx, 'hitTexCoord_changed', 0 0);


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
