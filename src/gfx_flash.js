/*!
* x3dom javascript library 0.1
* http://x3dom.org/
*
* Copyright (c) 2009 Peter Eschler, Johannes Behr, Yvonne Jung
*     based on code originally provided by Philip Taylor:
*     http://philip.html5.org
* Dual licensed under the MIT and GPL licenses.
* 
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

	onMouseMove: function(x, y, button, canvas) {
		var x3dCanvas = x3dom.canvases[canvas];
		x3dCanvas.doc.onDrag(x3dCanvas.gl, x, y, button);
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
		this.setupScene(viewarea);
		
		//Get background node
		var background = scene.getBackground();
		
		//Setup the background
		this.setupBackground(background);
		
		//Collect all drawableObjects
		scene.drawableObjects = [];
		scene.collectDrawableObjects(x3dom.fields.SFMatrix4f.identity(), scene.drawableObjects);
		
		//Get Number of drawableObjects
		var numDrawableObjects = scene.drawableObjects.length;
		
		//Iterate over all Objects for setup
		for(var i=0; i<numDrawableObjects; i++) 
		{
			//Get object and transformation
			var trafo = scene.drawableObjects[i][0];
			var obj3d = scene.drawableObjects[i][1];
			
			this.setupShape(obj3d, trafo, viewarea);
		}
		
		//Render the flash scene
		this.object.renderScene();
	};
	
	/**
	*
	*/
	Context.prototype.setupScene = function(viewarea) {
		//Set View-Matrix
		var mat_view = viewarea.getViewMatrix();
		this.object.setViewMatrix( { viewMatrix: mat_view.toGL() });
		
		//Set Projection-Matrix
        var mat_proj = viewarea.getProjectionMatrix();
		this.object.setProjectionMatrix( { projectionMatrix: mat_proj.toGL() });
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
	Context.prototype.setupShape = function(shape, trafo, viewarea) {
	
		//Set modelMatrix
		this.object.setMeshTransform( { id: shape._objectID,
										transform: trafo.toGL() } );

		//
		if( shape._dirty.indexes === true ) {
			for( var i=0; i<shape._cf.geometry.node._mesh._indices.length; i++ ) {
				this.object.setMeshIndices( { id: shape._objectID, 
											  idx: i, 
											  indices: shape._cf.geometry.node._mesh._indices[i] } ); 
			}
			shape._dirty.indexes = false;
		}
		
		if( shape._dirty.positions === true ) {
			for( var i=0; i<shape._cf.geometry.node._mesh._positions.length; i++ ) {
				this.object.setMeshVertices( { id: shape._objectID, 
											   idx: i, 
											   vertices: shape._cf.geometry.node._mesh._positions[i] } );
			}
			shape._dirty.positions = false;
		}
		
		if( shape._dirty.normals === true ) {
			for( var i=0; i<shape._cf.geometry.node._mesh._normals.length; i++ ) {
				this.object.setMeshNormals( { id: shape._objectID, 
											  idx: i, 
											  normals: shape._cf.geometry.node._mesh._normals[i] } );
			}
			shape._dirty.normals = false;
		}
		
		if( shape._dirty.colors === true ) {
			for( var i=0; i<shape._cf.geometry.node._mesh._colors.length; i++ ) {
				this.object.setMeshColors( { id: shape._objectID, 
											 idx: i, 
											 colors: shape._cf.geometry.node._mesh._colors[i] } );
			}
			shape._dirty.colors = false;
		}
		
		if( shape._dirty.texcoords === true ) {
			for( var i=0; i<shape._cf.geometry.node._mesh._texCoords.length; i++ ) {
				this.object.setMeshTexCoords( { id: shape._objectID, 
											    idx: i, 
											    texCoords: shape._cf.geometry.node._mesh._texCoords[i] } );
			}
			shape._dirty.texcoords = false;
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
		
		if( shape._dirty.texture === true ) {
			var texture = shape._cf.appearance.node._cf.texture.node;
			if(texture) {
				this.object.setMeshTexture( { id: shape._objectID,
											  url: texture._vf.url[0] } );
			}
			shape._dirty.texture = false;
		}
	
	};
	
	/**
	*
	*/
	Context.prototype.pickValue = function(viewarea, x, y)
	{
	
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