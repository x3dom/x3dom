package x3dom.texturing
{
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.Loader;
	import flash.display3D.*;
	import flash.display3D.textures.*;
	import flash.events.Event;
	import flash.utils.ByteArray;
	
	import mx.utils.Base64Decoder;
	import x3dom.Debug;
	import x3dom.Utils;
	
	public class CanvasTexture extends BaseTexture
	{
		public function CanvasTexture(width:Number, height:Number, dataURL:String, 
									  blending:Boolean=false, repeatS:Boolean=true, repeatT:Boolean=true)
		{
			//Init super class
			super(blending, repeatS, repeatT);
			
			//Set black default texture
			this.defaultTexture();
			
			//Generate Pixel texture
			this.generateTexture(width, height, dataURL);
		}
		
		/**
		 * Set a black default texture for rendering while real Texture is not ready yet
		 */
		private function defaultTexture() : void
		{
			this._texture = _context3D.createTexture(1, 1, Context3DTextureFormat.BGRA, false);
			Texture(_texture).uploadFromBitmapData( new BitmapData(1, 1, true, 0xFF000000) );
		}
		
		private function generateTexture(width:Number, height:Number, dataURL:String) : void
		{
			var data:Array = dataURL.split(',');
			
			var decoder:Base64Decoder = new Base64Decoder();
			decoder.decode(data[1]);
			
			var byteArray:ByteArray = decoder.toByteArray();
			
			var loader:Loader = new Loader;
			loader.loadBytes(byteArray);
			loader.contentLoaderInfo.addEventListener(Event.COMPLETE, handleComplete);
		}
		
		private function handleComplete(e:Event) : void
		{
			var bitmap:Bitmap = Bitmap(e.target.content); 
			
			//Scale Bitmap
			bitmap = Utils.scaleBitmap(bitmap);
			
			//Create Texture
			this._texture = _context3D.createTexture(bitmap.width, bitmap.height, Context3DTextureFormat.BGRA, false);
			
			//Upload texture from BitmapData
			Texture(this._texture).uploadFromBitmapData(bitmap.bitmapData);
			//Texture(this._texture).uploadFromByteArray(byteArray, 0);
			
			//Set ready true
			_ready = true;
			
			//Dispatch Complete-Event
			this.dispatchEvent( new Event( Event.COMPLETE ) );
		}
	}
}