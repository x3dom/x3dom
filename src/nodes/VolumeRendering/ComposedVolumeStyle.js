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

/* ### ComposedVolumeStyle ### */
x3dom.registerNodeType(
    "ComposedVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        
        /**
         * Constructor for ComposedVolumeStyle
         * @constructs x3dom.nodeTypes.ComposedVolumeStyle
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The ComposedVolumeStyle node is used to compose multiple rendering styles into a single-rendering pass.
         * The styles are applied in the same order they are defined on the scene tree.
         */
        function (ctx) {
            x3dom.nodeTypes.ComposedVolumeStyle.superClass.call(this, ctx);


            /**
             * 
             * @var {x3dom.fields.SFBool} ordered
             * @memberof x3dom.nodeTypes.ComposedVolumeStyle
             * @initvalue false
             * @field x3dom
             * @instance
             */
            //this.addField_SFBool(ctx, 'ordered', false);

            /**
             * The renderStyle field contains a list of composable render styles nodes to be used on the associated volume data.
             * @var {x3dom.fields.MFNode} renderStyle
             * @memberof x3dom.nodeTypes.ComposedVolumeStyle
             * @initvalue x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('renderStyle', x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode);
            //Using only one normal texture
            this.normalTextureProvided = false;
        
        },
        {
            uniforms: function(){
                var unis = [];
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
                return unis;
            },

            textures: function() {
                var texs = [];
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
                var initialValues ="";
                var n = this._cf.renderStyle.nodes.length;
                for (var i=0; i<n; i++){
                    if(this._cf.renderStyle.nodes[i].initializeValues != undefined){
                        initialValues += this._cf.renderStyle.nodes[i].initializeValues() + "\n";
                    }
                }
                return initialValues;
            },

            styleUniformsShaderText: function(){
                var styleText = "";
                var n = this._cf.renderStyle.nodes.length;
                if (n == 1 && !x3dom.isa(this._cf.renderStyle.nodes[0], x3dom.nodeTypes.OpacityMapVolumeStyle)){
                    this.surfaceNormalsNeeded = true;
                }
                for (var i=0; i<n; i++){
                    styleText += this._cf.renderStyle.nodes[i].styleUniformsShaderText() + "\n";
                    if(this._cf.renderStyle.nodes[i]._cf.surfaceNormals && this._cf.renderStyle.nodes[i]._cf.surfaceNormals.node != null){
                        this.normalTextureProvided = true;
                        this._cf.surfaceNormals.node = this._cf.renderStyle.nodes[i]._cf.surfaceNormals.node;
                    }
                }
                return styleText;
            },

            styleShaderText: function(){
                var styleText = "";
                var n = this._cf.renderStyle.nodes.length;
                for (var i=0; i<n; i++){
                    if(this._cf.renderStyle.nodes[i].styleShaderText != undefined){
                        styleText += this._cf.renderStyle.nodes[i].styleShaderText() + "\n";
                    }
                }
                return styleText;
            },

            inlineStyleShaderText: function(){
                var inlineText = "";
                var n = this._cf.renderStyle.nodes.length;
                for (var i=0; i<n; i++){
                    inlineText += this._cf.renderStyle.nodes[i].inlineStyleShaderText();
                }
                /*if(x3dom.nodeTypes.X3DLightNode.lightID>0){
                    inlineText += this._cf.renderStyle.nodes[0].lightAssigment();
                }*/
                return inlineText;
            },

            lightAssigment: function(){
                var isBlendedStyle = false;
                var blendedLightAssigmentText;
                //Check if there is a blendedStyle, not to use lightAssigment
                Array.forEach(this._cf.renderStyle.nodes, function(style){
                    if(x3dom.isa(style, x3dom.nodeTypes.BlendedVolumeStyle)){
                        isBlendedStyle = true;
                        blendedLightAssigmentText = style.lightAssigment();
                    }
                });
                if(!isBlendedStyle){
                    return this._cf.renderStyle.nodes[0].lightAssigment();
                }else{
                    return this._cf.renderStyle.nodes[0].lightAssigment()+blendedLightAssigmentText;
                }
            },

            lightEquationShaderText: function(){
                return this._cf.renderStyle.nodes[0].lightEquationShaderText();
            }
        }
    )
);