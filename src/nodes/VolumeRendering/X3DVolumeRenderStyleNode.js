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
         * @classdesc (Abstract) class for volume rendering styles.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DVolumeRenderStyleNode.superClass.call(this, ctx);


            /**
             * Specifies whether the render style is enabled or disabled.
             * @var {x3dom.fields.SFBool} enabled
             * @memberof x3dom.nodeTypes.X3DVolumeRenderStyleNode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'enabled', true);
        
        },
        {
            initializeValues: function(){
                return ""; // overwritten
            },

            styleUniformsShaderText: function(){
                return ""; // overwritten
            },

            styleShaderText: function(){
                return ""; // overwritten
            },

            inlineStyleShaderText: function(){
                return ""; // overwritten
            },

            lightAssigment: function(){
                return "    value.rgb = ambient*value.rgb + diffuse*value.rgb + specular;\n"; // overwritten
            },

            // default light equation to be overwritten by concrete render style
            lightEquationShaderText: function(){
                if (x3dom.nodeTypes.X3DLightNode.lightID>0){
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
                    "\n";
                }else{
                    return "";
                }
            },
        }
    )
);