/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### HAnimSegment ###
x3dom.registerNodeType(
    "HAnimSegment",
    "H-Anim",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        
        /**
         * Constructor for HAnimSegment
         * @constructs x3dom.nodeTypes.HAnimSegment
         * @x3d 3.3
         * @component H-Anim
         * @status full
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Each body segment is stored in an HAnimSegment node.
         * The HAnimSegment node is a grouping node that will typically contain either a number of Shape nodes or perhaps Transform nodes that position the body part within its coordinate system.
         */
        function (ctx) {
            x3dom.nodeTypes.HAnimSegment.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.SFString} name
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx,'name', "");

            /**
             *
             * @var {x3dom.fields.SFVec3f} centerOfMass
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'centerOfMass', 0, 0, 0);

            /**
             *
             * @var {x3dom.fields.SFFloat} mass
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'mass', 0);

            /**
             *
             * @var {x3dom.fields.MFFloat} momentsOfInertia
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @initvalue [0,0,0,0,0,0,0,0,0]
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'momentsOfInertia', [0, 0, 0, 0, 0, 0, 0, 0, 0]);


            /**
             *
             * @var {x3dom.fields.SFNode} coord
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @initvalue x3dom.nodeTypes.X3DCoordinateNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('coord', x3dom.nodeTypes.X3DCoordinateNode);

            /**
             *
             * @var {x3dom.fields.MFNode} displacers
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @initvalue x3dom.nodeTypes.HAnimDisplacer
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('displacers', x3dom.nodeTypes.HAnimDisplacer);
        
        },
        {
            // TODO coord      add functionality
            // TODO displacers add functionality
        }
    )
);