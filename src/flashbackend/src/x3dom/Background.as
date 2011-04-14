package x3dom
{
	import flash.display3D.Context3D;

	public class Background
	{
		private var _context3D:Context3D;
		
		private var _bottomURL:String = "";
		private var _topURL:String = "";
		private var _leftURL:String = "";
		private var _rightURL:String = "";
		private var _frontURL:String = "";
		private var _backURL:String = "";
		private var _skyColor:Array = new Array();
		private var _skyAngle:Array = new Array();
		private var _groundColor:Array  = new Array();
		private var _groundAngle:Array  = new Array();
		private var _transparency:Number = 1.0;
		
		
		public function Background(context3D:Context3D)
		{
			_context3D = context3D;
		}
		
		public function render() : void
		{
			_context3D.clear(_skyColor[0], _skyColor[1], _skyColor[2], _transparency);
		}
		
		public function set skyColor(skyColor:Array) : void
		{
			_skyColor = skyColor;
		}
		
		public function set skyAngle(skyAngle:Array) : void
		{
			_skyAngle = skyAngle;
		}
		
		public function set groundColor(groundColor:Array) : void
		{
			_groundColor = groundColor;
		}
		
		public function set groundAngle(groundAngle:Array) : void
		{
			_groundAngle = groundAngle;
		}
		
		public function set transparency(transparency:Number) : void
		{
			_transparency = transparency;
		}
		
		public function set backURL(backURL:String) : void
		{
			_backURL = backURL;
		}
		
		public function set frontURL(frontURL:String) : void
		{
			_frontURL = frontURL;
		}
		
		public function set bottomURL(bottomURL:String) : void
		{
			_bottomURL = bottomURL;
		}
		
		public function set topURL(topURL:String) : void
		{
			_topURL = topURL;
		}
		
		public function set leftURL(leftURL:String) : void
		{
			_leftURL = leftURL;
		}
		
		public function set rightURL(rightURL:String) : void
		{
			_rightURL = rightURL;
		}
	}
}