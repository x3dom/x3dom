package x3dom
{
	import flash.errors.*;
	import flash.events.*;
	import flash.geom.Vector3D;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.utils.ByteArray;
	import flash.utils.Endian;
	
	public class BitLODGeometry extends Shape
	{
		
		private var _indicesComplete:Boolean = false;
		private var _verticesComplete:Boolean = false;
		
		private var _actComponent:int = -1;
		private var _component:Vector.<BitLODComponent> = new Vector.<BitLODComponent>();
		
		private var _bitsPerVertex:uint = 0;
		private var _bitsPerNormal:uint = 0;
		private var _bitsPerTexCoord:uint = 0;
		private var _bitsPerColor:uint = 0;
		
		private var _bbBbias:Vector3D;
		
		private var _lastVertices:Vector.<Number> = new Vector.<Number>();
		private var _lastNormals:Vector.<Number> = new Vector.<Number>();
		private var _lastTexCoords:Vector.<Number> = new Vector.<Number>();
		private var _lastColors:Vector.<Number> = new Vector.<Number>();
		
		private var _componentsPerVertex:uint = 0;
		private var _componentsPerNormal:uint = 0;
		private var _componentsPerTexCoord:uint = 0;
		private var _componentsPerColor:uint = 0;
		
		private var _vertexShift:uint = 0;
		private var _normalShift:uint = 0;
		private var _texCoordShift:uint = 0;
		private var _colorShift:uint = 0;	
		
		private var _vertexShiftDec:uint = 0;
		private var _normalShiftDec:uint = 0;
		private var _texCoordShiftDec:uint = 0;	
		private var _colorShiftDec:uint = 0;
		
		private var _primType:Array = new Array();
		private var _vertexCount:Array = new Array();
		
				
		/**
		 * 
		 */
		public function BitLODGeometry()
		{
			super();
			this._ready = false;
		}
		
		/**
		 * 
		 */
		override public function setProperties(value:Object) : void
		{		
			//Set primtype
			this._primType = value.primType;
			
			//Set vertexcount
			this._vertexCount = value.vertexCount;
			
			//Set boundingbox center
			this._boundingBox.center.setTo(value.bboxCenter[0], value.bboxCenter[1], value.bboxCenter[2]);
			
			//Set boundingbox min
			this._boundingBox.min.setTo(value.bboxMin[0], value.bboxMin[1], value.bboxMin[2]);		
			
			//Set boundingBox max
			this._boundingBox.max.setTo(value.bboxMax[0], value.bboxMax[1], value.bboxMax[2]);
			
			//Set parent properties
			super.setProperties(value);
		}
		
		public function setComponents(value:Object) : void 
		{
			//Calculate boundingBox bias
			this._bbBbias = this._boundingBox.max.subtract(_boundingBox.min);
			
			//Set components URLs
			for(var i:uint=0; i<value.componentURLs.length; i++) {
				this._component.push( new BitLODComponent( value.componentURLs[i],
					Vector.<String>(value.componentAttribs[i]),
					Vector.<uint>(value.componentFormats[i]) ) );
			}
			
			//Get bits per attrib
			this.getBitsPerAttrib();
			
			this.loadNextComponent();
		}
		
	
		/**
		 * 
		 */
		private function getBitsPerAttrib() : void
		{					
			for(var i:uint=0; i<this._component.length; i++) {
				for(var j:uint=0; j<this._component[i].numAttribs; j++) {
					if(this._component[i].attrib[j] == "coord3") {
						this._bitsPerVertex += (this._component[i].format[j] / 3);
						this._componentsPerVertex++;
					} else if(this._component[i].attrib[j] == "normal2") {
						this._bitsPerNormal += (this._component[i].format[j] / 2);
						this._componentsPerNormal++;
					} else if(this._component[i].attrib[j] == "normal3") {
						this._bitsPerNormal += (this._component[i].format[j] / 3);
						this._componentsPerNormal++;
					} else if(this._component[i].attrib[j] == "texcoord2") {
						this._bitsPerTexCoord += (this._component[i].format[j] / 2);
						this._componentsPerTexCoord++;
					} else if(this._component[i].attrib[j] == "texcoord3") {
						this._bitsPerTexCoord += (this._component[i].format[j] / 3);
						this._componentsPerTexCoord++;
					} else if(this._component[i].attrib[j] == "color3") {
						this._bitsPerColor += (this._component[i].format[j] / 3);
						this._componentsPerColor++;
					} else if(this._component[i].attrib[j] == "color4") {
						this._bitsPerColor += (this._component[i].format[j] / 4);
						this._componentsPerColor++;
					}
				}
			}
			
			//Calculate attribute left shift decrement value
			this._vertexShiftDec	= this._bitsPerVertex   / this._componentsPerVertex;
			this._normalShiftDec 	= this._bitsPerNormal   / this._componentsPerNormal;
			this._texCoordShiftDec	= this._bitsPerTexCoord / this._componentsPerTexCoord;
			this._colorShiftDec = this._bitsPerColor    / this._componentsPerColor;
			
			//Set attribute left shift value
			this._vertexShift		= this._bitsPerVertex   - this._vertexShiftDec;
			this._normalShift		= this._bitsPerNormal   - this._normalShiftDec;
			this._texCoordShift		= this._bitsPerTexCoord - this._texCoordShiftDec;
			this._colorShift	= this._bitsPerColor    - this._colorShiftDec;
			
			//Set attribute types
			this._vertexType	= this.getAttribType(this._bitsPerVertex);
			this._normalType	= this.getAttribType(this._bitsPerNormal);
			this._texCoordType	= this.getAttribType(this._bitsPerTexCoord);
			this._colorType		= this.getAttribType(this._bitsPerColor);
		}
		
		/**
		 * 
		 */
		private function getAttribType(bits:uint) : String
		{					
			switch(bits) {
				case 8:
					return "Uint8";
				case 16:
					return "Uint16";
				case 32:
					return "Uint32";
				default:
					return "Uint16";
			}
		}
		
		/**
		 * 
		 */
		override public function setIndices(idx:uint, indices:Object, calcNumTris:Boolean = true) : void 
		{			
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
		
		/**
		 * 
		 */
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
		
		/**
		 * 
		 */
		public function loadNextComponent() : void {
			this._actComponent++;
			if(this._actComponent < this._component.length) {
				var urlLoader:URLLoader = new URLLoader();
				urlLoader.addEventListener(Event.COMPLETE, componentCompleteHandler);
				urlLoader.dataFormat = URLLoaderDataFormat.BINARY;
				urlLoader.load (new URLRequest( this._component[this._actComponent].url ) );
			}
		}
		
		
		/**
		 * 
		 */
		private function componentCompleteHandler(e:Event) : void {
			
			//Cast target data to ByteArray
			var byteArray:ByteArray = ByteArray(e.target.data);
			
			//Set ByteArray position to 0
			byteArray.position = 0;
			
			//Set ByteArray endian type to little endian
			byteArray.endian = Endian.LITTLE_ENDIAN;
			
			var data:Number, theta:Number, phi:Number;
			
			var attribShift:uint;
			var attribShiftDec:uint;
			
			var vertCnt:uint = 0;
			var vertex:Vector3D = new Vector3D();
			var vertices:Vector.<Number> = new Vector.<Number>();
			var normalizedVertices:Vector.<Number> = new Vector.<Number>();
			
			var normCnt:uint = 0;
			var normal:Vector3D = new Vector3D();
			var normals:Vector.<Number> = new Vector.<Number>();
			var normalizedNormals:Vector.<Number> = new Vector.<Number>();
			
			var texCCnt:uint = 0;
			var texCoord:Vector3D = new Vector3D();
			var texCoords:Vector.<Number> = new Vector.<Number>();
			var normalizedTexCoords:Vector.<Number> = new Vector.<Number>();
			
			var colCnt:uint = 0;
			var color:Vector3D = new Vector3D();
			var colors:Vector.<Number> = new Vector.<Number>();
			var normalizedColors:Vector.<Number> = new Vector.<Number>();
			
			//Get act component
			var component:BitLODComponent = this._component[this._actComponent];
			
			while(byteArray.bytesAvailable) {
				
				//Read data from ByteArray
				switch(component.bitsPerComponent) 
				{
					case 8:
						data = byteArray.readUnsignedByte();
						break;
					case 16:
						data = byteArray.readUnsignedShort();
						break;
					case 32:
						data = byteArray.readUnsignedInt();
						break;
				}
				
				for(var i:uint=0; i<component.attrib.length; i++)
				{
					attribShift = component.attribShift[i];
					attribShiftDec = component.attribShiftDec[i];
					
					if(component.attrib[i] == "coord3")
					{
						//Get Vertex x, y and z
						vertex.x = ((data >> (attribShift-=attribShiftDec) & component.mask[i]) << this._vertexShift);
						vertex.y = ((data >> (attribShift-=attribShiftDec) & component.mask[i]) << this._vertexShift);
						vertex.z = ((data >> (attribShift-=attribShiftDec) & component.mask[i]) << this._vertexShift);
						
						
						if(this._lastVertices.length) {
							vertex.x |= this._lastVertices[vertCnt++];
							vertex.y |= this._lastVertices[vertCnt++];
							vertex.z |= this._lastVertices[vertCnt++];
						}
						
						vertices.push(vertex.x, vertex.y, vertex.z);
						
						//----------------------->Bring it to Shader
						//Normalize vertex
						vertex.x /= Utils.getPrecisionMax(this._vertexType);
						vertex.y /= Utils.getPrecisionMax(this._vertexType);
						vertex.z /= Utils.getPrecisionMax(this._vertexType);
						
						//Calculate real vertex position
						vertex.x = (vertex.x * this._bbBbias.x) + this._boundingBox.min.x;
						vertex.y = (vertex.y * this._bbBbias.y) + this._boundingBox.min.y;
						vertex.z = (vertex.z * this._bbBbias.z) + this._boundingBox.min.z;
						//-----------------------
						
						normalizedVertices.push(vertex.x, vertex.y, vertex.z);	
					}
					else if(component.attrib[i] == "normal2")
					{
						//Get Normals
						theta = (data >> (attribShift-=attribShiftDec) & component.mask[i]) << this._normalShift;
						phi   = (data >> (attribShift-=attribShiftDec) & component.mask[i]) << this._normalShift;
						
						if(this._lastNormals.length) {
							theta |= this._lastNormals[normCnt++];
							phi   |= this._lastNormals[normCnt++];
						}
						
						normals.push(theta, phi);
						
						//----------------------->Bring it to Shader
						theta /= Utils.getPrecisionMax(this._normalType);
						phi   /= Utils.getPrecisionMax(this._normalType);
						
						theta = theta * Math.PI;
						phi   = phi * Math.PI * 2.0 - Math.PI;
						
						normal.x = Math.sin(theta) * Math.cos(phi);
						normal.y = Math.sin(theta) * Math.sin(phi);
						normal.z = Math.cos(theta);
						//----------------------->
						
						normalizedNormals.push(normal.x, normal.y, normal.z);
					}
					else if(component.attrib[i] == "texcoord2")
					{
						//Get Vertex x, y and z
						texCoord.x = ((data >> (attribShift-=attribShiftDec) & component.mask[i]) << this._texCoordShift);
						texCoord.y = ((data >> (attribShift-=attribShiftDec) & component.mask[i]) << this._texCoordShift);						
						
						if(this._lastTexCoords.length) {
							texCoord.x |= this._lastTexCoords[texCCnt++];
							texCoord.y |= this._lastTexCoords[texCCnt++];
						}
						
						texCoords.push(texCoord.x, texCoord.y);
						
						//Normalize colors
						texCoord.x /= Utils.getPrecisionMax(this._texCoordType);
						texCoord.y /= Utils.getPrecisionMax(this._texCoordType);
						
						normalizedTexCoords.push(texCoord.x, texCoord.y);

					}
					else if(component.attrib[i] == "texcoord3")
					{
						
					}
					else if(component.attrib[i] == "color3")
					{
						
					}
					else if(component.attrib[i] == "color4")
					{
						//Get Vertex x, y and z
						color.x = ((data >> (attribShift-=attribShiftDec) & component.mask[i]) << this._colorShift);
						color.y = ((data >> (attribShift-=attribShiftDec) & component.mask[i]) << this._colorShift);
						color.z = ((data >> (attribShift-=attribShiftDec) & component.mask[i]) << this._colorShift);
						color.w = ((data >> (attribShift-=attribShiftDec) & component.mask[i]) << this._colorShift);
						
						if(this._lastColors.length) {
							color.x |= this._lastColors[colCnt++];
							color.y |= this._lastColors[colCnt++];
							color.z |= this._lastColors[colCnt++];
							color.w |= this._lastColors[colCnt++];
						}
						
						colors.push(color.x, color.y, color.z, color.w);
						
						//Normalize colors
						color.x /= Utils.getPrecisionMax(this._colorType);
						color.y /= Utils.getPrecisionMax(this._colorType);
						color.z /= Utils.getPrecisionMax(this._colorType);
						color.w /= Utils.getPrecisionMax(this._colorType);
						
						normalizedColors.push(color.x, color.y, color.z, color.w);
					}			
				}
			}
			
			//If new vertices avaible
			if(vertices.length) {
				//Set last vertices
				this._lastVertices = vertices;
				//Decrement vertex shift
				this._vertexShift -= this._vertexShiftDec;
				//Set vertices
				this.setVertices(0, normalizedVertices);
				//Set vertices complete
				this._verticesComplete = true;
			}
			
			//If new normals avaible
			if(normals.length) {
				//Set last normals
				this._lastNormals = normals;
				//Decrement normal shift
				this._normalShift -= this._normalShiftDec;
				//Set normals
				this.setNormals(0, normalizedNormals);
			}
			
			//If new texcoords avaible
			if(texCoords.length) {
				//Set last normals
				this._lastTexCoords = texCoords;
				//Decrement normal shift
				this._texCoordShift -= this._texCoordShiftDec;
				//Set normals
				this.setTexCoords(0, normalizedTexCoords);
			}
			
			//If new texcoords avaible
			if(colors.length) {
				//Set last normals
				this._lastColors = colors;
				//Decrement normal shift
				this._colorShift -= this._colorShiftDec;
				//Set normals
				this.setColors(0, normalizedColors, 4);
			}
			
			
			//Check if shape is ready to render
			this.isReady();
			
			//Load next Component
			this.loadNextComponent();
		}
		
		/**
		 * 
		 */
		private function isReady() : void {
			if(this._indicesComplete && this._verticesComplete) {
				this._ready = true;
				this.dispatchEvent( new Event( Event.RENDER ) );
			}
		}
	}
}