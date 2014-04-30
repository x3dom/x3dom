/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */


/* ### Uniform ### */
x3dom.registerNodeType(
    "Uniform",
    "Shaders",
    defineClass(x3dom.nodeTypes.Field,
        
        /**
         * Constructor for Uniform
         * @constructs x3dom.nodeTypes.Uniform
         * @x3d x.x
         * @component Shaders
         * @status experimental
         * @extends x3dom.nodeTypes.Field
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Uniform.superClass.call(this, ctx);
        
        }
    )
);

/* ### SurfaceShaderTexture ### */
x3dom.registerNodeType(
    "SurfaceShaderTexture",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
        
        /**
         * Constructor for SurfaceShaderTexture
         * @constructs x3dom.nodeTypes.SurfaceShaderTexture
         * @x3d x.x
         * @component Shaders
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.SurfaceShaderTexture.superClass.call(this, ctx);


            /**
             *
             * @var {SFInt32} textureCoordinatesId
             * @memberof x3dom.nodeTypes.SurfaceShaderTexture
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'textureCoordinatesId', 0);

            /**
             *
             * @var {SFString} channelMask
             * @memberof x3dom.nodeTypes.SurfaceShaderTexture
             * @initvalue "DEFAULT"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'channelMask', "DEFAULT");

            /**
             *
             * @var {SFBool} isSRGB
             * @memberof x3dom.nodeTypes.SurfaceShaderTexture
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'isSRGB', false);

            /**
             *
             * @var {SFNode} texture
             * @memberof x3dom.nodeTypes.SurfaceShaderTexture
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('texture', x3dom.nodeTypes.X3DTextureNode);

            /**
             *
             * @var {SFNode} textureTransform
             * @memberof x3dom.nodeTypes.SurfaceShaderTexture
             * @initvalue x3dom.nodeTypes.X3DTextureTransformNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('textureTransform', x3dom.nodeTypes.X3DTextureTransformNode);
        
        }
    )
);

/* ### X3DShaderNode ### */
x3dom.registerNodeType(
    "X3DShaderNode",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        
        /**
         * Constructor for X3DShaderNode
         * @constructs x3dom.nodeTypes.X3DShaderNode
         * @x3d x.x
         * @component Shaders
         * @status experimental
         * @extends x3dom.nodeTypes.X3DAppearanceChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DShaderNode.superClass.call(this, ctx);


            /**
             *
             * @var {SFString} language
             * @memberof x3dom.nodeTypes.X3DShaderNode
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'language', "");
        
        }
    )
);

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

/* ### ComposedShader ### */
x3dom.registerNodeType(
    "ComposedShader",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DShaderNode,
        
        /**
         * Constructor for ComposedShader
         * @constructs x3dom.nodeTypes.ComposedShader
         * @x3d x.x
         * @component Shaders
         * @status experimental
         * @extends x3dom.nodeTypes.X3DShaderNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.ComposedShader.superClass.call(this, ctx);


            /**
             *
             * @var {MFNode} fields
             * @memberof x3dom.nodeTypes.ComposedShader
             * @initvalue x3dom.nodeTypes.Field
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('fields', x3dom.nodeTypes.Field);

            /**
             *
             * @var {MFNode} parts
             * @memberof x3dom.nodeTypes.ComposedShader
             * @initvalue x3dom.nodeTypes.ShaderPart
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('parts', x3dom.nodeTypes.ShaderPart);

            // shortcut to shader parts
            this._vertex = null;
            this._fragment = null;
            this._id = null;

            if (!x3dom.nodeTypes.ComposedShader.ShaderInfoMsgShown) {
                x3dom.debug.logInfo("Current ComposedShader node implementation limitations:\n" +
                    "Vertex attributes (if given in the standard X3D fields 'coord', 'color', " +
                    "'normal', 'texCoord'), matrices and texture are provided as follows...\n" +
                    "(see also <a href='http://x3dom.org/x3dom/doc/help/composedShader.html'>" +
                    "http://x3dom.org/x3dom/doc/help/composedShader.html</a>)\n" +
                    "    attribute vec3 position;\n" +
                    "    attribute vec3 normal;\n" +
                    "    attribute vec2 texcoord;\n" +
                    "    attribute vec3 color;\n" +
                    "    uniform mat4 modelViewProjectionMatrix;\n" +
                    "    uniform mat4 modelViewMatrix;\n" +
					"    uniform mat4 normalMatrix;\n" +
					"    uniform mat4 viewMatrix;\n" +
                    "    uniform sampler2D tex;\n");
                x3dom.nodeTypes.ComposedShader.ShaderInfoMsgShown = true;
            }
        
        },
        {
            nodeChanged: function()
            {
                var i, n = this._cf.parts.nodes.length;

                for (i=0; i<n; i++)
                {
                    if (this._cf.parts.nodes[i]._vf.type.toLowerCase() == 'vertex') {
                        this._vertex = this._cf.parts.nodes[i];
                        this._id = this._cf.parts.nodes[i]._id;
                    }
                    else if (this._cf.parts.nodes[i]._vf.type.toLowerCase() == 'fragment') {
                        this._fragment = this._cf.parts.nodes[i];
                        this._id += " - " + this._cf.parts.nodes[i]._id;
                    }
                }

                var ctx = {};
                n = this._cf.fields.nodes.length;

                for (i=0; i<n; i++)
                {
                    var fieldName = this._cf.fields.nodes[i]._vf.name;
                    ctx.xmlNode = this._cf.fields.nodes[i]._xmlNode;

                    var needNode = false;

                    if (ctx.xmlNode === undefined || ctx.xmlNode === null) {
                        ctx.xmlNode = document.createElement("field");
                        needNode = true;
                    }

                    ctx.xmlNode.setAttribute(fieldName, this._cf.fields.nodes[i]._vf.value);

                    var funcName = "this.addField_" + this._cf.fields.nodes[i]._vf.type + "(ctx, name);";
                    var func = new Function('ctx', 'name', funcName);

                    func.call(this, ctx, fieldName);

                    if (needNode) {
                        ctx.xmlNode = null;    // cleanup
                    }
                }
				
				Array.forEach(this._parentNodes, function (app) {
					Array.forEach(app._parentNodes, function (shape) {
						//shape.setAppDirty();
						if (shape._cleanupGLObjects)
						    shape._cleanupGLObjects();
						shape.setAllDirty();
					});
				});	
            },

            fieldChanged: function(fieldName)
            {
                var i, n = this._cf.fields.nodes.length;

                for (i=0; i<n; i++)
                {
                    var field = this._cf.fields.nodes[i]._vf.name;

                    if (field === fieldName)
                    {
                        var msg = this._cf.fields.nodes[i]._vf.value;

                        try {
                            this._vf[field].setValueByStr(msg);
                        }
                        catch (exc1) {
                            try {
                                switch ((typeof(this._vf[field])).toString()) {
                                    case "number":
                                        this._vf[field] = +msg;
                                        break;
                                    case "boolean":
                                        this._vf[field] = (msg.toLowerCase() === "true");
                                        break;
                                    case "string":
                                        this._vf[field] = msg;
                                        break;
                                }
                            }
                            catch (exc2) {
                                x3dom.debug.logError("setValueByStr() NYI for " + typeof(this._vf[field]));
                            }
                        }

                        break;
                    }
                }
                
                if (field === 'url') 
                {
                    Array.forEach(this._parentNodes, function (app) {
    					Array.forEach(app._parentNodes, function (shape) {
    						shape._dirty.shader = true;
    					});
    				});
                }
            },
			
			parentAdded: function(parent)
			{
				//Array.forEach(this._parentNodes, function (app) {
				//	app.nodeChanged();
				//});
				parent.nodeChanged();
			}
        }
    )
);

x3dom.nodeTypes.ComposedShader.ShaderInfoMsgShown = false;

/** Static class ID counter (needed for caching) */
x3dom.nodeTypes.Shape.shaderPartID = 0;

/* ### ShaderPart ### */
x3dom.registerNodeType(
    "ShaderPart",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DNode,
        
        /**
         * Constructor for ShaderPart
         * @constructs x3dom.nodeTypes.ShaderPart
         * @x3d x.x
         * @component Shaders
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.ShaderPart.superClass.call(this, ctx);


            /**
             *
             * @var {MFString} url
             * @memberof x3dom.nodeTypes.ShaderPart
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'url', []);

            /**
             *
             * @var {SFString} type
             * @memberof x3dom.nodeTypes.ShaderPart
             * @initvalue "VERTEX"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'type', "VERTEX");
            
            this._id = (ctx && ctx.xmlNode && ctx.xmlNode.id != "") ?
                        ctx.xmlNode.id : ++x3dom.nodeTypes.Shape.shaderPartID;

            x3dom.debug.assert(this._vf.type.toLowerCase() == 'vertex' ||
                               this._vf.type.toLowerCase() == 'fragment');
        
        },
        {
			nodeChanged: function()
            {
                var ctx = {};
                ctx.xmlNode = this._xmlNode;

                if (ctx.xmlNode !== undefined && ctx.xmlNode !== null) 
                {
                    var that = this;

                    if (that._vf.url.length && that._vf.url[0].indexOf('\n') == -1)
                    {
                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", encodeURI(that._nameSpace.getURL(that._vf.url[0])), false);
                        xhr.onload = function() {
                            that._vf.url = new x3dom.fields.MFString( [] );
                            that._vf.url.push(xhr.response);
                        };
                        xhr.onerror = function() {
                            x3dom.debug.logError("Could not load file '" + that._vf.url[0] + "'.");
                        };
                        xhr.send(null);
                    }
                    else
                    {
                        if (that._vf.url.length) {
                            that._vf.url = new x3dom.fields.MFString( [] );
                        }
                        try {
                            that._vf.url.push(ctx.xmlNode.childNodes[1].nodeValue);
                            ctx.xmlNode.removeChild(ctx.xmlNode.childNodes[1]);
                        }
                        catch(e) {
                            Array.forEach( ctx.xmlNode.childNodes, function (childDomNode) {
                                if (childDomNode.nodeType === 3) {
                                    that._vf.url.push(childDomNode.nodeValue);
                                }
                                else if (childDomNode.nodeType === 4) {
                                    that._vf.url.push(childDomNode.data);
                                }
                                childDomNode.parentNode.removeChild(childDomNode);
                            } );
                        }
                    }
                }
                // else hope that url field was already set somehow

                Array.forEach(this._parentNodes, function (shader) {
                    shader.nodeChanged();
                });
			},
			
			fieldChanged: function(fieldName)
            {
                if (fieldName === "url") {
                    Array.forEach(this._parentNodes, function (shader) {
    					shader.fieldChanged("url");
    				});
                }
			},
			
			parentAdded: function(parent)
			{
				//Array.forEach(this._parentNodes, function (shader) {
				//	shader.nodeChanged();
				//});
				parent.nodeChanged();
			}
        }
    )
);

/* ### X3DVertexAttributeNode ### */
x3dom.registerNodeType(
    "X3DVertexAttributeNode",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        
        /**
         * Constructor for X3DVertexAttributeNode
         * @constructs x3dom.nodeTypes.X3DVertexAttributeNode
         * @x3d x.x
         * @component Shaders
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometricPropertyNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DVertexAttributeNode.superClass.call(this, ctx);


            /**
             *
             * @var {SFString} name
             * @memberof x3dom.nodeTypes.X3DVertexAttributeNode
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'name', "");
        
        }
    )
);

/* ### FloatVertexAttribute ### */
x3dom.registerNodeType(
    "FloatVertexAttribute",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DVertexAttributeNode,
        
        /**
         * Constructor for FloatVertexAttribute
         * @constructs x3dom.nodeTypes.FloatVertexAttribute
         * @x3d x.x
         * @component Shaders
         * @status experimental
         * @extends x3dom.nodeTypes.X3DVertexAttributeNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.FloatVertexAttribute.superClass.call(this, ctx);


            /**
             *
             * @var {SFInt32} numComponents
             * @memberof x3dom.nodeTypes.FloatVertexAttribute
             * @initvalue 4
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'numComponents', 4);

            /**
             *
             * @var {MFFloat} value
             * @memberof x3dom.nodeTypes.FloatVertexAttribute
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'value', []);
        
        }
    )
);

