/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### CollisionCollection ###
x3dom.registerNodeType("CollisionCollection", "X3DChildNode", defineClass(x3dom.nodeTypes.X3DNode, 
        /**
         * Constructor for CollisionCollection
         * @constructs x3dom.nodeTypes.CollisionCollection
         * @x3d x.x
         * @component X3DChildNode
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function(ctx){
    x3dom.nodeTypes.CollisionCollection.superClass.call(this, ctx);

            /**
             *
             * @var {SFFloat} bounce
             * @memberof x3dom.nodeTypes.CollisionCollection
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'bounce', 0);

            /**
             *
             * @var {SFBool} enabled
             * @memberof x3dom.nodeTypes.CollisionCollection
             * @initvalue true
             * @field x3dom
             * @instance
             */
    this.addField_SFBool(ctx, 'enabled', true);

            /**
             *
             * @var {SFVec2f} frictionCoefficients
             * @memberof x3dom.nodeTypes.CollisionCollection
             * @initvalue 0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec2f(ctx, 'frictionCoefficients', 0,0);

            /**
             *
             * @var {SFFloat} minBounceSpeed
             * @memberof x3dom.nodeTypes.CollisionCollection
             * @initvalue 0.1
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'minBounceSpeed', 0.1);

            /**
             *
             * @var {SFVec2f} slipFactors
             * @memberof x3dom.nodeTypes.CollisionCollection
             * @initvalue 0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec2f(ctx, 'slipFactors', 0,0);

            /**
             *
             * @var {SFFloat} softnessConstantForceMix
             * @memberof x3dom.nodeTypes.CollisionCollection
             * @initvalue 0.0001
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'softnessConstantForceMix', 0.0001);

            /**
             *
             * @var {SFFloat} softnessErrorCorrection
             * @memberof x3dom.nodeTypes.CollisionCollection
             * @initvalue 0.8
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'softnessErrorCorrection', 0.8);

            /**
             *
             * @var {SFVec2f} surfaceSpeed
             * @memberof x3dom.nodeTypes.CollisionCollection
             * @initvalue 0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec2f(ctx, 'surfaceSpeed', 0,0);

            /**
             *
             * @var {MFNode} collidables
             * @memberof x3dom.nodeTypes.CollisionCollection
             * @initvalue x3dom.nodeTypes.X3DNBodyCollidableNode
             * @field x3dom
             * @instance
             */
    this.addField_MFNode('collidables', x3dom.nodeTypes.X3DNBodyCollidableNode);

            /**
             *
             * @var {MFNode} metadata
             * @memberof x3dom.nodeTypes.CollisionCollection
             * @initvalue x3dom.nodeTypes.X3DMetadataObject
             * @field x3dom
             * @instance
             */
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