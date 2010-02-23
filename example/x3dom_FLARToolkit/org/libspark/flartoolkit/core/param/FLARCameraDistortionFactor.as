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

package org.libspark.flartoolkit.core.param {
	import org.libspark.flartoolkit.core.types.FLARDoublePoint2d;
	import org.libspark.flartoolkit.utils.DoubleValue;	

	/**
	 * カメラの歪み成分を格納するクラスと、補正関数群
	 * http://www.hitl.washington.edu/artoolkit/Papers/ART02-Tutorial.pdf
	 * 11ページを読むといいよ。
	 * 
	 * x=x(xi-x0),y=s(yi-y0)
	 * d^2=x^2+y^2
	 * p=(1-fd^2)
	 * xd=px+x0,yd=py+y0
	 */
	final public class FLARCameraDistortionFactor {

		private static const PD_LOOP:int = 3;
		private var _f0:Number; //x0
		private var _f1:Number; //y0
		private var _f2:Number; //100000000.0*ｆ
		private var _f3:Number; //s
		
		/**
		 * 配列の値をファクタ値としてセットする。
		 * @param i_factor
		 * 4要素以上の配列
		 */
		public function setValue(i_factor:Array):void {
			this._f0 = i_factor[0];
			this._f1 = i_factor[1];
			this._f2 = i_factor[2];
			this._f3 = i_factor[3];
			return;
		}

		public function getValue(o_factor:Array):void {
			o_factor[0] = this._f0;
			o_factor[1] = this._f1;
			o_factor[2] = this._f2;
			o_factor[3] = this._f3;
			return;
		}	

		public function changeScale(i_scale:Number):void {
			this._f0 = this._f0 * i_scale;
			// newparam->dist_factor[0] =source->dist_factor[0] *scale;
			this._f1 = this._f1 * i_scale;
			// newparam->dist_factor[1] =source->dist_factor[1] *scale;
			this._f2 = this._f2 / (i_scale * i_scale);
			// newparam->dist_factor[2]=source->dist_factor[2]/ (scale*scale);
			//this.f3=this.f3;// newparam->dist_factor[3] =source->dist_factor[3];
			return;
		}

		/**
		 * int arParamIdeal2Observ( const double dist_factor[4], const double ix,const double iy,double *ox, double *oy ) 関数の代替関数
		 * 
		 * @param i_in
		 * @param o_out
		 */
		public function ideal2Observ(i_in:FLARDoublePoint2d, o_out:FLARDoublePoint2d):void {
			const x:Number = (i_in.x - this._f0) * this._f3;
			const y:Number = (i_in.y - this._f1) * this._f3;
			if (x == 0.0 && y == 0.0) {
				o_out.x = this._f0;
				o_out.y = this._f1;
			} else {
				const d:Number = 1.0 - this._f2 / 100000000.0 * (x * x + y * y);
				o_out.x = x * d + this._f0;
				o_out.y = y * d + this._f1;
			}
			return;
		}

		/**
		 * ideal2Observをまとめて実行します。
		 * @param i_in	FLARDoublePoint2d[]
		 * @param o_out	FLARDoublePoint2d[]
		 */
		public function ideal2ObservBatch(i_in:Array, o_out:Array, i_size:int):void {
			var x:Number;
			var y:Number;
			const d0:Number = this._f0;
			const d1:Number = this._f1;
			const d3:Number = this._f3;
			const d2_w:Number = this._f2 / 100000000.0;
			
			var d:Number;
			for (var i:int = 0; i < i_size; i++) {
				x = (i_in[i].x - d0) * d3;
				y = (i_in[i].y - d1) * d3;
				if (x == 0.0 && y == 0.0) {
					o_out[i].x = d0;
					o_out[i].y = d1;
				} else {
					d = 1.0 - d2_w * (x * x + y * y);
					o_out[i].x = x * d + d0;
					o_out[i].y = y * d + d1;
				}
			}
			return;
		}

		/**
		 * int arParamObserv2Ideal( const double dist_factor[4], const double ox,const double oy,double *ix, double *iy );
		 * 
		 * @param ox
		 * @param oy
		 * @param ix
		 * @param iy
		 * @return
		 */
		public function observ2Ideal(ox:Number, oy:Number, ix:DoubleValue, iy:DoubleValue):void {
			var z02:Number;
			var z0:Number;
			var p:Number;
			var q:Number;
			var z:Number;
			var px:Number;
			var py:Number;
			var opttmp_1:Number;
			const d0:Number = this._f0;
			const d1:Number = this._f1;

			px = ox - d0;
			py = oy - d1;
			p = this._f2 / 100000000.0;
			z02 = px * px + py * py;
			q = z0 = Math.sqrt(z02);
			// Optimize//q = z0 = Math.sqrt(px*px+ py*py);

			for (var i:int = 1; ; i++) {
				if (z0 != 0.0) {
					// Optimize opttmp_1
					opttmp_1 = p * z02;
					z = z0 - ((1.0 - opttmp_1) * z0 - q) / (1.0 - 3.0 * opttmp_1);
					px = px * z / z0;
					py = py * z / z0;
				} else {
					px = 0.0;
					py = 0.0;
					break;
				}
				if (i == PD_LOOP) {
					break;
				}
				z02 = px * px + py * py;
				z0 = Math.sqrt(z02);// Optimize//z0 = Math.sqrt(px*px+ py*py);
			}
			ix.value = px / this._f3 + d0;
			iy.value = py / this._f3 + d1;
			return;
		}

		/**
		 * 指定範囲のobserv2Idealをまとめて実行して、結果をo_idealに格納します。
		 * 
		 * @param i_x_coord int[]
		 * @param i_y_coord int[]
		 * @param i_start
		 *            coord開始点
		 * @param i_num
		 *            計算数
		 * @param o_ideal
		 *            出力バッファ[i_num][2]であること。
		 *            double[][]
		 */
		public function observ2IdealBatch(i_x_coord:Array, i_y_coord:Array, i_start:int, i_num:int, o_ideal:Array):void {
			var z02:Number;
			var z0:Number;
			var q:Number;
			var z:Number;
			var px:Number;
			var py:Number;
			var opttmp_1:Number;
			const d0:Number = this._f0;
			const d1:Number = this._f1;
			const d3:Number = this._f3;
			const p:Number = this._f2 / 100000000.0;
			
			var j:int;
			var i:int;
			for (j = 0; j < i_num; j++) {

				px = i_x_coord[i_start + j] - d0;
				py = i_y_coord[i_start + j] - d1;

				z02 = px * px + py * py;
				q = z0 = Math.sqrt(z02);
				// Optimize//q = z0 = Math.sqrt(px*px+py*py);

				for (i = 1; ; i++) {
					if (z0 != 0.0) {
						// Optimize opttmp_1
						opttmp_1 = p * z02;
						z = z0 - ((1.0 - opttmp_1) * z0 - q) / (1.0 - 3.0 * opttmp_1);
						px = px * z / z0;
						py = py * z / z0;
					} else {
						px = 0.0;
						py = 0.0;
						break;
					}
					if (i == PD_LOOP) {
						break;
					}
					z02 = px * px + py * py;
					z0 = Math.sqrt(z02);// Optimize//z0 = Math.sqrt(px*px+ py*py);
				}
				o_ideal[j][0] = px / d3 + d0;
				o_ideal[j][1] = py / d3 + d1;
			}
			return;
		}	
	}
}