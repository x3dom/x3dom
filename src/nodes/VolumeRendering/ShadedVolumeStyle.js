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

/* ### ShadedVolumeStyle ### */
x3dom.registerNodeType(
    "ShadedVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        
        /**
         * Constructor for ShadedVolumeStyle
         * @constructs x3dom.nodeTypes.ShadedVolumeStyle
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The ShadedVolumeStyle node applies the Blinn-Phong illumination model to the assocciated volume data.
         * The light and fog parameters are obtained from the parent Appearence node.
         */
        function (ctx) {
            x3dom.nodeTypes.ShadedVolumeStyle.superClass.call(this, ctx);


            /**
             * The material field allows to specify a Material node to be used on the assocciated volume data. 
             * @var {x3dom.fields.SFNode} material
             * @memberof x3dom.nodeTypes.ShadedVolumeStyle
             * @initvalue x3dom.nodeTypes.X3DMaterialNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('material', x3dom.nodeTypes.X3DMaterialNode);

            /**
             * NYI!!
             * @var {x3dom.fields.SFBool} lighting
             * @memberof x3dom.nodeTypes.ShadedVolumeStyle
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'lighting', false);

            /**
             * NYI!!
             * @var {x3dom.fields.SFBool} shadows
             * @memberof x3dom.nodeTypes.ShadedVolumeStyle
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'shadows', false);

            /**
             * NYI!!
             * @var {x3dom.fields.SFString} phaseFunction
             * @memberof x3dom.nodeTypes.ShadedVolumeStyle
             * @initvalue "Henyey-Greenstein"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'phaseFunction', "Henyey-Greenstein");

            this.uniformBoolLigthning = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformBoolShadows = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformSampler2DSurfaceNormals = new x3dom.nodeTypes.Uniform(ctx);
            //Material uniforms
            this.uniformColorSpecular = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatAmbientIntensity = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatShininess = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatTransparency = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformColorEmissive = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformColorDiffuse = new x3dom.nodeTypes.Uniform(ctx);
            //Enable/Disable style
            this.uniformBoolEnableShaded = new x3dom.nodeTypes.Uniform(ctx);
        
        },
        {
            fieldChanged: function(fieldName){
                switch(fieldName){
                    case 'lightning':
                        this.uniformBoolLightning._vf.value = this._vf.lightning;
                        this.uniformBoolLightning.fieldChanged("value");
                        break;
                    case 'shadows':
                        this.uniformBoolShadows._vf.value = this._vf.shadows;
                        this.uniformBoolShadows.fieldChanged("value");
                        break;
                    default:
                        //TODO: Reload node
                        break;
                }
            },

            uniforms: function(){
                var unis = [];
                if (this._cf.surfaceNormals.node) {
                    this.uniformSampler2DSurfaceNormals._vf.name = 'uSurfaceNormals';
                    this.uniformSampler2DSurfaceNormals._vf.type = 'SFInt32';
                    this.uniformSampler2DSurfaceNormals._vf.value = this._volumeDataParent._textureID++;
                    unis.push(this.uniformSampler2DSurfaceNormals);
                }

                this.uniformBoolLigthning._vf.name = 'uLightning'+this._styleID;
                this.uniformBoolLigthning._vf.type = 'SFBool';
                this.uniformBoolLigthning._vf.value = this._vf.lighting;
                unis.push(this.uniformBoolLigthning);

                this.uniformBoolShadows._vf.name = 'uShadows'+this._styleID;
                this.uniformBoolShadows._vf.type = 'SFBool';
                this.uniformBoolShadows._vf.value = this._vf.shadows;
                unis.push(this.uniformBoolShadows);

                //Material uniform parameters
                if(this._cf.material.node != null){
                    this.uniformColorSpecular._vf.name = 'specularColor'+this._styleID;
                    this.uniformColorSpecular._vf.type = 'SFColor';
                    this.uniformColorSpecular._vf.value = this._cf.material.node._vf.specularColor;
                    unis.push(this.uniformColorSpecular);

                    this.uniformColorDiffuse._vf.name = 'diffuseColor'+this._styleID;
                    this.uniformColorDiffuse._vf.type = 'SFColor';
                    this.uniformColorDiffuse._vf.value = this._cf.material.node._vf.diffuseColor;
                    unis.push(this.uniformColorDiffuse);

                    this.uniformColorEmissive._vf.name = 'emissiveColor'+this._styleID;
                    this.uniformColorEmissive._vf.type = 'SFColor';
                    this.uniformColorEmissive._vf.value = this._cf.material.node._vf.emissiveColor;
                    unis.push(this.uniformColorEmissive);

                    this.uniformFloatAmbientIntensity._vf.name = 'ambientIntensity'+this._styleID;
                    this.uniformFloatAmbientIntensity._vf.type = 'SFFloat';
                    this.uniformFloatAmbientIntensity._vf.value = this._cf.material.node._vf.ambientIntensity;
                    unis.push(this.uniformFloatAmbientIntensity);

                    this.uniformFloatShininess._vf.name = 'shininess'+this._styleID;
                    this.uniformFloatShininess._vf.type = 'SFFloat';
                    this.uniformFloatShininess._vf.value = this._cf.material.node._vf.shininess;
                    unis.push(this.uniformFloatShininess);

                    this.uniformFloatTransparency._vf.name = 'transparency'+this._styleID;
                    this.uniformFloatTransparency._vf.type = 'SFFloat';
                    this.uniformFloatTransparency._vf.value = this._cf.material.node._vf.transperency;
                    unis.push(this.uniformFloatTransparency);
                }

                this.uniformBoolEnableShaded._vf.name = 'uEnableShaded'+this._styleID;
                this.uniformBoolEnableShaded._vf.type = 'SFBool';
                this.uniformBoolEnableShaded._vf.value = this._vf.enabled;
                unis.push(this.uniformBoolEnableShaded);

                return unis;
            },

            textures: function() {
                var texs = [];
                if (this._cf.surfaceNormals.node) {
                    var tex = this._cf.surfaceNormals.node;
                    tex._vf.repeatS = false;
                    tex._vf.repeatT = false;
                    texs.push(tex)
                }
                return texs;
            },

            styleUniformsShaderText: function(){
                var uniformText = "uniform bool uLightning"+this._styleID+";\n"+
                "uniform bool uShadows"+this._styleID+";\n"+
                //Fog uniforms
                "uniform float fogRange;\n"+
                "uniform vec3 fogColor;\n"+
                "uniform float fogType;\n"+
                "uniform bool uEnableShaded"+this._styleID+";\n";
                //Material uniforms
                if(this._cf.material.node){
                    uniformText += "uniform vec3  diffuseColor"+this._styleID+";\n"+
                    "uniform vec3  specularColor"+this._styleID+";\n"+
                    "uniform vec3  emissiveColor"+this._styleID+";\n"+
                    "uniform float shininess"+this._styleID+";\n"+
                    "uniform float transparency"+this._styleID+";\n"+
                    "uniform float ambientIntensity"+this._styleID+";\n";
                }
                return uniformText;
            },

            styleShaderText: function(){
                if(this._first){
                    return "float computeFogInterpolant(float distanceFromPoint)\n"+
                    "{\n"+
                    "  if (distanceFromPoint > fogRange){\n"+
                    "    return 0.0;\n"+
                    "  }else if (fogType == 0.0){\n"+
                    "    return clamp((fogRange-distanceFromPoint) / fogRange, 0.0, 1.0);\n"+
                    "  }else{\n"+
                    "    return clamp(exp(-distanceFromPoint / (fogRange-distanceFromPoint)), 0.0, 1.0);\n"+
                    "  }\n"+
                    "}\n";
                }else{
                    return "";
                }
            },

            lightEquationShaderText: function(){
                if(this._first){
                    return "void lighting(in float lType, in vec3 lLocation, in vec3 lDirection, in vec3 lColor, in vec3 lAttenuation, " + 
                    "in float lRadius, in float lIntensity, in float lAmbientIntensity, in float lBeamWidth, " +
                    "in float lCutOffAngle, in float ambientIntensity, in float shininess, in vec3 N, in vec3 V, inout vec3 ambient, inout vec3 diffuse, " +
                    "inout vec3 specular)\n" +
                    "{\n" +
                    "   vec3 L;\n" +
                    "   float spot = 1.0, attentuation = 0.0;\n" +
                    "   if(lType == 0.0) {\n" +
                    "       L = -normalize(lDirection);\n" +
                    "       V = normalize(V);\n" +
                    "       attentuation = 1.0;\n" +
                    "   } else{\n" +
                    "       L = (lLocation - (-V));\n" +
                    "       float d = length(L);\n" +
                    "       L = normalize(L);\n" +
                    "       V = normalize(V);\n" +
                    "       if(lRadius == 0.0 || d <= lRadius) {\n" +
                    "           attentuation = 1.0 / max(lAttenuation.x + lAttenuation.y * d + lAttenuation.z * (d * d), 1.0);\n" +
                    "       }\n" +
                    "       if(lType == 2.0) {\n" +
                    "           float spotAngle = acos(max(0.0, dot(-L, normalize(lDirection))));\n" +
                    "           if(spotAngle >= lCutOffAngle) spot = 0.0;\n" +
                    "           else if(spotAngle <= lBeamWidth) spot = 1.0;\n" +
                    "           else spot = (spotAngle - lCutOffAngle ) / (lBeamWidth - lCutOffAngle);\n" +
                    "       }\n" +
                    "   }\n" +
                    "   vec3 H = normalize( L + V );\n" +
                    "   float NdotL = max(0.0, dot(L, N));\n" +
                    "   float NdotH = max(0.0, dot(H, N));\n" +
                    "   float ambientFactor = lAmbientIntensity * ambientIntensity;\n" +
                    "   float diffuseFactor = lIntensity * NdotL;\n" +
                    "   float specularFactor = lIntensity * pow(NdotH, shininess*128.0);\n" +
                    "   ambient += lColor * ambientFactor * attentuation * spot;\n" +
                    "   diffuse += lColor * diffuseFactor * attentuation * spot;\n" +
                    "   specular += lColor * specularFactor * attentuation * spot;\n" +
                    "}\n";
                }else{
                    return "";
                }               
            },

            inlineStyleShaderText: function(){
                if(this._first){
                    return "    float fogFactor = computeFogInterpolant(length(cam_pos-ray_pos));\n";
                }else{
                    return "";
                }
            },

            lightAssigment: function(){
                var shaderText = "    if(uEnableShaded"+this._styleID+"){\n";
                for(var l=0; l<x3dom.nodeTypes.X3DLightNode.lightID; l++) {
                    shaderText += "    lighting(light"+l+"_Type, " +
                    "light"+l+"_Location, " +
                    "light"+l+"_Direction, " +
                    "light"+l+"_Color, " + 
                    "light"+l+"_Attenuation, " +
                    "light"+l+"_Radius, " +
                    "light"+l+"_Intensity, " + 
                    "light"+l+"_AmbientIntensity, " +
                    "light"+l+"_BeamWidth, " +
                    "light"+l+"_CutOffAngle, " +
                    "ambientIntensity"+this._styleID+", "+
                    "shininess"+this._styleID+", "+
                    "grad.xyz, positionE.xyz, ambient, diffuse, specular);\n";
                }
                if(this._vf.lighting == true){
                    if(this._cf.material.node){
                        shaderText += "      value.rgb = (fogColor*(1.0-fogFactor))+fogFactor*(emissiveColor"+this._styleID+" + ambient*value.rgb + diffuse*diffuseColor"+this._styleID+"*value.rgb + specular*specularColor"+this._styleID+");\n"+
                        "      value.a = value.a*(1.0-transparency"+this._styleID+");\n";
                    }else{
                        shaderText += "      value.rgb = (fogColor*(1.0-fogFactor))+fogFactor*(ambient*value.rgb + diffuse*value.rgb + specular);\n";
                    }
                }
                shaderText += "    }\n";
                return shaderText;
            }
        }
    )
);