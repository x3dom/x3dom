package x3dom
{
	import flash.display.Bitmap;
	import flash.display.Loader;
	import flash.events.Event;
	import flash.geom.Vector3D;
	import flash.net.URLRequest;
	
	import mx.flash.UIMovieClip;
	
	

	public class GeometryImage extends Shape
	{
		private var _coordinateTexturesLoaded:Boolean;
		private var _coordinateTexture0Loaded:Boolean;
		private var _coordinateTexture1Loaded:Boolean;
		private var _normalTextureLoaded:Boolean;
		private var _texCoordTextureLoaded:Boolean;
		private var _coords0:Bitmap = null;
		private var _coords1:Bitmap = null;
		private var _primType:Array = new Array();
		private var _vertexCount:Array = new Array();
		
		/**
		 * 
		 */
		public function GeometryImage()
		{
			super();
			_ready = false;
		}
		
		/**
		 * 
		 */
		public function setProperties(value:Object) : void
		{
			//Set number of Triangle, vertexCount and primTypes
			for(var i:uint=0; i<value.primType.length; i++)
			{
				this._primType[i] = value.primType[i];
				
				this._vertexCount[i] = Number(value.vertexCount[i]);
				
				if(this._primType[i] == 'TRIANGLES') 
				{
					this._numTriangles[i] = this._vertexCount[i] / 3;
					generateIndices(i);
				} 
				else if(this._primType[i] == 'TRIANGLESTRIP') 
				{
					this._numTriangles[i] = this._vertexCount[i] - 2;
					generateTriangleStripIndices(i)
				}
			}
			
			//Set boundingbox center
			_boundingBox.center.setTo(value.bboxCenter[0], value.bboxCenter[1], value.bboxCenter[2]);
			
			//Set boundingbox min
			_boundingBox.min.setTo(value.bboxMin[0], value.bboxMin[1], value.bboxMin[2]);		
	
			//Set boundingBox max
			_boundingBox.max.setTo(value.bboxMax[0], value.bboxMax[1], value.bboxMax[2]);	
		}
		
		/**
		 * 
		 */
		private function generateIndices(idx:uint) : void
		{
			var indices:Vector.<uint> = new Vector.<uint>();
			
			for(var i:uint = 0; i<_numTriangles[idx]*3; i++)
			{
				indices.push(i);
			}
			
			setIndices(idx, indices);
		}
		
		/**
		 * 
		 */
		private function generateTriangleStripIndices(idx:uint) : void
		{
			var indices:Vector.<uint> = new Vector.<uint>();
			
			for(var i:uint=0; i<Math.round(_numTriangles[idx]); i+=2)
			{
				if(i != 0) {
					indices.push(i, i-1, i+1);
				}
				indices.push(i, i+1, i+2);
			}
			
			setIndices(idx, indices);
		}
		
		/**
		 * 
		 */
		public function setCoordinateTexture(value:Object) : void
		{
			_coordinateTexturesLoaded = false;
			
			if(value.coordinateTexture0)
			{
				_coordinateTexture0Loaded = false;
				
				var coordinateLoader0:Loader = new Loader();
				coordinateLoader0.contentLoaderInfo.addEventListener(Event.COMPLETE, handleCoordinate0Complete);
				coordinateLoader0.load(new URLRequest(value.coordinateTexture0));
			}
			else
			{
				_coordinateTexture0Loaded = true;
			}
			
			if(value.coordinateTexture1)
			{
				_coordinateTexture1Loaded = false;
				
				var coordinateLoader1:Loader = new Loader();
				coordinateLoader1.contentLoaderInfo.addEventListener(Event.COMPLETE, handleCoordinate1Complete);
				coordinateLoader1.load(new URLRequest(value.coordinateTexture1));
			}
			else
			{
				_coordinateTexture1Loaded = true;
			}
		}
		
		/**
		 * 
		 */
		public function setNormalTexture(value:Object) : void
		{
			if(value.normalTexture)
			{
				_normalTextureLoaded = false;
				
				var normalLoader:Loader = new Loader();
				normalLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, handleNormalComplete);
				normalLoader.load(new URLRequest(value.normalTexture));
			}
			else
			{
				_normalTextureLoaded = true;
			}
		}
		
		/**
		 * 
		 */
		public function setTexCoordTexture(value:Object) : void
		{
			if(value.texCoordTexture)
			{
				_texCoordTextureLoaded = false;
				
				var coordinateLoader:Loader = new Loader();
				coordinateLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, handleTexCoordComplete);
				coordinateLoader.load(new URLRequest(value.texCoordTexture));
			}
			else
			{
				_texCoordTextureLoaded = true;
			}
		}
		
		/**
		 * 
		 */
		private function handleCoordinate0Complete(e:Event) : void
		{
			_coords0 = Bitmap( e.target.content );
			_coordinateTexture0Loaded = true;
			if(_coordinateTexture1Loaded == true) {
				setMultiCoordinates()
			}
			
		}
		
		/**
		 * 
		 */
		private function handleCoordinate1Complete(e:Event) : void
		{
			_coords1 = Bitmap( e.target.content );
			_coordinateTexture1Loaded = true;
			if(_coordinateTexture0Loaded == true) {
				setMultiCoordinates()
			}
		}
		
		private function setMultiCoordinates() : void
		{
			var color:uint;
			var idx:uint = 0;
			var coordinate0:Vector3D = new Vector3D();
			var coordinate1:Vector3D = new Vector3D();
			var bias:Vector3D = _boundingBox.max.subtract(_boundingBox.min);
			var vertices:Vector.<Number> = new Vector.<Number>();
			
			for(var y:uint=0; y<_coords0.height; y++)
			{
				for(var x:uint=0; x<_coords0.width; x++)
				{
					
					if( vertices.length/3 == (this._vertexCount[idx]) ) {
						setVertices(idx, vertices);
						idx++;
						if(idx < this._vertexCount.length){
							vertices = new Vector.<Number>();
						} else {
							break;
						}
					}
					
					color = _coords0.bitmapData.getPixel(x,y);
					
					coordinate0.x = ( (color >> 16 & 0xFF) / 255.0 );
					coordinate0.y = ( (color >> 8 & 0xFF) / 255.0 );
					coordinate0.z = ( (color & 0xFF) / 255.0 );
					
					if(_coords1) {
						color = _coords1.bitmapData.getPixel(x,y);
						
						coordinate1.x = ( (color >> 16 & 0xFF) / 255.0 ) / 256.0;
						coordinate1.y = ( (color >> 8 & 0xFF) / 255.0 ) / 256.0;
						coordinate1.z = ( (color & 0xFF) / 255.0 ) / 256.0;
						
						coordinate0.incrementBy(coordinate1);
					}
					
					coordinate0.x = (coordinate0.x * bias.x) + _boundingBox.min.x;
					coordinate0.y = (coordinate0.y * bias.y) + _boundingBox.min.y;
					coordinate0.z = (coordinate0.z * bias.z) + _boundingBox.min.z;
					
					vertices.push(coordinate0.x, coordinate0.y, coordinate0.z);
					
				}
			}
			
			_coordinateTexturesLoaded = true;
			
			if(_normalTextureLoaded && _texCoordTextureLoaded) 
			{
				_ready = true;
				this.dispatchEvent( new Event( Event.COMPLETE ) );
			}
		}
		
		
		/**
		 * 
		 */
		private function handleNormalComplete(e:Event) : void
		{
			var bitmap:Bitmap = Bitmap( e.target.content );
			
			var color:uint;		
			var idx:uint = 0;
			var normal:Vector3D = new Vector3D();
			var normals:Vector.<Number> = new Vector.<Number>();
			
			for(var y:uint=0; y<bitmap.height; y++)
			{
				for(var x:uint=0; x<bitmap.width; x++)
				{
					if( normals.length/3 == (this._vertexCount[idx]) ) {
						setNormals(idx, normals);
						idx++;
						if(idx < this._vertexCount.length){
							normals = new Vector.<Number>();
						} else {
							break;
						}
					}
					
					color = bitmap.bitmapData.getPixel(x,y);
					
					normal.x = color >> 16 & 0xFF;
					normal.x /= (normal.x != 255) ? 256 : 255;
					normal.x = normal.x * 2.0 - 1.0
						
					normal.y = color >> 8 & 0xFF;
					normal.y /= (normal.y != 255) ? 256 : 255;
					normal.y = normal.y * 2.0 - 1.0
						
					normal.z = color & 0xFF;
					normal.z /= (normal.z != 255) ? 256 : 255;
					normal.z = normal.z * 2.0 - 1.0
					
					normals.push(normal.x, normal.y, normal.z);
				}
			}
			
			_normalTextureLoaded = true;
			
			if(_coordinateTexturesLoaded && _texCoordTextureLoaded) 
			{
				_ready = true;
				this.dispatchEvent( new Event( Event.COMPLETE ) );
			}
		}
		
		/**
		 * 
		 */
		private function handleTexCoordComplete(e:Event) : void
		{
			var bitmap:Bitmap = Bitmap( e.target.content );
			
			var color:uint;	
			var idx:uint = 0;
			var texCoord:Vector3D = new Vector3D();
			var texCoord0:Vector3D = new Vector3D();
			var texCoord1:Vector3D = new Vector3D();
			var texCoords:Vector.<Number> = new Vector.<Number>();
			
			for(var y:uint=0; y<bitmap.height; y++)
			{
				for(var x:uint=0; x<bitmap.width; x++)
				{
					if( texCoords.length/2 == (this._vertexCount[idx]) ) {
						setTexCoords(idx, texCoords);
						idx++;
						if(idx < this._vertexCount.length){
							texCoords = new Vector.<Number>();
						} else {
							break;
						}
					}
					
					color = bitmap.bitmapData.getPixel(x,y);
					
					texCoord0.x = (color >> 16 & 0xFF) / 255.0;
					texCoord0.y = (color >> 8 & 0xFF) / 255.0;
					texCoord0.z = (color & 0xFF) / 255.0;
					
					color = bitmap.bitmapData.getPixel32(x,y);
					
					texCoord0.w = (color >> 24 & 0xFF) / 255.0;
					
					texCoord.x = (texCoord0.x * 0.996108948) + (texCoord0.z * 0.003891051);
					texCoord.y = (texCoord0.y * 0.996108948) + (texCoord0.w * 0.003891051);		
					
					//x3dom.Debug.logInfo("U: " + texCoord.x + " V: " + texCoord.y);
					
					texCoords.push(texCoord.x, texCoord.y);
				}
			}
			
			_texCoordTextureLoaded = true;
			
			if(_coordinateTexturesLoaded && _normalTextureLoaded) 
			{
				_ready = true;
				this.dispatchEvent( new Event( Event.COMPLETE ) );
			}
		}
		
	}
}