package x3dom {
	
	import flash.display.Scene;
	import flash.external.ExternalInterface;
	import flash.geom.*;
	
	import mx.controls.Text;
	
	import x3dom.*;
	
	public class Bridge {
		
		private var _scene:X3DScene;

		public function Bridge(scene:X3DScene) 
		{
			//Set scene
			_scene = scene;
			
			//Register JS callback functions
			ExternalInterface.addCallback("renderScene", renderScene);
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
			ExternalInterface.addCallback("setLights", setLights);
			ExternalInterface.addCallback("setText", setText);
			ExternalInterface.addCallback("setSphereMapping", setSphereMapping);
			ExternalInterface.addCallback("setMeshSolid", setMeshSolid);
		}
		
		private function renderScene() : void
		{
			_scene.renderScene();
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
			_scene.getMesh( Number(value.id), "TEXT" ).setTextProperties( value );
		}
		
		private function setMeshTransform(value:Object) : void
		{
			//Transform trafo from String to Array
			var transform:Array = String(value.transform).split(',');
			
			_scene.getMesh( Number(value.id) ).modelMatrix = new Matrix3D( Vector.<Number>( transform ) );
		}
		
		private function setMeshSolid(value:Object) : void
		{			
			_scene.getMesh( Number(value.id) ).solid = Boolean( value.solid );
		}
		
		private function setSphereMapping(value:Object) : void
		{
			//Transform trafo from String to Array
			_scene.getMesh( Number(value.id) ).sphereMapping = Boolean(value.sphereMapping);
		}
		
		private function setMeshMaterial(value:Object) : void
		{
			_scene.getMesh( Number(value.id) ).setMaterial( value );
		}
		
		private function setMeshColors(value:Object) : void 
		{
			//Transform colors from String to Array
			var colors:Array = String(value.colors).split(',');	
			_scene.getMesh( Number(value.id) ).setColors( value.idx, Vector.<Number>(colors) );
		}
		
		private function setMeshIndices(value:Object) : void 
		{
			//Transform indices from String to Array
			var indices:Array = String(value.indices).split(',');
				
			_scene.getMesh( Number(value.id) ).setIndices( value.idx, Vector.<uint>(indices) );
		}
		
		private function setMeshNormals(value:Object) : void 
		{
			//Transform vertices from String to Array
			var normals:Array = String(value.normals).split(',');
			_scene.getMesh( Number(value.id) ).setNormals( value.idx, Vector.<Number>(normals) );
		}
		
		private function setMeshTexCoords(value:Object) : void 
		{
			//Transform vertices from String to Array
			var texCoords:Array = String(value.texCoords).split(',');
				
			_scene.getMesh( Number(value.id) ).setTexCoords( value.idx, Vector.<Number>(texCoords) );
		}
		
		private function setMeshVertices(value:Object) : void 
		{
			//Transform vertices from String to Array
			var vertices:Array = String(value.vertices).split(',');

			_scene.getMesh( Number(value.id) ).setVertices( value.idx, Vector.<Number>(vertices) );
		}
		
		private function setMeshTexture(value:Object) : void 
		{
			//Transform vertices from String to Array
			var vertices:Array = String(value.vertices).split(',');

			_scene.getMesh( Number(value.id) ).setTexture( value );
		}

	}
	
}
