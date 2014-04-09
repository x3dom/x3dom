/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### SliderJoint ###
x3dom.registerNodeType("SliderJoint", "X3DRigidJointNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
    x3dom.nodeTypes.SliderJoint.superClass.call(this, ctx);
    this.addField_SFVec3f(ctx, 'axis', 0,1,0);
    this.addField_SFString(ctx, 'forceOutput', "NONE");
    this.addField_SFFloat(ctx, 'maxSeparation', 1);
    this.addField_SFFloat(ctx, 'minSeparation', 0);
    this.addField_SFFloat(ctx, 'stopBounce', 0);
    this.addField_SFFloat(ctx, 'stopErrorCorrection', 1);
    this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);
    this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
    nodeChanged: function(){
        x3dom.debug.logInfo('SliderJoint: ');
    }
}));