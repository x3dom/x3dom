/** @namespace x3dom.nodeTypes */
/*
 * Based on code originally provided by
 * http://www.x3dom.org
 * 
 * (c) 2014 Toshiba Corporation
 * Dual licensed under the MIT and GPL.
 */

/* ### RadarVolumeStyle ### */
x3dom.registerNodeType(
    "RadarVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeRenderStyleNode,
        /**
         * Constructor for RadarVolumeStyle
         * @constructs x3dom.nodeTypes.RadarVolumeStyle
         * @x3d n/a
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DVolumeRenderStyleNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The RadarVolumeStyle generates a volume rendering based on ray casting.
         * The rays terminate when they encounter a polygonal object inside the volume. Depth upto 
         * which a particular ray can travel inside the volume is calculated from the depth buffer 
         * of the polygonal objects in the volume.
         * The node also provides a method for generating flat cross-sectional views of the volume
         * at arbitrary positions. 
         */
        function (ctx) {
            x3dom.nodeTypes.RadarVolumeStyle.superClass.call(this, ctx);
            
            /**
             * depthTexture holds the depth limits for ray termination.
             * @var {x3dom.fields.SFNode} depthTexture
             * @memberof x3dom.nodeTypes.RadarVolumeStyle
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('depthTexture', x3dom.nodeTypes.Texture);
            
            /**
             * The transferFunction field is a texture that is going to be used to map each voxel value to a specific color output.
             * Voxel intensities from 0.0 to 1.0 are mapped linearly and horizontally to the texture.
             * @var {x3dom.fields.SFNode} transferFunction
             * @memberof x3dom.nodeTypes.RadarVolumeStyle
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('transferFunction', x3dom.nodeTypes.Texture);
            
            /**
             * The isoSurfaceCutoffValue field is specifies a threshold such that data with intensity below this is ignored during ray casting.
             * @var {x3dom.fields.SFFloat} isoSurfaceCutoffValue
             * @memberof x3dom.nodeTypes.RadarVolumeStyle
             * @initvalue 0.4
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'isoSurfaceCutoffValue', 0.4); // 0.0 ~ 1.0
            
            /**
             * The transparency field specifies a multiplier for the alpha value of the output color.
             * @var {x3dom.fields.SFFloat} transparency
             * @memberof x3dom.nodeTypes.RadarVolumeStyle
             * @initvalue 0.7
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'transparency', 1.0); // 0.0 ~ 1.0
            
            /**
             * The brightness field specifies a multiplier for the RGB values of the output color.
             * @var {x3dom.fields.SFFloat} brightness
             * @memberof x3dom.nodeTypes.RadarVolumeStyle
             * @initvalue 1.2
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'brightness', 1.0); // 1.0 ~ 
            
            /**
             * The accumFactor field specifies a multiplier for the color and intensity accumulated as the ray traverses the volume data in case of alpha composting based volume rendering (renderMode 2).
             * @var {x3dom.fields.SFFloat} accumFactor
             * @memberof x3dom.nodeTypes.RadarVolumeStyle
             * @initvalue 0.2
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'accumFactor', 0.2); // 0.2 ~ 
            
            /**
             * The intensityLimits field scales voxel intensities lying in (intensityLimits[0] ~ intensityLimits[1]) to (0.0 ~ 1.0) using : (xx - intensityLimits[0])/(intensityLimits[1]-intensityLimits[0])
             * @var {x3dom.fields.SFVec2f} intensityLimits
             * @memberof x3dom.nodeTypes.RadarVolumeStyle
             * @initvalue 0.1, 0.75
             * @field x3dom
             * @instance
             */
            this.addField_SFVec2f(ctx, 'intensityLimits', 0.0, 1.00); // 0.0 ~ 1.0
            
            /**
             * The xSectionOrientation field defines the rotation for plane used for cutting data. Given the bounding cube for the data is a unit cube centred at (0,0,0), the field provides a plane that intersects the bounding box.
             * Data on positive side of the plane is rendered.
             * @var {x3dom.fields.SFVec4f} xSectionOrientation
             * @memberof x3dom.nodeTypes.RadarVolumeStyle
             * @initvalue 0.0, 0.0, 0.0, 0.0
             * @field x3dom
             * @instance
             */
            this.addField_SFRotation(ctx, 'xSectionOrientation', 0.0, 0.0 ,1.0 ,0.0);
            
            /**
             * The xSectionPosition field defines the position of the cutting plane along an axis passing through (0,0,0) and perpendicular to the plane. Given the bounding cube for the data is a unit cube centred at (0,0,0), the field provides a plane that intersects the bounding box.
             * Data on positive side of the plane is rendered.
             * @var {x3dom.fields.SFFloat} xSectionPosition
             * @memberof x3dom.nodeTypes.RadarVolumeStyle
             * @initvalue 0.5
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'xSectionPosition', 0.0); // 0.0 ~ 1.0
            
            /* -- Private Functions and Variables -- */
            
            this.uniformFloatCubeSize = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatIsoSurfaceCutoffValue = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformVec2fIntensityLimits = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatTransparency = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatAccumFactor = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatBrightness = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformSampler2DDepthTexture = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformSampler2DTransferFunction = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformVec4fXSection = new x3dom.nodeTypes.Uniform(ctx);
            
            // local variables
            this.xSection = new x3dom.fields.SFVec4f(0.0, 0.0, 0.0, 0.0);
            this.vec_before_rot = new x3dom.fields.Quaternion(0.0, 0.0, 1.0, 1.0);
            
            // keep reference to VolumeData parent node
            this.volumeDataParent = null;
            
            this.checkSanity = function() {
                return true;
            };
        },
        {
            fieldChanged: function(fieldName){
                switch(fieldName){
                    case 'isoSurfaceCutoffValue':
                        this.uniformFloatIsoSurfaceCutoffValue._vf.value = this._vf.isoSurfaceCutoffValue;
                        this.uniformFloatIsoSurfaceCutoffValue.fieldChanged("value");
                        break;
                    case 'transparency':
                        this.uniformFloatTransparency._vf.value = this._vf.transparency;
                        this.uniformFloatTransparency.fieldChanged("value");
                        break;
                    case 'accumFactor':
                        this.uniformFloatAccumFactor._vf.value = this._vf.accumFactor;
                        this.uniformFloatAccumFactor.fieldChanged("value");
                        break;
                    case 'brightness':
                        this.uniformFloatBrightness._vf.value = this._vf.brightness;
                        this.uniformFloatBrightness.fieldChanged("value");
                        break;
                    case 'intensityLimits':
                        this.uniformVec2fIntensityLimits._vf.value = this._vf.intensityLimits;
                        this.uniformVec2fIntensityLimits.fieldChanged("value");
                        break;
                    case 'xSectionPosition':
                    case 'xSectionOrientation':
                    {
                        var tz = this._vf.xSectionPosition - 0.5;
                        var rot_quat = this._vf.xSectionOrientation;
                        var rot_quat_inverse = this._vf.xSectionOrientation.inverse();
                        var vec_after_rot = rot_quat.multiply(this.vec_before_rot).multiply(rot_quat_inverse);
                        vec_after_rot.normalize(vec_after_rot);
                        this.xSection.x = vec_after_rot.x;
                        this.xSection.y = vec_after_rot.y;
                        this.xSection.z = vec_after_rot.z;
                        this.xSection.w = (vec_after_rot.x * tz + 0.5) * vec_after_rot.x  + (vec_after_rot.y * tz + 0.5) * vec_after_rot.y + (vec_after_rot.z * tz + 0.5) * vec_after_rot.z;
                        this.uniformVec4fXSection._vf.value = this.xSection;
                        this.uniformVec4fXSection.fieldChanged("value");
                        break;
                    }
                    case 'render_mode':
                        break;
                    default:
                }
            },

            uniforms: function(){
                var unis = [];
                                
                if (this._cf.transferFunction.node || this._cf.depthTexture.node) {
                    // Lookup for the parent VolumeData                 
                    if(this.volumeDataParent === null) {
                        this.volumeDataParent = this._parentNodes[0];
                        while(!x3dom.isa(this.volumeDataParent, x3dom.nodeTypes.X3DVolumeDataNode) || !x3dom.isa(this.volumeDataParent, x3dom.nodeTypes.X3DNode)) {
                            this.volumeDataParent = this.volumeDataParent._parentNodes[0];
                        }
                        if(x3dom.isa(this.volumeDataParent, x3dom.nodeTypes.X3DVolumeDataNode) == false){
                            x3dom.debug.logError("[VolumeRendering][RadarVolumeStyle] No VolumeData parent found!");
                            this.volumeDataParent = null;
                        }
                    }
                    
                    if(this._cf.transferFunction.node) {
                        this.uniformSampler2DTransferFunction._vf.name = 'uTransferFunction';
                        this.uniformSampler2DTransferFunction._vf.type = 'SFInt32';
                        this.uniformSampler2DTransferFunction._vf.value = this.volumeDataParent._textureID++;
                        unis.push(this.uniformSampler2DTransferFunction);
                    }
                    if(this._cf.depthTexture.node) {
                        this.uniformSampler2DDepthTexture._vf.name = 'uDepthTexture';
                        this.uniformSampler2DDepthTexture._vf.type = 'SFInt32';
                        this.uniformSampler2DDepthTexture._vf.value = this.volumeDataParent._textureID++;
                        unis.push(this.uniformSampler2DDepthTexture);
                    }
                }
                
                this.uniformFloatCubeSize._vf.name = 'uCubeSize';
                this.uniformFloatCubeSize._vf.type = 'SFFloat';
                this.uniformFloatCubeSize._vf.value = this._parentNodes[0]._vf.dimensions.x; // The code here assumes a cubic bounding box for the volume data.
                unis.push(this.uniformFloatCubeSize);
                
                this.uniformFloatIsoSurfaceCutoffValue._vf.name = 'uIsoSurfaceCutoffValue';
                this.uniformFloatIsoSurfaceCutoffValue._vf.type = 'SFFloat';
                this.uniformFloatIsoSurfaceCutoffValue._vf.value = this._vf.isoSurfaceCutoffValue;
                unis.push(this.uniformFloatIsoSurfaceCutoffValue);
                
                this.uniformFloatTransparency._vf.name = 'uTransparency';
                this.uniformFloatTransparency._vf.type = 'SFFloat';
                this.uniformFloatTransparency._vf.value = this._vf.transparency;
                unis.push(this.uniformFloatTransparency);
                
                this.uniformFloatAccumFactor._vf.name = 'uAccumFactor';
                this.uniformFloatAccumFactor._vf.type = 'SFFloat';
                this.uniformFloatAccumFactor._vf.value = this._vf.accumFactor;
                unis.push(this.uniformFloatAccumFactor);
                
                this.uniformFloatBrightness._vf.name = 'uBrightness';
                this.uniformFloatBrightness._vf.type = 'SFFloat';
                this.uniformFloatBrightness._vf.value = this._vf.brightness;
                unis.push(this.uniformFloatBrightness);
                
                this.uniformVec2fIntensityLimits._vf.name = 'uIntensityLimits';
                this.uniformVec2fIntensityLimits._vf.type = 'SFVec2f';
                this.uniformVec2fIntensityLimits._vf.value = this._vf.intensityLimits;
                unis.push(this.uniformVec2fIntensityLimits);
                
                this.uniformVec4fXSection._vf.name = 'uXSection';
                this.uniformVec4fXSection._vf.type = 'SFVec4f';
                this.uniformVec4fXSection._vf.value = this.xSection;
                unis.push(this.uniformVec4fXSection);
                
                return unis;
            },
            
            textures: function() {
                var texs = [];
                
                var tex = this._cf.transferFunction.node;
                if (tex) {
                    tex._vf.repeatS = false;
                    tex._vf.repeatT = false;
                    texs.push(tex);
                }
                
                tex = this._cf.depthTexture.node;
                if(tex) {
                    tex._vf.repeatS = false;
                    tex._vf.repeatT = false;
                    texs.push(tex);
                }
                
                return texs;
            },
            
            styleUniformsShaderText: function() {
                var uniformsText = "uniform mat4 projectionMatrix;\n";
                uniformsText += "uniform float uCubeSize;\n";
                uniformsText += "uniform float uIsoSurfaceCutoffValue;\n";
                uniformsText += "uniform float uTransparency;\n";
                uniformsText += "uniform float uAccumFactor;\n";
                uniformsText += "uniform float uBrightness;\n";
                uniformsText += "uniform vec4 uXSection;\n";
                uniformsText += "uniform vec2 uIntensityLimits;\n";
                if (this._cf.transferFunction.node) {
                        uniformsText += "uniform sampler2D uTransferFunction;\n";
                }
                if (this._cf.depthTexture.node) {
                        uniformsText += "uniform sampler2D uDepthTexture;\n";
                }
                
                return uniformsText;
            },

            fragmentShaderText: function(numberOfSlices, slicesOverX, slicesOverY){
                var shader = 
                this._parentNodes[0].fragmentPreamble+
                this._parentNodes[0].defaultUniformsShaderText(numberOfSlices, slicesOverX, slicesOverY, true)+
                this.styleUniformsShaderText()+
                this._parentNodes[0].texture3DFunctionShaderText;
                
                var shaderLoop = "";
                
                shaderLoop +=
                    "void main()\n"+
                    "{\n"+
                    "  vec3 cam_pos = vec3(modelViewMatrixInverse[3][0], modelViewMatrixInverse[3][1], modelViewMatrixInverse[3][2]);\n"+
                    "  cam_pos = cam_pos/dimensions+0.5;\n"+
                    
                    "  vec2 texC = vertexPosition.xy/vertexPosition.w;\n"+
                    "  texC = 0.5*texC + 0.5;\n";
                
                if (this._cf.depthTexture.node) {
                    shaderLoop +=
                        "  float depth_limit = texture2D(uDepthTexture,texC).r;\n"+
                        "  float depth_ray = 0.0;\n"+
                        "  vec3 ray_start_ec = position_eye.xyz;\n"+ // ray start in eye coordinates
                        "  vec3 ray_dir_ec = uCubeSize * normalize(ray_start_ec);\n"+ // since camera is at (0,0,0) in eye_coords
                        "  vec3 step_ec = 1.7321*ray_dir_ec/Steps;\n"; // multiplying by sqrt(3.0)
                }
                shaderLoop +=
                    
                    "  vec3 ray_start = pos.xyz;\n"+
                    "  vec3 ray_dir = normalize(pos.xyz-cam_pos);\n"+
                    
                    "  vec4 accum  = vec4(0.0, 0.0, 0.0, 0.0);\n"+
                    "  vec4 sample = vec4(0.0, 0.0, 0.0, 0.0);\n"+
                    "  vec4 value  = vec4(0.0, 0.0, 0.0, 0.0);\n"+
                    
                    "  vec3 step = 1.7321*ray_dir/Steps;\n"; // multiplying by sqrt(3.0)
                    
                // classical shader
                shaderLoop +=
                    "  for(float i = 0.0; i < Steps; i+=1.0)\n"+
                    "  {\n";
                    
                if (this._cf.depthTexture.node) {
                    shaderLoop +=
                        "    value = projectionMatrix * vec4(ray_start_ec, 1.0);\n"+
                        "    depth_ray = ((value.z/value.w) + 1.0)/2.0;\n";
                }
                
                shaderLoop += "    ray_start += step;\n";
                
                if (this._cf.depthTexture.node) {
                    shaderLoop +=
                        "    ray_start_ec += step_ec;\n"+
                        "    if(depth_ray > depth_limit || ray_start.x > 1.0 || ray_start.y > 1.0 || ray_start.z > 1.0 || ray_start.x < 0.0 || ray_start.y < 0.0 || ray_start.z < 0.0)\n"+
                        "      {break;}\n";
                }
                else {
                    shaderLoop +=
                        "    if(ray_start.x > 1.0 || ray_start.y > 1.0 || ray_start.z > 1.0 || ray_start.x < 0.0 || ray_start.y < 0.0 || ray_start.z < 0.0)\n"+
                        "      {break;}\n";
                }
                
                shaderLoop +=
                    "    if(ray_start.x*uXSection[0] + ray_start.y*uXSection[1] + ray_start.z*uXSection[2] > uXSection[3]) {continue;}\n"+
                    
                    "    sample = cTexture3D(uVolData, ray_start, numberOfSlices, slicesOverX, slicesOverY);\n"+
                    "    sample = vec4(sample.rgb,(0.299*sample.r)+(0.587*sample.g)+(0.114*sample.b));\n"+
                    "    // Calculate maximum intensity\n"+
                    "    if(sample.a > uIsoSurfaceCutoffValue) {\n";
                if (this._cf.transferFunction.node) {
                    shaderLoop +=
                        "       value = texture2D(uTransferFunction, vec2((sample.a-uIntensityLimits[0])/(uIntensityLimits[1]-uIntensityLimits[0]),0.5));\n"+
                        "       accum.rgb = sample.rgb * value.rgb * (1.0-accum.a)*uAccumFactor + accum.rgb;\n"+
                        "       accum.a = uAccumFactor * value.a * (1.0-accum.a) + accum.a;\n";
                }
                else {
                    shaderLoop +=
                        "       accum.rgb = sample.rgb * (1.0-accum.a) * uAccumFactor + accum.rgb;\n"+
                        "       accum.a = uAccumFactor * (1.0-accum.a) + accum.a;\n";
                }
                shaderLoop +=
                    "    }\n"+
                    "  }\n";
                                
                shader += shaderLoop;
                
                shader += "  gl_FragColor = vec4(accum.rgb*uBrightness, accum.a*uTransparency);\n"+
                          "}";
                
                return shader;
            }
        }
    )
);