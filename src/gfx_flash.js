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

x3dom.bridge = {

    setFlashReady: function (driver, canvas) {
        var x3dCanvas = x3dom.canvases[canvas];
        x3dCanvas.isFlashReady = true;
        x3dom.debug.logInfo('Flash is ready for rendering (' + driver + ')');
    },

    onMouseDown: function (x, y, button, canvas) {
        var x3dCanvas = x3dom.canvases[canvas];
        x3dCanvas.doc.onMousePress(x3dCanvas.gl, x, y, button);
        x3dCanvas.doc.needRender = true;
    },

    onMouseUp: function (x, y, button, canvas) {
        var x3dCanvas = x3dom.canvases[canvas];
        x3dCanvas.doc.onMouseRelease(x3dCanvas.gl, x, y, button);
        x3dCanvas.doc.needRender = true;
    },

    onMouseOver: function (x, y, button, canvas) {
        var x3dCanvas = x3dom.canvases[canvas];
        x3dCanvas.doc.onMouseOver(x3dCanvas.gl, x, y, button);
        x3dCanvas.doc.needRender = true;
    },

    onMouseOut: function (x, y, button, canvas) {
        var x3dCanvas = x3dom.canvases[canvas];
        x3dCanvas.doc.onMouseOut(x3dCanvas.gl, x, y, button);
        x3dCanvas.doc.needRender = true;
    },

    onDoubleClick: function (x, y, canvas) {
        var x3dCanvas = x3dom.canvases[canvas];
        x3dCanvas.doc.onDoubleClick(x3dCanvas.gl, x, y);
        x3dCanvas.doc.needRender = true;
        x3dom.debug.logInfo("dblClick");
    },

    onMouseDrag: function (x, y, button, canvas) {
        var x3dCanvas = x3dom.canvases[canvas];
        x3dCanvas.doc.onDrag(x3dCanvas.gl, x, y, button);
        x3dCanvas.doc.needRender = true;
    },

    onMouseMove: function (x, y, button, canvas) {
        var x3dCanvas = x3dom.canvases[canvas];
        x3dCanvas.doc.onMove(x3dCanvas.gl, x, y, button);
        x3dCanvas.doc.needRender = true;
    },

    onMouseWheel: function (x, y, button, canvas) {
        var x3dCanvas = x3dom.canvases[canvas];
        x3dCanvas.doc.onDrag(x3dCanvas.gl, x, y, button);
        x3dCanvas.doc.needRender = true;
    },

    onKeyDown: function (charCode, canvas) {
        var x3dCanvas = x3dom.canvases[canvas];
        var keysEnabled = x3dCanvas.x3dElem.getAttribute("keysEnabled");
        if (!keysEnabled || keysEnabled.toLowerCase() === "true") {
            x3dCanvas.doc.onKeyPress(charCode);
        }
        x3dCanvas.doc.needRender = true;
    },

    setBBox: function (id, center, size) {
        var shape = x3dom.nodeTypes.Shape.idMap.nodeID[id];
        //shape._vf.bboxCenter.setValues( new x3dom.fields.SFVec3f(center.x,center.y,center.z) );
        //shape._vf.bboxSize.setValues( new x3dom.fields.SFVec3f(size.x,size.y,size.z) );
    },

    setShapeDirty: function (id) {
        var shape = x3dom.nodeTypes.Shape.idMap.nodeID[id];
        shape.setAllDirty();
    }
};


x3dom.gfx_flash = (function () {

    /**
     *
     */
    function Context(object, name, renderType) {
        this.object = object;
        this.name = name;
        this.isAlreadySet = false;
        this.renderType = renderType;
    }

    /**
     *
     */
    function setupContext(object, renderType) {
        return new Context(object, 'flash', renderType);
    }

    /**
     *
     */
    Context.prototype.getName = function () {
        return this.name;
    };

    /**
     *
     */
    Context.prototype.renderScene = function (viewarea) {
        //Get Scene from Viewarea
        var scene = viewarea._scene;

        var min = x3dom.fields.SFVec3f.MAX();
        var max = x3dom.fields.SFVec3f.MIN();

        var vol = scene.getVolume();
        vol.getBounds(min, max);

        scene._lastMin = min;
        scene._lastMax = max;

        viewarea._last_mat_view = x3dom.fields.SFMatrix4f.identity();
        viewarea._last_mat_proj = x3dom.fields.SFMatrix4f.identity();
        viewarea._last_mat_scene = x3dom.fields.SFMatrix4f.identity();

        //Dirty HACK
        var viewpoint = scene.getViewpoint();
        if (viewpoint._vf.zNear == -1 || viewpoint._vf.zFar == -1) {
            viewpoint._vf.zFar = 20000;
            viewpoint._vf.zNear = 0.1;
        }

        var mat_view = viewarea.getViewMatrix();
        var mat_proj = viewarea.getProjectionMatrix();
        var mat_scene = mat_proj.mult(mat_view);

        //Setup the flash scene
        this.setupScene(scene, viewarea);

        //Get background node
        var background = scene.getBackground();

        //Setup the background
        this.setupBackground(background);

        //Collect all drawableObjects
        scene.drawableCollection = null;
        var env = scene.getEnvironment();

        var drawableCollectionConfig = {
            viewArea: viewarea,
            sortTrans: env._vf.sortTrans,
            viewMatrix: mat_view,
            projMatrix: mat_proj,
            sceneMatrix: mat_scene,
            frustumCulling: false,
            smallFeatureThreshold: false,
            context: null,
            gl: null
        };

        scene.drawableCollection = new x3dom.DrawableCollection(drawableCollectionConfig);
        scene.collectDrawableObjects(x3dom.fields.SFMatrix4f.identity(), scene.drawableCollection, true, false, 0);

        scene.drawableCollection.concat();

        //Get Number of drawableObjects
        var numDrawableObjects = scene.drawableCollection.length;

        if (numDrawableObjects > 0) {
            var RefList = [];

            //Iterate over all Objects for setup
            for (var i = 0; i < numDrawableObjects; i++) {
                //Get object and transformation
                var drawable = scene.drawableCollection.get(i);
                var trafo = drawable.transform;
                var obj3d = drawable.shape;

                //Count shape references for DEF/USE
                if (RefList[obj3d._objectID] != undefined) {
                    RefList[obj3d._objectID]++;
                } else {
                    RefList[obj3d._objectID] = 0;
                }

                // TODO; move to addDrawable()
                this.setupShape(obj3d, trafo, RefList[obj3d._objectID]);
            }
        }

        //Render the flash scene
        this.object.renderScene();
    };

    /**
     *
     */
    Context.prototype.setupScene = function (scene, viewarea) {

        //Set View-Matrix
        var mat_view = viewarea.getViewMatrix();

        // fire viewpointChanged event
        if (!viewarea._last_mat_view.equals(mat_view)) {
            var e_viewpoint = viewarea._scene.getViewpoint();
            var e_eventType = "viewpointChanged";
            /*TEST*/
            try {
                if (e_viewpoint._xmlNode &&
                    (e_viewpoint._xmlNode["on" + e_eventType] ||
                        e_viewpoint._xmlNode.hasAttribute("on" + e_eventType) ||
                        e_viewpoint._listeners[e_eventType])) {
                    var e_viewtrafo = e_viewpoint.getCurrentTransform();
                    e_viewtrafo = e_viewtrafo.inverse().mult(mat_view);

                    var e_mat = e_viewtrafo.inverse();

                    var e_rotation = new x3dom.fields.Quaternion(0, 0, 1, 0);
                    //e_rotation.setValue(e_mat);

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
                        }
                    };

                    e_viewpoint.callEvtHandler(e_eventType, e_event);
                }
            }
            catch (e_e) {
                x3dom.debug.logException(e_e);
            }
        }

        viewarea._last_mat_view = mat_view;

        //Dirty HACK
        var viewpoint = scene.getViewpoint();
        //viewpoint._vf.zFar = 100;
        //viewpoint._vf.zNear = 0.1;

        var mat_proj = viewarea.getProjectionMatrix();

        this.object.setViewpoint({ fov: viewpoint._vf.fov,
            zFar: viewpoint._vf.zFar,
            zNear: viewpoint._vf.zNear,
            viewMatrix: mat_view.toGL(),
            projectionMatrix: mat_proj.toGL() });

        //Set HeadLight
        var nav = scene.getNavigationInfo();
        if (nav._vf.headlight) {
            /*this.object.setLights( { idx: 0,
             type: 0,
             on: 1.0,
             color: [1.0, 1.0, 1.0],
             intensity: 1.0,
             ambientIntensity: 0.0,
             direction: [0.0, 0.0, 1.0],
             attenuation: [1.0, 1.0, 1.0],
             location: [1.0, 1.0, 1.0],
             radius: 0.0,
             beamWidth: 0.0,
             cutOffAngle: 0.0 } );*/

            this.object.setHeadLight({ id: -1,
                on: 1.0,
                color: [1.0, 1.0, 1.0],
                intensity: 1.0,
                ambientIntensity: 0.0,
                direction: [0.0, 0.0, -1.0] });
        }

        //TODO Set Lights
        if (this.renderType == "deferred") {
            var lights = viewarea.getLights();
            for (var i = 0; i < lights.length; i++) {
                if (lights[i]._dirty) {

                    if (x3dom.isa(lights[i], x3dom.nodeTypes.DirectionalLight)) {
                        this.object.setDirectionalLight({ id: lights[i]._lightID,
                            on: lights[i]._vf.on,
                            color: lights[i]._vf.color.toGL(),
                            intensity: lights[i]._vf.intensity,
                            ambientIntensity: lights[i]._vf.ambientIntensity,
                            direction: lights[i]._vf.direction.toGL() });
                    }
                    else if (x3dom.isa(lights[i], x3dom.nodeTypes.PointLight)) {
                        var light_transform = mat_view.mult(lights[i].getCurrentTransform());

                        this.object.setPointLight({ id: lights[i]._lightID,
                            on: lights[i]._vf.on,
                            color: lights[i]._vf.color.toGL(),
                            intensity: lights[i]._vf.intensity,
                            ambientIntensity: lights[i]._vf.ambientIntensity,
                            attenuation: lights[i]._vf.attenuation.toGL(),
                            location: lights[i]._vf.location.toGL(),
                            radius: lights[i]._vf.radius });
                    }
                    else if (x3dom.isa(lights[i], x3dom.nodeTypes.SpotLight)) {
                        /*this.object.setSpotLight( { id: lights[i]._lightID,
                         on: lights[i]._vf.on,
                         color: lights[i]._vf.color.toGL(),
                         intensity: lights[i]._vf.color.toGL(),
                         ambientIntensity: lights[i]._vf.ambientIntensity,
                         direction: lights[i]._vf.direction.toGL(),
                         attenuation: lights[i]._vf.attenuation.toGL(),
                         location: lights[i]._vf.location.toGL(),
                         radius: lights[i]._vf.radius,
                         beamWidth: lights[i]._vf.beamWidth,
                         cutOffAngle: lights[i]._vf.cutOffAngle } );*/
                    }
                    lights[i]._dirty = false;
                }
            }
        }
    };

    /**
     *
     */
    Context.prototype.setupBackground = function (background) {
        //If background dirty -> update
        if (background._dirty) {
            this.object.setBackground({ texURLs: background.getTexUrl(),
                skyAngle: background._vf.skyAngle,
                skyColor: background.getSkyColor().toGL(),
                groundAngle: background._vf.groundAngle,
                groundColor: background.getGroundColor().toGL(),
                transparency: background.getTransparency() });
            background._dirty = false;
        }
    };

    /**
     *
     */
    Context.prototype.setupShape = function (shape, trafo, refID) {

        //Check shape geometry type
        if (x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.PointSet)) {
            x3dom.debug.logError("Flash backend doesn't support PointSets yet");
        } else if (x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.IndexedLineSet)) {
            x3dom.debug.logError("Flash backend doesn't support LineSets yet");
        } else if (x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.Text)) {
            this.setupText(shape, trafo, refID);
        } else {
            this.setupIndexedFaceSet(shape, trafo, refID);
        }
    };

    Context.prototype.setupIndexedFaceSet = function (shape, trafo, refID) {
        //Set modelMatrix
        this.object.setMeshTransform({ id: shape._objectID,
            refID: refID,
            transform: trafo.toGL() });
        if (refID == 0) {
            //Check if is ImageGeometry or BinaryGeometry
            var isImageGeometry = x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.ImageGeometry);
            var isBinaryGeometry = x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.BinaryGeometry);
            var isBitLODGeometry = x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.BitLODGeometry);

            //Check if Appearance is available
            var appearance = shape._cf.appearance.node;
            var sortType = (appearance) ? shape._cf.appearance.node._vf.sortType : "auto";
            var sortKey = (appearance) ? shape._cf.appearance.node._vf.sortKey : 0

            //Set Mesh Properties
            if (isImageGeometry) {
                this.object.setMeshProperties({ id: shape._objectID,
                    type: "ImageGeometry",
                    sortType: sortType,
                    sortKey: sortKey,
                    solid: shape.isSolid(),
                    bboxMin: shape._cf.geometry.node.getMin().toGL(),
                    bboxMax: shape._cf.geometry.node.getMax().toGL(),
                    bboxCenter: shape._cf.geometry.node.getCenter().toGL(),
                    primType: shape._cf.geometry.node._vf.primType,
                    vertexCount: shape._cf.geometry.node._vf.vertexCount });
            } else if (isBinaryGeometry) {
                this.object.setMeshProperties({ id: shape._objectID,
                    type: "BinaryGeometry",
                    sortType: sortType,
                    sortKey: sortKey,
                    solid: shape.isSolid(),
                    bgCenter: shape._cf.geometry.node._vf.position.toGL(),
                    bgSize: shape._cf.geometry.node._vf.size.toGL(),
                    bboxCenter: shape._cf.geometry.node.getCenter().toGL(),
                    primType: shape._cf.geometry.node._vf.primType,
                    vertexCount: shape._cf.geometry.node._vf.vertexCount });
            } else if (isBitLODGeometry) {
                this.object.setMeshProperties({ id: shape._objectID,
                    type: "BitLODGeometry",
                    sortType: sortType,
                    sortKey: sortKey,
                    solid: shape.isSolid(),
                    bboxMin: shape._cf.geometry.node.getMin().toGL(),
                    bboxMax: shape._cf.geometry.node.getMax().toGL(),
                    bboxCenter: shape._cf.geometry.node.getCenter().toGL(),
                    primType: shape._cf.geometry.node._vf.primType,
                    vertexCount: shape._cf.geometry.node._vf.vertexCount });
            } else {
                this.object.setMeshProperties({ id: shape._objectID,
                    type: "Default",
                    sortType: sortType,
                    sortKey: sortKey,
                    solid: shape.isSolid() });
            }

            //Set indices
            if (shape._dirty.indexes === true) {
                if (isImageGeometry) {
                    //TODO new flash IG implementation
                    /*this.object.setMeshIndices( { id: shape._objectID,
                     idx: 0,
                     indices: shape._cf.geometry.node.getIndexTextureURL() } );*/
                } else if (isBinaryGeometry) {
                    this.object.setMeshIndices({ id: shape._objectID,
                        idx: 0,
                        indices: shape._nameSpace.getURL(shape._cf.geometry.node._vf.index) });


                } else if (isBitLODGeometry) {
                    this.object.setMeshIndices({ id: shape._objectID,
                        idx: 0,
                        indices: shape._nameSpace.getURL(shape._cf.geometry.node._vf.index) });
                } else {
                    for (var i = 0; i < shape._cf.geometry.node._mesh._indices.length; i++) {
                        this.object.setMeshIndices({ id: shape._objectID,
                            idx: i,
                            indices: shape._cf.geometry.node._mesh._indices[i] });
                    }
                }
                shape._dirty.indexes = false;
            }

            //Set vertices
            if (shape._dirty.positions === true) {
                if (isImageGeometry) {
                    this.object.setMeshVertices({ id: shape._objectID,
                        idx: 0,
                        //TODO new flash IG implementation coords: shape._cf.geometry.node.getCoordinateTextureURLs(),
                        coordinateTexture0: shape._cf.geometry.node.getCoordinateTextureURL(0),
                        coordinateTexture1: shape._cf.geometry.node.getCoordinateTextureURL(1) });
                } else if (isBinaryGeometry) {
                    this.object.setMeshVertices({ id: shape._objectID,
                        idx: 0,
                        interleaved: shape._cf.geometry.node._hasStrideOffset,
                        vertices: shape._nameSpace.getURL(shape._cf.geometry.node._vf.coord),
                        normals: shape._nameSpace.getURL(shape._cf.geometry.node._vf.normal),
                        texCoords: shape._nameSpace.getURL(shape._cf.geometry.node._vf.texCoord),
                        colors: shape._nameSpace.getURL(shape._cf.geometry.node._vf.color),
                        numColorComponents: shape._cf.geometry.node._mesh._numColComponents,
                        numNormalComponents: shape._cf.geometry.node._mesh._numNormComponents,
                        vertexType: shape._cf.geometry.node._vf.coordType,
                        normalType: shape._cf.geometry.node._vf.normalType,
                        texCoordType: shape._cf.geometry.node._vf.texCoordType,
                        colorType: shape._cf.geometry.node._vf.colorType,
                        vertexStrideOffset: shape._coordStrideOffset,
                        normalStrideOffset: shape._normalStrideOffset,
                        texCoordStrideOffset: shape._texCoordStrideOffset,
                        colorStrideOffset: shape._colorStrideOffset });
                } else if (isBitLODGeometry) {
                    this.object.setMeshVertices({ id: shape._objectID,
                        componentURLs: shape._cf.geometry.node.getComponentsURLs(),
                        componentFormats: shape._cf.geometry.node.getComponentFormats(),
                        componentAttribs: shape._cf.geometry.node.getComponentAttribs()});
                } else {
                    for (var i = 0; i < shape._cf.geometry.node._mesh._positions.length; i++) {
                        this.object.setMeshVertices({ id: shape._objectID,
                            idx: i,
                            vertices: shape._cf.geometry.node._mesh._positions[i] });
                    }
                }
                shape._dirty.positions = false;
            }

            //Set normals
            if (shape._dirty.normals === true) {
                if (isImageGeometry) {
                    this.object.setMeshNormals({ id: shape._objectID,
                        idx: 0,
                        //TODO new flash IG implementation normals: shape._cf.geometry.node.getNormalTextureURLs(),
                        normalTexture: shape._cf.geometry.node.getNormalTextureURL() });
                } else if (isBinaryGeometry) {
                    if (!shape._cf.geometry.node._hasStrideOffset) {
                        this.object.setMeshNormals({ id: shape._objectID,
                            idx: 0,
                            normals: shape._nameSpace.getURL(shape._cf.geometry.node._vf.normal) });
                    }
                } else if (isBitLODGeometry) {
                    //Nothing won't implement!
                } else {
                    if (shape._cf.geometry.node._mesh._normals[0].length) {
                        for (var i = 0; i < shape._cf.geometry.node._mesh._normals.length; i++) {
                            this.object.setMeshNormals({ id: shape._objectID,
                                idx: i,
                                normals: shape._cf.geometry.node._mesh._normals[i] });
                        }
                    }
                }
                shape._dirty.normals = false;
            }

            //Set colors
            if (shape._dirty.colors === true) {
                if (isImageGeometry) {
                    this.object.setMeshColors({ id: shape._objectID,
                        idx: 0,
                        colorTexture: shape._cf.geometry.node.getColorTextureURL(),
                        components: shape._cf.geometry.node._mesh._numColComponents });
                } else if (isBinaryGeometry) {
                    if (!shape._cf.geometry.node._hasStrideOffset) {
                        this.object.setMeshColors({ id: shape._objectID,
                            idx: 0,
                            colors: shape._nameSpace.getURL(shape._cf.geometry.node._vf.color),
                            components: shape._cf.geometry.node._mesh._numColComponents });
                    }
                } else if (isBitLODGeometry) {
                    //Nothing won't implement!
                } else {
                    if (shape._cf.geometry.node._mesh._colors[0].length) {
                        for (var i = 0; i < shape._cf.geometry.node._mesh._colors.length; i++) {
                            this.object.setMeshColors({ id: shape._objectID,
                                idx: i,
                                colors: shape._cf.geometry.node._mesh._colors[i],
                                components: shape._cf.geometry.node._mesh._numColComponents });
                        }
                    }
                }
                shape._dirty.colors = false;
            }

            //Set texture coordinates
            if (shape._dirty.texcoords === true) {
                if (isImageGeometry) {
                    this.object.setMeshTexCoords({ id: shape._objectID,
                        idx: 0,
                        texCoordTexture: shape._cf.geometry.node.getTexCoordTextureURL() });
                } else if (isBinaryGeometry) {
                    if (!shape._cf.geometry.node._hasStrideOffset) {
                        this.object.setMeshTexCoords({ id: shape._objectID,
                            idx: 0,
                            texCoords: shape._nameSpace.getURL(shape._cf.geometry.node._vf.texCoord) });
                    }
                } else if (isBitLODGeometry) {
                    //Nothing, won't implement!
                } else {
                    if (shape._cf.geometry.node._mesh._texCoords[0].length) {
                        for (var i = 0; i < shape._cf.geometry.node._mesh._texCoords.length; i++) {
                            this.object.setMeshTexCoords({ id: shape._objectID,
                                idx: i,
                                texCoords: shape._cf.geometry.node._mesh._texCoords[i] });
                        }
                    }
                }
                shape._dirty.texcoords = false;
            }

            //Set material
            if (shape._dirty.material === true) {
                if (appearance) {
                    var material = shape._cf.appearance.node._cf.material.node;
                    if (material) {
                        this.object.setMeshMaterial({ id: shape._objectID,
                            ambientIntensity: material._vf.ambientIntensity,
                            diffuseColor: material._vf.diffuseColor.toGL(),
                            emissiveColor: material._vf.emissiveColor.toGL(),
                            shininess: material._vf.shininess,
                            specularColor: material._vf.specularColor.toGL(),
                            transparency: material._vf.transparency });
                    }
                }
                shape._dirty.material = false;
            }

            //Set Texture
            if (shape._dirty.texture === true) {
                if (appearance) {
                    var texTrafo = null;
                    if (appearance._cf.textureTransform.node) {
                        texTrafo = appearance.texTransformMatrix().toGL();
                    }

                    var texture = shape._cf.appearance.node._cf.texture.node;

                    if (texture) {
                        if (x3dom.isa(texture, x3dom.nodeTypes.PixelTexture)) {
                            this.object.setPixelTexture({ id: shape._objectID,
                                width: texture._vf.image.width,
                                height: texture._vf.image.height,
                                comp: texture._vf.image.comp,
                                pixels: texture._vf.image.toGL() });
                        } else if (x3dom.isa(texture, x3dom.nodeTypes.ComposedCubeMapTexture)) {
                            this.object.setCubeTexture({ id: shape._objectID,
                                texURLs: texture.getTexUrl() });
                        } else if (texture._isCanvas && texture._canvas) {
                            this.object.setCanvasTexture({ id: shape._objectID,
                                width: texture._canvas.width,
                                height: texture._canvas.height,
                                dataURL: texture._canvas.toDataURL() });
                        } else if (x3dom.isa(texture, x3dom.nodeTypes.MultiTexture)) {
                            x3dom.debug.logError("Flash backend doesn't support MultiTextures yet");
                        } else if (x3dom.isa(texture, x3dom.nodeTypes.MovieTexture)) {
                            x3dom.debug.logError("Flash backend doesn't support MovieTextures yet");
                        } else {
                            this.object.setMeshTexture({ id: shape._objectID,
                                origChannelCount: texture._vf.origChannelCount,
                                repeatS: texture._vf.repeatS,
                                repeatT: texture._vf.repeatT,
                                url: texture._vf.url[0],
                                transform: texTrafo });
                        }
                    } else {
                        this.object.removeTexture({ id: shape._objectID });
                    }
                }
                shape._dirty.texture = false;
            }

            //Set sphere mapping
            if (shape._cf.geometry.node._cf.texCoord !== undefined &&
                shape._cf.geometry.node._cf.texCoord.node !== null &&
                !x3dom.isa(shape._cf.geometry.node._cf.texCoord.node, x3dom.nodeTypes.X3DTextureNode) &&
                shape._cf.geometry.node._cf.texCoord.node._vf.mode) {
                var texMode = shape._cf.geometry.node._cf.texCoord.node._vf.mode;
                if (texMode.toLowerCase() == "sphere") {
                    this.object.setSphereMapping({ id: shape._objectID,
                        sphereMapping: 1 });
                }
                else {
                    this.object.setSphereMapping({ id: shape._objectID,
                        sphereMapping: 0 });
                }
            }
            else {
                this.object.setSphereMapping({ id: shape._objectID,
                    sphereMapping: 0 });
            }
        }
    };

    Context.prototype.setupText = function (shape, trafo, refID) {
        //Set modelMatrix
        this.object.setMeshTransform({ id: shape._objectID,
            refID: refID,
            transform: trafo.toGL() });

        if (refID == 0) {

            /*this.object.setMeshProperties( { id: shape._objectID,
             type: "Text",
             solid: shape.isSolid() } );*/

            //Check if Appearance is available
            var appearance = shape._cf.appearance.node;
            var sortType = (appearance) ? shape._cf.appearance.node._vf.sortType : "auto";
            var sortKey = (appearance) ? shape._cf.appearance.node._vf.sortKey : 0

            if (shape._dirty.text === true) {
                var fontStyleNode = shape._cf.geometry.node._cf.fontStyle.node;
                if (fontStyleNode === null) {
                    this.object.setMeshProperties({ id: shape._objectID,
                        type: "Text",
                        sortType: sortType,
                        sortKey: sortKey,
                        solid: shape.isSolid(),
                        text: shape._cf.geometry.node._vf.string,
                        fontFamily: ['SERIF'],
                        fontStyle: "PLAIN",
                        fontAlign: "BEGIN",
                        fontSize: 32,
                        fontSpacing: 1.0,
                        fontHorizontal: true,
                        fontLanguage: "",
                        fontLeftToRight: true,
                        fontTopToBottom: true });
                } else {
                    this.object.setMeshProperties({ id: shape._objectID,
                        type: "Text",
                        sortType: sortType,
                        sortKey: sortKey,
                        solid: shape.isSolid(),
                        text: shape._cf.geometry.node._vf.string,
                        fontFamily: fontStyleNode._vf.family.toString(),
                        fontStyle: fontStyleNode._vf.style.toString(),
                        fontAlign: fontStyleNode._vf.justify.toString(),
                        fontSize: fontStyleNode._vf.size,
                        fontSpacing: fontStyleNode._vf.spacing,
                        fontHorizontal: fontStyleNode._vf.horizontal,
                        fontLanguage: fontStyleNode._vf.language,
                        fontLeftToRight: fontStyleNode._vf.leftToRight,
                        fontTopToBottom: fontStyleNode._vf.topToBottom });
                }
                shape._dirty.text = false;
            }

            if (shape._dirty.material === true) {
                if (appearance) {
                    var material = shape._cf.appearance.node._cf.material.node;
                    if (material) {
                        this.object.setMeshMaterial({ id: shape._objectID,
                            ambientIntensity: material._vf.ambientIntensity,
                            diffuseColor: material._vf.diffuseColor.toGL(),
                            emissiveColor: material._vf.emissiveColor.toGL(),
                            shininess: material._vf.shininess,
                            specularColor: material._vf.specularColor.toGL(),
                            transparency: material._vf.transparency });
                    }
                }
                shape._dirty.material = false;
            }
        }
    };


    /**
     *
     */
    Context.prototype.pickValue = function (viewarea, x, y, viewMat, sceneMat) {
        var scene = viewarea._scene;

        // method requires that scene has already been rendered at least once
        if (this.object === null || scene === null || scene.drawableCollection === undefined || !scene.drawableCollection || scene._vf.pickMode.toLowerCase() === "box") {
            return false;
        }

        var pickMode = (scene._vf.pickMode.toLowerCase() === "color") ? 1 :
            ((scene._vf.pickMode.toLowerCase() === "texcoord") ? 2 : 0);

        var data = this.object.pickValue({ pickMode: pickMode });

        if (data.objID > 0) {
            viewarea._pickingInfo.pickPos = new x3dom.fields.SFVec3f(data.pickPosX, data.pickPosY, data.pickPosZ);
            viewarea._pickingInfo.pickObj = x3dom.nodeTypes.Shape.idMap.nodeID[data.objID];
        } else {
            viewarea._pickingInfo.pickObj = null;
            viewarea._pickingInfo.lastClickObj = null;
        }

        return true;
    };

    /**
     *
     */
    Context.prototype.shutdown = function (viewarea) {
        // TODO?
    };

    //Return the setup context function
    return setupContext;
})();
