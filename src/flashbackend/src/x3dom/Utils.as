package x3dom
{
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.geom.Matrix;
	import flash.geom.Matrix3D;
	import flash.utils.ByteArray;
	
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
		
		/**
		 * 
		 */
		public static function getPrecisionMax(type:String) : Number
		{
			switch(type)
			{
				case "Int8":
					return 127.0;
				case "Uint8":
					return 255.0;
				case "Int16":
					return 32767.0;
				case "Uint16":
					return 65535.0;
				case "Int32":
					return 2147483647.0;
				case "Uint32":
					return 4294967295.0;
				case "Float32":
				case "Float64":
				default:
					return 0.0;
			}
		}
		
		/**
		 * 
		 */
		public static function readType(byteArray:ByteArray, type:String, normalize:Boolean = false) : Number
		{
			var value:Number;
			switch(type)
			{
				case "Int8":
					value = byteArray.readByte();
					break;
				case "Uint8":
					value = byteArray.readUnsignedByte();
					break;
				case "Int16":
					value = byteArray.readShort();
					break;
				case "Uint16":
					value = byteArray.readUnsignedShort();
					break;
				case "Int32":
					value = byteArray.readInt();
					break;
				case "Uint32":
					value = byteArray.readUnsignedInt();
					break;
				case "Float32":
					value = byteArray.readFloat();
					break;
				default:
					value = 0.0;
			}
			if(normalize && type != "Float32") 
				value /= Utils.getPrecisionMax(type);
			
			return value;
		}
		
		/**
		 * 
		 */
		public static function MatrixOrthoRH(width:int, height:int, zNear:Number, zFar:Number) : Matrix3D
		{
			return new Matrix3D(Vector.<Number>([2.0/width, 0.0, 0.0, 0.0,
												 0.0, 2.0/height, 0.0, 0.0,
												 0.0, 0.0, 1.0/(zNear-zFar), zNear/(zNear-zFar),
												 0.0, 0.0, 0.0, 1.0]));
		}
		
		/**
		 * 
		 */
		public static function MatrixOrthoLH(width:int, height:int, zNear:Number, zFar:Number) : Matrix3D
		{
			return new Matrix3D(Vector.<Number>([2.0/width, 0.0, 0.0, 0.0,
												 0.0, 2.0/height, 0.0, 0.0,
												 0.0, 0.0, 1.0/(zFar-zNear), zNear/(zNear-zFar),
												 0.0, 0.0, 0.0, 1.0]));
		}
	
		
	}
}