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
         * @extends x3dom.nodeTypes.X3DShaderNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Implements the Blinn-Phong BRDF with normal mapping and a perfect specular component.
         */
        function (ctx) {
            x3dom.nodeTypes.CommonSurfaceShader.superClass.call(this, ctx);


            /**
             * Texture coordinate channel that contains the tangents in u.
             * @var {x3dom.fields.SFInt32} tangentTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'tangentTextureCoordinatesId', -1);

            /**
             * Texture coordinate channel that contains the tangents in v.
             * @var {x3dom.fields.SFInt32} binormalTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'binormalTextureCoordinatesId', -1);

            /**
             * The value of emissiveTexture is multiplied by this value. If no texture is set, the value is used
             *  directly.
             * @var {x3dom.fields.SFVec3f} emissiveFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'emissiveFactor', 0, 0, 0);

            /**
             * The texture unit.
             * @var {x3dom.fields.SFInt32} emissiveTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'emissiveTextureId', -1);

            /**
             * Texture coordinate channel to use for emissiveTexture.
             * @var {x3dom.fields.SFInt32} emissiveTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'emissiveTextureCoordinatesId', 0);

            /**
             * ChannelMask for emissiveTexture in the form of a glsl swizzle (e.g. "rgb", "a").
             * @var {x3dom.fields.SFString} emissiveTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'rgb'
             * @range [rgb,a,..]
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'emissiveTextureChannelMask', 'rgb');

            /**
             * The value of ambientTexture is multiplied by this value. If no texture is set, the value is used
             *  directly.
             * @var {x3dom.fields.SFVec3f} ambientFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0.2,0.2,0.2
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'ambientFactor', 0.2, 0.2, 0.2);

            /**
             * The texture unit.
             * @var {x3dom.fields.SFInt32} ambientTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'ambientTextureId', -1);

            /**
             * Texture coordinate channel to use for ambientTexture.
             * @var {x3dom.fields.SFInt32} ambientTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'ambientTextureCoordinatesId', 0);

            /**
             * ChannelMask for ambientTexture in the form of a glsl swizzle (e.g. "rgb", "a").
             * @var {x3dom.fields.SFString} ambientTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'rgb'
             * @range [rgb,a,..]
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'ambientTextureChannelMask', 'rgb');

            /**
             * The value of diffuseTexture is multiplied by this value. If no texture is set, the value is used
             *  directly.
             * @var {x3dom.fields.SFVec3f} diffuseFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0.8,0.8,0.8
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'diffuseFactor', 0.8, 0.8, 0.8);

            /**
             * The texture unit.
             * @var {x3dom.fields.SFInt32} diffuseTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'diffuseTextureId', -1);

            /**
             * Texture coordinate channel to use for diffuseTexture.
             * @var {x3dom.fields.SFInt32} diffuseTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'diffuseTextureCoordinatesId', 0);

            /**
             * ChannelMask for diffuseTexture in the form of a glsl swizzle (e.g. "rgb", "a").
             * @var {x3dom.fields.SFString} diffuseTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'rgb'
             * @range [rgb,a,..]
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'diffuseTextureChannelMask', 'rgb');

            /**
             * The value of specularTexture is multiplied by this value. If no texture is set, the value is used
             *  directly.
             * @var {x3dom.fields.SFVec3f} specularFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'specularFactor', 0, 0, 0);

            /**
             * The texture unit.
             * @var {x3dom.fields.SFInt32} specularTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'specularTextureId', -1);

            /**
             * Texture coordinate channel to use for specularTexture.
             * @var {x3dom.fields.SFInt32} specularTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'specularTextureCoordinatesId', 0);

            /**
             * ChannelMask for specularTexture in the form of a glsl swizzle (e.g. "rgb", "a").
             * @var {x3dom.fields.SFString} specularTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'rgb'
             * @range [rgb,a,..]
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'specularTextureChannelMask', 'rgb');

            /**
             * The value of shininessTexture is multiplied by this value. If no texture is set, the value is used
             *  directly.
             * @var {x3dom.fields.SFFloat} shininessFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0.2
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'shininessFactor', 0.2);

            /**
             * The texture unit.
             * @var {x3dom.fields.SFInt32} shininessTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'shininessTextureId', -1);

            /**
             * Texture coordinate channel to use for shininessTexture.
             * @var {x3dom.fields.SFInt32} shininessTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'shininessTextureCoordinatesId', 0);

            /**
             * ChannelMask for shininessTexture in the form of a glsl swizzle (e.g. "rgb", "a").
             * @var {x3dom.fields.SFString} shininessTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'a'
             * @range [rgb,a,..]
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'shininessTextureChannelMask', 'a');

            /**
             * How normals are stored in normalTexture. Currently only "UNORM" (each component packed into a
             *  [0,1] color channel) is supported.
             * @var {x3dom.fields.SFString} normalFormat
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'UNORM'
             * @range [UNORM]
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'normalFormat', 'UNORM');

            /**
             * Space in which normals in normalTexture are defined.
             * @var {x3dom.fields.SFString} normalSpace
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'TANGENT'
             * @range [TANGENT, OBJECT]
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'normalSpace', 'TANGENT');

            /**
             * The texture unit.
             * @var {x3dom.fields.SFInt32} normalTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'normalTextureId', -1);

            /**
             * Texture coordinate channel to use for normalTexture.
             * @var {x3dom.fields.SFInt32} normalTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'normalTextureCoordinatesId', 0);

            /**
             * ChannelMask for normalTexture in the form of a glsl swizzle (e.g. "rgb", "a").
             * @var {x3dom.fields.SFString} normalTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'rgb'
             * @range [rgb,a,..]
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'normalTextureChannelMask', 'rgb');

            /**
             * The value of reflectionTexture is multiplied by this value. If no texture is set, the value is used
             *  directly.
             * @var {x3dom.fields.SFVec3f} reflectionFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'reflectionFactor', 0, 0, 0);

            /**
             * The texture unit.
             * @var {x3dom.fields.SFInt32} reflectionTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'reflectionTextureId', -1);

            /**
             * Texture coordinate channel to use for reflectionTexture.
             * @var {x3dom.fields.SFInt32} reflectionTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'reflectionTextureCoordinatesId', 0);

            /**
             * ChannelMask for reflectionTexture in the form of a glsl swizzle (e.g. "rgb", "a").
             * @var {x3dom.fields.SFString} reflectionTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'rgb'
             * @range [rgb,a,..]
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'reflectionTextureChannelMask', 'rgb');

            /**
             * The value of transmissionTexture is multiplied by this value. If no texture is set, the value is used
             *  directly.
             * @var {x3dom.fields.SFVec3f} transmissionFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'transmissionFactor', 0, 0, 0);

            /**
             * The texture unit.
             * @var {x3dom.fields.SFInt32} transmissionTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'transmissionTextureId', -1);

            /**
             * Texture coordinate channel to use for transmissionTexture.
             * @var {x3dom.fields.SFInt32} transmissionTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'transmissionTextureCoordinatesId', 0);

            /**
             * ChannelMask for transmissionTexture in the form of a glsl swizzle (e.g. "rgb", "a").
             * @var {x3dom.fields.SFString} transmissionTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'rgb'
             * @range [rgb,a,..]
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'transmissionTextureChannelMask', 'rgb');

            /**
             * The value of environmentTexture is multiplied by this value. If no texture is set, the value is used
             *  directly.
             * @var {x3dom.fields.SFVec3f} environmentFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 1,1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'environmentFactor', 1, 1, 1);

            /**
             * The texture unit.
             * @var {x3dom.fields.SFInt32} environmentTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'environmentTextureId', -1);

            /**
             * [Currently not used, coordinates are computed in shader.]
             * @var {x3dom.fields.SFInt32} environmentTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'environmentTextureCoordinatesId', 0);

            /**
             * ChannelMask for environmentTexture in the form of a glsl swizzle (e.g. "rgb", "a").
             * @var {x3dom.fields.SFString} environmentTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'rgb'
             * @range [rgb,a,..]
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'environmentTextureChannelMask', 'rgb');

            /**
             * Relative IOR for perfect specular component.
             * @var {x3dom.fields.SFFloat} relativeIndexOfRefraction
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'relativeIndexOfRefraction', 1);

            /**
             * To what degree the Fresnel equation for dielectrics should be used to blend the perfect specular
             *  reflection and transmission.
             * @var {x3dom.fields.SFFloat} fresnelBlend
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'fresnelBlend', 0);

            /**
             * Axis along which the vertices are displacement
             * @var {x3dom.fields.SFString} displacementAxis
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'y'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'displacementAxis', 'y');

            /**
             * Factor for the displacement.
             * @var {x3dom.fields.SFFloat} displacementFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 255.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'displacementFactor', 255.0);

            /**
             * The texture unit.
             * @var {x3dom.fields.SFInt32} displacementTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'displacementTextureId', -1);

            /**
             * Texture coordinate channel to use for displacementTexture.
             * @var {x3dom.fields.SFInt32} displacementTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'displacementTextureCoordinatesId', 0);

            /**
             * Texture containing emissive component.
             * @var {x3dom.fields.SFNode} emissiveTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('emissiveTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * Texture containing ambient component.
             * @var {x3dom.fields.SFNode} ambientTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('ambientTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * Texture containing diffuse component.
             * @var {x3dom.fields.SFNode} diffuseTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('diffuseTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * Texture containing specular component.
             * @var {x3dom.fields.SFNode} specularTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('specularTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * Texture containing shininess component.
             * @var {x3dom.fields.SFNode} shininessTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('shininessTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * Texture containing normal component for normal mapping.
             * @var {x3dom.fields.SFNode} normalTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('normalTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * Texture containing reflection component.
             * @var {x3dom.fields.SFNode} reflectionTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('reflectionTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * Texture containing transmission component.
             * @var {x3dom.fields.SFNode} transmissionTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('transmissionTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * Cube texture containing the environment for perfect specular reflection and transmission.
             * @var {x3dom.fields.SFNode} environmentTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('environmentTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * Texture containing displacement component.
             * @var {x3dom.fields.SFNode} displacementTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('displacementTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * Texture containing diffuse displacement component.
             * @var {x3dom.fields.SFNode} diffuseDisplacementTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('diffuseDisplacementTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * Multi diffuse alpha texture.
             * @var {x3dom.fields.SFNode} multiDiffuseAlphaTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('multiDiffuseAlphaTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * Multi specular shininess texture.
             * @var {x3dom.fields.SFNode} multiSpecularShininessTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('multiSpecularShininessTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * Multi emissive ambientIntensity texture.
             * @var {x3dom.fields.SFNode} multiEmmisiveAmbientIntensityTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('multiEmissiveAmbientTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * Multi visibility texture.
             * @var {x3dom.fields.SFNode} multiVisibilityTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('multiVisibilityTexture', x3dom.nodeTypes.X3DTextureNode);


            //this.addField_MFBool(ctx, 'textureTransformEnabled', []);     // MFBool NYI

            /**
             * scale to apply to normal sampled from normalTexture
             * @var {x3dom.fields.SFVec3f} normalScale
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 2,2,2
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'normalScale', 2, 2, 2);

            /**
             * Bias to apply to normal sampled from normalTexture
             * @var {x3dom.fields.SFVec3f} normalBias
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1,-1,-1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'normalBias', -1, -1, -1);

            /**
             * The value of alphaTexture is multiplied by this value. If no texture is set, the value is used directly.
             * @var {x3dom.fields.SFFloat} alphaFactor
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'alphaFactor', 1);

            /**
             * If true, (1-sampledValue) is used as alpha. If false the sampled value is used.
             * @var {x3dom.fields.SFBool} invertAlphaTexture
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'invertAlphaTexture', false);

            /**
             * The texture unit.
             * @var {x3dom.fields.SFInt32} alphaTextureId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'alphaTextureId', -1);

            /**
             * Texture coordinate channel to use for alphaTexture.
             * @var {x3dom.fields.SFInt32} alphaTextureCoordinatesId
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'alphaTextureCoordinatesId', 0);

            /**
             * ChannelMask for alphaTexture in the form of a glsl swizzle (e.g. "rgb", "a").
             * @var {x3dom.fields.SFString} alphaTextureChannelMask
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 'a'
             * @range [a,rgb,..]
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'alphaTextureChannelMask', 'a');

            /**
             * Texture containing alpha component.
             * @var {x3dom.fields.SFNode} alphaTexture
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
                    if (x3dom.isa(this._cf.diffuseTexture.node, x3dom.nodeTypes.SurfaceShaderTexture)) {
                        this._cf.diffuseTexture.node._cf.texture.node._type = "diffuseMap";
                        return this._cf.diffuseTexture.node._cf.texture.node;
                    } else {
                        this._cf.diffuseTexture.node._type = "diffuseMap";
                        return this._cf.diffuseTexture.node;
                    }
                } else {
                    return null;
                }
            },

            getEnvironmentMap: function()
            {
                if(this._cf.environmentTexture.node) {
                    if (x3dom.isa(this._cf.environmentTexture.node, x3dom.nodeTypes.SurfaceShaderTexture)) {
                        this._cf.environmentTexture.node._cf.texture.node._type = "environmentMap";
                        return this._cf.environmentTexture.node._cf.texture.node;
                    } else {
                        this._cf.environmentTexture.node._type = "environmentMap";
                        return this._cf.environmentTexture.node;
                    }
                } else {
                    return null;
                }
            },

            getNormalMap: function()
            {
                if(this._cf.normalTexture.node) {
                    if (x3dom.isa(this._cf.normalTexture.node, x3dom.nodeTypes.SurfaceShaderTexture)) {
                        this._cf.normalTexture.node._cf.texture.node._type = "normalMap";
                        return this._cf.normalTexture.node._cf.texture.node;
                    } else {
                        this._cf.normalTexture.node._type = "normalMap";
                        return this._cf.normalTexture.node;
                    }
                } else {
                    return null;
                }
            },

            getAmbientMap: function()
            {
                if(this._cf.ambientTexture.node) {
                    if (x3dom.isa(this._cf.ambientTexture.node, x3dom.nodeTypes.SurfaceShaderTexture)) {
                        this._cf.ambientTexture.node._cf.texture.node._type = "ambientMap";
                        return this._cf.ambientTexture.node._cf.texture.node;
                    } else {
                        this._cf.ambientTexture.node._type = "ambientMap";
                        return this._cf.ambientTexture.node;
                    }
                } else {
                    return null;
                }
            },

            getSpecularMap: function()
            {
                if(this._cf.specularTexture.node) {
                    if (x3dom.isa(this._cf.specularTexture.node, x3dom.nodeTypes.SurfaceShaderTexture)) {
                        this._cf.specularTexture.node._cf.texture.node._type = "specularMap";
                        return this._cf.specularTexture.node._cf.texture.node;
                    } else {
                        this._cf.specularTexture.node._type = "specularMap";
                        return this._cf.specularTexture.node;
                    }
                } else {
                    return null;
                }
            },

            getShininessMap: function()
            {
                if(this._cf.shininessTexture.node) {
                    if (x3dom.isa(this._cf.shininessTexture.node, x3dom.nodeTypes.SurfaceShaderTexture)) {
                        this._cf.shininessTexture.node._cf.texture.node._type = "shininessMap";
                        return this._cf.shininessTexture.node._cf.texture.node;
                    } else {
                        this._cf.shininessTexture.node._type = "shininessMap";
                        return this._cf.shininessTexture.node;
                    }
                } else {
                    return null;
                }
            },

            getAlphaMap: function()
            {
                if(this._cf.alphaTexture.node) {
                    if (x3dom.isa(this._cf.alphaTexture.node, x3dom.nodeTypes.SurfaceShaderTexture)) {
                        this._cf.alphaTexture.node._cf.texture.node._type = "alphaMap";
                        return this._cf.alphaTexture.node._cf.texture.node;
                    } else {
                        this._cf.alphaTexture.node._type = "alphaMap";
                        return this._cf.alphaTexture.node;
                    }
                } else {
                    return null;
                }
            },

            getDisplacementMap: function()
            {
                if(this._cf.displacementTexture.node) {
                    if (x3dom.isa(this._cf.displacementTexture.node, x3dom.nodeTypes.SurfaceShaderTexture)) {
                        this._cf.displacementTexture.node._cf.texture.node._type = "displacementMap";
                        return this._cf.displacementTexture.node._cf.texture.node;
                    } else {
                        this._cf.displacementTexture.node._type = "displacementMap";
                        return this._cf.displacementTexture.node;
                    }
                } else {
                    return null;
                }
            },

            getDiffuseDisplacementMap: function()
            {
                if(this._cf.diffuseDisplacementTexture.node) {
                    if (x3dom.isa(this._cf.diffuseDisplacementTexture.node, x3dom.nodeTypes.SurfaceShaderTexture)) {
                        this._cf.diffuseDisplacementTexture.node._cf.texture.node._type = "diffuseDisplacementMap";
                        return this._cf.diffuseDisplacementTexture.node._cf.texture.node;
                    } else {
                        this._cf.diffuseDisplacementTexture.node._type = "diffuseDisplacementMap";
                        return this._cf.diffuseDisplacementTexture.node;
                    }
                } else {
                    return null;
                }
            },

            getMultiDiffuseAlphaMap: function()
            {
                if(this._cf.multiDiffuseAlphaTexture.node) {
                    if (x3dom.isa(this._cf.multiDiffuseAlphaTexture.node, x3dom.nodeTypes.SurfaceShaderTexture)) {
                        this._cf.multiDiffuseAlphaTexture.node._cf.texture.node._type = "multiDiffuseAlphaMap";
                        return this._cf.multiDiffuseAlphaTexture.node._cf.texture.node;
                    } else {
                        this._cf.multiDiffuseAlphaTexture.node._type = "multiDiffuseAlphaMap";
                        return this._cf.multiDiffuseAlphaTexture.node;
                    }
                } else {
                    return null;
                }
            },

            getMultiEmissiveAmbientMap: function()
            {
                if(this._cf.multiEmissiveAmbientTexture.node) {
                    if (x3dom.isa(this._cf.multiEmissiveAmbientTexture.node, x3dom.nodeTypes.SurfaceShaderTexture)) {
                        this._cf.multiEmissiveAmbientTexture.node._cf.texture.node._type = "multiEmissiveAmbientMap";
                        return this._cf.multiEmissiveAmbientTexture.node._cf.texture.node;
                    } else {
                        this._cf.multiEmissiveAmbientTexture.node._type = "multiEmissiveAmbientMap";
                        return this._cf.multiEmissiveAmbientTexture.node;
                    }
                } else {
                    return null;
                }
            },

            getMultiSpecularShininessMap: function()
            {
                if(this._cf.multiSpecularShininessTexture.node) {
                    if (x3dom.isa(this._cf.multiSpecularShininessTexture.node, x3dom.nodeTypes.SurfaceShaderTexture)) {
                        this._cf.multiSpecularShininessTexture.node._cf.texture.node._type = "multiSpecularShininessMap";
                        return this._cf.multiSpecularShininessTexture.node._cf.texture.node;
                    } else {
                        this._cf.multiSpecularShininessTexture.node._type = "multiSpecularShininessMap";
                        return this._cf.multiSpecularShininessTexture.node;
                    }
                } else {
                    return null;
                }
            },

            getMultiVisibilityMap: function()
            {
                if(this._cf.multiVisibilityTexture.node) {
                    if (x3dom.isa(this._cf.multiVisibilityTexture.node, x3dom.nodeTypes.SurfaceShaderTexture)) {
                        this._cf.multiVisibilityTexture.node._cf.texture.node._type = "multiVisibilityMap";
                        return this._cf.multiVisibilityTexture.node._cf.texture.node;
                    } else {
                        this._cf.multiVisibilityTexture.node._type = "multiVisibilityMap";
                        return this._cf.multiVisibilityTexture.node;
                    }
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

                var shin = this.getShininessMap();
                if(shin) textures.push(shin);

                var env = this.getEnvironmentMap();
                if(env) textures.push(env);

                var displacement = this.getDisplacementMap();
                if(displacement) textures.push(displacement);

                var diffuseDisplacement = this.getDiffuseDisplacementMap();
                if(diffuseDisplacement) textures.push(diffuseDisplacement);

                var multiDiffuseAlpha = this.getMultiDiffuseAlphaMap();
                if(multiDiffuseAlpha) textures.push(multiDiffuseAlpha);

                var multiEmissiveAmbient = this.getMultiEmissiveAmbientMap();
                if(multiEmissiveAmbient) textures.push(multiEmissiveAmbient);

                var multiSpecularShininess = this.getMultiSpecularShininessMap();
                if(multiSpecularShininess) textures.push(multiSpecularShininess);

                var multiVisibility = this.getMultiVisibilityMap();
                if(multiVisibility) textures.push(multiVisibility);

                return textures;
            },

            needTexcoords: function()
            {

               return ( this.getDiffuseMap()      || this.getNormalMap()    ||
                        this.getSpecularMap()     || this.getShininessMap() ||
                        this.getDisplacementMap() || this.getDiffuseDisplacementMap() ||
                        this.getEnvironmentMap() ) ? true : false;

            }
        }
    )
);