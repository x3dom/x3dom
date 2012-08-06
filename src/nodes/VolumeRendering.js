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
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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
            
            this.uniformVec3fOriginLine = new x3dom.nodeTypes.Field(ctx);
            this.uniformVec3fFinalLine = new x3dom.nodeTypes.Field(ctx);
            this.uniformFloatPosition = new x3dom.nodeTypes.Field(ctx);
             
         },
         {
            nodeChange: function() {},
            uniforms: function() {
                var unis = [];
/*
                this.uniformVec3fOriginLine._vf.name = 'originLine';
                this.uniformVec3fOriginLine._vf.type = 'SFVec3f';
                this.uniformVec3fOriginLine._vf.value = this._vf.originLine;
                unis.push(this.uniformVec3fOriginLine);

                this.uniformVec3fFinalLine._vf.name = 'finalLine';
                this.uniformVec3fFinalLine._vf.type = 'SFVec3f';
                this.uniformVec3fFinalLine._vf.value = this._vf.finalLine;
                unis.push(this.uniformVec3fFinalLine);
*/
                this.uniformFloatPosition._vf.name = 'positionLine';
                this.uniformFloatPosition._vf.type = 'SFFloat';
                this.uniformFloatPosition._vf.value = this._vf.positionLine;
                unis.push(this.uniformFloatPosition);
  
                return unis;
            },        
            vertexShaderText : function() {
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
            fragmentShaderText : function (numberOfSlices, slicesOverX, slicesOverY) {
                 var shader = 
                "#ifdef GL_ES\n" +
                "  precision highp float;\n" +
                "#endif\n" +
                "\n" +
                "uniform sampler2D uBackCoord;\n"+
                "uniform sampler2D uVolData;\n"+
                "const vec3 originLine=vec3(1.0,0.0,0.0);\n"+
                "const vec3 finalLine=vec3(0.0,0.0,0.0);\n"+
                "uniform float positionLine;\n"+
                "varying vec3 vertexColor;\n"+
                "varying vec4 vertexPosition;\n"+
                "const float Steps = 60.0;\n"+
                "const float numberOfSlices = "+ numberOfSlices.toPrecision(5)+";\n"+
                "const float slicesOverX = " + slicesOverX.toPrecision(5) +";\n"+
                "const float slicesOverY = " + slicesOverY.toPrecision(5) +";\n"+
                "\n" +
                "vec4 cTexture3D(sampler2D vol, vec3 volpos, float nS, float nX, float nY)\n"+
                "{\n"+
                "  clamp(volpos.x,0.0,1.0);\n"+
                "  clamp(volpos.y,0.0,1.0);\n"+
                "  clamp(volpos.z,0.0,1.0);\n"+
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
                "  return mix( texture2D(vol,texpos1), texture2D(vol,texpos2), volpos.z-floor(volpos.z));\n"+
                "}"+
                "\n"+
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
            this.addField_SFFloat(ctx, 'opacityFactor', 0.01);
            this.addField_SFFloat(ctx, 'lightFactor', 0.3);
            this.uniformFloatOpacityFactor = new x3dom.nodeTypes.Field(ctx);
            this.uniformFloatLightFactor = new x3dom.nodeTypes.Field(ctx);
            this.uniformSampler2DTransferFunction = new x3dom.nodeTypes.Field(ctx);

        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {},
            uniforms: function() {
                var unis = [];
                
                if (!(this._cf.transferFunction.node==null)) {
                    this.uniformSampler2DTransferFunction._vf.name = 'uTransferFunction';
                    this.uniformSampler2DTransferFunction._vf.type = 'SFInt32';
                    this.uniformSampler2DTransferFunction._vf.value = 2; //FIXME: Number of textures could be variable
                    unis.push(this.uniformSampler2DTransferFunction);
                }

                this.uniformFloatOpacityFactor._vf.name = 'opacityFactor';
                this.uniformFloatOpacityFactor._vf.type = 'SFFloat';
                this.uniformFloatOpacityFactor._vf.value = this._vf.opacityFactor;
                unis.push(this.uniformFloatOpacityFactor);

                this.uniformFloatLightFactor._vf.name = 'lightFactor';
                this.uniformFloatLightFactor._vf.type = 'SFFloat';
                this.uniformFloatLightFactor._vf.value = this._vf.lightFactor;
                unis.push(this.uniformFloatLightFactor);

                return unis;
            },
            textures: function() {
                var texs = [];
                if (!(this._cf.transferFunction.node==null)) {
                    var tex = this._cf.transferFunction.node;
                    tex._vf.repeatS = false;
                    tex._vf.repeatT = false;
                    texs.push(tex)
                }
                return texs;
            },
            vertexShaderText : function() {
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
            fragmentShaderText : function (numberOfSlices, slicesOverX, slicesOverY) {
                 var shader = 
                "#ifdef GL_ES\n" +
                "  precision highp float;\n" +
                "#endif\n" +
                "\n" +
                "uniform sampler2D uBackCoord;\n"+
                "uniform sampler2D uVolData;\n";
                if (!(this._cf.transferFunction.node==null)) {
                        shader += "uniform sampler2D uTransferFunction;\n";
                }
                shader +=
                "uniform float opacityFactor;\n"+
                "uniform float lightFactor;\n"+
                "varying vec3 vertexColor;\n"+
                "varying vec4 vertexPosition;\n"+
                "const float Steps = 60.0;\n"+
                "const float numberOfSlices = "+ numberOfSlices.toPrecision(5)+";\n"+
                "const float slicesOverX = " + slicesOverX.toPrecision(5) +";\n"+
                "const float slicesOverY = " + slicesOverY.toPrecision(5) +";\n"+
                "\n" +
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
                "}"+
                "\n"+
                "void main()\n"+
                "{\n"+
                "  vec2 texC = vertexPosition.xy/vertexPosition.w;\n"+
                "  texC = 0.5*texC + 0.5;\n"+
                "  vec4 backColor = texture2D(uBackCoord,texC);\n"+
                "  vec3 dir = backColor.rgb - vertexColor.rgb;\n"+
                "  vec3 pos = vertexColor;\n"+
                "  vec4 accum  = vec4(1.0, 1.0, 1.0, 1.0);\n"+
                "  vec4 sample = vec4(0.0, 0.0, 0.0, 0.0);\n"+
                "  vec4 value  = vec4(0.0, 0.0, 0.0, 0.0);\n"+
                "  vec4 color  = vec4(0.0, 0.0, 0.0, 0.0);\n"+
                "  float cont = 0.0;\n"+
                "  vec3 step = dir/Steps;\n"+
                "  for(float i = 0.0; i < Steps; i+=1.0)\n"+
                "  {\n"+
                "    color = cTexture3D(uVolData,pos,numberOfSlices,slicesOverX,slicesOverY);\n";
                if (this._cf.transferFunction.node==null)
                {
                        shader += "    value = color;\n";
                } else {
                        shader += "    value = texture2D(uTransferFunction,vec2(color.r,0.5));\n";
                }
                shader+=
                "    //Process the volume sample\n"+
                "    sample.a = value.a * opacityFactor * (1.0/Steps);\n"+
                "    sample.rgb = value.rgb * lightFactor;\n"+
                "    accum.rgb -= accum.a * sample.rgb;\n"+
                "    accum.a -= sample.a;\n"+
                "    //advance the current position\n"+
                "    pos.xyz += step;\n"+
                "    //break if the position is greater than <1, 1, 1>\n"+
                "    if(pos.x > 1.0 || pos.y > 1.0 || pos.z > 1.0 || accum.a<=0.0)\n"+
                "      break;\n"+
                "}\n"+
                "gl_FragColor = vec4(1.0-accum.rgb,accum.a);\n"+
                "}";
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
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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
            this.addField_MFBool(ctx, 'segmentEnabled', []);
            this.addField_SFNode('segmentIdentifiers', x3dom.nodeTypes.X3DVolumeDataNode);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
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
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### ColorBox ### */
//FIXME: Not a real X3D Node Auxiliary geometry
x3dom.registerNodeType(
    "ColorBox",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.ColorBox.superClass.call(this, ctx);

            this.addField_SFVec3f(ctx, 'size', 1, 1, 1);

            var sx = this._vf.size.x,
                sy = this._vf.size.y,
                sz = this._vf.size.z;

                var geoCacheID = 'ColorBox_'+sx+'-'+sy+'-'+sz;

                if( x3dom.geoCache[geoCacheID] !== undefined )
                {
                      this._mesh = x3dom.geoCache[geoCacheID];
                }
                else
                {
                      sx /= 2; sy /= 2; sz /= 2;

                      this._mesh._positions[0] = [
                            -sx,-sy,-sz,  -sx, sy,-sz,   sx, sy,-sz,   sx,-sy,-sz, //back   0,0,-1
                            -sx,-sy, sz,  -sx, sy, sz,   sx, sy, sz,   sx,-sy, sz, //front  0,0,1
                            -sx,-sy,-sz,  -sx,-sy, sz,  -sx, sy, sz,  -sx, sy,-sz, //left   -1,0,0
                             sx,-sy,-sz,   sx,-sy, sz,   sx, sy, sz,   sx, sy,-sz, //right  1,0,0
                            -sx, sy,-sz,  -sx, sy, sz,   sx, sy, sz,   sx, sy,-sz, //top    0,1,0
                            -sx,-sy,-sz,  -sx,-sy, sz,   sx,-sy, sz,   sx,-sy,-sz  //bottom 0,-1,0
                      ];
                  
                      this._mesh._colors[0] = [
                            0, 0, 0,  0, 1, 0,  1, 1, 0,  1, 0, 0,
                            0, 0, 1,  0, 1, 1,  1, 1, 1,  1, 0, 1,
                            0, 0, 0,  0, 0, 1,  0, 1, 1,  0, 1, 0,
                            1, 0, 0,  1, 0, 1,  1, 1, 1,  1, 1, 0,
                            0, 1, 0,  0, 1, 1,  1, 1, 1,  1, 1, 0,
                            0, 0, 0,  0, 0, 1,  1, 0, 1,  1, 0, 0
                      ];

                      this._mesh._normals[0] = [
                             0,  0, -1,   0,  0, -1,   0,  0, -1,   0,  0, -1,
                             0,  0,  1,   0,  0,  1,   0,  0,  1,   0,  0,  1,
                            -1,  0,  0,  -1,  0,  0,  -1,  0,  0,  -1,  0,  0,
                             1,  0,  0,   1,  0,  0,   1,  0,  0,   1,  0,  0,
                             0,  1,  0,   0,  1,  0,   0,  1,  0,   0,  1,  0,
                             0, -1,  0,   0, -1,  0,   0, -1,  0,   0, -1,  0
                      ];

                      this._mesh._indices[0] = [
                             0,  1,  2,   2,  3,  0,
                             4,  7,  5,   5,  7,  6,
                             8,  9, 10,  10, 11,  8,
                            12, 14, 13,  14, 12, 15,
                            16, 17, 18,  18, 19, 16,
                            20, 22, 21,  22, 20, 23
                      ];
                      
                      this._mesh._invalidate = true;
                      this._mesh._numFaces = 12;
                      this._mesh._numCoords = 24;

                      x3dom.geoCache[geoCacheID] = this._mesh;
                }
        },
        {
            fieldChanged: function(fieldName) {
                if (fieldName === "size") {
                    var sx = this._vf.size.x / 2,
                        sy = this._vf.size.y / 2,
                        sz = this._vf.size.z / 2;

                    this._mesh._positions[0] = [
                           -sx,-sy,-sz,  -sx, sy,-sz,   sx, sy,-sz,   sx,-sy,-sz, //back   0,0,-1
                           -sx,-sy, sz,  -sx, sy, sz,   sx, sy, sz,   sx,-sy, sz, //front  0,0,1
                           -sx,-sy,-sz,  -sx,-sy, sz,  -sx, sy, sz,  -sx, sy,-sz, //left   -1,0,0
                            sx,-sy,-sz,   sx,-sy, sz,   sx, sy, sz,   sx, sy,-sz, //right  1,0,0
                           -sx, sy,-sz,  -sx, sy, sz,   sx, sy, sz,   sx, sy,-sz, //top    0,1,0
                           -sx,-sy,-sz,  -sx,-sy, sz,   sx,-sy, sz,   sx,-sy,-sz  //bottom 0,-1,0
                    ];

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                    });
                }
            }
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
            this.vrcBackCubeGeometry = new x3dom.nodeTypes.ColorBox(ctx);
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
                        "#ifdef GL_ES\n" +
                        "  precision highp float;\n" +
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
                    if (this._cf.renderStyle.node.textures != undefined){
                        var styleTextures = this._cf.renderStyle.node.textures();
                        for (var i = 0; i< styleTextures.length; i++)
                        {
                            this.vrcMultiTexture.addChild(styleTextures[i], 'texture');
                            this.vrcVolumeTexture.nodeChanged();
                        }
                    }
                    
                    this._cf.appearance.node.addChild(this.vrcMultiTexture);
                    this.vrcMultiTexture.nodeChanged();
                    
                    
                    // here goes the volume shader
                    this.vrcFrontCubeShaderVertex._vf.type = 'vertex';
                    this.vrcFrontCubeShaderVertex._vf.url[0]=this._cf.renderStyle.node.vertexShaderText();

                    this.vrcFrontCubeShaderFragment._vf.type = 'fragment';
                    this.vrcFrontCubeShaderFragment._vf.url[0]=this._cf.renderStyle.node.fragmentShaderText(this.vrcVolumeTexture._vf.numberOfSlices, this.vrcVolumeTexture._vf.slicesOverX, this.vrcVolumeTexture._vf.slicesOverY);

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
                    
                    
                    var ShaderUniforms = this._cf.renderStyle.node.uniforms()
                    for (var i = 0; i<ShaderUniforms.length; i++)
                    {
                        this.vrcFrontCubeShader.addChild(ShaderUniforms[i], 'fields');
                    }
                    this.vrcFrontCubeShaderFieldVolData.nodeChanged();
                
                    this._cf.appearance.node.addChild(this.vrcFrontCubeShader);
                    this.vrcFrontCubeShader.nodeChanged();
                    
                    this._cf.appearance.node.nodeChanged();
                }

                if (!this._cf.geometry.node) {
                    this.addChild(new x3dom.nodeTypes.ColorBox());

                    this._cf.geometry.node._vf.size = new x3dom.fields.SFVec3f(
                    this._vf.dimensions.x, this._vf.dimensions.y, this._vf.dimensions.z);
                    this._cf.geometry.node._vf.ccw = true;
                    this._cf.geometry.node._vf.solid = true;

                                        // workaround to trigger field change...
                    this._cf.geometry.node.fieldChanged("size");
                    this._cf.geometry.node.fieldChanged("ccw");
                    this._cf.geometry.node.fieldChanged("solid");
                }
            },
            fieldChanged: function(fieldName) {}
        }
    )
);
