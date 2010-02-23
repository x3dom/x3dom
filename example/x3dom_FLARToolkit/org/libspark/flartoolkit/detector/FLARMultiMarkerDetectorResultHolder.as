package org.libspark.flartoolkit.detector 
{
	
	internal class FLARMultiMarkerDetectorResultHolder {

		public var result_array:Array = new Array(1); //new FLARMultiMarkerDetectorResult[1]; // FLARMultiMarkerDetectorResult[]

		/**
		 * result_holderを最大i_reserve_size個の要素を格納できるように予約します。
		 * 
		 * @param i_reserve_size
		 */
		public function reservHolder(i_reserve_size:int):void {
			if (i_reserve_size >= result_array.length) {
				var new_size:int = i_reserve_size + 5;
				result_array = new Array(new_size); //new FLARMultiMarkerDetectorResult[new_size];
				for (var i:int = 0; i < new_size; i++) {
					result_array[i] = new FLARMultiMarkerDetectorResult();
				}
			}
		}
	}
	
}