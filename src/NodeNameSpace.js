/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/// NodeNameSpace constructor
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
    var node = name ? this.defMap[name] : null;
    if (node) {
        delete this.defMap[name];
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
    space.parent = null;
    for (var it=0; it<this.childSpaces.length; it++) {
        if (this.childSpaces[it] == space) {
            this.childSpaces.splice(it, 1);
        }
    }
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

// helper to check an element's attribute
x3dom.hasElementAttribute = function(attrName)
{
    var ok = this.__hasAttribute(attrName);
    if (!ok && attrName) {
        ok = this.__hasAttribute(attrName.toLowerCase());
    }
    return ok;
};

// helper to get an element's attribute
x3dom.getElementAttribute = function(attrName)
{
    var attrib = this.__getAttribute(attrName);
    if (!attrib && attrib != "" && attrName) {
        attrib = this.__getAttribute(attrName.toLowerCase());
    }

    if (attrib || !this._x3domNode) {
        return attrib;
    }
    else {
        return this._x3domNode._vf[attrName];
    }
};

// helper to set an element's attribute
x3dom.setElementAttribute = function(attrName, newVal)
{
    //var prevVal = this.getAttribute(attrName);
    this.__setAttribute(attrName, newVal);
    //newVal = this.getAttribute(attrName);

    var x3dNode = this._x3domNode;
    if (x3dNode) {
        x3dNode.updateField(attrName, newVal);
        x3dNode._nameSpace.doc.needRender = true;
    }
};

/**
 * Returns the value of the field with the given name.
 * The value is returned as an object of the corresponding field type.
 *
 * @param {String} fieldName - the name of the field
 */
x3dom.getFieldValue = function(fieldName)
{
    var x3dNode = this._x3domNode;

    if (x3dNode && (x3dNode._vf[fieldName] !== undefined)) {

        var fieldValue = x3dNode._vf[fieldName];

        if(fieldValue instanceof Object && 'copy' in fieldValue)
        {
            return x3dNode._vf[fieldName].copy();
        }
        else
        {
            //f.i. SFString SFBool aren't objects
            return x3dNode._vf[fieldName];
        }
    }

    return null;
};


/**
 * Sets the value of the field with the given name to the given value.
 * The value is specified as an object of the corresponding field type.
 *
 * @param {String} fieldName  - the name of the field where the value should be set
 * @param {String} fieldvalue - the new field value
 */
x3dom.setFieldValue = function(fieldName, fieldvalue) {
    var x3dNode = this._x3domNode;
    if (x3dNode && (x3dNode._vf[fieldName] !== undefined)) {

        // SF/MF object types are cloned based on a copy function
        if(fieldvalue instanceof Object && 'copy' in fieldvalue)
        {
            x3dNode._vf[fieldName] = fieldvalue.copy();
        }
        //f.i. SFString SFBool aren't objects
        else
            x3dNode._vf[fieldName] = fieldvalue;

        x3dNode.fieldChanged(fieldName);
        x3dNode._nameSpace.doc.needRender = true;
    }
};


/**
 * Returns the field object of the field with the given name.
 * The returned object is no copy, but instead a reference to X3DOM's internal field object.
 * Changes to this object should be committed using the returnFieldRef function.
 * Note: this only works for fields with pointer types such as MultiFields!
 *
 * @param {String} fieldName - the name of the field
 */
x3dom.requestFieldRef = function(fieldName)
{
    var x3dNode = this._x3domNode;
    if (x3dNode && x3dNode._vf[fieldName])
    {
        return x3dNode._vf[fieldName];
    }

    return null;
};


/**
 * Commits all changes made to the internal field object of the field with the given name.
 * This must be done in order to notify X3DOM to process all related changes internally.
 *
 * @param {String} fieldName - the name of the field
 */
x3dom.releaseFieldRef = function(fieldName)
{
    var x3dNode = this._x3domNode;
    if (x3dNode && x3dNode._vf[fieldName])
    {
        x3dNode.fieldChanged(fieldName);
        x3dNode._nameSpace.doc.needRender = true;
    }
};


x3dom.NodeNameSpace.prototype.setupTree = function (domNode, parent) {
    var n = null;

    parent = parent || null;

    if (x3dom.isX3DElement(domNode)) {

        // return if it is already initialized
        if (domNode._x3domNode) {
            x3dom.debug.logWarning('Tree is already initialized');
            return null;
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

                //x3dom.debug.logInfo('addEventListener for ' + this.tagName + ".on" + type);
                this.__addEventListener(type, func, phase);
            };

            domNode.__removeEventListener = domNode.removeEventListener;
            domNode.removeEventListener = function(type, func, phase) {
                var list = this._x3domNode._listeners[type];
                if (list) {
                    for (var it=0; it<list.length; it++) {
                        if (list[it] == func) {
                            list.splice(it, 1);
                            //x3dom.debug.logInfo('removeEventListener for ' +
                            //                    this.tagName + ".on" + type);
                        }
                    }
                }
                this.__removeEventListener(type, func, phase);
            };
        }

        // TODO (?): dynamic update of USE attribute during runtime
        if (domNode.hasAttribute('USE') || domNode.hasAttribute('use'))
        {
            //fix usage of lowercase 'use'
            if (!domNode.hasAttribute('USE')) {
                domNode.setAttribute('USE', domNode.getAttribute('use'));
            }

            n = this.defMap[domNode.getAttribute('USE')];
            if (!n) {
                var nsName = domNode.getAttribute('USE').split('__');

                if (nsName.length >= 2) {
                    var otherNS = this;
                    while (otherNS) {
                        if (otherNS.name == nsName[0])
                            n = otherNS.defMap[nsName[1]];
                        if (n)
                            otherNS = null;
                        else
                            otherNS = otherNS.parent;
                    }
                    if (!n) {
                        n = null;
                        x3dom.debug.logWarning('Could not USE: ' + domNode.getAttribute('USE'));
                    }
                }
            }
            if (n) {
                domNode._x3domNode = n;
            }
            return n;
        }
        else {
            // check and create ROUTEs
            if (domNode.localName.toLowerCase() === 'route') {
                var route = domNode;
                var fnAtt = route.getAttribute('fromNode') || route.getAttribute('fromnode');
                var tnAtt = route.getAttribute('toNode') || route.getAttribute('tonode');
                var fromNode = this.defMap[fnAtt];
                var toNode = this.defMap[tnAtt];
                if (! (fromNode && toNode)) {
                    x3dom.debug.logWarning("Broken route - can't find all DEFs for " + fnAtt + " -> " + tnAtt);
                }
                else {
                    //x3dom.debug.logInfo("ROUTE: from=" + fromNode._DEF + ", to=" + toNode._DEF);
                    fnAtt = route.getAttribute('fromField') || route.getAttribute('fromfield');
                    tnAtt = route.getAttribute('toField') || route.getAttribute('tofield');
                    fromNode.setupRoute(fnAtt, toNode, tnAtt);
                    // Store reference to namespace for being able to remove route later on
                    route._nodeNameSpace = this;
                }
                return null;
            }

            //attach X3DOM's custom field interface functions
            domNode.requestFieldRef = x3dom.requestFieldRef;
            domNode.releaseFieldRef = x3dom.releaseFieldRef;
            domNode.getFieldValue = x3dom.getFieldValue;
            domNode.setFieldValue = x3dom.setFieldValue;

            // find the NodeType for the given dom-node
            var nodeType = x3dom.nodeTypesLC[domNode.localName.toLowerCase()];
            if (nodeType === undefined) {
                x3dom.debug.logWarning("Unrecognised X3D element &lt;" + domNode.localName + "&gt;.");
            }
            else {
                //active workaround for missing DOMAttrModified support
                if ( (x3dom.userAgentFeature.supportsDOMAttrModified === false)
                      && (domNode instanceof Element) ) {
                    if (domNode.setAttribute && !domNode.__setAttribute) {
                        domNode.__setAttribute = domNode.setAttribute;
                        domNode.setAttribute = x3dom.setElementAttribute;
                    }

                    if (domNode.getAttribute && !domNode.__getAttribute) {
                        domNode.__getAttribute = domNode.getAttribute;
                        domNode.getAttribute = x3dom.getElementAttribute;
                    }

                    if (domNode.hasAttribute && !domNode.__hasAttribute) {
                        domNode.__hasAttribute = domNode.hasAttribute;
                        domNode.hasAttribute = x3dom.hasElementAttribute;
                    }
                }

                // create x3domNode
                var ctx = {
                    doc: this.doc,
                    xmlNode: domNode,
                    nameSpace: this
                };
                n = new nodeType(ctx);

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
                
                // add experimental highlighting functionality
                if (domNode.highlight === undefined) 
                {
                    domNode.highlight = function(enable, colorStr) {
                        var color = x3dom.fields.SFColor.parse(colorStr);
                        this._x3domNode.highlight(enable, color);
                        this._x3domNode._nameSpace.doc.needRender = true;
                    };
                }

                // link both DOM-Node and Scene-graph-Node
                n._xmlNode = domNode;
                domNode._x3domNode = n;

                // call children
                var that = this;
                Array.forEach ( domNode.childNodes, function (childDomNode) {
                    var c = that.setupTree(childDomNode, n);
                    if (c) {
                        n.addChild(c, childDomNode.getAttribute("containerField"));
                    }
                } );

                n.nodeChanged();
                return n;
            }
        }
    }
    else if (domNode.localName)
    {
        if ( parent && domNode.localName.toLowerCase() == "x3dommetagroup" )
        {
            Array.forEach ( domNode.childNodes, function (childDomNode) {
                var c = this.setupTree(childDomNode, parent);
                if (c) {
                    parent.addChild(c, childDomNode.getAttribute("containerField"));
                }
            }.bind(this) );
        }
        else
        {
            // be nice to users who use nodes not (yet) known to the system
            x3dom.debug.logWarning("Unrecognised X3D element &lt;" + domNode.localName + "&gt;.");
            n = null;
        }
    }

    return n;
};
