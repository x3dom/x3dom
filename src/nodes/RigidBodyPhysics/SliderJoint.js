/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### SliderJoint ###
x3dom.registerNodeType(
    "SliderJoint",
    "RigidBodyPhysics",
    defineClass(x3dom.nodeTypes.X3DRigidJointNode,

        /**
         * Constructor for SliderJoint
         * @constructs x3dom.nodeTypes.SliderJoint
         * @x3d 3.3
         * @component RigidBodyPhysics
         * @status experimental
         * @extends x3dom.nodeTypes.X3DRigidJointNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The SliderJoint node represents a joint where all movement between the bodies specified by the
         *  body1 and body2 fields is constrained to a single dimension along a user-defined axis.
         */
        function(ctx){
            x3dom.nodeTypes.SliderJoint.superClass.call(this, ctx);

            /**
             * The axis field indicates which axis along which the two bodies will act. The value should represent a
             *  normalized vector.
             * @var {x3dom.fields.SFVec3f} axis
             * @memberof x3dom.nodeTypes.SliderJoint
             * @initvalue 0,1,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'axis', 0,1,0);

            /**
             * If minSeparation is greater than maxSeparation, the stops become ineffective as if the object has no
             *  stops at all.
             * @var {x3dom.fields.SFFloat} maxSeparation
             * @memberof x3dom.nodeTypes.SliderJoint
             * @initvalue 1
             * @range [0,inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'maxSeparation', 1);

            /**
             * If minSeparation is greater than maxSeparation, the stops become ineffective as if the object has no
             *  stops at all.
             * @var {x3dom.fields.SFFloat} minSeparation
             * @memberof x3dom.nodeTypes.SliderJoint
             * @initvalue 0
             * @range [0,inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'minSeparation', 0);

            /**
             * The stopBounce field describes how much the joint should bounce the body back if the joint limit has been
             *  reached or exceeded. A value of zero indicates no bounce at all, and a value of one indicates that it
             *  should bounce with velocity equal and opposite to the collision velocity of the contact.
             * @var {x3dom.fields.SFFloat} stopBounce
             * @memberof x3dom.nodeTypes.SliderJoint
             * @initvalue 0
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'stopBounce', 0);

            /**
             * The stopErrorCorrection field describes the amount of error correction to be performed in a time step
             *  when the joint reaches the limit. A value of zero means no error correction is to be performed and a
             *   value of one means all error should be corrected in a single step.
             * @var {x3dom.fields.SFFloat} stopErrorCorrection
             * @memberof x3dom.nodeTypes.SliderJoint
             * @initvalue 1
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'stopErrorCorrection', 1);


        },
        {
            nodeChanged: function(){
                //x3dom.debug.logInfo('SliderJoint: ');
            }
        }
    )
);