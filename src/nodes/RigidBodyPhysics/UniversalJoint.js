/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### UniversalJoint ###
x3dom.registerNodeType("UniversalJoint", "X3DRigidJointNode", defineClass(x3dom.nodeTypes.X3DNode, 
        /**
         * Constructor for UniversalJoint
         * @constructs x3dom.nodeTypes.UniversalJoint
         * @x3d x.x
         * @component X3DRigidJointNode
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function(ctx){
    x3dom.nodeTypes.UniversalJoint.superClass.call(this, ctx);

            /**
             *
             * @var {SFVec3f} anchorPoint
             * @memberof x3dom.nodeTypes.UniversalJoint
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec3f(ctx, 'anchorPoint', 0,0,0);

            /**
             *
             * @var {SFVec3f} axis1
             * @memberof x3dom.nodeTypes.UniversalJoint
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec3f(ctx, 'axis1', 0,0,0);

            /**
             *
             * @var {SFVec3f} axis2
             * @memberof x3dom.nodeTypes.UniversalJoint
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec3f(ctx, 'axis2', 0,0,0);

            /**
             *
             * @var {SFString} forceOutput
             * @memberof x3dom.nodeTypes.UniversalJoint
             * @initvalue "NONE"
             * @field x3dom
             * @instance
             */
    this.addField_SFString(ctx, 'forceOutput', "NONE");

            /**
             *
             * @var {SFFloat} stop1Bounce
             * @memberof x3dom.nodeTypes.UniversalJoint
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'stop1Bounce', 0);

            /**
             *
             * @var {SFFloat} stop1ErrorCorrection
             * @memberof x3dom.nodeTypes.UniversalJoint
             * @initvalue 0.8
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'stop1ErrorCorrection', 0.8);

            /**
             *
             * @var {SFFloat} stop2Bounce
             * @memberof x3dom.nodeTypes.UniversalJoint
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'stop2Bounce', 0);

            /**
             *
             * @var {SFFloat} stop2ErrorCorrection
             * @memberof x3dom.nodeTypes.UniversalJoint
             * @initvalue 0.8
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'stop2ErrorCorrection', 0.8);

            /**
             *
             * @var {SFNode} body1
             * @memberof x3dom.nodeTypes.UniversalJoint
             * @initvalue x3dom.nodeTypes.RigidBody
             * @field x3dom
             * @instance
             */
    this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);

            /**
             *
             * @var {SFNode} body2
             * @memberof x3dom.nodeTypes.UniversalJoint
             * @initvalue x3dom.nodeTypes.RigidBody
             * @field x3dom
             * @instance
             */
    this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);

            /**
             *
             * @var {MFNode} metadata
             * @memberof x3dom.nodeTypes.UniversalJoint
             * @initvalue x3dom.nodeTypes.X3DMetadataObject
             * @field x3dom
             * @instance
             */
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);

        },{
    nodeChanged: function(){
        x3dom.debug.logInfo('UniversalJoint: ');
    }
}));