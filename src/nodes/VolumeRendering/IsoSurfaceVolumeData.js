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

/* ### IsoSurfaceVolumeData ### */
x3dom.registerNodeType(
    "IsoSurfaceVolumeData",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeDataNode,
        
        /**
         * Constructor for IsoSurfaceVolumeData
         * @constructs x3dom.nodeTypes.IsoSurfaceVolumeData
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DVolumeDataNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The IsoSurfaceVolumeData node specifies one or more surfaces to be extracted from the volume data.
         */
        function (ctx) {
            x3dom.nodeTypes.IsoSurfaceVolumeData.superClass.call(this, ctx);


            /**
             * The renderStyle field contains a list of volume render style nodes to be used on each isosurface.
             * @var {x3dom.fields.MFNode} renderStyle
             * @memberof x3dom.nodeTypes.IsoSurfaceVolumeData
             * @initvalue x3dom.nodeTypes.X3DVolumeRenderStyleNode
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('renderStyle', x3dom.nodeTypes.X3DVolumeRenderStyleNode);

            /**
             * The gradients field allows to provide the normals of the volume data. It takes an ImageTextureAtlas of the same dimensions of the volume data. If it is not provided, it is computed on the fly.
             * @var {x3dom.fields.SFNode} gradients
             * @memberof x3dom.nodeTypes.IsoSurfaceVolumeData
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('gradients', x3dom.nodeTypes.Texture);
            //this.addField_SFNode('gradients', x3dom.nodeTypes.X3DTexture3DNode);

            /**
             * The surfaceValues field is a list containing the surface values to be extracted. One or multiple isovalues can be declared.
             * @var {x3dom.fields.MFFloat} surfaceValues
             * @memberof x3dom.nodeTypes.IsoSurfaceVolumeData
             * @initvalue [0.0]
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'surfaceValues', [0.0]);

            /**
             * The countourStepSize field specifies an step size to render isosurfaces that are multiples of an initial isovalue.
             * When this field is non-zero a single isovalue must be defined on the surfaceValues field.
             * @var {x3dom.fields.SFFloat} contourStepSize
             * @memberof x3dom.nodeTypes.IsoSurfaceVolumeData
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'contourStepSize', 0);

            /**
             * The surfaceTolerance field is a threshold to adjust the boundary of the isosurface.
             * @var {x3dom.fields.SFFloat} surfaceTolerance
             * @memberof x3dom.nodeTypes.IsoSurfaceVolumeData
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'surfaceTolerance', 0);

            this.uniformSampler2DGradients = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatContourStepSize = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatSurfaceTolerance = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatArraySurfaceValues = new x3dom.nodeTypes.Uniform(ctx);

            this.vrcMultiTexture = new x3dom.nodeTypes.MultiTexture(ctx);
            this.vrcVolumeTexture = null;

            this.vrcSinglePassShader = new x3dom.nodeTypes.ComposedShader(ctx);
            this.vrcSinglePassShaderVertex = new x3dom.nodeTypes.ShaderPart(ctx);
            this.vrcSinglePassShaderFragment = new x3dom.nodeTypes.ShaderPart(ctx);
            this.vrcSinglePassShaderFieldVolData = new x3dom.nodeTypes.Field(ctx);
            this.vrcSinglePassShaderFieldOffset = new x3dom.nodeTypes.Field(ctx);
            this.vrcSinglePassShaderFieldDimensions = new x3dom.nodeTypes.Field(ctx);
        },
        {
            fieldChanged: function(fieldName){
                switch(fieldName){
                    case 'surfaceValues':
                        this.uniformFloatArraySurfaceValues._vf.value = this._vf.surfaceValues;
                        this.uniformFloatArraySurfaceValues.fieldChanged("value");
                        //TODO: Reload node
                        break;
                    case 'surfaceTolerance':
                        this.uniformFloatSurfaceTolerance._vf.value = this._vf.surfaceTolerance;
                        this.uniformFloatSurfaceTolerance.fieldChanged("value");
                        break;
                    case 'contourStepSize':
                        //TODO: Reload node
                        break;
                }
            },

            uniforms: function(){
                var unis = [];
                if (this._cf.gradients.node){
                    this.uniformSampler2DGradients._vf.name = 'uSurfaceNormals';
                    this.uniformSampler2DGradients._vf.type = 'SFInt32';
                    this.uniformSampler2DGradients._vf.value = this._textureID++;
                    unis.push(this.uniformSampler2DGradients);
                }

                this.uniformFloatArraySurfaceValues._vf.name = 'uSurfaceValues';
                this.uniformFloatArraySurfaceValues._vf.type = 'MFFloat';
                this.uniformFloatArraySurfaceValues._vf.value = this._vf.surfaceValues;
                unis.push(this.uniformFloatArraySurfaceValues);

                this.uniformFloatSurfaceTolerance._vf.name = 'uSurfaceTolerance';
                this.uniformFloatSurfaceTolerance._vf.type = 'MFFloat';
                this.uniformFloatSurfaceTolerance._vf.value = this._vf.surfaceTolerance;
                unis.push(this.uniformFloatSurfaceTolerance);

                if (this._cf.renderStyle.nodes) {
                    var n = this._cf.renderStyle.nodes.length;
                    for (var i=0; i<n; i++){
                        //Not repeat common uniforms, TODO: Allow multiple surface normals
                        Array.forEach(this._cf.renderStyle.nodes[i].uniforms(), function(uniform){
                            var contains_uniform = false;
                            Array.forEach(unis, function(accum){
                                if(accum._vf.name == uniform._vf.name){
                                    contains_uniform = true;
                                }
                            });
                            if (contains_uniform == false){
                                unis = unis.concat(uniform);
                            }
                        });
                    }    
                }
                return unis;
            },

            textures: function(){
                var texs = [];
                if(this._cf.gradients.node){
                    var tex = this._cf.gradients.node;
                    tex._vf.repeatS = false;
                    tex._vf.repeatT = false;
                    texs.push(tex);
                }

                var i, n = this._cf.renderStyle.nodes.length;
                for (i=0; i<n; i++){
                    //Not repeat same textures, TODO: Allow multiply surface normals textures
                    Array.forEach(this._cf.renderStyle.nodes[i].textures(), function(texture){
                        var contains_texture = false;
                        Array.forEach(texs, function(accum){
                            if(accum._vf.url[0] == texture._vf.url[0]){
                                contains_texture = true;
                            }
                        });
                        if (contains_texture == false){
                            texs = texs.concat(texture);
                        }
                    });
                }
                return texs;
            },

            initializeValues: function() {
                var initialValues ="  float previous_value = 0.0;\n";
                var n = this._cf.renderStyle.nodes.length;
                for (var i=0; i<n; i++){
                    if(this._cf.renderStyle.nodes[i].initializeValues != undefined){
                        initialValues += this._cf.renderStyle.nodes[i].initializeValues() + "\n";
                    }
                }
                return initialValues;
            },

            styleUniformsShaderText: function(){
                var styleText = "uniform float uSurfaceTolerance;\n"+
                "uniform float uSurfaceValues["+this._vf.surfaceValues.length+"];\n";
                if(this._cf.gradients.node){
                    styleText += "uniform sampler2D uSurfaceNormals;\n";
                }
                var n = this._cf.renderStyle.nodes.length;
                for (var i=0; i<n; i++){
                    styleText += this._cf.renderStyle.nodes[i].styleUniformsShaderText() + "\n";
                    if(this._cf.renderStyle.nodes[i]._cf.surfaceNormals && this._cf.renderStyle.nodes[i]._cf.surfaceNormals.node != null){
                        this.normalTextureProvided = true;
                        this.surfaceNormals = this._cf.renderStyle.nodes[i]._cf.surfaceNormals.node;
                    }
                }
                //Always needed for the isosurface
                this.surfaceNormalsNeeded = true;   
                return styleText;
            },

            inlineStyleShaderText: function(){
                var inlineText = "    sample = value.r;\n";
                if(this._vf.surfaceValues.length == 1) { //Only one surface value
                    if(this._vf.contourStepSize == 0.0){
                        inlineText += "   if(((sample>=uSurfaceValues[0] && previous_value<uSurfaceValues[0])||(sample<uSurfaceValues[0] && previous_value>=uSurfaceValues[0])) && (grad.a>=uSurfaceTolerance)){\n"+
                        "       value = vec4(vec3(uSurfaceValues[0]),1.0);\n";
                        if(this._cf.renderStyle.nodes){
                            inlineText += this._cf.renderStyle.nodes[0].inlineStyleShaderText();
                        }
                        inlineText += "       accum.rgb += (1.0 - accum.a) * (value.rgb * value.a);\n"+
                        "       accum.a += (1.0 - accum.a) * value.a;\n"+
                        "   }\n"; 
                    }else{ //multiple iso values with the contour step size
                        var tmp = this._vf.surfaceValues[0];
                        var positive_range = [tmp];
                        var negative_range = [];
                        var range = [];
                        while(tmp+this._vf.contourStepSize <= 1.0){
                            tmp+=this._vf.contourStepSize;
                            positive_range.push(tmp);
                        }
                        tmp = this._vf.surfaceValues[0];
                        while(tmp-this._vf.contourStepSize >= 0.0){
                            tmp-=this._vf.contourStepSize;
                            negative_range.unshift(tmp);
                        }
                        range = negative_range.concat(positive_range);
                        for (var i = 0; i <= range.length - 1; i++) {
                            var s_value = range[i].toPrecision(3);
                            inlineText += " if(((sample>="+s_value+" && previous_value<"+s_value+")||(sample<"+s_value+" && previous_value>="+s_value+")) && (grad.a>=uSurfaceTolerance)){\n"+
                            "       value = vec4(vec3("+s_value+"),1.0);\n";
                            if(this._cf.renderStyle.nodes){
                                inlineText += this._cf.renderStyle.nodes[0].inlineStyleShaderText();
                            }
                            inlineText += "       accum.rgb += (1.0 - accum.a) * (value.rgb * value.a);\n"+
                            "       accum.a += (1.0 - accum.a) * value.a;\n"+
                            "   }\n"; 
                        };
                    }
                }else{ //Multiple isosurface values had been specified by the user
                    var n_styles = this._cf.renderStyle.nodes.length-1;
                    var s_values = this._vf.surfaceValues.length;
                    for(var i=0; i<s_values; i++){
                        var index = Math.min(i, n_styles);
                        inlineText += "   if(((sample>=uSurfaceValues["+i+"] && previous_value<uSurfaceValues["+i+"])||(sample<uSurfaceValues["+i+"] && previous_value>=uSurfaceValues["+i+"])) && (grad.a>=uSurfaceTolerance)){\n"+
                        "       value = vec4(vec3(uSurfaceValues["+i+"]),1.0);\n";
                        if(this._cf.renderStyle.nodes){
                            inlineText += this._cf.renderStyle.nodes[index].inlineStyleShaderText();
                        }
                        inlineText += "   accum.rgb += (1.0 - accum.a) * (value.rgb * value.a);\n"+
                        "   accum.a += (1.0 - accum.a) * value.a;\n"+
                        "   }\n"; 
                    }
                }
                inlineText += "    previous_value = sample;\n";
                return inlineText;
            },

            styleShaderText: function(){
                var styleText = "";
                var n = this._cf.renderStyle.nodes.length;
                for (var i=0; i<n; i++){
                    if(this._cf.renderStyle.nodes[i].styleShaderText != undefined){
                        styleText += this._cf.renderStyle.nodes[i].styleShaderText()+"\n";
                    }
                }
                return styleText;
            },

            lightAssigment: function(){
                return this._cf.renderStyle.nodes[0].lightAssigment();
            },

            lightEquationShaderText: function(){ //TODO: ligth equation per isosurface?
                return this._cf.renderStyle.nodes[0].lightEquationShaderText();
            },

            nodeChanged: function()
            {
                if (!this._cf.appearance.node) 
                {
                    var i;

                    this.addChild(new x3dom.nodeTypes.Appearance());
                    
                    // create shortcut to volume data set
                    this.vrcVolumeTexture = this._cf.voxels.node;
                    this.vrcVolumeTexture._vf.repeatS = false;
                    this.vrcVolumeTexture._vf.repeatT = false;

                    this.vrcMultiTexture._nameSpace = this._nameSpace;
                    
                    this.vrcMultiTexture.addChild(this.vrcVolumeTexture, 'texture');
                    this.vrcVolumeTexture.nodeChanged();
                    
                    // textures from styles
                    var styleTextures = this.textures();
                    for (i = 0; i<styleTextures.length; i++)
                    {
                        this.vrcMultiTexture.addChild(styleTextures[i], 'texture');
                        this.vrcVolumeTexture.nodeChanged();
                    }
                    
                    this._cf.appearance.node.addChild(this.vrcMultiTexture);
                    this.vrcMultiTexture.nodeChanged();
                    
                    //Update child node properties
                    for (var i = 0; i < this._cf.renderStyle.nodes.length; i++) {
                        this._cf.renderStyle.nodes[i].updateProperties(this);
                    }
                    
                    // here goes the volume shader
                    this.vrcSinglePassShaderVertex._vf.type = 'vertex';
                    this.vrcSinglePassShaderVertex._vf.url[0] = this.vertexShaderText();;

                    this.vrcSinglePassShaderFragment._vf.type = 'fragment';
                    var shaderText =
                        this.fragmentPreamble+
                        this.defaultUniformsShaderText(this.vrcVolumeTexture._vf.numberOfSlices, this.vrcVolumeTexture._vf.slicesOverX, this.vrcVolumeTexture._vf.slicesOverY)+
                        this.styleUniformsShaderText()+
                        this.styleShaderText()+
                        this.texture3DFunctionShaderText+
                        this.normalFunctionShaderText()+
                        this.lightEquationShaderText();
                    shaderText += "void main()\n"+
                    "{\n"+
                    "  vec3 cam_pos = vec3(modelViewMatrixInverse[3][0], modelViewMatrixInverse[3][1], modelViewMatrixInverse[3][2]);\n"+
                    "  vec3 cam_cube = cam_pos/dimensions+0.5;\n"+
                    "  vec3 dir = normalize(pos.xyz-cam_cube);\n";
                    if(this._vf.allowViewpointInside){
                        shaderText +=
                        "  float cam_inside = float(all(bvec2(all(lessThan(cam_cube, vec3(1.0))),all(greaterThan(cam_cube, vec3(0.0))))));\n"+
                        "  vec3 ray_pos = mix(pos.xyz, cam_cube, cam_inside);\n";
                    }else{
                        shaderText += "  vec3 ray_pos = pos.xyz;\n";
                    }
                    shaderText +=
                    "  vec4 accum  = vec4(0.0, 0.0, 0.0, 0.0);\n"+
                    "  float sample = 0.0;\n"+
                    "  vec4 value  = vec4(0.0, 0.0, 0.0, 0.0);\n"+
                    "  float cont = 0.0;\n"+
                    "  vec3 step = dir/Steps;\n";
                    //Light init values
                    if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                        shaderText +=
                        "  vec3 ambient = vec3(0.0, 0.0, 0.0);\n"+
                        "  vec3 diffuse = vec3(0.0, 0.0, 0.0);\n"+
                        "  vec3 specular = vec3(0.0, 0.0, 0.0);\n"+
                        "  vec4 step_eye = modelViewMatrix * vec4(step, 0.0);\n"+
                        "  vec4 positionE = position_eye;\n"+
                        "  float lightFactor = 1.0;\n"; 
                    }else{
                        shaderText += "  float lightFactor = 1.2;\n";
                    }
                    shaderText += this.initializeValues()+
                    "  float opacityFactor = 6.0;\n"+
                    "  float t_near;\n"+
                    "  float t_far;\n"+
                    "  for(float i = 0.0; i < Steps; i+=1.0)\n"+
                    "  {\n"+
                    "    value = cTexture3D(uVolData, ray_pos, numberOfSlices, slicesOverX, slicesOverY);\n"+
                    "    value = value.rgbr;\n";
                    if(this._cf.gradients.node){
                        shaderText += "    vec4 gradEye = getNormalFromTexture(uSurfaceNormals, ray_pos, numberOfSlices, slicesOverX, slicesOverY);\n";
                    }else{
                        shaderText += "    vec4 gradEye = getNormalOnTheFly(uVolData, ray_pos, numberOfSlices, slicesOverX, slicesOverY);\n";
                    }
                    shaderText += "    vec4 grad = vec4((modelViewMatrix * vec4(gradEye.xyz, 0.0)).xyz, gradEye.a);\n";
                    for(var l=0; l<x3dom.nodeTypes.X3DLightNode.lightID; l++) {
                        shaderText += "    lighting(light"+l+"_Type, " +
                        "light"+l+"_Location, " +
                        "light"+l+"_Direction, " +
                        "light"+l+"_Color, " + 
                        "light"+l+"_Attenuation, " +
                        "light"+l+"_Radius, " +
                        "light"+l+"_Intensity, " + 
                        "light"+l+"_AmbientIntensity, " +
                        "light"+l+"_BeamWidth, " +
                        "light"+l+"_CutOffAngle, " +
                        "grad.xyz, positionE.xyz, ambient, diffuse, specular);\n";
                    }
                    shaderText += this.inlineStyleShaderText();
                    if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                        shaderText += this.lightAssigment();
                    }
                    shaderText +=
                    "    //advance the current position\n"+
                    "    ray_pos.xyz += step;\n";
                    if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                        shaderText +="    positionE += step_eye;\n";
                    }
                    shaderText +=
                    "    //break if the position is greater than <1, 1, 1>\n"+
                    "    if(ray_pos.x > 1.0 || ray_pos.y > 1.0 || ray_pos.z > 1.0 || ray_pos.x <= 0.0 || ray_pos.y <= 0.0 || ray_pos.z <= 0.0 || accum.a>=1.0)\n"+
                    "      break;\n"+
                    "  }\n"+
                    "  gl_FragColor = accum;\n"+
                    "}";
                    this.vrcSinglePassShaderFragment._vf.url[0] = shaderText;

                    this.vrcSinglePassShader.addChild(this.vrcSinglePassShaderVertex, 'parts');
                    this.vrcSinglePassShaderVertex.nodeChanged();
                    
                    this.vrcSinglePassShader.addChild(this.vrcSinglePassShaderFragment, 'parts');
                    this.vrcSinglePassShaderFragment.nodeChanged();

                    this.vrcSinglePassShaderFieldVolData._vf.name = 'uVolData';
                    this.vrcSinglePassShaderFieldVolData._vf.type = 'SFInt32';
                    this.vrcSinglePassShaderFieldVolData._vf.value = this._textureID++;

                    this.vrcSinglePassShaderFieldDimensions._vf.name = 'dimensions';
                    this.vrcSinglePassShaderFieldDimensions._vf.type = 'SFVec3f';
                    this.vrcSinglePassShaderFieldDimensions._vf.value = this._vf.dimensions;
                    
                    this.vrcSinglePassShaderFieldOffset._vf.name = 'offset';
                    this.vrcSinglePassShaderFieldOffset._vf.type = 'SFVec3f';
                    this.vrcSinglePassShaderFieldOffset._vf.value = "0.01 0.01 0.01"; //Default initial value
                    
                    this.vrcSinglePassShader.addChild(this.vrcSinglePassShaderFieldVolData, 'fields');
                    this.vrcSinglePassShaderFieldVolData.nodeChanged();

                    this.vrcSinglePassShader.addChild(this.vrcSinglePassShaderFieldDimensions, 'fields');
                    this.vrcSinglePassShaderFieldDimensions.nodeChanged();

                    this.vrcSinglePassShader.addChild(this.vrcSinglePassShaderFieldOffset, 'fields');
 
                    //Take volume texture size for the ComposableRenderStyles offset parameter
                    this.offsetInterval = window.setInterval((function(aTex, obj) {
                        return function() {
                            x3dom.debug.logInfo('[VolumeRendering][IsoSurfaceVolumeData] Looking for Volume Texture size...');
                            var s = obj.getTextureSize(aTex);
                            if(s.valid){
                                clearInterval(obj.offsetInterval);
                                obj.vrcSinglePassShaderFieldOffset._vf.value = new x3dom.fields.SFVec3f(1.0/(s.w/aTex._vf.slicesOverX), 1.0/(s.h/aTex._vf.slicesOverY), 1.0/aTex._vf.numberOfSlices);
                                obj.vrcSinglePassShader.nodeChanged();
                                x3dom.debug.logInfo('[VolumeRendering][IsoSurfaceVolumeData] Volume Texture size obtained');
                            }
                        }
                    })(this.vrcVolumeTexture, this), 1000);

                    var ShaderUniforms = this.uniforms();
                    for (i = 0; i<ShaderUniforms.length; i++)
                    {
                        this.vrcSinglePassShader.addChild(ShaderUniforms[i], 'fields');
                    }
                
                    this._cf.appearance.node.addChild(this.vrcSinglePassShader);
                    this.vrcSinglePassShader.nodeChanged();
                    
                    this._cf.appearance.node.nodeChanged();
                }

                if (!this._cf.geometry.node) {
                    this.addChild(new x3dom.nodeTypes.Box());

                    this._cf.geometry.node._vf.solid = false;
                    this._cf.geometry.node._vf.hasHelperColors = false;
                    this._cf.geometry.node._vf.size = new x3dom.fields.SFVec3f(
                        this._vf.dimensions.x, this._vf.dimensions.y, this._vf.dimensions.z);

                    // workaround to trigger field change...
                    this._cf.geometry.node.fieldChanged("size");
                }
            }
        }
    )
);
