/**
 * x3dom actionscript library 0.1
 * http://x3dom.org/
 *
 * Copyright (c) 2011 Johannes Behr, Yvonne Jung, Timo Sturm
 * Dual licensed under the MIT and GPL licenses.
 */

package x3dom {
	
	import flash.display.BitmapData;
	import flash.display.Scene;
	import flash.external.ExternalInterface;
	import flash.geom.*;
	
	import x3dom.*;
	import x3dom.lighting.*;
	import x3dom.texturing.*;
	
	public class Bridge {
		
		private var _scene:X3DScene;
		
		private var _renderer:Renderer;

		public function Bridge(scene:X3DScene, renderer:Renderer) 
		{
			//Set scene
			this._scene = scene;
			
			this._renderer = renderer;
			
			//Register JS callback functions
			ExternalInterface.addCallback("renderScene", renderScene);
			ExternalInterface.addCallback("pickValue", pickValue);
			ExternalInterface.addCallback("setViewMatrix", setViewMatrix);
			ExternalInterface.addCallback("setProjectionMatrix", setProjectionMatrix);
			ExternalInterface.addCallback("setBackground", setBackground);
			ExternalInterface.addCallback("setMeshTransform", setMeshTransform);
			ExternalInterface.addCallback("setMeshMaterial", setMeshMaterial);
			ExternalInterface.addCallback("setGeometryImage", setGeometryImage);
			ExternalInterface.addCallback("setMeshColors", setMeshColors);
			ExternalInterface.addCallback("setMeshColorsTexture", setMeshColorsTexture);
			ExternalInterface.addCallback("setMeshIndices", setMeshIndices);
			ExternalInterface.addCallback("setMeshNormals", setMeshNormals);
			ExternalInterface.addCallback("setMeshNormalsTexture", setMeshNormalsTexture);
			ExternalInterface.addCallback("setMeshTexCoords", setMeshTexCoords);
			ExternalInterface.addCallback("setMeshTexCoordsTexture", setMeshTexCoordsTexture);
			ExternalInterface.addCallback("setMeshVertices", setMeshVertices);
			ExternalInterface.addCallback("setMeshVerticesTexture", setMeshVerticesTexture);
			ExternalInterface.addCallback("setMeshTexture", setMeshTexture);
			ExternalInterface.addCallback("setPixelTexture", setPixelTexture);
			ExternalInterface.addCallback("setCubeTexture", setCubeTexture);
			ExternalInterface.addCallback("setCanvasTexture", setCanvasTexture);
			ExternalInterface.addCallback("setLights", setLights);
			ExternalInterface.addCallback("setDirectionalLight", setDirectionalLight);
			ExternalInterface.addCallback("setPointLight", setPointLight);
			ExternalInterface.addCallback("setSpotLight", setSpotLight);
			ExternalInterface.addCallback("setText", setText);
			ExternalInterface.addCallback("setSphereMapping", setSphereMapping);
			ExternalInterface.addCallback("setMeshSolid", setMeshSolid);
			ExternalInterface.addCallback("setFPS", setFPS);
		}
		
		private function renderScene() : void
		{
			FlashBackend.getLoadingScreen().visible = false;
			this._scene.checkForRemovedNodes();
			this._renderer.render();
		}
		
		private function pickValue(value:Object) : Object
		{						
			return {objID: this._scene.pickedObj,
					pickPosX:this. _scene.pickedPos.x,
					pickPosY: this._scene.pickedPos.y,
					pickPosZ: this._scene.pickedPos.z };
		}
		
		private function setFPS(value:Object) : void
		{						
			FlashBackend.setFPS( Number(value.fps) );
		}
		
		private function setViewMatrix(value:Object) : void
		{
			this._scene.viewMatrix = new Matrix3D( Vector.<Number>(value.viewMatrix) );
		}
		
		private function setProjectionMatrix(value:Object) : void
		{
			this._scene.projectionMatrix = new Matrix3D( Vector.<Number>(value.projectionMatrix) );
		}
		
		private function setBackground(value:Object) : void
		{
			this._scene.background.texURLs		= value.texURLs;
			this._scene.background.skyColor		= value.skyColor;
			this._scene.background.skyAngle		= value.skyAngle;
			this._scene.background.groundColor	= value.groundColor;
			this._scene.background.groundAngle	= value.groundAngle;
			this._scene.background.transparency	= Number(value.transparency);
			
			this._scene.background.init();
		}
		
		private function setLights(value:Object) : void
		{
			var light:Light = new Light();
			light.on 				= Boolean(value.on);
			light.type 				= Number(value.type);
			light.color 			= value.color;
			light.intensity			= Number(value.intensity);
			light.ambientIntensity	= Number(value.ambientIntensity);
			light.direction			= value.direction;
			light.attenuation		= value.attenuation;
			light.location			= value.location;
			light.radius			= Number(value.radius);
			light.beamWidth			= Number(value.beamWidth);
			light.cutOffAngle		= Number(value.cutOffAngle);
			
			this._scene.lights[Number(value.idx)] = light;
		}
		
		private function setDirectionalLight(value:Object) : void
		{
			var light:DirectionalLight 	= DirectionalLight( this._scene.getLight( uint(value.id), LightType.DIRECTIONALIGHT ) );
			light.on 					= Boolean( value.on );
			light.intensity 			= Number( value.intensity );
			light.ambientIntensity 		= Number( value.ambientIntensity );
			light.color 				= Vector.<uint>( value.color );
			light.direction 			= Vector.<Number>( value.direction );
		}
		
		private function setPointLight(value:Object) : void
		{
			var light:PointLight 	= PointLight( this._scene.getLight( uint(value.id), LightType.POINTLIGHT ) );
			light.on 				= Boolean( value.on );
			light.intensity 		= Number( value.intensity );
			light.ambientIntensity 	= Number( value.ambientIntensity );
			light.color 			= Vector.<uint>( value.color );
			light.location	 		= Vector.<Number>( value.location );
			light.attenuation 		= Vector.<Number>( value.attenuation );
			light.radius			= Number( value.radius );
		}
		
		private function setSpotLight(value:Object) : void
		{
			var light:SpotLight 	= SpotLight( this._scene.getLight( uint(value.id), LightType.SPOTLIGHT ) );
			light.on 				= Boolean( value.on );
			light.intensity 		= Number( value.intensity );
			light.ambientIntensity 	= Number( value.ambientIntensity );
			light.color 			= Vector.<uint>( value.color );
			light.direction 		= Vector.<Number>( value.direction );
			light.location	 		= Vector.<Number>( value.location );
			light.attenuation 		= Vector.<Number>( value.attenuation );
			light.beamWidth			= Number( value.beamWidth );
			light.cutOffAngle		= Number( value.cutOffAnge );
			light.radius			= Number( value.radius );
		}
		
		private function setText(value:Object) : void
		{		
			var text:X3DText = new X3DText();
			text.setTextProperties(value);
			this._scene.getDrawableObject( uint(value.id) ).shape = text;
		}
		
		private function setMeshTransform(value:Object) : void
		{			
			this._scene.getDrawableObject( uint(value.id), uint(value.refID) ).transform = new Matrix3D( Vector.<Number>( value.transform ) );
		}
		
		private function setMeshSolid(value:Object) : void
		{			
			this._scene.getDrawableObject( uint(value.id) ).shape.solid = Boolean( value.solid );
		}
		
		private function setSphereMapping(value:Object) : void
		{
			this._scene.getDrawableObject( uint(value.id) ).shape.sphereMapping = Boolean( value.sphereMapping );
		}
		
		private function setMeshMaterial(value:Object) : void
		{	
			var material:Material = new Material();
			material.ambientIntensity 	= Number( value.ambientIntensity );
			material.diffuseColor 		= Vector.<Number>( value.diffuseColor );
			material.emissiveColor 		= Vector.<Number>( value.emissiveColor );
			material.shininess 			= Number( value.shininess );
			material.specularColor		= Vector.<Number>( value.specularColor );
			material.transparency		= Number( value.transparency );
			
			this._scene.getDrawableObject( uint(value.id) ).shape.material = material;
		}
		
		private function setGeometryImage(value:Object) : void
		{
			if(!this._scene.getDrawableObject( uint(value.id) ).shape)
			{
				var geometryImage:GeometryImage = new GeometryImage();
				geometryImage.setProperties(value);
			
				this._scene.getDrawableObject( uint(value.id) ).shape = geometryImage;
			}
		}
		
		private function setMeshColors(value:Object) : void 
		{
			this._scene.getDrawableObject( uint(value.id) ).shape.setColors( value.idx, Vector.<Number>(value.colors), uint(value.components) );
		}
		
		private function setMeshColorsTexture(value:Object) : void 
		{
			
		}
		
		private function setMeshIndices(value:Object) : void 
		{
			this._scene.getDrawableObject( uint(value.id) ).shape.setIndices( value.idx, Vector.<uint>(value.indices) );
		}
		
		private function setMeshNormals(value:Object) : void 
		{
			this._scene.getDrawableObject( uint(value.id) ).shape.setNormals( value.idx, Vector.<Number>(value.normals) );
		}
		
		private function setMeshNormalsTexture(value:Object) : void 
		{
			this._scene.getDrawableObject( uint(value.id) ).shape.setNormalTexture(value);
		}
		
		private function setMeshTexCoords(value:Object) : void 
		{
			this._scene.getDrawableObject( uint(value.id) ).shape.setTexCoords( value.idx, Vector.<Number>(value.texCoords) );
		}
		
		private function setMeshTexCoordsTexture(value:Object) : void 
		{
			this._scene.getDrawableObject( uint(value.id) ).shape.setTexCoordTexture(value);
		}
		
		private function setMeshVertices(value:Object) : void 
		{
			this._scene.getDrawableObject( uint(value.id) ).shape.setVertices( value.idx, Vector.<Number>(value.vertices) );
		}
		
		private function setMeshVerticesTexture(value:Object) : void 
		{
			var geometryImage:GeometryImage = new GeometryImage();
			geometryImage.setProperties(value);
			geometryImage.setCoordinateTexture(value);
			
			this._scene.getDrawableObject( uint(value.id) ).shape = geometryImage;
		}
		
		private function setMeshTexture(value:Object) : void 
		{
			var texture:ImageTexture = new ImageTexture( String(value.url),
														 Boolean(Number(value.origChannelCount) == 1.0 || Number(value.origChannelCount) == 2.0),
														 Boolean(value.repeatS),
														 Boolean(value.repeatT) );

			this._scene.getDrawableObject( uint(value.id) ).shape.texture = texture;
		}
		
		private function setPixelTexture(value:Object) : void 
		{	
			this._scene.getDrawableObject( uint(value.id) ).shape.texture = new PixelTexture( Number(value.width),
																						 Number(value.height),
																						 Number(value.comp),
																						 value.pixels );
		}
		
		private function setCubeTexture(value:Object) : void 
		{	
			this._scene.getDrawableObject( uint(value.id) ).shape.texture = new CubeMapTexture( value.texURLs[0], value.texURLs[1], value.texURLs[2],
																						   value.texURLs[3], value.texURLs[4], value.texURLs[5], true );
		}
		
		private function setCanvasTexture(value:Object) : void 
		{	

		}

	}
	
}
