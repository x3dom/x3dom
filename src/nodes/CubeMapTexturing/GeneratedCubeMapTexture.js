/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### GeneratedCubeMapTexture ### */
x3dom.registerNodeType(
    "GeneratedCubeMapTexture",
    "CubeMapTexturing",
    defineClass(x3dom.nodeTypes.X3DEnvironmentTextureNode,
        
        /**
         * Constructor for GeneratedCubeMapTexture
         * @constructs x3dom.nodeTypes.GeneratedCubeMapTexture
         * @x3d 3.3
         * @component CubeMapTexturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DEnvironmentTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The GeneratedCubeMapTexture node defines a cubic environment map that sources its data from
         * internally generated images, rendered from a virtual situated perspective in the scene.
         */
        function (ctx) {
            x3dom.nodeTypes.GeneratedCubeMapTexture.superClass.call(this, ctx);


            /**
             * The size field indicates the resolution of the generated images in number of pixels per side.
             * @var {x3dom.fields.SFInt32} size
             * @memberof x3dom.nodeTypes.GeneratedCubeMapTexture
             * @initvalue 128
             * @range (0, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, 'size', 128);

            /**
             * NOT YET IMPLEMENTED:
             * The update field can be used to request a regeneration of the texture. Setting this field to "ALWAYS"
             * will cause the texture to be rendered every frame. A value of "NONE" will stop rendering so that no
             * further updates are performed even if the contained scene graph changes. When the value is set to
             * "NEXT_FRAME_ONLY", it is an instruction to render the texture at the end of this frame, and then not
             * render it again. In this case, the update frame indicator is set to this frame; at the start of the next
             * frame, the update value shall be automatically set back to "NONE" to indicate that the rendering has already taken place.
             * @var {x3dom.fields.SFString} update
             * @memberof x3dom.nodeTypes.GeneratedCubeMapTexture
             * @initvalue 'NONE'
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'update', 'NONE');  // ("NONE"|"NEXT_FRAME_ONLY"|"ALWAYS")

            this._type = "cubeMap";
            x3dom.debug.logWarning("GeneratedCubeMapTexture NYI");   // TODO; impl. in gfx when fbo type ready
        
        },
        {
            getTexSize: function() {
                return this._vf.size;
            }
        }
    )
);