/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### ComposedShader ### */
x3dom.registerNodeType(
    "ComposedShader",
    "Shaders",
    defineClass(x3dom.nodeTypes.X3DShaderNode,
        
        /**
         * Constructor for ComposedShader
         * @constructs x3dom.nodeTypes.ComposedShader
         * @x3d 3.3
         * @component Shaders
         * @status experimental
         * @extends x3dom.nodeTypes.X3DShaderNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The ComposedShader node defines a shader where the individual source files are not individually
         *  programmable. All access to the shading capabilities is defined through a single interface that applies to
         *  all parts.
         */
        function (ctx) {
            x3dom.nodeTypes.ComposedShader.superClass.call(this, ctx);


            /**
             * Contains all fields of shader parts.
             * @var {x3dom.fields.MFNode} fields
             * @memberof x3dom.nodeTypes.ComposedShader
             * @initvalue x3dom.nodeTypes.Field
             * @field x3d
             * @instance
             */
            this.addField_MFNode('fields', x3dom.nodeTypes.Field);

            /**
             * List of shader parts.
             * @var {x3dom.fields.MFNode} parts
             * @memberof x3dom.nodeTypes.ComposedShader
             * @initvalue x3dom.nodeTypes.ShaderPart
             * @field x3d
             * @instance
             */
            this.addField_MFNode('parts', x3dom.nodeTypes.ShaderPart);

            // shortcut to shader parts
            this._vertex = null;
            this._fragment = null;
            
            /**
             * Identifies the ComposedShader by concatenating three strings: a fixed string (for debugging purposes), 
             * the vertex shader URL, and the fragment shader URL.
             * @type {string}
             */
            this._id = null;

            if (!x3dom.nodeTypes.ComposedShader.ShaderInfoMsgShown) {
                x3dom.debug.logInfo("Current ComposedShader node implementation limitations:\n" +
                    "Vertex attributes (if given in the standard X3D fields 'coord', 'color', " +
                    "'normal', 'texCoord'), matrices and texture are provided as follows...\n" +
                    "(see also <a href='http://x3dom.org/x3dom/doc/help/composedShader.html'>" +
                    "http://x3dom.org/x3dom/doc/help/composedShader.html</a>)\n" +
                    "    attribute vec3 position;\n" +
                    "    attribute vec3 normal;\n" +
                    "    attribute vec2 texcoord;\n" +
                    "    attribute vec3 color;\n" +
                    "    uniform mat4 modelViewProjectionMatrix;\n" +
                    "    uniform mat4 modelViewMatrix;\n" +
                    "    uniform mat4 normalMatrix;\n" +
                    "    uniform mat4 viewMatrix;\n" +
                    "    uniform sampler2D tex;\n");
                x3dom.nodeTypes.ComposedShader.ShaderInfoMsgShown = true;
            }
        
        },
        {
           /**
            * Return `url` in canonical form
            * @param {string} A relative or absolute URL
            */
            canonicalUrl: function( url )
            {
              // TODO: Convert to canonical form, preferably absolute form. Not sure of a fast
              // way to convert a url to absolute that doesn't involve bringing in another library
              // or using non-general hacks that involve creating and then deleting DOM elements.
              return url;
            },
            
            /**
             * Calculate the ID of this shader and update _vertex and _fragment.
             */
            updateIdAndPartReferences : function()
            {
                var numVertexParts = 0;
                var numFragmentParts = 0;
                
                var vertexUrl = '';
                var fragmentUrl = '';
              
                var i, n = this._cf.parts.nodes.length;

                for (i=0; i<n; i++)
                {
                    if (this._cf.parts.nodes[i]._vf.type.toLowerCase() == 'vertex') {                      
                        this._vertex = this._cf.parts.nodes[i];
                        vertexUrl = this._vertex.shaderUrl;
                        numVertexParts++;                        
                    }
                    else if (this._cf.parts.nodes[i]._vf.type.toLowerCase() == 'fragment') {
                        this._fragment = this._cf.parts.nodes[i];
                        fragmentUrl = this._fragment.shaderUrl;
                        numFragmentParts++;
                    }
                }   
                
                if( numVertexParts != 1 )
                {
                    x3dom.debug.logError ( 'ComposedShader element has ' 
                      + numVertexParts 
                      + ' vertex shader parts but should have only one.' );                  
                }
                if( numFragmentParts != 1 )
                {
                    x3dom.debug.logError ( 'ComposedShader element has ' 
                      + numFragmentParts 
                      + ' fragment shader parts but should have only one.' );                  
                }                

                this._id = 'ComposedShaderID: ' + this.canonicalUrl( vertexUrl ) + ' - ' + this.canonicalUrl( fragmentUrl );              
            },
            
            nodeChanged: function()
            {
                this.updateIdAndPartReferences();                

                var ctx = {};
                var i, n = this._cf.fields.nodes.length;

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

                Array.forEach(this._parentNodes, function (app) {
                    Array.forEach(app._parentNodes, function (shape) {
                        //shape.setAppDirty();
                        if (shape._cleanupGLObjects)
                            shape._cleanupGLObjects();
                        shape.setAllDirty();
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

                // TODO: Put in code that warns user if she for some reason make a uniform variable named "url,"
                // because this could result in strange behavior due to the following if statement.
                if (fieldName === 'url')
                {
                    // If one of the shader parts' urls has changed, then the id of this 
                    // shader is altered, which will mean loading a different already-compiled                    
                    // shader or fetching a new one from the indicated sources.
                    this.updateIdAndPartReferences();                                    
                  
                    Array.forEach(this._parentNodes, function (app) {
                        Array.forEach(app._parentNodes, function (shape) {
                            shape._dirty.shader = true;
                        });
                    });
                }
            },

            parentAdded: function(parent)
            {
                //Array.forEach(this._parentNodes, function (app) {
                //	app.nodeChanged();
                //});
                parent.nodeChanged();
            }
        }
    )
);

x3dom.nodeTypes.ComposedShader.ShaderInfoMsgShown = false;