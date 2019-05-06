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

/* ### MPRVolumeStyle ### */
x3dom.registerNodeType(
    "MPRVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeRenderStyleNode,

        /**
         * Constructor for MPRVolumeStyle
         * @constructs x3dom.nodeTypes.MPRVolumeStyle
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DVolumeRenderStyleNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The MPRVolumeStyle node renders a multiplanar reconstruction of the assocciated volume data.
         */
        function (ctx) {
            x3dom.nodeTypes.MPRVolumeStyle.superClass.call(this, ctx);

            /**
             * The transferFunction field is a texture that is going to be used to map each voxel value to a specific color output.
             * @var {x3dom.fields.SFNode} transferFunction
             * @memberof x3dom.nodeTypes.MPRVolumeStyle
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('transferFunction', x3dom.nodeTypes.Texture);

            /**
             * The forceOpaque field is a boolean flag that forces the reconstructed planes to be opaque, if false the opacity (alpha channel) from the transferFunction field will be applied.
             * @var {x3dom.fields.SFBool} forceOpaque
             * @memberof x3dom.nodeTypes.MPRVolumeStyle
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'forceOpaque', true);

            /**
             * The renderStyle field contains a list of composable render styles nodes to be used on the associated volume data.
             * @var {x3dom.fields.MFNode} planes
             * @memberof x3dom.nodeTypes.MPRVolumeStyle
             * @initvalue x3dom.nodeTypes.MPRPlane
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('planes', x3dom.nodeTypes.MPRPlane);

            this.uniformSampler2DTransferFunction = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformBoolForceOpaque = new x3dom.nodeTypes.Uniform(ctx);
        },
        {
            fieldChanged: function(fieldName) {
                 switch(fieldName){
                    case 'forceOpaque':
                        this.uniformBoolForceOpaque._vf.value = this._vf.forceOpaque;
                        this.uniformBoolForceOpaque.fieldChanged("value");
                        break;
                }
            },

            uniforms: function() {
                var unis = [];

                if (this._cf.transferFunction.node) {
                    this.uniformSampler2DTransferFunction._vf.name = 'uTransferFunction';
                    this.uniformSampler2DTransferFunction._vf.type = 'SFInt32';
                    this.uniformSampler2DTransferFunction._vf.value = this._volumeDataParent._textureID++;
                    unis.push(this.uniformSampler2DTransferFunction);
                }

                this.uniformBoolForceOpaque._vf.name = 'forceOpaque';
                this.uniformBoolForceOpaque._vf.type = 'SFBool';
                this.uniformBoolForceOpaque._vf.value = this._vf.forceOpaque;
                unis.push(this.uniformBoolForceOpaque);

                var i, n = this._cf.planes.nodes.length;
                for (i=0; i<n; i++){
                    //Not repeat common uniforms, TODO: Allow multiple surface normals
                    var that = this;
                    Array.forEach(this._cf.planes.nodes[i].uniforms(), function(uniform){
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
                return texs;
            },

            styleUniformsShaderText: function(){
                var uniformShaderText = "uniform bool forceOpaque;\n";
                if (this._cf.transferFunction.node) {
                    uniformShaderText += "uniform sampler2D uTransferFunction;\n";
                }
                for (let i=0; i<this._cf.planes.nodes.length; i++){
                  uniformShaderText += this._cf.planes.nodes[i].styleUniformsShaderText();
                }
                return uniformShaderText;
            },

            fragmentShaderText : function (numberOfSlices, slicesOverX, slicesOverY) {
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
                "  float cam_inside = float(all(bvec2(all(lessThan(cam_pos, vec3(1.0))),all(greaterThan(cam_pos, vec3(0.0))))));\n"+
                "  vec3 ray_pos = mix(pos.xyz, cam_pos, cam_inside);\n"+
                "  float d = 1000.0;";
                for (let i=0; i<this._cf.planes.nodes.length; i++){
                  shader += this._cf.planes.nodes[i].styleShaderText();
                }
                shader += "  vec4 color = vec4(0.0,0.0,0.0,0.0);\n"+
                "  vec3 pos = d*dir+ray_pos;\n"+
                "  if (!(any(bvec2(any(lessThan(pos.xyz, vec3(0.0))),any(greaterThan(pos.xyz, vec3(1.0))))))){\n"+
                "    pos = clamp(pos, vec3(0.0), vec3(1.0));\n"+
                "    vec4 intesity = cTexture3D(uVolData,pos.rgb,numberOfSlices,slicesOverX,slicesOverY);\n";
                if (this._cf.transferFunction.node){
                    shader += "    if (forceOpaque){\n"+
                    "      color = vec4(texture2D(uTransferFunction, vec2(intesity.r,0.5)).rgb, 1.0);\n"+
                    "    }else{\n"+
                    "      color = texture2D(uTransferFunction, vec2(intesity.r,0.5)).rgba;\n"+
                    "    }\n";
                }else{
                    shader += "    if (forceOpaque){\n"+
                    "      color = vec4(intesity.rgb,1.0);\n"+
                    "    }else{\n"+
                    "      color = intesity;\n"+
                    "    }\n";
                }
                shader += "  }\n"+
                "  gl_FragColor = color;\n"+
                "}";
                return shader;
            }
         }
    )
);
