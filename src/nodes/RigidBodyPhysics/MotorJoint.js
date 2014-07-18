/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### MotorJoint ###
x3dom.registerNodeType(
    "MotorJoint",
    "RigidBodyPhysics",
    defineClass(x3dom.nodeTypes.X3DRigidJointNode,

        /**
         * Constructor for MotorJoint
         * @constructs x3dom.nodeTypes.MotorJoint
         * @x3d 3.3
         * @component RigidBodyPhysics
         * @status experimental
         * @extends x3dom.nodeTypes.X3DRigidJointNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The MotorJoint node allows control of the relative angular velocities between the two bodies
         *  (specified by the body1 and body2 fields) associated with a joint. This can be especially useful with a
         *  BallJoint where there is no restriction on the angular degrees of freedom.
         */
        function(ctx){
            x3dom.nodeTypes.MotorJoint.superClass.call(this, ctx);

            /**
             * The three axis angle fields provide angles (in angle base units) for this frame for the corresponding
             *  motor axis when in user-calculated mode.
             * @var {x3dom.fields.SFFloat} axis1Angle
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0
             * @range [-pi, pi]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'axis1Angle', 0);

            /**
             * Torque on axis 1.
             * @var {x3dom.fields.SFFloat} axis1Torque
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0
             * @range (-inf, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'axis1Torque', 0);

            /**
             * The three axis angle fields provide angles (in angle base units) for this frame for the corresponding
             *  motor axis when in user-calculated mode.
             * @var {x3dom.fields.SFFloat} axis2Angle
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0
             * @range [-pi, pi]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'axis2Angle', 0);

            /**
             * Torque on axis 2.
             * @var {x3dom.fields.SFFloat} axis2Torque
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0
             * @range (-inf, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'axis2Torque', 0);

            /**
             * The three axis angle fields provide angles (in angle base units) for this frame for the corresponding
             *  motor axis when in user-calculated mode.
             * @var {x3dom.fields.SFFloat} axis3Angle
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0
             * @range [-pi, pi]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'axis3Angle', 0);

            /**
             * Torque on axis 3.
             * @var {x3dom.fields.SFFloat} axis3Torque
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0
             * @range (-inf, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'axis3Torque', 0);

            /**
             * The currently enabled axis.
             * @var {x3dom.fields.SFInt32} enabledAxes
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 1
             * @range [0,3]
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, 'enabledAxes', 1);

            /**
             * The motorAxis fields define the axis vector of the corresponding axis.
             * @var {x3dom.fields.SFVec3f} motor1Axis
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'motor1Axis', 0,0,0);

            /**
             * The motorAxis fields define the axis vector of the corresponding axis.
             * @var {x3dom.fields.SFVec3f} motor2Axis
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'motor2Axis', 0,0,0);

            /**
             * The motorAxis fields define the axis vector of the corresponding axis.
             * @var {x3dom.fields.SFVec3f} motor3Axis
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'motor3Axis', 0,0,0);

            /**
             * The stop bounce fields describe how much the joint should bounce the body back on the corresponding axis
             *  if the joint limit has been reached or exceeded. A value of zero indicates no bounce at all, and a value
             *  of one says that it should bounce with velocity equal and opposite to the collision velocity of the
             *  contact.
             * @var {x3dom.fields.SFFloat} stop1Bounce
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'stop1Bounce', 0);

            /**
             * The stop error correction fields describe the amount of error correction to be performed in a time step
             *  when the joint reaches the limit on the corresponding axis. A value of zero means no error correction is
             *  to be performed and a value of one means all error should be corrected in a single step.
             * @var {x3dom.fields.SFFloat} stop1ErrorCorrection
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0.8
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'stop1ErrorCorrection', 0.8);

            /**
             * The stop bounce fields describe how much the joint should bounce the body back on the corresponding axis
             *  if the joint limit has been reached or exceeded. A value of zero indicates no bounce at all, and a value
             *  of one says that it should bounce with velocity equal and opposite to the collision velocity of the
             *  contact.
             * @var {x3dom.fields.SFFloat} stop2Bounce
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'stop2Bounce', 0);

            /**
             * The stop error correction fields describe the amount of error correction to be performed in a time step
             *  when the joint reaches the limit on the corresponding axis. A value of zero means no error correction is
             *  to be performed and a value of one means all error should be corrected in a single step.
             * @var {x3dom.fields.SFFloat} stop2ErrorCorrection
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0.8
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'stop2ErrorCorrection', 0.8);

            /**
             * The stop bounce fields describe how much the joint should bounce the body back on the corresponding axis
             *  if the joint limit has been reached or exceeded. A value of zero indicates no bounce at all, and a value
             *  of one says that it should bounce with velocity equal and opposite to the collision velocity of the
             *  contact.
             * @var {x3dom.fields.SFFloat} stop3Bounce
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'stop3Bounce', 0);

            /**
             * The stop error correction fields describe the amount of error correction to be performed in a time step
             *  when the joint reaches the limit on the corresponding axis. A value of zero means no error correction is
             *  to be performed and a value of one means all error should be corrected in a single step.
             * @var {x3dom.fields.SFFloat} stop3ErrorCorrection
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0.8
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'stop3ErrorCorrection', 0.8);

        },
        {
            nodeChanged: function(){
                //x3dom.debug.logInfo('MotorJoint: ');
            }
        }
    )
);