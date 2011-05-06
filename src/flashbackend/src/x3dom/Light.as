package x3dom
{
	public class Light
	{
		private var _type:Number = 0;
		private var _on:Boolean = true;
		private var _color:Array = new Array(1.0, 1.0, 1.0);
		private var _intensity:Number = 1.0;
		private var _ambientIntensity:Number =  0.0;
		private var _direction:Array = new Array(0.0, 0.0, -1.0);
		private var _attenuation:Array = new Array(1.0, 1.0, 1.0);
		private var _location:Array = new Array(1.0, 1.0, 1.0);
		private var _radius:Number = 0.0;
		private var _beamWidth:Number = 0.0;
		private var _cutOffAngle:Number = 0.0;
		
		public function Light()
		{
		}
		
		public function get type() : Number
		{
			return _type;
		}
		
		public function set type(type:Number) : void
		{
			_type = type;
		}
		
		public function get on() : Boolean
		{
			return _on;
		}
		
		public function set on(on:Boolean) : void
		{
			_on = on;
		}
		
		public function get color() : Array
		{
			return _color;
		}
		
		public function set color(color:Array) : void
		{
			_color = color;
		}
		
		public function get intensity() : Number
		{
			return _intensity;
		}
		
		public function set intensity(intensity:Number) : void
		{
			_intensity = intensity;
		}
		
		public function get ambientIntensity() : Number
		{
			return _ambientIntensity;
		}
		
		public function set ambientIntensity(ambientIntensity:Number) : void
		{
			_ambientIntensity = ambientIntensity;
		}
		
		public function get direction() : Array
		{
			return _direction;
		}
		
		public function set direction(direction:Array) : void
		{
			_direction = direction;
			_direction.push(0.0);
		}
		
		public function get attenuation() : Array
		{
			return _attenuation;
		}
		
		public function set attenuation(attenuation:Array) : void
		{
			_attenuation = attenuation;
		}
		
		public function get location() : Array
		{
			return _location;
		}
		
		public function set location(location:Array) : void
		{
			_location = location;
		}
		
		public function get radius() : Number
		{
			return _radius;
		}
		
		public function set radius(radius:Number) : void
		{
			_radius = radius;
		}
		
		public function get beamWidth() : Number
		{
			return _beamWidth;
		}
		
		public function set beamWidth(beamWidth:Number) : void
		{
			_beamWidth = beamWidth;
		}
		
		public function get cutOffAngle() : Number
		{
			return _cutOffAngle;
		}
		
		public function set cutOffAngle(cutOffAngle:Number) : void
		{
			_cutOffAngle = cutOffAngle;
		}
	}
}