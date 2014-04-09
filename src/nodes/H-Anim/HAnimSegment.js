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
         * @x3d x.x
         * @component H-Anim
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.HAnimSegment.superClass.call(this, ctx);


            /**
             *
             * @var {SFString} name
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx,'name', "");

            /**
             *
             * @var {SFVec3f} centerOfMass
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'centerOfMass', 0, 0, 0);

            /**
             *
             * @var {SFFloat} mass
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'mass', 0);

            /**
             *
             * @var {MFFloat} momentsOfInertia
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @initvalue [0,0,0,0,0,0,0,0,0]
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'momentsOfInertia', [0, 0, 0, 0, 0, 0, 0, 0, 0]);


            /**
             *
             * @var {SFNode} coord
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @initvalue x3dom.nodeTypes.X3DCoordinateNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('coord', x3dom.nodeTypes.X3DCoordinateNode);

            /**
             *
             * @var {MFNode} displacers
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