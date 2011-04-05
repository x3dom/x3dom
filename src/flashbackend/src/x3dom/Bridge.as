package x3dom {
	
	import x3dom.*;
	import flash.geom.*
	import flash.external.ExternalInterface;
	
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
			ExternalInterface.addCallback("setMeshTransform", setMeshTransform);
			ExternalInterface.addCallback("setMeshMaterial", setMeshMaterial);
			ExternalInterface.addCallback("setMeshColors", setMeshColors);
			ExternalInterface.addCallback("setMeshIndices", setMeshIndices);
			ExternalInterface.addCallback("setMeshNormals", setMeshNormals);
			ExternalInterface.addCallback("setMeshTexCoords", setMeshTexCoords);
			ExternalInterface.addCallback("setMeshVertices", setMeshVertices);
			ExternalInterface.addCallback("setMeshTexture", setMeshTexture);
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
		
		private function setMeshTransform(value:Object) : void
		{
			//Transform trafo from String to Array
			var transform:Array = String(value.transform).split(',');
			
			_scene.getMesh( Number(value.id) ).modelMatrix = new Matrix3D( Vector.<Number>( transform ) );
		}
		
		private function setMeshMaterial(value:Object) : void
		{
			_scene.getMesh( Number(value.id) ).setMaterial( value );
		}
		
		private function setMeshColors(value:Object) : void 
		{
			//Transform indices from String to Array
			var colors:Array = String(value.colors).split(',');
				
			_scene.getMesh( Number(value.id) ).setColors( value.idx, Vector.<uint>(colors) );
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
