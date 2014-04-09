/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DVolumeDataNode ### */
x3dom.registerNodeType(
    "X3DVolumeDataNode",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DShapeNode,   // changed inheritance!
        function (ctx) {
            x3dom.nodeTypes.X3DVolumeDataNode.superClass.call(this, ctx);

            this.addField_SFVec3f(ctx, 'dimensions', 1, 1, 1);
            this.addField_SFNode('voxels', x3dom.nodeTypes.Texture);
            //this.addField_MFNode('voxels', x3dom.nodeTypes.X3DTexture3DNode);
            //this.addField_SFBool(ctx, 'swapped', false);
            //this.addField_SFVec3f(ctx, 'sliceThickness', 1, 1, 1);

            //Neccesary for counting the textures which are added on each style, number of textures can be variable
            this._textureID = 0;

            x3dom.debug.logWarning('VolumeRendering component NYI!!!');
        },
        {
            getTextureSize: function(texture) {
                var size = { w: 0, h: 0, valid: false };
                var texBag = this._webgl ? this._webgl.texture : null;
                var t, n = (texture && texBag) ? texBag.length : 0;

                for (t=0; t<n; t++) {
                    if (texture == texBag[t].node && texBag[t].texture) {
                        size.w = texBag[t].texture.width;
                        size.h = texBag[t].texture.height;
                        if (size.w && size.h) {
                            size.valid = true;
                        }
                        break;
                    }
                }

                return size;
            }
        }
    )
);