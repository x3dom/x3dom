/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */


/* ### X3DTextureTransformNode ### */
x3dom.registerNodeType(
    "X3DTextureTransformNode",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        
        /**
         * Constructor for X3DTextureTransformNode
         * @constructs x3dom.nodeTypes.X3DTextureTransformNode
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DAppearanceChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DTextureTransformNode.superClass.call(this, ctx);
        
        }
    )
);

/* ### TextureTransform ### */
x3dom.registerNodeType(
    "TextureTransform",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureTransformNode,
        
        /**
         * Constructor for TextureTransform
         * @constructs x3dom.nodeTypes.TextureTransform
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureTransformNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.TextureTransform.superClass.call(this, ctx);


            /**
             *
             * @var {SFVec2f} center
             * @memberof x3dom.nodeTypes.TextureTransform
             * @field x3dom
             * @instance
             */
            this.addField_SFVec2f(ctx, 'center', 0, 0);

            /**
             *
             * @var {SFFloat} rotation
             * @memberof x3dom.nodeTypes.TextureTransform
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'rotation', 0);

            /**
             *
             * @var {SFVec2f} scale
             * @memberof x3dom.nodeTypes.TextureTransform
             * @field x3dom
             * @instance
             */
            this.addField_SFVec2f(ctx, 'scale', 1, 1);

            /**
             *
             * @var {SFVec2f} translation
             * @memberof x3dom.nodeTypes.TextureTransform
             * @field x3dom
             * @instance
             */
            this.addField_SFVec2f(ctx, 'translation', 0, 0);

            //Tc' = -C * S * R * C * T * Tc
            var negCenter = new x3dom.fields.SFVec3f(-this._vf.center.x, -this._vf.center.y, 1);
            var posCenter = new x3dom.fields.SFVec3f(this._vf.center.x, this._vf.center.y, 0);
            var trans3 = new x3dom.fields.SFVec3f(this._vf.translation.x, this._vf.translation.y, 0);
            var scale3 = new x3dom.fields.SFVec3f(this._vf.scale.x, this._vf.scale.y, 0);

            this._trafo = x3dom.fields.SFMatrix4f.translation(negCenter).
                    mult(x3dom.fields.SFMatrix4f.scale(scale3)).
                    mult(x3dom.fields.SFMatrix4f.rotationZ(this._vf.rotation)).
                    mult(x3dom.fields.SFMatrix4f.translation(posCenter.add(trans3)));
        
        },
        {
            fieldChanged: function (fieldName) {
                //Tc' = -C * S * R * C * T * Tc
                if (fieldName == 'center' || fieldName == 'rotation' ||
                    fieldName == 'scale' || fieldName == 'translation') {

                var negCenter = new x3dom.fields.SFVec3f(-this._vf.center.x, -this._vf.center.y, 1);
                var posCenter = new x3dom.fields.SFVec3f(this._vf.center.x, this._vf.center.y, 0);
                var trans3 = new x3dom.fields.SFVec3f(this._vf.translation.x, this._vf.translation.y, 0);
                var scale3 = new x3dom.fields.SFVec3f(this._vf.scale.x, this._vf.scale.y, 0);

                this._trafo = x3dom.fields.SFMatrix4f.translation(negCenter).
                         mult(x3dom.fields.SFMatrix4f.scale(scale3)).
                         mult(x3dom.fields.SFMatrix4f.rotationZ(this._vf.rotation)).
                         mult(x3dom.fields.SFMatrix4f.translation(posCenter.add(trans3)));
                }
            },

            texTransformMatrix: function() {
                return this._trafo;
            }
        }
    )
);

/* ### TextureProperties ### */
x3dom.registerNodeType(
    "TextureProperties",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DNode,
        
        /**
         * Constructor for TextureProperties
         * @constructs x3dom.nodeTypes.TextureProperties
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.TextureProperties.superClass.call(this, ctx);


            /**
             *
             * @var {SFFloat} anisotropicDegree
             * @memberof x3dom.nodeTypes.TextureProperties
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'anisotropicDegree', 1.0);

            /**
             *
             * @var {SFColorRGBA} borderColor
             * @memberof x3dom.nodeTypes.TextureProperties
             * @field x3dom
             * @instance
             */
            this.addField_SFColorRGBA(ctx, 'borderColor', 0, 0, 0, 0);

            /**
             *
             * @var {SFInt32} borderWidth
             * @memberof x3dom.nodeTypes.TextureProperties
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'borderWidth', 0);

            /**
             *
             * @var {SFString} boundaryModeS
             * @memberof x3dom.nodeTypes.TextureProperties
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'boundaryModeS', "REPEAT");

            /**
             *
             * @var {SFString} boundaryModeT
             * @memberof x3dom.nodeTypes.TextureProperties
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'boundaryModeT', "REPEAT");

            /**
             *
             * @var {SFString} boundaryModeR
             * @memberof x3dom.nodeTypes.TextureProperties
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'boundaryModeR', "REPEAT");

            /**
             *
             * @var {SFString} magnificationFilter
             * @memberof x3dom.nodeTypes.TextureProperties
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'magnificationFilter', "FASTEST");

            /**
             *
             * @var {SFString} minificationFilter
             * @memberof x3dom.nodeTypes.TextureProperties
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'minificationFilter', "FASTEST");

            /**
             *
             * @var {SFString} textureCompression
             * @memberof x3dom.nodeTypes.TextureProperties
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'textureCompression', "FASTEST");

            /**
             *
             * @var {SFFloat} texturePriority
             * @memberof x3dom.nodeTypes.TextureProperties
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'texturePriority', 0);

            /**
             *
             * @var {SFBool} generateMipMaps
             * @memberof x3dom.nodeTypes.TextureProperties
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'generateMipMaps', false);
        
        },
		{
			fieldChanged: function(fieldName)
			{
                if (this._vf.hasOwnProperty(fieldName)) {
                    Array.forEach(this._parentNodes, function (texture) {
                        Array.forEach(texture._parentNodes, function (app) {
                            Array.forEach(app._parentNodes, function (shape) {
                                shape._dirty.texture = true;
                            });
                        });
                    });

                    this._nameSpace.doc.needRender = true;
                }
			}
		}
    )
);

/* ### X3DTextureNode ### */
x3dom.registerNodeType(
    "X3DTextureNode",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        
        /**
         * Constructor for X3DTextureNode
         * @constructs x3dom.nodeTypes.X3DTextureNode
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DAppearanceChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DTextureNode.superClass.call(this, ctx);
			

            /**
             *
             * @var {SFInt32} origChannelCount
             * @memberof x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'origChannelCount', 0); // 0 means the system should figure out the count

            /**
             *
             * @var {MFString} url
             * @memberof x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'url', []);

            /**
             *
             * @var {SFBool} repeatS
             * @memberof x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'repeatS', true);

            /**
             *
             * @var {SFBool} repeatT
             * @memberof x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'repeatT', true);

            /**
             *
             * @var {SFBool} scale
             * @memberof x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'scale', true);

            /**
             *
             * @var {SFBool} withCredentials
             * @memberof x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'withCredentials', false);

            /**
             *
             * @var {SFNode} textureProperties
             * @memberof x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('textureProperties', x3dom.nodeTypes.TextureProperties);

            this._needPerFrameUpdate = false;
            this._isCanvas = false;
			this._type = "diffuseMap";
			
			this._blending = (this._vf.origChannelCount == 1 || this._vf.origChannelCount == 2);
        
        },
        {
            invalidateGLObject: function ()
            {
                Array.forEach(this._parentNodes, function (app) {
                        Array.forEach(app._parentNodes, function (shape) {
                            shape._dirty.texture = true;
                        });
                    });

                this._nameSpace.doc.needRender = true;
            },

            parentAdded: function(parent)
            {
                Array.forEach(parent._parentNodes, function (shape) {
                    shape._dirty.texture = true;
                });
            },

            parentRemoved: function(parent)
            {
                Array.forEach(parent._parentNodes, function (shape) {
                    shape._dirty.texture = true;
                });
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName == "url" || fieldName ==  "origChannelCount" ||
				    fieldName == "repeatS" || fieldName == "repeatT" ||
                    fieldName == "scale" || fieldName == "withCredentials")
                {
                    var that = this;

                    Array.forEach(this._parentNodes, function (app) {
                        if (x3dom.isa(app, x3dom.nodeTypes.X3DAppearanceNode)) {
                            app.nodeChanged();
                            Array.forEach(app._parentNodes, function (shape) {
                                shape._dirty.texture = true;
                            });
                        }
                        else if (x3dom.isa(app, x3dom.nodeTypes.ImageGeometry)) {
                            var cf = null;
                            if (that._xmlNode && that._xmlNode.hasAttribute('containerField')) {
                                cf = that._xmlNode.getAttribute('containerField');
                                app._dirty[cf] = true;
                            }
                        }
                    });
                }
            },

            getTexture: function(pos) {
                if (pos === 0) {
                    return this;
                }
                return null;
            },

            size: function() {
                return 1;
            }
        }
    )
);

/* ### MultiTexture ### */
x3dom.registerNodeType(
    "MultiTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
        
        /**
         * Constructor for MultiTexture
         * @constructs x3dom.nodeTypes.MultiTexture
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.MultiTexture.superClass.call(this, ctx);


            /**
             *
             * @var {MFNode} texture
             * @memberof x3dom.nodeTypes.MultiTexture
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('texture', x3dom.nodeTypes.X3DTextureNode);
        
        },
        {
            getTexture: function(pos) {
                if (pos >= 0 && pos < this._cf.texture.nodes.length) {
                    return this._cf.texture.nodes[pos];
                }
                return null;
            },
			
			getTextures: function() {
				return this._cf.texture.nodes;
			},

            size: function() {
                return this._cf.texture.nodes.length;
            }
        }
    )
);

/* ### Texture ### */
// intermediate layer to avoid instantiating X3DTextureNode in web profile
x3dom.registerNodeType(
    "Texture",      // X3DTexture2DNode
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
        
        /**
         * Constructor for Texture
         * @constructs x3dom.nodeTypes.Texture
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Texture.superClass.call(this, ctx);


            /**
             *
             * @var {SFBool} hideChildren
             * @memberof x3dom.nodeTypes.Texture
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'hideChildren', true);

            this._video = null;
            this._intervalID = 0;
            this._canvas = null;
        
        },
        {
            nodeChanged: function()
            {
                if (this._vf.url.length || !this._xmlNode) {
                    return;
                }
                x3dom.debug.logInfo("No Texture URL given, searching for &lt;img&gt; elements...");
                var that = this;
                try {
                    Array.forEach( this._xmlNode.childNodes, function (childDomNode) {
                        if (childDomNode.nodeType === 1) {
                            var url = childDomNode.getAttribute("src");
                            // For testing: look for <img> element if url empty
                            if (url) {
                                that._vf.url.push(url);
                                x3dom.debug.logInfo(that._vf.url[that._vf.url.length-1]);
								//x3dom.ImageLoadManager.push( that );

                                if (childDomNode.localName === "video") {
                                    that._needPerFrameUpdate = true;
                                    //that._video = childDomNode;

                                    that._video = document.createElement('video');
                                    that._video.setAttribute('autobuffer', 'true');
                                    var p = document.getElementsByTagName('body')[0];
                                    p.appendChild(that._video);
                                    that._video.style.display = "none";
                                }
                            }
                            else if (childDomNode.localName.toLowerCase() === "canvas") {
                                that._needPerFrameUpdate = true;
                                that._isCanvas = true;
                                that._canvas = childDomNode;
                            }

                            if (childDomNode.style && that._vf.hideChildren) {
                                childDomNode.style.display = "none";
                                childDomNode.style.visibility = "hidden";
                            }
                            x3dom.debug.logInfo("### Found &lt;"+childDomNode.nodeName+"&gt; tag.");
                        }
                    } );
                }
                catch(e) {
                    x3dom.debug.logException(e);
                }
            },

            shutdown: function() {
                if (this._video) {
                    this._video.pause();
                    while (this._video.hasChildNodes()) {
                        this._video.removeChild(this._video.firstChild);
                    }
                    document.body.removeChild(this._video);
                    this._video = null;
                }
            }
        }
    )
);
/* ### RenderedTexture ### */
x3dom.registerNodeType(
    "RenderedTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
        
        /**
         * Constructor for RenderedTexture
         * @constructs x3dom.nodeTypes.RenderedTexture
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.RenderedTexture.superClass.call(this, ctx);

            if (ctx)
                ctx.doc._nodeBag.renderTextures.push(this);
            else
                x3dom.debug.logWarning("RenderedTexture: No runtime context found!");


            /**
             *
             * @var {SFNode} viewpoint
             * @memberof x3dom.nodeTypes.RenderedTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('viewpoint', x3dom.nodeTypes.X3DViewpointNode);

            /**
             *
             * @var {SFNode} background
             * @memberof x3dom.nodeTypes.RenderedTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('background', x3dom.nodeTypes.X3DBackgroundNode);

            /**
             *
             * @var {SFNode} fog
             * @memberof x3dom.nodeTypes.RenderedTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('fog', x3dom.nodeTypes.X3DFogNode);    //TODO

            /**
             *
             * @var {SFNode} scene
             * @memberof x3dom.nodeTypes.RenderedTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('scene', x3dom.nodeTypes.X3DNode);

            /**
             *
             * @var {MFNode} excludeNodes
             * @memberof x3dom.nodeTypes.RenderedTexture
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('excludeNodes', x3dom.nodeTypes.X3DNode);

            /**
             *
             * @var {MFInt32} dimensions
             * @memberof x3dom.nodeTypes.RenderedTexture
             * @field x3dom
             * @instance
             */
            this.addField_MFInt32(ctx, 'dimensions', [128, 128, 4]);

            /**
             *
             * @var {SFString} update
             * @memberof x3dom.nodeTypes.RenderedTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'update', 'NONE');         // ("NONE"|"NEXT_FRAME_ONLY"|"ALWAYS")

            /**
             *
             * @var {SFBool} showNormals
             * @memberof x3dom.nodeTypes.RenderedTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'showNormals', false);


            /**
             *
             * @var {SFString} stereoMode
             * @memberof x3dom.nodeTypes.RenderedTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'stereoMode', 'NONE');     // ("NONE"|"LEFT_EYE"|"RIGHT_EYE")

            /**
             *
             * @var {SFFloat} interpupillaryDistance
             * @memberof x3dom.nodeTypes.RenderedTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'interpupillaryDistance', 0.064);

            this.hScreenSize = 0.14976;
            this.vScreenSize = 0.09356;
            this.vScreenCenter = this.vScreenSize / 2;
            this.eyeToScreenDistance = 0.041;
            this.lensSeparationDistance = 0.0635;
            this.distortionK = [1.0, 0.22, 0.24, 0.0];
            //hRes, vRes = 1280 x 800
            this.lensCenter = 1 - 2 * this.lensSeparationDistance / this.hScreenSize;

            x3dom.debug.assert(this._vf.dimensions.length >= 3);
            this._clearParents = true;
            this._needRenderUpdate = true;
        
        },
        {
            nodeChanged: function()
            {
                this._clearParents = true;
                this._needRenderUpdate = true;
            },

            fieldChanged: function(fieldName)
            {
                switch(fieldName) 
                {
                    case "excludeNodes":
                        this._clearParents = true;
                        break;
                    case "update":
                        if (this._vf.update.toUpperCase() == "NEXT_FRAME_ONLY" ||
                            this._vf.update.toUpperCase() == "ALWAYS") {
                            this._needRenderUpdate = true;
                        }
                        break;
                    default:
                        // TODO: dimensions
                        break;
                }
            },

            getViewMatrix: function ()
            {
                if (this._clearParents && this._cf.excludeNodes.nodes.length) {
                    // FIXME; avoid recursions cleverer and more generic than this
                    //        (Problem: nodes in excludeNodes field have this node
                    //         as first parent, which leads to a recursion loop in
                    //         getCurrentTransform()
                    var that = this;

                    Array.forEach(this._cf.excludeNodes.nodes, function(node) {
                        for (var i=0, n=node._parentNodes.length; i < n; i++) {
                            if (node._parentNodes[i] === that) {
                                node._parentNodes.splice(i, 1);
                                node.parentRemoved(that);
                            }
                        }
                    });

                    this._clearParents = false;
                }

                var vbP = this._nameSpace.doc._scene.getViewpoint();
                var view = this._cf.viewpoint.node;
                var ret_mat = null;

                if (view === null || view === vbP) {
                    ret_mat = this._nameSpace.doc._viewarea.getViewMatrix();
                }
                else {
                    var mat_viewpoint = view.getCurrentTransform();
                    ret_mat = mat_viewpoint.mult(view.getViewMatrix());
                }

                var stereoMode = this._vf.stereoMode.toUpperCase();
                if (stereoMode != "NONE") {
                    var d = this._vf.interpupillaryDistance / 2;
                    if (stereoMode == "RIGHT_EYE") {
                        d = -d;
                    }
                    var modifier = new x3dom.fields.SFMatrix4f(
                        1, 0, 0, d,
                        0, 1, 0, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1
                    );
                    ret_mat = modifier.mult(ret_mat);
                }

                return ret_mat;
            },

            getProjectionMatrix: function()
            {
                var doc = this._nameSpace.doc;
                var vbP = doc._scene.getViewpoint();
                var view = this._cf.viewpoint.node;
                var ret_mat = null;
                var f, w = this._vf.dimensions[0], h = this._vf.dimensions[1];
                var stereoMode = this._vf.stereoMode.toUpperCase();
                var stereo = (stereoMode != "NONE");

                if (view === null || view === vbP) {
                    ret_mat = x3dom.fields.SFMatrix4f.copy(doc._viewarea.getProjectionMatrix());
                    if (stereo) {
                        f = 2 * Math.atan(this.vScreenSize / (2 * this.eyeToScreenDistance));
                        f = 1 / Math.tan(f / 2);
                    }
                    else {
                        f = 1 / Math.tan(vbP._vf.fieldOfView / 2);
                    }
                    ret_mat._00 = f / (w / h);
                    ret_mat._11 = f;
                }
                else {
                    ret_mat = view.getProjectionMatrix(w / h);
                }

                if (stereo) {
                    var hp = this.lensCenter;
                    if (stereoMode == "RIGHT_EYE") {
                        hp = -hp;
                    }
                    var modifier = new x3dom.fields.SFMatrix4f(
                        1, 0, 0, hp,
                        0, 1, 0, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1
                    );
                    ret_mat = modifier.mult(ret_mat);
                }

                return ret_mat;
            },

            getWCtoCCMatrix: function()
            {
                var view = this.getViewMatrix();
                var proj = this.getProjectionMatrix();

                return proj.mult(view);
            },

            parentRemoved: function(parent)
            {
                if (this._parentNodes.length === 0) {
                    var doc = this.findX3DDoc();

                    for (var i=0, n=doc._nodeBag.renderTextures.length; i<n; i++) {
                        if (doc._nodeBag.renderTextures[i] === this) {
                            doc._nodeBag.renderTextures.splice(i, 1);
                        }
                    }
                }

                if (this._cf.scene.node) {
                    this._cf.scene.node.parentRemoved(this);
                }
            }
        }
    )
);

/* ### PixelTexture ### */
x3dom.registerNodeType(
    "PixelTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
        
        /**
         * Constructor for PixelTexture
         * @constructs x3dom.nodeTypes.PixelTexture
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.PixelTexture.superClass.call(this, ctx);


            /**
             *
             * @var {SFImage} image
             * @memberof x3dom.nodeTypes.PixelTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFImage(ctx, 'image', 0, 0, 0);
        
        },
        {
            fieldChanged: function(fieldName)
            {
                if (fieldName == "image") {
                    this.invalidateGLObject();
                }
            }
        }
    )
);

/* ### ImageTexture ### */
x3dom.registerNodeType(
    "ImageTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.Texture,
        
        /**
         * Constructor for ImageTexture
         * @constructs x3dom.nodeTypes.ImageTexture
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.Texture
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.ImageTexture.superClass.call(this, ctx);
        
        }
    )
);

/* ### MovieTexture ### */
x3dom.registerNodeType(
    "MovieTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.Texture,
        
        /**
         * Constructor for MovieTexture
         * @constructs x3dom.nodeTypes.MovieTexture
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.Texture
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.MovieTexture.superClass.call(this, ctx);


            /**
             *
             * @var {SFBool} loop
             * @memberof x3dom.nodeTypes.MovieTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'loop', false);

            /**
             *
             * @var {SFFloat} speed
             * @memberof x3dom.nodeTypes.MovieTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'speed', 1.0);
            // TODO; implement the following fields...

            /**
             *
             * @var {SFTime} pauseTime
             * @memberof x3dom.nodeTypes.MovieTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFTime(ctx, 'pauseTime', 0);

            /**
             *
             * @var {SFFloat} pitch
             * @memberof x3dom.nodeTypes.MovieTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'pitch', 1.0);

            /**
             *
             * @var {SFTime} resumeTime
             * @memberof x3dom.nodeTypes.MovieTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFTime(ctx, 'resumeTime', 0);

            /**
             *
             * @var {SFTime} startTime
             * @memberof x3dom.nodeTypes.MovieTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFTime(ctx, 'startTime', 0);

            /**
             *
             * @var {SFTime} stopTime
             * @memberof x3dom.nodeTypes.MovieTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFTime(ctx, 'stopTime', 0);
        
        }
    )
);

/* ### X3DEnvironmentTextureNode ### */
x3dom.registerNodeType(
    "X3DEnvironmentTextureNode",
    "CubeMapTexturing",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
        
        /**
         * Constructor for X3DEnvironmentTextureNode
         * @constructs x3dom.nodeTypes.X3DEnvironmentTextureNode
         * @x3d x.x
         * @component CubeMapTexturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DEnvironmentTextureNode.superClass.call(this, ctx);
        
        },
        {
            getTexUrl: function() {
                return [];  //abstract accessor for gfx
            },

            getTexSize: function() {
                return -1;  //abstract accessor for gfx
            }
        }
    )
);

/* ### ComposedCubeMapTexture ### */
x3dom.registerNodeType(
    "ComposedCubeMapTexture",
    "CubeMapTexturing",
    defineClass(x3dom.nodeTypes.X3DEnvironmentTextureNode,
        
        /**
         * Constructor for ComposedCubeMapTexture
         * @constructs x3dom.nodeTypes.ComposedCubeMapTexture
         * @x3d x.x
         * @component CubeMapTexturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DEnvironmentTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.ComposedCubeMapTexture.superClass.call(this, ctx);


            /**
             *
             * @var {SFNode} back
             * @memberof x3dom.nodeTypes.ComposedCubeMapTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('back',   x3dom.nodeTypes.Texture);

            /**
             *
             * @var {SFNode} front
             * @memberof x3dom.nodeTypes.ComposedCubeMapTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('front',  x3dom.nodeTypes.Texture);

            /**
             *
             * @var {SFNode} bottom
             * @memberof x3dom.nodeTypes.ComposedCubeMapTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('bottom', x3dom.nodeTypes.Texture);

            /**
             *
             * @var {SFNode} top
             * @memberof x3dom.nodeTypes.ComposedCubeMapTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('top',    x3dom.nodeTypes.Texture);

            /**
             *
             * @var {SFNode} left
             * @memberof x3dom.nodeTypes.ComposedCubeMapTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('left',   x3dom.nodeTypes.Texture);

            /**
             *
             * @var {SFNode} right
             * @memberof x3dom.nodeTypes.ComposedCubeMapTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('right',  x3dom.nodeTypes.Texture);
			this._type = "cubeMap";
        
        },
        {
            getTexUrl: function() {
                return [
					this._nameSpace.getURL(this._cf.back.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.front.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.bottom.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.top.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.left.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.right.node._vf.url[0])
                ];
            }
        }
    )
);

/* ### GeneratedCubeMapTexture ### */
x3dom.registerNodeType(
    "GeneratedCubeMapTexture",
    "CubeMapTexturing",
    defineClass(x3dom.nodeTypes.X3DEnvironmentTextureNode,
        
        /**
         * Constructor for GeneratedCubeMapTexture
         * @constructs x3dom.nodeTypes.GeneratedCubeMapTexture
         * @x3d x.x
         * @component CubeMapTexturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DEnvironmentTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.GeneratedCubeMapTexture.superClass.call(this, ctx);


            /**
             *
             * @var {SFInt32} size
             * @memberof x3dom.nodeTypes.GeneratedCubeMapTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'size', 128);

            /**
             *
             * @var {SFString} update
             * @memberof x3dom.nodeTypes.GeneratedCubeMapTexture
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'update', 'NONE');  // ("NONE"|"NEXT_FRAME_ONLY"|"ALWAYS")

			this._type = "cubeMap";
            x3dom.debug.logWarning("GeneratedCubeMapTexture NYI");   // TODO; impl. in gfx when fbo type ready
        
        },
        {
            getTexSize: function() {
                return this._vf.size;
            }
        }
    )
);

/* ### X3DTextureCoordinateNode ### */
x3dom.registerNodeType(
    "X3DTextureCoordinateNode",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        
        /**
         * Constructor for X3DTextureCoordinateNode
         * @constructs x3dom.nodeTypes.X3DTextureCoordinateNode
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometricPropertyNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DTextureCoordinateNode.superClass.call(this, ctx);
        
        },
		{
			fieldChanged: function (fieldName) {
                if (fieldName === "texCoord" || fieldName === "point" || 
                    fieldName === "parameter" || fieldName === "mode") 
                {
                    Array.forEach(this._parentNodes, function (node) {
                        node.fieldChanged("texCoord");
                    });
                }
            },

            parentAdded: function(parent) {
                if (parent._mesh && //parent._cf.coord.node &&
                    parent._cf.texCoord.node !== this) {
                    parent.fieldChanged("texCoord");
                }
            }
		}	
    )
);

/* ### TextureCoordinate ### */
x3dom.registerNodeType(
    "TextureCoordinate",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureCoordinateNode,
        
        /**
         * Constructor for TextureCoordinate
         * @constructs x3dom.nodeTypes.TextureCoordinate
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureCoordinateNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.TextureCoordinate.superClass.call(this, ctx);


            /**
             *
             * @var {MFVec2f} point
             * @memberof x3dom.nodeTypes.TextureCoordinate
             * @field x3dom
             * @instance
             */
            this.addField_MFVec2f(ctx, 'point', []);
        
        }
    )
);

/* ### TextureCoordinateGenerator ### */
x3dom.registerNodeType(
    "TextureCoordinateGenerator",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureCoordinateNode,
        
        /**
         * Constructor for TextureCoordinateGenerator
         * @constructs x3dom.nodeTypes.TextureCoordinateGenerator
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureCoordinateNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.TextureCoordinateGenerator.superClass.call(this, ctx);


            /**
             *
             * @var {SFString} mode
             * @memberof x3dom.nodeTypes.TextureCoordinateGenerator
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'mode', "SPHERE");

            /**
             *
             * @var {MFFloat} parameter
             * @memberof x3dom.nodeTypes.TextureCoordinateGenerator
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'parameter', []);
        
        }
    )
);

/* ### MultiTextureCoordinate ### */
x3dom.registerNodeType(
    "MultiTextureCoordinate",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureCoordinateNode,
        
        /**
         * Constructor for MultiTextureCoordinate
         * @constructs x3dom.nodeTypes.MultiTextureCoordinate
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureCoordinateNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.MultiTextureCoordinate.superClass.call(this, ctx);


            /**
             *
             * @var {MFNode} texCoord
             * @memberof x3dom.nodeTypes.MultiTextureCoordinate
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('texCoord', x3dom.nodeTypes.X3DTextureCoordinateNode);
        
        }
    )
);
