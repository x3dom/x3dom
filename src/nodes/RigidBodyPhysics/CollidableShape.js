/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### CollidableShape ###
x3dom.registerNodeType("CollidableShape", "X3DNBodyCollidableNode ", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
    x3dom.nodeTypes.CollidableShape.superClass.call(this, ctx);
    this.addField_SFBool(ctx, 'enabled', true);
    this.addField_SFRotation(ctx, 'rotation', 0,0,1,0);
    this.addField_SFVec3f(ctx, 'translation', 0,0,0);
    this.addField_SFNode('transform', x3dom.nodeTypes.Transform);
    this.addField_SFNode('shape', x3dom.nodeTypes.Shape);
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
    nodeChanged: function(){
        if(!this._cf.transform.node){
            for(var x in this._xmlNode.children){
                if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.Transform)){
                    this._cf.transform = this._xmlNode.children[x];
                }
            }
        }
        if(!this._cf.shape.node){
            for(var x in this._xmlNode.children){
                if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.Shape)){
                    this._cf.shape = this._xmlNode.children[x];
                }
            }
        }
        x3dom.debug.logInfo('CollidableShape: ');
    }
}));