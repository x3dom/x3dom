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

/* ### X3DVolumeDataNode ### */
x3dom.registerNodeType(
    "X3DVolumeDataNode",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DShapeNode,   // changed inheritance!
        
        /**
         * Constructor for X3DVolumeDataNode
         * @constructs x3dom.nodeTypes.X3DVolumeDataNode
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DShapeNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc (Abstract) class for volume data. 
         */
        function (ctx) {
            x3dom.nodeTypes.X3DVolumeDataNode.superClass.call(this, ctx);


            /**
             * Specifies the size of of the bounding box for the volume data.
             * @var {x3dom.fields.SFVec3f} dimensions
             * @memberof x3dom.nodeTypes.X3DVolumeDataNode
             * @initvalue 1,1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'dimensions', 1, 1, 1);

            /**
             * The voxels field is an ImageTextureAtlas node containing the volume data.
             * @var {x3dom.fields.SFNode} voxels
             * @memberof x3dom.nodeTypes.X3DVolumeDataNode
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('voxels', x3dom.nodeTypes.Texture);
            //this.addField_MFNode('voxels', x3dom.nodeTypes.X3DTexture3DNode);
            //this.addField_SFBool(ctx, 'swapped', false);
            //this.addField_SFVec3f(ctx, 'sliceThickness', 1, 1, 1);

            /**
             * Allow to locate the viewpoint inside the volume.
             * @var {x3dom.fields.SFBool} allowViewpointInside
             * @memberof x3dom.nodeTypes.X3DVolumeDataNode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'allowViewpointInside', true)

            //Neccesary for counting the textures which are added on each style, number of textures can be variable
            this._textureID = 0;
            this._first = true;
            this._styleList = [];
            this.surfaceNormalsNeeded = false;
            this.normalTextureProvided = false;
            this.fragmentPreamble = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n" +
                                    "  precision highp float;\n" +
                                    "#else\n" +
                                    "  precision mediump float;\n" +
                                    "#endif\n\n";
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
            },

            //Common vertex shader text for all volume data nodes
            vertexShaderText: function(needEyePosition){
                var shader = 
                "attribute vec3 position;\n"+
                "uniform vec3 dimensions;\n"+
                "uniform mat4 modelViewProjectionMatrix;\n"+
                "varying vec4 vertexPosition;\n"+
                "varying vec4 pos;\n";
                if(x3dom.nodeTypes.X3DLightNode.lightID>0 || (needEyePosition===true)){
                    shader += "uniform mat4 modelViewMatrix;\n"+
                    "varying vec4 position_eye;\n";
                }
                shader += "\n" +
                "void main()\n"+
                "{\n"+
                "  vertexPosition = modelViewProjectionMatrix * vec4(position, 1.0);\n";
                if(x3dom.nodeTypes.X3DLightNode.lightID>0 || (needEyePosition===true)){
                   shader += "  position_eye = modelViewMatrix * vec4(position, 1.0);\n";
                }
                shader += 
                "  pos = vec4((position/dimensions)+0.5, 1.0);\n"+
                "  gl_Position = vertexPosition;\n"+
                "}";
                return shader;
            },

            defaultUniformsShaderText: function(numberOfSlices, slicesOverX, slicesOverY, needEyePosition){
               var uniformsText = 
                "uniform sampler2D uVolData;\n"+
                "uniform vec3 dimensions;\n"+
                "uniform vec3 offset;\n"+
                "uniform mat4 modelViewMatrix;\n"+
                "uniform mat4 modelViewMatrixInverse;\n"+
                "varying vec4 vertexPosition;\n"+
                "varying vec4 pos;\n";
                if(x3dom.nodeTypes.X3DLightNode.lightID>0 || (needEyePosition===true)){
                    uniformsText += "varying vec4 position_eye;\n";
                }
                //LIGHTS
                for(var l=0; l<x3dom.nodeTypes.X3DLightNode.lightID; l++) {
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
                uniformsText +=
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
                "  dy1 = floor(s1/nX)/nY;\n"+
                "  dx2 = fract(s2/nX);\n"+
                "  dy2 = floor(s2/nX)/nY;\n"+
                "  texpos1.x = dx1+(volpos.x/nX);\n"+
                "  texpos1.y = dy1+(volpos.y/nY);\n"+
                "  texpos2.x = dx2+(volpos.x/nX);\n"+
                "  texpos2.y = dy2+(volpos.y/nY);\n"+
                "  return mix( texture2D(vol,texpos1), texture2D(vol,texpos2), (volpos.z*nS)-s1);\n"+
                "}\n"+
                "\n",

            normalFunctionShaderText: function(){
                if (this.surfaceNormalsNeeded){
                    return "vec4 getNormalFromTexture(sampler2D sampler, vec3 pos, float nS, float nX, float nY) {\n"+
                    "   vec4 n = (2.0*cTexture3D(sampler, pos, nS, nX, nY)-1.0);\n"+
                    "   return vec4(normalize(n.xyz), length(n.xyz));\n"+
                    "}\n"+
                    "\n"+
                    "vec4 getNormalOnTheFly(sampler2D sampler, vec3 voxPos, float nS, float nX, float nY){\n"+
                    "   float v0 = cTexture3D(sampler, voxPos + vec3(offset.x, 0, 0), nS, nX, nY).r;\n"+
                    "   float v1 = cTexture3D(sampler, voxPos - vec3(offset.x, 0, 0), nS, nX, nY).r;\n"+
                    "   float v2 = cTexture3D(sampler, voxPos + vec3(0, offset.y, 0), nS, nX, nY).r;\n"+
                    "   float v3 = cTexture3D(sampler, voxPos - vec3(0, offset.y, 0), nS, nX, nY).r;\n"+
                    "   float v4 = cTexture3D(sampler, voxPos + vec3(0, 0, offset.z), nS, nX, nY).r;\n"+
                    "   float v5 = cTexture3D(sampler, voxPos - vec3(0, 0, offset.z), nS, nX, nY).r;\n"+
                    "   vec3 grad = vec3(v0-v1, v2-v3, v4-v5)*0.5;\n"+
                    "   return vec4(normalize(grad), length(grad));\n"+
                    "}\n"+
                    "\n";
                }else{
                    return "";
                }
            },

            defaultLoopFragmentShaderText: function(inlineShaderText, inlineLightAssigment, initializeValues){
                initializeValues = typeof initializeValues !== 'undefined' ? initializeValues : ""; //default value, empty string
                var shaderLoop = "void main()\n"+
                "{\n"+
                "  vec3 cam_pos = vec3(modelViewMatrixInverse[3][0], modelViewMatrixInverse[3][1], modelViewMatrixInverse[3][2]);\n"+
                "  vec3 cam_cube = cam_pos/dimensions+0.5;\n"+
                "  vec3 dir = normalize(pos.xyz-cam_cube);\n";
                if(this._vf.allowViewpointInside){
                    shaderLoop +=
                    "  float cam_inside = float(all(bvec2(all(lessThan(cam_cube, vec3(1.0))),all(greaterThan(cam_cube, vec3(0.0))))));\n"+
                    "  vec3 ray_pos = mix(pos.xyz, cam_cube, cam_inside);\n";
                }else{
                    shaderLoop += "  vec3 ray_pos = pos.xyz;\n";
                }
                shaderLoop +=
                "  vec4 accum  = vec4(0.0, 0.0, 0.0, 0.0);\n"+
                "  vec4 sample = vec4(0.0, 0.0, 0.0, 0.0);\n"+
                "  vec4 value  = vec4(0.0, 0.0, 0.0, 0.0);\n"+
                "  float cont = 0.0;\n"+
                "  vec3 step_size = dir/Steps;\n";
                //Light init values
                if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                    shaderLoop +=
                    "  vec3 ambient = vec3(0.0, 0.0, 0.0);\n"+
                    "  vec3 diffuse = vec3(0.0, 0.0, 0.0);\n"+
                    "  vec3 specular = vec3(0.0, 0.0, 0.0);\n"+
                    "  vec4 step_eye = modelViewMatrix * vec4(step_size, 0.0);\n"+
                    "  vec4 positionE = position_eye;\n"+
                    "  float lightFactor = 1.0;\n"; 
                }else{
                    shaderLoop += "  float lightFactor = 1.2;\n";
                }
                shaderLoop += initializeValues+
                "  float opacityFactor = 10.0;\n"+
                "  float t_near;\n"+
                "  float t_far;\n"+
                "  for(float i = 0.0; i < Steps; i+=1.0)\n"+
                "  {\n"+
                "    value = cTexture3D(uVolData, ray_pos, numberOfSlices, slicesOverX, slicesOverY);\n"+
                "    value = value.rgbr;\n";
                if(this.surfaceNormalsNeeded){
                    if(this.normalTextureProvided){
                        shaderLoop += "    vec4 gradEye = getNormalFromTexture(uSurfaceNormals, ray_pos, numberOfSlices, slicesOverX, slicesOverY);\n";
                    }else{
                        shaderLoop += "    vec4 gradEye = getNormalOnTheFly(uVolData, ray_pos, numberOfSlices, slicesOverX, slicesOverY);\n";
                    }
                    shaderLoop += "    vec4 grad = vec4((modelViewMatrix * vec4(gradEye.xyz, 0.0)).xyz, gradEye.a);\n";
                }
                shaderLoop += inlineShaderText;
                if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                    shaderLoop += inlineLightAssigment;
                }
                shaderLoop +=
                //Composite the volume sample
                "    sample.a = value.a * opacityFactor * (1.0/Steps);\n"+
                "    sample.rgb = value.rgb * sample.a * lightFactor;\n"+
                "    accum.rgb += (1.0 - accum.a) * sample.rgb;\n"+
                "    accum.a += (1.0 - accum.a) * sample.a;\n"+
                //Advance the current ray position
                "    ray_pos.xyz += step_size;\n";
                if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                    shaderLoop +="    positionE += step_eye;\n";
                }
                shaderLoop +=
                //Early ray termination and Break if the position is greater than <1, 1, 1>
                "    if(accum.a >= 1.0 || ray_pos.x < 0.0 || ray_pos.y < 0.0 || ray_pos.z < 0.0 || ray_pos.x > 1.0 || ray_pos.y > 1.0 || ray_pos.z > 1.0)\n"+
                "      break;\n"+
                "  }\n"+
                "  gl_FragColor = accum;\n"+
                "}";
                return shaderLoop;
            }
        }
    )
);
