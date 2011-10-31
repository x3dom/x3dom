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
		private var _hasCubeTexture:Boolean = false;
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
			this._context3D = FlashBackend.getContext();
			
			//Create background plane
			this.createPlane();
			
			//Create background sphere
			this.createSphere();
		}
		
		public function init() : void
		{
			//Check if there are more than one skyColor and skyAngels count is one less skyColors count
			if( (this._skyColor.length/3) > 1 && this._skyAngle.length == ((this._skyColor.length/3)-1) )
			{
				//Generate sky texture
				this.generateSkyTexture();
				this._hasSkyTexture = true;
			}
			else
			{
				this._hasSkyTexture = false;
			}
			
			//check if there are background textures
			if(this._texURLs[0] != "")
			{
				//Check if there are six textures for cubeTexture
				if( this._texURLs[0] != "" && this._texURLs[1] != "" && this._texURLs[2] != "" &&
					this._texURLs[3] != "" && this._texURLs[4] != "" && this._texURLs[5] != "" )
				{
					this._sphere.texture = new CubeMapTexture(this._texURLs[0], this._texURLs[1], this._texURLs[2],
														 	  this._texURLs[3], this._texURLs[4], this._texURLs[5]);
					this._hasCubeTexture = true;
					this._hasBackTexture = false;
					this._hasSkyTexture = false;
				}
				else
				{
					this._plane.texture = new ImageTexture(this._texURLs[0]);
					this._hasBackTexture = true;
					this._hasCubeTexture = false;
					this._hasSkyTexture = false;
				}
			}
			else
			{
				this._hasBackTexture = false;
				this._hasCubeTexture = false;
			}
				
		}
		
		private function createPlane() :void
		{
			this._plane = new Shape();
			this._plane.setVertices( 0, Vector.<Number>( [-1,-1,0, 1,-1,0, 1,1,0, -1,1,0] ) );
			this._plane.setTexCoords( 0, Vector.<Number>( [0,1, 1,1, 1,0, 0,0] ) );
			this._plane.setIndices( 0, Vector.<uint>( [0,1,2, 2,3,0] ) );
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
			
			this._sphere = new Shape();
			this._sphere.setVertices(0, vertices);
			this._sphere.setTexCoords(0, texCoords);
			this._sphere.setIndices(0, indices);
		}
			
		private function generateSkyTexture() : void
		{
			//Create array for angles, colors and alphas
			var angles:Array = new Array();
			var colors:Array = new Array();
			var alphas:Array = new Array();
			
			//Fill color array with HEX-Colors
			for(var i:int=0; i<this._skyColor.length/3; i++) {
				colors[i] = x3dom.Utils.rgb2Hex( this._skyColor[i*3+0], this._skyColor[i*3+1], this._skyColor[i*3+2] );
			}
			
			//Fill angle array
			for(i=0; i<this._skyAngle.length; i++) {
				if(i == 0) angles[i] = 0;
				angles[i+1] = this._skyAngle[i];
			}
			
			if(this._groundAngle.length > 0)
			{
				if (angles[angles.length-1] < Math.PI / 2) {
					angles[angles.length] = Math.PI / 2 - 0.000001;
					colors[colors.length] = colors[colors.length - 1];
				}
				
				for (i=this._groundAngle.length-1; i>=0; i--) {
					if ( (i == this._groundAngle.length-1) && (Math.PI - this._groundAngle[i] <= Math.PI / 2) ) {
						angles[angles.length] = Math.PI / 2;
						colors[colors.length] = x3dom.Utils.rgb2Hex( this._groundColor[this._groundColor.length-3], this._groundColor[this._groundColor.length-2], this._groundColor[this._groundColor.length-1]);
					}
					angles[angles.length] = Math.PI - this._groundAngle[i];
					colors[colors.length] = x3dom.Utils.rgb2Hex(this._groundColor[i*3 + 0], this._groundColor[i*3 + 1], this._groundColor[i*3 + 2]);
				}
				
				angles[angles.length] = Math.PI;
				colors[colors.length] = x3dom.Utils.rgb2Hex(this._groundColor[0], this._groundColor[1], this._groundColor[2]);
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
			
			this._sphere.texture = new BitmapTexture( new Bitmap(bitmapData) );
		}
		
		public function set skyColor(skyColor:Array) : void
		{
			this._skyColor = skyColor;
		}
		
		public function get skyColor() : Array
		{
			return this._skyColor;
		}
		
		public function set skyAngle(skyAngle:Array) : void
		{
			this._skyAngle = skyAngle;
		}
		
		public function set groundColor(groundColor:Array) : void
		{
			this._groundColor = groundColor;
		}
		
		public function set groundAngle(groundAngle:Array) : void
		{
			this._groundAngle = groundAngle;
		}
		
		public function set transparency(transparency:Number) : void
		{
			this._transparency = transparency;
		}
		
		public function get transparency() : Number
		{
			return this._transparency;
		}
		
		public function set texURLs(texURLs:Array) : void
		{
			this._texURLs = texURLs;
		}
		
		public function hasBackTexture() : Boolean
		{
			return this._hasBackTexture;
		}
		
		public function hasSkyTexture() : Boolean
		{
			return this._hasSkyTexture;
		}
		
		public function hasCubeTexture() : Boolean
		{
			return this._hasCubeTexture;
		}
		
		public function get plane() : Shape
		{
			return this._plane;
		}
		
		public function get sphere() : Shape
		{
			return this._sphere;
		}
	}
}