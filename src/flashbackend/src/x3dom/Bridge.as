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
			var viewMatrix:Array = String(value.viewMatrix).split(',');
			_scene.viewMatrix = new Matrix3D( Vector.<Number>(viewMatrix) );
		}
		
		private function setProjectionMatrix(value:Object) : void
		{
			var projectionMatrix:Array = String(value.projectionMatrix).split(',');
			_scene.projectionMatrix = new Matrix3D( Vector.<Number>(projectionMatrix) );
		}
		
		private function setBackground(value:Object) : void
		{
			_scene.background.texURLs		= String(value.texURLs).split(',');
			_scene.background.skyColor		= String(value.skyColor).split(',');
			_scene.background.skyAngle		= String(value.skyAngle).split(',');
			_scene.background.groundColor	= String(value.groundColor).split(',');
			_scene.background.groundAngle	= String(value.groundAngle).split(',');
			_scene.background.transparency	= Number(value.transparency);
			
			_scene.background.init();
		}
		
		private function setLights(value:Object) : void
		{
			var light:Light = new Light();
			light.on 				= Boolean(value.on);
			light.type 				= Number(value.type);
			light.color 			= String(value.color).split(',');
			light.intensity			= Number(value.intensity);
			light.ambientIntensity	= Number(value.ambientIntensity);
			light.direction			= String(value.direction).split(',');
			light.attenuation		= String(value.attenuation).split(',');
			light.location			= String(value.location).split(',');
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
			var transform:Array = String(value.transform).split(',');
			
			_scene.getDrawableObject( uint(value.id), uint(value.refID) ).transform = new Matrix3D( Vector.<Number>( transform ) );
		}
		
		private function setMeshSolid(value:Object) : void
		{			
			_scene.getDrawableObject( uint(value.id) ).shape.solid = Boolean( value.solid );
		}
		
		private function setSphereMapping(value:Object) : void
		{
			//Transform trafo from String to Array
			_scene.getDrawableObject( uint(value.id) ).shape.sphereMapping = Boolean(value.sphereMapping);
		}
		
		private function setMeshMaterial(value:Object) : void
		{	
			var material:Material = new Material();
			material.ambientIntensity 	= Number( value.ambientIntensity );
			material.diffuseColor 		= Vector.<Number>( String(value.diffuseColor).split(',') );
			material.emissiveColor 		= Vector.<Number>( String(value.emissiveColor).split(',') );
			material.shininess 			= Number( value.shininess );
			material.specularColor		= Vector.<Number>( String(value.specularColor).split(',') );
			material.transparency		= Number( value.transparency );
			
			_scene.getDrawableObject( uint(value.id) ).shape.material = material;
		}
		
		private function setMeshColors(value:Object) : void 
		{
			//Transform colors from String to Array
			var colors:Array = String(value.colors).split(',');	
			_scene.getDrawableObject( uint(value.id) ).shape.setColors( value.idx, Vector.<Number>(colors), uint(value.components) );
		}
		
		private function setMeshIndices(value:Object) : void 
		{
			//Transform indices from String to Array
			var indices:Array = String(value.indices).split(',');
			_scene.getDrawableObject( uint(value.id) ).shape.setIndices( value.idx, Vector.<uint>(indices) );
		}
		
		private function setMeshNormals(value:Object) : void 
		{
			//Transform vertices from String to Array
			var normals:Array = String(value.normals).split(',');
			_scene.getDrawableObject( uint(value.id) ).shape.setNormals( value.idx, Vector.<Number>(normals) );
		}
		
		private function setMeshTexCoords(value:Object) : void 
		{
			//Transform vertices from String to Array
			var texCoords:Array = String(value.texCoords).split(',');
			_scene.getDrawableObject( uint(value.id) ).shape.setTexCoords( value.idx, Vector.<Number>(texCoords) );
		}
		
		private function setMeshVertices(value:Object) : void 
		{
			//Transform vertices from String to Array
			var vertices:Array = String(value.vertices).split(',');
			_scene.getDrawableObject( uint(value.id) ).shape.setVertices( value.idx, Vector.<Number>(vertices) );
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
																						 String(value.pixels).split(',') );
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
