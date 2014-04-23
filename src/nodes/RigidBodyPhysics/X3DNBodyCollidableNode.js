/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### X3DNBodyCollidableNode ###
x3dom.registerNodeType(
    "X3DNBodyCollidableNode",
    "RigidBodyPhysics",
    defineClass(x3dom.nodeTypes.X3DBoundedObject,

        /**
         * Constructor for X3DNBodyCollidableNode
         * @constructs x3dom.nodeTypes.X3DNBodyCollidableNode
         * @x3d 3.3
         * @component RigidBodyPhysics
         * @status full
         * @extends x3dom.nodeTypes.X3DBoundedObject
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The X3DNBodyCollidableNode abstract node type represents objects that act as the interface between
         *  the rigid body physics, collision geometry proxy, and renderable objects in the scene graph hierarchy.
         */
        function(ctx){
            x3dom.nodeTypes.X3DNBodyCollidableNode.superClass.call(this, ctx);

            /**
             * The enabled field is used to specify whether a collidable object is eligible for collision detection
             *  interactions.
             * @var {x3dom.fields.SFBool} enabled
             * @memberof x3dom.nodeTypes.X3DNBodyCollidableNode
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'enabled', true);

            /**
             * The rotation field defines rotation about the body's center that the collidable node occupies.
             * @var {x3dom.fields.SFRotation} rotation
             * @memberof x3dom.nodeTypes.X3DNBodyCollidableNode
             * @initvalue 0,0,1,0
             * @range [0,1]
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'rotation', 0,0,1,0);

            /**
             * The translation field defines an offset from the body's center that the collidable node occupies. This
             *  can be used to place the collidable geometry in a different location relative to the actual rigid body
             *  that has the physics model being applied.
             * @var {x3dom.fields.SFVec3f} translation
             * @memberof x3dom.nodeTypes.X3DNBodyCollidableNode
             * @initvalue 0,0,0
             * @range (-inf, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'translation', 0,0,0);

            },
            {
                nodeChanged: function()
                {
                    //x3dom.debug.logInfo('X3DNBodyCollidableNode: ');
                }
            }
    )
);