/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// TODO; use GeneratedCubeMapTexture and move GLSL code to src/shader/ for integration!
/* ### MirrorTexture ### */
x3dom.registerNodeType(
    "MirrorTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.MultiTexture,
        
        /**
         * Constructor for MirrorTexture
         * @constructs x3dom.nodeTypes.MirrorTexture
         * @x3d x.x
         * @component Texturing
         * @extends x3dom.nodeTypes.MultiTexture
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.MirrorTexture.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.SFNode} viewpoint
             * @memberof x3dom.nodeTypes.MirrorTexture
             * @initvalue x3dom.nodeTypes.X3DViewpointNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('viewpoint', x3dom.nodeTypes.X3DViewpointNode);

            /**
             *
             * @var {x3dom.fields.SFNode} background
             * @memberof x3dom.nodeTypes.MirrorTexture
             * @initvalue x3dom.nodeTypes.X3DBackgroundNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('background', x3dom.nodeTypes.X3DBackgroundNode);

            /**
             *
             * @var {x3dom.fields.SFVec3f} viewOffset
             * @memberof x3dom.nodeTypes.MirrorTexture
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'viewOffset', 0, 0, 0);

            /**
             *
             * @var {x3dom.fields.SFFloat} mirrorScale
             * @memberof x3dom.nodeTypes.MirrorTexture
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'mirrorScale', 1.0);

            this._faceRTs = [
                new x3dom.nodeTypes.MirrorRenderedTexture(ctx),
                new x3dom.nodeTypes.MirrorRenderedTexture(ctx),
                new x3dom.nodeTypes.MirrorRenderedTexture(ctx),
                new x3dom.nodeTypes.MirrorRenderedTexture(ctx),
                new x3dom.nodeTypes.MirrorRenderedTexture(ctx),
                new x3dom.nodeTypes.MirrorRenderedTexture(ctx)
            ];

            this.samplerFields = [
                new x3dom.nodeTypes.Field(ctx),
                new x3dom.nodeTypes.Field(ctx),
                new x3dom.nodeTypes.Field(ctx),
                new x3dom.nodeTypes.Field(ctx),
                new x3dom.nodeTypes.Field(ctx),
                new x3dom.nodeTypes.Field(ctx)
            ];

            this.scaleField = new x3dom.nodeTypes.Field(ctx);
        
        },
        {
            // nodeChanged is called after subtree is parsed and attached in DOM
            nodeChanged: function() {
                if (!this.size())
                {
                    // Orientations for each direction of the cube map
                    // 0 - front, 1 - left, 2 - back, 3 - right, 4 - up, 5 - down
                    var orientations = [
                        [0.0, 1.0, 0.0, 0.0],
                        [0.0, 1.0, 0.0, Math.PI/2],
                        [0.0, 1.0, 0.0, Math.PI],
                        [0.0, 1.0, 0.0, 3*Math.PI/2],
                        [1.0, 0.0, 0.0, Math.PI/2],
                        [1.0, 0.0, 0.0, 3*Math.PI/2]
                    ];

                    // Initialize RenderedTextures for each face of the cube
                    for (var i = 0; i < this._faceRTs.length; i++)
                    {
                        this._faceRTs[i]._nameSpace = this._nameSpace;
                        this._faceRTs[i]._vf.update = 'always';
                        this._faceRTs[i]._vf.dimensions = [1024, 1024, 2];  // make dynamic!
                        this._faceRTs[i]._vf.repeatS = false;
                        this._faceRTs[i]._vf.repeatT = false;
                        this._faceRTs[i]._vf.viewOffset = this._vf.viewOffset;

                        var vp = new x3dom.nodeTypes.Viewpoint();

                        vp._nameSpace = this._nameSpace;
                        vp._vf.position = new x3dom.fields.SFVec3f(0.0, 0.0, 0.0);
                        vp.fieldChanged("position");
                        vp._vf.orientation = x3dom.fields.Quaternion.axisAngle(
                            new x3dom.fields.SFVec3f(
                                orientations[i][0],
                                orientations[i][1],
                                orientations[i][2]
                            ),
                            orientations[i][3]
                        );
                        vp.fieldChanged("orientation");
                        vp._vf.fieldOfView = 1.570796;
                        vp.fieldChanged("fieldOfView");
                        vp._vf.zNear = 0.1;         // make dynamic
                        vp.fieldChanged("zNear");
                        vp._vf.zFar = 5000.0;       // make dynamic
                        vp.fieldChanged("zFar");

                        this._faceRTs[i].addChild(vp, 'viewpoint');
                        vp.nodeChanged();

                        if(this._cf.background.node) {
                            this._faceRTs[i].addChild(this._cf.background.node, 'background');
                            this._cf.background.node.nodeChanged();
                        }

                        this.addChild(this._faceRTs[i], 'texture');
                        this._faceRTs[i].nodeChanged();

                        // Initialize the corresponding fields for the sampler2D shader-objects
                        this.samplerFields[i]._nameSpace = this._nameSpace;
                        this.samplerFields[i]._vf.name = 'mirror' + i;
                        this.samplerFields[i]._vf.type = 'SFInt32';
                        this.samplerFields[i]._vf.value = i;
                    }

                    this.scaleField._nameSpace = this._nameSpace;
                    this.scaleField._vf.name = 'mirrorScale';
                    this.scaleField._vf.type = 'SFFloat';
                    this.scaleField._vf.value = 1.0;
                    this.scaleField._vf.value = this._vf.mirrorScale;
                    this.scaleField.nodeChanged();
                }
            },

            // FIXME; shaders don't belong here as this either doesn't work together
            // with general appearance settings as well as with Flash backend!
            getVertexShaderCode : function()
            {
                var shader =
                    'attribute vec3 position;\n' +
                    'attribute vec3 normal;\n' +
                    'uniform mat4 worldMatrix;\n' +
                    'uniform mat4 viewMatrixInverse;\n' +
                    'uniform mat4 worldInverseTranspose;\n' +
                    'uniform mat4 modelViewProjectionMatrix;\n' +
                    'varying vec3 norm;\n' +
                    'varying vec3 eye;\n' +
                    'varying float eyeLength;\n' +
                    'void main()\n' +
                    '{\n' +
                    '   vec4 vertex = vec4(position, 1.0);\n' +
                    '   vec4 pos = worldMatrix * vertex;\n' +
                    '   gl_Position = modelViewProjectionMatrix * vertex;\n' +
                    '   eye = (viewMatrixInverse * vec4(0.0,0.0,0.0, 1.0)).xyz - pos.xyz;\n' +
                    '   eyeLength = length(eye);\n' +
                    '   eye = normalize(eye);\n' +
                    '   norm = normalize((worldInverseTranspose * vec4(normal, 0.0)).xyz);\n' +
                    '}\n';

                return shader;
            },

            getFragmentShaderCode : function()
            {
                var shader =
                    "#ifdef GL_FRAGMENT_PRECISION_HIGH\n" +
                    " precision highp float;\n" +
                    "#else\n" +
                    " precision mediump float;\n" +
                    "#endif\n\n" +
                    'varying vec3 norm;\n' +
                    'varying vec3 eye;\n' +
                    'varying float eyeLength;\n' +
                    // 0 - front, 1 - left, 2 - back, 3 - right, 4 - up, 5 - down
                    'uniform sampler2D mirror0;\n' +
                    'uniform sampler2D mirror1;\n' +
                    'uniform sampler2D mirror2;\n' +
                    'uniform sampler2D mirror3;\n' +
                    'uniform sampler2D mirror4;\n' +
                    'uniform sampler2D mirror5;\n' +
                    'uniform float mirrorScale;\n' +
                    '\n' +
                    'vec4 texCUBE(vec3 refl){\n' +
                    '   vec3 reflAbs = abs(refl);\n' +
                    '   vec4 color;\n' +
                    '   float maximum = max(max(reflAbs.x, reflAbs.y),reflAbs.z);\n' +
                    '   float scale = eyeLength / mirrorScale;\n' +
                    '   if(maximum == reflAbs.x) {\n' +
                    '       if(refl.x < 0.0) {\n' +
                    '           color = texture2D(mirror1, 1.0 - (vec2(refl.z/abs(refl.x), (-refl.y) / abs(refl.x)) * scale + 1.0) * 0.5);\n' +
                    '       } else {\n' +
                    '           color = texture2D(mirror3, 1.0 - (vec2((-refl.z)/abs(refl.x), (-refl.y) / abs(refl.x)) * scale + 1.0) * 0.5);\n' +
                    '       }\n' +
                    '   }else if(maximum == reflAbs.y) {\n' +
                    '       if(refl.y < 0.0) {\n' +
                    '           color = texture2D(mirror5, (vec2(refl.x/abs(refl.y), (-refl.z) / abs(refl.y)) * scale + 1.0) * 0.5);\n' +
                    '       } else {\n' +
                    '           color = texture2D(mirror4, (vec2(refl.x/abs(refl.y), (refl.z) / abs(refl.y)) * scale + 1.0) * 0.5);\n' +
                    '       }\n' +
                    '   } else {;\n' +
                    '       if(refl.z < 0.0) {\n' +
                    '           color = texture2D(mirror0, 1.0 - (vec2((-refl.x)/abs(refl.z), (-refl.y) / abs(refl.z)) * scale + 1.0) * 0.5);\n' +
                    '       } else {\n'+
                    '           color = texture2D(mirror2, 1.0 - (vec2((refl.x)/abs(refl.z), (-refl.y) / abs(refl.z)) * scale + 1.0) * 0.5);\n' +
                    '       }\n' +
                    '   }\n' +
                    '   return color;\n' +
                    '}\n' +
                    '\n' +
                    'void main(){\n' +
                    '   vec3 normal = norm;\n' +
                    '   vec3 surfaceToView = eye;\n' +
                    '   vec3 refl = -reflect(surfaceToView, normal);\n' +
                    '   gl_FragColor = texCUBE(refl);\n' +
                    '}\n';

                return shader;
            },

            parentAdded: function(parent)
            {
                if (x3dom.isa(parent, x3dom.nodeTypes.Appearance)) {
                    // Add a mirror shader if the parent node is an appearance.
                    // Create shader
                    var shader = new x3dom.nodeTypes.ComposedShader();
                    shader._nameSpace = this._nameSpace;
                    var vertexShader = new x3dom.nodeTypes.ShaderPart();
                    vertexShader._nameSpace = this._nameSpace;
                    var fragmentShader = new x3dom.nodeTypes.ShaderPart();
                    fragmentShader._nameSpace = this._nameSpace;

                    vertexShader._vf.type = 'vertex';
                    vertexShader._vf.url[0] = this.getVertexShaderCode();
                    shader.addChild(vertexShader, 'parts');
                    vertexShader.nodeChanged();

                    fragmentShader._vf.type = 'fragment';
                    fragmentShader._vf.url[0] = this.getFragmentShaderCode();
                    shader.addChild(fragmentShader, 'parts');
                    fragmentShader.nodeChanged();

                    // Add field for each sampler2D
                    for (var i = 0; i < this.samplerFields.length; i++)
                    {
                        shader.addChild(this.samplerFields[i], 'fields');
                        this.samplerFields[i].nodeChanged();
                    }
                    shader.addChild(this.scaleField);
                    this.scaleField.nodeChanged();

                    parent.addChild(shader, 'shaders');
                    shader.nodeChanged();
                }
            },

            parentRemoved: function(parent)
            {
                if (this._parentNodes.length === 0) {
                    var doc = this.findX3DDoc();

                    for (var i=0, n=doc._nodeBag.renderTextures.length; i<n; i++) {
                        if (doc._nodeBag.renderTextures[i] in this._faceRTs) {
                            doc._nodeBag.renderTextures.splice(i, 1);
                        }
                    }
                }
            }
        }
    )
);