var x3dNS = 'http://www.web3d.org/specifications/x3d-namespace'; // non-standard, but apparently supported by Xj3D
var x3dextNS = 'http://philip.html5.org/x3d/ext';
var xsltNS = 'http://www.w3.org/1999/XSL/Transform';

function isX3DElement(node) {
    return (node.nodeType === Node.ELEMENT_NODE &&
        (node.namespaceURI == x3dNS || node.namespaceURI == x3dextNS));
}


function defineClass(parent, ctor, methods) {
    function inheritance() {}
    inheritance.prototype = parent.prototype;
    ctor.prototype = new inheritance();
    ctor.prototype.constructor = ctor;
    ctor.super = parent;
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

/**** X3DNode ****/

function X3DNode(ctx) {
    if (ctx.xmlNode.hasAttribute('DEF'))
        this._DEF = ctx.xmlNode.getAttribute('DEF');

    this._fieldWatchers = {};
}

X3DNode.prototype.getCurrentTransform = function () {
    return this._parentNode.getCurrentTransform();
};

X3DNode.prototype._find = function (type) {
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
}

X3DNode.prototype._findAll = function (type) {
    var found = [];
    for (var i in this._childNodes) {
        if (this._childNodes[i]) {
            if (this._childNodes[i].constructor == type)
                found.push(this._childNodes[i]);
            found = found.concat(this._childNodes[i]._findAll(type)); // TODO: this has non-linear performance
        }
    }
    return found;
}

X3DNode.prototype._getNodeByDEF = function (def) {
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
}

X3DNode.prototype._postMessage = function (field, msg) {
    // TODO: timestamps and stuff
    //log_frame(this+' postmessage '+field+' - '+msg);
    var listeners = this._fieldWatchers[field];
    var thisp = this;
    if (listeners)
        Array.forEach(listeners, function (l) { l.call(thisp, msg) });
}

X3DNode.prototype._setupRoute = function (fromField, toNode, toField) {
    if (! this._fieldWatchers[fromField])
        this._fieldWatchers[fromField] = [];
    this._fieldWatchers[fromField].push(function (msg) { toNode._postMessage(toField, msg); });

    if (! toNode._fieldWatchers[toField])
        toNode._fieldWatchers[toField] = [];
    toNode._fieldWatchers[toField].push(function (msg) { toNode[toField] = msg; });
}

/**** X3DChildNode ****/

var X3DChildNode = defineClass(X3DNode,
    function (ctx) {
        X3DChildNode.super.call(this, ctx);
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


/**** ... ****/

var X3DScene = defineClass(X3DGroupingNode,
    function (ctx) {
        X3DScene.super.call(this, ctx);
        this.rotation = 0;
        this.elevation = 0;
    },
    {
        getCurrentTransform: function () {
            return new SFMatrix4();
        },

        _getViewpointMatrix: function () {
            var viewpoint = this._find(X3DViewpointNode);
            var mat_viewpoint = viewpoint.getCurrentTransform();
            var rightwards = viewpoint.getRotationMatrix().transpose().
                times(viewpoint.getTranslationMatrix()).
                times(mat_viewpoint).
                transformNorm(new SFVec3(1, 0, 0));
            var upwards = new SFVec3(0, 1, 0);
            var rot = SFQuat.axisAngle(rightwards.cross(upwards).normalised(), -this.elevation). // XXX: huh? why rightwards x upwards?
                times(SFQuat.axisAngle(upwards, this.rotation));
            return mat_viewpoint.times(rot.toMatrix());
            // TODO: X3DViewpointNode.centerOfRotation
        },

        getViewMatrix: function () {
            var viewpoint = this._find(X3DViewpointNode);
            return viewpoint.getRotationMatrix().transpose().
                times(viewpoint.getTranslationMatrix()).
                times(this._getViewpointMatrix());
        },

        getViewPosition: function () {
            var viewpoint = this._find(X3DViewpointNode);
            return this._getViewpointMatrix().transformPos(viewpoint.getTranslation());
        },

        ondrag: function (dx, dy) {
            this.rotation += dx/100;
            this.elevation = Math.max(-Math.PI, Math.min(Math.PI, this.elevation + dy/100));
        }
    }
);


var X3DViewpointNode = defineClass(X3DGroupingNode,
    function (ctx) {
        X3DViewpointNode.super.call(this, ctx);
        if (ctx.xmlNode.hasAttribute('position')) {
            this._position = SFVec3.parse(ctx.xmlNode.getAttribute('position'));
        } else {
            this._position = new SFVec3(0, 0, 10);
        }
        this._rotation = SFMatrix4.parseRotation(ctx.xmlNode.getAttribute('orientation'));
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


var X3DTransform = defineClass(X3DGroupingNode,
    function (ctx) {
        X3DTransform.super.call(this, ctx);
        var x = 0, y = 0, z = 0;
        if (ctx.xmlNode.hasAttribute('translation'))
            this.translation = SFVec3.parse(ctx.xmlNode.getAttribute('translation'));
        else
            this.translation = new SFVec3(0, 0, 0);

        if (ctx.xmlNode.hasAttribute('rotation'))
            this.rotation = SFQuat.parseAxisAngle(ctx.xmlNode.getAttribute('rotation'));
        else
            this.rotation = new SFQuat(0, 0, 0, 1);
    },
    {
        getCurrentTransform: function () {
            var transform = SFMatrix4.translation(this.translation).times(this.rotation.toMatrix());
            return this._parentNode.getCurrentTransform().times(transform);
        },
    }
);

var X3DAppearanceNode = defineClass(X3DNode,
    function (ctx) {
        X3DAppearanceNode.super.call(this, ctx);
    }
);

var X3DIndexedFaceSet = defineClass(X3DNode,
    function (ctx) {
        X3DTransform.super.call(this, ctx);

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
        assert(coordNode.length == 1);
        this._positions = Array.map(coordNode[0].getAttribute('point').match(/([+\-0-9eE\.]+)/g), function (n) { return +n });
    }
);


var X3DShape = defineClass(X3DNode,
    function (ctx) {
        X3DShape.super.call(this, ctx);

        var appearance, geometry;
        Array.forEach(ctx.xmlNode.childNodes, function (node) {
            if (isX3DElement(node)) {
                ctx.xmlNode = node;
                if (node.localName == 'Appearance') {
                    assert(! appearance, 'has <= 1 appearance node');
                    appearance = new X3DAppearanceNode(ctx);
                } else if (node.localName == 'IndexedFaceSet') { // TODO: other geometry types
                    assert(! geometry, 'has <= 1 geometry node');
                    geometry = new X3DIndexedFaceSet(ctx);
                }
            }
        });
        assert(appearance && geometry, 'has appearance and geometry');
        this._appearance = appearance;
        this._geometry = geometry;
    }
);

/**** Sensors ****/

var X3DSensorNode = defineClass(X3DChildNode,
    function (ctx) {
        X3DSensorNode.super.call(this, ctx);
    }
);

var X3DTimeSensor = defineClass(X3DSensorNode,
    function (ctx) {
        X3DTimeSensor.super.call(this, ctx);

        if (ctx.xmlNode.hasAttribute('cycleInterval'))
            this.cycleInterval = +ctx.xmlNode.getAttribute('cycleInterval');
        else
            this.cycleInterval = 1;

        this.loop = (ctx.xmlNode.getAttribute('loop') == 'true'); // default false
        this.startTime = 0; // TODO

        this._fraction = 0;
    },
    {
        _onframe: function (now) {
            var f = ((now - this.startTime) / this.cycleInterval) % 1;
            if (f == 0 && now > this.startTime)
                f = 1;
            this._postMessage('fraction_changed', f);
        },
    }
);

/**** Interpolators ****/

var X3DInterpolatorNode = defineClass(X3DChildNode,
    function (ctx) {
        X3DInterpolatorNode.super.call(this, ctx);

        if (ctx.xmlNode.hasAttribute('key'))
            this.key = Array.map(ctx.xmlNode.getAttribute('key').split(/\s+/), function (n) { return +n; });
        else
            this.key = [];
    },
    {
        _linearInterp: function (t, interp) {
            if (t <= this.key[0])
                return this.keyValue[0];
            if (t >= this.key[this.key.length-1])
                return this.keyValue[this.key.length-1];
            for (var i = 0; i < this.key.length-1; ++i)
                if (this.key[i] < t && t <= this.key[i+1])
                    return interp(this.keyValue[i], this.keyValue[i+1], (t - this.key[i]) / (this.key[i+1] - this.key[i]));
        }
    }
);

var X3DOrientationInterpolator = defineClass(X3DInterpolatorNode,
    function (ctx) {
        X3DOrientationInterpolator.super.call(this, ctx);
        if (ctx.xmlNode.hasAttribute('keyValue'))
            this.keyValue = Array.map(ctx.xmlNode.getAttribute('keyValue').split(/\s*,\s*/), SFQuat.parseAxisAngle);
        else
            this.keyValue = [];

        this._fieldWatchers.set_fraction = [ function (msg) {
            var value = this._linearInterp(msg, function (a, b, t) { return a.slerp(b, t); });
            this._postMessage('value_changed', value);
        } ];
    }
);

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

var X3DExtInline = defineClass(X3DChildNode,
    function (ctx) {
        X3DExtInline.super.call(this, ctx);
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



var nodeTypeMap = {
    'Viewpoint': { ctor: X3DViewpointNode },
    'Transform': { ctor: X3DTransform, autoChild: 1 },
    'Scene': { ctor: X3DScene, autoChild: 1 },
    'Shape': { ctor: X3DShape },
    'TimeSensor': { ctor: X3DTimeSensor },
    'OrientationInterpolator': { ctor: X3DOrientationInterpolator },
    'Inline': { ctor: X3DExtInline }, // TODO: handle namespaces properly
};

function X3DDocument(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.onload = function () {};
    this.onerror = function () {};
}

X3DDocument.prototype.load = function (uri) {
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
                        log('XML parser failed on '+next_uri+':\n'+xhr.responseXML.documentElement.textContent);
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

X3DDocument.prototype._findIncludedFiles = function (doc) {
    var urls = Array.map(xpath(doc, '//x3dext:Inline'), function (node) { return node.getAttribute('url').split('#')[0] });
    return urls;
};

X3DDocument.prototype._setup = function (sceneDoc, uriDocs) {

    var ctx = {
        docs: uriDocs,
        setupNodePrototypes: this._setupNodePrototypes,
    };

    var scene = this._setupNodePrototypes(xpath(sceneDoc, '//x3d:Scene')[0], ctx);
    scene._routes = Array.map(xpath(sceneDoc, '//x3d:ROUTE'), // XXX: handle imported ROUTEs
        function (route) {
            var fromNode = scene._getNodeByDEF(route.getAttribute('fromNode'));
            var toNode = scene._getNodeByDEF(route.getAttribute('toNode'));
            if (! (fromNode && toNode)) {
                log("Broken route - can't find all DEFs for "+route.getAttribute('fromNode')+" -> "+route.getAttribute('toNode'));
                return;
            }
            fromNode._setupRoute(route.getAttribute('fromField'), toNode, route.getAttribute('toField'));
        }
    );

    this._scene = scene;
};

X3DDocument.prototype._setupNodePrototypes = function (node, ctx) {
    var n, t;
    if (isX3DElement(node)) {
        if (undefined !== (t = nodeTypeMap[node.localName])) {
            ctx.xmlNode = node;
            n = new t.ctor(ctx);
            if (t.autoChild)
                Array.forEach(Array.map(node.childNodes, function (n) { return ctx.setupNodePrototypes(n, ctx) }, this), function (c) { if (c) n.addChild(c) });
            return n;
        }
    }
};

X3DDocument.prototype.advanceTime = function (t) {
    this._time = t;
    if (this._scene) {
        Array.forEach(this._scene._findAll(X3DTimeSensor),
            function (timer) { timer._onframe(t); }
        );
    }
};

X3DDocument.prototype.render = function (ctx) {
    ctx.renderScene(this._scene, this._time);
}

X3DDocument.prototype.prepare = function (ctx) {
    ctx.prepareScene(this._scene);
}

X3DDocument.prototype.ondrag = function (x, y) {
    this._scene.ondrag(x, y);
}
