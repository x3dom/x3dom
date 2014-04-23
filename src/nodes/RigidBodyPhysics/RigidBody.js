/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### RigidBody ###
x3dom.registerNodeType(
    "RigidBody",
    "RigidBodyPhysics",
    defineClass(x3dom.nodeTypes.X3DNode,

        /**
         * Constructor for RigidBody
         * @constructs x3dom.nodeTypes.RigidBody
         * @x3d 3.3
         * @component RigidBodyPhysics
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The RigidBody node describes a body and its properties that can be affected by the physics model.
         *  A body is modelled as a collection of shapes that describe mass distribution rather than renderable
         *  geometry. Bodies are connected together using Joints and are represented by geometry.
         */
        function(ctx){
            x3dom.nodeTypes.RigidBody.superClass.call(this, ctx);

            /**
             * Angular damping factor.
             * @var {x3dom.fields.SFFloat} angularDampingFactor
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0.001
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'angularDampingFactor', 0.001);

            /**
             * The velocity fields are used to provide a constant velocity value to the object every frame. If both
             *  forces and velocity are defined, the velocity is used only on the first frame that the node is active,
             *  and then the forces are applied.
             * @var {x3dom.fields.SFVec3f} angularVelocity
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
                this.addField_SFVec3f(ctx, 'angularVelocity', 0,0,0);

            /**
             * The application of damping is controlled through the use of the autoDamp field. When the value is FALSE,
             *  no damping is applied. When the value is TRUE, rotational and translational damping is calculated and
             *  applied.
             * @var {x3dom.fields.SFBool} autoDamp
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'autoDamp', false);

            /**
             * By default, this automatic disabling is turned off. It may be enabled by setting the autoDisable field
             *  to TRUE.
             * @var {x3dom.fields.SFBool} autoDisable
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'autoDisable', false);

            /**
             * Center of mass for calculations
             * @var {x3dom.fields.SFVec3f} centerOfMass
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0,0,0
             * @range (-inf, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'centerOfMass', 0,0,0);

            /**
             * The disable fields define conditions for when the body ceases to considered as part of the rigid body
             *  calculations and should be considered as at rest.
             * @var {x3dom.fields.SFFloat} disableAngularSpeed
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0
             * @range [0,inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'disableAngularSpeed', 0);

            /**
             * The disable fields define conditions for when the body ceases to considered as part of the rigid body
             *  calculations and should be considered as at rest.
             * @var {x3dom.fields.SFFloat} disableLinearSpeed
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0
             * @range [0,inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'disableLinearSpeed', 0);

            /**
             * The disable fields define conditions for when the body ceases to considered as part of the rigid body
             *  calculations and should be considered as at rest.
             * @var {x3dom.fields.SFFloat} disableTime
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0
             * @range [0,inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'disableTime', 0);

            /**
             * The enabled field controls whether the information in this node is submitted to the physics engine for
             *  processing. If the enabled field is set TRUE, the node is submitted to the physics engine. If the
             *  enabled field is set FALSE, the node is not submitted to the physics engine for processing.
             * @var {x3dom.fields.SFBool} enabled
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'enabled', true);

            /**
             * The finiteRotationAxis field specifies a vector around which the object rotates.
             * @var {x3dom.fields.SFVec3f} finiteRotationAxis
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'finiteRotationAxis', 0,0,0);

            /**
             * The fixed field is used to indicate that this body does not move. Any calculations involving collisions
             *  with this body should take into account that this body does not move. This is useful for representing
             *  objects such as the ground, walls etc that can be collided with, have an effect on other objects, but
             *  are not capable of moving themselves.
             * @var {x3dom.fields.SFBool} fixed
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'fixed', false);

            /**
             * The torques and forces fields define zero or more sets of torque and force values that are applied to the
             *  object every frame. These are continuously applied until reset to zero by the user.
             * @var {x3dom.fields.MFVec3f} forces
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec3f(ctx, 'forces', []);

            /**
             * The inertia field represents a 3x2 inertia tensor matrix. If the set values are less than six items, the
             *  results are implementation dependent. If the value set is greater than six values, only the first six
             *  values of the array are used.
             * @var {x3dom.fields.MFFloat} inertia
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue [1,0,0,0,1,0,0,0,1]
             * @field x3d
             * @instance
             */
            this.addField_MFFloat(ctx, 'inertia', [1, 0, 0, 0, 1, 0, 0, 0, 1]);

            /**
             * Linear damping factor.
             * @var {x3dom.fields.SFFloat} linearDampingFactor
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0.001
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'linearDampingFactor', 0.001);

            /**
             * Linear velocity.
             * @var {x3dom.fields.SFVec3f} linearVelocity
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0,0,0
             * @range (-inf, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'linearVelocity', 0,0,0);

            /**
             * The mass field indicates the mass of the body in mass base units. All bodies shall have a non-zero mass,
             *  with the default value of 1 mass base unit.
             * @var {x3dom.fields.SFFloat} mass
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 1
             * @range [0,inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'mass', 1);

            /**
             * The position and orientation fields are used to set the initial conditions of this body's location in
             *  world space. After the initial conditions have been set, these fields are used to report the current
             *  information based on the most recent physics model evaluation.
             * @var {x3dom.fields.SFRotation} orientation
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0,0,1,0
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'orientation', 0,0,1,0);

            /**
             * The position and orientation fields are used to set the initial conditions of this body's location in
             *  world space. After the initial conditions have been set, these fields are used to report the current
             *  information based on the most recent physics model evaluation.
             * @var {x3dom.fields.SFVec3f} position
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0,0,0
             * @range (-inf, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'position', 0,0,0);

            /**
             * The torques and forces fields define zero or more sets of torque and force values that are applied to the
             *  object every frame. These are continuously applied until reset to zero by the user.
             * @var {x3dom.fields.MFVec3f} torques
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec3f(ctx, 'torques', []);

            /**
             * The useFiniteRotation field is used to influence the way the body's rotation is calculated. In very fast
             *  rotating objects, such as a wheel of a car, an infinitely small time step can cause the modelling to
             *  explode. The default value is to use the faster infinite mode.
             * @var {x3dom.fields.SFBool} useFiniteRotation
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'useFiniteRotation', false);

            /**
             * The useGlobalGravity field is used to indicate whether this particular body should be influenced by the
             *  containing RigidBodyCollection's gravity setting. A value of TRUE indicates that the gravity is used, a
             *  value of FALSE indicates that it is not used. This only applies to this body instance. Contained
             *  sub-bodies shall not be affected by this setting.
             * @var {x3dom.fields.SFBool} useGlobalGravity
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'useGlobalGravity', true);

            /**
             * The massDensityModel field is used to describe the geometry type and dimensions used to calculate the
             *  mass density in the physics model. This geometry has no renderable property, other than for defining the
             *  model of the mass density. It is not rendered, nor modified by the physics model.
             * @var {x3dom.fields.MFNode} massDensityModel
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue x3dom.nodeTypes.Shape
             * @field x3d
             * @instance
             */
            this.addField_MFNode('massDensityModel', x3dom.nodeTypes.Shape);


            /**
             * The geometry field is used to connect the body modelled by the physics engine implementation to the real
             *  geometry of the scene through the use of collidable nodes. This allows the geometry to be connected
             *  directly to the physics model as well as collision detection. Collidable nodes have their location set
             *  to the same location as the body instance in which they are located. Their position and location are not
             *  relative to this object, unless otherwise defined.
             * @var {x3dom.fields.MFNode} geometry
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue x3dom.nodeTypes.X3DNBodyCollidableNode
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('geometry', x3dom.nodeTypes.X3DNBodyCollidableNode);

        },
        {
            nodeChanged: function(){
                if(!this._cf.geometry.nodes){
                    for(var x in this._xmlNode.children){
                        if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.X3DNBodyCollidableNode)){
                            this._cf.geometry = this._xmlNode.children[x];
                        }
                    }
                }
                if(!this._cf.massDensityModel.nodes){
                    for(var x in this._xmlNode.children){
                        if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.Shape)){
                            this._cf.massDensityModel = this._xmlNode.children[x];
                        }
                    }
                }
                //x3dom.debug.logInfo('RigidBody: ');
            }
        }
    )
);