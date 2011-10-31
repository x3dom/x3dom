package x3dom.texturing
{
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.Loader;
	import flash.display3D.*;
	import flash.display3D.textures.*;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.net.URLRequest;
	
	import x3dom.Debug;
	import x3dom.Utils;

	public class ImageTexture extends BaseTexture
	{
		/**
		 * Location and filename of image
		 */
		private var _url:String;
		
		/**
		 * Creates a new ImageTexture instance
		 */
		public function ImageTexture(url:String, blending:Boolean=false, repeatS:Boolean=true, repeatT:Boolean=true)
		{
			//Init super class
			super(blending, repeatS, repeatT);
			
			//Set black default texture
			this.defaultTexture();
			
			//Set URL
			this._url = url;
			
			//Load Texture
			this.loadTexture();
		}
		
		/**
		 * Set a black default texture for rendering while real Texture is not ready yet
		 */
		private function defaultTexture() : void
		{
			this._texture = _context3D.createTexture(1, 1, Context3DTextureFormat.BGRA, false);
			Texture(_texture).uploadFromBitmapData( new BitmapData(1, 1, true, 0xFF000000) );
		}
		
		/**
		 * Load texture from url
		 */
		private function loadTexture() : void
		{	
			//Set ready to false
			this._ready = false;
			
			//Create new Loader
			var loader:Loader = new Loader();
			
			//Add Complete- and IOError Listener to Loader
			loader.contentLoaderInfo.addEventListener(Event.COMPLETE, handleComplete);
			loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, handleIOError);
			
			//Load image from url
			loader.load( new URLRequest( this._url ) );
		}
		
		/**
		 * Handle Texture load Complete-Event
		 */
		private function handleComplete(e:Event) : void
		{
			//Convert Loader to Bitmap
			var bitmap:Bitmap = Bitmap( e.target.content );

			//Scale Bitmap to the next best power of two
			bitmap = Utils.scaleBitmap(bitmap);
			
			//Create Texture
			this._texture = _context3D.createTexture(bitmap.width, bitmap.height, Context3DTextureFormat.BGRA, false);
			
			//Upload texture from BitmapData
			Texture(this._texture).uploadFromBitmapData(bitmap.bitmapData);
			
			//Set ready to true
			this._ready = true;
			
			//Dispatch Complete-Event
			this.dispatchEvent( new Event( Event.COMPLETE ) );
		}
		
		/**
		 * Handle Texture load IOError-Event
		 */
		private function handleIOError(e:IOErrorEvent) : void
		{
			x3dom.Debug.logError(e.text.toString());
		}
		
		/**
		 * Location and filename of image
		 */
		public function get url() : String
		{
			return this._url;
		}
		
		/**
		 * @private
		 */
		public function set url(url:String) : void
		{
			//Set URL
			this._url = url;
			
			//Load texture from file
			this.loadTexture();
		}
	}
}