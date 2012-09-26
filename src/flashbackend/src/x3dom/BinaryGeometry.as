package x3dom
{
	import flash.errors.*;
	import flash.events.*;
	import flash.external.ExternalInterface;
	import flash.geom.Vector3D;
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
		
		private var _vertexStrideOffset:Array;
		private var _normalStrideOffset:Array;
		private var _texCoordStrideOffset:Array;
		private var _colorStrideOffset:Array;
		
		private var _bgCenter:Vector3D;
		private var _bgSize:Vector3D;
		
		private var _primType:Array = new Array();
		private var _vertexCount:Array = new Array();
		
		public function BinaryGeometry()
		{
			super();
			this._ready = false;
		}
		
		override public function setProperties(value:Object) : void {
			//Set primtype
			this._primType = value.primType;
			
			//Set vertexcount
			this._vertexCount = value.vertexCount;
			
			this._bgCenter = new Vector3D(value.bgCenter[0], value.bgCenter[1], value.bgCenter[2]);
			this._bgSize   = new Vector3D(value.bgSize[0], value.bgSize[1], value.bgSize[2]);
			
			super.setProperties(value);
		}
		
		/**
		 * 
		 */
		override public function setIndices(idx:uint, indices:Object, calcNumTris:Boolean = true) : void {
			
			if( String(indices) != "") {
				
				this._indicesComplete = false;
				
				var urlLoader:URLLoader = new URLLoader();
				urlLoader.addEventListener(Event.COMPLETE, indicesCompleteHandler);
				urlLoader.dataFormat = URLLoaderDataFormat.BINARY;
				urlLoader.load (new URLRequest( String(indices) ) );
			} else {
				var startIdx:uint = 0;
				var indices_tmp:Vector.<uint> = new Vector.<uint>();
				
				this._numTriangles[0] = 0;
				
				for(var p:uint=0; p<this._primType.length; p++) {
					if(this._primType[p] == "TRIANGLES") {
						this._numTriangles[0] += this._vertexCount[p] / 3;
						for(var i:uint=startIdx; i<startIdx+this._vertexCount[p]; i++) {
							indices_tmp.push(i);
						}
					} 
					else if(this._primType[p] == "TRIANGLESTRIP") {
						this._numTriangles[0] += this._vertexCount[p] - 2;
						for(var j:uint=startIdx; j<startIdx+this._vertexCount[p]-2; j++) {
							(j & 1) ? indices_tmp.push(j, j+2, j+1) : indices_tmp.push(j, j+1, j+2);
						}
					}
					startIdx += this._vertexCount[p];
				}	
				super.setIndices(0, indices_tmp, false);
				this._indicesComplete = true;
			}
		}
		
		override public function setVertices(idx:uint, value:Object) : void {	
			if( String(value.vertices) != "" ) 
			{
				var urlLoader:URLLoader = new URLLoader();

				this._verticesComplete	= Boolean(value.vertices == "");
				this._normalsComplete	= Boolean(value.normals == "");
				this._texCoordsComplete = Boolean(value.texCoords == "");
				this._colorsComplete	= Boolean(value.colors == "");
				
				this._vertexType	= value.vertexType;
				this._normalType	= value.normalType;
				this._texCoordType	= value.texCoordType;
				this._colorType		= value.colorType;
				
				this._vertexStrideOffset	= value.vertexStrideOffset;
				this._normalStrideOffset	= value.normalStrideOffset;
				this._texCoordStrideOffset	= value.texCoordStrideOffset;
				this._colorStrideOffset		= value.colorStrideOffset;
				
				this._numColorComponents	= value.numColorComponents;
				this._numNormalComponents   = value.numNormalComponents;
				
				if(value.interleaved) {
					urlLoader.addEventListener(Event.COMPLETE, interleavedCompleteHandler);
				} else {
					urlLoader.addEventListener(Event.COMPLETE, verticesCompleteHandler);
				}
				urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
				urlLoader.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
				urlLoader.dataFormat = URLLoaderDataFormat.BINARY;
				urlLoader.load (new URLRequest( String(value.vertices) ) );
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
			
			var generateIndices:Boolean = false;
			
			//If there is a TriangleStrip, we must create our own indices
			for(var t:uint=0; t<this._primType.length; t++){
				if(this._primType[t] == "TRIANGLESTRIP") {
					generateIndices = true;
					break;
				}
			}
			
			if(generateIndices) {
				//Copy indices to a temp vector
				var indices_tmp:Vector.<uint> = indices.concat();
				
				//Clear indices vector
				indices.length = 0;
				
				var startIdx:uint = 0;
				this._numTriangles[0] = 0;
				for(var p:uint=0; p<this._primType.length; p++)
				{
					if(this._primType[p] == "TRIANGLES") {
						this._numTriangles[0] += this._vertexCount[p] / 3;
						for(var i:uint=startIdx; i<startIdx+this._vertexCount[p]; i++) {
							indices.push(indices_tmp[i]);
						}
					} else if(this._primType[p] == "TRIANGLESTRIP") {
						this._numTriangles[0] += this._vertexCount[p] - 2;
						for(var j:uint=startIdx; j<startIdx+this._vertexCount[p]-2; j++) {
							(j & 1) ? indices.push(indices_tmp[j], indices_tmp[j+2], indices_tmp[j+1]) : 
								indices.push(indices_tmp[j], indices_tmp[j+1], indices_tmp[j+2]);
						}
					}
					startIdx += this._vertexCount[p];
				}	
			}
			
			super.setIndices(0, indices, !generateIndices);
			
			this._indicesComplete = true;
			this.isReady();
		}
		
		private function verticesCompleteHandler(e:Event) : void {
			var byteArray:ByteArray = ByteArray(e.target.data);
			
			var vertex:Vector3D = new Vector3D();
			var vertices:Vector.<Number> = new Vector.<Number>();
			
			byteArray.position = 0;
			byteArray.endian = Endian.LITTLE_ENDIAN;
			
			while(byteArray.bytesAvailable) {
				vertex.x = Utils.readType(byteArray, this._vertexType, true);
				vertex.y = Utils.readType(byteArray, this._vertexType, true);
				vertex.z = Utils.readType(byteArray, this._vertexType, true);
				
				if(this._vertexType != "Float32") {
					vertex.x = this._bgCenter.x + this._bgSize.x * vertex.x;
					vertex.y = this._bgCenter.y + this._bgSize.y * vertex.y;
					vertex.z = this._bgCenter.z + this._bgSize.z * vertex.z;
				}
				
				vertices.push( vertex.x, vertex.y, vertex.z );
			}
			
			super.setVertices(0, vertices);
			
			if( (this._vertexType == "Float32") && (this._bgSize.x == 1 || this._bgSize.y == 1 || this._bgSize.z == 1) ) {				
				ExternalInterface.call("x3dom.bridge.setBBox", this._id, this._boundingBox.center, this.boundingBox.size);
			}
			
			this._verticesComplete = true;
			this.isReady();
		}
		
		private function normalsCompleteHandler(e:Event) : void {
			var byteArray:ByteArray = ByteArray(e.target.data);
			
			var phi:Number = 0;
			var theta:Number = 0;
			var value:Vector3D = new Vector3D();
			var normals:Vector.<Number> = new Vector.<Number>();
			
			byteArray.position = 0;
			byteArray.endian = Endian.LITTLE_ENDIAN;
			
			while(byteArray.bytesAvailable) {
				if(this._numNormalComponents == 3)
				{
					normals.push( Utils.readType(byteArray, this._normalType, true) );
				}
				else if(this._numNormalComponents == 2)
				{
					theta = Utils.readType(byteArray, this._normalType, true);
					phi   = Utils.readType(byteArray, this._normalType, true);
					
					theta = theta * Math.PI;
					phi   = phi * Math.PI * 2.0 - Math.PI;
					
					value.x = Math.sin(theta) * Math.cos(phi);
					value.y = Math.sin(theta) * Math.sin(phi);
					value.z = Math.cos(theta);
					normals.push(value.x, value.y, value.z);
				}
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
				texCoords.push( Utils.readType(byteArray, this._texCoordType, true) );
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
				colors.push( Utils.readType(byteArray, this._colorType, true) );
			}
			
			super.setColors(0, colors, this._numColorComponents);
			
			this._colorsComplete = true;
			this.isReady();
		}
		
		private function interleavedCompleteHandler(e:Event) : void {
			var byteArray:ByteArray = ByteArray(e.target.data);
			
			var position:Number = 0;
			var phi:Number = 0;
			var theta:Number = 0;
			var value:Vector3D = new Vector3D();
			
			var vertices:Vector.<Number>	= new Vector.<Number>();
			var normals:Vector.<Number>		= new Vector.<Number>();
			var texCoords:Vector.<Number>	= new Vector.<Number>();
			var colors:Vector.<Number>		= new Vector.<Number>();
			
			byteArray.position = 0;
			byteArray.endian = Endian.LITTLE_ENDIAN;
			
			if(!this._verticesComplete) {
				byteArray.position = position = this._vertexStrideOffset[1];
				while(byteArray.bytesAvailable) {
					value.x = Utils.readType(byteArray, this._vertexType, true);
					value.y = Utils.readType(byteArray, this._vertexType, true);
					value.z = Utils.readType(byteArray, this._vertexType, true);
					
					if(this._vertexType != "Float32") {
						value.x = this._bgCenter.x + this._bgSize.x * value.x;
						value.y = this._bgCenter.y + this._bgSize.y * value.y;
						value.z = this._bgCenter.z + this._bgSize.z * value.z;
					}
					
					vertices.push(value.x, value.y, value.z);
					position += this._vertexStrideOffset[0]
					byteArray.position = position;
				}
				super.setVertices(0, vertices);
				this._verticesComplete = true;
			}
			
			if(!this._normalsComplete) {
				byteArray.position = position = this._normalStrideOffset[1];
				while(byteArray.bytesAvailable) {
					if(this._numNormalComponents == 3)
					{
						value.x = Utils.readType(byteArray, this._normalType, true);
						value.y = Utils.readType(byteArray, this._normalType, true);
						value.z = Utils.readType(byteArray, this._normalType, true);
						normals.push(value.x, value.y, value.z);
						position += this._normalStrideOffset[0];
						byteArray.position = position;
					} 
					else if(this._numNormalComponents == 2)
					{
						theta = Utils.readType(byteArray, this._normalType, true);
						phi   = Utils.readType(byteArray, this._normalType, true);
						
						theta = theta * Math.PI;
						phi   = phi * Math.PI * 2.0 - Math.PI;
						
						value.x = Math.sin(theta) * Math.cos(phi);
						value.y = Math.sin(theta) * Math.sin(phi);
						value.z = Math.cos(theta);
						normals.push(value.x, value.y, value.z);
						position += this._normalStrideOffset[0];
						byteArray.position = position;
					}
				}
				super.setNormals(0, normals);
				this._normalsComplete = true;
			}
			
			if(!this._texCoordsComplete) {
				byteArray.position = position = this._texCoordStrideOffset[1];
				while(byteArray.bytesAvailable) {
					value.x = Utils.readType(byteArray, this._texCoordType, true);
					value.y = Utils.readType(byteArray, this._texCoordType, true);
					value.z = Utils.readType(byteArray, this._texCoordType, true);
					texCoords.push(value.x, value.y);
					position += this._texCoordStrideOffset[0];
					byteArray.position = position;
				}
				super.setTexCoords(0, texCoords);
				this._texCoordsComplete = true;
			}
			
			if(!this._colorsComplete) {
				byteArray.position = position = this._colorStrideOffset[1];
				while(byteArray.bytesAvailable) {
					value.x = Utils.readType(byteArray, this._colorType, true);
					value.y = Utils.readType(byteArray, this._colorType, true);
					value.z = Utils.readType(byteArray, this._colorType, true);
					if(this.numColorComponents == 3) {
						colors.push(value.x, value.y, value.z);
					} else {
						value.w = Utils.readType(byteArray, this._colorType, true);
						colors.push(value.x, value.y, value.z, value.w);
					}
					position += this._colorStrideOffset[0];
					byteArray.position = position;
				}
				super.setColors(0, colors, this.numColorComponents);
				this._colorsComplete = true;
			}
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