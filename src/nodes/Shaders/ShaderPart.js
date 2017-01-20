/** @namespace x3dom.nodeTypes */
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
        
        /**
         * Constructor for ShaderPart
         * @constructs x3dom.nodeTypes.ShaderPart
         * @x3d 3.3
         * @component Shaders
         * @status full
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The ShaderPart node defines the source for a single object to be used by a ComposedShader node.
         *  The source is not required to be a complete shader for all of the vertex/fragment processing.
         */
        function (ctx) {
            x3dom.nodeTypes.ShaderPart.superClass.call(this, ctx);


            /**
             * The shader source is read from the URL specified by the url field. When the url field contains no values
             *  ([]), this object instance is ignored.
             * @var {x3dom.fields.MFString} url
             * @memberof x3dom.nodeTypes.ShaderPart
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'url', []);

            /**
             * The type field indicates whether this object shall be compiled as a vertex shader, fragment shader, or
             *  other future-defined shader type.
             * @var {x3dom.fields.SFString} type
             * @memberof x3dom.nodeTypes.ShaderPart
             * @initvalue "VERTEX"
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'type', "VERTEX");

            this._id = (ctx && ctx.xmlNode && ctx.xmlNode.id != "") ?
                ctx.xmlNode.id : ++x3dom.nodeTypes.Shape.shaderPartID;

            x3dom.debug.assert(this._vf.type.toLowerCase() == 'vertex' ||
                               this._vf.type.toLowerCase() == 'fragment',
                               "Unknown shader part type!");
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
