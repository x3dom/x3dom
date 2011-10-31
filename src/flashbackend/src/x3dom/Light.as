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
			return this._type;
		}
		
		public function set type(type:Number) : void
		{
			this._type = type;
		}
		
		public function get on() : Boolean
		{
			return this._on;
		}
		
		public function set on(on:Boolean) : void
		{
			this._on = on;
		}
		
		public function get color() : Array
		{
			return this._color;
		}
		
		public function set color(color:Array) : void
		{
			this._color = color;
		}
		
		public function get intensity() : Number
		{
			return this._intensity;
		}
		
		public function set intensity(intensity:Number) : void
		{
			this._intensity = intensity;
		}
		
		public function get ambientIntensity() : Number
		{
			return this._ambientIntensity;
		}
		
		public function set ambientIntensity(ambientIntensity:Number) : void
		{
			this._ambientIntensity = ambientIntensity;
		}
		
		public function get direction() : Array
		{
			return this._direction;
		}
		
		public function set direction(direction:Array) : void
		{
			this._direction = direction;
			this._direction.push(0.0);
		}
		
		public function get attenuation() : Array
		{
			return this._attenuation;
		}
		
		public function set attenuation(attenuation:Array) : void
		{
			this._attenuation = attenuation;
		}
		
		public function get location() : Array
		{
			return this._location;
		}
		
		public function set location(location:Array) : void
		{
			this._location = location;
		}
		
		public function get radius() : Number
		{
			return this._radius;
		}
		
		public function set radius(radius:Number) : void
		{
			this._radius = radius;
		}
		
		public function get beamWidth() : Number
		{
			return this._beamWidth;
		}
		
		public function set beamWidth(beamWidth:Number) : void
		{
			this._beamWidth = beamWidth;
		}
		
		public function get cutOffAngle() : Number
		{
			return this._cutOffAngle;
		}
		
		public function set cutOffAngle(cutOffAngle:Number) : void
		{
			this._cutOffAngle = cutOffAngle;
		}
	}
}