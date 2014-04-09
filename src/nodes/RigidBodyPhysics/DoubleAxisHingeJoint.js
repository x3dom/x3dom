/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### DoubleAxisHingeJoint ###
x3dom.registerNodeType("DoubleAxisHingeJoint", "X3DRigidJointNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
    x3dom.nodeTypes.DoubleAxisHingeJoint.superClass.call(this, ctx);
    this.addField_SFVec3f(ctx, 'anchorPoint', 0,0,0);
    this.addField_SFVec3f(ctx, 'axis1', 0,0,0);
    this.addField_SFVec3f(ctx, 'axis2', 0,0,0);
    this.addField_SFFloat(ctx, 'desiredAngularVelocity1', 0);
    this.addField_SFFloat(ctx, 'desiredAngularVelocity2', 0);
    this.addField_SFString(ctx, 'forceOutput', "NONE");
    this.addField_SFFloat(ctx, 'maxAngle1', 90);
    this.addField_SFFloat(ctx, 'minAngle1', -90);
    this.addField_SFFloat(ctx, 'maxTorque1', 0);
    this.addField_SFFloat(ctx, 'maxTorque2', 0);
    this.addField_SFFloat(ctx, 'stopBounce1', 0);
    this.addField_SFFloat(ctx, 'stopConstantForceMix1', 0.001);
    this.addField_SFFloat(ctx, 'stopErrorCorrection1', 0.8);
    this.addField_SFFloat(ctx, 'suspensionErrorCorrection', 0.8);
    this.addField_SFFloat(ctx, 'suspensionForce', 0);
    this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);
    this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
    nodeChanged: function(){
        x3dom.debug.logInfo('DoubleAxisHingeJoint: ');
    }
}));