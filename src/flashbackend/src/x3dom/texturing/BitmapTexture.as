package x3dom.texturing
{
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display3D.*;
	import flash.events.Event;
	import flash.display3D.textures.*;
	
	import x3dom.Utils;

	public class BitmapTexture extends BaseTexture
	{
		public function BitmapTexture(bitmap:Bitmap, blending:Boolean=false, repeatS:Boolean=true, repeatT:Boolean=true)
		{		
			//Init super class
			super(blending, repeatS, repeatT);
			
			//Set black default texture
			this.defaultTexture();
			
			//Generate Pixel texture
			this.generateTexture(bitmap);
		}
		
		/**
		 * Set a black default texture for rendering while real Texture is not ready yet
		 */
		private function defaultTexture() : void
		{
			_texture = _context3D.createTexture(2, 2, Context3DTextureFormat.BGRA, false);
			Texture(_texture).uploadFromBitmapData( new BitmapData(2, 2, true, 0xFF000000) );
		}
		
		private function generateTexture(bitmap:Bitmap) : void
		{
			//Set ready false
			_ready = false;
			
			//Scale Bitmap
			bitmap = Utils.scaleBitmap(bitmap);
			
			//Create Texture
			_texture = _context3D.createTexture(bitmap.width, bitmap.height, Context3DTextureFormat.BGRA, false);
			
			//Upload texture from BitmapData
			Texture(_texture).uploadFromBitmapData(bitmap.bitmapData);
			
			//Set ready true
			_ready = true;
			
			//Dispatch Complete-Event
			this.dispatchEvent( new Event( Event.COMPLETE ) );
		}
	}
}