package x3dom.lighting
{
	
	public class SpotLight extends BaseLight
	{
		/**
		 * Orientation of light relative to local coordinate system.
		 * @defaut [0.0, 0.0, -1.0]
		 */
		private var _direction:Array = new Array(0.0, 0.0, -1.0);
		
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
		 * Inner solid angle (in radians) where light source has uniform full intensity if beamWidth greater then; 
		 * cutOffAngle, beamWidth reset to equal cutOffAngle.
		 * @defaut 1.570796
		 */
		private var _beamWidth:Number = 1.570796;
		
		/**
		 * Outer solid angle (in radians) where light source intensity becomes zero if beamWidth greater then; 
		 * cutOffAngle, beamWidth reset to equal cutOffAngle.
		 * @defaut 0.785398
		 */
		private var _cutOffAngle:Number = 0.785398;
		
		public function SpotLight()
		{
			super();
		}
		
		/**
		 * Orientation of light relative to local coordinate system.
		 * @defaut [0.0, 0.0, -1.0]
		 */
		public function get direction() : Vector.<Number>
		{
			return _direction;
		}
		
		/**
		 * @private
		 */
		public function set direction(direction:Vector.<Number>) : void
		{
			_direction = direction;
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
		}
		
		/**
		 * Position of light relative to local coordinate system.
		 */
		public function get location() : Array
		{
			return _location;
		}
		
		/**
		 * @private
		 */
		public function set location(location:Vector.<Number>) : void
		{
			_location = location;
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
		
		/**
		 * Inner solid angle (in radians) where light source has uniform full intensity if beamWidth greater then; 
		 * cutOffAngle, beamWidth reset to equal cutOffAngle.
		 */
		public function get beamWidth() : Number
		{
			return _beamWidth;
		}
		
		/**
		 * @private
		 */
		public function set beamWidth(beamWidth:Number) : void
		{
			_beamWidth = beamWidth;
		}
		
		/**
		 * Outer solid angle (in radians) where light source intensity becomes zero if beamWidth greater then; 
		 * cutOffAngle, beamWidth reset to equal cutOffAngle.
		 */
		public function get cutOffAngle() : Number
		{
			return _cutOffAngle;
		}
		
		/**
		 * @private
		 */
		public function set cutOffAngle(cutOffAngle:Number) : void
		{
			_cutOffAngle = cutOffAngle;
		}
	}
}