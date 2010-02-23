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

package org.libspark.flartoolkit.core.match {
	import org.libspark.flartoolkit.utils.ArrayUtil;	
	import org.libspark.flartoolkit.core.FLARCode;
	import org.libspark.flartoolkit.core.pickup.IFLARColorPatt;	

	/**
	 * AR_TEMPLATE_MATCHING_COLORかつAR_MATCHING_WITHOUT_PCAと同等のルールで マーカーを評価します。
	 * 
	 */
	public class FLARMatchPatt_Color_WITHOUT_PCA implements IFLARMatchPatt {

		//	private int[][][] input = new int[1][1][3];
		private var input:Array = ArrayUtil.createJaggedArray(1, 1, 3);

		private var datapow:Number;

		private var width:int = 1;

		private var height:int = 1;

		private var cf:Number = 0;

		private var dir:int = 0;

		public function getConfidence():Number {
			return cf;
		}

		public function getDirection():int {
			return dir;
		}

		/**
		 * input配列サイズを必要に応じて再アロケートする。
		 * 
		 * @param i_width
		 * @param i_height
		 */
		private function reallocInputArray(i_width:int, i_height:int):void {
			if (this.input.length < i_height || this.input[0].length < i_width) {
				// 配列が十分なサイズでなければ取り直す
				this.input = ArrayUtil.createJaggedArray(i_height, i_width, 3);//new int[i_height][i_width][3];
			}
			this.height = i_height;
			this.width = i_width;
		}

		public function setPatt(i_target_patt:IFLARColorPatt):Boolean {
			var i:int;
			var k:int;
			var data:Array; // int[][][]
			var linput:Array; // int[][][]

			// input配列のサイズとwhも更新// input=new int[height][width][3];
			reallocInputArray(i_target_patt.getWidth(), i_target_patt.getHeight());
			var lwidth:int = this.width;
			var lheight:int = this.height;
			linput = this.input;
			data = i_target_patt.getPatArray();

			var sum:int = 0;
			var l_ave:int = 0;
			var w_sum:int;
			var data_i:Array; // int[][]
			var input_i:Array; // int[][]
			var data_i_k:Array; // int[]
			var input_i_k:Array; // int[]
			for (i = lheight - 1;i >= 0; i--) {
				// <Optimize/>for(int i=0;i<height;i++) {
				//for(int i=0;i<Config.AR_PATT_SIZE_Y;i++){
				data_i = data[i];
				for (k = lwidth - 1;k >= 0; k--) {
					// <Optimize/>for(int
					// i2=0;i2<Config.AR_PATT_SIZE_X;i2++){
					// <Optimize/>l_ave +=(255-data[i][i2][0])+(255-data[i][i2][1])+(255-data[i][i2][2]);
					data_i_k = data_i[k];
					l_ave += 255 * 3 - data_i_k[0] - data_i_k[1] - data_i_k[2];
				}
			}
			l_ave /= (lheight * lwidth * 3);
			for (i = lheight - 1;i >= 0; i--) {
				// for(i=0;i<height;i++){//for(int i=0;i<Config.AR_PATT_SIZE_Y;i++){
				input_i = linput[i];
				data_i = data[i];
				for (k = lwidth - 1;k >= 0; k--) {
					// for(i2=0;i2<width;i2++){//for(int i2=0;i2<Config.AR_PATT_SIZE_X;i2++){
					// <Optimize>
					// for(int i3=0;i3<3;i3++){
					// input[i][i2][i3] = (255-data[i][i2][i3]) - l_ave;
					// sum += input[i][i2][i3]*input[i][i2][i3];
					// }
					data_i_k = data_i[k];
					input_i_k = input_i[k];
					w_sum = (255 - data_i_k[0]) - l_ave;
					input_i_k[0] = w_sum;
					sum += w_sum * w_sum;

					w_sum = (255 - data_i_k[1]) - l_ave;
					input_i_k[1] = w_sum;
					sum += w_sum * w_sum;

					w_sum = (255 - data_i_k[2]) - l_ave;
					input_i_k[2] = w_sum;
					sum += w_sum * w_sum;
				// </Optimize>
				}
			}
			datapow = Math.sqrt(sum);
			if (datapow == 0.0) {
				return false;// throw new FLARException();
			// dir.set(0);//*dir = 0;
			// cf.set(-1.0);//*cf = -1.0;
			// return -1;
			}
			return true;
		}

		/**
		 * public int pattern_match(short[][][] data,IntPointer dir,DoublePointer
		 * cf)
		 * 
		 */
		public function evaluate(i_code:FLARCode):void {
			var pat:Array = i_code.getPat(); // int[][][][]
			var patpow:Array = i_code.getPatPow(); // double[]
			var res:int = -1;
			var max:Number = 0.0;
			var pat_j:Array; // int[][][]
			var linput:Array; // int[][][]
			var pat_j_i:Array; // int[][]
			var input_i:Array; // int[][]
			var pat_j_i_k:Array; // int[]
			var input_i_k:Array; // int[]
			var l_width:int = this.width;
			var l_height:int = this.height;
			linput = this.input;
			
			var sum:int;
			var i:int;
			var k:int;
			var sum2:Number;
			
			// run a comparison for each rotation (up, left, down, right)
			// the rotation with the closest match is stored as .direction; the confidence stored as .cf
			for (var j:int = 0;j < 4; j++) {
				sum = 0;
				pat_j = pat[j];
				
				// compare detected pattern against this pattern via this algorithm:
				//		for each pattern pixel:
				//			multiply each channel of the detected pattern with each channel of this pattern
				//			sum those products
				//		sum those values for each pattern pixel
				//		divide the sum by ...
				for (i = l_height - 1;i >= 0; i--) {
					// for(int i=0;i<Config.AR_PATT_SIZE_Y;i++){
					input_i = linput[i];
					pat_j_i = pat_j[i];
					for (k = l_width - 1;k >= 0; k--) {
						pat_j_i_k = pat_j_i[k];
						input_i_k = input_i[k];
						// for(int i3=0;i3<3;i3++){
						sum += input_i_k[0] * pat_j_i_k[0];
						// sum +=input[i][i2][i3]*pat[k][j][i][i2][i3];
						sum += input_i_k[1] * pat_j_i_k[1];
						// sum +=input[i][i2][i3]*pat[k][j][i][i2][i3];
						sum += input_i_k[2] * pat_j_i_k[2];// sum +=input[i][i2][i3]*pat[k][j][i][i2][i3];
					// }
					}
				}
				sum2 = sum / patpow[j] / datapow;
				// sum2 = sum / patpow[k][j]/ datapow;
				if (sum2 > max) {
					max = sum2;
					res = j;
				}
			}
			dir = res;
			cf = max;
		}
	}
}