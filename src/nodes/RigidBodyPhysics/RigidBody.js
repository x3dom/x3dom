/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### RigidBody ###
x3dom.registerNodeType("RigidBody", "X3DNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
    x3dom.nodeTypes.RigidBody.superClass.call(this, ctx);
    this.addField_SFFloat(ctx, 'angularDampingFactor', 0.001);
    this.addField_SFVec3f(ctx, 'angularVelocity', 0,0,0);
    this.addField_SFBool(ctx, 'autoDamp', false);
    this.addField_SFBool(ctx, 'autoDisable', false);
    this.addField_SFVec3f(ctx, 'centerOfMass', 0,0,0);
    this.addField_SFFloat(ctx, 'disableAngularSpeed', 0);
    this.addField_SFFloat(ctx, 'disableLinearSpeed', 0);
    this.addField_SFFloat(ctx, 'disableTime', 0);
    this.addField_SFBool(ctx, 'enabled', true);
    this.addField_SFVec3f(ctx, 'finiteRotationAxis', 0,0,0);
    this.addField_SFBool(ctx, 'fixed', false);
    this.addField_MFVec3f(ctx, 'forces', []);
    this.addField_MFFloat(ctx, 'inertia', [1, 0, 0, 0, 1, 0, 0, 0, 1]);
    this.addField_SFFloat(ctx, 'linearDampingFactor', 0.001);
    this.addField_SFVec3f(ctx, 'linearVelocity', 0,0,0);
    this.addField_SFFloat(ctx, 'mass', 1);
    this.addField_SFRotation(ctx, 'orientation', 0,0,1,0);
    this.addField_SFVec3f(ctx, 'position', 0,0,0);
    this.addField_MFVec3f(ctx, 'torques', []);
    this.addField_SFBool(ctx, 'useFiniteRotation', false);
    this.addField_SFBool(ctx, 'useGlobalGravity', true);
    this.addField_MFNode('massDensityModel', x3dom.nodeTypes.Shape);
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
    this.addField_MFNode('geometry', x3dom.nodeTypes.X3DNBodyCollidableNode);
},{
    nodeChanged: function(){
        if(!this._cf.geometry.nodes){
            for(var x in this._xmlNode.children){
                if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.X3DNBodyCollidableNode)){
                    this._cf.geometry = this._xmlNode.children[x];
                }
            }
        }
        if(!this._cf.massDensityModel.nodes){
            for(var x in this._xmlNode.children){
                if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.Shape)){
                    this._cf.massDensityModel = this._xmlNode.children[x];
                }
            }
        }
        x3dom.debug.logInfo('RigidBody: ');
    }
}));