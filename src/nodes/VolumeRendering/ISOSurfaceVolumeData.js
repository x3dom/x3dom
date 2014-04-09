/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### ISOSurfaceVolumeData ### */
x3dom.registerNodeType(
    "ISOSurfaceVolumeData",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeDataNode,
        function (ctx) {
            x3dom.nodeTypes.ISOSurfaceVolumeData.superClass.call(this, ctx);

            this.addField_MFNode('renderStyle', x3dom.nodeTypes.X3DVolumeRenderStyleNode);
            this.addField_SFNode('gradients', x3dom.nodeTypes.Texture);
            //this.addField_SFNode('gradients', x3dom.nodeTypes.X3DTexture3DNode);
            this.addField_MFFloat(ctx, 'surfaceValues', [0.0]);
            this.addField_SFFloat(ctx, 'contourStepSize', 0);
            this.addField_SFFloat(ctx, 'surfaceTolerance', 0);

            this.uniformSampler2DGradients = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatContourStepSize = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatSurfaceTolerance = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatArraySurfaceValues = new x3dom.nodeTypes.Uniform(ctx);
            this.normalTextureProvided = false;

            this.vrcMultiTexture = new x3dom.nodeTypes.MultiTexture(ctx);
            this.vrcRenderTexture = new x3dom.nodeTypes.RenderedTexture(ctx);
            this.vrcVolumeTexture = null;

            this.vrcBackCubeShape = new x3dom.nodeTypes.Shape(ctx);
            this.vrcBackCubeAppearance = new x3dom.nodeTypes.Appearance();
            this.vrcBackCubeGeometry = new x3dom.nodeTypes.Box(ctx);
            this.vrcBackCubeShader = new x3dom.nodeTypes.ComposedShader(ctx);
            this.vrcBackCubeShaderVertex = new x3dom.nodeTypes.ShaderPart(ctx);
            this.vrcBackCubeShaderFragment = new x3dom.nodeTypes.ShaderPart(ctx);

            this.vrcFrontCubeShader = new x3dom.nodeTypes.ComposedShader(ctx);
            this.vrcFrontCubeShaderVertex = new x3dom.nodeTypes.ShaderPart(ctx);
            this.vrcFrontCubeShaderFragment = new x3dom.nodeTypes.ShaderPart(ctx);
            this.vrcFrontCubeShaderFieldBackCoord = new x3dom.nodeTypes.Field(ctx);
            this.vrcFrontCubeShaderFieldVolData = new x3dom.nodeTypes.Field(ctx);
            this.vrcFrontCubeShaderFieldOffset = new x3dom.nodeTypes.Field(ctx);
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

                /*this.uniformFloatContourStepSize._vf.name = 'uContourStepSize';
                 this.uniformFloatContourStepSize._vf.type = 'SFFloat';
                 this.uniformFloatContourStepSize._vf.value = this._vf.contourStepSize;
                 unis.push(this.uniformFloatContourStepSize);*/

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
                    //"uniform float uContourStepSize;\n"+
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
                return styleText;
            },

            inlineStyleShaderText: function(){
                var inlineText = "    sample = value.r;\n";
                if(this._vf.surfaceValues.length == 1) { //Only one surface value
                    if(this._vf.contourStepSize == 0.0){
                        inlineText += "   if((sample>=uSurfaceValues[0] && previous_value<uSurfaceValues[0])||(sample<uSurfaceValues[0] && previous_value>=uSurfaceValues[0]) && (grad.a>=uSurfaceTolerance)){\n"+
                            "       value = vec4(uSurfaceValues[0]);\n";
                        if(this._cf.renderStyle.nodes){
                            inlineText += this._cf.renderStyle.nodes[0].inlineStyleShaderText();
                        }
                        inlineText += "       accum.rgb += (1.0 - accum.a) * (value.rgb * value.a);\n"+
                            "       accum.a += value.a;\n"+
                            "   }\n";
                    }else{ //multiple iso values with the contour step size
                        var tmp = this._vf.surfaceValues[0];
                        var positive_range = [];
                        var negative_range = [];
                        while(tmp+this._vf.contourStepSize <= 1.0){
                            tmp+=this._vf.contourStepSize;
                            positive_range.push(tmp);
                        }
                        tmp = this._vf.surfaceValues[0];
                        while(tmp-this._vf.contourStepSize >= 0.0){
                            tmp-=this._vf.contourStepSize;
                            positive_range.push(tmp);
                        }
                        var range = Array.concat(negative_range.reverse(), positive_range);
                        for (var i = 0; i <= range.length - 1; i++) {
                            var s_value = range[i].toPrecision(3);
                            inlineText += " if((sample>="+s_value+" && previous_value<"+s_value+")||(sample<"+s_value+" && previous_value>="+s_value+") && (grad.a>=uSurfaceTolerance)){\n"+
                                "       value = vec4("+s_value+");\n";
                            if(this._cf.renderStyle.nodes){
                                inlineText += this._cf.renderStyle.nodes[0].inlineStyleShaderText();
                            }
                            inlineText += "       accum.rgb += (1.0 - accum.a) * (value.rgb * value.a);\n"+
                                "       accum.a += value.a;\n"+
                                "   }\n";
                        };
                    }
                }else{ //Multiple isosurface values had been specified by the user
                    var n_styles = this._cf.renderStyle.nodes.length-1;
                    var s_values = this._vf.surfaceValues.length;
                    for(var i=0; i<s_values; i++){
                        var index = Math.min(i, n_styles);
                        inlineText += "   if((sample>=uSurfaceValues["+i+"] && previous_value<uSurfaceValues["+i+"])||(sample<uSurfaceValues["+i+"] && previous_value>=uSurfaceValues["+i+"]) && (grad.a>=uSurfaceTolerance)){\n"+
                            "       value.rgb = vec3(uSurfaceValues["+i+"]);\n";
                        if(this._cf.renderStyle.nodes){
                            inlineText += this._cf.renderStyle.nodes[index].inlineStyleShaderText();
                        }
                        inlineText += "   accum.rgb += (1.0 - accum.a) * (value.rgb * value.a);\n"+
                            "   accum.a += value.a;\n"+
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
                var isBlendedStyle = false;
                //Check if there is a blendedStyle, not to use lightAssigment
                Array.forEach(this._cf.renderStyle.nodes, function(style){
                    if(x3dom.isa(style, x3dom.nodeTypes.BlendedVolumeStyle)){
                        isBlendedStyle = true;
                    }
                });
                if(!isBlendedStyle){
                    return this._cf.renderStyle.nodes[0].lightAssigment();
                }else{
                    return "";
                }
            },

            lightEquationShaderText: function(){ //TODO: ligth equation per isosurface?
                return this._cf.renderStyle.nodes[0].lightEquationShaderText();
            },

            nodeChanged: function()
            {
                if (!this._cf.appearance.node)
                {
                    var that = this;
                    var i;

                    this.addChild(x3dom.nodeTypes.Appearance.defaultNode());

                    // second texture, ray direction and length
                    this.vrcBackCubeShaderVertex._vf.type = 'vertex';
                    this.vrcBackCubeShaderVertex._vf.url[0] =
                        "attribute vec3 position;\n" +
                        "attribute vec3 color;\n" +
                        "varying vec3 fragColor;\n" +
                        "uniform mat4 modelViewProjectionMatrix;\n" +
                        "\n" +
                        "void main(void) {\n" +
                        "    fragColor = color;\n" +
                        "    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);\n" +
                        "}\n";

                    this.vrcBackCubeShaderFragment._vf.type = 'fragment';
                    this.vrcBackCubeShaderFragment._vf.url[0] =
                        "#ifdef GL_FRAGMENT_PRECISION_HIGH\n" +
                        "  precision highp float;\n" +
                        "#else\n" +
                        "  precision mediump float;\n" +
                        "#endif\n" +
                        "\n" +
                        "varying vec3 fragColor;\n" +
                        "\n" +
                        "void main(void) {\n" +
                        "    gl_FragColor = vec4(fragColor, 1.0);\n" +
                        "}\n";

                    this.vrcBackCubeShader.addChild(this.vrcBackCubeShaderFragment, 'parts');
                    this.vrcBackCubeShaderFragment.nodeChanged();

                    this.vrcBackCubeShader.addChild(this.vrcBackCubeShaderVertex, 'parts');
                    this.vrcBackCubeShaderVertex.nodeChanged();

                    this.vrcBackCubeAppearance.addChild(this.vrcBackCubeShader);
                    this.vrcBackCubeShader.nodeChanged();

                    // initialize fbo - note that internally the datatypes must fit!
                    this.vrcRenderTexture._vf.update = 'always';
                    this.vrcRenderTexture._vf.dimensions = [500, 500, 4];
                    this.vrcRenderTexture._vf.repeatS = false;
                    this.vrcRenderTexture._vf.repeatT = false;
                    this.vrcRenderTexture._nameSpace = this._nameSpace;
                    this._textureID++;

                    this.vrcBackCubeGeometry._vf.size = new x3dom.fields.SFVec3f(
                        this._vf.dimensions.x, this._vf.dimensions.y, this._vf.dimensions.z);
                    this.vrcBackCubeGeometry._vf.ccw = false;
                    this.vrcBackCubeGeometry._vf.solid = true;
                    // manually trigger size update
                    this.vrcBackCubeGeometry.fieldChanged("size");

                    this.vrcBackCubeShape.addChild(this.vrcBackCubeGeometry);
                    this.vrcBackCubeGeometry.nodeChanged();

                    this.vrcBackCubeShape.addChild(this.vrcBackCubeAppearance);
                    this.vrcBackCubeAppearance.nodeChanged();

                    this.vrcRenderTexture.addChild(this.vrcBackCubeShape, 'scene');
                    this.vrcBackCubeShape.nodeChanged();

                    // create shortcut to volume data set
                    this.vrcVolumeTexture = this._cf.voxels.node;
                    this.vrcVolumeTexture._vf.repeatS = false;
                    this.vrcVolumeTexture._vf.repeatT = false;
                    this._textureID++;

                    this.vrcMultiTexture._nameSpace = this._nameSpace;

                    this.vrcMultiTexture.addChild(this.vrcRenderTexture, 'texture');
                    this.vrcRenderTexture.nodeChanged();

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

                    // here goes the volume shader
                    this.vrcFrontCubeShaderVertex._vf.type = 'vertex';
                    var shaderText=
                        "attribute vec3 position;\n"+
                        "attribute vec3 color;\n"+
                        "uniform mat4 modelViewProjectionMatrix;\n"+
                        "varying vec3 vertexColor;\n"+
                        "varying vec4 vertexPosition;\n";
                    if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                        shaderText += "uniform mat4 modelViewMatrix;\n"+
                            "varying vec4 position_eye;\n";
                    }
                    shaderText += "\n" +
                        "void main()\n"+
                        "{\n"+
                        "  vertexColor = color;\n"+
                        "  vertexPosition = modelViewProjectionMatrix * vec4(position, 1.0);\n";
                    if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                        shaderText += "  position_eye = modelViewMatrix * vec4(position, 1.0);\n";
                    }
                    shaderText +=
                        "  gl_Position = vertexPosition;\n"+
                        "}";
                    this.vrcFrontCubeShaderVertex._vf.url[0] = shaderText;

                    this.vrcFrontCubeShaderFragment._vf.type = 'fragment';
                    shaderText =
                        "#ifdef GL_FRAGMENT_PRECISION_HIGH\n" +
                        "  precision highp float;\n" +
                        "#else\n" +
                        "  precision mediump float;\n" +
                        "#endif\n\n"+
                        "uniform sampler2D uBackCoord;\n"+
                        "uniform sampler2D uVolData;\n"+
                        "uniform vec3 offset;\n"+
                        "uniform mat4 modelViewMatrixInverse;\n"+
                        "uniform mat4 modelViewMatrix;\n"+
                        //"uniform sampler2D uSurfaceNormals;\n"+
                        "varying vec3 vertexColor;\n"+
                        "varying vec4 vertexPosition;\n"+
                        "varying vec4 position_eye;\n"+
                        "const float Steps = 60.0;\n"+
                        "const float numberOfSlices = "+ this.vrcVolumeTexture._vf.numberOfSlices.toPrecision(5)+";\n"+
                        "const float slicesOverX = " + this.vrcVolumeTexture._vf.slicesOverX.toPrecision(5) +";\n"+
                        "const float slicesOverY = " + this.vrcVolumeTexture._vf.slicesOverY.toPrecision(5) +";\n";
                    //LIGHTS
                    var n_lights = x3dom.nodeTypes.X3DLightNode.lightID;
                    for(var l=0; l<n_lights; l++) {
                        shaderText +=   "uniform float light"+l+"_On;\n" +
                            "uniform float light"+l+"_Type;\n" +
                            "uniform vec3  light"+l+"_Location;\n" +
                            "uniform vec3  light"+l+"_Direction;\n" +
                            "uniform vec3  light"+l+"_Color;\n" +
                            "uniform vec3  light"+l+"_Attenuation;\n" +
                            "uniform float light"+l+"_Radius;\n" +
                            "uniform float light"+l+"_Intensity;\n" +
                            "uniform float light"+l+"_AmbientIntensity;\n" +
                            "uniform float light"+l+"_BeamWidth;\n" +
                            "uniform float light"+l+"_CutOffAngle;\n" +
                            "uniform float light"+l+"_ShadowIntensity;\n";
                    }
                    shaderText += this.styleUniformsShaderText()+
                        this.styleShaderText()+
                        "vec4 cTexture3D(sampler2D vol, vec3 volpos, float nS, float nX, float nY)\n"+
                        "{\n"+
                        "  float s1,s2;\n"+
                        "  float dx1,dy1;\n"+
                        "  float dx2,dy2;\n"+
                        "  vec2 texpos1,texpos2;\n"+
                        "  s1 = floor(volpos.z*nS);\n"+
                        "  s2 = s1+1.0;\n"+
                        "  dx1 = fract(s1/nX);\n"+
                        "  dy1 = floor(s1/nY)/nY;\n"+
                        "  dx2 = fract(s2/nX);\n"+
                        "  dy2 = floor(s2/nY)/nY;\n"+
                        "  texpos1.x = dx1+(volpos.x/nX);\n"+
                        "  texpos1.y = dy1+(volpos.y/nY);\n"+
                        "  texpos2.x = dx2+(volpos.x/nX);\n"+
                        "  texpos2.y = dy2+(volpos.y/nY);\n"+
                        "  return mix( texture2D(vol,texpos1), texture2D(vol,texpos2), (volpos.z*nS)-s1);\n"+
                        "}\n"+
                        "\n"+
                        "vec4 getNormalFromTexture(sampler2D sampler, vec3 pos, float nS, float nX, float nY) {\n"+
                        "   vec4 n = (2.0*cTexture3D(sampler, pos, nS, nX, nY)-1.0);\n"+
                        "   n.a = length(n.xyz);\n"+
                        "   n.xyz = normalize(n.xyz);\n"+
                        "   return n;\n"+
                        "}\n"+
                        "\n"+
                        "vec4 getNormalOnTheFly(sampler2D sampler, vec3 voxPos, float nS, float nX, float nY){\n"+
                        "   float v0 = cTexture3D(sampler, voxPos + vec3(offset.x, 0, 0), nS, nX, nY).r;\n"+
                        "   float v1 = cTexture3D(sampler, voxPos - vec3(offset.x, 0, 0), nS, nX, nY).r;\n"+
                        "   float v2 = cTexture3D(sampler, voxPos + vec3(0, offset.y, 0), nS, nX, nY).r;\n"+
                        "   float v3 = cTexture3D(sampler, voxPos - vec3(0, offset.y, 0), nS, nX, nY).r;\n"+
                        "   float v4 = cTexture3D(sampler, voxPos + vec3(0, 0, offset.z), nS, nX, nY).r;\n"+
                        "   float v5 = cTexture3D(sampler, voxPos - vec3(0, 0, offset.z), nS, nX, nY).r;\n"+
                        "   vec3 grad = vec3((v0-v1)/2.0, (v2-v3)/2.0, (v4-v5)/2.0);\n"+
                        "   return vec4(normalize(grad), length(grad));\n"+
                        "}\n"+
                        "\n"+
                        this.lightEquationShaderText();
                    shaderText += "void main()\n"+
                        "{\n"+
                        "  vec2 texC = vertexPosition.xy/vertexPosition.w;\n"+
                        "  texC = 0.5*texC + 0.5;\n"+
                        "  vec4 backColor = texture2D(uBackCoord,texC);\n"+
                        "  vec3 dir = backColor.rgb - vertexColor.rgb;\n"+
                        "  vec3 pos = vertexColor;\n"+
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
                        "  for(float i = 0.0; i < Steps; i+=1.0)\n"+
                        "  {\n"+
                        "    value = cTexture3D(uVolData, pos, numberOfSlices, slicesOverX, slicesOverY);\n"+
                        "    value = vec4(value.rgb,(0.299*value.r)+(0.587*value.g)+(0.114*value.b));\n";
                    if(this._cf.gradients.node){
                        shaderText += "    vec4 gradEye = getNormalFromTexture(uSurfaceNormals, pos, numberOfSlices, slicesOverX, slicesOverY);\n";
                    }else{
                        shaderText += "    vec4 gradEye = getNormalOnTheFly(uVolData, pos, numberOfSlices, slicesOverX, slicesOverY);\n";
                    }
                    shaderText += "    vec4 grad = vec4((modelViewMatrixInverse * vec4(gradEye.xyz, 0.0)).xyz, gradEye.a);\n";
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
                            "grad.xyz, -positionE.xyz, ambient, diffuse, specular);\n";
                    }
                    shaderText += this.inlineStyleShaderText();
                    if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                        shaderText += this.inlineLightAssigment();
                    }
                    shaderText +=
                        "    //advance the current position\n"+
                        "    pos.xyz += step;\n";
                    if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                        shaderText +="    positionE += step_eye;\n";
                    }
                    shaderText +=
                        "    //break if the position is greater than <1, 1, 1>\n"+
                        "    if(pos.x > 1.0 || pos.y > 1.0 || pos.z > 1.0 || accum.a>=1.0)\n"+
                        "      break;\n"+
                        "  }\n"+
                        "  gl_FragColor = accum;\n"+
                        "}";

                    this.vrcFrontCubeShaderFragment._vf.url[0] = shaderText;

                    this.vrcFrontCubeShader.addChild(this.vrcFrontCubeShaderVertex, 'parts');
                    this.vrcFrontCubeShaderVertex.nodeChanged();

                    this.vrcFrontCubeShader.addChild(this.vrcFrontCubeShaderFragment, 'parts');
                    this.vrcFrontCubeShaderFragment.nodeChanged();

                    this.vrcFrontCubeShaderFieldBackCoord._vf.name = 'uBackCoord';
                    this.vrcFrontCubeShaderFieldBackCoord._vf.type = 'SFInt32';
                    this.vrcFrontCubeShaderFieldBackCoord._vf.value = 0;

                    this.vrcFrontCubeShaderFieldVolData._vf.name = 'uVolData';
                    this.vrcFrontCubeShaderFieldVolData._vf.type = 'SFInt32';
                    this.vrcFrontCubeShaderFieldVolData._vf.value = 1;

                    this.vrcFrontCubeShaderFieldOffset._vf.name = 'offset';
                    this.vrcFrontCubeShaderFieldOffset._vf.type = 'SFVec3f';
                    this.vrcFrontCubeShaderFieldOffset._vf.value = "0.01 0.01 0.01"; //Default initial value

                    this.vrcFrontCubeShader.addChild(this.vrcFrontCubeShaderFieldBackCoord, 'fields');
                    this.vrcFrontCubeShaderFieldBackCoord.nodeChanged();

                    this.vrcFrontCubeShader.addChild(this.vrcFrontCubeShaderFieldVolData, 'fields');
                    this.vrcFrontCubeShaderFieldVolData.nodeChanged();

                    this.vrcFrontCubeShader.addChild(this.vrcFrontCubeShaderFieldOffset, 'fields');

                    //Take volume texture size for the ComposableRenderStyles offset parameter
                    this.offsetInterval = window.setInterval((function(aTex) {
                        return function() {
                            x3dom.debug.logInfo('[VolumeRendering][ISOSurfaceVolumeData] Looking for Volume Texture size...');
                            var s = that.getTextureSize(aTex);
                            if(s.valid){
                                clearInterval(that.offsetInterval);
                                that.vrcFrontCubeShaderFieldOffset._vf.value = new x3dom.fields.SFVec3f(1.0/s.w, 1.0/s.h, 1.0/aTex._vf.numberOfSlices);
                                that.vrcFrontCubeShader.nodeChanged();
                                x3dom.debug.logInfo('[VolumeRendering][ISOSurfaceVolumeData] Volume Texture size obtained');
                            }
                        }
                    })(this.vrcVolumeTexture), 1000);

                    var ShaderUniforms = this.uniforms();
                    for (i = 0; i<ShaderUniforms.length; i++)
                    {
                        this.vrcFrontCubeShader.addChild(ShaderUniforms[i], 'fields');
                    }

                    this._cf.appearance.node.addChild(this.vrcFrontCubeShader);
                    this.vrcFrontCubeShader.nodeChanged();

                    this._cf.appearance.node.nodeChanged();
                }

                if (!this._cf.geometry.node) {
                    this.addChild(new x3dom.nodeTypes.Box());

                    this._cf.geometry.node._vf.hasHelperColors = true;
                    this._cf.geometry.node._vf.size = new x3dom.fields.SFVec3f(
                        this._vf.dimensions.x, this._vf.dimensions.y, this._vf.dimensions.z);

                    // workaround to trigger field change...
                    this._cf.geometry.node.fieldChanged("hasHelperColors");
                    this._cf.geometry.node.fieldChanged("size");
                }
            }
        }
    )
);