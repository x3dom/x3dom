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
	import x3dom.lighting.*;
	
	/**
	 * The X3DScene class handles the complete 3D scene managing and rendering
	 */
	public class X3DScene {
		
		private var _context3D:Context3D;
		
		private var _background:Background = new Background();;
		
		/**
		 * Scenes viewing matrix
		 */
		private var _viewMatrix:Matrix3D = new Matrix3D();
		
		/**
		 * Scenes projection matrix
		 */
		private var _projMatrix:Matrix3D = new Matrix3D();
		
		/**
		 * Array of all scene lights
		 */
		private var _lights:Array = new Array();
		
		/**
		 * Array of all meshes
		 */
		private var _drawableObjects:Array = new Array();
		
		
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
			this._context3D = FlashBackend.getContext();
			
		}
		
		/**
		 * Compare function for Mesh z-sorting
		 */
		public function calculateBB() : void
		{
			//Init min/max values
			var min:Vector3D = new Vector3D( 999999.0,  999999.0,  999999.0);
			var max:Vector3D = new Vector3D(-999999.0, -999999.0, -999999.0);
			
			for(var i:uint = 0; i<this._drawableObjects.length; i++) {
				if(min.x > this._drawableObjects[i].min.x) { min.x = this._drawableObjects[i].min.x; }
				if(min.y > this._drawableObjects[i].min.y) { min.y = this._drawableObjects[i].min.y; }
				if(min.z > this._drawableObjects[i].min.z) { min.z = this._drawableObjects[i].min.z; }
				
				if(max.x < this._drawableObjects[i].max.x) { max.x = this._drawableObjects[i].max.x; }
				if(max.y < this._drawableObjects[i].max.y) { max.y = this._drawableObjects[i].max.y; }
				if(max.z < this._drawableObjects[i].max.z) { max.z = this._drawableObjects[i].max.z; }
			}
			
			this._min = min;
			this._max = max
		}
		
		/**
		 * Compare function for Mesh z-sorting
		 */
		private function zSorting(a:DrawableObject, b:DrawableObject) : Number
		{
			return this._viewMatrix.transformVector(a.center).z - this._viewMatrix.transformVector(b.center).z;
		}
		
		/**
		 * Return scenes background object
		 */
		public function get background() : Background
		{
			return this._background;
		}
		
		/**
		 * Return scenes lights array
		 */
		public function get lights() : Array
		{
			return this._lights;
		}
		
		/**
		 * Return a light with the given ID or generates a new one
		 */
		public function getLight(id:uint, type:String) : Object
		{
			//Search existend Light and return
			for(var i:uint = 0; i<this._lights.length; i++) {
				if(this._lights[i].id == id) return this._lights[i];
			}
			
			//If nothing found create new Light
			switch( type ) {
				case LightType.DIRECTIONALIGHT: this._lights.push( new DirectionalLight(id) ); break;
				case LightType.POINTLIGHT: 		this._lights.push( new PointLight(id) ); break;
				case LightType.SPOTLIGHT: 		this._lights.push( new SpotLight(id) ); break;
			}
			
			//Return new light
			return this._lights[this._lights.length-1];
		}
		
		/**
		 * Return the mesh with the given ID or generates a new one
		 */
		public function getDrawableObject(id:Number, refID:Number = 0) : Object
		{	
			for(var i:uint=0; i<this._drawableObjects.length; i++) {
				if(this._drawableObjects[i].id == id && this._drawableObjects[i].refID == refID) {
					return this._drawableObjects[i];
				}
			}
			
			//create drawable
			this._drawableObjects.push( new DrawableObject(id, refID) );
			
			if(refID > 0) {
				this._drawableObjects[this._drawableObjects.length-1].shape = getDrawableObject(id).shape;
			}
			
			return _drawableObjects[this._drawableObjects.length-1];
		}
		
		public function checkForRemovedNodes() : void
		{
			var tmp:Array = new Array()
			for(var i:uint = 0; i<this._drawableObjects.length; i++)
			{
				if(this._drawableObjects[i].updated) {
					this._drawableObjects[i].updated = false;
					tmp.push(this._drawableObjects[i]);
				} 
			}
			this._drawableObjects = tmp;
		}
		
		/**
		 * Scenes viewing matrix
		 */
		public function get viewMatrix() : Matrix3D
		{
			return this._viewMatrix;
		}
		
		/**
		 * @private
		 */
		public function set viewMatrix(viewMatrix:Matrix3D) : void
		{
			this._viewMatrix = viewMatrix;
		}
		
		/**
		 * Scenes projection matrix
		 */
		public function get projectionMatrix() : Matrix3D
		{
			return this._projMatrix;
		}
		
		/**
		 * @private
		 */
		public function set projectionMatrix(projectionMatrix:Matrix3D) : void
		{
			this._projMatrix = projectionMatrix;
		}
		
		/**
		 * @private
		 */
		public function get min() : Vector3D
		{
			return this._min;
		}
		
		/**
		 * @private
		 */
		public function get max() : Vector3D
		{
			return this._max;
		}
		
		/**
		 * @private
		 */
		public function set pickedObj(pickedObj:uint) : void
		{
			this._pickedObj = pickedObj;
		}
		
		/**
		 * @private
		 */
		public function get pickedObj() : uint
		{
			return this._pickedObj;
		}
		
		/**
		 * @private
		 */
		public function set pickedPos(pickedPos:Vector3D) : void
		{
			this._pickedPos = pickedPos;
		}
		
		/**
		 * @private
		 */
		public function get pickedPos() : Vector3D
		{
			return this._pickedPos;
		}
		
		public function get drawableObjects() : Array
		{
			this._drawableObjects.sort(zSorting);
			
			return this._drawableObjects;
		}

	}
	
}
