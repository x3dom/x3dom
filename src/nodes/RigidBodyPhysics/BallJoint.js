/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### BallJoint ###
x3dom.registerNodeType("BallJoint", "X3DRigidJointNode", defineClass(x3dom.nodeTypes.X3DNode, 
        /**
         * Constructor for BallJoint
         * @constructs x3dom.nodeTypes.BallJoint
         * @x3d x.x
         * @component X3DRigidJointNode
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function(ctx){
    x3dom.nodeTypes.BallJoint.superClass.call(this, ctx);

            /**
             *
             * @var {SFVec3f} anchorPoint
             * @memberof x3dom.nodeTypes.BallJoint
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec3f(ctx, 'anchorPoint', 0,0,0);

            /**
             *
             * @var {SFString} forceOutput
             * @memberof x3dom.nodeTypes.BallJoint
             * @initvalue "NONE"
             * @field x3dom
             * @instance
             */
    this.addField_SFString(ctx, 'forceOutput', "NONE");

            /**
             *
             * @var {SFNode} body1
             * @memberof x3dom.nodeTypes.BallJoint
             * @initvalue x3dom.nodeTypes.RigidBody
             * @field x3dom
             * @instance
             */
    this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);

            /**
             *
             * @var {SFNode} body2
             * @memberof x3dom.nodeTypes.BallJoint
             * @initvalue x3dom.nodeTypes.RigidBody
             * @field x3dom
             * @instance
             */
    this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);

            /**
             *
             * @var {MFNode} metadata
             * @memberof x3dom.nodeTypes.BallJoint
             * @initvalue x3dom.nodeTypes.X3DMetadataObject
             * @field x3dom
             * @instance
             */
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);

        },{
    nodeChanged: function(){
        x3dom.debug.logInfo('BallJoint: ');
    }
}));