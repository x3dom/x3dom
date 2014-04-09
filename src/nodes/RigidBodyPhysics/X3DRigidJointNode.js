/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### X3DRigidJointNode ###
x3dom.registerNodeType("X3DRigidJointNode", "X3DNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
    x3dom.nodeTypes.X3DRigidJointNode.superClass.call(this, ctx);
    this.addField_SFString(ctx, 'forceOutput', "");
    this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);
    this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
    nodeChanged: function(){
        if(!this._cf.body1.node){
            for(var x in this._xmlNode.children){
                if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.RigidBody)){
                    this._cf.body1 = this._xmlNode.children[x];
                }
            }
        }
        if(!this._cf.body2.node){
            for(var x in this._xmlNode.children){
                if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.RigidBody)){
                    this._cf.body2 = this._xmlNode.children[x];
                }
            }
        }
        x3dom.debug.logInfo('X3DRigidJointNode: ');
    }
}));