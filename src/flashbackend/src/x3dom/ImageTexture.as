package x3dom {
	
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.Loader;
	import flash.display3D.*;
	import flash.display3D.textures.Texture;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.geom.Matrix;
	import flash.net.URLRequest;
	
	/**
	 * 
	 */
	public class ImageTexture extends EventDispatcher {

		private var _context3D:Context3D;
		
		/**
		 * Flash Texture
		 */
		private var _texture:flash.display3D.textures.Texture;
		
		/**
		 * State of texture loading
		 * @default false
		 */
		private var _loaded:Boolean = false;
		
		/**
		 * Textures channel count. Count of 1.0 or 2.0 blends Texture with Material
		 * @default 0
		 */
		private var _origChannelCount:Number = 0;
		
		/**
		 * Location and filename of image
		 * @default ""
		 */
        private var _url:String = "";
		
		/**
		 * Specify how the texture wraps(repeat or clamp) in S direction.
		 * @default true (repeat)
		 */
        private var _repeatS:Boolean = true;
		
		/**
		 * Specify how the texture wraps(repeat or clamp) in T direction.
		 * @default true (repeat)
		 */
        private var _repeatT:Boolean = true;
		
		/**
		 * Advanced texture properties (not yet implemented)
		 */
        //private var _textureProperties:TextureProperties;

		/**
		* Create a new ImageTexture
		*/
		public function ImageTexture(context3D:Context3D) 
		{
			//Set Context3D
			_context3D = context3D;
		}
		
		/**
		* Load texture from url
		*/
		public function load() : void
		{
			//Set loaded to false
			_loaded = false;
			
			//Create new Loader
			var loader:Loader = new Loader();
			
			//Add Complete-Listener to Loader
			loader.contentLoaderInfo.addEventListener(Event.COMPLETE, handleComplete);
			
			//Load image from url
			loader.load( new URLRequest( _url ) );
		}
		
		/**
		* Handle Texture load Complete-Event
		*/
		public function handleComplete(e:Event) : void
		{
			//Convert Loader to Bitmap
			var bitmap:Bitmap = Bitmap( e.target.content );
			
			bitmap = scaleBitmap(bitmap);
			
			//Create Texture
			_texture = _context3D.createTexture(bitmap.width, bitmap.height, Context3DTextureFormat.BGRA, false);
			
			//Upload texture from BitmapData
			_texture.uploadFromBitmapData(bitmap.bitmapData);
			
			//Set loaded to true
			_loaded = true;
			
			//Dispatch Complete-Event
			this.dispatchEvent( new Event( Event.COMPLETE ) );
		}
		
		/**
		 * Check if value is Power of 2
		 */
		private function scaleBitmap(bitmap:Bitmap) : Bitmap
		{
			if (!isPowerOfTwo(bitmap.width) || !isPowerOfTwo(bitmap.width)) {
				var newWidth:Number  = nextHighestPowerOfTwo( bitmap.width );
				var newHeight:Number = nextHighestPowerOfTwo( bitmap.width );
				
				var scaleFactorX:Number = newWidth/bitmap.width;
				var scaleFactorY:Number = newHeight/bitmap.height;
				
				var scaleMatrix:Matrix=new Matrix();
				scaleMatrix.scale(scaleFactorX, scaleFactorY);
				
				var scaledBitmapData:BitmapData = new BitmapData(newWidth, newHeight, true, 0xFFFFFFFF);
				scaledBitmapData.draw(bitmap, scaleMatrix);
				
				bitmap.bitmapData=scaledBitmapData
			}
			return bitmap;
		}
		
		/**
		 * Check if value is Power of 2
		 */
		private function isPowerOfTwo(x:Number) : Boolean 
		{
			return ((x & (x - 1)) === 0);
		}
		
		/**
		 * Returns the next Highest Power of 2
		 */
		private function nextHighestPowerOfTwo(x:Number) : Number
		{
			--x;
			for (var i:Number = 1; i < 32; i <<= 1) {
				x = x | x >> i;
			}
			return (x + 1);
		}
		
		/**
		* State of texture loading
		*/
		public function get loaded() : Boolean
		{
			return _loaded;
		}
		
		/**
		* Flash Texture
		*/
		public function get texture() : flash.display3D.textures.Texture
		{
			return _texture;
		}
		
		/**
		* Textures channel count. Count of 1.0 or 2.0 blends Texture with Material
		*/
		public function get origChannelCount() : Number
		{
			return _origChannelCount;
		}
		
		/**
		* @private
		*/
		public function set origChannelCount(origChannelCount:Number) : void
		{
			_origChannelCount = origChannelCount;
		}
		
		/**
		* Location and filename of image
		*/
        public function get url() : String
		{
			return _url;
		}
		
		/**
		* @private
		*/
		public function set url(url:String) : void
		{
			_url = url;
		}
		
		/**
		* Specify how the texture wraps(repeat or clamp) in S direction.
		*/
        public function get repeatS() : Boolean
		{
			return _repeatS;
		}
		
		/**
		* @private
		*/
		public function set repeatS(repeatS:Boolean) : void
		{
			_repeatS = repeatS;
		}
		
		/**
		* Specify how the texture wraps(repeat or clamp) in T direction. 
		*/
        public function get repeatT() : Boolean
		{
			return _repeatT;
		}
		
		/**
		* @private
		*/
		public function set repeatT(repeatT:Boolean) : void
		{
			_repeatT = repeatT;
		}
	}
	
}
