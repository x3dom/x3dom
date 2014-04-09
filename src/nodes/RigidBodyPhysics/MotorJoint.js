/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### MotorJoint ###
x3dom.registerNodeType("MotorJoint", "X3DRigidJointNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
    x3dom.nodeTypes.MotorJoint.superClass.call(this, ctx);
    this.addField_SFFloat(ctx, 'axis1Angle', 0);
    this.addField_SFFloat(ctx, 'axis1Torque', 0);
    this.addField_SFFloat(ctx, 'axis2Angle', 0);
    this.addField_SFFloat(ctx, 'axis2Torque', 0);
    this.addField_SFFloat(ctx, 'axis3Angle', 0);
    this.addField_SFFloat(ctx, 'axis3Torque', 0);
    this.addField_SFInt32(ctx, 'enabledAxes', 1);
    this.addField_SFString(ctx, 'forceOutput', "NONE");
    this.addField_SFVec3f(ctx, 'motor1Axis', 0,0,0);
    this.addField_SFVec3f(ctx, 'motor2Axis', 0,0,0);
    this.addField_SFVec3f(ctx, 'motor3Axis', 0,0,0);
    this.addField_SFFloat(ctx, 'stop1Bounce', 0);
    this.addField_SFFloat(ctx, 'stop1ErrorCorrection', 0.8);
    this.addField_SFFloat(ctx, 'stop2Bounce', 0);
    this.addField_SFFloat(ctx, 'stop2ErrorCorrection', 0.8);
    this.addField_SFFloat(ctx, 'stop3Bounce', 0);
    this.addField_SFFloat(ctx, 'stop3ErrorCorrection', 0.8);
    this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);
    this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
    nodeChanged: function(){
        x3dom.debug.logInfo('MotorJoint: ');
    }
}));