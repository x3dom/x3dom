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

 /**
  * http://igraphics.com/Standards/ISO_IEC_19775_1_2_PDAM1_Candidate_2011_05_12/Part01/components/volume.html
  */

/* ### X3DVolumeDataNode ### */
x3dom.registerNodeType(
    "X3DVolumeDataNode",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DShapeNode,   // changed inheritance!
        function (ctx) {
            x3dom.nodeTypes.X3DVolumeDataNode.superClass.call(this, ctx);

            this.addField_SFVec3f(ctx, 'dimensions', 1, 1, 1);
            this.addField_SFNode('voxels', x3dom.nodeTypes.Texture);
            //this.addField_MFNode('voxels', x3dom.nodeTypes.X3DTexture3DNode);
            //this.addField_SFBool(ctx, 'swapped', false);
            //this.addField_SFVec3f(ctx, 'sliceThickness', 1, 1, 1);

            x3dom.debug.logWarning('VolumeRendering component NYI!!!');
        },
        {
            getTextureSize: function(texture) {
                var size = { w: 0, h: 0, valid: false };
                var texBag = this._webgl ? this._webgl.texture : null;
                var t, n = (texture && texBag) ? texBag.length : 0;

                for (t=0; t<n; t++) {
                    if (texture == texBag[t].node && texBag[t].texture) {
                        size.w = texBag[t].texture.width;
                        size.h = texBag[t].texture.height;
                        if (size.w && size.h) {
                            size.valid = true;
                        }
                        break;
                    }
                }

                return size;
            }
        }
    )
);

/* ### X3DVolumeRenderStyleNode ### */
x3dom.registerNodeType(
    "X3DVolumeRenderStyleNode",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DVolumeRenderStyleNode.superClass.call(this, ctx);

            this.addField_SFBool(ctx, 'enabled', true);

            this.preamble = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n" +
                            "  precision highp float;\n" +
                            "#else\n" +
                            "  precision mediump float;\n" +
                            "#endif\n\n";
        },
        {
            vertexShaderText: function(){
                var shader = 
                "attribute vec3 position;\n"+
                "attribute vec3 color;\n"+
                "uniform mat4 modelViewProjectionMatrix;\n"+
                "varying vec3 vertexColor;\n"+
                "varying vec4 vertexPosition;\n"+
                "\n" +
                "void main()\n"+
                "{\n"+
                "  vertexColor = color;\n"+
                "  vertexPosition = modelViewProjectionMatrix * vec4(position, 1.0);\n"+
                "  gl_Position = vertexPosition;\n"+
                "}";
                return shader;
            },

            defaultUniformsShaderText: function(numberOfSlices, slicesOverX, slicesOverY){
                var uniformsText = 
                "uniform sampler2D uBackCoord;\n"+
                "uniform sampler2D uVolData;\n"+
                "uniform mat4 normalMatrix;\n"+
                "varying vec3 vertexColor;\n"+
                "varying vec4 vertexPosition;\n"+
                "const float Steps = 60.0;\n"+
                "const float numberOfSlices = "+ numberOfSlices.toPrecision(5)+";\n"+
                "const float slicesOverX = " + slicesOverX.toPrecision(5) +";\n"+
                "const float slicesOverY = " + slicesOverY.toPrecision(5) +";\n";
                return uniformsText;
            },

            texture3DFunctionShaderText: "vec4 cTexture3D(sampler2D vol, vec3 volpos, float nS, float nX, float nY)\n"+
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
                "\n",

            lightEquationShaderText: "void lighting(in float lType, in vec3 lLocation, in vec3 lDirection, in vec3 lColor, in vec3 lAttenuation, " + 
                "in float lRadius, in float lIntensity, in float lAmbientIntensity, in float lBeamWidth, " +
                "in float lCutOffAngle, in vec3 N, in vec3 V, inout vec3 ambient, inout vec3 diffuse, " +
                "inout vec3 specular)\n" +
                "{\n" +
                "   vec3 L;\n" +
                "   float spot = 1.0, attentuation = 0.0;\n" +
                "   if(lType == 0.0) {\n" +
                "       L = -normalize(lDirection);\n" +
                "       V = normalize(V);\n" +
                "       attentuation = 1.0;\n" +
                "   } else{\n" +
                "       L = (lLocation - (-V));\n" +
                "       float d = length(L);\n" +
                "       L = normalize(L);\n" +
                "       V = normalize(V);\n" +
                "       if(lRadius == 0.0 || d <= lRadius) {\n" +
                "           attentuation = 1.0 / max(lAttenuation.x + lAttenuation.y * d + lAttenuation.z * (d * d), 1.0);\n" +
                "       }\n" +
                "       if(lType == 2.0) {\n" +
                "           float spotAngle = acos(max(0.0, dot(-L, normalize(lDirection))));\n" +
                "           if(spotAngle >= lCutOffAngle) spot = 0.0;\n" +
                "           else if(spotAngle <= lBeamWidth) spot = 1.0;\n" +
                "           else spot = (spotAngle - lCutOffAngle ) / (lBeamWidth - lCutOffAngle);\n" +
                "       }\n" +
                "   }\n" +   
                "   vec3  H = normalize( L + V );\n" +
                "   float NdotL = max(0.0, dot(L, N));\n" +
                "   float NdotH = max(0.0, dot(H, N));\n" +   
                "   float ambientFactor  = lAmbientIntensity;\n" +
                "   float diffuseFactor  = lIntensity * NdotL;\n" +
                "   float specularFactor = lIntensity * pow(NdotH,128.0);\n" +
                "   ambient  += lColor * ambientFactor * attentuation * spot;\n" +
                "   diffuse  += lColor * diffuseFactor * attentuation * spot;\n" +
                "   specular += lColor * specularFactor * attentuation * spot;\n" +  
                "}\n",

            normalFunctionShaderText: function(){
                if (this._cf.surfaceNormals.node) {
                    // The surface normals, are taken from the given texture, must be of the same size of the Volume Data
                    return "vec4 getNormal(vec3 pos, float nS, float nX, float nY) {\n"+
                    "   vec4 n = cTexture3D(uSurfaceNormals, pos, nS, nX, nY);\n"+
                    "   n.xyz = (2.0*n.xyz)-1.0;\n"+
                    "   n.xyz = (normalMatrix * vec4(n.xyz, 0.0)).xyz;\n"+
                    "   n.a = length(n.xyz);\n"+
                    "   n.xyz = normalize(n.xyz);\n"+
                    "   return n;\n"+
                    "}\n"+
                    "\n";
                }else{
                    // No extra texture provided, the surface normals are obtained by calculating the gradient with the Central differences method on each sampled voxel
                    return "vec4 getNormal(vec3 voxPos, float nS, float nX, float nY){\n"+
                    "   float v0 = cTexture3D(uVolData, voxPos + vec3(offset.x, 0, 0), nS, nX, nY).r;\n"+
                    "   float v1 = cTexture3D(uVolData, voxPos - vec3(offset.x, 0, 0), nS, nX, nY).r;\n"+
                    "   float v2 = cTexture3D(uVolData, voxPos + vec3(0, offset.y, 0), nS, nX, nY).r;\n"+
                    "   float v3 = cTexture3D(uVolData, voxPos - vec3(0, offset.y, 0), nS, nX, nY).r;\n"+
                    "   float v4 = cTexture3D(uVolData, voxPos + vec3(0, 0, offset.z), nS, nX, nY).r;\n"+
                    "   float v5 = cTexture3D(uVolData, voxPos - vec3(0, 0, offset.z), nS, nX, nY).r;\n"+
                    "   vec3 grad = (normalMatrix * vec4((v0-v1)/2.0, (v2-v3)/2.0, (v4-v5)/2.0, 0.0)).xyz;\n"+
                    "   return vec4(normalize(grad), length(grad));\n"+
                    "}\n"+
                    "\n";
                }
            },    

            //Takes an array as an argument which contains the calls that will be made inside the main loop
            defaultLoopFragmentShaderText: function(inlineShaderText, inlineLightAssigment){
                var shaderLoop = "void main()\n"+
                "{\n"+
                "  vec2 texC = vertexPosition.xy/vertexPosition.w;\n"+
                "  texC = 0.5*texC + 0.5;\n"+
                "  vec4 backColor = texture2D(uBackCoord,texC);\n"+
                "  vec3 dir = backColor.rgb - vertexColor.rgb;\n"+
                "  vec3 pos = vertexColor;\n"+
                "  vec4 accum  = vec4(0.0, 0.0, 0.0, 0.0);\n"+
                "  vec4 sample = vec4(0.0, 0.0, 0.0, 0.0);\n"+
                "  vec4 value  = vec4(0.0, 0.0, 0.0, 0.0);\n";
                //Light init values
                if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                    shaderLoop +=
                    "  vec3 ambient = vec3(0.0, 0.0, 0.0);\n"+
                    "  vec3 diffuse = vec3(0.0, 0.0, 0.0);\n"+
                    "  vec3 specular = vec3(0.0, 0.0, 0.0);\n";
                }
                shaderLoop +=
                "  float cont = 0.0;\n"+
                "  vec3 step = dir/Steps;\n";
                if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                    shaderLoop += "  float lightFactor = 1.0;\n";
                }else{
                    shaderLoop += "  float lightFactor = 1.2;\n";
                }
                shaderLoop +=
                "  float opacityFactor = 6.0;\n"+
                "  for(float i = 0.0; i < Steps; i+=1.0)\n"+
                "  {\n"+
                "    value = cTexture3D(uVolData,pos,numberOfSlices,slicesOverX,slicesOverY);\n"+
                "    value = vec4(value.rgb,(0.299*value.r)+(0.587*value.g)+(0.114*value.b));\n"+
                "    vec4 grad = getNormal(pos,numberOfSlices,slicesOverX,slicesOverY);\n";
                for(var l=0; l<x3dom.nodeTypes.X3DLightNode.lightID; l++) {
                    shaderLoop += "    lighting(light"+l+"_Type, " +
                    "light"+l+"_Location, " +
                    "light"+l+"_Direction, " +
                    "light"+l+"_Color, " + 
                    "light"+l+"_Attenuation, " +
                    "light"+l+"_Radius, " +
                    "light"+l+"_Intensity, " + 
                    "light"+l+"_AmbientIntensity, " +
                    "light"+l+"_BeamWidth, " +
                    "light"+l+"_CutOffAngle, " +
                    "grad.xyz, dir, ambient, diffuse, specular);\n";
                }
                shaderLoop += inlineShaderText;
                if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                    shaderLoop += inlineLightAssigment;
                }
                shaderLoop +=
                "    //Process the volume sample\n"+
                "    sample.a = value.a * opacityFactor * (1.0/Steps);\n"+
                "    sample.rgb = value.rgb * sample.a * lightFactor ;\n"+
                "    accum.rgb += (1.0 - accum.a) * sample.rgb;\n"+
                "    accum.a += (1.0 - accum.a) * sample.a;\n"+
                "    //advance the current position\n"+
                "    pos.xyz += step;\n"+
                "    //break if the position is greater than <1, 1, 1>\n"+
                "    if(pos.x > 1.0 || pos.y > 1.0 || pos.z > 1.0 || accum.a>=1.0)\n"+
                "      break;\n"+
                "  }\n"+
                "  gl_FragColor = accum;\n"+
                "}";
                return shaderLoop;
            }
        }
    )
);

/* ### X3DComposableVolumeRenderStyleNode ### */
x3dom.registerNodeType(
    "X3DComposableVolumeRenderStyleNode",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode.superClass.call(this, ctx);

            this.addField_SFNode('surfaceNormals', x3dom.nodeTypes.X3DTexture3DNode);
        },
        {
            defaultUniformsShaderText: function(numberOfSlices, slicesOverX, slicesOverY, offset){
               var uniformsText = 
                "uniform sampler2D uBackCoord;\n"+
                "uniform sampler2D uVolData;\n"+
                "uniform mat4 normalMatrix;\n";
                if (!(this._cf.surfaceNormals.node==null)) {
                    uniformsText += "uniform sampler2D uSurfaceNormals;\n";
                }
                uniformsText +=
                "varying vec3 vertexColor;\n"+
                "varying vec4 vertexPosition;\n"+
                "const float Steps = 60.0;\n"+
                "const float numberOfSlices = "+ numberOfSlices.toPrecision(5)+";\n"+
                "const float slicesOverX = " + slicesOverX.toPrecision(5) +";\n"+
                "const float slicesOverY = " + slicesOverY.toPrecision(5) +";\n"+
                "const vec3 offset = vec3(0.5/512.0, 0.5/512.0, 0.5/96.0);\n";
                //LIGHTS
                var n_lights = x3dom.nodeTypes.X3DLightNode.lightID;
                for(var l=0; l<n_lights; l++) {
                    uniformsText +=   "uniform float light"+l+"_On;\n" +
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
                return uniformsText;
            }
        }
    )
);

/* ### BlendedVolumeStyle ### */
x3dom.registerNodeType(
    "BlendedVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.BlendedVolumeStyle.superClass.call(this, ctx);

            this.addField_SFNode('renderStyle', x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode);
            this.addField_SFNode('voxels', x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode);
            this.addField_SFFloat(ctx, 'weightConstant1', 0.5);
            this.addField_SFFloat(ctx, 'weightConstant2', 0.5);
            this.addField_SFString(ctx, 'weightFunction1', "CONSTANT");
            this.addField_SFString(ctx, 'weightFunction2', "CONSTANT");
            this.addField_SFNode('weightTransferFunction1', x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode);
            this.addField_SFNode('weightTransferFunction2', x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode);
        }
    )
);

/* ### BoundaryEnhancementVolumeStyle ### */
x3dom.registerNodeType(
    "BoundaryEnhancementVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.BoundaryEnhancementVolumeStyle.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'retainedOpacity', 1);
            this.addField_SFFloat(ctx, 'boundaryOpacity', 0);
            this.addField_SFFloat(ctx, 'opacityFactor', 1);
        }
    )
);

/* ### CartoonVolumeStyle ### */
x3dom.registerNodeType(
    "CartoonVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.CartoonVolumeStyle.superClass.call(this, ctx);

            this.addField_SFColor(ctx, 'parallelColor', 0, 0, 0);
            this.addField_SFColor(ctx, 'orthogonalColor', 1, 1, 1);
            this.addField_SFInt32(ctx, 'colorSteps', 4);
        }
    )
);

/* ### ComposedVolumeStyle ### */
x3dom.registerNodeType(
    "ComposedVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.ComposedVolumeStyle.superClass.call(this, ctx);

            this.addField_SFBool(ctx, 'ordered', false);
            this.addField_MFNode('renderStyle', x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode);
        }
    )
);

/* ### EdgeEnhancementVolumeStyle ### */
x3dom.registerNodeType(
    "EdgeEnhancementVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.EdgeEnhancementVolumeStyle.superClass.call(this, ctx);

            this.addField_SFColor(ctx, 'edgeColor', 0, 0, 0);
            this.addField_SFFloat(ctx, 'gradientThreshold', 0.4);
        }
    )
);

/* ### ISOSurfaceVolumeData ### */
x3dom.registerNodeType(
    "ISOSurfaceVolumeData",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeDataNode,
        function (ctx) {
            x3dom.nodeTypes.ISOSurfaceVolumeData.superClass.call(this, ctx);

            this.addField_MFNode('renderStyle', x3dom.nodeTypes.X3DVolumeRenderStyleNode);
            this.addField_SFNode('gradients', x3dom.nodeTypes.X3DTexture3DNode);
            this.addField_MFFloat(ctx, 'surfaceValues', []);
            this.addField_SFFloat(ctx, 'contourStepSize', 0);
            this.addField_SFFloat(ctx, 'surfaceTolerance', 0);
        }
    )
);

/* ### MPRVolumeStyle ### */
x3dom.registerNodeType(
     "MPRVolumeStyle",
     "VolumeRendering",
     defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
         function (ctx) {
            x3dom.nodeTypes.MPRVolumeStyle.superClass.call(this, ctx);
            
            this.addField_SFVec3f(ctx, 'originLine', 1.0, 1.0, 0.0);
            this.addField_SFVec3f(ctx, 'finalLine', 0.0, 1.0, 0.0);
            this.addField_SFFloat(ctx, 'positionLine', 0.2);
            
            this.uniformVec3fOriginLine = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformVec3fFinalLine = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatPosition = new x3dom.nodeTypes.Uniform(ctx);
         },
         {
            fieldChanged: function(fieldName) {
                 if (fieldName == "originLine" || fieldName == "finalLine" ||
                     fieldName == "positionLine") {
                      //var that = this;
                      //Array.forEach(this._parentNodes, function (vol) {
                      //  vol.updateFields("positionLine", that._vf.positionLine);
                      //});
                     this.uniformFloatPosition._vf.value = this._vf.positionLine;
                     this.uniformFloatPosition.fieldChanged("value");
                 }
            },

            uniforms: function() {
                var unis = [];

                this.uniformVec3fOriginLine._vf.name = 'originLine';
                this.uniformVec3fOriginLine._vf.type = 'SFVec3f';
                this.uniformVec3fOriginLine._vf.value = this._vf.originLine.toString();
                unis.push(this.uniformVec3fOriginLine);

                this.uniformVec3fFinalLine._vf.name = 'finalLine';
                this.uniformVec3fFinalLine._vf.type = 'SFVec3f';
                this.uniformVec3fFinalLine._vf.value = this._vf.finalLine.toString();
                unis.push(this.uniformVec3fFinalLine);

                this.uniformFloatPosition._vf.name = 'positionLine';
                this.uniformFloatPosition._vf.type = 'SFFloat';
                this.uniformFloatPosition._vf.value = this._vf.positionLine;
                unis.push(this.uniformFloatPosition);
  
                return unis;
            },

            styleUniformsShaderText: function(){
                return "uniform vec3 originLine;\nuniform vec3 finalLine;\nuniform float positionLine;\n";
            },

            fragmentShaderText : function (numberOfSlices, slicesOverX, slicesOverY) {
                var shader = 
                this.preamble+
                this.defaultUniformsShaderText(numberOfSlices, slicesOverX, slicesOverY)+
                this.styleUniformsShaderText()+
                this.texture3DFunctionShaderText+
                "void main()\n"+
                "{\n"+
                "  vec2 texC = vertexPosition.xy/vertexPosition.w;\n"+
                "  texC = 0.5*texC + 0.5;\n"+
                "  vec4 backColor = texture2D(uBackCoord,texC);\n"+
                "  vec3 dir =  backColor.xyz -vertexColor.xyz;\n"+
                "  vec3 normalPlane = finalLine-originLine;\n"+
                "  vec3 pointLine = normalPlane*positionLine+originLine;\n"+
                "  float d = dot(pointLine-vertexColor.xyz,normalPlane)/dot(dir,normalPlane);\n"+
                "  vec4 color = vec4(0.0,0.0,0.0,0.0);\n"+
                "  vec3 pos = d*dir+vertexColor.rgb;\n"+
                "  if (!(pos.x > 1.0 || pos.y > 1.0 || pos.z > 1.0 || pos.x<0.0 || pos.y<0.0 || pos.z<0.0)){\n"+
                "    color = vec4(cTexture3D(uVolData,pos.rgb,numberOfSlices,slicesOverX,slicesOverY).rgb,1.0);\n"+
                "  }\n"+
                "  gl_FragColor = color;\n"+
                "}";
                return shader;
            }
         }
    )
);

/* ### OpacityMapVolumeStyle ### */
x3dom.registerNodeType(
    "OpacityMapVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.OpacityMapVolumeStyle.superClass.call(this, ctx);

            this.addField_SFNode('transferFunction', x3dom.nodeTypes.Texture);
            this.addField_SFString(ctx, 'type', "simple");
            this.addField_SFFloat(ctx, 'opacityFactor', 6.0);
            this.addField_SFFloat(ctx, 'lightFactor', 1.2);

            this.uniformFloatOpacityFactor = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatLightFactor = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformSampler2DTransferFunction = new x3dom.nodeTypes.Uniform(ctx);
        },
        {
            uniforms: function() {
                var unis = [];
                
                if (this._cf.transferFunction.node) {
                    this.uniformSampler2DTransferFunction._vf.name = 'uTransferFunction';
                    this.uniformSampler2DTransferFunction._vf.type = 'SFInt32';
                    this.uniformSampler2DTransferFunction._vf.value = 2; //FIXME: Number of textures could be variable
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

                return unis;
            },

            textures: function() {
                var texs = [];
                var tex = this._cf.transferFunction.node;
                if (tex) {
                    tex._vf.repeatS = false;
                    tex._vf.repeatT = false;
                    texs.push(tex)
                }
                return texs;
            },

            styleUniformsShaderText: function() {
                var uniformsText = "uniform float uOpacityFactor;\n"+
                "uniform float uLightFactor;\n";
                if (this._cf.transferFunction.node) {
                        uniformsText += "uniform sampler2D uTransferFunction;\n";
                }
                return uniformsText;
            },

            inlineStyleShaderText: function(){
                var shaderText =
                "    opacityFactor = uOpacityFactor;\n"+
                "    lightFactor = uLightFactor;\n";
                if (this._cf.transferFunction.node){
                        shaderText += "    value = texture2D(uTransferFunction,vec2(value.r,0.5));\n";
                }
                return shaderText;
            },

            lightAssigment: function(){
                return "value.rgb = ambient*value.rgb + diffuse*value.rgb + specular;\n";
            },

            fragmentShaderText : function (numberOfSlices, slicesOverX, slicesOverY) {
                var shader = 
                this.preamble+
                this.defaultUniformsShaderText(numberOfSlices, slicesOverX, slicesOverY)+
                this.styleUniformsShaderText()+
                this.texture3DFunctionShaderText+
                this.normalFunctionShaderText()+
                this.lightEquationShaderText+
                this.defaultLoopFragmentShaderText(this.inlineStyleShaderText(), this.lightAssigment());
                return shader;
            }
        }
    )
);

/* ### ProjectionVolumeStyle ### */
x3dom.registerNodeType(
    "ProjectionVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.ProjectionVolumeStyle.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'intensityThreshold', 0);
            this.addField_SFString(ctx, 'type', "MAX");

            this.uniformIntensityThreshold = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformType = new x3dom.nodeTypes.Uniform(ctx);
        },
        {
            uniforms: function(){
                var unis = [];
                var type_map = {'max':0,'min':1,'average':2};

                this.uniformIntensityThreshold._vf.name = 'uIntensityThreshold';
                this.uniformIntensityThreshold._vf.type = 'SFFloat';
                this.uniformIntensityThreshold._vf.value = this._vf.intensityThreshold;
                unis.push(this.uniformIntensityThreshold);

                this.uniformType._vf.name = 'uType';
                this.uniformType._vf.type = 'SFInt32';
                this.uniformType._vf.value = type_map[this._vf.type.toLowerCase()];
                unis.push(this.uniformType);

                return unis;
            },

            styleUniformsShaderText: function(){
                return "uniform int uType;\nuniform float uIntensityThreshold;\n";
            },

            fragmentShaderText: function(numberOfSlices, slicesOverX, slicesOverY){
                var shader = 
                this.preamble+
                this.defaultUniformsShaderText(numberOfSlices, slicesOverX, slicesOverY)+
                this.styleUniformsShaderText()+
                this.texture3DFunctionShaderText+
                "void main()\n"+
                "{\n"+
                "  vec2 texC = vertexPosition.xy/vertexPosition.w;\n"+
                "  texC = 0.5*texC + 0.5;\n"+
                "  vec4 backColor = texture2D(uBackCoord,texC);\n"+
                "  vec3 dir = backColor.rgb - vertexColor.rgb;\n"+
                "  vec3 pos = vertexColor;\n"+
                "  vec4 accum  = vec4(0.0, 0.0, 0.0, 0.0);\n"+
                "  vec4 sample = vec4(0.0, 0.0, 0.0, 0.0);\n"+
                "  vec4 value  = vec4(0.0, 0.0, 0.0, 0.0);\n"+
                "  vec4 color  = vec4(0.0);\n";
                if (this._vf.type.toLowerCase() === "max") {
                    shader += "vec2 previous_value = vec2(0.0);\n";
                }else {
                    shader += "vec2 previous_value = vec2(1.0);\n";
                }
                shader +=
                "  float cont = 0.0;\n"+
                "  vec3 step = dir/Steps;\n"+
                "  const float lightFactor = 1.3;\n"+
                "  const float opacityFactor = 3.0;\n"+
                "  for(float i = 0.0; i < Steps; i+=1.0)\n"+
                "  {\n"+
                "    value = cTexture3D(uVolData,pos,numberOfSlices,slicesOverX,slicesOverY);\n"+
                "    value = vec4(value.rgb,(0.299*value.r)+(0.587*value.g)+(0.114*value.b));\n"+
                "    //Process the volume sample\n"+
                "    sample.a = value.a * opacityFactor * (1.0/Steps);\n"+
                "    sample.rgb = value.rgb * sample.a * lightFactor;\n"+
                "    accum.a += (1.0-accum.a)*sample.a;\n";
                switch (this._vf.type.toLowerCase()) {
                    case "max":
                        shader += "if(value.r > uIntensityThreshold && value.r <= previous_value.x){\n"+
                        "   break;\n"+
                        "}\n"+
                        "color.rgb = vec3(max(value.r, previous_value.x));\n"+
                        "color.a = (value.r > previous_value.x) ? accum.a : previous_value.y;\n";
                        break;
                    case "min":
                        shader += "if(value.r < uIntensityThreshold && value.r >= previous_value.x){\n"+
                        "   break;\n"+
                        "}\n"+
                        "color.rgb = vec3(min(value.r, previous_value.x));\n"+
                        "color.a = (value.r < previous_value.x) ? accum.a : previous_value.y;\n";
                        break;
                    case "average":
                        shader+= "color.rgb += (1.0 - accum.a) * sample.rgb;\n"+
                        "color.a = accum.a;\n";
                        break;
                }
                shader += 
                "    //update the previous value and keeping the accumulated alpha\n"+
                "    previous_value.x = color.r;\n"+
                "    previous_value.y = accum.a;\n"+
                "    //advance the current position\n"+
                "    pos.xyz += step;\n"+
                "    //break if the position is greater than <1, 1, 1>\n"+
                "    if(pos.x > 1.0 || pos.y > 1.0 || pos.z > 1.0 || accum.a>=1.0){\n";
                if(this._vf.type.toLowerCase() == "average"){
                    shader += "     if((i > 0.0) && (i < Steps-1.0)){\n"+
                    "color.rgb = color.rgb/i;\n"+
                    "}\n";
                }
                shader+=
                "      break;\n"+
                "    }\n"+
                " }\n"+
                " gl_FragColor = color;\n"+
                "}";
                return shader;
            }
        }
    )
);

/* ### SegmentedVolumeData ### */
x3dom.registerNodeType(
    "SegmentedVolumeData",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeDataNode,
        function (ctx) {
            x3dom.nodeTypes.SegmentedVolumeData.superClass.call(this, ctx);

            this.addField_MFNode('renderStyle', x3dom.nodeTypes.X3DVolumeDataNode);
            this.addField_SFNode('segmentIdentifiers', x3dom.nodeTypes.X3DVolumeDataNode);
            this.addField_MFBoolean(ctx, 'segmentEnabled', []);
        }
    )
);

/* ### ShadedVolumeStyle ### */
x3dom.registerNodeType(
    "ShadedVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.ShadedVolumeStyle.superClass.call(this, ctx);

            this.addField_SFNode('material', x3dom.nodeTypes.X3DMaterialNode);
            this.addField_SFBool(ctx, 'lighting', false);
            this.addField_SFBool(ctx, 'shadows', false);
            this.addField_SFString(ctx, 'phaseFunction', "Henyey-Greenstein");
        }
    )
);

/* ### SilhouetteEnhancementVolumeStyle ### */
x3dom.registerNodeType(
    "SilhouetteEnhancementVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.SilhouetteEnhancementVolumeStyle.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'silhouetteBoundaryOpacity', 0);
            this.addField_SFFloat(ctx, 'silhouetteRetainedOpacity', 1);
            this.addField_SFFloat(ctx, 'silhouetteSharpness', 0.5);
        }
    )
);

/* ### StippleVolumeStyle ### */
x3dom.registerNodeType(
    "StippleVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.StippleVolumeStyle.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'distanceFactor', 1);
            this.addField_SFFloat(ctx, 'interiorFactor', 1);
            this.addField_SFFloat(ctx, 'lightingFactor', 1);
            this.addField_SFFloat(ctx, 'gradientThreshold', 0.4);
            this.addField_SFFloat(ctx, 'gradientRetainedOpacity', 1);
            this.addField_SFFloat(ctx, 'gradientBoundaryOpacity', 0);
            this.addField_SFFloat(ctx, 'gradientOpacityFactor', 1);
            this.addField_SFFloat(ctx, 'silhouetteRetainedOpacity', 1);
            this.addField_SFFloat(ctx, 'silhouetteBoundaryOpacity', 0);
            this.addField_SFFloat(ctx, 'silhouetteOpacityFactor', 1);
            this.addField_SFFloat(ctx, 'resolutionFactor', 1);
        }
    )
);

/* ### ToneMappedVolumeStyle ### */
x3dom.registerNodeType(
    "ToneMappedVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.ToneMappedVolumeStyle.superClass.call(this, ctx);

            this.addField_SFColor(ctx, 'coolColor', 0, 0, 1);
            this.addField_SFColor(ctx, 'warmColor', 1, 1, 0);
        }
    )
);

/* ### VolumeData ### */
x3dom.registerNodeType(
    "VolumeData",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeDataNode,
        function (ctx) {
            x3dom.nodeTypes.VolumeData.superClass.call(this, ctx);

            this.addField_SFNode('renderStyle', x3dom.nodeTypes.X3DVolumeRenderStyleNode);

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
        },
        {
            // nodeChanged is called after subtree is parsed and attached in DOM
            nodeChanged: function()
            {
                // uhhhh, manually build backend-graph scene-subtree,
                // therefore, try to mimic depth-first parsing scheme
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
                    
                    this.vrcMultiTexture._nameSpace = this._nameSpace;
                    
                    this.vrcMultiTexture.addChild(this.vrcRenderTexture, 'texture');
                    this.vrcRenderTexture.nodeChanged();
                    
                    this.vrcMultiTexture.addChild(this.vrcVolumeTexture, 'texture');
                    this.vrcVolumeTexture.nodeChanged();
                    
                    // textures from styles
                    if (this._cf.renderStyle.node.textures) {
                        var styleTextures = this._cf.renderStyle.node.textures();
                        for (i = 0; i<styleTextures.length; i++)
                        {
                            this.vrcMultiTexture.addChild(styleTextures[i], 'texture');
                            this.vrcVolumeTexture.nodeChanged();

                            /* TODO: Take texture size for the ComposableRenderStyles offset parameter
                            // check for texture size (test)
                            window.setInterval((function(aTex) {
                                return function() {
                                    var s = that.getTextureSize(aTex);
                                    console.log(s);
                                }
                            })(styleTextures[i]), 100);
                            */
                        }
                    }
                    
                    this._cf.appearance.node.addChild(this.vrcMultiTexture);
                    this.vrcMultiTexture.nodeChanged();
                    
                    // here goes the volume shader
                    this.vrcFrontCubeShaderVertex._vf.type = 'vertex';
                    this.vrcFrontCubeShaderVertex._vf.url[0]=this._cf.renderStyle.node.vertexShaderText();

                    this.vrcFrontCubeShaderFragment._vf.type = 'fragment';
                    this.vrcFrontCubeShaderFragment._vf.url[0]=this._cf.renderStyle.node.fragmentShaderText(
                            this.vrcVolumeTexture._vf.numberOfSlices,
                            this.vrcVolumeTexture._vf.slicesOverX, this.vrcVolumeTexture._vf.slicesOverY);

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

                    this.vrcFrontCubeShader.addChild(this.vrcFrontCubeShaderFieldBackCoord, 'fields');
                    this.vrcFrontCubeShaderFieldBackCoord.nodeChanged();
                    
                    this.vrcFrontCubeShader.addChild(this.vrcFrontCubeShaderFieldVolData, 'fields');
                    this.vrcFrontCubeShaderFieldVolData.nodeChanged();
                    
                    var ShaderUniforms = this._cf.renderStyle.node.uniforms();
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
