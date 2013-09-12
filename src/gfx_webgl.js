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


x3dom.gfx_webgl = (function () {

    /*****************************************************************************
     * Context constructor
     *****************************************************************************/
    function Context(ctx3d, canvas, name, x3dElem) {
        this.ctx3d = ctx3d;
        this.canvas = canvas;
        this.name = name;
        this.x3dElem = x3dElem;
        this.IG_PositionBuffer = null;
        this.cache = new x3dom.Cache();
        this.stateManager = new x3dom.StateManager(ctx3d);
        this.activeShader = null;
    }


    /*****************************************************************************
     * Return context name
     *****************************************************************************/
    Context.prototype.getName = function () {
        return this.name;
    };


    /*****************************************************************************
     * Setup the 3D context and init some things
     *****************************************************************************/
    function setupContext(canvas, forbidMobileShaders, forceMobileShaders, tryWebGL2, x3dElem) {
        var validContextNames = ['moz-webgl', 'webkit-3d', 'experimental-webgl', 'webgl'];

        if (tryWebGL2)
            validContextNames = ['experimental-webgl2'].concat(validContextNames);

        var ctx = null;
        // Context creation params
        var ctxAttribs = {
            alpha: true,
            depth: true,
            stencil: true,
            antialias: true,
            premultipliedAlpha: false,
            preserveDrawingBuffer: true
        };

        for (var i = 0; i < validContextNames.length; i++) {
            try {
                ctx = canvas.getContext(validContextNames[i], ctxAttribs);
                if (ctx) {
                    var newCtx = new Context(ctx, canvas, 'webgl', x3dElem);

                    try {
                        //Save CAPS
                        x3dom.caps.VENDOR = ctx.getParameter(ctx.VENDOR);
                        x3dom.caps.VERSION = ctx.getParameter(ctx.VERSION);
                        x3dom.caps.RENDERER = ctx.getParameter(ctx.RENDERER);
                        x3dom.caps.SHADING_LANGUAGE_VERSION = ctx.getParameter(ctx.SHADING_LANGUAGE_VERSION);
                        x3dom.caps.RED_BITS = ctx.getParameter(ctx.RED_BITS);
                        x3dom.caps.GREEN_BITS = ctx.getParameter(ctx.GREEN_BITS);
                        x3dom.caps.BLUE_BITS = ctx.getParameter(ctx.BLUE_BITS);
                        x3dom.caps.ALPHA_BITS = ctx.getParameter(ctx.ALPHA_BITS);
                        x3dom.caps.DEPTH_BITS = ctx.getParameter(ctx.DEPTH_BITS);
                        x3dom.caps.MAX_VERTEX_ATTRIBS = ctx.getParameter(ctx.MAX_VERTEX_ATTRIBS);
                        x3dom.caps.MAX_VERTEX_TEXTURE_IMAGE_UNITS = ctx.getParameter(ctx.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
                        x3dom.caps.MAX_VARYING_VECTORS = ctx.getParameter(ctx.MAX_VARYING_VECTORS);
                        x3dom.caps.MAX_VERTEX_UNIFORM_VECTORS = ctx.getParameter(ctx.MAX_VERTEX_UNIFORM_VECTORS);
                        x3dom.caps.MAX_COMBINED_TEXTURE_IMAGE_UNITS = ctx.getParameter(ctx.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
                        x3dom.caps.MAX_TEXTURE_SIZE = ctx.getParameter(ctx.MAX_TEXTURE_SIZE);
                        x3dom.caps.MAX_TEXTURE_IMAGE_UNITS = ctx.getParameter(ctx.MAX_TEXTURE_IMAGE_UNITS);
                        x3dom.caps.MAX_CUBE_MAP_TEXTURE_SIZE = ctx.getParameter(ctx.MAX_CUBE_MAP_TEXTURE_SIZE);
                        x3dom.caps.COMPRESSED_TEXTURE_FORMATS = ctx.getParameter(ctx.COMPRESSED_TEXTURE_FORMATS);
                        x3dom.caps.MAX_RENDERBUFFER_SIZE = ctx.getParameter(ctx.MAX_RENDERBUFFER_SIZE);
                        x3dom.caps.MAX_VIEWPORT_DIMS = ctx.getParameter(ctx.MAX_VIEWPORT_DIMS);
                        x3dom.caps.ALIASED_LINE_WIDTH_RANGE = ctx.getParameter(ctx.ALIASED_LINE_WIDTH_RANGE);
                        x3dom.caps.ALIASED_POINT_SIZE_RANGE = ctx.getParameter(ctx.ALIASED_POINT_SIZE_RANGE);
                        x3dom.caps.SAMPLES = ctx.getParameter(ctx.SAMPLES);
                        x3dom.caps.FP_TEXTURES = ctx.getExtension("OES_texture_float");
                        x3dom.caps.FPL_TEXTURES = ctx.getExtension("OES_texture_float_linear");
                        x3dom.caps.EXTENSIONS = ctx.getSupportedExtensions();

                        x3dom.debug.logInfo("\nVendor: " + x3dom.caps.VENDOR + ", " +
                            "Renderer: " + x3dom.caps.RENDERER + ", " + "Version: " + x3dom.caps.VERSION + ", " +
                            "ShadingLangV.: " + x3dom.caps.SHADING_LANGUAGE_VERSION
                            + ", MSAA samples: " + x3dom.caps.SAMPLES + "\nExtensions: " + x3dom.caps.EXTENSIONS);

                        x3dom.caps.MOBILE = (function (a) {
                            return (/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
                        })(navigator.userAgent || navigator.vendor || window.opera);

                        // explicitly disable for iPad and the like
                        if (x3dom.caps.RENDERER.indexOf("PowerVR") >= 0 ||
                            navigator.appVersion.indexOf("Mobile") > -1 ||
                            // coarse guess to find out old SM 2.0 hardware (e.g. Intel):
                            x3dom.caps.MAX_VARYING_VECTORS <= 8 ||
                            x3dom.caps.MAX_VERTEX_TEXTURE_IMAGE_UNITS < 2) {
                            x3dom.caps.MOBILE = true;
                        }

                        if (x3dom.caps.MOBILE) {
                            if (forbidMobileShaders) {
                                x3dom.caps.MOBILE = false;
                                x3dom.debug.logWarning("Detected mobile graphics card! " +
                                    "But being forced to desktop shaders which might not work!");
                            }
                            else {
                                x3dom.debug.logWarning("Detected mobile graphics card! " +
                                    "Using low quality shaders without ImageGeometry support!");
                            }
                        }
                        else {
                            if (forceMobileShaders) {
                                x3dom.caps.MOBILE = true;
                                x3dom.debug.logWarning("Detected desktop graphics card! " +
                                    "But being forced to mobile shaders with lower quality!");
                            }
                        }
                    }
                    catch (ex) {
                        x3dom.debug.logWarning(
                            "Your browser probably supports an older WebGL version. " +
                                "Please try the old mobile runtime instead:\n" +
                                "http://www.x3dom.org/x3dom/src_mobile/x3dom.js");
                        newCtx = null;
                    }

                    return newCtx;
                }
            }
            catch (e) {}
        }
        return null;
    }


    /*****************************************************************************
     * Setup GL objects for given shape
     *****************************************************************************/
    Context.prototype.setupShape = function (gl, drawable, viewarea) {
        var q = 0, q5;
        var textures, t;
        var vertices, positionBuffer;
        var indicesBuffer, indexArray;

        var shape = drawable.shape;
        var geoNode = shape._cf.geometry.node;

        if (shape._webgl !== undefined) {
            var needFullReInit = false;

            // TODO; do same for texcoords etc.!
            if (shape._dirty.colors === true &&
                shape._webgl.shader.color === undefined && geoNode._mesh._colors[0].length) {
                // required since otherwise shape._webgl.shader.color stays undefined
                // and thus the wrong shader will be chosen although there are colors
                needFullReInit = true;
            }

            // cleanup vertex buffer objects
            if (needFullReInit && shape._cleanupGLObjects) {
                shape._cleanupGLObjects(true, false);
            }

            //Check for dirty Textures
            if (shape._dirty.texture === true) {
                //Check for Texture add or remove
                if (shape._webgl.texture.length != shape.getTextures().length) {
                    //Delete old Textures
                    for (t = 0; t < shape._webgl.texture.length; ++t) {
                        shape._webgl.texture.pop();
                    }

                    //Generate new Textures
                    textures = shape.getTextures();

                    for (t = 0; t < textures.length; ++t) {
                        shape._webgl.texture.push(new x3dom.Texture(gl, shape._nameSpace.doc, this.cache, textures[t]));
                    }

                    //Set dirty shader
                    shape._dirty.shader = true;

                    //Set dirty texture Coordinates
                    if (shape._webgl.shader.texcoord === undefined)
                        shape._dirty.texcoords = true;
                }
                else {
                    //If someone remove and append at the same time, texture count don't change
                    //and we have to check if all nodes the same as before
                    textures = shape.getTextures();

                    for (t = 0; t < textures.length; ++t) {
                        if (textures[t] === shape._webgl.texture[t].node) {
                            //only update the texture
                            shape._webgl.texture[t].update();
                        }
                        else {
                            //Set texture to null for recreation
                            shape._webgl.texture[t].texture = null;

                            //Set new node
                            shape._webgl.texture[t].node = textures[t];

                            //Update new node
                            shape._webgl.texture[t].update();
                        }
                    }
                }
                shape._dirty.texture = false;
            }

            //Check if we need a new shader
            shape._webgl.shader = this.cache.getShaderByProperties(gl, shape, shape.getShaderProperties(viewarea));


            if (!needFullReInit && shape._webgl.binaryGeometry == 0)    // THINKABOUTME: What about PopGeo & Co.?
            {
                for (q = 0; q < shape._webgl.positions.length; q++)
                {
                    q5 = 5 * q;

                    if (shape._dirty.positions == true || shape._dirty.indexes == true) {
                        if (shape._webgl.shader.position !== undefined) {
                            shape._webgl.indexes[q] = geoNode._mesh._indices[q];

                            gl.deleteBuffer(shape._webgl.buffers[q5]);

                            indicesBuffer = gl.createBuffer();
                            shape._webgl.buffers[q5] = indicesBuffer;

                            indexArray = new Uint16Array(shape._webgl.indexes[q]);

                            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
                            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);

                            indexArray = null;

                            // vertex positions
                            shape._webgl.positions[q] = geoNode._mesh._positions[q];

                            // TODO; don't delete VBO but use glMapBuffer() and DYNAMIC_DRAW
                            gl.deleteBuffer(shape._webgl.buffers[q5 + 1]);

                            positionBuffer = gl.createBuffer();
                            shape._webgl.buffers[q5 + 1] = positionBuffer;

                            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape._webgl.buffers[q5]);

                            vertices = new Float32Array(shape._webgl.positions[q]);

                            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
                            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

                            gl.vertexAttribPointer(shape._webgl.shader.position,
                                geoNode._mesh._numPosComponents,
                                shape._webgl.coordType, false,
                                shape._coordStrideOffset[0], shape._coordStrideOffset[1]);

                            vertices = null;
                        }

                        shape._dirty.positions = false;
                        shape._dirty.indexes = false;
                    }

                    if (shape._dirty.colors == true) {
                        if (shape._webgl.shader.color !== undefined) {
                            shape._webgl.colors[q] = geoNode._mesh._colors[q];

                            gl.deleteBuffer(shape._webgl.buffers[q5 + 4]);

                            colorBuffer = gl.createBuffer();
                            shape._webgl.buffers[q5 + 4] = colorBuffer;

                            colors = new Float32Array(shape._webgl.colors[q]);

                            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                            gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

                            gl.vertexAttribPointer(shape._webgl.shader.color,
                                geoNode._mesh._numColComponents,
                                shape._webgl.colorType, false,
                                shape._colorStrideOffset[0], shape._colorStrideOffset[1]);

                            colors = null;
                        }

                        shape._dirty.colors = false;
                    }

                    if (shape._dirty.normals == true) {
                        if (shape._webgl.shader.normal !== undefined) {
                            shape._webgl.normals[q] = geoNode._mesh._normals[q];

                            gl.deleteBuffer(shape._webgl.buffers[q5 + 2]);

                            normalBuffer = gl.createBuffer();
                            shape._webgl.buffers[q5 + 2] = normalBuffer;

                            normals = new Float32Array(shape._webgl.normals[q]);

                            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
                            gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

                            gl.vertexAttribPointer(shape._webgl.shader.normal,
                                geoNode._mesh._numNormComponents,
                                shape._webgl.normalType, false,
                                shape._normalStrideOffset[0], shape._normalStrideOffset[1]);

                            normals = null;
                        }

                        shape._dirty.normals = false;
                    }

                    if (shape._dirty.texcoords == true) {
                        if (shape._webgl.shader.texcoord !== undefined) {
                            shape._webgl.texcoords[q] = geoNode._mesh._texCoords[q];

                            gl.deleteBuffer(shape._webgl.buffers[q5 + 3]);

                            texCoordBuffer = gl.createBuffer();
                            shape._webgl.buffers[q5 + 3] = texCoordBuffer;

                            texCoords = new Float32Array(shape._webgl.texcoords[q]);

                            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
                            gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

                            gl.vertexAttribPointer(shape._webgl.shader.texCoord,
                                geoNode._mesh._numTexComponents,
                                shape._webgl.texCoordType, false,
                                shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);

                            texCoords = null;
                        }

                        shape._dirty.texcoords = false;
                    }
                }
            }
            else
            {
                // TODO; does not yet work with shared objects
                /*
                var spOld = shape._webgl.shader;
                if (shape._cleanupGLObjects && needFullReInit)
                    shape._cleanupGLObjects(true, false);

                // complete setup is sort of brute force, thus optimize!
                x3dom.BinaryContainerLoader.setupBinGeo(shape, spOld, gl, viewarea, this);
                shape.unsetGeoDirty();
                */
            }

            if (shape._webgl.imageGeometry != 0) {
                for (t = 0; t < shape._webgl.texture.length; ++t) {
                    shape._webgl.texture[t].updateTexture();
                }

                geoNode.unsetGeoDirty();
                shape.unsetGeoDirty();
            }

            if (!needFullReInit) {
                // we're done
                return;
            }
        }
        else if (!(x3dom.isa(geoNode, x3dom.nodeTypes.Text) ||
                   x3dom.isa(geoNode, x3dom.nodeTypes.BinaryGeometry) ||
                   x3dom.isa(geoNode, x3dom.nodeTypes.PopGeometry) ||
                   x3dom.isa(geoNode, x3dom.nodeTypes.BitLODGeometry)) &&
                  (!geoNode || geoNode._mesh._positions[0].length < 1))
        {
            if (x3dom.caps.MAX_VERTEX_TEXTURE_IMAGE_UNITS < 2 &&
                x3dom.isa(geoNode, x3dom.nodeTypes.ImageGeometry)) {
                x3dom.debug.logError("Can't render ImageGeometry nodes with only " +
                    x3dom.caps.MAX_VERTEX_TEXTURE_IMAGE_UNITS +
                    " vertex texture units. Please upgrade your GPU!");
            }
            else {
                x3dom.debug.logError("NO VALID MESH OR NO VERTEX POSITIONS SET!");
            }
            return;
        }

        // we're on init, thus reset all dirty flags
        shape.unsetDirty();

        // dynamically attach clean-up method for GL objects
        if (!shape._cleanupGLObjects)
        {
            shape._cleanupGLObjects = function (force, delGL)
            {
                // FIXME; what if complete tree is removed? Then _parentNodes.length may be greater 0.
                if (this._webgl && ((arguments.length > 0 && force) || this._parentNodes.length == 0))
                {
                    var sp = this._webgl.shader;

                    for (var q = 0; q < this._webgl.positions.length; q++) {
                        var q5 = 5 * q;

                        if (sp.position !== undefined) {
                            gl.deleteBuffer(this._webgl.buffers[q5 + 1]);
                            gl.deleteBuffer(this._webgl.buffers[q5  ]);
                        }

                        if (sp.normal !== undefined) {
                            gl.deleteBuffer(this._webgl.buffers[q5 + 2]);
                        }

                        if (sp.texcoord !== undefined) {
                            gl.deleteBuffer(this._webgl.buffers[q5 + 3]);
                        }

                        if (sp.color !== undefined) {
                            gl.deleteBuffer(this._webgl.buffers[q5 + 4]);
                        }
                    }

                    for (var df = 0; df < this._webgl.dynamicFields.length; df++) {
                        var attrib = this._webgl.dynamicFields[df];

                        if (sp[attrib.name] !== undefined) {
                            gl.deleteBuffer(attrib.buf);
                        }
                    }

                    if (delGL === undefined)
                        delGL = true;

                    if (delGL)
                        delete this._webgl;
                }
            };  // shape._cleanupGLObjects()
        }


        shape._webgl = {
            positions: geoNode._mesh._positions,
            normals: geoNode._mesh._normals,
            texcoords: geoNode._mesh._texCoords,
            colors: geoNode._mesh._colors,
            indexes: geoNode._mesh._indices,
            //indicesBuffer,positionBuffer,normalBuffer,texcBuffer,colorBuffer
            //buffers: [{},{},{},{},{}],
            coordType: gl.FLOAT,
            normalType: gl.FLOAT,
            texCoordType: gl.FLOAT,
            colorType: gl.FLOAT,
            texture: [],
            dirtyLighting: x3dom.Utils.checkDirtyLighting(viewarea),
            imageGeometry: 0,   // 0 := no IG,  1 := indexed IG, -1  := non-indexed IG
            binaryGeometry: 0,  // 0 := no BG,  1 := indexed BG, -1  := non-indexed BG
            popGeometry: 0,     // 0 := no PG,  1 := indexed PG, -1  := non-indexed PG
            bitLODGeometry: 0   // 0 := no BLG, 1 := indexed BLG, -1 := non-indexed BLG
        };

        //Set Textures		
        textures = shape.getTextures();
        for (t = 0; t < textures.length; ++t) {
            shape._webgl.texture.push(new x3dom.Texture(gl, shape._nameSpace.doc, this.cache, textures[t]));
        }

        //Set Shader
        //shape._webgl.shader = this.cache.getDynamicShader(gl, viewarea, shape);
        //shape._webgl.shader = this.cache.getShaderByProperties(gl, drawable.properties);
        shape._webgl.shader = this.cache.getShaderByProperties(gl, shape, shape.getShaderProperties(viewarea));

        // init vertex attribs
        var sp = shape._webgl.shader;
        var currAttribs = 0;

        shape._webgl.buffers = [];
        shape._webgl.dynamicFields = [];

        //Set Geometry Primitive Type
        if (x3dom.isa(geoNode, x3dom.nodeTypes.PointSet) ||
            x3dom.isa(geoNode, x3dom.nodeTypes.Polypoint2D))
        {
            shape._webgl.primType = gl.POINTS;
        }
        else if (x3dom.isa(geoNode, x3dom.nodeTypes.IndexedLineSet) ||
                 x3dom.isa(geoNode, x3dom.nodeTypes.Circle2D) ||
                 x3dom.isa(geoNode, x3dom.nodeTypes.Arc2D) ||
                 x3dom.isa(geoNode, x3dom.nodeTypes.Polyline2D))
        {
            shape._webgl.primType = gl.LINES;
        }
        else if (x3dom.isa(geoNode, x3dom.nodeTypes.IndexedTriangleStripSet) &&
                 geoNode._mesh._primType.toUpperCase() == 'TRIANGLESTRIP')
        {
            shape._webgl.primType = gl.TRIANGLE_STRIP;
        }
        else if (x3dom.isa(geoNode, x3dom.nodeTypes.ImageGeometry) ||
                 x3dom.isa(geoNode, x3dom.nodeTypes.BinaryGeometry) ||
                 x3dom.isa(geoNode, x3dom.nodeTypes.PopGeometry) ||
                 x3dom.isa(geoNode, x3dom.nodeTypes.BitLODGeometry) ||
                 x3dom.isa(geoNode, x3dom.nodeTypes.Plane))
        {
            shape._webgl.primType = [];

            for (var primCnt = 0; primCnt < geoNode._vf.primType.length; ++primCnt)
            {
                switch (geoNode._vf.primType[primCnt].toUpperCase())
                {
                    case 'POINTS':
                        shape._webgl.primType.push(gl.POINTS);
                        break;
                    case 'LINES':
                        shape._webgl.primType.push(gl.LINES);
                        break;
                    case 'TRIANGLESTRIP':
                        shape._webgl.primType.push(gl.TRIANGLE_STRIP);
                        break;
                    case 'TRIANGLES':
                    default:
                        shape._webgl.primType.push(gl.TRIANGLES);
                        break;
                }
            }
        }
        else
        {
            shape._webgl.primType = gl.TRIANGLES;
        }

        // Binary container geometries need special handling
        if (x3dom.isa(geoNode, x3dom.nodeTypes.BinaryGeometry))
        {
            x3dom.BinaryContainerLoader.setupBinGeo(shape, sp, gl, viewarea, this);
        }
        else if (x3dom.isa(geoNode, x3dom.nodeTypes.PopGeometry))
        {
            x3dom.BinaryContainerLoader.setupPopGeo(shape, sp, gl, viewarea, this);
        }
        else if (x3dom.isa(geoNode, x3dom.nodeTypes.BitLODGeometry))
        {
            x3dom.BinaryContainerLoader.setupBitLODGeo(shape, sp, gl, viewarea, this);
        }
        else if (x3dom.isa(geoNode, x3dom.nodeTypes.ImageGeometry))
        {
            x3dom.BinaryContainerLoader.setupImgGeo(shape, sp, gl, viewarea, this);
        }
        else // No special BinaryMesh, but IFS or similar
        {
            for (q = 0; q < shape._webgl.positions.length; q++)
            {
                q5 = 5 * q;

                if (sp.position !== undefined) {
                    // bind indices for drawElements() call
                    indicesBuffer = gl.createBuffer();
                    shape._webgl.buffers[q5] = indicesBuffer;

                    indexArray = new Uint16Array(shape._webgl.indexes[q]);

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);

                    indexArray = null;

                    positionBuffer = gl.createBuffer();
                    shape._webgl.buffers[q5 + 1] = positionBuffer;
                    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

                    vertices = new Float32Array(shape._webgl.positions[q]);

                    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
                    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

                    gl.vertexAttribPointer(sp.position,
                        geoNode._mesh._numPosComponents,
                        shape._webgl.coordType, false,
                        shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.position);

                    vertices = null;
                }
                if (sp.normal !== undefined || shape._webgl.normals[q]) {
                    var normalBuffer = gl.createBuffer();
                    shape._webgl.buffers[q5 + 2] = normalBuffer;

                    var normals = new Float32Array(shape._webgl.normals[q]);

                    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

                    gl.vertexAttribPointer(sp.normal,
                        geoNode._mesh._numNormComponents,
                        shape._webgl.normalType, false,
                        shape._normalStrideOffset[0], shape._normalStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.normal);

                    normals = null;
                }
                if (sp.texcoord !== undefined) {
                    var texcBuffer = gl.createBuffer();
                    shape._webgl.buffers[q5 + 3] = texcBuffer;

                    var texCoords = new Float32Array(shape._webgl.texcoords[q]);

                    gl.bindBuffer(gl.ARRAY_BUFFER, texcBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

                    gl.vertexAttribPointer(sp.texcoord,
                        geoNode._mesh._numTexComponents,
                        shape._webgl.texCoordType, false,
                        shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.texcoord);

                    texCoords = null;
                }
                if (sp.color !== undefined) {
                    var colorBuffer = gl.createBuffer();
                    shape._webgl.buffers[q5 + 4] = colorBuffer;

                    var colors = new Float32Array(shape._webgl.colors[q]);

                    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

                    gl.vertexAttribPointer(sp.color,
                        geoNode._mesh._numColComponents,
                        shape._webgl.colorType, false,
                        shape._colorStrideOffset[0], shape._colorStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.color);

                    colors = null;
                }
            }

            // TODO; FIXME; handle geometry with split mesh that has dynamic fields!
            for (var df in geoNode._mesh._dynamicFields)
            {
                if (!geoNode._mesh._dynamicFields.hasOwnProperty(df))
                    continue;

                var attrib = geoNode._mesh._dynamicFields[df];

                shape._webgl.dynamicFields[currAttribs] = {
                    buf: {}, name: df, numComponents: attrib.numComponents };

                if (sp[df] !== undefined) {
                    var attribBuffer = gl.createBuffer();
                    shape._webgl.dynamicFields[currAttribs++].buf = attribBuffer;

                    var attribs = new Float32Array(attrib.value);

                    gl.bindBuffer(gl.ARRAY_BUFFER, attribBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, attribs, gl.STATIC_DRAW);

                    gl.vertexAttribPointer(sp[df], attrib.numComponents, gl.FLOAT, false, 0, 0);

                    attribs = null;
                }
            }
        } // Standard geometry
    };


    /*****************************************************************************
     * Mainly manages rendering of backgrounds and buffer clearing
     *****************************************************************************/
    Context.prototype.setupScene = function (gl, bgnd) {
        var sphere = null;
        var texture = null;

        var that = this;

        if (bgnd._webgl !== undefined) {
            if (!bgnd._dirty) {
                return;
            }

            if (bgnd._webgl.texture !== undefined && bgnd._webgl.texture) {
                gl.deleteTexture(bgnd._webgl.texture);
            }
            if (bgnd._webgl.shader && bgnd._webgl.shader.position !== undefined) {
                gl.deleteBuffer(bgnd._webgl.buffers[1]);
                gl.deleteBuffer(bgnd._webgl.buffers[0]);
            }
            if (bgnd._webgl.shader && bgnd._webgl.shader.texcoord !== undefined) {
                gl.deleteBuffer(bgnd._webgl.buffers[2]);
            }
            bgnd._webgl = {};
        }

        bgnd._dirty = false;

        var url = bgnd.getTexUrl();
        var i = 0;
        var w = 1, h = 1;

        if (url.length > 0 && url[0].length > 0) {
            if (url.length >= 6 && url[1].length > 0 && url[2].length > 0 &&
                url[3].length > 0 && url[4].length > 0 && url[5].length > 0) {
                sphere = new x3dom.nodeTypes.Sphere();

                bgnd._webgl = {
                    positions: sphere._mesh._positions[0],
                    indexes: sphere._mesh._indices[0],
                    buffers: [
                        {}, {}
                    ]
                };

                bgnd._webgl.primType = gl.TRIANGLES;

                bgnd._webgl.shader = this.cache.getShader(gl, x3dom.shader.BACKGROUND_CUBETEXTURE);

                bgnd._webgl.texture = x3dom.Utils.createTextureCube(gl, bgnd._nameSpace.doc, url,
                    true, bgnd._vf.withCredentials, true);
            }
            else {
                bgnd._webgl = {
                    positions: [-w, -h, 0, -w, h, 0, w, -h, 0, w, h, 0],
                    indexes: [0, 1, 2, 3],
                    buffers: [
                        {}, {}
                    ]
                };

                url = bgnd._nameSpace.getURL(url[0]);

                bgnd._webgl.texture = x3dom.Utils.createTexture2D(gl, bgnd._nameSpace.doc, url,
                    true, bgnd._vf.withCredentials, true);

                bgnd._webgl.primType = gl.TRIANGLE_STRIP;

                bgnd._webgl.shader = this.cache.getShader(gl, x3dom.shader.BACKGROUND_TEXTURE);
            }
        }
        else {
            if (bgnd.getSkyColor().length > 1 || bgnd.getGroundColor().length) {
                sphere = new x3dom.nodeTypes.Sphere();
                texture = gl.createTexture();

                bgnd._webgl = {
                    positions: sphere._mesh._positions[0],
                    texcoords: sphere._mesh._texCoords[0],
                    indexes: sphere._mesh._indices[0],
                    buffers: [
                        {}, {}, {}
                    ],
                    texture: texture,
                    primType: gl.TRIANGLES
                };

                var N = x3dom.Utils.nextHighestPowerOfTwo(
                    bgnd.getSkyColor().length + bgnd.getGroundColor().length + 2);
                N = (N < 512) ? 512 : N;

                var n = bgnd._vf.groundAngle.length;
                var tmp = [], arr = [];
                var colors = [], sky = [0];

                for (i = 0; i < bgnd._vf.skyColor.length; i++) {
                    colors[i] = bgnd._vf.skyColor[i];
                }

                for (i = 0; i < bgnd._vf.skyAngle.length; i++) {
                    sky[i + 1] = bgnd._vf.skyAngle[i];
                }

                if (n > 0 || bgnd._vf.groundColor.length == 1) {
                    if (sky[sky.length - 1] < Math.PI / 2) {
                        sky[sky.length] = Math.PI / 2 - x3dom.fields.Eps;
                        colors[colors.length] = colors[colors.length - 1];
                    }

                    for (i = n - 1; i >= 0; i--) {
                        if ((i == n - 1) && (Math.PI - bgnd._vf.groundAngle[i] <= Math.PI / 2)) {
                            sky[sky.length] = Math.PI / 2;
                            colors[colors.length] = bgnd._vf.groundColor[bgnd._vf.groundColor.length - 1];
                        }
                        sky[sky.length] = Math.PI - bgnd._vf.groundAngle[i];
                        colors[colors.length] = bgnd._vf.groundColor[i + 1];
                    }

                    if (n == 0 && bgnd._vf.groundColor.length == 1) {
                        sky[sky.length] = Math.PI / 2;
                        colors[colors.length] = bgnd._vf.groundColor[0];
                    }
                    sky[sky.length] = Math.PI;
                    colors[colors.length] = bgnd._vf.groundColor[0];
                }
                else {
                    if (sky[sky.length - 1] < Math.PI) {
                        sky[sky.length] = Math.PI;
                        colors[colors.length] = colors[colors.length - 1];
                    }
                }

                for (i = 0; i < sky.length; i++) {
                    sky[i] /= Math.PI;
                }

                x3dom.debug.assert(sky.length == colors.length);

                var interp = new x3dom.nodeTypes.ColorInterpolator();

                interp._vf.key = new x3dom.fields.MFFloat(sky);
                interp._vf.keyValue = new x3dom.fields.MFColor(colors);

                for (i = 0; i < N; i++) {
                    interp._vf.set_fraction = i / (N - 1.0);

                    interp.fieldChanged("set_fraction");
                    tmp[i] = interp._vf.value_changed;
                }

                tmp.reverse();

                for (i = 0; i < tmp.length; i++) {
                    arr[3 * i + 0] = Math.floor(tmp[i].r * 255);
                    arr[3 * i + 1] = Math.floor(tmp[i].g * 255);
                    arr[3 * i + 2] = Math.floor(tmp[i].b * 255);
                }

                var pixels = new Uint8Array(arr);
                var format = gl.RGB;

                N = (pixels.length) / 3;

                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

                gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
                gl.texImage2D(gl.TEXTURE_2D, 0, format, 1, N, 0, format, gl.UNSIGNED_BYTE, pixels);
                gl.bindTexture(gl.TEXTURE_2D, null);

                bgnd._webgl.shader = this.cache.getShader(gl, x3dom.shader.BACKGROUND_SKYTEXTURE);
            }
            else {
                // TODO; impl. gradient bg etc., e.g. via canvas 2d?
                bgnd._webgl = {};
            }
        }

        if (bgnd._webgl.shader) {
            var sp = bgnd._webgl.shader;

            var positionBuffer = gl.createBuffer();
            bgnd._webgl.buffers[1] = positionBuffer;
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

            var vertices = new Float32Array(bgnd._webgl.positions);

            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

            gl.vertexAttribPointer(sp.position, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(sp.position);

            var indicesBuffer = gl.createBuffer();
            bgnd._webgl.buffers[0] = indicesBuffer;

            var indexArray = new Uint16Array(bgnd._webgl.indexes);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);

            vertices = null;
            indexArray = null;

            if (sp.texcoord !== undefined) {
                var texcBuffer = gl.createBuffer();
                bgnd._webgl.buffers[2] = texcBuffer;

                var texcoords = new Float32Array(bgnd._webgl.texcoords);

                gl.bindBuffer(gl.ARRAY_BUFFER, texcBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);

                gl.vertexAttribPointer(sp.texcoord, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(sp.texcoord);

                texcoords = null;
            }
        }

        bgnd._webgl.render = function (gl, mat_view, mat_proj)
        {
            var sp = bgnd._webgl.shader;
            var mat_scene = null;
            var projMatrix_22 = mat_proj._22,
                projMatrix_23 = mat_proj._23;
            var camPos = mat_view.e3();

            if ((sp !== undefined && sp !== null) &&
                (sp.texcoord !== undefined && sp.texcoord !== null) &&
                (bgnd._webgl.texture !== undefined && bgnd._webgl.texture !== null)) {
                gl.clearDepth(1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

                that.stateManager.frontFace(gl.CCW);
                that.stateManager.disable(gl.CULL_FACE);
                that.stateManager.disable(gl.DEPTH_TEST);
                that.stateManager.disable(gl.BLEND);

                that.stateManager.useProgram(sp);

                if (!sp.tex) {
                    sp.tex = 0;
                }
                sp.alpha = 1.0;

                // adapt projection matrix to better near/far
                mat_proj._22 = 100001 / 99999;
                mat_proj._23 = 200000 / 99999;
                // center viewpoint
                mat_view._03 = 0;
                mat_view._13 = 0;
                mat_view._23 = 0;

                mat_scene = mat_proj.mult(mat_view);
                sp.modelViewProjectionMatrix = mat_scene.toGL();

                mat_view._03 = camPos.x;
                mat_view._13 = camPos.y;
                mat_view._23 = camPos.z;

                mat_proj._22 = projMatrix_22;
                mat_proj._23 = projMatrix_23;

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, bgnd._webgl.texture);

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bgnd._webgl.buffers[0]);

                gl.bindBuffer(gl.ARRAY_BUFFER, bgnd._webgl.buffers[1]);
                gl.vertexAttribPointer(sp.position, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(sp.position);

                gl.bindBuffer(gl.ARRAY_BUFFER, bgnd._webgl.buffers[2]);
                gl.vertexAttribPointer(sp.texcoord, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(sp.texcoord);

                gl.drawElements(bgnd._webgl.primType, bgnd._webgl.indexes.length, gl.UNSIGNED_SHORT, 0);

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, null);

                gl.disableVertexAttribArray(sp.position);
                gl.disableVertexAttribArray(sp.texcoord);

                gl.clear(gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
            }
            else if (!sp || !bgnd._webgl.texture ||
                (bgnd._webgl.texture.textureCubeReady !== undefined &&
                    bgnd._webgl.texture.textureCubeReady !== true)) {
                var bgCol = bgnd.getSkyColor().toGL();
                bgCol[3] = 1.0 - bgnd.getTransparency();

                gl.clearColor(bgCol[0], bgCol[1], bgCol[2], bgCol[3]);
                gl.clearDepth(1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
            }
            else {
                gl.clearDepth(1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

                that.stateManager.frontFace(gl.CCW);
                that.stateManager.disable(gl.CULL_FACE);
                that.stateManager.disable(gl.DEPTH_TEST);
                that.stateManager.disable(gl.BLEND);

                that.stateManager.useProgram(sp);

                if (!sp.tex) {
                    sp.tex = 0;
                }

                if (bgnd._webgl.texture.textureCubeReady) {
                    // adapt projection matrix to better near/far
                    mat_proj._22 = 100001 / 99999;
                    mat_proj._23 = 200000 / 99999;
                    // center viewpoint
                    mat_view._03 = 0;
                    mat_view._13 = 0;
                    mat_view._23 = 0;

                    mat_scene = mat_proj.mult(mat_view);
                    sp.modelViewProjectionMatrix = mat_scene.toGL();

                    mat_view._03 = camPos.x;
                    mat_view._13 = camPos.y;
                    mat_view._23 = camPos.z;

                    mat_proj._22 = projMatrix_22;
                    mat_proj._23 = projMatrix_23;

                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, bgnd._webgl.texture);

                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                }
                else {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, bgnd._webgl.texture);

                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                }

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bgnd._webgl.buffers[0]);
                gl.bindBuffer(gl.ARRAY_BUFFER, bgnd._webgl.buffers[1]);
                gl.vertexAttribPointer(sp.position, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(sp.position);

                gl.drawElements(bgnd._webgl.primType, bgnd._webgl.indexes.length, gl.UNSIGNED_SHORT, 0);

                gl.disableVertexAttribArray(sp.position);

                if (bgnd._webgl.texture.textureCubeReady) {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
                }
                else {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                }

                gl.clear(gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
            }
        };
    };


    /*****************************************************************************
     * Setup Frontgrounds
     *****************************************************************************/
    Context.prototype.setupFgnds = function (gl, scene) {
        if (scene._fgnd !== undefined) {
            return;
        }

        var that = this;

        var w = 1, h = 1;
        scene._fgnd = {};

        scene._fgnd._webgl = {
            positions: [-w, -h, 0, -w, h, 0, w, -h, 0, w, h, 0],
            indexes: [0, 1, 2, 3],
            buffers: [
                {}, {}
            ]
        };

        scene._fgnd._webgl.primType = gl.TRIANGLE_STRIP;

        scene._fgnd._webgl.shader = this.cache.getShader(gl, x3dom.shader.FRONTGROUND_TEXTURE);

        var sp = scene._fgnd._webgl.shader;

        var positionBuffer = gl.createBuffer();
        scene._fgnd._webgl.buffers[1] = positionBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        var vertices = new Float32Array(scene._fgnd._webgl.positions);

        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        gl.vertexAttribPointer(sp.position, 3, gl.FLOAT, false, 0, 0);

        var indicesBuffer = gl.createBuffer();
        scene._fgnd._webgl.buffers[0] = indicesBuffer;

        var indexArray = new Uint16Array(scene._fgnd._webgl.indexes);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);

        vertices = null;
        indexArray = null;

        scene._fgnd._webgl.render = function (gl, tex) {
            scene._fgnd._webgl.texture = tex;

            that.stateManager.frontFace(gl.CCW);
            that.stateManager.disable(gl.CULL_FACE);
            that.stateManager.disable(gl.DEPTH_TEST);

            that.stateManager.useProgram(sp);

            if (!sp.tex) {
                sp.tex = 0;
            }

            //this.stateManager.enable(gl.TEXTURE_2D);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, scene._fgnd._webgl.texture);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scene._fgnd._webgl.buffers[0]);
            gl.bindBuffer(gl.ARRAY_BUFFER, scene._fgnd._webgl.buffers[1]);
            gl.vertexAttribPointer(sp.position, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(sp.position);

            gl.drawElements(scene._fgnd._webgl.primType, scene._fgnd._webgl.indexes.length, gl.UNSIGNED_SHORT, 0);

            gl.disableVertexAttribArray(sp.position);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, null);
            //this.stateManager.disable(gl.TEXTURE_2D);
        };
    };


    /*****************************************************************************
     * Render Shadow-Pass
     *****************************************************************************/
    Context.prototype.renderShadowPass = function (gl, viewarea, mat_scene, mat_view, targetFbo, offset, isCameraView)
    {
        var scene = viewarea._scene;
        var sp = scene._webgl.shadowShader;

        this.stateManager.bindFramebuffer(gl.FRAMEBUFFER, targetFbo.fbo);
        this.stateManager.viewport(0, 0, targetFbo.width, targetFbo.height);

        this.stateManager.useProgram(sp);

        sp.cameraView = isCameraView;
        sp.offset = offset;

        gl.clearColor(1.0, 1.0, 1.0, 0.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.stateManager.depthFunc(gl.LEQUAL);
        this.stateManager.enable(gl.DEPTH_TEST);
        this.stateManager.enable(gl.CULL_FACE);
        this.stateManager.disable(gl.BLEND);

        var bgCenter = new x3dom.fields.SFVec3f(0, 0, 0).toGL();
        var bgSize = new x3dom.fields.SFVec3f(1, 1, 1).toGL();

        var i, n = scene.drawableCollection.length;

        for (i = 0; i < n; i++) {
            var drawable = scene.drawableCollection.get(i);
            var trafo = drawable.transform;
            var shape = drawable.shape;

            var s_gl = shape._webgl;

            if (!s_gl) {
                continue;
            }

            var s_geo = shape._cf.geometry.node;
            var s_msh = s_geo._mesh;

            sp.modelViewProjectionMatrix = mat_scene.mult(trafo).toGL();

            //Set ImageGeometry switch
            sp.imageGeometry = s_gl.imageGeometry;
            sp.popGeometry = s_gl.popGeometry;

            if (s_gl.coordType != gl.FLOAT) {
                if (s_gl.bitLODGeometry != 0 || s_gl.popGeometry != 0 ||
                    (s_msh._numPosComponents == 4 && x3dom.Utils.isUnsignedType(s_geo._vf.coordType))) {
                    sp.bgCenter = s_geo.getMin().toGL();
                }
                else {
                    sp.bgCenter = s_geo._vf.position.toGL();
                }
                sp.bgSize = s_geo._vf.size.toGL();
                sp.bgPrecisionMax = s_geo.getPrecisionMax('coordType');
            }
            else {
                sp.bgCenter = bgCenter;
                sp.bgSize = bgSize;
                sp.bgPrecisionMax = 1;
            }

            if (s_gl.colorType != gl.FLOAT) {
                sp.bgPrecisionColMax = s_geo.getPrecisionMax('colorType');
            }

            if (s_gl.texCoordType != gl.FLOAT) {
                sp.bgPrecisionTexMax = s_geo.getPrecisionMax('texCoordType');
            }

            if (s_gl.imageGeometry != 0 && !x3dom.caps.MOBILE)  // FIXME: mobile errors
            {
                sp.IG_bboxMin = s_geo.getMin().toGL();
                sp.IG_bboxMax = s_geo.getMax().toGL();
                sp.IG_implicitMeshSize = s_geo._vf.implicitMeshSize.toGL();  // FIXME

                var coordTex = x3dom.Utils.findTextureByName(s_gl.texture, "IG_coords0");
                if (coordTex) {
                    sp.IG_coordTextureWidth = coordTex.texture.width;
                    sp.IG_coordTextureHeight = coordTex.texture.height;
                }

                if (s_gl.imageGeometry == 1) {
                    var indexTex = x3dom.Utils.findTextureByName(s_gl.texture, "IG_index");
                    if (indexTex) {
                        sp.IG_indexTextureWidth = indexTex.texture.width;
                        sp.IG_indexTextureHeight = indexTex.texture.height;
                    }

                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, indexTex.texture);

                    gl.activeTexture(gl.TEXTURE1);
                    gl.bindTexture(gl.TEXTURE_2D, coordTex.texture);
                }
                else {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, coordTex.texture);
                }

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

                var texUnit = 0;
                if (s_geo.getIndexTexture()) {
                    if (!sp.IG_indexTexture) {
                        sp.IG_indexTexture = texUnit++;
                    }
                }

                if (s_geo.getCoordinateTexture(0)) {
                    if (!sp.IG_coordinateTexture) {
                        sp.IG_coordinateTexture = texUnit++;
                    }
                }
            }

            //PopGeometry: adapt LOD and set shader variables
            if (s_gl.popGeometry) {
                var model_view = mat_view.mult(trafo);
                this.updatePopState(drawable, s_geo, sp, s_gl, scene, model_view, viewarea, this.x3dElem.runtime.fps);
            }


            //== end== code stolen from picking pass
            for (var q = 0, q_n = s_gl.positions.length; q < q_n; q++) {
                var q5 = 5 * q;
                var v, v_n, off;

                if (s_gl.buffers[q5]) {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, s_gl.buffers[q5]);
                }
                if (sp.position !== undefined && s_gl.buffers[q5 + 1]) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q5 + 1]);

                    gl.vertexAttribPointer(sp.position,
                        s_msh._numPosComponents, s_gl.coordType, false,
                        shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.position);
                }

                if (s_gl.popGeometry !== 0 && s_gl.buffers[q5 + 5]) {
                    //special case: mimic gl_VertexID
                    gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q5 + 5]);

                    gl.vertexAttribPointer(sp.PG_vertexID, 1, gl.FLOAT, false, 4, 0);
                    gl.enableVertexAttribArray(sp.PG_vertexID);
                }

                if (shape.isSolid()) {
                    this.stateManager.enable(gl.CULL_FACE);

                    if (shape.isCCW()) {
                        this.stateManager.frontFace(gl.CCW);
                    }
                    else {
                        this.stateManager.frontFace(gl.CW);
                    }
                }
                else {
                    this.stateManager.disable(gl.CULL_FACE);
                }

                if (s_gl.indexes && s_gl.indexes[q5]) {
                    if (s_gl.imageGeometry != 0 || s_gl.binaryGeometry < 0 || s_gl.popGeometry < 0 || s_gl.bitLODGeometry < 0) {
                        if (s_gl.bitLODGeometry != 0 && s_geo._vf.normalPerVertex === false) {
                            var totalVertexCount = 0;
                            for (v = 0, v_n = s_geo._vf.vertexCount.length; v < v_n; v++) {
                                if (s_gl.primType[v] == gl.TRIANGLES) {
                                    totalVertexCount += s_geo._vf.vertexCount[v];
                                }
                                else if (s_gl.primType[v] == gl.TRIANGLE_STRIP) {
                                    totalVertexCount += (s_geo._vf.vertexCount[v] - 2) * 3;
                                }
                            }
                            gl.drawArrays(gl.TRIANGLES, 0, totalVertexCount);
                        }
                        else {
                            for (v = 0, off = 0, v_n = s_geo._vf.vertexCount.length; v < v_n; v++) {
                                gl.drawArrays(s_gl.primType[v], off, s_geo._vf.vertexCount[v]);
                                off += s_geo._vf.vertexCount[v];
                            }
                        }
                    }
                    else if (s_gl.binaryGeometry > 0 || s_gl.popGeometry > 0 || s_gl.bitLODGeometry > 0) {
                        for (v = 0, off = 0, v_n = s_geo._vf.vertexCount.length; v < v_n; v++) {
                            gl.drawElements(s_gl.primType[v], s_geo._vf.vertexCount[v], gl.UNSIGNED_SHORT, 2 * off);
                            off += s_geo._vf.vertexCount[v];
                        }
                    }
                    else if (s_geo.hasIndexOffset()) {
                        // IndexedTriangleStripSet with primType TRIANGLE_STRIP,
                        // and Patch geometry from external BVHRefiner component
                        var indOff = shape.tessellationProperties();
                        for (v = 0, v_n = indOff.length; v < v_n; v++) {
                            gl.drawElements(s_gl.primType, indOff[v].count, gl.UNSIGNED_SHORT, indOff[v].offset);
                        }
                    }
                    else {
                        gl.drawElements(s_gl.primType, s_gl.indexes[q5].length, gl.UNSIGNED_SHORT, 0);
                    }
                }

                //Clean Texture units for IG
                if (s_gl.imageGeometry != 0 && !x3dom.caps.MOBILE) {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                    if (s_gl.imageGeometry == 1) {
                        gl.activeTexture(gl.TEXTURE1);
                        gl.bindTexture(gl.TEXTURE_2D, null);
                    }
                }

                if (sp.position !== undefined && s_gl.buffers[q5 + 1]) {
                    gl.disableVertexAttribArray(sp.position);
                }
            }
        }

        gl.flush();
        this.stateManager.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    /*****************************************************************************
     * Render Picking-Pass
     *****************************************************************************/
    Context.prototype.renderPickingPass = function (gl, scene, mat_view, mat_scene, from, sceneSize,
                                                    pickMode, lastX, lastY, width, height)
    {
        this.stateManager.bindFramebuffer(gl.FRAMEBUFFER, scene._webgl.fboPick.fbo);

        this.stateManager.viewport(0, 0, scene._webgl.fboPick.width, scene._webgl.fboPick.height);

        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.stateManager.depthFunc(gl.LEQUAL);
        this.stateManager.enable(gl.DEPTH_TEST);
        this.stateManager.enable(gl.CULL_FACE);
        this.stateManager.disable(gl.BLEND);

        var sp = null;

        switch (pickMode) {
            case 0:
                sp = scene._webgl.pickShader;
                break;
            case 1:
                sp = scene._webgl.pickColorShader;
                break;
            case 2:
                sp = scene._webgl.pickTexCoordShader;
                break;
            case 3:
                sp = scene._webgl.pickShader24;
                break;
            case 4:
                sp = scene._webgl.pickShaderId;
                break;
            default:
                break;
        }

        if (!sp) {  // error
            return;
        }

        this.stateManager.useProgram(sp);

        var bgCenter = new x3dom.fields.SFVec3f(0, 0, 0).toGL();
        var bgSize = new x3dom.fields.SFVec3f(1, 1, 1).toGL();

        gl.lineWidth(2);    // bigger lines for better picking

        for (var i = 0, n = scene.drawableCollection.length; i < n; i++) {
            var drawable = scene.drawableCollection.get(i);
            var trafo = drawable.transform;
            var shape = drawable.shape;
            var s_gl = shape._webgl;

            if (shape._objectID < 1 || !s_gl || !shape._vf.isPickable) {
                continue;
            }

            var s_geo = shape._cf.geometry.node;
            var s_msh = s_geo._mesh;

            sp.modelMatrix = trafo.toGL();
            sp.modelViewProjectionMatrix = mat_scene.mult(trafo).toGL();

            sp.lowBit = (shape._objectID & 255) / 255.0;
            sp.highBit = (shape._objectID >>> 8) / 255.0;

            sp.from = from.toGL();
            sp.sceneSize = sceneSize;

            //Set ImageGeometry switch
            sp.imageGeometry = s_gl.imageGeometry;

            // Set IDs perVertex switch
            sp.writeShadowIDs = (s_gl.binaryGeometry != 0 && s_geo._vf.idsPerVertex) ?
                (x3dom.nodeTypes.Shape.objectID + 2) : 0;

            if (s_gl.coordType != gl.FLOAT) {
                if (s_gl.bitLODGeometry != 0 || s_gl.popGeometry != 0 ||
                    (s_msh._numPosComponents == 4 && x3dom.Utils.isUnsignedType(s_geo._vf.coordType)))
                    sp.bgCenter = s_geo.getMin().toGL();
                else
                    sp.bgCenter = s_geo._vf.position.toGL();
                sp.bgSize = s_geo._vf.size.toGL();
                sp.bgPrecisionMax = s_geo.getPrecisionMax('coordType');
            }
            else {
                sp.bgCenter = bgCenter;
                sp.bgSize = bgSize;
                sp.bgPrecisionMax = 1;
            }
            if (s_gl.colorType != gl.FLOAT) {
                sp.bgPrecisionColMax = s_geo.getPrecisionMax('colorType');
            }
            if (s_gl.texCoordType != gl.FLOAT) {
                sp.bgPrecisionTexMax = s_geo.getPrecisionMax('texCoordType');
            }

            if (s_gl.imageGeometry != 0 && !x3dom.caps.MOBILE)  // FIXME: mobile errors
            {
                sp.IG_bboxMin = s_geo.getMin().toGL();
                sp.IG_bboxMax = s_geo.getMax().toGL();
                sp.IG_implicitMeshSize = s_geo._vf.implicitMeshSize.toGL();  // FIXME

                var coordTex = x3dom.Utils.findTextureByName(s_gl.texture, "IG_coords0");
                if (coordTex) {
                    sp.IG_coordTextureWidth = coordTex.texture.width;
                    sp.IG_coordTextureHeight = coordTex.texture.height;
                }

                if (s_gl.imageGeometry == 1) {
                    var indexTex = x3dom.Utils.findTextureByName(s_gl.texture, "IG_index");
                    if (indexTex) {
                        sp.IG_indexTextureWidth = indexTex.texture.width;
                        sp.IG_indexTextureHeight = indexTex.texture.height;
                    }

                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, indexTex.texture);

                    gl.activeTexture(gl.TEXTURE1);
                    gl.bindTexture(gl.TEXTURE_2D, coordTex.texture);
                }
                else {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, coordTex.texture);
                }

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

                var texUnit = 0;
                if (s_geo.getIndexTexture()) {
                    if (!sp.IG_indexTexture) {
                        sp.IG_indexTexture = texUnit++;
                    }
                }

                if (s_geo.getCoordinateTexture(0)) {
                    if (!sp.IG_coordinateTexture) {
                        sp.IG_coordinateTexture = texUnit++;
                    }
                }
            }

            for (var q = 0, q_n = s_gl.positions.length; q < q_n; q++) {
                var q5 = 5 * q;
                var v, v_n, offset;

                if (s_gl.buffers[q5]) {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, s_gl.buffers[q5]);
                }
                if (sp.position !== undefined && s_gl.buffers[q5 + 1]) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q5 + 1]);

                    gl.vertexAttribPointer(sp.position,
                        s_msh._numPosComponents, s_gl.coordType, false,
                        shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.position);
                }
                if (sp.texcoord !== undefined && s_gl.buffers[q5 + 3]) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q5 + 3]);

                    gl.vertexAttribPointer(sp.texcoord,
                        s_msh._numTexComponents, s_gl.texCoordType, false,
                        shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.texcoord);
                }
                if (sp.color !== undefined && s_gl.buffers[q5 + 4]) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q5 + 4]);

                    gl.vertexAttribPointer(sp.color,
                        s_msh._numColComponents, s_gl.colorType, false,
                        shape._colorStrideOffset[0], shape._colorStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.color);
                }

                if (shape.isSolid()) {
                    this.stateManager.enable(gl.CULL_FACE);

                    if (shape.isCCW()) {
                        this.stateManager.frontFace(gl.CCW);
                    }
                    else {
                        this.stateManager.frontFace(gl.CW);
                    }
                }
                else {
                    this.stateManager.disable(gl.CULL_FACE);
                }

                if (s_gl.primType == gl.POINTS && (typeof s_gl.primType).toString() != "object") {
                    gl.drawArrays(gl.POINTS, 0, s_gl.positions[q].length / 3);
                }
                else if (s_gl.indexes && s_gl.indexes[q]) {
                    if (s_gl.imageGeometry != 0 ||
                        s_gl.binaryGeometry < 0 || s_gl.popGeometry < 0 || s_gl.bitLODGeometry < 0) {
                        if (s_gl.bitLODGeometry != 0 && s_geo._vf.normalPerVertex === false) {
                            var totalVertexCount = 0;
                            for (v = 0, v_n = s_geo._vf.vertexCount.length; v < v_n; v++) {
                                if (s_gl.primType[v] == gl.TRIANGLES) {
                                    totalVertexCount += s_geo._vf.vertexCount[v];
                                }
                                else if (s_gl.primType[v] == gl.TRIANGLE_STRIP) {
                                    totalVertexCount += (s_geo._vf.vertexCount[v] - 2) * 3;
                                }
                            }
                            gl.drawArrays(gl.TRIANGLES, 0, totalVertexCount);
                        }
                        else {
                            for (v = 0, offset = 0, v_n = s_geo._vf.vertexCount.length; v < v_n; v++) {
                                gl.drawArrays(s_gl.primType[v], offset, s_geo._vf.vertexCount[v]);
                                offset += s_geo._vf.vertexCount[v];
                            }
                        }
                    }
                    else if (s_gl.binaryGeometry > 0 || s_gl.popGeometry > 0 || s_gl.bitLODGeometry > 0) {
                        for (v = 0, offset = 0, v_n = s_geo._vf.vertexCount.length; v < v_n; v++) {
                            gl.drawElements(s_gl.primType[v], s_geo._vf.vertexCount[v], gl.UNSIGNED_SHORT, 2 * offset);
                            offset += s_geo._vf.vertexCount[v];
                        }
                    }
                    else if (s_geo.hasIndexOffset()) {
                        // IndexedTriangleStripSet with primType TRIANGLE_STRIP,
                        // and Patch geometry from external BVHRefiner component
                        var indOff = shape.tessellationProperties();
                        for (v = 0, v_n = indOff.length; v < v_n; v++) {
                            gl.drawElements(s_gl.primType, indOff[v].count, gl.UNSIGNED_SHORT, indOff[v].offset);
                        }
                    }
                    else {
                        gl.drawElements(s_gl.primType, s_gl.indexes[q].length, gl.UNSIGNED_SHORT, 0);
                    }
                }

                //Clean Texture units for IG
                if (s_gl.imageGeometry != 0 && !x3dom.caps.MOBILE) {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                    if (s_gl.imageGeometry == 1) {
                        gl.activeTexture(gl.TEXTURE1);
                        gl.bindTexture(gl.TEXTURE_2D, null);
                    }
                }

                if (sp.position !== undefined && s_gl.buffers[q5 + 1]) {
                    gl.disableVertexAttribArray(sp.position);
                }
                if (sp.texcoord !== undefined && s_gl.buffers[q5 + 3]) {
                    gl.disableVertexAttribArray(sp.texcoord);
                }
                if (sp.color !== undefined && s_gl.buffers[q5 + 4]) {
                    gl.disableVertexAttribArray(sp.color);
                }
            }
        }

        gl.lineWidth(1);
        gl.flush();

        try {
            var x = lastX * scene._webgl.pickScale,
                y = scene._webgl.fboPick.height - 1 - lastY * scene._webgl.pickScale;
            // 4 = 1 * 1 * 4; then take width x height window
            var data = new Uint8Array(4 * width * height);

            gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);

            scene._webgl.fboPick.pixelData = data;
        }
        catch (se) {
            scene._webgl.fboPick.pixelData = [];
            //No Exception on file:// when starting with additional flags:
            //  chrome.exe --disable-web-security
            x3dom.debug.logException(se + " (cannot pick)");
        }

        this.stateManager.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    /*****************************************************************************
     * Render single Shape
     *****************************************************************************/
    Context.prototype.renderShape = function (drawable, viewarea, slights, numLights, mat_view, mat_scene,
                                              mat_light, mat_proj, gl)
    {
        var shape = drawable.shape;
        var transform = drawable.transform;

        if (!shape || !shape._webgl) {
            x3dom.debug.logError("[Context|RenderShape] No valid Shape!");
            return;
        }

        var s_gl = shape._webgl;
        var sp = s_gl.shader;

        if (!sp) {
            x3dom.debug.logError("[Context|RenderShape] No Shader is set!");
            return;
        }

        this.stateManager.useProgram(sp);

        //===========================================================================
        // Set special Geometry variables
        //===========================================================================
        var s_app = shape._cf.appearance.node;
        var s_geo = shape._cf.geometry.node;
        var s_msh = s_geo._mesh;

        var scene = viewarea._scene;
        var tex = null;

        if (s_gl.coordType != gl.FLOAT) {
            if (s_gl.popGeometry === 0 && ( s_gl.bitLODGeometry != 0 ||
                (s_msh._numPosComponents == 4 && x3dom.Utils.isUnsignedType(s_geo._vf.coordType)) )) {
                sp.bgCenter = s_geo.getMin().toGL();
            }
            else {
                sp.bgCenter = s_geo._vf.position.toGL();
            }
            sp.bgSize = s_geo._vf.size.toGL();
            sp.bgPrecisionMax = s_geo.getPrecisionMax('coordType');
        }
        else {
            sp.bgCenter = x3dom.fields.SFVec3f.NullVector.toGL();
            sp.bgSize = x3dom.fields.SFVec3f.OneVector.toGL();
            sp.bgPrecisionMax = 1;
        }
        if (s_gl.colorType != gl.FLOAT) {
            sp.bgPrecisionColMax = s_geo.getPrecisionMax('colorType');
        }
        else {
            sp.bgPrecisionColMax = 1;
        }
        if (s_gl.texCoordType != gl.FLOAT) {
            sp.bgPrecisionTexMax = s_geo.getPrecisionMax('texCoordType');
        }
        else {
            sp.bgPrecisionTexMax = 1;
        }
        if (s_gl.normalType != gl.FLOAT) {
            sp.bgPrecisionNorMax = s_geo.getPrecisionMax('normalType');
        }
        else {
            sp.bgPrecisionNorMax = 1;
        }

        if (s_gl.imageGeometry != 0) {
            sp.IG_bboxMin = s_geo.getMin().toGL();
            sp.IG_bboxMax = s_geo.getMax().toGL();
            sp.IG_implicitMeshSize = s_geo._vf.implicitMeshSize.toGL();  // FIXME

            tex = x3dom.Utils.findTextureByName(s_gl.texture, "IG_coords0");
            if (tex) {
                sp.IG_coordTextureWidth = tex.texture.width;
                sp.IG_coordTextureHeight = tex.texture.height;
            }

            if (s_gl.imageGeometry == 1) {
                tex = x3dom.Utils.findTextureByName(s_gl.texture, "IG_index");
                if (tex) {
                    sp.IG_indexTextureWidth = tex.texture.width;
                    sp.IG_indexTextureHeight = tex.texture.height;
                }
            }
            tex = null;
        }

        //===========================================================================
        // Set fog
        //===========================================================================
        var fog = scene.getFog();

        if (fog) {
            sp.fogColor = fog._vf.color.toGL();
            sp.fogRange = fog._vf.visibilityRange;
            sp.fogType = (fog._vf.fogType == "LINEAR") ? 0.0 : 1.0;
        }

        //===========================================================================
        // Set Material
        //===========================================================================
        var mat = s_app ? s_app._cf.material.node : null;
        var shader = s_app ? s_app._shader : null;

        if (mat || s_gl.csshader) {
            if (s_gl.csshader) {
                sp.diffuseColor = shader._vf.diffuseFactor.toGL();
                sp.specularColor = shader._vf.specularFactor.toGL();
                sp.emissiveColor = shader._vf.emissiveFactor.toGL();
                sp.shininess = shader._vf.shininessFactor;
                sp.ambientIntensity = (shader._vf.ambientFactor.x +
                    shader._vf.ambientFactor.y +
                    shader._vf.ambientFactor.z) / 3;
                sp.transparency = 1.0 - shader._vf.alphaFactor;

                if (shader.getDisplacementMap()) {
                  tex = x3dom.Utils.findTextureByName(s_gl.texture, "displacementMap");
                  sp.displacementWidth = tex.texture.width;
                  sp.displacementHeight = tex.texture.height;
                  sp.displacementFactor = shader._vf.displacementFactor;
                  sp.displacementAxis = (shader._vf.displacementAxis == "x") ? 0.0 :
                                        (shader._vf.displacementAxis == "y") ? 1.0 : 2.0;
                }
                else if (shader.getDiffuseDisplacementMap()) {
                    tex = x3dom.Utils.findTextureByName(s_gl.texture, "diffuseDisplacementMap");
                    sp.displacementWidth = tex.texture.width;
                    sp.displacementHeight = tex.texture.height;
                    sp.displacementFactor = shader._vf.displacementFactor;
                    sp.displacementAxis = (shader._vf.displacementAxis == "x") ? 0.0 :
                                          (shader._vf.displacementAxis == "y") ? 1.0 : 2.0;
                }
            }
            else if (mat) {
                sp.diffuseColor = mat._vf.diffuseColor.toGL();
                sp.specularColor = mat._vf.specularColor.toGL();
                sp.emissiveColor = mat._vf.emissiveColor.toGL();
                sp.shininess = mat._vf.shininess;
                sp.ambientIntensity = mat._vf.ambientIntensity;
                sp.transparency = mat._vf.transparency;
            }
        }
        else {
            sp.diffuseColor = [1.0, 1.0, 1.0];
            sp.specularColor = [0.0, 0.0, 0.0];
            sp.emissiveColor = [0.0, 0.0, 0.0];
            sp.shininess = 0.0;
            sp.ambientIntensity = 1.0;
            sp.transparency = 0.0;
        }

        //Look for user-defined shaders
        if (shader) {
            if (x3dom.isa(shader, x3dom.nodeTypes.ComposedShader)) {
                for (var fName in shader._vf) {
                    if (shader._vf.hasOwnProperty(fName) && fName !== 'language') {
                        var field = shader._vf[fName];
                        if (field) {
                            if (field.toGL) {
                                sp[fName] = field.toGL();
                            }
                            else {
                                sp[fName] = field;
                            }
                        }
                    }
                }
            }
            else if (x3dom.isa(shader, x3dom.nodeTypes.CommonSurfaceShader)) {
                s_gl.csshader = shader;
            }
        }

        //===========================================================================
        // Set Lights
        //===========================================================================
        // TODO: when no state/shader switch happens, all light/fog/... uniforms don't need to be set again
        if (numLights > 0) {
            for (var p = 0; p < numLights; p++) {
                // FIXME; getCurrentTransform() doesn't work for shared lights/objects!
                var light_transform = mat_view.mult(slights[p].getCurrentTransform());

                if (x3dom.isa(slights[p], x3dom.nodeTypes.DirectionalLight)) {
                    sp['light' + p + '_Type'] = 0.0;
                    sp['light' + p + '_On'] = (slights[p]._vf.on) ? 1.0 : 0.0;
                    sp['light' + p + '_Color'] = slights[p]._vf.color.toGL();
                    sp['light' + p + '_Intensity'] = slights[p]._vf.intensity;
                    sp['light' + p + '_AmbientIntensity'] = slights[p]._vf.ambientIntensity;
                    sp['light' + p + '_Direction'] = light_transform.multMatrixVec(slights[p]._vf.direction).toGL();
                    sp['light' + p + '_Attenuation'] = [1.0, 1.0, 1.0];
                    sp['light' + p + '_Location'] = [1.0, 1.0, 1.0];
                    sp['light' + p + '_Radius'] = 0.0;
                    sp['light' + p + '_BeamWidth'] = 0.0;
                    sp['light' + p + '_CutOffAngle'] = 0.0;
                    sp['light' + p + '_ShadowIntensity'] = slights[p]._vf.shadowIntensity;
                }
                else if (x3dom.isa(slights[p], x3dom.nodeTypes.PointLight)) {
                    sp['light' + p + '_Type'] = 1.0;
                    sp['light' + p + '_On'] = (slights[p]._vf.on) ? 1.0 : 0.0;
                    sp['light' + p + '_Color'] = slights[p]._vf.color.toGL();
                    sp['light' + p + '_Intensity'] = slights[p]._vf.intensity;
                    sp['light' + p + '_AmbientIntensity'] = slights[p]._vf.ambientIntensity;
                    sp['light' + p + '_Direction'] = [1.0, 1.0, 1.0];
                    sp['light' + p + '_Attenuation'] = slights[p]._vf.attenuation.toGL();
                    sp['light' + p + '_Location'] = light_transform.multMatrixPnt(slights[p]._vf.location).toGL();
                    sp['light' + p + '_Radius'] = slights[p]._vf.radius;
                    sp['light' + p + '_BeamWidth'] = 0.0;
                    sp['light' + p + '_CutOffAngle'] = 0.0;
                    sp['light' + p + '_ShadowIntensity'] = slights[p]._vf.shadowIntensity;
                }
                else if (x3dom.isa(slights[p], x3dom.nodeTypes.SpotLight)) {
                    sp['light' + p + '_Type'] = 2.0;
                    sp['light' + p + '_On'] = (slights[p]._vf.on) ? 1.0 : 0.0;
                    sp['light' + p + '_Color'] = slights[p]._vf.color.toGL();
                    sp['light' + p + '_Intensity'] = slights[p]._vf.intensity;
                    sp['light' + p + '_AmbientIntensity'] = slights[p]._vf.ambientIntensity;
                    sp['light' + p + '_Direction'] = light_transform.multMatrixVec(slights[p]._vf.direction).toGL();
                    sp['light' + p + '_Attenuation'] = slights[p]._vf.attenuation.toGL();
                    sp['light' + p + '_Location'] = light_transform.multMatrixPnt(slights[p]._vf.location).toGL();
                    sp['light' + p + '_Radius'] = slights[p]._vf.radius;
                    sp['light' + p + '_BeamWidth'] = slights[p]._vf.beamWidth;
                    sp['light' + p + '_CutOffAngle'] = slights[p]._vf.cutOffAngle;
                    sp['light' + p + '_ShadowIntensity'] = slights[p]._vf.shadowIntensity;
                }
            }
        }

        //===========================================================================
        // Set HeadLight
        //===========================================================================
        var nav = scene.getNavigationInfo();

        if (nav._vf.headlight) {
            numLights = (numLights) ? numLights : 0;
            sp['light' + numLights + '_Type'] = 0.0;
            sp['light' + numLights + '_On'] = 1.0;
            sp['light' + numLights + '_Color'] = [1.0, 1.0, 1.0];
            sp['light' + numLights + '_Intensity'] = 1.0;
            sp['light' + numLights + '_AmbientIntensity'] = 0.0;
            sp['light' + numLights + '_Direction'] = [0.0, 0.0, -1.0];
            sp['light' + numLights + '_Attenuation'] = [1.0, 1.0, 1.0];
            sp['light' + numLights + '_Location'] = [1.0, 1.0, 1.0];
            sp['light' + numLights + '_Radius'] = 0.0;
            sp['light' + numLights + '_BeamWidth'] = 0.0;
            sp['light' + numLights + '_CutOffAngle'] = 0.0;
            sp['light' + numLights + '_ShadowIntensity'] = 0.0;
        }

        // transformation matrices
        var model_view = mat_view.mult(transform);
        var model_view_inv = model_view.inverse();

        sp.modelViewMatrix = model_view.toGL();
        sp.viewMatrix = mat_view.toGL();

        sp.normalMatrix = model_view_inv.transpose().toGL();
        sp.modelViewMatrixInverse = model_view_inv.toGL();

        sp.projectionMatrix = mat_proj.toGL();
        sp.modelViewProjectionMatrix = mat_scene.mult(transform).toGL();


        //PopGeometry: adapt LOD and set shader variables
        if (s_gl.popGeometry) {
            this.updatePopState(drawable, s_geo, sp, s_gl, scene, model_view, viewarea, this.x3dElem.runtime.fps);
        }


        for (var cnt = 0, cnt_n = s_gl.texture.length; cnt < cnt_n; cnt++) {
            tex = s_gl.texture[cnt];

            gl.activeTexture(gl.TEXTURE0 + cnt);
            gl.bindTexture(tex.type, tex.texture);
            gl.texParameteri(tex.type, gl.TEXTURE_WRAP_S, tex.wrapS);
            gl.texParameteri(tex.type, gl.TEXTURE_WRAP_T, tex.wrapT);
            gl.texParameteri(tex.type, gl.TEXTURE_MAG_FILTER, tex.magFilter);
            gl.texParameteri(tex.type, gl.TEXTURE_MIN_FILTER, tex.minFilter);
            if (tex.genMipMaps) {
                gl.generateMipmap(tex.type);
            }

            if (!shader || shader && !x3dom.isa(shader, x3dom.nodeTypes.ComposedShader)) {
                if (!sp[tex.samplerName])
                    sp[tex.samplerName] = cnt;
            }
        }

        if (s_app && s_app._cf.textureTransform.node) {
            var texTrafo = s_app.texTransformMatrix();
            sp.texTrafoMatrix = texTrafo.toGL();
        }

        if (shape.isSolid()) {
            this.stateManager.enable(gl.CULL_FACE);

            if (shape.isCCW()) {
                this.stateManager.frontFace(gl.CCW);
            }
            else {
                this.stateManager.frontFace(gl.CW);
            }
        }
        else {
            this.stateManager.disable(gl.CULL_FACE);
        }

        // TODO; FIXME; what if geometry with split mesh has dynamic fields?
        var attrib = null;

        for (var df = 0, df_n = s_gl.dynamicFields.length; df < df_n; df++) {
            attrib = s_gl.dynamicFields[df];

            if (sp[attrib.name] !== undefined) {
                gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buf);

                gl.vertexAttribPointer(sp[attrib.name], attrib.numComponents, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(sp[attrib.name]);
            }
        }

        // render object
        var i, i_n, offset;

        for (var q = 0, q_n = s_gl.positions.length; q < q_n; q++) {
            var q5 = 5 * q;

            if (s_gl.buffers[q5]) {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, s_gl.buffers[q5]);
            }
            if (sp.position !== undefined && s_gl.buffers[q5 + 1]) {
                gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q5 + 1]);

                gl.vertexAttribPointer(sp.position,
                    s_msh._numPosComponents, s_gl.coordType, false,
                    shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
                gl.enableVertexAttribArray(sp.position);
            }
            if (sp.normal !== undefined && s_gl.buffers[q5 + 2]) {
                gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q5 + 2]);

                gl.vertexAttribPointer(sp.normal,
                    s_msh._numNormComponents, s_gl.normalType, false,
                    shape._normalStrideOffset[0], shape._normalStrideOffset[1]);
                gl.enableVertexAttribArray(sp.normal);
            }
            if (sp.texcoord !== undefined && s_gl.buffers[q5 + 3]) {
                gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q5 + 3]);

                gl.vertexAttribPointer(sp.texcoord,
                    s_msh._numTexComponents, s_gl.texCoordType, false,
                    shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);
                gl.enableVertexAttribArray(sp.texcoord);
            }
            if (sp.color !== undefined && s_gl.buffers[q5 + 4]) {
                gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q5 + 4]);

                gl.vertexAttribPointer(sp.color,
                    s_msh._numColComponents, s_gl.colorType, false,
                    shape._colorStrideOffset[0], shape._colorStrideOffset[1]);
                gl.enableVertexAttribArray(sp.color);
            }
            if (s_gl.popGeometry !== 0 && s_gl.buffers[q5 + 5]) {
                //special case: mimic gl_VertexID
                gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q5 + 5]);

                gl.vertexAttribPointer(sp.PG_vertexID, 1, gl.FLOAT, false, 4, 0);
                gl.enableVertexAttribArray(sp.PG_vertexID);
            }

            var renderMode = viewarea.getRenderMode();
            if (renderMode > 0) {
                // TODO: implement surface with additional wireframe render mode (independent from poly mode)
                var polyMode = (renderMode == 1) ? gl.POINTS : gl.LINES;

                if (s_gl.imageGeometry != 0 ||
                    s_gl.binaryGeometry < 0 || s_gl.popGeometry < 0 || s_gl.bitLODGeometry < 0) {
                    for (i = 0, offset = 0, i_n = s_geo._vf.vertexCount.length; i < i_n; i++) {
                        gl.drawArrays(polyMode, offset, s_geo._vf.vertexCount[i]);
                        offset += s_geo._vf.vertexCount[i];
                    }
                }
                else if (s_gl.binaryGeometry > 0 || s_gl.popGeometry > 0 || s_gl.bitLODGeometry > 0) {
                    for (i = 0, offset = 0, i_n = s_geo._vf.vertexCount.length; i < i_n; i++) {
                        gl.drawElements(polyMode, s_geo._vf.vertexCount[i], gl.UNSIGNED_SHORT, 2 * offset);
                        offset += s_geo._vf.vertexCount[i];
                    }
                }
                else {
                    gl.drawElements(polyMode, s_gl.indexes[q].length, gl.UNSIGNED_SHORT, 0);
                }
            }
            else if (sp.position !== undefined && s_gl.buffers[q5 + 1]) {
                if (s_gl.primType == gl.POINTS && (typeof s_gl.primType).toString() != "object") {
                    gl.drawArrays(gl.POINTS, 0, s_gl.positions[q].length / 3);
                }
                else if (s_gl.indexes && s_gl.indexes[q]) {
                    if (s_gl.imageGeometry != 0 ||
                        s_gl.binaryGeometry < 0 || s_gl.popGeometry < 0 || s_gl.bitLODGeometry < 0) {
                        if (s_gl.bitLODGeometry != 0 && s_geo._vf.normalPerVertex === false) {
                            var totalVertexCount = 0;
                            for (i = 0, i_n = s_geo._vf.vertexCount.length; i < i_n; i++) {
                                if (s_gl.primType[i] == gl.TRIANGLES) {
                                    totalVertexCount += s_geo._vf.vertexCount[i];
                                }
                                else if (s_gl.primType[i] == gl.TRIANGLE_STRIP) {
                                    totalVertexCount += (s_geo._vf.vertexCount[i] - 2) * 3;
                                }
                            }
                            gl.drawArrays(gl.TRIANGLES, 0, totalVertexCount);
                        }
                        else {
                            for (i = 0, offset = 0, i_n = s_geo._vf.vertexCount.length; i < i_n; i++) {
                                gl.drawArrays(s_gl.primType[i], offset, s_geo._vf.vertexCount[i]);
                                offset += s_geo._vf.vertexCount[i];
                            }
                        }
                    }
                    else if (s_gl.binaryGeometry > 0 || s_gl.popGeometry > 0 || s_gl.bitLODGeometry > 0) {
                        for (i = 0, offset = 0, i_n = s_geo._vf.vertexCount.length; i < i_n; i++) {
                            gl.drawElements(s_gl.primType[i], s_geo._vf.vertexCount[i], gl.UNSIGNED_SHORT, 2 * offset);
                            offset += s_geo._vf.vertexCount[i];
                        }
                    }
                    else if (s_geo.hasIndexOffset()) {
                        // IndexedTriangleStripSet with primType TRIANGLE_STRIP,
                        // and Patch geometry from external BVHRefiner component
                        var indOff = shape.tessellationProperties();
                        for (i = 0, i_n = indOff.length; i < i_n; i++) {
                            gl.drawElements(s_gl.primType, indOff[i].count, gl.UNSIGNED_SHORT, indOff[i].offset);
                        }
                    }
                    else {
                        gl.drawElements(s_gl.primType, s_gl.indexes[q].length, gl.UNSIGNED_SHORT, 0);
                    }
                }
            }

            if (sp.position !== undefined) {
                gl.disableVertexAttribArray(sp.position);
            }
            if (sp.normal !== undefined) {
                gl.disableVertexAttribArray(sp.normal);
            }
            if (sp.texcoord !== undefined) {
                gl.disableVertexAttribArray(sp.texcoord);
            }
            if (sp.color !== undefined) {
                gl.disableVertexAttribArray(sp.color);
            }
            if (s_gl.popGeometry !== 0 && sp.PG_vertexID !== undefined) {
                //special case: mimic gl_VertexID
                gl.disableVertexAttribArray(sp.PG_vertexID);
            }
        }

        for (df = 0, df_n = s_gl.dynamicFields.length; df < df_n; df++) {
            attrib = s_gl.dynamicFields[df];

            if (sp[attrib.name] !== undefined) {
                gl.disableVertexAttribArray(sp[attrib.name]);
            }
        }

        // update stats
        if (s_gl.indexes && s_gl.indexes[0]) {
            if (s_gl.imageGeometry != 0) {
                for (i = 0, i_n = s_geo._vf.vertexCount.length; i < i_n; i++) {
                    if (s_gl.primType[i] == gl.TRIANGLE_STRIP)
                        this.numFaces += (s_geo._vf.vertexCount[i] - 2);
                    else
                        this.numFaces += (s_geo._vf.vertexCount[i] / 3);
                }
            }
            else {
                this.numFaces += s_msh._numFaces;
            }
        }

        if (s_gl.imageGeometry != 0) {
            i_n = s_geo._vf.vertexCount.length;
            for (i = 0; i < i_n; i++)
                this.numCoords += s_geo._vf.vertexCount[i];
            this.numDrawCalls += i_n;
        }
        else if (s_gl.binaryGeometry != 0 || s_gl.popGeometry != 0 || s_gl.bitLODGeometry != 0) {
            this.numCoords += s_msh._numCoords;
            this.numDrawCalls += s_geo._vf.vertexCount.length;
        }
        else {
            this.numCoords += s_msh._numCoords;

            if (s_geo.hasIndexOffset()) {
                indOff = shape.tessellationProperties();
                this.numDrawCalls += indOff.length;
            }
            else {
                this.numDrawCalls += s_gl.positions.length;
            }
        }

        // cleanup
        var s_gl_tex = s_gl.texture;
        cnt_n = s_gl_tex ? s_gl_tex.length : 0;

        for (cnt = 0; cnt < cnt_n; cnt++) {
            if (!s_gl_tex[cnt])
                continue;

            if (s_app && s_app._cf.texture.node) {
                tex = s_app._cf.texture.node.getTexture(cnt);
                gl.activeTexture(gl.TEXTURE0 + cnt);

                if (x3dom.isa(tex, x3dom.nodeTypes.X3DEnvironmentTextureNode)) {
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
                }
                else {
                    gl.bindTexture(gl.TEXTURE_2D, null);
                }
            }
        }
    };

    /*****************************************************************************
     * PopGeometry: adapt LOD and set shader variables
     *****************************************************************************/
    Context.prototype.updatePopState = function (drawable, popGeo, sp, s_gl, scene, model_view, viewarea, currFps)
    {
        var tol = x3dom.nodeTypes.PopGeometry.ErrorToleranceFactor * popGeo._vf.precisionFactor;

        if (currFps <= 1 || viewarea.isMoving()) {
            tol *= x3dom.nodeTypes.PopGeometry.PrecisionFactorOnMove;
        }

        var currentLOD = 16;

        if (tol > 0) {

            //BEGIN CLASSIC CODE
            var viewpoint = scene.getViewpoint();
            var imgPlaneHeightAtDistOne = viewpoint.getImgPlaneHeightAtDistOne();
            var near = viewpoint.getNear();
            var center = model_view.multMatrixPnt(popGeo._vf.position);

            var tightRad   = model_view.multMatrixVec(popGeo._vf.size).length()      * 0.5;
            var largestRad = model_view.multMatrixVec(popGeo._vf.maxBBSize).length() * 0.5;

            //distance is estimated conservatively using the bounding sphere
            var dist = Math.max(-center.z - tightRad, near);
            var projPixelLength = dist * (imgPlaneHeightAtDistOne / viewarea._height);

            //compute LOD using bounding sphere
            var arg = (2 * largestRad) / (tol * projPixelLength);
            //END CLASSIC CODE

            //BEGIN EXPERIMENTAL CODE
            //compute LOD using screen-space coverage of bounding sphere
            //@todo: the coverage should be distinct from priority
            //var cov = drawable.priority;
            //@todo: here, we need to decide whether we want to keep the ModF-encoding with
            //       respect to the largest bounding box... if not, change this and the shaders
            //cov *= (popGeo._vf.maxBBSize.length() / popGeo._vf.size.length());
            //var arg = cov / tol;
            //END EXPERIMENTAL CODE

            // use precomputed log(2.0) = 0.693147180559945
            currentLOD = Math.ceil(Math.log(arg) / 0.693147180559945);
            currentLOD = (currentLOD < 1) ? 1 : ((currentLOD > 16) ? 16 : currentLOD);
        }

        //take care of user-controlled min and max values
        var minPrec = popGeo._vf.minPrecisionLevel, maxPrec = popGeo._vf.maxPrecisionLevel;

        currentLOD = (minPrec != -1 && currentLOD < minPrec) ? minPrec : currentLOD;
        currentLOD = (maxPrec != -1 && currentLOD > maxPrec) ? maxPrec : currentLOD;

        //assign rendering resolution, according to currently loaded data and LOD
        var currentLOD_min = (s_gl.levelsAvailable < currentLOD) ? s_gl.levelsAvailable : currentLOD;
        currentLOD = currentLOD_min;

        //@todo: only for demonstration purposes!!!
        if (tol <= 1)
            currentLOD = (currentLOD == popGeo.getNumLevels()) ? 16 : currentLOD;

        //here, we tell X3DOM how many faces / vertices get displayed in the stats
        var hasIndex = popGeo._vf.indexedRendering;
        var p_msh = popGeo._mesh;

        p_msh._numCoords = 0;
        p_msh._numFaces = 0;

        //@todo: this assumes pure TRIANGLES data
        for (var i = 0; i < currentLOD_min; ++i) {  // currentLOD breaks loop
            var numVerticesAtLevel_i = s_gl.numVerticesAtLevel[i];
            p_msh._numCoords += numVerticesAtLevel_i;
            p_msh._numFaces += (hasIndex ? popGeo.getNumIndicesByLevel(i) : numVerticesAtLevel_i) / 3;
        }

        x3dom.nodeTypes.PopGeometry.numRenderedVerts += p_msh._numCoords;
        x3dom.nodeTypes.PopGeometry.numRenderedTris += p_msh._numFaces;

        //this field is mainly thought for the use with external statistics
        //@todo: does not work with instances
        p_msh.currentLOD = currentLOD;

        //here, we tell X3DOM how many vertices get rendered
        //@todo: this assumes pure TRIANGLES data
        popGeo.adaptVertexCount(hasIndex ? p_msh._numFaces * 3 : p_msh._numCoords);

        // finally set shader variables...
        sp.PG_maxBBSize = popGeo._vf.maxBBSize.toGL();

        sp.PG_bbMin = popGeo._bbMinBySize;  // floor(bbMin / maxBBSize)

        sp.PG_numAnchorVertices = popGeo._vf.numAnchorVertices;

        sp.PG_bbMaxModF    = popGeo._vf.bbMaxModF.toGL();
        sp.PG_bboxShiftVec = popGeo._vf.bbShiftVec.toGL();

        sp.PG_precisionLevel = currentLOD;

        //mimics Math.pow(2.0, 16.0 - currentLOD);
        sp.PG_powPrecision = x3dom.nodeTypes.PopGeometry.powLUT[currentLOD - 1];
    };


    /*****************************************************************************
     * Render ColorBuffer-Pass for picking
     *****************************************************************************/
    Context.prototype.pickValue = function (viewarea, x, y, buttonState, viewMat, sceneMat)
    {
        var gl = this.ctx3d;
        var scene = viewarea._scene;

        // method requires that scene has already been rendered at least once
        if (gl === null || scene === null || !scene._webgl || !scene.drawableCollection) {
            return false;
        }

        var pm = scene._vf.pickMode.toLowerCase();
        var pickMode = 0;

        switch (pm) {
            case "box":      return false;
            case "idbuf":    pickMode = 0; break;
            case "idbuf24":  pickMode = 3; break;
            case "idbufid":  pickMode = 4; break;
            case "color":    pickMode = 1; break;
            case "texcoord": pickMode = 2; break;
        }

        //t0 = new Date().getTime();

        x3dom.Utils.startMeasure("picking");

        scene.updateVolume();

        var mat_view, mat_scene;

        if (arguments.length > 4) {
            mat_view = viewMat;
            mat_scene = sceneMat;
        }
        else {
            mat_view = viewarea._last_mat_view;
            mat_scene = viewarea._last_mat_scene;
        }

        var min = scene._lastMin;
        var max = scene._lastMax;
        var from = mat_view.inverse().e3();

        // get bbox of scene bbox and camera position
        var _min = x3dom.fields.SFVec3f.copy(from);
        var _max = x3dom.fields.SFVec3f.copy(from);

        if (_min.x > min.x) {
            _min.x = min.x;
        }
        if (_min.y > min.y) {
            _min.y = min.y;
        }
        if (_min.z > min.z) {
            _min.z = min.z;
        }

        if (_max.x < max.x) {
            _max.x = max.x;
        }
        if (_max.y < max.y) {
            _max.y = max.y;
        }
        if (_max.z < max.z) {
            _max.z = max.z;
        }

        min.setValues(_min);
        max.setValues(_max);

        var sceneSize = max.subtract(min).length();

        var baseID = x3dom.nodeTypes.Shape.objectID + 2;    // for shadow ids

        // render to texture for reading pixel values
        this.renderPickingPass(gl, scene, mat_view, mat_scene,
            from, sceneSize, pickMode, x, y, 2, 2);

        //var index = ( (scene._webgl.fboPick.height - 1 - scene._lastY) * 
        //               scene._webgl.fboPick.width + scene._lastX ) * 4;
        var index = 0;
        if (index >= 0 && scene._webgl.fboPick.pixelData &&
            index < scene._webgl.fboPick.pixelData.length)
        {
            var pickPos = new x3dom.fields.SFVec3f(0, 0, 0);
            var pickNorm = new x3dom.fields.SFVec3f(0, 0, 1);
            var objId = scene._webgl.fboPick.pixelData[index + 3], shapeId;

            var pixelOffset = 1.0 / scene._webgl.pickScale;
            var denom = 1.0 / 256.0;
            var dist, line, lineoff, right, up;

            if (pickMode == 0) {
                objId += 256 * scene._webgl.fboPick.pixelData[index + 2];

                dist = (scene._webgl.fboPick.pixelData[index + 0] / 255.0) * denom +
                       (scene._webgl.fboPick.pixelData[index + 1] / 255.0);

                line = viewarea.calcViewRay(x, y);

                pickPos = line.pos.add(line.dir.multiply(dist * sceneSize));

                index = 4;      // get right pixel
                dist = (scene._webgl.fboPick.pixelData[index + 0] / 255.0) * denom +
                       (scene._webgl.fboPick.pixelData[index + 1] / 255.0);

                lineoff = viewarea.calcViewRay(x + pixelOffset, y);

                right = lineoff.pos.add(lineoff.dir.multiply(dist * sceneSize));
                right = right.subtract(pickPos).normalize();

                index = 8;      // get top pixel
                dist = (scene._webgl.fboPick.pixelData[index + 0] / 255.0) * denom +
                       (scene._webgl.fboPick.pixelData[index + 1] / 255.0);

                lineoff = viewarea.calcViewRay(x, y - pixelOffset);

                up = lineoff.pos.add(lineoff.dir.multiply(dist * sceneSize));
                up = up.subtract(pickPos).normalize();

                pickNorm = right.cross(up).normalize();
            }
            else if (pickMode == 3) {
                objId +=   256 * scene._webgl.fboPick.pixelData[index + 2] +
                         65536 * scene._webgl.fboPick.pixelData[index + 1];

                dist = scene._webgl.fboPick.pixelData[index + 0] / 255.0;

                line = viewarea.calcViewRay(x, y);

                pickPos = line.pos.add(line.dir.multiply(dist * sceneSize));

                index = 4;      // get right pixel
                dist = scene._webgl.fboPick.pixelData[index + 0] / 255.0;

                lineoff = viewarea.calcViewRay(x + pixelOffset, y);

                right = lineoff.pos.add(lineoff.dir.multiply(dist * sceneSize));
                right = right.subtract(pickPos).normalize();

                index = 8;      // get top pixel
                dist = scene._webgl.fboPick.pixelData[index + 0] / 255.0;

                lineoff = viewarea.calcViewRay(x, y - pixelOffset);

                up = lineoff.pos.add(lineoff.dir.multiply(dist * sceneSize));
                up = up.subtract(pickPos).normalize();

                pickNorm = right.cross(up).normalize();
            }
            else if (pickMode == 4) {
                objId += 256 * scene._webgl.fboPick.pixelData[index + 2];

                shapeId  =       scene._webgl.fboPick.pixelData[index + 1];
                shapeId += 256 * scene._webgl.fboPick.pixelData[index + 0];

                // check if standard shape picked without special shadow id
                if (objId == 0 && (shapeId > 0 && shapeId < baseID)) {
                    objId = shapeId;
                }
            }
            else {
                pickPos.x = scene._webgl.fboPick.pixelData[index + 0];
                pickPos.y = scene._webgl.fboPick.pixelData[index + 1];
                pickPos.z = scene._webgl.fboPick.pixelData[index + 2];
            }
            //x3dom.debug.logInfo(pickPos + " / " + objId);

            if (objId >= baseID) {
                objId -= baseID;

                var hitObject;

                if (pickMode != 4) {
                    viewarea._pickingInfo.pickPos = pickPos;
                    viewarea._pick.setValues(pickPos);

                    viewarea._pickingInfo.pickNorm = pickNorm;
                    viewarea._pickNorm.setValues(pickNorm);

                    viewarea._pickingInfo.pickObj = null;
                    viewarea._pickingInfo.lastClickObj = null;

                    hitObject = scene._xmlNode;
                }
                else {
                    viewarea._pickingInfo.pickObj = x3dom.nodeTypes.Shape.idMap.nodeID[shapeId];

                    hitObject = viewarea._pickingInfo.pickObj._xmlNode;
                }

                viewarea._pickingInfo.shadowObjectId = objId;

                //x3dom.debug.logInfo(baseID + " + " + objId);
                var eventType = "shadowObjectIdChanged";

                try {
                    if ( scene._xmlNode &&
                        (scene._xmlNode["on" + eventType] ||
                            scene._xmlNode.hasAttribute("on" + eventType) ||
                            scene._listeners[eventType]) ) {
                        var event = {
                            target: scene._xmlNode,
                            type: eventType,
                            button: buttonState,
                            layerX: x,
                            layerY: y,
                            shadowObjectId: objId,
                            worldX: pickPos.x,
                            worldY: pickPos.y,
                            worldZ: pickPos.z,
                            normalX: pickNorm.x,
                            normalY: pickNorm.y,
                            normalZ: pickNorm.z,
                            hitPnt: pickPos.toGL(),
                            hitObject: hitObject,
                            cancelBubble: false,
                            stopPropagation: function () {
                                this.cancelBubble = true;
                            },
                            preventDefault: function () {
                                this.cancelBubble = true;
                            }
                        };

                        scene.callEvtHandler(("on" + eventType), event);
                    }
                }
                catch (e) {
                    x3dom.debug.logException(e);
                }

                if (scene._shadowIdMap && scene._shadowIdMap.mapping) {
                    var shIds = scene._shadowIdMap.mapping[objId].usage;
                    // find corresponding dom tree object
                    for (var c = 0; c < shIds.length; c++) {
                        var shObj = scene._nameSpace.defMap[shIds[c]];
                        // FIXME; bbox test too coarse (+ should include trafo)
                        if (shObj.doIntersect(line)) {
                            viewarea._pickingInfo.pickObj = shObj;
                            break;
                        }
                    }
                }
            }
            else if (objId > 0) {
                //x3dom.debug.logInfo(x3dom.nodeTypes.Shape.idMap.nodeID[objId]._DEF + " // " +
                //                    x3dom.nodeTypes.Shape.idMap.nodeID[objId]._xmlNode.localName);
                viewarea._pickingInfo.pickPos = pickPos;
                viewarea._pickingInfo.pickNorm = pickNorm;
                viewarea._pickingInfo.pickObj = x3dom.nodeTypes.Shape.idMap.nodeID[objId];
            }
            else {
                viewarea._pickingInfo.pickObj = null;
                //viewarea._pickingInfo.lastObj = null;
                viewarea._pickingInfo.lastClickObj = null;
            }
        }

        var pickTime = x3dom.Utils.stopMeasure("picking");
        this.x3dElem.runtime.addMeasurement('PICKING', pickTime);

        //t1 = new Date().getTime() - t0;
        //x3dom.debug.logInfo("Picking time (idBuf): " + t1 + "ms");

        return true;
    };

    /*****************************************************************************
     * Render ColorBuffer-Pass for picking sub window
     *****************************************************************************/
    Context.prototype.pickRect = function (viewarea, x1, y1, x2, y2)
    {
        var gl = this.ctx3d;
        var scene = viewarea ? viewarea._scene : null;

        // method requires that scene has already been rendered at least once
        if (gl === null || scene === null || !scene._webgl || !scene.drawableCollection)
            return false;

        // values not fully correct but unnecessary anyway, just to feed the shader
        var from = viewarea._last_mat_view.inverse().e3();
        var sceneSize = scene._lastMax.subtract(scene._lastMin).length();

        var x = (x1 <= x2) ? x1 : x2;
        var y = (y1 >= y2) ? y1 : y2;
        var width = (1 + Math.abs(x2 - x1)) * scene._webgl.pickScale;
        var height = (1 + Math.abs(y2 - y1)) * scene._webgl.pickScale;

        // render to texture for reading pixel values
        this.renderPickingPass(gl, scene, viewarea._last_mat_view, viewarea._last_mat_scene,
            from, sceneSize, 0, x, y, (width < 1) ? 1 : width, (height < 1) ? 1 : height);

        var index = 0;
        var pickedObjects = [];

        // get objects in rectangle
        for (index = 0; scene._webgl.fboPick.pixelData &&
            index < scene._webgl.fboPick.pixelData.length; index += 4) {
            var objId = scene._webgl.fboPick.pixelData[index + 3] +
                scene._webgl.fboPick.pixelData[index + 2] * 256;

            if (objId > 0)
                pickedObjects.push(objId);
        }
        pickedObjects.sort();

        // make found object IDs unique
        var pickedObjectsTemp = (function (arr) {
            var a = [], l = arr.length;
            for (var i = 0; i < l; i++) {
                for (var j = i + 1; j < l; j++) {
                    if (arr[i] === arr[j])
                        j = ++i;
                }
                a.push(arr[i]);
            }
            return a;
        })(pickedObjects);
        pickedObjects = pickedObjectsTemp;

        var pickedNodes = [];

        for (index = 0; index < pickedObjects.length; index++) {
            var obj = pickedObjects[index];

            obj = x3dom.nodeTypes.Shape.idMap.nodeID[obj];
            obj = (obj && obj._xmlNode) ? obj._xmlNode : null;

            if (obj)
                pickedNodes.push(obj);
        }

        return pickedNodes;
    };

    /*****************************************************************************
     * Render Scene (Main-Pass)
     *****************************************************************************/
    Context.prototype.renderScene = function (viewarea)
    {
        var gl = this.ctx3d;
        var scene = viewarea._scene;

        if (gl === null || scene === null) {
            return;
        }

        var rentex = viewarea._doc._nodeBag.renderTextures;
        var rt_tex, rtl_i, rtl_n = rentex.length;

        // for initFbo
        var type = gl.UNSIGNED_BYTE;
        var shadowType = gl.UNSIGNED_BYTE;
        var nearestFilt = false;

        if (x3dom.caps.FP_TEXTURES && !x3dom.caps.MOBILE) {
            type = gl.FLOAT;
            shadowType = gl.FLOAT;
            if (!x3dom.caps.FPL_TEXTURES) {
                nearestFilt = true;
            }
        }

        var shadowedLights, numShadowMaps;
        var i, j, n, size, sizeAvailable;

        scene.updateVolume();
		
        if (!scene._webgl)
        {
            scene._webgl = {};

            this.setupFgnds(gl, scene);

            // scale factor for mouse coords and width/ height (low res for speed-up)
            scene._webgl.pickScale = 0.5;

            scene._webgl._currFboWidth = Math.round(this.canvas.width * scene._webgl.pickScale);
            scene._webgl._currFboHeight = Math.round(this.canvas.height * scene._webgl.pickScale);

            // TODO: FIXME when spec ready: readPixels not (yet?) available for float textures
            // https://bugzilla.mozilla.org/show_bug.cgi?id=681903
            // https://www.khronos.org/webgl/public-mailing-list/archives/1108/msg00025.html
            scene._webgl.fboPick = this.initFbo(gl,
                                   scene._webgl._currFboWidth, scene._webgl._currFboHeight, true, gl.UNSIGNED_BYTE);
            scene._webgl.fboPick.pixelData = null;

            //Set picking shaders
            scene._webgl.pickShader = this.cache.getShader(gl, x3dom.shader.PICKING);
            scene._webgl.pickShader24 = this.cache.getShader(gl, x3dom.shader.PICKING_24);
            scene._webgl.pickShaderId = this.cache.getShader(gl, x3dom.shader.PICKING_ID);
            scene._webgl.pickColorShader = this.cache.getShader(gl, x3dom.shader.PICKING_COLOR);
            scene._webgl.pickTexCoordShader = this.cache.getShader(gl, x3dom.shader.PICKING_TEXCOORD);

            scene._webgl.normalShader = this.cache.getShader(gl, x3dom.shader.NORMAL);

            //Initialize shadow maps
			scene._webgl.fboShadow = [];
			
			shadowedLights = viewarea.getShadowedLights();
            n = shadowedLights.length;

			for (i=0; i<n; i++)
            {
				size = shadowedLights[i]._vf.shadowMapSize;

				if (!x3dom.isa(shadowedLights[i], x3dom.nodeTypes.PointLight))
					//cascades for directional lights
					numShadowMaps = Math.max(1,Math.min(shadowedLights[i]._vf.shadowCascades,6));		
				else 
					//six maps for point lights
					numShadowMaps = 6;
					
				scene._webgl.fboShadow[i] = [];
				
				for (j=0; j < numShadowMaps; j++)
					scene._webgl.fboShadow[i][j] = this.initFbo(gl, size, size, nearestFilt, shadowType);
			}
			
			if (scene._webgl.fboShadow.length > 0)
				scene._webgl.fboScene = this.initFbo(gl, this.canvas.width, this.canvas.height, nearestFilt, shadowType);
			scene._webgl.fboBlur = [];
						
			//initialize blur fbo (different fbos for different sizes)
			for (i=0; i<n; i++)
            {
				size = scene._webgl.fboShadow[i][0].height;
				sizeAvailable = false;

				for (j = 0; j < scene._webgl.fboBlur.length; j++){
					if (size == scene._webgl.fboBlur[j].height) 
						sizeAvailable = true;
				}
				if (!sizeAvailable) 
					scene._webgl.fboBlur[scene._webgl.fboBlur.length] = this.initFbo(gl, size, size, nearestFilt, shadowType);
			}
			
			//initialize Data for post processing
			scene._webgl.ppBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, scene._webgl.ppBuffer);
			var vertices = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);		
			
			scene._webgl.shadowShader = this.cache.getShader(gl, x3dom.shader.SHADOW);
            
            // TODO; for testing do it on init, but must be refreshed on node change!
            for (rtl_i = 0; rtl_i < rtl_n; rtl_i++) {
                rt_tex = rentex[rtl_i];
                rt_tex._webgl = {};
                rt_tex._webgl.fbo = this.initFbo(gl,
                    rt_tex._vf.dimensions[0],
                    rt_tex._vf.dimensions[1], nearestFilt, type);
            }

            viewarea._last_mat_view = x3dom.fields.SFMatrix4f.identity();
            viewarea._last_mat_proj = x3dom.fields.SFMatrix4f.identity();
            viewarea._last_mat_scene = x3dom.fields.SFMatrix4f.identity();

            this._calledViewpointChangedHandler = false;
        }
        else // updates needed?
        {
            var fboWidth = Math.round(this.canvas.width * scene._webgl.pickScale);
            var fboHeight = Math.round(this.canvas.height * scene._webgl.pickScale);

            if (scene._webgl._currFboWidth !== fboWidth ||
                scene._webgl._currFboHeight !== fboHeight) {
                scene._webgl._currFboWidth = fboWidth;
                scene._webgl._currFboHeight = fboHeight;

                scene._webgl.fboPick = this.initFbo(gl, fboWidth, fboHeight, true, scene._webgl.fboPick.typ);
                scene._webgl.fboPick.pixelData = null;

                x3dom.debug.logInfo("Refreshed picking FBO to size (" + fboWidth + ", " + fboHeight + ")");
            }

            for (rtl_i = 0; rtl_i < rtl_n; rtl_i++) {
                rt_tex = rentex[rtl_i];
                if (rt_tex._webgl && rt_tex._webgl.fbo &&
                    rt_tex._webgl.fbo.width  == rt_tex._vf.dimensions[0] &&
                    rt_tex._webgl.fbo.height == rt_tex._vf.dimensions[1])
                    continue;

                rt_tex.invalidateGLObject();
                rt_tex._webgl = {};
                rt_tex._webgl.fbo = this.initFbo(gl,
                    rt_tex._vf.dimensions[0],
                    rt_tex._vf.dimensions[1], nearestFilt, type);
                x3dom.debug.logInfo("Init/resize RenderedTexture_" + rtl_i + " to size " +
                                    rt_tex._vf.dimensions[0] + " x " + rt_tex._vf.dimensions[1]);
            }			
			
			//reinitialize shadow fbos if necessary
			shadowedLights = viewarea.getShadowedLights();
            n = shadowedLights.length;

			for (i=0; i<n; i++) {
				size = shadowedLights[i]._vf.shadowMapSize;

				if (!x3dom.isa(shadowedLights[i], x3dom.nodeTypes.PointLight))
					//cascades for directional lights
					numShadowMaps = Math.max(1,Math.min(shadowedLights[i]._vf.shadowCascades,6));				
				else 
					//six maps for point lights
					numShadowMaps = 6;		
				
				if (typeof scene._webgl.fboShadow[i] === "undefined" ||
                    scene._webgl.fboShadow[i].length != numShadowMaps ||
					scene._webgl.fboShadow[i][0].height != size) {
					scene._webgl.fboShadow[i] = [];
					for (j=0;j<numShadowMaps;j++){
						scene._webgl.fboShadow[i][j] = this.initFbo(gl, size, size, nearestFilt, shadowType);
					}
				}			
			}
			
			//reinitialize blur fbos if necessary
			for (i=0; i<n; i++){
				size = scene._webgl.fboShadow[i][0].height;
				
				sizeAvailable = false;
				for (j = 0; j < scene._webgl.fboBlur.length; j++){
					if (size == scene._webgl.fboBlur[j].height) 
						sizeAvailable = true;
				}
				if (!sizeAvailable) 
					scene._webgl.fboBlur[scene._webgl.fboBlur.length] = this.initFbo(gl, size, size, nearestFilt, shadowType);
			}

			if (scene._webgl.fboShadow.length > 0 && typeof scene._webgl.fboScene == "undefined" || scene._webgl.fboScene &&
				(this.canvas.width != scene._webgl.fboScene.width || this.canvas.height != scene._webgl.fboScene.height)) {
				scene._webgl.fboScene = this.initFbo(gl, this.canvas.width, this.canvas.height, nearestFilt, shadowType);
			}
        }

        var env = scene.getEnvironment();
        // update internal flags
        env.checkSanity();

        var bgnd = scene.getBackground();

        this.setupScene(gl, bgnd);

        this.numFaces = 0;
        this.numCoords = 0;
        this.numDrawCalls = 0;

        var mat_proj = viewarea.getProjectionMatrix();
        var mat_view = viewarea.getViewMatrix();

        // fire viewpointChanged event
        if (!this._calledViewpointChangedHandler || !viewarea._last_mat_view.equals(mat_view)) {
            var e_viewpoint = scene.getViewpoint();
            var e_eventType = "viewpointChanged";

            try {
                if (e_viewpoint._xmlNode &&
                    (e_viewpoint._xmlNode["on" + e_eventType] ||
                        e_viewpoint._xmlNode.hasAttribute("on" + e_eventType) ||
                        e_viewpoint._listeners[e_eventType])) {
                    var e_viewtrafo = e_viewpoint.getCurrentTransform();
                    e_viewtrafo = e_viewtrafo.inverse().mult(mat_view);

                    var e_mat = e_viewtrafo.inverse();

                    var e_rotation = new x3dom.fields.Quaternion(0, 0, 1, 0);
                    e_rotation.setValue(e_mat);

                    var e_translation = e_mat.e3();

                    var e_event = {
                        target: e_viewpoint._xmlNode,
                        type: e_eventType,
                        matrix: e_viewtrafo,
                        position: e_translation,
                        orientation: e_rotation.toAxisAngle(),
                        cancelBubble: false,
                        stopPropagation: function () {
                            this.cancelBubble = true;
                        },
                        preventDefault: function () {
                            this.cancelBubble = true;
                        }
                    };

                    e_viewpoint.callEvtHandler(("on" + e_eventType), e_event);

                    this._calledViewpointChangedHandler = true;
                }
            }
            catch (e_e) {
                x3dom.debug.logException(e_e);
            }
        }

        viewarea._last_mat_view = mat_view;
        viewarea._last_mat_proj = mat_proj;

        var mat_scene = mat_proj.mult(mat_view);  //viewarea.getWCtoCCMatrix();
        viewarea._last_mat_scene = mat_scene;


        //===========================================================================
        // Collect drawables (traverse)
        //===========================================================================
        scene.drawableCollection = null;  // Always update needed?

        if (!scene.drawableCollection)
        {
            var drawableCollectionConfig = {
                viewArea: viewarea,
                sortTrans: env._vf.sortTrans,
                viewMatrix: mat_view,
                projMatrix: mat_proj,
                sceneMatrix: mat_scene,
                frustumCulling: true,
                smallFeatureThreshold: env._smallFeatureThreshold,
                context: this,
                gl: gl
            };

            scene.drawableCollection = new x3dom.DrawableCollection(drawableCollectionConfig);

            x3dom.Utils.startMeasure('traverse');

            scene.collectDrawableObjects(x3dom.fields.SFMatrix4f.identity(), scene.drawableCollection, true, false, 0);

            var traverseTime = x3dom.Utils.stopMeasure('traverse');
            this.x3dElem.runtime.addMeasurement('TRAVERSE', traverseTime);
        }

        //===========================================================================
        // Sort drawables
        //===========================================================================      
        x3dom.Utils.startMeasure('sorting');

        scene.drawableCollection.sort();

        var sortTime = x3dom.Utils.stopMeasure('sorting');
        this.x3dElem.runtime.addMeasurement('SORT', sortTime);

        //===========================================================================
        // Render Shadow Pass
        //===========================================================================
        var slights = viewarea.getLights();
        var numLights = slights.length;
        var mat_light;
        var WCToLCMatrices = [];
        var lMatrices = [];
        var shadowCount = 0;

        x3dom.Utils.startMeasure('shadow');

        for (var p = 0; p < numLights; p++) {
            if (slights[p]._vf.shadowIntensity > 0.0) {

                var lightMatrix = viewarea.getLightMatrix()[p];
                shadowMaps = scene._webgl.fboShadow[shadowCount];
                var offset = Math.max(0.0, Math.min(1.0, slights[p]._vf.shadowOffset));

                if (!x3dom.isa(slights[p], x3dom.nodeTypes.PointLight)) {
                    //get cascade count
                    var numCascades = Math.max(1, Math.min(slights[p]._vf.shadowCascades, 6));

                    //calculate transformation matrices
                    mat_light = viewarea.getWCtoLCMatricesCascaded(lightMatrix, slights[p], mat_proj);

                    //render shadow pass
                    for (i = 0; i < numCascades; i++) {
                        this.renderShadowPass(gl, viewarea, mat_light[i], mat_view, shadowMaps[i], offset, false);
                    }
                }
                else {
                    //for point lights 6 render passes
                    mat_light = viewarea.getWCtoLCMatricesPointLight(lightMatrix, slights[p], mat_proj);
                    for (i = 0; i < 6; i++) {
                        this.renderShadowPass(gl, viewarea, mat_light[i], mat_view, shadowMaps[i], offset, false);
                    }
                }
                shadowCount++;

                //save transformations for shadow rendering
                WCToLCMatrices[WCToLCMatrices.length] = mat_light;
                lMatrices[lMatrices.length] = lightMatrix;
            }
        }

        //One pass for depth of scene from camera view (to enable post-processing shading)
        if (shadowCount > 0) {
            this.renderShadowPass(gl, viewarea, mat_scene, mat_view, scene._webgl.fboScene, 0.0, true);
            var shadowTime = x3dom.Utils.stopMeasure('shadow');
            this.x3dElem.runtime.addMeasurement('SHADOW', shadowTime);
        }
        else {
            this.x3dElem.runtime.removeMeasurement('SHADOW');
        }

        mat_light = viewarea.getWCtoLCMatrix(viewarea.getLightMatrix()[0]);

        for (rtl_i = 0; rtl_i < rtl_n; rtl_i++) {
            this.renderRTPass(gl, viewarea, rentex[rtl_i]);
        }

        // rendering
        x3dom.Utils.startMeasure('render');

        this.stateManager.viewport(0, 0, this.canvas.width, this.canvas.height);

        // calls gl.clear etc. (bgnd stuff)
        bgnd._webgl.render(gl, mat_view, mat_proj);

        // HACK; fully impl. BlendMode and DepthMode (needs to be handled in renderShape just like Material etc.)
        this.stateManager.depthMask(true);
        this.stateManager.depthFunc(gl.LEQUAL);
        this.stateManager.enable(gl.DEPTH_TEST);
        this.stateManager.enable(gl.CULL_FACE);

        //this.stateManager.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        this.stateManager.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
        this.stateManager.enable(gl.BLEND);

        x3dom.nodeTypes.PopGeometry.numRenderedVerts = 0;
        x3dom.nodeTypes.PopGeometry.numRenderedTris = 0;

        n = scene.drawableCollection.length;

        // Very, very experimental priority culling, currently coupled with frustum and small feature culling
        // TODO; what about shadows, picking etc. (but picking needs all objects, though this is NYI)
        if (env._vf.smallFeatureCulling && env._lowPriorityThreshold < 1 && viewarea.isMoving()) {
            n = Math.floor(n * env._lowPriorityThreshold);
            if (n == 0 && scene.drawableCollection.length > 0)
                n = 1;    // render at least one object
        }

        for (i = 0; i < n; i++) {
            var drawable = scene.drawableCollection.get(i);

            var needEnableBlending = false;
            var needEnableDepthMask = false;
            var shapeApp = drawable.shape._cf.appearance.node;

            // HACK; fully impl. BlendMode and DepthMode (needs to be handled in renderShape just like Material etc.)
            {
                if (shapeApp && shapeApp._cf.blendMode.node &&
                    shapeApp._cf.blendMode.node._vf.srcFactor.toLowerCase() === "none" &&
                    shapeApp._cf.blendMode.node._vf.destFactor.toLowerCase() === "none") {
                    needEnableBlending = true;
                    this.stateManager.disable(gl.BLEND);
                }
                if (shapeApp && shapeApp._cf.depthMode.node &&
                    shapeApp._cf.depthMode.node._vf.readOnly === true) {
                    needEnableDepthMask = true;
                    this.stateManager.depthMask(false);
                }
            }

            this.renderShape(drawable, viewarea, slights, numLights,
                mat_view, mat_scene, mat_light, mat_proj, gl);

            // HACK; fully impl. BlendMode and DepthMode (needs to be handled in renderShape just like Material etc.)
            {
                if (needEnableBlending) {
                    this.stateManager.enable(gl.BLEND);
                }
                if (needEnableDepthMask) {
                    this.stateManager.depthMask(true);
                }
            }
        }

        if (shadowCount > 0)
            this.renderShadows(gl, viewarea, shadowedLights, WCToLCMatrices, lMatrices, mat_view, mat_proj, mat_scene);

        this.stateManager.disable(gl.BLEND);
        this.stateManager.disable(gl.DEPTH_TEST);

        viewarea._numRenderedNodes = n;

        // if _visDbgBuf then show helper buffers in foreground for debugging
        if (viewarea._visDbgBuf !== undefined && viewarea._visDbgBuf)
        {
            var pm = scene._vf.pickMode.toLowerCase();

            if (pm.indexOf("idbuf") == 0 || pm == "color" || pm == "texcoord") {
                this.stateManager.viewport(0, 3 * this.canvas.height / 4,
                                           this.canvas.width / 4, this.canvas.height / 4);
                scene._fgnd._webgl.render(gl, scene._webgl.fboPick.tex);
            }

            if (shadowCount > 0) {
                this.stateManager.viewport(this.canvas.width / 4, 3 * this.canvas.height / 4,
                                           this.canvas.width / 4, this.canvas.height / 4);
                scene._fgnd._webgl.render(gl, scene._webgl.fboScene.tex);
            }

            var row = 3, col = 2;
            for (i = 0; i < shadowCount; i++) {
                var shadowMaps = scene._webgl.fboShadow[i];
                for (j = 0; j < shadowMaps.length; j++) {
                    this.stateManager.viewport(col * this.canvas.width / 4, row * this.canvas.height / 4,
                                               this.canvas.width / 4, this.canvas.height / 4);
                    scene._fgnd._webgl.render(gl, shadowMaps[j].tex);
                    if (col < 2) {
                        col++;
                    } else {
                        col = 0;
                        row--;
                    }
                }
            }

            for (rtl_i = 0; rtl_i < rtl_n; rtl_i++) {
                rt_tex = rentex[rtl_i];

                this.stateManager.viewport(rtl_i * this.canvas.width / 8, 5 * this.canvas.height / 8,
                                           this.canvas.width / 8, this.canvas.height / 8);
                scene._fgnd._webgl.render(gl, rt_tex._webgl.fbo.tex);
            }
        }

        gl.finish();
        //gl.flush();

        var renderTime = x3dom.Utils.stopMeasure('render');

        this.x3dElem.runtime.addMeasurement('RENDER', renderTime);
        this.x3dElem.runtime.addMeasurement('DRAW', (n ? renderTime / n : 0));

        this.x3dElem.runtime.addInfo('#NODES:', scene.drawableCollection.numberOfNodes);
        this.x3dElem.runtime.addInfo('#SHAPES:', viewarea._numRenderedNodes);
        this.x3dElem.runtime.addInfo("#DRAWS:", this.numDrawCalls);
        this.x3dElem.runtime.addInfo("#POINTS:", this.numCoords);
        this.x3dElem.runtime.addInfo("#TRIS:", this.numFaces);

        //scene.drawableObjects = null;
    };

    /*****************************************************************************
     * Render RenderedTexture-Pass
     *****************************************************************************/
    Context.prototype.renderRTPass = function (gl, viewarea, rt)
    {
        switch (rt._vf.update.toUpperCase()) {
            case "NONE":
                return;
            case "NEXT_FRAME_ONLY":
                if (!rt._needRenderUpdate) {
                    return;
                }
                rt._needRenderUpdate = false;
                break;
            case "ALWAYS":
            default:
                break;
        }

        var scene = viewarea._scene;
        var bgnd = null;

        var mat_view = rt.getViewMatrix();
        var mat_proj = rt.getProjectionMatrix();
        var mat_scene = mat_proj.mult(mat_view);

        var lightMatrix = viewarea.getLightMatrix()[0];
        var mat_light = viewarea.getWCtoLCMatrix(lightMatrix);

        var i, n, m = rt._cf.excludeNodes.nodes.length;

        var arr = new Array(m);
        for (i = 0; i < m; i++) {
            var render = rt._cf.excludeNodes.nodes[i]._vf.render;
            if (render === undefined) {
                arr[i] = -1;
            }
            else {
                if (render === true) {
                    arr[i] = 1;
                } else {
                    arr[i] = 0;
                }
            }
            rt._cf.excludeNodes.nodes[i]._vf.render = false;
        }

        this.stateManager.bindFramebuffer(gl.FRAMEBUFFER, rt._webgl.fbo.fbo);

        this.stateManager.viewport(0, 0, rt._webgl.fbo.width, rt._webgl.fbo.height);

        if (rt._cf.background.node === null) {
            gl.clearColor(0, 0, 0, 1);
            gl.clearDepth(1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        }
        else if (rt._cf.background.node === scene.getBackground()) {
            bgnd = scene.getBackground();
            bgnd._webgl.render(gl, mat_view, mat_proj);
        }
        else {
            bgnd = rt._cf.background.node;
            this.setupScene(gl, bgnd);
            bgnd._webgl.render(gl, mat_view, mat_proj);
        }

        this.stateManager.depthFunc(gl.LEQUAL);
        this.stateManager.enable(gl.DEPTH_TEST);
        this.stateManager.enable(gl.CULL_FACE);

        this.stateManager.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
        this.stateManager.enable(gl.BLEND);

        var slights = viewarea.getLights();
        var numLights = slights.length;

        var transform, shape, drawable;
        var locScene = rt._cf.scene.node;

        var needEnableBlending, needEnableDepthMask;

        if (!locScene || locScene === scene) {
            n = scene.drawableCollection.length;

            if (rt._vf.showNormals) {
                this.renderNormals(gl, scene, scene._webgl.normalShader, mat_view, mat_scene);
            }
            else {
                for (i = 0; i < n; i++) {
                    drawable = scene.drawableCollection.get(i);
                    transform = drawable.transform;
                    shape = drawable.shape;

                    if (!shape._vf.render) {
                        continue;
                    }

                    needEnableBlending = false;
                    needEnableDepthMask = false;

                    // HACK; fully impl. BlendMode and DepthMode
                    if (shape._cf.appearance.node) {
                        var appearance = shape._cf.appearance.node;

                        if (appearance._cf.blendMode.node &&
                            appearance._cf.blendMode.node._vf.srcFactor.toLowerCase() === "none" &&
                            appearance._cf.blendMode.node._vf.destFactor.toLowerCase() === "none") {
                            needEnableBlending = true;
                            this.stateManager.disable(gl.BLEND);
                        }
                        if (appearance._cf.depthMode.node &&
                            appearance._cf.depthMode.node._vf.readOnly === true) {
                            needEnableDepthMask = true;
                            this.stateManager.depthMask(false);
                        }
                    }

                    this.renderShape(drawable, viewarea, slights, numLights,
                        mat_view, mat_scene, mat_light, mat_proj, gl);

                    if (needEnableBlending) {
                        this.stateManager.enable(gl.BLEND);
                    }
                    if (needEnableDepthMask) {
                        this.stateManager.depthMask(true);
                    }
                }
            }
        }
        else {
            var env = scene.getEnvironment();

            var drawableCollectionConfig = {
                viewArea: viewarea,
                sortTrans: env._vf.sortTrans,
                viewMatrix: mat_view,
                projMatrix: mat_proj,
                sceneMatrix: mat_scene,
                frustumCulling: false,
                smallFeatureThreshold: 1,
                context: this,
                gl: gl
            };

            locScene.numberOfNodes = 0;
            locScene.drawableCollection = new x3dom.DrawableCollection(drawableCollectionConfig);

            locScene.collectDrawableObjects(x3dom.fields.SFMatrix4f.identity(), locScene.drawableCollection, true, false, 0);

            locScene.drawableCollection.sort();

            n = locScene.drawableCollection.length;

            if (rt._vf.showNormals) {
                this.renderNormals(gl, locScene, scene._webgl.normalShader, mat_view, mat_scene);
            }
            else {
                for (i = 0; i < n; i++) {
                    drawable = locScene.drawableCollection.get(i);
                    transform = drawable.transform;
                    shape = drawable.shape;

                    if (!shape._vf.render) {
                        continue;
                    }

                    needEnableBlending = false;
                    needEnableDepthMask = false;

                    // HACK; fully impl. BlendMode and DepthMode
                    if (shape._cf.appearance.node) {
                        appearance = shape._cf.appearance.node;

                        if (appearance._cf.blendMode.node &&
                            appearance._cf.blendMode.node._vf.srcFactor.toLowerCase() === "none" &&
                            appearance._cf.blendMode.node._vf.destFactor.toLowerCase() === "none") {
                            needEnableBlending = true;
                            this.stateManager.disable(gl.BLEND);
                        }
                        if (appearance._cf.depthMode.node &&
                            appearance._cf.depthMode.node._vf.readOnly === true) {
                            needEnableDepthMask = true;
                            this.stateManager.depthMask(false);
                        }
                    }

                    this.renderShape(drawable, viewarea, slights, numLights,
                        mat_view, mat_scene, mat_light, mat_proj, gl);

                    if (needEnableBlending) {
                        this.stateManager.enable(gl.BLEND);
                    }
                    if (needEnableDepthMask) {
                        this.stateManager.depthMask(true);
                    }
                }
            }
        }

        this.stateManager.disable(gl.BLEND);
        this.stateManager.disable(gl.DEPTH_TEST);

        gl.flush();
        this.stateManager.bindFramebuffer(gl.FRAMEBUFFER, null);

        for (i = 0; i < m; i++) {
            if (arr[i] !== 0) {
                rt._cf.excludeNodes.nodes[i]._vf.render = true;
            }
        }
    };

    /*****************************************************************************
     * Render Normals
     *****************************************************************************/
    Context.prototype.renderNormals = function (gl, scene, sp, mat_view, mat_scene)
    {
        if (!sp || !scene) {  // error
            return;
        }

        this.stateManager.depthFunc(gl.LEQUAL);
        this.stateManager.enable(gl.DEPTH_TEST);
        this.stateManager.enable(gl.CULL_FACE);
        this.stateManager.disable(gl.BLEND);

        this.stateManager.useProgram(sp);

        var bgCenter = new x3dom.fields.SFVec3f(0, 0, 0).toGL();
        var bgSize = new x3dom.fields.SFVec3f(1, 1, 1).toGL();

        for (var i = 0, n = scene.drawableCollection.length; i < n; i++) {
            var drawable = scene.drawableCollection.get(i);
            var trafo = drawable.transform;
            var shape = drawable.shape;
            var s_gl = shape._webgl;

            if (!s_gl || !shape._vf.render) {
                continue;
            }

            var s_geo = shape._cf.geometry.node;
            var s_msh = s_geo._mesh;

            var model_view_inv = mat_view.mult(trafo).inverse();
            sp.normalMatrix = model_view_inv.transpose().toGL();
            sp.modelViewProjectionMatrix = mat_scene.mult(trafo).toGL();

            //Set ImageGeometry switch (TODO; also impl. in Shader!)
            sp.imageGeometry = s_gl.imageGeometry;

            if (s_gl.coordType != gl.FLOAT) {
                if (s_gl.bitLODGeometry != 0 || s_gl.popGeometry != 0 ||
                    (s_msh._numPosComponents == 4 && x3dom.Utils.isUnsignedType(s_geo._vf.coordType)))
                    sp.bgCenter = s_geo.getMin().toGL();
                else
                    sp.bgCenter = s_geo._vf.position.toGL();
                sp.bgSize = s_geo._vf.size.toGL();
                sp.bgPrecisionMax = s_geo.getPrecisionMax('coordType');
            }
            else {
                sp.bgCenter = bgCenter;
                sp.bgSize = bgSize;
                sp.bgPrecisionMax = 1;
            }
            if (s_gl.normalType != gl.FLOAT) {
                sp.bgPrecisionNorMax = s_geo.getPrecisionMax('normalType');
            }
            else {
                sp.bgPrecisionNorMax = 1;
            }

            if (s_gl.imageGeometry != 0 && !x3dom.caps.MOBILE)  // FIXME: mobile errors
            {
                sp.IG_bboxMin = s_geo.getMin().toGL();
                sp.IG_bboxMax = s_geo.getMax().toGL();
                sp.IG_implicitMeshSize = s_geo._vf.implicitMeshSize.toGL();  // FIXME

                var coordTex = x3dom.Utils.findTextureByName(s_gl.texture, "IG_coords0");
                if (coordTex) {
                    sp.IG_coordTextureWidth = coordTex.texture.width;
                    sp.IG_coordTextureHeight = coordTex.texture.height;
                }

                if (s_gl.imageGeometry == 1) {
                    var indexTex = x3dom.Utils.findTextureByName(s_gl.texture, "IG_index");
                    if (indexTex) {
                        sp.IG_indexTextureWidth = indexTex.texture.width;
                        sp.IG_indexTextureHeight = indexTex.texture.height;
                    }

                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, indexTex.texture);

                    gl.activeTexture(gl.TEXTURE1);
                    gl.bindTexture(gl.TEXTURE_2D, coordTex.texture);
                }
                else {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, coordTex.texture);
                }

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

                var texUnit = 0;
                if (s_geo.getIndexTexture()) {
                    if (!sp.IG_indexTexture) {
                        sp.IG_indexTexture = texUnit++;
                    }
                }

                if (s_geo.getCoordinateTexture(0)) {
                    if (!sp.IG_coordinateTexture) {
                        sp.IG_coordinateTexture = texUnit++;
                    }
                }
            }

            for (var q = 0, q_n = s_gl.positions.length; q < q_n; q++) {
                var q5 = 5 * q;
                var v, v_n, offset;

                if (s_gl.buffers[q5]) {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, s_gl.buffers[q5]);
                }
                if (sp.position !== undefined && s_gl.buffers[q5 + 1]) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q5 + 1]);

                    gl.vertexAttribPointer(sp.position,
                        s_msh._numPosComponents, s_gl.coordType, false,
                        shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.position);
                }
                if (sp.normal !== undefined && s_gl.buffers[q5 + 2]) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q5 + 2]);

                    gl.vertexAttribPointer(sp.normal,
                        s_msh._numNormComponents, s_gl.normalType, false,
                        shape._normalStrideOffset[0], shape._normalStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.normal);
                }

                if (shape.isSolid()) {
                    this.stateManager.enable(gl.CULL_FACE);

                    if (shape.isCCW()) {
                        this.stateManager.frontFace(gl.CCW);
                    }
                    else {
                        this.stateManager.frontFace(gl.CW);
                    }
                }
                else {
                    this.stateManager.disable(gl.CULL_FACE);
                }

                if (s_gl.indexes && s_gl.indexes[q]) {
                    if (s_gl.imageGeometry != 0 ||
                        s_gl.binaryGeometry < 0 || s_gl.popGeometry < 0 || s_gl.bitLODGeometry < 0) {
                        if (s_gl.bitLODGeometry != 0 && s_geo._vf.normalPerVertex === false) {
                            var totalVertexCount = 0;
                            for (v = 0, v_n = s_geo._vf.vertexCount.length; v < v_n; v++) {
                                if (s_gl.primType[v] == gl.TRIANGLES) {
                                    totalVertexCount += s_geo._vf.vertexCount[v];
                                }
                                else if (s_gl.primType[v] == gl.TRIANGLE_STRIP) {
                                    totalVertexCount += (s_geo._vf.vertexCount[v] - 2) * 3;
                                }
                            }
                            gl.drawArrays(gl.TRIANGLES, 0, totalVertexCount);
                        }
                        else {
                            for (v = 0, offset = 0, v_n = s_geo._vf.vertexCount.length; v < v_n; v++) {
                                gl.drawArrays(s_gl.primType[v], offset, s_geo._vf.vertexCount[v]);
                                offset += s_geo._vf.vertexCount[v];
                            }
                        }
                    }
                    else if (s_gl.binaryGeometry > 0 || s_gl.popGeometry > 0 || s_gl.bitLODGeometry > 0) {
                        for (v = 0, offset = 0, v_n = s_geo._vf.vertexCount.length; v < v_n; v++) {
                            gl.drawElements(s_gl.primType[v], s_geo._vf.vertexCount[v], gl.UNSIGNED_SHORT, 2 * offset);
                            offset += s_geo._vf.vertexCount[v];
                        }
                    }
                    else if (s_geo.hasIndexOffset()) {
                        // IndexedTriangleStripSet with primType TRIANGLE_STRIP,
                        // and Patch geometry from external BVHRefiner component
                        var indOff = shape.tessellationProperties();
                        for (v = 0, v_n = indOff.length; v < v_n; v++) {
                            gl.drawElements(s_gl.primType, indOff[v].count, gl.UNSIGNED_SHORT, indOff[v].offset);
                        }
                    }
                    else {
                        gl.drawElements(s_gl.primType, s_gl.indexes[q].length, gl.UNSIGNED_SHORT, 0);
                    }
                }

                //Clean Texture units for IG
                if (s_gl.imageGeometry != 0 && !x3dom.caps.MOBILE) {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                    if (s_gl.imageGeometry == 1) {
                        gl.activeTexture(gl.TEXTURE1);
                        gl.bindTexture(gl.TEXTURE_2D, null);
                    }
                }

                if (sp.position !== undefined) {
                    gl.disableVertexAttribArray(sp.position);
                }
                if (sp.normal !== undefined) {
                    gl.disableVertexAttribArray(sp.normal);
                }
            }
        }
    };

    /*****************************************************************************
     * Cleanup
     *****************************************************************************/
    Context.prototype.shutdown = function (viewarea) {
        var gl = this.ctx3d;
        var scene = viewarea._scene;

        if (gl == null || !scene) {
            return;
        }

        var bgnd = scene.getBackground();
        if (bgnd._webgl.position !== undefined) {
            gl.deleteBuffer(bgnd._webgl.buffers[1]);
            gl.deleteBuffer(bgnd._webgl.buffers[0]);
        }
        var fgnd = scene._fgnd;
        if (fgnd._webgl.position !== undefined) {
            gl.deleteBuffer(fgnd._webgl.buffers[1]);
            gl.deleteBuffer(fgnd._webgl.buffers[0]);
        }

        var n = scene.drawableCollection ? scene.drawableCollection.length : 0;
        for (var i = 0; i < n; i++) {
            var shape = scene.drawableCollection.get(i).shape;

            if (shape._cleanupGLObjects)
                shape._cleanupGLObjects(true);
        }

        //Release Texture and Shader Resources
        this.cache.Release(gl);
    };

    /*****************************************************************************
     * Start of fbo init stuff
     *****************************************************************************/
    Context.prototype.emptyTexImage2D = function (gl, internalFormat, width, height, format, type) {
        try {
            gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);
        }
        catch (e) {
            // seems to be no longer necessary, but anyway...
            var bytes = 3;
            switch (internalFormat) {
                case gl.DEPTH_COMPONENT:
                    bytes = 3;
                    break;
                case gl.ALPHA:
                    bytes = 1;
                    break;
                case gl.RGB:
                    bytes = 3;
                    break;
                case gl.RGBA:
                    bytes = 4;
                    break;
                case gl.LUMINANCE:
                    bytes = 1;
                    break;
                case gl.LUMINANCE_ALPHA:
                    bytes = 2;
                    break;
            }
            var pixels = new Uint8Array(width * height * bytes);
            gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, pixels);
        }
    };

    /*****************************************************************************
     * Init Texture
     *****************************************************************************/
    Context.prototype.initTex = function (gl, w, h, nearest, type) {
        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);

        this.emptyTexImage2D(gl, gl.RGBA, w, h, gl.RGBA, type);
        //this.emptyTexImage2D(gl, gl.DEPTH_COMPONENT16, w, h, gl.DEPTH_COMPONENT, gl.UNSIGNED_BYTE);

        if (nearest) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        }
        else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

        tex.width = w;
        tex.height = h;

        return tex;
    };

    /*****************************************************************************
     * Creates FBO with given size
     * (taken from FBO utilities for WebGL by Emanuele Ruffaldi 2009)
     *
     * Returned Object has rbo, fbo, tex, width, height
     *****************************************************************************/
    Context.prototype.initFbo = function (gl, w, h, nearest, type) {
        var fbo = gl.createFramebuffer();
        var rb = gl.createRenderbuffer();

        var tex = this.initTex(gl, w, h, nearest, type);

        this.stateManager.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
        this.stateManager.bindFramebuffer(gl.FRAMEBUFFER, null);

        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status != gl.FRAMEBUFFER_COMPLETE)
            x3dom.debug.logWarning("[Context|InitFBO] FBO-Status: " + status);

        return {
            fbo: fbo,
            rbo: rb,
            tex: tex,
            width: w,
            height: h,
            typ: type
        };
    };
	
	/*****************************************************************************
    * Draw shadows on screen
    *****************************************************************************/
	Context.prototype.renderShadows = function(gl, viewarea, shadowedLights, wctolc, lMatrices,
                                               mat_view, mat_proj, mat_scene)
    {
		var scene = viewarea._scene;
		
		//don't render shadows with less than 7 textures per fragment shader
		var texLimit = x3dom.caps.MAX_TEXTURE_IMAGE_UNITS;
		
		if (texLimit < 7)
            return;
		
		var texUnits = 1;
		var renderSplit = [ 0 ];

        var shadowMaps, numShadowMaps;
        var i, j, k;
		
		//filter shadow maps and determine, if multiple render passes are needed		
		for (i = 0; i < shadowedLights.length; i++)
        {
            var filterSize = shadowedLights[i]._vf.shadowFilterSize;
            shadowMaps = scene._webgl.fboShadow[i];
            numShadowMaps = shadowMaps.length;

            //filtering
            for (j=0; j<numShadowMaps;j++){
                this.blurTex(gl, scene, shadowMaps[j], filterSize);
            }

            //shader consumes 6 tex units per lights (even if less are bound)
            texUnits+=6;

            if (texUnits > texLimit){
                renderSplit[renderSplit.length] = i;
                texUnits = 7;
            }
		}
		renderSplit[renderSplit.length] = shadowedLights.length;
		
		//render shadows for current render split
        var n = renderSplit.length - 1;
        var mat_proj_inv = mat_proj.inverse();
        var mat_scene_inv = mat_scene.inverse();

        //enable (multiplicative) blending
        this.stateManager.enable(gl.BLEND);
        this.stateManager.blendFunc(gl.DST_COLOR, gl.ZERO);

		for (var s=0; s<n; s++)
        {
			var startIndex = renderSplit[s];
			var endIndex = renderSplit[s+1];
		
			var currentLights = [];
			
			for (k=startIndex; k<endIndex; k++)
				currentLights[currentLights.length] = shadowedLights[k];

			var sp = this.cache.getShadowRenderingShader(gl, currentLights);

            this.stateManager.useProgram(sp);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, scene._webgl.ppBuffer);
			gl.vertexAttribPointer(sp.position, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(sp.position);
			
			//bind depth texture (depth from camera view)
			sp.sceneMap = 0;
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, scene._webgl.fboScene.tex);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			
			//compute inverse projection matrix
			sp.inverseProj = mat_proj_inv.toGL();
			
			//compute inverse view projection matrix
			sp.inverseViewProj = mat_scene_inv.toGL();

			var mat_light;
			var lightMatrix;
			var shadowIndex = 0;

			for (var p=0, pn=currentLights.length; p<pn; p++) {
				//get light matrices and shadow maps for current light
				lightMatrix = lMatrices[p+startIndex];
				mat_light = wctolc[p+startIndex];
				shadowMaps = scene._webgl.fboShadow[p+startIndex]; 
				
				numShadowMaps = mat_light.length;
				
				for (i=0; i< numShadowMaps; i++){
						gl.activeTexture(gl.TEXTURE1 + shadowIndex);
						gl.bindTexture(gl.TEXTURE_2D, shadowMaps[i].tex);
						sp['light'+p+'_'+i+'_ShadowMap'] = shadowIndex+1;
						sp['light'+p+'_'+i+'_Matrix'] = mat_light[i].toGL();
						shadowIndex++;
				}
				sp['light'+p+'_ViewMatrix'] = lightMatrix.toGL();						

				//cascade depths for directional and spot light
				if (!x3dom.isa(currentLights[p], x3dom.nodeTypes.PointLight)){
					for (j=0; j< numShadowMaps; j++){
						var numCascades = Math.max(1,Math.min(currentLights[p]._vf.shadowCascades,6));
						var splitFactor = Math.max(0,Math.min(currentLights[p]._vf.shadowSplitFactor,1));					
						var splitOffset = Math.max(0,Math.min(currentLights[p]._vf.shadowSplitOffset,1));						
						
						var splitDepths = viewarea.getShadowSplitDepths(numCascades, splitFactor, splitOffset, false, mat_proj);
						sp['light'+p+'_'+j+'_Split'] = splitDepths[j+1];
					}
				}
			
				//assign light properties
				var light_transform = mat_view.mult(currentLights[p].getCurrentTransform());
				if(x3dom.isa(currentLights[p], x3dom.nodeTypes.DirectionalLight))
				{
					sp['light'+p+'_Type']             = 0.0;
					sp['light'+p+'_On']               = (currentLights[p]._vf.on) ? 1.0 : 0.0;
					sp['light'+p+'_Direction']        = light_transform.multMatrixVec(currentLights[p]._vf.direction).toGL();
					sp['light'+p+'_Attenuation']      = [1.0, 1.0, 1.0];
					sp['light'+p+'_Location']         = [1.0, 1.0, 1.0];
					sp['light'+p+'_Radius']           = 0.0;
					sp['light'+p+'_BeamWidth']        = 0.0;
					sp['light'+p+'_CutOffAngle']      = 0.0;
					sp['light'+p+'_ShadowIntensity']  = currentLights[p]._vf.shadowIntensity;
					sp['light'+p+'_ShadowCascades']   = currentLights[p]._vf.shadowCascades;
					sp['light'+p+'_ShadowOffset']     = Math.max(0.0,Math.min(1.0,currentLights[p]._vf.shadowOffset));
				}
				else if(x3dom.isa(currentLights[p], x3dom.nodeTypes.PointLight))
				{
					sp['light'+p+'_Type']             = 1.0;
					sp['light'+p+'_On']               = (currentLights[p]._vf.on) ? 1.0 : 0.0;
					sp['light'+p+'_Direction']        = [1.0, 1.0, 1.0];
					sp['light'+p+'_Attenuation']      = currentLights[p]._vf.attenuation.toGL();
					sp['light'+p+'_Location']         = light_transform.multMatrixPnt(currentLights[p]._vf.location).toGL();
					sp['light'+p+'_Radius']           = currentLights[p]._vf.radius;
					sp['light'+p+'_BeamWidth']        = 0.0;
					sp['light'+p+'_CutOffAngle']      = 0.0;
					sp['light'+p+'_ShadowIntensity']  = currentLights[p]._vf.shadowIntensity;
					sp['light'+p+'_ShadowOffset']	  = Math.max(0.0,Math.min(1.0,currentLights[p]._vf.shadowOffset));
				}
				else if(x3dom.isa(currentLights[p], x3dom.nodeTypes.SpotLight))
				{
					sp['light'+p+'_Type']             = 2.0;
					sp['light'+p+'_On']               = (currentLights[p]._vf.on) ? 1.0 : 0.0;
					sp['light'+p+'_Direction']        = light_transform.multMatrixVec(currentLights[p]._vf.direction).toGL();
					sp['light'+p+'_Attenuation']      = currentLights[p]._vf.attenuation.toGL();
					sp['light'+p+'_Location']         = light_transform.multMatrixPnt(currentLights[p]._vf.location).toGL();
					sp['light'+p+'_Radius']           = currentLights[p]._vf.radius;
					sp['light'+p+'_BeamWidth']        = currentLights[p]._vf.beamWidth;
					sp['light'+p+'_CutOffAngle']      = currentLights[p]._vf.cutOffAngle;
					sp['light'+p+'_ShadowIntensity']  = currentLights[p]._vf.shadowIntensity;
					sp['light'+p+'_ShadowCascades']   = currentLights[p]._vf.shadowCascades;
					sp['light'+p+'_ShadowOffset']     = Math.max(0.0,Math.min(1.0,currentLights[p]._vf.shadowOffset));
				}
			}
		
			gl.drawArrays(gl.TRIANGLES,0,6);

			//cleanup
            var nk = shadowIndex + 1;
			for (k=0; k<nk; k++) {
				gl.activeTexture(gl.TEXTURE0 + k);
				gl.bindTexture(gl.TEXTURE_2D, null);	
			} 
			gl.disableVertexAttribArray(sp.position);
		}

        this.stateManager.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    };
	
	/*****************************************************************************
    * Blur texture associated with given fbo
    *****************************************************************************/	
	Context.prototype.blurTex = function(gl, scene, targetFbo, filterSize)
    {
		if (filterSize <= 0)
            return;
		else if (filterSize < 5)
			filterSize = 3;
		else if (filterSize < 7)
			filterSize = 5;
		else
            filterSize = 7;
		
		//first pass (horizontal blur), result stored in fboBlur
		var width = targetFbo.width;
		var height = targetFbo.height;
		var fboBlur = null;
		
		for (var i=0, n=scene._webgl.fboBlur.length; i<n; i++)
			if (height == scene._webgl.fboBlur[i].height) {
                fboBlur = scene._webgl.fboBlur[i];
                break; // THINKABOUTME
            }

		this.stateManager.bindFramebuffer(gl.FRAMEBUFFER, fboBlur.fbo);
		this.stateManager.viewport(0, 0, width, height);
		
		this.stateManager.enable(gl.BLEND);
		this.stateManager.blendFunc(gl.ONE, gl.ZERO);
		this.stateManager.disable(gl.CULL_FACE);
		this.stateManager.disable(gl.DEPTH_TEST);
		
		gl.clearColor(1.0, 1.0, 1.0, 0.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		var sp = this.cache.getShader(gl, x3dom.shader.BLUR);

        this.stateManager.useProgram(sp);
		
		//initialize Data for post processing
		gl.bindBuffer(gl.ARRAY_BUFFER, scene._webgl.ppBuffer);
		gl.vertexAttribPointer(sp.position, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(sp.position);
		
		sp.pixelSizeHor = 1.0/width;
		sp.pixelSizeVert = 1.0/height;
		sp.filterSize = filterSize;
		sp.horizontal = true;
		
		sp.texture = 0;
		
		//bind texture 
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, targetFbo.tex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		
		gl.drawArrays(gl.TRIANGLES,0,6);
		
		//second pass (vertical blur), result stored in targetFbo
		this.stateManager.bindFramebuffer(gl.FRAMEBUFFER, targetFbo.fbo);
		
		gl.clearColor(1.0, 1.0, 1.0, 0.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		sp.horizontal = false;
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, fboBlur.tex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.drawArrays(gl.TRIANGLES,0,6);

		//cleanup
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.disableVertexAttribArray(sp.position);
        gl.flush();

        this.stateManager.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        this.stateManager.bindFramebuffer(gl.FRAMEBUFFER, null);
		this.stateManager.viewport(0, 0, this.canvas.width, this.canvas.height);
	};
	
    return setupContext;

})();
