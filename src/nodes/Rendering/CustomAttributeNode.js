/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */
/* ### CustomAttributeNode ### */
x3dom.registerNodeType(
    "CustomAttributeNode",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,

        /**
         * Constructor for CustomAttributNode
         * @constructs x3dom.nodeTypes.CustomAttributNode
         * @x3d 3.2
         * @component Rendering
         * @status ?
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The threshold field allows to hide part of the mesh.
         * The hidden part is when the given is are higer or lower
         * than a given value
         */
        function (ctx) {
            x3dom.nodeTypes.CustomAttributeNode.superClass.call(this, ctx);
            /**
             * List of uniforms for the shaders
             * @var {x3dom.fields.MFNode} uniforms
             * @memberof x3dom.nodeTypes.X3DComposedGeometryNode
             * @initvalue x3dom.nodeTypes.X3DVertexAttributeNode
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('uniforms', x3dom.nodeTypes.Uniform);


            this.addField_MFNode('varyings', x3dom.nodeTypes.Varying);

            /**
             * Part of the vertex shaders main
             * @var {x3dom.fields.SFString} type
             * @memberof x3dom.nodeTypes.Field
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'vertexShaderPartMain', "");

            /**
             * Part of the fragment shaders main
             * @var {x3dom.fields.SFString} type
             * @memberof x3dom.nodeTypes.Field
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'fragmentShaderPartMain', "");

        },{
            get: function(name){
                return this._vf[name];
            },
            addUniform: function(name, value , type){
                if  (this._cf.uniforms == undefined)
                    this._cf.uniforms = new x3dom.fields.MFNode(x3dom.nodeTypes.Uniform);
                var uniform = new x3dom.nodeTypes.Uniform();
                uniform._vf.name = name;
                uniform._vf.type = type;
                uniform._vf.value = value;
                this._cf.uniforms.nodes.push(uniform);
            },
            addVarying: function(name, type){
                if  (this._cf.varyings == undefined)
                    this._cf.varyings = new x3dom.fields.MFNode(x3dom.nodeTypes.Varying);
                var varying = new x3dom.nodeTypes.Varying();
                varying._vf.name = name;
                varying._vf.type = type;
                this._cf.varyings.nodes.push(varying);
            },
            addVertexShaderPart(string){
                this._vf.vertexShaderPartMain = string;
            },
            addFragmentShaderPart(string){
                this._vf.fragmentShaderPartMain = string;
            },
            attributeNameChanged(name){
                var dataName = this._vf[name];
                var i, n, shape, sp, nbAttr;
                Array.forEach(this._parentNodes, function (geonode) {
                    for (i=0, n = geonode._parentNodes.length; i<n; i++) {
                        shape = geonode._parentNodes[i];
                        shape._dirty.shader = true;
                        sp = shape._webgl.shader;
                        // If the shader program don't have the webgl buffer: create it
                        if (!sp[geonode._cf.threshold.node._vf.dataName]) {
                            setUpWebglBuffer(shape, geonode);
                        }
                    }
                });
            },
            updateUniform(fieldName, uniformName){
                var node = this._cf.uniforms.nodes.find(
                    function(a){return a._vf.name == uniformName;}
                );
                if (node){
                    node._vf.value = this._vf[fieldName];
                    node.fieldChanged("value");
                }
            }
        }
    )
);

function setUpWebglBuffer(shape, geonode){
    var x3dElem = document.getElementsByTagName("x3d")[0];
    var gl = x3dElem.runtime.canvas.gl.ctx3d;
    var attribName = geonode._cf.threshold.node._vf.dataName;
    var attribs = new Float32Array(
        geonode._mesh._dynamicFields[attribName].value);
    var attribWebGLNode = shape._webgl.dynamicFields.find(
        function(a){ return a.name == attribName;});
    attribWebGLNode.buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, attribWebGLNode.buf);
    gl.bufferData(gl.ARRAY_BUFFER, attribs, gl.STATIC_DRAW);
}
