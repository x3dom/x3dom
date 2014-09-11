/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### HAnimDisplacer ###
x3dom.registerNodeType(
    "HAnimDisplacer",
    "H-Anim",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        
        /**
         * Constructor for HAnimDisplacer
         * @constructs x3dom.nodeTypes.HAnimDisplacer
         * @x3d 3.3
         * @component H-Anim
         * @status full
         * @extends x3dom.nodeTypes.X3DGeometricPropertyNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc In some cases, the application may need to be able to identify specific groups of vertices within an HAnimSegment.
         * It may also require "hints" as to the direction in which each vertex should move. That information is stored in a node called an HAnimDisplacer.
         * The HAnimDisplacers for a particular HAnimSegment are stored in the displacers field of that HAnimSegment.
         */
        function (ctx) {
            x3dom.nodeTypes.HAnimDisplacer.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.SFString} name
             * @memberof x3dom.nodeTypes.HAnimDisplacer
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx,'name', "");

            /**
             *
             * @var {x3dom.fields.SFFloat} weight
             * @memberof x3dom.nodeTypes.HAnimDisplacer
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'weight', 0);

            /**
             *
             * @var {x3dom.fields.MFInt32} coordIndex
             * @memberof x3dom.nodeTypes.HAnimDisplacer
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFInt32(ctx, 'coordIndex', []);

            /**
             *
             * @var {x3dom.fields.MFVec3f} displacements
             * @memberof x3dom.nodeTypes.HAnimDisplacer
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFVec3f(ctx, 'displacements', []);

            // TODO displacement (add functionality e.g. via matrix palette skinning in shader)
            x3dom.debug.logWarning("HAnimDisplacer NYI!");
        
        }
    )
);