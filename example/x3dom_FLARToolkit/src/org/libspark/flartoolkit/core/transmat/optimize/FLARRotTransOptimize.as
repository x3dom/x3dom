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

package org.libspark.flartoolkit.core.transmat.optimize {
	import org.libspark.flartoolkit.core.param.FLARPerspectiveProjectionMatrix;
	import org.libspark.flartoolkit.core.transmat.fitveccalc.FLARFitVecCalculator;
	import org.libspark.flartoolkit.core.transmat.rotmatrix.FLARRotMatrix;
	import org.libspark.flartoolkit.core.types.FLARDoublePoint2d;
	import org.libspark.flartoolkit.core.types.FLARDoublePoint3d;
	import org.libspark.flartoolkit.utils.ArrayUtil;	

	/**
	 * 基本姿勢と実画像を一致するように、角度を微調整→平行移動量を再計算
	 * を繰り返して、変換行列を最適化する。
	 *
	 */
	public class FLARRotTransOptimize implements IFLARRotTransOptimize {

		private static const AR_GET_TRANS_MAT_MAX_LOOP_COUNT:int = 5; // #define AR_GET_TRANS_MAT_MAX_LOOP_COUNT 5
		private static const AR_GET_TRANS_MAT_MAX_FIT_ERROR:Number = 1.0; // #define AR_GET_TRANS_MAT_MAX_FIT_ERROR 1.0
		private var _projection_mat_ref:FLARPerspectiveProjectionMatrix;

		public function FLARRotTransOptimize(i_projection_mat_ref:FLARPerspectiveProjectionMatrix) {
			this._projection_mat_ref = i_projection_mat_ref;
			return;
		}

		public function optimize(io_rotmat:FLARRotMatrix, io_transvec:FLARDoublePoint3d, i_calculator:FLARFitVecCalculator):Number {
			const fit_vertex:Array = i_calculator.getFitSquare(); // FLARDoublePoint2d[]
			const offset_square:Array = i_calculator.getOffsetVertex().vertex; // FLARDoublePoint3d[]

			var err:Number = -1;
			/*ループを抜けるタイミングをARToolKitと合わせるために変なことしてます。*/
			for (var i:int = 0;; i++) {
				// <arGetTransMat3>
				err = modifyMatrix(io_rotmat, io_transvec, offset_square, fit_vertex);
				i_calculator.calculateTransfer(io_rotmat, io_transvec);
				err = modifyMatrix(io_rotmat, io_transvec, offset_square, fit_vertex);			
				// //</arGetTransMat3>
				if (err < AR_GET_TRANS_MAT_MAX_FIT_ERROR || i == AR_GET_TRANS_MAT_MAX_LOOP_COUNT - 1) {
					break;
				}
				i_calculator.calculateTransfer(io_rotmat, io_transvec);
			}		
			return err;
		}

		private const __modifyMatrix_double1D:Array = ArrayUtil.createJaggedArray(8, 3); // new double[8][3];
		private const __modifyMatrix_angle:FLARDoublePoint3d = new FLARDoublePoint3d();	

		/**
		 * arGetRot計算を階層化したModifyMatrix 896
		 * 
		 * @param nyrot
		 * @param trans
		 * @param i_vertex3d	FLARDoublePoint3d[]
		 * [m][3]
		 * @param i_vertex2d	FLARDoublePoint2d[]
		 * [n][2]
		 * @return
		 * @throws FLARException
		 */
		private function modifyMatrix(io_rot:FLARRotMatrix, trans:FLARDoublePoint3d, i_vertex3d:Array, i_vertex2d:Array):Number {
			var factor:Number;
			var a2:Number, b2:Number, c2:Number;
			var ma:Number = 0.0, mb:Number = 0.0, mc:Number = 0.0;
			var h:Number, x:Number, y:Number;
			var err:Number, minerr:Number = 0;
			var t1:int, t2:int, t3:int;
			var s1:int = 0, s2:int = 0, s3:int = 0;

			factor = 10.0 * Math.PI / 180.0;
			var rot0:Number, rot1:Number, rot3:Number, rot4:Number, rot6:Number, rot7:Number;
			var combo00:Number, combo01:Number, combo02:Number, combo03:Number, combo10:Number, combo11:Number, combo12:Number, combo13:Number, combo20:Number, combo21:Number, combo22:Number, combo23:Number;
			var combo02_2:Number, combo02_5:Number, combo02_8:Number, combo02_11:Number;
			var combo22_2:Number, combo22_5:Number, combo22_8:Number, combo22_11:Number;
			var combo12_2:Number, combo12_5:Number, combo12_8:Number, combo12_11:Number;
			// vertex展開
			var VX00:Number, VX01:Number, VX02:Number, VX10:Number, VX11:Number, VX12:Number, VX20:Number, VX21:Number, VX22:Number, VX30:Number, VX31:Number, VX32:Number;
			var d_pt:FLARDoublePoint3d;
			d_pt = i_vertex3d[0];
			VX00 = d_pt.x;
			VX01 = d_pt.y;
			VX02 = d_pt.z;
			d_pt = i_vertex3d[1];
			VX10 = d_pt.x;
			VX11 = d_pt.y;
			VX12 = d_pt.z;
			d_pt = i_vertex3d[2];
			VX20 = d_pt.x;
			VX21 = d_pt.y;
			VX22 = d_pt.z;
			d_pt = i_vertex3d[3];
			VX30 = d_pt.x;
			VX31 = d_pt.y;
			VX32 = d_pt.z;
			var P2D00:Number, P2D01:Number, P2D10:Number, P2D11:Number, P2D20:Number, P2D21:Number, P2D30:Number, P2D31:Number;
			var d_pt2:FLARDoublePoint2d;
			d_pt2 = i_vertex2d[0];
			P2D00 = d_pt2.x;
			P2D01 = d_pt2.y;
			d_pt2 = i_vertex2d[1];
			P2D10 = d_pt2.x;
			P2D11 = d_pt2.y;
			d_pt2 = i_vertex2d[2];
			P2D20 = d_pt2.x;
			P2D21 = d_pt2.y;
			d_pt2 = i_vertex2d[3];
			P2D30 = d_pt2.x;
			P2D31 = d_pt2.y;
			const prjmat:FLARPerspectiveProjectionMatrix = this._projection_mat_ref;
			var CP0:Number, CP1:Number, CP2:Number, CP4:Number, CP5:Number, CP6:Number, CP8:Number, CP9:Number, CP10:Number;
			CP0 = prjmat.m00;
			CP1 = prjmat.m01;
			CP2 = prjmat.m02;
			CP4 = prjmat.m10;
			CP5 = prjmat.m11;
			CP6 = prjmat.m12;
			CP8 = prjmat.m20;
			CP9 = prjmat.m21;
			CP10 = prjmat.m22;
			combo03 = CP0 * trans.x + CP1 * trans.y + CP2 * trans.z + prjmat.m03;
			combo13 = CP4 * trans.x + CP5 * trans.y + CP6 * trans.z + prjmat.m13;
			combo23 = CP8 * trans.x + CP9 * trans.y + CP10 * trans.z + prjmat.m23;
			var CACA:Number, SASA:Number, SACA:Number, CA:Number, SA:Number;
			var CACACB:Number, SACACB:Number, SASACB:Number, CASB:Number, SASB:Number;
			var SACASC:Number, SACACBSC:Number, SACACBCC:Number, SACACC:Number;
			const double1D:Array = this.__modifyMatrix_double1D; // double[][]

			const angle:FLARDoublePoint3d = this.__modifyMatrix_angle;

			const a_factor:Array = double1D[1];
			const sinb:Array = double1D[2];
			const cosb:Array = double1D[3];
			const b_factor:Array = double1D[4];
			const sinc:Array = double1D[5];
			const cosc:Array = double1D[6];
			const c_factor:Array = double1D[7];
			var w:Number, w2:Number;
			var wsin:Number, wcos:Number;
		
			io_rot.getAngle(angle);
			// arGetAngle( rot, &a, &b, &c );
			a2 = angle.x;
			b2 = angle.y;
			c2 = angle.z;

			// comboの3行目を先に計算
			var i:int;
			var j:int;
			for (i = 0; i < 10; i++) {
				minerr = 1000000000.0;
				// sin-cosテーブルを計算(これが外に出せるとは…。)
				for (j = 0; j < 3; j++) {
					w2 = factor * (j - 1);
					w = a2 + w2;
					a_factor[j] = w;
					w = b2 + w2;
					b_factor[j] = w;
					sinb[j] = Math.sin(w);
					cosb[j] = Math.cos(w);
					w = c2 + w2;
					c_factor[j] = w;
					sinc[j] = Math.sin(w);
					cosc[j] = Math.cos(w);
				}
				//
				for (t1 = 0; t1 < 3; t1++) {
					SA = Math.sin(a_factor[t1]);
					CA = Math.cos(a_factor[t1]);
					// Optimize
					CACA = CA * CA;
					SASA = SA * SA;
					SACA = SA * CA;
					for (t2 = 0;t2 < 3; t2++) {
						wsin = sinb[t2];
						wcos = cosb[t2];
						CACACB = CACA * wcos;
						SACACB = SACA * wcos;
						SASACB = SASA * wcos;
						CASB = CA * wsin;
						SASB = SA * wsin;
						// comboの計算1
						combo02 = CP0 * CASB + CP1 * SASB + CP2 * wcos;
						combo12 = CP4 * CASB + CP5 * SASB + CP6 * wcos;
						combo22 = CP8 * CASB + CP9 * SASB + CP10 * wcos;

						combo02_2 = combo02 * VX02 + combo03;
						combo02_5 = combo02 * VX12 + combo03;
						combo02_8 = combo02 * VX22 + combo03;
						combo02_11 = combo02 * VX32 + combo03;
						combo12_2 = combo12 * VX02 + combo13;
						combo12_5 = combo12 * VX12 + combo13;
						combo12_8 = combo12 * VX22 + combo13;
						combo12_11 = combo12 * VX32 + combo13;
						combo22_2 = combo22 * VX02 + combo23;
						combo22_5 = combo22 * VX12 + combo23;
						combo22_8 = combo22 * VX22 + combo23;
						combo22_11 = combo22 * VX32 + combo23;
						for (t3 = 0;t3 < 3; t3++) {
							wsin = sinc[t3];
							wcos = cosc[t3];
							SACASC = SACA * wsin;
							SACACC = SACA * wcos;
							SACACBSC = SACACB * wsin;
							SACACBCC = SACACB * wcos;

							rot0 = CACACB * wcos + SASA * wcos + SACACBSC - SACASC;
							rot3 = SACACBCC - SACACC + SASACB * wsin + CACA * wsin;
							rot6 = -CASB * wcos - SASB * wsin;

							combo00 = CP0 * rot0 + CP1 * rot3 + CP2 * rot6;
							combo10 = CP4 * rot0 + CP5 * rot3 + CP6 * rot6;
							combo20 = CP8 * rot0 + CP9 * rot3 + CP10 * rot6;

							rot1 = -CACACB * wsin - SASA * wsin + SACACBCC - SACACC;
							rot4 = -SACACBSC + SACASC + SASACB * wcos + CACA * wcos;
							rot7 = CASB * wsin - SASB * wcos;
							combo01 = CP0 * rot1 + CP1 * rot4 + CP2 * rot7;
							combo11 = CP4 * rot1 + CP5 * rot4 + CP6 * rot7;
							combo21 = CP8 * rot1 + CP9 * rot4 + CP10 * rot7;
							//
							err = 0.0;
							h = combo20 * VX00 + combo21 * VX01 + combo22_2;
							x = P2D00 - (combo00 * VX00 + combo01 * VX01 + combo02_2) / h;
							y = P2D01 - (combo10 * VX00 + combo11 * VX01 + combo12_2) / h;
							err += x * x + y * y;
							h = combo20 * VX10 + combo21 * VX11 + combo22_5;
							x = P2D10 - (combo00 * VX10 + combo01 * VX11 + combo02_5) / h;
							y = P2D11 - (combo10 * VX10 + combo11 * VX11 + combo12_5) / h;
							err += x * x + y * y;
							h = combo20 * VX20 + combo21 * VX21 + combo22_8;
							x = P2D20 - (combo00 * VX20 + combo01 * VX21 + combo02_8) / h;
							y = P2D21 - (combo10 * VX20 + combo11 * VX21 + combo12_8) / h;
							err += x * x + y * y;
							h = combo20 * VX30 + combo21 * VX31 + combo22_11;
							x = P2D30 - (combo00 * VX30 + combo01 * VX31 + combo02_11) / h;
							y = P2D31 - (combo10 * VX30 + combo11 * VX31 + combo12_11) / h;
							err += x * x + y * y;
							if (err < minerr) {
								minerr = err;
								ma = a_factor[t1];
								mb = b_factor[t2];
								mc = c_factor[t3];
								s1 = t1 - 1;
								s2 = t2 - 1;
								s3 = t3 - 1;
							}
						}
					}
				}
				if (s1 == 0 && s2 == 0 && s3 == 0) {
					factor *= 0.5;
				}
				a2 = ma;
				b2 = mb;
				c2 = mc;
			}
			io_rot.setAngle(ma, mb, mc);
			/* printf("factor = %10.5f\n", factor*180.0/MD_PI); */
			return minerr / 4;
		}	
	}
}