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

/* ### ProjectionVolumeStyle ### */
x3dom.registerNodeType(
    "ProjectionVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeRenderStyleNode,
        
        /**
         * Constructor for ProjectionVolumeStyle
         * @constructs x3dom.nodeTypes.ProjectionVolumeStyle
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DVolumeRenderStyleNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The ProjectionVolumeStyle node generates an output color based on the voxel data values traversed by a ray following the view direction. 
         */
        function (ctx) {
            x3dom.nodeTypes.ProjectionVolumeStyle.superClass.call(this, ctx);


            /**
             * The intensityThreshold field is used to define a local maximum or minimum value along the ray traversal. It is ignored on the AVERAGE intensity projection.
             * @var {x3dom.fields.SFFloat} intensityThreshold
             * @memberof x3dom.nodeTypes.ProjectionVolumeStyle
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'intensityThreshold', 0);

            /**
             * The type field specifies the type of intensity projection to be used. It can be MAX, MIN or AVERAGE.
             * @var {x3dom.fields.SFString} type
             * @memberof x3dom.nodeTypes.ProjectionVolumeStyle
             * @initvalue "MAX"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'type', "MAX");

            this.uniformIntensityThreshold = new x3dom.nodeTypes.Uniform(ctx);
            //this.uniformType = new x3dom.nodeTypes.Uniform(ctx);
        
        },
        {
            fieldChanged: function(fieldName){
                if (fieldName === 'intensityThreshold') {
                    this.uniformIntensityThreshold._vf.value = this._vf.intensityThreshold;
                    this.uniformIntensityThreshold.fieldChanged("value");
                }else if(fieldName === 'type'){
                    //TODO: Reload node
                }
            },

            uniforms: function(){
                var unis = [];
                //var type_map = {'max':0,'min':1,'average':2};

                this.uniformIntensityThreshold._vf.name = 'uIntensityThreshold';
                this.uniformIntensityThreshold._vf.type = 'SFFloat';
                this.uniformIntensityThreshold._vf.value = this._vf.intensityThreshold;
                unis.push(this.uniformIntensityThreshold);

                /*this.uniformType._vf.name = 'uType';
                this.uniformType._vf.type = 'SFInt32';
                this.uniformType._vf.value = type_map[this._vf.type.toLowerCase()];
                unis.push(this.uniformType);*/

                return unis;
            },

            styleUniformsShaderText: function(){
                return "uniform int uType;\n"+
                "uniform float uIntensityThreshold;\n";
            },

            fragmentShaderText: function(numberOfSlices, slicesOverX, slicesOverY){
                var shader = 
                this._parentNodes[0].fragmentPreamble+
                this._parentNodes[0].defaultUniformsShaderText(numberOfSlices, slicesOverX, slicesOverY)+
                this.styleUniformsShaderText()+
                this._parentNodes[0].texture3DFunctionShaderText+
                "void main()\n"+
                "{\n"+
                "  vec3 cam_pos = vec3(modelViewMatrixInverse[3][0], modelViewMatrixInverse[3][1], modelViewMatrixInverse[3][2]);\n"+
                "  cam_pos = cam_pos/dimensions+0.5;\n"+
                "  vec3 dir = normalize(pos.xyz-cam_pos);\n"+
                "  vec3 ray_pos = pos.xyz;\n"+
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
                "  vec3 step_size = dir/Steps;\n"+
                "  const float lightFactor = 1.3;\n"+
                "  const float opacityFactor = 3.0;\n"+
                "  for(float i = 0.0; i < Steps; i+=1.0)\n"+
                "  {\n"+
                "    value = cTexture3D(uVolData,ray_pos,numberOfSlices,slicesOverX,slicesOverY);\n"+
                "    value = vec4(value.rgb,(0.299*value.r)+(0.587*value.g)+(0.114*value.b));\n"+
                "    //Process the volume sample\n"+
                "    sample.a = value.a * opacityFactor * (1.0/Steps);\n"+
                "    sample.rgb = value.rgb * sample.a * lightFactor;\n"+
                "    accum.a += (1.0-accum.a)*sample.a;\n";
                if(this._vf.enabled){
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
                }
                shader += 
                "    //update the previous value and keeping the accumulated alpha\n"+
                "    previous_value.x = color.r;\n"+
                "    previous_value.y = accum.a;\n"+
                "    //advance the current position\n"+
                "    ray_pos.xyz += step_size;\n"+
                "    //break if the position is greater than <1, 1, 1>\n"+
                "    if(ray_pos.x > 1.0 || ray_pos.y > 1.0 || ray_pos.z > 1.0 || ray_pos.x <= 0.0 || ray_pos.y <= 0.0 || ray_pos.z <= 0.0 || accum.a>=1.0){\n";
                if(this._vf.type.toLowerCase() == "average" && this._vf.enabled){
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