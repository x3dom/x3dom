/** @namespace x3dom.nodeTypes */
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
        
        /**
         * Constructor for CommonSurfaceShader
         * @constructs x3dom.nodeTypes.CommonSurfaceShader
         * @x3d x.x
         * @component Shaders
         * @status experimental
         * @extends x3dom.nodeTypes.X3DShaderNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.CommonSurfaceShader.superClass.call(this, ctx);


            /**
             *
             * @var {SFInt32} tangentTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'tangentTextureCoordinatesId', -1);

            /**
             *
             * @var {SFInt32} binormalTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'binormalTextureCoordinatesId', -1);

            /**
             *
             * @var {SFVec3f} emissiveFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'emissiveFactor', 0, 0, 0);

            /**
             *
             * @var {SFInt32} emissiveTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'emissiveTextureId', -1);

            /**
             *
             * @var {SFInt32} emissiveTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'emissiveTextureCoordinatesId', 0);

            /**
             *
             * @var {SFString} emissiveTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'rgb'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'emissiveTextureChannelMask', 'rgb');

            /**
             *
             * @var {SFVec3f} ambientFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0.2,0.2,0.2
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'ambientFactor', 0.2, 0.2, 0.2);

            /**
             *
             * @var {SFInt32} ambientTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'ambientTextureId', -1);

            /**
             *
             * @var {SFInt32} ambientTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'ambientTextureCoordinatesId', 0);

            /**
             *
             * @var {SFString} ambientTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'rgb'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'ambientTextureChannelMask', 'rgb');

            /**
             *
             * @var {SFVec3f} diffuseFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0.8,0.8,0.8
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'diffuseFactor', 0.8, 0.8, 0.8);

            /**
             *
             * @var {SFInt32} diffuseTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'diffuseTextureId', -1);

            /**
             *
             * @var {SFInt32} diffuseTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'diffuseTextureCoordinatesId', 0);

            /**
             *
             * @var {SFString} diffuseTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'rgb'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'diffuseTextureChannelMask', 'rgb');

            /**
             *
             * @var {SFVec3f} specularFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'specularFactor', 0, 0, 0);

            /**
             *
             * @var {SFInt32} specularTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'specularTextureId', -1);

            /**
             *
             * @var {SFInt32} specularTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'specularTextureCoordinatesId', 0);

            /**
             *
             * @var {SFString} specularTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'rgb'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'specularTextureChannelMask', 'rgb');

            /**
             *
             * @var {SFFloat} shininessFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0.2
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'shininessFactor', 0.2);

            /**
             *
             * @var {SFInt32} shininessTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'shininessTextureId', -1);

            /**
             *
             * @var {SFInt32} shininessTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'shininessTextureCoordinatesId', 0);

            /**
             *
             * @var {SFString} shininessTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'a'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'shininessTextureChannelMask', 'a');

            /**
             *
             * @var {SFString} normalFormat
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'UNORM'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'normalFormat', 'UNORM');

            /**
             *
             * @var {SFString} normalSpace
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'TANGENT'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'normalSpace', 'TANGENT');

            /**
             *
             * @var {SFInt32} normalTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'normalTextureId', -1);

            /**
             *
             * @var {SFInt32} normalTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'normalTextureCoordinatesId', 0);

            /**
             *
             * @var {SFString} normalTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'rgb'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'normalTextureChannelMask', 'rgb');

            /**
             *
             * @var {SFVec3f} reflectionFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'reflectionFactor', 0, 0, 0);

            /**
             *
             * @var {SFInt32} reflectionTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'reflectionTextureId', -1);

            /**
             *
             * @var {SFInt32} reflectionTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'reflectionTextureCoordinatesId', 0);

            /**
             *
             * @var {SFString} reflectionTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'rgb'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'reflectionTextureChannelMask', 'rgb');

            /**
             *
             * @var {SFVec3f} transmissionFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'transmissionFactor', 0, 0, 0);

            /**
             *
             * @var {SFInt32} transmissionTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'transmissionTextureId', -1);

            /**
             *
             * @var {SFInt32} transmissionTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'transmissionTextureCoordinatesId', 0);

            /**
             *
             * @var {SFString} transmissionTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'rgb'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'transmissionTextureChannelMask', 'rgb');

            /**
             *
             * @var {SFVec3f} environmentFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 1,1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'environmentFactor', 1, 1, 1);

            /**
             *
             * @var {SFInt32} environmentTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'environmentTextureId', -1);

            /**
             *
             * @var {SFInt32} environmentTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'environmentTextureCoordinatesId', 0);

            /**
             *
             * @var {SFString} environmentTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'rgb'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'environmentTextureChannelMask', 'rgb');

            /**
             *
             * @var {SFFloat} relativeIndexOfRefraction
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'relativeIndexOfRefraction', 1);

            /**
             *
             * @var {SFFloat} fresnelBlend
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'fresnelBlend', 0);

            /**
             *
             * @var {SFString} displacementAxis
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'y'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'displacementAxis', 'y');

            /**
             *
             * @var {SFFloat} displacementFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 255.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'displacementFactor', 255.0);

            /**
             *
             * @var {SFInt32} displacementTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'displacementTextureId', -1);

            /**
             *
             * @var {SFInt32} displacementTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'displacementTextureCoordinatesId', 0);

            /**
             *
             * @var {SFNode} emissiveTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('emissiveTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             *
             * @var {SFNode} ambientTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('ambientTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             *
             * @var {SFNode} diffuseTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('diffuseTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             *
             * @var {SFNode} specularTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('specularTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             *
             * @var {SFNode} shininessTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('shininessTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             *
             * @var {SFNode} normalTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('normalTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             *
             * @var {SFNode} reflectionTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('reflectionTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             *
             * @var {SFNode} transmissionTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('transmissionTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             *
             * @var {SFNode} environmentTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('environmentTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             *
             * @var {SFNode} displacementTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('displacementTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             *
             * @var {SFNode} diffuseDisplacementTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('diffuseDisplacementTexture', x3dom.nodeTypes.X3DTextureNode);
            //this.addField_MFBool(ctx, 'textureTransformEnabled', []);     // MFBool NYI

            /**
             *
             * @var {SFVec3f} normalScale
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 2,2,2
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'normalScale', 2, 2, 2);

            /**
             *
             * @var {SFVec3f} normalBias
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1,-1,-1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'normalBias', -1, -1, -1);

            /**
             *
             * @var {SFFloat} alphaFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'alphaFactor', 1);

            /**
             *
             * @var {SFBool} invertAlphaTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'invertAlphaTexture', false);

            /**
             *
             * @var {SFInt32} alphaTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'alphaTextureId', -1);

            /**
             *
             * @var {SFInt32} alphaTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'alphaTextureCoordinatesId', 0);

            /**
             *
             * @var {SFString} alphaTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'a'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'alphaTextureChannelMask', 'a');

            /**
             *
             * @var {SFNode} alphaTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
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