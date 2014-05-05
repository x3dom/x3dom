/** @namespace x3dom.nodeTypes */
/*
 * MEDX3DOM JavaScript Library
 * http://medx3dom.org
 *
 * (C)2011 Vicomtech Research Center,
 *         Donostia - San Sebastian
 * Dual licensed under the MIT and GPL.
 *
 * Based on code originally provided by
 * http://www.x3dom.org
 */

/* ### X3DComposableVolumeRenderStyleNode ### */
x3dom.registerNodeType(
    "X3DComposableVolumeRenderStyleNode",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeRenderStyleNode,
        
        /**
         * Constructor for X3DComposableVolumeRenderStyleNode
         * @constructs x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DVolumeRenderStyleNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc (Abstract) class for composable volume rendering styles.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode.superClass.call(this, ctx);


            /**
             * The surfaceNormals field allows to provide the normals of the volume data. It takes an ImageTextureAtlas of the same dimensions of the volume data. If it is not provided, it is computed on the fly.
             * @var {x3dom.fields.SFNode} surfaceNormals
             * @memberof x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('surfaceNormals', x3dom.nodeTypes.Texture);
        
        },
        {
        }
    )
);