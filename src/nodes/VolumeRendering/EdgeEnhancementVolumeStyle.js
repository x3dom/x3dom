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
         * The EdgeEnhancementVolumeStyle node specifies that the edges of the assocciated volume data shall be enhanced.
         * The edge enhancement is performed by changing the color of the edges to the specified one.
         */
        function (ctx) {
            x3dom.nodeTypes.EdgeEnhancementVolumeStyle.superClass.call(this, ctx);


            /**
             * The edgeColor field specifies the color to be used for the edge enhacement.
             * @var {x3dom.fields.SFColor} edgeColor
             * @memberof x3dom.nodeTypes.EdgeEnhancementVolumeStyle
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'edgeColor', 0, 0, 0);

            /**
             * The gradientThreshold field is used to adjust the edge detection.
             * @var {x3dom.fields.SFFloat} gradientThreshold
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
                    this.uniformSampler2DSurfaceNormals._vf.name = 'uSurfaceNormals';
                    this.uniformSampler2DSurfaceNormals._vf.type = 'SFInt32';
                    this.uniformSampler2DSurfaceNormals._vf.value = this._volumeDataParent._textureID++;
                    unis.push(this.uniformSampler2DSurfaceNormals);
                }

                this.uniformColorEdgeColor._vf.name = 'uEdgeColor'+this._styleID;
                this.uniformColorEdgeColor._vf.type = 'SFColor';
                this.uniformColorEdgeColor._vf.value = this._vf.edgeColor;
                unis.push(this.uniformColorEdgeColor);

                this.uniformFloatGradientThreshold._vf.name = 'uGradientThreshold'+this._styleID;
                this.uniformFloatGradientThreshold._vf.type = 'SFFloat';
                this.uniformFloatGradientThreshold._vf.value = this._vf.gradientThreshold;
                unis.push(this.uniformFloatGradientThreshold);

                this.uniformBoolEdgeEnable._vf.name = 'uEnableEdge'+this._styleID;
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
                return "uniform vec3 uEdgeColor"+this._styleID+";\n"+
                    "uniform float uGradientThreshold"+this._styleID+";\n"+
                    "uniform bool uEnableEdge"+this._styleID+";\n";
            },

            styleShaderText: function(){
                if (this._first){
                    return "void edgeEnhancement(inout vec4 originalColor, in vec4 gradient, in vec3 V, in vec3 edgeColor, in float gradientT)\n"+
                    "{\n"+
                    "   if(gradient.a > 0.05){\n"+
                    "       float angle_dif = abs(dot(gradient.xyz,V));\n"+
                    //"       float br = clamp(sign(cos(gradientT)-angle_dif),0.0,1.0);\n"+
                    "       if(angle_dif > cos(gradientT)){\n"+
                    "           originalColor.rgb = mix(edgeColor, originalColor.rgb, angle_dif);\n"+
                    "       }\n"+
                    "   }\n"+
                    "}\n";
                }else{
                    return "";
                }
            },

            inlineStyleShaderText: function(){
                var inlineText = "   if(uEnableEdge"+this._styleID+"){\n"+
                "       edgeEnhancement(value, gradEye, dir, uEdgeColor"+this._styleID+", uGradientThreshold"+this._styleID+");\n"+
                "   }\n";
                return inlineText;
            }
        }
    )
);