/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### SliderJoint ###
x3dom.registerNodeType("SliderJoint", "X3DRigidJointNode", defineClass(x3dom.nodeTypes.X3DNode, 
        /**
         * Constructor for SliderJoint
         * @constructs x3dom.nodeTypes.SliderJoint
         * @x3d x.x
         * @component X3DRigidJointNode
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function(ctx){
    x3dom.nodeTypes.SliderJoint.superClass.call(this, ctx);

            /**
             *
             * @var {SFVec3f} axis
             * @memberof x3dom.nodeTypes.SliderJoint
             * @initvalue 0,1,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec3f(ctx, 'axis', 0,1,0);

            /**
             *
             * @var {SFString} forceOutput
             * @memberof x3dom.nodeTypes.SliderJoint
             * @initvalue "NONE"
             * @field x3dom
             * @instance
             */
    this.addField_SFString(ctx, 'forceOutput', "NONE");

            /**
             *
             * @var {SFFloat} maxSeparation
             * @memberof x3dom.nodeTypes.SliderJoint
             * @initvalue 1
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'maxSeparation', 1);

            /**
             *
             * @var {SFFloat} minSeparation
             * @memberof x3dom.nodeTypes.SliderJoint
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'minSeparation', 0);

            /**
             *
             * @var {SFFloat} stopBounce
             * @memberof x3dom.nodeTypes.SliderJoint
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'stopBounce', 0);

            /**
             *
             * @var {SFFloat} stopErrorCorrection
             * @memberof x3dom.nodeTypes.SliderJoint
             * @initvalue 1
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'stopErrorCorrection', 1);

            /**
             *
             * @var {SFNode} body1
             * @memberof x3dom.nodeTypes.SliderJoint
             * @initvalue x3dom.nodeTypes.RigidBody
             * @field x3dom
             * @instance
             */
    this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);

            /**
             *
             * @var {SFNode} body2
             * @memberof x3dom.nodeTypes.SliderJoint
             * @initvalue x3dom.nodeTypes.RigidBody
             * @field x3dom
             * @instance
             */
    this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);

            /**
             *
             * @var {MFNode} metadata
             * @memberof x3dom.nodeTypes.SliderJoint
             * @initvalue x3dom.nodeTypes.X3DMetadataObject
             * @field x3dom
             * @instance
             */
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);

        },{
    nodeChanged: function(){
        x3dom.debug.logInfo('SliderJoint: ');
    }
}));