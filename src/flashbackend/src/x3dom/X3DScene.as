package x3dom {
	
	import com.adobe.utils.*;
	
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.Shape;
	import flash.display.Stage;
	import flash.display3D.*;
	import flash.display3D.textures.Texture;
	import flash.external.ExternalInterface;
	import flash.geom.*;
	
	import x3dom.*;
	
	/**
	 * The X3DScene class handles the complete 3D scene managing and rendering
	 */
	public class X3DScene {
		
		private var _context3D:Context3D;
		
		private var _background:Background = new Background();;
		
		/**
		 * Scenes viewing matrix
		 */
		private var _viewMatrix:Matrix3D	= new Matrix3D();
		
		/**
		 * Scenes projection matrix
		 */
		private var _projMatrix:Matrix3D	= new Matrix3D();
		
		/**
		 * Array of all scene lights
		 */
		private var _lights:Array	= new Array();
		
		/**
		 * Array of all meshes
		 */
		private var _drawableObjects:Array	= new Array();
		
		
		//For Picking
		private var _min:Vector3D = new Vector3D();
		private var _max:Vector3D = new Vector3D();
		private var _pickedObj:Number = 0;
		private var _pickedPos:Vector3D = new Vector3D();

		/**
		 * Creates a new X3DScene object
		 */
		public function X3DScene() 
		{
			//Set Context3D
			_context3D = FlashBackend.getContext();
			
		}
		
		/**
		 * Compare function for Mesh z-sorting
		 */
		public function calculateBB() : void
		{
			//Init min/max values
			var min:Vector3D = new Vector3D( 999999.0,  999999.0,  999999.0);
			var max:Vector3D = new Vector3D(-999999.0, -999999.0, -999999.0);
			
			for(var i:uint = 0; i<_drawableObjects.length; i++) {
				if(min.x > _drawableObjects[i].min.x) { min.x = _drawableObjects[i].min.x; }
				if(min.y > _drawableObjects[i].min.y) { min.y = _drawableObjects[i].min.y; }
				if(min.z > _drawableObjects[i].min.z) { min.z = _drawableObjects[i].min.z; }
				
				if(max.x < _drawableObjects[i].max.x) { max.x = _drawableObjects[i].max.x; }
				if(max.y < _drawableObjects[i].max.y) { max.y = _drawableObjects[i].max.y; }
				if(max.z < _drawableObjects[i].max.z) { max.z = _drawableObjects[i].max.z; }
			}
			
			_min = min;
			_max = max
		}
		
		/**
		 * Compare function for Mesh z-sorting
		 */
		private function zSorting(a:DrawableObject, b:DrawableObject) : Number
		{
			return _viewMatrix.transformVector(a.center).z - _viewMatrix.transformVector(b.center).z;
		}
		
		/**
		 * Return scenes background object
		 */
		public function get background() : Background
		{
			return _background;
		}
		
		/**
		 * Return scenes lights array
		 */
		public function get lights() : Array
		{
			return _lights;
		}
		
		/**
		 * Return the mesh with the given ID or generates a new one
		 */
		public function getDrawableObject(id:Number, refID:Number = 0) : Object
		{	
			for(var i:uint=0; i<_drawableObjects.length; i++) {
				if(_drawableObjects[i].id == id && _drawableObjects[i].refID == refID) {
					return _drawableObjects[i];
				}
			}
			
			//create drawable
			_drawableObjects.push( new DrawableObject(id, refID) );
			
			if(refID > 0) {
				_drawableObjects[_drawableObjects.length-1].shape = getDrawableObject(id).shape;
			}
			
			return _drawableObjects[_drawableObjects.length-1];
		}
		
		public function checkForRemovedNodes() : void
		{
			var tmp:Array = new Array()
			for(var i:uint = 0; i<_drawableObjects.length; i++)
			{
				if(_drawableObjects[i].updated) {
					_drawableObjects[i].updated = false;
					tmp.push(_drawableObjects[i]);
				} 
			}
			_drawableObjects = tmp;
		}
		
		/**
		 * Scenes viewing matrix
		 */
		public function get viewMatrix() : Matrix3D
		{
			return _viewMatrix;
		}
		
		/**
		 * @private
		 */
		public function set viewMatrix(viewMatrix:Matrix3D) : void
		{
			_viewMatrix = viewMatrix;
		}
		
		/**
		 * Scenes projection matrix
		 */
		public function get projectionMatrix() : Matrix3D
		{
			return _projMatrix;
		}
		
		/**
		 * @private
		 */
		public function set projectionMatrix(projectionMatrix:Matrix3D) : void
		{
			_projMatrix = projectionMatrix;
		}
		
		/**
		 * @private
		 */
		public function get min() : Vector3D
		{
			return _min;
		}
		
		/**
		 * @private
		 */
		public function get max() : Vector3D
		{
			return _max;
		}
		
		/**
		 * @private
		 */
		public function set pickedObj(pickedObj:uint) : void
		{
			_pickedObj = pickedObj;
		}
		
		/**
		 * @private
		 */
		public function get pickedObj() : uint
		{
			return _pickedObj;
		}
		
		/**
		 * @private
		 */
		public function set pickedPos(pickedPos:Vector3D) : void
		{
			_pickedPos = pickedPos;
		}
		
		/**
		 * @private
		 */
		public function get pickedPos() : Vector3D
		{
			return _pickedPos;
		}
		
		public function get drawableObjects() : Array
		{
			_drawableObjects.sort(zSorting);
			
			return _drawableObjects;
		}

	}
	
}
