package x3dom.lighting
{
	
	public class PointLight extends BaseLight
	{
		/**
		 * Constant, linear-distance and squared-distance dropoff factors.
		 * @defaut [1.0, 0.0, 0.0]
		 */
		private var _attenuation:Vector.<Number> = Vector.<Number>([1.0, 0.0, 0.0]);
		
		/**
		 * Position of light relative to local coordinate system.
		 * @defaut [0.0, 0.0, 0.0]
		 */
		private var _location:Vector.<Number> = Vector.<Number>([0.0, 0.0, 0.0]);
		
		/**
		 * Maximum effective distance of light relative to local light position, affected by ancestor scaling.
		 * @defaut 100.0
		 */
		private var _radius:Number = 100.0;
		
		/**
		 * 
		 */
		public function PointLight(id:uint)
		{
			super(id);
		}
		
		/**
		 * Constant, linear-distance and squared-distance dropoff factors.
		 */
		public function get attenuation() : Vector.<Number>
		{
			return _attenuation;
		}
		
		/**
		 * @private
		 */
		public function set attenuation(attenuation:Vector.<Number>) : void
		{
			_attenuation = attenuation;
			this._attenuation.push(1.0);
		}
		
		/**
		 * Position of light relative to local coordinate system.
		 */
		public function get location() : Vector.<Number>
		{
			return _location;
			this._location.push(0.0);
		}
		
		/**
		 * @private
		 */
		public function set location(location:Vector.<Number>) : void
		{
			_location = location;
			this._location.push(1.0);
		}
		
		/**
		 * Maximum effective distance of light relative to local light position, affected by ancestor scaling.
		 */
		public function get radius() : Number
		{
			return _radius;
		}
		
		/**
		 * @private
		 */
		public function set radius(radius:Number) : void
		{
			_radius = radius;
		}
	}
}