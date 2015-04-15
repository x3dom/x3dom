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

/* ### CartoonVolumeStyle ### */
x3dom.registerNodeType(
    "CartoonVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        
        /**
         * Constructor for CartoonVolumeStyle
         * @constructs x3dom.nodeTypes.CartoonVolumeStyle
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The CartoonVolumeStyle node specifies that the associated volume data shall be rendered with a cartoon style non-photorealistic rendering.
         * The cartoon styles uses two colors the rendering will depend on the local surface normals and the view direction.
         */
        function (ctx) {
            x3dom.nodeTypes.CartoonVolumeStyle.superClass.call(this, ctx);


            /**
             * The parallelColor field specifies the color to be used when the surface normal is parallel to the view direction.
             * @var {x3dom.fields.SFColor} parallelColor
             * @memberof x3dom.nodeTypes.CartoonVolumeStyle
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'parallelColor', 0, 0, 0);

            /**
             * The orthogonalColor field specifies the color to be used when the surface normal is perpendicular to the view direction.
             * @var {x3dom.fields.SFColor} orthogonalColor
             * @memberof x3dom.nodeTypes.CartoonVolumeStyle
             * @initvalue 1,1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'orthogonalColor', 1, 1, 1);

            /**
             * The colorSteps field specifies how many distinct colors are taken from the interpolated colors and used to render the object.
             * @var {x3dom.fields.SFInt32} colorSteps
             * @memberof x3dom.nodeTypes.CartoonVolumeStyle
             * @initvalue 4
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'colorSteps', 4);

            this.uniformParallelColor = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformOrthogonalColor = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformIntColorSteps = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformSampler2DSurfaceNormals = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformBoolEnableCartoon = new x3dom.nodeTypes.Uniform(ctx);
        
        },
        {
            fieldChanged: function(fieldName){
                switch(fieldName){
                    case 'parallelColor':
                        this.uniformParallelColor._vf.value = this._vf.parallelColor;
                        this.uniformParallelColor.fieldChanged("value");
                        break;
                    case 'orthogonalColor':
                        this.uniformOrthogonalColor._vf.value = this._vf.orthogonalColor;
                        this.uniformOrthogonalColor.fieldChanged("value");
                        break;
                    case 'colorSteps':
                        this.uniformIntColorSteps._vf.value = this._vf.colorSteps;
                        this.uniformIntColorSteps.fieldChanged("value");
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

                this.uniformParallelColor._vf.name = 'uParallelColor'+this._styleID;
                this.uniformParallelColor._vf.type = 'SFColor';
                this.uniformParallelColor._vf.value = this._vf.parallelColor;
                unis.push(this.uniformParallelColor);

                this.uniformOrthogonalColor._vf.name = 'uOrthogonalColor'+this._styleID;
                this.uniformOrthogonalColor._vf.type = 'SFColor';
                this.uniformOrthogonalColor._vf.value = this._vf.orthogonalColor;
                unis.push(this.uniformOrthogonalColor);

                this.uniformIntColorSteps._vf.name = 'uColorSteps'+this._styleID;
                this.uniformIntColorSteps._vf.type = 'SFInt32';
                this.uniformIntColorSteps._vf.value = this._vf.colorSteps;
                unis.push(this.uniformIntColorSteps);

                this.uniformBoolEnableCartoon._vf.name = 'uEnableCartoon'+this._styleID;
                this.uniformBoolEnableCartoon._vf.type = 'SFBool';
                this.uniformBoolEnableCartoon._vf.value = this._vf.enabled;
                unis.push(this.uniformBoolEnableCartoon);

                return unis;
            },

            textures: function() {
                var texs = [];
                if (this._cf.surfaceNormals.node) {
                    var tex = this._cf.surfaceNormals.node;
                    tex._vf.repeatS = false;
                    tex._vf.repeatT = false;
                    texs.push(tex);
                }
                return texs;
            },

            styleShaderText: function(){
                if (this._first){
                    return "//Convert RGBA color to HSVA\n"+
                    "vec4 rgba2hsva(vec4 rgba){\n"+
                    "   float zat, izen;\n"+
                    "   float R = rgba.r, G = rgba.g, B = rgba.b;\n"+
                    "   float minim = min(R, min(G, B)), maxim = max(R, max(G, B));\n"+
                    "   float delta = maxim-minim;\n"+
                    "   if(minim == maxim){\n"+
                    "       return vec4(0.0, 0.0, maxim, rgba.a);\n"+
                    "   }else{\n"+
                    "       zat = (R == maxim) ? G - B : ((G == maxim) ? B - R : R - G);\n"+ 
                    "       izen = (R == maxim) ? ((G<B) ? 6.0 : 0.0) : ((G == maxim) ? 2.0 : 4.0);\n"+ 
                    "        return vec4((zat/delta + izen)/6.0, delta/maxim, maxim, rgba.a);\n"+ 
                    "    }\n"+
                    "}\n"+
                    "\n"+
                    "//Convert RGB color to HSV\n"+
                    "vec3 rgb2hsv(vec3 rgb){\n"+
                    "    return rgba2hsva(vec4(rgb, 1.0)).rgb;\n"+
                    "}\n"+
                    "\n"+
                    "//Convert HSVA color to RGBA\n"+
                    "vec4 hsva2rgba(vec4 hsva){\n"+
                    "   float r, g, b;\n"+
                    "   float h=hsva.x, s=hsva.y, v=hsva.z;\n"+
                    "   float i = floor(h * 6.0);\n"+
                    "   float f = h * 6.0 - i;\n"+
                    "   float p = v * (1.0 - s);\n"+
                    "   float q = v * (1.0 - f * s);\n"+
                    "   float t = v * (1.0 - (1.0 - f) * s);\n"+
                    "   i = mod(i,6.0);\n"+
                    "   if( i == 6.0 || i == 0.0 ) r = v, g = t, b = p;\n"+
                    "   else if( i == 1.0) r = q, g = v, b = p;\n"+
                    "   else if( i == 2.0) r = p, g = v, b = t;\n"+
                    "   else if( i == 3.0) r = p, g = q, b = v;\n"+
                    "   else if( i == 4.0) r = t, g = p, b = v;\n"+
                    "   else if( i == 5.0) r = v, g = p, b = q;\n"+
                    "   return vec4(r,g,b,hsva.w);\n"+
                    "}\n"+
                    "\n"+
                    "//Convert HSV color to RGB\n"+
                    "vec3 hsv2rgb(vec3 hsv){\n"+
                    "   return hsva2rgba(vec4(hsv, 1.0)).rgb;\n"+
                    "}\n"+
                    "void getCartoonStyle(inout vec4 outputColor, vec3 orthogonalColor, vec3 parallelColor, int colorSteps, vec4 surfNormal, vec3 V)\n"+
                    "{\n"+
                    "   float steps = clamp(float(colorSteps), 1.0,64.0);\n"+
                    "   float range_size = pi_half / steps;\n"+
                    "   float cos_angle = abs(dot(surfNormal.xyz, V));\n"+
                    "   float interval = clamp(floor(cos_angle / range_size),0.0,steps);\n"+
                    "   float ang = interval * range_size;\n"+
                    "   outputColor.rgb = hsv2rgb(mix(orthogonalColor, parallelColor, ang));\n"+
                    "}\n"+
                    "\n";
                }else{
                    return "";
                }
            },

            styleUniformsShaderText: function(){
                var styleText = "uniform vec3 uParallelColor"+this._styleID+";\n"+
                "uniform vec3 uOrthogonalColor"+this._styleID+";\n"+
                "uniform int uColorSteps"+this._styleID+";\n"+
                "uniform bool uEnableCartoon"+this._styleID+";\n";
                if (this._first) {
                    styleText += "const float pi_half = "+ (Math.PI/2.0).toPrecision(5) +";\n";
                }
                return styleText;
            },

            inlineStyleShaderText: function(){
                var inlineText = "  if(uEnableCartoon"+this._styleID+"){\n"+
                "      getCartoonStyle(value, rgb2hsv(uOrthogonalColor"+this._styleID+"), rgb2hsv(uParallelColor"+this._styleID+"), uColorSteps"+this._styleID+", gradEye, dir);\n"+
                "  }\n";   
                return inlineText;
            }
        }
    )
);