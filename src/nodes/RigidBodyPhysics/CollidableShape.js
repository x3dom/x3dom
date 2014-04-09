/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### CollidableShape ###
x3dom.registerNodeType("CollidableShape", "X3DNBodyCollidableNode ", defineClass(x3dom.nodeTypes.X3DNode, 
        /**
         * Constructor for CollidableShape
         * @constructs x3dom.nodeTypes.CollidableShape
         * @x3d x.x
         * @component X3DNBodyCollidableNode 
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function(ctx){
    x3dom.nodeTypes.CollidableShape.superClass.call(this, ctx);

            /**
             *
             * @var {SFBool} enabled
             * @memberof x3dom.nodeTypes.CollidableShape
             * @initvalue true
             * @field x3dom
             * @instance
             */
    this.addField_SFBool(ctx, 'enabled', true);

            /**
             *
             * @var {SFRotation} rotation
             * @memberof x3dom.nodeTypes.CollidableShape
             * @initvalue 0,0,1,0
             * @field x3dom
             * @instance
             */
    this.addField_SFRotation(ctx, 'rotation', 0,0,1,0);

            /**
             *
             * @var {SFVec3f} translation
             * @memberof x3dom.nodeTypes.CollidableShape
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec3f(ctx, 'translation', 0,0,0);

            /**
             *
             * @var {SFNode} transform
             * @memberof x3dom.nodeTypes.CollidableShape
             * @initvalue x3dom.nodeTypes.Transform
             * @field x3dom
             * @instance
             */
    this.addField_SFNode('transform', x3dom.nodeTypes.Transform);

            /**
             *
             * @var {SFNode} shape
             * @memberof x3dom.nodeTypes.CollidableShape
             * @initvalue x3dom.nodeTypes.Shape
             * @field x3dom
             * @instance
             */
    this.addField_SFNode('shape', x3dom.nodeTypes.Shape);

            /**
             *
             * @var {MFNode} metadata
             * @memberof x3dom.nodeTypes.CollidableShape
             * @initvalue x3dom.nodeTypes.X3DMetadataObject
             * @field x3dom
             * @instance
             */
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