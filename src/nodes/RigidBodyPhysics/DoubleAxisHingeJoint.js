/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### DoubleAxisHingeJoint ###
x3dom.registerNodeType(
    "DoubleAxisHingeJoint",
    "RigidBodyPhysics",
    defineClass(x3dom.nodeTypes.X3DRigidJointNode,

        /**
         * Constructor for DoubleAxisHingeJoint
         * @constructs x3dom.nodeTypes.DoubleAxisHingeJoint
         * @x3d 3.3
         * @component RigidBodyPhysics
         * @status experimental
         * @extends x3dom.nodeTypes.X3DRigidJointNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The DoubleAxisHingeJoint node represents a joint that has two independent axes that are located
         *  around a common anchor point. Axis 1 is specified relative to the first body (specified by the body1 field)
         *  and axis 2 is specified relative to the second body (specified by the body2 field). Axis 1 can have limits
         *  and a motor, axis 2 can only have a motor.
         */
        function(ctx){
            x3dom.nodeTypes.DoubleAxisHingeJoint.superClass.call(this, ctx);

            /**
             * Anchor point of the joint
             * @var {x3dom.fields.SFVec3f} anchorPoint
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'anchorPoint', 0,0,0);

            /**
             * Axis 1 is specified relative to the first body (specified by the body1 field).
             * @var {x3dom.fields.SFVec3f} axis1
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'axis1', 0,0,0);

            /**
             * Axis 2 is specified relative to the second body (specified by the body2 field).
             * @var {x3dom.fields.SFVec3f} axis2
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'axis2', 0,0,0);

            /**
             * Desired angular velocity for the first axis.
             * @var {x3dom.fields.SFFloat} desiredAngularVelocity1
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0
             * @range (-inf,inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'desiredAngularVelocity1', 0);

            /**
             * Desired angular velocity for the second axis.
             * @var {x3dom.fields.SFFloat} desiredAngularVelocity2
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0
             * @range (-inf,inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'desiredAngularVelocity2', 0);

            /**
             * The minAngle1 and maxAngle1 fields are used to control the maximum angles through which the hinge is
             *  allowed to travel. A hinge may not travel more than π radians (or the equivalent angle base units) in
             *  either direction from its initial position.
             * @var {x3dom.fields.SFFloat} maxAngle1
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 90
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'maxAngle1', 90);

            /**
             * The minAngle1 and maxAngle1 fields are used to control the maximum angles through which the hinge is
             *  allowed to travel. A hinge may not travel more than π radians (or the equivalent angle base units) in
             *  either direction from its initial position.
             * @var {x3dom.fields.SFFloat} minAngle1
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue -90
             * @range [-pi * radToDeg, pi * radToDeg]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'minAngle1', -90);

            /**
             * The maxTorque1 field defines the maximum amount of torque that the motor can apply on axis 1 in order to
             *  achieve the desired desiredAngularVelocity1 value.
             * @var {x3dom.fields.SFFloat} maxTorque1
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0
             * @range (-inf, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'maxTorque1', 0);

            /**
             * The maxTorque2 field defines the maximum amount of torque that the motor can apply on axis 1 in order to
             *  achieve the desired desiredAngularVelocity2 value.
             * @var {x3dom.fields.SFFloat} maxTorque2
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0
             * @range (-inf, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'maxTorque2', 0);

            /**
             * The stopBounce1 field is used to set how bouncy the minimum and maximum angle stops are for axis 1. A
             *  value of zero means they are not bouncy while a value of 1 means maximum bounciness (full reflection of
             *  force arriving at the stop).
             * @var {x3dom.fields.SFFloat} stopBounce1
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'stopBounce1', 0);

            /**
             * The stopConstantForceMix1 and suspensionForce fields can be used to apply damping to the calculations by
             *  violating the normal constraints by applying a small, constant force to those calculations.
             * @var {x3dom.fields.SFFloat} stopConstantForceMix1
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0.001
             * @range [0,inf]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'stopConstantForceMix1', 0.001);

            /**
             * The stopErrorCorrection1 and suspensionErrorCorrection fields describe how quickly the system should
             *  resolve intersection errors due to floating point inaccuracies.
             * @var {x3dom.fields.SFFloat} stopErrorCorrection1
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0.8
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'stopErrorCorrection1', 0.8);

            /**
             * The stopErrorCorrection1 and suspensionErrorCorrection fields describe how quickly the system should
             *  resolve intersection errors due to floating point inaccuracies.
             * @var {x3dom.fields.SFFloat} suspensionErrorCorrection
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0.8
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'suspensionErrorCorrection', 0.8);

            /**
             * The stopConstantForceMix1 and suspensionForce fields can be used to apply damping to the calculations by
             *  violating the normal constraints by applying a small, constant force to those calculations.
             * @var {x3dom.fields.SFFloat} suspensionForce
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0
             * @range [0,inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'suspensionForce', 0);
        },
        {
            nodeChanged: function(){
                //x3dom.debug.logInfo('DoubleAxisHingeJoint: ');
            }
        }
    )
);