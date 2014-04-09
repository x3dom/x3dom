/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### CoordinateDamper ### */
x3dom.registerNodeType(
    "CoordinateDamper",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        
        /**
         * Constructor for CoordinateDamper
         * @constructs x3dom.nodeTypes.CoordinateDamper
         * @x3d x.x
         * @component Followers
         * @status experimental
         * @extends x3dom.nodeTypes.X3DDamperNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.CoordinateDamper.superClass.call(this, ctx);


            /**
             *
             * @var {MFVec3f} initialDestination
             * @memberof x3dom.nodeTypes.CoordinateDamper
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFVec3f(ctx, 'initialDestination', []);

            /**
             *
             * @var {MFVec3f} initialValue
             * @memberof x3dom.nodeTypes.CoordinateDamper
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFVec3f(ctx, 'initialValue', []);


            /**
             *
             * @var {MFVec3f} value
             * @memberof x3dom.nodeTypes.CoordinateDamper
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFVec3f(ctx, 'value', []);

            /**
             *
             * @var {MFVec3f} destination
             * @memberof x3dom.nodeTypes.CoordinateDamper
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFVec3f(ctx, 'destination', []);

            x3dom.debug.logWarning("CoordinateDamper NYI");
        
        }
    )
);