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

/* ### BlendedVolumeStyle ### */
x3dom.registerNodeType(
    "BlendedVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        
        /**
         * Constructor for BlendedVolumeStyle
         * @constructs x3dom.nodeTypes.BlendedVolumeStyle
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The BlendedVolumeStyle node allows to blend the parent volume data with a second specified volume data using a weight function. 
         */
        function (ctx) {
            x3dom.nodeTypes.BlendedVolumeStyle.superClass.call(this, ctx);


            /**
             * Specifies the render style to be applied on the volume data to be blended.
             * @var {x3dom.fields.SFNode} renderStyle
             * @memberof x3dom.nodeTypes.BlendedVolumeStyle
             * @initvalue x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('renderStyle', x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode);

            /**
             * The voxels field is an ImageTextureAtlas node containing the volume data to be blended.
             * @var {x3dom.fields.SFNode} voxels
             * @memberof x3dom.nodeTypes.BlendedVolumeStyle
             * @initvalue x3dom.nodeTypes.X3DVolumeDataNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('voxels', x3dom.nodeTypes.X3DVolumeDataNode);

            /**
             * The weightConstant1 field specifies a constant weight value to be use on the parent volume data.
             * @var {x3dom.fields.SFFloat} weightConstant1
             * @memberof x3dom.nodeTypes.BlendedVolumeStyle
             * @initvalue 0.5
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'weightConstant1', 0.5);

            /**
             * The weightConstant2 field specifies a constant weight value to be use on the volume data to be blended.
             * @var {x3dom.fields.SFFloat} weightConstant2
             * @memberof x3dom.nodeTypes.BlendedVolumeStyle
             * @initvalue 0.5
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'weightConstant2', 0.5);

            /**
             * The weightFunction1 field specifies the type of the weight function to be use on the parent volume data.
             * @var {x3dom.fields.SFString} weightFunction1
             * @memberof x3dom.nodeTypes.BlendedVolumeStyle
             * @initvalue "CONSTANT"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'weightFunction1', "CONSTANT");

            /**
             * The weightFunction2 field specifies the type of weight function to be use on the volume data to be blended.
             * @var {x3dom.fields.SFString} weightFunction2
             * @memberof x3dom.nodeTypes.BlendedVolumeStyle
             * @initvalue "CONSTANT"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'weightFunction2', "CONSTANT");

            /**
             * The weightTransferFunction1 field is a 2D texture that maps each opacity value to a weight value, that will be used on the parent volume data.
             * @var {x3dom.fields.SFNode} weightTransferFunction1
             * @memberof x3dom.nodeTypes.BlendedVolumeStyle
             * @initvalue x3dom.nodeTypes.X3DTexture2DNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('weightTransferFunction1', x3dom.nodeTypes.X3DTexture2DNode);

            /**
             * The weightTransferFunction2 field is a 2D texture that maps each opacity value to a weight value, that will be used on the volume data to be blended.
             * @var {x3dom.fields.SFNode} weightTransferFunction2
             * @memberof x3dom.nodeTypes.BlendedVolumeStyle
             * @initvalue x3dom.nodeTypes.X3DTexture2DNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('weightTransferFunction2', x3dom.nodeTypes.X3DTexture2DNode);

            this.uniformFloatWeightConstant1 = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatWeightConstant2 = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformSampler2DVoxels = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformSampler2DWeightTransferFunction1 = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformSampler2DWeightTransferFunction2 = new x3dom.nodeTypes.Uniform(ctx);
        
        },
        {
            fieldChanged: function(fieldName){
                switch(fieldName){
                    case 'weightConstant1':
                        this.uniformFloatWeightConstant1._vf.value = this._vf.weightConstant1;
                        this.uniformFloatWeightConstant1.fieldChanged("value");
                        break;
                    case 'weightConstant2':
                        this.uniformFloatWeightConstant2._vf.value = this._vf.weightConstant2;
                        this.uniformFloatWeightConstant2.fieldChanged("value");
                        break;
                    case 'weightFunction1':
                        //TODO: Reload node
                        break;
                    case 'weightFunction2':
                        //TODO: Reload node
                        break;
                }
            },

            uniforms: function(){
                var unis = [];
                if (this._cf.voxels.node || this._cf.weightTransferFunction1.node || this._cf.weightTransferFunction2.node) {
                    this.uniformSampler2DVoxels._vf.name = 'uVolBlendData';
                    this.uniformSampler2DVoxels._vf.type = 'SFInt32';
                    this.uniformSampler2DVoxels._vf.value = this._volumeDataParent._textureID++;
                    unis.push(this.uniformSampler2DVoxels);

                    if(this._cf.weightTransferFunction1.node){
                        this.uniformSampler2DWeightTransferFunction1._vf.name = 'uWeightTransferFunctionA';
                        this.uniformSampler2DWeightTransferFunction1._vf.type = 'SFInt32';
                        this.uniformSampler2DWeightTransferFunction1._vf.value = this._volumeDataParent._textureID++;
                        unis.push(this.uniformSampler2DWeightTransferFunction1);
                    }

                    if(this._cf.weightTransferFunction2.node){
                        this.uniformSampler2DWeightTransferFunction2._vf.name = 'uWeightTransferFunctionB';
                        this.uniformSampler2DWeightTransferFunction2._vf.type = 'SFInt32';
                        this.uniformSampler2DWeightTransferFunction2._vf.value = this._volumeDataParent._textureID++;
                        unis.push(this.uniformSampler2DWeightTransferFunction2);
                    }
                }

                this.uniformFloatWeightConstant1._vf.name = 'uWeightConstantA';
                this.uniformFloatWeightConstant1._vf.type = 'SFFloat';
                this.uniformFloatWeightConstant1._vf.value = this._vf.weightConstant1;
                unis.push(this.uniformFloatWeightConstant1);

                this.uniformFloatWeightConstant2._vf.name = 'uWeightConstantB';
                this.uniformFloatWeightConstant2._vf.type = 'SFFloat';
                this.uniformFloatWeightConstant2._vf.value = this._vf.weightConstant2;
                unis.push(this.uniformFloatWeightConstant2);

                //Also add the render style uniforms
                if (this._cf.renderStyle.node) {
                    var renderStyleUniforms = this._cf.renderStyle.node.uniforms();
                    Array.forEach(renderStyleUniforms, function(uni){
                        uni._vf.name = uni._vf.name.replace(/uSurfaceNormals/, "uBlendSurfaceNormals")
                    });
                    unis = unis.concat(renderStyleUniforms);       
                }
                return unis;
            },

            textures: function(){
                var texs = [];
                if (this._cf.voxels.node) {
                    var tex = this._cf.voxels.node;
                    tex._vf.repeatS = false;
                    tex._vf.repeatT = false;
                    texs.push(tex);
                }
                if (this._cf.weightTransferFunction1.node) {
                    var tex = this._cf.weightTransferFunction1.node;
                    tex._vf.repeatS = false;
                    tex._vf.repeatT = false;
                    texs.push(tex);
                }
                if (this._cf.weightTransferFunction2.node) {
                    var tex = this._cf.weightTransferFunction2.node;
                    tex._vf.repeatS = false;
                    tex._vf.repeatT = false;
                    texs.push(tex);
                }
                //Also add the render style textures
                if (this._cf.renderStyle.node) {
                    var renderStyleTextures = this._cf.renderStyle.node.textures();
                    texs = texs.concat(renderStyleTextures);       
                }
                return texs;
            },

            initializeValues: function(){
                var initialValues = "";
                if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                    initialValues += "  vec3 ambientBlend = vec3(0.0, 0.0, 0.0);\n"+
                    "  vec3 diffuseBlend = vec3(0.0, 0.0, 0.0);\n"+
                    "  vec3 specularBlend = vec3(0.0, 0.0, 0.0);\n";
                }
                return initialValues;
            },

            styleUniformsShaderText: function(){
                var uniformsText = "uniform float uWeightConstantA;\n"+
                    "uniform float uWeightConstantB;\n"+
                    "uniform sampler2D uBlendSurfaceNormals;\n";
                    if(this._cf.voxels.node){
                        uniformsText += "uniform sampler2D uVolBlendData;\n";
                    }
                    if(this._cf.weightTransferFunction1.node){
                        uniformsText += "uniform sampler2D uWeightTransferFunctionA;\n";
                    }
                    if(this._cf.weightTransferFunction2.node){
                        uniformsText += "uniform sampler2D uWeightTransferFunctionB;\n";
                    }
                    //Also add the render style uniforms
                    if(this._cf.renderStyle.node) {
                        uniformsText += this._cf.renderStyle.node.styleUniformsShaderText();
                    }
                return uniformsText;
            },

            styleShaderText: function(){
                var styleText = "";
                if(this._cf.renderStyle.node && this._cf.renderStyle.node.styleShaderText!=undefined) {
                    styleText += this._cf.renderStyle.node.styleShaderText();
                }
                return styleText;
            },

            inlineStyleShaderText: function(){
                var nSlices = this._cf.voxels.node._vf.numberOfSlices.toPrecision(5);
                var xSlices = this._cf.voxels.node._vf.slicesOverX.toPrecision(5);
                var ySlices = this._cf.voxels.node._vf.slicesOverY.toPrecision(5);
                var inlineText = "    vec4 blendValue = cTexture3D(uVolBlendData, ray_pos, "+ nSlices +", "+ xSlices +", "+ ySlices +");\n"+
                "    blendValue = vec4(blendValue.rgb,(0.299*blendValue.r)+(0.587*blendValue.g)+(0.114*blendValue.b));\n";
                if(this._cf.renderStyle.node && this._cf.renderStyle.node._cf.surfaceNormals.node){
                    inlineText += "    vec4 blendGradEye = getNormalFromTexture(uBlendSurfaceNormals, ray_pos, "+ nSlices +", "+ xSlices +", "+ ySlices +");\n";
                }else{
                    inlineText += "    vec4 blendGradEye = getNormalOnTheFly(uVolBlendData, ray_pos, "+ nSlices +", "+ xSlices +", "+ ySlices +");\n";
                }
                inlineText += "    vec4 blendGrad = vec4((modelViewMatrix * vec4(blendGradEye.xyz, 0.0)).xyz, blendGradEye.a);\n";
                if(this._cf.renderStyle.node){
                    var tempText = this._cf.renderStyle.node.inlineStyleShaderText().replace(/value/gm, "blendValue").replace(/grad/gm, "blendGrad");
                    inlineText += tempText.replace(/ambient/gm, "ambientBlend").replace(/diffuse/gm, "diffuseBlend").replace(/specular/gm, "specularBlend");
                }
                //obtain the first weight
                switch(this._vf.weightFunction1.toUpperCase()){
                    case "CONSTANT":
                        inlineText += "    float wA = uWeightConstantA;\n";
                        break;
                    case "ALPHA0":
                        inlineText += "    float wA = value.a;\n";
                        break;
                    case "ALPHA1":
                        inlineText += "    float wA = blendValue.a;\n";
                        break;
                    case "ONE_MINUS_ALPHA0":
                        inlineText += "    float wA = 1.0 - value.a;\n";
                        break;
                    case "ONE_MINUS_ALPHA1":
                        inlineText += "    float wA = 1.0 - blendValue.a;\n";
                        break;
                    case "TABLE":
                        if(this._cf.weightTransferFunction1){
                            inlineText += "    float wA = texture2D(uWeightTransferFunctionA, vec2(value.a, blendValue.a));\n";
                        }else{
                            inlineText += "    float wA = value.a;\n";
                            x3dom.debug.logWarning('[VolumeRendering][BlendedVolumeStyle] TABLE specified on weightFunction1 but not weightTrnafer function provided, using ALPHA0.');
                        }
                        break;
                }
                //obtain the second weight
                switch(this._vf.weightFunction2.toUpperCase()){
                    case "CONSTANT":
                        inlineText += "    float wB = uWeightConstantB;\n";
                        break;
                    case "ALPHA0":
                        inlineText += "    float wB = value.a;\n";
                        break;
                    case "ALPHA1":
                        inlineText += "    float wB = blendValue.a;\n";
                        break;
                    case "ONE_MINUS_ALPHA0":
                        inlineText += "    float wB = 1.0 - value.a;\n";
                        break;
                    case "ONE_MINUS_ALPHA1":
                        inlineText += "    float wB = 1.0 - blendValue.a;\n";
                        break;
                    case "TABLE":
                        if(this._cf.weightTransferFunction2){
                            inlineText += "    float wB = texture2D(uWeightTransferFunctionB, vec2(value.a, blendValue.a));\n";
                        }else{
                            inlineText += "    float wB = value.a;\n";
                            x3dom.debug.logWarning('[VolumeRendering][BlendedVolumeStyle] TABLE specified on weightFunction2 but not weightTrasnferFunction provided, using ALPHA0.');
                        }
                        break;
                }
                if(x3dom.nodeTypes.X3DLightNode.lightID == 0){
                    inlineText += "    value = clamp(value * wA + blendValue * wB, 0.0, 1.0);\n";
                }
                return inlineText;
            },

            lightAssigment: function(){
                var inlineText = "";
                if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                    if(this._cf.renderStyle.node){
                        var tempText = this._cf.renderStyle.node.lightAssigment().replace(/value/gm, "blendValue").replace(/grad/gm, "blendGrad");
                        inlineText += tempText.replace(/ambient/gm, "ambientBlend").replace(/diffuse/gm, "diffuseBlend").replace(/specular/gm, "specularBlend");
                    }else{
                        for(var l=0; l<x3dom.nodeTypes.X3DLightNode.lightID; l++) {
                            inlineText += "    lighting(light"+l+"_Type, " +
                            "light"+l+"_Location, " +
                            "light"+l+"_Direction, " +
                            "light"+l+"_Color, " + 
                            "light"+l+"_Attenuation, " +
                            "light"+l+"_Radius, " +
                            "light"+l+"_Intensity, " + 
                            "light"+l+"_AmbientIntensity, " +
                            "light"+l+"_BeamWidth, " +
                            "light"+l+"_CutOffAngle, " +
                            "blendGradEye.xyz, -positionE.xyz, ambientBlend, diffuseBlend, specularBlend);\n";
                        }
                        inlineText += "    blendValue.rgb = ambientBlend*blendValue.rgb + diffuseBlend*blendValue.rgb + specularBlend;\n";
                    }
                }
                inlineText += "    value.rgb = clamp(value.rgb * wA + blendValue.rgb * wB, 0.0, 1.0);\n"+
                "    value.a = clamp(value.a * wA + blendValue.a * wB, 0.0, 1.0);\n";
                return inlineText; //previously computed, empty string
            }
        }
    )
);