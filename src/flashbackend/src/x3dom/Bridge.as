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
	import x3dom.texturing.*;
	
	public class Bridge {
		
		private var _scene:X3DScene;
		
		private var _renderer:Renderer;

		public function Bridge(scene:X3DScene, renderer:Renderer) 
		{
			//Set scene
			_scene = scene;
			
			_renderer = renderer;
			
			//Register JS callback functions
			ExternalInterface.addCallback("renderScene", renderScene);
			ExternalInterface.addCallback("pickValue", pickValue);
			ExternalInterface.addCallback("setViewMatrix", setViewMatrix);
			ExternalInterface.addCallback("setProjectionMatrix", setProjectionMatrix);
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
			ExternalInterface.addCallback("setText", setText);
			ExternalInterface.addCallback("setSphereMapping", setSphereMapping);
			ExternalInterface.addCallback("setMeshSolid", setMeshSolid);
			ExternalInterface.addCallback("setFPS", setFPS);
		}
		
		private function renderScene() : void
		{
			FlashBackend.getLoadingScreen().visible = false;
			_scene.checkForRemovedNodes();
			_renderer.render();
		}
		
		private function pickValue(value:Object) : Object
		{						
			return {objID: _scene.pickedObj,
					pickPosX: _scene.pickedPos.x,
					pickPosY: _scene.pickedPos.y,
					pickPosZ: _scene.pickedPos.z };
		}
		
		private function setFPS(value:Object) : void
		{						
			FlashBackend.setFPS( Number(value.fps) );
		}
		
		private function setViewMatrix(value:Object) : void
		{
			_scene.viewMatrix = new Matrix3D( Vector.<Number>(value.viewMatrix) );
		}
		
		private function setProjectionMatrix(value:Object) : void
		{
			_scene.projectionMatrix = new Matrix3D( Vector.<Number>(value.projectionMatrix) );
		}
		
		private function setBackground(value:Object) : void
		{
			_scene.background.texURLs		= value.texURLs;
			_scene.background.skyColor		= value.skyColor;
			_scene.background.skyAngle		= value.skyAngle;
			_scene.background.groundColor	= value.groundColor;
			_scene.background.groundAngle	= value.groundAngle;
			_scene.background.transparency	= Number(value.transparency);
			
			_scene.background.init();
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
			
			_scene.lights[Number(value.idx)] = light;
		}
		
		private function setText(value:Object) : void
		{		
			var text:X3DText = new X3DText();
			text.setTextProperties(value);
			_scene.getDrawableObject( uint(value.id) ).shape = text;
		}
		
		private function setMeshTransform(value:Object) : void
		{			
			_scene.getDrawableObject( uint(value.id), uint(value.refID) ).transform = new Matrix3D( Vector.<Number>( value.transform ) );
		}
		
		private function setMeshSolid(value:Object) : void
		{			
			_scene.getDrawableObject( uint(value.id) ).shape.solid = Boolean( value.solid );
		}
		
		private function setSphereMapping(value:Object) : void
		{
			_scene.getDrawableObject( uint(value.id) ).shape.sphereMapping = Boolean( value.sphereMapping );
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
			
			_scene.getDrawableObject( uint(value.id) ).shape.material = material;
		}
		
		private function setMeshColors(value:Object) : void 
		{
			_scene.getDrawableObject( uint(value.id) ).shape.setColors( value.idx, Vector.<Number>(value.colors), uint(value.components) );
		}
		
		private function setMeshIndices(value:Object) : void 
		{
			_scene.getDrawableObject( uint(value.id) ).shape.setIndices( value.idx, Vector.<uint>(value.indices) );
		}
		
		private function setMeshNormals(value:Object) : void 
		{
			_scene.getDrawableObject( uint(value.id) ).shape.setNormals( value.idx, Vector.<Number>(value.normals) );
		}
		
		private function setMeshTexCoords(value:Object) : void 
		{
			_scene.getDrawableObject( uint(value.id) ).shape.setTexCoords( value.idx, Vector.<Number>(value.texCoords) );
		}
		
		private function setMeshVertices(value:Object) : void 
		{
			_scene.getDrawableObject( uint(value.id) ).shape.setVertices( value.idx, Vector.<Number>(value.vertices) );
		}
		
		private function setMeshTexture(value:Object) : void 
		{
			var texture:ImageTexture = new ImageTexture( String(value.url),
														 Boolean(Number(value.origChannelCount) == 1.0 || Number(value.origChannelCount) == 2.0),
														 Boolean(value.repeatS),
														 Boolean(value.repeatT) );

			_scene.getDrawableObject( uint(value.id) ).shape.texture = texture;
		}
		
		private function setPixelTexture(value:Object) : void 
		{	
			_scene.getDrawableObject( uint(value.id) ).shape.texture = new PixelTexture( Number(value.width),
																						 Number(value.height),
																						 Number(value.comp),
																						 value.pixels );
		}
		
		private function setCubeTexture(value:Object) : void 
		{	
			_scene.getDrawableObject( uint(value.id) ).shape.texture = new CubeMapTexture( value.texURLs[0], value.texURLs[1], value.texURLs[2],
																						   value.texURLs[3], value.texURLs[4], value.texURLs[5], true );
		}
		
		private function setCanvasTexture(value:Object) : void 
		{	

		}

	}
	
}
