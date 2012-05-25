package x3dom
{
	import flash.errors.*;
	import flash.events.*;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.utils.ByteArray;
	import flash.utils.Endian;

	public class BinaryGeometry extends Shape
	{
		private var _indicesComplete:Boolean = false;
		private var _verticesComplete:Boolean = false;
		private var _normalsComplete:Boolean = false;
		private var _texCoordsComplete:Boolean = false;
		private var _colorsComplete:Boolean = false;
		
		private var _primType:Array = new Array();
		private var _vertexCount:Array = new Array();
		
		public function BinaryGeometry()
		{
			super();
			this._ready = false;
		}
		
		override public function setProperties(value:Object) : void {
			super.setProperties(value);
		}
		
		override public function setIndices(idx:uint, indices:Object) : void {
			if( String(indices) != "" ) {
				
				this._indicesComplete = false;
				
				var urlLoader:URLLoader = new URLLoader();
				urlLoader.addEventListener(Event.COMPLETE, indicesCompleteHandler);
				urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
				urlLoader.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
				urlLoader.dataFormat = URLLoaderDataFormat.BINARY;
				urlLoader.load (new URLRequest( String(indices) ) );
			} else {
				this._indicesComplete = true;
			}
		}
		
		override public function setVertices(idx:uint, vertices:Object) : void {
			if( String(vertices) != "" ) {
				
				this._verticesComplete = false;
				
				var urlLoader:URLLoader = new URLLoader();
				urlLoader.addEventListener(Event.COMPLETE, verticesCompleteHandler);
				urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
				urlLoader.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
				urlLoader.dataFormat = URLLoaderDataFormat.BINARY;
				urlLoader.load (new URLRequest( String(vertices) ) );
			} else {
				this._verticesComplete = true;
			}
		}
		
		override public function setNormals(idx:uint, normals:Object) : void {
			if( String(normals) != "" ) {
				
				this._normalsComplete = false;
				
				var urlLoader:URLLoader = new URLLoader();
				urlLoader.addEventListener(Event.COMPLETE, normalsCompleteHandler);
				urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
				urlLoader.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
				urlLoader.dataFormat = URLLoaderDataFormat.BINARY;
				urlLoader.load (new URLRequest( String(normals) ) );
			} else {
				this._normalsComplete = true;
			}
		}
		
		override public function setTexCoords(idx:uint, texCoords:Object) : void {
			if( String(texCoords) != "" ) {
				
				this._texCoordsComplete = false;
				
				var urlLoader:URLLoader = new URLLoader();
				urlLoader.addEventListener(Event.COMPLETE, texCoordsCompleteHandler);
				urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
				urlLoader.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
				urlLoader.dataFormat = URLLoaderDataFormat.BINARY;
				urlLoader.load (new URLRequest( String(texCoords) ) );
			} else {
				this._texCoordsComplete = true;
			}
		}
		
		override public function setColors(idx:uint, colors:Object, numComponents:uint) : void {
			if( String(colors) != "" ) {
				
				this._colorsComplete = false;
				
				var urlLoader:URLLoader = new URLLoader();
				urlLoader.addEventListener(Event.COMPLETE, colorsCompleteHandler);
				urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
				urlLoader.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
				urlLoader.dataFormat = URLLoaderDataFormat.BINARY;
				urlLoader.load (new URLRequest( String(colors) ) );
			} else {
				this._colorsComplete = true;
			}
		}
		
		private function indicesCompleteHandler(e:Event) : void {
			var byteArray:ByteArray = ByteArray(e.target.data);
			
			var indices:Vector.<uint> = new Vector.<uint>();
			
			byteArray.position = 0;
			byteArray.endian = Endian.LITTLE_ENDIAN;
			
			while(byteArray.bytesAvailable) {
				indices.push( byteArray.readUnsignedShort() );
			}
			
			super.setIndices(0, indices);
			
			this._indicesComplete = true;
			this.isReady();
		}
		
		private function verticesCompleteHandler(e:Event) : void {
			var byteArray:ByteArray = ByteArray(e.target.data);
			
			var vertices:Vector.<Number> = new Vector.<Number>();
			
			byteArray.position = 0;
			byteArray.endian = Endian.LITTLE_ENDIAN;
			
			while(byteArray.bytesAvailable) {
				vertices.push( byteArray.readFloat() );
			}
			
			super.setVertices(0, vertices);
			
			this._verticesComplete = true;
			this.isReady();
		}
		
		private function normalsCompleteHandler(e:Event) : void {
			var byteArray:ByteArray = ByteArray(e.target.data);
			
			var normals:Vector.<Number> = new Vector.<Number>();
			
			byteArray.position = 0;
			byteArray.endian = Endian.LITTLE_ENDIAN;
			
			while(byteArray.bytesAvailable) {
				normals.push( byteArray.readFloat() );
			}
			
			super.setNormals(0, normals);
			
			this._normalsComplete = true;
			this.isReady();
		}
		
		private function texCoordsCompleteHandler(e:Event) : void {
			var byteArray:ByteArray = ByteArray(e.target.data);
			
			var texCoords:Vector.<Number> = new Vector.<Number>();
			
			byteArray.position = 0;
			byteArray.endian = Endian.LITTLE_ENDIAN;
			
			while(byteArray.bytesAvailable) {
				texCoords.push( byteArray.readFloat() );
			}
			
			super.setTexCoords(0, texCoords);
			
			this._texCoordsComplete = true;
			this.isReady();
		}
		
		private function colorsCompleteHandler(e:Event) : void {
			var byteArray:ByteArray = ByteArray(e.target.data);
			
			var colors:Vector.<Number> = new Vector.<Number>();
			
			byteArray.position = 0;
			byteArray.endian = Endian.LITTLE_ENDIAN;
			
			while(byteArray.bytesAvailable) {
				colors.push( byteArray.readFloat() );
			}
			
			super.setColors(0, colors, this._numColorComponents);
			
			this._colorsComplete = true;
			this.isReady();
		}
		
		private function isReady() : void {
			if(this._indicesComplete && this._verticesComplete && this._normalsComplete &&
			   this._texCoordsComplete && this._colorsComplete) 
			{
				this._ready = true;
				this.dispatchEvent( new Event( Event.COMPLETE ) );
			}
		}
		
		private function securityErrorHandler(event:SecurityErrorEvent):void {
			trace("securityErrorHandler: " + event);
		}
		
		
		private function ioErrorHandler(event:IOErrorEvent):void {
			trace("ioErrorHandler: " + event);
		}
	}
}