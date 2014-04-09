/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */


//	### RigidBodyCollection ###
x3dom.registerNodeType("RigidBodyCollection", "X3DChildNode", defineClass(x3dom.nodeTypes.X3DNode, 
        /**
         * Constructor for RigidBodyCollection
         * @constructs x3dom.nodeTypes.RigidBodyCollection
         * @x3d x.x
         * @component X3DChildNode
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function(ctx){
    x3dom.nodeTypes.RigidBodyCollection.superClass.call(this, ctx);

            /**
             *
             * @var {SFBool} autoDisable
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue false
             * @field x3dom
             * @instance
             */
    this.addField_SFBool(ctx, 'autoDisable', false);

            /**
             *
             * @var {SFFloat} constantForceMix
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue 0.0001
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'constantForceMix', 0.0001);

            /**
             *
             * @var {SFFloat} contactSurfaceThickness
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'contactSurfaceThickness', 0);

            /**
             *
             * @var {SFFloat} disableAngularSpeed
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'disableAngularSpeed', 0);

            /**
             *
             * @var {SFFloat} disableLinearSpeed
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'disableLinearSpeed', 0);

            /**
             *
             * @var {SFFloat} disableTime
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'disableTime', 0);

            /**
             *
             * @var {SFBool} enabled
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue true
             * @field x3dom
             * @instance
             */
    this.addField_SFBool(ctx, 'enabled', true);

            /**
             *
             * @var {SFFloat} errorCorrection
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue 0.8
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'errorCorrection', 0.8);

            /**
             *
             * @var {SFVec3f} gravity
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue 0,-9.8,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec3f(ctx, 'gravity', 0,-9.8,0);

            /**
             *
             * @var {SFInt32} iterations
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue 1
             * @field x3dom
             * @instance
             */
    this.addField_SFInt32(ctx, 'iterations', 1);

            /**
             *
             * @var {SFFloat} maxCorrectionSpeed
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue -1
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'maxCorrectionSpeed', -1);

            /**
             *
             * @var {SFBool} preferAccuracy
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue false
             * @field x3dom
             * @instance
             */
    this.addField_SFBool(ctx, 'preferAccuracy', false);

            /**
             *
             * @var {MFNode} bodies
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue x3dom.nodeTypes.RigidBody
             * @field x3dom
             * @instance
             */
    this.addField_MFNode('bodies', x3dom.nodeTypes.RigidBody);

            /**
             *
             * @var {MFNode} joints
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue x3dom.nodeTypes.X3DRigidJointNode
             * @field x3dom
             * @instance
             */
    this.addField_MFNode('joints', x3dom.nodeTypes.X3DRigidJointNode);

            /**
             *
             * @var {MFNode} metadata
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue x3dom.nodeTypes.X3DMetadataObject
             * @field x3dom
             * @instance
             */
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);

        },{
    nodeChanged: function(){
        if(!this._cf.joints.nodes){
            for(var x in this._xmlNode.children){
                if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.X3DRigidJointNode)){
                    this._cf.joints = this._xmlNode.children[x];
                }
            }
        }
        if(!this._cf.bodies.nodes){
            for(var x in this._xmlNode.children){
                if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.RigidBody)){
                    this._cf.bodies = this._xmlNode.children[x];
                }
            }
        }
        x3dom.debug.logInfo('RigidBodyCollection: ');
    }
}));