/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### MotorJoint ###
x3dom.registerNodeType("MotorJoint", "X3DRigidJointNode", defineClass(x3dom.nodeTypes.X3DNode, 
        /**
         * Constructor for MotorJoint
         * @constructs x3dom.nodeTypes.MotorJoint
         * @x3d x.x
         * @component X3DRigidJointNode
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function(ctx){
    x3dom.nodeTypes.MotorJoint.superClass.call(this, ctx);

            /**
             *
             * @var {SFFloat} axis1Angle
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'axis1Angle', 0);

            /**
             *
             * @var {SFFloat} axis1Torque
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'axis1Torque', 0);

            /**
             *
             * @var {SFFloat} axis2Angle
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'axis2Angle', 0);

            /**
             *
             * @var {SFFloat} axis2Torque
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'axis2Torque', 0);

            /**
             *
             * @var {SFFloat} axis3Angle
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'axis3Angle', 0);

            /**
             *
             * @var {SFFloat} axis3Torque
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'axis3Torque', 0);

            /**
             *
             * @var {SFInt32} enabledAxes
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 1
             * @field x3dom
             * @instance
             */
    this.addField_SFInt32(ctx, 'enabledAxes', 1);

            /**
             *
             * @var {SFString} forceOutput
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue "NONE"
             * @field x3dom
             * @instance
             */
    this.addField_SFString(ctx, 'forceOutput', "NONE");

            /**
             *
             * @var {SFVec3f} motor1Axis
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec3f(ctx, 'motor1Axis', 0,0,0);

            /**
             *
             * @var {SFVec3f} motor2Axis
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec3f(ctx, 'motor2Axis', 0,0,0);

            /**
             *
             * @var {SFVec3f} motor3Axis
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec3f(ctx, 'motor3Axis', 0,0,0);

            /**
             *
             * @var {SFFloat} stop1Bounce
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'stop1Bounce', 0);

            /**
             *
             * @var {SFFloat} stop1ErrorCorrection
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0.8
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'stop1ErrorCorrection', 0.8);

            /**
             *
             * @var {SFFloat} stop2Bounce
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'stop2Bounce', 0);

            /**
             *
             * @var {SFFloat} stop2ErrorCorrection
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0.8
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'stop2ErrorCorrection', 0.8);

            /**
             *
             * @var {SFFloat} stop3Bounce
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'stop3Bounce', 0);

            /**
             *
             * @var {SFFloat} stop3ErrorCorrection
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue 0.8
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'stop3ErrorCorrection', 0.8);

            /**
             *
             * @var {SFNode} body1
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue x3dom.nodeTypes.RigidBody
             * @field x3dom
             * @instance
             */
    this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);

            /**
             *
             * @var {SFNode} body2
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue x3dom.nodeTypes.RigidBody
             * @field x3dom
             * @instance
             */
    this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);

            /**
             *
             * @var {MFNode} metadata
             * @memberof x3dom.nodeTypes.MotorJoint
             * @initvalue x3dom.nodeTypes.X3DMetadataObject
             * @field x3dom
             * @instance
             */
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);

        },{
    nodeChanged: function(){
        x3dom.debug.logInfo('MotorJoint: ');
    }
}));