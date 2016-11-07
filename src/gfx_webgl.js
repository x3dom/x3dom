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
    "use strict";

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
        var validContextNames = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d'];

        if (tryWebGL2) {
            validContextNames = ['experimental-webgl2'].concat(validContextNames);
        }

        var ctx = null;

        // TODO; FIXME; this is an ugly hack, don't look for elements like this 
        // (e.g., Bindable nodes may only exist in backend etc.)
        var envNodes   = x3dElem.getElementsByTagName("Environment");
        var ssaoEnabled = (envNodes && envNodes[0] && envNodes[0].hasAttribute("SSAO") && 
                    envNodes[0].getAttribute("SSAO").toLowerCase() === 'true') ? true : false;

        // Context creation params
        var ctxAttribs = {
            alpha: true,
            depth: true,
            stencil: true,
            antialias: !ssaoEnabled,
            premultipliedAlpha: false,
            preserveDrawingBuffer: true,
            failIfMajorPerformanceCaveat : true
        };

        for (var i = 0; i < validContextNames.length; i++) {
            try {
				
                ctx = canvas.getContext(validContextNames[i], ctxAttribs);

                //If context creation fails, retry the creation with failIfMajorPerformanceCaveat = false
                if ( !ctx ) {
                    x3dom.caps.RENDERMODE = "SOFTWARE";
                    ctxAttribs.failIfMajorPerformanceCaveat = false;
                    ctx = canvas.getContext(validContextNames[i], ctxAttribs);
                }

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
                        x3dom.caps.INDEX_UINT = ctx.getExtension("OES_element_index_uint");
                        x3dom.caps.FP_TEXTURES = ctx.getExtension("OES_texture_float");
                        x3dom.caps.FPL_TEXTURES = ctx.getExtension("OES_texture_float_linear");
                        x3dom.caps.STD_DERIVATIVES = ctx.getExtension("OES_standard_derivatives");
                        x3dom.caps.DRAW_BUFFERS = ctx.getExtension("WEBGL_draw_buffers");
						x3dom.caps.DEPTH_TEXTURE = ctx.getExtension("WEBGL_depth_texture");
                        x3dom.caps.DEBUGRENDERINFO = ctx.getExtension("WEBGL_debug_renderer_info");
						x3dom.caps.EXTENSIONS = ctx.getSupportedExtensions();
						
						//Enabled WebGL2 breaks picking if we use the depth_texture extension for the picking fbo
						if ( x3dom.Utils.isWebGL2Enabled() )
						{
							x3dom.caps.DEPTH_TEXTURE = null;
						}
                        
                        if ( x3dom.caps.DEBUGRENDERINFO ) {
                            x3dom.caps.UNMASKED_RENDERER_WEBGL = ctx.getParameter( x3dom.caps.DEBUGRENDERINFO.UNMASKED_RENDERER_WEBGL );
                            x3dom.caps.UNMASKED_VENDOR_WEBGL = ctx.getParameter( x3dom.caps.DEBUGRENDERINFO.UNMASKED_VENDOR_WEBGL );
                        } else {
                            x3dom.caps.UNMASKED_RENDERER_WEBGL = "";
                            x3dom.caps.UNMASKED_VENDOR_WEBGL = "";
                        }

                        var extString = x3dom.caps.EXTENSIONS.toString().replace(/,/g, ", ");
                        x3dom.debug.logInfo(validContextNames[i] + " context found\nVendor: " + x3dom.caps.VENDOR +
                            " " + x3dom.caps.UNMASKED_VENDOR_WEBGL + ", Renderer: " + x3dom.caps.RENDERER +
                            " " + x3dom.caps.UNMASKED_RENDERER_WEBGL + ", " + "Version: " + x3dom.caps.VERSION + ", " +
                            "ShadingLangV.: " + x3dom.caps.SHADING_LANGUAGE_VERSION
                            + ", MSAA samples: " + x3dom.caps.SAMPLES + "\nExtensions: " + extString);

                        if (x3dom.caps.INDEX_UINT) {
                            x3dom.Utils.maxIndexableCoords = 4294967295;
                        }

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
            catch (e) { x3dom.debug.logWarning(e); }
        }
        return null;
    }


    /*****************************************************************************
     * Setup GL objects for given shape
     *****************************************************************************/
    Context.prototype.setupShape = function (gl, drawable, viewarea) {
        var q = 0, q6;
        var textures, t;
        var vertices, positionBuffer;
        var texCoordBuffer, normalBuffer, colorBuffer;
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
                    q6 = 6 * q;

                    if (shape._dirty.positions == true || shape._dirty.indexes == true) {
                        if (shape._webgl.shader.position !== undefined) {
                            shape._webgl.indexes[q] = geoNode._mesh._indices[q];

                            gl.deleteBuffer(shape._webgl.buffers[q6]);

                            indicesBuffer = gl.createBuffer();
                            shape._webgl.buffers[q6] = indicesBuffer;

                            // explicitly check first positions array for consistency
                            if (x3dom.caps.INDEX_UINT && (geoNode._mesh._positions[0].length / 3 > 65535)) {
                                indexArray = new Uint32Array(shape._webgl.indexes[q]);
                                shape._webgl.indexType = gl.UNSIGNED_INT;
                            }
                            else {
                                indexArray = new Uint16Array(shape._webgl.indexes[q]);
                                shape._webgl.indexType = gl.UNSIGNED_SHORT;
                            }

                            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
                            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);

                            indexArray = null;

                            // vertex positions
                            shape._webgl.positions[q] = geoNode._mesh._positions[q];

                            // TODO; don't delete VBO but use glMapBuffer() and DYNAMIC_DRAW
                            gl.deleteBuffer(shape._webgl.buffers[q6 + 1]);

                            positionBuffer = gl.createBuffer();
                            shape._webgl.buffers[q6 + 1] = positionBuffer;

                            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape._webgl.buffers[q6]);

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

                            gl.deleteBuffer(shape._webgl.buffers[q6 + 4]);

                            colorBuffer = gl.createBuffer();
                            shape._webgl.buffers[q6 + 4] = colorBuffer;

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

                            gl.deleteBuffer(shape._webgl.buffers[q6 + 2]);

                            normalBuffer = gl.createBuffer();
                            shape._webgl.buffers[q6 + 2] = normalBuffer;

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

                            gl.deleteBuffer(shape._webgl.buffers[q6 + 3]);

                            texCoordBuffer = gl.createBuffer();
                            shape._webgl.buffers[q6 + 3] = texCoordBuffer;

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

                    if (shape._dirty.specialAttribs == true) {
                        if (shape._webgl.shader.particleSize !== undefined) {
                            var szArr = geoNode._vf.size.toGL();

                            if (szArr.length) {
                                gl.deleteBuffer(shape._webgl.buffers[q6 + 5]);
                                shape._webgl.buffers[q6 + 5] = gl.createBuffer();

                                gl.bindBuffer(gl.ARRAY_BUFFER, shape._webgl.buffers[q6 + 5]);
                                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(szArr), gl.STATIC_DRAW);
                            }

                            shape._dirty.specialAttribs = false;
                        }
                        // Maybe other special attribs here, though e.g. AFAIK only BG (which not handled here) has ids.
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
                   x3dom.isa(geoNode, x3dom.nodeTypes.PopGeometry)    ||
                   x3dom.isa(geoNode, x3dom.nodeTypes.ExternalGeometry)) &&
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
                        var q6 = 6 * q;

                        if (sp.position !== undefined) {
                            gl.deleteBuffer(this._webgl.buffers[q6 + 1]);
                            gl.deleteBuffer(this._webgl.buffers[q6]);
                        }

                        if (sp.normal !== undefined) {
                            gl.deleteBuffer(this._webgl.buffers[q6 + 2]);
                        }

                        if (sp.texcoord !== undefined) {
                            gl.deleteBuffer(this._webgl.buffers[q6 + 3]);
                        }

                        if (sp.color !== undefined) {
                            gl.deleteBuffer(this._webgl.buffers[q6 + 4]);
                        }

                        if (sp.id !== undefined) {
                            gl.deleteBuffer(this._webgl.buffers[q6 + 5]);
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

                    if (delGL) {
                        delete this._webgl;

                        // be optimistic, one shape removed makes room for another one
                        x3dom.BinaryContainerLoader.outOfMemory = false;
                    }
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
            indexType: gl.UNSIGNED_SHORT,
            coordType: gl.FLOAT,
            normalType: gl.FLOAT,
            texCoordType: gl.FLOAT,
            colorType: gl.FLOAT,
            texture: [],
            dirtyLighting: x3dom.Utils.checkDirtyLighting(viewarea),
            imageGeometry: 0,   // 0 := no IG,  1 := indexed IG, -1  := non-indexed IG
            binaryGeometry: 0,  // 0 := no BG,  1 := indexed BG, -1  := non-indexed BG
            popGeometry: 0,     // 0 : no PG,  1 : indexed PG, -1  : non-indexed PG
            externalGeometry: 0 // 0 : no EG,  1 : indexed EG, -1 : non-indexed EG
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
        if (x3dom.isa(geoNode, x3dom.nodeTypes.X3DBinaryContainerGeometryNode))
        {
            shape._webgl.primType = [];

            for (var primCnt = 0; primCnt < geoNode._vf.primType.length; ++primCnt)
            {
                shape._webgl.primType.push(x3dom.Utils.primTypeDic(gl, geoNode._vf.primType[primCnt]));
            }
        }
        else
        {
            shape._webgl.primType = x3dom.Utils.primTypeDic(gl, geoNode._mesh._primType);
        }

        // Binary container geometries need special handling
        if (x3dom.isa(geoNode, x3dom.nodeTypes.ExternalGeometry))
        {
            geoNode.updateRenderData(shape, sp, gl, viewarea, this);
        }
        else if (x3dom.isa(geoNode, x3dom.nodeTypes.BinaryGeometry))
        {
            x3dom.BinaryContainerLoader.setupBinGeo(shape, sp, gl, viewarea, this);
        }
        else if (x3dom.isa(geoNode, x3dom.nodeTypes.PopGeometry))
        {
            x3dom.BinaryContainerLoader.setupPopGeo(shape, sp, gl, viewarea, this);
        }
        else if (x3dom.isa(geoNode, x3dom.nodeTypes.ImageGeometry))
        {
            x3dom.BinaryContainerLoader.setupImgGeo(shape, sp, gl, viewarea, this);
        }
        else // No special BinaryMesh, but IFS or similar
        {
            for (q = 0; q < shape._webgl.positions.length; q++)
            {
                q6 = 6 * q;

                if (sp.position !== undefined) {
                    // bind indices for drawElements() call
                    indicesBuffer = gl.createBuffer();
                    shape._webgl.buffers[q6] = indicesBuffer;

                    // explicitly check first positions array for consistency
                    if (x3dom.caps.INDEX_UINT && (shape._webgl.positions[0].length / 3 > 65535)) {
                        indexArray = new Uint32Array(shape._webgl.indexes[q]);
                        shape._webgl.indexType = gl.UNSIGNED_INT;
                    }
                    else {
                        indexArray = new Uint16Array(shape._webgl.indexes[q]);
                        shape._webgl.indexType = gl.UNSIGNED_SHORT;
                    }

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);

                    indexArray = null;

                    positionBuffer = gl.createBuffer();
                    shape._webgl.buffers[q6 + 1] = positionBuffer;
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
                    normalBuffer = gl.createBuffer();
                    shape._webgl.buffers[q6 + 2] = normalBuffer;

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
                    shape._webgl.buffers[q6 + 3] = texcBuffer;

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
                    colorBuffer = gl.createBuffer();
                    shape._webgl.buffers[q6 + 4] = colorBuffer;

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
                if (sp.particleSize !== undefined) {
                    var sizeArr = geoNode._vf.size.toGL();

                    if (sizeArr.length) {
                        var sizeBuffer = gl.createBuffer();
                        shape._webgl.buffers[q6 + 5] = sizeBuffer;

                        gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizeArr), gl.STATIC_DRAW);
                    }
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
            if (bgnd._cleanupGLObjects) {
                bgnd._cleanupGLObjects();
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
                    true, bgnd._vf.crossOrigin, true, false);
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
                    true, bgnd._vf.crossOrigin, false, false);

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

                if (sky.length != colors.length) {
                    x3dom.debug.logError("Number of background colors and corresponding angles are different!");
                    var minArrayLength = (sky.length < colors.length) ? sky.length : colors.length;
                    sky.length = minArrayLength;
                    colors.length = minArrayLength;
                }

                var interp = new x3dom.nodeTypes.ColorInterpolator();

                interp._vf.key = new x3dom.fields.MFFloat(sky);
                interp._vf.keyValue = new x3dom.fields.MFColor(colors);

                for (i = 0; i < N; i++) {
                    interp._vf.set_fraction = i / (N - 1.0);

                    interp.fieldChanged("set_fraction");
                    tmp[i] = interp._vf.value_changed;
                }

                tmp.reverse();

                var alpha = Math.floor((1.0 - bgnd.getTransparency()) * 255);

                for (i = 0; i < tmp.length; i++) {
                    arr.push(Math.floor(tmp[i].r * 255),
                             Math.floor(tmp[i].g * 255),
                             Math.floor(tmp[i].b * 255),
                             alpha);
                }

                var pixels = new Uint8Array(arr);
                var format = gl.RGBA;

                N = pixels.length / 4;

                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
                gl.texImage2D(gl.TEXTURE_2D, 0, format, 1, N, 0, format, gl.UNSIGNED_BYTE, pixels);
                gl.bindTexture(gl.TEXTURE_2D, null);

                bgnd._webgl.shader = this.cache.getShader(gl, x3dom.shader.BACKGROUND_SKYTEXTURE);
            }
            else {
                // Impl. gradient bg etc., e.g. via canvas 2d? But can be done via CSS anyway...
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

            bgnd._cleanupGLObjects = function () {
                var sp = this._webgl.shader;

                if (sp.position !== undefined) {
                    gl.deleteBuffer(this._webgl.buffers[0]);
                    gl.deleteBuffer(this._webgl.buffers[1]);
                }
                if (sp.texcoord !== undefined) {
                    gl.deleteBuffer(this._webgl.buffers[2]);
                }
            };
        }

        bgnd._webgl.render = function (gl, mat_view, mat_proj)
        {
            var sp = bgnd._webgl.shader;
            var alpha = 1.0 - bgnd.getTransparency();

            var mat_scene = null;
            var projMatrix_22 = mat_proj._22,
                projMatrix_23 = mat_proj._23;
            var camPos = mat_view.e3();

            if ((sp !== undefined && sp !== null) &&
                (sp.texcoord !== undefined && sp.texcoord !== null) &&
                (bgnd._webgl.texture !== undefined && bgnd._webgl.texture !== null)) {
                gl.clearColor(0, 0, 0, alpha);
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

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
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

                gl.clear(gl.DEPTH_BUFFER_BIT);
            }
            else if (!sp || !bgnd._webgl.texture ||
                    (bgnd._webgl.texture.textureCubeReady !== undefined &&
                     bgnd._webgl.texture.textureCubeReady !== true)) {
                var bgCol = bgnd.getSkyColor().toGL();

                gl.clearColor(bgCol[0], bgCol[1], bgCol[2], alpha);
                gl.clearDepth(1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
            }
            else {
                gl.clearColor(0, 0, 0, alpha);
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

                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                }
                else {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, bgnd._webgl.texture);

                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
					
					if ( bgnd._vf.scaling && bgnd._webgl.texture.ready )
					{
                        var ratio       = 1.0;
						var viewport    = new x3dom.fields.SFVec2f(that.canvas.width, that.canvas.height);
						var texture     = new x3dom.fields.SFVec2f(bgnd._webgl.texture.width, bgnd._webgl.texture.height);
                                          
                        if ( viewport.x > viewport.y )
                        {
                            ratio = viewport.x / texture.x
                            texture.x = viewport.x;
                            texture.y = texture.y * ratio;
                        }
                        else
                        {
                            ratio = viewport.y / texture.y
                            texture.y = viewport.y;
                            texture.x = texture.x * ratio;
                        }
                        
						var scale       = viewport.divideComponents( texture );
						var translation = texture.subtract( viewport ).multiply( 0.5 ).divideComponents( texture );
					}
					else
					{
						var scale       = new x3dom.fields.SFVec2f(1.0, 1.0);
						var translation = new x3dom.fields.SFVec2f(0.0, 0.0);
					}
					
					sp.scale = scale.toGL();
					sp.translation = translation.toGL();
                }

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bgnd._webgl.buffers[0]);
                gl.bindBuffer(gl.ARRAY_BUFFER, bgnd._webgl.buffers[1]);
                gl.vertexAttribPointer(sp.position, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(sp.position);

                gl.drawElements(bgnd._webgl.primType, bgnd._webgl.indexes.length, gl.UNSIGNED_SHORT, 0);

                gl.disableVertexAttribArray(sp.position);

                gl.activeTexture(gl.TEXTURE0);
                if (bgnd._webgl.texture.textureCubeReady) {
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
                }
                else {
                    gl.bindTexture(gl.TEXTURE_2D, null);
                }

                gl.clear(gl.DEPTH_BUFFER_BIT);
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

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
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
    Context.prototype.renderShadowPass = function (gl, viewarea, mat_scene, mat_view, targetFbo, camOffset, isCameraView)
    {
        var scene = viewarea._scene;

        var indicesReady = false;

        this.stateManager.bindFramebuffer(gl.FRAMEBUFFER, targetFbo.fbo);
        this.stateManager.viewport(0, 0, targetFbo.width, targetFbo.height);

        gl.clearColor(1.0, 1.0, 1.0, 0.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.stateManager.depthFunc(gl.LEQUAL);
        this.stateManager.enable(gl.DEPTH_TEST);
        this.stateManager.enable(gl.CULL_FACE);
        this.stateManager.disable(gl.BLEND);

        var bgCenter = x3dom.fields.SFVec3f.NullVector.toGL();
        var bgSize = x3dom.fields.SFVec3f.OneVector.toGL();

        var env = scene.getEnvironment();
        var excludeTrans = env._vf.shadowExcludeTransparentObjects;

        var i, n = scene.drawableCollection.length;

        for (i = 0; i < n; i++)
        {
            var drawable = scene.drawableCollection.get(i);
            var trafo = drawable.transform;
            var shape = drawable.shape;

            var s_gl = shape._webgl;

            if (!s_gl || (excludeTrans && drawable.sortType == 'transparent')) {
                continue;
            }

            var s_geo = shape._cf.geometry.node;
            var s_app = shape._cf.appearance.node;
            var s_msh = s_geo._mesh;

            var properties = shape.getShaderProperties(viewarea);

            //Generate Dynamic picking shader
            var sp = this.cache.getShaderByProperties(gl, shape, properties, null, true);

            if (!sp) {   // error
                return;
            }

            //Bind shader
            this.stateManager.useProgram(sp);

            sp.cameraView = isCameraView;
            sp.offset = camOffset;

            sp.modelViewProjectionMatrix = mat_scene.mult(trafo).toGL();

            // BoundingBox stuff
            if (s_gl.coordType != gl.FLOAT) {
                if (!s_gl.popGeometry && (x3dom.Utils.isUnsignedType(s_geo._vf.coordType))) {
                    sp.bgCenter = s_geo.getMin().toGL();
                }
                else {
                    sp.bgCenter = s_geo._vf.position.toGL();
                }
                sp.bgSize = s_geo._vf.size.toGL();
                sp.bgPrecisionMax = s_geo.getPrecisionMax('coordType');
            }

            //===========================================================================
            // Set ClipPlanes
            //===========================================================================
            if (shape._clipPlanes) {
                sp.modelViewMatrix = mat_view.mult(trafo).toGL();
                sp.viewMatrixInverse = mat_view.inverse().toGL();
                for (var cp = 0; cp < shape._clipPlanes.length; cp++) {
                    var clip_plane = shape._clipPlanes[cp].plane;
                    var clip_trafo = shape._clipPlanes[cp].trafo;

                    sp['clipPlane' + cp + '_Plane'] = clip_trafo.multMatrixPlane(clip_plane._vf.plane).toGL();
                    sp['clipPlane' + cp + '_CappingStrength'] = clip_plane._vf.cappingStrength;
                    sp['clipPlane' + cp + '_CappingColor'] = clip_plane._vf.cappingColor.toGL();
                }
            }

            //ImageGeometry stuff
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
            else if ((s_gl.binaryGeometry != 0 || s_gl.externalGeometry != 0) && s_geo._vf["idsPerVertex"] == true) { //MultiPart
                var shader = s_app._shader;
                if(shader && x3dom.isa(s_app._shader, x3dom.nodeTypes.CommonSurfaceShader)) {
                    if (shader.getMultiVisibilityMap()) {
                        sp.multiVisibilityMap = 0;
                        var visTex = x3dom.Utils.findTextureByName(s_gl.texture, "multiVisibilityMap");
                        sp.multiVisibilityWidth = visTex.texture.width;
                        sp.multiVisibilityHeight = visTex.texture.height;
                        gl.activeTexture(gl.TEXTURE0);
                        gl.bindTexture(gl.TEXTURE_2D, visTex.texture);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    }
                }
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

            //===========================================================================
            // Set DepthMode
            //===========================================================================
            var depthMode = s_app ? s_app._cf.depthMode.node : null;
            if (depthMode)
            {
                if (depthMode._vf.enableDepthTest)
                {
                    //Enable Depth Test
                    this.stateManager.enable(gl.DEPTH_TEST);

                    //Set Depth Mask
                    this.stateManager.depthMask(!depthMode._vf.readOnly);

                    //Set Depth Function
                    this.stateManager.depthFunc(x3dom.Utils.depthFunc(gl, depthMode._vf.depthFunc));

                    //Set Depth Range
                    this.stateManager.depthRange(depthMode._vf.zNearRange, depthMode._vf.zFarRange);
                }
                else
                {
                    //Disable Depth Test
                    this.stateManager.disable(gl.DEPTH_TEST);
                }
            }
            else //Set Defaults
            {
                this.stateManager.enable(gl.DEPTH_TEST);
                this.stateManager.depthMask(true);
                this.stateManager.depthFunc(gl.LEQUAL);
            }

            //PopGeometry: adapt LOD and set shader variables
            if (s_gl.popGeometry) {
                var model_view = mat_view.mult(trafo);
                // FIXME; viewarea's width/height twice as big as render buffer size, which leads to too high precision
                // the correct viewarea here would be one that holds this half-sized render buffer
                this.updatePopState(drawable, s_geo, sp, s_gl, scene, model_view, viewarea, this.x3dElem.runtime.fps);
            }

            var q_n;
            if (s_gl.externalGeometry != 0)
            {
                q_n = s_gl.primType.length;
            }
            else
            {
                q_n = s_gl.positions.length;
            }
            for (var q = 0; q < q_n; q++) {
                var q6 = 6 * q;
                var v, v_n, offset;

                if ( !(sp.position !== undefined && s_gl.buffers[q6 + 1] && (s_gl.indexes[q] || s_gl.externalGeometry != 0)) )
                    continue;

                indicesReady = false;

                // set buffers
                if (s_gl.buffers[q6]) {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, s_gl.buffers[q6]);
                    indicesReady = true;
                }

                if (sp.position !== undefined && s_gl.buffers[q6 + 1]) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q6 + 1]);
                    gl.vertexAttribPointer(sp.position,
                        s_msh._numPosComponents, s_gl.coordType, false,
                        shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.position);
                }

                if (sp.id !== undefined && s_gl.buffers[q6 + 5]) {

                    gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q6 + 5]);
                    //texture coordinate hack for IDs
                    if ((s_gl.binaryGeometry != 0 || s_gl.externalGeometry != 0) && s_geo._vf["idsPerVertex"] == true)
                    {
                        gl.vertexAttribPointer(sp.id,
                            1, gl.FLOAT, false,
                            4, 0);
                        gl.enableVertexAttribArray(sp.id);
                    }
                    else
                    {
                        /*
                         gl.vertexAttribPointer(sp.id,
                         1, gl.FLOAT, false,
                         shape._idStrideOffset[0], shape._idStrideOffset[1]);
                         gl.enableVertexAttribArray(sp.id);
                         */
                    }
                }

                // render mesh
                if ( indicesReady && (s_gl.binaryGeometry > 0 || s_gl.popGeometry > 0) ) {
                    for (v = 0, offset = 0, v_n = s_geo._vf.vertexCount.length; v < v_n; v++) {
                        gl.drawElements(s_gl.primType[v], s_geo._vf.vertexCount[v], s_gl.indexType,
                            x3dom.Utils.getByteAwareOffset(offset, s_gl.indexType, gl));
                        offset += s_geo._vf.vertexCount[v];
                    }
                }
                else if (s_gl.binaryGeometry < 0 || s_gl.popGeometry < 0 || s_gl.imageGeometry) {
                    for (v = 0, offset = 0, v_n = s_geo._vf.vertexCount.length; v < v_n; v++) {
                        gl.drawArrays(s_gl.primType[v], offset, s_geo._vf.vertexCount[v]);
                        offset += s_geo._vf.vertexCount[v];
                    }
                }
                //ExternalGeometry: indexed rendering (picking pass)
                else if (s_gl.externalGeometry == 1)
                {
                    gl.drawElements(s_gl.primType[q], s_gl.drawCount[q], s_gl.indexType, s_gl.indexOffset[q]);
                }
                //ExternalGeometry: non-indexed rendering (picking pass)
                else if (s_gl.externalGeometry == -1)
                {
                    gl.drawArrays(s_gl.primType[q], 0, s_gl.drawCount[q]);
                }
                else if (s_geo.hasIndexOffset()) {
                    var indOff = shape.tessellationProperties();
                    for (v = 0, v_n = indOff.length; v < v_n; v++) {
                        gl.drawElements(s_gl.primType, indOff[v].count, s_gl.indexType,
                            indOff[v].offset * x3dom.Utils.getOffsetMultiplier(s_gl.indexType, gl));
                    }
                }
                else if (s_gl.indexes[q].length == 0) {
                    gl.drawArrays(s_gl.primType, 0, s_gl.positions[q].length / 3);
                }
                else {
                    gl.drawElements(s_gl.primType, s_gl.indexes[q].length, s_gl.indexType, 0);
                }

                gl.disableVertexAttribArray(sp.position);

                if (sp.texcoord !== undefined && s_gl.buffers[q6 + 3]) {
                    gl.disableVertexAttribArray(sp.texcoord);
                }
                if (sp.color !== undefined && s_gl.buffers[q6 + 4]) {
                    gl.disableVertexAttribArray(sp.color);
                }
                if (sp.id !== undefined && s_gl.buffers[q6 + 5]) {
                    gl.disableVertexAttribArray(sp.id);
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

        }

        if (x3dom.Utils.needLineWidth) {
            this.stateManager.lineWidth(1);
        }

        if (depthMode) {
            this.stateManager.enable(gl.DEPTH_TEST);
            this.stateManager.depthMask(true);
            this.stateManager.depthFunc(gl.LEQUAL);
            this.stateManager.depthRange(0, 1);
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
        var ps = scene._webgl.pickScale;
        var bufHeight = scene._webgl.fboPick.height;
        var x = lastX * ps;
        var y = (bufHeight - 1) - lastY * ps;

        var indicesReady = false;

        this.stateManager.bindFramebuffer(gl.FRAMEBUFFER, scene._webgl.fboPick.fbo);
        this.stateManager.viewport(0, 0, scene._webgl.fboPick.width, bufHeight);

        //gl.scissor(x, y, width, height);
        //gl.enable(gl.SCISSOR_TEST);

        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var viewarea = scene.drawableCollection.viewarea;
        var env = scene.getEnvironment();
        var n = scene.drawableCollection.length;

        if (env._vf.smallFeatureCulling && env._lowPriorityThreshold < 1 && viewarea.isMovingOrAnimating()) {
            n = Math.floor(n * env._lowPriorityThreshold);
            if (!n && scene.drawableCollection.length)
                n = 1;   // render at least one object
        }

        var bgCenter = x3dom.fields.SFVec3f.NullVector.toGL();
        var bgSize = x3dom.fields.SFVec3f.OneVector.toGL();

        this.stateManager.depthFunc(gl.LEQUAL);
        this.stateManager.enable(gl.DEPTH_TEST);
        this.stateManager.enable(gl.CULL_FACE);
        this.stateManager.disable(gl.BLEND);

        if (x3dom.Utils.needLineWidth) {
            this.stateManager.lineWidth(2);     // bigger lines for better picking
        }

        for (var i = 0; i < n; i++)
        {
            var drawable = scene.drawableCollection.get(i);
            var trafo = drawable.transform;
            var shape = drawable.shape;
            var s_gl = shape._webgl;

            if (!s_gl || shape._objectID < 1 || !shape._vf.isPickable) {
                continue;
            }

            var s_geo = shape._cf.geometry.node;
            var s_app = shape._cf.appearance.node;
            var s_msh = s_geo._mesh;

            //Get shapes shader properties
            var properties = shape.getShaderProperties(viewarea);

            //Generate Dynamic picking shader
            var sp = this.cache.getShaderByProperties(gl, shape, properties, pickMode);

            if (!sp) {   // error
                return;
            }

            //Bind shader
            this.stateManager.useProgram(sp);

            sp.modelMatrix = trafo.toGL();
            sp.modelViewProjectionMatrix = mat_scene.mult(trafo).toGL();

            sp.lowBit  = (shape._objectID & 255) / 255.0;
            sp.highBit = (shape._objectID >>> 8) / 255.0;

            sp.from = from.toGL();
            sp.sceneSize = sceneSize;

            // Set shadow ids if available
            if((s_gl.binaryGeometry != 0 || s_gl.externalGeometry != 0) && s_geo._vf["idsPerVertex"] == true) {
                sp.shadowIDs = (shape._vf.idOffset + x3dom.nodeTypes.Shape.objectID + 2);
            }

            // BoundingBox stuff
            if (s_gl.coordType != gl.FLOAT) {
                if (!s_gl.popGeometry && (x3dom.Utils.isUnsignedType(s_geo._vf.coordType))) {
                    sp.bgCenter = s_geo.getMin().toGL();
                }
                else {
                    sp.bgCenter = s_geo._vf.position.toGL();
                }
                sp.bgSize = s_geo._vf.size.toGL();
                sp.bgPrecisionMax = s_geo.getPrecisionMax('coordType');
            }

            if (pickMode == 1 && s_gl.colorType != gl.FLOAT) {
                sp.bgPrecisionColMax = s_geo.getPrecisionMax('colorType');
            }

            if (pickMode == 2 && s_gl.texCoordType != gl.FLOAT) {
                sp.bgPrecisionTexMax = s_geo.getPrecisionMax('texCoordType');
            }

            //===========================================================================
            // Set ClipPlanes
            //===========================================================================
            if (shape._clipPlanes) {
                sp.modelViewMatrix = mat_view.mult(trafo).toGL();
                sp.viewMatrixInverse = mat_view.inverse().toGL();
                for (var cp = 0; cp < shape._clipPlanes.length; cp++) {
                    var clip_plane = shape._clipPlanes[cp].plane;
                    var clip_trafo = shape._clipPlanes[cp].trafo;

                    sp['clipPlane' + cp + '_Plane'] = clip_trafo.multMatrixPlane(clip_plane._vf.plane).toGL();
                    sp['clipPlane' + cp + '_CappingStrength'] = clip_plane._vf.cappingStrength;
                    sp['clipPlane' + cp + '_CappingColor'] = clip_plane._vf.cappingColor.toGL();
                }
            }

            //ImageGeometry stuff
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
            else if ((s_gl.binaryGeometry != 0 || s_gl.externalGeometry != 0) && s_geo._vf["idsPerVertex"] == true) { //MultiPart
                var shader = s_app._shader;
                if(shader && x3dom.isa(s_app._shader, x3dom.nodeTypes.CommonSurfaceShader)) {
                    if (shader.getMultiVisibilityMap()) {
                        sp.multiVisibilityMap = 0;
                        var visTex = x3dom.Utils.findTextureByName(s_gl.texture, "multiVisibilityMap");
                        sp.multiVisibilityWidth = visTex.texture.width;
                        sp.multiVisibilityHeight = visTex.texture.height;
                        gl.activeTexture(gl.TEXTURE0);
                        gl.bindTexture(gl.TEXTURE_2D, visTex.texture);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    }
                }
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


            //===========================================================================
            // Set DepthMode
            //===========================================================================
            var depthMode = s_app ? s_app._cf.depthMode.node : null;
            if (depthMode)
            {
                if (depthMode._vf.enableDepthTest)
                {
                    //Enable Depth Test
                    this.stateManager.enable(gl.DEPTH_TEST);

                    //Set Depth Mask
                    this.stateManager.depthMask(!depthMode._vf.readOnly);

                    //Set Depth Function
                    this.stateManager.depthFunc(x3dom.Utils.depthFunc(gl, depthMode._vf.depthFunc));

                    //Set Depth Range
                    this.stateManager.depthRange(depthMode._vf.zNearRange, depthMode._vf.zFarRange);
                }
                else
                {
                    //Disable Depth Test
                    this.stateManager.disable(gl.DEPTH_TEST);
                }
            }
            else //Set Defaults
            {
                this.stateManager.enable(gl.DEPTH_TEST);
                this.stateManager.depthMask(true);
                this.stateManager.depthFunc(gl.LEQUAL);
            }

            //PopGeometry: adapt LOD and set shader variables
            if (s_gl.popGeometry) {
                var model_view = mat_view.mult(trafo);
                // FIXME; viewarea's width/height twice as big as render buffer size, which leads to too high precision
                // the correct viewarea here would be one that holds this half-sized render buffer
                this.updatePopState(drawable, s_geo, sp, s_gl, scene, model_view, viewarea, this.x3dElem.runtime.fps);
            }

            var q_n;
            if (s_gl.externalGeometry != 0)
            {
                q_n = s_gl.primType.length;
            }
            else
            {
                q_n = s_gl.positions.length;
            }
            for (var q = 0; q < q_n; q++) {
                var q6 = 6 * q;
                var v, v_n, offset;

                if ( !(sp.position !== undefined && s_gl.buffers[q6 + 1] && (s_gl.indexes[q] || s_gl.externalGeometry != 0)) )
                    continue;

                indicesReady = false;

                // set buffers
                if (s_gl.buffers[q6]) {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, s_gl.buffers[q6]);
                    indicesReady = true;
                }

                if (sp.position !== undefined && s_gl.buffers[q6 + 1]) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q6 + 1]);
                    gl.vertexAttribPointer(sp.position,
                        s_msh._numPosComponents, s_gl.coordType, false,
                        shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.position);
                }
                if (pickMode == 1 && sp.color !== undefined && s_gl.buffers[q6 + 4]) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q6 + 4]);
                    gl.vertexAttribPointer(sp.color,
                        s_msh._numColComponents, s_gl.colorType, false,
                        shape._colorStrideOffset[0], shape._colorStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.color);
                }

                if (pickMode == 2 && sp.texcoord !== undefined && s_gl.buffers[q6 + 3]) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q6 + 3]);
                    gl.vertexAttribPointer(sp.texcoord,
                        s_msh._numTexComponents, s_gl.texCoordType, false,
                        shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.texcoord);
                }

                if (sp.id !== undefined && s_gl.buffers[q6 + 5]) {

                    gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q6 + 5]);
                    //texture coordinate hack for IDs
                    if ((s_gl.binaryGeometry != 0 || s_gl.externalGeometry != 0) && s_geo._vf["idsPerVertex"] == true)
                    {
                        gl.vertexAttribPointer(sp.id,
                            1, gl.FLOAT, false,
                            4, 0);
                        gl.enableVertexAttribArray(sp.id);
                    }
                    else
                    {
                        /*
                         gl.vertexAttribPointer(sp.id,
                         1, gl.FLOAT, false,
                         shape._idStrideOffset[0], shape._idStrideOffset[1]);
                         gl.enableVertexAttribArray(sp.id);
                         */
                    }
                }

                // render mesh
                if ( indicesReady && (s_gl.binaryGeometry > 0 || s_gl.popGeometry > 0) ) {
                    for (v = 0, offset = 0, v_n = s_geo._vf.vertexCount.length; v < v_n; v++) {
                        gl.drawElements(s_gl.primType[v], s_geo._vf.vertexCount[v], s_gl.indexType,
                                        x3dom.Utils.getByteAwareOffset(offset, s_gl.indexType, gl));
                        offset += s_geo._vf.vertexCount[v];
                    }
                }
                else if (s_gl.binaryGeometry < 0 || s_gl.popGeometry < 0 || s_gl.imageGeometry) {
                    for (v = 0, offset = 0, v_n = s_geo._vf.vertexCount.length; v < v_n; v++) {
                        gl.drawArrays(s_gl.primType[v], offset, s_geo._vf.vertexCount[v]);
                        offset += s_geo._vf.vertexCount[v];
                    }
                }
                //ExternalGeometry: indexed rendering (picking pass)
                else if (s_gl.externalGeometry == 1)
                {
                    gl.drawElements(s_gl.primType[q], s_gl.drawCount[q], s_gl.indexType, s_gl.indexOffset[q]);
                }
                //ExternalGeometry: non-indexed rendering (picking pass)
                else if (s_gl.externalGeometry == -1)
                {
                    gl.drawArrays(s_gl.primType[q], 0, s_gl.drawCount[q]);
                }
                else if (s_geo.hasIndexOffset()) {
                    var indOff = shape.tessellationProperties();
                    for (v = 0, v_n = indOff.length; v < v_n; v++) {
                        gl.drawElements(s_gl.primType, indOff[v].count, s_gl.indexType,
                            indOff[v].offset * x3dom.Utils.getOffsetMultiplier(s_gl.indexType, gl));
                    }
                }
                else if (s_gl.indexes[q].length == 0) {
                    gl.drawArrays(s_gl.primType, 0, s_gl.positions[q].length / 3);
                }
                else {
                    gl.drawElements(s_gl.primType, s_gl.indexes[q].length, s_gl.indexType, 0);
                }

                gl.disableVertexAttribArray(sp.position);

                if (sp.texcoord !== undefined && s_gl.buffers[q6 + 3]) {
                    gl.disableVertexAttribArray(sp.texcoord);
                }
                if (sp.color !== undefined && s_gl.buffers[q6 + 4]) {
                    gl.disableVertexAttribArray(sp.color);
                }
                if (sp.id !== undefined && s_gl.buffers[q6 + 5]) {
                    gl.disableVertexAttribArray(sp.id);
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
        }

        if (x3dom.Utils.needLineWidth) {
            this.stateManager.lineWidth(1);
        }
        
        if (depthMode) {
            this.stateManager.enable(gl.DEPTH_TEST);
            this.stateManager.depthMask(true);
            this.stateManager.depthFunc(gl.LEQUAL);
            this.stateManager.depthRange(0, 1);
        }

        gl.flush();

        try {
            // 4 = 1 * 1 * 4; then take width x height window (exception pickRect)
            var data = new Uint8Array(4 * width * height);

            gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);

            scene._webgl.fboPick.pixelData = data;
        }
        catch (se) {
            scene._webgl.fboPick.pixelData = [];
            // No Exception on file:// when starting with additional flags:
            //    chrome.exe --disable-web-security
            x3dom.debug.logException(se + " (cannot pick)");
        }

        //gl.disable(gl.SCISSOR_TEST);

        this.stateManager.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    /*****************************************************************************
     * Render single Shape
     *****************************************************************************/
    Context.prototype.renderShape = function (drawable, viewarea, slights, numLights, mat_view, mat_scene,
                                              mat_light, mat_proj, gl)
    {
		// Variable to indicate that the indices are successful bind
		var indicesReady = false;
		
        var shape = drawable.shape;
        var transform = drawable.transform;

        if (!shape || !shape._webgl || !transform) {
            x3dom.debug.logError("[Context|RenderShape] No valid Shape!");
            return;
        }

        var s_gl = shape._webgl;
        var sp = s_gl.shader;

        if (!sp) {
            x3dom.debug.logError("[Context|RenderShape] No Shader is set!");
            return;
        }

        var changed = this.stateManager.useProgram(sp);

        //===========================================================================
        // Set special Geometry variables
        //===========================================================================
        var s_app = shape._cf.appearance.node;
        var s_geo = shape._cf.geometry.node;
        var s_msh = s_geo._mesh;

        var scene = viewarea._scene;
        var tex = null;

        if (s_gl.coordType != gl.FLOAT) {
            if (!s_gl.popGeometry && (x3dom.Utils.isUnsignedType(s_geo._vf.coordType))) {
                sp.bgCenter = s_geo.getMin().toGL();
            }
            else {
                sp.bgCenter = s_geo._vf.position.toGL();
            }
            sp.bgSize = s_geo._vf.size.toGL();
            sp.bgPrecisionMax = s_geo.getPrecisionMax('coordType');
        }
        else {
            sp.bgCenter = [0, 0, 0];
            sp.bgSize = [1, 1, 1];
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
        // TODO: when no state/shader switch happens, all light/fog/... uniforms don't need to be set again
        var fog = scene.getFog();

        // THINKABOUTME: changed flag only works as long as lights and fog are global
        if (fog && changed) {
            sp.fogColor = fog._vf.color.toGL();
            sp.fogRange = fog._vf.visibilityRange;
            sp.fogType = (fog._vf.fogType == "LINEAR") ? 0.0 : 1.0;
        }

        //===========================================================================
        // Set Material
        //===========================================================================
        var mat = s_app ? s_app._cf.material.node : null;
        var shader = s_app ? s_app._shader : null;
        var twoSidedMat = false;

        var isUserDefinedShader = shader && x3dom.isa(shader, x3dom.nodeTypes.ComposedShader);

        if (s_gl.csshader) {
            sp.diffuseColor = shader._vf.diffuseFactor.toGL();
            sp.specularColor = shader._vf.specularFactor.toGL();
            sp.emissiveColor = shader._vf.emissiveFactor.toGL();
            sp.shininess = shader._vf.shininessFactor;
            sp.ambientIntensity = (shader._vf.ambientFactor.x +
                                   shader._vf.ambientFactor.y +
                                   shader._vf.ambientFactor.z) / 3;
            sp.transparency = 1.0 - shader._vf.alphaFactor;
            sp.environmentFactor = shader._vf.environmentFactor.x;

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
            if (shader.getMultiDiffuseAlphaMap()) {
                tex = x3dom.Utils.findTextureByName(s_gl.texture, "multiDiffuseAlphaMap");
                sp.multiDiffuseAlphaWidth = tex.texture.width;
                sp.multiDiffuseAlphaHeight = tex.texture.height;
            }
            if (shader.getMultiEmissiveAmbientMap()) {
                tex = x3dom.Utils.findTextureByName(s_gl.texture, "multiEmissiveAmbientMap");
                sp.multiEmissiveAmbientWidth = tex.texture.width;
                sp.multiEmissiveAmbientHeight = tex.texture.height;
            }
            if (shader.getMultiSpecularShininessMap()) {
                tex = x3dom.Utils.findTextureByName(s_gl.texture, "multiSpecularShininessMap");
                sp.multiSpecularShininessWidth = tex.texture.width;
                sp.multiSpecularShininessHeight = tex.texture.height;
            }
            if (shader.getMultiVisibilityMap()) {
                tex = x3dom.Utils.findTextureByName(s_gl.texture, "multiVisibilityMap");
                sp.multiVisibilityWidth = tex.texture.width;
                sp.multiVisibilityHeight = tex.texture.height;
            }
        }
        else if (mat) {
            sp.diffuseColor = mat._vf.diffuseColor.toGL();
            sp.specularColor = mat._vf.specularColor.toGL();
            sp.emissiveColor = mat._vf.emissiveColor.toGL();
            sp.shininess = mat._vf.shininess;
            sp.ambientIntensity = mat._vf.ambientIntensity;
            sp.transparency = mat._vf.transparency;
            sp.environmentFactor = 0.0;
            if (x3dom.isa(mat, x3dom.nodeTypes.TwoSidedMaterial)) {
                twoSidedMat = true;
                sp.backDiffuseColor = mat._vf.backDiffuseColor.toGL();
                sp.backSpecularColor = mat._vf.backSpecularColor.toGL();
                sp.backEmissiveColor = mat._vf.backEmissiveColor.toGL();
                sp.backShininess = mat._vf.backShininess;
                sp.backAmbientIntensity = mat._vf.backAmbientIntensity;
                sp.backTransparency = mat._vf.backTransparency;
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
            if (isUserDefinedShader) {
                for (var fName in shader._vf) {
                    if (shader._vf.hasOwnProperty(fName) && fName !== 'language') {
                        var field = shader._vf[fName];
                        if (field !== undefined && field !== null) {
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
        for (var p = 0; p < numLights && changed; p++) {
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

        //===========================================================================
        // Set HeadLight
        //===========================================================================
        var nav = scene.getNavigationInfo();

        if (nav._vf.headlight && changed) {
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

        //===========================================================================
        // Set ClipPlanes
        //===========================================================================
        if (shape._clipPlanes) {
            for (var cp = 0; cp < shape._clipPlanes.length; cp++) {
                var clip_plane = shape._clipPlanes[cp].plane;
                var clip_trafo = shape._clipPlanes[cp].trafo;

                sp['clipPlane' + cp + '_Plane'] = clip_trafo.multMatrixPlane(clip_plane._vf.plane).toGL();
                sp['clipPlane' + cp + '_CappingStrength'] = clip_plane._vf.cappingStrength;
                sp['clipPlane' + cp + '_CappingColor'] = clip_plane._vf.cappingColor.toGL();
            }
        }


        //===========================================================================
        // Set DepthMode
        //===========================================================================
        var depthMode = s_app ? s_app._cf.depthMode.node : null;
        if (depthMode)
        {
            if (depthMode._vf.enableDepthTest)
            {
                //Enable Depth Test
                this.stateManager.enable(gl.DEPTH_TEST);

                //Set Depth Mask
                this.stateManager.depthMask(!depthMode._vf.readOnly);
                
                //Set Depth Function
                this.stateManager.depthFunc(x3dom.Utils.depthFunc(gl, depthMode._vf.depthFunc));

                //Set Depth Range
                this.stateManager.depthRange(depthMode._vf.zNearRange, depthMode._vf.zFarRange);
            }
            else
            {
                //Disable Depth Test
                this.stateManager.disable(gl.DEPTH_TEST);
            }
        } 
        else //Set Defaults
        {
            this.stateManager.enable(gl.DEPTH_TEST);
            this.stateManager.depthMask(true);
            this.stateManager.depthFunc(gl.LEQUAL);
        }

        //===========================================================================
        // Set BlendMode
        //===========================================================================
        var blendMode = s_app ? s_app._cf.blendMode.node : null;
        if (blendMode)
        {
            var srcFactor  = x3dom.Utils.blendFunc(gl, blendMode._vf.srcFactor);
            var destFactor = x3dom.Utils.blendFunc(gl, blendMode._vf.destFactor);

            if (srcFactor && destFactor)
            {
                //Enable Blending
                this.stateManager.enable(gl.BLEND);

                //Set Blend Function
                this.stateManager.blendFuncSeparate(srcFactor, destFactor, gl.ONE, gl.ONE);

                //Set Blend Color
                this.stateManager.blendColor(blendMode._vf.color.r,
                                             blendMode._vf.color.g,
                                             blendMode._vf.color.b,
                                             1.0 - blendMode._vf.colorTransparency);

                //Set Blend Equation
                this.stateManager.blendEquation(x3dom.Utils.blendEquation(gl, blendMode._vf.equation));
            }
            else
            {
                this.stateManager.disable(gl.BLEND);
            }
        }
        else //Set Defaults
        {
            this.stateManager.enable(gl.BLEND);
            this.stateManager.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
        }

        //===========================================================================
        // Set ColorMaskMode
        //===========================================================================
        var colorMaskMode = s_app ? s_app._cf.colorMaskMode.node : null;
        if (colorMaskMode)
        {
            this.stateManager.colorMask(colorMaskMode._vf.maskR,
                                        colorMaskMode._vf.maskG,
                                        colorMaskMode._vf.maskB,
                                        colorMaskMode._vf.maskA);
        }
        else //Set Defaults
        {
            this.stateManager.colorMask(true, true, true, true);
        }

        //===========================================================================
        // Set LineProperties (only linewidthScaleFactor, interpreted as lineWidth)
        //===========================================================================
        var lineProperties = s_app ? s_app._cf.lineProperties.node : null;
        if (lineProperties)
        {
            this.stateManager.lineWidth(lineProperties._vf.linewidthScaleFactor);
        }
        else if (x3dom.Utils.needLineWidth) //Set Defaults
        {
            this.stateManager.lineWidth(1);
        }

        if (shape.isSolid() && !twoSidedMat) {
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

        // transformation matrices
        var model_view = mat_view.mult(transform);
        var model_view_inv = model_view.inverse();

        sp.isOrthoView = ( mat_proj._33 == 1 ) ? 1.0 : 0.0;

        sp.modelViewMatrix = model_view.toGL();
        sp.viewMatrix = mat_view.toGL();

        sp.normalMatrix = model_view_inv.transpose().toGL();
        sp.modelViewMatrixInverse = model_view_inv.toGL();

        sp.modelViewProjectionMatrix = mat_scene.mult(transform).toGL();

        if (isUserDefinedShader || shape._clipPlanes && shape._clipPlanes.length)
        {
            sp.viewMatrixInverse = mat_view.inverse().toGL();
        }

        // only calculate on "request" (maybe of interest for users)
        if (isUserDefinedShader) {
            sp.projectionMatrix = mat_proj.toGL();

            sp.worldMatrix = transform.toGL();
            sp.worldInverseTranspose = transform.inverse().transpose().toGL();

        }

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

            if (!shader || !isUserDefinedShader) {
                if (!sp[tex.samplerName])
                    sp[tex.samplerName] = cnt;
            }
        }

        if (s_app && s_app._cf.textureTransform.node) {
            var texTrafo = s_app.texTransformMatrix();
            sp.texTrafoMatrix = texTrafo.toGL();
        }


        // TODO; FIXME; what if geometry with split mesh has dynamic fields?
        var attrib = null;
        var df, df_n = s_gl.dynamicFields.length;

        for (df = 0; df < df_n; df++) {
            attrib = s_gl.dynamicFields[df];

            if (sp[attrib.name] !== undefined) {
                gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buf);

                gl.vertexAttribPointer(sp[attrib.name], attrib.numComponents, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(sp[attrib.name]);
            }
        }

        // render object
        var v, v_n, offset, q_n;
        var isParticleSet = false;

        if (x3dom.isa(s_geo, x3dom.nodeTypes.ParticleSet)) {
            isParticleSet = true;
        }

        if (s_gl.externalGeometry != 0)
        {
            q_n = s_gl.primType.length;
        }
        else
        {
            q_n = s_gl.positions.length;
        }

        for (var q = 0; q < q_n; q++) {
            var q6 = 6 * q;

            if ( !(sp.position !== undefined && s_gl.buffers[q6 + 1] && (s_gl.indexes[q] || s_gl.externalGeometry != 0)) )
                continue;

            indicesReady = false;

            if (s_gl.buffers[q6]) {
                if (isParticleSet && s_geo.drawOrder() != "any") {  // sort
                    var indexArray, zPos = [];
                    var pnts = s_geo._cf.coord.node.getPoints();
                    var pn = (pnts.length == s_gl.indexes[q].length) ? s_gl.indexes[q].length : 0;

                    for (var i=0; i<pn; i++) {
                        var center = model_view.multMatrixPnt(pnts[i]);
                        zPos.push([i, center.z]);
                    }

                    if (s_geo.drawOrder() == "backtofront")
                        zPos.sort(function(a, b) { return a[1] - b[1]; });
                    else
                        zPos.sort(function(b, a) { return a[1] - b[1]; });

                    for (i=0; i<pn; i++) {
                        shape._webgl.indexes[q][i] = zPos[i][0];
                    }

                    if (x3dom.caps.INDEX_UINT && (pn > 65535)) {
                        indexArray = new Uint32Array(shape._webgl.indexes[q]);
                        shape._webgl.indexType = gl.UNSIGNED_INT;
                    }
                    else {
                        indexArray = new Uint16Array(shape._webgl.indexes[q]);
                        shape._webgl.indexType = gl.UNSIGNED_SHORT;
                    }

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, s_gl.buffers[q6]);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.DYNAMIC_DRAW);

                    indexArray = null;
                }

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, s_gl.buffers[q6]);
				indicesReady = true;
            }

            if (sp.position !== undefined && s_gl.buffers[q6 + 1]) {
                gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q6 + 1]);
                gl.vertexAttribPointer(sp.position,
                    s_msh._numPosComponents, s_gl.coordType, false,
                    shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
                gl.enableVertexAttribArray(sp.position);
            }
            if (sp.normal !== undefined && s_gl.buffers[q6 + 2]) {
                gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q6 + 2]);
                gl.vertexAttribPointer(sp.normal,
                    s_msh._numNormComponents, s_gl.normalType, false,
                    shape._normalStrideOffset[0], shape._normalStrideOffset[1]);
                gl.enableVertexAttribArray(sp.normal);
            }
            if (sp.texcoord !== undefined && s_gl.buffers[q6 + 3]) {
                gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q6 + 3]);
                gl.vertexAttribPointer(sp.texcoord,
                    s_msh._numTexComponents, s_gl.texCoordType, false,
                    shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);
                gl.enableVertexAttribArray(sp.texcoord);
            }
            if (sp.color !== undefined && s_gl.buffers[q6 + 4]) {
                gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q6 + 4]);
                gl.vertexAttribPointer(sp.color,
                    s_msh._numColComponents, s_gl.colorType, false,
                    shape._colorStrideOffset[0], shape._colorStrideOffset[1]);
                gl.enableVertexAttribArray(sp.color);
            }
            if ((sp.id !== undefined || sp.particleSize !== undefined) && s_gl.buffers[q6 + 5]) {
                gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q6 + 5]);
                //texture coordinate hack for IDs
                if ((s_gl.binaryGeometry != 0 || s_gl.externalGeometry != 0) && s_geo._vf["idsPerVertex"] == true)
                {
                    gl.vertexAttribPointer(sp.id,
                        1, gl.FLOAT, false, 4, 0);
                    gl.enableVertexAttribArray(sp.id);
                }
                else if (isParticleSet)
                {
                    gl.vertexAttribPointer(sp.particleSize,
                        3, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(sp.particleSize);
                }
            }
            if (s_gl.popGeometry != 0 && s_gl.buffers[q6 + 5]) {
                //special case: mimic gl_VertexID
                gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q6 + 5]);

                gl.vertexAttribPointer(sp.PG_vertexID, 1, gl.FLOAT, false, 4, 0);
                gl.enableVertexAttribArray(sp.PG_vertexID);
            }

            // TODO: implement surface with additional wireframe render mode (independent from poly mode)
            var indOff, renderMode = viewarea.getRenderMode();

            if (renderMode > 0) {
                var polyMode = (renderMode == 1) ? gl.POINTS : gl.LINES;

                if ( indicesReady && (s_gl.binaryGeometry > 0 || s_gl.popGeometry > 0) ) {
                    for (v = 0, offset = 0, v_n = s_geo._vf.vertexCount.length; v < v_n; v++) {
                        gl.drawElements(polyMode, s_geo._vf.vertexCount[v], s_gl.indexType,
                                        x3dom.Utils.getByteAwareOffset(offset, s_gl.indexType, gl));
                        offset += s_geo._vf.vertexCount[v];
                    }
                }
                else if (s_gl.binaryGeometry < 0 || s_gl.popGeometry < 0 || s_gl.imageGeometry) {
                    for (v = 0, offset = 0, v_n = s_geo._vf.vertexCount.length; v < v_n; v++) {
                        gl.drawArrays(polyMode, offset, s_geo._vf.vertexCount[v]);
                        offset += s_geo._vf.vertexCount[v];
                    }
                }
                //ExternalGeometry: indexed rendering (standard pass, POINTS or LINES)
                else if (s_gl.externalGeometry == 1)
                {
                    gl.drawElements(polyMode, s_gl.drawCount[q], s_gl.indexType, s_gl.indexOffset[q]);
                }
                //ExternalGeometry: non-indexed rendering (standard pass, POINTS or LINES)
                else if (s_gl.externalGeometry == -1)
                {
                    gl.drawArrays(polyMode, 0, s_gl.drawCount[q]);
                }
                else if (s_geo.hasIndexOffset()) {
                    // IndexedTriangleStripSet with primType TRIANGLE_STRIP,
                    // and Patch geometry from external BVHRefiner component
                    indOff = shape.tessellationProperties();
                    for (v = 0, v_n = indOff.length; v < v_n; v++) {
                        gl.drawElements(polyMode, indOff[v].count, s_gl.indexType,
                            indOff[v].offset * x3dom.Utils.getOffsetMultiplier(s_gl.indexType, gl));
                    }
                }
                else if (s_gl.indexes[q].length == 0) {
                    gl.drawArrays(polyMode, 0, s_gl.positions[q].length / 3);
                }
                else {
                    gl.drawElements(polyMode, s_gl.indexes[q].length, s_gl.indexType, 0);
                }
            }
            else {
                if ( indicesReady && (s_gl.binaryGeometry > 0 || s_gl.popGeometry > 0) ) {
                    for (v = 0, offset = 0, v_n = s_geo._vf.vertexCount.length; v < v_n; v++) {
                        gl.drawElements(s_gl.primType[v], s_geo._vf.vertexCount[v], s_gl.indexType,
                                        x3dom.Utils.getByteAwareOffset(offset, s_gl.indexType, gl));
                        offset += s_geo._vf.vertexCount[v];
                    }
                }
                else if (s_gl.binaryGeometry < 0 || s_gl.popGeometry < 0 || s_gl.imageGeometry) {
                    for (v = 0, offset = 0, v_n = s_geo._vf.vertexCount.length; v < v_n; v++) {
                        gl.drawArrays(s_gl.primType[v], offset, s_geo._vf.vertexCount[v]);
                        offset += s_geo._vf.vertexCount[v];
                    }
                }
                //ExternalGeometry: indexed rendering (standard pass)
                else if (s_gl.externalGeometry == 1)
                {
                    gl.drawElements(s_gl.primType[q], s_gl.drawCount[q], s_gl.indexType, s_gl.indexOffset[q]);
                }
                //ExternalGeometry: non-indexed rendering (standard pass)
                else if (s_gl.externalGeometry == -1)
                {
                    gl.drawArrays(s_gl.primType[q], 0, s_gl.drawCount[q]);
                }
                else if (s_geo.hasIndexOffset()) {
                    // IndexedTriangleStripSet with primType TRIANGLE_STRIP,
                    // and Patch geometry from external BVHRefiner component
                    indOff = shape.tessellationProperties();
                    for (v = 0, v_n = indOff.length; v < v_n; v++) {
                        gl.drawElements(s_gl.primType, indOff[v].count, s_gl.indexType,
                            indOff[v].offset * x3dom.Utils.getOffsetMultiplier(s_gl.indexType, gl));
                    }
                }
                else if (s_gl.indexes[q].length == 0) {
                    gl.drawArrays(s_gl.primType, 0, s_gl.positions[q].length / 3);
                }
                else {
                    gl.drawElements(s_gl.primType, s_gl.indexes[q].length, s_gl.indexType, 0);
                }
            }

            // disable all used vertex attributes
            gl.disableVertexAttribArray(sp.position);

            if (sp.normal !== undefined) {
                gl.disableVertexAttribArray(sp.normal);
            }
            if (sp.texcoord !== undefined) {
                gl.disableVertexAttribArray(sp.texcoord);
            }
            if (sp.color !== undefined) {
                gl.disableVertexAttribArray(sp.color);
            }
            if (s_gl.buffers[q6 + 5]) {
                if (sp.id !== undefined)
                    gl.disableVertexAttribArray(sp.id);
                else if (sp.particleSize !== undefined)
                    gl.disableVertexAttribArray(sp.particleSize);
            }
            if (s_gl.popGeometry != 0 && sp.PG_vertexID !== undefined) {
                gl.disableVertexAttribArray(sp.PG_vertexID);    // mimic gl_VertexID
            }
        } // end for loop over attrib arrays

        for (df = 0; df < df_n; df++) {
            attrib = s_gl.dynamicFields[df];

            if (sp[attrib.name] !== undefined) {
                gl.disableVertexAttribArray(sp[attrib.name]);
            }
        }

        // update stats
        if (s_gl.imageGeometry) {
            v_n = s_geo._vf.vertexCount.length;
            this.numDrawCalls += v_n;

            for (v = 0; v < v_n; v++) {
                if (s_gl.primType[v] == gl.TRIANGLE_STRIP)
                    this.numFaces += (s_geo._vf.vertexCount[v] - 2);
                else
                    this.numFaces += (s_geo._vf.vertexCount[v] / 3);

                this.numCoords += s_geo._vf.vertexCount[v];
            }
        }
        else {
            this.numCoords += s_msh._numCoords;
            this.numFaces  += s_msh._numFaces;

            if (s_gl.binaryGeometry || s_gl.popGeometry) {
                this.numDrawCalls += s_geo._vf.vertexCount.length;
            }
            else if (s_geo.hasIndexOffset()) {
                this.numDrawCalls += shape.tessellationProperties().length;
            }
            else {
                this.numDrawCalls += q_n;
            }
        }

        // reset to default values for possibly user defined render states
        if (depthMode) {
            this.stateManager.enable(gl.DEPTH_TEST);
            this.stateManager.depthMask(true);
            this.stateManager.depthFunc(gl.LEQUAL);
            this.stateManager.depthRange(0, 1);
        }

        if (blendMode) {
            this.stateManager.enable(gl.BLEND);
            this.stateManager.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
            this.stateManager.blendColor(1, 1, 1, 1);
            this.stateManager.blendEquation(gl.FUNC_ADD);
        }

        if (colorMaskMode) {
            this.stateManager.colorMask(true, true, true, true);
        }

        if (lineProperties) {
            this.stateManager.lineWidth(1);
        }

        // cleanup textures
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

        if (currFps <= 1 || viewarea.isMovingOrAnimating()) {
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

        //@todo: this assumes pure TRIANGLES data (and gets overwritten from shadow/picking pass!!!)
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
        x3dom.Utils.startMeasure("picking");
        
        var scene = viewarea._scene;
        
        var gl = this.ctx3d;
        
        // method requires that scene has already been rendered at least once
        if (!gl || !scene || !scene._webgl || !scene.drawableCollection) {
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

        
        // ViewMatrix and ViewProjectionMatrix
        var mat_view, mat_scene;

        if (arguments.length > 4) {
            mat_view = viewMat;
            mat_scene = sceneMat;
        }
        else {
            mat_view = viewarea._last_mat_view;
            mat_scene = viewarea._last_mat_scene;
        }

        // remember correct scene bbox
        var min = x3dom.fields.SFVec3f.copy(scene._lastMin);
        var max = x3dom.fields.SFVec3f.copy(scene._lastMax);
        // get current camera position
        var from = mat_view.inverse().e3();

        // get bbox of scene bbox and camera position
        var _min = x3dom.fields.SFVec3f.copy(from);
        var _max = x3dom.fields.SFVec3f.copy(from);

        if (_min.x > min.x) { _min.x = min.x; }
        if (_min.y > min.y) { _min.y = min.y; }
        if (_min.z > min.z) { _min.z = min.z; }

        if (_max.x < max.x) { _max.x = max.x; }
        if (_max.y < max.y) { _max.y = max.y; }
        if (_max.z < max.z) { _max.z = max.z; }

        // temporarily set scene size to include camera
        scene._lastMin.setValues(_min);
        scene._lastMax.setValues(_max);

        // get scalar scene size and adapted projection matrix
        var sceneSize = scene._lastMax.subtract(scene._lastMin).length();
        var cctowc = viewarea.getCCtoWCMatrix();

        // restore correct scene bbox
        scene._lastMin.setValues(min);
        scene._lastMax.setValues(max);

        // for deriving shadow ids together with shape ids
        var baseID = x3dom.nodeTypes.Shape.objectID + 2;


        // render to texture for reading pixel values
        this.renderPickingPass(gl, scene, mat_view, mat_scene, from, sceneSize, pickMode, x, y, 2, 2);

        // the pixel values under mouse cursor
        var pixelData = scene._webgl.fboPick.pixelData;

        if (pixelData && pixelData.length)
        {
            var pickPos = new x3dom.fields.SFVec3f(0, 0, 0);
            var pickNorm = new x3dom.fields.SFVec3f(0, 0, 1);

            var index = 0;
            var objId = pixelData[index + 3], shapeId;

            var pixelOffset = 1.0 / scene._webgl.pickScale;
            var denom = 1.0 / 256.0;
            var dist, line, lineoff, right, up;

            if (pickMode == 0) {
                objId += 256 * pixelData[index + 2];

                dist = (pixelData[index    ] / 255.0) * denom +
                       (pixelData[index + 1] / 255.0);

                line = viewarea.calcViewRay(x, y, cctowc);

                pickPos = line.pos.add(line.dir.multiply(dist * sceneSize));

                index = 4;      // get right pixel
                dist = (pixelData[index    ] / 255.0) * denom +
                       (pixelData[index + 1] / 255.0);

                lineoff = viewarea.calcViewRay(x + pixelOffset, y, cctowc);

                right = lineoff.pos.add(lineoff.dir.multiply(dist * sceneSize));
                right = right.subtract(pickPos).normalize();

                index = 8;      // get top pixel
                dist = (pixelData[index    ] / 255.0) * denom +
                       (pixelData[index + 1] / 255.0);

                lineoff = viewarea.calcViewRay(x, y - pixelOffset, cctowc);

                up = lineoff.pos.add(lineoff.dir.multiply(dist * sceneSize));
                up = up.subtract(pickPos).normalize();

                pickNorm = right.cross(up).normalize();
            }
            else if (pickMode == 3) {
                objId +=   256 * pixelData[index + 2] +
                         65536 * pixelData[index + 1];

                dist = pixelData[index] / 255.0;

                line = viewarea.calcViewRay(x, y, cctowc);

                pickPos = line.pos.add(line.dir.multiply(dist * sceneSize));

                index = 4;      // get right pixel
                dist = pixelData[index] / 255.0;

                lineoff = viewarea.calcViewRay(x + pixelOffset, y, cctowc);

                right = lineoff.pos.add(lineoff.dir.multiply(dist * sceneSize));
                right = right.subtract(pickPos).normalize();

                index = 8;      // get top pixel
                dist = pixelData[index] / 255.0;

                lineoff = viewarea.calcViewRay(x, y - pixelOffset, cctowc);

                up = lineoff.pos.add(lineoff.dir.multiply(dist * sceneSize));
                up = up.subtract(pickPos).normalize();

                pickNorm = right.cross(up).normalize();
            }
            else if (pickMode == 4) {
                objId += 256 * pixelData[index + 2];

                shapeId  =       pixelData[index + 1];
                shapeId += 256 * pixelData[index    ];

                // check if standard shape picked without special shadow id
                if (objId == 0 && (shapeId > 0 && shapeId < baseID)) {
                    objId = shapeId;
                }
            }
            else {
                pickPos.x = pixelData[index    ];
                pickPos.y = pixelData[index + 1];
                pickPos.z = pixelData[index + 2];
            }
            //x3dom.debug.logInfo(pickPos + " / " + objId);

            var eventType = "shadowObjectIdChanged";
            var shadowObjectIdChanged, event;
            var button = Math.max(buttonState >>> 8, buttonState & 255);

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


                //Check if there are MultiParts
                if (scene._multiPartMap) {
                    var mp, multiPart;

                    //Find related MultiPart
                    for (mp=0; mp<scene._multiPartMap.multiParts.length; mp++)
                    {
                        multiPart = scene._multiPartMap.multiParts[mp];
                        if (objId >= multiPart._minId && objId <= multiPart._maxId)
                        {
                            hitObject = multiPart._xmlNode;

                            event = {
                                target: multiPart._xmlNode,
                                button: button, mouseup: ((buttonState >>> 8) > 0),
                                layerX: x, layerY: y,
                                pickedId: objId,
                                worldX: pickPos.x, worldY: pickPos.y, worldZ: pickPos.z,
                                normalX: pickNorm.x, normalY: pickNorm.y, normalZ: pickNorm.z,
                                hitPnt: pickPos.toGL(),
                                hitObject: hitObject,
                                cancelBubble: false,
                                stopPropagation: function () { this.cancelBubble = true; },
                                preventDefault:  function () { this.cancelBubble = true; }
                            };

                            multiPart.handleEvents(event);
                        }
                        else
                        {
                            event = {
                                target: multiPart._xmlNode,
                                button: button, mouseup: ((buttonState >>> 8) > 0),
                                layerX: x, layerY: y,
                                pickedId: -1,
                                cancelBubble: false,
                                stopPropagation: function () { this.cancelBubble = true; },
                                preventDefault:  function () { this.cancelBubble = true; }
                            };

                            multiPart.handleEvents(event);
                        }
                    }
                }

                shadowObjectIdChanged = (viewarea._pickingInfo.shadowObjectId != objId);
                viewarea._pickingInfo.lastShadowObjectId = viewarea._pickingInfo.shadowObjectId;
                viewarea._pickingInfo.shadowObjectId = objId;
                //x3dom.debug.logInfo(baseID + " + " + objId);

                if ((shadowObjectIdChanged || button) && scene._xmlNode &&
                    (scene._xmlNode["on" + eventType] || scene._xmlNode.hasAttribute("on" + eventType) ||
                     scene._listeners[eventType]))
                {
                    event = {
                        target: scene._xmlNode,
                        type: eventType,
                        button: button, mouseup: ((buttonState >>> 8) > 0),
                        layerX: x, layerY: y,
                        shadowObjectId: objId,
                        worldX: pickPos.x, worldY: pickPos.y, worldZ: pickPos.z,
                        normalX: pickNorm.x, normalY: pickNorm.y, normalZ: pickNorm.z,
                        hitPnt: pickPos.toGL(),
                        hitObject: hitObject,
                        cancelBubble: false,
                        stopPropagation: function () { this.cancelBubble = true; },
                        preventDefault:  function () { this.cancelBubble = true; }
                    };
                    scene.callEvtHandler(("on" + eventType), event);
                }

                if (scene._shadowIdMap && scene._shadowIdMap.mapping &&
                    objId < scene._shadowIdMap.mapping.length) {
                    var shIds = scene._shadowIdMap.mapping[objId].usage;
                    var n, c, shObj;

                    if (!line) {
                        line = viewarea.calcViewRay(x, y, cctowc);
                    }
                    // find corresponding dom tree object
                    for (c = 0; c < shIds.length; c++) {
                        shObj = scene._nameSpace.defMap[shIds[c]];
                        // FIXME; bbox test too coarse (+ should include trafo)
                        if (shObj && shObj.doIntersect(line)) {
                            viewarea._pickingInfo.pickObj = shObj;
                            break;
                        }
                    }
                    //Check for other namespaces e.g. Inline/Multipart (FIXME; check recursively)
                    for (n = 0; n<scene._nameSpace.childSpaces.length; n++)
                    {
                        for (c = 0; c < shIds.length; c++) {
                            shObj = scene._nameSpace.childSpaces[n].defMap[shIds[c]];
                            // FIXME; bbox test too coarse (+ should include trafo)
                            if (shObj && shObj.doIntersect(line)) {
                                viewarea._pickingInfo.pickObj = shObj;
                                break;
                            }
                        }
                    }
                }
            }
            else {
                //Check if there are MultiParts
                if (scene._multiPartMap) {

                    //Find related MultiPart
                    for (mp=0; mp<scene._multiPartMap.multiParts.length; mp++)
                    {
                        multiPart = scene._multiPartMap.multiParts[mp];

                        event = {
                            target: multiPart._xmlNode,
                            button: button, mouseup: ((buttonState >>> 8) > 0),
                            layerX: x, layerY: y,
                            pickedId: -1,
                            cancelBubble: false,
                            stopPropagation: function () { this.cancelBubble = true; },
                            preventDefault:  function () { this.cancelBubble = true; }
                        };

                        multiPart.handleEvents(event);
                    }
                }


                shadowObjectIdChanged = (viewarea._pickingInfo.shadowObjectId != -1);
                viewarea._pickingInfo.shadowObjectId = -1;     // nothing hit

                if ( shadowObjectIdChanged && scene._xmlNode &&
                    (scene._xmlNode["on" + eventType] || scene._xmlNode.hasAttribute("on" + eventType) ||
                     scene._listeners[eventType]) )
                {
                    event = {
                        target: scene._xmlNode,
                        type: eventType,
                        button: button, mouseup: ((buttonState >>> 8) > 0),
                        layerX: x, layerY: y,
                        shadowObjectId: viewarea._pickingInfo.shadowObjectId,
                        cancelBubble: false,
                        stopPropagation: function () { this.cancelBubble = true; },
                        preventDefault:  function () { this.cancelBubble = true; }
                    };
                    scene.callEvtHandler(("on" + eventType), event);
                }

                if (objId > 0) {
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
        }
        var pickTime = x3dom.Utils.stopMeasure("picking");
        this.x3dElem.runtime.addMeasurement('PICKING', pickTime);

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
        if (!gl || !scene || !scene._webgl || !scene.drawableCollection)
            return false;

        // values not fully correct but unnecessary anyway, just to feed the shader
        var from = viewarea._last_mat_view.inverse().e3();
        var sceneSize = scene._lastMax.subtract(scene._lastMin).length();

        var x = (x1 <= x2) ? x1 : x2;
        var y = (y1 >= y2) ? y1 : y2;
        var width  = (1 + Math.abs(x2 - x1)) * scene._webgl.pickScale;
        var height = (1 + Math.abs(y2 - y1)) * scene._webgl.pickScale;

        // render to texture for reading pixel values
        this.renderPickingPass(gl, scene, viewarea._last_mat_view, viewarea._last_mat_scene,
            from, sceneSize, 0, x, y, (width < 1) ? 1 : width, (height < 1) ? 1 : height);

        var index;
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

        var pickedNode, pickedNodes = [];

        var hitObject;

        // for deriving shadow ids together with shape ids
        var baseID = x3dom.nodeTypes.Shape.objectID + 2;

        for (index = 0; index < pickedObjects.length; index++) {
            objId = pickedObjects[index];

            if (objId >= baseID)
            {
                objId -= baseID;

                //Check if there are MultiParts
                if (scene._multiPartMap) {
                    var mp, multiPart, colorMap, emissiveMap, specularMap, visibilityMap, partID;

                    //Find related MultiPart
                    for (mp = 0; mp < scene._multiPartMap.multiParts.length; mp++) {
                        multiPart = scene._multiPartMap.multiParts[mp];
                        colorMap = multiPart._inlineNamespace.defMap["MultiMaterial_ColorMap"];
                        emissiveMap = multiPart._inlineNamespace.defMap["MultiMaterial_EmissiveMap"];
                        specularMap = multiPart._inlineNamespace.defMap["MultiMaterial_SpecularMap"];
                        visibilityMap = multiPart._inlineNamespace.defMap["MultiMaterial_VisibilityMap"];
                        if (objId >= multiPart._minId && objId <= multiPart._maxId) {
                            partID = multiPart._idMap.mapping[objId - multiPart._minId].name;
                            hitObject = new x3dom.Parts(multiPart, [objId], colorMap, emissiveMap, specularMap, visibilityMap);

                            pickedNode = {"partID": partID, "part":hitObject};

                            pickedNodes.push(pickedNode);
                        }
                    }
                }

            }
            else
            {
                hitObject = x3dom.nodeTypes.Shape.idMap.nodeID[objId];
                hitObject = (hitObject && hitObject._xmlNode) ? hitObject._xmlNode : null;

                if (hitObject)
                    pickedNodes.push(hitObject);
            }
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
        var texProp = null;

        // for initFBO
        var type = gl.UNSIGNED_BYTE;
        var shadowType = gl.UNSIGNED_BYTE;
        var nearestFilt = false;

        if (x3dom.caps.FP_TEXTURES && !x3dom.caps.MOBILE) {
            type = gl.FLOAT;
            shadowType = gl.FLOAT;
            if (!x3dom.caps.FPL_TEXTURES) {
                nearestFilt = true;             // TODO: use correct filtering for fp-textures
            }
        }

        var shadowedLights, numShadowMaps;
        var i, j, n, size, sizeAvailable;
        var texType, refinementPos;
        var vertices = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];

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
            scene._webgl.fboPick = x3dom.Utils.initFBO(gl,
                                   scene._webgl._currFboWidth, scene._webgl._currFboHeight, gl.UNSIGNED_BYTE, false, true);
            scene._webgl.fboPick.pixelData = null;

            //Set picking shaders
            /*scene._webgl.pickShader = this.cache.getShader(gl, x3dom.shader.PICKING);
            scene._webgl.pickShader24 = this.cache.getShader(gl, x3dom.shader.PICKING_24);
            scene._webgl.pickShaderId = this.cache.getShader(gl, x3dom.shader.PICKING_ID);
            scene._webgl.pickColorShader = this.cache.getShader(gl, x3dom.shader.PICKING_COLOR);
            scene._webgl.pickTexCoordShader = this.cache.getShader(gl, x3dom.shader.PICKING_TEXCOORD);*/

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
					scene._webgl.fboShadow[i][j] = x3dom.Utils.initFBO(gl, size, size, shadowType, false, true);
			}
			
			if (scene._webgl.fboShadow.length > 0 || x3dom.SSAO.isEnabled(scene))
				scene._webgl.fboScene = x3dom.Utils.initFBO(gl, this.canvas.width, this.canvas.height, shadowType, false, true);
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
					scene._webgl.fboBlur[scene._webgl.fboBlur.length] = x3dom.Utils.initFBO(gl, size, size, shadowType, false, true);
			}
			
			//initialize Data for post processing
			scene._webgl.ppBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, scene._webgl.ppBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);		
			
			//scene._webgl.shadowShader = this.cache.getShader(gl, x3dom.shader.SHADOW);

            // TODO; cleanup on shutdown and lazily create on first use like size-dependent variables below
            scene._webgl.refinement = {
                stamps: new Array(2),
                positionBuffer: gl.createBuffer()
            };
            gl.bindBuffer(gl.ARRAY_BUFFER, scene._webgl.refinement.positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
            
            // This must be refreshed on node change!
            for (rtl_i = 0; rtl_i < rtl_n; rtl_i++) {
                rt_tex = rentex[rtl_i];

                texProp = rt_tex._cf.textureProperties.node;
                texType = rt_tex.requirePingPong() ? gl.UNSIGNED_BYTE : type;
                rt_tex._webgl = {};
                rt_tex._webgl.fbo = x3dom.Utils.initFBO(gl,
                    rt_tex._vf.dimensions[0], rt_tex._vf.dimensions[1], texType,
                    (texProp && texProp._vf.generateMipMaps), rt_tex._vf.depthMap || !rt_tex.requirePingPong());

                rt_tex._cleanupGLObjects = function(retainTex) {
                    if (!retainTex)
                        gl.deleteTexture(this._webgl.fbo.tex);
                    if (this._webgl.fbo.dtex)
                        gl.deleteTexture(this._webgl.fbo.dtex);
                    if (this._webgl.fbo.rbo)
                        gl.deleteFramebuffer(this._webgl.fbo.rbo);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                    gl.deleteFramebuffer(this._webgl.fbo.fbo);
                    this._webgl.fbo.rbo = null;
                    this._webgl.fbo.fbo = null;
                };

                if (rt_tex.requirePingPong()) {
                    refinementPos = rt_tex._vf.dimensions[0] + "x" + rt_tex._vf.dimensions[1];
                    if (scene._webgl.refinement[refinementPos] === undefined) {
                        scene._webgl.refinement[refinementPos] = x3dom.Utils.initFBO(gl,
                            rt_tex._vf.dimensions[0], rt_tex._vf.dimensions[1], texType, false, false);
                    }
                    rt_tex._webgl.texture = null;
                }
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

                scene._webgl.fboPick = x3dom.Utils.initFBO(gl, fboWidth, fboHeight, scene._webgl.fboPick.type, false, true);
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
                if (rt_tex._cleanupGLObjects)
                    rt_tex._cleanupGLObjects();
                else
                    rt_tex._cleanupGLObjects = function(retainTex) {
                        if (!retainTex)
                            gl.deleteTexture(this._webgl.fbo.tex);
                        if (this._webgl.fbo.dtex)
                            gl.deleteTexture(this._webgl.fbo.dtex);
                        if (this._webgl.fbo.rbo)
                            gl.deleteRenderbuffer(this._webgl.fbo.rbo);
                        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                        gl.deleteFramebuffer(this._webgl.fbo.fbo);
                        this._webgl.fbo.rbo = null;
                        this._webgl.fbo.fbo = null;
                    };

                texProp = rt_tex._cf.textureProperties.node;
                texType = rt_tex.requirePingPong() ? gl.UNSIGNED_BYTE : type;
                rt_tex._webgl = {};
                rt_tex._webgl.fbo = x3dom.Utils.initFBO(gl,
                                    rt_tex._vf.dimensions[0], rt_tex._vf.dimensions[1], texType,
                                    (texProp && texProp._vf.generateMipMaps), rt_tex._vf.depthMap || !rt_tex.requirePingPong());

                if (rt_tex.requirePingPong()) {
                    refinementPos = rt_tex._vf.dimensions[0] + "x" + rt_tex._vf.dimensions[1];
                    if (scene._webgl.refinement[refinementPos] === undefined) {
                        scene._webgl.refinement[refinementPos] = x3dom.Utils.initFBO(gl,
                            rt_tex._vf.dimensions[0], rt_tex._vf.dimensions[1], texType, false, false);
                    }
                    rt_tex._webgl.texture = null;
                }

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
						scene._webgl.fboShadow[i][j] = x3dom.Utils.initFBO(gl, size, size, shadowType, false, true);
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
					scene._webgl.fboBlur[scene._webgl.fboBlur.length] = x3dom.Utils.initFBO(gl, size, size, shadowType, false, true);
			}

			if ((x3dom.SSAO.isEnabled(scene) ||scene._webgl.fboShadow.length > 0) && typeof scene._webgl.fboScene == "undefined" || scene._webgl.fboScene &&
				(this.canvas.width != scene._webgl.fboScene.width || this.canvas.height != scene._webgl.fboScene.height)) {
				scene._webgl.fboScene = x3dom.Utils.initFBO(gl, this.canvas.width, this.canvas.height, shadowType, false, true);
			}
        }

        var env = scene.getEnvironment();
        // update internal flags
        env.checkSanity();

        var bgnd = scene.getBackground();
        // setup or update bgnd
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
                if ( e_viewpoint._xmlNode &&
                    (e_viewpoint._xmlNode["on" + e_eventType] ||
                     e_viewpoint._xmlNode.hasAttribute("on" + e_eventType) ||
                     e_viewpoint._listeners[e_eventType]) ) {
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
                        stopPropagation: function () { this.cancelBubble = true; },
                        preventDefault:  function () { this.cancelBubble = true; }
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

            scene.collectDrawableObjects(x3dom.fields.SFMatrix4f.identity(), scene.drawableCollection, true, false, 0, []);

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
        if (shadowCount > 0 || x3dom.SSAO.isEnabled(scene)) {
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

        x3dom.nodeTypes.PopGeometry.numRenderedVerts = 0;
        x3dom.nodeTypes.PopGeometry.numRenderedTris = 0;

        n = scene.drawableCollection.length;

        // Very, very experimental priority culling, currently coupled with frustum and small feature culling
        // TODO; what about shadows?
        if (env._vf.smallFeatureCulling && env._lowPriorityThreshold < 1 && viewarea.isMovingOrAnimating()) {
            n = Math.floor(n * env._lowPriorityThreshold);
            if (!n && scene.drawableCollection.length)
                n = 1;   // render at least one object
        }

        this.stateManager.unsetProgram();

        // render all remaining shapes
        for (i = 0; i < n; i++) {
            var drawable = scene.drawableCollection.get(i);

            this.renderShape(drawable, viewarea, slights, numLights, mat_view, mat_scene, mat_light, mat_proj, gl);
        }

        if (shadowCount > 0)
            this.renderShadows(gl, viewarea, shadowedLights, WCToLCMatrices, lMatrices, mat_view, mat_proj, mat_scene);

        this.stateManager.disable(gl.BLEND);
        this.stateManager.disable(gl.DEPTH_TEST);

        viewarea._numRenderedNodes = n;
        
        if(x3dom.SSAO.isEnabled(scene))
            x3dom.SSAO.renderSSAO(this.stateManager, gl, scene, this.canvas);
        
        // if _visDbgBuf then show helper buffers in foreground for debugging
        if (viewarea._visDbgBuf !== undefined && viewarea._visDbgBuf)
        {
            var pm = scene._vf.pickMode.toLowerCase();

            if (pm.indexOf("idbuf") == 0 || pm == "color" || pm == "texcoord") {
                this.stateManager.viewport(0, 3 * this.canvas.height / 4,
                                           this.canvas.width / 4, this.canvas.height / 4);
                scene._fgnd._webgl.render(gl, scene._webgl.fboPick.tex);
            }

            if (shadowCount > 0 || x3dom.SSAO.isEnabled(scene)) {
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
                if (!rt_tex._webgl.fbo.fbo) // might be deleted (--> RefinementTexture when finished)
                    continue;

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
     * Render special PingPong-Pass
     *****************************************************************************/
    Context.prototype.renderPingPongPass = function (gl, viewarea, rt) {
        var scene = viewarea._scene;
        var refinementPos = rt._vf.dimensions[0] + "x" + rt._vf.dimensions[1];
        var refinementFbo = scene._webgl.refinement[refinementPos];

        // load stamp textures
        if (rt._currLoadLevel == 0 && (!scene._webgl.refinement.stamps[0] || !scene._webgl.refinement.stamps[1])) {
            scene._webgl.refinement.stamps[0] = this.cache.getTexture2D(gl, rt._nameSpace.doc,
                                    rt._nameSpace.getURL(rt._vf.stamp0), false, false, false, false);
            scene._webgl.refinement.stamps[1] = this.cache.getTexture2D(gl, rt._nameSpace.doc,
                                    rt._nameSpace.getURL(rt._vf.stamp1), false, false, false, false);
        }

        // load next level of image
        if (rt._currLoadLevel < rt._loadLevel) {
            rt._currLoadLevel++;

            if (rt._webgl.texture)
                gl.deleteTexture(rt._webgl.texture);

            var filename = rt._vf.url[0] + "/" + rt._currLoadLevel + "." + rt._vf.format;

            rt._webgl.texture = x3dom.Utils.createTexture2D(gl, rt._nameSpace.doc,
                                rt._nameSpace.getURL(filename), false, false, false, false);

            if (rt._vf.iterations % 2 === 0)
                (rt._currLoadLevel % 2 !== 0) ? rt._repeat.x *= 2.0 : rt._repeat.y *= 2.0;
            else
                (rt._currLoadLevel % 2 === 0) ? rt._repeat.x *= 2.0 : rt._repeat.y *= 2.0;
        }

        if (!rt._webgl.texture.ready ||
            !scene._webgl.refinement.stamps[0].ready || !scene._webgl.refinement.stamps[1].ready)
            return;

        // first pass
        this.stateManager.bindFramebuffer(gl.FRAMEBUFFER, refinementFbo.fbo);
        this.stateManager.viewport(0, 0, refinementFbo.width, refinementFbo.height);

        this.stateManager.disable(gl.BLEND);
        this.stateManager.disable(gl.CULL_FACE);
        this.stateManager.disable(gl.DEPTH_TEST);

        gl.clearColor(0, 0, 0, 1);
        gl.clearDepth(1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var sp = this.cache.getShader(gl, x3dom.shader.TEXTURE_REFINEMENT);
        this.stateManager.useProgram(sp);

        gl.bindBuffer(gl.ARRAY_BUFFER, scene._webgl.refinement.positionBuffer);
        gl.vertexAttribPointer(sp.position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(sp.position);

        sp.stamp = 0;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, scene._webgl.refinement.stamps[(rt._currLoadLevel + 1) % 2]);    // draw stamp
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        if (rt._currLoadLevel > 1) {
            sp.lastTex = 1;
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, rt._webgl.fbo.tex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }

        sp.curTex = 2;
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, rt._webgl.texture);    // draw level image to fbo
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        sp.mode = rt._currLoadLevel - 1;
        sp.repeat = rt._repeat.toGL();

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // second pass
        this.stateManager.bindFramebuffer(gl.FRAMEBUFFER, rt._webgl.fbo.fbo);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        sp.mode = 0;
        sp.curTex = 2;
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, refinementFbo.tex);   // draw result to fbo
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.disableVertexAttribArray(sp.position);

        // pass done
        this.stateManager.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.stateManager.viewport(0, 0, this.canvas.width, this.canvas.height);

        if (rt._vf.autoRefinement)
            rt.nextLevel();

        if (rt._currLoadLevel == rt._vf.maxLevel)
            rt._currLoadLevel++;

        if (rt._webgl.fbo.mipMap) {
            gl.bindTexture(gl.TEXTURE_2D, rt._webgl.fbo.tex);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        // we're finally done: cleanup/delete all helper FBOs
        if (!rt.requirePingPong()) {
            gl.deleteTexture(rt._webgl.texture);
            delete rt._webgl.texture;

            rt._cleanupGLObjects(true);
        }

        rt._renderedImage++;
    };

    /*****************************************************************************
     * Render RenderedTexture-Pass
     *****************************************************************************/
    Context.prototype.renderRTPass = function (gl, viewarea, rt)
    {
        /// begin special case (progressive image refinement)
        if (x3dom.isa(rt, x3dom.nodeTypes.RefinementTexture)) {
            if (rt.requirePingPong()) {
                this.renderPingPongPass(gl, viewarea, rt);
            }
            return;
        }
        /// end special case

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

        if (!locScene || locScene === scene) {
            n = scene.drawableCollection.length;

            if (rt._vf.showNormals) {
                this.renderNormals(gl, scene, scene._webgl.normalShader, mat_view, mat_scene);
            }
            else {
                this.stateManager.unsetProgram();

                for (i = 0; i < n; i++) {
                    drawable = scene.drawableCollection.get(i);

                    this.renderShape(drawable, viewarea, slights, numLights,
                                     mat_view, mat_scene, mat_light, mat_proj, gl);
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

            locScene.collectDrawableObjects(x3dom.fields.SFMatrix4f.identity(),
                                            locScene.drawableCollection, true, false, 0, []);

            locScene.drawableCollection.sort();

            n = locScene.drawableCollection.length;

            if (rt._vf.showNormals) {
                this.renderNormals(gl, locScene, scene._webgl.normalShader, mat_view, mat_scene);
            }
            else {
                this.stateManager.unsetProgram();

                for (i = 0; i < n; i++) {
                    drawable = locScene.drawableCollection.get(i);

                    if (!drawable.shape._vf.render) {
                        continue;
                    }

                    this.renderShape(drawable, viewarea, slights, numLights,
                                     mat_view, mat_scene, mat_light, mat_proj, gl);
                }
            }
        }

        this.stateManager.disable(gl.BLEND);
        this.stateManager.disable(gl.DEPTH_TEST);

        gl.flush();
        this.stateManager.bindFramebuffer(gl.FRAMEBUFFER, null);

        if (rt._webgl.fbo.mipMap) {
            gl.bindTexture(gl.TEXTURE_2D, rt._webgl.fbo.tex);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

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

        var bgCenter = x3dom.fields.SFVec3f.NullVector.toGL();
        var bgSize = x3dom.fields.SFVec3f.OneVector.toGL();

        for (var i = 0, n = scene.drawableCollection.length; i < n; i++)
        {
            var drawable = scene.drawableCollection.get(i);
            var trafo = drawable.transform;
            var shape = drawable.shape;
            var s_gl = shape._webgl;

            if (!s_gl || !shape || !shape._vf.render) {
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
                if (s_gl.popGeometry != 0 ||
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


            // render shape
            for (var q = 0, q_n = s_gl.positions.length; q < q_n; q++) {
                var q6 = 6 * q;
                var v, v_n, offset;

                if ( !(sp.position !== undefined && s_gl.buffers[q6 + 1] && s_gl.indexes[q]) )
                    continue;

                // bind buffers
                if (s_gl.buffers[q6]) {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, s_gl.buffers[q6]);
                }

                gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q6 + 1]);

                gl.vertexAttribPointer(sp.position,
                    s_msh._numPosComponents, s_gl.coordType, false,
                    shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
                gl.enableVertexAttribArray(sp.position);

                if (sp.normal !== undefined && s_gl.buffers[q6 + 2]) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, s_gl.buffers[q6 + 2]);

                    gl.vertexAttribPointer(sp.normal,
                        s_msh._numNormComponents, s_gl.normalType, false,
                        shape._normalStrideOffset[0], shape._normalStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.normal);
                }

                // draw mesh
                if (s_gl.binaryGeometry > 0 || s_gl.popGeometry > 0) {
                    for (v = 0, offset = 0, v_n = s_geo._vf.vertexCount.length; v < v_n; v++) {
                        gl.drawElements(s_gl.primType[v], s_geo._vf.vertexCount[v], s_gl.indexType,
                                        x3dom.Utils.getByteAwareOffset(offset, s_gl.indexType, gl));
                        offset += s_geo._vf.vertexCount[v];
                    }
                }
                else if (s_gl.binaryGeometry < 0 || s_gl.popGeometry < 0 || s_gl.imageGeometry) {
                    for (v = 0, offset = 0, v_n = s_geo._vf.vertexCount.length; v < v_n; v++) {
                        gl.drawArrays(s_gl.primType[v], offset, s_geo._vf.vertexCount[v]);
                        offset += s_geo._vf.vertexCount[v];
                    }
                }
                else if (s_geo.hasIndexOffset()) {
                    var indOff = shape.tessellationProperties();
                    for (v = 0, v_n = indOff.length; v < v_n; v++) {
                        gl.drawElements(s_gl.primType, indOff[v].count, s_gl.indexType,
                            indOff[v].offset * x3dom.Utils.getOffsetMultiplier(s_gl.indexType, gl));
                    }
                }
                else if (s_gl.indexes[q].length == 0) {
                    gl.drawArrays(s_gl.primType, 0, s_gl.positions[q].length / 3);
                }
                else {
                    gl.drawElements(s_gl.primType, s_gl.indexes[q].length, s_gl.indexType, 0);
                }

                gl.disableVertexAttribArray(sp.position);

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
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

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
