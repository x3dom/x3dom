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

        this._listeners = {};

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
            // attention: overwritten by concrete classes
            for (var i=0, n=this._childNodes.length; i<n; i++) {
                if (this._childNodes[i]) {
                    this._childNodes[i].parentRemoved(this);
                }
            }
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
                        }
                    }
                    catch (exc2) {
                        x3dom.debug.logError("updateField: setValueByStr() NYI for " + typeof(f));
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
                    if (this._vf[fieldName]) {
                        fromField = fieldName;
                    }
                } else {
                    pos = fromField.indexOf(post);
                    if (pos > 0) {
                        fieldName = fromField.substr(0, fromField.length - post.length);
                        if (this._vf[fieldName]) {
                            fromField = fieldName;
                        }
                    }
                }
            }

            // build correct toField
            if (!toNode._vf[toField]) {
                pos = toField.indexOf(pre);
                if (pos === 0) {
                    fieldName = toField.substr(pre.length, toField.length - 1);
                    if (toNode._vf[fieldName]) {
                        toField = fieldName;
                    }
                }
                else {
                    pos = toField.indexOf(post);
                    if (pos > 0) {
                        fieldName = toField.substr(0, toField.length - post.length);
                        if (toNode._vf[fieldName]) {
                            toField = fieldName;
                        }
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
        
		callEvtHandler: function(eventType, event) {
			var node = this;
			
			try {
				var attrib = node._xmlNode[eventType];
				event.target = node._xmlNode;
				
				if (typeof(attrib) === "function") {
					attrib.call(node._xmlNode, event);
				}
				else {
					var funcStr = node._xmlNode.getAttribute(eventType);
					var func = new Function('event', funcStr);
					func.call(node._xmlNode, event);
				}
				
				var list = node._listeners[event.type];
				if (list) {
					for (var it=0; it<list.length; it++) {
						list[it].call(node._xmlNode, event);
					}
				}
			}
			catch(ex) {
				x3dom.debug.logException(ex);
			}
			
			return event.cancelBubble;
		},
        
        initSetter: function (xmlNode, name) {
			//IE has no __defineSetter__ !!!
			if(xmlNode.__defineSetter__ != undefined) {
				xmlNode.__defineSetter__(name, function(value) {
					xmlNode.setAttribute(name, value);
				});
			} else {
				Object.defineProperty(xmlNode, name, { 
					set: function(value) { 
						xmlNode.setAttribute(name, value); 
					} 
				});
			}
        },

        addField_SFInt32: function (ctx, name, n) {
            this._vf[name] = ctx && ctx.xmlNode.hasAttribute(name) ?
                parseInt(ctx.xmlNode.getAttribute(name),10) : n;
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },
        addField_SFFloat: function (ctx, name, n) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                +ctx.xmlNode.getAttribute(name) : n;
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },
        addField_SFDouble: function (ctx, name, n) {    // is double anyway
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                +ctx.xmlNode.getAttribute(name) : n;
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },
        addField_SFTime: function (ctx, name, n) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                +ctx.xmlNode.getAttribute(name) : n;
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },
        addField_SFBool: function (ctx, name, n) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                ctx.xmlNode.getAttribute(name).toLowerCase() === "true" : n;
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },
        addField_SFString: function (ctx, name, n) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                ctx.xmlNode.getAttribute(name) : n;
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },
        addField_SFColor: function (ctx, name, r, g, b) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                x3dom.fields.SFColor.parse(ctx.xmlNode.getAttribute(name)) :
                new x3dom.fields.SFColor(r, g, b);
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },
        addField_SFColorRGBA: function (ctx, name, r, g, b, a) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                x3dom.fields.SFColorRGBA.parse(ctx.xmlNode.getAttribute(name)) :
                new x3dom.fields.SFColorRGBA(r, g, b, a);
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },
        addField_SFVec2f: function (ctx, name, x, y) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                x3dom.fields.SFVec2f.parse(ctx.xmlNode.getAttribute(name)) :
                new x3dom.fields.SFVec2f(x, y);
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },
        addField_SFVec3f: function (ctx, name, x, y, z) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                x3dom.fields.SFVec3f.parse(ctx.xmlNode.getAttribute(name)) :
                new x3dom.fields.SFVec3f(x, y, z);
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },
        addField_SFVec3d: function(ctx, name, x, y, z) {
            // JS always float precision, no double
            this.addField_SFVec3f(ctx, name, x, y, z);
        },
        addField_SFRotation: function (ctx, name, x, y, z, a) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                x3dom.fields.Quaternion.parseAxisAngle(ctx.xmlNode.getAttribute(name)) :
                x3dom.fields.Quaternion.axisAngle(new x3dom.fields.SFVec3f(x, y, z), a);
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
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
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },
        addField_SFImage: function (ctx, name, def) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                x3dom.fields.SFImage.parse(ctx.xmlNode.getAttribute(name)) :
                new x3dom.fields.SFImage(def);
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },

        addField_MFString: function (ctx, name, def) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                x3dom.fields.MFString.parse(ctx.xmlNode.getAttribute(name)) :
                new x3dom.fields.MFString(def);
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },
        addField_MFInt32: function (ctx, name, def) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                x3dom.fields.MFInt32.parse(ctx.xmlNode.getAttribute(name)) :
                new x3dom.fields.MFInt32(def);
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },
        addField_MFFloat: function (ctx, name, def) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                x3dom.fields.MFFloat.parse(ctx.xmlNode.getAttribute(name)) :
                new x3dom.fields.MFFloat(def);
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },
        addField_MFDouble: function (ctx, name, def) {  // is double anyway
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                x3dom.fields.MFFloat.parse(ctx.xmlNode.getAttribute(name)) :
                new x3dom.fields.MFFloat(def);
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },
        addField_MFColor: function (ctx, name, def) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                x3dom.fields.MFColor.parse(ctx.xmlNode.getAttribute(name)) :
                new x3dom.fields.MFColor(def);
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },
        addField_MFColorRGBA: function (ctx, name, def) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                x3dom.fields.MFColorRGBA.parse(ctx.xmlNode.getAttribute(name)) :
                new x3dom.fields.MFColorRGBA(def);
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },
        addField_MFVec2f: function (ctx, name, def) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                x3dom.fields.MFVec2f.parse(ctx.xmlNode.getAttribute(name)) :
                new x3dom.fields.MFVec2f(def);
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },
        addField_MFVec3f: function (ctx, name, def) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                x3dom.fields.MFVec3f.parse(ctx.xmlNode.getAttribute(name)) :
                new x3dom.fields.MFVec3f(def);
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
        },
        addField_MFVec3d: function (ctx, name, def) {
            this.addField_MFVec3f(ctx, name, def);
        },
        addField_MFRotation: function (ctx, name, def) {
            this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                x3dom.fields.MFRotation.parse(ctx.xmlNode.getAttribute(name)) :
                new x3dom.fields.MFRotation(def);
                
            if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
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

/* ### X3DBindableNode ### */
x3dom.registerNodeType(
    "X3DBindableNode",
    "Core",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
          x3dom.nodeTypes.X3DBindableNode.superClass.call(this, ctx);

          this.addField_SFBool(ctx, 'set_bind', false);
          this.addField_SFString(ctx, 'description', "");
          this.addField_SFBool(ctx, 'isActive', false);

          this._autoGen = (ctx.autoGen ? true : false);

          if (ctx && ctx.doc._bindableBag) {
            this._stack = ctx.doc._bindableBag.addBindable(this);
          }
          else {
            this._stack = null;
            x3dom.debug.logError('Could not find bindableBag for registration ' + this.typeName());
          }
        },
        {
            initDefault: function() {},

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

            activate: function (prev) {
                x3dom.debug.logInfo ('activate Bindable ' + this._DEF);
                this.postMessage('isActive', true);
            },

            deactivate: function (prev) {
                x3dom.debug.logInfo ('deactivate Bindable ' + this._DEF);
                this.postMessage('isActive', false);
            },

            fieldChanged: function(fieldName) {
                if (fieldName === "set_bind") {
                    this.bind(this._vf.set_bind);
                }
            },

            nodeChanged: function() {}
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

// deprecated, will be removed in 1.4
x3dom.registerNodeType(
    "Param",
    "Core",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.Param.superClass.call(this, ctx);
        },{
            nodeChanged: function() {
                  x3dom.debug.logWarning('DEPRECATED 1.3: Param element needs to be child of X3D element [<a href="http://x3dom.org/docs/latest/configuration.html">DOCS</a>]');
            }
        }
    )
);