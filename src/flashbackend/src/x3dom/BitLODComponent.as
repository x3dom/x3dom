package x3dom
{
	public class BitLODComponent
	{
		private var _url:String = "";
		private var _attrib:Vector.<String> = new Vector.<String>();
		private var _format:Vector.<uint> = new Vector.<uint>();
		private var _mask:Vector.<uint> = new Vector.<uint>();
		
		private var _attribShiftDec:Vector.<uint> = new Vector.<uint>();
		private var _attribShift:Vector.<uint> = new Vector.<uint>();
		
		private var _numAttribs:uint = 0;
		private var _numFormats:uint = 0;
		
		private var _bitsPerComponent:uint = 0;
		
		public function BitLODComponent(url:String, attrib:Vector.<String>, format:Vector.<uint>)
		{
			this._url = url;
			this._attrib = attrib;
			this._format = format;
			this._numAttribs = this._attrib.length;
			this._numFormats = this._format.length;
			
			for(var i:uint=0; i<this._format.length; i++) {
				this._bitsPerComponent += this._format[i];
			}
			
			this.getAttribProperties();
		}
		
		private function getAttribProperties() : void {
			for(var i:uint=0; i<this._attrib.length; i++) {
				if(this._attrib[i] == "coord3") {
					this._attribShiftDec[i] = this._format[i]/3;
				} else if(this._attrib[i] == "normal2") {
					this._attribShiftDec[i] = this._format[i]/2;
				} else if(this._attrib[i] == "normal3") {
					this._attribShiftDec[i] = this._format[i]/3;
				} else if(this._attrib[i] == "texcoord2") {
					this._attribShiftDec[i] = this._format[i]/2;
				} else if(this._attrib[i] == "texcoord3") {
					this._attribShiftDec[i] = this._format[i]/3;
				} else if(this._attrib[i] == "color3") {
					this._attribShiftDec[i] = this._format[i]/3;
				} else if(this._attrib[i] == "color4") {
					this._attribShiftDec[i] = this._format[i]/4;
				}
				
				this._attribShift[i] = this._bitsPerComponent - ((i) ? this._format[i-1] : 0);
				this._mask[i] = Math.pow(2, this._attribShiftDec[i]) - 1;
			}
		}
		
		public function get attribShift() : Vector.<uint> {
			return this._attribShift;
		}
		
		public function get attribShiftDec() : Vector.<uint> {
			return this._attribShiftDec;
		}
		
		public function get url() : String {
			return this._url;
		}
		
		public function get attrib() : Vector.<String> {
			return this._attrib;
		}
		
		public function get format() : Vector.<uint> {
			return this._format;
		}
		
		public function get mask() : Vector.<uint> {
			return this._mask;
		}
		
		public function get numAttribs() : uint {
			return this._numAttribs;
		}
		
		public function get numFormats() : uint {
			return this._numFormats;
		}
		
		public function get bitsPerComponent() : uint {
			return this._bitsPerComponent;
		}
	}
}