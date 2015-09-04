/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### ImageTextureAtlas ### */
x3dom.registerNodeType(
    "ImageTextureAtlas",
    "Texturing",
    defineClass(x3dom.nodeTypes.Texture,

        /**
         * Constructor for ImageTextureAtlas
         * @constructs x3dom.nodeTypes.ImageTextureAtlas
         * @x3d x.x
         * @component Texturing
         * @extends x3dom.nodeTypes.Texture
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This is a special helper node to represent tiles for volume rendering.
         */
        function (ctx) {
            x3dom.nodeTypes.ImageTextureAtlas.superClass.call(this, ctx);


            /**
             * Specifies the number of slices in the texture atlas.
             * @var {x3dom.fields.SFInt32} numberOfSlices
             * @memberof x3dom.nodeTypes.ImageTextureAtlas
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'numberOfSlices', 0);

            /**
             * Specifies the slices in x.
             * @var {x3dom.fields.SFInt32} slicesOverX
             * @memberof x3dom.nodeTypes.ImageTextureAtlas
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'slicesOverX', 0);

            /**
             * Specifies the slices in y.
             * @var {x3dom.fields.SFInt32} slicesOverY
             * @memberof x3dom.nodeTypes.ImageTextureAtlas
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'slicesOverY', 0);

        }
    )
);