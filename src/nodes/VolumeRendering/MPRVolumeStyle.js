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
             * The originLine field specifies the base line of the slice plane.
             * @var {x3dom.fields.SFVec3f} originLine
             * @memberof x3dom.nodeTypes.MPRVolumeStyle
             * @initvalue 1.0,1.0,0.0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'originLine', 1.0, 1.0, 0.0);

            /**
             * The finalLine field specifies the second line to calculate the normal plane.
             * @var {x3dom.fields.SFVec3f} finalLine
             * @memberof x3dom.nodeTypes.MPRVolumeStyle
             * @initvalue 0.0,1.0,0.0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'finalLine', 0.0, 1.0, 0.0);

            /**
             * The positionLine field specifies the position along the line where the slice plane is rendered.
             * @var {x3dom.fields.SFFloat} positionLine
             * @memberof x3dom.nodeTypes.MPRVolumeStyle
             * @initvalue 0.2
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'positionLine', 0.2);

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

            this.uniformVec3fOriginLine = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformVec3fFinalLine = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatPosition = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformSampler2DTransferFunction = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformBoolForceOpaque = new x3dom.nodeTypes.Uniform(ctx);

        },
        {
            fieldChanged: function(fieldName) {
                 switch(fieldName){
                    case 'positionLine':
                        this.uniformFloatPosition._vf.value = this._vf.positionLine;
                        this.uniformFloatPosition.fieldChanged("value");
                        break;
                    case 'originLine':
                        this.uniformVec3fOriginLine._vf.value = this._vf.originLine;
                        this.uniformVec3fOriginLine.fieldChanged("value");
                        break;
                    case 'finalLine':
                        this.uniformVec3fFinalLine._vf.value = this._vf.finalLine;
                        this.uniformVec3fFinalLine.fieldChanged("value");
                        break;
                    case 'forceOpaque':
                        this.uniformBoolForceOpaque._vf.value = this._vf.forceOpaque;
                        this.uniformBoolForceOpaque.fieldChanged("value");
                        break;
                }
            },

            uniforms: function() {
                var unis = [];

                this.uniformVec3fOriginLine._vf.name = 'originLine';
                this.uniformVec3fOriginLine._vf.type = 'SFVec3f';
                this.uniformVec3fOriginLine._vf.value = this._vf.originLine;
                unis.push(this.uniformVec3fOriginLine);

                this.uniformVec3fFinalLine._vf.name = 'finalLine';
                this.uniformVec3fFinalLine._vf.type = 'SFVec3f';
                this.uniformVec3fFinalLine._vf.value = this._vf.finalLine;
                unis.push(this.uniformVec3fFinalLine);

                this.uniformFloatPosition._vf.name = 'positionLine';
                this.uniformFloatPosition._vf.type = 'SFFloat';
                this.uniformFloatPosition._vf.value = this._vf.positionLine;
                unis.push(this.uniformFloatPosition);

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
                var uniformShaderText = "uniform vec3 originLine;\nuniform vec3 finalLine;\nuniform float positionLine;\nuniform bool forceOpaque;\n";
                if (this._cf.transferFunction.node) {
                    uniformShaderText += "uniform sampler2D uTransferFunction;\n";
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
                "  vec3 normalPlane = finalLine-originLine;\n"+
                "  vec3 pointLine = normalPlane*positionLine+originLine;\n"+
                "  float d = dot(pointLine-pos.xyz,normalPlane)/dot(dir,normalPlane);\n"+
                "  vec4 color = vec4(0.0,0.0,0.0,0.0);\n"+
                "  vec3 pos = d*dir+pos.rgb;\n"+
                "  if (!(pos.x > 1.0 || pos.y > 1.0 || pos.z > 1.0 || pos.x<0.0 || pos.y<0.0 || pos.z<0.0)){\n"+
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
