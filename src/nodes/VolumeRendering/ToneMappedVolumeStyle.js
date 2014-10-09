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

/* ### ToneMappedVolumeStyle ### */
x3dom.registerNodeType(
    "ToneMappedVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        
        /**
         * Constructor for ToneMappedVolumeStyle
         * @constructs x3dom.nodeTypes.ToneMappedVolumeStyle
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The ToneMappedVolumeStyle node specifies that the associated volume rendering data is going to be rendered following the Gooch et. al. shading model.
         * Two colors are used: warm and cool to shade the volume data based on the light direction. 
         */
        function (ctx) {
            x3dom.nodeTypes.ToneMappedVolumeStyle.superClass.call(this, ctx);


            /**
             * The coolColor field specifies the color to be used for surfaces facing away of the light direction.
             * @var {x3dom.fields.SFColor} coolColor
             * @memberof x3dom.nodeTypes.ToneMappedVolumeStyle
             * @initvalue 0,0,1
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'coolColor', 0, 0, 1);

            /**
             * The warmColor field specifies the color to be used for surfaces facing towards the light direction.
             * @var {x3dom.fields.SFColor} warmColor
             * @memberof x3dom.nodeTypes.ToneMappedVolumeStyle
             * @initvalue 1,1,0
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'warmColor', 1, 1, 0);

            this.uniformCoolColor = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformWarmColor = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformSampler2DSurfaceNormals = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformBoolEnableToneMapped = new x3dom.nodeTypes.Uniform(ctx);
        
        },
        {
            fieldChanged: function(fieldName){
                switch(fieldName){
                    case 'coolColor':
                        this.uniformCoolColor._vf.value = this._vf.coolColor;
                        this.uniformCoolColor.fieldChanged("value");
                        break;
                    case 'warmColor':
                        this.uniformWarmColor._vf.value = this._vf.warmColor;
                        this.uniformWarmColor.fieldChanged("value");
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

                this.uniformCoolColor._vf.name = 'uCoolColor'+this._styleID;
                this.uniformCoolColor._vf.type = 'SFColor';
                this.uniformCoolColor._vf.value = this._vf.coolColor;
                unis.push(this.uniformCoolColor);

                this.uniformWarmColor._vf.name = 'uWarmColor'+this._styleID;
                this.uniformWarmColor._vf.type = 'SFColor';
                this.uniformWarmColor._vf.value = this._vf.warmColor;
                unis.push(this.uniformWarmColor);

                this.uniformBoolEnableToneMapped._vf.name = 'uEnableToneMapped'+this._styleID;
                this.uniformBoolEnableToneMapped._vf.type = 'SFBool';
                this.uniformBoolEnableToneMapped._vf.value = this._vf.enabled;
                unis.push(this.uniformBoolEnableToneMapped);

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
                return "uniform vec3 uCoolColor"+this._styleID+";\n"+
                "uniform vec3 uWarmColor"+this._styleID+";\n"+
                "uniform bool uEnableToneMapped"+this._styleID+";\n";
            },

            styleShaderText: function(){
                if (this._first){
                    return "void toneMapped(inout vec4 original_color, inout vec3 accum_color, in vec4 surfNormal, in vec3 lightDir, in vec3 cColor, in vec3 wColor)\n"+
                    "{\n"+
                    "   if(surfNormal.a > 0.02){\n"+
                    "       float color_factor = (1.0 + dot(lightDir, surfNormal.xyz))*0.5;\n"+
                    "       accum_color += mix(wColor, cColor, color_factor);\n"+
                    "       original_color.rgb = accum_color;\n"+
                    "   }else{\n"+
                    "       accum_color += mix(wColor, cColor, 0.5);\n"+
                    "       original_color.rgb = accum_color;\n"+
                    "   }\n"+
                    "}\n";
                }else{
                    return "";
                }
            },

            inlineStyleShaderText: function(){
                var shaderText = "    if(uEnableToneMapped"+this._styleID+"){\n"+
                "       vec3 toneColor = vec3(0.0, 0.0, 0.0);\n"+
                "       vec3 L = vec3(0.0, 0.0, 0.0);\n";
                for(var l=0; l<x3dom.nodeTypes.X3DLightNode.lightID; l++) {
                    shaderText += "       L = (light"+l+"_Type == 1.0) ? normalize(light"+l+"_Location - positionE.xyz) : -light"+l+"_Direction;\n"+
                    "       toneMapped(value, toneColor, grad, L, uCoolColor"+this._styleID+", uWarmColor"+this._styleID+");\n";
                }
                shaderText += "    }\n";
                return shaderText;
            },

            lightAssigment: function(){
                //return " value.rgb = ambient*value.rgb + diffuse*value.rgb + specular;\n";
                return "";
            }
        }
    )
);