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

/* ### SilhouetteEnhancementVolumeStyle ### */
x3dom.registerNodeType(
    "SilhouetteEnhancementVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        
        /**
         * Constructor for SilhouetteEnhancementVolumeStyle
         * @constructs x3dom.nodeTypes.SilhouetteEnhancementVolumeStyle
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The SilhouetteEnhancementVolumeStyle node specifies that silhouettes of the assocciated volume data are going to be enhanced.
         * Voxels opacity are modified based on their normals orientation relative to the view direction. When the normal orientation is perpendicular towards the view direction,
         * voxels are darkened, whereas when it is parallel towards the view direction, the opacity is not enhanced.
         */
        function (ctx) {
            x3dom.nodeTypes.SilhouetteEnhancementVolumeStyle.superClass.call(this, ctx);


            /**
             * The silhouetteBoundaryOpacity field is a factor to specify the amount of silhouette enhancement to use.
             * @var {x3dom.fields.SFFloat} silhouetteBoundaryOpacity
             * @memberof x3dom.nodeTypes.SilhouetteEnhancementVolumeStyle
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'silhouetteBoundaryOpacity', 0);

            /**
             * The silhouetteRetainedOpacity field is a factor to specify the amount of original opacity to retain.
             * @var {x3dom.fields.SFFloat} silhouetteRetainedOpacity
             * @memberof x3dom.nodeTypes.SilhouetteEnhancementVolumeStyle
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'silhouetteRetainedOpacity', 1);

            /**
             * The silhouetteSharpness field is an exponent factor to specify the silhouette sharpness.
             * @var {x3dom.fields.SFFloat} silhouetteSharpness
             * @memberof x3dom.nodeTypes.SilhouetteEnhancementVolumeStyle
             * @initvalue 0.5
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'silhouetteSharpness', 0.5);

            this.uniformFloatBoundaryOpacity = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatRetainedOpacity = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatSilhouetteSharpness = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformSampler2DSurfaceNormals = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformBoolEnableSilhouette = new x3dom.nodeTypes.Uniform(ctx);
        
        },
        { 
            fieldChanged: function(fieldName){
                switch(fieldName){
                    case 'silhouetteBoundaryOpacity':
                        this.uniformFloatBoundaryOpacity._vf.value = this._vf.silhouetteBoundaryOpacity;
                        this.uniformFloatBoundaryOpacity.fieldChanged("value");
                        break;
                    case 'silhouetteRetainedOpacity':
                        this.uniformFloatRetainedOpacity._vf.value = this._vf.silhouetteRetainedOpacity;
                        this.uniformFloatRetainedOpacity.fieldChanged("value");
                        break;
                    case 'silhouetteSharpness':
                        this.uniformFloatSilhouetteSharpness._vf.value = this._vf.silhouetteSharpness;
                        this.uniformFloatSilhouetteSharpness.fieldChanged("value");
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

                this.uniformFloatBoundaryOpacity._vf.name = 'uSilhouetteBoundaryOpacity'+this._styleID;
                this.uniformFloatBoundaryOpacity._vf.type = 'SFFloat';
                this.uniformFloatBoundaryOpacity._vf.value = this._vf.silhouetteBoundaryOpacity;
                unis.push(this.uniformFloatBoundaryOpacity);

                this.uniformFloatRetainedOpacity._vf.name = 'uSilhouetteRetainedOpacity'+this._styleID;
                this.uniformFloatRetainedOpacity._vf.type = 'SFFloat';
                this.uniformFloatRetainedOpacity._vf.value = this._vf.silhouetteRetainedOpacity;
                unis.push(this.uniformFloatRetainedOpacity);

                this.uniformFloatSilhouetteSharpness._vf.name = 'uSilhouetteSharpness'+this._styleID;
                this.uniformFloatSilhouetteSharpness._vf.type = 'SFFloat';
                this.uniformFloatSilhouetteSharpness._vf.value = this._vf.silhouetteSharpness;
                unis.push(this.uniformFloatSilhouetteSharpness);

                this.uniformBoolEnableSilhouette._vf.name = 'uEnableSilhouette'+this._styleID;
                this.uniformBoolEnableSilhouette._vf.type = 'SFBool';
                this.uniformBoolEnableSilhouette._vf.value = this._vf.enabled;
                unis.push(this.uniformBoolEnableSilhouette);

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
                return "uniform float uSilhouetteBoundaryOpacity"+this._styleID+";\n"+
                    "uniform float uSilhouetteRetainedOpacity"+this._styleID+";\n"+
                    "uniform float uSilhouetteSharpness"+this._styleID+";\n"+
                    "uniform bool uEnableSilhouette"+this._styleID+";\n";
            },

            styleShaderText: function(){
                if (this._first){
                    return "void silhouetteEnhancement(inout vec4 orig_color, in vec4 normal, in vec3 V, in float sBoundary, in float sRetained, in float sSharpness)\n"+
                    "{\n"+
                    "   if(normal.w > 0.02){\n"+
                    "       orig_color.a = orig_color.a * (sRetained + sBoundary * pow((1.0-abs(dot(normal.xyz, V))), sSharpness));\n"+
                    "   }\n"+
                    "}\n"+
                    "\n";
                }else{
                    return "";
                }                
            },

            inlineStyleShaderText: function(){
                var inlineText = "  if(uEnableSilhouette"+this._styleID+"){\n"+
                "       silhouetteEnhancement(value, gradEye, dir, uSilhouetteBoundaryOpacity"+this._styleID+", uSilhouetteRetainedOpacity"+this._styleID+", uSilhouetteSharpness"+this._styleID+");\n"+
                "   }\n";
                return inlineText;
            }
        }
    )
);