package x3dom
{
	import flash.display3D.Context3D;
	import flash.geom.Matrix3D;

	public class DrawableObject
	{
		private var _scene:X3DScene;
		private var _context3D:Context3D;
		
		private var _id:uint;
		private var _mesh:Mesh;
		private var _transform:Matrix3D;
		
		public function DrawableObject(id:uint, scene:X3DScene, context3D:Context3D)
		{
			_id			= id;
			_scene		= scene;
			_context3D	= context3D;
			
			_mesh		= null;
			_transform	= new Matrix3D();
		}
		
		/**
		 * 
		 */
		public function set id(id:Number) : void
		{
			_id = id;
		}
		
		/**
		 * @private
		 */
		public function get id() : Number
		{
			return _id;
		}
		
		/**
		 * 
		 */
		public function set mesh(mesh:Mesh) : void
		{
			_mesh = mesh;
		}
		
		/**
		 * @private
		 */
		public function get mesh() : Mesh
		{
			if(_mesh = null)
				_mesh = new Mesh(_id, _scene, _context3D);

			return _mesh;
		}
		
		/**
		 * 
		 */
		public function set transform(transform:Matrix3D) : void
		{
			_transform = transform;
		}
		
		/**
		 * @private
		 */
		public function get transform() : Matrix3D
		{
			return _transform;
		}
	}
}