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

/* ### SegmentedVolumeData ### */
x3dom.registerNodeType(
    "SegmentedVolumeData",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeDataNode,
        
        /**
         * Constructor for SegmentedVolumeData
         * @constructs x3dom.nodeTypes.SegmentedVolumeData
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DVolumeDataNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The SegmentedVolumeData node specifies a segmented volume data set. Each segment can be rendered with a different volume rendering style.
         */
        function (ctx) {
            x3dom.nodeTypes.SegmentedVolumeData.superClass.call(this, ctx);


            /**
             * The renderStyle field contains a list of composable render styles nodes to be used on the segmented volume data.
             * @var {x3dom.fields.MFNode} renderStyle
             * @memberof x3dom.nodeTypes.SegmentedVolumeData
             * @initvalue x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('renderStyle', x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode);
            //this.addField_MFBool(ctx, 'segmentEnabled', []);  // MFBool NYI!!!
            //this.addField_SFNode('segmentIdentifiers', x3dom.nodeTypes.X3DVolumeDataNode);

            /**
             * The segmentIdentifiers field is an ImageTextureAtlas node of the same dimensions of the volume data. The segment identifiers are used to map each segment with a volume rendering style. 
             * @var {x3dom.fields.SFNode} segmentIdentifiers
             * @memberof x3dom.nodeTypes.SegmentedVolumeData
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('segmentIdentifiers', x3dom.nodeTypes.Texture);

            /**
             * Specifies the number of segments on the volume data. It is used to correctly match each segment identifier to an index of the renderStyle list.
             * @var {x3dom.fields.SFFloat} numberOfMaxSegments
             * @memberof x3dom.nodeTypes.SegmentedVolumeData
             * @initvalue 10.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'numberOfMaxSegments', 10.0);

            this.uniformSampler2DSegmentIdentifiers = new x3dom.nodeTypes.Uniform(ctx);
            this.normalTextureProvided = false;

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
            fieldChanged: function(fieldName){
                if (fieldName === "numberOfMaxSegments" || fieldname === "segmentIdentifiers") {
                    //TODO: Reload node   
                }
            },

            uniforms: function(){
                var unis = [];

                if (this._cf.segmentIdentifiers.node) {
                    this.uniformSampler2DSegmentIdentifiers._vf.name = 'uSegmentIdentifiers';
                    this.uniformSampler2DSegmentIdentifiers._vf.type = 'SFInt32';
                    this.uniformSampler2DSegmentIdentifiers._vf.value = this._textureID++;
                    unis.push(this.uniformSampler2DSegmentIdentifiers);
                }

                //Also add the render style uniforms
                if (this._cf.renderStyle.nodes) {
                    var i, n = this._cf.renderStyle.nodes.length;
                    for (i=0; i<n; i++){
                        //Not repeat common uniforms, TODO: Allow multiple surface normals
                        var that = this;
                        Array.forEach(this._cf.renderStyle.nodes[i].uniforms(), function(uniform){
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
                }
                return unis;
            },

            textures: function(){
                var texs = [];
                if(this._cf.segmentIdentifiers.node){
                    var tex = this._cf.segmentIdentifiers.node;
                    tex._vf.repeatS = false;
                    tex._vf.repeatT = false;
                    texs.push(tex);
                }

                //Also add the render style textures
                var i, n = this._cf.renderStyle.nodes.length;
                for (i=0; i<n; i++){
                    //Not repeat same textures, TODO: Allow multiply surface normals textures
                    Array.forEach(this._cf.renderStyle.nodes[i].textures(), function(texture){
                        var contains_texture = false;
                        Array.forEach(texs, function(accum){
                            if(accum._vf.url[0] == texture._vf.url[0]){
                                contains_texture = true;
                            }
                        });
                        if (contains_texture == false){
                            texs = texs.concat(texture);
                        }
                    });
                }
                return texs;
            },

            initializeValues: function() {
                var initialValues = "";
                var n = this._cf.renderStyle.nodes.length;
                for (var i=0; i<n; i++){
                    if(this._cf.renderStyle.nodes[i].initializeValues != undefined){
                        initialValues += this._cf.renderStyle.nodes[i].initializeValues() + "\n";
                    }
                }
                return initialValues;
            },

            styleUniformsShaderText: function(){
                var styleText = "const float maxSegments = " + this._vf.numberOfMaxSegments.toPrecision(3) + ";\n"+
                "uniform sampler2D uSegmentIdentifiers;\n"; //TODO: Segment enabled
                var n = this._cf.renderStyle.nodes.length;
                for (var i=0; i<n; i++){
                    styleText += this._cf.renderStyle.nodes[i].styleUniformsShaderText() + "\n";
                    if(this._cf.renderStyle.nodes[i]._cf.surfaceNormals && this._cf.renderStyle.nodes[i]._cf.surfaceNormals.node != null){
                        styleText += "uniform sampler2D uSurfaceNormals;\n"; //Neccessary when gradient is provided
                        this.normalTextureProvided = true;
                        this.surfaceNormals = this._cf.renderStyle.nodes[i]._cf.surfaceNormals.node;
                    }
                    if(!x3dom.isa(this._cf.renderStyle.nodes[i], x3dom.nodeTypes.OpacityMapVolumeStyle)){
                        this.surfaceNormalsNeeded = true;
                    }
                }
                return styleText;
            },

            styleShaderText: function(){
                var styleText = "";
                var n = this._cf.renderStyle.nodes.length;
                for (var i=0; i<n; i++){
                    if(this._cf.renderStyle.nodes[i].styleShaderText != undefined){
                        styleText += this._cf.renderStyle.nodes[i].styleShaderText()+"\n";
                    }
                }
                return styleText;
            },

            inlineStyleShaderText: function(){
                var inlineText = "";
                if(this._cf.segmentIdentifiers.node){
                    inlineText += "    float t_id = cTexture3D(uSegmentIdentifiers, ray_pos, numberOfSlices, slicesOverX, slicesOverY).r;\n"+
                    "    int s_id = int(clamp(floor(t_id*maxSegments-0.5),0.0,maxSegments));\n"+
                    "    opacityFactor = 10.0;\n";
                    if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                        inlineText += "    lightFactor = 1.0;\n";
                    }else{
                        inlineText += "    lightFactor = 1.2;\n";
                    }
                }else{
                    inlineText += "    int s_id = 0;\n";
                }
                //TODO Check if the segment identifier is going to be rendered or not. NYI!!
                var n = this._cf.renderStyle.nodes.length;
                for (var i=0; i<n; i++){ //TODO Check identifier and add the style
                    inlineText += "    if (s_id == "+i+"){\n"+
                    this._cf.renderStyle.nodes[i].inlineStyleShaderText()+
                    "    }\n";
                }
                return inlineText;
            },

            lightAssigment: function(){
                return this._cf.renderStyle.nodes[0].lightAssigment();
            },

            lightEquationShaderText: function(){ //TODO: ligth equation per segment
                return this._cf.renderStyle.nodes[0].lightEquationShaderText();
            },

            nodeChanged: function()
            {
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
                    var styleTextures = this.textures();
                    for (i = 0; i<styleTextures.length; i++)
                    {
                        this.vrcMultiTexture.addChild(styleTextures[i], 'texture');
                        this.vrcVolumeTexture.nodeChanged();
                    }
                    
                    this._cf.appearance.node.addChild(this.vrcMultiTexture);
                    this.vrcMultiTexture.nodeChanged();
                    
                    //Update child node properties
                    for (var i = 0; i < this._cf.renderStyle.nodes.length; i++) {
                        this._cf.renderStyle.nodes[i].updateProperties(this);
                    }

                    // here goes the volume shader
                    this.vrcSinglePassShaderVertex._vf.type = 'vertex';
                    this.vrcSinglePassShaderVertex._vf.url[0] = this.vertexShaderText();

                    this.vrcSinglePassShaderFragment._vf.type = 'fragment';
                    var shaderText =
                        this.fragmentPreamble+
                        this.defaultUniformsShaderText(this.vrcVolumeTexture._vf.numberOfSlices, this.vrcVolumeTexture._vf.slicesOverX, this.vrcVolumeTexture._vf.slicesOverY)+
                        this.styleUniformsShaderText()+
                        this.styleShaderText()+
                        this.texture3DFunctionShaderText+
                        this.normalFunctionShaderText()+
                        this.lightEquationShaderText()+
                        this.defaultLoopFragmentShaderText(this.inlineStyleShaderText(), this.lightAssigment(), this.initializeValues());
                    this.vrcSinglePassShaderFragment._vf.url[0] = shaderText;

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
                            x3dom.debug.logInfo('[VolumeRendering][SegmentedVolumeData] Looking for Volume Texture size...');
                            var s = obj.getTextureSize(aTex);
                            if(s.valid){
                                clearInterval(obj.offsetInterval);
                                obj.vrcSinglePassShaderFieldOffset._vf.value = new x3dom.fields.SFVec3f(1.0/(s.w/aTex._vf.slicesOverX), 1.0/(s.h/aTex._vf.slicesOverY), 1.0/aTex._vf.numberOfSlices);
                                obj.vrcSinglePassShader.nodeChanged();
                                x3dom.debug.logInfo('[VolumeRendering][SegmentedVolumeData] Volume Texture size obtained');
                            }
                        }
                    })(this.vrcVolumeTexture, this), 1000);
                    
                    var ShaderUniforms = this.uniforms();
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
