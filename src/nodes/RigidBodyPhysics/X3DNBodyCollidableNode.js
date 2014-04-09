/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### X3DNBodyCollidableNode ###
x3dom.registerNodeType("X3DNBodyCollidableNode", "X3DChildNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
    x3dom.nodeTypes.X3DNBodyCollidableNode.superClass.call(this, ctx);
    this.addField_SFBool(ctx, 'enabled', true);
    this.addField_SFRotation(ctx, 'rotation', 0,0,1,0);
    this.addField_SFVec3f(ctx, 'translation', 0,0,0);
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
    nodeChanged: function(){
        x3dom.debug.logInfo('X3DNBodyCollidableNode: ');
    }
}));