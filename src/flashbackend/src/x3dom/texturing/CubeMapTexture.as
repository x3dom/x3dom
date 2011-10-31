package x3dom.texturing
{
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.Loader;
	import flash.display3D.*;
	import flash.display3D.textures.*;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.geom.Matrix;
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
			var bitmapData:BitmapData = new BitmapData(1, 1, true, 0xFF000000);
			
			this._texture = _context3D.createCubeTexture(1, Context3DTextureFormat.BGRA, false);
			
			for(var i:uint=0; i<6; i++) {
				CubeTexture(this._texture).uploadFromBitmapData( bitmapData, i, 0);
			}
		}
		
		/**
		 * Load texture from url
		 */
		private function loadTexture(face:Number, url:String) : void
		{	
			//Set ready to false
			this._ready = false;
			
			//Create new Loader
			this._texLoader[face] = new Loader();
			
			//Add Complete- and IOError Listener to Loader
			this._texLoader[face].contentLoaderInfo.addEventListener(Event.COMPLETE, handleComplete);
			this._texLoader[face].contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, handleIOError);
			
			//Load image from url
			this._texLoader[face].load( new URLRequest( url ) );
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
			
			if(this._texLoaded == 0) {
				//Create Texture
				this._tmpTexture = this._context3D.createCubeTexture(bitmap.width, Context3DTextureFormat.BGRA, false);
			}
			
			//Get Face
			var face:Number = this._texLoader.indexOf( e.target.loader );
			
			//Upload texture from BitmapData
			this.uploadTextureWithMipmaps(this._tmpTexture, bitmap.bitmapData, face);
			//CubeTexture(this._tmpTexture).uploadFromBitmapData(bitmap.bitmapData, face);
			
			this._texLoaded++;
			
			if(this._texLoaded == 6) {
				//Set ready to true
				this._ready = true;
				this._texture = _tmpTexture;
				
				//Dispatch Complete-Event
				this.dispatchEvent( new Event( Event.COMPLETE ) );
			}
		}
		
		/**
		 * Generate all mipmap levels for a given texture.
		 * @param dest:Texture
		 * @param src:BitmapData
		 * @param face:uint
		 */
		public function uploadTextureWithMipmaps(dest:CubeTexture, src:BitmapData, face:uint):void
		{
			var ws:int = src.width;
			var hs:int = src.height;
			var level:int = 0;
			var tmp:BitmapData;
			var transform:Matrix = new Matrix();
			
			tmp = new BitmapData(src.width, src.height, true, 0x00000000);
			
			while ( ws >= 1 && hs >= 1 )
			{ 
				tmp.draw(src, transform, null, null, null, true); 
				dest.uploadFromBitmapData(tmp, face, level);
				transform.scale(0.5, 0.5);
				level++;
				ws >>= 1;
				hs >>= 1;
				if (hs && ws) 
				{
					tmp.dispose();
					tmp = new BitmapData(ws, hs, true, 0x00000000);
				}
			}
			tmp.dispose();
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