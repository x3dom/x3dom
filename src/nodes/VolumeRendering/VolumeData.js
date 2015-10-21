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
         * @classdesc The VolumeData node specifies a non-segmented volume data to be rendered with a volume rendering style.
         */
        function (ctx) {
            x3dom.nodeTypes.VolumeData.superClass.call(this, ctx);


            /**
             * Specifies the render style to be applied on the volume data.
             * @var {x3dom.fields.SFNode} renderStyle
             * @memberof x3dom.nodeTypes.VolumeData
             * @initvalue x3dom.nodeTypes.X3DVolumeRenderStyleNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('renderStyle', x3dom.nodeTypes.X3DVolumeRenderStyleNode);

            this.vrcMultiTexture = new x3dom.nodeTypes.MultiTexture(ctx);
            this.vrcVolumeTexture = null;

            this.vrcSinglePassShader = new x3dom.nodeTypes.ComposedShader(ctx);
            this.vrcSinglePassShaderVertex = new x3dom.nodeTypes.ShaderPart(ctx);
            this.vrcSinglePassShaderFragment = new x3dom.nodeTypes.ShaderPart(ctx);
            this.vrcSinglePassShaderFieldBackCoord = new x3dom.nodeTypes.Field(ctx);
            this.vrcSinglePassShaderFieldVolData = new x3dom.nodeTypes.Field(ctx);
            this.vrcSinglePassShaderFieldOffset = new x3dom.nodeTypes.Field(ctx);
            this.vrcSinglePassShaderFieldDimensions = new x3dom.nodeTypes.Field(ctx);
        
        },
        {
            initializeValues: function() {
                var initialValues ="";
                if(this._cf.renderStyle.node.initializeValues != undefined){
                    initialValues += this._cf.renderStyle.node.initializeValues();
                }
                return initialValues;
            },

            styleUniformsShaderText: function(){
                var styleUniformsText = this._cf.renderStyle.node.styleUniformsShaderText();
                this.surfaceNormalsNeeded = true;
                if(this._cf.renderStyle.node._cf.surfaceNormals && this._cf.renderStyle.node._cf.surfaceNormals.node != null){
                    styleUniformsText += "uniform sampler2D uSurfaceNormals;\n"; //Neccessary when gradient is provided
                    this.normalTextureProvided = true;
                    this.surfaceNormals = this._cf.renderStyle.node._cf.surfaceNormals.node;
                }else if(x3dom.isa(this._cf.renderStyle.node, x3dom.nodeTypes.OpacityMapVolumeStyle)){ //OpacityMap does not use surface normals
                    this.surfaceNormalsNeeded = false;
                    this.normalTextureProvided = false;
                }
                return styleUniformsText;
            },

            styleShaderText: function(){
                var styleText = "";
                if(this._cf.renderStyle.node.styleShaderText != undefined){
                    styleText += this._cf.renderStyle.node.styleShaderText();
                }
                return styleText;
            },

            inlineStyleShaderText: function(){
                return this._cf.renderStyle.node.inlineStyleShaderText();
            },

            lightAssigment: function(){
                return this._cf.renderStyle.node.lightAssigment();
            },

            //Obtain the light equation from the render style child node
            lightEquationShaderText: function(){
                return this._cf.renderStyle.node.lightEquationShaderText();
            },

            // nodeChanged is called after subtree is parsed and attached in DOM
            nodeChanged: function()
            {
                // uhhhh, manually build backend-graph scene-subtree,
                // therefore, try to mimic depth-first parsing scheme
                if (!this._cf.appearance.node) 
                {
                    var i;

                    this.addChild(new x3dom.nodeTypes.Appearance());

                    // create shortcut to volume data set
                    this.vrcVolumeTexture = this._cf.voxels.node;
                    this.vrcVolumeTexture._vf.repeatS = false;
                    this.vrcVolumeTexture._vf.repeatT = false;

                    this.vrcMultiTexture._nameSpace = this._nameSpace;
                    
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

                    //Update child node private properties
                    this._cf.renderStyle.node.updateProperties(this);

                    // here goes the volume shader
                    this.vrcSinglePassShaderVertex._vf.type = 'vertex';
                    this.vrcSinglePassShaderVertex._vf.url[0]=this.vertexShaderText(x3dom.isa(this._cf.renderStyle.node, x3dom.nodeTypes.RadarVolumeStyle));

                    this.vrcSinglePassShaderFragment._vf.type = 'fragment';
                    var shaderText = "";
                    if (x3dom.isa(this._cf.renderStyle.node, x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode)) {
                        shaderText += this.fragmentPreamble+
                        this.defaultUniformsShaderText(this.vrcVolumeTexture._vf.numberOfSlices, this.vrcVolumeTexture._vf.slicesOverX, this.vrcVolumeTexture._vf.slicesOverY)+
                        this.styleUniformsShaderText()+
                        this.styleShaderText()+
                        this.texture3DFunctionShaderText+
                        this.normalFunctionShaderText()+
                        this.lightEquationShaderText()+
                        this.defaultLoopFragmentShaderText(this.inlineStyleShaderText(), this.lightAssigment(), this.initializeValues());
                    }else{
                        shaderText += this._cf.renderStyle.node.fragmentShaderText(
                            this.vrcVolumeTexture._vf.numberOfSlices,
                            this.vrcVolumeTexture._vf.slicesOverX, 
                            this.vrcVolumeTexture._vf.slicesOverY);
                    }
                    this.vrcSinglePassShaderFragment._vf.url[0]= shaderText;

                    this.vrcSinglePassShader.addChild(this.vrcSinglePassShaderVertex, 'parts');
                    this.vrcSinglePassShaderVertex.nodeChanged();
                    
                    this.vrcSinglePassShader.addChild(this.vrcSinglePassShaderFragment, 'parts');
                    this.vrcSinglePassShaderFragment.nodeChanged();

                    this.vrcSinglePassShaderFieldVolData._vf.name = 'uVolData';
                    this.vrcSinglePassShaderFieldVolData._vf.type = 'SFInt32';
                    this.vrcSinglePassShaderFieldVolData._vf.value = this._textureID++;

                    this.vrcSinglePassShaderFieldDimensions._vf.name = 'dimensions';
                    this.vrcSinglePassShaderFieldDimensions._vf.type = 'SFVec3f';
                    this.vrcSinglePassShaderFieldDimensions._vf.value = this._vf.dimensions;

                    this.vrcSinglePassShaderFieldOffset._vf.name = 'offset';
                    this.vrcSinglePassShaderFieldOffset._vf.type = 'SFVec3f';
                    this.vrcSinglePassShaderFieldOffset._vf.value = "0.01 0.01 0.01"; //Default initial value
                    
                    this.vrcSinglePassShader.addChild(this.vrcSinglePassShaderFieldVolData, 'fields');
                    this.vrcSinglePassShaderFieldVolData.nodeChanged();

                    this.vrcSinglePassShader.addChild(this.vrcSinglePassShaderFieldDimensions, 'fields');
                    this.vrcSinglePassShaderFieldDimensions.nodeChanged();

                    this.vrcSinglePassShader.addChild(this.vrcSinglePassShaderFieldOffset, 'fields');
 
                    //Take volume texture size for the ComposableRenderStyles offset parameter
                    this.offsetInterval = window.setInterval((function(aTex, obj) {
                        return function() {
                            x3dom.debug.logInfo('[VolumeRendering][VolumeData] Looking for Volume Texture size...');
                            var s = obj.getTextureSize(aTex);
                            if(s.valid){
                                clearInterval(obj.offsetInterval);
                                obj.vrcSinglePassShaderFieldOffset._vf.value = new x3dom.fields.SFVec3f(1.0/(s.w/aTex._vf.slicesOverX), 1.0/(s.h/aTex._vf.slicesOverY), 1.0/aTex._vf.numberOfSlices);
                                obj.vrcSinglePassShader.nodeChanged();
                                x3dom.debug.logInfo('[VolumeRendering][VolumeData] Volume Texture size obtained');
                            }
                        }
                    })(this.vrcVolumeTexture, this), 1000);
                    
                    var ShaderUniforms = this._cf.renderStyle.node.uniforms();
                    for (i = 0; i<ShaderUniforms.length; i++)
                    {
                        this.vrcSinglePassShader.addChild(ShaderUniforms[i], 'fields');
                    }
                
                    this._cf.appearance.node.addChild(this.vrcSinglePassShader);
                    this.vrcSinglePassShader.nodeChanged();
                    
                    this._cf.appearance.node.nodeChanged();
                }

                if (!this._cf.geometry.node) {
                    this.addChild(new x3dom.nodeTypes.Box());

                    this._cf.geometry.node._vf.solid = false;
                    this._cf.geometry.node._vf.hasHelperColors = false;
                    this._cf.geometry.node._vf.size = new x3dom.fields.SFVec3f(
                        this._vf.dimensions.x, this._vf.dimensions.y, this._vf.dimensions.z);

                    // workaround to trigger field change...
                    this._cf.geometry.node.fieldChanged("size");
                }
            }
        }
    )
);