/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### CollisionSensor ###
x3dom.registerNodeType("CollisionSensor", "X3DSensorNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
    x3dom.nodeTypes.CollisionSensor.superClass.call(this, ctx);
    this.addField_SFBool(ctx, 'enabled', true);
    this.addField_SFNode('collider', x3dom.nodeTypes.CollisionCollection);
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
    nodeChanged: function(){
        if(!this._cf.collider.node){
            for(var x in this._xmlNode.children){
                if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.CollisionCollection)){
                    this._cf.collider = this._xmlNode.children[x];
                }
            }
        }
        x3dom.debug.logInfo('CollisionSensor: ');
    }
}));