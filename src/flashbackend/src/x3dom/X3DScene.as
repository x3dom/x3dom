﻿package x3dom {
	
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
		private var _zNear:Number = 0.1;
		
		/**
		 * Scenes viewing matrix
		 */
		private var _zFar:Number = 1000.0;
		
		/**
		 * Scenes viewing matrix
		 */
		private var _fov:Number = 0.785;
		
		/**
		 * Scenes viewing matrix
		 */
		private var _viewMatrix:Matrix3D = new Matrix3D();
		
		/**
		 * Scenes perspective projection matrix
		 */
		private var _projMatrix:Matrix3D = new Matrix3D();
		
		/**
		 * Scenes orthogonal projection matrix
		 */
		private var _orthoProjMatrix:Matrix3D = new Matrix3D();
		
		/**
		 * Array of all scene lights
		 */
		private var _lights:Array = new Array();
		
		/**
		 * Array of all meshes
		 */
		private var _drawableObjects:Array = new Array();
		
		/**
		 * Fog parameters
		 */
		private var _fogColor:Array = null;
		private var _fogVisRange:Number = -1.0;	// Initialized as negative, meaning it's invalid
		private var _fogType:Number = -1.0;		// -1.0 for none, 0.0 for linear, 1.0 for exponnential 	
		
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
			if(a.sortType == b.sortType) {
				if(a.sortKey == b.sortKey) {
					return this._viewMatrix.transformVector(a.center).z - this._viewMatrix.transformVector(b.center).z;
				}
				return a.sortKey - b.sortKey;
			}
			return (a.sortType < b.sortType) ? -1 : (a.sortType > b.sortType) ? 1 : 0;
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
				case LightType.HEADLIGHT: this._lights.push( new HeadLight(id) ); break;
				case LightType.DIRECTIONALLIGHT: this._lights.push( new DirectionalLight(id) ); break;
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
				} else {
					ExternalInterface.call("x3dom.bridge.setShapeDirty", this._drawableObjects[i].id);
				}
			}
			this._drawableObjects = tmp;
		}
		
		/**
		 * Scenes near plane
		 */
		public function get zNear() : Number
		{
			return this._zNear;
		}
		
		/**
		 * @private
		 */
		public function set zNear(zNear:Number) : void
		{
			this._zNear = zNear;
		}
		
		/**
		 * Scenes far plane
		 */
		public function get zFar() : Number
		{
			return this._zFar;
		}
		
		/**
		 * @private
		 */
		public function set zFar(zFar:Number) : void
		{
			this._zFar = zFar;
		}
		
		/**
		 * Scenes field of view
		 */
		public function get fov() : Number
		{
			return this._fov;
		}
		
		/**
		 * @private
		 */
		public function set fov(fov:Number) : void
		{
			this._fov = fov;
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
		
		/**
		 * @private
		 */
		public function get drawableObjects() : Array
		{
			this._drawableObjects.sort(zSorting);
			
			return this._drawableObjects;
		}

		/**
		 * @private
		 */
		public function get fogColor() : Array
		{
			return _fogColor;
		}
		
		/**
		 * @private
		 */
		public function set fogColor(val:Array) : void
		{
			_fogColor = val;
		}
		
		/**
		 * @private
		 */
		public function get fogVisRange() : Number
		{
			return _fogVisRange;
		}
		
		/**
		 * @private
		 */
		public function set fogVisRange(val:Number) : void
		{
			_fogVisRange = val;
		}
		
		/**
		 * @private
		 */
		public function get fogType() : Number
		{
			return _fogType;
		}
		
		/**
		 * @private
		 */
		public function set fogType(val:Number) : void
		{
			_fogType = val;
		}		
	}
	
}
