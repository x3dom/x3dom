package x3dom.lighting
{
	public class BaseLight
	{
		/**
		 * Enables/disables this Light
		 * @default true
		 */
		protected var _on:Boolean = true;
		
		/**
		 * Color of light, applied to colors of objects.
		 * @default white [1.0, 1.0, 1.0]
		 */
		protected var _color:Vector.<uint> = Vector.<uint>([1.0, 1.0, 1.0]);
		
		/**
		 * Brightness of direct emission from the light.
		 * @default 1.0
		 */
		protected var _intensity:Number = 1.0;
		
		/**
		 * Brightness of ambient (nondirectional background) emission from the light.
		 * @default 0.0
		 */
		protected var _ambientIntensity:Number =  0.0;
		
		
		/**
		 * 
		 */
		public function BaseLight()
		{
		}
		
		/**
		 * Enables/disables this Light
		 */
		public function get on() : Boolean
		{
			return _on;
		}
		
		/**
		 * @private
		 */
		public function set on(on:Boolean) : void
		{
			_on = on;
		}
		
		/**
		 * Color of light, applied to colors of objects.
		 */
		public function get color() : Array
		{
			return _color;
		}
		
		/**
		 * @private
		 */
		public function set color(color:Array) : void
		{
			_color = color;
		}
		
		/**
		 * Brightness of direct emission from the light.
		 */
		public function get intensity() : Number
		{
			return _intensity;
		}
		
		/**
		 * @private
		 */
		public function set intensity(intensity:Number) : void
		{
			_intensity = intensity;
		}
		
		/**
		 * Brightness of ambient (nondirectional background) emission from the light.
		 */
		public function get ambientIntensity() : Number
		{
			return _ambientIntensity;
		}
		
		/**
		 * @private
		 */
		public function set ambientIntensity(ambientIntensity:Number) : void
		{
			_ambientIntensity = ambientIntensity;
		}
	}
}