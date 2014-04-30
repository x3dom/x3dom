/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
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
         * Two colors are used: warm and cool to shade the volume data based on the the light direction. 
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
                    //Lookup for the parent VolumeData
                    var volumeDataParent = this._parentNodes[0];
                    while(!x3dom.isa(volumeDataParent, x3dom.nodeTypes.X3DVolumeDataNode) || !x3dom.isa(volumeDataParent, x3dom.nodeTypes.X3DNode)){
                        volumeDataParent = volumeDataParent._parentNodes[0];
                    }
                    if(x3dom.isa(volumeDataParent, x3dom.nodeTypes.X3DVolumeDataNode) == false){
                        x3dom.debug.logError("[VolumeRendering][ToneMappedVolumeStyle] Not VolumeData parent found!");
                        volumeDataParent = null;
                    }
                    this.uniformSampler2DSurfaceNormals._vf.name = 'uSurfaceNormals';
                    this.uniformSampler2DSurfaceNormals._vf.type = 'SFInt32';
                    this.uniformSampler2DSurfaceNormals._vf.value = volumeDataParent._textureID++;
                    unis.push(this.uniformSampler2DSurfaceNormals);
                }

                this.uniformCoolColor._vf.name = 'uCoolColor';
                this.uniformCoolColor._vf.type = 'SFColor';
                this.uniformCoolColor._vf.value = this._vf.coolColor;
                unis.push(this.uniformCoolColor);

                this.uniformWarmColor._vf.name = 'uWarmColor';
                this.uniformWarmColor._vf.type = 'SFColor';
                this.uniformWarmColor._vf.value = this._vf.warmColor;
                unis.push(this.uniformWarmColor);

                this.uniformBoolEnableToneMapped._vf.name = 'uEnableToneMapped';
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
                return "uniform vec3 uCoolColor;\n"+
                    "uniform vec3 uWarmColor;\n"+
                    "uniform bool uEnableToneMapped;\n";
            },

            styleShaderText: function(){
                var styleText = "void toneMapped(inout vec4 original_color, inout vec3 accum_color, vec3 surfNormal, vec3 lightDir)\n"+
                    "{\n"+
                    "   float color_factor = (1.0 + dot(lightDir, surfNormal))*0.5;\n"+
                    "   accum_color += mix(uCoolColor, uWarmColor, color_factor);\n"+
                    "   original_color.rgb = accum_color;\n"+
                    "}\n";
                return styleText;
            },

            inlineStyleShaderText: function(){
                var shaderText = "    if(uEnableToneMapped){\n"+
                    "       vec3 toneColor = vec3(0.0, 0.0, 0.0);\n"+
                    "       vec3 L = vec3(0.0, 0.0, 0.0);\n";
                for(var l=0; l<x3dom.nodeTypes.X3DLightNode.lightID; l++) {
                    shaderText += "       L = (light"+l+"_Type == 1.0) ? normalize(light"+l+"_Location - positionE.xyz) : -light"+l+"_Direction;\n"+
                        "       toneMapped(value, toneColor, gradEye.xyz, L);\n";
                }
                shaderText += "    }\n";
                return shaderText;
            },

            lightAssigment: function(){
                //return " value.rgb = ambient*value.rgb + diffuse*value.rgb + specular;\n";
                return "";
            },

            fragmentShaderText: function(numberOfSlices, slicesOverX, slicesOverY){
                var shader =
                    this.preamble+
                    this.defaultUniformsShaderText(numberOfSlices, slicesOverX, slicesOverY)+
                    this.styleUniformsShaderText()+
                    this.styleShaderText()+
                    this.texture3DFunctionShaderText+
                    this.normalFunctionShaderText()+
                    this.lightEquationShaderText()+
                    this.defaultLoopFragmentShaderText(this.inlineStyleShaderText(), this.lightAssigment());
                return shader;
            }
        }
    )
);