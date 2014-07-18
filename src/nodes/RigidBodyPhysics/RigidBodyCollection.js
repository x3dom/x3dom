/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */


//	### RigidBodyCollection ###
x3dom.registerNodeType(
    "RigidBodyCollection",
    "RigidBodyPhysics",
    defineClass(x3dom.nodeTypes.X3DChildNode ,

        /**
         * Constructor for RigidBodyCollection
         * @constructs x3dom.nodeTypes.RigidBodyCollection
         * @x3d 3.3
         * @component RigidBodyPhysics
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The RigidBodyCollection node represents a system of bodies that will interact within a single
         *  physics model. The collection is not a renderable part of the scene graph nor are its children as a typical
         *  model may need to represent the geometry for physics separately, and in less detail, than those needed for
         *  visuals.
         */
        function(ctx){
            x3dom.nodeTypes.RigidBodyCollection.superClass.call(this, ctx);

            /**
             * The disable fields define conditions for when the body ceases to considered as part of the rigid body
             *  calculations and should be considered as at rest.
             * @var {x3dom.fields.SFBool} autoDisable
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'autoDisable', false);

            /**
             * The constantForceMix field can be used to apply damping to the calculations by violating the normal
             *  constraints by applying a small, constant force to those calculations. This allows joints and bodies to
             *  be a fraction springy, as well as helping to eliminate numerical instability. The larger the value, the
             *  more soft each of the constraints being evaluated. A value of zero indicates hard constraints so that
             *  everything is exactly honoured. By combining the errorCorrection and constantForceMix fields, various
             *  effects, such as spring-driven or spongy connections, can be emulated.
             * @var {x3dom.fields.SFFloat} constantForceMix
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue 0.0001
             * @range [0, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'constantForceMix', 0.0001);

            /**
             * The contactSurfaceThickness field represents how far bodies may interpenetrate after a collision. This
             *  allows simulation of softer bodies that may deform somewhat during collision. The default value is zero.
             * @var {x3dom.fields.SFFloat} contactSurfaceThickness
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue 0
             * @range [0, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'contactSurfaceThickness', 0);

            /**
             * The disable fields define conditions for when the body ceases to considered as part of the rigid body
             *  calculations and should be considered as at rest.
             * @var {x3dom.fields.SFFloat} disableAngularSpeed
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue 0
             * @range [0, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'disableAngularSpeed', 0);

            /**
             * The disable fields define conditions for when the body ceases to considered as part of the rigid body
             *  calculations and should be considered as at rest.
             * @var {x3dom.fields.SFFloat} disableLinearSpeed
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue 0
             * @range [0, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'disableLinearSpeed', 0);

            /**
             * The disable fields define conditions for when the body ceases to considered as part of the rigid body
             *  calculations and should be considered as at rest.
             * @var {x3dom.fields.SFFloat} disableTime
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue 0
             * @range [0, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'disableTime', 0);

            /**
             * The enabled field is used to control whether the physics model for this collection should be run this
             *  frame.
             * @var {x3dom.fields.SFBool} enabled
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'enabled', true);

            /**
             * The errorCorrection field describes how quickly the system should resolve intersection errors due to
             *  floating point inaccuracies. This value ranges between 0 and 1. A value of 0 means no correction at all
             *   while a value of 1 indicates that all errors should be corrected in a single step.
             * @var {x3dom.fields.SFFloat} errorCorrection
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue 0.8
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'errorCorrection', 0.8);

            /**
             * The gravity field indicates direction and strength (in acceleration base units) of the local gravity
             *  vector for this collection of bodies. The default gravity is standard earth gravity of 9.8
             *  meters/second2 downwards.
             * @var {x3dom.fields.SFVec3f} gravity
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue 0,-9.8,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'gravity', 0,-9.8,0);

            /**
             * The iterations field is used to control how many iterations over the collections of joints and bodies are
             *  to be performed each time the model is evaluated. Rigid body physics is a process of iterative
             *  refinement in order to maintain reasonable performance. As the number of iterations grow, the more
             *  stable the final results are at the cost of increasing evaluation time. Since maintaining real-time
             *  performance is a trade off between accuracy and frame rate, this setting allows the user to control that
             *  trade off to a limited extent.
             * @var {x3dom.fields.SFInt32} iterations
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue 1
             * @range [0,inf)
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, 'iterations', 1);

            /**
             * Maximal correction speed.
             * @var {x3dom.fields.SFFloat} maxCorrectionSpeed
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue -1
             * @range [0, inf) or -1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'maxCorrectionSpeed', -1);

            /**
             * The preferAccuracy field is used to provide a performance hint to the underlying evaluation about whether
             *  the user prefers to have very accurate models or fast models. Accuracy comes at a large penalty in both
             *  speed and memory usage, but may not be needed most of the time. The default setting is to optimize for
             *  speed rather than accuracy.
             * @var {x3dom.fields.SFBool} preferAccuracy
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'preferAccuracy', false);

            /**
             * The bodies field contains a collection of the top-level nodes that comprise a set of bodies that should
             *  be evaluated as a single set of interactions.
             * @var {x3dom.fields.MFNode} bodies
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue x3dom.nodeTypes.RigidBody
             * @field x3d
             * @instance
             */
            this.addField_MFNode('bodies', x3dom.nodeTypes.RigidBody);

            /**
             * The joints field is used to register all the joints between the bodies contained in this collection. If a
             *  joint is connected between bodies in two different collections, the result is implementation-dependent.
             *  If a joint instance is registered with more than one collection, the results are implementation
             *  dependent. Joints not registered with any collection are not evaluated.
             * @var {x3dom.fields.MFNode} joints
             * @memberof x3dom.nodeTypes.RigidBodyCollection
             * @initvalue x3dom.nodeTypes.X3DRigidJointNode
             * @field x3d
             * @instance
             */
            this.addField_MFNode('joints', x3dom.nodeTypes.X3DRigidJointNode);

        },
        {
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
                //x3dom.debug.logInfo('RigidBodyCollection: ');
            }
        }
    )
);