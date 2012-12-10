package x3dom.texturing
{
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display3D.*;
	import flash.display3D.textures.*;
	import flash.events.Event;
	import flash.utils.ByteArray;
	
	import x3dom.Debug;
	import x3dom.Utils;
	
	public class CanvasTexture extends BaseTexture
	{
		public function CanvasTexture(width:Number, height:Number, pixels:Object, 
									  blending:Boolean=false, repeatS:Boolean=true, repeatT:Boolean=true)
		{
			//Init super class
			super(blending, repeatS, repeatT);
			
			//Set black default texture
			this.defaultTexture();
			
			//Generate Pixel texture
			this.generateTexture(width, height, pixels);
		}
		
		/**
		 * Set a black default texture for rendering while real Texture is not ready yet
		 */
		private function defaultTexture() : void
		{
			this._texture = _context3D.createTexture(1, 1, Context3DTextureFormat.BGRA, false);
			Texture(_texture).uploadFromBitmapData( new BitmapData(1, 1, true, 0xFF000000) );
		}
		
		private function generateTexture(width:Number, height:Number, pixels:Object) : void
		{
			//Set ready false
			this._ready = false;
			
			//Create new ByteArray for pixels
			var byteArray:ByteArray = new ByteArray();
			
			var red:Number, green:Number, blue:Number, alpha:Number;
			var counter:uint = 0;
			
			for(var c:Object in pixels) {
				if(counter==0) {
					red = pixels[c];
					counter++;
				} else if(counter==1) {
					green = pixels[c];
					counter++;
				} else if(counter==2) {
					blue = pixels[c];
					counter++;
				} else if(counter==3) {
					alpha = pixels[c];
					byteArray.writeInt( Utils.rgba2Hex(red, green, blue, alpha) );
					counter = 0;
				}
			}
			
			//Create new Bitmap
			var bitmap:Bitmap = new Bitmap( new BitmapData(width, height) );
			
			//Set ByteArray position to start
			byteArray.position = 0;
			
			//Set Pixels
			bitmap.bitmapData.setPixels(bitmap.bitmapData.rect, byteArray);
			
			//Scale Bitmap
			bitmap = Utils.scaleBitmap(bitmap);
			
			//Create Texture
			this._texture = _context3D.createTexture(bitmap.width, bitmap.height, Context3DTextureFormat.BGRA, false);
			
			//Upload texture from BitmapData
			Texture(this._texture).uploadFromBitmapData(bitmap.bitmapData);
			
			//Set ready true
			_ready = true;
			
			//Dispatch Complete-Event
			this.dispatchEvent( new Event( Event.COMPLETE ) );
		}
	}
}