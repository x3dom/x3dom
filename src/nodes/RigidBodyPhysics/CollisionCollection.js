/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### CollisionCollection ###
x3dom.registerNodeType(
    "CollisionCollection",
    "RigidBodyPhysics",
    defineClass(x3dom.nodeTypes.X3DChildNode,

        /**
         * Constructor for CollisionCollection
         * @constructs x3dom.nodeTypes.CollisionCollection
         * @x3d 3.3
         * @component RigidBodyPhysics
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The CollisionCollection node holds a collection of objects in the collidables field that can be
         *  managed as a single entity for resolution of inter-object collisions with other groups of collidable
         *  objects. A group consists of both collidable objects as well as spaces that may be collided against each
         *  other. A set of parameters are provided that specify default values that will be assigned to all Contact
         *  nodes generated from the CollisionSensor node. A user may then override the individual Contact node by
         *  inserting a script between the output of the sensor and the input to the RigidBodyCollection node if it is
         *  desired to process the contact stream.
         */
        function(ctx){
            x3dom.nodeTypes.CollisionCollection.superClass.call(this, ctx);

            /**
             * The bounce field indicates how bouncy the surface contact is. A value of 0 indicates no bounce at all
             *  while a value of 1 indicates maximum bounce.
             * @var {x3dom.fields.SFFloat} bounce
             * @memberof x3dom.nodeTypes.CollisionCollection
             * @initvalue 0
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'bounce', 0);

            /**
             * The enabled field is used to control whether the collision detection system for this collection should be
             *  run at the end of this frame. A value of TRUE enables it while a value of FALSE disables it. A
             *  CollisionSensor node watching this collection does not report any outputs for this collection for this
             *  frame if it is not enabled.
             * @var {x3dom.fields.SFBool} enabled
             * @memberof x3dom.nodeTypes.CollisionCollection
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'enabled', true);

            /**
             * Friction Coefficients
             * @var {x3dom.fields.SFVec2f} frictionCoefficients
             * @memberof x3dom.nodeTypes.CollisionCollection
             * @initvalue 0,0
             * @range [0, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFVec2f(ctx, 'frictionCoefficients', 0,0);

            /**
             * The minBounceSpeed field indicates the minimum speed, in speed base units, that an object shall have
             *  before an object will bounce. If the object is below this speed, it will not bounce, effectively having
             *  an equivalent value for the bounce field of zero.
             * @var {x3dom.fields.SFFloat} minBounceSpeed
             * @memberof x3dom.nodeTypes.CollisionCollection
             * @initvalue 0.1
             * @range [0, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'minBounceSpeed', 0.1);

            /**
             * Slip factors
             * @var {x3dom.fields.SFVec2f} slipFactors
             * @memberof x3dom.nodeTypes.CollisionCollection
             * @initvalue 0,0
             * @range (-inf, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFVec2f(ctx, 'slipFactors', 0,0);

            /**
             * The softnessConstantForceMix value applies a constant force value to make the colliding surfaces appear
             *  to be somewhat soft.
             * @var {x3dom.fields.SFFloat} softnessConstantForceMix
             * @memberof x3dom.nodeTypes.CollisionCollection
             * @initvalue 0.0001
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'softnessConstantForceMix', 0.0001);

            /**
             * The softnessErrorCorrection determines how much of the collision error should be fixed in a set of
             *  evaluations. The value is limited to the range of [0,1]. A value of 0 specifies no error correction
             *  while a value of 1 specifies that all errors should be corrected in a single step.
             * @var {x3dom.fields.SFFloat} softnessErrorCorrection
             * @memberof x3dom.nodeTypes.CollisionCollection
             * @initvalue 0.8
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'softnessErrorCorrection', 0.8);

            /**
             * The surfaceSpeed field defines the speed in the two friction directions in speed base units. This is used
             *  to indicate if the contact surface is moving independently of the motion of the bodies.
             * @var {x3dom.fields.SFVec2f} surfaceSpeed
             * @memberof x3dom.nodeTypes.CollisionCollection
             * @initvalue 0,0
             * @range (-inf, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFVec2f(ctx, 'surfaceSpeed', 0,0);

            /**
             * The collidables field can be managed as a single entity for resolution of inter-object collisions with
             *  other groups of collidable objects.
             * @var {x3dom.fields.MFNode} collidables
             * @memberof x3dom.nodeTypes.CollisionCollection
             * @initvalue x3dom.nodeTypes.X3DNBodyCollidableNode
             * @field x3d
             * @instance
             */
            this.addField_MFNode('collidables', x3dom.nodeTypes.X3DNBodyCollidableNode);

        },
        {
            nodeChanged: function(){
                if(!this._cf.collidables.nodes){
                    for(var x in this._xmlNode.children){
                        if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.X3DNBodyCollidableNode)){
                            this._cf.collidables = this._xmlNode.children[x];
                        }
                    }
                }
                //x3dom.debug.logInfo('CollisionCollection: ');
            }
        }
    )
);