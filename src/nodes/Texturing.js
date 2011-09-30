/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
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
                var negCenter = new x3dom.fields.SFVec3f(-this._vf.center.x, -this._vf.center.y, 1);
                var posCenter = new x3dom.fields.SFVec3f(this._vf.center.x, this._vf.center.y, 0);
                var trans3 = new x3dom.fields.SFVec3f(this._vf.translation.x, this._vf.translation.y, 0);
                var scale3 = new x3dom.fields.SFVec3f(this._vf.scale.x, this._vf.scale.y, 0);

                this._trafo = x3dom.fields.SFMatrix4f.translation(negCenter).
                         mult(x3dom.fields.SFMatrix4f.scale(scale3)).
                         mult(x3dom.fields.SFMatrix4f.rotationZ(this._vf.rotation)).
                         mult(x3dom.fields.SFMatrix4f.translation(posCenter.add(trans3)));
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
            this.addField_SFNode('textureProperties', x3dom.nodeTypes.TextureProperties);
            this.addField_SFBool(ctx, 'scale', true);
			this.addField_SFInt32(ctx, 'priority', 5);
            //this.addField_SFString(ctx, 'scale', "NONE");

            this._needPerFrameUpdate = false;
            this._isCanvas = false;
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
                parent._cf.texture.node = null;
                Array.forEach(parent._parentNodes, function (shape) {
                    shape._dirty.texture = true;
                });
            },

            nodeChanged: function()
            {
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName == "url")
                {
                    Array.forEach(this._parentNodes, function (app) {
                        Array.forEach(app._parentNodes, function (shape) {
                            shape._dirty.texture = true;
                        });
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

                            if (that._vf.hideChildren) {
                                childDomNode.style.display = "none";
                                childDomNode.style.visibility = "hidden";
                            }
                            x3dom.debug.logInfo("### Found &lt;"+childDomNode.nodeName+"&gt; tag.");
                        }
                    } );
                }
                catch(e) {}
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

            ctx.doc._nodeBag.renderTextures.push(this);

            this.addField_SFNode('viewpoint', x3dom.nodeTypes.X3DViewpointNode);
            this.addField_SFNode('background', x3dom.nodeTypes.X3DBackgroundNode);
            this.addField_SFNode('fog', x3dom.nodeTypes.X3DFogNode);    //TODO
            this.addField_SFNode('scene', x3dom.nodeTypes.X3DNode);     //TODO
            this.addField_MFNode('excludeNodes', x3dom.nodeTypes.X3DNode);
            this.addField_MFInt32(ctx, 'dimensions', [128, 128, 4]);
            this.addField_SFString(ctx, 'update', 'NONE');         // ("NONE"|"NEXT_FRAME_ONLY"|"ALWAYS")

            x3dom.debug.assert(this._vf.dimensions.length >= 3);
            this._clearParents = true;
        },
        {
            nodeChanged: function()
            {
                this._clearParents = true;
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName == "excludeNodes") {
                    this._clearParents = true;
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

                if (view === null || view === vbP) {
                    return this._nameSpace.doc._viewarea.getViewMatrix();
                }
                else {
                    var mat_viewpoint = view.getCurrentTransform();
                    return mat_viewpoint.mult(view.getViewMatrix());
                }
            },

            getProjectionMatrix: function()
            {
                var vbP = this._nameSpace.doc._scene.getViewpoint();
                var view = this._cf.viewpoint.node;

                if (view === null || view === vbP) {
                    return this._nameSpace.doc._viewarea.getProjectionMatrix();
                }
                else {
                    var w = this._vf.dimensions[0], h = this._vf.dimensions[1];
                    return view.getProjectionMatrix(w / h);
                }
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
        },
        {
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
            // TODO; implement startTime, stopTime,...
        },
        {
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
					
                    /*
					this._nameSpace.getURL(this._cf.right.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.left.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.top.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.bottom.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.front.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.back.node._vf.url[0])
					*/
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

            x3dom.debug.logWarning("GeneratedCubeMapTexture NYI");   // TODO; impl. in gfx
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
        }
    )
);

/* ### TextureCoordinate3D ### */
x3dom.registerNodeType(
    "TextureCoordinate3D",
    "Texturing3D",
    defineClass(x3dom.nodeTypes.X3DTextureCoordinateNode,
        function (ctx) {
            x3dom.nodeTypes.TextureCoordinate3D.superClass.call(this, ctx);

            this.addField_MFVec3f(ctx, 'point', []);
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
