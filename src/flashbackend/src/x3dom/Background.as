package x3dom
{
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.GradientType;
	import flash.display.Sprite;
	import flash.display3D.*;
	import flash.geom.Matrix;
	
	import x3dom.texturing.*;

	public class Background
	{
		private var _scene:X3DScene;
		private var _context3D:Context3D;
		
		private var _hasSkyTexture:Boolean  = false;
		private var _isCubeTexture:Boolean = false;
		private var _hasBackTexture:Boolean = false;
		private var _isSphereExists:Boolean = false;
		
		private var _texURLs:Array = new Array();
		private var _skyColor:Array = new Array(0, 0, 0);
		private var _skyAngle:Array = new Array();
		private var _groundColor:Array  = new Array();
		private var _groundAngle:Array  = new Array();
		private var _transparency:Number = 1.0;
		
		private var _sphere:Shape;
		private var _plane:Shape;
		
		
		public function Background()
		{
			_context3D = FlashBackend.getContext();
			
			//Create background plane
			createPlane();
			
			//Create background sphere
			createSphere();
		}
		
		public function init() : void
		{
			//Check if there are more than one skyColor and skyAngels count is one less skyColors count
			if( (_skyColor.length/3) > 1 && _skyAngle.length == ((_skyColor.length/3)-1) )
			{
				//Generate sky texture
				generateSkyTexture();
				_hasSkyTexture = true;
			}
			else
			{
				_hasSkyTexture = false;
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
					_plane.texture = new ImageTexture(_texURLs[0]);
					_hasBackTexture = true;
					_isCubeTexture = false;
				}
			}
			else
			{
				_hasBackTexture = false;
				_isCubeTexture = false;
			}
				
		}
		
		private function createPlane() :void
		{
			_plane = new Shape();
			_plane.setVertices( 0, Vector.<Number>( [-1,-1,0, 1,-1,0, 1,1,0, -1,1,0] ) );
			_plane.setTexCoords( 0, Vector.<Number>( [0,1, 1,1, 1,0, 0,0] ) );
			_plane.setIndices( 0, Vector.<uint>( [0,1,2, 2,3,0] ) );
		}
		
		private function createSphere() :void
		{
			var radius:Number = 10000;
			var latNumber:Number, longNumber:Number;
			var latitudeBands:Number = 24;
			var longitudeBands:Number = 24;
			
			var theta:Number, sinTheta:Number, cosTheta:Number;
			var phi:Number, sinPhi:Number, cosPhi:Number;
			var x:Number, y:Number, z:Number, u:Number, v:Number;
			
			var vertices:Vector.<Number> = new Vector.<Number>();
			var texCoords:Vector.<Number> = new Vector.<Number>();
			var indices:Vector.<uint> = new Vector.<uint>();
			
			for(latNumber = 0; latNumber<=latitudeBands ; latNumber++)
			{
				theta = (latNumber * Math.PI) / latitudeBands;
				sinTheta = Math.sin(theta);
				cosTheta = Math.cos(theta);
				
				for (longNumber = 0; longNumber <= longitudeBands; longNumber++)
				{
					phi = (longNumber * 2.0 * Math.PI) / longitudeBands;
					sinPhi = Math.sin(phi);
					cosPhi = Math.cos(phi);
					
					x = -cosPhi * sinTheta;
					y = -cosTheta;
					z = -sinPhi * sinTheta;
					
					u = 0.25 - ((1.0 * longNumber) / longitudeBands);
					v = latNumber / latitudeBands;
					
					vertices.push(radius * x);
					vertices.push(radius * y);
					vertices.push(radius * z);
					texCoords.push(u);
					texCoords.push(v);
				}
			}
			
			var first:Number, second:Number;
			
			for (latNumber = 0; latNumber < latitudeBands; latNumber++)
			{
				for (longNumber = 0; longNumber < longitudeBands; longNumber++)
				{
					first = (latNumber * (longitudeBands + 1)) + longNumber;
					second = first + longitudeBands + 1;
					
					indices.push(first);
					indices.push(second);
					indices.push(first + 1);
					
					indices.push(second);
					indices.push(second + 1);
					indices.push(first + 1);
				}
			}
			
			_sphere = new Shape();
			_sphere.setVertices(0, vertices);
			_sphere.setTexCoords(0, texCoords);
			_sphere.setIndices(0, indices);
		}
			
		private function generateSkyTexture() : void
		{
			//Create array for angles, colors and alphas
			var angles:Array = new Array();
			var colors:Array = new Array();
			var alphas:Array = new Array();
			
			//Fill color array with HEX-Colors
			for(var i:int=0; i<_skyColor.length/3; i++) {
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
					if ( (i == _groundAngle.length-1) && (Math.PI - _groundAngle[i] <= Math.PI / 2) ) {
						angles[angles.length] = Math.PI / 2;
						colors[colors.length] = x3dom.Utils.rgb2Hex( _groundColor[_groundColor.length-3], _groundColor[_groundColor.length-2], _groundColor[_groundColor.length-1]);
					}
					angles[angles.length] = Math.PI - _groundAngle[i];
					colors[colors.length] = x3dom.Utils.rgb2Hex(_groundColor[i*3 + 0], _groundColor[i*3 + 1], _groundColor[i*3 + 2]);
				}
				
				angles[angles.length] = Math.PI;
				colors[colors.length] = x3dom.Utils.rgb2Hex(_groundColor[0], _groundColor[1], _groundColor[2]);
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
			
			//FlashBackend.stage().addChild(new Bitmap(bitmapData));
			
			_sphere.texture = new BitmapTexture( new Bitmap(bitmapData) );
		}
		
		public function set skyColor(skyColor:Array) : void
		{
			_skyColor = skyColor;
		}
		
		public function get skyColor() : Array
		{
			return _skyColor;
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
		
		public function get transparency() : Number
		{
			return _transparency;
		}
		
		public function set texURLs(texURLs:Array) : void
		{
			_texURLs = texURLs;
		}
		
		public function hasBackTexture() : Boolean
		{
			return _hasBackTexture;
		}
		
		public function hasSkyTexture() : Boolean
		{
			return _hasSkyTexture;
		}
		
		public function get plane() : Shape
		{
			return _plane;
		}
		
		public function get sphere() : Shape
		{
			return _sphere;
		}
	}
}