/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */


//	### RigidBodyCollection ###
x3dom.registerNodeType("RigidBodyCollection", "X3DChildNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
    x3dom.nodeTypes.RigidBodyCollection.superClass.call(this, ctx);
    this.addField_SFBool(ctx, 'autoDisable', false);
    this.addField_SFFloat(ctx, 'constantForceMix', 0.0001);
    this.addField_SFFloat(ctx, 'contactSurfaceThickness', 0);
    this.addField_SFFloat(ctx, 'disableAngularSpeed', 0);
    this.addField_SFFloat(ctx, 'disableLinearSpeed', 0);
    this.addField_SFFloat(ctx, 'disableTime', 0);
    this.addField_SFBool(ctx, 'enabled', true);
    this.addField_SFFloat(ctx, 'errorCorrection', 0.8);
    this.addField_SFVec3f(ctx, 'gravity', 0,-9.8,0);
    this.addField_SFInt32(ctx, 'iterations', 1);
    this.addField_SFFloat(ctx, 'maxCorrectionSpeed', -1);
    this.addField_SFBool(ctx, 'preferAccuracy', false);
    this.addField_MFNode('bodies', x3dom.nodeTypes.RigidBody);
    this.addField_MFNode('joints', x3dom.nodeTypes.X3DRigidJointNode);
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
    nodeChanged: function(){
        if(!this._cf.joints.nodes){
            for(var x in this._xmlNode.children){
                if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.X3DRigidJointNode)){
                    this._cf.joints = this._xmlNode.children[x];
                }
            }
        }
        if(!this._cf.bodies.nodes){
            for(var x in this._xmlNode.children){
                if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.RigidBody)){
                    this._cf.bodies = this._xmlNode.children[x];
                }
            }
        }
        x3dom.debug.logInfo('RigidBodyCollection: ');
    }
}));