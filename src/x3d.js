/*!
* x3dom javascript library 0.1
* http://www.x3dom.org/
*
* Copyright (c) 2009 Peter Eschler, Johannes Behr, Yvonne Jung
*     based on code originally provided by Philip Taylor:
*     http://philip.html5.org
* Dual licensed under the MIT and GPL licenses.
* 
*/

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

// BindableStack constructor
x3dom.BindableStack = function (doc, type, defaultType, getter) {
	this._doc = doc; 
	this._type = type;
	this._defaultType = defaultType;
	this._defaultRoot = 0;
	this._getter = getter;
	this._bindBag = [];
	this._bindStack = [];
	
	// x3dom.debug.logInfo ('Create BindableStack ' + this._type._typeName + ', ' + this._getter);
};

x3dom.BindableStack.prototype.top = function () {
	return ( (this._bindStack.length >= 0) ? this._bindStack[this._bindStack.length - 1] : null );
};

x3dom.BindableStack.prototype.push = function (bindable) {
	var top = this.top();

	if (top === bindable) {
		return;
	}

	if (top) {
		top.deactivate();
	}
	
	this._bindStack.push (bindable);
	bindable.activate();
};

x3dom.BindableStack.prototype.pop = function (bindable) {
	var top;
	
	if (bindable) {
		top = this.top();
		if (bindable !== top) {
			return null;
		} 
	}
	
	top = this._bindStack.pop();
	
	if (top) {
		top.deactivate();
	}
	
	return top;
};

x3dom.BindableStack.prototype.getActive = function () {
	if (this._bindStack.length === 0) {		
		if (this._bindBag.length === 0) {
			x3dom.debug.logInfo ( 'create new ' + this._defaultType._typeName + ' for ' + this._type._typeName + '-stack');            
			var obj = new this._defaultType( { doc: this._doc, autoGen: true } );
			if (obj) {
				if (this._defaultRoot) {
					this._defaultRoot.addChild(obj);
					obj._nameSpace = this._defaultRoot._nameSpace;
				}
				else {
					x3dom.debug.logError ('stack without defaultRoot');
				}
				obj.initDefault();
				this._bindBag.push(obj);
			}
		}
		else {
			x3dom.debug.logInfo ( 'activate first ' + this._defaultType._typeName + ' for ' + this._type._typeName + '-stack');
		}
		
		this._bindBag[0].activate();
		this._bindStack.push(this._bindBag[0]);
	}
		
	return this._bindStack[this._bindStack.length - 1];
};

x3dom.BindableBag = function (doc) {
	this._stacks = [];
	
	this.addType ("X3DViewpointNode", "Viewpoint", "getViewpoint", doc);
	this.addType ("X3DNavigationInfoNode", "NavigationInfo", "getNavigationInfo", doc);
	this.addType ("X3DBackgroundNode", "Background", "getBackground", doc);
	this.addType ("X3DFogNode", "Fog", "getFog", doc);
};

x3dom.BindableBag.prototype.addType = function(typeName,defaultTypeName,getter,doc) {
	var type = x3dom.nodeTypes[typeName];
	var defaultType = x3dom.nodeTypes[defaultTypeName];
	var stack;
	
	if (type && defaultType) {
		//x3dom.debug.logInfo ('Create new BindableStack for ' + typeName);
		stack = new x3dom.BindableStack (doc, type, defaultType, getter);
		this._stacks.push(stack);
	}
	else {
	    x3dom.debug.logInfo ('Invalid Bindable type/defaultType:' + typeName + '/' + defaultType);
	}
};

x3dom.BindableBag.prototype.setRefNode = function (node) {
	Array.forEach ( this._stacks, function (stack) {
		stack._defaultRoot = node;
		node[stack._getter] = function () { return stack.getActive(); };
	} );
};

x3dom.BindableBag.prototype.addBindable = function(node) {
	for (var i = 0, n = this._stacks.length; i < n; i++) {
		if ( x3dom.isa (node, this._stacks[i]._defaultType) ) {
			x3dom.debug.logInfo ('register bindable ' + node.typeName());
			this._stacks[i]._bindBag.push(node);
			return this._stacks[i];
		}
	}
	x3dom.debug.logError (node.typeName() + ' is not a valid bindable');
	return null;
};

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

// helper to get a style
x3dom.getStyle = function(oElm, strCssRule) {
	var strValue;
	if(window && window.getComputedStyle){
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
	
		//active workaground for missing DOMAttrModified support
        if ( (x3dom.userAgentFeature.supportsDOMAttrModified === false) &&
             (domNode.tagName !== undefined) && (!domNode.__setAttribute) ) {
        	domNode.__setAttribute = domNode.setAttribute;
            domNode.setAttribute = x3dom.setElementAttribute;
		}
		
        // x3dom.debug.logInfo("=== node=" + domNode.localName);
	    if (domNode.hasAttribute('USE')) {
	      n = this.defMap[domNode.getAttribute('USE')];
	      if (n === null) 
	        x3dom.debug.logInfo ('Could not USE: ' + domNode.getAttribute('USE'));
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
                    x3dom.debug.logInfo("Broken route - can't find all DEFs for " + 
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
					if (c) n.addChild(c, childDomNode.getAttribute("containerField")); 
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

x3dom.MatrixMixer = function(beginTime, endTime) {
    if (arguments.length === 0) {
        this._beginTime = 0;
        this._endTime = 0;
    }
    else {
        this._beginTime = beginTime;
        this._endTime = endTime;
    }
    
    this._beginMat = x3dom.fields.SFMatrix4f.identity();
    this._beginInvMat = x3dom.fields.SFMatrix4f.identity();
    this._beginLogMat = x3dom.fields.SFMatrix4f.identity();
    this._endMat = x3dom.fields.SFMatrix4f.identity();
    this._endLogMat = x3dom.fields.SFMatrix4f.identity();
};

x3dom.MatrixMixer.prototype.calcFraction = function(time) {
    var fraction = (time - this._beginTime) / (this._endTime - this._beginTime);
    return (Math.sin((fraction * Math.PI) - (Math.PI / 2)) + 1) / 2.0;
};

x3dom.MatrixMixer.prototype.setBeginMatrix = function(mat) {
 	this._beginMat.setValues(mat);
	this._beginInvMat = mat.inverse();
	this._beginLogMat = x3dom.fields.SFMatrix4f.zeroMatrix();
};

x3dom.MatrixMixer.prototype.setEndMatrix = function(mat) {
    this._endMat.setValues(mat);
	this._endLogMat = mat.mult(this._beginInvMat).log();
};

x3dom.MatrixMixer.prototype.mix = function(time) {
    var mat = x3dom.fields.SFMatrix4f.zeroMatrix();
    
    if (time <= this._beginTime)
    {
        mat.setValues(this._beginLogMat);
    }
    else
    {
        if (time >= this._endTime)
        {
            mat.setValues(this._endLogMat);
        }
        else
        {
            var fraction = this.calcFraction(time);
            mat = this._endLogMat.addScaled(this._beginLogMat, -1);
            mat = mat.multiply(fraction).add(this._beginLogMat);
        }
    }
    
    mat = mat.exp().mult(this._beginMat);
    
    return mat;
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


// ### X3DNode ###
x3dom.registerNodeType(
    "X3DNode", 
    "Core", 
    defineClass(null, function (ctx) {
		
		// holds a link to the node name
		this._DEF = null;
		
		// links the nameSpace
		this._nameSpace = null;
		
		// holds all value fields (e.g. SFFloat, MFVec3f, ...)
		this._vf = {};
		// holds all child fields ( SFNode and MFNode )
		this._cf = {};
		
        this._fieldWatchers = {};
        this._parentNodes = [];
        
		// FIXME; should be removed and handled by _cf methods
        this._childNodes = [];
        
        this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
    },
    {
		type: function () {
			return this.constructor;
		},
		typeName: function () {
			return this.constructor._typeName;
		},
        
        addChild: function (node, containerFieldName) {
			if (node) {
				var field = null;
				if (containerFieldName) {
					field = this._cf[containerFieldName];
				}
				else {
		    		for (var fieldName in this._cf) {
                		if (this._cf.hasOwnProperty(fieldName)) {
                    		var testField = this._cf[fieldName];
                    		if (x3dom.isa(node,testField.type)) {
								field = testField;
								break;
							}
						}
					}
				}
				if (field && field.addLink(node)) {
                    node._parentNodes.push(this);
                    this._childNodes.push(node);
                    node.parentAdded(this);
                	return true;
            	}
			}
            return false;
        },
        
        removeChild: function (node) {
			if (node) {
	        	for (var fieldName in this._cf) {
                	if (this._cf.hasOwnProperty(fieldName)) {
                    	var field = this._cf[fieldName];
                    	if (field.rmLink(node)) {
                        	for (var i = 0, n = node._parentNodes.length; i < n; i++) {
                            	if (node._parentNodes[i] === this) {
                                	node._parentNodes.splice(i,1);
                                    node.parentRemoved(this);
                            	}
                        	}
							for (var j = 0, m = this._childNodes.length; j < m; j++) {
                        		if (this._childNodes[j] === node) {
                             		this._childNodes.splice(j,1);
                                	return true;
								}
                         	}
                        }
                    }
                }
            }
            return false;
        },
        
        parentAdded: function(parent) {
            // to be overwritten by concrete classes
        },
        
        parentRemoved: function(parent) {
            // to be overwritten by concrete classes
        },
        
        getCurrentTransform: function () {
            if (this._parentNodes.length >= 1) {
                return this.transformMatrix(this._parentNodes[0].getCurrentTransform());
            }
            else {
                return x3dom.fields.SFMatrix4f.identity();
            }
        },

        transformMatrix: function (transform) {
            return transform;
        },
		
		getVolume: function (min, max, invalidate) 
        {
            var valid = false;
			for (var i=0, n=this._childNodes.length; i<n; i++)
			{
				if (this._childNodes[i])
				{
                    var childMin = x3dom.fields.SFVec3f.MAX();
                    var childMax = x3dom.fields.SFVec3f.MIN();
                    
                    valid = this._childNodes[i].getVolume(
                                    childMin, childMax, invalidate) || valid;
                    
                    if (valid)  // values only set by Mesh.BBox()
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

        find: function (type) {
            for (var i=0; i<this._childNodes.length; i++) {
                if (this._childNodes[i]) {
                    if (this._childNodes[i].constructor == type) {
                        return this._childNodes[i];
                    }
                    var c = this._childNodes[i].find(type);
                    if (c) {
                        return c;
                    }
                }
            }
            return null;
        },

        findAll: function (type) {
            var found = [];
            for (var i=0; i<this._childNodes.length; i++) {
                if (this._childNodes[i]) {
                    if (this._childNodes[i].constructor == type) {
                        found.push(this._childNodes[i]);
                    }
                    // TODO: this has non-linear performance
                    found = found.concat(this._childNodes[i].findAll(type));
                }
            }
            return found;
        },

		findParentProperty: function (propertyName, checkDOMNode) {
			var value = this[propertyName];
						
			if (!value && checkDOMNode && this._xmlNode) {
				value = this._xmlNode[propertyName];
			}
			
			if (!value) {
				for (var i = 0, n = this._parentNodes.length; i < n; i++) {
					if ((value = this._parentNodes[i].findParentProperty(propertyName, checkDOMNode ))) {
						break;
					}
				}
			}
			
			return value;
		},

	    findX3DDoc: function () {
			return this._nameSpace.doc;
        },

        // Collects array of [transform matrix, node] for all objects that should be drawn.
        collectDrawableObjects: function (transform, out) {
            // TODO: culling etc.
            for (var i=0; i<this._childNodes.length; i++) {
                if (this._childNodes[i]) {
                    var childTransform = this._childNodes[i].transformMatrix(transform);
                    this._childNodes[i].collectDrawableObjects(childTransform, out);
                }
            }
        },
        
        doIntersect: function(line) {
            var isect = false;
            for (var i=0; i<this._childNodes.length; i++) {
                if (this._childNodes[i]) {
                    isect = this._childNodes[i].doIntersect(line) || isect;
                }
            }
            return isect;
        },

        postMessage: function (field, msg) {
            // TODO: timestamps and stuff
            this._vf[field] = msg;  // FIXME; _cf!!!
            var listeners = this._fieldWatchers[field];
            var thisp = this;
            if (listeners) {
                Array.forEach(listeners, function (l) { l.call(thisp, msg); });
            }
        },

        // method for handling field updates
        updateField: function (field, msg) {			
			var f = this._vf[field];
			
			if (f === undefined) {
				f = {};
				this._vf[field] = f;
			}
			
            if (f !== null) {
                try {
                    this._vf[field].setValueByStr(msg);
                }
                catch (exc1) {
                    try {
                        switch ((typeof(this._vf[field])).toString()) {
                            case "number":
                                this._vf[field] = +msg;
                                break;
                            case "boolean":
                                this._vf[field] = (msg.toLowerCase() === "true");
                                break;
                            case "string":
                                this._vf[field] = msg;
                                break;
                        };
                    }
                    catch (exc2) {
                        x3dom.debug.logInfo("updateField: setValueByStr() NYI for " + typeof(f));
                    }
                }
                
                // TODO: eval fieldChanged for all nodes!
                this.fieldChanged(field);
            }
        },

        setupRoute: function (fromField, toNode, toField) {
			var pos;
			var fieldName;
			var pre = "set_", post = "_changed";
            
			// build correct fromField
			if (!this._vf[fromField]) {
				pos = fromField.indexOf(pre);
				if (pos === 0) {
					fieldName = fromField.substr(pre.length, fromField.length - 1);
					if (this._vf[fieldName]) 
						fromField = fieldName;
				}
                else {
					pos = fromField.indexOf(post);
					if (pos > 0) {
						fieldName = fromField.substr(0, fromField.length - post.length);
						if (this._vf[fieldName]) 
							fromField = fieldName;
					}
				}
			}
			
			// build correct toField
			if (!toNode._vf[toField]) {
				pos = toField.indexOf(pre);
				if (pos === 0) {
					fieldName = toField.substr(pre.length, toField.length - 1);
					if (toNode._vf[fieldName]) 
						toField = fieldName;
				}
                else {
					pos = toField.indexOf(post);
					if (pos > 0) {
						fieldName = toField.substr(0, toField.length - post.length);
						if (toNode._vf[fieldName]) 
							toField = fieldName;
					}
				}
			}
            
         
            if (! this._fieldWatchers[fromField]) {
                this._fieldWatchers[fromField] = [];
            }
            this._fieldWatchers[fromField].push(
                function (msg) { 
                    toNode.postMessage(toField, msg); 
                }
            );
            
            if (! toNode._fieldWatchers[toField]) {
               	toNode._fieldWatchers[toField] = [];
           	}
            toNode._fieldWatchers[toField].push(
                function (msg) {
                    // FIXME: THIS DOESN'T WORK FOR NODE (_cf) FIELDS
                    toNode._vf[toField] = msg;
                    
                    toNode.fieldChanged(toField);
                }
            );
        },
        
        fieldChanged: function (fieldName) {
            // to be overwritten by concrete classes
        },
        
		nodeChanged: function () {
			// to be overwritten by concrete classes
		},
        
		addField_SFInt32: function (ctx, name, n) {
            this._vf[name] = ctx && ctx.xmlNode.hasAttribute(name) ? 
                parseInt(ctx.xmlNode.getAttribute(name),10) : n;
        },
        addField_SFFloat: function (ctx, name, n) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                +ctx.xmlNode.getAttribute(name) : n;
        },
        addField_SFDouble: function (ctx, name, n) {    // is double anyway
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                +ctx.xmlNode.getAttribute(name) : n;
        },
        addField_SFTime: function (ctx, name, n) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                +ctx.xmlNode.getAttribute(name) : n;
        },
        addField_SFBool: function (ctx, name, n) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                ctx.xmlNode.getAttribute(name).toLowerCase() === "true" : n;
        },
        addField_SFString: function (ctx, name, n) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                ctx.xmlNode.getAttribute(name) : n;
        },
        addField_SFColor: function (ctx, name, r, g, b) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.SFColor.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.SFColor(r, g, b);
        },
        addField_SFColorRGBA: function (ctx, name, r, g, b, a) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.SFColorRGBA.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.SFColorRGBA(r, g, b, a);
        },
        addField_SFVec2f: function (ctx, name, x, y) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.SFVec2f.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.SFVec2f(x, y);
        },
        addField_SFVec3f: function (ctx, name, x, y, z) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.SFVec3f.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.SFVec3f(x, y, z);
        },
        addField_SFRotation: function (ctx, name, x, y, z, a) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.Quaternion.parseAxisAngle(ctx.xmlNode.getAttribute(name)) : 
                x3dom.fields.Quaternion.axisAngle(new x3dom.fields.SFVec3f(x, y, z), a);
        },
        addField_SFMatrix4f: function (ctx, name, _00, _01, _02, _03, 
                                                  _10, _11, _12, _13, 
                                                  _20, _21, _22, _23, 
                                                  _30, _31, _32, _33) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.SFMatrix4f.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.SFMatrix4f(_00, _01, _02, _03, 
                                            _10, _11, _12, _13, 
                                            _20, _21, _22, _23, 
                                            _30, _31, _32, _33);
        },
        addField_SFImage: function (ctx, name, def) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.SFImage.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.SFImage(def);
        },
        
        addField_MFString: function (ctx, name, def) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.MFString.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.MFString(def);
        },
        addField_MFInt32: function (ctx, name, def) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.MFInt32.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.MFInt32(def);
        },
        addField_MFFloat: function (ctx, name, def) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.MFFloat.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.MFFloat(def);
        },
        addField_MFDouble: function (ctx, name, def) {  // is double anyway
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.MFFloat.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.MFFloat(def);
        },
        addField_MFColor: function (ctx, name, def) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.MFColor.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.MFColor(def);
        },
        addField_MFColorRGBA: function (ctx, name, def) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.MFColorRGBA.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.MFColorRGBA(def);
        },
        addField_MFVec2f: function (ctx, name, def) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.MFVec2f.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.MFVec2f(def);
        },
        addField_MFVec3f: function (ctx, name, def) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.MFVec3f.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.MFVec3f(def);
        },
        addField_MFRotation: function (ctx, name, def) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ? 
                x3dom.fields.MFRotation.parse(ctx.xmlNode.getAttribute(name)) : 
                new x3dom.fields.MFRotation(def);
        },
        
		addField_SFNode: function (name, type) {
			this._cf[name] = new x3dom.fields.SFNode(type);
		},
		addField_MFNode: function (name, type) {
			this._cf[name] = new x3dom.fields.MFNode(type);
		}
    }
));

/* ### X3DMetadataObject ### */
x3dom.registerNodeType(
    "X3DMetadataObject", 
    "Core", 
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DMetadataObject.superClass.call(this, ctx);
            
            this.addField_SFString(ctx, 'name', "");
            this.addField_SFString(ctx, 'reference', "");
        }
    )
);

/* ### MetadataDouble ### */
x3dom.registerNodeType(
    "MetadataDouble",
    "Core",
    defineClass(x3dom.nodeTypes.X3DMetadataObject,
        function (ctx) {
            x3dom.nodeTypes.MetadataDouble.superClass.call(this, ctx);
			
            this.addField_MFDouble(ctx, 'value', []);
        }
    )
);

/* ### MetadataFloat ### */
x3dom.registerNodeType(
    "MetadataFloat",
    "Core",
    defineClass(x3dom.nodeTypes.X3DMetadataObject,
        function (ctx) {
            x3dom.nodeTypes.MetadataFloat.superClass.call(this, ctx);
			
            this.addField_MFFloat(ctx, 'value', []);
        }
    )
);

/* ### MetadataInteger ### */
x3dom.registerNodeType(
    "MetadataInteger",
    "Core",
    defineClass(x3dom.nodeTypes.X3DMetadataObject,
        function (ctx) {
            x3dom.nodeTypes.MetadataInteger.superClass.call(this, ctx);
			
            this.addField_MFInt32(ctx, 'value', []);
        }
    )
);

/* ### MetadataSet ### */
x3dom.registerNodeType(
    "MetadataSet",
    "Core",
    defineClass(x3dom.nodeTypes.X3DMetadataObject,
        function (ctx) {
            x3dom.nodeTypes.MetadataSet.superClass.call(this, ctx);
			
            this.addField_MFNode('value', x3dom.nodeTypes.X3DMetadataObject);
        }
    )
);

/* ### MetadataString ### */
x3dom.registerNodeType(
    "MetadataString",
    "Core",
    defineClass(x3dom.nodeTypes.X3DMetadataObject,
        function (ctx) {
            x3dom.nodeTypes.MetadataString.superClass.call(this, ctx);
			
            this.addField_MFString(ctx, 'value', []);
        }
    )
);

/* ### Field ### */
x3dom.registerNodeType( 
    "Field",
    "Core",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.Field.superClass.call(this, ctx);
            
            this.addField_SFString(ctx, 'name', "");
            this.addField_SFString(ctx, 'type', "");
			this.addField_SFString(ctx, 'value', "");
        },
		{
			fieldChanged: function(fieldName) {
                var that = this;
                if (fieldName === 'value') {
                    Array.forEach(this._parentNodes, function (node) {
                        node.fieldChanged(that._vf.name);
                    });
                }
            }
        }
    )
);

/* ### Uniform ### */
x3dom.registerNodeType( 
    "Uniform",
    "Shaders",
    defineClass(x3dom.nodeTypes.Field,
        function (ctx) {
            x3dom.nodeTypes.Uniform.superClass.call(this, ctx);
        }
    )
);


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

/* ### X3DTextureTransformNode ### */
x3dom.registerNodeType(
    "X3DTextureTransformNode",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DTextureTransformNode.superClass.call(this, ctx);
        }
    )
);

/* ### TextureTransform ### */
x3dom.registerNodeType(
    "TextureTransform",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureTransformNode,
        function (ctx) {
            x3dom.nodeTypes.TextureTransform.superClass.call(this, ctx);
			
			this.addField_SFVec2f(ctx, 'center', 0, 0);
            this.addField_SFFloat(ctx, 'rotation', 0);
            this.addField_SFVec2f(ctx, 'scale', 1, 1);
            this.addField_SFVec2f(ctx, 'translation', 0, 0);
            
            //Tc' = -C * S * R * C * T * Tc
            var negCenter = new x3dom.fields.SFVec3f(-this._vf.center.x, -this._vf.center.y, 1);
            var posCenter = new x3dom.fields.SFVec3f(this._vf.center.x, this._vf.center.y, 0);
            var trans3 = new x3dom.fields.SFVec3f(this._vf.translation.x, this._vf.translation.y, 0);
            var scale3 = new x3dom.fields.SFVec3f(this._vf.scale.x, this._vf.scale.y, 0);
            
            this._trafo = x3dom.fields.SFMatrix4f.translation(negCenter).
                    mult(x3dom.fields.SFMatrix4f.scale(scale3)).
                    mult(x3dom.fields.SFMatrix4f.rotationZ(this._vf.rotation)).
                    mult(x3dom.fields.SFMatrix4f.translation(posCenter.add(trans3)));
        },
        {
            fieldChanged: function (fieldName) {
	            //Tc' = -C * S * R * C * T * Tc
                var negCenter = new x3dom.fields.SFVec3f(-this._vf.center.x, -this._vf.center.y, 1);
                var posCenter = new x3dom.fields.SFVec3f(this._vf.center.x, this._vf.center.y, 0);
                var trans3 = new x3dom.fields.SFVec3f(this._vf.translation.x, this._vf.translation.y, 0);
                var scale3 = new x3dom.fields.SFVec3f(this._vf.scale.x, this._vf.scale.y, 0);
                
                this._trafo = x3dom.fields.SFMatrix4f.translation(negCenter).
                         mult(x3dom.fields.SFMatrix4f.scale(scale3)).
                         mult(x3dom.fields.SFMatrix4f.rotationZ(this._vf.rotation)).
                         mult(x3dom.fields.SFMatrix4f.translation(posCenter.add(trans3)));
            },
            
            texTransformMatrix: function() {
                return this._trafo;
            }
        }
    )
);

/* ### TextureProperties ### */
x3dom.registerNodeType(
    "TextureProperties", 
    "Texturing", 
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.TextureProperties.superClass.call(this, ctx);
            
            this.addField_SFFloat(ctx, 'anisotropicDegree', 1.0);
            this.addField_SFColorRGBA(ctx, 'borderColor', 0, 0, 0, 0);
            this.addField_SFInt32(ctx, 'borderWidth', 0);
            this.addField_SFString(ctx, 'boundaryModeS', "REPEAT");
            this.addField_SFString(ctx, 'boundaryModeT', "REPEAT");
            this.addField_SFString(ctx, 'boundaryModeR', "REPEAT");
            this.addField_SFString(ctx, 'magnificationFilter', "FASTEST");
            this.addField_SFString(ctx, 'minificationFilter', "FASTEST");
            this.addField_SFString(ctx, 'textureCompression', "FASTEST");
            this.addField_SFFloat(ctx, 'texturePriority', 0);
            this.addField_SFBool(ctx, 'generateMipMaps', false);
            
            x3dom.debug.logInfo("TextureProperties NYI");   // TODO; impl. in gfx
        }
    )
);

/* ### X3DTextureNode ### */
x3dom.registerNodeType(
    "X3DTextureNode",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DTextureNode.superClass.call(this, ctx);
            
			this.addField_SFInt32(ctx, 'origChannelCount', '0'); // 0 means the system should figure out the count
            this.addField_MFString(ctx, 'url', []);
            this.addField_SFBool(ctx, 'repeatS', true);
            this.addField_SFBool(ctx, 'repeatT', true);
            this.addField_SFNode('textureProperties', x3dom.nodeTypes.TextureProperties);
            
            this._needPerFrameUpdate = false;
            this._isCanvas = false;
        },
        {
			invalidateGLObject: function ()
			{
				  Array.forEach(this._parentNodes, function (app) {
                        Array.forEach(app._parentNodes, function (shape) {
                            shape._dirty.texture = true;
                        });
                    });

				this._nameSpace.doc.needRender = true;
			},
			
            parentAdded: function(parent)
            {
                Array.forEach(parent._parentNodes, function (shape) {
                    shape._dirty.texture = true;
                });
            },
            
            parentRemoved: function(parent)
            {
                parent._cf.texture.node = null;
                Array.forEach(parent._parentNodes, function (shape) {
                    shape._dirty.texture = true;
                });
            },
            
            nodeChanged: function()
            {
            },
            
            fieldChanged: function(fieldName)
            {
                if (fieldName == "url")
                {
                    Array.forEach(this._parentNodes, function (app) {
                        Array.forEach(app._parentNodes, function (shape) {
                            shape._dirty.texture = true;
                        });
                    });
                }
            },
            
            getTexture: function(pos) {
                if (pos === 0) {
                    return this;
                }
                return null;
        	},
            
            size: function() {
                return 1;
            }
        }
    )
);

/* ### MultiTexture ### */
x3dom.registerNodeType(
    "MultiTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
        function (ctx) {
            x3dom.nodeTypes.MultiTexture.superClass.call(this, ctx);
            
            this.addField_MFNode('texture', x3dom.nodeTypes.X3DTextureNode);
        },
        {
            getTexture: function(pos) {
                if (pos >= 0 && pos < this._cf.texture.nodes.length) {
                    return this._cf.texture.nodes[pos];
                }
                return null;
        	},
            
            size: function() {
                return this._cf.texture.nodes.length;
            }
        }
    )
);

/* ### Texture ### */
// intermediate layer to avoid instantiating X3DTextureNode in web profile
x3dom.registerNodeType(
    "Texture",      // X3DTexture2DNode
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
        function (ctx) {
            x3dom.nodeTypes.Texture.superClass.call(this, ctx);
            
            this.addField_SFBool(ctx, 'hideChildren', true);
            
            this._video = null;
            this._intervalID = 0;
            this._canvas = null;
        },
        {
            nodeChanged: function()
            {
                if (this._vf.url.length || !this._xmlNode) {
                    return;
                }
                x3dom.debug.logInfo("No Texture URL given, searching for &lt;img&gt; elements...");
                var that = this;
                try {
                    Array.forEach( this._xmlNode.childNodes, function (childDomNode) {
                        if (childDomNode.nodeType === 1) {
                            var url = childDomNode.getAttribute("src");
                            // For testing: look for <img> element if url empty
                            if (url) {
                                that._vf.url.push(url);
                                x3dom.debug.logInfo(that._vf.url[that._vf.url.length-1]);
                                
                                if (childDomNode.localName === "video") {
                                    that._needPerFrameUpdate = true;
                                    //that._video = childDomNode;
                                    
                                    that._video = document.createElement('video');
                                    that._video.setAttribute('autobuffer', 'true');
                                    var p = document.getElementsByTagName('body')[0];
                                    p.appendChild(that._video);
                                    that._video.style.display = "none";
                                }
                            }
                            else if (childDomNode.localName.toLowerCase() === "canvas") {
                                that._needPerFrameUpdate = true;
                                that._isCanvas = true;
                                that._canvas = childDomNode;
                            }
                            
                            if (that._vf.hideChildren) {
                                childDomNode.style.display = "none";
                                childDomNode.style.visibility = "hidden";
                            }
                            x3dom.debug.logInfo("### Found &lt;"+childDomNode.nodeName+"&gt; tag.");
                        }
                    } );
                }
                catch(e) {}
            }
        }
    )
);

/* ### SurfaceShaderTexture ### */
x3dom.registerNodeType(
    "SurfaceShaderTexture",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
        function (ctx) {
            x3dom.nodeTypes.SurfaceShaderTexture.superClass.call(this, ctx);
            
            this.addField_SFInt32(ctx, 'textureCoordinatesId', 0);
            this.addField_SFString(ctx, 'channelMask', "DEFAULT");
            this.addField_SFBool(ctx, 'isSRGB', false);
            this.addField_SFNode('texture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('textureTransform', x3dom.nodeTypes.X3DTextureTransformNode);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### RenderedTexture ### */
x3dom.registerNodeType(
    "RenderedTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
        function (ctx) {
            x3dom.nodeTypes.RenderedTexture.superClass.call(this, ctx);
            
            ctx.doc._nodeBag.renderTextures.push(this);
            
            this.addField_SFNode('viewpoint', x3dom.nodeTypes.X3DViewpointNode);
            this.addField_SFNode('background', x3dom.nodeTypes.X3DBackgroundNode);
            this.addField_SFNode('fog', x3dom.nodeTypes.X3DFogNode);    //TODO
            this.addField_SFNode('scene', x3dom.nodeTypes.X3DNode);     //TODO
            this.addField_MFNode('excludeNodes', x3dom.nodeTypes.X3DNode);
            this.addField_MFInt32(ctx, 'dimensions', [128, 128, 4]);
            this.addField_SFString(ctx, 'update', 'NONE');         // ("NONE"|"NEXT_FRAME_ONLY"|"ALWAYS")
            
            x3dom.debug.assert(this._vf.dimensions.length >= 3);
            this._clearParents = true;
        },
        {
            nodeChanged: function()
            {
                this._clearParents = true;
            },
            
            fieldChanged: function(fieldName)
            {
                if (fieldName == "excludeNodes") {
                    this._clearParents = true;
                }
            },
            
            getViewMatrix: function () 
            {
                if (this._clearParents && this._cf.excludeNodes.nodes.length) {
                    // FIXME; avoid recursions cleverer and more generic than this
                    //        (Problem: nodes in excludeNodes field have this node
                    //         as first parent, which leads to a recursion loop in 
                    //         getCurrentTransform()
                    var that = this;
                    
                    Array.forEach(this._cf.excludeNodes.nodes, function(node) {
                        for (var i=0, n=node._parentNodes.length; i < n; i++) {
                            if (node._parentNodes[i] === that) {
                                node._parentNodes.splice(i, 1);
                                node.parentRemoved(that);
                            }
                        }
                    });
                    
                    this._clearParents = false;
                }
                
                var vbP = this._nameSpace.doc._scene.getViewpoint();
                var view = this._cf.viewpoint.node;
                
                if (view === null || view === vbP) {
                    return this._nameSpace.doc._viewarea.getViewMatrix();
                }
                else {
                    var mat_viewpoint = view.getCurrentTransform();
                    return mat_viewpoint.mult(view.getViewMatrix());
                }
            },
            
            getProjectionMatrix: function() 
            {
                var vbP = this._nameSpace.doc._scene.getViewpoint();
                var view = this._cf.viewpoint.node;
                
                if (view === null || view === vbP) {
                    return this._nameSpace.doc._viewarea.getProjectionMatrix();
                }
                else {
                    var w = this._vf.dimensions[0], h = this._vf.dimensions[1];
                    return view.getProjectionMatrix(w / h);
                }
            },
            
            getWCtoCCMatrix: function()
            {
                var view = this.getViewMatrix();
                var proj = this.getProjectionMatrix();
                
                return proj.mult(view);
            }
        }
    )
);

/* ### PixelTexture ### */
x3dom.registerNodeType(
    "PixelTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
        function (ctx) {
            x3dom.nodeTypes.PixelTexture.superClass.call(this, ctx);
            
            this.addField_SFImage(ctx, 'image', 0, 0, 0);
        },
        {
            fieldChanged: function(fieldName)
            {
                if (fieldName == "image") {
                    this.invalidateGLObject();
                }
            }
        }
    )
);

/* ### ImageTexture ### */
x3dom.registerNodeType(
    "ImageTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.Texture,
        function (ctx) {
            x3dom.nodeTypes.ImageTexture.superClass.call(this, ctx);
        },
        {
        }
    )
);

/* ### MovieTexture ### */
x3dom.registerNodeType(
    "MovieTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.Texture,
        function (ctx) {
            x3dom.nodeTypes.MovieTexture.superClass.call(this, ctx);
			
            this.addField_SFBool(ctx, 'loop', false);
            this.addField_SFFloat(ctx, 'speed', 1.0);
            // TODO; implement startTime, stopTime,...
        },
        {
        }
    )
);

/* ### X3DEnvironmentTextureNode ### */
x3dom.registerNodeType(
    "X3DEnvironmentTextureNode",
    "CubeMapTexturing",
    defineClass(x3dom.nodeTypes.X3DTextureNode,
        function (ctx) {
            x3dom.nodeTypes.X3DEnvironmentTextureNode.superClass.call(this, ctx);
        },
        {
            getTexUrl: function() {
                return [];  //abstract accessor for gfx
            },
            
            getTexSize: function() {
                return -1;  //abstract accessor for gfx
            }
        }
    )
);

/* ### ComposedCubeMapTexture ### */
x3dom.registerNodeType(
    "ComposedCubeMapTexture",
    "CubeMapTexturing",
    defineClass(x3dom.nodeTypes.X3DEnvironmentTextureNode,
        function (ctx) {
            x3dom.nodeTypes.ComposedCubeMapTexture.superClass.call(this, ctx);
            
            this.addField_SFNode('back',   x3dom.nodeTypes.Texture);
            this.addField_SFNode('front',  x3dom.nodeTypes.Texture);
            this.addField_SFNode('bottom', x3dom.nodeTypes.Texture);
            this.addField_SFNode('top',    x3dom.nodeTypes.Texture);
            this.addField_SFNode('left',   x3dom.nodeTypes.Texture);
            this.addField_SFNode('right',  x3dom.nodeTypes.Texture);
        },
        {
            getTexUrl: function() {
                return [
                    this._nameSpace.getURL(this._cf.right.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.left.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.top.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.bottom.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.front.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.back.node._vf.url[0])
                ];
            }
        }
    )
);

/* ### GeneratedCubeMapTexture ### */
x3dom.registerNodeType(
    "GeneratedCubeMapTexture",
    "CubeMapTexturing",
    defineClass(x3dom.nodeTypes.X3DEnvironmentTextureNode,
        function (ctx) {
            x3dom.nodeTypes.GeneratedCubeMapTexture.superClass.call(this, ctx);
            
            this.addField_SFInt32(ctx, 'size', 128);
            this.addField_SFString(ctx, 'update', 'NONE');  // ("NONE"|"NEXT_FRAME_ONLY"|"ALWAYS")
            
            x3dom.debug.logInfo("GeneratedCubeMapTexture NYI");   // TODO; impl. in gfx
        },
        {
            getTexSize: function() {
                return this._vf.size;
            }
        }
    )
);

/* ### X3DShaderNode ### */
x3dom.registerNodeType(
    "X3DShaderNode",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DShaderNode.superClass.call(this, ctx);
            
            this.addField_SFString(ctx, 'language', "");
        }
    )
);

/* ### CommonSurfaceShader ### */
x3dom.registerNodeType(
    "CommonSurfaceShader",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DShaderNode,
        function (ctx) {
            x3dom.nodeTypes.CommonSurfaceShader.superClass.call(this, ctx);
            
            this.addField_SFInt32(ctx, 'tangentTextureCoordinatesId', -1);
            this.addField_SFInt32(ctx, 'binormalTextureCoordinatesId', -1);
            this.addField_SFVec3f(ctx, 'emissiveFactor', 0, 0, 0);
            this.addField_SFInt32(ctx, 'emissiveTextureId', -1);
            this.addField_SFInt32(ctx, 'emissiveTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'emissiveTextureChannelMask', 'rgb');
            this.addField_SFVec3f(ctx, 'ambientFactor', 0.2, 0.2, 0.2);
            this.addField_SFInt32(ctx, 'ambientTextureId', -1);
            this.addField_SFInt32(ctx, 'ambientTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'ambientTextureChannelMask', 'rgb');
            this.addField_SFVec3f(ctx, 'diffuseFactor', 0.8, 0.8, 0.8);
            this.addField_SFInt32(ctx, 'diffuseTextureId', -1);
            this.addField_SFInt32(ctx, 'diffuseTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'diffuseTextureChannelMask', 'rgb');
            this.addField_SFVec3f(ctx, 'specularFactor', 0, 0, 0);
            this.addField_SFInt32(ctx, 'specularTextureId', -1);
            this.addField_SFInt32(ctx, 'specularTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'specularTextureChannelMask', 'rgb');
            this.addField_SFFloat(ctx, 'shininessFactor', 0.2);
            this.addField_SFInt32(ctx, 'shininessTextureId', -1);
            this.addField_SFInt32(ctx, 'shininessTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'shininessTextureChannelMask', 'a');
            this.addField_SFString(ctx, 'normalFormat', 'UNORM');
            this.addField_SFString(ctx, 'normalSpace', 'TANGENT');
            this.addField_SFInt32(ctx, 'normalTextureId', -1);
            this.addField_SFInt32(ctx, 'normalTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'normalTextureChannelMask', 'rgb');
            this.addField_SFVec3f(ctx, 'reflectionFactor', 0, 0, 0);
            this.addField_SFInt32(ctx, 'reflectionTextureId', -1);
            this.addField_SFInt32(ctx, 'reflectionTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'reflectionTextureChannelMask', 'rgb');
            this.addField_SFVec3f(ctx, 'transmissionFactor', 0, 0, 0);
            this.addField_SFInt32(ctx, 'transmissionTextureId', -1);
            this.addField_SFInt32(ctx, 'transmissionTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'transmissionTextureChannelMask', 'rgb');
            this.addField_SFVec3f(ctx, 'environmentFactor', 1, 1, 1);
            this.addField_SFInt32(ctx, 'environmentTextureId', -1);
            this.addField_SFInt32(ctx, 'environmentTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'environmentTextureChannelMask', 'rgb');
            this.addField_SFFloat(ctx, 'relativeIndexOfRefraction', 1);
            this.addField_SFFloat(ctx, 'fresnelBlend', 0);
            this.addField_SFNode('emissiveTexture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('ambientTexture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('diffuseTexture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('specularTexture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('shininessTexture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('normalTexture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('reflectionTexture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('transmissionTexture', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('environmentTexture', x3dom.nodeTypes.X3DTextureNode);
            //this.addField_MFBool(ctx, 'textureTransformEnabled', []);     // MFBool NYI
            this.addField_SFVec3f(ctx, 'normalScale', 2, 2, 2);
            this.addField_SFVec3f(ctx, 'normalBias', -1, -1, -1);
            this.addField_SFFloat(ctx, 'alphaFactor', 1);
            this.addField_SFBool(ctx, 'invertAlphaTexture', false);
            this.addField_SFInt32(ctx, 'alphaTextureId', -1);
            this.addField_SFInt32(ctx, 'alphaTextureCoordinatesId', 0);
            this.addField_SFString(ctx, 'alphaTextureChannelMask', 'a');
            this.addField_SFNode('alphaTexture', x3dom.nodeTypes.X3DTextureNode);
            
            this._dirty = {
                // TODO; cp. Shape, allow for dynamic texture updates in gfx
            };
        },
        {
            nodeChanged: function()
            {
            },
            
            fieldChanged: function(fieldName)
            {
            }
        }
    )
);

/* ### ComposedShader ### */
x3dom.registerNodeType(
    "ComposedShader",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DShaderNode,
        function (ctx) {
            x3dom.nodeTypes.ComposedShader.superClass.call(this, ctx);
            
            this.addField_MFNode('fields', x3dom.nodeTypes.Field);
            this.addField_MFNode('parts', x3dom.nodeTypes.ShaderPart);
            
            // shortcut to shader parts
            this._vertex = null;
            this._fragment = null;
            
            x3dom.debug.logInfo("Current ComposedShader node implementation limitations:\n" +
                    "Vertex attributes (if given in the standard X3D fields 'coord', 'color', " +
                    "'normal', 'texCoord'), matrices and texture are provided as follows...\n" +
                    "    attribute vec3 position;\n" +
                    "    attribute vec3 normal;\n" +
                    "    attribute vec2 texcoord;\n" +
                    "    attribute vec3 color;\n" +
                    "    uniform mat4 modelViewProjectionMatrix;\n" +
                    "    uniform mat4 modelViewMatrix;\n" +
                    "    uniform sampler2D tex;\n");
        },
        {
            nodeChanged: function()
            {
                var i, n = this._cf.parts.nodes.length;
                
                for (i=0; i<n; i++)
                {
                    if (this._cf.parts.nodes[i]._vf.type.toLowerCase() == 'vertex') {
                        this._vertex = this._cf.parts.nodes[i];
                    }
                    else if (this._cf.parts.nodes[i]._vf.type.toLowerCase() == 'fragment') {
                        this._fragment = this._cf.parts.nodes[i];
                    }
                }
                
                var ctx = {};
                n = this._cf.fields.nodes.length;
                
                for (i=0; i<n; i++)
                {
                    var fieldName = this._cf.fields.nodes[i]._vf.name;
                    ctx.xmlNode = this._cf.fields.nodes[i]._xmlNode;
                    ctx.xmlNode.setAttribute(fieldName, this._cf.fields.nodes[i]._vf.value);
                    
                    var funcName = "this.addField_" + this._cf.fields.nodes[i]._vf.type + "(ctx, name);";
                    var func = new Function('ctx', 'name', funcName);
                    
                    func.call(this, ctx, fieldName);
                }
            },
            
			fieldChanged: function(fieldName)
            {
                var i, n = this._cf.fields.nodes.length;
                
                for (i=0; i<n; i++)
                {
                    var name = this._cf.fields.nodes[i]._vf.name;
                    
                    if (name === fieldName)
                    {
                        this._vf[name].setValueByStr(this._cf.fields.nodes[i]._vf.value);
                        break;
                    }
                }
            }
        }
    )
);

/* ### ShaderPart ### */
x3dom.registerNodeType(
    "ShaderPart",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.ShaderPart.superClass.call(this, ctx);
            
            this.addField_MFString(ctx, 'url', []);
            this.addField_SFString(ctx, 'type', "VERTEX");
            
            x3dom.debug.assert(this._vf.type.toLowerCase() == 'vertex' ||
                               this._vf.type.toLowerCase() == 'fragment');
            
            if (!this._vf.url.length && ctx.xmlNode) {
                var that = this;
                try {
                    that._vf.url.push(ctx.xmlNode.childNodes[1].nodeValue);
                    //x3dom.debug.logInfo(that._vf.url[that._vf.url.length-1]);
                    ctx.xmlNode.removeChild(ctx.xmlNode.childNodes[1]);
                }
                catch(e) {
                    Array.forEach( ctx.xmlNode.childNodes, function (childDomNode) {
                        if (childDomNode.nodeType === 3) {
                            that._vf.url.push(childDomNode.data);
                            //x3dom.debug.logInfo(that._vf.url[that._vf.url.length-1]);
                        }
                        childDomNode.parentNode.removeChild(childDomNode);
                    } );
                }
            }
        },
        {
        }
    )
);


// MESH in extern js

/** @class x3dom.Mesh
*/
x3dom.Mesh = function(parent) 
{
    this._parent = parent;
    
	this._min = new x3dom.fields.SFVec3f(0,0,0);
	this._max = new x3dom.fields.SFVec3f(0,0,0);
	this._invalidate = true;
    this._numFaces = 0;
    this._numCoords = 0;
    
    this._positions = [];
    this._normals   = [];
    this._texCoords = [];
    this._colors    = [];
    this._indices   = [];
    
    this._positions[0] = [];
    this._normals[0]   = [];
    this._texCoords[0] = [];
    this._colors[0]    = [];
    this._indices[0]   = [];
};

x3dom.Mesh.prototype._dynamicFields = {};   // can hold X3DVertexAttributeNodes
/*x3dom.Mesh.prototype._positions = [];
x3dom.Mesh.prototype._normals   = [];
x3dom.Mesh.prototype._texCoords = [];
x3dom.Mesh.prototype._colors    = [];
x3dom.Mesh.prototype._indices   = [];*/

x3dom.Mesh.prototype._numTexComponents = 2;
x3dom.Mesh.prototype._numColComponents = 3;
x3dom.Mesh.prototype._lit = true;
x3dom.Mesh.prototype._min = {};
x3dom.Mesh.prototype._max = {};
x3dom.Mesh.prototype._invalidate = true;
x3dom.Mesh.prototype._numFaces = 0;
x3dom.Mesh.prototype._numCoords = 0;

x3dom.Mesh.prototype.setMeshData = function(positions, normals, texCoords, colors, indices)
{
    this._positions[0] = positions;
    this._normals[0]   = normals;
    this._texCoords[0] = texCoords;
    this._colors[0]    = colors;
    this._indices[0]   = indices;
    
    this._invalidate = true;
    this._numFaces = this._indices[0].length / 3;
    this._numCoords = this._positions[0].length / 3;
};

x3dom.Mesh.prototype.getBBox = function(min, max, invalidate)
{
	if (this._invalidate === true && invalidate === true)	//need both?
	{
		var coords = this._positions[0];
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
	
    min.setValues(this._min);
    max.setValues(this._max);
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
    
    //TODO: iterate over all faces!
    if (isect && line.enter < line.dist)
    {
        //x3dom.debug.logInfo("Hit \"" + this._parent._xmlNode.localName + "/ " + 
        //                    this._parent._DEF + "\" at dist=" + line.enter.toFixed(4));
        
        line.dist = line.enter;
        line.hitObject = this._parent;
        line.hitPoint = line.pos.add(line.dir.multiply(line.enter));
    }
    
    return isect;
};

x3dom.Mesh.prototype.calcNormals = function(creaseAngle)
{
    var i = 0, j = 0, num = 0;
    var multInd = (this._multiIndIndices !== undefined && this._multiIndIndices.length);
	var coords = this._positions[0];
	var idxs = multInd ? this._multiIndIndices : this._indices[0];
	
	var vertNormals = [];
	var vertFaceNormals = [];

    var a, b, n = null;
    
    //num = coords.length / 3;
    num = (this._posSize !== undefined && this._posSize > coords.length) ? 
           this._posSize / 3 : coords.length / 3;
    num = 3 * ((num - Math.floor(num) > 0) ? Math.floor(num + 1) : num);
	
	for (i = 0; i < num; ++i) {
		vertFaceNormals[i] = [];
    }
    
    num = idxs.length;

	for (i = 0; i < num; i += 3) {
        if (!multInd) {
            a = new x3dom.fields.SFVec3f(
                    coords[idxs[i  ]*3], coords[idxs[i  ]*3+1], coords[idxs[i  ]*3+2]).
                subtract(new x3dom.fields.SFVec3f(
                    coords[idxs[i+1]*3], coords[idxs[i+1]*3+1], coords[idxs[i+1]*3+2]));
            b = new x3dom.fields.SFVec3f(
                    coords[idxs[i+1]*3], coords[idxs[i+1]*3+1], coords[idxs[i+1]*3+2]).
                subtract(new x3dom.fields.SFVec3f(
                    coords[idxs[i+2]*3], coords[idxs[i+2]*3+1], coords[idxs[i+2]*3+2]));
        }
        else {
            a = new x3dom.fields.SFVec3f(
                        coords[i*3], coords[i*3+1], coords[i*3+2]).
                    subtract(new x3dom.fields.SFVec3f(
                        coords[(i+1)*3], coords[(i+1)*3+1], coords[(i+1)*3+2]));
            b = new x3dom.fields.SFVec3f(
                        coords[(i+1)*3], coords[(i+1)*3+1], coords[(i+1)*3+2]).
                    subtract(new x3dom.fields.SFVec3f(
                        coords[(i+2)*3], coords[(i+2)*3+1], coords[(i+2)*3+2]));
        }
        
		n = a.cross(b).normalize();
        
        if (creaseAngle <= x3dom.fields.Eps) {
            vertNormals[i*3  ] = vertNormals[(i+1)*3  ] = vertNormals[(i+2)*3  ] = n.x;
            vertNormals[i*3+1] = vertNormals[(i+1)*3+1] = vertNormals[(i+2)*3+1] = n.y;
            vertNormals[i*3+2] = vertNormals[(i+1)*3+2] = vertNormals[(i+2)*3+2] = n.z;
		}
		else {
            vertFaceNormals[idxs[i  ]].push(n);
            vertFaceNormals[idxs[i+1]].push(n);
            vertFaceNormals[idxs[i+2]].push(n);
        }
	}
    
    if (creaseAngle > x3dom.fields.Eps) 
    {
        for (i = 0; i < coords.length; i += 3) {
            //TODO: generic creaseAngle
            n = new x3dom.fields.SFVec3f(0, 0, 0);
            
            if (!multInd) {
                num = vertFaceNormals[i/3].length;
                for (j = 0; j < num; ++j) {
                    n = n.add(vertFaceNormals[i/3][j]);
                }
            }
            else {
                num = vertFaceNormals[idxs[i/3]].length;
                for (j = 0; j < num; ++j) {
                    n = n.add(vertFaceNormals[idxs[i/3]][j]);
                }
            }

            n = n.normalize();
            vertNormals[i  ] = n.x;
            vertNormals[i+1] = n.y;
            vertNormals[i+2] = n.z;
        }
    }
    
    if (multInd) {
        this._multiIndIndices = [];
    }
	
	this._normals[0] = vertNormals;
};

x3dom.Mesh.prototype.splitMesh = function()
{
    var MAX = 65535;
    if (this._positions[0].length / 3 <= MAX)
        return;
    
    var positions = this._positions[0];
    var normals = this._normals[0];
    var texCoords = this._texCoords[0];
    var colors = this._colors[0];
    var indices = this._indices[0];
    var i = 0;
    
    do
    {
        this._positions[i] = [];
        this._normals[i]   = [];
        this._texCoords[i] = [];
        this._colors[i]    = [];
        this._indices[i]   = [];
        
        var k = ((indices.length - ((i + 1) * MAX) < 0) ? false : true);
        
        if (k) this._indices[i] = indices.slice(i * MAX, (i + 1) * MAX);
        else   this._indices[i] = indices.slice(i * MAX);
        
        if (i) {
            var m = i * MAX;
            for (var j=0, l=this._indices[i].length; j<l; j++) {
                this._indices[i][j] -= m;
            }
        }
        
        if (k) this._positions[i] = positions.slice(i * MAX * 3, 3 * (i + 1) * MAX);
        else   this._positions[i] = positions.slice(i * MAX * 3);
        
        if (normals.length) {
            if (k) this._normals[i] = normals.slice(i * MAX * 3, 3 * (i + 1) * MAX);
            else   this._normals[i] = normals.slice(i * MAX * 3);
        }
        if (texCoords.length) {
            if (k) this._texCoords[i] = texCoords.slice(i * MAX * this._numTexComponents, 
                                                        this._numTexComponents * (i + 1) * MAX);
            else   this._texCoords[i] = texCoords.slice(i * MAX * this._numTexComponents);
        }
        if (colors.length) {
            if (k) this._colors[i] = colors.slice(i * MAX * this._numColComponents, 
                                                  this._numColComponents * (i + 1) * MAX);
            else   this._colors[i] = colors.slice(i * MAX * this._numColComponents);
        }
    }
    while (positions.length > ++i * MAX * 3);
};

x3dom.Mesh.prototype.calcTexCoords = function(mode)
{
    this._texCoords[0] = [];
    
    // TODO; impl. all modes that aren't handled in shader!
    // FIXME; WebKit requires valid texCoords for texturing
	if (mode.toLowerCase() === "sphere-local")
    {
        for (var i=0, j=0, n=this._normals[0].length; i<n; i+=3)
        {
            this._texCoords[0][j++] = 0.5 + this._normals[0][i  ] / 2.0;
            this._texCoords[0][j++] = 0.5 + this._normals[0][i+1] / 2.0;
        }
    }
    else    // "plane" is x3d default mapping
    {
        var min = new x3dom.fields.SFVec3f(0, 0, 0), 
            max = new x3dom.fields.SFVec3f(0, 0, 0);
        
        this.getBBox(min, max, true);
        var dia = max.subtract(min);
        
        var S = 0, T = 1;
        
        if (dia.x >= dia.y)
        {
            if (dia.x >= dia.z)
            {
                S = 0;
                T = dia.y >= dia.z ? 1 : 2;
            }
            else // dia.x < dia.z
            {
                S = 2;
                T = 0;
            }
        }
        else // dia.x < dia.y
        {
            if (dia.y >= dia.z)
            {
                S = 1;
                T = dia.x >= dia.z ? 0 : 2;
            }
            else // dia.y < dia.z
            {
                S = 2;
                T = 1;
            }
        }
        
        var sDenom = 1, tDenom = 1;
        var sMin = 0, tMin = 0;
        
        switch(S) {
            case 0: sDenom = dia.x; sMin = min.x; break;
            case 1: sDenom = dia.y; sMin = min.y; break;
            case 2: sDenom = dia.z; sMin = min.z; break;
        }
        
        switch(T) {
            case 0: tDenom = dia.x; tMin = min.x; break;
            case 1: tDenom = dia.y; tMin = min.y; break;
            case 2: tDenom = dia.z; tMin = min.z; break;
        }
        
        for (var k=0, l=0, m=this._positions[0].length; k<m; k+=3)
        {
            this._texCoords[0][l++] = (this._positions[0][k+S] - sMin) / sDenom;
            this._texCoords[0][l++] = (this._positions[0][k+T] - tMin) / tDenom;
        }
    }
};


/* ### X3DGeometryNode ### */
x3dom.registerNodeType(
    "X3DGeometryNode",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DGeometryNode.superClass.call(this, ctx);
			
			this.addField_SFBool(ctx, 'solid', true);
            this.addField_SFBool(ctx, 'ccw', true);
			
			this._mesh = new x3dom.Mesh(this);
            this._pickable = true;
        },
		{
			getVolume: function(min, max, invalidate) {
				this._mesh.getBBox(min, max, invalidate);
                return true;
			},
			
			getCenter: function() {
				return this._mesh.getCenter();
			},
            
            doIntersect: function(line) {
                if (this._pickable) {
                    return this._mesh.doIntersect(line);
                }
                else {
                    return false;
                }
            }
		}
    )
);

/* ### Mesh ### */
x3dom.registerNodeType(
    "Mesh",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Mesh.superClass.call(this, ctx);
			
			this.addField_SFString(ctx, 'primType', "triangle");
            this.addField_MFInt32(ctx, 'index', []);
            
            this.addField_MFNode('vertexAttributes', x3dom.nodeTypes.X3DVertexAttributeNode);
			
			this._mesh = new x3dom.Mesh(this);
        },
        {
            nodeChanged: function()
            {
                //var time0 = new Date().getTime();
                
                var i, n = this._cf.vertexAttributes.nodes.length;
                
                for (i=0; i<n; i++)
                {
                    var name = this._cf.vertexAttributes.nodes[i]._vf.name;
                    
                    switch (name.toLowerCase())
                    {
                        case "position": 
                            this._mesh._positions[0] = this._cf.vertexAttributes.nodes[i]._vf.value.toGL();
                            break;
                        case "normal":
                            this._mesh._normals[0] = this._cf.vertexAttributes.nodes[i]._vf.value.toGL();
                            break;
                        case "texcoord":
                            this._mesh._texCoords[0] = this._cf.vertexAttributes.nodes[i]._vf.value.toGL();
                            break;
                        case "color":
                            this._mesh._colors[0] = this._cf.vertexAttributes.nodes[i]._vf.value.toGL();
                            break;
                        default:
                        {
                            this._mesh._dynamicFields[name] = {};
                            this._mesh._dynamicFields[name].numComponents =
                                       this._cf.vertexAttributes.nodes[i]._vf.numComponents;
                            this._mesh._dynamicFields[name].value =
                                       this._cf.vertexAttributes.nodes[i]._vf.value.toGL();
                        }
                        break;
                    }
                }
                
                this._mesh._indices[0] = this._vf.index.toGL();
                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
                
                //var time1 = new Date().getTime() - time0;
                //x3dom.debug.logInfo("Mesh load time: " + time1 + " ms");
            }
        }
    )
);

/* ### Box ### */
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
			
            this._mesh._positions[0] = [
                -sx,-sy,-sz,  -sx, sy,-sz,   sx, sy,-sz,   sx,-sy,-sz, //hinten 0,0,-1
                -sx,-sy, sz,  -sx, sy, sz,   sx, sy, sz,   sx,-sy, sz, //vorne 0,0,1
                -sx,-sy,-sz,  -sx,-sy, sz,  -sx, sy, sz,  -sx, sy,-sz, //links -1,0,0
                 sx,-sy,-sz,   sx,-sy, sz,   sx, sy, sz,   sx, sy,-sz, //rechts 1,0,0
                -sx, sy,-sz,  -sx, sy, sz,   sx, sy, sz,   sx, sy,-sz, //oben 0,1,0
                -sx,-sy,-sz,  -sx,-sy, sz,   sx,-sy, sz,   sx,-sy,-sz  //unten 0,-1,0
            ];
			this._mesh._normals[0] = [
                0,0,-1,  0,0,-1,   0,0,-1,   0,0,-1,
                0,0,1,  0,0,1,   0,0,1,   0,0,1,
                -1,0,0,  -1,0,0,  -1,0,0,  -1,0,0,
                1,0,0,   1,0,0,   1,0,0,   1,0,0,
                0,1,0,  0,1,0,   0,1,0,   0,1,0,
                0,-1,0,  0,-1,0,   0,-1,0,   0,-1,0
            ];
			this._mesh._texCoords[0] = [
				1,0, 1,1, 0,1, 0,0, 
				0,0, 0,1, 1,1, 1,0, 
				0,0, 1,0, 1,1, 0,1, 
				1,0, 0,0, 0,1, 1,1, 
				0,1, 0,0, 1,0, 1,1, 
				0,0, 0,1, 1,1, 1,0
			];
            this._mesh._indices[0] = [
                0,1,2, 2,3,0,
                4,7,5, 5,7,6,
                8,9,10, 10,11,8,
                12,14,13, 14,12,15,
                16,17,18, 18,19,16,
                20,22,21, 22,20,23
            ];
			this._mesh._invalidate = true;
            this._mesh._numFaces = 12;
            this._mesh._numCoords = 24;
        }
    )
);

/* ### Sphere ### */
x3dom.registerNodeType(
    "Sphere",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Sphere.superClass.call(this, ctx);
    
            var r = ctx ? 1 : 10000;
            if (ctx && ctx.xmlNode.hasAttribute('radius')) {
                r = +ctx.xmlNode.getAttribute('radius');
            }
            
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
                    
                    this._mesh._positions[0].push(r * x);
                    this._mesh._positions[0].push(r * y);
                    this._mesh._positions[0].push(r * z);
                    this._mesh._normals[0].push(x);
                    this._mesh._normals[0].push(y);
                    this._mesh._normals[0].push(z);
                    this._mesh._texCoords[0].push(u);
                    this._mesh._texCoords[0].push(v);
                }
            }
            
            var first, second;
            
            for (latNumber = 0; latNumber < latitudeBands; latNumber++)
            {
                for (longNumber = 0; longNumber < longitudeBands; longNumber++)
                {
                    first = (latNumber * (longitudeBands + 1)) + longNumber;
                    second = first + longitudeBands + 1;
                    
                    this._mesh._indices[0].push(first);
                    this._mesh._indices[0].push(second);
                    this._mesh._indices[0].push(first + 1);

                    this._mesh._indices[0].push(second);
                    this._mesh._indices[0].push(second + 1);
                    this._mesh._indices[0].push(first + 1);
                }
            }
            
            this._mesh._invalidate = true;
            this._mesh._numFaces = this._mesh._indices[0].length / 3;
            this._mesh._numCoords = this._mesh._positions[0].length / 3;
        }
    )
);

/* ### Torus ### */
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
			
            this._mesh._positions[0] = p;
			this._mesh._normals[0] = n;
			this._mesh._texCoords[0] = t;
            this._mesh._indices[0] = i;
			this._mesh._invalidate = true;
            this._mesh._numFaces = this._mesh._indices[0].length / 3;
            this._mesh._numCoords = this._mesh._positions[0].length / 3;
        }
    )
);

/* ### Cone ### */
x3dom.registerNodeType(
    "Cone",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Cone.superClass.call(this, ctx);
            
            this.addField_SFFloat(ctx, 'bottomRadius', 1.0);
            this.addField_SFFloat(ctx, 'height', 2.0);
			this.addField_SFBool(ctx, 'bottom', true);
			this.addField_SFBool(ctx, 'side', true);
            
            var bottomRadius = this._vf.bottomRadius, height = this._vf.height;
            
            var beta, x, z;
			var sides = 32;
			var delta = 2.0 * Math.PI / sides;
			var incl = bottomRadius / height;
			var nlen = 1.0 / Math.sqrt(1.0 + incl * incl);
			var p = [], n = [], t = [], i = [];
			
            if (this._vf.side)
            {
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
			}
            
			if (this._vf.bottom && bottomRadius > 0)
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
			
			this._mesh._positions[0] = p;
			this._mesh._normals[0] = n;
			this._mesh._texCoords[0] = t;
            this._mesh._indices[0] = i;
			this._mesh._invalidate = true;
            this._mesh._numFaces = this._mesh._indices[0].length / 3;
            this._mesh._numCoords = this._mesh._positions[0].length / 3;
        }
    )
);

/* ### Cylinder ### */
x3dom.registerNodeType(
    "Cylinder",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Cylinder.superClass.call(this, ctx);
            
            var radius = 1.0, height = 2.0;
            
            this.addField_SFFloat(ctx, 'radius', 1.0);
            this.addField_SFFloat(ctx, 'height', 2.0);
			this.addField_SFBool(ctx, 'bottom', true);
			this.addField_SFBool(ctx, 'top', true);
			this.addField_SFBool(ctx, 'side', true);
            
            var radius = this._vf.radius, height = this._vf.height;
            
            var beta, x, z;
			var sides = 24;
			var delta = 2.0 * Math.PI / sides;
			var p = [], n = [], t = [], i = [];
			
            if (this._vf.side)
            {
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
            }
			
			if (radius > 0)
			{
				var h, base = p.length / 3;
				
                if (this._vf.top)
                {
				  for (j=sides-1; j>=0; j--)
				  {
					beta = j * delta;
					x = radius * Math.sin(beta);
					z = -radius * Math.cos(beta);  

					p.push(x, height/2, z);
					n.push(0, 1, 0);
					t.push(x / radius / 2 + 0.5, -z / radius / 2 + 0.5);
				  }
				
				  h = base + 1;
				
				  for (j=2; j<sides; j++) 
				  {
					i.push(base);
					i.push(h);
					
					h = base + j;
					i.push(h);
				  }
				
				  base = p.length / 3;
                }
				
                if (this._vf.bottom)
                {
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
			}
			
			this._mesh._positions[0] = p;
			this._mesh._normals[0] = n;
			this._mesh._texCoords[0] = t;
            this._mesh._indices[0] = i;
			this._mesh._invalidate = true;
            this._mesh._numFaces = this._mesh._indices[0].length / 3;
            this._mesh._numCoords = this._mesh._positions[0].length / 3;
        }
    )
);

/* ### PointSet ### */
x3dom.registerNodeType(
    "PointSet",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.PointSet.superClass.call(this, ctx);
            
            this.addField_SFNode('coord', x3dom.nodeTypes.Coordinate);
            this.addField_SFNode('color', x3dom.nodeTypes.X3DColorNode);
            
            this._pickable = false;
        },
        {
            nodeChanged: function()
            {
                var time0 = new Date().getTime();
                
                var coordNode = this._cf.coord.node;
                x3dom.debug.assert(coordNode);
                var positions = coordNode._vf.point;
                
                var numColComponents = 3;
                var colorNode = this._cf.color.node;
                var colors = new x3dom.fields.MFColor();
                if (colorNode) {
                    colors = colorNode._vf.color;
                    x3dom.debug.assert(positions.length == colors.length);
                    
                    if (x3dom.isa(colorNode, x3dom.nodeTypes.ColorRGBA)) {
                        numColComponents = 4;
                    }
                }
                else {
                    for (var i=0, n=positions.length; i<n; i++)
                        colors.push(1.0);
                }
                
                this._mesh._numColComponents = numColComponents;
                this._mesh._indices[0] = [];
                this._mesh._positions[0] = positions.toGL();
                this._mesh._colors[0] = colors.toGL();
                this._mesh._normals[0] = [];
                this._mesh._texCoords[0] = [];
                this._mesh._lit = false;
                this._mesh._invalidate = true;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
                
                var time1 = new Date().getTime() - time0;
                //x3dom.debug.logInfo("Mesh load time: " + time1 + " ms");
            },
            
            fieldChanged: function(fieldName)
            {
                var pnts;
                var i, n;
                
                if (fieldName == "coord")   // same as in IFS
                {
                    pnts = this._cf.coord.node._vf.point;
                    n = pnts.length;
                    
                    this._mesh._positions[0] = [];
                    
                    // TODO; optimize (is there a memcopy?)
                    for (i=0; i<n; i++)
                    {
						this._mesh._positions[0].push(pnts[i].x);
						this._mesh._positions[0].push(pnts[i].y);
						this._mesh._positions[0].push(pnts[i].z);
                    }
                    
                    this._mesh._invalidate = true;
                    
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                    });
                }
                else if (fieldName == "color")
                {
                    pnts = this._cf.color.node._vf.color;
                    n = pnts.length;
                    
                    this._mesh._colors[0] = [];
                    
                    for (i=0; i<n; i++)
                    {
						this._mesh._colors[0].push(pnts[i].r);
						this._mesh._colors[0].push(pnts[i].g);
						this._mesh._colors[0].push(pnts[i].b);
                    }
                    
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.colors = true;
                    });
                }
            }
        }
    )
);


/* ### Text ### */
x3dom.registerNodeType(
    "Text",
    "Text",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Text.superClass.call(this, ctx);
    
            this.addField_MFString(ctx, 'string', []);
			this.addField_MFFloat(ctx, 'length', []);
	        this.addField_SFFloat(ctx, 'maxExtent', 0.0);
    		
            this.addField_SFNode ('fontStyle', x3dom.nodeTypes.X3DFontStyleNode);	
        },
		{
			nodeChanged: function() {	
				if (!this._cf.fontStyle.node) {
					this.addChild(x3dom.nodeTypes.FontStyle.defaultNode());
				}
			}			
	    }
    )
);

/* ### X3DComposedGeometryNode ### */
x3dom.registerNodeType(
    "X3DComposedGeometryNode",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.X3DComposedGeometryNode.superClass.call(this, ctx);
            
            this.addField_SFBool(ctx, 'colorPerVertex', true);
            this.addField_SFBool(ctx, 'normalPerVertex', true);
            
            this.addField_MFNode('attrib', x3dom.nodeTypes.X3DVertexAttributeNode);
            
            this.addField_SFNode('coord', x3dom.nodeTypes.Coordinate);
            this.addField_SFNode('normal', x3dom.nodeTypes.Normal);
            this.addField_SFNode('color', x3dom.nodeTypes.X3DColorNode);
            this.addField_SFNode('texCoord', x3dom.nodeTypes.X3DTextureCoordinateNode);
        },
        {
            handleAttribs: function()
            {
                //var time0 = new Date().getTime();
                
                var i, n = this._cf.attrib.nodes.length;
                
                for (i=0; i<n; i++)
                {
                    var name = this._cf.attrib.nodes[i]._vf.name;
                    
                    switch (name.toLowerCase())
                    {
                        case "position": 
                            this._mesh._positions[0] = this._cf.attrib.nodes[i]._vf.value.toGL();
                            break;
                        case "normal":
                            this._mesh._normals[0] = this._cf.attrib.nodes[i]._vf.value.toGL();
                            break;
                        case "texcoord":
                            this._mesh._texCoords[0] = this._cf.attrib.nodes[i]._vf.value.toGL();
                            break;
                        case "color":
                            this._mesh._colors[0] = this._cf.attrib.nodes[i]._vf.value.toGL();
                            break;
                        default:
                        {
                            this._mesh._dynamicFields[name] = {};
                            this._mesh._dynamicFields[name].numComponents =
                                       this._cf.attrib.nodes[i]._vf.numComponents;
                            this._mesh._dynamicFields[name].value =
                                       this._cf.attrib.nodes[i]._vf.value.toGL();
                        }
                        break;
                    }
                }
                
                //var time1 = new Date().getTime() - time0;
                //x3dom.debug.logInfo("Mesh load time: " + time1 + " ms");
            }
        }
    )
);

/* ### IndexedLineSet ### */
x3dom.registerNodeType(
    "IndexedLineSet",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.IndexedLineSet.superClass.call(this, ctx);
            
            this.addField_SFBool(ctx, 'colorPerVertex', true);  // TODO
            
            this.addField_MFNode('attrib', x3dom.nodeTypes.X3DVertexAttributeNode);
            this.addField_SFNode('coord', x3dom.nodeTypes.Coordinate);
            this.addField_SFNode('color', x3dom.nodeTypes.X3DColorNode);
            
            this.addField_MFInt32(ctx, 'coordIndex', []);
            this.addField_MFInt32(ctx, 'colorIndex', []);
            
            this._pickable = false;
        },
        {
            nodeChanged: function()
            {
                var time0 = new Date().getTime();
                
                // this.handleAttribs();
                
                var indexes = this._vf.coordIndex;
                var colorInd = this._vf.colorIndex;
                
                var hasColor = false, hasColorInd = false;
                
                // TODO; implement colorPerVertex also for single index
                var colPerVert = this._vf.colorPerVertex;
                
                if (colorInd.length > 0)
                {
                    hasColorInd = true;
                }
                
                var positions, colors;
                
                var coordNode = this._cf.coord.node;
                x3dom.debug.assert(coordNode);
                positions = coordNode._vf.point;
                
                var numColComponents = 3;
                var colorNode = this._cf.color.node;
                if (colorNode) 
                {
                    hasColor = true;
                    colors = colorNode._vf.color;
                    
                    if (x3dom.isa(colorNode, x3dom.nodeTypes.ColorRGBA)) {
                        numColComponents = 4;
                    }
                }
                else {
                    hasColor = false;
                }

                this._mesh._indices[0] = [];
                this._mesh._positions[0] = [];
                this._mesh._colors[0] = [];
                
                var i, t, cnt, lineCnt;
                var p0, p1, c0, c1;
                
                if ( (hasColor && hasColorInd) )
                {
                    // Found MultiIndex Mesh
                    t = 0;
                    cnt = 0;
                    lineCnt = 0;
                    
                    for (i=0; i < indexes.length; ++i) 
                    {
                        if (indexes[i] === -1) {
                            t = 0;
                            continue;
                        }
                        
                        if (hasColorInd) {
                            x3dom.debug.assert(colorInd[i] != -1);
                        }
                        
                        switch (t) 
                        {
                            case 0: 
                                p0 = +indexes[i];
                                if (hasColorInd && colPerVert) { c0 = +colorInd[i]; }
                                else { c0 = p0; }
                                t = 1; 
                            break;
                            case 1: 
                                p1 = +indexes[i];
                                if (hasColorInd && colPerVert) { c1 = +colorInd[i]; }
                                else if (hasColorInd && !colPerVert) { c1 = +colorInd[lineCnt]; }
                                else { c1 = p1; }
                                
                                this._mesh._indices[0].push(cnt++, cnt++);
                                
                                this._mesh._positions[0].push(positions[p0].x);
                                this._mesh._positions[0].push(positions[p0].y);
                                this._mesh._positions[0].push(positions[p0].z);
                                this._mesh._positions[0].push(positions[p1].x);
                                this._mesh._positions[0].push(positions[p1].y);
                                this._mesh._positions[0].push(positions[p1].z);
                                
                                if (hasColor) {
                                    if (!colPerVert) {
                                        c0 = c1;
                                    }
                                    this._mesh._colors[0].push(colors[c0].r);
                                    this._mesh._colors[0].push(colors[c0].g);
                                    this._mesh._colors[0].push(colors[c0].b);
                                    this._mesh._colors[0].push(colors[c1].r);
                                    this._mesh._colors[0].push(colors[c1].g);
                                    this._mesh._colors[0].push(colors[c1].b);
                                }
                                
                                t = 2;
                                lineCnt++;
                            break;
                            case 3: 
                                p0 = p1; 
                                c0 = c1;
                                p1 = +indexes[i];
                                if (hasColorInd && colPerVert) { c1 = +colorInd[i]; }
                                else if (hasColorInd && !colPerVert) { c1 = +colorInd[lineCnt]; }
                                else { c1 = p1; }
                                
                                this._mesh._indices[0].push(cnt++, cnt++);
                                
                                this._mesh._positions[0].push(positions[p0].x);
                                this._mesh._positions[0].push(positions[p0].y);
                                this._mesh._positions[0].push(positions[p0].z);
                                this._mesh._positions[0].push(positions[p1].x);
                                this._mesh._positions[0].push(positions[p1].y);
                                this._mesh._positions[0].push(positions[p1].z);
                                
                                if (hasColor) {
                                    if (!colPerVert) {
                                        c0 = c1;
                                    }
                                    this._mesh._colors[0].push(colors[c0].r);
                                    this._mesh._colors[0].push(colors[c0].g);
                                    this._mesh._colors[0].push(colors[c0].b);
                                    this._mesh._colors[0].push(colors[c1].r);
                                    this._mesh._colors[0].push(colors[c1].g);
                                    this._mesh._colors[0].push(colors[c1].b);
                                }
                                
                                lineCnt++;
                            break;
                            default:
                        }
                    }
                } // if isMulti
                else
                {
                    t = 0;
                    
                    for (i=0; i < indexes.length; ++i) 
                    {
                        if (indexes[i] === -1) {
                            t = 0;
                            continue;
                        }
                        
                        switch (t) {
                        case 0: p0 = +indexes[i]; t = 1; break;
                        case 1: p1 = +indexes[i]; t = 2; this._mesh._indices[0].push(p0, p1); break;
                        case 2: p0 = p1; p1 = +indexes[i]; this._mesh._indices[0].push(p0, p1); break;
                        }
                    }
                    
                    this._mesh._positions[0] = positions.toGL();
                    
                    if (hasColor) {
                        this._mesh._colors[0] = colors.toGL();
                        this._mesh._numColComponents = numColComponents;
                    }
                }
                
                this._mesh._invalidate = true;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
                
                var time1 = new Date().getTime() - time0;
                //x3dom.debug.logInfo("Mesh load time: " + time1 + " ms");
            },
            
            fieldChanged: function(fieldName)
            {
                var pnts;
                var i, n;
                
                if (fieldName == "coord")
                {
                    // TODO; multi-index with different this._mesh._indices
                    pnts = this._cf.coord.node._vf.point;
                    n = pnts.length;
                    
                    this._mesh._positions[0] = [];
                    
                    for (i=0; i<n; i++)
                    {
						this._mesh._positions[0].push(pnts[i].x);
						this._mesh._positions[0].push(pnts[i].y);
						this._mesh._positions[0].push(pnts[i].z);
                    }
                    
                    this._mesh._invalidate = true;
                    
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                    });
                }
                else if (fieldName == "color")
                {
                    pnts = this._cf.color.node._vf.color;
                    n = pnts.length;
                    
                    this._mesh._colors[0] = [];
                    
                    for (i=0; i<n; i++)
                    {
						this._mesh._colors[0].push(pnts[i].r);
						this._mesh._colors[0].push(pnts[i].g);
						this._mesh._colors[0].push(pnts[i].b);
                    }
                    
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.colors = true;
                    });
                }
            }
        }
    )
);

/* ### IndexedFaceSet ### */
x3dom.registerNodeType(
    "IndexedFaceSet",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DComposedGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.IndexedFaceSet.superClass.call(this, ctx);
            
			this.addField_SFFloat(ctx, 'creaseAngle', 0);	// TODO
            
            this.addField_MFInt32(ctx, 'coordIndex', []);
            this.addField_MFInt32(ctx, 'normalIndex', []);
            this.addField_MFInt32(ctx, 'colorIndex', []);
            this.addField_MFInt32(ctx, 'texCoordIndex', []);
        },
        {
            nodeChanged: function()
            {
                var time0 = new Date().getTime();
                
                this.handleAttribs();
                
                var indexes = this._vf.coordIndex;
                var normalInd = this._vf.normalIndex;
                var texCoordInd = this._vf.texCoordIndex;
                var colorInd = this._vf.colorIndex;
                
                var hasNormal = false, hasNormalInd = false;
                var hasTexCoord = false, hasTexCoordInd = false;
                var hasColor = false, hasColorInd = false;
                
                var colPerVert = this._vf.colorPerVertex;
                var normPerVert = this._vf.normalPerVertex;
                
                if (normalInd.length > 0)
                {
                    hasNormalInd = true;
                }
                if (texCoordInd.length > 0)
                {
                    hasTexCoordInd = true;
                }
                if (colorInd.length > 0)
                {
                    hasColorInd = true;
                }
                
                var positions, normals, texCoords, colors;
                
                var coordNode = this._cf.coord.node;
                x3dom.debug.assert(coordNode);
                positions = coordNode._vf.point;
                
                var normalNode = this._cf.normal.node;
                if (normalNode) 
                {
                    hasNormal = true;
                    normals = normalNode._vf.vector;
                }
                else {
                    hasNormal = false;
                }

                var texMode = "", numTexComponents = 2;
                var texCoordNode = this._cf.texCoord.node;
                if (texCoordNode) 
                {
                    if (texCoordNode._vf.point) {
                        hasTexCoord = true;
                        texCoords = texCoordNode._vf.point;
                        
                        if (x3dom.isa(texCoordNode, x3dom.nodeTypes.TextureCoordinate3D)) {
                            numTexComponents = 3;
                        }
                    }
                    else if (texCoordNode._vf.mode) {
                        texMode = texCoordNode._vf.mode;
                    }
                }
                else {
                    hasTexCoord = false;
                }
                this._mesh._numTexComponents = numTexComponents;

                var numColComponents = 3;
                var colorNode = this._cf.color.node;
                if (colorNode) 
                {
                    hasColor = true;
                    colors = colorNode._vf.color;
                    
                    if (x3dom.isa(colorNode, x3dom.nodeTypes.ColorRGBA)) {
                        numColComponents = 4;
                    }
                }
                else {
                    hasColor = false;
                }
                this._mesh._numColComponents = numColComponents;

                this._mesh._indices[0] = [];
                this._mesh._positions[0] = [];
                this._mesh._normals[0] = [];
                this._mesh._texCoords[0] = [];
                this._mesh._colors[0] = [];
                
                var i, t, cnt, faceCnt;
                var p0, p1, p2, n0, n1, n2, t0, t1, t2, c0, c1, c2;
                
                if ( (this._vf.creaseAngle <= x3dom.fields.Eps) ||  // FIXME; what to do for ipols?
                     (positions.length / 3 > 65535) || 
                     (hasNormal && hasNormalInd) || 
                     (hasTexCoord && hasTexCoordInd) || 
                     (hasColor && hasColorInd) )
                {
                    // Found MultiIndex Mesh
                    t = 0;
                    cnt = 0;
                    faceCnt = 0;
                    this._mesh._multiIndIndices = [];
                    this._mesh._posSize = positions.length;
                    
                    for (i=0; i < indexes.length; ++i) 
                    {
                        // Convert non-triangular polygons to a triangle fan
                        // (TODO: this assumes polygons are convex)
                        if (indexes[i] == -1) {
                            t = 0;
                            faceCnt++;
                            continue;
                        }
                        
                        if (hasNormalInd) {
                            x3dom.debug.assert(normalInd[i] != -1);
                        }
                        if (hasTexCoordInd) {
                            x3dom.debug.assert(texCoordInd[i] != -1);
                        }
                        if (hasColorInd) {
                            x3dom.debug.assert(colorInd[i] != -1);
                        }

                        //TODO: OPTIMIZE but think about cache coherence regarding arrays!!!
                        switch (t) 
                        {
                            case 0: 
                                p0 = +indexes[i];
                                if (hasNormalInd && normPerVert) { n0 = +normalInd[i]; }
                                else if (hasNormalInd && !normPerVert) { n0 = +normalInd[faceCnt]; }
                                else { n0 = p0; }
                                if (hasTexCoordInd) { t0 = +texCoordInd[i]; }
                                else { t0 = p0; }
                                if (hasColorInd && colPerVert) { c0 = +colorInd[i]; }
                                else if (hasColorInd && !colPerVert) { c0 = +colorInd[faceCnt]; }
                                else { c0 = p0; }
                                t = 1; 
                            break;
                            case 1: 
                                p1 = +indexes[i];
                                if (hasNormalInd && normPerVert) { n1 = +normalInd[i]; }
                                else if (hasNormalInd && !normPerVert) { n1 = +normalInd[faceCnt]; }
                                else { n1 = p1; }
                                if (hasTexCoordInd) { t1 = +texCoordInd[i]; }
                                else { t1 = p1; }
                                if (hasColorInd && colPerVert) { c1 = +colorInd[i]; }
                                else if (hasColorInd && !colPerVert) { c1 = +colorInd[faceCnt]; }
                                else { c1 = p1; }
                                t = 2; 
                            break;
                            case 2: 
                                p2 = +indexes[i];
                                if (hasNormalInd && normPerVert) { n2 = +normalInd[i]; }
                                else if (hasNormalInd && !normPerVert) { n2 = +normalInd[faceCnt]; }
                                else { n2 = p2; }
                                if (hasTexCoordInd) { t2 = +texCoordInd[i]; }
                                else { t2 = p2; }
                                if (hasColorInd && colPerVert) { c2 = +colorInd[i]; }
                                else if (hasColorInd && !colPerVert) { c2 = +colorInd[faceCnt]; }
                                else { c2 = p2; }
                                t = 3; 
                                
                                this._mesh._indices[0].push(cnt++, cnt++, cnt++);
                                
                                this._mesh._positions[0].push(positions[p0].x);
                                this._mesh._positions[0].push(positions[p0].y);
                                this._mesh._positions[0].push(positions[p0].z);
                                this._mesh._positions[0].push(positions[p1].x);
                                this._mesh._positions[0].push(positions[p1].y);
                                this._mesh._positions[0].push(positions[p1].z);
                                this._mesh._positions[0].push(positions[p2].x);
                                this._mesh._positions[0].push(positions[p2].y);
                                this._mesh._positions[0].push(positions[p2].z);
                                
                                if (hasNormal) {
                                    this._mesh._normals[0].push(normals[n0].x);
                                    this._mesh._normals[0].push(normals[n0].y);
                                    this._mesh._normals[0].push(normals[n0].z);
                                    this._mesh._normals[0].push(normals[n1].x);
                                    this._mesh._normals[0].push(normals[n1].y);
                                    this._mesh._normals[0].push(normals[n1].z);
                                    this._mesh._normals[0].push(normals[n2].x);
                                    this._mesh._normals[0].push(normals[n2].y);
                                    this._mesh._normals[0].push(normals[n2].z);
                                }
                                else {
                                    this._mesh._multiIndIndices.push(p0, p1, p2);
                                    //this._mesh._multiIndIndices.push(cnt-3, cnt-2, cnt-1);
                                }
                                
                                if (hasColor) {
                                    this._mesh._colors[0].push(colors[c0].r);
                                    this._mesh._colors[0].push(colors[c0].g);
                                    this._mesh._colors[0].push(colors[c0].b);
                                    if (numColComponents === 4)
                                        this._mesh._colors[0].push(colors[c0].a);
                                    this._mesh._colors[0].push(colors[c1].r);
                                    this._mesh._colors[0].push(colors[c1].g);
                                    this._mesh._colors[0].push(colors[c1].b);
                                    if (numColComponents === 4)
                                        this._mesh._colors[0].push(colors[c1].a);
                                    this._mesh._colors[0].push(colors[c2].r);
                                    this._mesh._colors[0].push(colors[c2].g);
                                    this._mesh._colors[0].push(colors[c2].b);
                                    if (numColComponents === 4)
                                        this._mesh._colors[0].push(colors[c2].a);
                                }
                                
                                if (hasTexCoord) {
                                    this._mesh._texCoords[0].push(texCoords[t0].x);
                                    this._mesh._texCoords[0].push(texCoords[t0].y);
                                    if (numTexComponents === 3)
                                        this._mesh._texCoords[0].push(texCoords[t0].z);
                                    this._mesh._texCoords[0].push(texCoords[t1].x);
                                    this._mesh._texCoords[0].push(texCoords[t1].y);
                                    if (numTexComponents === 3)
                                        this._mesh._texCoords[0].push(texCoords[t1].z);
                                    this._mesh._texCoords[0].push(texCoords[t2].x);
                                    this._mesh._texCoords[0].push(texCoords[t2].y);
                                    if (numTexComponents === 3)
                                        this._mesh._texCoords[0].push(texCoords[t2].z);
                                }
                                
                                //faceCnt++;
                            break;
                            case 3: 
                                p1 = p2; 
                                t1 = t2;
                                if (normPerVert) { n1 = n2; }
                                if (colPerVert) {c1 = c2; }
                                p2 = +indexes[i];
                                if (hasNormalInd && normPerVert) { n2 = +normalInd[i]; }
                                else if (hasNormalInd && !normPerVert) { /*n2 = +normalInd[faceCnt];*/ }
                                else { n2 = p2; }
                                if (hasTexCoordInd) { t2 = +texCoordInd[i]; }
                                else { t2 = p2; }
                                if (hasColorInd && colPerVert) { c2 = +colorInd[i]; }
                                else if (hasColorInd && !colPerVert) { /*c2 = +colorInd[faceCnt];*/ }
                                else { c2 = p2; }
                                
                                this._mesh._indices[0].push(cnt++, cnt++, cnt++);
                                
                                this._mesh._positions[0].push(positions[p0].x);
                                this._mesh._positions[0].push(positions[p0].y);
                                this._mesh._positions[0].push(positions[p0].z);
                                this._mesh._positions[0].push(positions[p1].x);
                                this._mesh._positions[0].push(positions[p1].y);
                                this._mesh._positions[0].push(positions[p1].z);
                                this._mesh._positions[0].push(positions[p2].x);
                                this._mesh._positions[0].push(positions[p2].y);
                                this._mesh._positions[0].push(positions[p2].z);
                                
                                if (hasNormal) {
                                    this._mesh._normals[0].push(normals[n0].x);
                                    this._mesh._normals[0].push(normals[n0].y);
                                    this._mesh._normals[0].push(normals[n0].z);
                                    this._mesh._normals[0].push(normals[n1].x);
                                    this._mesh._normals[0].push(normals[n1].y);
                                    this._mesh._normals[0].push(normals[n1].z);
                                    this._mesh._normals[0].push(normals[n2].x);
                                    this._mesh._normals[0].push(normals[n2].y);
                                    this._mesh._normals[0].push(normals[n2].z);
                                }
                                else {
                                    this._mesh._multiIndIndices.push(p0, p1, p2);
                                    //this._mesh._multiIndIndices.push(cnt-3, cnt-2, cnt-1);
                                }
                                
                                if (hasColor) {
                                    this._mesh._colors[0].push(colors[c0].r);
                                    this._mesh._colors[0].push(colors[c0].g);
                                    this._mesh._colors[0].push(colors[c0].b);
                                    if (numColComponents === 4)
                                        this._mesh._colors[0].push(colors[c0].a);
                                    this._mesh._colors[0].push(colors[c1].r);
                                    this._mesh._colors[0].push(colors[c1].g);
                                    this._mesh._colors[0].push(colors[c1].b);
                                    if (numColComponents === 4)
                                        this._mesh._colors[0].push(colors[c1].a);
                                    this._mesh._colors[0].push(colors[c2].r);
                                    this._mesh._colors[0].push(colors[c2].g);
                                    this._mesh._colors[0].push(colors[c2].b);
                                    if (numColComponents === 4)
                                        this._mesh._colors[0].push(colors[c2].a);
                                }
                                
                                if (hasTexCoord) {
                                    this._mesh._texCoords[0].push(texCoords[t0].x);
                                    this._mesh._texCoords[0].push(texCoords[t0].y);
                                    if (numTexComponents === 3)
                                        this._mesh._texCoords[0].push(texCoords[t0].z);
                                    this._mesh._texCoords[0].push(texCoords[t1].x);
                                    this._mesh._texCoords[0].push(texCoords[t1].y);
                                    if (numTexComponents === 3)
                                        this._mesh._texCoords[0].push(texCoords[t1].z);
                                    this._mesh._texCoords[0].push(texCoords[t2].x);
                                    this._mesh._texCoords[0].push(texCoords[t2].y);
                                    if (numTexComponents === 3)
                                        this._mesh._texCoords[0].push(texCoords[t2].z);
                                }
                                
                                //faceCnt++;
                            break;
                            default:
                        }
                    }
                    
                    if (!hasNormal) {
                        this._mesh.calcNormals(this._vf.creaseAngle);
                    }
                    if (!hasTexCoord) {
                        this._mesh.calcTexCoords(texMode);
                    }
                    
                    this._mesh.splitMesh();
                    
                    //x3dom.debug.logInfo(this._mesh._indices.length);
                } // if isMulti
                else
                {
                    t = 0;
                    
                    for (i = 0; i < indexes.length; ++i) 
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
                        case 2: n2 = +indexes[i]; t = 3; this._mesh._indices[0].push(n0, n1, n2); break;
                        case 3: n1 = n2; n2 = +indexes[i]; this._mesh._indices[0].push(n0, n1, n2); break;
                        }
                    }
                    
                    this._mesh._positions[0] = positions.toGL();
                    
                    if (hasNormal) {
                        this._mesh._normals[0] = normals.toGL();
                    }
                    else {
                        this._mesh.calcNormals(this._vf.creaseAngle);
                    }
                    if (hasTexCoord) {
                        this._mesh._texCoords[0] = texCoords.toGL();
                        this._mesh._numTexComponents = numTexComponents;
                    }
                    else {
                        this._mesh.calcTexCoords(texMode);
                    }
                    if (hasColor) {
                        this._mesh._colors[0] = colors.toGL();
                        this._mesh._numColComponents = numColComponents;
                    }
                }
                
                this._mesh._invalidate = true;
                this._mesh._numFaces = 0;
                this._mesh._numCoords = 0;
                for (i=0; i<this._mesh._indices.length; i++) {
                    this._mesh._numFaces += this._mesh._indices[i].length / 3;
                    this._mesh._numCoords += this._mesh._positions[i].length / 3;
                }
                
                var time1 = new Date().getTime() - time0;
                //x3dom.debug.logInfo("Mesh load time: " + time1 + " ms");
            },
            
            fieldChanged: function(fieldName)
            {
                var pnts = this._cf.coord.node._vf.point;
                var i, n = pnts.length;
                
                if ((this._vf.creaseAngle <= x3dom.fields.Eps) || (n / 3 > 65535) ||
                    (this._vf.normalIndex.length > 0 && this._cf.normal.node) ||
					(this._vf.texCoordIndex.length > 0 && this._cf.texCoord.node) ||
					(this._vf.colorIndex.length > 0 && this._cf.color.node))
                {
                    // TODO; FIXME
                    x3dom.debug.logWarning("Ipol with creaseAngle == 0, too many coords, or multi-index!");
                    
                    /** HACK */
                    this.nodeChanged();
                    
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                    });
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.colors = true;
                    });
                    
                    return;
                }
                
                if (fieldName == "coord")
                {
                    // TODO; multi-index with different this._mesh._indices
                    pnts = this._cf.coord.node._vf.point;
                    n = pnts.length;
                    
                    this._mesh._positions[0] = [];
                    
                    // TODO; optimize (is there a memcopy?)
                    for (i=0; i<n; i++)
                    {
						this._mesh._positions[0].push(pnts[i].x);
						this._mesh._positions[0].push(pnts[i].y);
						this._mesh._positions[0].push(pnts[i].z);
                    }
                    
                    this._mesh._invalidate = true;
                    
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                    });
                }
                else if (fieldName == "color")
                {
                    pnts = this._cf.color.node._vf.color;
                    n = pnts.length;
                    
                    this._mesh._colors[0] = [];
                    
                    for (i=0; i<n; i++)
                    {
						this._mesh._colors[0].push(pnts[i].r);
						this._mesh._colors[0].push(pnts[i].g);
						this._mesh._colors[0].push(pnts[i].b);
                    }
                    
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.colors = true;
                    });
                }
            }
        }
    )
);

/* ### IndexedTriangleSet ### */
x3dom.registerNodeType(
    "IndexedTriangleSet",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DComposedGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.IndexedTriangleSet.superClass.call(this, ctx);
            
            this.addField_MFInt32(ctx, 'index', []);
        },
        {
            nodeChanged: function()
            {
                var time0 = new Date().getTime();
                
                this.handleAttribs();
                
                // TODO; implement colorPerVertex/normalPerVertex
                var colPerVert = this._vf.colorPerVertex;
                var normPerVert = this._vf.normalPerVertex;
                
                var indexes = this._vf.index;
                
                var hasNormal = false, hasTexCoord = false, hasColor = false;
                var positions, normals, texCoords, colors;
                
                var coordNode = this._cf.coord.node;
                x3dom.debug.assert(coordNode);
                positions = coordNode._vf.point;
                
                var normalNode = this._cf.normal.node;
                if (normalNode) {
                    hasNormal = true;
                    normals = normalNode._vf.vector;
                }
                else {
                    hasNormal = false;
                }

                var texMode = "", numTexComponents = 2;
                var texCoordNode = this._cf.texCoord.node;
                if (texCoordNode) {
                    if (texCoordNode._vf.point) {
                        hasTexCoord = true;
                        texCoords = texCoordNode._vf.point;
                        
                        if (x3dom.isa(texCoordNode, x3dom.nodeTypes.TextureCoordinate3D)) {
                            numTexComponents = 3;
                        }
                    }
                    else if (texCoordNode._vf.mode) {
                        texMode = texCoordNode._vf.mode;
                    }
                }
                else {
                    hasTexCoord = false;
                }

                var numColComponents = 3;
                var colorNode = this._cf.color.node;
                if (colorNode) {
                    hasColor = true;
                    colors = colorNode._vf.color;
                    
                    if (x3dom.isa(colorNode, x3dom.nodeTypes.ColorRGBA)) {
                        numColComponents = 4;
                    }
                }
                else {
                    hasColor = false;
                }

                this._mesh._indices[0] = indexes.toGL();
                this._mesh._positions[0] = positions.toGL();
                
                if (hasNormal) {
                    this._mesh._normals[0] = normals.toGL();
                }
                else {
                    this._mesh.calcNormals(this._vf.creaseAngle);
                }
                if (hasTexCoord) {
                    this._mesh._texCoords[0] = texCoords.toGL();
                    this._mesh._numTexComponents = numTexComponents;
                }
                else {
                    this._mesh.calcTexCoords(texMode);
                }
                if (hasColor) {
                    this._mesh._colors[0] = colors.toGL();
                    this._mesh._numColComponents = numColComponents;
                }
                
                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
                
                var time1 = new Date().getTime() - time0;
                //x3dom.debug.logInfo("Mesh load time: " + time1 + " ms");
            },
            
            fieldChanged: function(fieldName)
            {
                var pnts;
                var i, n;
                
                if (fieldName == "coord")
                {
                    // TODO; multi-index with different this._mesh._indices
                    pnts = this._cf.coord.node._vf.point;
                    n = pnts.length;
                    
                    this._mesh._positions[0] = [];
                    
                    // TODO; optimize (is there a memcopy?)
                    for (i=0; i<n; i++)
                    {
						this._mesh._positions[0].push(pnts[i].x);
						this._mesh._positions[0].push(pnts[i].y);
						this._mesh._positions[0].push(pnts[i].z);
                    }
                    
                    this._mesh._invalidate = true;
                    
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                    });
                }
                else if (fieldName == "color")
                {
                    pnts = this._cf.color.node._vf.color;
                    n = pnts.length;
                    
                    this._mesh._colors[0] = [];
                    
                    for (i=0; i<n; i++)
                    {
						this._mesh._colors[0].push(pnts[i].r);
						this._mesh._colors[0].push(pnts[i].g);
						this._mesh._colors[0].push(pnts[i].b);
                    }
                    
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.colors = true;
                    });
                }
            }
        }
    )
);

/* ### X3DGeometricPropertyNode ### */
x3dom.registerNodeType(
    "X3DGeometricPropertyNode",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DGeometricPropertyNode.superClass.call(this, ctx);
        }
    )
);

/* ### Coordinate ### */
x3dom.registerNodeType(
    "Coordinate",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        function (ctx) {
            x3dom.nodeTypes.Coordinate.superClass.call(this, ctx);
            
            //this._vf.point = [];
            this.addField_MFVec3f(ctx, 'point', []);
        },
        {
            fieldChanged: function (fieldName) {
	            Array.forEach(this._parentNodes, function (node) {
		            node.fieldChanged("coord");
            	});
			}
        }
    )
);

/* ### X3DTextureCoordinateNode ### */
x3dom.registerNodeType(
    "X3DTextureCoordinateNode",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        function (ctx) {
            x3dom.nodeTypes.X3DTextureCoordinateNode.superClass.call(this, ctx);
        }
    )
);

/* ### TextureCoordinate3D ### */
x3dom.registerNodeType(
    "TextureCoordinate3D",
    "Texturing3D",
    defineClass(x3dom.nodeTypes.X3DTextureCoordinateNode,
        function (ctx) {
            x3dom.nodeTypes.TextureCoordinate3D.superClass.call(this, ctx);
            
            this.addField_MFVec3f(ctx, 'point', []);
        }
    )
);

/* ### TextureCoordinate ### */
x3dom.registerNodeType(
    "TextureCoordinate",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureCoordinateNode,
        function (ctx) {
            x3dom.nodeTypes.TextureCoordinate.superClass.call(this, ctx);
            
            this.addField_MFVec2f(ctx, 'point', []);
        }
    )
);

/* ### TextureCoordinateGenerator ### */
x3dom.registerNodeType(
    "TextureCoordinateGenerator",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureCoordinateNode,
        function (ctx) {
            x3dom.nodeTypes.TextureCoordinateGenerator.superClass.call(this, ctx);
            
            this.addField_SFString(ctx, 'mode', "SPHERE");
            this.addField_MFFloat(ctx, 'parameter', []);
        }
    )
);

/* ### Normal ### */
x3dom.registerNodeType(
    "Normal",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        function (ctx) {
            x3dom.nodeTypes.Normal.superClass.call(this, ctx);
            
            this.addField_MFVec3f(ctx, 'vector', []);
        }
    )
);

/* ### X3DColorNode ### */
x3dom.registerNodeType(
    "X3DColorNode",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        function (ctx) {
            x3dom.nodeTypes.X3DColorNode.superClass.call(this, ctx);
        },
        {
            fieldChanged: function (fieldName) {
	            Array.forEach(this._parentNodes, function (node) {
		            node.fieldChanged("color");
            	});
			}
        }
    )
);

/* ### Color ### */
x3dom.registerNodeType(
    "Color",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DColorNode,
        function (ctx) {
            x3dom.nodeTypes.Color.superClass.call(this, ctx);
            
            this.addField_MFColor(ctx, 'color', []);
        }
    )
);

/* ### ColorRGBA ### */
x3dom.registerNodeType(
    "ColorRGBA",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DColorNode,
        function (ctx) {
            x3dom.nodeTypes.ColorRGBA.superClass.call(this, ctx);
            
            this.addField_MFColorRGBA(ctx, 'color', []);
        }
    )
);

/* ### X3DVertexAttributeNode ### */
x3dom.registerNodeType(
    "X3DVertexAttributeNode",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        function (ctx) {
            x3dom.nodeTypes.X3DVertexAttributeNode.superClass.call(this, ctx);
            
            this.addField_SFString(ctx, 'name', "");
        }
    )
);

/* ### FloatVertexAttribute ### */
x3dom.registerNodeType(
    "FloatVertexAttribute",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DVertexAttributeNode,
        function (ctx) {
            x3dom.nodeTypes.FloatVertexAttribute.superClass.call(this, ctx);
            
            this.addField_SFInt32(ctx, 'numComponents', 4);
            this.addField_MFFloat(ctx, 'value', []);
        },
        {
            fieldChanged: function (fieldName) {
	            //TODO
			}
        }
    )
);


/* ### X3DFontStyleNode ### */
x3dom.registerNodeType( 
    "X3DFontStyleNode",
    "Text",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DFontStyleNode.superClass.call(this, ctx);
        }
    )
);

/* ### FontStyle ### */
x3dom.registerNodeType( 
    "FontStyle",
    "Text",
    defineClass(x3dom.nodeTypes.X3DFontStyleNode,
        function (ctx) {
            x3dom.nodeTypes.FontStyle.superClass.call(this, ctx);
    
            this.addField_MFString(ctx, 'family', ['SERIF']);
            this.addField_SFBool(ctx, 'horizontal', true);
            this.addField_MFString(ctx, 'justify', ['BEGIN']);
			this.addField_SFString(ctx, 'language', "");
            this.addField_SFBool(ctx, 'leftToRight', true);
            this.addField_SFFloat(ctx, 'size', 1.0);
            this.addField_SFFloat(ctx, 'spacing', 1.0);
			this.addField_SFString(ctx, 'style', "PLAIN");
            this.addField_SFBool(ctx, 'topToBottom', true);
        }
    )
);

x3dom.nodeTypes.FontStyle.defaultNode = function() {
	if (!x3dom.nodeTypes.FontStyle._defaultNode) {
		x3dom.nodeTypes.FontStyle._defaultNode = new x3dom.nodeTypes.FontStyle();
        x3dom.nodeTypes.FontStyle._defaultNode.nodeChanged();
	}
	return x3dom.nodeTypes.FontStyle._defaultNode;
};

/* ### X3DChildNode ### */
x3dom.registerNodeType(
    "X3DChildNode",
    "Core",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DChildNode.superClass.call(this, ctx);
        }
    )
);

/* ### X3DSoundNode ### */
x3dom.registerNodeType(
    "X3DSoundNode",
    "Sound",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DSoundNode.superClass.call(this, ctx);
        }
    )
);

/* ### Sound ### */
x3dom.registerNodeType(
    "Sound",
    "Sound",
    defineClass(x3dom.nodeTypes.X3DSoundNode,
        function (ctx) {
            x3dom.nodeTypes.Sound.superClass.call(this, ctx);
            
            this.addField_SFNode('source', x3dom.nodeTypes.X3DSoundSourceNode);
        }
    )
);

/* ### X3DTimeDependentNode ### */
x3dom.registerNodeType( 
    "X3DTimeDependentNode",
    "Time",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DTimeDependentNode.superClass.call(this, ctx);
            
            this.addField_SFBool(ctx, 'loop', false);
        }
    )
);

/* ### X3DSoundSourceNode ### */
x3dom.registerNodeType( 
    "X3DSoundSourceNode",
    "Sound",
    defineClass(x3dom.nodeTypes.X3DTimeDependentNode,
        function (ctx) {
            x3dom.nodeTypes.X3DSoundSourceNode.superClass.call(this, ctx);
        }
    )
);

/* ### AudioClip ### */
x3dom.registerNodeType( 
    "AudioClip",
    "Sound",
    defineClass(x3dom.nodeTypes.X3DSoundSourceNode,
        function (ctx) {
            x3dom.nodeTypes.AudioClip.superClass.call(this, ctx);
            
            this.addField_MFString(ctx, 'url', []);
            
            this._audio = null;
        },
        {
            nodeChanged: function() 
            {
                this._audio = document.createElement('audio');
                this._audio.setAttribute('autobuffer', 'true');
                //this._audio.setAttribute('autoplay', 'true');
                var p = document.getElementsByTagName('body')[0];
                p.appendChild(this._audio);
                
                for (var i=0; i<this._vf.url.length; i++)
                {
                    var audioUrl = this._nameSpace.getURL(this._vf.url[i]);
                    x3dom.debug.logInfo('Adding sound file: ' + audioUrl);
                    var src = document.createElement('source');
                    src.setAttribute('src', audioUrl);
                    this._audio.appendChild(src);
                }
                
                var that = this;
                
                var startAudio = function()
                {
                    that._audio.play();
                };
                
                var audioDone = function()
                {
                    if (that._vf.loop === true)
                    {
                        that._audio.play();
                    }
                };
                
                this._audio.addEventListener("canplaythrough", startAudio, true);
                this._audio.addEventListener("ended", audioDone, true);
            }
        }
    )
);

/* ### X3DBindableNode ### */
x3dom.registerNodeType(
    "X3DBindableNode",
    "Core",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
          x3dom.nodeTypes.X3DBindableNode.superClass.call(this, ctx);
		  
		  this.addField_SFBool(ctx, 'set_bind', false);
        
		  this._autoGen = (ctx.autoGen ? true : false);
        
		  if (ctx && ctx.doc._bindableBag) {
			this._stack = ctx.doc._bindableBag.addBindable(this);
		  }
		  else {
			this._stack = null;
		    x3dom.debug.logError( 'Could not find bindableBag for registration ' + this.typeName());
		  }
        },
		{
			initDefault: function() {
			},
			bind: function (value) {
				if (this._stack) {
					if (value) {
						this._stack.push (this);
					}
					else {
						this._stack.pop  (this);
					}
				}
				else {
					x3dom.debug.logError ('No BindStack in Bindable\n');
				}
			},
			activate: function () {
				x3dom.debug.logInfo ('activate Bindable ' + this._DEF);
				this.postMessage('isActive', true);
			},
			deactivate: function () {
				x3dom.debug.logInfo ('deactivate Bindable ' + this._DEF);
				this.postMessage('isActive', false);
			},
			fieldChanged: function(fieldName) {
				if (fieldName === "set_bind") {
					this.bind(this._vf.set_bind);
				}
			},
			nodeChanged: function() {
			}
		}
    )
);

/* ### X3DViewpointNode ### */
x3dom.registerNodeType(
    "X3DViewpointNode",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        function (ctx) {
            x3dom.nodeTypes.X3DViewpointNode.superClass.call(this, ctx);
        },
		{
		}
    )
);

/* ### X3DNavigationInfoNode ### */
// FIXME; in X3D there is no X3DNavigationInfoNode.
//        So do we really need this abstract class?
x3dom.registerNodeType(
    "X3DNavigationInfoNode",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        function (ctx) {
            x3dom.nodeTypes.X3DNavigationInfoNode.superClass.call(this, ctx);
        },
		{
        }
    )
);

/* ### X3DBackgroundNode ### */
x3dom.registerNodeType(
    "X3DBackgroundNode",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        function (ctx) {
            x3dom.nodeTypes.X3DBackgroundNode.superClass.call(this, ctx);
            
            this._dirty = true;
        },
		{
        	getSkyColor: function() {
				return new x3dom.fields.SFColor(0,0,0);
			},
			getTransparency: function() {
				return 0;
			},
            getTexUrl: function() {
                return [];
            }
        }
    )
);

/* ### X3DFogNode ### */
x3dom.registerNodeType(
    "X3DFogNode",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        function (ctx) {
            x3dom.nodeTypes.X3DFogNode.superClass.call(this, ctx);
        },
		{
        }
    )
);


/* ### Viewpoint ### */
x3dom.registerNodeType( 
    "Viewpoint",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DViewpointNode,
        function (ctx) {
            x3dom.nodeTypes.Viewpoint.superClass.call(this, ctx);
			this.addField_SFFloat(ctx, 'fieldOfView', 0.785398);
            this.addField_SFVec3f(ctx, 'position', 0, 0, 10);
            this.addField_SFRotation(ctx, 'orientation', 0, 0, 0, 1);
			this.addField_SFVec3f(ctx, 'centerOfRotation', 0, 0, 0);
            this.addField_SFFloat(ctx, 'zNear', 0.1);
            this.addField_SFFloat(ctx, 'zFar', 100000);
            
            this._viewMatrix = this._vf.orientation.toMatrix().transpose().
				mult(x3dom.fields.SFMatrix4f.translation(this._vf.position.negate()));
            this._projMatrix = null;
            this._lastAspect = 1.0;
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "position" || fieldName == "orientation") {
                    this._viewMatrix = this._vf.orientation.toMatrix().transpose().
                        mult(x3dom.fields.SFMatrix4f.translation(this._vf.position.negate()));
                }
                else if (fieldName == "fieldOfView" || 
                         fieldName == "zNear" || fieldName == "zFar") {
                    this._projMatrix = null;   // only trigger refresh
                }
                else if (fieldName === "set_bind") {
                    // XXX FIXME; call parent.fieldChanged();
                    this.bind(this._vf.set_bind);
                }
            },
            
			getCenterOfRotation: function() {
                return this._vf.centerOfRotation;
			},
			getViewMatrix: function() {
                return this._viewMatrix;
			},
			getFieldOfView: function() {
				return this._vf.fieldOfView;
			},
            
            setView: function(newView) {
                var mat = this.getCurrentTransform();
                mat.inverse();
                this._viewMatrix = mat.mult(newView);
            },
            resetView: function() {
                this._viewMatrix = this._vf.orientation.toMatrix().transpose().
                    mult(x3dom.fields.SFMatrix4f.translation(this._vf.position.negate()));
            },
            
            getProjectionMatrix: function(aspect)
            {
                if (this._projMatrix == null)
                {
                    var fovy = this._vf.fieldOfView;
                    var zfar = this._vf.zFar;
                    var znear = this._vf.zNear;
                    
                    var f = 1/Math.tan(fovy/2);
                    this._projMatrix = new x3dom.fields.SFMatrix4f(
                        f/aspect, 0, 0, 0,
                        0, f, 0, 0,
                        0, 0, (znear+zfar)/(znear-zfar), 2*znear*zfar/(znear-zfar),
                        0, 0, -1, 0
                    );
                    
                    this._lastAspect = aspect;
                }
                else if (this._lastAspect !== aspect)
                {
                    this._projMatrix._00 = (1 / Math.tan(this._vf.fieldOfView / 2)) / aspect;
                    this._lastAspect = aspect;
                }
                
                return this._projMatrix;
            }
        }
    )
);

/* ### Fog ### */
x3dom.registerNodeType( 
    "Fog",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DFogNode,
        function (ctx) {
            x3dom.nodeTypes.Fog.superClass.call(this, ctx);
            
			this.addField_SFColor(ctx, 'color', 1, 1, 1);
            this.addField_SFString(ctx, 'fogType', "LINEAR");
			this.addField_SFFloat(ctx, 'visibilityRange', 0);
        },
        {
			// methods
        }
    )
);

/* ### NavigationInfo ### */
x3dom.registerNodeType( 
    "NavigationInfo",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DNavigationInfoNode,
        function (ctx) {
            x3dom.nodeTypes.NavigationInfo.superClass.call(this, ctx);
            
			this.addField_SFBool(ctx, 'headlight', true);
            this.addField_MFString(ctx, 'type', ["EXAMINE","ANY"]);
            this.addField_MFFloat(ctx, 'avatarSize', [0.25,1.6,0.75]);
            this.addField_SFFloat(ctx, 'speed', 1.0);
            this.addField_SFFloat(ctx, 'visibilityLimit', 0.0);
            this.addField_SFTime(ctx, 'transitionTime', 1.0);
            this.addField_MFString(ctx, 'transitionType', ["LINEAR"]);
            
            //TODO; use avatarSize + visibilityLimit for projection matrix
            x3dom.debug.logInfo("NavType: " + this._vf.type[0].toLowerCase());
        },
        {
			// methods
        }
    )
);

/* ### WorldInfo ### */
x3dom.registerNodeType( 
    "WorldInfo",
    "Core",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.WorldInfo.superClass.call(this, ctx);
            
            this.addField_MFString(ctx, 'info', []);
			this.addField_SFString(ctx, 'title', "");
            
            x3dom.debug.logInfo(this._vf.info);
            x3dom.debug.logInfo(this._vf.title);
        },
        {
			// methods
        }
    )
);

/* ### Background ### */
x3dom.registerNodeType(
    "Background",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DBackgroundNode,
        function (ctx) {
            x3dom.nodeTypes.Background.superClass.call(this, ctx);
            
            var trans = ctx.autoGen ? 1 : 0;
			
            this.addField_MFColor(ctx, 'skyColor', [new x3dom.fields.SFColor(0,0,0)]);
            this.addField_MFFloat(ctx, 'skyAngle', []);
            this.addField_MFColor(ctx, 'groundColor', []);
            this.addField_MFFloat(ctx, 'groundAngle', []);
            this.addField_SFFloat(ctx, 'transparency', trans);
            this.addField_MFString(ctx, 'backUrl', []);
            this.addField_MFString(ctx, 'bottomUrl', []);
            this.addField_MFString(ctx, 'frontUrl', []);
            this.addField_MFString(ctx, 'leftUrl', []);
            this.addField_MFString(ctx, 'rightUrl', []);
            this.addField_MFString(ctx, 'topUrl', []);
        },
        {
            fieldChanged: function(fieldName)
            {
                if (fieldName.indexOf("Url") > 0) {
                    this._dirty = true;
                }
            },
			getSkyColor: function() {
				return this._vf.skyColor;
			},
			getTransparency: function() {
				return this._vf.transparency;
			},
            getTexUrl: function() {
                return [
                    this._nameSpace.getURL(this._vf.backUrl[0]),
                    this._nameSpace.getURL(this._vf.frontUrl[0]),
                    this._nameSpace.getURL(this._vf.bottomUrl[0]),
                    this._nameSpace.getURL(this._vf.topUrl[0]),
                    this._nameSpace.getURL(this._vf.leftUrl[0]),
                    this._nameSpace.getURL(this._vf.rightUrl[0])
                    /*
                    this._nameSpace.getURL(this._vf.rightUrl[0]),
                    this._nameSpace.getURL(this._vf.leftUrl[0]),
                    this._nameSpace.getURL(this._vf.topUrl[0]),
                    this._nameSpace.getURL(this._vf.bottomUrl[0]),
                    this._nameSpace.getURL(this._vf.frontUrl[0]),
                    this._nameSpace.getURL(this._vf.backUrl[0])
                    */
                ];
            }
        }
    )
);

/* ### X3DLightNode ### */
x3dom.registerNodeType( 
    "X3DLightNode",
    "Lighting",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DLightNode.superClass.call(this, ctx);
            
			ctx.doc._nodeBag.lights.push(this);

			this.addField_SFFloat(ctx, 'ambientIntensity', 0);
            this.addField_SFColor(ctx, 'color', 1, 1, 1);
			this.addField_SFFloat(ctx, 'intensity', 1);
            this.addField_SFBool(ctx, 'global', false);
            this.addField_SFBool(ctx, 'on', true);
            this.addField_SFFloat(ctx, 'shadowIntensity', 0);
        },
        {
			getViewMatrix: function(vec) {
                return x3dom.fields.SFMatrix4f.identity;
            }
        }
    )
);

/* ### DirectionalLight ### */
x3dom.registerNodeType( 
    "DirectionalLight",
    "Lighting",
    defineClass(x3dom.nodeTypes.X3DLightNode,
        function (ctx) {
            x3dom.nodeTypes.DirectionalLight.superClass.call(this, ctx);
            
            this.addField_SFVec3f(ctx, 'direction', 0, 0, -1);
        },
        {
            getViewMatrix: function(vec) {
                var dir = this._vf.direction.normalize();
                var orientation = x3dom.fields.Quaternion.rotateFromTo(
                        new x3dom.fields.SFVec3f(0, 0, -1), dir);
                return orientation.toMatrix().transpose().
                        mult(x3dom.fields.SFMatrix4f.translation(vec.negate()));
            }
        }
    )
);

/* ### PointLight ### */
x3dom.registerNodeType( 
    "PointLight",
    "Lighting",
    defineClass(x3dom.nodeTypes.X3DLightNode,
        function (ctx) {
            x3dom.nodeTypes.PointLight.superClass.call(this, ctx);
            
            this.addField_SFVec3f(ctx, 'attenuation', 1, 0, 0);
            this.addField_SFVec3f(ctx, 'location', 0, 0, 0);
            this.addField_SFFloat(ctx, 'radius', 100);
            
            this._vf.global = true;
        },
        {
            getViewMatrix: function(vec) {
                var pos = this._vf.location;
                var orientation = x3dom.fields.Quaternion.rotateFromTo(
                        new x3dom.fields.SFVec3f(0, 0, -1), vec);
                return orientation.toMatrix().transpose().
                        mult(x3dom.fields.SFMatrix4f.translation(pos.negate()));
            }
        }
    )
);

/* ### SpotLight ### */
x3dom.registerNodeType( 
    "SpotLight",
    "Lighting",
    defineClass(x3dom.nodeTypes.X3DLightNode,
        function (ctx) {
            x3dom.nodeTypes.SpotLight.superClass.call(this, ctx);
            
            this.addField_SFVec3f(ctx, 'direction', 0, 0, -1);
            this.addField_SFVec3f(ctx, 'attenuation', 1, 0, 0);
            this.addField_SFVec3f(ctx, 'location', 0, 0, 0);
            this.addField_SFFloat(ctx, 'radius', 100);
            this.addField_SFFloat(ctx, 'beamWidth', 1.5707963);
            this.addField_SFFloat(ctx, 'cutOffAngle', 1.5707963);
            
            this._vf.global = true;
        },
        {
            getViewMatrix: function(vec) {
                var pos = this._vf.location;
                var dir = this._vf.direction.normalize();
                var orientation = x3dom.fields.Quaternion.rotateFromTo(
                        new x3dom.fields.SFVec3f(0, 0, -1), dir);
                return orientation.toMatrix().transpose().
                        mult(x3dom.fields.SFMatrix4f.translation(pos.negate()));
            }
        }
    )
);

/* ### X3DShapeNode ### */
x3dom.registerNodeType(
    "X3DShapeNode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DShapeNode.superClass.call(this, ctx);
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
                        
            this.addField_SFNode('appearance', x3dom.nodeTypes.X3DAppearanceNode);
            this.addField_SFNode('geometry', x3dom.nodeTypes.X3DGeometryNode);
            
            this._objectID = 0;
            
            this._dirty = {
				positions: true,
				normals: true,
				texcoords: true,
                colors: true,
				indexes: true,
				texture: true
			};
        },
        {
			nodeChanged: function () {
				if (!this._cf.appearance.node) {
					this.addChild(x3dom.nodeTypes.Appearance.defaultNode());
				}
                if (!this._objectID && this._cf.geometry.node._pickable) {
                    this._objectID = ++x3dom.nodeTypes.Shape.objectID;
                    x3dom.nodeTypes.Shape.idMap.nodeID[this._objectID] = this;
                }
			},
            
            collectDrawableObjects: function (transform, out) {
                // TODO: culling etc
                if (out !== null) 
                {
                    out.push( [transform, this] );
                }
            },
			
			getVolume: function(min, max, invalidate) {
				return this._cf.geometry.node.getVolume(min, max, invalidate);
			},
			
			getCenter: function() {
				return this._cf.geometry.node.getCenter();
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

// ### X3DGroupingNode ###
x3dom.registerNodeType(
    "X3DGroupingNode",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DGroupingNode.superClass.call(this, ctx);
            
            this.addField_SFBool(ctx, 'render', true);
			this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode);
            // FIXME; add addChild and removeChild slots ?
        },
        {
            // Collects array of [transform matrix, node] for all objects that should be drawn.
            collectDrawableObjects: function (transform, out)
            {
                if (!this._vf.render) {
                    return;
                }
                
                for (var i=0; i<this._childNodes.length; i++) {
                    if (this._childNodes[i]) {
                        var childTransform = this._childNodes[i].transformMatrix(transform);
                        this._childNodes[i].collectDrawableObjects(childTransform, out);
                    }
                }
            }
        }
    )
);

// ### Switch ###
x3dom.registerNodeType(
    "Switch",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Switch.superClass.call(this, ctx);
			
			this.addField_SFInt32(ctx, 'whichChoice', -1);
        },
        {
            getVolume: function (min, max, invalidate) 
            {
                if (this._vf.whichChoice < 0 || 
                    this._vf.whichChoice >= this._childNodes.length) {
                    return false;
                }
                
                if (this._childNodes[this._vf.whichChoice]) {
                    return this._childNodes[this._vf.whichChoice].getVolume(min, max, invalidate);
                }
                
                return false;
            },

            find: function (type) 
            {
                if (this._vf.whichChoice < 0 || 
                    this._vf.whichChoice >= this._childNodes.length) {
                    return null;
                }
                
                if (this._childNodes[this._vf.whichChoice]) {
                    if (this._childNodes[this._vf.whichChoice].constructor == type) {
                        return this._childNodes[this._vf.whichChoice];
                    }
                    
                    var c = this._childNodes[this._vf.whichChoice].find(type);
                    if (c) {
                        return c;
                    }
                }
                
                return null;
            },

            findAll: function (type)
            {
                if (this._vf.whichChoice < 0 || 
                    this._vf.whichChoice >= this._childNodes.length) {
                    return [];
                }
                
                var found = [];
                
                if (this._childNodes[this._vf.whichChoice]) {
                    if (this._childNodes[this._vf.whichChoice].constructor == type) {
                        found.push(this._childNodes[this._vf.whichChoice]);
                    }
                    
                    found = found.concat(this._childNodes[this._vf.whichChoice].findAll(type)); 
                }
                
                return found;
            },

            // Collects array of [transform matrix, node] for all objects that should be drawn.
            collectDrawableObjects: function (transform, out)
            {
                if (this._vf.whichChoice < 0 || 
                    this._vf.whichChoice >= this._childNodes.length) {
                    return;
                }
                
                if (this._childNodes[this._vf.whichChoice]) {
                    var childTransform = this._childNodes[this._vf.whichChoice].transformMatrix(transform);
                    this._childNodes[this._vf.whichChoice].collectDrawableObjects(childTransform, out);
                }
            },
            
            doIntersect: function(line)
            {
                if (this._vf.whichChoice < 0 || 
                    this._vf.whichChoice >= this._childNodes.length) {
                    return false;
                }
                
                if (this._childNodes[this._vf.whichChoice]) {
                    return this._childNodes[this._vf.whichChoice].doIntersect(line);
                }
                
                return false;
            }
        }
    )
);

// ### X3DTransformNode ###
x3dom.registerNodeType(
    "X3DTransformNode",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.X3DTransformNode.superClass.call(this, ctx);
           
            ctx.doc._nodeBag.trans.push(this);

			// holds the current matrix
            this._trafo = null;
        },
        {   
			// temporary per frame update method for CSS-Transform
			tick: function(t) {
				var trans = x3dom.getStyle(this._xmlNode, "-webkit-transform");
				//x3dom.debug.logInfo('set css-trans: ' + this._DEF + ' to ' + trans);				
				if (trans && (trans != 'none')) {
					this._trafo.setValueByStr(trans);		
					//x3dom.debug.logInfo(' valid set:' + this._trafo);			
					return true;
				}
						
	        	return false;
	        },
	
            transformMatrix: function(transform) {
                return transform.mult(this._trafo);
            },
			
			getVolume: function(min, max, invalidate) 
            {
				var nMin = x3dom.fields.SFVec3f.MAX();
				var nMax = x3dom.fields.SFVec3f.MIN();
                var valid = false;
                
				for (var i=0, n=this._childNodes.length; i<n; i++)
				{
					if (this._childNodes[i])
					{
						var childMin = x3dom.fields.SFVec3f.MAX();
						var childMax = x3dom.fields.SFVec3f.MIN();
						
						valid = this._childNodes[i].getVolume(
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
                    
                    min.x = nMin.x < nMax.x ? nMin.x : nMax.x;
                    min.y = nMin.y < nMax.y ? nMin.y : nMax.y;
                    min.z = nMin.z < nMax.z ? nMin.z : nMax.z;
                        
                    max.x = nMax.x > nMin.x ? nMax.x : nMin.x;
                    max.y = nMax.y > nMin.y ? nMax.y : nMin.y;
                    max.z = nMax.z > nMin.z ? nMax.z : nMin.z;
                }
                return valid;
			},
            
            doIntersect: function(line) 
            {
                var isect = false;
                var mat = this._trafo.inverse();
                
                var tmpPos = new x3dom.fields.SFVec3f(line.pos.x, line.pos.y, line.pos.z);
                var tmpDir = new x3dom.fields.SFVec3f(line.dir.x, line.dir.y, line.dir.z);
                
                line.pos = mat.multMatrixPnt(line.pos);
                line.dir = mat.multMatrixVec(line.dir);
                
                if (line.hitObject) {
                    line.dist *= line.dir.length();
                }
                
                // check for _nearest_ hit object and don't stop on first!
                for (var i=0; i<this._childNodes.length; i++) 
                {
                    if (this._childNodes[i]) {
                        isect = this._childNodes[i].doIntersect(line) || isect;
                    }
                }
                
                line.pos.setValues(tmpPos);
                line.dir.setValues(tmpDir);
                
                if (isect) {
                    line.hitPoint = this._trafo.multMatrixPnt(line.hitPoint);
                    line.dist *= line.dir.length();
                }
                
                return isect;
            }
        }
    )
);

// ### Transform ###
x3dom.registerNodeType(
    "Transform",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DTransformNode,
        function (ctx) {
            x3dom.nodeTypes.Transform.superClass.call(this, ctx);
            
			this.addField_SFVec3f(ctx, 'center', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'translation', 0, 0, 0);
            this.addField_SFRotation(ctx, 'rotation', 0, 0, 1, 0);
            this.addField_SFVec3f(ctx, 'scale', 1, 1, 1);
			this.addField_SFRotation(ctx, 'scaleOrientation', 0, 0, 1, 0);
            
            // P' = T * C * R * SR * S * -SR * -C * P
            this._trafo = x3dom.fields.SFMatrix4f.translation(
                    this._vf.translation.add(this._vf.center)).
                mult(this._vf.rotation.toMatrix()).
                mult(this._vf.scaleOrientation.toMatrix()).
                mult(x3dom.fields.SFMatrix4f.scale(this._vf.scale)).
                mult(this._vf.scaleOrientation.toMatrix().inverse()).
                mult(x3dom.fields.SFMatrix4f.translation(this._vf.center.negate()));
        },
        {
            fieldChanged: function (fieldName) {
                // P' = T * C * R * SR * S * -SR * -C * P
                this._trafo = x3dom.fields.SFMatrix4f.translation(
                                this._vf.translation.add(this._vf.center)).
                            mult(this._vf.rotation.toMatrix()).
                            mult(this._vf.scaleOrientation.toMatrix()).
                            mult(x3dom.fields.SFMatrix4f.scale(this._vf.scale)).
                            mult(this._vf.scaleOrientation.toMatrix().inverse()).
                            mult(x3dom.fields.SFMatrix4f.translation(this._vf.center.negate()));
            }
        }
    )
);

// ### MatrixTransform ###
x3dom.registerNodeType(
    "MatrixTransform",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DTransformNode,
        function (ctx) {
            x3dom.nodeTypes.MatrixTransform.superClass.call(this, ctx);
            
            this.addField_SFMatrix4f(ctx, 'matrix', 1, 0, 0, 0,
                                                    0, 1, 0, 0,
                                                    0, 0, 1, 0,
                                                    0, 0, 0, 1);
            this._trafo = this._vf.matrix;
        },
        {
        }
    )
);

// ### Group ###
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

// ### StaticGroup ###
x3dom.registerNodeType(
    "StaticGroup",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.StaticGroup.superClass.call(this, ctx);
            
            // FIXME; implement optimizations; no need to maintain the children's 
            // X3D representations, as they cannot be accessed after creation time
            x3dom.debug.logInfo("StaticGroup NYI");
        }
    )
);

// ### Collision ###
x3dom.registerNodeType(
    "Collision",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Collision.superClass.call(this, ctx);

			this.addField_SFBool (ctx, "enabled", true);
			this.addField_SFNode ("proxy", x3dom.nodeTypes.X3DGroupingNode);
			
			// TODO; add Slots: collideTime, isActive 
        },
        {
            collectDrawableObjects: function (transform, out)
            {
                for (var i=0; i<this._childNodes.length; i++) 
                {
                    if (this._childNodes[i] && (this._childNodes[i] !== this._cf.proxy.node)) 
                    {
                        var childTransform = this._childNodes[i].transformMatrix(transform);
                        this._childNodes[i].collectDrawableObjects(childTransform, out);
                    }
                }
            }
        }
    )
);

// ### LOD ###
x3dom.registerNodeType(
    "LOD",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.LOD.superClass.call(this, ctx);

			this.addField_SFBool (ctx, "forceTransitions", false);
            this.addField_SFVec3f(ctx, 'center', 0, 0, 0);
			this.addField_MFFloat(ctx, "range", []);
            
            this._eye = new x3dom.fields.SFVec3f(0, 0, 0);
        },
        {
            collectDrawableObjects: function (transform, out)
            {
                var i=0, n=this._childNodes.length;
                
                var min = x3dom.fields.SFVec3f.MAX();
                var max = x3dom.fields.SFVec3f.MIN();
                var ok = this.getVolume(min, max, true);
                
                var mid = (max.add(min).multiply(0.5)).add(this._vf.center);
                var len = mid.subtract(this._eye).length();
                
                //calculate range check for viewer distance d (with range in local coordinates)
                //N+1 children nodes for N range values (L0, if d < R0, ... Ln-1, if d >= Rn-1)
                while (i < this._vf.range.length && len > this._vf.range[i]) {
                    i++;
                }
                if (i && i >= n) {
                    i = n - 1;
                }
                
                if (n && this._childNodes[i])
                {
                    var childTransform = this._childNodes[i].transformMatrix(transform);
                    this._childNodes[i].collectDrawableObjects(childTransform, out);
                }
                
                if (out !== null)
                {
                    //optimization, exploit coherence and do it for next frame
                    out.LODs.push( [transform, this] );
                }
            }
        }
    )
);

// ### X3DInterpolatorNode ###
x3dom.registerNodeType(
    "X3DInterpolatorNode",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DInterpolatorNode.superClass.call(this, ctx);
            
			this.addField_MFFloat(ctx, 'key', []);
        },
        {
            linearInterp: function (t, interp) {
                if (t <= this._vf.key[0])
                    return this._vf.keyValue[0];
                if (t >= this._vf.key[this._vf.key.length-1])
                    return this._vf.keyValue[this._vf.key.length-1];
                for (var i = 0; i < this._vf.key.length-1; ++i) {
                    if ((this._vf.key[i] < t) && (t <= this._vf.key[i+1])) {
                        return interp( this._vf.keyValue[i], this._vf.keyValue[i+1], 
                                (t - this._vf.key[i]) / (this._vf.key[i+1] - this._vf.key[i]) );
					}
				}
			    return this._vf.keyValue[0];
            }
        }
    )
);

// ### OrientationInterpolator ###
x3dom.registerNodeType(
    "OrientationInterpolator",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        function (ctx) {
            x3dom.nodeTypes.OrientationInterpolator.superClass.call(this, ctx);
            
            if (ctx.xmlNode.hasAttribute('keyValue'))
                this._vf.keyValue = x3dom.fields.MFRotation.parse(ctx.xmlNode.getAttribute('keyValue'));
            else
                this._vf.keyValue = [];
            
            this._fieldWatchers.fraction = this._fieldWatchers.set_fraction = [ function (msg) {
                var value = this.linearInterp(msg, function (a, b, t) { return a.slerp(b, t); });
                this.postMessage('value_changed', value);
            } ];
        }
    )
);

// ### PositionInterpolator ###
x3dom.registerNodeType(
    "PositionInterpolator",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        function (ctx) {
            x3dom.nodeTypes.PositionInterpolator.superClass.call(this, ctx);
            
            if (ctx.xmlNode.hasAttribute('keyValue'))
                this._vf.keyValue = x3dom.fields.MFVec3f.parse(ctx.xmlNode.getAttribute('keyValue'));
            else
                this._vf.keyValue = [];
            
            this._fieldWatchers.fraction = this._fieldWatchers.set_fraction = [ function (msg) {
                var value = this.linearInterp(msg, function (a, b, t) { return a.multiply(1.0-t).add(b.multiply(t)); });
                this.postMessage('value_changed', value);
            } ];
        }
    )
);

// ### ScalarInterpolator ###
x3dom.registerNodeType(
    "ScalarInterpolator",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        function (ctx) {
            x3dom.nodeTypes.ScalarInterpolator.superClass.call(this, ctx);
            
            if (ctx.xmlNode.hasAttribute('keyValue'))
                this._vf.keyValue = Array.map(ctx.xmlNode.getAttribute('keyValue').split(/\s+/), function (n) { return +n; });
            else
                this._vf.keyValue = [];
			
            this._fieldWatchers.fraction = this._fieldWatchers.set_fraction = [ function (msg) {
                var value = this.linearInterp(msg, function (a, b, t) { return (1.0-t)*a + t*b; });
                this.postMessage('value_changed', value);
            } ];
        }
    )
);

// ### CoordinateInterpolator ###
x3dom.registerNodeType(
    "CoordinateInterpolator",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        function (ctx) {
            x3dom.nodeTypes.CoordinateInterpolator.superClass.call(this, ctx);
            
            this._vf.keyValue = [];
            if (ctx.xmlNode.hasAttribute('keyValue')) {
                var arr = x3dom.fields.MFVec3f.parse(ctx.xmlNode.getAttribute('keyValue'));
                var key = this._vf.key.length > 0 ? this._vf.key.length : 1;
                var len = arr.length / key;
                for (var i=0; i<key; i++) {
                    var val = new x3dom.fields.MFVec3f();
                    for (var j=0; j<len; j++) {
                        val.push( arr[i*len+j] );
                    }
                    this._vf.keyValue.push(val);
                }
            }
            
            this._fieldWatchers.fraction = this._fieldWatchers.set_fraction = [ function (msg) {
                var value = this.linearInterp(msg, function (a, b, t) {
                    var val = new x3dom.fields.MFVec3f();
                    for (var i=0; i<a.length; i++) {
                        val.push(a[i].multiply(1.0-t).add(b[i].multiply(t)));
                    }
                    return val;
                });
                this.postMessage('value_changed', value);
            } ];
        }
    )
);

// ### X3DSensorNode ###
x3dom.registerNodeType(
    "X3DSensorNode",
    "Core",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DSensorNode.superClass.call(this, ctx);
        }
    )
);

// ### TimeSensor ###
x3dom.registerNodeType(
    "TimeSensor",
    "Time",
    defineClass(x3dom.nodeTypes.X3DSensorNode,
        function (ctx) {
            x3dom.nodeTypes.TimeSensor.superClass.call(this, ctx);
            
			ctx.doc._nodeBag.timer.push(this);
			
			this.addField_SFBool(ctx, 'enabled', true);
            this.addField_SFTime(ctx, 'cycleInterval', 1);
            this.addField_SFBool(ctx, 'loop', false);
            this.addField_SFTime(ctx, 'startTime', 0);
    
            this._fraction = 0;
        },
        {
            onframe: function (ts) {
				if (!this._vf.enabled)
					return;
				
            	var isActive = (ts >= this._vf.startTime);
            	var cycleFrac, cycle, fraction;
            	
            	if (this._vf.cycleInterval > 0) {
                    cycleFrac = (ts - this._vf.startTime) / this._vf.cycleInterval;
                    cycle = Math.floor(cycleFrac);
                    fraction = cycleFrac - cycle;
            	}
     
     			this.postMessage('fraction_changed', fraction);
            }
        }
    )
);


// Not a real X3D node type
// TODO; refactor to Scene + Viewarea node --> via Layering component?

// ### Scene ###
x3dom.registerNodeType( 
    "Scene",
    "Core",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Scene.superClass.call(this, ctx);
            
            // define the experimental picking mode: box, exact (NYI), idBuf, color
            this.addField_SFString(ctx, 'pickMode', "idBuf");
            
			this._cam = null;
            this._bgnd = null;
            this._navi = null;
			this._lights = [];
        },
        {
			/* bindable getter (e.g. getViewpoint) are added automatically */
        }
    )
);

// ### Anchor ###
x3dom.registerNodeType(
    "Anchor",
    "Networking",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Anchor.superClass.call(this, ctx);
            
            this.addField_MFString(ctx, 'url', []);
        },
        {
            doIntersect: function(line) {
                var isect = false;
                for (var i=0; i<this._childNodes.length; i++) {
                    if (this._childNodes[i]) {
                        isect = this._childNodes[i].doIntersect(line) || isect;
                    }
                }
                return isect;
            },
            
            handleTouch: function() {
                // fixme; window.open usually gets blocked
                // but this way the current page is lost?!
                window.location = this._nameSpace.getURL(this._vf.url[0]);
            }
        }
    )
);

// ### Inline ###
x3dom.registerNodeType(
    "Inline",
    "Networking",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Inline.superClass.call(this, ctx);
            
            this.addField_MFString(ctx, 'url', []);
            this.addField_SFBool(ctx, 'load', true);
        },
        {
            fieldChanged: function (fieldName)
            {
                if (fieldName == "url") {
                    this.nodeChanged();
                }
            },
            
			nodeChanged: function ()
            {
				var that = this;

				var xhr = new XMLHttpRequest();
				xhr.overrideMimeType('text/xml');   //application/xhtml+xml
				this._nameSpace.doc.downloadCount += 1;
				
				xhr.onreadystatechange = function () {
					if (xhr.readyState == 4) {
						if (xhr.responseXML.documentElement.localName == 'parsererror') {
							x3dom.debug.logInfo('XML parser failed on ' + this._vf.url + 
                                        ':\n' + xhr.responseXML.documentElement.textContent);
							return;
						}
					}
					else {
						//x3dom.debug.logInfo('Loading inlined data... (readyState: ' + xhr.readyState + ')');
						//if (xhr.readyState == 3) x3dom.debug.logInfo(xhr.responseText);
						return;
					}
					if (xhr.status !== 200) {
						x3dom.debug.logError('XMLHttpRequest requires a web server running!');
						return;
					}

					x3dom.debug.logInfo('Inline: downloading '+that._vf.url+' done.');

					var xml = xhr.responseXML;

					//TODO; check if exists and FIXME: it's not necessarily the first scene in the doc!
					var inlScene = xml.getElementsByTagName('Scene')[0] || xml.getElementsByTagName('scene')[0];

					if (inlScene) {
						var nameSpace = new x3dom.NodeNameSpace("", that._nameSpace.doc);
						nameSpace.setBaseURL (that._vf.url[0]);      
						var newScene = nameSpace.setupTree(inlScene);
						that.addChild(newScene);
					}
					else {
						x3dom.debug.logInfo('no Scene in ' + xml.localName);
					}

					while (that._childNodes.length !== 0) {
						that.removeChild(that._childNodes[0]);
					}
					that.addChild(newScene);

					that._nameSpace.doc.downloadCount -= 1;
					that._nameSpace.doc.needRender = true;
					x3dom.debug.logInfo('Inline: added '+that._vf.url+' to scene.');
				};

           		xhr.open('GET', this._nameSpace.getURL(this._vf.url[0]), true);
           		xhr.send(null);
			}
        }
    )
);

/* ### END OF NODES ###*/

// ### Viewarea ###
x3dom.Viewarea = function (document, scene) {
	this._doc = document; // x3ddocument
	this._scene = scene; // FIXME: updates ?!
    
    document._nodeBag.viewarea.push(this);
	
	// if (pickMode = idBuf && mouse event) then set to true
    this._updatePicking = false;
    this._pickingInfo = {
        pickPos: {},
        pickObj: null,
        updated: false
    };
    
	this._rotMat = x3dom.fields.SFMatrix4f.identity();
	this._transMat = x3dom.fields.SFMatrix4f.identity();
	this._movement = new x3dom.fields.SFVec3f(0, 0, 0);
    
	this._width = 400;
	this._height = 300;
    this._lastX = -1;
    this._lastY = -1;
    this._pick = new x3dom.fields.SFVec3f(0, 0, 0);
    
    this._lastTS = 0;
    this._transitionTime = 1;
    this._mixer = new x3dom.MatrixMixer();
};

x3dom.Viewarea.prototype.tick = function(timeStamp)
{
    this._lastTS = timeStamp;
    
    if (this._mixer._beginTime <= 0)
        return false;
    
    if (timeStamp >= this._mixer._beginTime) 
    {
        if (timeStamp <= this._mixer._endTime) 
        {
            var mat = this._mixer.mix(timeStamp);
            
            this._scene.getViewpoint().setView(mat);
        }
        else {
            this._mixer._beginTime = 0;
            this._mixer._endTime = 0;
            
            this._scene.getViewpoint().setView(this._mixer._endMat);
        }
    }
    else {
        this._scene.getViewpoint().setView(this._mixer._beginMat);
    }
    
    return true;
};

x3dom.Viewarea.prototype.getLights = function () 
{ 
    return this._doc._nodeBag.lights;
};

x3dom.Viewarea.prototype.getViewpointMatrix = function () 
{
	var viewpoint = this._scene.getViewpoint();
 	var mat_viewpoint = viewpoint.getCurrentTransform();
 
	return mat_viewpoint.mult(viewpoint.getViewMatrix());
};

x3dom.Viewarea.prototype.getViewMatrix = function () 
{
	return this.getViewpointMatrix().
			mult(this._transMat).
			mult(this._rotMat);
};
        
x3dom.Viewarea.prototype.getLightMatrix = function () 
{
	var lights = this._doc._nodeBag.lights;
    var i, n = lights.length;
	
	if (n > 0)
    {
        var min = x3dom.fields.SFVec3f.MAX();
        var max = x3dom.fields.SFVec3f.MIN();
        var ok = this._scene.getVolume(min, max, true);    //TODO; FFF optimize
        
        if (ok)
        {
            var l_arr = [];
            var viewpoint = this._scene.getViewpoint();
            var fov = viewpoint.getFieldOfView();
            
            var dia = max.subtract(min);
            var dist1 = (dia.y/2.0) / Math.tan(fov/2.0) + (dia.z/2.0);
            var dist2 = (dia.x/2.0) / Math.tan(fov/2.0) + (dia.z/2.0);
            
            dia = min.add(dia.multiply(0.5));
            
            for (i=0; i<n; i++)
            {
                //FIXME; lights might be influenced by parent transformation
                if (x3dom.isa(lights[i], x3dom.nodeTypes.PointLight)) {
                    dia = dia.subtract(lights[i]._vf.location).normalize();
                }
                else {
                    var dir = lights[i]._vf.direction.normalize().negate();
                    dia = dia.add(dir.multiply(1.2*(dist1 > dist2 ? dist1 : dist2)));
                }
                
                l_arr[i] = lights[i].getViewMatrix(dia);
            }
            
            return l_arr;
        }
    }
    
    //TODO, this is only for testing
    return [ this.getViewMatrix() ];
};
 
x3dom.Viewarea.prototype.getWCtoLCMatrix = function(lMat)
{
    var proj = this.getProjectionMatrix();
    var view;
    
    if (arguments.length === 0) {
        view = this.getLightMatrix()[0];
    }
    else {
        view = lMat;
    }
    
    return proj.mult(view);
};

x3dom.Viewarea.prototype.getProjectionMatrix = function() 
{
    var viewpoint = this._scene.getViewpoint();
    
	return viewpoint.getProjectionMatrix(this._width/this._height);
};

x3dom.Viewarea.prototype.getWCtoCCMatrix = function()
{
    var view = this.getViewMatrix();
    var proj = this.getProjectionMatrix();
    
    return proj.mult(view);
};

x3dom.Viewarea.prototype.getCCtoWCMatrix = function()
{
    var mat = this.getWCtoCCMatrix();
    
    return mat.inverse();
};

x3dom.Viewarea.prototype.calcViewRay = function(x, y)
{
    var cctowc = this.getCCtoWCMatrix();
    
    var rx = x / (this._width - 1.0) * 2.0 - 1.0;
    var ry = (this._height - 1.0 - y) / (this._height - 1.0) * 2.0 - 1.0;
    
    var from = cctowc.multFullMatrixPnt(new x3dom.fields.SFVec3f(rx, ry, -1));
    var at = cctowc.multFullMatrixPnt(new x3dom.fields.SFVec3f(rx, ry,  1));
    var dir = at.subtract(from);
    
    return new x3dom.fields.Line(from, dir);
};

x3dom.Viewarea.prototype.showAll = function()
{
	var min = x3dom.fields.SFVec3f.MAX();
	var max = x3dom.fields.SFVec3f.MIN();
    var ok = this._scene.getVolume(min, max, true);
    
    if (ok)
    {
        var viewpoint = this._scene.getViewpoint();
        var fov = viewpoint.getFieldOfView();
        
        var dia = max.subtract(min);
        var dist1 = (dia.y/2.0) / Math.tan(fov/2.0) + (dia.z/2.0);
        var dist2 = (dia.x/2.0) / Math.tan(fov/2.0) + (dia.z/2.0);
        
        dia = min.add(dia.multiply(0.5));
        dia.z += (dist1 > dist2 ? dist1 : dist2);
        
        // EXPERIMENTAL (TODO: parent trafo of vp)
        this._mixer._beginTime = this._lastTS;
        this._mixer._endTime = this._lastTS + this._transitionTime;
        //this._mixer.setBeginMatrix(this._scene.getViewpoint()._viewMatrix);
        this._mixer.setBeginMatrix(this.getViewMatrix());
        this._mixer.setEndMatrix(x3dom.fields.SFMatrix4f.translation(dia.multiply(-1)));
        
        this._rotMat = x3dom.fields.SFMatrix4f.identity();
        this._transMat = x3dom.fields.SFMatrix4f.identity();
        this._movement = new x3dom.fields.SFVec3f(0, 0, 0);
        //viewpoint.setView(x3dom.fields.SFMatrix4f.translation(dia.multiply(-1)));
    }
};

x3dom.Viewarea.prototype.resetView = function()
{
    // EXPERIMENTAL (TODO: parent trafo of vp)
    this._mixer._beginTime = this._lastTS;
    this._mixer._endTime = this._lastTS + this._transitionTime;
    //this._mixer.setBeginMatrix(this._scene.getViewpoint()._viewMatrix);
    this._mixer.setBeginMatrix(this.getViewMatrix());
    this._scene.getViewpoint().resetView()
    this._mixer.setEndMatrix(this._scene.getViewpoint()._viewMatrix);
    
    this._rotMat = x3dom.fields.SFMatrix4f.identity();
    this._transMat = x3dom.fields.SFMatrix4f.identity();
    this._movement = new x3dom.fields.SFVec3f(0, 0, 0);
    //this._scene.getViewpoint().resetView();
};

x3dom.Viewarea.prototype.checkEvents = function (obj)
{
    var that = this;
    
    try {
        var anObj = obj;
        if ( anObj._xmlNode.hasAttribute('onclick') ||
            (anObj = anObj._cf.geometry.node)._xmlNode.hasAttribute('onclick') ) {
            var funcStr = anObj._xmlNode.getAttribute('onclick');
            var func = new Function('hitPnt', funcStr);
            func.call(anObj, that._pick.toGL());
        }
    }
    catch(e) {}
    
    var recurse = function(obj) {
        Array.forEach(obj._parentNodes, function (node) {
            if (node._xmlNode && node._xmlNode.hasAttribute('onclick')) {
                var funcStr = node._xmlNode.getAttribute('onclick');
                var func = new Function('hitPnt', funcStr);
                func.call(node, that._pick.toGL());
            }
            if (x3dom.isa(node, x3dom.nodeTypes.Anchor)) {
                node.handleTouch();
            }
            else {
                recurse(node);
            }
        });
    };
    
    recurse(obj);
};

x3dom.Viewarea.prototype.onMousePress = function (x, y, buttonState)
{
	this._lastX = x;
	this._lastY = y;
};

x3dom.Viewarea.prototype.onMouseRelease = function (x, y, buttonState)
{
    this._lastX = x;
    this._lastY = y;
    
    var avoidTraversal = (this._scene._vf.pickMode.toLowerCase() === "idbuf" ||
                          this._scene._vf.pickMode.toLowerCase() === "color");
    var isect = false;
    var obj = null;
	
	
    
    if (avoidTraversal) {
        if (!this._pickingInfo.updated) {
            this._updatePicking = true;
            return;
        }
        else {
			
            this._pickingInfo.updated = false;
            
            if ( (obj = this._pickingInfo.pickObj) )
            {
                this._pick.setValues(this._pickingInfo.pickPos);
                this._pickingInfo.pickObj = null;
                
                this.checkEvents(obj);
                
                x3dom.debug.logInfo("Hit \"" + obj._xmlNode.localName + "/ " + 
                                    obj._DEF + "\"");
                x3dom.debug.logInfo("Ray hit at position " + this._pick);
                
                return;
            }
        }
    }
    
    var line = this.calcViewRay(x, y);
    
    if (!avoidTraversal) {
        var t0 = new Date().getTime();
        
        isect = this._scene.doIntersect(line);
        
        if ( isect && (obj = line.hitObject) )
        {
            this._pick.setValues(line.hitPoint);
            
            this.checkEvents(obj);
            
            x3dom.debug.logInfo("Hit \"" + obj._xmlNode.localName + "/ " + 
                                obj._DEF + "\ at dist=" + line.dist.toFixed(4));
            x3dom.debug.logInfo("Ray hit at position " + this._pick);
        }
        
        var t1 = new Date().getTime() - t0;
        x3dom.debug.logInfo("Picking time (box): " + t1 + "ms");
    }
    
    if (!isect) 
    {
        var dir = this.getViewMatrix().e2().negate();
        var u = dir.dot(line.pos.negate()) / dir.dot(line.dir);
        this._pick = line.pos.add(line.dir.multiply(u));
        //x3dom.debug.logInfo("No hit at position " + this._pick);
    }
};

x3dom.Viewarea.prototype.onMouseOut = function (x, y, buttonState)
{
	this._lastX = x;
    this._lastY = y;
};

x3dom.Viewarea.prototype.onDoubleClick = function (x, y)
{
    var navi = this._scene.getNavigationInfo();
    if (navi._vf.type[0].length <= 1 || navi._vf.type[0].toLowerCase() == "none")
        return;
    
    var viewpoint = this._scene.getViewpoint();
    
    viewpoint._vf.centerOfRotation.setValues(this._pick);
    x3dom.debug.logInfo("New center of Rotation:  " + this._pick);
};

x3dom.Viewarea.prototype.onDrag = function (x, y, buttonState) 
{
    var navi = this._scene.getNavigationInfo();
    if (navi._vf.type[0].length <= 1 || navi._vf.type[0].toLowerCase() == "none")
        return;

    var dx = x - this._lastX;
    var dy = y - this._lastY;
    var min, max, ok, d, vec;
    var viewpoint = this._scene.getViewpoint();

    if (buttonState & 1) 
    {
        var alpha = (dy * 2 * Math.PI) / this._width;
        var beta = (dx * 2 * Math.PI) / this._height;
        var mat = this.getViewMatrix();

        var mx = x3dom.fields.SFMatrix4f.rotationX(alpha);
        var my = x3dom.fields.SFMatrix4f.rotationY(beta);

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
        min = x3dom.fields.SFVec3f.MAX();
        max = x3dom.fields.SFVec3f.MIN();
        ok = this._scene.getVolume(min, max, true);

        d = ok ? (max.subtract(min)).length() : 10;
        d = (d < x3dom.fields.Eps) ? 1 : d;
        //x3dom.debug.logInfo("PAN: " + min + " / " + max + " D=" + d);
        //x3dom.debug.logInfo("w="+this._width+", h="+this._height);

        vec = new x3dom.fields.SFVec3f(d*dx/this._width,d*(-dy)/this._height,0);
        this._movement = this._movement.add(vec);

        //TODO; move real distance along viewing plane
        this._transMat = viewpoint.getViewMatrix().inverse().
        mult(x3dom.fields.SFMatrix4f.translation(this._movement)).
        mult(viewpoint.getViewMatrix());
    }
    if (buttonState & 2) 
    {
        min = x3dom.fields.SFVec3f.MAX();
        max = x3dom.fields.SFVec3f.MIN();
        ok = this._scene.getVolume(min, max, true);

        d = ok ? (max.subtract(min)).length() : 10;
        d = (d < x3dom.fields.Eps) ? 1 : d;
        //x3dom.debug.logInfo("ZOOM: " + min + " / " + max + " D=" + d);
        //x3dom.debug.logInfo((dx+dy)+" w="+this._width+", h="+this._height);

        vec = new x3dom.fields.SFVec3f(0,0,d*(dx+dy)/this._height);
        this._movement = this._movement.add(vec);

        //TODO; move real distance along viewing ray
        this._transMat = viewpoint.getViewMatrix().inverse().
        mult(x3dom.fields.SFMatrix4f.translation(this._movement)).
        mult(viewpoint.getViewMatrix());
    }

    this._lastX = x;
    this._lastY = y;
};

// ### X3DDocument ###
x3dom.X3DDocument = function(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
	this.needRender = true;
	this._scene = null;
	this._viewarea = null;
	this._nodeBag = { timer: [], lights: [], clipPlanes: [], followers: [], trans: [], renderTextures: [], viewarea: [] };
	//this.animNode = [];
	this.downloadCount = 0;
    this.onload = function () {};
    this.onerror = function () {};
};

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
        if ( x3dom.isX3DElement(next_uri) && 
            (next_uri.localName.toLowerCase() === 'x3d' || next_uri.localName.toLowerCase() === 'websg') )
        {
            // Special case, when passed an X3D node instead of a URI string
            uri_docs[next_uri] = next_uri;
            next_step();
        }
    }
	
    next_step();
};

x3dom.findScene = function(x3dElem) {
    var sceneElems = [];    
    for (var i=0; i<x3dElem.childNodes.length; i++) {
        var sceneElem = x3dElem.childNodes[i];        
        if (sceneElem && sceneElem.localName && sceneElem.localName.toLowerCase() === "scene") {
            sceneElems.push(sceneElem);
        }
    }
    
    if (sceneElems.length > 1) {
        x3dom.debug.logError("X3D element has more than one Scene child (has " + 
                             x3dElem.childNodes.length + ").");
    }
    else {
        return sceneElems[0];
    }
    return null;
};

x3dom.X3DDocument.prototype._setup = function (sceneDoc, uriDocs, sceneElemPos) {

    var doc = this;
    
    // Test capturing DOM mutation events on the X3D subscene
    var domEventListener = {
        onAttrModified: function(e) {
            var attrToString = {
                1: "MODIFICATION",
                2: "ADDITION",
                3: "REMOVAL"
            };
            //x3dom.debug.logInfo("MUTATION: " + e.attrName + ", " + e.type + ", attrChange=" + attrToString[e.attrChange]);
            e.target._x3domNode.updateField(e.attrName, e.newValue);
			doc.needRender = true;			
        },
        onNodeRemoved: function(e) {
            var parent = e.target.parentNode._x3domNode;
            var child = e.target._x3domNode;
			
            //x3dom.debug.logInfo("Child: " + e.target.type + ", MUTATION: " + e + ", " + e.type + ", removed node=" + e.target.tagName);
            if (parent) {
                parent.removeChild(child);
                doc.needRender = true;			
            }
        },
        onNodeInserted: function(e) {
            var parent = e.target.parentNode._x3domNode;
            var child = e.target;
            //x3dom.debug.logInfo("MUTATION: " + e + ", " + e.type + ", inserted node=" + child.tagName);
            //x3dom.debug.logInfo("MUTATION: " + child.translation + ", " + child.parentNode.tagName);

			if (parent._nameSpace) {
                var newNode = parent._nameSpace.setupTree(child);
                parent.addChild(newNode, child.getAttribute("containerField"));
                doc.needRender = true;
			}
            else {
				x3dom.debug.logInfo("No _nameSpace in onNodeInserted");
			}
         }
    };
    
    //sceneDoc.addEventListener('DOMCharacterDataModified', domEventListener.onAttrModified, true);    
    sceneDoc.addEventListener('DOMNodeRemoved', domEventListener.onNodeRemoved, true);
    sceneDoc.addEventListener('DOMNodeInserted', domEventListener.onNodeInserted, true);
	if ( (x3dom.userAgentFeature.supportsDOMAttrModified === true ) ) {
		sceneDoc.addEventListener('DOMAttrModified', domEventListener.onAttrModified, true);
	}
	
    var sceneElem = x3dom.findScene(sceneDoc);              // sceneDoc is the X3D element here...
	
	// create and add BindableBag
	this._bindableBag = new x3dom.BindableBag(this);
	
	// create and add the NodeNameSpace 
	var nameSpace = new x3dom.NodeNameSpace("scene", doc);
    var scene = nameSpace.setupTree(sceneElem);
    
	// link scene
    this._scene = scene;
	this._bindableBag.setRefNode(scene);
	
	// create view 
	this._viewarea = new x3dom.Viewarea (this, scene);
	
	this._viewarea._width = this.canvas.width;
	this._viewarea._height = this.canvas.height;
};

x3dom.X3DDocument.prototype.advanceTime = function (t) {
	var that;
	
    if (this._nodeBag.timer.length) {
		this.needRender = true;
        Array.forEach( this._nodeBag.timer, function (node) { node.onframe(t); } );
    }
    if (this._nodeBag.followers.length) {
		that = this;
        Array.forEach( this._nodeBag.followers, function (node) { that.needRender |= node.tick(t); } );
    }
	// just a temporary tricker solution to update the CSS-trans
 	if (this._nodeBag.trans.length) {
		that = this;
        Array.forEach( this._nodeBag.trans, function (node) { that.needRender |= node.tick(t); } );
    }
    if (this._nodeBag.viewarea.length) {
		that = this;
        Array.forEach( this._nodeBag.viewarea, function (node) { that.needRender |= node.tick(t); } );
    }
};

x3dom.X3DDocument.prototype.render = function (ctx) {
    if (!ctx || !this._viewarea)
        return;
    
    ctx.renderScene(this._viewarea, this._viewarea._updatePicking);
    
    if (this._viewarea._pickingInfo.updated) {
        // mouse release handling only possible after rendering has finished
        this._viewarea.onMouseRelease(this._viewarea._lastX, this._viewarea._lastY, 0);
        this.needRender = true;
    }
};

x3dom.X3DDocument.prototype.onDrag = function (x, y, buttonState) {
    if (this._viewarea) {
        this._viewarea.onDrag(x, y, buttonState);
    }
};

x3dom.X3DDocument.prototype.onMousePress = function (x, y, buttonState) {
    if (this._viewarea) {
        this._viewarea.onMousePress(x, y, buttonState);
    }
};

x3dom.X3DDocument.prototype.onMouseRelease = function (x, y, buttonState) {
    if (this._viewarea) {
        this._viewarea.onMouseRelease(x, y, buttonState);
    }
};

x3dom.X3DDocument.prototype.onMouseOut = function (x, y, buttonState) {
    if (this._viewarea) {
        this._viewarea.onMouseOut(x, y, buttonState);
    }
};

x3dom.X3DDocument.prototype.onDoubleClick = function (x, y) {
    if (this._viewarea) {
        this._viewarea.onDoubleClick(x, y);
    }
};

x3dom.X3DDocument.prototype.onKeyPress = function(charCode) 
{
    //x3dom.debug.logInfo("pressed key " + charCode);
    switch (charCode)
    {
        case  32: /* space */
            {
				var statDiv = this.canvas.parent.statDiv;

				if (statDiv) {	
					statDiv.style.display = ((statDiv.style.display == 'none') ? 'inline' : 'none');
				}
				
                x3dom.debug.logInfo("a: show all | d: show helper buffers | l: light view | " +
                                    "m: toggle render mode | p: intersect type | r: reset view");
            }
            break;
        case  97: /* a, view all */ 
            {
                this._viewarea.showAll();
            }
            break;
        case  100: /* d, switch on/off buffer view for dbg */ 
            {
				if (this._viewarea._visDbgBuf === undefined) {
					this._viewarea._visDbgBuf = true;
                }
				else {
					this._viewarea._visDbgBuf = !this._viewarea._visDbgBuf;
                }
                
                x3dom.debug.logContainer.style.visibility = 
                        (this._viewarea._visDbgBuf === true) ? "visible" : "hidden";
            }
            break;
        case 108: /* l, light view */ 
			{
                if (this._nodeBag.lights.length > 0)
                {
                    this._scene.getViewpoint().setView(this._viewarea.getLightMatrix()[0]);
                    this._viewarea._rotMat = x3dom.fields.SFMatrix4f.identity();
                    this._viewarea._transMat = x3dom.fields.SFMatrix4f.identity();
                    this._viewarea._movement = new x3dom.fields.SFVec3f(0, 0, 0);
                }
			}
			break;
        case 109: /* m, toggle "points" attribute */ 
			{
				if (this._viewarea._points === undefined) {
					this._viewarea._points = true;
                }
				else {
					this._viewarea._points = !this._viewarea._points;
                }
			}
			break;
        case 112: /* p, switch intersect type */
            {
                if (this._scene._vf.pickMode.toLowerCase() === "idbuf") {
                    this._scene._vf.pickMode = "color";
                }
                else if (this._scene._vf.pickMode.toLowerCase() === "color") {
                    this._scene._vf.pickMode = "box";
                }
                else {
                    this._scene._vf.pickMode = "idBuf";
                }
                x3dom.debug.logInfo("Switch pickMode to '" + this._scene._vf.pickMode + "'.");
            }
            break;
        case 114: /* r, reset view */
            {
                this._viewarea.resetView();
            }
            break;
        default:
    }
};

x3dom.X3DDocument.prototype.shutdown = function(ctx)
{
    if (!ctx)
        return;
	ctx.shutdown(this._viewarea);
};

