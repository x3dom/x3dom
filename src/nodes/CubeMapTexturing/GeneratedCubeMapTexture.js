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
         * @x3d x.x
         * @component CubeMapTexturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DEnvironmentTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.GeneratedCubeMapTexture.superClass.call(this, ctx);


            /**
             *
             * @var {SFInt32} size
             * @memberof x3dom.nodeTypes.GeneratedCubeMapTexture
             * @initvalue 128
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'size', 128);

            /**
             *
             * @var {SFString} update
             * @memberof x3dom.nodeTypes.GeneratedCubeMapTexture
             * @initvalue 'NONE'
             * @field x3dom
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