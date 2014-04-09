/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DComposableVolumeRenderStyleNode ### */
x3dom.registerNodeType(
    "X3DComposableVolumeRenderStyleNode",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeRenderStyleNode,
        
        /**
         * Constructor for X3DComposableVolumeRenderStyleNode
         * @constructs x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DVolumeRenderStyleNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode.superClass.call(this, ctx);


            /**
             *
             * @var {SFNode} surfaceNormals
             * @memberof x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode
             * @initvalue x3dom.nodeTypes.X3DTexture3DNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('surfaceNormals', x3dom.nodeTypes.X3DTexture3DNode);
        
        },
        {
            defaultUniformsShaderText: function(numberOfSlices, slicesOverX, slicesOverY){
                var uniformsText =
                    "uniform sampler2D uBackCoord;\n"+
                    "uniform sampler2D uVolData;\n"+
                    "uniform vec3 offset;\n"+
                    "uniform mat4 modelViewMatrix;\n"+
                    "uniform mat4 modelViewMatrixInverse;\n"+
                    "uniform sampler2D uSurfaceNormals;\n"+ //Necessary for composed style, even it is not used in others
                    "varying vec3 vertexColor;\n"+
                    "varying vec4 vertexPosition;\n";
                if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                    uniformsText += "varying vec4 position_eye;\n";
                }
                uniformsText +=
                    "const float Steps = 60.0;\n"+
                    "const float numberOfSlices = "+ numberOfSlices.toPrecision(5)+";\n"+
                    "const float slicesOverX = " + slicesOverX.toPrecision(5) +";\n"+
                    "const float slicesOverY = " + slicesOverY.toPrecision(5) +";\n";
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