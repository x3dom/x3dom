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

/* ### OpacityMapVolumeStyle ### */
x3dom.registerNodeType(
    "OpacityMapVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        
        /**
         * Constructor for OpacityMapVolumeStyle
         * @constructs x3dom.nodeTypes.OpacityMapVolumeStyle
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * The OpacityMapVolumeStyle node specifies that the associated volume data is going to be rendered using a transfer function.
         * The original opacity is mapped to a function stored as a texture (transfer function).
         */
        function (ctx) {
            x3dom.nodeTypes.OpacityMapVolumeStyle.superClass.call(this, ctx);


            /**
             * The transferFunction field is a texture that is going to be used to map each voxel value to a specific color output.
             * @var {x3dom.fields.SFNode} transferFunction
             * @memberof x3dom.nodeTypes.OpacityMapVolumeStyle
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('transferFunction', x3dom.nodeTypes.Texture);

            /**
             * NYI!!
             * @var {x3dom.fields.SFString} type
             * @memberof x3dom.nodeTypes.OpacityMapVolumeStyle
             * @initvalue "simple"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'type', "simple");

            /**
             * The opacityFactor field is a factor to specify the amount of opacity to be considered on each sampled point along the ray traversal.
             * @var {x3dom.fields.SFFloat} opacityFactor
             * @memberof x3dom.nodeTypes.OpacityMapVolumeStyle
             * @initvalue 6.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'opacityFactor', 6.0);

            /**
             * The lightFactor field is a factor to specify the amount of global light to be considered on each sampled point along the ray traversal.
             * @var {x3dom.fields.SFFloat} lightFactor
             * @memberof x3dom.nodeTypes.OpacityMapVolumeStyle
             * @initvalue 1.2
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'lightFactor', 1.2);

            this.uniformFloatOpacityFactor = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatLightFactor = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformSampler2DTransferFunction = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformBoolEnableOpacityMap = new x3dom.nodeTypes.Uniform(ctx);
        
        },
        {
            fieldChanged: function(fieldName){
                switch(fieldName){
                    case 'opacityFactor':
                        this.uniformFloatOpacityFactor._vf.value = this._vf.opacityFactor;
                        this.uniformFloatOpacityFactor.fieldChanged("value");
                        break;
                    case 'lightFactor':
                        this.uniformFloatLightFactor._vf.value = this._vf.lightFactor;
                        this.uniformFloatLightFactor.fieldChanged("value");
                        break;
                }
            },

            uniforms: function() {
                var unis = [];
                
                if (this._cf.transferFunction.node) {
                    //Lookup for the parent VolumeData
                    var volumeDataParent = this._parentNodes[0];
                    while(!x3dom.isa(volumeDataParent, x3dom.nodeTypes.X3DVolumeDataNode) || !x3dom.isa(volumeDataParent, x3dom.nodeTypes.X3DNode)){
                        volumeDataParent = volumeDataParent._parentNodes[0];
                    }
                    if(x3dom.isa(volumeDataParent, x3dom.nodeTypes.X3DVolumeDataNode) == false){
                        x3dom.debug.logError("[VolumeRendering][OpacityMapVolumeStyle] Not VolumeData parent found!");
                        volumeDataParent = null;
                    }
                    this.uniformSampler2DTransferFunction._vf.name = 'uTransferFunction';
                    this.uniformSampler2DTransferFunction._vf.type = 'SFInt32';
                    this.uniformSampler2DTransferFunction._vf.value = volumeDataParent._textureID++;
                    unis.push(this.uniformSampler2DTransferFunction);
                }

                this.uniformFloatOpacityFactor._vf.name = 'uOpacityFactor';
                this.uniformFloatOpacityFactor._vf.type = 'SFFloat';
                this.uniformFloatOpacityFactor._vf.value = this._vf.opacityFactor;
                unis.push(this.uniformFloatOpacityFactor);

                this.uniformFloatLightFactor._vf.name = 'uLightFactor';
                this.uniformFloatLightFactor._vf.type = 'SFFloat';
                this.uniformFloatLightFactor._vf.value = this._vf.lightFactor;
                unis.push(this.uniformFloatLightFactor);

                this.uniformBoolEnableOpacityMap._vf.name = 'uEnableOpacityMap';
                this.uniformBoolEnableOpacityMap._vf.type = 'SFBool';
                this.uniformBoolEnableOpacityMap._vf.value = this._vf.enabled;
                unis.push(this.uniformBoolEnableOpacityMap);

                return unis;
            },

            textures: function() {
                var texs = [];
                var tex = this._cf.transferFunction.node;
                if (tex) {
                    tex._vf.repeatS = false;
                    tex._vf.repeatT = false;
                    texs.push(tex);
                }
                return texs;
            },

            styleUniformsShaderText: function() {
                var uniformsText = "uniform float uOpacityFactor;\n"+
                "uniform float uLightFactor;\n"+
                "uniform bool uEnableOpacityMap;\n";
                if (this._cf.transferFunction.node) {
                        uniformsText += "uniform sampler2D uTransferFunction;\n";
                }
                return uniformsText;
            },

            inlineStyleShaderText: function(){
                var shaderText = "    if(uEnableOpacityMap){\n"+
                "       opacityFactor = uOpacityFactor;\n"+
                "       lightFactor = uLightFactor;\n";
                if (this._cf.transferFunction.node){
                        shaderText += "     value = texture2D(uTransferFunction,vec2(value.r,0.5));\n";
                }
                shaderText += "    }\n";
                return shaderText;
            }
        }
    )
);