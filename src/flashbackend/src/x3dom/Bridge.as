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
			ExternalInterface.addCallback("getScreenshot", getScreenshot);
			ExternalInterface.addCallback("pickValue", pickValue);
			ExternalInterface.addCallback("setViewpoint", setViewpoint);
			ExternalInterface.addCallback("setBackground", setBackground);
			ExternalInterface.addCallback("setMeshTransform", setMeshTransform);
			ExternalInterface.addCallback("setMeshMaterial", setMeshMaterial);
			ExternalInterface.addCallback("setMeshColors", setMeshColors);
			ExternalInterface.addCallback("setMeshIndices", setMeshIndices);
			ExternalInterface.addCallback("setMeshNormals", setMeshNormals);
			ExternalInterface.addCallback("setMeshTexCoords", setMeshTexCoords);
			ExternalInterface.addCallback("setMeshVertices", setMeshVertices);
			ExternalInterface.addCallback("setMeshTexture", setMeshTexture);
			ExternalInterface.addCallback("setPixelTexture", setPixelTexture);
			ExternalInterface.addCallback("setCubeTexture", setCubeTexture);
			ExternalInterface.addCallback("setCanvasTexture", setCanvasTexture);
			ExternalInterface.addCallback("setLights", setLights);
			ExternalInterface.addCallback("setHeadLight", setHeadLight);
			ExternalInterface.addCallback("setDirectionalLight", setDirectionalLight);
			ExternalInterface.addCallback("setPointLight", setPointLight);
			ExternalInterface.addCallback("setSpotLight", setSpotLight);
			ExternalInterface.addCallback("setSphereMapping", setSphereMapping);
			ExternalInterface.addCallback("setMeshProperties", setMeshProperties);
			ExternalInterface.addCallback("removeTexture", removeTexture);
			ExternalInterface.addCallback("setFPS", setFPS);
		}
		
		private function renderScene() : void
		{
			FlashBackend.getLoadingScreen().visible = false;
			this._scene.checkForRemovedNodes();
			this._renderer.render();
		}
		
		private function getScreenshot() : String
		{	
			return this._renderer.screenURL;
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
		
		private function setViewpoint(value:Object) : void
		{
			this._scene.fov = Number(value.fov);
			this._scene.zFar = Number(value.zFar);
			this._scene.zNear = Number(value.zNear);
			this._scene.viewMatrix = new Matrix3D( Vector.<Number>(value.viewMatrix) );
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
		
		private function setHeadLight(value:Object) : void
		{
			var light:HeadLight 	    = HeadLight( this._scene.getLight( uint(value.id), LightType.HEADLIGHT ) );
			light.on 					= Boolean( value.on );
			light.intensity 			= Number( value.intensity );
			light.ambientIntensity 		= Number( value.ambientIntensity );
			light.color 				= Vector.<uint>( value.color );
			light.direction 			= Vector.<Number>( value.direction );
		}
		
		private function setDirectionalLight(value:Object) : void
		{
			var light:DirectionalLight 	= DirectionalLight( this._scene.getLight( uint(value.id), LightType.DIRECTIONALLIGHT ) );
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
		
		private function setMeshTransform(value:Object) : void
		{			
			this._scene.getDrawableObject( uint(value.id), uint(value.refID) ).transform = new Matrix3D( Vector.<Number>( value.transform ) );
		}
		
		private function setMeshProperties(value:Object) : void
		{			
			this._scene.getDrawableObject( uint(value.id) ).type = String( value.type );
			this._scene.getDrawableObject( uint(value.id) ).sortType = String( value.sortType );
			this._scene.getDrawableObject( uint(value.id) ).sortKey = Number( value.sortKey );
			this._scene.getDrawableObject( uint(value.id) ).shape.setProperties( value );
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
		
		private function setMeshColors(value:Object) : void 
		{
			switch( this._scene.getDrawableObject( uint(value.id) ).type ) {
				case "ImageGeometry":
					this._scene.getDrawableObject( uint(value.id) ).shape.setColorTexture(value);
					break;
				case "BinaryGeometry":
					this._scene.getDrawableObject( uint(value.id) ).shape.setColors( value.idx, value.colors, value.components );
					break;
				default:
					this._scene.getDrawableObject( uint(value.id) ).shape.setColors( value.idx, Vector.<Number>(value.colors), uint(value.components) );
					break;
			}
		}
		
		private function setMeshIndices(value:Object) : void 
		{
			switch( this._scene.getDrawableObject( uint(value.id) ).type ) {
				case "ImageGeometry":
					break;
				case "BinaryGeometry":
					this._scene.getDrawableObject( uint(value.id) ).shape.setIndices( value.idx, value.indices );
					break;
				case "BitLODGeometry":
					this._scene.getDrawableObject( uint(value.id) ).shape.setIndices( value.idx, value.indices );
					break;
				default:
					this._scene.getDrawableObject( uint(value.id) ).shape.setIndices( value.idx, Vector.<uint>(value.indices) );
					break;
			}	
		}
		
		private function setMeshNormals(value:Object) : void 
		{
			switch( this._scene.getDrawableObject( uint(value.id) ).type ) {
				case "ImageGeometry":
					this._scene.getDrawableObject( uint(value.id) ).shape.setNormalTexture(value);
					break;
				case "BinaryGeometry":
					this._scene.getDrawableObject( uint(value.id) ).shape.setNormals( value.idx, value.normals );
					break;
				default:
					this._scene.getDrawableObject( uint(value.id) ).shape.setNormals( value.idx, Vector.<Number>(value.normals) );
					break;
			}	
		}
		
		private function setMeshTexCoords(value:Object) : void 
		{
			switch( this._scene.getDrawableObject( uint(value.id) ).type ) {
				case "ImageGeometry":
					this._scene.getDrawableObject( uint(value.id) ).shape.setTexCoordTexture(value);
					break;
				case "BinaryGeometry":
					this._scene.getDrawableObject( uint(value.id) ).shape.setTexCoords( value.idx, value.texCoords );
					break;
				default:
					this._scene.getDrawableObject( uint(value.id) ).shape.setTexCoords( value.idx, Vector.<Number>(value.texCoords) );
					break;
			}		
		}
		
		private function setMeshVertices(value:Object) : void 
		{
			switch( this._scene.getDrawableObject( uint(value.id) ).type ) {
				case "ImageGeometry":
					this._scene.getDrawableObject( uint(value.id) ).shape.setCoordinateTexture(value);
					break;
				case "BinaryGeometry":
					this._scene.getDrawableObject( uint(value.id) ).shape.setVertices( value.idx, value );
					break;
				case "BitLODGeometry":
					this._scene.getDrawableObject( uint(value.id) ).shape.setComponents(value);
					break;
				default:
					this._scene.getDrawableObject( uint(value.id) ).shape.setVertices( value.idx, Vector.<Number>(value.vertices) );
					break;
			}
			
		}
		
		private function setMeshTexture(value:Object) : void 
		{
			if(value.transform != null) {
				value.transform = new Matrix3D( Vector.<Number>( value.transform ) );
			}
			
			this._scene.getDrawableObject( uint(value.id) ).shape.texture = new ImageTexture( String(value.url),
																							  Boolean(Number(value.origChannelCount) == 1.0 || Number(value.origChannelCount) == 2.0),
																							  Boolean(value.repeatS),
																							  Boolean(value.repeatT),
																							  value.transform);
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

			this._scene.getDrawableObject( uint(value.id) ).shape.texture = new CanvasTexture( Number(value.width),
																							   Number(value.height),
																							   value.dataURL );
		}
		
		private function removeTexture(value:Object) : void 
		{	
			this._scene.getDrawableObject( uint(value.id) ).shape.texture = null;
		}

	}
	
}
