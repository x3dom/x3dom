/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* This is only a first stub */

/* ### ParticleSet ### */
x3dom.registerNodeType(
    "ParticleSet",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,

        /**
         * Constructor for ParticleSet
         * @constructs x3dom.nodeTypes.ParticleSet
         * @x3d x.x
         * @component Rendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The ParticleSet is a geometry node used in combination with a ParticleSystem node.
         *  Attention: So far this is only a stub.
         */
            function (ctx) {
            x3dom.nodeTypes.ParticleSet.superClass.call(this, ctx);


            /**
             * Drawing mode: "ViewDirQuads" - Draws quads directed to the viewpoint (default). "Points" - Draw points. "Lines" - Draw
             * lines. These modes must not match the finally supported modes.
             * @var {x3dom.fields.SFString} mode
             * @memberof x3dom.nodeTypes.ParticleSet
             * @initvalue ViewDirQuads
             * @range [ViewDirQuads, Points, Lines, Arrows, ViewerArrows, ViewerQuads, Rectangles]
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'mode', 'ViewDirQuads');

            /**
             * Defines the drawing order for the particles. Possible values: "Any" - The order is undefined.
             *  "BackToFront" - Draw from back to front. "FrontToBack" - Draw from front to back.
             * @var {x3dom.fields.SFString} drawOrder
             * @memberof x3dom.nodeTypes.ParticleSet
             * @initvalue ViewDirQuads
             * @range [Any, BackToFront, FrontToBack]
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'mode', 'ViewDirQuads');

            /**
             * Stores a Coordinate node containing the coordinates of the particles.
             * @var {x3dom.fields.SFNode} coord
             * @memberof x3dom.nodeTypes.ParticleSet
             * @initvalue null
             * @field x3dom
             * @instance
             */
            this.addField_SFNode(ctx, 'coord', null);

            /**
             * Stores a Coordinate node containing the second coordinates of the particles.
             * @var {x3dom.fields.SFNode} secCoord
             * @memberof x3dom.nodeTypes.ParticleSet
             * @initvalue null
             * @field x3dom
             * @instance
             */
            this.addField_SFNode(ctx, 'secCoord', null);

            /**
             * Stores a Color node containing the colors of the particles.
             * @var {x3dom.fields.SFNode} color
             * @memberof x3dom.nodeTypes.ParticleSet
             * @initvalue null
             * @field x3dom
             * @instance
             */
            this.addField_SFNode(ctx, 'color', null);

            /**
             * Stores a Normal node containing the normals of the particles.
             * @var {x3dom.fields.SFNode} normal
             * @memberof x3dom.nodeTypes.ParticleSet
             * @initvalue null
             * @field x3dom
             * @instance
             */
            this.addField_SFNode(ctx, 'normal', null);

            /**
             * An MFVec3f field containing the sizes of the particles.
             * @var {x3dom.fields.MFVec3f} size
             * @memberof x3dom.nodeTypes.ParticleSet
             * @field x3dom
             * @instance
             */
            this.addField_MFVec3f(ctx, 'size', null);

            /**
             * An MFInt32 field containing indices which specifiy the order ofthe vertices in the "coord" field.
             * @var {x3dom.fields.MFInt32} index
             * @memberof x3dom.nodeTypes.ParticleSet
             * @field x3dom
             * @instance
             */
            this.addField_MFInt32(ctx, 'index', null);

            /**
             * An MFFloat field containing z-values for the texure of a particle (usedwith 3D textures).
             * @var {x3dom.fields.MFFloat} textureZ
             * @memberof x3dom.nodeTypes.ParticleSet
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'textureZ', null);
        },
        {
            getVolume: function() {
            },

            fieldChanged: function(fieldName)
            {
                if(fieldName == 'mode')
                {
                    console.log("mode has been changed");
                }
            },

            getCenter: function() {
            },

            getDiameter: function() {
            }
        }
    )
);