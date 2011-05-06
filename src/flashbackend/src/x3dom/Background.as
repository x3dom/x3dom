package x3dom
{
	import flash.display.*;
	import flash.display3D.*;
	import flash.display3D.textures.CubeTexture;
	import flash.display3D.textures.Texture;
	import flash.geom.Matrix;

	public class Background
	{
		private var _context3D:Context3D;
		
		private var _skyTexture:flash.display3D.textures.Texture;
		private var _cubeTexture:flash.display3D.textures.CubeTexture;
		
		private var _isSkyTexture:Boolean  = false;
		private var _isCubeTexture:Boolean = false;
		private var _isBackTexture:Boolean = false;
		private var _isSphereExists:Boolean = false;
		
		private var _texURLs:Array = new Array();
		private var _skyColor:Array = new Array(0, 0, 0);
		private var _skyAngle:Array = new Array();
		private var _groundColor:Array  = new Array();
		private var _groundAngle:Array  = new Array();
		private var _transparency:Number = 1.0;
		
		private var _skySphere:Mesh;
		private var _backgroundPlane:Mesh;
		
		
		public function Background(context3D:Context3D)
		{
			_context3D = context3D;
		}
		
		public function init() : void
		{
			//Check if there are more than one skyColor and skyAngels count is one less skyColors count
			if( (_skyColor.length/3) > 1 && _skyAngle.length == ((_skyColor.length/3)-1) )
			{
				//Generate sky texture
				generateSkyTexture();
				_isSkyTexture = true;
			}
			else
			{
				_isSkyTexture = false;
			}
			
			//check if there are background textures
			if(_texURLs[0] != "")
			{
				//Check if there are six textures for cubeTexture
				if( _texURLs[0] != "" && _texURLs[1] != "" && _texURLs[2] != "" &&
					_texURLs[3] != "" && _texURLs[4] != "" && _texURLs[5] != "" )
				{
					//Generate cube texture
					//loadTextures();
					//generateCubeTexture();
					_isCubeTexture = true;
				}
				else
				{
					_isBackTexture = true;
					_isCubeTexture = false;
				}
			}
			else
			{
				_isBackTexture = true;
				_isCubeTexture = false;
			}
				
		}
		
		public function render() : void
		{
			_context3D.clear(_skyColor[0], _skyColor[1], _skyColor[2], _transparency);
			
			
		}
		
		public function generateSkyTexture() : void
		{
			//Create array for angles, colors and alphas
			var angles:Array = new Array();
			var colors:Array = new Array();
			var alphas:Array = new Array();
			
			//Fill color array with HEX-Colors
			for(var i:uint=0; i<_skyColor.length/3; i++) {
				colors[i] = x3dom.Utils.rgb2Hex( _skyColor[i*3+0], _skyColor[i*3+1], _skyColor[i*3+2] );
			}
			
			//Fill angle array
			for(i=0; i<_skyAngle.length; i++) {
				if(i == 0) angles[i] = 0;
				angles[i+1] = _skyAngle[i];
			}
			
			if(_groundAngle.length > 0)
			{
				if (angles[angles.length-1] < Math.PI / 2) {
					angles[angles.length] = Math.PI / 2 - 0.000001;
					colors[colors.length] = colors[colors.length - 1];
				}
				
				for (i=_groundAngle.length-1; i>=0; i--) {
					if ((i == _groundAngle.length - 1) && (Math.PI - _groundAngle[i] <= Math.PI / 2)) {
						angles[angles.length] = Math.PI / 2;
						colors[colors.length] = _groundColor[_groundColor.length-1];
					}
					angles[angles.length] = Math.PI - _groundAngle[i];
					colors[colors.length] = _groundColor[i + 1];
				}
				
				angles[angles.length] = Math.PI;
				colors[colors.length] = _groundColor[0];
			}
			else
			{
				if (angles[angles.length-1] < Math.PI) 
				{
					angles[angles.length] = Math.PI;
					colors[colors.length] = colors[colors.length - 1];
				}
			}
			
			//Fill alpha array
			for (i=0; i<colors.length; i++) {
				alphas[i] = 1.0;
			}
			
			//Convert angles[0-PI] to ratios[0-255]
			for (i=0; i<angles.length; i++) {
				angles[i] = (angles[i]/Math.PI)*255.0;
			}
			
			//Create a Matrix instance and assign the Gradient Box
			var matrix:Matrix = new Matrix();
			matrix.createGradientBox( 512, 512, Math.PI/2, 0, 0 );
			
			//Create a sprite
			var sprite:Sprite = new Sprite();
			
			//Draw a gradient filled rect
			sprite.graphics.beginGradientFill( GradientType.LINEAR, colors, alphas, angles, matrix);
			sprite.graphics.drawRect( 0, 0, 512, 512 );
			
			//Create bitmapdata and draw the sprite into
			var bitmapData:BitmapData = new BitmapData(512, 512, false, 0x000000);
			bitmapData.draw( sprite );
			
			//Create Texture
			_skyTexture = _context3D.createTexture(512, 512, Context3DTextureFormat.BGRA, false);
			
			//Upload texture from BitmapData
			_skyTexture.uploadFromBitmapData(bitmapData);
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
		
		public function set texURLs(texURLs:Array) : void
		{
			_texURLs = texURLs;
		}
	}
}