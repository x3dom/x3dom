package org.libspark.flartoolkit.detector 
{
	import org.libspark.flartoolkit.core.FLARSquare;
	
	/**
	 * ...
	 * @author 太郎(tarotaro.org)
	 */
	public class FLARMultiMarkerDetectorResult {

		internal var _codeId:int;
		internal var _direction:int;
		internal var _confidence:Number;
		internal var _square:FLARSquare;
		
		public function FLARMultiMarkerDetectorResult(id:int = 0, 
														direction:int = 0, 
														confidence:Number = NaN, 
														square:FLARSquare = null)
		{
			this._codeId = id;
			this._direction = direction;
			this._confidence = confidence;
			this._square = square;
		}
		
		public function get codeId():int { return _codeId; }
		public function get direction():int { return _direction; }
		public function get confidence():Number { return _confidence; }
		public function get square():FLARSquare { return _square; }
	}
	
}