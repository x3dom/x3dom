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
        function (ctx) {
            x3dom.nodeTypes.TextureProperties.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'anisotropicDegree', 1.0);
            this.addField_SFColorRGBA(ctx, 'borderColor', 0, 0, 0, 0);
            this.addField_SFInt32(ctx, 'borderWidth', 0);
            this.addField_SFString(ctx, 'boundaryModeS', "REPEAT");
            this.addField_SFString(ctx, 'boundaryModeT', "REPEAT");
            this.addField_SFString(ctx, 'boundaryModeR', "REPEAT");
            this.addField_SFString(ctx, 'magnificationFilter', "FASTEST");
            this.addField_SFString(ctx, 'minificationFilter', "FASTEST");
            this.addField_SFString(ctx, 'textureCompression', "FASTEST");
            this.addField_SFFloat(ctx, 'texturePriority', 0);
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