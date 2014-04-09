/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### DoubleAxisHingeJoint ###
x3dom.registerNodeType("DoubleAxisHingeJoint", "X3DRigidJointNode", defineClass(x3dom.nodeTypes.X3DNode, 
        /**
         * Constructor for DoubleAxisHingeJoint
         * @constructs x3dom.nodeTypes.DoubleAxisHingeJoint
         * @x3d x.x
         * @component X3DRigidJointNode
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function(ctx){
    x3dom.nodeTypes.DoubleAxisHingeJoint.superClass.call(this, ctx);

            /**
             *
             * @var {SFVec3f} anchorPoint
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec3f(ctx, 'anchorPoint', 0,0,0);

            /**
             *
             * @var {SFVec3f} axis1
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec3f(ctx, 'axis1', 0,0,0);

            /**
             *
             * @var {SFVec3f} axis2
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec3f(ctx, 'axis2', 0,0,0);

            /**
             *
             * @var {SFFloat} desiredAngularVelocity1
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'desiredAngularVelocity1', 0);

            /**
             *
             * @var {SFFloat} desiredAngularVelocity2
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'desiredAngularVelocity2', 0);

            /**
             *
             * @var {SFString} forceOutput
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue "NONE"
             * @field x3dom
             * @instance
             */
    this.addField_SFString(ctx, 'forceOutput', "NONE");

            /**
             *
             * @var {SFFloat} maxAngle1
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 90
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'maxAngle1', 90);

            /**
             *
             * @var {SFFloat} minAngle1
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue -90
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'minAngle1', -90);

            /**
             *
             * @var {SFFloat} maxTorque1
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'maxTorque1', 0);

            /**
             *
             * @var {SFFloat} maxTorque2
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'maxTorque2', 0);

            /**
             *
             * @var {SFFloat} stopBounce1
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'stopBounce1', 0);

            /**
             *
             * @var {SFFloat} stopConstantForceMix1
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0.001
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'stopConstantForceMix1', 0.001);

            /**
             *
             * @var {SFFloat} stopErrorCorrection1
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0.8
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'stopErrorCorrection1', 0.8);

            /**
             *
             * @var {SFFloat} suspensionErrorCorrection
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0.8
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'suspensionErrorCorrection', 0.8);

            /**
             *
             * @var {SFFloat} suspensionForce
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'suspensionForce', 0);

            /**
             *
             * @var {SFNode} body1
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue x3dom.nodeTypes.RigidBody
             * @field x3dom
             * @instance
             */
    this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);

            /**
             *
             * @var {SFNode} body2
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue x3dom.nodeTypes.RigidBody
             * @field x3dom
             * @instance
             */
    this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);

            /**
             *
             * @var {MFNode} metadata
             * @memberof x3dom.nodeTypes.DoubleAxisHingeJoint
             * @initvalue x3dom.nodeTypes.X3DMetadataObject
             * @field x3dom
             * @instance
             */
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);

        },{
    nodeChanged: function(){
        x3dom.debug.logInfo('DoubleAxisHingeJoint: ');
    }
}));