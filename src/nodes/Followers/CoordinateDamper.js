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
         * @x3d 3.3
         * @component Followers
         * @status experimental
         * @extends x3dom.nodeTypes.X3DDamperNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The CoordinateChaser animates transitions for array of 3D vectors (e.g., the coordinates of a
         *  mesh). Whenever it receives an array of 3D vectors, the value_changed creates a transition from its
         *  current value to the newly set number. It creates a smooth transition that ends duration seconds after the
         *  last number has been received.
         */
        function (ctx) {
            x3dom.nodeTypes.CoordinateDamper.superClass.call(this, ctx);


            /**
             * The field initialDestination should be set to the same value than initialValue unless a transition to a
             *  certain value is to be created right after the scene is loaded or right after the CoordinateChaser node
             *  is created dynamically.
             * @var {x3dom.fields.MFVec3f} initialDestination
             * @memberof x3dom.nodeTypes.CoordinateDamper
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec3f(ctx, 'initialDestination', []);

            /**
             * The field initialValue can be used to set the initial value.
             * @var {x3dom.fields.MFVec3f} initialValue
             * @memberof x3dom.nodeTypes.CoordinateDamper
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec3f(ctx, 'initialValue', []);


            /**
             * The current coordinate value
             * @var {x3dom.fields.MFVec3f} value
             * @memberof x3dom.nodeTypes.CoordinateDamper
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec3f(ctx, 'value', []);

            /**
             * The target coordinate value
             * @var {x3dom.fields.MFVec3f} destination
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