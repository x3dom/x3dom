/* 
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008 Saqoosha
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this framework; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 * 
 * For further information please contact.
 *	http://www.libspark.org/wiki/saqoosha/FLARToolKit
 *	<saq(at)saqoosha.net>
 * 
 */

package org.libspark.flartoolkit.core.labeling {
	import org.libspark.flartoolkit.utils.NyObjectStack;					

	/**
	 * NyLabelの予約型動的配列
	 * 
	 */
	public class FLARLabelingLabelStack extends NyObjectStack {

		/**
		 * @param i_label_array	FLARLabelingLabel[]
		 */
		//	protected function FLARLabelingLabelStack(i_label_array:Array)
		//	{
		//		super(i_label_array);		
		//	}
		public function FLARLabelingLabelStack(i_max_array_size:int) {
			super(FLARLabelingLabel, i_max_array_size);
		}

		/**
		 * @param i_start
		 * @param i_end
		 * @param i_buffer	Object[]
		 */
//		protected override function onReservRequest(i_start:int, i_end:int, i_buffer:Array):void {
//			for (var i:int = i_start; i < i_end; i++) {
//				i_buffer[i] = new FLARLabelingLabel();
//			}
//		}

		/**
		 * エリアの大きい順にラベルをソートします。
		 */
		public function sortByArea():void {
			var len:int = this._length;
			var h:int = len * 13 / 10;
			var item:Array = this._items; // FLARLabelingLabel[]
			
			var swaps:int;
			var temp:FLARLabelingLabel;
			for(;;) {
				swaps = 0;
				for (var i:int = 0;i + h < len; i++) {
					if (item[i + h].area > item[i].area) {
						temp = item[i + h];
						item[i + h] = item[i];
						item[i] = temp;
						swaps++;
					}
				}
				if (h == 1) {
					if (swaps == 0) {
						break;
					}
				}else {
					h = h * 10 / 13;
				}
			}		
		} 
	}
}