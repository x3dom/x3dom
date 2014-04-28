/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
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
         * Voxels opacity are modified based on their normals orientation relative to the view direction. When the orientation is perpendicular towards the view directions
         * voxels are darkened, whereas it is parallel towards the view directions the opacity is not enhanced.
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
                    //Lookup for the parent VolumeData
                    var volumeDataParent = this._parentNodes[0];
                    while(!x3dom.isa(volumeDataParent, x3dom.nodeTypes.X3DVolumeDataNode) || !x3dom.isa(volumeDataParent, x3dom.nodeTypes.X3DNode)){
                        volumeDataParent = volumeDataParent._parentNodes[0];
                    }
                    if(x3dom.isa(volumeDataParent, x3dom.nodeTypes.X3DVolumeDataNode) == false){
                        x3dom.debug.logError("[VolumeRendering][SilhouetteEnhancementVolumeStyle] Not VolumeData parent found!");
                        volumeDataParent = null;
                    }
                    this.uniformSampler2DSurfaceNormals._vf.name = 'uSurfaceNormals';
                    this.uniformSampler2DSurfaceNormals._vf.type = 'SFInt32';
                    this.uniformSampler2DSurfaceNormals._vf.value = volumeDataParent._textureID++;
                    unis.push(this.uniformSampler2DSurfaceNormals);
                }

                this.uniformFloatBoundaryOpacity._vf.name = 'uSilhouetteBoundaryOpacity';
                this.uniformFloatBoundaryOpacity._vf.type = 'SFFloat';
                this.uniformFloatBoundaryOpacity._vf.value = this._vf.silhouetteBoundaryOpacity;
                unis.push(this.uniformFloatBoundaryOpacity);

                this.uniformFloatRetainedOpacity._vf.name = 'uSilhouetteRetainedOpacity';
                this.uniformFloatRetainedOpacity._vf.type = 'SFFloat';
                this.uniformFloatRetainedOpacity._vf.value = this._vf.silhouetteRetainedOpacity;
                unis.push(this.uniformFloatRetainedOpacity);

                this.uniformFloatSilhouetteSharpness._vf.name = 'uSilhouetteSharpness';
                this.uniformFloatSilhouetteSharpness._vf.type = 'SFFloat';
                this.uniformFloatSilhouetteSharpness._vf.value = this._vf.silhouetteSharpness;
                unis.push(this.uniformFloatSilhouetteSharpness);

                this.uniformBoolEnableSilhouette._vf.name = 'uEnableSilhouette';
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
                return "uniform float uSilhouetteBoundaryOpacity;\n"+
                    "uniform float uSilhouetteRetainedOpacity;\n"+
                    "uniform float uSilhouetteSharpness;\n"+
                    "uniform bool uEnableSilhouette;\n";
            },

            styleShaderText: function(){
                return "void silhouetteEnhancement(inout vec4 orig_color, vec4 normal, vec3 V)\n"+
                    "{\n"+
                    "   orig_color.a = orig_color.a * (uSilhouetteRetainedOpacity + uSilhouetteBoundaryOpacity * pow((1.0-abs(dot(normal.xyz, V))), uSilhouetteSharpness));\n"+
                    "}\n"+
                    "\n";
            },

            inlineStyleShaderText: function(){
                var inlineText = "  if(uEnableSilhouette){\n"+
                    "       silhouetteEnhancement(value, grad, normalize(dir));\n"+
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