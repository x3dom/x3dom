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

/*
 * Namespace: x3dom
 *
 * Namepsace container for x3dom objects.
 */
var x3dom = {
    canvases: []
};

x3dom.x3dNS = 'http://www.web3d.org/specifications/x3d-namespace'; // non-standard, but sort of supported by Xj3D
x3dom.x3dextNS = 'http://philip.html5.org/x3d/ext';
x3dom.xsltNS = 'http://www.w3.org/1999/XSL/x3dom.Transform';
x3dom.xhtmlNS = 'http://www.w3.org/1999/xhtml';
// <<<<<<<<<<<<<

/** @namespace the x3dom.nodeTypes namespace. */
x3dom.nodeTypes = {};

/** @namespace the x3dom.nodeTypesLC namespace. Stores nodetypes in lowercase */
x3dom.nodeTypesLC = {};

/** @namespace the x3dom.components namespace. */
x3dom.components = {};

/** Cache for primitive nodes (Box, Sphere, etc.) */
x3dom.geoCache = [];

/** Stores informations about Browser and Hardware capabilities */
x3dom.caps = { PLATFORM: navigator.platform, AGENT: navigator.userAgent };

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
    }
    else {
        x3dom.debug.logInfo("Using component [" + componentName + "]");
    }
    nodeDef._typeName = nodeTypeName;
    nodeDef._compName = componentName;
    x3dom.components[componentName][nodeTypeName] = nodeDef;
    x3dom.nodeTypes[nodeTypeName] = nodeDef;
    x3dom.nodeTypesLC[nodeTypeName.toLowerCase()] = nodeDef;
};

x3dom.isX3DElement = function(node) {
    // x3dom.debug.logInfo("node=" + node + "node.nodeType=" + node.nodeType + ", node.localName=" + node.localName + ", ");
    return (node.nodeType === Node.ELEMENT_NODE && node.localName &&
        (x3dom.nodeTypes[node.localName] || x3dom.nodeTypesLC[node.localName.toLowerCase()] ||
         node.localName.toLowerCase() === "x3d" || node.localName.toLowerCase() === "websg" ||
         node.localName.toLowerCase() === "scene" || node.localName.toLowerCase() === "route" ));
};

/*
 *	Function: x3dom.extend
 *
 *	Returns a prototype object suitable for extending the given class
 *	_f_. Rather than constructing a new instance of _f_ to serve as
 *	the prototype (which unnecessarily runs the constructor on the created
 *	prototype object, potentially polluting it), an anonymous function is
 *	generated internally that shares the same prototype:
 *
 *	Parameters:
 *
 *   	f - Method f a constructor
 *
 *	Returns:
 *
 * 		A suitable prototype object
 *
 *	See Also:
 *
 *		Douglas Crockford's essay on <prototypical inheritance at http://javascript.crockford.com/prototypal.html>.
 */
x3dom.extend = function(f) {
  function g() {}
  g.prototype = f.prototype || f;
  return new g();
};

/**
 * Function x3dom.getStyle
 * 
 * Computes the value of the specified CSS property <tt>p</tt> on the
 * specified element <tt>e</tt>.
 *
 * Parameters:
 *     oElm       - The element on wich to compute the CSS property
 *     strCssRule - The name of the CSS property
 *
 *	Returns:
 *
 * 		The computed value of the CSS property
 */
x3dom.getStyle = function(oElm, strCssRule) {
    var strValue;
    if(window && window.getComputedStyle && window.getComputedStyle(oElm, "")){
        //strValue = window.getComputedStyle(oElm).webkitTransform;
        //strValue = window.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
        strValue = window.getComputedStyle(oElm, "")[strCssRule];
    }
    else if(oElm.currentStyle){
        strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){ return p1.toUpperCase(); });
        strValue = oElm.currentStyle[strCssRule];
    }
    return strValue;
};


/** Utility function for defining a new class.

    @param parent the parent class of the new class
    @param ctor the constructor of the new class
    @param methods an object literal containing the methods of the new class
    @return the constructor function of the new class
  */
function defineClass(parent, ctor, methods) {
    function inheritance() {}

    if (parent) {
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
	if (!object) {
		return false;
	}
    if (object.constructor === clazz) {
        return true;
    }
    if (object.constructor.superClass === undefined) {
        return false;
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
};


x3dom.getGlobal = function() { return (function(){ return this;}).call(null); };

// move to Util.isNumber or something
x3dom.isNumber = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

/**
 * Load javascript file either by performing an syncronous jax request
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
 *                     path seperator (i.e. src/nodes/). It can be in absolute
 *                     URI form (http://somedomain.tld/src/nodes/)
 * @param  blocking    By default the lookup is done via blocking jax request.
 *                     set to false to use the script i
 */
x3dom.loadJS = function(src, path_prefix, blocking) {
    var blocking = (blocking === false) ? blocking : true;   // default to truye

    if (blocking) {
        var req;
        var url = (path_prefix) ? path_prefix.trim() + src : src;

        if (window.XMLHttpRequest) {
            req = new XMLHttpRequest();
        } else {
            req = new ActiveXObject("Microsoft.XMLHTTP");
        }

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
            //alert("Trying to load external JS file: " + loadpath);
            script.type = "text/javascript";
            script.src = loadpath;
//        head.appendChild(script);
            head.appendChild(script, head.firstChild);
        } else {
            alert("No document object found. Can't load components");
            //x3dom.debug.logError("No document object found. Can't load components");
        }
    }
};

/**
 * Provides requestAnimationFrame in a cross browser way.
 * https://cvs.khronos.org/svn/repos/registry/trunk/public/webgl/sdk/demos/common/webgl-utils.js
 */
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
    	   window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
             window.setTimeout(callback, 1000/60);
           };
})();

function identifyPointDirection(linklist) {
	
		var l, k;
		var count = 0;
		var z;
		var nodei, nodel, nodek;
		
		if (linklist.length < 3) {
			return true;
		}
		
		for (var i = 0; i < linklist.length; i++) {
			l = (i + 1) % linklist.length;
			k = (i + 2) % linklist.length;
			
			nodei = linklist.getNode(i);
			nodel = linklist.getNode(l);
			nodek = linklist.getNode(k); 
					
			z = (nodel.point.x - nodei.point.x) * (nodek.point.y - nodel.point.y);
			z -= (nodel.point.y - nodei.point.y) * (nodek.point.x - nodel.point.x);
			if (z < 0) {
				count--;
			} else if (z > 0) {
				count++;
			}
		}	
		
		if (count < 0) {
			x3dom.debug.logInfo('ja');
			linklist.invert();
		}	
}

function getIndexes(linklist) {
	var indexes = [];
	var node = linklist.first.next;
	var next = null;
	var count = 0;
		
	var isEar = true;
	while(linklist.length >= 3 && count < 10) {
		next = node.next;
		for(var i = 0; i < linklist.length; i++) {
			if(isNotEar(linklist.getNode(i).point, node.prev.point, node.point, node.next.point)) {
				isEar = false;
			}
		}
		
		if(isEar) {
			if(isKonvex(node.prev.point, node.point, node.next.point)) {
				indexes.push(node.prev.point_index, node.point_index, node.next.point_index);
				linklist.deleteNode(node);
			} else {
				count++;
			}
		}
		node = next;
		isEar = true;
	}
	return indexes;
}

function getMultiIndexes(linklist) {
	
	var multi_index_data = new Object();
	multi_index_data.indices = [];
	multi_index_data.normals = [];
	multi_index_data.colors = [];
	multi_index_data.texCoords = [];
	var node = linklist.first.next;
	var next = null;
	var count = 0;
		
	var isEar = true;
	while(linklist.length >= 3  && count < 10) {
		next = node.next;
		for(var i = 0; i < linklist.length; i++) {
			if(isNotEar(linklist.getNode(i).point, node.prev.point, node.point, node.next.point)) {
				isEar = false;
			}
		}
		
		if(isEar) {
			if(isKonvex(node.prev.point, node.point, node.next.point)) {
				multi_index_data.indices.push(node.prev.point_index, node.point_index, node.next.point_index);
				if(node.multi_index_data.normals == false) {
					multi_index_data.normals.push(false);
				} else {
					multi_index_data.normals.push(node.prev.multi_index_data.normals.x,
												  node.prev.multi_index_data.normals.y,
												  node.prev.multi_index_data.normals.z,
												  node.multi_index_data.normals.x,
												  node.multi_index_data.normals.y,
												  node.multi_index_data.normals.z,
												  node.next.multi_index_data.normals.x,
												  node.next.multi_index_data.normals.y,
												  node.next.multi_index_data.normals.z);
				}
				/*multi_index_data.colors.push(node.prev.multi_index_data.colors.r,
											 node.prev.multi_index_data.colors.g,
											 node.prev.multi_index_data.colors.b,
											 node.multi_index_data.colors.r,
											 node.multi_index_data.colors.g,
											 node.multi_index_data.colors.b,
											 node.next.multi_index_data.colors.r,
											 node.next.multi_index_data.colors.g,
											 node.next.multi_index_data.colors.b);*/
				multi_index_data.texCoords.push(node.prev.multi_index_data.texCoords.x,
												node.prev.multi_index_data.texCoords.y,
												node.multi_index_data.texCoords.x,
												node.multi_index_data.texCoords.y,
												node.next.multi_index_data.texCoords.x,
												node.next.multi_index_data.texCoords.y);
				linklist.deleteNode(node);
			}  else {
				count++;
			}
		}
		node = next;
		isEar = true;
	}
	return multi_index_data;
}
function isNotEar(ap1, tp1, tp2, tp3) {
	var b0, b1, b2, b3;
    b0 = ((tp2.x - tp1.x) * (tp3.y - tp1.y) - (tp3.x - tp1.x) * (tp2.y - tp1.y));
    if (b0 != 0) {
      b1 = (((tp2.x - ap1.x) * (tp3.y - ap1.y) - (tp3.x - ap1.x) * (tp2.y - ap1.y)) / b0);
      b2 = (((tp3.x - ap1.x) * (tp1.y - ap1.y) - (tp1.x - ap1.x) * (tp3.y - ap1.y)) / b0);
      b3 = 1 - b1 - b2;

      return ((b1 > 0) && (b2 > 0) && (b3 > 0));
	}
    else {
      return false;
	}	
}

function isKonvex(p ,p1, p2) {
    var l = ((p1.x - p.x) * (p2.y - p.y) - (p1.y - p.y) * (p2.x - p.x));
    if (l < 0) {
      return false;
	} else {
      return true;
	}	
}
