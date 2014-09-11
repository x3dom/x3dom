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
         * @x3d 3.3
         * @component H-Anim
         * @status experimental
         * @extends x3dom.nodeTypes.Transform
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Each joint in the body is represented by an HAnimJoint node, which is used to define the relationship of each body segment to its immediate parent.
         * An HAnimJoint may only be a child of another HAnimJoint node or a child within the skeleton field in the case of the HAnimJoint used as a humanoid root (i.e., an HAnimJoint may not be a child of an HAnimSegment).
         * The HAnimJoint node is also used to store other joint-specific information. In particular, a joint name is provided so that applications can identify each HAnimJoint node at run-time.
         * The HAnimJoint node may contain hints for inverse-kinematics systems that wish to control the H-Anim figure.
         * These hints include the upper and lower joint limits, the orientation of the joint limits, and a stiffness/resistance value.
         */
        function (ctx) {
            x3dom.nodeTypes.HAnimJoint.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.SFString} name
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'name', "");

            /**
             *
             * @var {x3dom.fields.MFNode} displacers
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue x3dom.nodeTypes.HAnimDisplacer
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('displacers', x3dom.nodeTypes.HAnimDisplacer);


            /**
             *
             * @var {x3dom.fields.SFRotation} limitOrientation
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue 0,0,1,0
             * @field x3dom
             * @instance
             */
            this.addField_SFRotation(ctx, 'limitOrientation', 0, 0, 1, 0);

            /**
             *
             * @var {x3dom.fields.MFFloat} llimit
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'llimit', []);

            /**
             *
             * @var {x3dom.fields.MFFloat} ulimit
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'ulimit', []);

            /**
             *
             * @var {x3dom.fields.MFInt32} skinCoordIndex
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFInt32(ctx, 'skinCoordIndex', []);

            /**
             *
             * @var {x3dom.fields.MFFloat} skinCoordWeight
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'skinCoordWeight', []);
        
        }
    )
);