package x3dom
{
	public class Utils
	{
		public static function rgb2Hex(r:Number, g:Number, b:Number) : Number {
			return (Math.round(r*255) << 16) | (Math.round(g*255) << 8) | Math.round(b*255);
		}
	}
}