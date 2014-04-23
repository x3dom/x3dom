/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### UniversalJoint ###
x3dom.registerNodeType(
    "UniversalJoint",
    "RigidBodyPhysics",
    defineClass(x3dom.nodeTypes.X3DRigidJointNode,

        /**
         * Constructor for UniversalJoint
         * @constructs x3dom.nodeTypes.UniversalJoint
         * @x3d 3.3
         * @component RigidBodyPhysics
         * @status experimental
         * @extends x3dom.nodeTypes.X3DRigidJointNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc A universal joint is like a BallJoint that constrains an extra degree of rotational freedom.
         *  Given the axis specified by the axis1 field on the body specified by the body1 field, and the axis specified
         *  by the axis2 field on body2 that is perpendicular to axis1, the UniversalJoint node keeps the axes
         *  perpendicular to each other. Thus, rotation of the two bodies about the direction perpendicular to the two
         *  axes will be equal.
         */
        function(ctx){
            x3dom.nodeTypes.UniversalJoint.superClass.call(this, ctx);

            /**
             * Anchor of the joint.
             * @var {x3dom.fields.SFVec3f} anchorPoint
             * @memberof x3dom.nodeTypes.UniversalJoint
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'anchorPoint', 0,0,0);

            /**
             * The vectors specified by the axis1 and axis2 fields shall be perpendicular. If not, the interactions are
             *  undefined.
             * @var {x3dom.fields.SFVec3f} axis1
             * @memberof x3dom.nodeTypes.UniversalJoint
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'axis1', 0,0,0);

            /**
             * The vectors specified by the axis1 and axis2 fields shall be perpendicular. If not, the interactions are
             *  undefined.
             * @var {x3dom.fields.SFVec3f} axis2
             * @memberof x3dom.nodeTypes.UniversalJoint
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'axis2', 0,0,0);

            /**
             * The stop bounce fields describe how much the joint should bounce the body back on the corresponding axis
             *  if the joint limit has been reached or exceeded. A value of zero indicates no bounce at all, and a value
             *  of one indicates that it should bounce with velocity equal and opposite to the collision velocity of the
             *  contact.
             * @var {x3dom.fields.SFFloat} stop1Bounce
             * @memberof x3dom.nodeTypes.UniversalJoint
             * @initvalue 0
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'stop1Bounce', 0);

            /**
             * The stop error correction fields describe the amount of error correction to be performed in a time step
             *  when the joint reaches the limit on the corresponding axis. A value of zero means no error correction is
             *  to be performed and a value of one means all error should be corrected in a single step.
             * @var {x3dom.fields.SFFloat} stop1ErrorCorrection
             * @memberof x3dom.nodeTypes.UniversalJoint
             * @initvalue 0.8
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'stop1ErrorCorrection', 0.8);

            /**
             * The stop bounce fields describe how much the joint should bounce the body back on the corresponding axis
             *  if the joint limit has been reached or exceeded. A value of zero indicates no bounce at all, and a value
             *  of one indicates that it should bounce with velocity equal and opposite to the collision velocity of the
             *  contact.
             * @var {x3dom.fields.SFFloat} stop2Bounce
             * @memberof x3dom.nodeTypes.UniversalJoint
             * @initvalue 0
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'stop2Bounce', 0);

            /**
             * The stop error correction fields describe the amount of error correction to be performed in a time step
             *  when the joint reaches the limit on the corresponding axis. A value of zero means no error correction is
             *  to be performed and a value of one means all error should be corrected in a single step.
             * @var {x3dom.fields.SFFloat} stop2ErrorCorrection
             * @memberof x3dom.nodeTypes.UniversalJoint
             * @initvalue 0.8
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'stop2ErrorCorrection', 0.8);

        },
        {
            nodeChanged: function(){
                //x3dom.debug.logInfo('UniversalJoint: ');
            }
        }
    )
);