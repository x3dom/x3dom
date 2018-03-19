/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Script ### */
x3dom.registerNodeType(
    "Script",
    "Scripting",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        
        /**
         * Constructor for Script
         * @constructs x3dom.nodeTypes.Script
         * @x3d 3.3
         * @component Shaders
         * @status experimental
         * @extends x3dom.nodeTypes.X3DShaderNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Script node defines a script.
         */
        function (ctx) {
            x3dom.nodeTypes.Script.superClass.call(this, ctx);


            /**
             * Contains all fields of
             * @var {x3dom.fields.MFNode} fields
             * @memberof x3dom.nodeTypes.Script
             * @initvalue x3dom.nodeTypes.Field
             * @field x3d
             * @instance
             */
            this.addField_MFNode('fields', x3dom.nodeTypes.Field);
            this.addField_SFString(ctx, 'type', "text/javascript");
            this.addField_MFString(ctx, 'url', []);
            x3dom.debug.assert(this._vf.type.toLowerCase() == 'text/javascript',
                               "Unknown script type!");

        },
        {
            nodeChanged: function()
            {
                var i, n;

                var ctx = {};
                n = this._cf.fields.nodes.length;

                for (i=0; i<n; i++)
                {
                    var fieldName = this._cf.fields.nodes[i]._vf.name;
                    ctx.xmlNode = this._cf.fields.nodes[i]._xmlNode;

                    var needNode = false;

                    if (ctx.xmlNode === undefined || ctx.xmlNode === null) {
                        ctx.xmlNode = document.createElement("field");
                        needNode = true;
                    }

                    ctx.xmlNode.setAttribute(fieldName, this._cf.fields.nodes[i]._vf.value);

                    var funcName = "this.addField_" + this._cf.fields.nodes[i]._vf.type + "(ctx, name);";
                    var func = new Function('ctx', 'name', funcName);

                    func.call(this, ctx, fieldName);

                    if (needNode) {
                        ctx.xmlNode = null;    // cleanup
                    }
                }


                if (ctx.xmlNode !== undefined && ctx.xmlNode !== null)
                {
                    var that = this;

                    if (that._vf.url.length && that._vf.url[0].indexOf('\n') == -1)
                    {
                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", that._nameSpace.getURL(that._vf.url[0]), false);
                        xhr.onload = function() {
                            that._vf.url = new x3dom.fields.MFString( [] );
                            that._vf.url.push(xhr.response);
                        };
                        xhr.onerror = function() {
                            x3dom.debug.logError("Could not load file '" + that._vf.url[0] + "'.");
                        };
                        //xhr.send(null);
                        x3dom.RequestManager.addRequest( xhr );
                    }
                    else
                    {
                        if (that._vf.url.length) {
                            that._vf.url = new x3dom.fields.MFString( [] );
                        }
                        try {
                            that._vf.url.push(ctx.xmlNode.childNodes[1].nodeValue);
                            ctx.xmlNode.removeChild(ctx.xmlNode.childNodes[1]);
                        }
                        catch(e) {
                            Array.forEach( ctx.xmlNode.childNodes, function (childDomNode) {
                                if (childDomNode.nodeType === 3) {
                                    that._vf.url.push(childDomNode.nodeValue);
                                }
                                else if (childDomNode.nodeType === 4) {
                                    that._vf.url.push(childDomNode.data);
                                }
                                childDomNode.parentNode.removeChild(childDomNode);
                            } );
                        }
                    }
                }
                if (fieldName === "url") {
                    Array.forEach(this._parentNodes, function (parent) {
                        parent.fieldChanged("url");
                    });
                }

                Array.forEach(this._parentNodes, function (app) {
                    Array.forEach(app._parentNodes, function (parent) {
                        if (parent._cleanupGLObjects)
                            parent._cleanupGLObjects();
                        parent.setAllDirty();
                    });
                });
            },

            fieldChanged: function(fieldName)
            {
                var i, n = this._cf.fields.nodes.length;

                for (i=0; i<n; i++)
                {
                    var field = this._cf.fields.nodes[i]._vf.name;

                    if (field === fieldName)
                    {
                        var msg = this._cf.fields.nodes[i]._vf.value;

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
                                x3dom.debug.logError("setValueByStr() NYI for " + typeof(this._vf[field]));
                            }
                        }

                        break;
                    }
                }

                if (fieldName === "url") {
                    Array.forEach(this._parentNodes, function (parent) {
                        parent.fieldChanged("url");
                    });
                }
            },

            parentAdded: function(parent)
            {
                parent.nodeChanged();
            }
        }
    )
);
