package x3dom
{
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.geom.Matrix;
	
	public class Utils
	{
		public static function rgb2Hex(r:Number, g:Number, b:Number) : Number {
			return (Math.round(r*255) << 16) | (Math.round(g*255) << 8) | Math.round(b*255);
		}
		
		public static function rgba2Hex(r:Number, g:Number, b:Number, a:Number) : uint {
			return (Math.round(a) << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
		}
		
		/**
		 * Check if value is Power of 2
		 */
		public static function scaleBitmap(bitmap:Bitmap) : Bitmap
		{
			if (!isPowerOfTwo(bitmap.width) || !isPowerOfTwo(bitmap.height) ||
				bitmap.width > 2048 || bitmap.height > 2048) {
				var newWidth:Number  = nextBestPowerOfTwo( bitmap.width );
				var newHeight:Number = nextBestPowerOfTwo( bitmap.height );
				
				var scaleFactorX:Number = newWidth/bitmap.width;
				var scaleFactorY:Number = newHeight/bitmap.height;
				
				var scaleMatrix:Matrix=new Matrix();
				scaleMatrix.scale(scaleFactorX, scaleFactorY);
				
				var scaledBitmapData:BitmapData = new BitmapData(newWidth, newHeight, true, 0x00000000);
				scaledBitmapData.draw(bitmap, scaleMatrix);
				
				bitmap.bitmapData=scaledBitmapData
			}
			return bitmap;
		}
		
		/**
		 * Check if value is Power of 2
		 */
		public static function isPowerOfTwo(x:Number) : Boolean 
		{
			return ((x & (x - 1)) === 0);
		}
		
		/**
		 * Returns the next Highest Power of 2
		 */
		public static function nextHighestPowerOfTwo(x:Number) : Number
		{
			--x;
			for (var i:Number = 1; i < 32; i <<= 1) {
				x = x | x >> i;
			}
			return (x + 1);
		}
		
		public static function nextBestPowerOfTwo(x:Number) : Number
		{
			var log2x:Number = Math.log(x) / Math.log(2);
			var result:Number = Math.pow(2, Math.round(log2x));
			
			if(result > 2048) {
				result = nextLowerPowerOfTwo(x);
			}
			return result;
			
		}
		
		public static function nextLowerPowerOfTwo(x:Number): Number {
			var a:uint = 1, b:uint = 2;
			
			if (x < 1)
				return 0;
			
			while (x > b) {
				a += a;
				b += b;
			}
			
			return a;
		}
	}
}