/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### PhysicalMaterial ### */
x3dom.registerNodeType(
    "PhysicalMaterial",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DMaterialNode,
        
        /**
         * Constructor for X3DMaterialNode
         * @constructs x3dom.nodeTypes.PhysicalMaterial
         * @x3d 3.3
         * @component Shape
         * @status full
         * @extends x3dom.nodeTypes.X3DMaterialNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This is the base node type for all Material nodes.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DMaterialNode.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'model', "roughnessMetallic");

            /**
             * The RGBA components of the base color of the material. The fourth component (A) is the 
             * alpha coverage of the material. The `alphaMode` property specifies how alpha is interpreted. 
             * These values are linear. If a baseColorTexture is specified, 
             * this value is multiplied with the texel values.
             * @var {x3dom.fields.SFColor} baseColorFactor
             * @memberof x3dom.nodeTypes.PhysicalMaterial
             * @initvalue 1,1,1,1
             * @field x3d
             * @instance
             */
            this.addField_SFColorRGBA(ctx, 'baseColorFactor', 1, 1, 1, 1);

            /**
             * The metalness of the material. A value of 1.0 means the material is a metal.
             * A value of 0.0 means the material is a dielectric. Values in between are for blending
             * between metals and dielectrics such as dirty metallic surfaces. This value is linear.
             * If a roughnessMetallicTexture is specified, this value is multiplied with
             * the metallic texel values.
             * @var {x3dom.fields.SFFloat} metallicFactor
             * @range [0, 1]
             * @memberof x3dom.nodeTypes.PhysicalMaterial
             * @initvalue 0.0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'metallicFactor', 0);

            /**
             * The roughness of the material. A value of 1.0 means the material is completely rough. 
             * A value of 0.0 means the material is completely smooth. This value is linear. 
             * If a roughnessMetallicTexture is specified, this value is multiplied with 
             * the roughness texel values.
             * @var {x3dom.fields.SFFloat} roughnessFactor
             * @range [0, 1]
             * @memberof x3dom.nodeTypes.PhysicalMaterial
             * @initvalue 0.2
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'roughnessFactor', 0.2);

            /**
             * Toto
             * @var {x3dom.fields.SFColor} diffuseFactor
             * @memberof x3dom.nodeTypes.PhysicalMaterial
             * @initvalue 1,1,1
             * @field x3d
             * @instance
             */
            this.addField_SFColorRGBA(ctx, 'diffuseFactor', 1, 1, 1, 1);

            /**
             * Todo
             * @var {x3dom.fields.SFColor} specularFactor
             * @memberof x3dom.nodeTypes.PhysicalMaterial
             * @initvalue 1,1,1
             * @field x3d
             * @instance
             */
            this.addField_SFColor(ctx, 'specularFactor', 1, 1, 1);

            /**
             * todo
             * @var {x3dom.fields.SFFloat} glossinessFactor
             * @range [0, 1]
             * @memberof x3dom.nodeTypes.PhysicalMaterial
             * @initvalue 1
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'glossinessFactor', 1);

            /**
             * The RGB components of the emissive color of the material. These values are linear.
             * If an emissiveTexture is specified, this value is multiplied with the texel values.
             * @var {x3dom.fields.SFColor} emissiveFactor
             * @memberof x3dom.nodeTypes.PhysicalMaterial
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFColor(ctx, 'emissiveFactor', 0, 0, 0);

            /**
             * Space in which normals of the normalTexture are defined.
             * @var {x3dom.fields.SFString} normalSpace
             * @memberof x3dom.nodeTypes.PhysicalMaterial
             * @initvalue 'TANGENT'
             * @range [TANGENT, OBJECT]
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'normalSpace', 'TANGENT');

            /**
             * The material's alpha rendering mode enumeration specifying the interpretation 
             * of the alpha value of the main factor and texture.
             * @var {x3dom.fields.SFString} alphaMode
             * @memberof x3dom.nodeTypes.PhysicalMaterial
             * @initvalue 'OPAQUE'
             * @range [OPAQUE, BLEND, MASK]
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'alphaMode', 'OPAQUE');

            /**
             * Specifies the cutoff threshold when in `MASK` mode. 
             * If the alpha value is greater than or equal to this value then 
             * it is rendered as fully opaque, otherwise, it is rendered as fully transparent. 
             * A value greater than 1.0 will render the entire material as fully transparent. 
             * This value is ignored for other modes."
             * @var {x3dom.fields.SFFloat} alphaCutoff
             * @range [0, 1]
             * @memberof x3dom.nodeTypes.PhysicalMaterial
             * @initvalue 0.5
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'alphaCutoff', 0.5);

            /**
             * Bias to apply to normal sampled from normalTexture
             * @var {x3dom.fields.SFVec3f} normalBias
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue -1,-1, 1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'normalBias', -1, -1, 1);

            /**
             * Scale to apply to normal sampled from normalTexture
             * @var {x3dom.fields.SFVec3f} normalBias
             * @memberof x3dom.nodeTypes.CommonSurfaceShader
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'normalScale', 1);

            /**
             * Set the material to unlit
             * Final color is the product of baseColorFactor, baseColorTexture, and vertex color (if any)
             * @var {x3dom.fields.SFBool} unlit
             * @memberof x3dom.nodeTypes.PhysicalMaterial
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'unlit', false);

            /**
             * The base color texture. This texture contains RGB(A) components in sRGB color space. 
             * The first three components (RGB) specify the base color of the material. 
             * If the fourth component (A) is present, it represents the alpha coverage of the material. 
             * Otherwise, an alpha of 1.0 is assumed. The `alphaMode` property specifies 
             * how alpha is interpreted. The stored texels must not be premultiplied.
             * @var {x3dom.nodeTypes.X3DTextureNode} baseColorTexture
             * @memberof x3dom.nodeTypes.PhysicalMaterial
             * @initvalue
             * @field x3d
             * @instance
             */
            this.addField_SFNode('baseColorTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * The emissive map controls the color and intensity of the light being emitted by the material.
             * This texture contains RGB components in sRGB color space.
             * If a fourth component (A) is present, it is ignored.
             * @var {x3dom.nodeTypes.X3DTextureNode} emissiveTexture
             * @memberof x3dom.nodeTypes.PhysicalMaterial
             * @initvalue
             * @field x3d
             * @instance
             */
            this.addField_SFNode('emissiveTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * A set of parameter values that are used to define the
             * metallic-roughness material model from Physically-Based Rendering (PBR) methodology. 
             * When not specified, all the default values of `pbrMetallicRoughness` apply.
             * @var {x3dom.nodeTypes.X3DTextureNode} roughnessMetallicTexture
             * @memberof x3dom.nodeTypes.PhysicalMaterial
             * @initvalue
             * @field x3d
             * @instance
             */
            this.addField_SFNode('roughnessMetallicTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * A set of parameter values that are used to define the
             * metallic-roughness material model from Physically-Based Rendering (PBR) methodology. 
             * When not specified, all the default values of `pbrMetallicRoughness` apply.
             * @var {x3dom.nodeTypes.X3DTextureNode} specularGlossinessTexture
             * @memberof x3dom.nodeTypes.PhysicalMaterial
             * @initvalue
             * @field x3d
             * @instance
             */
            this.addField_SFNode('specularGlossinessTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * A set of parameter values that are used to define the
             * metallic-roughness material model from Physically-Based Rendering (PBR) methodology. 
             * When not specified, all the default values of `pbrMetallicRoughness` apply.
             * @var {x3dom.nodeTypes.X3DTextureNode} occlusionRoughnessMetallic
             * @memberof x3dom.nodeTypes.PhysicalMaterial
             * @initvalue
             * @field x3d
             * @instance
             */
            this.addField_SFNode('occlusionRoughnessMetallicTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * A tangent space normal map. The texture contains RGB components in linear space. 
             * Each texel represents the XYZ components of a normal vector in tangent space. 
             * Red [0 to 255] maps to X [-1 to 1]. Green [0 to 255] maps to Y [-1 to 1]. 
             * Blue [128 to 255] maps to Z [1/255 to 1]. The normal vectors use OpenGL conventions 
             * where +X is right and +Y is up. +Z points toward the viewer. In GLSL, 
             * this vector would be unpacked like so: 
             * `float3 normalVector = tex2D(<sampled normal map texture value>, texCoord) * 2 - 1`. 
             * Client implementations should normalize the normal vectors before using them in lighting equations."
             * @var {x3dom.nodeTypes.X3DTextureNode} normalTexture
             * @memberof x3dom.nodeTypes.PhysicalMaterial
             * @initvalue
             * @field x3d
             * @instance
             */
            this.addField_SFNode('normalTexture', x3dom.nodeTypes.X3DTextureNode);

            /**
             * The occlusion map texture. The occlusion values are sampled from the R channel. 
             * Higher values indicate areas that should receive full indirect lighting and lower 
             * values indicate no indirect lighting. These values are linear. If other channels 
             * are present (GBA), they are ignored for occlusion calculations.
             * @var {x3dom.nodeTypes.X3DTextureNode} occlusionTexture
             * @memberof x3dom.nodeTypes.PhysicalMaterial
             * @initvalue
             * @field x3d
             * @instance
             */
            this.addField_SFNode('occlusionTexture', x3dom.nodeTypes.X3DTextureNode);        
        },
        {
            fieldChanged: function(fieldName)
            {
                if (fieldName == "baseColorFactor" || fieldName == "metallicFactor" ||
                    fieldName == "roughnessFactor" || fieldName == "emissiveFactor")
                {
                    Array.forEach(this._parentNodes, function (app) {
                        Array.forEach(app._parentNodes, function (shape) {
                            shape._dirty.material = true;
                        });
                        app.checkSortType();
                    });
                }
            },

            hasTextures: function()
            {
                return (this._cf.baseColorTexture.node ||
                        this._cf.normalTexture.node    ||
                        this._cf.occlusionTexture.node ||
                        this._cf.emissiveTexture.node  ||
                        this._cf.roughnessMetallicTexture.node);
            },

            getTextures: function()
            {
                var textures = [];

                if(this._cf.baseColorTexture.node)
                {
                    this._cf.baseColorTexture.node._type = "diffuseMap";

                    textures.push(this._cf.baseColorTexture.node);
                }

                if(this._cf.normalTexture.node)
                {
                    this._cf.normalTexture.node._type = "normalMap";

                    textures.push(this._cf.normalTexture.node);
                }

                if(this._cf.occlusionTexture.node)
                {
                    this._cf.occlusionTexture.node._type = "occlusionMap";

                    textures.push(this._cf.occlusionTexture.node);
                }

                if(this._cf.emissiveTexture.node)
                {
                    this._cf.emissiveTexture.node._type = "emissiveMap";

                    textures.push(this._cf.emissiveTexture.node);
                }

                if(this._cf.roughnessMetallicTexture.node)
                {
                    this._cf.roughnessMetallicTexture.node._type = "roughnessMetallicMap";

                    textures.push(this._cf.roughnessMetallicTexture.node);
                }

                if(this._cf.specularGlossinessTexture.node)
                {
                    this._cf.specularGlossinessTexture.node._type = "specularGlossinessMap";

                    textures.push(this._cf.specularGlossinessTexture.node);
                }

                if(this._cf.occlusionRoughnessMetallicTexture.node)
                {
                    this._cf.occlusionRoughnessMetallicTexture.node._type = "occlusionRoughnessMetallicMap";

                    textures.push(this._cf.occlusionRoughnessMetallicTexture.node);
                }


                return textures;
            }
        }
    )
);