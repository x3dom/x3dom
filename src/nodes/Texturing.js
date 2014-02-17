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
        function (ctx) {
            x3dom.nodeTypes.TextureTransform.superClass.call(this, ctx);

            this.addField_SFVec2f(ctx, 'center', 0, 0);
            this.addField_SFFloat(ctx, 'rotation', 0);
            this.addField_SFVec2f(ctx, 'scale', 1, 1);
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
        function (ctx) {
            x3dom.nodeTypes.TextureProperties.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'anisotropicDegree', 1.0);
            this.addField_SFColorRGBA(ctx, 'borderColor', 0, 0, 0, 0);
            this.addField_SFInt32(ctx, 'borderWidth', 0);
            this.addField_SFString(ctx, 'boundaryModeS', "REPEAT");
            this.addField_SFString(ctx, 'boundaryModeT', "REPEAT");
            this.addField_SFString(ctx, 'boundaryModeR', "REPEAT");
            this.addField_SFString(ctx, 'magnificationFilter', "FASTEST");
            this.addField_SFString(ctx, 'minificationFilter', "FASTEST");
            this.addField_SFString(ctx, 'textureCompression', "FASTEST");
            this.addField_SFFloat(ctx, 'texturePriority', 0);
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
        function (ctx) {
            x3dom.nodeTypes.X3DTextureNode.superClass.call(this, ctx);
			
            this.addField_SFInt32(ctx, 'origChannelCount', 0); // 0 means the system should figure out the count
            this.addField_MFString(ctx, 'url', []);
            this.addField_SFBool(ctx, 'repeatS', true);
            this.addField_SFBool(ctx, 'repeatT', true);
            this.addField_SFBool(ctx, 'scale', true);
            this.addField_SFBool(ctx, 'withCredentials', false);
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
                        else if (x3dom.nodeTypes.X3DVolumeDataNode !== undefined) {
                            if (x3dom.isa(app, x3dom.nodeTypes.X3DVolumeRenderStyleNode)) {
                                if (that._xmlNode && that._xmlNode.hasAttribute('containerField')) {
                                    Array.forEach(app._parentNodes, function(shape){
                                        shape._dirty.texture = true;
                                    });
                                }
                            } else if (x3dom.isa(app, x3dom.nodeTypes.X3DVolumeDataNode)) {
                                if (that._xmlNode && that._xmlNode.hasAttribute('containerField')) {
                                    app._dirty.texture = true;
                                }
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
        function (ctx) {
            x3dom.nodeTypes.MultiTexture.superClass.call(this, ctx);

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
        function (ctx) {
            x3dom.nodeTypes.Texture.superClass.call(this, ctx);

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
        function (ctx) {
            x3dom.nodeTypes.RenderedTexture.superClass.call(this, ctx);

            if (ctx)
                ctx.doc._nodeBag.renderTextures.push(this);
            else
                x3dom.debug.logWarning("RenderedTexture: No runtime context found!");

            this.addField_SFNode('viewpoint', x3dom.nodeTypes.X3DViewpointNode);
            this.addField_SFNode('background', x3dom.nodeTypes.X3DBackgroundNode);
            this.addField_SFNode('fog', x3dom.nodeTypes.X3DFogNode);    //TODO
            this.addField_SFNode('scene', x3dom.nodeTypes.X3DNode);
            this.addField_MFNode('excludeNodes', x3dom.nodeTypes.X3DNode);
            this.addField_MFInt32(ctx, 'dimensions', [128, 128, 4]);
            this.addField_SFString(ctx, 'update', 'NONE');         // ("NONE"|"NEXT_FRAME_ONLY"|"ALWAYS")
            this.addField_SFBool(ctx, 'showNormals', false);

            this.addField_SFString(ctx, 'stereoMode', 'NONE');     // ("NONE"|"LEFT_EYE"|"RIGHT_EYE")
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

                var locScene = this._cf.scene.node;
                var scene = this._nameSpace.doc._scene;
                var vbP = scene.getViewpoint();
                var view = this._cf.viewpoint.node;
                var ret_mat = null;

                if (view === null || view === vbP) {
                    ret_mat = this._nameSpace.doc._viewarea.getViewMatrix();
                }
                else if (locScene && locScene !== scene) {
                    // in case of completely local scene do not transform local viewpoint
                    ret_mat = view.getViewMatrix()
                }
                else {
                    var mat_viewpoint = view.getCurrentTransform();
                    ret_mat = view.getViewMatrix().mult(mat_viewpoint.inverse());
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
        function (ctx) {
            x3dom.nodeTypes.PixelTexture.superClass.call(this, ctx);

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
        function (ctx) {
            x3dom.nodeTypes.MovieTexture.superClass.call(this, ctx);

            this.addField_SFBool(ctx, 'loop', false);
            this.addField_SFFloat(ctx, 'speed', 1.0);
            // TODO; implement the following fields...
            this.addField_SFTime(ctx, 'pauseTime', 0);
            this.addField_SFFloat(ctx, 'pitch', 1.0);
            this.addField_SFTime(ctx, 'resumeTime', 0);
            this.addField_SFTime(ctx, 'startTime', 0);
            this.addField_SFTime(ctx, 'stopTime', 0);
        }
    )
);

/* ### X3DEnvironmentTextureNode ### */
x3dom.registerNodeType(
    "X3DEnvironmentTextureNode",
    "CubeMapTexturing",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
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
        function (ctx) {
            x3dom.nodeTypes.ComposedCubeMapTexture.superClass.call(this, ctx);

            this.addField_SFNode('back',   x3dom.nodeTypes.Texture);
            this.addField_SFNode('front',  x3dom.nodeTypes.Texture);
            this.addField_SFNode('bottom', x3dom.nodeTypes.Texture);
            this.addField_SFNode('top',    x3dom.nodeTypes.Texture);
            this.addField_SFNode('left',   x3dom.nodeTypes.Texture);
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
        function (ctx) {
            x3dom.nodeTypes.GeneratedCubeMapTexture.superClass.call(this, ctx);

            this.addField_SFInt32(ctx, 'size', 128);
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
        function (ctx) {
            x3dom.nodeTypes.TextureCoordinate.superClass.call(this, ctx);

            this.addField_MFVec2f(ctx, 'point', []);
        }
    )
);

/* ### TextureCoordinateGenerator ### */
x3dom.registerNodeType(
    "TextureCoordinateGenerator",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureCoordinateNode,
        function (ctx) {
            x3dom.nodeTypes.TextureCoordinateGenerator.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'mode', "SPHERE");
            this.addField_MFFloat(ctx, 'parameter', []);
        }
    )
);

/* ### MultiTextureCoordinate ### */
x3dom.registerNodeType(
    "MultiTextureCoordinate",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureCoordinateNode,
        function (ctx) {
            x3dom.nodeTypes.MultiTextureCoordinate.superClass.call(this, ctx);

            this.addField_MFNode('texCoord', x3dom.nodeTypes.X3DTextureCoordinateNode);
        }
    )
);


/* ### MirrorRenderedTexture ### */
x3dom.registerNodeType(
    "MirrorRenderedTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.RenderedTexture,
        function (ctx) {
            x3dom.nodeTypes.MirrorRenderedTexture.superClass.call(this, ctx);
            
            this.addField_SFVec3f(ctx, 'viewOffset', 0, 0, 0);
        },
        {
            invalidateGLObject: function ()
            {
                Array.forEach(this._parentNodes, function (app) {
                    Array.forEach(app._parentNodes, function (shape) {
                        if(x3dom.isa(parent, x3dom.nodeTypes.Shape))
                        {
                            shape._dirty.texture = true;
                        }else
                        {
                            Array.forEach(shape._parentNodes, function (s) {
                                s._dirty.texture = true;                                    
                            });
                        }
                    });
                });

                this._nameSpace.doc.needRender = true;
            },
            
            parentAdded: function(parent)
            {
                Array.forEach(parent._parentNodes, function (shape) {
                    if(x3dom.isa(parent, x3dom.nodeTypes.Shape))
                    {
                        shape._dirty.texture = true;
                    }else
                    {
                        Array.forEach(shape._parentNodes, function (s) {
                            s._dirty.texture = true;                                    
                        });
                    }
                });
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
                    // Grab only the translation to pass it to the final transform matrix
                    var mat_transform = view.getCurrentTransform();
                    var mat_translate = new x3dom.fields.SFMatrix4f(
                        1, 0, 0, mat_transform._03 + this._vf.viewOffset.x,
                        0, 1, 0, mat_transform._13 + this._vf.viewOffset.y,
                        0, 0, 1, mat_transform._23 + this._vf.viewOffset.z,
                        0, 0, 0, 1).inverse();
                    ret_mat = view.getViewMatrix().mult(mat_translate);
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
            }
        }
    )
);


/* ### MirrorTexture ### */
x3dom.registerNodeType(
    "MirrorTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.MultiTexture,
        function (ctx) {
            x3dom.nodeTypes.MirrorTexture.superClass.call(this, ctx);

            this.addField_SFNode('viewpoint', x3dom.nodeTypes.X3DViewpointNode);
            this.addField_SFNode('background', x3dom.nodeTypes.X3DBackgroundNode);  
            this.addField_SFVec3f(ctx, 'viewOffset', 0, 0, 0); 
            this.addField_SFFloat(ctx, 'mirrorScale', 1.0);
            
            this._ctx = ctx;
            this._nameSpace = ctx;
            
            this._faceRTs = [
                new x3dom.nodeTypes.MirrorRenderedTexture(ctx),
                new x3dom.nodeTypes.MirrorRenderedTexture(ctx),
                new x3dom.nodeTypes.MirrorRenderedTexture(ctx),
                new x3dom.nodeTypes.MirrorRenderedTexture(ctx),
                new x3dom.nodeTypes.MirrorRenderedTexture(ctx),
                new x3dom.nodeTypes.MirrorRenderedTexture(ctx)
            ];            
            
            this.samplerFields = [
                new x3dom.nodeTypes.Field(ctx),
                new x3dom.nodeTypes.Field(ctx),
                new x3dom.nodeTypes.Field(ctx),
                new x3dom.nodeTypes.Field(ctx),
                new x3dom.nodeTypes.Field(ctx),
                new x3dom.nodeTypes.Field(ctx)
            ];
            
            this.scaleField = new x3dom.nodeTypes.Field(ctx);
            
            // Orientations for each direction of the cube map
            // 0 - front, 1 - left, 2 - back, 3 - right, 4 - up, 5 - down
            var orientations = [
                [0.0, 1.0, 0.0, 0.0],
                [0.0, 1.0, 0.0, 1.57],
                [0.0, 1.0, 0.0, 3.14],
                [0.0, 1.0, 0.0, 4.71],
                [1.0, 0.0, 0.0, 1.57],
                [1.0, 0.0, 0.0, 4.71]
            ];

            // Initialize RenderedTextures for each face of the cube
            for(var i = 0; i < this._faceRTs.length; i++)
            {   
                this._faceRTs[i]._nameSpace = this._nameSpace;
                this._faceRTs[i]._vf.update = 'always';
                this._faceRTs[i]._vf.dimensions = [1024, 1024, 2];
                this._faceRTs[i]._vf.repeatS = false;
                this._faceRTs[i]._vf.repeatT = false;

                var vp = new x3dom.nodeTypes.Viewpoint(this._ctx);
                vp._nameSpace = this._nameSpace;
                vp._vf.position = new x3dom.fields.SFVec3f(0.0, 0.0, 0.0);
                vp.fieldChanged("position");
                vp._vf.orientation = x3dom.fields.Quaternion.axisAngle(
                        new x3dom.fields.SFVec3f(
                            orientations[i][0], 
                            orientations[i][1], 
                            orientations[i][2]
                            ), 
                        orientations[i][3]
                        );
                vp.fieldChanged("orientation");
                vp._vf.fieldOfView = 1.57;
                vp.fieldChanged("fieldOfView");
                vp._vf.zNear = 0.1;
                vp.fieldChanged("zNear");
                vp._vf.zFar = 2000.0;
                vp.fieldChanged("zFar");

                this.addChild(this._faceRTs[i], 'texture');
                this._faceRTs[i].nodeChanged();

                this._faceRTs[i].addChild(vp, 'viewpoint');
                vp.nodeChanged();


                // Initialize the corresponding fields for the sampler2D shader-objects
                this.samplerFields[i]._nameSpace = this._nameSpace;
                this.samplerFields[i]._vf.name = 'mirror' + i;
                this.samplerFields[i]._vf.type = 'SFInt32';
                this.samplerFields[i]._vf.value = i;
            }
            
            this.scaleField._nameSpace = this._nameSpace;
            this.scaleField._vf.name = 'mirrorScale';
            this.scaleField._vf.type = 'SFFloat';
            this.scaleField._vf.value = 1.0;
        },
        {      
            nodeChanged: function() {            
                for(var i = 0; i < this._faceRTs.length; i++)
                {   
                    this._faceRTs[i]._nameSpace = this._nameSpace;
                    this._faceRTs[i]._vf.viewOffset = this._vf.viewOffset;
                    
                    if(this._cf.background.node)
                    {
                        this._faceRTs[i].addChild(this._cf.background.node, 'background');
                        this._cf.background.node.nodeChanged();
                    }
                
                    this._faceRTs[i].nodeChanged();
                }
                
                this.scaleField._vf.value = this._vf.mirrorScale;
                this.scaleField.nodeChanged();
                if(this.scaleField._parentNodes.length > 0)
                {
                    this.scaleField._parentNodes[0].nodeChanged();
                }
            },
            
            getVertexShaderCode : function()
            {        
                var shader =  
                        'attribute vec3 position;\n' +
                        'attribute vec3 normal;\n' +
                        'uniform mat4 worldMatrix;\n' +
                        'uniform mat4 viewMatrixInverse;\n' +
                        'uniform mat4 worldInverseTranspose;\n' +
                        'uniform mat4 modelViewProjectionMatrix;\n' +
                        'varying vec3 norm;\n' +
                        'varying vec3 eye;\n' +
                        'varying float eyeLength;\n' +  
                        'void main()\n' +
                        '{\n' +
                        '   vec4 vertex = vec4(position, 1.0);\n' +
                        '   vec4 pos = worldMatrix * vertex;\n' +
                        '   gl_Position = modelViewProjectionMatrix * vertex;\n' +
                        '   eye = (viewMatrixInverse * vec4(0.0,0.0,0.0, 1.0)).xyz - pos.xyz;\n' +
                        '   eyeLength = length(eye);\n' +
                        '   eye = normalize(eye);\n' +
                        '   norm = normalize((worldInverseTranspose * vec4(normal, 0.0)).xyz);\n' +
                        '}\n';
                
                return shader;
            },
            
            getFragmentShaderCode : function()
            {                
                var shader =  'precision highp float;\n' +
                        'varying vec3 norm;\n' +
                        'varying vec3 eye;\n' +
                        'varying float eyeLength;\n' +
                        // 0 - front, 1 - left, 2 - back, 3 - right, 4 - up, 5 - down
                        'uniform sampler2D mirror0;\n' +
                        'uniform sampler2D mirror1;\n' +
                        'uniform sampler2D mirror2;\n' +
                        'uniform sampler2D mirror3;\n' +
                        'uniform sampler2D mirror4;\n' +
                        'uniform sampler2D mirror5;\n' +
                        'uniform float mirrorScale;\n' +
                        '\n' +
                        'vec4 texCUBE(vec3 refl){\n' +
                        '   vec3 reflAbs = abs(refl);\n' +
                        '   vec4 color;\n' +
                        '   float maximum = max(max(reflAbs.x, reflAbs.y),reflAbs.z);\n' +
                        '   float scale = eyeLength / mirrorScale;\n' +
                        '   if(maximum == reflAbs.x) {\n' +
                        '       if(refl.x < 0.0) {\n' +
                        '           color = texture2D(mirror1, 1.0 - (vec2(refl.z/abs(refl.x), (-refl.y) / abs(refl.x)) * scale + 1.0) * 0.5);\n' +
                        '       } else {\n' +
                        '           color = texture2D(mirror3, 1.0 - (vec2((-refl.z)/abs(refl.x), (-refl.y) / abs(refl.x)) * scale + 1.0) * 0.5);\n' +
                        '       }\n' +
                        '   }else if(maximum == reflAbs.y) {\n' +
                        '       if(refl.y < 0.0) {\n' +
                        '           color = texture2D(mirror5, (vec2(refl.x/abs(refl.y), (-refl.z) / abs(refl.y)) * scale + 1.0) * 0.5);\n' +
                        '       } else {\n' +
                        '           color = texture2D(mirror4, (vec2(refl.x/abs(refl.y), (refl.z) / abs(refl.y)) * scale + 1.0) * 0.5);\n' +
                        '       }\n' +
                        '   } else {;\n' +
                        '       if(refl.z < 0.0) {\n' +
                        '           color = texture2D(mirror0, 1.0 - (vec2((-refl.x)/abs(refl.z), (-refl.y) / abs(refl.z)) * scale + 1.0) * 0.5);\n' +
                        '       } else {\n'+
                        '           color = texture2D(mirror2, 1.0 - (vec2((refl.x)/abs(refl.z), (-refl.y) / abs(refl.z)) * scale + 1.0) * 0.5);\n' +
                        '       }\n' +
                        '   }\n' +
                        '   return color;\n' +
                        '}\n' +
                        '\n' + 
                        'void main(){\n' +
                        '   vec3 normal = norm;\n' +
                        '   vec3 surfaceToView = eye;\n' +
                        '   vec3 refl = -reflect(surfaceToView, normal);\n' +
                        '   gl_FragColor = texCUBE(refl);\n' +
                        '}\n';
                
                return shader;
            },
            
            parentAdded: function(parent)
            {
                x3dom.nodeTypes.MultiTexture.superClass.prototype.parentAdded(parent);
                
                if(x3dom.isa(parent, x3dom.nodeTypes.Appearance))
                {
                    // Add a mirror shader if the parent node is an appearance. 
                    // Add support for other parent nodes later.                                      
                    
                    // Create shader
                    var shader = new x3dom.nodeTypes.ComposedShader(this._ctx);
                    shader._nameSpace = this._nameSpace;
                    var vertexShader = new x3dom.nodeTypes.ShaderPart(this._ctx);
                    vertexShader._nameSpace = this._nameSpace;
                    var fragmentShader = new x3dom.nodeTypes.ShaderPart(this._ctx);
                    fragmentShader._nameSpace = this._nameSpace;
                                        
                    vertexShader._vf.type = 'vertex';
                    vertexShader._vf.url[0] = this.getVertexShaderCode();
                    shader.addChild(vertexShader, 'parts');
                    vertexShader.nodeChanged();
                    
                    fragmentShader._vf.type = 'fragment';
                    fragmentShader._vf.url[0] = this.getFragmentShaderCode();
                    shader.addChild(fragmentShader, 'parts');
                    fragmentShader.nodeChanged();
                    
                    // Add field for each sampler2D
                    for(var i = 0; i < this.samplerFields.length; i++)
                    {
                        shader.addChild(this.samplerFields[i], 'fields');
                        this.samplerFields[i].nodeChanged();
                    }
                    shader.addChild(this.scaleField);
                    this.scaleField.nodeChanged();
                    
                    parent.addChild(shader, 'shaders');
                    shader.nodeChanged();
                }
            },
            
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
            },
            
            parentRemoved: function(parent)
            {
                if (this._parentNodes.length === 0) {
                    var doc = this.findX3DDoc();

                    for (var i=0, n=doc._nodeBag.renderTextures.length; i<n; i++) {
                        if (doc._nodeBag.renderTextures[i] in this._faceRTs) {
                            doc._nodeBag.renderTextures.splice(i, 1);
                        }
                    }
                }
            }
        }
    )
);
