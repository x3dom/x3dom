/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### X3DNode ###
x3dom.registerNodeType(
    "X3DNode",
    "Core",
    defineClass(null, 
        /**
         * Constructor for X3DNode
         * @constructs x3dom.nodeTypes.X3DNode
         * @x3d 3.3
         * @component Core
         * @status experimental
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This abstract node type is the base type for all nodes in the X3D system.
         */
        function (ctx) {
            // reference to DOM element
            this._xmlNode = null;

            // holds a link to the node name
            this._DEF = null;

            // links the nameSpace
            this._nameSpace = (ctx && ctx.nameSpace) ? ctx.nameSpace : null;

            // holds all value fields (e.g. SFFloat, MFVec3f, ...)
            this._vf = {};
            this._vfFieldTypes = {};

            // holds all child fields ( SFNode and MFNode )
            this._cf = {};
            this._cfFieldTypes = {};

            this._fieldWatchers = {};
            this._routes = {};

            this._listeners = {};

            this._parentNodes = [];

            // FIXME; should be removed and handled by _cf methods
            this._childNodes = [];


            /**
             * Field to add metadata information
             * @var {x3dom.fields.SFNode} metadata
             * @memberof x3dom.nodeTypes.X3DNode
             * @initvalue X3DMetadataObject
             * @field x3d
             * @instance
             */
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
                                for (var i = node._parentNodes.length - 1; i >= 0; i--) {
                                    if (node._parentNodes[i] === this) {
                                        node._parentNodes.splice(i, 1);
                                        node.parentRemoved(this);
                                    }
                                }
                                for (var j = this._childNodes.length - 1; j >= 0; j--) {
                                    if (this._childNodes[j] === node) {
                                        node.onRemove();
                                        this._childNodes.splice(j, 1);
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
                return false;
            },

            onRemove: function() {
                // to be overwritten by concrete classes
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

            getVolume: function () {
                //x3dom.debug.logWarning("Called getVolume for unbounded node!");
                return null;
            },

            invalidateVolume: function() {
                // overwritten
            },

            invalidateCache: function() {
                // overwritten
            },

            volumeValid: function() {
                return false;
            },

            // Collects all objects to be drawn
            collectDrawableObjects: function (transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes) {
                // explicitly do nothing on collect traversal for (most) nodes
            },

            highlight: function(enable, color)
            {
                if (this._vf.hasOwnProperty("diffuseColor"))
                {
                    if (enable) {
                        if (this._actDiffuseColor === undefined) {
                            this._actDiffuseColor = new x3dom.fields.SFColor();
                            this._highlightOn = false;
                        }

                        if (!this._highlightOn) {
                            this._actDiffuseColor.setValues(this._vf.diffuseColor);
                            this._highlightOn = true;
                        }
                        this._vf.diffuseColor.setValues(color);
                    }
                    else {
                        if (this._actDiffuseColor !== undefined) {
                            this._vf.diffuseColor.setValues(this._actDiffuseColor);
                            this._highlightOn = false;
                            // new/delete every frame can be very slow
                            // but prevent from copying if called not only on change
                            delete this._actDiffuseColor;
                        }
                    }
                }

                for (var i=0, n=this._childNodes.length; i<n; i++)
                {
                    if (this._childNodes[i])
                        this._childNodes[i].highlight(enable, color);
                }
            },

            findX3DDoc: function () {
                return this._nameSpace.doc;
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

                var that = this;
                if (listeners) {
                    Array.forEach(listeners, function (l) { l.call(that, msg); });
                }

                //for Web-style access to the output data of ROUTES, provide a callback function
                var eventObject = {
                    target: that._xmlNode,
                    type: "outputchange",   // event only called onxxx if used as old-fashioned attribute
                    fieldName: field,
                    value: msg
                };

                this.callEvtHandler("onoutputchange", eventObject);
            },

            // method for handling field updates
            updateField: function (field, msg) {
                var f = this._vf[field];

                if (f === undefined) {
                    for (var key in this._vf) {
                        if (key.toLowerCase() == field) {
                            field = key;
                            f = this._vf[field];
                            break;
                        }
                    }

                    var pre = "set_";
                    if (f === undefined && field.indexOf(pre) == 0) {
                        var fieldName = field.substr(pre.length, field.length - 1);
                        if (this._vf[fieldName] !== undefined) {
                            field = fieldName;
                            f = this._vf[field];
                        }
                    }
                    if (f === undefined) {
                        f = null;
                        this._vf[field] = f;
                    }
                }

                if (f !== null) {
                    try {
                        this._vf[field].setValueByStr(msg);
                    }
                    catch (exc1) {
                        try {
                            switch ((typeof(this._vf[field])).toString()) {
                                case "number":
                                    if (typeof(msg) == "number")
                                        this._vf[field] = msg;
                                    else
                                        this._vf[field] = +msg;
                                    break;
                                case "boolean":
                                    if (typeof(msg) == "boolean")
                                        this._vf[field] = msg;
                                    else
                                        this._vf[field] = (msg.toLowerCase() == "true");
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
                        if (this._vf[fieldName] !== undefined) {
                            fromField = fieldName;
                        }
                    } else {
                        pos = fromField.indexOf(post);
                        if (pos > 0) {
                            fieldName = fromField.substr(0, fromField.length - post.length);
                            if (this._vf[fieldName] !== undefined) {
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
                        if (toNode._vf[fieldName] !== undefined) {
                            toField = fieldName;
                        }
                    }
                    else {
                        pos = toField.indexOf(post);
                        if (pos > 0) {
                            fieldName = toField.substr(0, toField.length - post.length);
                            if (toNode._vf[fieldName] !== undefined) {
                                toField = fieldName;
                            }
                        }
                    }
                }

                var where = this._DEF + "&" + fromField + "&" + toNode._DEF + "&" + toField;

                if (!this._routes[where]) {
                    if (!this._fieldWatchers[fromField]) {
                        this._fieldWatchers[fromField] = [];
                    }
                    this._fieldWatchers[fromField].push(
                        function (msg) {
                            toNode.postMessage(toField, msg);
                        }
                    );

                    if (!toNode._fieldWatchers[toField]) {
                        toNode._fieldWatchers[toField] = [];
                    }
                    toNode._fieldWatchers[toField].push(
                        // FIXME: THIS DOESN'T WORK FOR NODE (_cf) FIELDS
                        function (msg) {
                            toNode._vf[toField] = msg;
                            toNode.fieldChanged(toField);
                        }
                    );

                    // store this route to be able to delete it
                    this._routes[where] = {
                        from: this._fieldWatchers[fromField].length - 1,
                        to: toNode._fieldWatchers[toField].length - 1
                    };
                }
            },

            removeRoute: function (fromField, toNode, toField) {
                var pos;
                var fieldName;
                var pre = "set_", post = "_changed";

                // again, build correct fromField
                if (!this._vf[fromField]) {
                    pos = fromField.indexOf(pre);
                    if (pos === 0) {
                        fieldName = fromField.substr(pre.length, fromField.length - 1);
                        if (this._vf[fieldName] !== undefined) {
                            fromField = fieldName;
                        }
                    } else {
                        pos = fromField.indexOf(post);
                        if (pos > 0) {
                            fieldName = fromField.substr(0, fromField.length - post.length);
                            if (this._vf[fieldName] !== undefined) {
                                fromField = fieldName;
                            }
                        }
                    }
                }

                // again, build correct toField
                if (!toNode._vf[toField]) {
                    pos = toField.indexOf(pre);
                    if (pos === 0) {
                        fieldName = toField.substr(pre.length, toField.length - 1);
                        if (toNode._vf[fieldName] !== undefined) {
                            toField = fieldName;
                        }
                    }
                    else {
                        pos = toField.indexOf(post);
                        if (pos > 0) {
                            fieldName = toField.substr(0, toField.length - post.length);
                            if (toNode._vf[fieldName] !== undefined) {
                                toField = fieldName;
                            }
                        }
                    }
                }

                // finally, delete route
                var where = this._DEF + "&" + fromField + "&" + toNode._DEF + "&" + toField;

                if (this._routes[where]) {
                    this._fieldWatchers[fromField].splice(this._routes[where].from, 1);
                    toNode._fieldWatchers[toField].splice(this._routes[where].to, 1);

                    delete this._routes[where];
                }
            },

            fieldChanged: function (fieldName) {
                // to be overwritten by concrete classes
            },

            nodeChanged: function () {
                // to be overwritten by concrete classes
            },

            callEvtHandler: function(eventType, event) {
                var node = this;

                if (!node._xmlNode) {
                    return event.cancelBubble;
                }

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
                if (!xmlNode || !name)
                    return;

                var nameLC = name.toLowerCase();
                if (xmlNode.__defineSetter__ && xmlNode.__defineGetter__) {
                    xmlNode.__defineSetter__(name, function(value) {
                        xmlNode.setAttribute(name, value);
                    });
                    xmlNode.__defineGetter__(name, function() {
                        return xmlNode.getAttribute(name);
                    });
                    if (nameLC != name) {
                        xmlNode.__defineSetter__(nameLC, function(value) {
                            xmlNode.setAttribute(name, value);
                        });
                        xmlNode.__defineGetter__(nameLC, function() {
                            return xmlNode.getAttribute(name);
                        });
                    }
                }
                else {
                    // IE has no __define[G|S]etter__ !!!
                    Object.defineProperty(xmlNode, name, {
                        set: function(value) {
                            xmlNode.setAttribute(name, value);
                        },
                        get: function() {
                            return xmlNode.getAttribute(name);
                        },
                        configurable: true,
                        enumerable: true
                    });
                }

                if (this._vf[name] &&
                    !xmlNode.attributes[name] && !xmlNode.attributes[name.toLowerCase()]) {
                    var str = "";
                    try {
                        if (this._vf[name].toGL)
                            str = this._vf[name].toGL().toString();
                        else
                            str = this._vf[name].toString();
                    }
                    catch (e) {
                        str = this._vf[name].toString();
                    }
                    if (!str) {
                        str = "";
                    }
                    xmlNode.setAttribute(name, str);
                }
            },

            // single fields
            addField_SFInt32: function (ctx, name, n) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    parseInt(ctx.xmlNode.getAttribute(name),10) : n;

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "SFInt32";
            },

            addField_SFFloat: function (ctx, name, n) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    +ctx.xmlNode.getAttribute(name) : n;

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "SFFloat";
            },

            addField_SFDouble: function (ctx, name, n) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    +ctx.xmlNode.getAttribute(name) : n;

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "SFDouble";
            },

            addField_SFTime: function (ctx, name, n) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    +ctx.xmlNode.getAttribute(name) : n;

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "SFTime";
            },

            addField_SFBool: function (ctx, name, n) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    ctx.xmlNode.getAttribute(name).toLowerCase() === "true" : n;

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "SFBool";
            },

            addField_SFString: function (ctx, name, n) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    ctx.xmlNode.getAttribute(name) : n;

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "SFString";
            },

            addField_SFColor: function (ctx, name, r, g, b) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    x3dom.fields.SFColor.parse(ctx.xmlNode.getAttribute(name)) :
                    new x3dom.fields.SFColor(r, g, b);

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "SFColor";
            },

            addField_SFColorRGBA: function (ctx, name, r, g, b, a) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    x3dom.fields.SFColorRGBA.parse(ctx.xmlNode.getAttribute(name)) :
                    new x3dom.fields.SFColorRGBA(r, g, b, a);

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "SFColorRGBA";
            },

            addField_SFVec2f: function (ctx, name, x, y) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    x3dom.fields.SFVec2f.parse(ctx.xmlNode.getAttribute(name)) :
                    new x3dom.fields.SFVec2f(x, y);

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "SFVec2f";
            },

            addField_SFVec3f: function (ctx, name, x, y, z) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    x3dom.fields.SFVec3f.parse(ctx.xmlNode.getAttribute(name)) :
                    new x3dom.fields.SFVec3f(x, y, z);

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "SFVec3f";
            },

            addField_SFVec4f: function (ctx, name, x, y, z, w) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    x3dom.fields.SFVec4f.parse(ctx.xmlNode.getAttribute(name)) :
                    new x3dom.fields.SFVec4f(x, y, z, w);

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "SFVec4f";
            },

            addField_SFVec3d: function(ctx, name, x, y, z) {
                this.addField_SFVec3f(ctx, name, x, y, z);
                this._vfFieldTypes[name] = "SFVec3d";
            },

            addField_SFRotation: function (ctx, name, x, y, z, a) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    x3dom.fields.Quaternion.parseAxisAngle(ctx.xmlNode.getAttribute(name)) :
                    x3dom.fields.Quaternion.axisAngle(new x3dom.fields.SFVec3f(x, y, z), a);

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "SFRotation";
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
                this._vfFieldTypes[name] = "SFMatrix4f";
            },

            addField_SFImage: function (ctx, name, def) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    x3dom.fields.SFImage.parse(ctx.xmlNode.getAttribute(name)) :
                    new x3dom.fields.SFImage(def);

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "SFImage";
            },

            // multi fields
            addField_MFString: function (ctx, name, def) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    x3dom.fields.MFString.parse(ctx.xmlNode.getAttribute(name)) :
                    new x3dom.fields.MFString(def);

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "MFString";
            },

            addField_MFBoolean: function (ctx, name, def) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    x3dom.fields.MFBoolean.parse(ctx.xmlNode.getAttribute(name)) :
                    new x3dom.fields.MFBoolean(def);

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "MFBoolean";
            },

            addField_MFInt32: function (ctx, name, def) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    x3dom.fields.MFInt32.parse(ctx.xmlNode.getAttribute(name)) :
                    new x3dom.fields.MFInt32(def);

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "MFInt32";
            },

            addField_MFFloat: function (ctx, name, def) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    x3dom.fields.MFFloat.parse(ctx.xmlNode.getAttribute(name)) :
                    new x3dom.fields.MFFloat(def);

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "MFFloat";
            },

            addField_MFDouble: function (ctx, name, def) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    x3dom.fields.MFFloat.parse(ctx.xmlNode.getAttribute(name)) :
                    new x3dom.fields.MFFloat(def);

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "MFDouble";
            },

            addField_MFColor: function (ctx, name, def) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    x3dom.fields.MFColor.parse(ctx.xmlNode.getAttribute(name)) :
                    new x3dom.fields.MFColor(def);

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "MFColor";
            },

            addField_MFColorRGBA: function (ctx, name, def) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    x3dom.fields.MFColorRGBA.parse(ctx.xmlNode.getAttribute(name)) :
                    new x3dom.fields.MFColorRGBA(def);

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "MFColorRGBA";
            },

            addField_MFVec2f: function (ctx, name, def) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    x3dom.fields.MFVec2f.parse(ctx.xmlNode.getAttribute(name)) :
                    new x3dom.fields.MFVec2f(def);

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "MFVec2f";
            },

            addField_MFVec3f: function (ctx, name, def) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    x3dom.fields.MFVec3f.parse(ctx.xmlNode.getAttribute(name)) :
                    new x3dom.fields.MFVec3f(def);

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "MFVec3f";
            },

            addField_MFVec3d: function (ctx, name, def) {
                this.addField_MFVec3f(ctx, name, def);
                this._vfFieldTypes[name] = "MFVec3d";
            },

            addField_MFRotation: function (ctx, name, def) {
                this._vf[name] = ctx && ctx.xmlNode && ctx.xmlNode.hasAttribute(name) ?
                    x3dom.fields.MFRotation.parse(ctx.xmlNode.getAttribute(name)) :
                    new x3dom.fields.MFRotation(def);

                if (ctx && ctx.xmlNode) { this.initSetter(ctx.xmlNode, name); }
                this._vfFieldTypes[name] = "MFRotation";
            },

            // child node fields
            addField_SFNode: function (name, type) {
                this._cf[name] = new x3dom.fields.SFNode(type);
                this._cfFieldTypes[name] = "SFNode";
            },
            addField_MFNode: function (name, type) {
                this._cf[name] = new x3dom.fields.MFNode(type);
                this._cfFieldTypes[name] = "MFNode";
            }
        }
    )
);
