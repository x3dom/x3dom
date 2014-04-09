/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### BallJoint ###
x3dom.registerNodeType("BallJoint", "X3DRigidJointNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
    x3dom.nodeTypes.BallJoint.superClass.call(this, ctx);
    this.addField_SFVec3f(ctx, 'anchorPoint', 0,0,0);
    this.addField_SFString(ctx, 'forceOutput', "NONE");
    this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);
    this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
    nodeChanged: function(){
        x3dom.debug.logInfo('BallJoint: ');
    }
}));