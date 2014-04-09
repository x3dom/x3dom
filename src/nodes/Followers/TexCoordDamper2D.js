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
         * @x3d x.x
         * @component Followers
         * @status experimental
         * @extends x3dom.nodeTypes.X3DDamperNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.TexCoordDamper2D.superClass.call(this, ctx);


            /**
             *
             * @var {MFVec2f} initialDestination
             * @memberof x3dom.nodeTypes.TexCoordDamper2D
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFVec2f(ctx, 'initialDestination', []);

            /**
             *
             * @var {MFVec2f} initialValue
             * @memberof x3dom.nodeTypes.TexCoordDamper2D
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFVec2f(ctx, 'initialValue', []);


            /**
             *
             * @var {MFVec2f} value
             * @memberof x3dom.nodeTypes.TexCoordDamper2D
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFVec2f(ctx, 'value', []);

            /**
             *
             * @var {MFVec2f} destination
             * @memberof x3dom.nodeTypes.TexCoordDamper2D
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFVec2f(ctx, 'destination', []);

            x3dom.debug.logWarning("TexCoordDamper2D NYI");
        
        }
    )
);