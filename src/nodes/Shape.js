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

/* ### X3DAppearanceNode ### */
x3dom.registerNodeType(
    "X3DAppearanceNode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DAppearanceNode.superClass.call(this, ctx);
        }
    )
);

/* ### Appearance ### */
x3dom.registerNodeType(
    "Appearance",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DAppearanceNode,
        function (ctx) {
            x3dom.nodeTypes.Appearance.superClass.call(this, ctx);

            this.addField_SFNode('material', x3dom.nodeTypes.X3DMaterialNode);
            this.addField_SFNode('texture',  x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('textureTransform', x3dom.nodeTypes.X3DTextureTransformNode);
            this.addField_MFNode('shaders', x3dom.nodeTypes.X3DShaderNode);

            // shortcut to shader program
            this._shader = null;
        },
        {
            nodeChanged: function() {
                if (!this._cf.material.node) {
                    this.addChild(x3dom.nodeTypes.Material.defaultNode());
                }

                if (this._cf.shaders.nodes.length) {
                    this._shader = this._cf.shaders.nodes[0];
                }
            },

            texTransformMatrix: function() {
                if (this._cf.textureTransform.node === null) {
                    return x3dom.fields.SFMatrix4f.identity();
                }
                else {
                    return this._cf.textureTransform.node.texTransformMatrix();
                }
            }
        }
    )
);

x3dom.nodeTypes.Appearance.defaultNode = function() {
    if (!x3dom.nodeTypes.Appearance._defaultNode) {
        x3dom.nodeTypes.Appearance._defaultNode = new x3dom.nodeTypes.Appearance();
        x3dom.nodeTypes.Appearance._defaultNode.nodeChanged();
    }
    return x3dom.nodeTypes.Appearance._defaultNode;
};

/* ### X3DAppearanceChildNode ### */
x3dom.registerNodeType(
    "X3DAppearanceChildNode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DAppearanceChildNode.superClass.call(this, ctx);
        }
    )
);

/* ### X3DMaterialNode ### */
x3dom.registerNodeType(
    "X3DMaterialNode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DMaterialNode.superClass.call(this, ctx);
        }
    )
);

/* ### Material ### */
x3dom.registerNodeType(
    "Material",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DMaterialNode,
        function (ctx) {
            x3dom.nodeTypes.Material.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'ambientIntensity', 0.2);
            this.addField_SFColor(ctx, 'diffuseColor', 0.8, 0.8, 0.8);
            this.addField_SFColor(ctx, 'emissiveColor', 0, 0, 0);
            this.addField_SFFloat(ctx, 'shininess', 0.2);
            this.addField_SFColor(ctx, 'specularColor', 0, 0, 0);
            this.addField_SFFloat(ctx, 'transparency', 0);
        },
		{

			fieldChanged: function(fieldName) {
				if (fieldName == "ambientIntensity" || fieldName == "diffuseColor" ||
					fieldName == "emissiveColor" || fieldName == "shininess" ||
					fieldName == "specularColor" || fieldName == "transparency")
                {
                    Array.forEach(this._parentNodes, function (app) {
                        Array.forEach(app._parentNodes, function (shape) {
                            shape._dirty.material = true;
                        });
                    });
                }
			}
		}
    )
);

x3dom.nodeTypes.Material.defaultNode = function() {
    if (!x3dom.nodeTypes.Material._defaultNode) {
        x3dom.nodeTypes.Material._defaultNode = new x3dom.nodeTypes.Material();
        x3dom.nodeTypes.Material._defaultNode.nodeChanged();
    }
    return x3dom.nodeTypes.Material._defaultNode;
};

/* ### X3DShapeNode ### */
x3dom.registerNodeType(
    "X3DShapeNode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DShapeNode.superClass.call(this, ctx);

            this.addField_SFNode('appearance', x3dom.nodeTypes.X3DAppearanceNode);
            this.addField_SFNode('geometry', x3dom.nodeTypes.X3DGeometryNode);

            this._objectID = 0;

            this._dirty = {
                positions: true,
                normals: true,
                texcoords: true,
                colors: true,
                indexes: true,
                texture: true,
				material: true,
				text: true,
				shader: true
            };
        },
        {
            collectDrawableObjects: function (transform, out) {
                // TODO: culling etc
                if (out !== null)
                {
                    out.push( [transform, this] );
                }
            },

            getVolume: function(min, max, invalidate) {
				if (this._cf.geometry.node) {
					return this._cf.geometry.node.getVolume(min, max, invalidate);
				}
				else {
					return false;
				}
            },

            getCenter: function() {
				if (this._cf.geometry.node) {
					return this._cf.geometry.node.getCenter();
				}
				else {
					return new x3dom.fields.SFVec3f(0,0,0);
				}
            },

            doIntersect: function(line) {
                return this._cf.geometry.node.doIntersect(line);
            },

            isSolid: function() {
                return this._cf.geometry.node._vf.solid;
            },

            isCCW: function() {
                return this._cf.geometry.node._vf.ccw;
            }
        }
    )
);

/* ### Shape ### */
x3dom.registerNodeType(
    "Shape",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DShapeNode,
        function (ctx) {
            x3dom.nodeTypes.Shape.superClass.call(this, ctx);
        },
        {
            nodeChanged: function () {
                if (!this._cf.appearance.node) {
                    this.addChild(x3dom.nodeTypes.Appearance.defaultNode());
                }
                if (!this._cf.geometry.node) {
                    x3dom.debug.logError("No geometry given in Shape/" + this._DEF);
                }
                else if (!this._objectID && this._cf.geometry.node._pickable) {
                    this._objectID = ++x3dom.nodeTypes.Shape.objectID;
                    x3dom.nodeTypes.Shape.idMap.nodeID[this._objectID] = this;
                }
            },

            // TODO: what if complete subtree is removed at once?
            parentRemoved: function(parent)
            {
                if (this._parentNodes.length === 0 && this._webgl)
                {
                    var doc = this.findX3DDoc();
                    var gl = doc.ctx.ctx3d;
                    var sp = this._webgl.shader;

                    for (var cnt=0; this._webgl.texture !== undefined &&
                                    cnt < this._webgl.texture.length; cnt++)
                    {
                        if (this._webgl.texture[cnt])
                        {
                            gl.deleteTexture(this._webgl.texture[cnt]);
                        }
                    }

                    for (var q=0; q<this._webgl.positions.length; q++)
                    {
                        if (sp.position !== undefined)
                        {
                            gl.deleteBuffer(this._webgl.buffers[5*q+1]);
                            gl.deleteBuffer(this._webgl.buffers[5*q+0]);
                        }

                        if (sp.normal !== undefined)
                        {
                            gl.deleteBuffer(this._webgl.buffers[5*q+2]);
                        }

                        if (sp.texcoord !== undefined)
                        {
                            gl.deleteBuffer(this._webgl.buffers[5*q+3]);
                        }

                        if (sp.color !== undefined)
                        {
                            gl.deleteBuffer(this._webgl.buffers[5*q+4]);
                        }
                    }

                    for (var df=0; df<this._webgl.dynamicFields.length; df++)
                    {
                        var attrib = this._webgl.dynamicFields[df];

                        if (sp[attrib.name] !== undefined)
                        {
                            gl.deleteBuffer(attrib.buf);
                        }
                    }

                    this._webgl = null;
                }
            }
        }
    )
);

/** Static class ID counter (needed for picking) */
x3dom.nodeTypes.Shape.objectID = 0;

/** Map for Shape node IDs (needed for picking) */
x3dom.nodeTypes.Shape.idMap = {
    nodeID: {},
    remove: function(obj) {
        for (var prop in this.nodeID) {
            if (this.nodeID.hasOwnProperty(prop)) {
                var val = this.nodeID[prop];
                if (val._objectID  && obj._objectID &&
                    val._objectID === obj._objectID)
                {
                    delete this.nodeID[prop];
                    x3dom.debug.logInfo("Unreg " + val._objectID);
                    // FIXME; handle node removal to unreg from map,
                    // and put free'd ID back to ID pool for reuse
                }
            }
        }
    }
};
