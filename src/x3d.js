/*!
* x3dom javascript library 0.1
* http://x3dom.org/
*
* Copyright (c) 2009 Peter Eschler, Johannes Behr, Yvonne Jung
*     based on code originally provided by Philip Taylor:
*     http://philip.html5.org
* Dual licensed under the MIT and GPL licenses.
* 
*/

// x3dom.x3dNS = 'http://www.web3d.org/specifications/x3d-namespace'; // non-standard, but sort of supported by Xj3D

// the x3dom.nodes namespace
// x3dom.nodes = {};

/** @namespace the x3dom.nodeTypes namespace. */
x3dom.nodeTypes = {};

/** @namespace the x3dom.nodeTypesLC namespace. Stores nodetypes in lowercase */
x3dom.nodeTypesLC = {};

/** @namespace the x3dom.components namespace. */
x3dom.components = {};

/** Registers the node defined by @p nodeDef.

    The node is registered with the given @p nodeTypeName and @p componentName.
    
    @param nodeTypeName the name of the nodetype (e.g. Material, Shape, ...)
    @param componentName the name of the component the nodetype belongs to
    @param nodeDef the definition of the nodetype
 */
x3dom.registerNodeType = function(nodeTypeName, componentName, nodeDef) {
    x3dom.debug.logInfo("Registering nodetype [" + nodeTypeName + "] in component [" + componentName + "]");
    if (x3dom.components[componentName] === undefined) {
        x3dom.debug.logInfo("Adding new component [" + componentName + "]");
        x3dom.components[componentName] = {};
        x3dom.components[componentName][nodeTypeName] = nodeDef;
        x3dom.nodeTypes[nodeTypeName] = nodeDef;
        x3dom.nodeTypesLC[nodeTypeName.toLowerCase()] = nodeDef;
    }
    else {
        x3dom.debug.logInfo("Using component [" + componentName + "]");
        x3dom.components[componentName][nodeTypeName] = nodeDef;
        x3dom.nodeTypes[nodeTypeName] = nodeDef;
        x3dom.nodeTypesLC[nodeTypeName.toLowerCase()] = nodeDef;
    }
};


/** Checks whether the given @p node is an X3D element.
	@return true, if the @p node is an X3D element
			false, if not
 */
x3dom.parsingInline = false;   //fixme; but Inline doesn't have NS...

// x3dom.isX3DElement = function(node) {
//     return (node.nodeType === Node.ELEMENT_NODE &&
//         (node.namespaceURI == x3dom.x3dNS || x3dom.parsingInline == true));
// };

x3dom.isX3DElement = function(node) {
    // x3dom.debug.logInfo("node=" + node + "node.nodeType=" + node.nodeType + ", node.localName=" + node.localName + ", ");
    return (node.nodeType === Node.ELEMENT_NODE && node.localName &&
        (x3dom.nodeTypes[node.localName] || x3dom.nodeTypesLC[node.localName.toLowerCase()] || node.localName.toLowerCase() === "x3d" || node.localName.toLowerCase() === "scene"  || node.localName.toLowerCase() === "route" || x3dom.parsingInline === true));
};


/** Utility function for defining a new class.

	@param parent the parent class of the new class
	@param ctor the constructor of the new class
	@param methods an object literal containing the methods of the new class
	@return the constructor function of the new class
  */
function defineClass(parent, ctor, methods) {
    if (parent) {
        function inheritance() {}
        inheritance.prototype = parent.prototype;
        ctor.prototype = new inheritance();
        ctor.prototype.constructor = ctor;
        ctor.superClass = parent;
    }
    if (methods) {
        for (var m in methods) {
            ctor.prototype[m] = methods[m];
        }
    }
    return ctor;
}

x3dom.isa = function(object, clazz) {
    if (object.constructor == clazz) {
        return true;
    }

    function f(c) {
        if (c == clazz) {
            return true;
        }
        if (c.prototype && c.prototype.constructor && c.prototype.constructor.superClass) {
            return f(c.prototype.constructor.superClass);
        }
        return false;
    }
    return f(object.constructor.superClass);
};

// X3D doesn't seem to define this decoding, so do something vaguely sensible instead...
function MFString_parse(str) {
    // TODO: ignore leading whitespace?
    if (str[0] == '"') {
        var re = /"((?:[^\\"]|\\\\|\\")*)"/g;
        var m;
        var ret = [];
        while ((m = re.exec(str))) {
            ret.push(m[1].replace(/\\([\\"])/, "$1"));
        }
        return ret;
    } else {
        return [str];
    }
};

/**** x3dom.nodeTypes.X3DNode ****/

// x3dom.nodeTypes.X3DNode = defineClass(null,
x3dom.registerNodeType("X3DNode", "base", defineClass(null,
    function (ctx) {
        if (ctx.xmlNode.hasAttribute('DEF')) {
            this._DEF = ctx.xmlNode.getAttribute('DEF');
			ctx.defMap[this._DEF] = this;
		} else {
			if (ctx.xmlNode.hasAttribute('id')) {
				this._DEF = ctx.xmlNode.getAttribute('id');
				ctx.defMap[this._DEF] = this;
			}
		}
        this._typeName = ctx.xmlNode.localName;
		this._xmlNode = ctx.xmlNode;	// backlink to DOM tree
		
		// holds all value fields (e.g. SFFloat, MFVec3f, ...)
		this._vf = {};
		// holds all child fields ( SFNode and MFNode )
		this._cf = {};
		
        this._fieldWatchers = {};
        this._parentNodes = [];

		// FIXME; should be removed and handled by _cf methods
        this._childNodes = [];
    },
    {
        _getCurrentTransform: function () {
            if (this._parentNodes.length >= 1) {
                return this._transformMatrix(this._parentNodes[0]._getCurrentTransform());
            }
            else {
                return x3dom.fields.SFMatrix4f.identity();
            }
        },

        _transformMatrix: function (transform) {
            return transform;
        },
		
		_getVolume: function (min, max, invalidate) 
        {
            var valid = false;
			for (var i=0; i<this._childNodes.length; i++)
			{
				if (this._childNodes[i])
				{
                    var childMin = new x3dom.fields.SFVec3f(
                            Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
                    var childMax = new x3dom.fields.SFVec3f(
                            Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
					
					valid = this._childNodes[i]._getVolume(
                                    childMin, childMax, invalidate) || valid;
					
                    if (valid)
                    {
                        if (min.x > childMin.x) { min.x = childMin.x; }
                        if (min.y > childMin.y) { min.y = childMin.y; }
                        if (min.z > childMin.z) { min.z = childMin.z; }
                            
                        if (max.x < childMax.x) { max.x = childMax.x; }
                        if (max.y < childMax.y) { max.y = childMax.y; }
                        if (max.z < childMax.z) { max.z = childMax.z; }
                    }
				}
			}
            return valid;
		},

        _find: function (type) {
            for (var i=0; i<this._childNodes.length; i++) {
                if (this._childNodes[i]) {
                    if (this._childNodes[i].constructor == type) {
                        return this._childNodes[i];
                    }
                    var c = this._childNodes[i]._find(type);
                    if (c) {
                        return c;
                    }
                }
            }
            return null;
        },

        _findAll: function (type) {
            var found = [];
            for (var i=0; i<this._childNodes.length; i++) {
                if (this._childNodes[i]) {
                    if (this._childNodes[i].constructor == type) {
                        found.push(this._childNodes[i]);
                    }
                    found = found.concat(this._childNodes[i]._findAll(type)); // TODO: this has non-linear performance
                }
            }
            return found;
        },

        /* Collects array of [transform matrix, node] for all objects that should be drawn. */
        _collectDrawableObjects: function (transform, out) {
            // TODO: culling etc
            for (var i=0; i<this._childNodes.length; i++) {
                if (this._childNodes[i]) {
                    var childTransform = this._childNodes[i]._transformMatrix(transform);
                    this._childNodes[i]._collectDrawableObjects(childTransform, out);
                }
            }
        },
        
        _doIntersect: function(line) {
            for (var i=0; i<this._childNodes.length; i++) {
                if (this._childNodes[i]) {
                    if (this._childNodes[i]._doIntersect(line)) {
                        return true;
                    }
                }
            }
            return false;
        },

		// FIXME; replace by context lookup
        _getNodeByDEF: function (def) {
            // TODO: cache this so it's not so stupidly inefficient
            if (this._DEF == def) {
                return this;
            }
            for (var i=0; i<this._childNodes.length; i++) {
                if (this._childNodes[i]) {
                    var found = this._childNodes[i]._getNodeByDEF(def);
                    if (found) {
                        return found;
                    }
                }
            }
            return null;
        },

        _postMessage: function (field, msg) {
            // TODO: timestamps and stuff
            //log_frame(this+' postmessage '+field+' - '+msg);
            var listeners = this._fieldWatchers[field];
            var thisp = this;
            if (listeners) {
                Array.forEach(listeners, function (l) { l.call(thisp, msg); });
            }
        },

        // method for handling field updates
        _updateField: function (field, msg) {
            var fieldName = "_" +  field;
			
			var f = this[fieldName];
			
			if (f === undefined) {
				this[fieldName] = {};
				f = this[fieldName];
			}
			
            if (f !== null) {
                try {
                    this[fieldName].setValueByStr(msg);
                }
                catch (exc) {
                    x3dom.debug.logInfo("_updateField: setValueByStr() NYI for " + typeof(f));
                }
                
                // TODO: eval fieldChanged for all nodes!
                this._fieldChanged(fieldName);
            }
        },

        _setupRoute: function (fromField, toNode, toField) {
            var pos = toField.indexOf("set");
            if (pos == 0) {
                toField = toField.substr(3,toField.length-1);
            }
            
            if (! this._fieldWatchers[fromField]) {
                this._fieldWatchers[fromField] = [];
            }
            this._fieldWatchers[fromField].push(function (msg) { toNode._postMessage(toField, msg); });

            if (! toNode._fieldWatchers[toField]) {
                toNode._fieldWatchers[toField] = [];
            }
            toNode._fieldWatchers[toField].push(function (msg) {
				// uhh, this "_"-stuff is really inconsistent!
				if (toNode[toField] === undefined) {
					toNode["_"+toField] = msg;
                }
				else {
					toNode[toField] = msg;
                }
                
                // TODO: eval fieldChanged for all nodes!
                toNode._fieldChanged(toField);
			});
        },
        
        _fieldChanged: function (fieldName) {
            // to be overwritten by concrete classes
        },
        
		_attribute_SFInt32: function (ctx, name, n) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? 
                parseInt(ctx.xmlNode.getAttribute(name)) : n;
            this['_'+name].setValueByStr = function(str) {
                this['_'+name] = parseInt(str);
            };
        },
        _attribute_SFFloat: function (ctx, name, n) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? 
                +ctx.xmlNode.getAttribute(name) : n;
            this['_'+name].setValueByStr = function(str) {
                this['_'+name] = +str;
            };
        },
        _attribute_SFTime: function (ctx, name, n) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? 
                +ctx.xmlNode.getAttribute(name) : n;
            this['_'+name].setValueByStr = function(str) {
                this['_'+name] = +str;
            };
        },
        _attribute_SFBool: function (ctx, name, n) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? 
                ctx.xmlNode.getAttribute(name).toLowerCase() == "true" : n;
            this['_'+name].setValueByStr = function(str) {
                this['_'+name] = (str.toLowerCase() == "true");
            };
        },
        _attribute_SFString: function (ctx, name, n) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? 
                ctx.xmlNode.getAttribute(name) : n;
            this['_'+name].setValueByStr = function(str) {
                this['_'+name] = str;
            };
        },
        _attribute_SFColor: function (ctx, name, r, g, b) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.SFColor.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.SFColor(r, g, b);
        },
        _attribute_SFVec2f: function (ctx, name, x, y) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.SFVec2f.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.SFVec2f(x, y);
        },
        _attribute_SFVec3f: function (ctx, name, x, y, z) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.SFVec3f.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.SFVec3f(x, y, z);
        },
        _attribute_SFRotation: function (ctx, name, x, y, z, a) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.Quaternion.parseAxisAngle(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.Quaternion(x, y, z, a);
        },
        _attribute_SFMatrix4f: function (ctx, name, _00, _01, _02, _03, 
                                                    _10, _11, _12, _13, 
                                                    _20, _21, _22, _23, 
                                                    _30, _31, _32, _33) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.SFMatrix4f.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.SFMatrix4f(_00, _01, _02, _03, 
                                            _10, _11, _12, _13, 
                                            _20, _21, _22, _23, 
                                            _30, _31, _32, _33);
        },
        
        _attribute_MFString: function (ctx, name, def) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? 
                MFString_parse(ctx.xmlNode.getAttribute(name)) : def;
            this['_'+name].setValueByStr = function(str) {
                this['_'+name] = MFString_parse(str);
            };
        },
        _attribute_MFInt32: function (ctx, name, def) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.MFInt32.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.MFInt32(def);
        },
        _attribute_MFFloat: function (ctx, name, def) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.MFFloat.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.MFFloat(def);
        },
        _attribute_MFColor: function (ctx, name, def) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.MFColor.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.MFColor(def);
        },
        _attribute_MFVec2f: function (ctx, name, def) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.MFVec2f.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.MFVec2f(def);
        },
        _attribute_MFVec3f: function (ctx, name, def) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.MFVec3f.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.MFVec3f(def);
        },
        _attribute_MFRotation: function (ctx, name, def) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.MFRotation.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.MFRotation(def);
        },
		_attribute_SFNode: function (name, type) {
			this._cf[name] = new x3dom.fields.SFNode (type);
		},
		_attribute_MFNode: function (name, type) {
			this._cf[name] = new x3dom.fields.MFNode (type);
		}
    }
));

// TODO: X3DProtoInstance

/**** x3dom.X3DAppearanceNode ****/

//x3dom.X3DAppearanceNode = defineClass(x3dom.nodeTypes.X3DNode,
x3dom.registerNodeType(
    "X3DAppearanceNode", 
    "base", 
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DAppearanceNode.superClass.call(this, ctx);
        }
    )
);

// x3dom.Appearance = defineClass(x3dom.X3DAppearanceNode,
x3dom.registerNodeType(
    "Appearance", 
    "Shape", 
    /** @lends x3dom.nodeTypes.Appearance */
    defineClass(x3dom.nodeTypes.X3DAppearanceNode,        
        /** @constructs */
        function (ctx) {
            x3dom.nodeTypes.Appearance.superClass.call(this, ctx);
    
            var material = null;
			var texture = null;
            var textureTransform = null;
            var xmlNode = ctx.xmlNode;
            
            Array.forEach(ctx.xmlNode.childNodes, function (node) {
                if (x3dom.isX3DElement(node)) {
                    var child = ctx.setupNodePrototypes(node, ctx);
                    if (child) {
                        if (x3dom.isa(child, x3dom.nodeTypes.X3DMaterialNode)) {
                            //ctx.assert(! material, 'has <= 1 material node');
                            material = child;
                        }
						else if (x3dom.isa(child, x3dom.nodeTypes.X3DTextureNode)) {
							texture = child;
						}
                        else if (x3dom.isa(child, x3dom.nodeTypes.X3DTextureTransformNode)) {
                            textureTransform = child;
                        }
						else {
                            ctx.log('Unrecognised x3dom.nodeTypes.Appearance child node type '+node.localName);
                        }
                    }
                }
            });
			
			if (!material)
			{
                var mat = document.createElement('Material');
                xmlNode.appendChild(mat);
                ctx.xmlNode = mat;
				var nodeType = x3dom.nodeTypes["Material"];
				material = new nodeType(ctx);
			}
			
            this._material = material;
			this._texture = texture;
            this._textureTransform = textureTransform;
        },
		{
            transformMatrix: function() {
                if (this._textureTransform === null) {
                    return x3dom.fields.SFMatrix4f.identity();
                }
                else {
                    return this._textureTransform.transformMatrix();
                }
            },
            
			_getNodeByDEF: function (def) {
				if (this._DEF == def) {
					return this;
				}

				var found = null;
				
				if (this._material !== null) {
					found = this._material._getNodeByDEF(def);
                    if (found) { return found; }
				}
				
				if (this._texture !== null) {
					found = this._texture._getNodeByDEF(def);
                    if (found) { return found; }
				}
                
				if (this._textureTransform !== null) {
					found = this._textureTransform._getNodeByDEF(def);
                    if (found) { return found; }
				}
				
				return found;
			},

			_find: function (type) {
				var c = null;
				
				if (this._material !== null) {
					if (this._material.constructor == type) {
						return this._material;
                    }
					c = this._material._find(type);
					if (c) { return c; }
				}
				
				if (this._texture !== null) {
					if (this._texture.constructor == type) {
						return this._texture;
                    }
					c = this._texture._find(type);
					if (c) { return c; }
				}
                
				if (this._textureTransform !== null) {
					if (this._textureTransform.constructor == type) {
						return this._textureTransform;
                    }
					c = this._textureTransform._find(type);
					if (c) { return c; }
				}
				
				return c;
			}
		}
    )
);

/**** x3dom.X3DAppearanceChildNode ****/

// x3dom.X3DAppearanceChildNode = defineClass(x3dom.nodeTypes.X3DNode,
x3dom.registerNodeType(
    "X3DAppearanceChildNode", 
    "base", 
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DAppearanceChildNode.superClass.call(this, ctx);
        }
    )
);

// TODO: FillProperties
// TODO: LineProperties

//x3dom.X3DMaterialNode = defineClass(x3dom.X3DAppearanceChildNode,
x3dom.registerNodeType(
    "X3DMaterialNode",
    "base",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DMaterialNode.superClass.call(this, ctx);
        }
    )
);

// x3dom.Material = defineClass(x3dom.X3DMaterialNode,
x3dom.registerNodeType(
    "Material",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DMaterialNode,
        function (ctx) {
            x3dom.nodeTypes.Material.superClass.call(this, ctx);
    
            this._attribute_SFFloat(ctx, 'ambientIntensity', 0.2);
            this._attribute_SFColor(ctx, 'diffuseColor', 0.8, 0.8, 0.8);
            this._attribute_SFColor(ctx, 'emissiveColor', 0, 0, 0);
            this._attribute_SFFloat(ctx, 'shininess', 0.2);
            this._attribute_SFColor(ctx, 'specularColor', 0, 0, 0);
            this._attribute_SFFloat(ctx, 'transparency', 0);
        }
    )
);

x3dom.registerNodeType(
    "X3DTextureTransformNode",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DTextureTransformNode.superClass.call(this, ctx);
        }
    )
);

x3dom.registerNodeType(
    "TextureTransform",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureTransformNode,
        function (ctx) {
            x3dom.nodeTypes.TextureTransform.superClass.call(this, ctx);
			
			this._attribute_SFVec2f(ctx, 'center', 0, 0);
            this._attribute_SFFloat(ctx, 'rotation', 0);
            this._attribute_SFVec2f(ctx, 'scale', 1, 1);
            this._attribute_SFVec2f(ctx, 'translation', 0, 0);
            
            //Tc' = -C * S * R * C * T * Tc
            var negCenter = new x3dom.fields.SFVec3f(-this._center.x, -this._center.y, 1);
            var posCenter = new x3dom.fields.SFVec3f(this._center.x, this._center.y, 0);
            var trans3 = new x3dom.fields.SFVec3f(this._translation.x, this._translation.y, 0);
            var scale3 = new x3dom.fields.SFVec3f(this._scale.x, this._scale.y, 0);
            
            this._trafo = x3dom.fields.SFMatrix4f.translation(negCenter).
                     mult(x3dom.fields.SFMatrix4f.scale(scale3)).
                     mult(x3dom.fields.SFMatrix4f.rotationZ(this._rotation)).
                     mult(x3dom.fields.SFMatrix4f.translation(posCenter)).
                     mult(x3dom.fields.SFMatrix4f.translation(trans3));
        },
        {
            _fieldChanged: function (fieldName) {
                var negCenter = new x3dom.fields.SFVec3f(-this._center.x, -this._center.y, 1);
                var posCenter = new x3dom.fields.SFVec3f(this._center.x, this._center.y, 0);
                var trans3 = new x3dom.fields.SFVec3f(this._translation.x, this._translation.y, 0);
                var scale3 = new x3dom.fields.SFVec3f(this._scale.x, this._scale.y, 0);
                
                this._trafo = x3dom.fields.SFMatrix4f.translation(negCenter).
                         mult(x3dom.fields.SFMatrix4f.scale(scale3)).
                         mult(x3dom.fields.SFMatrix4f.rotationZ(this._rotation)).
                         mult(x3dom.fields.SFMatrix4f.translation(posCenter)).
                         mult(x3dom.fields.SFMatrix4f.translation(trans3));
            },
            
            transformMatrix: function() {
                return this._trafo;
            }
        }
    )
);

x3dom.registerNodeType(
    "X3DTextureNode",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DTextureNode.superClass.call(this, ctx);
        }
    )
);

x3dom.registerNodeType(
    "ImageTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
        function (ctx) {
            x3dom.nodeTypes.ImageTexture.superClass.call(this, ctx);
			
            this._attribute_MFString(ctx, 'url', []);
            this._attribute_SFBool(ctx, 'repeatS', true);
            this._attribute_SFBool(ctx, 'repeatT', true);
        }
    )
);



/** @class x3dom.Mesh
*/
x3dom.Mesh = function(parent) 
{
    this._parent = parent;
	this._min = new x3dom.fields.SFVec3f(0,0,0);
	this._max = new x3dom.fields.SFVec3f(0,0,0);
	this._invalidate = true;
};

x3dom.Mesh.prototype._positions = [];
x3dom.Mesh.prototype._normals   = [];
x3dom.Mesh.prototype._texCoords = [];
x3dom.Mesh.prototype._colors    = [];
x3dom.Mesh.prototype._indices   = [];

x3dom.Mesh.prototype._lit = true;
x3dom.Mesh.prototype._min = {};
x3dom.Mesh.prototype._max = {};
x3dom.Mesh.prototype._invalidate = true;

x3dom.Mesh.prototype.getBBox = function(min, max, invalidate)
{
	if (this._invalidate === true && invalidate === true)	//need both?
	{
		var coords = this._positions;
		var n = coords.length;
		
		if (n > 3)
		{
			this._min = new x3dom.fields.SFVec3f(coords[0],coords[1],coords[2]);
			this._max = new x3dom.fields.SFVec3f(coords[0],coords[1],coords[2]);
		}
		else
		{
			this._min = new x3dom.fields.SFVec3f(0,0,0);
			this._max = new x3dom.fields.SFVec3f(0,0,0);
		}
		
		for (var i=3; i<n; i+=3)
		{
			if (this._min.x > coords[i+0]) { this._min.x = coords[i+0]; }
			if (this._min.y > coords[i+1]) { this._min.y = coords[i+1]; }
			if (this._min.z > coords[i+2]) { this._min.z = coords[i+2]; }
			
			if (this._max.x < coords[i+0]) { this._max.x = coords[i+0]; }
			if (this._max.y < coords[i+1]) { this._max.y = coords[i+1]; }
			if (this._max.z < coords[i+2]) { this._max.z = coords[i+2]; }
		}
		
		this._invalidate = false;
	}
	
	min.x = this._min.x;
	min.y = this._min.y;
	min.z = this._min.z;
	
	max.x = this._max.x;
	max.y = this._max.y;
	max.z = this._max.z;
};

x3dom.Mesh.prototype.getCenter = function() 
{
	var min = new x3dom.fields.SFVec3f(0,0,0);
	var max = new x3dom.fields.SFVec3f(0,0,0);
	
	this.getBBox(min, max, true);
	
	var center = min.add(max).multiply(0.5);
	//x3dom.debug.logInfo("getCenter: " + min + " | " + max + " --> " + center);
	
	return center;
};

x3dom.Mesh.prototype.doIntersect = function(line)
{
	var min = new x3dom.fields.SFVec3f(0,0,0);
	var max = new x3dom.fields.SFVec3f(0,0,0);
	
	this.getBBox(min, max, true);
    
    var isect = line.intersect(min, max);
    
    //TODO: check for _nearest_ hit object and iterate over all faces!
    line.hit = isect;
    
    if (isect)
    {
        x3dom.debug.logInfo("Hit \"" + this._parent._typeName + "/" + this._parent._DEF + "\"");
        
        line.hitObject = this._parent;
        line.hitPoint = line.pos.add(line.dir.multiply(line.enter));
    }
    
    return isect;
};

x3dom.Mesh.prototype.calcNormals = function(creaseAngle, ccw)
{
	//fixme; as first shot taken from gfx
    var i = 0;
	var coords = this._positions;
	var idxs = this._indices;
	
	var vertNormals = [];
	var vertFaceNormals = [];

    var n = null;
	
	for (i = 0; i < coords.length/3; ++i) {
		vertFaceNormals[i] = [];
    }

	for (i = 0; i < idxs.length; i += 3) {
		var a = new x3dom.fields.SFVec3f(
				coords[idxs[i  ]*3], coords[idxs[i  ]*3+1], coords[idxs[i  ]*3+2]).
			subtract(new x3dom.fields.SFVec3f(
				coords[idxs[i+1]*3], coords[idxs[i+1]*3+1], coords[idxs[i+1]*3+2]));
		var b = new x3dom.fields.SFVec3f(
				coords[idxs[i+1]*3], coords[idxs[i+1]*3+1], coords[idxs[i+1]*3+2]).
			subtract(new x3dom.fields.SFVec3f(
				coords[idxs[i+2]*3], coords[idxs[i+2]*3+1], coords[idxs[i+2]*3+2]));
		
		n = a.cross(b).normalize();
		vertFaceNormals[idxs[i  ]].push(n);
		vertFaceNormals[idxs[i+1]].push(n);
		vertFaceNormals[idxs[i+2]].push(n);
	}
	
    //TODO: creaseAngle
	for (i = 0; i < coords.length; i += 3) {
		n = new x3dom.fields.SFVec3f(0, 0, 0);
		for (var j = 0; j < vertFaceNormals[i/3].length; ++j) {
			n = n.add(vertFaceNormals[i/3][j]);
		}

		n = n.normalize();
        if (!ccw) {
            n = n.negate();
        }
        
		vertNormals[i  ] = n.x;
		vertNormals[i+1] = n.y;
		vertNormals[i+2] = n.z;
	}
	
	this._normals = vertNormals;
};

x3dom.Mesh.prototype.calcTexCoords = function()
{
	//TODO
};

x3dom.Mesh.prototype.remapData = function()
{
	//x3dom.debug.logInfo("Indices:   "+this._indices);
	//x3dom.debug.logInfo("Positions: "+this._positions);
};


/**** x3dom.X3DGeometryNode ****/

// x3dom.X3DGeometryNode = defineClass(x3dom.nodeTypes.X3DNode,
x3dom.registerNodeType(
    "X3DGeometryNode",
    "base",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DGeometryNode.superClass.call(this, ctx);
			
			this._attribute_SFBool(ctx, 'solid', true);
			
			this._mesh = new x3dom.Mesh(this);
        },
		{
			_getVolume: function(min, max, invalidate) {
				this._mesh.getBBox(min, max, invalidate);
                return true;
			},
			
			_getCenter: function() {
				return this._mesh.getCenter();
			},
            
            _doIntersect: function(line) {
                var isect = this._mesh.doIntersect(line);
				
				if (isect && this._xmlNode !== null) {
					if (this._xmlNode.hasAttribute('onclick'))
					{
						var funcStr = this._xmlNode.getAttribute('onclick');
						var func = new Function('hitPnt', funcStr);
						func.call(this, line.hitPoint);
					}
				}
				
                return isect;
            }
		}
    )
);


// TODO: Arc2D
// TODO: ArcClose2D
// TODO: Circle2D
// TODO: Disk2D
// TODO: ElevationGrid
// TODO: Extrusion
// TODO: GeoElevationGrid
// TODO: IndexedLineSet
// TODO: LineSet
// TODO: Polyline2D
// TODO: Polypoint2D
// TODO: Rectangle2D
// TODO: TriangleSet2D
// TODO: IndexedTriangleFanSet
// TODO: IndexedTriangleSet
// TODO: IndexedTriangleStripSet
// TODO: TriangleFanSet
// TODO: TriangleSet
// TODO: TriangleStripSet
// TODO: X3DParametricGeometryNode
// TODO: ...


//x3dom.Box = defineClass(x3dom.X3DGeometryNode,
x3dom.registerNodeType(
    "Box",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Box.superClass.call(this, ctx);
    
            var sx, sy, sz;
            if (ctx.xmlNode.hasAttribute('size')) {
                var size = x3dom.fields.SFVec3f.parse(ctx.xmlNode.getAttribute('size'));
                sx = size.x;
                sy = size.y;
                sz = size.z;
            } else {
                sx = sy = sz = 2;
            }
    
            sx /= 2; sy /= 2; sz /= 2;
			
            this._mesh._positions = [
                -sx,-sy,-sz,  -sx, sy,-sz,   sx, sy,-sz,   sx,-sy,-sz, //hinten 0,0,-1
                -sx,-sy, sz,  -sx, sy, sz,   sx, sy, sz,   sx,-sy, sz, //vorne 0,0,1
                -sx,-sy,-sz,  -sx,-sy, sz,  -sx, sy, sz,  -sx, sy,-sz, //links -1,0,0
                 sx,-sy,-sz,   sx,-sy, sz,   sx, sy, sz,   sx, sy,-sz, //rechts 1,0,0
                -sx, sy,-sz,  -sx, sy, sz,   sx, sy, sz,   sx, sy,-sz, //oben 0,1,0
                -sx,-sy,-sz,  -sx,-sy, sz,   sx,-sy, sz,   sx,-sy,-sz  //unten 0,-1,0
            ];
			this._mesh._normals = [
                0,0,-1,  0,0,-1,   0,0,-1,   0,0,-1,
                0,0,1,  0,0,1,   0,0,1,   0,0,1,
                -1,0,0,  -1,0,0,  -1,0,0,  -1,0,0,
                1,0,0,   1,0,0,   1,0,0,   1,0,0,
                0,1,0,  0,1,0,   0,1,0,   0,1,0,
                0,-1,0,  0,-1,0,   0,-1,0,   0,-1,0
            ];
			this._mesh._texCoords = [
				1,0, 1,1, 0,1, 0,0, 
				0,0, 0,1, 1,1, 1,0, 
				0,0, 1,0, 1,1, 0,1, 
				1,0, 0,0, 0,1, 1,1, 
				0,1, 0,0, 1,0, 1,1, 
				0,0, 0,1, 1,1, 1,0
			];
            this._mesh._indices = [
                0,1,2, 2,3,0,
                4,7,5, 5,7,6,
                8,9,10, 10,11,8,
                12,14,13, 14,12,15,
                16,17,18, 18,19,16,
                20,22,21, 22,20,23
            ];
			this._mesh._invalidate = true;
        }
    )
);

// x3dom.Sphere = defineClass(x3dom.X3DGeometryNode,
x3dom.registerNodeType(
    "Sphere",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Sphere.superClass.call(this, ctx);
    
            var r = 1;
            if (ctx.xmlNode.hasAttribute('radius')) {
                r = +ctx.xmlNode.getAttribute('radius');
            }
            
            this._mesh._indices = [];
            this._mesh._positions = [];
            this._mesh._normals = [];
            this._mesh._texCoords = [];
            this._mesh._colors = [];
            
            var latNumber, longNumber;
            var latitudeBands = 24;
            var longitudeBands = 24;
            
            var theta, sinTheta, cosTheta;
            var phi, sinPhi, cosPhi;
            var x, y, z, u, v;
            
            for (latNumber = 0; latNumber <= latitudeBands; latNumber++)
            {
                theta = (latNumber * Math.PI) / latitudeBands;
                sinTheta = Math.sin(theta);
                cosTheta = Math.cos(theta);

                for (longNumber = 0; longNumber <= longitudeBands; longNumber++)
                {
                    phi = (longNumber * 2.0 * Math.PI) / longitudeBands;
                    sinPhi = Math.sin(phi);
                    cosPhi = Math.cos(phi);

                    x = -cosPhi * sinTheta;
                    y = -cosTheta;
                    z = -sinPhi * sinTheta;
                    
                    u = 0.25 - ((1.0 * longNumber) / longitudeBands);
                    v = latNumber / latitudeBands;
                    
                    this._mesh._positions.push(r * x);
                    this._mesh._positions.push(r * y);
                    this._mesh._positions.push(r * z);
                    this._mesh._normals.push(x);
                    this._mesh._normals.push(y);
                    this._mesh._normals.push(z);
                    this._mesh._texCoords.push(u);
                    this._mesh._texCoords.push(v);
                }
            }
            
            var first, second;
            
            for (latNumber = 0; latNumber < latitudeBands; latNumber++)
            {
                for (longNumber = 0; longNumber < longitudeBands; longNumber++)
                {
                    first = (latNumber * (longitudeBands + 1)) + longNumber;
                    second = first + longitudeBands + 1;
                    
                    this._mesh._indices.push(first);
                    this._mesh._indices.push(second);
                    this._mesh._indices.push(first + 1);

                    this._mesh._indices.push(second);
                    this._mesh._indices.push(second + 1);
                    this._mesh._indices.push(first + 1);
                }
            }
            
            this._mesh._invalidate = true;
        }
    )
);

x3dom.registerNodeType(
    "Torus",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Torus.superClass.call(this, ctx);
    
            var innerRadius = 0.5, outerRadius = 1.0;
			
            if (ctx.xmlNode.hasAttribute('innerRadius')) {
                innerRadius = +ctx.xmlNode.getAttribute('innerRadius');
            }
            if (ctx.xmlNode.hasAttribute('outerRadius')) {
                outerRadius = +ctx.xmlNode.getAttribute('outerRadius');
            }
			
			var rings = 24, sides = 24;
			var ringDelta = 2.0 * Math.PI / rings;
			var sideDelta = 2.0 * Math.PI / sides;
			var p = [], n = [], t = [], i = [];
            var a, b, theta, phi;

			for (a=0, theta=0; a <= rings; a++, theta+=ringDelta) 
			{
				var cosTheta = Math.cos(theta);
				var sinTheta = Math.sin(theta);

				for (b=0, phi=0; b<=sides; b++, phi+=sideDelta) 
				{
					var cosPhi = Math.cos(phi);
					var sinPhi = Math.sin(phi);
					var dist = outerRadius + innerRadius * cosPhi;

					n.push(cosTheta * cosPhi, -sinTheta * cosPhi, sinPhi);
					p.push(cosTheta * dist, -sinTheta * dist, innerRadius * sinPhi);
					t.push(-a / rings, b / sides);
				}
			}
			
			for (a=0; a<sides; a++) 
			{
				for (b=0; b<rings; b++)
				{
					i.push(b * (sides+1) + a);
					i.push(b * (sides+1) + a + 1);
					i.push((b + 1) * (sides+1) + a);
					
					i.push(b * (sides+1) + a + 1);
					i.push((b + 1) * (sides+1) + a + 1);
					i.push((b + 1) * (sides+1) + a);
				}
			}
			
            this._mesh._positions = p;
			this._mesh._normals = n;
			this._mesh._texCoords = t;
            this._mesh._indices = i;
			this._mesh._invalidate = true;
        }
    )
);

x3dom.registerNodeType(
    "Cone",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Cone.superClass.call(this, ctx);
    
            var bottomRadius = 1.0, height = 2.0;
			
            if (ctx.xmlNode.hasAttribute('bottomRadius')) {
                bottomRadius = +ctx.xmlNode.getAttribute('bottomRadius');
            }
            if (ctx.xmlNode.hasAttribute('height')) {
                height = +ctx.xmlNode.getAttribute('height');
            }
			
            var beta, x, z;
			var sides = 32;
			var delta = 2.0 * Math.PI / sides;
			var incl = bottomRadius / height;
			var nlen = 1.0 / Math.sqrt(1.0 + incl * incl);
			var p = [], n = [], t = [], i = [];
			
			for (var j=0, k=0; j<=sides; j++)
			{
				beta = j * delta;
				x = Math.sin(beta);
				z = -Math.cos(beta);         

				p.push(0, height/2, 0);
				n.push(x/nlen, incl/nlen, z/nlen);
				t.push(1.0 - j / sides, 1);

				p.push(x * bottomRadius, -height/2, z * bottomRadius);
				n.push(x/nlen, incl/nlen, z/nlen);
				t.push(1.0 - j / sides, 0);
				
				if (j > 0)
				{
					i.push(k + 0);
					i.push(k + 2);
					i.push(k + 1);
					
					i.push(k + 1);
					i.push(k + 2);
					i.push(k + 3);
					
					k += 2;
				}
			}
			
			if (bottomRadius > 0)
			{
				var base = p.length / 3;
				
				for (j=sides-1; j>=0; j--)
				{
					beta = j * delta;
					x = bottomRadius * Math.sin(beta);
					z = -bottomRadius * Math.cos(beta); 

					p.push(x, -height/2, z);
					n.push(0, -1, 0);
					t.push(x / bottomRadius / 2 + 0.5, z / bottomRadius / 2 + 0.5);
				}
				
				var h = base + 1;
				
				for (j=2; j<sides; j++) 
				{
					i.push(h);
					i.push(base);
					
					h = base + j;
					i.push(h);
				}
			}
			
			this._mesh._positions = p;
			this._mesh._normals = n;
			this._mesh._texCoords = t;
            this._mesh._indices = i;
			this._mesh._invalidate = true;
        }
    )
);

x3dom.registerNodeType(
    "Cylinder",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Cylinder.superClass.call(this, ctx);
    
            var radius = 1.0, height = 2.0;
			
            if (ctx.xmlNode.hasAttribute('radius')) {
                radius = +ctx.xmlNode.getAttribute('radius');
            }
            if (ctx.xmlNode.hasAttribute('height')) {
                height = +ctx.xmlNode.getAttribute('height');
			}

            var beta, x, z;
			var sides = 24;
			var delta = 2.0 * Math.PI / sides;
			var p = [], n = [], t = [], i = [];
			
			for (var j=0, k=0; j<=sides; j++)
			{
				beta = j * delta;
				x = Math.sin(beta);
				z = -Math.cos(beta);         

				p.push(x * radius, -height/2, z * radius);
				n.push(x, 0, z);
				t.push(1.0 - j / sides, 0);

				p.push(x * radius, height/2, z * radius);
				n.push(x, 0, z);
				t.push(1.0 - j / sides, 1);
				
				if (j > 0)
				{
					i.push(k + 0);
					i.push(k + 1);
					i.push(k + 2);
					
					i.push(k + 2);
					i.push(k + 1);
					i.push(k + 3);
					
					k += 2;
				}
			}
			
			if (radius > 0)
			{
				var base = p.length / 3;
				
				for (j=sides-1; j>=0; j--)
				{
					beta = j * delta;
					x = radius * Math.sin(beta);
					z = -radius * Math.cos(beta);  

					p.push(x, height/2, z);
					n.push(0, 1, 0);
					t.push(x / radius / 2 + 0.5, -z / radius / 2 + 0.5);
				}
				
				var h = base + 1;
				
				for (j=2; j<sides; j++) 
				{
					i.push(base);
					i.push(h);
					
					h = base + j;
					i.push(h);
				}
				
				base = p.length / 3;
				
				for (j=sides-1; j>=0; j--)
				{
					beta = j * delta;
					x = radius * Math.sin(beta);
					z = -radius * Math.cos(beta); 

					p.push(x, -height/2, z);
					n.push(0, -1, 0);
					t.push(x / radius / 2 + 0.5, z / radius / 2 + 0.5);
				}
				
				h = base + 1;
				
				for (j=2; j<sides; j++) 
				{
					i.push(h);
					i.push(base);
					
					h = base + j;
					i.push(h);
				}
			}
			
			this._mesh._positions = p;
			this._mesh._normals = n;
			this._mesh._texCoords = t;
            this._mesh._indices = i;
			this._mesh._invalidate = true;
        }
    )
);

x3dom.registerNodeType(
    "PointSet",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.PointSet.superClass.call(this, ctx);
            
            var coordNode = Array.filter(ctx.xmlNode.childNodes, 
                    function (n) { return (x3dom.isX3DElement(n) && n.localName.toLowerCase() == 'coordinate'); });
            ctx.assert(coordNode.length == 1);
            var positions = Array.map(coordNode[0].getAttribute('point').match(/([+\-0-9eE\.]+)/g), 
                    function (n) { return +n; });

            var colorNode = Array.filter(ctx.xmlNode.childNodes, 
                    function (n) { return (x3dom.isX3DElement(n) && n.localName.toLowerCase() == 'color'); });
            var colors = [];
            if (colorNode.length == 1) {
                colors = Array.map(colorNode[0].getAttribute('color').match(/([+\-0-9eE\.]+)/g), 
                    function (n) { return +n; });
                ctx.assert(positions.length == colors.length);
            }
            else {
                for (var i=0, n=positions.length; i<n; i++)
                    colors.push(1.0);
            }
            
            this._mesh._indices = [];
            this._mesh._positions = positions;
            this._mesh._colors = colors;
            this._mesh._normals = [];
            this._mesh._texCoords = [];
            this._mesh._lit = false;
            this._mesh._invalidate = true;
        }
    )
);


//x3dom.Text = defineClass(x3dom.X3DGeometryNode,
x3dom.registerNodeType(
    "Text",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Text.superClass.call(this, ctx);
    
            this._attribute_MFString(ctx, 'string', []);
    
            var style = null;
            Array.forEach(ctx.xmlNode.childNodes, function (node) {
                if (x3dom.isX3DElement(node)) {
                    var child = ctx.setupNodePrototypes(node, ctx);
                    if (child) {
                        if (x3dom.isa(child, x3dom.nodeTypes.X3DFontStyleNode)) {
                            ctx.assert(! style, 'has <= 1 fontStyle node');
                            style = child;
                        }
                        else {
                            ctx.log('Unrecognised x3dom.Text child node type '+node.localName);
                        }
                    }
                }
            });
            this._fontStyle = style;
            
            this._attribute_MFFloat(ctx, 'length', []);
            this._attribute_SFFloat(ctx, 'maxExtent', 0.0);
        }
    )
);


// x3dom.X3DComposedGeometryNode = defineClass(x3dom.X3DGeometryNode,
x3dom.registerNodeType(
    "X3DComposedGeometryNode",
    "base",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.X3DComposedGeometryNode.superClass.call(this, ctx);
        }
    )
);


//x3dom.IndexedFaceSet = defineClass(x3dom.X3DComposedGeometryNode,
x3dom.registerNodeType(
    "IndexedFaceSet",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DComposedGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.IndexedFaceSet.superClass.call(this, ctx);
            
            this._attribute_SFBool(ctx, 'ccw', true);
			this._attribute_SFFloat(ctx, 'creaseAngle', 0);	// TODO
            
            var coordinates = null;
            Array.forEach(ctx.xmlNode.childNodes, function (node) {
                if (x3dom.isX3DElement(node)) {
                    var child = ctx.setupNodePrototypes(node, ctx);
                    if (child) {
                        if (x3dom.isa(child, x3dom.nodeTypes.Coordinate)) {
                            coordinates = child;
                        }
                    }
                }
            });
			this._coord = coordinates;
            
            //TODO; we need generic child/parent links here!
            //Furthermore, node could be used (i.e. multi-parent)
            if (this._coord != null)
                this._coord._parent = this;
            this._parent = null;
            
            //restore current position in graph!
            ctx.xmlNode = this._xmlNode;
			
			var t0 = new Date().getTime();
			
            var indexes = ctx.xmlNode.getAttribute('coordIndex').match(/((?:\+|-)?\d+)/g);
			var normalInd, texCoordInd, colorInd;
			
			var hasNormal = false, hasNormalInd = false;
			var hasTexCoord = false, hasTexCoordInd = false;
			var hasColor = false, hasColorInd = false;
			
			if (ctx.xmlNode.hasAttribute('normalIndex'))
			{
				normalInd = ctx.xmlNode.getAttribute('normalIndex').match(/((?:\+|-)?\d+)/g);
				hasNormalInd = true;
			}
			if (ctx.xmlNode.hasAttribute('texCoordIndex'))
			{
				texCoordInd = ctx.xmlNode.getAttribute('texCoordIndex').match(/((?:\+|-)?\d+)/g);
				hasTexCoordInd = true;
			}
			if (ctx.xmlNode.hasAttribute('colorIndex'))
			{
				colorInd = ctx.xmlNode.getAttribute('colorIndex').match(/((?:\+|-)?\d+)/g);
				hasColorInd = true;
			}
			
			var positions, normals, texCoords, colors;
			
			var coordNode = Array.filter(ctx.xmlNode.childNodes, 
					function (n) { return (x3dom.isX3DElement(n) && n.localName.toLowerCase() == 'coordinate'); });
			ctx.assert(coordNode.length == 1);
            positions = Array.map(coordNode[0].getAttribute('point').match(/([+\-0-9eE\.]+)/g), function (n) { return +n; });
			
			var normalNode = Array.filter(ctx.xmlNode.childNodes, 
					function (n) { return (x3dom.isX3DElement(n) && n.localName.toLowerCase() == 'normal'); });
            if (normalNode.length == 1) 
			{
				hasNormal = true;
				normals = Array.map(normalNode[0].getAttribute('vector').match(/([+\-0-9eE\.]+)/g), function (n) { return +n; });
			}
			else {
				hasNormal = false;
			}

			var texCoordNode = Array.filter(ctx.xmlNode.childNodes, 
					function (n) { return (x3dom.isX3DElement(n) && n.localName.toLowerCase() == 'texturecoordinate'); });
            if (texCoordNode.length == 1) 
			{
				hasTexCoord = true;
				texCoords = Array.map(texCoordNode[0].getAttribute('point').match(/([+\-0-9eE\.]+)/g), function (n) { return +n; });
			}
			else {
				hasTexCoord = false;
			}

			var colorNode = Array.filter(ctx.xmlNode.childNodes, 
					function (n) { return (x3dom.isX3DElement(n) && n.localName.toLowerCase() == 'color'); });
            if (colorNode.length == 1) 
			{
				hasColor = true;
				colors = Array.map(colorNode[0].getAttribute('color').match(/([+\-0-9eE\.]+)/g), function (n) { return +n; });
			}
			else {
				hasColor = false;
            }

			this._mesh._indices = [];
			this._mesh._positions = [];
			if (hasNormal) { this._mesh._normals = []; }
			if (hasTexCoord) { this._mesh._texCoords = []; }
			if (hasColor) { this._mesh._colors = []; }
			
			if ( (hasNormal && hasNormalInd) || 
				 (hasTexCoord && hasTexCoordInd) || 
				 (hasColor && hasColorInd) )
			{
				// Found MultiIndex Mesh
				var t = 0, cnt = 0;
				var p0, p1, p2, n0, n1, n2, t1, t2, t3, c0, c1, c2;
				
				for (var i=0; i < indexes.length; ++i) 
				{
					// Convert non-triangular polygons to a triangle fan
					// (TODO: this assumes polygons are convex)
					if (indexes[i] == -1) {
						t = 0;
						continue;
					}
					if (hasNormalInd) {
						ctx.assert(normalInd[i] != -1);
                    }
					if (hasTexCoordInd) {
						ctx.assert(texCoordInd[i] != -1);
                    }
					if (hasColorInd) {
						ctx.assert(colorInd[i] != -1);
					}

					//TODO: OPTIMIZE but think about cache coherence regarding arrays!!!
					switch (t) 
					{
						case 0: 
							p0 = +indexes[i];
							if (hasNormalInd) { n0 = +normalInd[i]; }
							else { n0 = p0; }
							if (hasTexCoordInd) { t0 = +texCoordInd[i]; }
							else { t0 = p0; }
							if (hasColorInd) { c0 = +colorInd[i]; }
							else { c0 = p0; }
							t = 1; 
						break;
						case 1: 
							p1 = +indexes[i];
							if (hasNormalInd) { n1 = +normalInd[i]; }
							else { n1 = p1; }
							if (hasTexCoordInd) { t1 = +texCoordInd[i]; }
							else { t1 = p1; }
							if (hasColorInd) { c1 = +colorInd[i]; }
							else { c1 = p1; }
							t = 2; 
						break;
						case 2: 
							p2 = +indexes[i];
							if (hasNormalInd) { n2 = +normalInd[i]; }
							else { n2 = p2; }
							if (hasTexCoordInd) { t2 = +texCoordInd[i]; }
							else { t2 = p2; }
							if (hasColorInd) { c2 = +colorInd[i]; }
							else { c2 = p2; }
							t = 3; 
							
							this._mesh._indices.push(cnt++, cnt++, cnt++);
							
							this._mesh._positions.push(positions[p0*3+0]);
							this._mesh._positions.push(positions[p0*3+1]);
							this._mesh._positions.push(positions[p0*3+2]);
							this._mesh._positions.push(positions[p1*3+0]);
							this._mesh._positions.push(positions[p1*3+1]);
							this._mesh._positions.push(positions[p1*3+2]);
							this._mesh._positions.push(positions[p2*3+0]);
							this._mesh._positions.push(positions[p2*3+1]);
							this._mesh._positions.push(positions[p2*3+2]);
							
							if (hasNormal) {
								this._mesh._normals.push(normals[n0*3+0]);
								this._mesh._normals.push(normals[n0*3+1]);
								this._mesh._normals.push(normals[n0*3+2]);
								this._mesh._normals.push(normals[n1*3+0]);
								this._mesh._normals.push(normals[n1*3+1]);
								this._mesh._normals.push(normals[n1*3+2]);
								this._mesh._normals.push(normals[n2*3+0]);
								this._mesh._normals.push(normals[n2*3+1]);
								this._mesh._normals.push(normals[n2*3+2]);
							}
							
							if (hasColor) {
								//assume RGB for now...
								this._mesh._colors.push(colors[c0*3+0]);
								this._mesh._colors.push(colors[c0*3+1]);
								this._mesh._colors.push(colors[c0*3+2]);
								this._mesh._colors.push(colors[c1*3+0]);
								this._mesh._colors.push(colors[c1*3+1]);
								this._mesh._colors.push(colors[c1*3+2]);
								this._mesh._colors.push(colors[c2*3+0]);
								this._mesh._colors.push(colors[c2*3+1]);
								this._mesh._colors.push(colors[c2*3+2]);
							}
							
							if (hasTexCoord) {
								//assume 2d texCoords for now...
								this._mesh._texCoords.push(texCoords[t0*2+0]);
								this._mesh._texCoords.push(texCoords[t0*2+1]);
								this._mesh._texCoords.push(texCoords[t1*2+0]);
								this._mesh._texCoords.push(texCoords[t1*2+1]);
								this._mesh._texCoords.push(texCoords[t2*2+0]);
								this._mesh._texCoords.push(texCoords[t2*2+1]);
							}
						break;
						case 3: 
							p1 = p2; 
							n1 = n2;
							t1 = t2;
							p2 = +indexes[i];
							if (hasNormalInd) { n2 = +normalInd[i]; }
							else { n2 = p2; }
							if (hasTexCoordInd) { t2 = +texCoordInd[i]; }
							else { t2 = p2; }
							if (hasColorInd) { c2 = +colorInd[i]; }
							else { c2 = p2; }
							
							this._mesh._indices.push(cnt++, cnt++, cnt++);
							
							this._mesh._positions.push(positions[p0*3+0]);
							this._mesh._positions.push(positions[p0*3+1]);
							this._mesh._positions.push(positions[p0*3+2]);
							this._mesh._positions.push(positions[p1*3+0]);
							this._mesh._positions.push(positions[p1*3+1]);
							this._mesh._positions.push(positions[p1*3+2]);
							this._mesh._positions.push(positions[p2*3+0]);
							this._mesh._positions.push(positions[p2*3+1]);
							this._mesh._positions.push(positions[p2*3+2]);
							
							if (hasNormal) {
								this._mesh._normals.push(normals[n0*3+0]);
								this._mesh._normals.push(normals[n0*3+1]);
								this._mesh._normals.push(normals[n0*3+2]);
								this._mesh._normals.push(normals[n1*3+0]);
								this._mesh._normals.push(normals[n1*3+1]);
								this._mesh._normals.push(normals[n1*3+2]);
								this._mesh._normals.push(normals[n2*3+0]);
								this._mesh._normals.push(normals[n2*3+1]);
								this._mesh._normals.push(normals[n2*3+2]);
							}
							
							if (hasColor) {
								//assume RGB for now...
								this._mesh._colors.push(colors[c0*3+0]);
								this._mesh._colors.push(colors[c0*3+1]);
								this._mesh._colors.push(colors[c0*3+2]);
								this._mesh._colors.push(colors[c1*3+0]);
								this._mesh._colors.push(colors[c1*3+1]);
								this._mesh._colors.push(colors[c1*3+2]);
								this._mesh._colors.push(colors[c2*3+0]);
								this._mesh._colors.push(colors[c2*3+1]);
								this._mesh._colors.push(colors[c2*3+2]);
							}
							
							if (hasTexCoord) {
								//assume 2d texCoords for now...
								this._mesh._texCoords.push(texCoords[t0*2+0]);
								this._mesh._texCoords.push(texCoords[t0*2+1]);
								this._mesh._texCoords.push(texCoords[t1*2+0]);
								this._mesh._texCoords.push(texCoords[t1*2+1]);
								this._mesh._texCoords.push(texCoords[t2*2+0]);
								this._mesh._texCoords.push(texCoords[t2*2+1]);
							}
						break;
						default:
					}
				}
				
				if (!hasNormal) {
					this._mesh.calcNormals(this._creaseAngle, this._ccw);
                }
				if (!hasTexCoord) {
					this._mesh.calcTexCoords();
				}

				//TODO: this currently does nothing...
				this._mesh.remapData();
			
			} // if isMulti
			else
			{
				var t = 0, n0, n1, n2;
				
				for (var i = 0; i < indexes.length; ++i) 
				{
					// Convert non-triangular polygons to a triangle fan
					// (TODO: this assumes polygons are convex)
					if (indexes[i] == -1) {
						t = 0;
						continue;
					}
					switch (t) {
					case 0: n0 = +indexes[i]; t = 1; break;
					case 1: n1 = +indexes[i]; t = 2; break;
					case 2: n2 = +indexes[i]; t = 3; this._mesh._indices.push(n0, n1, n2); break;
					case 3: n1 = n2; n2 = +indexes[i]; this._mesh._indices.push(n0, n1, n2); break;
					}
				}
				
				this._mesh._positions = positions;
				
				if (hasNormal) { 
					this._mesh._normals = normals;
                }
				else { 
					this._mesh.calcNormals(this._creaseAngle, this._ccw);
				}
				if (hasTexCoord) { 
					this._mesh._texCoords = texCoords;
                }
				else { 
					this._mesh.calcTexCoords();
				}

				if (hasColor) { 
					this._mesh._colors = colors;
				}
				this._mesh.remapData();
			}
			
			this._mesh._invalidate = true;
			
			var t1 = new Date().getTime() - t0;
			//x3dom.debug.logInfo("Mesh load time: " + t1 + " ms");
			
			// TODO: fixme, what about geoProperty nodes?
            // Coordinate           - X3DCoordinateNode         - X3DGeometricPropertyNode 
            // Normal 			    - X3DNormalNode 			- X3DGeometricPropertyNode
			// TextureCoordinate    - X3DTextureCoordinateNode  - X3DGeometricPropertyNode 
        },
        {
            _fieldChanged: function (fieldName) {
                if (fieldName == "_coord")
                {
                    // TODO; multi-index with different this._mesh._indices
                    var pnts = this._coord._point;
                    var i, n = pnts.length;
                    
                    this._mesh._positions = [];
                    
                    // TODO; optimize (is there a memcopy?)
                    for (i=0; i<n; i++)
                    {
						this._mesh._positions.push(pnts[i].x);
						this._mesh._positions.push(pnts[i].y);
						this._mesh._positions.push(pnts[i].z);
                    }
                    
                    this._mesh._invalidate = true;
                    
                    // FIXME; again same HACK as before, 
                    // also we need fieldMask instead of one flag!
                    this._parent._dirty = true;
                }
            },
            
            _getNodeByDEF: function (def) {
				if (this._DEF == def) 
					return this;
				
				var found = null;
				
				if (this._coord !== null) {
					found = this._coord._getNodeByDEF(def);
                    if (found)
                        return found;
				}
				
				return found;
			},
			
			_find: function (type) {
				var c = null;
				
				if (this._coord !== null) {
					if (this._coord.constructor == type)
						return this._coord;
					c = this._coord._find(type);
					if (c)
						return c;
				}
				
				return c;
			}
        }
    )
);

x3dom.registerNodeType(
    "X3DGeometricPropertyNode",
    "base",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DGeometricPropertyNode.superClass.call(this, ctx);
        }
    )
);

x3dom.registerNodeType(
    "Coordinate",
    "base",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        function (ctx) {
            x3dom.nodeTypes.Coordinate.superClass.call(this, ctx);
            
            //if (ctx.xmlNode.hasAttribute('point'))
            //    this._point = x3dom.fields.MFVec3f.parse(ctx.xmlNode.getAttribute('point'));
            //else
                this._point = [];
            
            //TODO: can be multi-parent, see comment IndexedFaceSet!
            this._parent = null;
        },
        {
            _fieldChanged: function (fieldName) {
                if (this._parent != null)
                    this._parent._fieldChanged("_coord");
            }
        }
    )
);

x3dom.registerNodeType(
    "TextureCoordinate",
    "base",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        function (ctx) {
            x3dom.nodeTypes.TextureCoordinate.superClass.call(this, ctx);
        }
    )
);

x3dom.registerNodeType(
    "Normal",
    "base",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        function (ctx) {
            x3dom.nodeTypes.Normal.superClass.call(this, ctx);
        }
    )
);

x3dom.registerNodeType(
    "Color",
    "base",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        function (ctx) {
            x3dom.nodeTypes.Color.superClass.call(this, ctx);
        }
    )
);


/**** x3dom.X3DFontStyleNode ****/
x3dom.registerNodeType( 
    "X3DFontStyleNode",
    "base",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DFontStyleNode.superClass.call(this, ctx);
        }
    )
);

x3dom.registerNodeType( 
    "FontStyle",
    "Text",
    defineClass(x3dom.nodeTypes.X3DFontStyleNode,
        function (ctx) {
            x3dom.nodeTypes.FontStyle.superClass.call(this, ctx);
    
            this._attribute_MFString(ctx, 'family', ['SERIF']);
            this._attribute_SFBool(ctx, 'horizontal', true);
            this._attribute_MFString(ctx, 'justify', ['BEGIN']);
			this._attribute_SFString(ctx, 'language', "");
            this._attribute_SFBool(ctx, 'leftToRight', true);
            this._attribute_SFFloat(ctx, 'size', 1.0);
            this._attribute_SFFloat(ctx, 'spacing', 1.0);
			this._attribute_SFString(ctx, 'style', "PLAIN");
            this._attribute_SFBool(ctx, 'topToBottom', true);
        }
    )
);

/**** x3dom.X3DChildNode ****/
x3dom.registerNodeType(
    "X3DChildNode",
    "base",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DChildNode.superClass.call(this, ctx);
        }
    )
);

/**** x3dom.X3DBindableNode ****/
//x3dom.X3DBindableNode = defineClass(x3dom.X3DChildNode,
x3dom.registerNodeType(
    "X3DBindableNode",
    "base",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DBindableNode.superClass.call(this, ctx);
        }
    )
);


// x3dom.Viewpoint = defineClass(x3dom.X3DBindableNode,
x3dom.registerNodeType( 
    "Viewpoint",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        function (ctx) {
            x3dom.nodeTypes.Viewpoint.superClass.call(this, ctx);
			this._attribute_SFFloat(ctx, 'fieldOfView', 0.785398);
            this._attribute_SFVec3f(ctx, 'position', 0, 0, 10);
            this._attribute_SFRotation(ctx, 'orientation', 0, 0, 0, 1);
			this._attribute_SFVec3f(ctx, 'centerOfRotation', 0, 0, 0);
            this._attribute_SFFloat(ctx, 'zNear', 0.1);
            this._attribute_SFFloat(ctx, 'zFar', 100000);
            
            this._attribute_SFMatrix4f(ctx, 'matrix', 1, 0, 0, 0,
                                                      0, 1, 0, 0,
                                                      0, 0, 1, 0,
                                                      0, 0, 0, 1);
			
            this._viewMatrix = this._orientation.toMatrix().transpose().
				mult(x3dom.fields.SFMatrix4f.translation(this._position.negate()));
            this._projMatrix = null;
        },
        {
            _fieldChanged: function (fieldName) {
                if (fieldName == "_matrix") {
                    this._viewMatrix = this._matrix;
                }
                else if (fieldName == "_position" || 
                         fieldName == "_orientation") {
                    this._viewMatrix = this._orientation.toMatrix().transpose().
                        mult(x3dom.fields.SFMatrix4f.translation(this._position.negate()));
                }
                else if (fieldName == "_fieldOfView" || 
                         fieldName == "_zNear" ||
                         fieldName == "_zFar") {
                    this._projMatrix = null;   // trigger refresh
                }
            },
            
			getCenterOfRotation: function() {
                return this._centerOfRotation;
			},
			getViewMatrix: function() {
                return this._viewMatrix;
			},
			getFieldOfView: function() {
				return this._fieldOfView;
			},
            
            setView: function(newView) {
                this._viewMatrix = newView;
            },
            resetView: function() {
                this._viewMatrix = this._orientation.toMatrix().transpose().
                    mult(x3dom.fields.SFMatrix4f.translation(this._position.negate()));
            },
            
            getProjectionMatrix: function(aspect)
            {
                if (this._projMatrix == null)
                {
                    var fovy = this._fieldOfView;
                    var zfar = this._zFar;
                    var znear = this._zNear;
                    
                    var f = 1/Math.tan(fovy/2);
                    this._projMatrix = new x3dom.fields.SFMatrix4f(
                        f/aspect, 0, 0, 0,
                        0, f, 0, 0,
                        0, 0, (znear+zfar)/(znear-zfar), 2*znear*zfar/(znear-zfar),
                        0, 0, -1, 0
                    );
                }
                return this._projMatrix;
            }
        }
    )
);

x3dom.registerNodeType( 
    "Fog",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        function (ctx) {
            x3dom.nodeTypes.Fog.superClass.call(this, ctx);
            
			this._attribute_SFColor(ctx, 'color', 1, 1, 1);
            this._attribute_SFString(ctx, 'fogType', "LINEAR");
			this._attribute_SFFloat(ctx, 'visibilityRange', 0);
            
            x3dom.debug.logInfo("Fog NYI");
        },
        {
			// methods
        }
    )
);

x3dom.registerNodeType( 
    "NavigationInfo",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        function (ctx) {
            x3dom.nodeTypes.NavigationInfo.superClass.call(this, ctx);
            
			this._attribute_SFBool(ctx, 'headlight', true);
            this._attribute_MFString(ctx, 'type', ["EXAMINE"]);
            
            x3dom.debug.logInfo("NavType: " + this._type[0].toLowerCase());
        },
        {
			// methods
        }
    )
);

x3dom.registerNodeType( 
    "WorldInfo",
    "base",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.WorldInfo.superClass.call(this, ctx);
            
            this._attribute_MFString(ctx, 'info', []);
			this._attribute_SFString(ctx, 'title', "");
            
            x3dom.debug.logInfo(this._info);
            x3dom.debug.logInfo(this._title);
        },
        {
			// methods
        }
    )
);

x3dom.registerNodeType(
    "Background",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        function (ctx) {
            x3dom.nodeTypes.Background.superClass.call(this, ctx);
			
            this._attribute_MFColor(ctx, 'skyColor', [new x3dom.fields.SFColor(0,0,0)]);
            this._attribute_SFFloat(ctx, 'transparency', 0);
        },
        {
			getSkyColor: function() {
				return this._skyColor;
			},
			getTransparency: function() {
				return this._transparency;
			}
        }
    )
);

x3dom.registerNodeType( 
    "X3DLightNode",
    "Lighting",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DLightNode.superClass.call(this, ctx);
            
			this._attribute_SFFloat(ctx, 'ambientIntensity', 0);
            this._attribute_SFColor(ctx, 'color', 1, 1, 1);
			this._attribute_SFFloat(ctx, 'intensity', 1);
            this._attribute_SFBool(ctx, 'global', false);
            this._attribute_SFBool(ctx, 'on', true);
            this._attribute_SFFloat(ctx, 'shadowIntensity', 0);
        },
        {
			getViewMatrix: function(pos) {
                return x3dom.fields.SFMatrix4f.identity;
            }
        }
    )
);

x3dom.registerNodeType( 
    "DirectionalLight",
    "Lighting",
    defineClass(x3dom.nodeTypes.X3DLightNode,
        function (ctx) {
            x3dom.nodeTypes.DirectionalLight.superClass.call(this, ctx);
            
            this._attribute_SFVec3f(ctx, 'direction', 0, -1, 0);
        },
        {
            getViewMatrix: function(pos) {
                var dir = this._direction.normalize();
                var orientation = x3dom.fields.Quaternion.rotateFromTo(
                        new x3dom.fields.SFVec3f(0, 0, -1), dir);
                return orientation.toMatrix().transpose().
                        mult(x3dom.fields.SFMatrix4f.translation(pos.negate()));
            }
        }
    )
);


/**** x3dom.X3DShapeNode ****/
// x3dom.X3DShapeNode = defineClass(x3dom.X3DChildNode,
x3dom.registerNodeType(
    "X3DShapeNode",
    "base",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DShapeNode.superClass.call(this, ctx);
        }
    )
);


// x3dom.Shape = defineClass(x3dom.X3DShapeNode,
x3dom.registerNodeType(
    "Shape",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DShapeNode,
        function (ctx) {
            x3dom.nodeTypes.Shape.superClass.call(this, ctx);
    
            var appearance = null, geometry = null;
            var xmlNode = ctx.xmlNode;
            
            Array.forEach(ctx.xmlNode.childNodes, function (node) {
                if (x3dom.isX3DElement(node)) {
                    var child = ctx.setupNodePrototypes(node, ctx);
                    if (child) {
                        if (x3dom.isa(child, x3dom.nodeTypes.X3DAppearanceNode)) {
                            ctx.assert(! appearance, 'has <= 1 appearance node');
                            appearance = child;
                        }
                        else if (x3dom.isa(child, x3dom.nodeTypes.X3DGeometryNode)) {
                            ctx.assert(! geometry, 'has <= 1 geometry node');
                            geometry = child;
                        }
                        else {
                            ctx.log('Unrecognised x3dom.Shape child node type '+node.localName);
                        }
                    }
                }
            });
			
			if (!appearance)
			{
                var app = document.createElement('Appearance');
                xmlNode.appendChild(app);
                ctx.xmlNode = app;
				var nodeType = x3dom.nodeTypes["Appearance"];
				appearance = new nodeType(ctx);
			}
            ctx.assert(appearance && geometry, 'has appearance and geometry');
			
            this._appearance = appearance;
            this._geometry = geometry;
            
            //TODO: same HACK as in Coordinate and IndexedFaceSet!!!
            this._geometry._parent = this;
            this._dirty = true;
        },
        {
            _collectDrawableObjects: function (transform, out) {
                // TODO: culling etc
                if (out !== null) 
                {
                    out.push( [transform, this] );
                }
            },
			
			_getVolume: function(min, max, invalidate) {
				return this._geometry._getVolume(min, max, invalidate);
			},
			
			_getCenter: function() {
				return this._geometry._getCenter();
			},
            
            _doIntersect: function(line) {
                return this._geometry._doIntersect(line);
            },
			
			_isSolid: function() {
				return this._geometry._solid;
			},
			
			_getNodeByDEF: function (def) {
				if (this._DEF == def) 
					return this;
				
				var found = null;
				
				if (this._appearance !== null) {
					found = this._appearance._getNodeByDEF(def);
                    if (found)
                        return found;
				}
				
				if (this._geometry !== null) {
					found = this._geometry._getNodeByDEF(def);
                    if (found)
                        return found;
				}
				
				return found;
			},
			
			_find: function (type) {
				var c = null;
				
				if (this._appearance !== null) {
					if (this._appearance.constructor == type)
						return this._appearance;
					c = this._appearance._find(type);
					if (c)
						return c;
				}
				
				if (this._geometry !== null) {
					if (this._geometry.constructor == type)
						return this._geometry;
					c = this._geometry._find(type);
					if (c)
						return c;
				}
				
				return c;
			}
        }
    )
);

/**** x3dom.X3DGroupingNode ****/
// x3dom.X3DGroupingNode = defineClass(x3dom.nodeTypes.X3DChildNode,
x3dom.registerNodeType(
    "X3DGroupingNode",
    "base",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DGroupingNode.superClass.call(this, ctx);
            this._childNodes = [];
            this._autoChild = true;
        },
        {
            addChild: function (node) {
                this._childNodes.push(node);
                node._parentNodes.push(this);

				/** FIXME
				for (field in this._cf) {
					if (obj.hasOwnProperty(field)) {
						if (x3dom.isa(node,field.type) && (field.addLink(node)) {
							node._parentNodes.push(this);
							this._childNodes.push(node)
							return true;
						}
					}
				}
				return false;
				*/
            },
            removeChild: function (node) {
				/** FIXME 
            	for (field in this._cf) {
					if (this._cf.hasOwnProperty(field) && field.rmLink(node)) {
						for (var i = 0, n = node._parentNodes.length; i < n; i++) {
							if (node._parentNode === this) {
								node._parentNodes.splice(i,1)) {
								for (j = 0, n = this._childNodes.length; j < n; j++))
									if (this._childNodes[j] === node) {
										this._childNodes.splice(j,1);
										return true;
									}
									else
										return false;
							}
						}
					}
				}
				return false;
				*/
            }
        }
    )
);


// x3dom.Transform = defineClass(x3dom.X3DGroupingNode,
x3dom.registerNodeType(
    "Transform",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Transform.superClass.call(this, ctx);
			this._attribute_SFVec3f(ctx, 'center', 0, 0, 0);
            this._attribute_SFVec3f(ctx, 'translation', 0, 0, 0);
            this._attribute_SFRotation(ctx, 'rotation', 0, 0, 0, 1);
            this._attribute_SFVec3f(ctx, 'scale', 1, 1, 1);
			this._attribute_SFRotation(ctx, 'scaleOrientation', 0, 0, 0, 1);
			// BUG? default of rotation according to spec is (0, 0, 1, 0)
			//		but results sometimes are wrong if not (0, 0, 0, 1)
			// TODO; check quaternion/ matrix code and state init...
            
            this._attribute_SFMatrix4f(ctx, 'matrix', 1, 0, 0, 0,
                                                      0, 1, 0, 0,
                                                      0, 0, 1, 0,
                                                      0, 0, 0, 1);
            
            this._trafo = x3dom.fields.SFMatrix4f.translation(this._translation).
							mult(x3dom.fields.SFMatrix4f.translation(this._center)).
							mult(this._rotation.toMatrix()).
							mult(this._scaleOrientation.toMatrix()).
							mult(x3dom.fields.SFMatrix4f.scale(this._scale)).
							mult(this._scaleOrientation.toMatrix().inverse()).
							mult(x3dom.fields.SFMatrix4f.translation(this._center.negate()));
        },
        {
            _fieldChanged: function (fieldName) {
                if (fieldName == "_matrix") {
                    this._trafo = this._matrix;
                }
                else {
                    // P' = T * C * R * SR * S * -SR * -C * P
                    this._trafo = x3dom.fields.SFMatrix4f.translation(this._translation).
                                mult(x3dom.fields.SFMatrix4f.translation(this._center)).
                                mult(this._rotation.toMatrix()).
                                mult(this._scaleOrientation.toMatrix()).
                                mult(x3dom.fields.SFMatrix4f.scale(this._scale)).
                                mult(this._scaleOrientation.toMatrix().inverse()).
                                mult(x3dom.fields.SFMatrix4f.translation(this._center.negate()));
                }
            },
            
            _transformMatrix: function(transform) {
                return transform.mult(this._trafo);
            },
			
			_getVolume: function(min, max, invalidate) 
            {
				var nMin = new x3dom.fields.SFVec3f(
                        Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
				var nMax = new x3dom.fields.SFVec3f(
                        Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
                var valid = false;
                
				for (var i=0; i<this._childNodes.length; i++)
				{
					if (this._childNodes[i])
					{
						var childMin = new x3dom.fields.SFVec3f(
                                Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
						var childMax = new x3dom.fields.SFVec3f(
                                Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
						
						valid = this._childNodes[i]._getVolume(
                                        childMin, childMax, invalidate) || valid;
						
                        if (valid)  // values only set by Mesh.BBox()
                        {
                            if (nMin.x > childMin.x) nMin.x = childMin.x;
                            if (nMin.y > childMin.y) nMin.y = childMin.y;
                            if (nMin.z > childMin.z) nMin.z = childMin.z;
                                
                            if (nMax.x < childMax.x) nMax.x = childMax.x;
                            if (nMax.y < childMax.y) nMax.y = childMax.y;
                            if (nMax.z < childMax.z) nMax.z = childMax.z;
                        }
					}
				}
				
                if (valid)
                {
                    nMin = this._trafo.multMatrixPnt(nMin);
                    nMax = this._trafo.multMatrixPnt(nMax);
                    
                    min.x = nMin.x;
                    min.y = nMin.y;
                    min.z = nMin.z;
                        
                    max.x = nMax.x;
                    max.y = nMax.y;
                    max.z = nMax.z;
                }
                return valid;
			},
            
            _doIntersect: function(line) 
            {
                var isect = false;
                var mat = this._trafo.inverse();
                
                var tmpPos = new x3dom.fields.SFVec3f(line.pos.x, line.pos.y, line.pos.z);
                var tmpDir = new x3dom.fields.SFVec3f(line.dir.x, line.dir.y, line.dir.z);
                
                line.pos = mat.multMatrixPnt(line.pos);
                line.dir = mat.multMatrixVec(line.dir);
                
                for (var i=0; i<this._childNodes.length; i++) 
                {
                    if (this._childNodes[i]) 
                    {
                        //TODO: check for _nearest_ hit object and don't stop on first!
                        isect = this._childNodes[i]._doIntersect(line);
                        
                        if (isect)
                        {
                            line.hitPoint = this._trafo.multMatrixPnt(line.hitPoint);
                            break;
                        }
                    }
                }
                
                line.pos = new x3dom.fields.SFVec3f(tmpPos.x, tmpPos.y, tmpPos.z);
                line.dir = new x3dom.fields.SFVec3f(tmpDir.x, tmpDir.y, tmpDir.z);
                
                return isect;
            }
        }
    )
);

x3dom.registerNodeType(
    "Group",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Group.superClass.call(this, ctx);
        },
        {
        }
    )
);


/**** x3dom.X3DInterpolatorNode ****/
// x3dom.X3DInterpolatorNode = defineClass(x3dom.X3DChildNode,
x3dom.registerNodeType(
    "X3DInterpolatorNode",
    "base",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DInterpolatorNode.superClass.call(this, ctx);
    
            if (ctx.xmlNode.hasAttribute('key'))
                this._key = Array.map(ctx.xmlNode.getAttribute('key').split(/\s+/), function (n) { return +n; });
            else
                this._key = [];
        },
        {
            _linearInterp: function (t, interp) {
                if (t <= this._key[0])
                    return this._keyValue[0];
                if (t >= this._key[this._key.length-1])
                    return this._keyValue[this._key.length-1];
                for (var i = 0; i < this._key.length-1; ++i)
                    if (this._key[i] < t && t <= this._key[i+1])
                        return interp( this._keyValue[i], this._keyValue[i+1], 
                                (t - this._key[i]) / (this._key[i+1] - this._key[i]) );
            }
        }
    )
);


// x3dom.OrientationInterpolator = defineClass(x3dom.X3DInterpolatorNode,
x3dom.registerNodeType(
    "OrientationInterpolator",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        function (ctx) {
            x3dom.nodeTypes.OrientationInterpolator.superClass.call(this, ctx);
            
            if (ctx.xmlNode.hasAttribute('keyValue'))
                this._keyValue = x3dom.fields.MFRotation.parse(ctx.xmlNode.getAttribute('keyValue'));
            else
                this._keyValue = [];
            
            this._fieldWatchers._fraction = this._fieldWatchers.set_fraction = [ function (msg) {
                var value = this._linearInterp(msg, function (a, b, t) { return a.slerp(b, t); });
                this._postMessage('value_changed', value);
            } ];
        }
    )
);

x3dom.registerNodeType(
    "PositionInterpolator",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        function (ctx) {
            x3dom.nodeTypes.PositionInterpolator.superClass.call(this, ctx);
            
            if (ctx.xmlNode.hasAttribute('keyValue'))
                this._keyValue = x3dom.fields.MFVec3f.parse(ctx.xmlNode.getAttribute('keyValue'));
            else
                this._keyValue = [];
            
            this._fieldWatchers._fraction = this._fieldWatchers.set_fraction = [ function (msg) {
                var value = this._linearInterp(msg, function (a, b, t) { return a.multiply(1.0-t).add(b.multiply(t)); });
                this._postMessage('value_changed', value);
            } ];
        }
    )
);

x3dom.registerNodeType(
    "ScalarInterpolator",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        function (ctx) {
            x3dom.nodeTypes.ScalarInterpolator.superClass.call(this, ctx);
            
            if (ctx.xmlNode.hasAttribute('keyValue'))
                this._keyValue = Array.map(ctx.xmlNode.getAttribute('keyValue').split(/\s+/), function (n) { return +n; });
            else
                this._keyValue = [];
			
            this._fieldWatchers._fraction = this._fieldWatchers.set_fraction = [ function (msg) {
                var value = this._linearInterp(msg, function (a, b, t) { return (1.0-t)*a + t*b; });
                this._postMessage('value_changed', value);
            } ];
        }
    )
);

x3dom.registerNodeType(
    "CoordinateInterpolator",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        function (ctx) {
            x3dom.nodeTypes.CoordinateInterpolator.superClass.call(this, ctx);
            
            this._keyValue = [];
            if (ctx.xmlNode.hasAttribute('keyValue')) {
                var arr = x3dom.fields.MFVec3f.parse(ctx.xmlNode.getAttribute('keyValue'));
                var key = this._key.length > 0 ? this._key.length : 1;
                var len = arr.length / key;
                for (var i=0; i<key; i++) {
                    var val = new x3dom.fields.MFVec3f();
                    for (var j=0; j<len; j++) {
                        val.push( arr[i*len+j] );
                    }
                    this._keyValue.push(val);
                }
            }
            
            this._fieldWatchers._fraction = this._fieldWatchers.set_fraction = [ function (msg) {
                var value = this._linearInterp(msg, function (a, b, t) {
                    var val = new x3dom.fields.MFVec3f();
                    for (var i=0; i<a.length; i++) {
                        val.push(a[i].multiply(1.0-t).add(b[i].multiply(t)));
                    }
                    return val;
                });
                this._postMessage('value_changed', value);
            } ];
        }
    )
);


/**** x3dom.X3DSensorNode ****/
// x3dom.X3DSensorNode = defineClass(x3dom.X3DChildNode,
x3dom.registerNodeType(
    "X3DSensorNode",
    "base",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DSensorNode.superClass.call(this, ctx);
        }
    )
);

// x3dom.TimeSensor = defineClass(x3dom.X3DSensorNode, // TODO: multiple inheritance...
x3dom.registerNodeType(
    "TimeSensor",
    "Time",
    defineClass(x3dom.nodeTypes.X3DSensorNode, // TODO: multiple inheritance...
        function (ctx) {
            x3dom.nodeTypes.TimeSensor.superClass.call(this, ctx);
			
			this._attribute_SFBool(ctx, 'enabled', true);
            this._attribute_SFTime(ctx, 'cycleInterval', 1);
            this._attribute_SFBool(ctx, 'loop', false);
            this._attribute_SFTime(ctx, 'startTime', 0);
    
            this._fraction = 0;
        },
        {
            _onframe: function (ts) {
				if (!this._enabled)
					return;
				
            	var isActive = ( ts >= this._startTime);
            	var cycleFrac, cycle, fraction;
            	
            	if (this._cycleInterval > 0) {
                    cycleFrac = (ts - this._startTime) / this._cycleInterval;
                    cycle = Math.floor(cycleFrac);
                    fraction = cycleFrac - cycle;
            	}
     
     			this._postMessage('fraction_changed', fraction );
            }
        }
    )
);


// Not a real X3D node type
// TODO; refactor to Scene + Viewarea node
// x3dom.Scene = defineClass(x3dom.X3DGroupingNode,
x3dom.registerNodeType( 
    "Scene",
    "base",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Scene.superClass.call(this, ctx);
			this._rotMat = x3dom.fields.SFMatrix4f.identity();
			this._transMat = x3dom.fields.SFMatrix4f.identity();
			this._movement = new x3dom.fields.SFVec3f(0, 0, 0);
            
			this._width = 400;
			this._height = 300;
            this._lastX = -1;
            this._lastY = -1;
            this._pick = new x3dom.fields.SFVec3f(0, 0, 0);
            
            this._ctx = ctx;    //needed for late create
			this._cam = null;
            this._bgnd = null;
            this._navi = null;
			this._lights = [];
        },
        {
        	getViewpoint: function() 
            {
        		if (this._cam == null) 
                {
					this._cam = this._find(x3dom.nodeTypes.Viewpoint);
                    
                    if (!this._cam)
                    {
                        var cam = document.createElement('Viewpoint');
                        this._xmlNode.appendChild(cam);
                        this._ctx.xmlNode = cam;
                        var nodeType = x3dom.nodeTypes["Viewpoint"];
                        this._cam = new nodeType(this._ctx);
                        x3dom.debug.logInfo("Created ViewBindable.");
                    }
                }
				
  				return this._cam;
        	},
			
			getLights: function() 
            {
				if (this._lights.length == 0)
					this._lights = this._findAll(x3dom.nodeTypes.DirectionalLight);
				
				return this._lights;
			},
            
            getNavInfo: function()
            {
                if (this._navi == null)
                {
                    this._navi = this._find(x3dom.nodeTypes.NavigationInfo);
                    
                    if (!this._navi)
                    {
                        var nav = document.createElement('NavigationInfo');
                        this._xmlNode.appendChild(nav);
                        this._ctx.xmlNode = nav;
                        var nodeType = x3dom.nodeTypes["NavigationInfo"];
                        this._navi = new nodeType(this._ctx);
                        x3dom.debug.logInfo("Created UserBindable.");
                    }
                }
                
                return this._navi;
            },
        	
			getVolume: function(min, max, invalidate)
			{
				var MIN = new x3dom.fields.SFVec3f(
					Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
				var MAX = new x3dom.fields.SFVec3f(
					Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
				
				var valid = this._getVolume(MIN, MAX, invalidate);
				
				min.x = MIN.x;
				min.y = MIN.y;
				min.z = MIN.z;
				
				max.x = MAX.x;
				max.y = MAX.y;
				max.z = MAX.z;
                
                return valid;
			},
			
            getViewpointMatrix: function () 
            {
                var viewpoint = this.getViewpoint();
                var mat_viewpoint = viewpoint._getCurrentTransform();
                
				return mat_viewpoint.mult(viewpoint.getViewMatrix());
            },
    
            getViewMatrix: function () 
            {
                return this.getViewpointMatrix().
							mult(this._transMat).
							mult(this._rotMat);
            },
            
            getLightMatrix: function()
            {
                var lights = this.getLights();
                if (lights.length > 0)
                {
                    var min = new x3dom.fields.SFVec3f(
                        Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
                    var max = new x3dom.fields.SFVec3f(
                        Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
                    var ok = this.getVolume(min, max, true);
                    
                    if (ok)
                    {
                        var viewpoint = this.getViewpoint();
                        var fov = viewpoint.getFieldOfView();
                        
                        var dia = max.subtract(min);
                        var dist1 = (dia.y/2.0) / Math.tan(fov/2.0) + (dia.z/2.0);
                        var dist2 = (dia.x/2.0) / Math.tan(fov/2.0) + (dia.z/2.0);
                        
                        dia = min.add(dia.multiply(0.5));
                        var dir = lights[0]._direction.normalize().negate();
                        dia = dia.add(dir.multiply(1.2*(dist1 > dist2 ? dist1 : dist2)));
                        //x3dom.debug.logInfo(dia);
                        
                        return lights[0].getViewMatrix(dia);
                    }
                }
                //TODO, this is only for testing
                return this.getViewMatrix();
            },
            
            getWCtoLCMatrix: function()
            {
                var view = this.getLightMatrix();
                var proj = this.getProjectionMatrix();
                
                return proj.mult(view);
            },
			
			getSkyColor: function() 
            {
                if (this._bgnd == null)
                {
                    this._bgnd = this._find(x3dom.nodeTypes.Background);
                    
                    if (!this._bgnd)
                    {
                        var bgd = document.createElement('Background');
                        this._xmlNode.appendChild(bgd);
                        this._ctx.xmlNode = bgd;
                        var nodeType = x3dom.nodeTypes["Background"];
                        this._bgnd = new nodeType(this._ctx);
                        x3dom.debug.logInfo("Created BackgroundBindable.");
                    }
                }
				
				var bgCol = this._bgnd.getSkyColor().toGL();
				//workaround; impl. skyTransparency etc.
				if (bgCol.length > 2)
					bgCol[3] = 1.0 - this._bgnd.getTransparency();
				
				return bgCol;
			},
            
            getProjectionMatrix: function() 
            {
                var viewpoint = this.getViewpoint();
                
				return viewpoint.getProjectionMatrix(this._width/this._height);
            },
            
            getWCtoCCMatrix: function()
            {
                var view = this.getViewMatrix();
                var proj = this.getProjectionMatrix();
                
                return proj.mult(view);
            },
            
            getCCtoWCMatrix: function()
            {
                var mat = this.getWCtoCCMatrix();
                
                return mat.inverse();
            },
            
            calcViewRay: function(x, y)
            {
                var cctowc = this.getCCtoWCMatrix();
                
                var rx = x / (this._width - 1.0) * 2.0 - 1.0;
                var ry = (this._height - 1.0 - y) / (this._height - 1.0) * 2.0 - 1.0;
                
                var from = cctowc.multFullMatrixPnt(new x3dom.fields.SFVec3f(rx, ry, -1));
                var at = cctowc.multFullMatrixPnt(new x3dom.fields.SFVec3f(rx, ry,  1));
                var dir = at.subtract(from);
                
                return new x3dom.fields.Line(from, dir);
            },
            
            showAll: function()
            {
				var min = new x3dom.fields.SFVec3f(
					Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
				var max = new x3dom.fields.SFVec3f(
					Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
                var ok = this.getVolume(min, max, true);
                
                if (ok)
                {
                    var viewpoint = this.getViewpoint();
                    var fov = viewpoint.getFieldOfView();
                    
                    var dia = max.subtract(min);
                    var dist1 = (dia.y/2.0) / Math.tan(fov/2.0) + (dia.z/2.0);
                    var dist2 = (dia.x/2.0) / Math.tan(fov/2.0) + (dia.z/2.0);
                    
                    dia = min.add(dia.multiply(0.5));
                    dia.z += (dist1 > dist2 ? dist1 : dist2);
                    viewpoint.setView(x3dom.fields.SFMatrix4f.translation(dia.multiply(-1)));
                    
                    this._rotMat = x3dom.fields.SFMatrix4f.identity();
                    this._transMat = x3dom.fields.SFMatrix4f.identity();
                    this._movement = new x3dom.fields.SFVec3f(0, 0, 0);
                }
            },
            
            resetView: function()
            {
                this.getViewpoint().resetView();
                
                this._rotMat = x3dom.fields.SFMatrix4f.identity();
                this._transMat = x3dom.fields.SFMatrix4f.identity();
                this._movement = new x3dom.fields.SFVec3f(0, 0, 0);
            },
            
            onMousePress: function (x, y, buttonState)
            {
                this._lastX = x;
                this._lastY = y;
                
                var line = this.calcViewRay(x, y);
                
                var isect = this._doIntersect(line);
                
                if (isect) 
                {
                    this._pick.x = line.hitPoint.x;
                    this._pick.y = line.hitPoint.y;
                    this._pick.z = line.hitPoint.z;
                    x3dom.debug.logInfo("Ray hit at position " + this._pick);
                }
                else 
                {
                    var dir = this.getViewMatrix().e2().negate();
                    var u = dir.dot(line.pos.negate()) / dir.dot(line.dir);
                    this._pick = line.pos.add(line.dir.multiply(u));
                    //x3dom.debug.logInfo("No hit at position " + this._pick);
                }
            },
            
            onMouseRelease: function (x, y, buttonState)
            {
                this._lastX = x;
                this._lastY = y;
            },
            
            onDoubleClick: function (x, y)
            {
                var navi = this.getNavInfo();
                if (navi._type[0].length <= 1 || navi._type[0].toLowerCase() == "none")
                    return;
                
                var viewpoint = this.getViewpoint();
                
                viewpoint._centerOfRotation.x = this._pick.x;
                viewpoint._centerOfRotation.y = this._pick.y;
                viewpoint._centerOfRotation.z = this._pick.z;
                x3dom.debug.logInfo("New center of Rotation:  " + this._pick);
            },
    		
            //ondrag: function (dx, dy, buttonState) 
            ondrag: function (x, y, buttonState) 
            {
                var navi = this.getNavInfo();
                if (navi._type[0].length <= 1 || navi._type[0].toLowerCase() == "none")
                    return;
                
                var Eps = 0.00001;
                var dx = x - this._lastX;
                var dy = y - this._lastY;
                
				if (buttonState & 1) 
                {
					var alpha = (dy * 2 * Math.PI) / this._width;
					var beta = (dx * 2 * Math.PI) / this._height;
					var mat = this.getViewMatrix();
					
					var mx = x3dom.fields.SFMatrix4f.rotationX(alpha);
					var my = x3dom.fields.SFMatrix4f.rotationY(beta);
					
					var viewpoint = this.getViewpoint();
					var center = viewpoint.getCenterOfRotation();
					
					mat.setTranslate(new x3dom.fields.SFVec3f(0,0,0));
					this._rotMat = this._rotMat.
									mult(x3dom.fields.SFMatrix4f.translation(center)).
									mult(mat.inverse()).
									mult(mx).mult(my).
									mult(mat).
									mult(x3dom.fields.SFMatrix4f.translation(center.negate()));
				}
				if (buttonState & 4) 
                {
					var min = new x3dom.fields.SFVec3f(0,0,0);
					var max = new x3dom.fields.SFVec3f(0,0,0);
					var ok = this.getVolume(min, max, true);
					
					var d = ok ? (max.subtract(min)).length() : 10;
                    d = (d < Eps) ? 1 : d;
					//x3dom.debug.logInfo("PAN: " + min + " / " + max + " D=" + d);
					//x3dom.debug.logInfo("w="+this._width+", h="+this._height);
					
					var vec = new x3dom.fields.SFVec3f(d*dx/this._width,d*(-dy)/this._height,0);
					this._movement = this._movement.add(vec);
                    
                    //TODO; move real distance along viewing plane
					var viewpoint = this.getViewpoint();
					this._transMat = viewpoint.getViewMatrix().inverse().
								mult(x3dom.fields.SFMatrix4f.translation(this._movement)).
								mult(viewpoint.getViewMatrix());
				}
				if (buttonState & 2) 
                {
					var min = new x3dom.fields.SFVec3f(0,0,0);
					var max = new x3dom.fields.SFVec3f(0,0,0);
					var ok = this.getVolume(min, max, true);
					
					var d = ok ? (max.subtract(min)).length() : 10;
                    d = (d < Eps) ? 1 : d;
					//x3dom.debug.logInfo("ZOOM: " + min + " / " + max + " D=" + d);
					//x3dom.debug.logInfo((dx+dy)+" w="+this._width+", h="+this._height);
					
					var vec = new x3dom.fields.SFVec3f(0,0,d*(dx+dy)/this._height);
					this._movement = this._movement.add(vec);
                    
                    //TODO; move real distance along viewing ray
					var viewpoint = this.getViewpoint();
					this._transMat = viewpoint.getViewMatrix().inverse().
								mult(x3dom.fields.SFMatrix4f.translation(this._movement)).
								mult(viewpoint.getViewMatrix());
				}
                
                this._lastX = x;
                this._lastY = y;
            }
        }
    )
);

x3dom.registerNodeType(
    "Anchor",
    "Networking",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Anchor.superClass.call(this, ctx);
            
            this._attribute_MFString(ctx, 'url', []);
        },
        {
            _doIntersect: function(line) {
                var isect = false;
                for (var i=0; i<this._childNodes.length; i++) {
                    if (this._childNodes[i]) {
                        if (this._childNodes[i]._doIntersect(line)) {
                            isect = true;
                        }
                    }
                }
                
                if (isect && this._url.length > 0) {
                    // fixme; window.open usually gets blocked
                    // but this way the current page is lost?!
                    window.location = this._url[0];
                }
                
                return isect;
            }
        }
    )
);

x3dom.registerNodeType(
    "Inline",
    "Networking",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Inline.superClass.call(this, ctx);
            
            this._attribute_MFString(ctx, 'url', []);
            this._attribute_SFBool(ctx, 'load', true);
            
            var that = this;
            
            var xhr = new XMLHttpRequest();
            xhr.overrideMimeType('text/xml');   //application/xhtml+xml
            
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.responseXML.documentElement.localName == 'parsererror') {
                        x3dom.debug.logInfo('XML parser failed on '+this._url+':\n'+xhr.responseXML.documentElement.textContent);
                        return;
                    }
                }
                else {
                    x3dom.debug.logInfo('Loading inlined data... (readyState: ' + xhr.readyState + ')');
                    //if (xhr.readyState == 3) x3dom.debug.logInfo(xhr.responseText);
                    return;
                }
                if (xhr.status !== 200) {
                    x3dom.debug.logError('XMLHttpRequest requires a web server running!');
                    return;
                }
                
                x3dom.debug.logInfo('Inline: downloading '+that._url+' done.');
                
                var xml = xhr.responseXML;
                
                //TODO; check if exists and FIXME: it's not necessarily the first scene in the doc!
                var inlScene = xml.getElementsByTagName('Scene')[0] || xml.getElementsByTagName('scene')[0];
                
                x3dom.parsingInline = true; // enable special case
                
                that._childNodes = [ ctx.setupNodePrototypes(inlScene, ctx) ];
                that._childNodes[0]._parentNodes.push(that);
                
                x3dom.parsingInline = false; // disable special case
                
                x3dom.debug.logInfo('Inline: added '+that._url+' to scene.');
            };
            
            x3dom.debug.logInfo('Inline: downloading '+this._url);
            
            xhr.open('GET', this._url, true);
            xhr.send(null);
        },
        {
        }
    )
);


x3dom.X3DDocument = function(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.onload = function () {};
    this.onerror = function () {};
}

x3dom.X3DDocument.prototype.load = function (uri, sceneElemPos) {
    // Load uri. Get sceneDoc, list of sub-URIs.
    // For each URI, get docs[uri] = whatever, extend list of sub-URIs.

    var uri_docs = {};
    var queued_uris = [uri];
    var doc = this;
    
    function next_step() {
        // TODO: detect circular inclusions
        // TODO: download in parallel where possible

        if (queued_uris.length == 0) {
            // All done
            doc._setup(uri_docs[uri], uri_docs, sceneElemPos);
            doc.onload();
            return;
        }
        var next_uri = queued_uris.shift();
        
		//x3dom.debug.logInfo("loading... next_uri=" + next_uri + ", " + x3dom.isX3DElement(next_uri) + ", " + next_uri.namespaceURI);
        if (x3dom.isX3DElement(next_uri) && next_uri.localName.toLowerCase() == 'x3d') {
            // Special case, when passed an X3D node instead of a URI string
            uri_docs[next_uri] = next_uri;
            next_step();
        }
    }
	
    next_step();
}

x3dom.findScene = function(x3dElem) {
    var sceneElems = [];    
    for (var i=0; i<x3dElem.childNodes.length; i++) {
        var sceneElem = x3dElem.childNodes[i];        
        if (sceneElem && sceneElem.localName && sceneElem.localName.toLowerCase() === "scene") {
            sceneElems.push(sceneElem);
        }
    }
    
    if (sceneElems.length > 1) {
        x3dom.debug.logError("X3D element has more than one Scene child (has " + x3dElem.childNodes.length + ").");
    } else {
        return sceneElems[0];
    }
    return null;
}

x3dom.X3DDocument.prototype._setup = function (sceneDoc, uriDocs, sceneElemPos) {

    var ctx = {
    	defMap: {},
        docs: uriDocs,
        setupNodePrototypes: this._setupNodePrototypes,
        assert: x3dom.debug.assert,
        log: x3dom.debug.logInfo
    };

    var doc = this;
    
    // Test capturing DOM mutation events on the X3D subscene
    var domEventListener = {
        onAttrModified: function(e) {
            var attrToString = {
                1: "MODIFICATION",
                2: "ADDITION",
                3: "REMOVAL"
            };
            //x3dom.debug.logInfo("MUTATION: " + e + ", " + e.type + ", attrChange=" + attrToString[e.attrChange]);
            e.target._x3domNode._updateField(e.attrName, e.newValue);
        },
        onNodeRemoved: function(e) {
            var parent = e.target.parentNode._x3domNode;
            var child = e.target._x3domNode;
            
            //x3dom.debug.logInfo("Child: " + e.target.type + "MUTATION: " + e + ", " + e.type + ", removed node=" + e.target.tagName);
            
			// FIXME;
			// parent.removeChild(child)
           	for (var i = 0; i < parent._childNodes.length; i++) {
           		if (parent._childNodes[i] === child) {
           		  parent._childNodes.splice(i,1);
           		  break;
           		}
           	}
            
            //FIXME; childRemoved NYI
        },
        onNodeInserted: function(e) {
            var parent = e.target.parentNode._x3domNode;
            var child = e.target;
            
            //x3dom.debug.logInfo("MUTATION: " + e + ", " + e.type + ", inserted node=" + child.tagName);
            //x3dom.debug.logInfo("MUTATION: " + child.translation + ", " + child.parentNode.tagName);
            
            x3dom.parsingInline = true; // enable special case
            
            var newChild = scene._ctx.setupNodePrototypes(child, scene._ctx);

			// FIXME; 
			// parent.addChild(newChild);
            parent._childNodes.push(newChild);
            newChild._parentNodes.push(parent);
            
            x3dom.parsingInline = false; // disable special case
        }
    };
    
    //sceneDoc.addEventListener('DOMCharacterDataModified', domEventListener.onAttrModified, true);    
    sceneDoc.addEventListener('DOMNodeRemoved', domEventListener.onNodeRemoved, true);
    sceneDoc.addEventListener('DOMNodeInserted', domEventListener.onNodeInserted, true);
    sceneDoc.addEventListener('DOMAttrModified', domEventListener.onAttrModified, true);
    
    if ( window.navigator.userAgent.match(/webkit/i) )
    {
        //HTMLElement.prototype.__setAttribute = HTMLElement.prototype.setAttribute;
        //HTMLElement.prototype.setAttribute = set_attrib;
        var set_attrib = function(attrName, newVal)
        {
            var prevVal = this.getAttribute(attrName);
            this.__setAttribute(attrName, newVal);
            newVal = this.getAttribute(attrName);
            
            if (newVal != prevVal)
            {
                var evt = document.createEvent("MutationEvent");
                evt.initMutationEvent(
                  "DOMAttrModified",
                  true,
                  false,
                  this,
                  prevVal || "",
                  newVal || "",
                  attrName,
                  (prevVal == null) ? evt.ADDITION : evt.MODIFICATION
                );
                this.dispatchEvent(evt);
            }
        }
        
        function traverseDOMTree(currentElement, depth)
        {
            if (currentElement && currentElement.tagName !== undefined)
            {
                currentElement.__setAttribute = currentElement.setAttribute;
                currentElement.setAttribute = set_attrib;
                //currentElement.addEventListener("DOMAttrModified", domEventListener.onAttrModified, false);
                //x3dom.debug.logInfo(depth + ": " + currentElement.tagName);
                
                var i = 0;
                var currentElementChild = currentElement.childNodes[i++];
                
                while (currentElementChild)
                {
                    traverseDOMTree(currentElementChild, depth+1);
                    currentElementChild = currentElement.childNodes[i++];
                }
            }
        }
        
        traverseDOMTree(sceneDoc, 0);
    }
    
    var sceneElem = x3dom.findScene(sceneDoc);              // sceneDoc is the X3D element here...
    var scene = this._setupNodePrototypes(sceneElem, ctx);  // ROUTE creation in _setupNodePrototypes

    this._scene = scene;
	
	this._scene._width = this.canvas.width;
	this._scene._height = this.canvas.height;
};

x3dom.X3DDocument.prototype._setupNodePrototypes = function (node, ctx) {
    var n, t;	
    if (x3dom.isX3DElement(node)) {
        // x3dom.debug.logInfo("=== node=" + node.localName);
	    if (node.hasAttribute('USE')) {
	      n = ctx.defMap[node.getAttribute('USE')];
	      if (n == null) 
	        ctx.log ('Could not USE: '+node.getAttribute('USE'));
	      return n;
	    }
	    else {
	    	// FIXME; Should we create ROUTES at this position?
            // PE: Yes we should - and we do now :)
	    	if (node.localName.toLowerCase() === 'route') {
                var route = node;
                var fromNode = ctx.defMap[route.getAttribute('fromNode')];
                var toNode = ctx.defMap[route.getAttribute('toNode')];
                x3dom.debug.logInfo("ROUTE: from=" + fromNode._DEF + ", to=" + toNode._DEF);
                if (! (fromNode && toNode)) {
                    x3dom.debug.logInfo("Broken route - can't find all DEFs for " + route.getAttribute('fromNode')+" -> "+ route.getAttribute('toNode'));
                    return;
                }
                fromNode._setupRoute(route.getAttribute('fromField'), toNode, route.getAttribute('toField'));

//                 // XXX: handle imported ROUTEs
//                 TODO: Store the routes of the scene - where should we store them?
//                 scene._routes = Array.map(sceneRoutes, setupRoute);
	    		return null;
            }
            
            // PE: New code no longer uses the x3dom.nodeTypeMap (which is obsolete now)
            //     The autoChild property was added to the X3DGroupingNode base class (as _autoChild)
            // var nodeType = x3dom.nodeTypes[node.localName];            
            var nodeType = x3dom.nodeTypesLC[node.localName.toLowerCase()];
            if (nodeType === undefined) {                
                x3dom.debug.logInfo("Unrecognised element " + node.localName );
            }
            else {
                ctx.xmlNode = node;
                n = new nodeType(ctx);
                // x3dom.debug.logInfo("new node type: " + node.localName + ", autoChild=" + n._autoChild);
                node._x3domNode = n;
                if (n._autoChild === true) {
                    Array.forEach(Array.map(node.childNodes, 
                            function (n) { return ctx.setupNodePrototypes(n, ctx) }, this), 
                            function (c) { if (c) n.addChild(c) });
                }
                return n;
            }
        }
    }
};

x3dom.X3DDocument.prototype.advanceTime = function (t) {
    if (this._scene) {
        Array.forEach(this._scene._findAll(x3dom.nodeTypes.TimeSensor),
            function (timer) { timer._onframe(t); }
        );
    }
};

x3dom.X3DDocument.prototype.render = function (ctx) {
    if (!ctx)
        return;
    ctx.renderScene(this._scene);
}

x3dom.X3DDocument.prototype.ondrag = function (x, y, buttonState) {
    this._scene.ondrag(x, y, buttonState);
}

x3dom.X3DDocument.prototype.onMousePress = function (x, y, buttonState) {
    this._scene.onMousePress(x, y, buttonState);
}

x3dom.X3DDocument.prototype.onMouseRelease = function (x, y, buttonState) {
    this._scene.onMouseRelease(x, y, buttonState);
}

x3dom.X3DDocument.prototype.onDoubleClick = function (x, y) {
    this._scene.onDoubleClick(x, y);
}

x3dom.X3DDocument.prototype.onKeyPress = function(charCode) 
{
    //x3dom.debug.logInfo("pressed key " + charCode);
    switch (charCode)
    {
        case  97: /* a, view all */ 
            {
                this._scene.showAll();
            }
            break;
        //case 99: /* c */ 
		//	break;
        case 108: /* l, light view */ 
			{
                if (this._scene.getLights().length > 0)
                {
                    this._scene.getViewpoint().setView(this._scene.getLightMatrix());
                    this._scene._rotMat = x3dom.fields.SFMatrix4f.identity();
                    this._scene._transMat = x3dom.fields.SFMatrix4f.identity();
                    this._scene._movement = new x3dom.fields.SFVec3f(0, 0, 0);
                }
			}
			break;
        case 109: /* m, toggle "points" attribute */ 
			{
				if (this._scene._points === undefined)
					this._scene._points = true;
				else
					this._scene._points = !this._scene._points;
			}
			break;
        case 114: /* r, reset view */
            {
                this._scene.resetView();
            }
            break;
        default:
    }
}

x3dom.X3DDocument.prototype.shutdown = function(ctx)
{
    if (!ctx)
        return;
	ctx.shutdown(this._scene);
}
