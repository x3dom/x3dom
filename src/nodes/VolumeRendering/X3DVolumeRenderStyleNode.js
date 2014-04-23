/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DVolumeRenderStyleNode ### */
x3dom.registerNodeType(
    "X3DVolumeRenderStyleNode",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DNode,
        
        /**
         * Constructor for X3DVolumeRenderStyleNode
         * @constructs x3dom.nodeTypes.X3DVolumeRenderStyleNode
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DVolumeRenderStyleNode.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.SFBool} enabled
             * @memberof x3dom.nodeTypes.X3DVolumeRenderStyleNode
             * @initvalue true
             * @field x3dom
             * @instance
             */
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
                    "varying vec4 vertexPosition;\n";
                if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                    shader += "uniform mat4 modelViewMatrix;\n"+
                        "varying vec4 position_eye;\n";
                }
                shader += "\n" +
                    "void main()\n"+
                    "{\n"+
                    "  vertexColor = color;\n"+
                    "  vertexPosition = modelViewProjectionMatrix * vec4(position, 1.0);\n";
                if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                    shader += "  position_eye = modelViewMatrix * vec4(position, 1.0);\n";
                }
                shader +=
                    "  gl_Position = vertexPosition;\n"+
                    "}";
                return shader;
            },

            defaultUniformsShaderText: function(numberOfSlices, slicesOverX, slicesOverY){
                var uniformsText =
                    "uniform sampler2D uBackCoord;\n"+
                    "uniform sampler2D uVolData;\n"+
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

            lightEquationShaderText: function(){
                return "void lighting(in float lType, in vec3 lLocation, in vec3 lDirection, in vec3 lColor, in vec3 lAttenuation, " +
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
                    "}\n"+
                    "\n"
            },

            normalFunctionShaderText: function(){
                return "vec4 getNormalFromTexture(sampler2D sampler, vec3 pos, float nS, float nX, float nY) {\n"+
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
                    "\n";
            },

            //Takes an array as an argument which contains the calls that will be made inside the main loop
            defaultLoopFragmentShaderText: function(inlineShaderText, inlineLightAssigment, initializeValues){
                initializeValues = typeof initializeValues !== 'undefined' ? initializeValues : ""; //default value, empty string
                var shaderLoop = "void main()\n"+
                    "{\n"+
                    "  vec2 texC = vertexPosition.xy/vertexPosition.w;\n"+
                    "  texC = 0.5*texC + 0.5;\n"+
                    "  vec4 backColor = texture2D(uBackCoord,texC);\n"+
                    "  vec3 dir = backColor.rgb - vertexColor.rgb;\n"+
                    "  vec3 pos = vertexColor;\n"+
                    "  vec3 cam_pos = vec3(modelViewMatrixInverse[3][0], modelViewMatrixInverse[3][1], modelViewMatrixInverse[3][2]);\n"+
                    "  vec4 accum  = vec4(0.0, 0.0, 0.0, 0.0);\n"+
                    "  vec4 sample = vec4(0.0, 0.0, 0.0, 0.0);\n"+
                    "  vec4 value  = vec4(0.0, 0.0, 0.0, 0.0);\n"+
                    "  float cont = 0.0;\n"+
                    "  vec3 step = dir/Steps;\n";
                //Light init values
                if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                    shaderLoop +=
                        "  vec3 ambient = vec3(0.0, 0.0, 0.0);\n"+
                        "  vec3 diffuse = vec3(0.0, 0.0, 0.0);\n"+
                        "  vec3 specular = vec3(0.0, 0.0, 0.0);\n"+
                        "  vec4 step_eye = modelViewMatrix * vec4(step, 0.0);\n"+
                        "  vec4 positionE = position_eye;\n"+
                        "  float lightFactor = 1.0;\n";
                }else{
                    shaderLoop += "  float lightFactor = 1.2;\n";
                }
                shaderLoop += initializeValues+
                    "  float opacityFactor = 10.0;\n"+
                    "  for(float i = 0.0; i < Steps; i+=1.0)\n"+
                    "  {\n"+
                    "    value = cTexture3D(uVolData, pos, numberOfSlices, slicesOverX, slicesOverY);\n"+
                    "    value = vec4(value.rgb,(0.299*value.r)+(0.587*value.g)+(0.114*value.b));\n";
                if(this._cf.surfaceNormals.node){
                    shaderLoop += "    vec4 gradEye = getNormalFromTexture(uSurfaceNormals, pos, numberOfSlices, slicesOverX, slicesOverY);\n";
                }else{
                    shaderLoop += "    vec4 gradEye = getNormalOnTheFly(uVolData, pos, numberOfSlices, slicesOverX, slicesOverY);\n";
                }
                shaderLoop += "    vec4 grad = vec4((modelViewMatrixInverse * vec4(gradEye.xyz, 0.0)).xyz, gradEye.a);\n";
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
                        "gradEye.xyz, -positionE.xyz, ambient, diffuse, specular);\n";
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
                    "    pos.xyz += step;\n";
                if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                    shaderLoop +="    positionE += step_eye;\n";
                }
                shaderLoop +=
                    "    //break if the position is greater than <1, 1, 1>\n"+
                    "    if(pos.x > 1.0 || pos.y > 1.0 || pos.z > 1.0 || accum.a>=1.0)\n"+
                    "      break;\n"+
                    "  }\n"+
                    "   gl_FragColor = accum;\n"+
                    "}";
                return shaderLoop;
            }
        }
    )
);