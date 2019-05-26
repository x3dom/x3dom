/**
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/**
 * The Namespace container for x3dom objects.
 * @namespace x3dom
 */
var x3dom = {
    canvases: [],
    x3dNS:    'http://www.web3d.org/specifications/x3d-namespace',
    x3dextNS: 'http://philip.html5.org/x3d/ext',
    xsltNS:   'http://www.w3.org/1999/XSL/x3dom.Transform',
    xhtmlNS:  'http://www.w3.org/1999/xhtml'
};

/**
 * The x3dom.nodeTypes namespace.
 * @namespace x3dom.nodeTypes
 */
x3dom.nodeTypes = {};

/**
 * The x3dom.nodeTypesLC namespace. Stores nodetypes in lowercase
 * @namespace x3dom.nodeTypesLC
 */
x3dom.nodeTypesLC = {};

/**
 * The x3dom.components namespace.
 * @namespace x3dom.components
 */
x3dom.components = {};

/**
 * Cache for primitive nodes (Box, Sphere, etc.)
 */
x3dom.geoCache = [];

/**
 * Global indices for the vertex/index buffers
 */
x3dom.BUFFER_IDX =
{
    INDEX: 0,
    POSITION: 1,
    NORMAL: 2,
    TEXCOORD: 3,
    TEXCOORD_0 : 3,
    COLOR: 4,
    COLOR_0: 4,
    ID: 5,
    TANGENT: 6,
    BITANGENT: 7,
    TEXCOORD_1: 8
};

x3dom.BRDF_LUT = "data:image/png;base64,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";

/**
 * Stores information about Browser and hardware capabilities
 */
x3dom.caps = { PLATFORM: navigator.platform, AGENT: navigator.userAgent, RENDERMODE: "HARDWARE" };

/**
 * Registers the node defined by @p nodeDef.
 * The node is registered with the given @p nodeTypeName and @p componentName.
 *
 * @param nodeTypeName the name of the node type (e.g. Material, Shape, ...)
 * @param componentName the name of the component the node type belongs to
 * @param nodeDef the definition of the node type
 */
x3dom.registerNodeType = function(nodeTypeName, componentName, nodeDef) {
    // console.log("Registering nodetype [" + nodeTypeName + "] in component [" + componentName + "]");
    if (x3dom.components[componentName] === undefined) {
        x3dom.components[componentName] = {};
    }
    nodeDef._typeName = nodeTypeName;
    nodeDef._compName = componentName;
    x3dom.components[componentName][nodeTypeName] = nodeDef;
    x3dom.nodeTypes[nodeTypeName] = nodeDef;
    x3dom.nodeTypesLC[nodeTypeName.toLowerCase()] = nodeDef;
};

/**
 * Test if node is registered X3D element
 *
 * @param node
 */
x3dom.isX3DElement = function(node) {
    // x3dom.debug.logInfo("node=" + node + "node.nodeType=" + node.nodeType + ", node.localName=" + node.localName + ", ");
    var name = (node.nodeType === Node.ELEMENT_NODE && node.localName) ? node.localName.toLowerCase() : null;
    return (name && (x3dom.nodeTypes[node.localName] || x3dom.nodeTypesLC[name] ||
        name == "x3d" || name == "websg" || name == "route"));
};

/**
 * Function: x3dom.extend
 *
 * Returns a prototype object suitable for extending the given class
 * _f_. Rather than constructing a new instance of _f_ to serve as
 * the prototype (which unnecessarily runs the constructor on the created
 * prototype object, potentially polluting it), an anonymous function is
 * generated internally that shares the same prototype:
 *
 * @param f - Method f a constructor
 * @returns A suitable prototype object
 *
 * @see Douglas Crockford's essay on <prototypical inheritance at http://javascript.crockford.com/prototypal.html>.
 * @todo unify with defineClass, which does basically the same
 */
x3dom.extend = function(f) {
    function G() {}

    G.prototype = f.prototype || f;
    return new G();
};

/**
 * Function x3dom.getStyle
 *
 * Computes the value of the specified CSS property <tt>p</tt> on the
 * specified element <tt>e</tt>.
 *
 * @param oElm       - The element on which to compute the CSS property
 * @param strCssRule - The name of the CSS property
 *
 * @eturn - The computed value of the CSS property
 */
x3dom.getStyle = function(oElm, strCssRule) {
    var strValue = "";
    var style = document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(oElm, null) : null;
    if (style) {
        strValue = style.getPropertyValue(strCssRule);
    } else if (oElm.currentStyle) {
        strCssRule = strCssRule.replace(/\-(\w)/g, function(strMatch, p1) { return p1.toUpperCase(); });
        strValue = oElm.currentStyle[strCssRule];
    }

    return strValue;
};

/**
 * Utility function for defining a new class.
 *
 * @param parent the parent class of the new class
 * @param ctor the constructor of the new class
 * @param methods an object literal containing the methods of the new class
 *
 * @returns the constructor function of the new class
 */
function defineClass(parent, ctor, methods) {
    if (parent) {
        function Inheritance() {}

        Inheritance.prototype = parent.prototype;

        ctor.prototype = new Inheritance();
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

/**
 * Utility function for testing a node type.
 *
 * @param object the object to test
 * @param clazz the type of the class
 * @returns true or false
 */
x3dom.isa = function(object, clazz) {
    /*
    if (!object || !object.constructor || object.constructor.superClass === undefined) {
        return false;
    }
    if (object.constructor === clazz) {
        return true;
    }

    function f(c) {
        if (c === clazz) {
            return true;
        }
        if (c.prototype && c.prototype.constructor && c.prototype.constructor.superClass) {
            return f(c.prototype.constructor.superClass);
        }
        return false;
    }

    return f(object.constructor.superClass);
    */

    return (object instanceof clazz);
};

/**
 * Get Global Helper
 *
 * @returns {*}
 */
x3dom.getGlobal = function() {
    return (function() {
        return this;
    }).call(null);
};

/**
 * Load javascript file either by performing an synchronous jax request
 * an eval'ing the response or by dynamically creating a <script> tag.
 *
 * CAUTION: This function is a possible source for Cross-Site
 *          Scripting Attacks.
 *
 * @param  src  The location of the source file relative to
 *              path_prefix. If path_prefix is omitted, the
 *              current directory (relative to the HTML document)
 *              is used instead.
 * @param  path_prefix A prefix URI to add to the resource to be loaded.
 *                     The URI must be given in normalized path form ending in a
 *                     path separator (i.e. src/nodes/). It can be in absolute
 *                     URI form (http://somedomain.tld/src/nodes/)
 * @param  blocking    By default the lookup is done via blocking jax request.
 *                     set to false to use the script i
 */
x3dom.loadJS = function(src, path_prefix, blocking) {
    blocking = (blocking === false) ? blocking : true;   // default to true

    if (blocking) {
        var url = (path_prefix) ? path_prefix.trim() + src : src;
        var req = new XMLHttpRequest();

        if (req) {
            // third parameter false = synchronous/blocking call
            // need this to load the JS before onload completes
            req.open("GET", url, false);
            req.send(null); // blocking

            // maybe consider global eval
            // http://perfectionkills.com/global-eval-what-are-the-options/#indirect_eval_call_examples
            eval(req.responseText);
        }
    } else {
        var head = document.getElementsByTagName('HEAD').item(0);
        var script = document.createElement("script");
        var loadpath = (path_prefix) ? path_prefix.trim() + src : src;
        if (head) {
            x3dom.debug.logError("Trying to load external JS file: " + loadpath);
            // alert("Trying to load external JS file: " + loadpath);
            script.type = "text/javascript";
            script.src = loadpath;
            head.appendChild(script);
        } else {
            alert("No document object found. Can't load components!");
            // x3dom.debug.logError("No document object found. Can't load components");
        }
    }
};

/**
 * Array to Object Helper
 */
function array_to_object(a) {
    var o = {};
    for (var i = 0; i < a.length; i++) {
        o[a[i]] = '';
    }
    return o;
}

/**
 * Provides requestAnimationFrame in a cross browser way.
 *
 * @see https://cvs.khronos.org/svn/repos/registry/trunk/public/webgl/sdk/demos/common/webgl-utils.js
 */
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
            window.setTimeout(callback, 16);
        };
})();

/**
 * Toggle full-screen mode
 */
x3dom.toggleFullScreen = function() {
    if (document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen) {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    } else {
        var docElem = document.documentElement;
        if (docElem.requestFullScreen) {
            docElem.requestFullScreen();
        } else if (docElem.mozRequestFullScreen) {
            docElem.mozRequestFullScreen();
        } else if (docElem.webkitRequestFullScreen) {
            docElem.webkitRequestFullScreen();
        }
    }
};
