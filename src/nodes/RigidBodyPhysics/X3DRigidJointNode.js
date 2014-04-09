/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### X3DRigidJointNode ###
x3dom.registerNodeType("X3DRigidJointNode", "X3DNode", defineClass(x3dom.nodeTypes.X3DNode, 
        /**
         * Constructor for X3DRigidJointNode
         * @constructs x3dom.nodeTypes.X3DRigidJointNode
         * @x3d x.x
         * @component X3DNode
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function(ctx){
    x3dom.nodeTypes.X3DRigidJointNode.superClass.call(this, ctx);

            /**
             *
             * @var {SFString} forceOutput
             * @memberof x3dom.nodeTypes.X3DRigidJointNode
             * @initvalue ""
             * @field x3dom
             * @instance
             */
    this.addField_SFString(ctx, 'forceOutput', "");

            /**
             *
             * @var {SFNode} body1
             * @memberof x3dom.nodeTypes.X3DRigidJointNode
             * @initvalue x3dom.nodeTypes.RigidBody
             * @field x3dom
             * @instance
             */
    this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);

            /**
             *
             * @var {SFNode} body2
             * @memberof x3dom.nodeTypes.X3DRigidJointNode
             * @initvalue x3dom.nodeTypes.RigidBody
             * @field x3dom
             * @instance
             */
    this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);

            /**
             *
             * @var {MFNode} metadata
             * @memberof x3dom.nodeTypes.X3DRigidJointNode
             * @initvalue x3dom.nodeTypes.X3DMetadataObject
             * @field x3dom
             * @instance
             */
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);

        },{
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
        x3dom.debug.logInfo('X3DRigidJointNode: ');
    }
}));