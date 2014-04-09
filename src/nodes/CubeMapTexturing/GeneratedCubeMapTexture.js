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
        function (ctx) {
            x3dom.nodeTypes.GeneratedCubeMapTexture.superClass.call(this, ctx);

            this.addField_SFInt32(ctx, 'size', 128);
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