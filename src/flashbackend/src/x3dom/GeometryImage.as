package x3dom
{
	import flash.display.Bitmap;
	import flash.display.Loader;
	import flash.events.Event;
	import flash.geom.Vector3D;
	import flash.net.URLRequest;
	
	

	public class GeometryImage extends Shape
	{
		
		private var _coordinateTextureLoaded:Boolean;
		private var _normalTextureLoaded:Boolean;
		private var _texCoordTextureLoaded:Boolean;
		
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
			
			//Set number of Triangles
			this._numTriangles[0] = Number( value.numTriangles );
			
			generateIndices();
			
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
		private function generateIndices() : void
		{
			var indices:Vector.<uint> = new Vector.<uint>();
			
			for(var i:uint = 0; i<_numTriangles[0]*3; i++)
			{
				indices.push(i);
			}
			
			setIndices(0, indices);
		}
		
		/**
		 * 
		 */
		public function setCoordinateTexture(value:Object) : void
		{
			if(value.coordinateTexture)
			{
				_coordinateTextureLoaded = false;
				
				var coordinateLoader:Loader = new Loader();
				coordinateLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, handleCoordinateComplete);
				coordinateLoader.load(new URLRequest(value.coordinateTexture));
			}
			else
			{
				_coordinateTextureLoaded = true;
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
			x3dom.Debug.logInfo(value.texCoordTexture);
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
		private function handleCoordinateComplete(e:Event) : void
		{
			var bitmap:Bitmap = Bitmap( e.target.content );
			
			var color:uint;
			var coordinate:Vector3D = new Vector3D();
			var bias:Vector3D = _boundingBox.max.subtract(_boundingBox.min);
			var vertices:Vector.<Number> = new Vector.<Number>();
			
			for(var y:uint=0; y<bitmap.height; y++)
			{
				for(var x:uint=0; x<bitmap.width; x++)
				{
					if( (y * bitmap.width + x) >= (_numTriangles[0] * 3) ) break;
					
					color = bitmap.bitmapData.getPixel(x,y);
					
					coordinate.x = ( (color >> 16 & 0xFF) / 255.0 ) * bias.x;
					coordinate.y = ( (color >> 8 & 0xFF) / 255.0 ) * bias.y;
					coordinate.z = ( (color & 0xFF) / 255.0 ) * bias.z;
					coordinate = coordinate.add(_boundingBox.min);
					
					vertices.push(coordinate.x, coordinate.y, coordinate.z);
				}
			}
			setVertices(0, vertices);
			
			_coordinateTextureLoaded = true;
			
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
			var normal:Vector3D = new Vector3D();
			var normals:Vector.<Number> = new Vector.<Number>();
			
			for(var y:uint=0; y<bitmap.height; y++)
			{
				for(var x:uint=0; x<bitmap.width; x++)
				{
					if( (y * bitmap.width + x) >= (_numTriangles[0] * 3) ) break;
					
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
			
			setNormals(0, normals);
			
			_normalTextureLoaded = true;
			
			if(_coordinateTextureLoaded && _texCoordTextureLoaded) 
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
			var texCoord:Vector3D = new Vector3D();
			var texCoords:Vector.<Number> = new Vector.<Number>();
			
			for(var y:uint=0; y<bitmap.height; y++)
			{
				for(var x:uint=0; x<bitmap.width; x++)
				{
					if( (y * bitmap.width + x) >= (_numTriangles[0] * 3) ) break;
					
					color = bitmap.bitmapData.getPixel(x,y);
					
					texCoord.x = (color >> 16 & 0xFF) / 255.0;
					texCoord.y = (color >> 8 & 0xFF) / 255.0;
					
					texCoords.push(texCoord.x, texCoord.y);
				}
			}
			
			setTexCoords(0, texCoords);
			
			_texCoordTextureLoaded = true;
			
			if(_coordinateTextureLoaded && _normalTextureLoaded) 
			{
				_ready = true;
				this.dispatchEvent( new Event( Event.COMPLETE ) );
			}
		}
		
	}
}