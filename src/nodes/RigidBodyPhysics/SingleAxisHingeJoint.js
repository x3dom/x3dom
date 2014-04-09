/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### SingleAxisHingeJoint ###
x3dom.registerNodeType("SingleAxisHingeJoint", "X3DRigidJointNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
    x3dom.nodeTypes.SingleAxisHingeJoint.superClass.call(this, ctx);
    this.addField_SFVec3f(ctx, 'anchorPoint', 0,0,0);
    this.addField_SFVec3f(ctx, 'axis', 0,0,0);
    this.addField_SFString(ctx, 'forceOutput', "NONE");
    this.addField_SFFloat(ctx, 'maxAngle', 90);
    this.addField_SFFloat(ctx, 'minAngle', -90);
    this.addField_SFFloat(ctx, 'stopBounce', 0);
    this.addField_SFFloat(ctx, 'stopErrorCorrection', 0.8);
    this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);
    this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
    nodeChanged: function(){
        x3dom.debug.logInfo('SingleAxisHingeJoint: ');
    }
}));