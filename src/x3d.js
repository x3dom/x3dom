var x3dNS = 'http://www.web3d.org/specifications/x3d-namespace'; // non-standard, but sort of supported by Xj3D
var x3dextNS = 'http://philip.html5.org/x3d/ext';
var xsltNS = 'http://www.w3.org/1999/XSL/Transform';

function isX3DElement(node) {
    return (node.nodeType === Node.ELEMENT_NODE &&
        (node.namespaceURI == x3dNS || node.namespaceURI == x3dextNS));
}


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

function isa(object, clazz) {
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

/**** X3DNode ****/

var X3DNode = defineClass(null,
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
                return SFMatrix4.identity();
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
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? SFVec3.parse(ctx.xmlNode.getAttribute(name)) : new SFVec3(r, g, b);
        },
        _attribute_SFVec3: function (ctx, name, x, y, z) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? SFVec3.parse(ctx.xmlNode.getAttribute(name)) : new SFVec3(x, y, z);
        },
        _attribute_SFRotation: function (ctx, name, x, y, z, a) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? SFQuaternion.parseAxisAngle(ctx.xmlNode.getAttribute(name)) : new SFQuaternion(x, y, z, a);
        },
        _attribute_MFString: function (ctx, name, def) {
            this['_'+name] = ctx.xmlNode.hasAttribute(name) ? MFString_parse(ctx.xmlNode.getAttribute(name)) : def;
        },
    }
);

// TODO: X3DProtoInstance

/**** X3DAppearanceNode ****/

var X3DAppearanceNode = defineClass(X3DNode,
    function (ctx) {
        X3DAppearanceNode.super.call(this, ctx);
    }
);

var Appearance = defineClass(X3DAppearanceNode,
    function (ctx) {
        Appearance.super.call(this, ctx);

        var material = null;
        Array.forEach(ctx.xmlNode.childNodes, function (node) {
            if (isX3DElement(node)) {
                var child = ctx.setupNodePrototypes(node, ctx);
                if (child) {
                    if (isa(child, X3DMaterialNode)) {
                        ctx.assert(! material, 'has <= 1 material node');
                        material = child;
                    } else {
                        ctx.log('unrecognised Appearance child node type '+node.localName);
                    }
                }
            }
        });
        this._material = material;
    }
);

/**** X3DAppearanceChildNode ****/

var X3DAppearanceChildNode = defineClass(X3DNode,
    function (ctx) {
        X3DAppearanceChildNode.super.call(this, ctx);
    }
);

// TODO: FillProperties
// TODO: LineProperties

var X3DMaterialNode = defineClass(X3DAppearanceChildNode,
    function (ctx) {
        X3DMaterialNode.super.call(this, ctx);
    }
);

var Material = defineClass(X3DMaterialNode,
    function (ctx) {
        Material.super.call(this, ctx);

        this._attribute_SFFloat(ctx, 'ambientIntensity', 0.2);
        this._attribute_SFColor(ctx, 'diffuseColor', 0.8, 0.8, 0.8);
        this._attribute_SFColor(ctx, 'emissiveColor', 0, 0, 0);
        this._attribute_SFFloat(ctx, 'shininess', 0.2);
        this._attribute_SFColor(ctx, 'specularColor', 0, 0, 0);
        this._attribute_SFFloat(ctx, 'transparency', 0);
    }
);

// TODO: X3DTextureNode
// TODO: X3DTextureTransformNode

/**** X3DGeometryNode ****/

var X3DGeometryNode = defineClass(X3DNode,
    function (ctx) {
        X3DGeometryNode.super.call(this, ctx);
    }
);

// TODO: Arc2D
// TODO: ArcClose2D

var Box = defineClass(X3DGeometryNode,
    function (ctx) {
        Box.super.call(this, ctx);

        var sx, sy, sz;
        if (ctx.xmlNode.hasAttribute('size')) {
            var size = SFVec3.parse(ctx.xmlNode.getAttribute('size'));
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

var Sphere = defineClass(X3DGeometryNode,
    function (ctx) {
        Box.super.call(this, ctx);

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
);

var Text = defineClass(X3DGeometryNode,
    function (ctx) {
        Text.super.call(this, ctx);

        this._attribute_MFString(ctx, 'string', []);

        var style = null;
        Array.forEach(ctx.xmlNode.childNodes, function (node) {
            if (isX3DElement(node)) {
                var child = ctx.setupNodePrototypes(node, ctx);
                if (child) {
                    if (isa(child, X3DFontStyleNode)) {
                        ctx.assert(! style, 'has <= 1 fontStyle node');
                        style = child;
                    } else {
                        ctx.log('unrecognised Text child node type '+node.localName);
                    }
                }
            }
        });
        this._fontStyle = style;
    }
);


// TODO: TriangleSet2D

var X3DComposedGeometryNode = defineClass(X3DGeometryNode,
    function (ctx) {
        X3DComposedGeometryNode.super.call(this, ctx);
    }
);

var IndexedFaceSet = defineClass(X3DComposedGeometryNode,
    function (ctx) {
        IndexedFaceSet.super.call(this, ctx);

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

        var coordNode = Array.filter(ctx.xmlNode.childNodes, function (n) { return (isX3DElement(n) && n.localName == 'Coordinate') });
        ctx.assert(coordNode.length == 1);
        this._positions = Array.map(coordNode[0].getAttribute('point').match(/([+\-0-9eE\.]+)/g), function (n) { return +n });
    }
);

// TODO: IndexedTriangleFanSet
// TODO: IndexedTriangleSet
// TODO: IndexedTriangleStripSet
// TODO: TriangleFanSet
// TODO: TriangleSet
// TODO: TriangleStripSet

// TODO: X3DParametricGeometryNode

// TODO: ...

/**** X3DFontStyleNode ****/

var X3DFontStyleNode = defineClass(X3DNode,
    function (ctx) {
        X3DFontStyleNode.super.call(this, ctx);
    }
);

var FontStyle = defineClass(X3DFontStyleNode,
    function (ctx) {
        FontStyle.super.call(this, ctx);

        this._attribute_MFString(ctx, 'family', ['SERIF']);
        this._attribute_SFFloat(ctx, 'size', 1.0);
    }
);

/**** X3DChildNode ****/

var X3DChildNode = defineClass(X3DNode,
    function (ctx) {
        X3DChildNode.super.call(this, ctx);
    }
);

/**** X3DBindableNode ****/

var X3DBindableNode = defineClass(X3DChildNode,
    function (ctx) {
        X3DBindableNode.super.call(this, ctx);
    }
);

// TODO: ...

var Viewpoint = defineClass(X3DBindableNode,
    function (ctx) {
        Viewpoint.super.call(this, ctx);
        this._attribute_SFVec3(ctx, 'position', 0, 0, 10);
        this._attribute_SFRotation(ctx, 'orientation', 0, 0, 1, 0);
        this._rotation = this._orientation.toMatrix();
    },
    {
        getTranslationMatrix: function () {
            return SFMatrix4.translation(this._position.negate());
        },
        getTranslation: function () {
            return this._position;
        },
        getRotationMatrix: function () {
            return this._rotation;
        },
    }
);

// TODO: ...

/**** X3DShapeNode ****/

var X3DShapeNode = defineClass(X3DChildNode,
    function (ctx) {
        X3DShapeNode.super.call(this, ctx);
    }
);

var Shape = defineClass(X3DShapeNode,
    function (ctx) {
        Shape.super.call(this, ctx);

        var appearance, geometry;
        Array.forEach(ctx.xmlNode.childNodes, function (node) {
            if (isX3DElement(node)) {
                var child = ctx.setupNodePrototypes(node, ctx);
                if (child) {
                    if (isa(child, X3DAppearanceNode)) {
                        ctx.assert(! appearance, 'has <= 1 appearance node');
                        appearance = child;
                    } else if (isa(child, X3DGeometryNode)) {
                        ctx.assert(! geometry, 'has <= 1 geometry node');
                        geometry = child;
                    } else {
                        ctx.log('unrecognised Shape child node type '+node.localName);
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
);

/**** X3DGroupingNode ****/

var X3DGroupingNode = defineClass(X3DChildNode,
    function (ctx) {
        X3DGroupingNode.super.call(this, ctx);
        this._childNodes = [];
    },
    {
        addChild: function (node) {
            this._childNodes.push(node);
            node._parentNode = this;
        },
    }
);

// TODO: ...

var Transform = defineClass(X3DGroupingNode,
    function (ctx) {
        Transform.super.call(this, ctx);
        this._attribute_SFVec3(ctx, 'translation', 0, 0, 0);
        this._attribute_SFRotation(ctx, 'rotation', 0, 0, 0, 1);
        this._attribute_SFVec3(ctx, 'scale', 1, 1, 1);
    },
    {
        _transformMatrix: function (transform) {
            return transform.times( SFMatrix4.translation(this._translation).times(this._rotation.toMatrix()).times(SFMatrix4.scale(this._scale)) );
        },
    }
);

// TODO: ...

/**** X3DInterpolatorNode ****/

var X3DInterpolatorNode = defineClass(X3DChildNode,
    function (ctx) {
        X3DInterpolatorNode.super.call(this, ctx);

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
);

// TODO: ...

var OrientationInterpolator = defineClass(X3DInterpolatorNode,
    function (ctx) {
        OrientationInterpolator.super.call(this, ctx);
        if (ctx.xmlNode.hasAttribute('keyValue'))
            this._keyValue = Array.map(ctx.xmlNode.getAttribute('keyValue').split(/\s*,\s*/), SFQuaternion.parseAxisAngle);
        else
            this._keyValue = [];

        this._fieldWatchers.set_fraction = [ function (msg) {
            var value = this._linearInterp(msg, function (a, b, t) { return a.slerp(b, t); });
            this._postMessage('value_changed', value);
        } ];
    }
);

// TODO: ...

/**** X3DSensorNode ****/

var X3DSensorNode = defineClass(X3DChildNode,
    function (ctx) {
        X3DSensorNode.super.call(this, ctx);
    }
);

var TimeSensor = defineClass(X3DSensorNode, // TODO: multiple inheritance...
    function (ctx) {
        TimeSensor.super.call(this, ctx);

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
);

// TODO: ...




// Not a real X3D node type
var Scene = defineClass(X3DGroupingNode,
    function (ctx) {
        Scene.super.call(this, ctx);
        this.rotation = 0;
        this.elevation = 0;
    },
    {
        _getViewpointMatrix: function () {
            var viewpoint = this._find(Viewpoint);
            var mat_viewpoint = viewpoint._getCurrentTransform();
            var rightwards = viewpoint.getRotationMatrix().transpose().
                times(viewpoint.getTranslationMatrix()).
                times(mat_viewpoint).
                transformNorm(new SFVec3(1, 0, 0));
            var upwards = new SFVec3(0, 1, 0);
            var rot = SFQuaternion.axisAngle(rightwards.cross(upwards).normalised(), -this.elevation). // XXX: this is all wrong
                times(SFQuaternion.axisAngle(upwards, this.rotation));
            return mat_viewpoint.times(rot.toMatrix());
            // TODO: Viewpoint.centerOfRotation
        },

        getViewMatrix: function () {
            var viewpoint = this._find(Viewpoint);
            return viewpoint.getRotationMatrix().transpose().
                times(viewpoint.getTranslationMatrix()).
                times(this._getViewpointMatrix());
        },

        getViewPosition: function () {
            var viewpoint = this._find(Viewpoint);
            return this._getViewpointMatrix().transformPos(viewpoint.getTranslation());
        },

        ondrag: function (dx, dy) {
            this.rotation += dx/100;
            this.elevation = Math.max(-Math.PI, Math.min(Math.PI, this.elevation + dy/100));
        }
    }
);

/* Extension nodes: */

var namespaceFixerXsltProcessor = new XSLTProcessor();
namespaceFixerXsltProcessor.importStylesheet(new DOMParser().parseFromString(
    '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
    '  <xsl:template match="*" priority="3">' +
    '    <xsl:element name="{local-name()}" namespace="' + x3dNS + '">' +
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

var ExtInline = defineClass(X3DChildNode,
    function (ctx) {
        ExtInline.super.call(this, ctx);
        var urlSplit = ctx.xmlNode.getAttribute('url').split('#', 2);
        var doc = ctx.docs[urlSplit[0]];

        // Fix namespaceless X3D documents
        if (doc.documentElement.localName == 'X3D' && doc.documentElement.namespaceURI === null)
            doc = namespaceFixerXsltProcessor.transformToDocument(doc);

        var target, m;
        if (m = urlSplit[1].match(/^xpointer\((.*)\)$/)) {
            target = xpath(doc, m[1])[0];
        } else {
            target = xpath(doc, '//*[@DEF="'+urlSplit[1]+'"]')[0];
        }

        // Apply the user's transformations
        if (ctx.xmlNode.childNodes.length) {
            //log(new XMLSerializer().serializeToString(target));
            var xsltDoc;
            Array.forEach(ctx.xmlNode.childNodes, function (node) {
                if (node.nodeType == Node.ELEMENT_NODE && node.namespaceURI == xsltNS) {
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
);



x3dom.nodeTypeMap = {
    'Appearance': { ctor: Appearance },
    'Box': { ctor: Box },
    'FontStyle': { ctor: FontStyle },
    'IndexedFaceSet': { ctor: IndexedFaceSet },
    'Inline': { ctor: ExtInline }, // TODO: handle namespaces properly
    'Material': { ctor: Material },
    'OrientationInterpolator': { ctor: OrientationInterpolator },
    'Scene': { ctor: Scene, autoChild: 1 },
    'Shape': { ctor: Shape },
    'Sphere': { ctor: Sphere },
    'Text': { ctor: Text },
    'Transform': { ctor: Transform, autoChild: 1 },
    'TimeSensor': { ctor: TimeSensor },
    'Viewpoint': { ctor: Viewpoint },
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
		// alert("loading... next_uri=" + next_uri + ", " + isX3DElement(next_uri) + ", " + next_uri.namespaceURI);
        if (isX3DElement(next_uri) && next_uri.localName == 'X3D') {
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

function xpath(doc, expr, node) {
    var xpe = new XPathEvaluator();
    function nsResolver(prefix) {
        var ns = {
            'x3d': x3dNS,
            'x3dext': x3dextNS,
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
    var urls = Array.map(xpath(doc, '//x3dext:Inline'), function (node) { return node.getAttribute('url').split('#')[0] });
    return urls;
};

x3dom.X3DDocument.prototype._setup = function (sceneDoc, uriDocs) {

    var ctx = {
        docs: uriDocs,
        setupNodePrototypes: this._setupNodePrototypes,
        assert: this.env.assert,
        log: this.env.log,
    };

    var doc = this;
    var scene = this._setupNodePrototypes(xpath(sceneDoc, '//x3d:Scene')[0], ctx);
	ctx.log("_setup: scene=" + scene);
    scene._routes = Array.map(xpath(sceneDoc, '//x3d:ROUTE'), // XXX: handle imported ROUTEs
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
	// ctx.log("node=" + node + ", localName=" + node.localName);
    if (isX3DElement(node)) {
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
        Array.forEach(this._scene._findAll(TimeSensor),
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
