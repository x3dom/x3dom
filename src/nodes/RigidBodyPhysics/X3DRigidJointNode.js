/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### X3DRigidJointNode ###
x3dom.registerNodeType(
    "X3DRigidJointNode",
    "RigidBodyPhysics",
    defineClass(x3dom.nodeTypes.X3DNode,

        /**
         * Constructor for X3DRigidJointNode
         * @constructs x3dom.nodeTypes.X3DRigidJointNode
         * @x3d 3.3
         * @component RigidBodyPhysics
         * @status full
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The X3DRigidJointNode abstract node type is the base type for all joint types.
         */
        function(ctx){
            x3dom.nodeTypes.X3DRigidJointNode.superClass.call(this, ctx);

            /**
             * The forceOutput field is used to control which output fields are to be generated for the next frame. In
             *  physics models, the amount of data that can be generated per frame can be quite extensive, particularly
             *  in complex models with a large number of joints. A typical application will need only a few of them, if
             *  any at all. This field is used to control which of those outputs the author requires to be generated.
             *  The values of the array are to describe the names, exactly, of the output field(s) that are to be
             *  updated at the start of the next frame. Two special values are defined: "ALL" and "NONE".
             * @var {x3dom.fields.SFString} forceOutput
             * @memberof x3dom.nodeTypes.X3DRigidJointNode
             * @initvalue "NONE"
             * @range ["ALL", "NONE",...]
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'forceOutput', "");

            /**
             * The first body to be joint by the node
             * @var {x3dom.fields.SFNode} body1
             * @memberof x3dom.nodeTypes.X3DRigidJointNode
             * @initvalue x3dom.nodeTypes.RigidBody
             * @field x3d
             * @instance
             */
            this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);

            /**
             * The second rigid body to be joint by the node
             * @var {x3dom.fields.SFNode} body2
             * @memberof x3dom.nodeTypes.X3DRigidJointNode
             * @initvalue x3dom.nodeTypes.RigidBody
             * @field x3d
             * @instance
             */
            this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);

        },
        {
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
                //x3dom.debug.logInfo('X3DRigidJointNode: ');
            }
        }
    )
);