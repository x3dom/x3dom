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

// NodeNameSpace constructor
x3dom.NodeNameSpace = function (name, document) {
    this.name = name;
    this.doc = document;
    this.baseURL = "";
    this.defMap = {};
    this.parent = null;
    this.childSpaces = [];
};

x3dom.NodeNameSpace.prototype.addNode = function (node, name) {
    this.defMap[name] = node;
    node._nameSpace = this;
};

x3dom.NodeNameSpace.prototype.removeNode = function (name) {
    var node = this.defMap.name;
    delete this.defMap.name;
    if (node) {
        node._nameSpace = null;
    }
};

x3dom.NodeNameSpace.prototype.getNamedNode = function (name) {
    return this.defMap[name];
};

x3dom.NodeNameSpace.prototype.getNamedElement = function (name) {
    var node = this.defMap[name];
    return (node ? node._xmlNode : null);
};

x3dom.NodeNameSpace.prototype.addSpace = function (space) {
    this.childSpaces.push(space);
    space.parent = this;
};

x3dom.NodeNameSpace.prototype.removeSpace = function (space) {
    this.childSpaces.push(space);
    space.parent = null;
};

x3dom.NodeNameSpace.prototype.setBaseURL = function (url) {
    var i = url.lastIndexOf ("/");
    this.baseURL = (i >= 0) ? url.substr(0,i+1) : "";

    x3dom.debug.logInfo("setBaseURL: " + this.baseURL);
};

x3dom.NodeNameSpace.prototype.getURL = function (url) {
    if (url === undefined || !url.length) {
        return "";
    }
    else {
        return ((url[0] === '/') || (url.indexOf(":") >= 0)) ? url : (this.baseURL + url);
    }
};


// helper to set an element's attribute
x3dom.setElementAttribute = function(attrName, newVal)
{
    var prevVal = this.getAttribute(attrName);
    this.__setAttribute(attrName, newVal);
    //newVal = this.getAttribute(attrName);

    this._x3domNode.updateField(attrName, newVal);
    this._x3domNode._nameSpace.doc.needRender = true;

    /* construct and fire an event
    if (newVal != prevVal) {
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
    */
};

x3dom.NodeNameSpace.prototype.setupTree = function (domNode) {
    var n, t;

    if (x3dom.isX3DElement(domNode)) {

        // return if it is already initialized
        if (domNode._x3domNode) {
            x3dom.debug.logWarning('Tree is already initialized');
            return;
        }

        //active workaground for missing DOMAttrModified support
        if ( (x3dom.userAgentFeature.supportsDOMAttrModified === false) &&
             (domNode.tagName !== undefined) && (!domNode.__setAttribute) ) {
            domNode.__setAttribute = domNode.setAttribute;
            domNode.setAttribute = x3dom.setElementAttribute;
        }

        // workaround since one cannot find out which handlers are registered
        if ( (domNode.tagName !== undefined) &&
            (!domNode.__addEventListener) && (!domNode.__removeEventListener) )
        {
            // helper to track an element's listeners
            domNode.__addEventListener = domNode.addEventListener;
            domNode.addEventListener = function(type, func, phase) {
                if (!this._x3domNode._listeners[type]) {
                    this._x3domNode._listeners[type] = [];
                }
                this._x3domNode._listeners[type].push(func);

                x3dom.debug.logInfo('addEventListener for ' + this.tagName + ".on" + type);
                this.__addEventListener(type, func, phase);
            };

            domNode.__removeEventListener = domNode.removeEventListener;
            domNode.removeEventListener = function(type, func, phase) {
                var list = this._x3domNode._listeners[type];
                if (list) {
                    for (var it=0; it<list.length; it++) {
                        if (list[it] == func) {
                            list.splice(it, 1);
                            x3dom.debug.logInfo('removeEventListener for ' +
                                                this.tagName + ".on" + type);
                        }
                    }
                }
                this.__removeEventListener(type, func, phase);
            };
        }

        // x3dom.debug.logInfo("=== node=" + domNode.localName);
        if (domNode.hasAttribute('USE')) {
            n = this.defMap[domNode.getAttribute('USE')];
            if (n === null) {
                x3dom.debug.logWarning('Could not USE: ' + domNode.getAttribute('USE'));
            }
            return n;
        }
        else {
            // check and create ROUTEs
            if (domNode.localName.toLowerCase() === 'route') {
                var route = domNode;
                var fromNode = this.defMap[route.getAttribute('fromNode')];
                var toNode = this.defMap[route.getAttribute('toNode')];
                //x3dom.debug.logInfo("ROUTE: from=" + fromNode._DEF + ", to=" + toNode._DEF);
                if (! (fromNode && toNode)) {
                    x3dom.debug.logWarning("Broken route - can't find all DEFs for " +
                                route.getAttribute('fromNode')+" -> "+ route.getAttribute('toNode'));
                    return null;
                }
                fromNode.setupRoute(route.getAttribute('fromField'), toNode, route.getAttribute('toField'));
//                 TODO: Store the routes of the scene - where should we store them?
//                 scene._routes = Array.map(sceneRoutes, setupRoute);
                return null;
            }

            // find the NodeType for the given dom-node
            var nodeType = x3dom.nodeTypesLC[domNode.localName.toLowerCase()];
            if (nodeType === undefined) {
                x3dom.debug.logInfo("Unrecognised X3D element &lt;" + domNode.localName + "&gt;.");
            }
            else {
                var ctx = { doc: this.doc, xmlNode: domNode };
                n = new nodeType(ctx);
                n._nameSpace = this;

                // x3dom.debug.logInfo("new node type: " + domNode.localName);

                // find and store/link _DEF name
                if (domNode.hasAttribute('DEF')) {
                   n._DEF = domNode.getAttribute('DEF');
                   this.defMap[n._DEF] = n;
                }
                else {
                  if (domNode.hasAttribute('id')) {
                    n._DEF = domNode.getAttribute('id');
                    this.defMap[n._DEF] = n;
                  }
                }

                // link both DOM-Node and Scene-graph-Node
                n._xmlNode = domNode;
                domNode._x3domNode = n;

                // call children
                /*
                Array.forEach( Array.map(domNode.childNodes,
                                function (n) { return this.setupTree(n); }, this),
                                function (c) { if (c) n.addChild(c); });
                */
                var that = this;
                Array.forEach ( domNode.childNodes, function (childDomNode) {
                    var c = that.setupTree(childDomNode);
                    if (c) {
                        n.addChild(c, childDomNode.getAttribute("containerField"));
                    }
                } );

                // FIXME: remove
                n.nodeChanged();
                return n;
            }
        }
    }
    else if (domNode.localName) {
        // be nice to users who use nodes not (yet) known to the system
        x3dom.debug.logInfo("Unrecognised X3D element &lt;" + domNode.localName + "&gt;.");
        n = null;
    }

    return n;
};

