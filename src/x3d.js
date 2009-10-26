/*!
* x3dom javascript library 0.1
* http://instantreality.org/
*
* Copyright (c) 2009 Peter Eschler, Johannes Behr, Yvonne Jung
*     based on code originally provided by Philip Taylor:
*     http://philip.html5.org/demos/canvas/3d/x3d/
* Dual licensed under the MIT and GPL licenses.
* 
*/

// x3dom.x3dNS = 'http://www.web3d.org/specifications/x3d-namespace'; // non-standard, but sort of supported by Xj3D
// x3dom.x3dextNS = 'http://philip.html5.org/x3d/ext';
// x3dom.xsltNS = 'http://www.w3.org/1999/XSL/x3dom.Transform';

// the x3dom.nodes namespace
// x3dom.nodes = {};

/** @namespace the x3dom.nodeTypes namespace. */
x3dom.nodeTypes = {};

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
    if (x3dom.components[componentName] == undefined) {
        x3dom.debug.logInfo("Adding new component [" + componentName + "]");
        x3dom.components[componentName] = {};
        x3dom.components[componentName][nodeTypeName] = nodeDef;
        x3dom.nodeTypes[nodeTypeName] = nodeDef
    }
    else {
        x3dom.debug.logInfo("Using component [" + componentName + "]");
        x3dom.components[componentName][nodeTypeName] = nodeDef;
        x3dom.nodeTypes[nodeTypeName] = nodeDef;
    }
};


/** Checks whether the given @p node is an X3D element.
	@return true, if the @p node is an X3D element
			false, if not
 */
x3dom.isX3DElement = function(node) {
    return (node.nodeType === Node.ELEMENT_NODE &&
        (node.namespaceURI == x3dom.x3dNS || node.namespaceURI == x3dom.x3dextNS));
}

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
    if (methods)
        for (var m in methods)
            ctor.prototype[m] = methods[m];
    return ctor;
}

x3dom.isa = function(object, clazz) {
    if (object.constructor == clazz)
        return true;

    function f(c) {
        if (c == clazz)
            return true;
        if (c.prototype && c.prototype.constructor && c.prototype.constructor.superClass)
            return f(c.prototype.constructor.superClass);
        return false;
    }
    return f(object.constructor.superClass);
}

// X3D doesn't seem to define this decoding, so do something vaguely sensible instead...
function MFString_parse(str) {
    // TODO: ignore leading whitespace?
    if (str[0] == '"') {
        var re = /"((?:[^\\"]|\\\\|\\")*)"/g;
        var m;
        var ret = [];
        while (m = re.exec(str))
            ret.push(m[1].replace(/\\([\\"])/, "$1"));
        return ret
    } else {
        return [str];
    }
}

/**** x3dom.nodeTypes.X3DNode ****/

// x3dom.nodeTypes.X3DNode = defineClass(null,
x3dom.registerNodeType("X3DNode", "base", defineClass(null,
    function (ctx) {
        if (ctx.xmlNode.hasAttribute('DEF')) {
            this._DEF = ctx.xmlNode.getAttribute('DEF');
			ctx.defMap[ctx.xmlNode.getAttribute('DEF')] = this;
		}
        this._typeName = ctx.xmlNode.localName;
        this._fieldWatchers = {};
        this._parentNodes = [];
    },
    {
        _getCurrentTransform: function () {
            if (this._parentNodes.length >= 1)
                return this._transformMatrix(this._parentNodes[0]._getCurrentTransform());
            else
                return x3dom.fields.SFMatrix4.identity();
        },

        _transformMatrix: function (transform) {
            return transform;
        },
		
		_getVolume: function (min, max, invalidate) 
        {
            var valid = false;
			for (var i in this._childNodes)
			{
				if (this._childNodes[i])
				{
					var childMin = new x3dom.fields.SFVec3(min.x, min.y, min.z);
					var childMax = new x3dom.fields.SFVec3(max.x, max.y, max.z);
					
					valid = this._childNodes[i]._getVolume(
                                    childMin, childMax, invalidate) || valid;
					
                    if (valid)
                    {
                        if (min.x > childMin.x) min.x = childMin.x;
                        if (min.y > childMin.y) min.y = childMin.y;
                        if (min.z > childMin.z) min.z = childMin.z;
                            
                        if (max.x < childMax.x) max.x = childMax.x;
                        if (max.y < childMax.y) max.y = childMax.y;
                        if (max.z < childMax.z) max.z = childMax.z;
                    }
				}
			}
            return valid;
		},

        _find: function (type) {
            for (var i in this._childNodes) {
                if (this._childNodes[i]) {
                    if (this._childNodes[i].constructor == type)
                        return this._childNodes[i];
                    var c = this._childNodes[i]._find(type);
                    if (c)
                        return c;
                }
            }
            return null;
        },

        _findAll: function (type) {
            var found = [];
            for (var i in this._childNodes) {
                if (this._childNodes[i]) {
                    if (this._childNodes[i].constructor == type)
                        found.push(this._childNodes[i]);
                    found = found.concat(this._childNodes[i]._findAll(type)); // TODO: this has non-linear performance
                }
            }
            return found;
        },

        /* Collects array of [transform matrix, node] for all objects that should be drawn. */
        _collectDrawableObjects: function (transform, out) {
            // TODO: culling etc
            for (var i in this._childNodes) {
                if (this._childNodes[i]) {
                    var childTransform = this._childNodes[i]._transformMatrix(transform);
                    this._childNodes[i]._collectDrawableObjects(childTransform, out);
                }
            }
        },
        
        _doIntersect: function(line) {
            for (var i in this._childNodes) {
                if (this._childNodes[i]) {
                    if (this._childNodes[i]._doIntersect(line))
                        return true;
                }
            }
            return false;
        },

        _getNodeByDEF: function (def) {
            // TODO: cache this so it's not so stupidly inefficient
            if (this._DEF == def) 
                return this;
            for (var i in this._childNodes) {
                if (this._childNodes[i]) {
                    var found = this._childNodes[i]._getNodeByDEF(def);
                    if (found)
                        return found;
                }
            }
            return null;
        },

        _postMessage: function (field, msg) {
            // TODO: timestamps and stuff
            //log_frame(this+' postmessage '+field+' - '+msg);
            var listeners = this._fieldWatchers[field];
            var thisp = this;
            if (listeners)
                Array.forEach(listeners, function (l) { l.call(thisp, msg); });
        },

        // PE: Hacky test for field updates
        _updateField: function (field, msg) {
		
            var fieldName = "_" +  field;
			
			var f = this[fieldName];
			
			if (f === undefined) {
				this[fieldName] = {};
				f = this[fieldName];
			}
			
            //x3dom.debug.logInfo("_updateField: field=" + field + ", msg=" + msg + ", f=" + f);
            if (f!==null) {
                //x3dom.debug.logInfo("_updateField: ####" + typeof(f));
                if (f.constructor === x3dom.fields.SFVec3) {
                    this[fieldName] = x3dom.fields.SFVec3.parse(msg);
                }
				//uhh, what a hack - but how to do it nicely?
				else if (msg == "true")
					this[fieldName] = true;
				else if (msg == "false")
					this[fieldName] = false;
            }
        },

        _setupRoute: function (fromField, toNode, toField) {
            if (! this._fieldWatchers[fromField])
                this._fieldWatchers[fromField] = [];
            this._fieldWatchers[fromField].push(function (msg) { toNode._postMessage(toField, msg); });

            if (! toNode._fieldWatchers[toField])
                toNode._fieldWatchers[toField] = [];
            toNode._fieldWatchers[toField].push(function (msg) {
				// uhh, this "_"-stuff is really inconsistent!
				if (toNode[toField] === undefined)
					toNode["_"+toField] = msg;
				else
					toNode[toField] = msg;
			});
        },
		
        _attribute_SFFloat: function (ctx, name, n) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? +ctx.xmlNode.getAttribute(name) : n;
        },
        _attribute_SFTime: function (ctx, name, n) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? +ctx.xmlNode.getAttribute(name) : n;
        },
        _attribute_SFBool: function (ctx, name, n) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? ctx.xmlNode.getAttribute(name) == "true" : n;
        },
        _attribute_SFString: function (ctx, name, n) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? ctx.xmlNode.getAttribute(name) : n;
        },
        _attribute_SFColor: function (ctx, name, r, g, b) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? x3dom.fields.SFVec3.parse(ctx.xmlNode.getAttribute(name)) : new x3dom.fields.SFVec3(r, g, b);
        },
        _attribute_SFVec3: function (ctx, name, x, y, z) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? x3dom.fields.SFVec3.parse(ctx.xmlNode.getAttribute(name)) : new x3dom.fields.SFVec3(x, y, z);
        },
        _attribute_SFRotation: function (ctx, name, x, y, z, a) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? x3dom.fields.Quaternion.parseAxisAngle(ctx.xmlNode.getAttribute(name)) : new x3dom.fields.Quaternion(x, y, z, a);
        },
        _attribute_MFString: function (ctx, name, def) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? MFString_parse(ctx.xmlNode.getAttribute(name)) : def;
        },
        _attribute_MFColor: function (ctx, name, def) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? x3dom.fields.MFColor.parse(ctx.xmlNode.getAttribute(name)) : new x3dom.fields.MFColor([new x3dom.fields.SFColor(0,0,0)]);
        },
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
            Array.forEach(ctx.xmlNode.childNodes, function (node) {
                if (x3dom.isX3DElement(node)) {
                    var child = ctx.setupNodePrototypes(node, ctx);
                    if (child) {
                        if (x3dom.isa(child, x3dom.nodeTypes.X3DMaterialNode)) {
                            ctx.assert(! material, 'has <= 1 material node');
                            material = child;
                        }
						else if (x3dom.isa(child, x3dom.nodeTypes.X3DTextureNode)) {
							texture = child;
						}
						else {
                            ctx.log('unrecognised x3dom.Appearance child node type '+node.localName);
                        }
                    }
                }
            });
            this._material = material;
			this._texture = texture;
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


// TODO: X3DTextureTransformNode


/** @class x3dom.Mesh
*/
x3dom.Mesh = function(parent) 
{
    this._parent = parent;
	this._min = new x3dom.fields.SFVec3(0,0,0);
	this._max = new x3dom.fields.SFVec3(0,0,0);
	this._invalidate = true;
}

x3dom.Mesh.prototype._positions = [];
x3dom.Mesh.prototype._normals   = [];
x3dom.Mesh.prototype._texCoords = [];
x3dom.Mesh.prototype._indices   = [];

x3dom.Mesh.prototype._min = {};
x3dom.Mesh.prototype._max = {};
x3dom.Mesh.prototype._invalidate = true;

x3dom.Mesh.prototype.getBBox = function(min, max, invalidate)
{
	if (this._invalidate == true && invalidate == true)	//need both?
	{
		var coords = this._positions;
		var n = coords.length;
		
		if (n > 3)
		{
			this._min = new x3dom.fields.SFVec3(coords[0],coords[1],coords[2]);
			this._max = new x3dom.fields.SFVec3(coords[0],coords[1],coords[2]);
		}
		else
		{
			this._min = new x3dom.fields.SFVec3(0,0,0);
			this._max = new x3dom.fields.SFVec3(0,0,0);
		}
		
		for (var i=3; i<n; i+=3)
		{
			if (this._min.x > coords[i+0])
				this._min.x = coords[i+0];
			if (this._min.y > coords[i+1])
				this._min.y = coords[i+1];
			if (this._min.z > coords[i+2])
				this._min.z = coords[i+2];
			
			if (this._max.x < coords[i+0])
				this._max.x = coords[i+0];
			if (this._max.y < coords[i+1])
				this._max.y = coords[i+1];
			if (this._max.z < coords[i+2])
				this._max.z = coords[i+2];
		}
		
		this._invalidate = false;
	}
	
	min.x = this._min.x;
	min.y = this._min.y;
	min.z = this._min.z;
	
	max.x = this._max.x;
	max.y = this._max.y;
	max.z = this._max.z;
}

x3dom.Mesh.prototype.getCenter = function() 
{
	var min = new x3dom.fields.SFVec3(0,0,0);
	var max = new x3dom.fields.SFVec3(0,0,0);
	
	this.getBBox(min, max, true);
	
	var center = min.add(max).scale(0.5);
	//x3dom.debug.logInfo("getCenter: " + min + " | " + max + " --> " + center);
	
	return center;
}

x3dom.Mesh.prototype.doIntersect = function(line)
{
	var min = new x3dom.fields.SFVec3(0,0,0);
	var max = new x3dom.fields.SFVec3(0,0,0);
	
	this.getBBox(min, max, true);
    
    var isect = line.intersect(min, max);
    
    //TODO: check for _nearest_ hit object and iterate over all faces!
    line.hit = isect;
    
    if (isect)
    {
        x3dom.debug.logInfo("Hit \"" + this._parent._typeName + "/" + this._parent._DEF + "\"");
        
        line.hitObject = this._parent;
        line.hitPoint = line.pos.add(line.dir.scale(line.enter));
    }
    
    return isect;
}

x3dom.Mesh.prototype.calcNormals = function(creaseAngle)
{
	//fixme; as first shot taken from gfx
	var coords = this._positions;
	var idxs = this._indices;
	
	var vertNormals = [];
	var vertFaceNormals = [];
	
	for (var i = 0; i < coords.length/3; ++i)
		vertFaceNormals[i] = [];

	for (var i = 0; i < idxs.length; i += 3) {
		var a = new x3dom.fields.SFVec3(
				coords[idxs[i  ]*3], coords[idxs[i  ]*3+1], coords[idxs[i  ]*3+2]).
			subtract(new x3dom.fields.SFVec3(
				coords[idxs[i+1]*3], coords[idxs[i+1]*3+1], coords[idxs[i+1]*3+2]));
		var b = new x3dom.fields.SFVec3(
				coords[idxs[i+1]*3], coords[idxs[i+1]*3+1], coords[idxs[i+1]*3+2]).
			subtract(new x3dom.fields.SFVec3(
				coords[idxs[i+2]*3], coords[idxs[i+2]*3+1], coords[idxs[i+2]*3+2]));
		
		var n = a.cross(b).normalised();
		vertFaceNormals[idxs[i  ]].push(n);
		vertFaceNormals[idxs[i+1]].push(n);
		vertFaceNormals[idxs[i+2]].push(n);
	}
	
    //TODO: creaseAngle
	for (var i = 0; i < coords.length; i += 3) {
		var n = new x3dom.fields.SFVec3(0, 0, 0);
		for (var j = 0; j < vertFaceNormals[i/3].length; ++j)
			n = n.add(vertFaceNormals[i/3][j]);
		
		n = n.normalised();
		vertNormals[i  ] = n.x;
		vertNormals[i+1] = n.y;
		vertNormals[i+2] = n.z;
	}
	
	this._normals = vertNormals;
}

x3dom.Mesh.prototype.calcTexCoords = function()
{
	//TODO
}

x3dom.Mesh.prototype.remapData = function()
{
	//x3dom.debug.logInfo("Indices:   "+this._indices);
	//x3dom.debug.logInfo("Positions: "+this._positions);
}


/**** x3dom.X3DGeometryNode ****/

// x3dom.X3DGeometryNode = defineClass(x3dom.nodeTypes.X3DNode,
x3dom.registerNodeType(
    "X3DGeometryNode",
    "base",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DGeometryNode.superClass.call(this, ctx);
			
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
                return isect;
            },
		}
    )
);


// TODO: Arc2D
// TODO: ArcClose2D

//x3dom.Box = defineClass(x3dom.X3DGeometryNode,
x3dom.registerNodeType(
    "Box",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Box.superClass.call(this, ctx);
    
            var sx, sy, sz;
            if (ctx.xmlNode.hasAttribute('size')) {
                var size = x3dom.fields.SFVec3.parse(ctx.xmlNode.getAttribute('size'));
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
                -sx,-sy,-sz,  -sx,-sy, sz,   sx,-sy, sz,   sx,-sy,-sz, //unten 0,-1,0
            ];
			this._mesh._normals = [
                0,0,-1,  0,0,-1,   0,0,-1,   0,0,-1,
                0,0,1,  0,0,1,   0,0,1,   0,0,1,
                -1,0,0,  -1,0,0,  -1,0,0,  -1,0,0,
                1,0,0,   1,0,0,   1,0,0,   1,0,0,
                0,1,0,  0,1,0,   0,1,0,   0,1,0,
                0,-1,0,  0,-1,0,   0,-1,0,   0,-1,0,
            ];
			this._mesh._texCoords = [
				1,0, 1,1, 0,1, 0,0, 
				0,0, 0,1, 1,1, 1,0, 
				0,0, 1,0, 1,1, 0,1, 
				1,0, 0,0, 0,1, 1,1, 
				0,1, 0,0, 1,0, 1,1, 
				0,0, 0,1, 1,1, 1,0, 
			];
            this._mesh._indices = [
                0,1,2, 2,3,0,
                4,7,5, 5,7,6,
                8,9,10, 10,11,8,
                12,14,13, 14,12,15,
                16,17,18, 18,19,16,
                20,22,21, 22,20,23,
            ];
			this._mesh._invalidate = true;
        }
    )
);

// TODO: Circle2D
// TODO: Cone
// TODO: Cylinder
// TODO: Disk2D
// TODO: ElevationGrid
// TODO: Extrusion
// TODO: GeoElevationGrid
// TODO: IndexedLineSet
// TODO: LineSet
// TODO: PointSet
// TODO: Polyline2D
// TODO: Polypoint2D
// TODO: Rectangle2D

// x3dom.Sphere = defineClass(x3dom.X3DGeometryNode,
x3dom.registerNodeType(
    "Sphere",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Sphere.superClass.call(this, ctx);
    
            var r;
            if (ctx.xmlNode.hasAttribute('radius'))
                r = +ctx.xmlNode.getAttribute('radius');
            else
                r = 1;
    
            // Start with an octahedron
            var verts = [
                0,0,-r, r,0,0, 0,0,r, -r,0,0, 0,-r,0, 0,r,0,
            ];
            var norms = [
                0,0,-1, 1,0,0, 0,0,1, -1,0,0, 0,-1,0, 0,1,0,
            ];
            var tris = [
                0,1,4, 1,2,4, 2,3,4, 3,0,4,
                1,0,5, 2,1,5, 3,2,5, 0,3,5,
            ];
    
            var new_verts, new_tris;
            function add_vertex(a, b) {
                if (a > b) { var t = a; a = b; b = t; }
                if (new_verts[a] === undefined) new_verts[a] = [];
                if (new_verts[a][b] === undefined) {
                    new_verts[a][b] = verts.length / 3;
                    var x = (verts[a*3  ] + verts[b*3  ])/2;
                    var y = (verts[a*3+1] + verts[b*3+1])/2;
                    var z = (verts[a*3+2] + verts[b*3+2])/2;
                    var s = r / Math.sqrt(x*x + y*y + z*z);
					var xs = x*s, ys = y*s, zs = z*s;
                    verts.push(xs, ys, zs);
					// calculate normals
					var l = Math.sqrt(xs*xs + ys*ys + zs*zs);
					norms.push(xs/l, ys/s, zs/l);
                }
                return new_verts[a][b];
            }
            for (var k = 0; k < 3; ++k) { // repeated subdivision
                new_verts = [];
                new_tris = [];
                for (var i = 0; i < tris.length; i += 3) {
                    var a = add_vertex(tris[i  ], tris[i+1]);
                    var b = add_vertex(tris[i+1], tris[i+2]);
                    var c = add_vertex(tris[i+2], tris[i  ]);
                    new_tris.push(tris[i],a,c, tris[i+1],b,a, tris[i+2],c,b, a,b,c);
                }
                tris = new_tris;
            }
			
            this._mesh._positions = verts;
            this._mesh._normals = norms;
            this._mesh._indices = tris;
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
			
            if (ctx.xmlNode.hasAttribute('innerRadius'))
                innerRadius = +ctx.xmlNode.getAttribute('innerRadius');
            if (ctx.xmlNode.hasAttribute('outerRadius'))
                outerRadius = +ctx.xmlNode.getAttribute('outerRadius');
			
			var rings = 24, sides = 24;
			var ringDelta = 2.0 * Math.PI / rings;
			var sideDelta = 2.0 * Math.PI / sides;
			var p = [], n = [], t = [], i = [];

			for (var a=0, theta=0; a <= rings; a++, theta+=ringDelta) 
			{
				var cosTheta = Math.cos(theta);
				var sinTheta = Math.sin(theta);

				for (var b=0, phi=0; b<=sides; b++, phi+=sideDelta) 
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
			
            if (ctx.xmlNode.hasAttribute('bottomRadius'))
                bottomRadius = +ctx.xmlNode.getAttribute('bottomRadius');
            if (ctx.xmlNode.hasAttribute('height'))
                height = +ctx.xmlNode.getAttribute('height');
			
			var sides = 32;
			var delta = 2.0 * Math.PI / sides;
			var incl = bottomRadius / height;
			var nlen = 1.0 / Math.sqrt(1.0 + incl * incl);
			var p = [], n = [], t = [], i = [];
			
			for (var j=0, k=0; j<=sides; j++)
			{
				var beta = j * delta;
				var x = Math.sin(beta);
				var z = -Math.cos(beta);         

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
			
            if (ctx.xmlNode.hasAttribute('radius'))
                radius = +ctx.xmlNode.getAttribute('radius');
            if (ctx.xmlNode.hasAttribute('height'))
                height = +ctx.xmlNode.getAttribute('height');
			
			var sides = 24;
			var delta = 2.0 * Math.PI / sides;
			var p = [], n = [], t = [], i = [];
			
			for (var j=0, k=0; j<=sides; j++)
			{
				var beta = j * delta;
				var x = Math.sin(beta);
				var z = -Math.cos(beta);         

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
                        if (x3dom.isa(child, x3dom.X3DFontStyleNode)) {
                            ctx.assert(! style, 'has <= 1 fontStyle node');
                            style = child;
                        } else {
                            ctx.log('unrecognised x3dom.Text child node type '+node.localName);
                        }
                    }
                }
            });
            this._fontStyle = style;
        }
    )
);


// TODO: TriangleSet2D
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
            
            var creaseAngle = Math.PI;
            
            if (ctx.xmlNode.hasAttribute('creaseAngle'))
                creaseAngle = +ctx.xmlNode.getAttribute('creaseAngle');
			
			var t0 = new Date().getTime();
			
            var indexes = ctx.xmlNode.getAttribute('coordIndex').match(/((?:\+|-)?\d+)/g);
			var normalInd;
			
			//TODO; also check texCoords here: texCoordIndex
			var isMulti = false;
			
			if (ctx.xmlNode.hasAttribute('normalIndex'))
			{
				normalInd = ctx.xmlNode.getAttribute('normalIndex').match(/((?:\+|-)?\d+)/g);
				isMulti = (indexes.length == normalInd.length);
				x3dom.debug.logInfo("Found MultiIndex Mesh");
			}
			
			//if (isMulti)
			if (false)	//TODO!!!
			{
			this._mesh._indices = [];
			this._mesh._positions = [];
			this._mesh._normals = [];
			
			var positions = [];
			var normals = [];
			
			var coordNode = Array.filter(ctx.xmlNode.childNodes, 
					function (n) { return (x3dom.isX3DElement(n) && n.localName == 'Coordinate') });
			ctx.assert(coordNode.length == 1);
            positions = Array.map(coordNode[0].getAttribute('point').match(/([+\-0-9eE\.]+)/g), function (n) { return +n });
			
			var normalNode = Array.filter(ctx.xmlNode.childNodes, 
					function (n) { return (x3dom.isX3DElement(n) && n.localName == 'Normal') });
            ctx.assert(normalNode.length == 1);
				normals = Array.map(normalNode[0].getAttribute('vector').match(/([+\-0-9eE\.]+)/g), function (n) { return +n });
			
			
            var t = 0, p0, p1, p2, n0, n1, n2, cnt = 0;
			
            for (var i=0; i < indexes.length; ++i) {
                // Convert non-triangular polygons to a triangle fan
                // (TODO: this assumes polygons are convex)
                if (indexes[i] == -1) {
                    t = 0;
                    continue;
                }
				ctx.assert(normalInd[i] != -1);
				
                switch (t) {
                case 0: 
					p0 = +indexes[i];
					n0 = +normalInd[i]; 
					t = 1; 
					break;
                case 1: 
					p1 = +indexes[i];
					n1 = +normalInd[i]; 
					t = 2; 
					break;
                case 2: 
					p2 = +indexes[i];
					n2 = +normalInd[i]; 
					t = 3; 
					//this._mesh._indices.push(p0, p1, p2);
					this._mesh._indices.push(cnt++, cnt++, cnt++);
					this._mesh._positions.push(positions[p0]);
					this._mesh._positions.push(positions[p1]);
					this._mesh._positions.push(positions[p2]);
					this._mesh._normals.push(normals[n0]);
					this._mesh._normals.push(normals[n1]);
					this._mesh._normals.push(normals[n2]);
					break;
                case 3: 
					p1 = p2; p2 = +indexes[i];
					n1 = n2; n2 = +normalInd[i]; 
					//this._mesh._indices.push(p0, p1, p2); 
					this._mesh._indices.push(cnt++, cnt++, cnt++);
					this._mesh._positions.push(positions[p0]);
					this._mesh._positions.push(positions[p1]);
					this._mesh._positions.push(positions[p2]);
					this._mesh._normals.push(normals[n0]);
					this._mesh._normals.push(normals[n1]);
					this._mesh._normals.push(normals[n2]);
					break;
                }
            }
			
			//TODO: this currently does nothing...
			this._mesh.calcTexCoords();
			this._mesh.remapData();
				
			} // if isMulti
			else
			{
			
            this._mesh._indices = [];
			
            var t = 0, n0, n1, n2;
			
            for (var i = 0; i < indexes.length; ++i) {
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
            // TODO: solid; ccw; creaseAngle
    
            var coordNode = Array.filter(ctx.xmlNode.childNodes, 
					function (n) { return (x3dom.isX3DElement(n) && n.localName == 'Coordinate') });
			ctx.assert(coordNode.length == 1);
            this._mesh._positions = Array.map(coordNode[0].getAttribute('point').match(/([+\-0-9eE\.]+)/g), function (n) { return +n });
			
			var normalNode = Array.filter(ctx.xmlNode.childNodes, 
					function (n) { return (x3dom.isX3DElement(n) && n.localName == 'Normal') });
            if (normalNode.length == 1 && !isMulti)
				this._mesh._normals = Array.map(normalNode[0].getAttribute('vector').match(/([+\-0-9eE\.]+)/g), function (n) { return +n });
			else
				this._mesh.calcNormals(creaseAngle);
			
            var texCoordNode = Array.filter(ctx.xmlNode.childNodes, 
					function (n) { return (x3dom.isX3DElement(n) && n.localName == 'TextureCoordinate') });
            if (texCoordNode.length == 1 && !isMulti)
				this._mesh._texCoords = Array.map(texCoordNode[0].getAttribute('point').match(/([+\-0-9eE\.]+)/g), function (n) { return +n });
			else
				this._mesh.calcTexCoords();
			
			this._mesh.remapData();
			}
			
			this._mesh._invalidate = true;
			
			var t1 = new Date().getTime() - t0;
			x3dom.debug.logInfo("Mesh load time: " + t1 + " ms");
			
			// TODO: fixme, what about geoProperty nodes?
			// Coordinate 		 - X3DCoordinateNode 		- X3DGeometricPropertyNode 
			// Normal 			 - X3DNormalNode 			- X3DGeometricPropertyNode
			// TextureCoordinate - X3DTextureCoordinateNode - X3DGeometricPropertyNode 
        }
    )
);


// TODO: IndexedTriangleFanSet
// TODO: IndexedTriangleSet
// TODO: IndexedTriangleStripSet
// TODO: TriangleFanSet
// TODO: TriangleSet
// TODO: TriangleStripSet

// TODO: X3DParametricGeometryNode

// TODO: ...

/**** x3dom.X3DFontStyleNode ****/

// x3dom.X3DFontStyleNode = defineClass(x3dom.nodeTypes.X3DNode,
x3dom.registerNodeType( 
    "X3DFontStyleNode",
    "base",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DFontStyleNode.superClass.call(this, ctx);
        }
    )
);

// x3dom.FontStyle = defineClass(x3dom.X3DFontStyleNode,
x3dom.registerNodeType( 
    "FontStyle",
    "Text",
    defineClass(x3dom.nodeTypes.X3DFontStyleNode,
        function (ctx) {
            x3dom.nodeTypes.FontStyle.superClass.call(this, ctx);
    
            this._attribute_MFString(ctx, 'family', ['SERIF']);
            this._attribute_SFFloat(ctx, 'size', 1.0);
        }
    )
);

/**** x3dom.X3DChildNode ****/

//x3dom.X3DChildNode = defineClass(x3dom.nodeTypes.X3DNode,
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

// TODO: ...

// x3dom.Viewpoint = defineClass(x3dom.X3DBindableNode,
x3dom.registerNodeType( 
    "Viewpoint",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        function (ctx) {
            x3dom.nodeTypes.Viewpoint.superClass.call(this, ctx);
			this._attribute_SFFloat(ctx, 'fieldOfView', 0.785398);
            this._attribute_SFVec3(ctx, 'position', 0, 0, 10);
            this._attribute_SFRotation(ctx, 'orientation', 0, 0, 0, 1);
			this._attribute_SFVec3(ctx, 'centerOfRotation', 0, 0, 0);
            this._attribute_SFFloat(ctx, 'zNear', 0.1);
            this._attribute_SFFloat(ctx, 'zFar', 100000);
			
            this._viewMatrix = this._orientation.toMatrix().transpose().
				mult(x3dom.fields.SFMatrix4.translation(this._position.negate()));
            this._projMatrix = null;
        },
        {
			getCenterOfRotation: function() {
                return this._centerOfRotation;
			},
			getViewMatrix: function() {
                return this._viewMatrix;
			},
			getFieldOfView: function() {
				return this._fieldOfView;
			},
            
            getProjectionMatrix: function(aspect)
            {
                if (this._projMatrix == null)
                {
                    var fovy = this._fieldOfView;
                    var zfar = this._zFar;
                    var znear = this._zNear;
                    
                    var f = 1/Math.tan(fovy/2);
                    this._projMatrix = new x3dom.fields.SFMatrix4(
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
    "NavigationInfo",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        function (ctx) {
            x3dom.nodeTypes.NavigationInfo.superClass.call(this, ctx);
            
			this._attribute_SFBool(ctx, 'headlight', true);
            this._attribute_MFString(ctx, 'type', []);
            
            x3dom.debug.logInfo("NavigationInfo NYI");
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
			
            this._attribute_MFColor(ctx, 'skyColor', new x3dom.fields.MFColor([new x3dom.fields.SFColor(0,0,0)]));
            this._attribute_SFFloat(ctx, 'transparency', 0);
        },
        {
			getSkyColor: function() {
				return this._skyColor;
			},
			getTransparency: function() {
				return this._transparency;
			},
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
            this._attribute_SFBool(ctx, 'on', true);
        },
        {
			// methods
        }
    )
);

x3dom.registerNodeType( 
    "DirectionalLight",
    "Lighting",
    defineClass(x3dom.nodeTypes.X3DLightNode,
        function (ctx) {
            x3dom.nodeTypes.DirectionalLight.superClass.call(this, ctx);
            
            this._attribute_SFVec3(ctx, 'direction', 1, 1, 1);
            
            x3dom.debug.logInfo("DirectionalLight NYI");
        },
        {
			// methods
        }
    )
);

// TODO: ...

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
    
            var appearance, geometry;
            Array.forEach(ctx.xmlNode.childNodes, function (node) {
                if (x3dom.isX3DElement(node)) {
                    var child = ctx.setupNodePrototypes(node, ctx);
                    if (child) {
                        if (x3dom.isa(child, x3dom.nodeTypes.X3DAppearanceNode)) {
                            ctx.assert(! appearance, 'has <= 1 appearance node');
                            appearance = child;
                        } else if (x3dom.isa(child, x3dom.nodeTypes.X3DGeometryNode)) {
                            ctx.assert(! geometry, 'has <= 1 geometry node');
                            geometry = child;
                        } else {
                            ctx.log('unrecognised x3dom.Shape child node type '+node.localName);
                        }
                    }
                }
            });
			
            ctx.assert(appearance && geometry, 'has appearance and geometry');
            this._appearance = appearance;
            this._geometry = geometry;
        },
        {
            _collectDrawableObjects: function (transform, out) {
                // TODO: culling etc
                out.push( [transform, this] );
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
        },
        {
            addChild: function (node) {
                this._childNodes.push(node);
                node._parentNodes.push(this);
            },
			//TODO: removeChild
        }
    )
);

// TODO: ...

// x3dom.Transform = defineClass(x3dom.X3DGroupingNode,
x3dom.registerNodeType(
    "Transform",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Transform.superClass.call(this, ctx);
			this._attribute_SFVec3(ctx, 'center', 0, 0, 0);
            this._attribute_SFVec3(ctx, 'translation', 0, 0, 0);
            this._attribute_SFRotation(ctx, 'rotation', 0, 0, 0, 1);
            this._attribute_SFVec3(ctx, 'scale', 1, 1, 1);
			this._attribute_SFRotation(ctx, 'scaleOrientation', 0, 0, 0, 1);
			// BUG? default of rotation according to spec is (0, 0, 1, 0)
			//		but results sometimes are wrong if not (0, 0, 0, 1)
			// TODO; check quaternion/ matrix code and state init...
            
            this._trafo = x3dom.fields.SFMatrix4.translation(this._translation).
							mult(x3dom.fields.SFMatrix4.translation(this._center)).
							mult(this._rotation.toMatrix()).
							mult(this._scaleOrientation.toMatrix()).
							mult(x3dom.fields.SFMatrix4.scale(this._scale)).
							mult(this._scaleOrientation.toMatrix().inverse()).
							mult(x3dom.fields.SFMatrix4.translation(this._center.negate()));
        },
        {
            _transformMatrix: function(transform) {
				// P' = T * C * R * SR * S * -SR * -C * P
				
                // TODO; optimize (only on change) - but field changes are not yet checked...
				this._trafo = x3dom.fields.SFMatrix4.translation(this._translation).
							mult(x3dom.fields.SFMatrix4.translation(this._center)).
							mult(this._rotation.toMatrix()).
							mult(this._scaleOrientation.toMatrix()).
							mult(x3dom.fields.SFMatrix4.scale(this._scale)).
							mult(this._scaleOrientation.toMatrix().inverse()).
							mult(x3dom.fields.SFMatrix4.translation(this._center.negate()));
							
                return transform.mult(this._trafo);
            },
			
			_getVolume: function(min, max, invalidate) 
            {
				var nMin = new x3dom.fields.SFVec3(
                        Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
				var nMax = new x3dom.fields.SFVec3(
                        Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
                var valid = false;
                
				for (var i in this._childNodes)
				{
					if (this._childNodes[i])
					{
						var childMin = new x3dom.fields.SFVec3(0,0,0);
						var childMax = new x3dom.fields.SFVec3(0,0,0);
						
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
                
                var tmpPos = new x3dom.fields.SFVec3(line.pos.x, line.pos.y, line.pos.z);
                var tmpDir = new x3dom.fields.SFVec3(line.dir.x, line.dir.y, line.dir.z);
                
                line.pos = mat.multMatrixPnt(line.pos);
                line.dir = mat.multMatrixVec(line.dir);
                
                for (var i in this._childNodes) 
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
                
                line.pos = new x3dom.fields.SFVec3(tmpPos.x, tmpPos.y, tmpPos.z);
                line.dir = new x3dom.fields.SFVec3(tmpDir.x, tmpDir.y, tmpDir.z);
                
                return isect;
            },
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

// TODO: ...

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

// TODO: ...

// x3dom.OrientationInterpolator = defineClass(x3dom.X3DInterpolatorNode,
x3dom.registerNodeType(
    "OrientationInterpolator",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        function (ctx) {
            x3dom.nodeTypes.OrientationInterpolator.superClass.call(this, ctx);
            
            if (ctx.xmlNode.hasAttribute('keyValue'))
                this._keyValue = x3dom.fields.MFRotation.parse(ctx.xmlNode.getAttribute('keyValue'));
                //this._keyValue = Array.map(ctx.xmlNode.getAttribute('keyValue').split(/\s*,\s*/), x3dom.fields.Quaternion.parseAxisAngle);
            else
                this._keyValue = [];
            
            this._fieldWatchers.set_fraction = [ function (msg) {
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
                this._keyValue = x3dom.fields.MFVec3.parse(ctx.xmlNode.getAttribute('keyValue'));
            else
                this._keyValue = [];
            
            this._fieldWatchers.set_fraction = [ function (msg) {
                var value = this._linearInterp(msg, function (a, b, t) { return a.scale(1.0-t).add(b.scale(t)); });
                this._postMessage('value_changed', value);
            } ];
        }
    )
);

// TODO: ...

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
    
            this._attribute_SFTime(ctx, 'cycleInterval', 1);
            this._attribute_SFBool(ctx, 'loop', false);
            this._attribute_SFTime(ctx, 'startTime', 0);
    
            this._fraction = 0;
        },
        {
            _onframe: function (ts) {
            	var isActive = ( ts >= this._startTime);
            	var cycleFrac, cycle, fraction;
            	
            	if (this._cycleInterval > 0) {
            	  cycleFrac = (ts - this._startTime) / this._cycleInterval;
            	  cycle = Math.floor(cycleFrac);
            	  fraction = cycleFrac - cycle;
            	}
     
     			this._postMessage('fraction_changed', fraction );
            },
        }
    )
);

// TODO: ...

// Not a real X3D node type
// x3dom.Scene = defineClass(x3dom.X3DGroupingNode,
x3dom.registerNodeType( 
    "Scene",
    "base",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Scene.superClass.call(this, ctx);
			this._rotMat = x3dom.fields.SFMatrix4.identity();
			this._transMat = x3dom.fields.SFMatrix4.identity();
			this._movement = new x3dom.fields.SFVec3(0, 0, 0);
            
			this._width = 400;
			this._height = 300;
            this._lastX = -1;
            this._lastY = -1;
            this._pick = new x3dom.fields.SFVec3(0, 0, 0);
            
			this._cam = null;
            this._bgnd = null;
        },
        {
        	getViewpoint: function() {
        		if (this._cam == null) 
					this._cam = this._find(x3dom.nodeTypes.Viewpoint);
					
  				return this._cam;
        	},
        	
			getVolume: function(min, max, invalidate)
			{
				var MIN = new x3dom.fields.SFVec3(
					Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
				var MAX = new x3dom.fields.SFVec3(
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
			
            getViewpointMatrix: function () {
                var viewpoint = this.getViewpoint();
                var mat_viewpoint = viewpoint._getCurrentTransform();
				return mat_viewpoint.mult(viewpoint.getViewMatrix());
            },
    
            getViewMatrix: function () {
                var viewpoint = this.getViewpoint();
                //return x3dom.fields.SFMatrix4.translation(this._movement)
                return this.getViewpointMatrix().
							mult(this._transMat).
							mult(this._rotMat);
            },
			
			getFieldOfView: function() {
                var viewpoint = this.getViewpoint();
				if (viewpoint !== null)
					return viewpoint.getFieldOfView();
				else
					return 0.785398;
			},
			
			getSkyColor: function() {
                if (this._bgnd == null)
                    this._bgnd = this._find(x3dom.nodeTypes.Background);
				var bgCol;
				
				if (this._bgnd !== null) {
					bgCol = this._bgnd.getSkyColor().toGL();
					//workaround; impl. skyTransparency etc.
					if (bgCol.length > 2)
						bgCol[3] = 1.0 - this._bgnd.getTransparency();
				}
				else
					bgCol = new Array(0,0,0,1);
				
				return bgCol;
			},
            
            getProjectionMatrix: function() {
                var viewpoint = this.getViewpoint();
				if (viewpoint !== null) 
                {
					return viewpoint.getProjectionMatrix(this._width/this._height);
                }
                else 
                {
                    var fov = this.getFieldOfView();
                    var aspect = this._width / this._height;
                    var znear = 0.1, zfar = 100000;
                    var f = 1/Math.tan(fovy/2);
                    var m = new x3dom.fields.SFMatrix4(
                        f/aspect, 0, 0, 0,
                        0, f, 0, 0,
                        0, 0, (znear+zfar)/(znear-zfar), 2*znear*zfar/(znear-zfar),
                        0, 0, -1, 0
                    );
                    return m;
                }
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
                
                var from = cctowc.multFullMatrixPnt(new x3dom.fields.SFVec3(rx, ry, -1));
                var at = cctowc.multFullMatrixPnt(new x3dom.fields.SFVec3(rx, ry,  1));
                var dir = at.subtract(from);
                
                return new x3dom.fields.Line(from, dir);
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
                    this._pick = line.pos.add(line.dir.scale(u));
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
                var viewpoint = this.getViewpoint();
                
                viewpoint._centerOfRotation.x = this._pick.x;
                viewpoint._centerOfRotation.y = this._pick.y;
                viewpoint._centerOfRotation.z = this._pick.z;
                x3dom.debug.logInfo("New center of Rotation:  " + this._pick);
            },
    		
            //ondrag: function (dx, dy, buttonState) 
            ondrag: function (x, y, buttonState) 
            {
                var dx = x - this._lastX;
                var dy = y - this._lastY;
                
				if (buttonState & 1) 
                {
					var alpha = (dy * 2 * Math.PI) / this._width;
					var beta = (dx * 2 * Math.PI) / this._height;
					var mat = this.getViewMatrix();
					
					var mx = x3dom.fields.SFMatrix4.rotationX(alpha);
					var my = x3dom.fields.SFMatrix4.rotationY(beta);
					
					var viewpoint = this.getViewpoint();
					var center = viewpoint.getCenterOfRotation();
					
					mat.setTranslate(new x3dom.fields.SFVec3(0,0,0));
					this._rotMat = this._rotMat.
									mult(x3dom.fields.SFMatrix4.translation(center)).
									mult(mat.inverse()).
									mult(mx).mult(my).
									mult(mat).
									mult(x3dom.fields.SFMatrix4.translation(center.negate()));
				}
				if (buttonState & 4) 
                {
					var min = new x3dom.fields.SFVec3(0,0,0);
					var max = new x3dom.fields.SFVec3(0,0,0);
					var ok = this.getVolume(min, max, true);
					
					var d = ok ? (max.subtract(min)).length() : 10;
					//x3dom.debug.logInfo("PAN: " + min + " / " + max + " D=" + d);
					//x3dom.debug.logInfo("w="+this._width+", h="+this._height);
					
					var vec = new x3dom.fields.SFVec3(d*dx/this._width,d*(-dy)/this._height,0);
					this._movement = this._movement.add(vec);
                    
                    //TODO; move real distance along viewing plane
					var viewpoint = this.getViewpoint();
					this._transMat = viewpoint.getViewMatrix().inverse().
								mult(x3dom.fields.SFMatrix4.translation(this._movement)).
								mult(viewpoint.getViewMatrix());
				}
				if (buttonState & 2) 
                {
					var min = new x3dom.fields.SFVec3(0,0,0);
					var max = new x3dom.fields.SFVec3(0,0,0);
					var ok = this.getVolume(min, max, true);
					
					var d = ok ? (max.subtract(min)).length() : 10;
					//x3dom.debug.logInfo("ZOOM: " + min + " / " + max + " D=" + d);
					//x3dom.debug.logInfo((dx+dy)+" w="+this._width+", h="+this._height);
					
					var vec = new x3dom.fields.SFVec3(0,0,d*(dx+dy)/this._height);
					this._movement = this._movement.add(vec);
                    
                    //TODO; move real distance along viewing ray
					var viewpoint = this.getViewpoint();
					this._transMat = viewpoint.getViewMatrix().inverse().
								mult(x3dom.fields.SFMatrix4.translation(this._movement)).
								mult(viewpoint.getViewMatrix());
				}
                
                this._lastX = x;
                this._lastY = y;
            }
        }
    )
);

/* Extension nodes: */

var namespaceFixerXsltProcessor = new XSLTProcessor();
namespaceFixerXsltProcessor.importStylesheet(new DOMParser().parseFromString(
    '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
    '  <xsl:template match="*" priority="3">' +
    '    <xsl:element name="{local-name()}" namespace="' + x3dom.x3dNS + '">' +
    '      <xsl:apply-templates select="@*|node()"/>' +
    '    </xsl:element>' +
    '  </xsl:template>' +
    '  <xsl:template match="node()|@*">' +
    '    <xsl:copy>' +
    '      <xsl:apply-templates select="@*|node()"/>' +
    '    </xsl:copy>' +
    '  </xsl:template>' +
    '</xsl:stylesheet>',
'application/xml'));

var defaultXsltDoc = new DOMParser().parseFromString(
    '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:x3d="http://www.web3d.org/specifications/x3d-namespace">' +
    '  <xsl:template match="node()|@*">' +
    '    <xsl:copy>' +
    '      <xsl:apply-templates select="@*|node()"/>' +
    '    </xsl:copy>' +
    '  </xsl:template>' +
    '</xsl:stylesheet>',
'application/xml');

x3dom.registerNodeType(
    "Inline",
    "base",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.Inline.superClass.call(this, ctx);
            var urlSplit = ctx.xmlNode.getAttribute('url').split('#', 2);
            var doc = ctx.docs[urlSplit[0]];
    
            // Fix namespaceless X3D documents
            if (doc.documentElement.localName == 'X3D' && doc.documentElement.namespaceURI === null)
                doc = namespaceFixerXsltProcessor.transformToDocument(doc);
    
            var target, m;
            if (m = urlSplit[1].match(/^xpointer\((.*)\)$/)) {
                target = x3dom.xpath(doc, m[1])[0];
            } else {
                target = x3dom.xpath(doc, '//*[@DEF="'+urlSplit[1]+'"]')[0];
            }
    
            // Apply the user's transformations
            if (ctx.xmlNode.childNodes.length) {
                //log(new XMLSerializer().serializeToString(target));
                var xsltDoc;
                Array.forEach(ctx.xmlNode.childNodes, function (node) {
                    if (node.nodeType == Node.ELEMENT_NODE && node.namespaceURI == x3dom.xsltNS) {
                        if (node.localName == 'stylesheet') {
                            var xsltProcessor = new XSLTProcessor();
                            xsltProcessor.importStylesheet(node);
                            target = xsltProcessor.transformToFragment(target, document).firstChild;
                        } else {
                            if (! xsltDoc) {
                                // Opera doesn't support Document.cloneNode, so fake it
                                xsltDoc = document.implementation.createDocument(null, 'dummy', null);
                                xsltDoc.replaceChild(xsltDoc.importNode(defaultXsltDoc.documentElement, true), xsltDoc.documentElement);
                            }
                            xsltDoc.documentElement.appendChild(xsltDoc.importNode(node, true));
                        }
                    }
                });
                if (xsltDoc) {
                    var xsltProcessor = new XSLTProcessor();
                    xsltProcessor.importStylesheet(xsltDoc);
                    target = xsltProcessor.transformToFragment(target, document).firstChild;
                }
                //log(new XMLSerializer().serializeToString(target));
            }
            this._childNodes = [ ctx.setupNodePrototypes(target, ctx) ];
            this._childNodes[0]._parentNodes.push(this);
        },
        {
            _getNodeByDEF: function (def) {
                var parts = def.split(' ', 2);
                if (parts[0] == this._DEF)
                    return this._childNodes[0]._getNodeByDEF(parts[1]);
            },
        }
    )
);


x3dom.nodeTypeMap = {
    'Appearance': { ctor: x3dom.nodeTypes.Appearance },
    'Box': { ctor: x3dom.nodeTypes.Box },
	'Background': { ctor: x3dom.nodeTypes.Background },
	'Cone': { ctor: x3dom.nodeTypes.Cone },
	'Cylinder': { ctor: x3dom.nodeTypes.Cylinder },
    'DirectionalLight': { ctor: x3dom.nodeTypes.DirectionalLight },
    'FontStyle': { ctor: x3dom.nodeTypes.FontStyle },
	'Group': { ctor: x3dom.nodeTypes.Group, autoChild: 1 },
	'ImageTexture': { ctor: x3dom.nodeTypes.ImageTexture },
    'IndexedFaceSet': { ctor: x3dom.nodeTypes.IndexedFaceSet },
    'Inline': { ctor: x3dom.nodeTypes.Inline }, // TODO: handle namespaces properly
    'Material': { ctor: x3dom.nodeTypes.Material },
    'NavigationInfo': { ctor: x3dom.nodeTypes.NavigationInfo },
    'OrientationInterpolator': { ctor: x3dom.nodeTypes.OrientationInterpolator },
    'PositionInterpolator': { ctor: x3dom.nodeTypes.PositionInterpolator },
    'Scene': { ctor: x3dom.nodeTypes.Scene, autoChild: 1 },
    'Shape': { ctor: x3dom.nodeTypes.Shape },
    'Sphere': { ctor: x3dom.nodeTypes.Sphere },
    'Text': { ctor: x3dom.nodeTypes.Text },
	'Torus': { ctor: x3dom.nodeTypes.Torus },
    'Transform': { ctor: x3dom.nodeTypes.Transform, autoChild: 1 },
    'TimeSensor': { ctor: x3dom.nodeTypes.TimeSensor },
    'Viewpoint': { ctor: x3dom.nodeTypes.Viewpoint },
    'WorldInfo': { ctor: x3dom.nodeTypes.WorldInfo },
};


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
		// alert("loading... next_uri=" + next_uri + ", " + x3dom.isX3DElement(next_uri) + ", " + next_uri.namespaceURI);
        if (x3dom.isX3DElement(next_uri) && next_uri.localName == 'X3D') {
            // Special case, when passed an X3D node instead of a URI string
            uri_docs[next_uri] = next_uri;
            var sub_uris = doc._findIncludedFiles(next_uri);
            queued_uris = queued_uris.concat(sub_uris); // XXX: need to only load each file once
            next_step();
        }
		else {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.responseXML.documentElement.localName == 'parsererror') {
                        x3dom.debug.logInfo('XML parser failed on '+next_uri+':\n'+xhr.responseXML.documentElement.textContent);
                        doc.onerror();
                        return;
                    }
                    //log('Processing '+next_uri);
                    uri_docs[next_uri] = xhr.responseXML;
                    var sub_uris = doc._findIncludedFiles(xhr.responseXML);
                    queued_uris = queued_uris.concat(sub_uris); // XXX: need to only load each file once
                    next_step();
                }
            }
            //log('Downloading '+next_uri);
            xhr.open('GET', next_uri);
            xhr.send('');
        }
    }
	
    next_step();
}

 x3dom.xpath = function(doc, expr, node) {
    var xpe = new XPathEvaluator();
    function nsResolver(prefix) {
        var ns = {
            'x3d': x3dom.x3dNS,
            'x3dext': x3dom.x3dextNS,
        };
        return ns[prefix] || null;
    }
    var result = xpe.evaluate(expr, node || doc, nsResolver, 0, null);
    var res, found = [];
    while (res = result.iterateNext())
        found.push(res);
    return found;
}

//TODO
x3dom.X3DDocument.prototype._findIncludedFiles = function (doc) {
    var urls = Array.map(x3dom.xpath(doc, '//Inline'), function (node) { return node.getAttribute('url'); });
    return urls;
};

x3dom.X3DDocument.prototype._setup = function (sceneDoc, uriDocs, sceneElemPos) {

    var ctx = {
    	defMap: {},
        docs: uriDocs,
        setupNodePrototypes: this._setupNodePrototypes,
        assert: x3dom.debug.assert,
        log: x3dom.debug.logInfo,
    };

    var doc = this;
    x3dom.debug.logInfo("Loading scene #" + sceneElemPos + " from " + x3dom.xpath(sceneDoc, '//x3d:Scene', sceneDoc).length + ".");
    var scene = this._setupNodePrototypes(x3dom.xpath(sceneDoc, '//x3d:Scene', sceneDoc)[sceneElemPos], ctx);
    
	// BUG: the xpath call on sceneDoc should only check for ROUTEs for current scene, not for all.
	if (sceneElemPos == 0)
	scene._routes = Array.map(x3dom.xpath(sceneDoc, '//x3d:ROUTE', null), // XXX: handle imported ROUTEs
        function (route) {
            var fromNode = scene._getNodeByDEF(route.getAttribute('fromNode'));
            var toNode = scene._getNodeByDEF(route.getAttribute('toNode'));
            if (! (fromNode && toNode)) {
                x3dom.debug.logInfo("Broken route - can't find all DEFs for "+route.getAttribute('fromNode')+" -> "+route.getAttribute('toNode'));
                return;
            }
            fromNode._setupRoute(route.getAttribute('fromField'), toNode, route.getAttribute('toField'));
        }
    );

    // Test capturing DOM mutation events on the X3D subscene
    var domEventListener = {
        onAttrModified: function(e) {
            var attrToString = {
                1: "MODIFICATION",
                2: "ADDITION",
                3: "REMOVAL"
            };
            //x3dom.debug.logInfo("MUTATION: " + e + ", " + e.type + ", attrChange=" + attrToString[e.attrChange]);
            // console.dir(e);
            e.target._x3domNode._updateField(e.attrName, e.newValue);
            
        },
        onNodeRemoved: function(e) {
            x3dom.debug.logInfo("MUTATION: " + e + ", " + e.type + ", node=" + e.target.tagName);
        },
        onNodeInserted: function(e) {
            x3dom.debug.logInfo("MUTATION: " + e + ", " + e.type + ", node=" + e.target);
        }
    };
    //sceneDoc.addEventListener('DOMSubtreeModified', onSubtreeModified, true);    
    sceneDoc.addEventListener('DOMNodeRemoved', domEventListener.onNodeRemoved, true);
    sceneDoc.addEventListener('DOMNodeInserted', domEventListener.onNodeInserted, true);
    sceneDoc.addEventListener('DOMAttrModified', domEventListener.onAttrModified, true);    

    this._scene = scene;
	
	this._scene._width = this.canvas.width;
	this._scene._height = this.canvas.height;
};

x3dom.X3DDocument.prototype._setupNodePrototypes = function (node, ctx) {
    var n, t;
	// x3dom.debug.logInfo("node=" + node + ", localName=" + node.localName);
    if (x3dom.isX3DElement(node)) {
	    if (node.hasAttribute('USE')) {
	      n = ctx.defMap[node.getAttribute('USE')];
	      if (n == null) 
	        ctx.log ('Could not USE: '+node.getAttribute('USE'));
	      return n;
	    }
	    else {
	    	// FIXME; Should we create ROUTES at this position
	    	if (node.localName == 'ROUTE') 
	    		return n;
        	if (undefined === (t = x3dom.nodeTypeMap[node.localName])) {
            	ctx.log('Unrecognised element '+node.localName);
        	} else {
            	ctx.xmlNode = node;
 	            n = new t.ctor(ctx);
    	        // PE: Try to store the X3D element on the original DOM element
        	    node._x3domNode = n;
            	if (t.autoChild)
                	Array.forEach(Array.map(node.childNodes, function (n) { return ctx.setupNodePrototypes(n, ctx) }, this), function (c) { if (c) n.addChild(c) });
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

x3dom.X3DDocument.prototype.render = function (ctx, ts) {
    if (!ctx)
        return;
    ctx.renderScene(this._scene, ts);
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
        case  97: /* a, view all */ break;
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
                this._scene._rotMat = x3dom.fields.SFMatrix4.identity();
                this._scene._transMat = x3dom.fields.SFMatrix4.identity();
                this._scene._movement = new x3dom.fields.SFVec3(0, 0, 0);
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
