/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### CollidableShape ###
x3dom.registerNodeType(
    "CollidableShape",
    "RigidBodyPhysics",
    defineClass(x3dom.nodeTypes.X3DNBodyCollidableNode,

        /**
         * Constructor for CollidableShape
         * @constructs x3dom.nodeTypes.CollidableShape
         * @x3d 3.3
         * @component RigidBodyPhysics
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNBodyCollidableNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The CollidableShape node represents the glue between the collision detection system, the rigid
         *  body model, and the renderable scene graph. Its job is to take a single piece of geometry wrapped in a Shape
         *  node and provide a way for the physics model body to move the geometry. In addition, it allows the collision
         *  detection system to determine the location of the geometry primitives that it uses for collision management.
         *  When placed under a part of the transformation hierarchy, it can be used to visually represent the movement
         *  of the object.
         */
        function(ctx){
            x3dom.nodeTypes.CollidableShape.superClass.call(this, ctx);

           /**
             * Transformation child node.
             * @var {x3dom.fields.SFNode} transform
             * @memberof x3dom.nodeTypes.CollidableShape
             * @initvalue x3dom.nodeTypes.Transform
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('transform', x3dom.nodeTypes.Transform);

            /**
             * The shape field uses the geometry proxy for specifying which geometry best represents the collidable
             * object.
             * @var {x3dom.fields.SFNode} shape
             * @memberof x3dom.nodeTypes.CollidableShape
             * @initvalue x3dom.nodeTypes.Shape
             * @field x3d
             * @instance
             */
            this.addField_SFNode('shape', x3dom.nodeTypes.Shape);

        },
        {
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
                //x3dom.debug.logInfo('CollidableShape: ');
            }
        }
    )
);