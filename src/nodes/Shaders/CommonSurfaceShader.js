/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### CommonSurfaceShader ### */
x3dom.registerNodeType(
    "CommonSurfaceShader",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DShaderNode,
        function (ctx) {
            x3dom.nodeTypes.CommonSurfaceShader.superClass.call(this, ctx);

            this.addField_SFInt32(ctx, 'tangentTextureCoordinatesId', -1);
            this.addField_SFInt32(ctx, 'binormalTextureCoordinatesId', -1);
            this.addField_SFVec3f(ctx, 'emissiveFactor', 0, 0, 0);
            this.addField_SFInt32(ctx, 'emissiveTextureId', -1);
            this.addField_SFInt32(ctx, 'emissiveTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'emissiveTextureChannelMask', 'rgb');
            this.addField_SFVec3f(ctx, 'ambientFactor', 0.2, 0.2, 0.2);
            this.addField_SFInt32(ctx, 'ambientTextureId', -1);
            this.addField_SFInt32(ctx, 'ambientTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'ambientTextureChannelMask', 'rgb');
            this.addField_SFVec3f(ctx, 'diffuseFactor', 0.8, 0.8, 0.8);
            this.addField_SFInt32(ctx, 'diffuseTextureId', -1);
            this.addField_SFInt32(ctx, 'diffuseTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'diffuseTextureChannelMask', 'rgb');
            this.addField_SFVec3f(ctx, 'specularFactor', 0, 0, 0);
            this.addField_SFInt32(ctx, 'specularTextureId', -1);
            this.addField_SFInt32(ctx, 'specularTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'specularTextureChannelMask', 'rgb');
            this.addField_SFFloat(ctx, 'shininessFactor', 0.2);
            this.addField_SFInt32(ctx, 'shininessTextureId', -1);
            this.addField_SFInt32(ctx, 'shininessTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'shininessTextureChannelMask', 'a');
            this.addField_SFString(ctx, 'normalFormat', 'UNORM');
            this.addField_SFString(ctx, 'normalSpace', 'TANGENT');
            this.addField_SFInt32(ctx, 'normalTextureId', -1);
            this.addField_SFInt32(ctx, 'normalTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'normalTextureChannelMask', 'rgb');
            this.addField_SFVec3f(ctx, 'reflectionFactor', 0, 0, 0);
            this.addField_SFInt32(ctx, 'reflectionTextureId', -1);
            this.addField_SFInt32(ctx, 'reflectionTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'reflectionTextureChannelMask', 'rgb');
            this.addField_SFVec3f(ctx, 'transmissionFactor', 0, 0, 0);
            this.addField_SFInt32(ctx, 'transmissionTextureId', -1);
            this.addField_SFInt32(ctx, 'transmissionTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'transmissionTextureChannelMask', 'rgb');
            this.addField_SFVec3f(ctx, 'environmentFactor', 1, 1, 1);
            this.addField_SFInt32(ctx, 'environmentTextureId', -1);
            this.addField_SFInt32(ctx, 'environmentTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'environmentTextureChannelMask', 'rgb');
            this.addField_SFFloat(ctx, 'relativeIndexOfRefraction', 1);
            this.addField_SFFloat(ctx, 'fresnelBlend', 0);
            this.addField_SFString(ctx, 'displacementAxis', 'y');
            this.addField_SFFloat(ctx, 'displacementFactor', 255.0);
            this.addField_SFInt32(ctx, 'displacementTextureId', -1);
            this.addField_SFInt32(ctx, 'displacementTextureCoordinatesId', 0);
            this.addField_SFNode('emissiveTexture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('ambientTexture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('diffuseTexture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('specularTexture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('shininessTexture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('normalTexture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('reflectionTexture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('transmissionTexture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('environmentTexture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('displacementTexture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('diffuseDisplacementTexture', x3dom.nodeTypes.X3DTextureNode);
            //this.addField_MFBool(ctx, 'textureTransformEnabled', []);     // MFBool NYI
            this.addField_SFVec3f(ctx, 'normalScale', 2, 2, 2);
            this.addField_SFVec3f(ctx, 'normalBias', -1, -1, -1);
            this.addField_SFFloat(ctx, 'alphaFactor', 1);
            this.addField_SFBool(ctx, 'invertAlphaTexture', false);
            this.addField_SFInt32(ctx, 'alphaTextureId', -1);
            this.addField_SFInt32(ctx, 'alphaTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'alphaTextureChannelMask', 'a');
            this.addField_SFNode('alphaTexture', x3dom.nodeTypes.X3DTextureNode);

            this._dirty = {
                // TODO; cp. Shape, allow for dynamic texture updates in gfx
            };
        },
        {
            getDiffuseMap: function()
            {
                if(this._cf.diffuseTexture.node) {
                    this._cf.diffuseTexture.node._cf.texture.node._type = "diffuseMap";
                    return this._cf.diffuseTexture.node._cf.texture.node;
                } else {
                    return null;
                }
            },

            getNormalMap: function()
            {
                if(this._cf.normalTexture.node) {
                    this._cf.normalTexture.node._cf.texture.node._type = "normalMap";
                    return this._cf.normalTexture.node._cf.texture.node;
                } else {
                    return null;
                }
            },

            getAmbientMap: function()
            {
                if(this._cf.ambientTexture.node) {
                    this._cf.ambientTexture.node._cf.texture.node._type = "ambientMap";
                    return this._cf.ambientTexture.node._cf.texture.node;
                } else {
                    return null;
                }
            },

            getSpecularMap: function()
            {
                if(this._cf.specularTexture.node) {
                    this._cf.specularTexture.node._cf.texture.node._type = "specularMap";
                    return this._cf.specularTexture.node._cf.texture.node;
                } else {
                    return null;
                }
            },

            getShininessMap: function()
            {
                if(this._cf.shininessTexture.node) {
                    this._cf.shininessTexture.node._cf.texture.node._type = "shininessMap";
                    return this._cf.shininessTexture.node._cf.texture.node;
                } else {
                    return null;
                }
            },

            getAlphaMap: function()
            {
                if(this._cf.alphaTexture.node) {
                    this._cf.alphaTexture.node._cf.texture.node._type = "alphaMap";
                    return this._cf.alphaTexture.node._cf.texture.node;
                } else {
                    return null;
                }
            },

            getDisplacementMap: function()
            {
                if(this._cf.displacementTexture.node) {
                    this._cf.displacementTexture.node._cf.texture.node._type = "displacementMap";
                    return this._cf.displacementTexture.node._cf.texture.node;
                } else {
                    return null;
                }
            },

            getDiffuseDisplacementMap: function()
            {
                if(this._cf.diffuseDisplacementTexture.node) {
                    this._cf.diffuseDisplacementTexture.node._cf.texture.node._type = "diffuseDisplacementMap";
                    return this._cf.diffuseDisplacementTexture.node._cf.texture.node;
                } else {
                    return null;
                }
            },

            getTextures: function()
            {
                var textures = [];

                var diff = this.getDiffuseMap();
                if(diff) textures.push(diff);

                var norm = this.getNormalMap();
                if(norm) textures.push(norm);

                var spec = this.getSpecularMap();
                if(spec) textures.push(spec);

                var displacement = this.getDisplacementMap();
                if(displacement) textures.push(displacement);

                var diffuseDisplacement = this.getDiffuseDisplacementMap();
                if(diffuseDisplacement) textures.push(diffuseDisplacement);

                return textures;
            }
        }
    )
);