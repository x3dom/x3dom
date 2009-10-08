x3dom.x3dNS = 'http://www.web3d.org/specifications/x3d-namespace'; // non-standard, but sort of supported by Xj3D
x3dom.x3dextNS = 'http://philip.html5.org/x3d/ext';
x3dom.xsltNS = 'http://www.w3.org/1999/XSL/x3dom.Transform';

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
        ctor.super = parent;
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
        if (c.prototype && c.prototype.constructor && c.prototype.constructor.super)
            return f(c.prototype.constructor.super);
        return false;
    }
    return f(object.constructor.super);
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
        if (ctx.xmlNode.hasAttribute('DEF'))
            this._DEF = ctx.xmlNode.getAttribute('DEF');

        this._fieldWatchers = {};
    },
    {
        _getCurrentTransform: function () {
            if (this._parentNode)
                return this._transformMatrix(this._parentNode._getCurrentTransform());
            else
                return x3dom.fields.SFMatrix4.identity();
        },

        _transformMatrix: function (transform) {
            return transform;
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
                Array.forEach(listeners, function (l) { l.call(thisp, msg) });
        },

        _setupRoute: function (fromField, toNode, toField) {
            if (! this._fieldWatchers[fromField])
                this._fieldWatchers[fromField] = [];
            this._fieldWatchers[fromField].push(function (msg) { toNode._postMessage(toField, msg); });

            if (! toNode._fieldWatchers[toField])
                toNode._fieldWatchers[toField] = [];
            toNode._fieldWatchers[toField].push(function (msg) { toNode[toField] = msg; });
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
        _attribute_SFColor: function (ctx, name, r, g, b) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? x3dom.fields.SFVec3.parse(ctx.xmlNode.getAttribute(name)) : new x3dom.fields.SFVec3(r, g, b);
        },
        _attribute_SFVec3: function (ctx, name, x, y, z) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? x3dom.fields.SFVec3.parse(ctx.xmlNode.getAttribute(name)) : new x3dom.fields.SFVec3(x, y, z);
        },
        _attribute_SFRotation: function (ctx, name, x, y, z, a) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? x3dom.fields.SFQuaternion.parseAxisAngle(ctx.xmlNode.getAttribute(name)) : new x3dom.fields.SFQuaternion(x, y, z, a);
        },
        _attribute_MFString: function (ctx, name, def) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? MFString_parse(ctx.xmlNode.getAttribute(name)) : def;
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
            x3dom.nodeTypes.X3DAppearanceNode.super.call(this, ctx);
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
            x3dom.nodeTypes.Appearance.super.call(this, ctx);
    
            var material = null;
            Array.forEach(ctx.xmlNode.childNodes, function (node) {
                if (x3dom.isX3DElement(node)) {
                    var child = ctx.setupNodePrototypes(node, ctx);
                    if (child) {
                        if (x3dom.isa(child, x3dom.nodeTypes.X3DMaterialNode)) {
                            ctx.assert(! material, 'has <= 1 material node');
                            material = child;
                        } else {
                            ctx.log('unrecognised x3dom.Appearance child node type '+node.localName);
                        }
                    }
                }
            });
            this._material = material;
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
            x3dom.nodeTypes.X3DAppearanceChildNode.super.call(this, ctx);
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
            x3dom.nodeTypes.X3DMaterialNode.super.call(this, ctx);
        }
    )
);

// x3dom.Material = defineClass(x3dom.X3DMaterialNode,
x3dom.registerNodeType(
    "Material",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DMaterialNode,
        function (ctx) {
            x3dom.nodeTypes.Material.super.call(this, ctx);
    
            this._attribute_SFFloat(ctx, 'ambientIntensity', 0.2);
            this._attribute_SFColor(ctx, 'diffuseColor', 0.8, 0.8, 0.8);
            this._attribute_SFColor(ctx, 'emissiveColor', 0, 0, 0);
            this._attribute_SFFloat(ctx, 'shininess', 0.2);
            this._attribute_SFColor(ctx, 'specularColor', 0, 0, 0);
            this._attribute_SFFloat(ctx, 'transparency', 0);
        }
    )
);

// TODO: X3DTextureNode
// TODO: X3DTextureTransformNode

/**** x3dom.X3DGeometryNode ****/

// x3dom.X3DGeometryNode = defineClass(x3dom.nodeTypes.X3DNode,
x3dom.registerNodeType(
    "X3DGeometryNode",
    "base",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DGeometryNode.super.call(this, ctx);
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
            x3dom.nodeTypes.Box.super.call(this, ctx);
    
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
    
            this._positions = [
                -sx,-sy,-sz,  -sx, sy,-sz,   sx, sy,-sz,   sx,-sy,-sz,
                -sx,-sy, sz,  -sx, sy, sz,   sx, sy, sz,   sx,-sy, sz,
                -sx,-sy,-sz,  -sx,-sy, sz,  -sx, sy, sz,  -sx, sy,-sz,
                sx,-sy,-sz,   sx,-sy, sz,   sx, sy, sz,   sx, sy,-sz,
                -sx, sy,-sz,  -sx, sy, sz,   sx, sy, sz,   sx, sy,-sz,
                -sx,-sy,-sz,  -sx,-sy, sz,   sx,-sy, sz,   sx,-sy,-sz,
            ];
            this._indexes = [
                0,1,2, 2,3,0,
                4,7,5, 5,7,6,
                8,9,10, 10,11,8,
                12,14,13, 14,12,15,
                16,17,18, 18,19,16,
                20,22,21, 22,20,23,
            ];
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
            x3dom.nodeTypes.Box.super.call(this, ctx);
    
            var r;
            if (ctx.xmlNode.hasAttribute('radius'))
                r = +ctx.xmlNode.getAttribute('radius');
            else
                r = 1;
    
            // Start with an octahedron
            var verts = [
                0,0,-r, r,0,0, 0,0,r, -r,0,0, 0,-r,0, 0,r,0,
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
                    verts.push(x*s, y*s, z*s);
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
            // TODO: calculate normals
    
            this._positions = verts;
            this._indexes = tris;
        }
    )
);

//x3dom.Text = defineClass(x3dom.X3DGeometryNode,
x3dom.registerNodeType(
    "Text",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Text.super.call(this, ctx);
    
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
            x3dom.nodeTypes.X3DComposedGeometryNode.super.call(this, ctx);
        }
    )
);


//x3dom.IndexedFaceSet = defineClass(x3dom.X3DComposedGeometryNode,
x3dom.registerNodeType(
    "IndexedFaceSet",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DComposedGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.IndexedFaceSet.super.call(this, ctx);
    
            var indexes = ctx.xmlNode.getAttribute('coordIndex').match(/((?:\+|-)?\d+)/g);
            this._indexes = [];
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
                case 2: n2 = +indexes[i]; t = 3; this._indexes.push(n0, n1, n2); break;
                case 3: n1 = n2; n2 = +indexes[i]; this._indexes.push(n0, n1, n2); break;
                }
            }
            // TODO: solid; ccw
    
            var coordNode = Array.filter(ctx.xmlNode.childNodes, function (n) { return (x3dom.isX3DElement(n) && n.localName == 'Coordinate') });
            ctx.assert(coordNode.length == 1);
            this._positions = Array.map(coordNode[0].getAttribute('point').match(/([+\-0-9eE\.]+)/g), function (n) { return +n });
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
            x3dom.nodeTypes.X3DFontStyleNode.super.call(this, ctx);
        }
    )
);

// x3dom.FontStyle = defineClass(x3dom.X3DFontStyleNode,
x3dom.registerNodeType( 
    "FontStyle",
    "Text",
    defineClass(x3dom.nodeTypes.X3DFontStyleNode,
        function (ctx) {
            x3dom.nodeTypes.FontStyle.super.call(this, ctx);
    
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
            x3dom.nodeTypes.X3DChildNode.super.call(this, ctx);
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
            x3dom.nodeTypes.X3DBindableNode.super.call(this, ctx);
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
            x3dom.nodeTypes.Viewpoint.super.call(this, ctx);
            this._attribute_SFVec3(ctx, 'position', 0, 0, 10);
            this._attribute_SFRotation(ctx, 'orientation', 0, 0, 1, 0);
            this._rotation = this._orientation.toMatrix();
        },
        {
            getTranslationMatrix: function () {
                return x3dom.fields.SFMatrix4.translation(this._position.negate());
            },
            getTranslation: function () {
                return this._position;
            },
            getRotationMatrix: function () {
                return this._rotation;
            },
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
            x3dom.nodeTypes.X3DShapeNode.super.call(this, ctx);
        }
    )
);


// x3dom.Shape = defineClass(x3dom.X3DShapeNode,
x3dom.registerNodeType(
    "Shape",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DShapeNode,
        function (ctx) {
            x3dom.nodeTypes.Shape.super.call(this, ctx);
    
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
            x3dom.nodeTypes.X3DGroupingNode.super.call(this, ctx);
            this._childNodes = [];
        },
        {
            addChild: function (node) {
                this._childNodes.push(node);
                node._parentNode = this;
            },
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
            x3dom.nodeTypes.Transform.super.call(this, ctx);
            this._attribute_SFVec3(ctx, 'translation', 0, 0, 0);
            this._attribute_SFRotation(ctx, 'rotation', 0, 0, 0, 1);
            this._attribute_SFVec3(ctx, 'scale', 1, 1, 1);
        },
        {
            _transformMatrix: function (transform) {
                return transform.times( x3dom.fields.SFMatrix4.translation(this._translation).times(this._rotation.toMatrix()).times(x3dom.fields.SFMatrix4.scale(this._scale)) );
            },
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
            x3dom.nodeTypes.X3DInterpolatorNode.super.call(this, ctx);
    
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
                        return interp(this._keyValue[i], this._keyValue[i+1], (t - this._key[i]) / (this._key[i+1] - this._key[i]));
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
            x3dom.nodeTypes.OrientationInterpolator.super.call(this, ctx);
            if (ctx.xmlNode.hasAttribute('keyValue'))
                this._keyValue = Array.map(ctx.xmlNode.getAttribute('keyValue').split(/\s*,\s*/), x3dom.fields.SFQuaternion.parseAxisAngle);
            else
                this._keyValue = [];
    
            this._fieldWatchers.set_fraction = [ function (msg) {
                var value = this._linearInterp(msg, function (a, b, t) { return a.slerp(b, t); });
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
            x3dom.nodeTypes.X3DSensorNode.super.call(this, ctx);
        }
    )
);

// x3dom.TimeSensor = defineClass(x3dom.X3DSensorNode, // TODO: multiple inheritance...
x3dom.registerNodeType(
    "TimeSensor",
    "Time",
    defineClass(x3dom.nodeTypes.X3DSensorNode, // TODO: multiple inheritance...
        function (ctx) {
            x3dom.nodeTypes.TimeSensor.super.call(this, ctx);
    
            this._attribute_SFTime(ctx, 'cycleInterval', 1);
            this._attribute_SFBool(ctx, 'loop', false);
            this._attribute_SFTime(ctx, 'startTime', 0);
    
            this._fraction = 0;
        },
        {
            _onframe: function (now) {
                var f = ((now - this._startTime) / this._cycleInterval) % 1;
                if (f == 0 && now > this._startTime)
                    f = 1;
                this._postMessage('fraction_changed', f);
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
            x3dom.nodeTypes.Scene.super.call(this, ctx);
            this.rotation = 0;
            this.elevation = 0;
        },
        {
            _getViewpointMatrix: function () {
                var viewpoint = this._find(x3dom.nodeTypes.Viewpoint);
                var mat_viewpoint = viewpoint._getCurrentTransform();
                var rightwards = viewpoint.getRotationMatrix().transpose().
                    times(viewpoint.getTranslationMatrix()).
                    times(mat_viewpoint).
                    transformNorm(new x3dom.fields.SFVec3(1, 0, 0));
                var upwards = new x3dom.fields.SFVec3(0, 1, 0);
                var rot = x3dom.fields.SFQuaternion.axisAngle(rightwards.cross(upwards).normalised(), -this.elevation). // XXX: this is all wrong
                    times(x3dom.fields.SFQuaternion.axisAngle(upwards, this.rotation));
                return mat_viewpoint.times(rot.toMatrix());
                // TODO: x3dom.Viewpoint.centerOfRotation
            },
    
            getViewMatrix: function () {
                var viewpoint = this._find(x3dom.nodeTypes.Viewpoint);
                return viewpoint.getRotationMatrix().transpose().
                    times(viewpoint.getTranslationMatrix()).
                    times(this._getViewpointMatrix());
            },
    
            getViewPosition: function () {
                var viewpoint = this._find(x3dom.nodeTypes.Viewpoint);
                return this._getViewpointMatrix().transformPos(viewpoint.getTranslation());
            },
    
            ondrag: function (dx, dy) {
                this.rotation += dx/100;
                this.elevation = Math.max(-Math.PI, Math.min(Math.PI, this.elevation + dy/100));
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
    "ExtInline",
    "base",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.ExtInline.super.call(this, ctx);
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
            this._childNodes[0]._parentNode = this;
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
    'FontStyle': { ctor: x3dom.nodeTypes.FontStyle },
    'IndexedFaceSet': { ctor: x3dom.nodeTypes.IndexedFaceSet },
    'Inline': { ctor: x3dom.nodeTypes.ExtInline }, // TODO: handle namespaces properly
    'Material': { ctor: x3dom.nodeTypes.Material },
    'OrientationInterpolator': { ctor: x3dom.nodeTypes.OrientationInterpolator },
    'Scene': { ctor: x3dom.nodeTypes.Scene, autoChild: 1 },
    'Shape': { ctor: x3dom.nodeTypes.Shape },
    'Sphere': { ctor: x3dom.nodeTypes.Sphere },
    'Text': { ctor: x3dom.nodeTypes.Text },
    'Transform': { ctor: x3dom.nodeTypes.Transform, autoChild: 1 },
    'TimeSensor': { ctor: x3dom.nodeTypes.TimeSensor },
    'Viewpoint': { ctor: x3dom.nodeTypes.Viewpoint },
};


x3dom.X3DDocument = function(canvas, ctx, env) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.env = env;
    this.onload = function () {};
    this.onerror = function () {};
}

x3dom.X3DDocument.prototype.load = function (uri) {
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
            doc._setup(uri_docs[uri], uri_docs);
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
        } else {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.responseXML.documentElement.localName == 'parsererror') {
                        doc.env.log('XML parser failed on '+next_uri+':\n'+xhr.responseXML.documentElement.textContent);
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

x3dom.X3DDocument.prototype._findIncludedFiles = function (doc) {
    var urls = Array.map(x3dom.xpath(doc, '//x3dext:Inline'), function (node) { return node.getAttribute('url').split('#')[0] });
    return urls;
};

x3dom.X3DDocument.prototype._setup = function (sceneDoc, uriDocs) {

    var ctx = {
        docs: uriDocs,
        setupNodePrototypes: this._setupNodePrototypes,
        assert: x3dom.debug.assert,
        log: x3dom.debug.logInfo,
    };

    var doc = this;
    var scene = this._setupNodePrototypes(x3dom.xpath(sceneDoc, '//x3d:Scene')[0], ctx);
	ctx.log("_setup: scene=" + scene);
    scene._routes = Array.map(x3dom.xpath(sceneDoc, '//x3d:ROUTE'), // XXX: handle imported ROUTEs
        function (route) {
            var fromNode = scene._getNodeByDEF(route.getAttribute('fromNode'));
            var toNode = scene._getNodeByDEF(route.getAttribute('toNode'));
            if (! (fromNode && toNode)) {
                doc.env.log("Broken route - can't find all DEFs for "+route.getAttribute('fromNode')+" -> "+route.getAttribute('toNode'));
                return;
            }
            fromNode._setupRoute(route.getAttribute('fromField'), toNode, route.getAttribute('toField'));
        }
    );

    this._scene = scene;
};

x3dom.X3DDocument.prototype._setupNodePrototypes = function (node, ctx) {
    var n, t;
	// x3dom.debug.logInfo("node=" + node + ", localName=" + node.localName);
    if (x3dom.isX3DElement(node)) {
        if (undefined === (t = x3dom.nodeTypeMap[node.localName])) {
            ctx.log('Unrecognised element '+node.localName);
        } else {
            ctx.xmlNode = node;
            n = new t.ctor(ctx);
            if (t.autoChild)
                Array.forEach(Array.map(node.childNodes, function (n) { return ctx.setupNodePrototypes(n, ctx) }, this), function (c) { if (c) n.addChild(c) });
            return n;
        }
    }
};

x3dom.X3DDocument.prototype.advanceTime = function (t) {
    this._time = t;
    if (this._scene) {
        Array.forEach(this._scene._findAll(x3dom.TimeSensor),
            function (timer) { timer._onframe(t); }
        );
    }
};

x3dom.X3DDocument.prototype.render = function (ctx) {
    ctx.renderScene(this.env, this._scene, this._time);
}

x3dom.X3DDocument.prototype.ondrag = function (x, y) {
    this._scene.ondrag(x, y);
}
