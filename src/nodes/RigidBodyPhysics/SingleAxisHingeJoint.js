/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### SingleAxisHingeJoint ###
x3dom.registerNodeType(
    "SingleAxisHingeJoint",
    "RigidBodyPhysics",
    defineClass(x3dom.nodeTypes.X3DRigidJointNode,

        /**
         * Constructor for SingleAxisHingeJoint
         * @constructs x3dom.nodeTypes.SingleAxisHingeJoint
         * @x3d 3.3
         * @component RigidBodyPhysics
         * @status experimental
         * @extends x3dom.nodeTypes.X3DRigidJointNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This node represents a joint with a single axis about which to rotate. As the name suggests, this
         *  is a joint that works like a traditional door hinge. The axis of the hinge is defined to be along the unit
         *  vector described in the axis field and centered on the anchorPoint described in world coordinates. The
         *  objects on each side of the hinge are specified by the body1 and body2 fields.
         */
        function(ctx){
            x3dom.nodeTypes.SingleAxisHingeJoint.superClass.call(this, ctx);

            /**
             * The axis of the hinge is defined to be along the unit vector described in the axis field and centered on
             * the anchorPoint described in world coordinates.
             * @var {x3dom.fields.SFVec3f} anchorPoint
             * @memberof x3dom.nodeTypes.SingleAxisHingeJoint
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'anchorPoint', 0,0,0);

            /**
             * The axis of the hinge is defined to be along the unit vector described in the axis field and centered on
             *  the anchorPoint described in world coordinates.
             * @var {x3dom.fields.SFVec3f} axis
             * @memberof x3dom.nodeTypes.SingleAxisHingeJoint
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'axis', 0,0,0);

            /**
             * The minAngle and maxAngle fields are used to control the maximum angles through which the hinge is
             *  allowed to travel. A hinge may not travel more than π radians (or the equivalent angle base units) in
             *  either direction from its initial position.
             * @var {x3dom.fields.SFFloat} maxAngle
             * @memberof x3dom.nodeTypes.SingleAxisHingeJoint
             * @initvalue 90
             * @range [-PI*degToRad, PI*degToRad]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'maxAngle', 90);

            /**
             * The minAngle and maxAngle fields are used to control the maximum angles through which the hinge is
             *  allowed to travel. A hinge may not travel more than π radians (or the equivalent angle base units) in
             *  either direction from its initial position.
             * @var {x3dom.fields.SFFloat} minAngle
             * @memberof x3dom.nodeTypes.SingleAxisHingeJoint
             * @initvalue -90
             * @range [-PI*degToRad, PI*degToRad]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'minAngle', -90);

            /**
             * The stopBounce field describes how much the joint should bounce the body back if the joint limit has been
             *  reached or exceeded. A value of zero indicates no bounce at all, and a value of one says that it should
             *  bounce with velocity equal and opposite to the collision velocity of the contact.
             * @var {x3dom.fields.SFFloat} stopBounce
             * @memberof x3dom.nodeTypes.SingleAxisHingeJoint
             * @initvalue 0
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'stopBounce', 0);

            /**
             * The stopErrorCorrection field describes the amount of error correction to be performed in a time step
             *  when the joint reaches the limit. A value of zero means no error correction is to be performed and a
             *  value of one means all error should be corrected in a single step.
             * @var {x3dom.fields.SFFloat} stopErrorCorrection
             * @memberof x3dom.nodeTypes.SingleAxisHingeJoint
             * @initvalue 0.8
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'stopErrorCorrection', 0.8);

        },
        {
            nodeChanged: function(){
                //x3dom.debug.logInfo('SingleAxisHingeJoint: ');
            }
        }
    )
);