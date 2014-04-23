/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### VolumeData ### */
x3dom.registerNodeType(
    "VolumeData",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeDataNode,
        
        /**
         * Constructor for VolumeData
         * @constructs x3dom.nodeTypes.VolumeData
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DVolumeDataNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.VolumeData.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.SFNode} renderStyle
             * @memberof x3dom.nodeTypes.VolumeData
             * @initvalue x3dom.nodeTypes.X3DVolumeRenderStyleNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('renderStyle', x3dom.nodeTypes.X3DVolumeRenderStyleNode);

            this.vrcMultiTexture = new x3dom.nodeTypes.MultiTexture(ctx);
            this.vrcRenderTexture = new x3dom.nodeTypes.RenderedTexture(ctx);
            this.vrcVolumeTexture = null;

            this.vrcBackCubeShape = new x3dom.nodeTypes.Shape(ctx);
            this.vrcBackCubeAppearance = new x3dom.nodeTypes.Appearance();
            this.vrcBackCubeGeometry = new x3dom.nodeTypes.Box(ctx);
            this.vrcBackCubeShader = new x3dom.nodeTypes.ComposedShader(ctx);
            this.vrcBackCubeShaderVertex = new x3dom.nodeTypes.ShaderPart(ctx);
            this.vrcBackCubeShaderFragment = new x3dom.nodeTypes.ShaderPart(ctx);

            this.vrcFrontCubeShader = new x3dom.nodeTypes.ComposedShader(ctx);
            this.vrcFrontCubeShaderVertex = new x3dom.nodeTypes.ShaderPart(ctx);
            this.vrcFrontCubeShaderFragment = new x3dom.nodeTypes.ShaderPart(ctx);
            this.vrcFrontCubeShaderFieldBackCoord = new x3dom.nodeTypes.Field(ctx);
            this.vrcFrontCubeShaderFieldVolData = new x3dom.nodeTypes.Field(ctx);
            this.vrcFrontCubeShaderFieldOffset = new x3dom.nodeTypes.Field(ctx);
        
        },
        {
            // nodeChanged is called after subtree is parsed and attached in DOM
            nodeChanged: function()
            {
                // uhhhh, manually build backend-graph scene-subtree,
                // therefore, try to mimic depth-first parsing scheme
                if (!this._cf.appearance.node)
                {
                    var that = this;
                    var i;

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
                        "#ifdef GL_FRAGMENT_PRECISION_HIGH\n" +
                        "  precision highp float;\n" +
                        "#else\n" +
                        "  precision mediump float;\n" +
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
                    this._textureID++;

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
                    this._textureID++;
                    this.vrcMultiTexture._nameSpace = this._nameSpace;

                    this.vrcMultiTexture.addChild(this.vrcRenderTexture, 'texture');
                    this.vrcRenderTexture.nodeChanged();

                    this.vrcMultiTexture.addChild(this.vrcVolumeTexture, 'texture');
                    this.vrcVolumeTexture.nodeChanged();

                    // textures from styles
                    if (this._cf.renderStyle.node.textures) {
                        var styleTextures = this._cf.renderStyle.node.textures();
                        for (i = 0; i<styleTextures.length; i++)
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
                    this.vrcFrontCubeShaderFragment._vf.url[0]=this._cf.renderStyle.node.fragmentShaderText(
                        this.vrcVolumeTexture._vf.numberOfSlices,
                        this.vrcVolumeTexture._vf.slicesOverX,
                        this.vrcVolumeTexture._vf.slicesOverY);

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

                    this.vrcFrontCubeShaderFieldOffset._vf.name = 'offset';
                    this.vrcFrontCubeShaderFieldOffset._vf.type = 'SFVec3f';
                    this.vrcFrontCubeShaderFieldOffset._vf.value = "0.01 0.01 0.01"; //Default initial value

                    this.vrcFrontCubeShader.addChild(this.vrcFrontCubeShaderFieldBackCoord, 'fields');
                    this.vrcFrontCubeShaderFieldBackCoord.nodeChanged();

                    this.vrcFrontCubeShader.addChild(this.vrcFrontCubeShaderFieldVolData, 'fields');
                    this.vrcFrontCubeShaderFieldVolData.nodeChanged();

                    this.vrcFrontCubeShader.addChild(this.vrcFrontCubeShaderFieldOffset, 'fields');

                    //Take volume texture size for the ComposableRenderStyles offset parameter
                    this.offsetInterval = window.setInterval((function(aTex) {
                        return function() {
                            x3dom.debug.logInfo('[VolumeRendering][VolumeData] Looking for Volume Texture size...');
                            var s = that.getTextureSize(aTex);
                            if(s.valid){
                                clearInterval(that.offsetInterval);
                                that.vrcFrontCubeShaderFieldOffset._vf.value = new x3dom.fields.SFVec3f(1.0/s.w, 1.0/s.h, 1.0/aTex._vf.numberOfSlices);
                                that.vrcFrontCubeShader.nodeChanged();
                                x3dom.debug.logInfo('[VolumeRendering][VolumeData] Volume Texture size obtained');
                            }
                        }
                    })(this.vrcVolumeTexture), 1000);

                    var ShaderUniforms = this._cf.renderStyle.node.uniforms();
                    for (i = 0; i<ShaderUniforms.length; i++)
                    {
                        this.vrcFrontCubeShader.addChild(ShaderUniforms[i], 'fields');
                    }

                    this._cf.appearance.node.addChild(this.vrcFrontCubeShader);
                    this.vrcFrontCubeShader.nodeChanged();

                    this._cf.appearance.node.nodeChanged();
                }

                if (!this._cf.geometry.node) {
                    this.addChild(new x3dom.nodeTypes.Box());

                    this._cf.geometry.node._vf.hasHelperColors = true;
                    this._cf.geometry.node._vf.size = new x3dom.fields.SFVec3f(
                        this._vf.dimensions.x, this._vf.dimensions.y, this._vf.dimensions.z);

                    // workaround to trigger field change...
                    this._cf.geometry.node.fieldChanged("hasHelperColors");
                    this._cf.geometry.node.fieldChanged("size");
                }
            }
        }
    )
);