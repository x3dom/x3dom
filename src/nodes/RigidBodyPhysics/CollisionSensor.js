/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### CollisionSensor ###
x3dom.registerNodeType(
    "CollisionSensor",
    "RigidBodyPhysics",
    defineClass(x3dom.nodeTypes.X3DSensorNode,

        /**
         * Constructor for CollisionSensor
         * @constructs x3dom.nodeTypes.CollisionSensor
         * @x3d 3.3
         * @component RigidBodyPhysics
         * @status experimental
         * @extends x3dom.nodeTypes.X3DSensorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The CollisionSensor node is used to send collision detection information into the scene graph for
         *  user processing. The collision detection system does not require an instance of this class to be in the
         *  scene in order for it to run or affect the physics model. This class is used to report to the user contact
         *  information should the user require this information for other purposes.
         */
        function(ctx){
            x3dom.nodeTypes.CollisionSensor.superClass.call(this, ctx);

            /**
             * The collider field specifies the nodes and spaces that are to be included in collision detection
             *  computations.
             * @var {x3dom.fields.SFNode} collider
             * @memberof x3dom.nodeTypes.CollisionSensor
             * @initvalue x3dom.nodeTypes.CollisionCollection
             * @field x3d
             * @instance
             */
            this.addField_SFNode('collider', x3dom.nodeTypes.CollisionCollection);

        },
        {
            nodeChanged: function(){
                if(!this._cf.collider.node){
                    for(var x in this._xmlNode.children){
                        if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.CollisionCollection)){
                            this._cf.collider = this._xmlNode.children[x];
                        }
                    }
                }
                //x3dom.debug.logInfo('CollisionSensor: ');
            }
        }
    )
);