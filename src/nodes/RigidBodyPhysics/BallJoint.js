/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### BallJoint ###
x3dom.registerNodeType(
    "BallJoint",
    "RigidBodyPhysics",
    defineClass(x3dom.nodeTypes.X3DRigidJointNode,

        /**
         * Constructor for BallJoint
         * @constructs x3dom.nodeTypes.BallJoint
         * @x3d 3.3
         * @component RigidBodyPhysics
         * @status full
         * @extends x3dom.nodeTypes.X3DRigidJointNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The BallJoint node represents an unconstrained joint between two bodies that pivot about a common
         *  anchor point.
         */
        function(ctx){
            x3dom.nodeTypes.BallJoint.superClass.call(this, ctx);

            /**
             * The common anchor point.
             * @var {x3dom.fields.SFVec3f} anchorPoint
             * @memberof x3dom.nodeTypes.BallJoint
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'anchorPoint', 0,0,0);


        },
        {
            nodeChanged: function(){
                //x3dom.debug.logInfo('BallJoint: ');
            }
        }
    )
);