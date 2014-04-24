/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### TextureProperties ### */
x3dom.registerNodeType(
    "TextureProperties",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DNode,
        
        /**
         * Constructor for TextureProperties
         * @constructs x3dom.nodeTypes.TextureProperties
         * @x3d 3.3
         * @component Texturing
         * @status full
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc TextureProperties allows fine control over a texture's application.
         * This node can be used to set the texture properties for a node with a textureProperties field.
         * A texture with a TextureProperties node will ignore the repeatS and repeatT fields on the texture.
         */
        function (ctx) {
            x3dom.nodeTypes.TextureProperties.superClass.call(this, ctx);


            /**
             * The anisotropicDegree field describes the minimum degree of anisotropy to account for in texture filtering.
             * A value of 1 implies no anisotropic filtering.
             * Values above the system's maximum supported value will be clamped to the maximum allowed.
             * @var {x3dom.fields.SFFloat} anisotropicDegree
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue 1.0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'anisotropicDegree', 1.0);

            /**
             * The borderColor field describes the color to use for border pixels.
             * @var {x3dom.fields.SFColorRGBA} borderColor
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue 0,0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFColorRGBA(ctx, 'borderColor', 0, 0, 0, 0);

            /**
             * The borderWidth field describes the number of pixels to use for a texture border.
             * @var {x3dom.fields.SFInt32} borderWidth
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, 'borderWidth', 0);

            /**
             * The boundaryModeS field describes the way S texture coordinate boundaries are handled.
             * @var {x3dom.fields.SFString} boundaryModeS
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue "REPEAT"
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'boundaryModeS', "REPEAT");

            /**
             * The boundaryModeS field describes the way T texture coordinate boundaries are handled.
             * @var {x3dom.fields.SFString} boundaryModeT
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue "REPEAT"
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'boundaryModeT', "REPEAT");

            /**
             * The boundaryModeS field describes the way R texture coordinate boundaries are handled.
             * This field only applies to three dimensional textures and shall be ignored by other texture types.
             * @var {x3dom.fields.SFString} boundaryModeR
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue "REPEAT"
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'boundaryModeR', "REPEAT");

            /**
             * The magnificationFilter field describes the way textures are filtered when the image is smaller than the screen space representation.
             * @var {x3dom.fields.SFString} magnificationFilter
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue "FASTEST"
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'magnificationFilter', "FASTEST");

            /**
             * The minificationFilter field describes the way textures are filtered when the image is larger than the screen space representation.
             * Modes with MIPMAP in the name require mipmaps. If mipmaps are not provided, the mode shall pick the corresponding non-mipmapped mode
             * @var {x3dom.fields.SFString} minificationFilter
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue "FASTEST"
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'minificationFilter', "FASTEST");

            /**
             * The textureCompression field specifies the preferred image compression method to be used during rendering.
             * @var {x3dom.fields.SFString} textureCompression
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue "FASTEST"
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'textureCompression', "FASTEST");

            /**
             * The texturePriority field describes the texture residence priority for allocating texture memory. Zero indicates the lowest priority and 1 indicates the highest priority.
             * @var {x3dom.fields.SFFloat} texturePriority
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'texturePriority', 0);

            /**
             * The generateMipMaps field describes whether mipmaps should be generated for the texture. Mipmaps are required for filtering modes with MIPMAP in their value.
             * @var {x3dom.fields.SFBool} generateMipMaps
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'generateMipMaps', false);
        
        },
        {
            fieldChanged: function(fieldName)
            {
                if (this._vf.hasOwnProperty(fieldName)) {
                    Array.forEach(this._parentNodes, function (texture) {
                        Array.forEach(texture._parentNodes, function (app) {
                            Array.forEach(app._parentNodes, function (shape) {
                                shape._dirty.texture = true;
                            });
                        });
                    });

                    this._nameSpace.doc.needRender = true;
                }
            }
        }
    )
);