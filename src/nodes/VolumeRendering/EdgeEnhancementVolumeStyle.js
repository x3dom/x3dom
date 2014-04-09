/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### EdgeEnhancementVolumeStyle ### */
x3dom.registerNodeType(
    "EdgeEnhancementVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        
        /**
         * Constructor for EdgeEnhancementVolumeStyle
         * @constructs x3dom.nodeTypes.EdgeEnhancementVolumeStyle
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.EdgeEnhancementVolumeStyle.superClass.call(this, ctx);


            /**
             *
             * @var {SFColor} edgeColor
             * @memberof x3dom.nodeTypes.EdgeEnhancementVolumeStyle
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'edgeColor', 0, 0, 0);

            /**
             *
             * @var {SFFloat} gradientThreshold
             * @memberof x3dom.nodeTypes.EdgeEnhancementVolumeStyle
             * @initvalue 0.4
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'gradientThreshold', 0.4);

            this.uniformColorEdgeColor = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatGradientThreshold = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformSampler2DSurfaceNormals = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformBoolEdgeEnable = new x3dom.nodeTypes.Uniform(ctx);
        
        },
        {
            fieldChanged: function(fieldName){
                if (fieldName == "edgeColor") {
                    this.uniformColorEdgeColor._vf.value = this._vf.edgeColor;
                    this.uniformColorEdgeColor.fieldChanged("value");
                }else if (fieldName == "gradientThreshold") {
                    this.uniformFloatGradientThreshold._vf.value = this._vf.gradientThreshold;
                    this.uniformFloatGradientThreshold.fieldChanged("value");
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
                        x3dom.debug.logError("[VolumeRendering][EdgeEnhancementVolumeStyle] Not VolumeData parent found!");
                        volumeDataParent = null;
                    }
                    this.uniformSampler2DSurfaceNormals._vf.name = 'uSurfaceNormals';
                    this.uniformSampler2DSurfaceNormals._vf.type = 'SFInt32';
                    this.uniformSampler2DSurfaceNormals._vf.value = volumeDataParent._textureID++;
                    unis.push(this.uniformSampler2DSurfaceNormals);
                }

                this.uniformColorEdgeColor._vf.name = 'uEdgeColor';
                this.uniformColorEdgeColor._vf.type = 'SFColor';
                this.uniformColorEdgeColor._vf.value = this._vf.edgeColor;
                unis.push(this.uniformColorEdgeColor);

                this.uniformFloatGradientThreshold._vf.name = 'uGradientThreshold';
                this.uniformFloatGradientThreshold._vf.type = 'SFFloat';
                this.uniformFloatGradientThreshold._vf.value = this._vf.gradientThreshold;
                unis.push(this.uniformFloatGradientThreshold);

                this.uniformBoolEdgeEnable._vf.name = 'uEnableEdge';
                this.uniformBoolEdgeEnable._vf.type = 'SFBool';
                this.uniformBoolEdgeEnable._vf.value = this._vf.enabled;
                unis.push(this.uniformBoolEdgeEnable);
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
                return "uniform vec3 uEdgeColor;\n"+
                    "uniform float uGradientThreshold;\n"+
                    "uniform bool uEnableEdge;\n";
            },

            styleShaderText: function(){
                return "void edgeEnhancement(inout vec4 originalColor, vec4 gradient, vec3 V)\n"+
                    "{\n"+
                    "   if(gradient.w > 0.001){\n"+
                    "       float angle_dif = abs(dot(gradient.xyz,V));\n"+
                    "       if (angle_dif<=cos(uGradientThreshold)){\n"+
                    "           originalColor.rgb = mix(uEdgeColor, originalColor.rgb, angle_dif);\n"+
                    "       }\n"+
                    "   }\n"+
                    "}\n";
            },

            inlineStyleShaderText: function(){
                var inlineText = "   if(uEnableEdge){\n"+
                    "       edgeEnhancement(value, grad, normalize(dir));\n"+
                    "   }\n";
                return inlineText;
            },

            lightAssigment: function(){
                return "    value.rgb = ambient*value.rgb + diffuse*value.rgb + specular;\n";
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