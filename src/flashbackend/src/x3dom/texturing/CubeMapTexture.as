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

	public class CubeMapTexture extends BaseTexture
	{
		private var _tmpTexture:CubeTexture;
		private var _texLoaded:Number = 0;
		private var _texLoader:Array = new Array();
		
		public function CubeMapTexture(back:String, front:String, bottom:String, top:String, left:String, right:String,
									   blending:Boolean=false, repeatS:Boolean=true, repeatT:Boolean=true)
		{
			//Init super class
			super(blending, repeatS, repeatT);
			
			//Set black default texture
			this.defaultTexture();
			
			//Load Textures
			this.loadTexture(0, right);
			this.loadTexture(1, left);
			this.loadTexture(2, top);
			this.loadTexture(3, bottom);
			this.loadTexture(4, front);
			this.loadTexture(5, back);
		}
		
		/**
		 * Set a black default texture for rendering while real Texture is not ready yet
		 */
		private function defaultTexture() : void
		{
			var bitmapData:BitmapData = new BitmapData(2, 2, true, 0xFF000000);
			
			_texture = _context3D.createCubeTexture(2, Context3DTextureFormat.BGRA, false);
			
			for(var i:uint=0; i<6; i++) {
				CubeTexture(_texture).uploadFromBitmapData( bitmapData, i );
			}
		}
		
		/**
		 * Load texture from url
		 */
		private function loadTexture(face:Number, url:String) : void
		{	
			//Set ready to false
			_ready = false;
			
			//Create new Loader
			_texLoader[face] = new Loader();
			
			//Add Complete- and IOError Listener to Loader
			_texLoader[face].contentLoaderInfo.addEventListener(Event.COMPLETE, handleComplete);
			_texLoader[face].contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, handleIOError);
			
			//Load image from url
			_texLoader[face].load( new URLRequest( url ) );
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
			
			if(_texLoaded == 0) {
				//Create Texture
				_tmpTexture = _context3D.createCubeTexture(bitmap.width, Context3DTextureFormat.BGRA, false);
			}
			
			//Get Face
			var face:Number = _texLoader.indexOf( e.target.loader );
			
			//Upload texture from BitmapData
			CubeTexture(_tmpTexture).uploadFromBitmapData(bitmap.bitmapData, face);
			
			_texLoaded++;
			
			if(_texLoaded == 6) {
				//Set ready to true
				_ready = true;
				
				_texture = _tmpTexture;
				
				//Dispatch Complete-Event
				this.dispatchEvent( new Event( Event.COMPLETE ) );
			}
		}
		
		/**
		 * Handle Texture load IOError-Event
		 */
		private function handleIOError(e:IOErrorEvent) : void
		{
			x3dom.Debug.logError(e.text.toString());
		}
		
	}
}