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

package org.libspark.flartoolkit.core {
	import org.libspark.flartoolkit.FLARException;
	import org.libspark.flartoolkit.utils.ArrayUtil;	

	/**
	 * ARMat構造体に対応するクラス typedef struct { double *m; int row; int clm; }ARMat;
	 * 
	 */
	public class FLARMat {

		/**
		 * 配列サイズと行列サイズは必ずしも一致しないことに注意 返された配列のサイズを行列の大きさとして使わないこと！
		 * 
		 */
		protected var m:Array; 
		// double[][]

		private var clm:int;
		private var row:int;

		/**
		 * デフォルトコンストラクタは機能しません。
		 * 
		 * @throws FLARException
		 */
		//	protected function FLARMat()
		//	{
		//		throw new FLARException();
		//	}

		public function FLARMat(i_row:int, i_clm:int) {
			//		m = new double[i_row][i_clm];
			m = ArrayUtil.createJaggedArray(i_row, i_clm);
			clm = i_clm;
			row = i_row;
		}

		/**
		 * i_row x i_clmサイズの行列を格納できるように行列サイズを変更します。 実行後、行列の各値は不定になります。
		 * 
		 * @param i_row
		 * @param i_clm
		 */
		public function realloc(i_row:int, i_clm:int):void {
			if (i_row <= this.m.length && i_clm <= this.m[0].length) {
			// 十分な配列があれば何もしない。
		} else {
				// 不十分なら取り直す。
				//			m = new double[i_row][i_clm];
				m = ArrayUtil.createJaggedArray(i_row, i_clm);
			}
			this.clm = i_clm;
			this.row = i_row;
		}

		public function getClm():int {
			return clm;
		}

		public function getRow():int {
			return row;
		}

		/**
		 * 行列をゼロクリアする。
		 */
		public function zeroClear():void {
			var i:int;
			var i2:int;
			// For順変更OK
			for (i = row - 1;i >= 0; i--) {
				for (i2 = clm - 1;i2 >= 0; i2--) {
					m[i][i2] = 0.0;
				}
			}
		}

		/**
		 * i_copy_fromの内容を自分自身にコピーします。 高さ・幅は同一で無いと失敗します。
		 * 
		 * @param i_copy_from
		 */
		public function copyFrom(i_copy_from:FLARMat):void {
			// サイズ確認
			if (this.row != i_copy_from.row || this.clm != i_copy_from.clm) {
				throw new FLARException();
			}
			// 値コピー
			var r:int;
			var c:int;
			for (r = this.row - 1;r >= 0; r--) {
				for (c = this.clm - 1;c >= 0; c--) {
					this.m[r][c] = i_copy_from.m[r][c];
				}
			}
		}

		public function getArray():Array {
			return m;
		}

		// public void getRowVec(int i_row,FLARVec o_vec)
		// {
		// o_vec.set(this.m[i_row],this.clm);
		// }
		/**
		 * aとbの積を自分自身に格納する。arMatrixMul()の代替品
		 * 
		 * @param a
		 * @param b
		 * @throws FLARException
		 */
		public function matrixMul(a:FLARMat, b:FLARMat):void {
			if (a.clm != b.row || this.row != a.row || this.clm != b.clm) {
				throw new FLARException();
			}
			var w:Number;
			var r:int;
			var c:int;
			var i:int;
			var am:Array = a.m;
			var bm:Array = b.m;
			var dm:Array = this.m;
			// For順変更禁止
			for (r = 0;r < this.row; r++) {
				for (c = 0;c < this.clm; c++) {
					w = 0.0;
					// dest.setARELEM0(r, c,0.0);
					for (i = 0;i < a.clm; i++) {
						w += am[r][i] * bm[i][c];// ARELEM0(dest, r, c) +=ARELEM0(a, r, i) * ARELEM0(b,i, c);
					}
					dm[r][c] = w;
				}
			}
		}

		private var wk_nos_matrixSelfInv:Array = new Array(50); 
		
		// new int[50];

		// private final static double matrixSelfInv_epsl=1.0e-10;
		/**
		 * i_targetを逆行列に変換する。arMatrixSelfInv()と、arMatrixSelfInv_minv()関数を合成してあります。
		 * OPTIMIZE STEP[485->422]
		 * 
		 * @param i_target
		 *            逆行列にする行列
		 * @return 逆行列があればTRUE/無ければFALSE
		 * 
		 * @throws FLARException
		 */
		public function matrixSelfInv():Boolean {
			var ap:Array = this.m;
			var dimen:int = this.row;
			var dimen_1:int = dimen - 1;
			var ap_n:Array;
			var ap_ip:Array;
			var ap_i:Array;
			var j:int;
			var ip:int;
			var nwork:int;
			var nos:Array = wk_nos_matrixSelfInv;
			// この関数で初期化される。
			// double epsl;
			var p:Number;
			var pbuf:Number;
			var work:Number;

			/* check size */
			switch (dimen) {
				case 0:
					throw new FLARException();
				case 1:
					ap[0][0] = 1.0 / ap[0][0];
					// *ap = 1.0 / (*ap);
					return true;/* 1 dimension */
			}

			for (var n:int = 0;n < dimen; n++) {
				nos[n] = n;
			}

			/*
			 * nyatla memo ipが定まらないで計算が行われる場合があるので挿入。 ループ内で0初期化していいかが判らない。
			 */
			ip = 0;
			// For順変更禁止
			var i:int;
			for (n = 0;n < dimen; n++) {
				ap_n = ap[n];
				// wcp = ap + n * rowa;
				p = 0.0;
				for (i = n;i < dimen; i++) {
					// for(i = n, wap = wcp, p =
					// 0.0; i < dimen ; i++, wap +=
					// rowa)
					if (p < (pbuf = Math.abs(ap[i][0]))) {
						p = pbuf;
						ip = i;
					}
				}
				// if (p <= matrixSelfInv_epsl){
				if (p == 0.0) {
					return false;
				// throw new FLARException();
				}

				nwork = nos[ip];
				nos[ip] = nos[n];
				nos[n] = nwork;

				ap_ip = ap[ip];
				for (j = 0;j < dimen; j++) {
					// for(j = 0, wap = ap + ip * rowa,
					// wbp = wcp; j < dimen ; j++) {
					work = ap_ip[j]; 
					// work = *wap;
					ap_ip[j] = ap_n[j];
					ap_n[j] = work;
				}

				work = ap_n[0];
				for (j = 0;j < dimen_1; j++) {
					// for(j = 1, wap = wcp, work =
					// *wcp; j < dimen ; j++, wap++)
					ap_n[j] = ap_n[j + 1] / work;// *wap = *(wap + 1) / work;
				}
				ap_n[j] = 1.0 / work;
				// *wap = 1.0 / work;
				for (i = 0;i < dimen; i++) {
					if (i != n) {
						ap_i = ap[i];
						// wap = ap + i * rowa;

						work = ap_i[0];
						for (j = 0; j < dimen_1; j++) {
							// for(j = 1, wbp = wcp,work = *wap;j < dimen ;j++, wap++, wbp++)
							ap_i[j] = ap_i[j + 1] - work * ap_n[j];// wap = *(wap +1) - work *(*wbp);
						}
						ap_i[j] = -work * ap_n[j];// *wap = -work * (*wbp);
					}
				}
			}

			for (n = 0;n < dimen; n++) {
				for (j = n;j < dimen; j++) {
					if (nos[j] == n) {
						break;
					}
				}
				nos[j] = nos[n];
				for (i = 0; i < dimen; i++) {
					// for(i = 0, wap = ap + j, wbp
					// = ap + n; i < dimen ;i++, wap
					// += rowa, wbp += rowa) {
					ap_i = ap[i];
					work = ap_i[j];
					// work = *wap;
					ap_i[j] = ap_i[n];
					// *wap = *wbp;
					ap_i[n] = work;// *wbp = work;
				}
			}
			return true;
		}

		/**
		 * sourceの転置行列をdestに得る。arMatrixTrans()の代替品
		 * 
		 * @param dest
		 * @param source
		 * @return
		 */
		public static function matrixTrans(dest:FLARMat, source:FLARMat):void {
			if (dest.row != source.clm || dest.clm != source.row) {
				throw new FLARException();
			}
			FLARException.trap("未チェックのパス");
			// For順変更禁止
			var r:int;
			var c:int;
			for (r = 0; r < dest.row; r++) {
				for (c = 0; c < dest.clm; c++) {
					dest.m[r][c] = source.m[c][r];
				}
			}
		}

		/**
		 * unitを単位行列に初期化する。arMatrixUnitの代替品
		 * 
		 * @param unit
		 */
		public static function matrixUnit(unit:FLARMat):void {
			if (unit.row != unit.clm) {
				throw new FLARException();
			}
			FLARException.trap("未チェックのパス");
			// For順変更禁止
			var r:int;
			var c:int;
			for (r = 0; r < unit.getRow(); r++) {
				for (c = 0; c < unit.getClm(); c++) {
					if (r == c) {
						unit.m[r][c] = 1.0;
					} else {
						unit.m[r][c] = 0.0;
					}
				}
			}
		}

		/**
		 * sourceの内容を自身に複製する。 Optimized 2008.04.19
		 * 
		 * @param i_source
		 * @return
		 */
		public function matrixDup(i_source:FLARMat):void {
			// 自身の配列サイズを相手のそれより大きいことを保障する。
			this.realloc(i_source.row, i_source.clm);
			// 内容を転写
			var r:int;
			var c:int;
			var src_m:Array;
			var dest_m:Array;
			src_m = i_source.m;
			dest_m = this.m;
			// コピーはFor順を変えてもOK
			for (r = this.row - 1; r >= 0; r--) {
				for (c = this.clm - 1; c >= 0; c--) {
					dest_m[r][c] = src_m[r][c];
				}
			}
		}

		public function matrixAllocDup():FLARMat {
			var result:FLARMat = new FLARMat(this.row, this.clm);
			// コピー
			var r:int;
			var c:int;
			var dest_m:Array;
			var src_m:Array;
			dest_m = result.m;
			src_m = this.m;
			// コピーはFor順を変えてもOK
			for (r = this.row - 1; r >= 0; r--) {
				for (c = this.clm - 1; c >= 0; c--) {
					dest_m[r][c] = src_m[r][c];
				}
			}
			return result;
		}

		/**
		 * arMatrixInv関数の代替品です。 destにsourceの逆行列を返します。
		 * 
		 * @param dest
		 * @param source
		 * @throws FLARException
		 */
		public static function matrixInv(dest:FLARMat, source:FLARMat):void {
			FLARException.trap("未チェックのパス");
			dest.matrixDup(source);

			FLARException.trap("未チェックのパス");
			dest.matrixSelfInv();
		}

		public function matrixAllocInv():FLARMat {
			FLARException.trap("未チェックのパス");
			var result:FLARMat = matrixAllocDup();

			FLARException.trap("未チェックのパス");
			result.matrixSelfInv();
			return result;
		}

		/**
		 * dim x dim の単位行列を作る。
		 * 
		 * @param dim
		 * @return
		 * @throws FLARException
		 */
		public static function matrixAllocUnit(dim:int):FLARMat {
			FLARException.trap("未チェックのパス");
			var result:FLARMat = new FLARMat(dim, dim);
			FLARException.trap("未チェックのパス");
			FLARMat.matrixUnit(result);
			return result;
		}

		/**
		 * arMatrixDispの代替品
		 * 
		 * @param m
		 * @return
		 */
		public function matrixDisp():int {
			FLARException.trap("未チェックのパス");
			//		System.out.println(" === matrix (" + row + "," + clm + ") ===");// printf(" ===matrix (%d,%d) ===\n", m->row, m->clm);
			//		for (var r:int = 0; r < row; r++) {// for(int r = 0; r < m->row; r++) {
			//			System.out.print(" |");// printf(" |");
			//			for (var c:int = 0; c < clm; c++) {// for(int c = 0; c < m->clm; c++) {
			//				System.out.print(" " + m[r][c]);// printf(" %10g", ARELEM0(m, r, c));
			//			}
			//			System.out.println(" |");// printf(" |\n");
			//		}
			//		System.out.println(" ======================");// printf(" ======================\n");
			return 0;
		}

		private static const PCA_EPS:Number = 1e-6; 
		// #define EPS 1e-6

		private static const PCA_MAX_ITER:int = 100; 
		// #define MAX_ITER 100

		private static const PCA_VZERO:Number = 1e-16; 
		
		// #define VZERO 1e-16

		/**
		 * static int EX( ARMat *input, ARVec *mean )の代替関数 Optimize:STEP:[144->110]
		 * 
		 * @param input
		 * @param mean
		 * @return
		 * @throws FLARException
		 */
		private function PCA_EX(mean:FLARVec):void {
			var lrow:int;
			var lclm:int;
			var i:int;
			var i2:int;
			lrow = this.row;
			lclm = this.clm;
			var lm:Array = this.m;

			if (lrow <= 0 || lclm <= 0) {
				throw new FLARException();
			}
			if (mean.getClm() != lclm) {
				throw new FLARException();
			}
			// double[] mean_array=mean.getArray();
			// mean.zeroClear();
			const mean_array:Array = mean.getArray();
			var w:Number;
			// For順変更禁止
			for (i2 = 0; i2 < lclm; i2++) {
				w = 0.0;
				for (i = 0; i < lrow; i++) {
					// *(v++) += *(m++);
					w += lm[i][i2];
				}
				mean_array[i2] = w / lrow;// mean->v[i] /= row;
			}
		}

		/**
		 * static int CENTER( ARMat *inout, ARVec *mean )の代替関数
		 * 
		 * @param inout
		 * @param mean
		 * @return
		 */
		private static function PCA_CENTER(inout:FLARMat, mean:FLARVec):void {
			var v:Array;
			var row:int;
			var clm:int;

			row = inout.getRow();
			clm = inout.getClm();
			if (mean.getClm() != clm) {
				throw new FLARException();
			}
			var im:Array = inout.m;
			var im_i:Array;
			var w0:Number;
			var w1:Number;
			v = mean.getArray();
			// 特にパフォーマンスが劣化するclm=1と2ときだけ、別パスで処理します。
			var i:int;
			var j:int;
			switch (clm) {
				case 1:
					w0 = v[0];
					for (i = 0;i < row; i++) {
						im[i][0] -= w0;
					}
					break;
				case 2:
					w0 = v[0];
					w1 = v[1];
					for (i = 0;i < row; i++) {
						im_i = im[i];
						im_i[0] -= w0;
						im_i[1] -= w1;
					}
					break;
				default:
					for (i = 0;i < row; i++) {
						im_i = im[i];
						for (j = 0;j < clm; j++) {
							// *(m++) -= *(v++);
							im_i[j] -= v[j];
						}
					}
					break;
			}
			return;
		}

		/**
		 * int x_by_xt( ARMat *input, ARMat *output )の代替関数
		 * 
		 * @param input
		 * @param output
		 * @throws FLARException
		 */
		private static function PCA_x_by_xt(input:FLARMat, output:FLARMat):void {
			FLARException.trap("動作未チェック/配列化未チェック");
			var row:int;
			var clm:int;
			// double[][] out;
			var in1:Array;
			var in2:Array;

			FLARException.trap("未チェックのパス");
			row = input.row;
			clm = input.clm;
			FLARException.trap("未チェックのパス");
			if (output.row != row || output.clm != row) {
				throw new FLARException();
			}

			// out = output.getArray();
			var i:int;
			var j:int;
			var k:int;
			for (i = 0; i < row; i++) {
				for (j = 0; j < row; j++) {
					if (j < i) {
						FLARException.trap("未チェックのパス");
						output.m[i][j] = output.m[j][i];// *out =
													// output->m[j*row+i];
					} else {
						FLARException.trap("未チェックのパス");
						in1 = input.m[i];
						// input.getRowArray(i);//in1 = &(input->m[clm*i]);
						in2 = input.m[j];
						// input.getRowArray(j);//in2 = &(input->m[clm*j]);
						output.m[i][j] = 0;
						// *out = 0.0;
						for (k = 0; k < clm; k++) {
							output.m[i][j] += (in1[k] * in2[k]);// *out += *(in1++)
															// * *(in2++);
						}
					}
				// out.incPtr();
				}
			}
		}

		/**
		 * static int xt_by_x( ARMat *input, ARMat *output )の代替関数
		 * Optimize:2008.04.19
		 * 
		 * @param input
		 * @param i_output
		 * @throws FLARException
		 */
		private static function PCA_xt_by_x(input:FLARMat, i_output:FLARMat):void {
			var in_:Array;
			var row:int;
			var clm:int;

			row = input.row;
			clm = input.clm;
			if (i_output.row != clm || i_output.clm != clm) {
				throw new FLARException();
			}

			var i:int;
			var k:int;
			var j:int;
			var out_m:Array = i_output.m;
			var w:Number;
			for (i = 0; i < clm; i++) {
				for (j = 0; j < clm; j++) {
					if (j < i) {
						out_m[i][j] = out_m[j][i];// *out = output->m[j*clm+i];
					} else {
						w = 0.0;
						// *out = 0.0;
						for (k = 0; k < row; k++) {
							in_ = input.m[k];
							// in=input.getRowArray(k);
							w += (in_[i] * in_[j]);// *out += *in1 * *in2;
						}
						out_m[i][j] = w;
					}
				}
			}
		}

		private const wk_PCA_QRM_ev:FLARVec = new FLARVec(1);

		/**
		 * static int QRM( ARMat *a, ARVec *dv )の代替関数
		 * 
		 * @param a
		 * @param dv
		 * @throws FLARException
		 */
		private function PCA_QRM(dv:FLARVec):void {
			var w:Number;
			var t:Number;
			var s:Number;
			var x:Number;
			var y:Number;
			var c:Number;
			var dim:int;
			var iter:int;
			var dv_array:Array = dv.getArray();

			dim = this.row;
			if (dim != this.clm || dim < 2) {
				throw new FLARException();
			}
			if (dv.getClm() != dim) {
				throw new FLARException();
			}

			var ev:FLARVec = this.wk_PCA_QRM_ev;
			ev.realloc(dim);
			var ev_array:Array = ev.getArray();
			if (ev == null) {
				throw new FLARException();
			}
			const L_m:Array = this.m;
			this.vecTridiagonalize(dv, ev, 1);

			ev_array[0] = 0.0;
			// ev->v[0] = 0.0;
			
			var h:int;
			var j:int;
			var k:int;
			var i:int;
			for (h = dim - 1; h > 0; h--) {
				j = h;
				while (j > 0 && Math.abs(ev_array[j]) > PCA_EPS * (Math.abs(dv_array[j - 1]) + Math.abs(dv_array[j]))) {
					// while(j>0 && fabs(ev->v[j]) >EPS*(fabs(dv->v[j-1])+fabs(dv->v[j])))
					// j--;
					j--;
				}
				if (j == h) {
					continue;
				}
				iter = 0;
				do {
					iter++;
					if (iter > PCA_MAX_ITER) {
						break;
					}
					w = (dv_array[h - 1] - dv_array[h]) / 2;
					// w = (dv->v[h-1] -dv->v[h]) / 2;//ここ？
					t = ev_array[h] * ev_array[h];
					// t = ev->v[h] * ev->v[h];
					s = Math.sqrt(w * w + t);
					if (w < 0) {
						s = -s;
					}
					x = dv_array[j] - dv_array[h] + t / (w + s);
					// x = dv->v[j] -dv->v[h] +t/(w+s);
					y = ev_array[j + 1];
					// y = ev->v[j+1];
					for (k = j; k < h; k++) {
						if (Math.abs(x) >= Math.abs(y)) {
							if (Math.abs(x) > PCA_VZERO) {
								t = -y / x;
								c = 1 / Math.sqrt(t * t + 1);
								s = t * c;
							} else {
								c = 1.0;
								s = 0.0;
							}
						} else {
							t = -x / y;
							s = 1.0 / Math.sqrt(t * t + 1);
							c = t * s;
						}
						w = dv_array[k] - dv_array[k + 1];
						// w = dv->v[k] -dv->v[k+1];
						t = (w * s + 2 * c * ev_array[k + 1]) * s;
						// t = (w * s +2 * c *ev->v[k+1]) *s;
						dv_array[k] -= t;
						// dv->v[k] -= t;
						dv_array[k + 1] += t;
						// dv->v[k+1] += t;
						if (k > j) {
							FLARException.trap("未チェックパス");
							ev_array[k] = c * ev_array[k] - s * y;// ev->v[k]= c *ev->v[k]- s * y;
						}
						ev_array[k + 1] += s * (c * w - 2 * s * ev_array[k + 1]);
						// ev->v[k+1]+= s * (c* w- 2* s *ev->v[k+1]);

						for (i = 0; i < dim; i++) {
							x = L_m[k][i];
							// x = a->m[k*dim+i];
							y = L_m[k + 1][i];
							// y = a->m[(k+1)*dim+i];
							L_m[k][i] = c * x - s * y;
							// a->m[k*dim+i] = c * x - s* y;
							L_m[k + 1][i] = s * x + c * y;// a->m[(k+1)*dim+i] = s* x + c * y;
						}
						if (k < h - 1) {
							FLARException.trap("未チェックパス");
							// {
							x = ev_array[k + 1];
							// x = ev->v[k+1];
							y = -s * ev_array[k + 2];
							// y = -s * ev->v[k+2];
							ev_array[k + 2] *= c;// ev->v[k+2] *= c;
							// }
						}
					}
				} while (Math.abs(ev_array[h]) > PCA_EPS * (Math.abs(dv_array[h - 1]) + Math.abs(dv_array[h])));
			}
			for (k = 0;k < dim - 1; k++) {
				h = k;
				t = dv_array[h];
				// t = dv->v[h];
				for (i = k + 1;i < dim; i++) {
					if (dv_array[i] > t) {
						// if( dv->v[i] > t ) {
						h = i;
						t = dv_array[h];// t = dv->v[h];
					}
				}
				dv_array[h] = dv_array[k];
				// dv->v[h] = dv->v[k];
				dv_array[k] = t;
				// dv->v[k] = t;
				this.flipRow(h, k);
			}
		}

		/**
		 * i_row_1番目の行と、i_row_2番目の行を入れ替える。
		 * 
		 * @param i_row_1
		 * @param i_row_2
		 */
		private function flipRow(i_row_1:int, i_row_2:int):void {
			var i:int;
			var w:Number;
			var r1:Array = this.m[i_row_1];
			var r2:Array = this.m[i_row_2];
			// For順変更OK
			for (i = clm - 1;i >= 0; i--) {
				w = r1[i];
				r1[i] = r2[i];
				r2[i] = w;
			}
		}

		/**
		 * static int EV_create( ARMat *input, ARMat *u, ARMat *output, ARVec *ev
		 * )の代替関数
		 * 
		 * @param input
		 * @param u
		 * @param output
		 * @param ev
		 * @throws FLARException
		 */
		private static function PCA_EV_create(input:FLARMat, u:FLARMat, output:FLARMat, ev:FLARVec):void {
			FLARException.trap("未チェックのパス");
			var row:int;
			var clm:int;
			row = input.row;
			// row = input->row;
			clm = input.clm;
			// clm = input->clm;
			if (row <= 0 || clm <= 0) {
				throw new FLARException();
			}
			if (u.row != row || u.clm != row) {
				// if( u->row != row || u->clm !=
				// row ){
				throw new FLARException();
			}
			if (output.row != row || output.clm != clm) {
				// if( output->row !=
				// row || output->clm !=
				// clm ){
				throw new FLARException();
			}
			if (ev.getClm() != row) {
				// if( ev->clm != row ){
				throw new FLARException();
			}
			var m:Array;
			var in_:Array;
			var m1:Array;
			var ev_array:Array;
			var sum:Number;
			var work:Number;

			FLARException.trap("未チェックのパス");
			m = output.m;
			// m = output->m;
			in_ = input.m;

			var i:int;
			var j:int;
			var k:int;
			ev_array = ev.getArray();
			for (i = 0; i < row; i++) {
				FLARException.trap("未チェックのパス");
				if (ev_array[i] < PCA_VZERO) {
					// if( ev->v[i] < VZERO ){
					break;
				}
				FLARException.trap("未チェックのパス");
				work = 1 / Math.sqrt(Math.abs(ev_array[i]));
				// work = 1 /
				// sqrt(fabs(ev->v[i]));
				for (j = 0; j < clm; j++) {
					sum = 0.0;
					m1 = u.m[i];
					// m1 = &(u->m[i*row]);
					// m2=input.getPointer(j);//m2 = &(input->m[j]);
					for (k = 0; k < row; k++) {
						sum += m1[k] + in_[k][j];// sum += *m1 * *m2;
					// m1.incPtr(); //m1++;
					// m2.addPtr(clm);//m2 += clm;
					}
					m1[j] = sum * work;// *(m++) = sum * work;
				// {//*(m++) = sum * work;
				// m.set(sum * work);
				// m.incPtr();}
				}
			}
			for (; i < row; i++) {
				FLARException.trap("未チェックのパス");
				ev_array[i] = 0.0;
				// ev->v[i] = 0.0;
				for (j = 0; j < clm; j++) {
					m[i][j] = 0.0;
				// m.set(0.0);//*(m++) = 0.0;
				// m.incPtr();
				}
			}
		}

		private var wk_PCA_PCA_u:FLARMat = null;

		/**
		 * static int PCA( ARMat *input, ARMat *output, ARVec *ev )
		 * 
		 * @param output
		 * @param o_ev
		 * @throws FLARException
		 */
		private function PCA_PCA(o_output:FLARMat, o_ev:FLARVec):void {

			var l_row:int;
			var l_clm:int;
			var min:int;
			var ev_array:Array = o_ev.getArray();

			l_row = this.row;
			// row = input->row;
			l_clm = this.clm;
			// clm = input->clm;
			min = (l_clm < l_row) ? l_clm : l_row;
			if (l_row < 2 || l_clm < 2) {
				throw new FLARException();
			}
			if (o_output.clm != this.clm) {
				// if( output->clm != input->clm ){
				throw new FLARException();
			}
			if (o_output.row != min) {
				// if( output->row != min ){
				throw new FLARException();
			}
			if (o_ev.getClm() != min) {
				// if( ev->clm != min ){
				throw new FLARException();
			}

			var u:FLARMat;
			// u =new FLARMat( min, min );
			if (this.wk_PCA_PCA_u == null) {
				u = new FLARMat(min, min);
				this.wk_PCA_PCA_u = u;
			} else {
				u = this.wk_PCA_PCA_u;
				u.realloc(min, min);
			}

			if (l_row < l_clm) {
				FLARException.trap("未チェックのパス");
				PCA_x_by_xt(this, u);// if(x_by_xt( input, u ) < 0 ) {
			} else {
				PCA_xt_by_x(this, u);// if(xt_by_x( input, u ) < 0 ) {
			}
			u.PCA_QRM(o_ev);

			var m1:Array;
			var m2:Array;
			if (l_row < l_clm) {
				FLARException.trap("未チェックのパス");
				PCA_EV_create(this, u, o_output, o_ev);
			} else {
				m1 = u.m;
				// m1 = u->m;
				m2 = o_output.m;
				// m2 = output->m;
				var i:int;
				var j:int;
				for (i = 0;i < min; i++) {
					if (ev_array[i] < PCA_VZERO) {
						// if( ev->v[i] < VZERO ){
						break;
					}
					for (j = 0;j < min; j++) {
						m2[i][j] = m1[i][j];// *(m2++) = *(m1++);
					}
				}
				for (;i < min; i++) {
					// for( ; i < min; i++){
					// コードを見た限りあってそうだからコメントアウト(2008/03/26)FLARException.trap("未チェックのパス");
					ev_array[i] = 0.0;
					// ev->v[i] = 0.0;
					for (j = 0;j < min; j++) {
						m2[i][j] = 0.0;// *(m2++) = 0.0;
					}
				}
			}
		}

		private var wk_work_matrixPCA:FLARMat = null;

		/**
		 * int arMatrixPCA( ARMat *input, ARMat *evec, ARVec *ev, ARVec *mean );
		 * 関数の置き換え。input引数がthisになる。 Optimize:2008.04.19
		 * 
		 * @param o_evec
		 * @param o_ev
		 * 
		 * @param mean
		 * @throws FLARException
		 */
		public function matrixPCA(o_evec:FLARMat, o_ev:FLARVec, mean:FLARVec):void {
			var srow:Number;
			var sum:Number;
			var l_row:int;
			var l_clm:int;
			var check:int;

			l_row = this.row;
			// row = input->row;
			l_clm = this.clm;
			// clm = input->clm;
			check = (l_row < l_clm) ? l_row : l_clm;
			if (l_row < 2 || l_clm < 2) {
				throw new FLARException();
			}
			if (o_evec.clm != l_clm || o_evec.row != check) {
				// if( evec->clm !=
				// input->clm ||
				// evec->row !=
				// check ){
				throw new FLARException();
			}
			if (o_ev.getClm() != check) {
				// if( ev->clm != check ){
				throw new FLARException();
			}
			if (mean.getClm() != l_clm) {
				// if( mean->clm != input->clm ){
				throw new FLARException();
			}

			// 自分の内容をワークにコピー(高速化の為に、1度作ったインスタンスは使いまわす)
			var work:FLARMat;
			if (this.wk_work_matrixPCA == null) {
				work = this.matrixAllocDup();
				this.wk_work_matrixPCA = work;
			} else {
				work = this.wk_work_matrixPCA;
				work.matrixDup(this);// arMatrixAllocDup( input );work =
									// arMatrixAllocDup( input );
			}

			srow = Math.sqrt(l_row);
			work.PCA_EX(mean);

			PCA_CENTER(work, mean);

			var i:int;
			var j:int;
			// For順変更OK
			for (i = 0;i < l_row; i++) {
				for (j = 0;j < l_clm; j++) {
					work.m[i][j] /= srow;// work->m[i] /= srow;
				}
			}

			work.PCA_PCA(o_evec, o_ev);

			sum = 0.0;
			var ev_array:Array = o_ev.getArray();
			var ev_clm:int = o_ev.getClm();
			// For順変更禁止
			for (i = 0;i < ev_clm; i++) {
				// for(int i = 0; i < ev->clm; i++ ){
				sum += ev_array[i];// sum += ev->v[i];
			}
			// For順変更禁止
			for (i = 0;i < ev_clm; i++) {
				// for(int i = 0; i < ev->clm; i++ ){
				ev_array[i] /= sum;// ev->v[i] /= sum;
			}
		}

		/* int arMatrixPCA2( ARMat *input, ARMat *evec, ARVec *ev ); */
		public static function arMatrixPCA2(input:FLARMat, evec:FLARMat, ev:FLARVec):void {
			FLARException.trap("未チェックのパス");
			var work:FLARMat;
			// double srow; // unreferenced
			var sum:Number;
			var row:int;
			var clm:int;
			var check:int;

			row = input.row;
			// row = input->row;
			clm = input.clm;
			// clm = input->clm;
			check = (row < clm) ? row : clm;
			if (row < 2 || clm < 2) {
				throw new FLARException();
			}
			if (evec.getClm() != input.clm || evec.row != check) {
				// if( evec->clm!= input->clm|| evec->row!= check ){
				throw new FLARException();
			}
			if (ev.getClm() != check) {
				// if( ev->clm != check ){
				throw new FLARException();
			}

			FLARException.trap("未チェックのパス");
			work = input.matrixAllocDup();

			FLARException.trap("未チェックパス");
			work.PCA_PCA(evec, ev);
			// rval = PCA( work, evec, ev );
			sum = 0.0;
			var ev_array:Array = ev.getArray();
			
			var i:int;
			for (i = 0;i < ev.getClm(); i++) {
				// for( i = 0; i < ev->clm; i++
				// ){
				FLARException.trap("未チェックパス");
				sum += ev_array[i];// sum += ev->v[i];
			}
			for (i = 0;i < ev.getClm(); i++) {
				// for(int i = 0; i < ev->clm;i++ ){
				FLARException.trap("未チェックパス");
				ev_array[i] /= sum;// ev->v[i] /= sum;
			}
			return;
		}

		public static function matrixAllocMul(a:FLARMat, b:FLARMat):FLARMat {
			FLARException.trap("未チェックのパス");
			var dest:FLARMat = new FLARMat(a.row, b.clm);
			FLARException.trap("未チェックのパス");
			dest.matrixMul(a, b);
			return dest;
		}

		/* static double mdet(double *ap, int dimen, int rowa) */
		private static function Det_mdet(ap:Array, dimen:int, rowa:int):Number {
			FLARException.trap("動作未チェック/配列化未チェック");
			var det:Number = 1.0;
			var work:Number;
			var is_:int = 0;
			var mmax:int;

			var k:int;
			var i:int;
			var j:int;
			for (k = 0;k < dimen - 1; k++) {
				mmax = k;
				for (i = k + 1;i < dimen; i++) {
					// if (Math.abs(arMatrixDet_MATRIX_get(ap, i, k, rowa)) >
					// Math.abs(arMatrixDet_MATRIX_get(ap, mmax, k, rowa))){
					if (Math.abs(ap[i][k]) > Math.abs(ap[mmax][k])) {
						mmax = i;
					}
				}
				if (mmax != k) {
					for (j = k;j < dimen; j++) {
						work = ap[k][j];
						// work = MATRIX(ap, k, j, rowa);
						ap[k][j] = ap[mmax][j];
						// MATRIX(ap, k, j, rowa) =MATRIX(ap, mmax, j, rowa);
						ap[mmax][j] = work;// MATRIX(ap, mmax, j, rowa) = work;
					}
					is_++;
				}
				for (i = k + 1;i < dimen; i++) {
					work = ap[i][k] / ap[k][k];
					// work = arMatrixDet_MATRIX_get(ap,i, k, rowa) /arMatrixDet_MATRIX_get(ap, k, k,rowa);
					for (j = k + 1;j < dimen; j++) {
						// MATRIX(ap, i, j, rowa) -= work * MATRIX(ap, k, j, rowa);
						ap[i][j] -= work * ap[k][j];
					}
				}
			}
			for (i = 0;i < dimen; i++) {
				det = ap[i][i];// det *= MATRIX(ap, i, i, rowa);
			}
			for (i = 0;i < is_; i++) {
				det *= -1.0;
			}
			return det;
		}

		/* double arMatrixDet(ARMat *m); */
		public static function arMatrixDet(m:FLARMat):Number {
			FLARException.trap("動作未チェック/配列化未チェック");
			if (m.row != m.clm) {
				return 0.0;
			}
			return Det_mdet(m.getArray(), m.row, m.clm);// return mdet(m->m, m->row,m->row);
		}

		private const wk_vecTridiagonalize_vec:FLARVec = new FLARVec(0);

		private const wk_vecTridiagonalize_vec2:FLARVec = new FLARVec(0);

		/**
		 * arVecTridiagonalize関数の代替品 a,d,e間で演算をしてる。何をどうしているかはさっぱりさっぱり
		 * 
		 * @param a
		 * @param d
		 * @param e
		 * @param i_e_start
		 *            演算開始列(よくわからないけどarVecTridiagonalizeの呼び出し元でなんかしてる)
		 * @return
		 * @throws FLARException
		 */
		private function vecTridiagonalize(d:FLARVec, e:FLARVec, i_e_start:int):void {
			var vec:FLARVec = wk_vecTridiagonalize_vec;
			// double[][] a_array=a.getArray();
			var s:Number;
			var t:Number;
			var p:Number;
			var q:Number;
			var dim:int;

			if (this.clm != this.row) {
				// if(a.getClm()!=a.getRow()){
				throw new FLARException();
			}
			if (this.clm != d.getClm()) {
				// if(a.getClm() != d.clm){
				throw new FLARException();
			}
			if (this.clm != e.getClm()) {
				// if(a.getClm() != e.clm){
				throw new FLARException();
			}
			dim = this.getClm();

			var d_vec:Array = d.getArray();
			var e_vec:Array = e.getArray();
			var a_vec_k:Array;

			var k:int;
			var i:int;
			var j:int;
			for (k = 0;k < dim - 2; k++) {

				a_vec_k = this.m[k];
				vec.setNewArray(a_vec_k, clm);
				// vec=this.getRowVec(k);//double[]
				// vec_array=vec.getArray();
				FLARException.trap("未チェックパス");
				d_vec[k] = a_vec_k[k];
				// d.v[k]=vec.v[k];//d.set(k,v.get(k));
				// //d->v[k] = v[k];

				// wv1.clm = dim-k-1;
				// wv1.v = &(v[k+1]);
				FLARException.trap("未チェックパス");
				e_vec[k + i_e_start] = vec.vecHousehold(k + 1);
				// e.v[k+i_e_start]=vec.vecHousehold(k+1);//e->v[k]= arVecHousehold(&wv1);
				if (e_vec[k + i_e_start] == 0.0) {
					// if(e.v[k+i_e_start]== 0.0){//if(e.v[k+i_e_start]== 0.0){
					continue;
				}

				for (i = k + 1;i < dim; i++) {
					s = 0.0;
					for (j = k + 1;j < i; j++) {
						FLARException.trap("未チェックのパス");
						s += this.m[j][i] * a_vec_k[j];// s += a_array[j][i] *vec.v[j];//s +=a.get(j*dim+i) *v.get(j);//s +=a->m[j*dim+i] * v[j];
					}
					for (j = i;j < dim; j++) {
						FLARException.trap("未チェックのパス");
						s += this.m[i][j] * a_vec_k[j];// s += a_array[i][j] *vec.v[j];//s +=a.get(i*dim+j) *v.get(j);//s +=a->m[i*dim+j] * v[j];
					}
					FLARException.trap("未チェックのパス");
					d_vec[i] = s;// d.v[i]=s;//d->v[i] = s;
				}

				// wv1.clm = wv2.clm = dim-k-1;
				// wv1.v = &(v[k+1]);
				// wv2.v = &(d->v[k+1]);
				a_vec_k = this.m[k];
				vec.setNewArray(a_vec_k, clm);
				// vec=this.getRowVec(k);
				// vec_array=vec.getArray();
				FLARException.trap("未チェックパス");
				t = vec.vecInnerproduct(d, k + 1) / 2;
				for (i = dim - 1;i > k; i--) {
					FLARException.trap("未チェックパス");
					p = a_vec_k[i];
					// p = v.get(i);//p = v[i];
					d_vec[i] -= t * p;
					q = d_vec[i];
					// d.v[i]-=t*p;q=d.v[i];//q = d->v[i] -= t*p；
					for (j = i;j < dim; j++) {
						FLARException.trap("未チェックパス");
						this.m[i][j] -= p * (d_vec[j] + q * a_vec_k[j]);// a.m[i][j]-=p*(d.v[j] +q*vec.v[j]);//a->m[i*dim+j] -=p*(d->v[j]) + q*v[j];
					}
				}
			}

			if (dim >= 2) {
				d_vec[dim - 2] = this.m[dim - 2][dim - 2];
				// d.v[dim-2]=a.m[dim-2][dim-2];//d->v[dim-2]=a->m[(dim-2)*dim+(dim-2)];
				e_vec[dim - 2 + i_e_start] = this.m[dim - 2][dim - 1];// e.v[dim-2+i_e_start]=a.m[dim-2][dim-1];//e->v[dim-2] = a->m[(dim-2)*dim+(dim-1)];
			}

			if (dim >= 1) {
				d_vec[dim - 1] = this.m[dim - 1][dim - 1];// d.v[dim-1]=a_array[dim-1][dim-1];//d->v[dim-1] =a->m[(dim-1)*dim+(dim-1)];
			}
			var vec2:FLARVec = this.wk_vecTridiagonalize_vec2;
			for (k = dim - 1;k >= 0; k--) {
				a_vec_k = this.m[k];
				vec.setNewArray(a_vec_k, clm);
				// vec=this.getRowVec(k);//v =a.getPointer(k*dim);//v = &(a->m[k*dim]);
				if (k < dim - 2) {
					for (i = k + 1;i < dim; i++) {
						// wv1.clm = wv2.clm = dim-k-1;
						// wv1.v = &(v[k+1]);
						// wv2.v = &(a->m[i*dim+k+1]);
						vec2.setNewArray(this.m[i], clm);
						// vec2=this.getRowVec(i);

						t = vec.vecInnerproduct(vec2, k + 1);
						for (j = k + 1;j < dim; j++) {
							FLARException.trap("未チェックパス");
							this.m[i][j] -= t * a_vec_k[j];// a_array[i][j]-=t*vec.v[j];//a.subValue(i*dim+j,t*v.get(j));//a->m[i*dim+j]-= t * v[j];
						}
					}
				}
				for (i = 0;i < dim; i++) {
					a_vec_k[i] = 0.0;// v.set(i,0.0);//v[i] = 0.0;
				}
				a_vec_k[k] = 1;// v.set(k,1);//v[k] = 1;
			}
			return;
		}
	}
}