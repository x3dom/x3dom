package x3dom.texturing
{
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display3D.*;
	import flash.events.Event;
	import flash.utils.ByteArray;
	import flash.display3D.textures.*;
	
	import x3dom.Utils;

	public class PixelTexture extends BaseTexture
	{
		
		public function PixelTexture(width:Number, height:Number, comp:Number, pixels:Array, 
									 blending:Boolean=false, repeatS:Boolean=true, repeatT:Boolean=true)
		{
			//Init super class
			super(blending, repeatS, repeatT);
			
			//Set black default texture
			this.defaultTexture();
			
			//Generate Pixel texture
			this.generateTexture(width, height, comp, pixels);
		}
		
		/**
		 * Set a black default texture for rendering while real Texture is not ready yet
		 */
		private function defaultTexture() : void
		{
			this._texture = _context3D.createTexture(1, 1, Context3DTextureFormat.BGRA, false);
			Texture(_texture).uploadFromBitmapData( new BitmapData(1, 1, true, 0xFF000000) );
		}
		
		private function generateTexture(width:Number, height:Number, comp:Number, pixels:Array) : void
		{
			//Set ready false
			this._ready = false;
			
			//Create new ByteArray for pixels
			var byteArray:ByteArray = new ByteArray();
			
			//Create var for loops
			var i:uint;
			
			//Choose between different modes
			if(comp == 1) {
				for(i=0; i<pixels.length; i++) {
					byteArray.writeInt( Utils.rgba2Hex(pixels[i+0], pixels[i+0], pixels[i+0], 255) );
				}
			} else if(comp == 2) {
				for(i=0; i<pixels.length; i+=2) {
					byteArray.writeInt( Utils.rgba2Hex(pixels[i+0], pixels[i+0], pixels[i+0], pixels[i+1]) );
				}
			} else if(comp == 3) {
				for(i=0; i<pixels.length; i+=3) {
					byteArray.writeInt( Utils.rgba2Hex(pixels[i+0], pixels[i+1], pixels[i+2], 255) );
				}
			} else if(comp == 4) {
				for(i=0; i<pixels.length; i+=4) {
					byteArray.writeInt( Utils.rgba2Hex(pixels[i+0], pixels[i+1], pixels[i+2], pixels[i+3]) );
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