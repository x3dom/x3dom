/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### UniversalJoint ###
x3dom.registerNodeType("UniversalJoint", "X3DRigidJointNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
    x3dom.nodeTypes.UniversalJoint.superClass.call(this, ctx);
    this.addField_SFVec3f(ctx, 'anchorPoint', 0,0,0);
    this.addField_SFVec3f(ctx, 'axis1', 0,0,0);
    this.addField_SFVec3f(ctx, 'axis2', 0,0,0);
    this.addField_SFString(ctx, 'forceOutput', "NONE");
    this.addField_SFFloat(ctx, 'stop1Bounce', 0);
    this.addField_SFFloat(ctx, 'stop1ErrorCorrection', 0.8);
    this.addField_SFFloat(ctx, 'stop2Bounce', 0);
    this.addField_SFFloat(ctx, 'stop2ErrorCorrection', 0.8);
    this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);
    this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
    nodeChanged: function(){
        x3dom.debug.logInfo('UniversalJoint: ');
    }
}));