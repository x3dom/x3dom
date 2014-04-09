/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

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
                        // THINKABOUTME: this is a bit ugly, cleanup more generically
                        if (x3dom.isa(shape, x3dom.nodeTypes.X3DShapeNode)) {
                            shape._dirty.texture = true;
                        }
                        else {
                            // Texture maybe in MultiTexture or CommonSurfaceShader
                            Array.forEach(shape._parentNodes, function (realShape) {
                                realShape._dirty.texture = true;
                            });
                        }
                    });
                });

                this._nameSpace.doc.needRender = true;
            },

            parentAdded: function(parent)
            {
                Array.forEach(parent._parentNodes, function (shape) {
                    // THINKABOUTME: this is a bit ugly, cleanup more generically
                    if (x3dom.isa(shape, x3dom.nodeTypes.Shape)) {
                        shape._dirty.texture = true;
                    }
                    else {
                        // Texture maybe in MultiTexture or CommonSurfaceShader
                        Array.forEach(shape._parentNodes, function (realShape) {
                            realShape._dirty.texture = true;
                        });
                    }
                });
            },

            parentRemoved: function(parent)
            {
                Array.forEach(parent._parentNodes, function (shape) {
                    // THINKABOUTME: this is a bit ugly, cleanup more generically
                    if (x3dom.isa(shape, x3dom.nodeTypes.Shape)) {
                        shape._dirty.texture = true;
                    }
                    else {
                        // Texture maybe in MultiTexture or CommonSurfaceShader
                        Array.forEach(shape._parentNodes, function (realShape) {
                            realShape._dirty.texture = true;
                        });
                    }
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