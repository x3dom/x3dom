/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### HAnimJoint ###
x3dom.registerNodeType(
    "HAnimJoint",
    "H-Anim",
    defineClass(x3dom.nodeTypes.Transform,
        
        /**
         * Constructor for HAnimJoint
         * @constructs x3dom.nodeTypes.HAnimJoint
         * @x3d x.x
         * @component H-Anim
         * @status experimental
         * @extends x3dom.nodeTypes.Transform
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.HAnimJoint.superClass.call(this, ctx);


            /**
             *
             * @var {SFString} name
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'name', "");

            /**
             *
             * @var {MFNode} displacers
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue x3dom.nodeTypes.HAnimDisplacer
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('displacers', x3dom.nodeTypes.HAnimDisplacer);


            /**
             *
             * @var {SFRotation} limitOrientation
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue 0,0,1,0
             * @field x3dom
             * @instance
             */
            this.addField_SFRotation(ctx, 'limitOrientation', 0, 0, 1, 0);

            /**
             *
             * @var {MFFloat} llimit
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'llimit', []);

            /**
             *
             * @var {MFFloat} ulimit
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'ulimit', []);

            /**
             *
             * @var {MFInt32} skinCoordIndex
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFInt32(ctx, 'skinCoordIndex', []);

            /**
             *
             * @var {MFFloat} skinCoordWeight
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'skinCoordWeight', []);
        
        }
    )
);