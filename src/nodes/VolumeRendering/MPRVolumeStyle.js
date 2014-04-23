/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### MPRVolumeStyle ### */
x3dom.registerNodeType(
    "MPRVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        
        /**
         * Constructor for MPRVolumeStyle
         * @constructs x3dom.nodeTypes.MPRVolumeStyle
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.MPRVolumeStyle.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.SFVec3f} originLine
             * @memberof x3dom.nodeTypes.MPRVolumeStyle
             * @initvalue 1.0,1.0,0.0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'originLine', 1.0, 1.0, 0.0);

            /**
             *
             * @var {x3dom.fields.SFVec3f} finalLine
             * @memberof x3dom.nodeTypes.MPRVolumeStyle
             * @initvalue 0.0,1.0,0.0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'finalLine', 0.0, 1.0, 0.0);

            /**
             *
             * @var {x3dom.fields.SFFloat} positionLine
             * @memberof x3dom.nodeTypes.MPRVolumeStyle
             * @initvalue 0.2
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'positionLine', 0.2);

            this.uniformVec3fOriginLine = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformVec3fFinalLine = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatPosition = new x3dom.nodeTypes.Uniform(ctx);
        
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