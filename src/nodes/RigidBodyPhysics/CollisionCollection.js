/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### CollisionCollection ###
x3dom.registerNodeType("CollisionCollection", "X3DChildNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
    x3dom.nodeTypes.CollisionCollection.superClass.call(this, ctx);
    this.addField_SFFloat(ctx, 'bounce', 0);
    this.addField_SFBool(ctx, 'enabled', true);
    this.addField_SFVec2f(ctx, 'frictionCoefficients', 0,0);
    this.addField_SFFloat(ctx, 'minBounceSpeed', 0.1);
    this.addField_SFVec2f(ctx, 'slipFactors', 0,0);
    this.addField_SFFloat(ctx, 'softnessConstantForceMix', 0.0001);
    this.addField_SFFloat(ctx, 'softnessErrorCorrection', 0.8);
    this.addField_SFVec2f(ctx, 'surfaceSpeed', 0,0);
    this.addField_MFNode('collidables', x3dom.nodeTypes.X3DNBodyCollidableNode);
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
    nodeChanged: function(){
        if(!this._cf.collidables.nodes){
            for(var x in this._xmlNode.children){
                if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.X3DNBodyCollidableNode)){
                    this._cf.collidables = this._xmlNode.children[x];
                }
            }
        }
        x3dom.debug.logInfo('CollisionCollection: ');
    }
}));