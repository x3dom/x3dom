/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### TexCoordDamper2D ### */
x3dom.registerNodeType(
    "TexCoordDamper2D",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        
        /**
         * Constructor for TexCoordDamper2D
         * @constructs x3dom.nodeTypes.TexCoordDamper2D
         * @x3d 3.3
         * @component Followers
         * @status experimental
         * @extends x3dom.nodeTypes.X3DDamperNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The TexCoordDamper2D node animates transitions for an array of 2D vectors (e.g., the texture
         *  coordinates of a mesh). Whenever the destination field receives an array of 2D vectors, value begins
         *  sending an array of the same length, where each element moves from its current value towards the value at
         *  the same position in the array received.
         */
        function (ctx) {
            x3dom.nodeTypes.TexCoordDamper2D.superClass.call(this, ctx);


            /**
             * The field initialDestination should be set to the same value than initialValue unless a transition to a
             *  certain 2D vector value is to be created right after the scene is loaded or right after the
             *  CoordinateDamper node is created dynamically.
             * @var {x3dom.fields.MFVec2f} initialDestination
             * @memberof x3dom.nodeTypes.TexCoordDamper2D
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec2f(ctx, 'initialDestination', []);

            /**
             * The field initialValue can be used to set the initial value of value_changed.
             * @var {x3dom.fields.MFVec2f} initialValue
             * @memberof x3dom.nodeTypes.TexCoordDamper2D
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec2f(ctx, 'initialValue', []);


            /**
             * The current value.
             * @var {x3dom.fields.MFVec2f} value
             * @memberof x3dom.nodeTypes.TexCoordDamper2D
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec2f(ctx, 'value', []);

            /**
             * The target value.
             * @var {x3dom.fields.MFVec2f} destination
             * @memberof x3dom.nodeTypes.TexCoordDamper2D
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec2f(ctx, 'destination', []);

            x3dom.debug.logWarning("TexCoordDamper2D NYI");
        
        }
    )
);