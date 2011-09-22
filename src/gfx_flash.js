/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

x3dom.bridge = {

	setFlashReady: function(driver, canvas) {
		var x3dCanvas = x3dom.canvases[canvas];
		x3dCanvas.isFlashReady = true;
		x3dom.debug.logInfo('Flash is ready for rendering (' + driver + ')');
	},
	
	onMouseDown: function(x, y, button, canvas) {
		var x3dCanvas = x3dom.canvases[canvas];
		x3dCanvas.doc.onMousePress(x3dCanvas.gl, x, y, button);
		x3dCanvas.doc.needRender = true;
	},
	
	onMouseUp: function(x, y, button, canvas) {
		var x3dCanvas = x3dom.canvases[canvas];
		x3dCanvas.doc.onMouseRelease(x3dCanvas.gl, x, y, button);
		x3dCanvas.doc.needRender = true;
	},

	onMouseOver: function(x, y, button, canvas) {
		var x3dCanvas = x3dom.canvases[canvas];
		x3dCanvas.doc.onMouseOver(x3dCanvas.gl, x, y, button);
		x3dCanvas.doc.needRender = true;
	},

	onMouseOut: function(x, y, button, canvas) {
		var x3dCanvas = x3dom.canvases[canvas];
		x3dCanvas.doc.onMouseOut(x3dCanvas.gl, x, y, button);
		x3dCanvas.doc.needRender = true;
	},

	onDoubleClick: function(x, y, canvas) {
		var x3dCanvas = x3dom.canvases[canvas];
		x3dCanvas.doc.onDoubleClick(x3dCanvas.gl, x, y);
		x3dCanvas.doc.needRender = true;
		x3dom.debug.logInfo("dblClick");
	},

	onMouseDrag: function(x, y, button, canvas) {
		var x3dCanvas = x3dom.canvases[canvas];
		x3dCanvas.doc.onDrag(x3dCanvas.gl, x, y, button);
		x3dCanvas.doc.needRender = true;
	},
	
	onMouseMove: function(x, y, button, canvas) {
		var x3dCanvas = x3dom.canvases[canvas];
		x3dCanvas.doc.onMove(x3dCanvas.gl, x, y, button);
		x3dCanvas.doc.needRender = true;
	},

	onMouseWheel: function(x, y, button, canvas) {
		var x3dCanvas = x3dom.canvases[canvas];
		x3dCanvas.doc.onDrag(x3dCanvas.gl, x, y, button);
		x3dCanvas.doc.needRender = true;
	},

	onKeyDown: function(charCode, canvas) {
		var x3dCanvas = x3dom.canvases[canvas];
		var keysEnabled = x3dCanvas.x3dElem.getAttribute("keysEnabled");
		if (!keysEnabled || keysEnabled.toLowerCase() === "true") {
			x3dCanvas.doc.onKeyPress(charCode);
		}
		x3dCanvas.doc.needRender = true;
	}
};



x3dom.gfx_flash = (function() {

	/**
	*
	*/
	function Context(object, name) {
		this.object = object;
		this.name = name;
	};
	
	/**
	*
	*/
	function setupContext(object) {
		return new Context(object, 'flash');
	};
	
	/**
	*
	*/
	Context.prototype.getName = function() {
		return this.name;
	};
	
	/**
	*
	*/
	Context.prototype.renderScene = function (viewarea) {
		//Get Scene from Viewarea
        var scene = viewarea._scene;
		
		//Setup the flash scene
		this.setupScene(scene, viewarea);
		
		//Get background node
		var background = scene.getBackground();
		
		//Setup the background
		this.setupBackground(background);
		
		//Collect all drawableObjects
		scene.drawableObjects = null;
		scene.drawableObjects = [];
		scene.collectDrawableObjects(x3dom.fields.SFMatrix4f.identity(), scene.drawableObjects);
		
		//Get Number of drawableObjects
		var numDrawableObjects = scene.drawableObjects.length;
		
		if(numDrawableObjects > 0)
		{
			var RefList = [];
			
			//Iterate over all Objects for setup
			for(var i=0; i<numDrawableObjects; i++) 
			{
				//Get object and transformation
				var trafo = scene.drawableObjects[i][0];
				var obj3d = scene.drawableObjects[i][1];
				
				//Count shape references for DEF/USE
				if(RefList[obj3d._objectID] != undefined) {
					RefList[obj3d._objectID]++;
				} else {
					RefList[obj3d._objectID] = 0;
				}
				
				this.setupShape(obj3d, trafo, RefList[obj3d._objectID]);
			}
		
		}		
			
		//Render the flash scene
		this.object.renderScene();
		
		
	};
	
	/**
	*
	*/
	Context.prototype.setupScene = function(scene, viewarea) {
		//Set View-Matrix
		var mat_view = viewarea.getViewMatrix();
		this.object.setViewMatrix( { viewMatrix: mat_view.toGL() });
		
		//Set Projection-Matrix
        var mat_proj = viewarea.getProjectionMatrix();
		this.object.setProjectionMatrix( { projectionMatrix: mat_proj.toGL() });
		
		//Set HeadLight
		var nav = scene.getNavigationInfo();
        if(nav._vf.headlight){
			this.object.setLights( { idx: 0,
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
									 cutOffAngle: 0.0 } );
		}
		
		//TODO Set Lights
		var lights = viewarea.getLights();
		for(var i=0; i<lights.length; i++) {
			if(lights[i]._dirty) { 
				
				if( x3dom.isa(lights[i], x3dom.nodeTypes.DirectionalLight) ) 
				{
					x3dom.debug.logInfo(lights[i]._lightID);
					/*this.object.setDirectionalLight( { id: lights[i]._lightID,
													   on: lights[i]._vf.on,
													   color: lights[i]._vf.color.toGL(),
													   intensity: lights[i]._vf.color.toGL(),
													   ambientIntensity: lights[i]._vf.ambientIntensity,
													   direction: lights[i]._vf.direction.toGL() } );*/
				}
				else if( x3dom.isa(lights[i], x3dom.nodeTypes.PointLight) ) 
				{
					/*this.object.setPointLight( { id: lights[i]._lightID,
												 on: lights[i]._vf.on,
												 color: lights[i]._vf.color.toGL(),
												 intensity: lights[i]._vf.color.toGL(),
												 ambientIntensity: lights[i]._vf.ambientIntensity,
												 attenuation: lights[i]._vf.attenuation.toGL(),
												 location: lights[i]._vf.location.toGL(),
												 radius: lights[i]._vf.radius } );*/
				}
				else if( x3dom.isa(lights[i], x3dom.nodeTypes.SpotLight) ) 
				{
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
	};
	
	/**
	*
	*/
	Context.prototype.setupBackground = function(background) {
		//If background dirty -> update
		if(background._dirty)
		{
			this.object.setBackground( { texURLs: background.getTexUrl(),
										 skyAngle: background._vf.skyAngle,
										 skyColor: background.getSkyColor().toGL(),
										 groundAngle: background._vf.groundAngle,
										 groundColor: background.getGroundColor().toGL(),
										 transparency: background.getTransparency() } );
			background._dirty = false;
		}
	};
	
	/**
	*
	*/
	Context.prototype.setupShape = function(shape, trafo, refID) {
		
		//Check shape geometry type
		if (x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.PointSet)) {
			x3dom.debug.logError("Flash backend don't support PointSets yet");
			return;
		} else if (x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.IndexedLineSet)) {
			x3dom.debug.logError("Flash backend don't support LineSets yet");
			return;
		} else if (x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.Text)) { 
			this.setupText(shape, trafo, refID);
		} else {
			this.setupIndexedFaceSet(shape, trafo, refID);
		}
	
	};
	
	Context.prototype.setupIndexedFaceSet = function(shape, trafo, refID)
	{
		//Set modelMatrix
		this.object.setMeshTransform( { id: shape._objectID,
										refID: refID,
										transform: trafo.toGL() } );
		if(refID == 0)
		{
			//Check if is GeometryImage-Node
			var isImageGeometry = x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.ImageGeometry);
		
			//Set indices			
			if( shape._dirty.indexes === true ) {
				if(!isImageGeometry) {
					for( var i=0; i<shape._cf.geometry.node._mesh._indices.length; i++ ) {
						this.object.setMeshIndices( { id: shape._objectID,
													  idx: i, 
													  indices: shape._cf.geometry.node._mesh._indices[i] } ); 
					}
				}
				shape._dirty.indexes = false;
			}
			
			//Set vertices
			if( shape._dirty.positions === true ) {
				if(!isImageGeometry) {
					for( var i=0; i<shape._cf.geometry.node._mesh._positions.length; i++ ) {
						this.object.setMeshVertices( { id: shape._objectID,
													   idx: i, 
													   vertices: shape._cf.geometry.node._mesh._positions[i] } );
					}
				} else {
					this.object.setMeshVerticesTexture( { id: shape._objectID,
													      idx: 0,
														  bboxMin: shape._cf.geometry.node.getMin().toGL(),
														  bboxMax: shape._cf.geometry.node.getMax().toGL(),
														  bboxCenter: shape._cf.geometry.node.getCenter(),
														  numTriangles: shape._cf.geometry.node._vf.vertexCount/3,
													      coordinateTexture0: shape._cf.geometry.node.getCoordinateTextureURL(0),
														  coordinateTexture1: shape._cf.geometry.node.getCoordinateTextureURL(1) } );
				}
				shape._dirty.positions = false;
			}
			
			//Set normals
			if( shape._dirty.normals === true ) {
				if(!isImageGeometry) {
					if(shape._cf.geometry.node._mesh._normals[0].length) {
						for( var i=0; i<shape._cf.geometry.node._mesh._normals.length; i++ ) {
							this.object.setMeshNormals( { id: shape._objectID,
														  idx: i, 
														  normals: shape._cf.geometry.node._mesh._normals[i] } );
						}
					}
				} else {
					this.object.setMeshNormalsTexture( { id: shape._objectID,
														 idx: 0, 
														 normalTexture: shape._cf.geometry.node.getNormalTextureURL(0) } );
				}
				shape._dirty.normals = false;
			}
			
			//Set colors
			if( shape._dirty.colors === true ) {
				if(!isImageGeometry) {
					if(shape._cf.geometry.node._mesh._colors[0].length) {
						for( var i=0; i<shape._cf.geometry.node._mesh._colors.length; i++ ) {
							this.object.setMeshColors( { id: shape._objectID,
														 idx: i, 
														 colors: shape._cf.geometry.node._mesh._colors[i],
														 components: shape._cf.geometry.node._mesh._numColComponents } );
						}
					}
				} else {
					
				}
				shape._dirty.colors = false;
			}
			
			//Set texture coordinates
			if( shape._dirty.texcoords === true ) {
				if(!isImageGeometry) {
					if(shape._cf.geometry.node._mesh._texCoords[0].length) {
						for( var i=0; i<shape._cf.geometry.node._mesh._texCoords.length; i++ ) {
							this.object.setMeshTexCoords( { id: shape._objectID,					
															idx: i, 
															texCoords: shape._cf.geometry.node._mesh._texCoords[i] } );
						}
					}
				} else {
					this.object.setMeshTexCoordsTexture( { id: shape._objectID,					
														   idx: 0, 
														   texCoordTexture: shape._cf.geometry.node.getTexCoordTextureURL() } );
				}
				shape._dirty.texcoords = false;
			}
			
			//Set material
			if( shape._dirty.material === true ) {
				var material = shape._cf.appearance.node._cf.material.node;
				this.object.setMeshMaterial( { id: shape._objectID,	
											   ambientIntensity: material._vf.ambientIntensity,
											   diffuseColor: material._vf.diffuseColor.toGL(),
											   emissiveColor: material._vf.emissiveColor.toGL(),
											   shininess: material._vf.shininess,
											   specularColor: material._vf.specularColor.toGL(),
											   transparency: material._vf.transparency } );
				shape._dirty.material = false;
			}
			
			//Set Texture
			if( shape._dirty.texture === true ) {
				var texture = shape._cf.appearance.node._cf.texture.node;
				
				if(texture) {
				
					var childTex = (texture._video !== undefined && 
                                texture._video !== null && 
                                texture._needPerFrameUpdate !== undefined && 
                                texture._needPerFrameUpdate === true);
								
					if (x3dom.isa(texture, x3dom.nodeTypes.PixelTexture))
					{
						this.object.setPixelTexture( { id: shape._objectID,
													   width: texture._vf.image.width,
													   height: texture._vf.image.height,
													   comp: texture._vf.image.comp,
													   pixels: texture._vf.image.toGL() } );
					} else if(texture._isCanvas && texture._canvas) {			
						/*var context = texture._canvas.getContext("2d");
						var img = context.getImageData(0,0,256,256);
						this.object.setCanvasTexture( { id: shape._objectID,
													    width: 256,
													    height: 256,
													    comp: 4,
													    pixels: img.data } );*/
					} else if (x3dom.isa(texture, x3dom.nodeTypes.ComposedCubeMapTexture)) {
						this.object.setCubeTexture( { id: shape._objectID,
													  texURLs: texture.getTexUrl() } );
					} else if (x3dom.isa(texture, x3dom.nodeTypes.MultiTexture)) {
						x3dom.debug.logError("Flash backend don't support MultiTextures yet");
					} else if (x3dom.isa(texture, x3dom.nodeTypes.MovieTexture) || childTex) { 
						x3dom.debug.logError("Flash backend don't support MovieTextures yet");
					} else {
						this.object.setMeshTexture( { id: shape._objectID,
													  origChannelCount: texture._vf.origChannelCount,
													  repeatS: texture._vf.repeatS,
													  repeatT: texture._vf.repeatT,
													  url: texture._vf.url[0] } );
					}
				}
				shape._dirty.texture = false;
			}
			
			//Set Solid
			this.object.setMeshSolid( { id: shape._objectID,
										solid: shape.isSolid() } );
			
			//Set sphere mapping
			if (shape._cf.geometry.node._cf.texCoord !== undefined &&
                shape._cf.geometry.node._cf.texCoord.node !== null &&
				!x3dom.isa(shape._cf.geometry.node._cf.texCoord.node, x3dom.nodeTypes.X3DTextureNode) &&
                shape._cf.geometry.node._cf.texCoord.node._vf.mode)
            {
                var texMode = shape._cf.geometry.node._cf.texCoord.node._vf.mode;
                if (texMode.toLowerCase() == "sphere") {
                    this.object.setSphereMapping( { id: shape._objectID,
													sphereMapping: 1 } );
                }
                else {
                    this.object.setSphereMapping( { id: shape._objectID,
													sphereMapping: 0 } );
                }
            }
            else {
                this.object.setSphereMapping( { id: shape._objectID,
												sphereMapping: 0 } );
            }
		}
	};
	
	Context.prototype.setupText = function(shape, trafo, refID) 
	{
		//Set modelMatrix
		this.object.setMeshTransform( { id: shape._objectID,
										refID: refID,
										transform: trafo.toGL() } );
										
		if(refID == 0)
		{
	
			if( shape._dirty.text === true ) {
				var fontStyleNode = shape._cf.geometry.node._cf.fontStyle.node;
				if (fontStyleNode === null) {
					this.object.setText( { id: shape._objectID,
										   text: shape._cf.geometry.node._vf.string,
										   fontFamily: ['SERIF'],
										   fontStyle: "PLAIN",
										   fontAlign: "BEGIN",
										   fontSize: 32,
										   fontSpacing: 1.0,
										   fontHorizontal: true,
										   fontLanguage: "",
										   fontLeftToRight: true,
										   fontTopToBottom: true } );
				} else {
					this.object.setText( { id: shape._objectID,
										   text: shape._cf.geometry.node._vf.string,
										   fontFamily: fontStyleNode._vf.family.toString(),
										   fontStyle: fontStyleNode._vf.style.toString(),
										   fontAlign: fontStyleNode._vf.justify.toString(),
										   fontSize: fontStyleNode._vf.size,
										   fontSpacing: fontStyleNode._vf.spacing,
										   fontHorizontal: fontStyleNode._vf.horizontal,
										   fontLanguage: fontStyleNode._vf.language,
										   fontLeftToRight: fontStyleNode._vf.leftToRight,
										   fontTopToBottom: fontStyleNode._vf.topToBottom } );
				}
				shape._dirty.text = false; 
			}
		
			if( shape._dirty.material === true ) {
				var material = shape._cf.appearance.node._cf.material.node;
				this.object.setMeshMaterial( { id: shape._objectID,
											   ambientIntensity: material._vf.ambientIntensity,
											   diffuseColor: material._vf.diffuseColor.toGL(),
											   emissiveColor: material._vf.emissiveColor.toGL(),
											   shininess: material._vf.shininess,
											   specularColor: material._vf.specularColor.toGL(),
											   transparency: material._vf.transparency } );
				shape._dirty.material = false;
			}
		
			this.object.setMeshSolid( { id: shape._objectID,
										solid: shape.isSolid() } );
		
		}								
	};
	
	
	/**
	*
	*/
	Context.prototype.pickValue = function(viewarea, x, y, viewMat, sceneMat)
	{
        var scene = viewarea._scene;
	
		// method requires that scene has already been rendered at least once
        if (this.object === null || scene === null || scene.drawableObjects === undefined || 
		    !scene.drawableObjects || scene._vf.pickMode.toLowerCase() === "box")
        {
            return false;
        }
        
        var pickMode = (scene._vf.pickMode.toLowerCase() === "color") ? 1 :
                       ((scene._vf.pickMode.toLowerCase() === "texcoord") ? 2 : 0);
		
		var data = this.object.pickValue( { pickMode: pickMode } );
								 
		if(data.objID > 0) {
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
	Context.prototype.shutdown = function(viewarea)
	{
	
	};
	
	//Return the setup context function
	return setupContext;
})();