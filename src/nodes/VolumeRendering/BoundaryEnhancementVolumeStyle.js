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
/* ### BoundaryEnhancementVolumeStyle ### */
x3dom.registerNodeType(
    "BoundaryEnhancementVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        
        /**
         * Constructor for BoundaryEnhancementVolumeStyle
         * @constructs x3dom.nodeTypes.BoundaryEnhancementVolumeStyle
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The BoundaryEnhancementVolumeStyle node specifies that the boundaries of the volume data shall be enhanced. The rendering is performed based on the gradient magnitude.
         * Areas where density varies are made more visible than areas of constant density.
         */
        function (ctx) {
            x3dom.nodeTypes.BoundaryEnhancementVolumeStyle.superClass.call(this, ctx);


            /**
             * The retainedOpacity field specifies the amount of original opacity to retain.
             * @var {x3dom.fields.SFFloat} retainedOpacity
             * @memberof x3dom.nodeTypes.BoundaryEnhancementVolumeStyle
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'retainedOpacity', 1);

            /**
             * The boundaryOpacity field specifies the amount of boundary enhancement to use.
             * @var {x3dom.fields.SFFloat} boundaryOpacity
             * @memberof x3dom.nodeTypes.BoundaryEnhancementVolumeStyle
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'boundaryOpacity', 0);

            /**
             * The opacityFactor field is an exponent factor that specifies the slope of the opacity curve to highlight the boundary.
             * @var {x3dom.fields.SFFloat} opacityFactor
             * @memberof x3dom.nodeTypes.BoundaryEnhancementVolumeStyle
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'opacityFactor', 1);

            this.uniformFloatRetainedOpacity = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatBoundaryOpacity = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatOpacityFactor = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformSampler2DSurfaceNormals = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformBoolEnableBoundary = new x3dom.nodeTypes.Uniform(ctx);
        
        },
        {
            fieldChanged: function(fieldName){
                switch(fieldName){
                    case 'retainedOpacity':
                        this.uniformFloatRetainedOpacity._vf.value = this._vf.retainedOpacity;
                        this.uniformFloatRetainedOpacity.fieldChanged("value");
                        break;
                    case 'boundaryOpacity':
                        this.uniformFloatBoundaryOpacity._vf.value = this._vf.boundaryOpacity;
                        this.uniformFloatBoundaryOpacity.fieldChanged("value");
                        break;
                    case 'opacityFactor':
                        this.uniformFloatOpacityFactor._vf.value = this._vf.opacityFactor;
                        this.uniformFloatOpacityFactor.fieldChanged("value");
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
                        x3dom.debug.logError("[VolumeRendering][BoundaryEnhancementVolumeStyle] Not VolumeData parent found!");
                        volumeDataParent = null;
                    }
                    this.uniformSampler2DSurfaceNormals._vf.name = 'uSurfaceNormals';
                    this.uniformSampler2DSurfaceNormals._vf.type = 'SFInt32';
                    this.uniformSampler2DSurfaceNormals._vf.value = volumeDataParent._textureID++;
                    unis.push(this.uniformSampler2DSurfaceNormals);
                }

                this.uniformFloatRetainedOpacity._vf.name = 'uRetainedOpacity'+this._styleID;
                this.uniformFloatRetainedOpacity._vf.type = 'SFFloat';
                this.uniformFloatRetainedOpacity._vf.value = this._vf.retainedOpacity;
                unis.push(this.uniformFloatRetainedOpacity);

                this.uniformFloatBoundaryOpacity._vf.name = 'uBoundaryOpacity'+this._styleID;
                this.uniformFloatBoundaryOpacity._vf.type = 'SFFloat';
                this.uniformFloatBoundaryOpacity._vf.value = this._vf.boundaryOpacity;
                unis.push(this.uniformFloatBoundaryOpacity);

                this.uniformFloatOpacityFactor._vf.name = 'uOpacityFactor'+this._styleID;
                this.uniformFloatOpacityFactor._vf.type = 'SFFloat';
                this.uniformFloatOpacityFactor._vf.value = this._vf.opacityFactor;
                unis.push(this.uniformFloatOpacityFactor);

                this.uniformBoolEnableBoundary._vf.name = 'uEnableBoundary'+this._styleID;
                this.uniformBoolEnableBoundary._vf.type = 'SFBool';
                this.uniformBoolEnableBoundary._vf.value = this._vf.enabled;
                unis.push(this.uniformBoolEnableBoundary);
                return unis;
            },

            textures: function() {
                var texs = [];
                if (!(this._cf.surfaceNormals.node==null)) {
                    var tex = this._cf.surfaceNormals.node;
                    tex._vf.repeatS = false;
                    tex._vf.repeatT = false;
                    texs.push(tex)
                }
                return texs;
            },

            styleUniformsShaderText: function(){
                return "uniform float uRetainedOpacity"+this._styleID+";\n"+
                    "uniform float uBoundaryOpacity"+this._styleID+";\n"+
                    "uniform float uOpacityFactor"+this._styleID+";\n"+
                    "uniform bool uEnableBoundary"+this._styleID+";\n";
            },

            styleShaderText: function(){
                if (this._first){
                    return "void boundaryEnhancement(inout vec4 original_color, in float gradientMagnitude, in float retainedOpacity, in float boundaryOpacity, in float opacityFactor){\n"+
                    "   original_color.a = original_color.a * (retainedOpacity + (boundaryOpacity * pow(gradientMagnitude, opacityFactor)));\n"+
                    "}\n";
                }else{
                    return "";
                }
            },

            inlineStyleShaderText: function(){
                var inlineText = "    if(uEnableBoundary"+this._styleID+"){\n"+
                "    boundaryEnhancement(value, grad.w, uRetainedOpacity"+this._styleID+", uBoundaryOpacity"+this._styleID+", uOpacityFactor"+this._styleID+");\n"+
                "}\n";
                return inlineText;
            }
        }
    )
);