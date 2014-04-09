/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### ShaderPart ### */
x3dom.registerNodeType(
    "ShaderPart",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.ShaderPart.superClass.call(this, ctx);

            this.addField_MFString(ctx, 'url', []);
            this.addField_SFString(ctx, 'type', "VERTEX");

            this._id = (ctx && ctx.xmlNode && ctx.xmlNode.id != "") ?
                ctx.xmlNode.id : ++x3dom.nodeTypes.Shape.shaderPartID;

            x3dom.debug.assert(this._vf.type.toLowerCase() == 'vertex' ||
                this._vf.type.toLowerCase() == 'fragment');
        },
        {
            nodeChanged: function()
            {
                var ctx = {};
                ctx.xmlNode = this._xmlNode;

                if (ctx.xmlNode !== undefined && ctx.xmlNode !== null)
                {
                    var that = this;

                    if (that._vf.url.length && that._vf.url[0].indexOf('\n') == -1)
                    {
                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", encodeURI(that._nameSpace.getURL(that._vf.url[0])), false);
                        xhr.onload = function() {
                            that._vf.url = new x3dom.fields.MFString( [] );
                            that._vf.url.push(xhr.response);
                        };
                        xhr.onerror = function() {
                            x3dom.debug.logError("Could not load file '" + that._vf.url[0] + "'.");
                        };
                        xhr.send(null);
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
                // else hope that url field was already set somehow

                Array.forEach(this._parentNodes, function (shader) {
                    shader.nodeChanged();
                });
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName === "url") {
                    Array.forEach(this._parentNodes, function (shader) {
                        shader.fieldChanged("url");
                    });
                }
            },

            parentAdded: function(parent)
            {
                //Array.forEach(this._parentNodes, function (shader) {
                //	shader.nodeChanged();
                //});
                parent.nodeChanged();
            }
        }
    )
);