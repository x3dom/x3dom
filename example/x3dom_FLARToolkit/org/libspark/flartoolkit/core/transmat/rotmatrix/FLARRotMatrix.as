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

package org.libspark.flartoolkit.core.transmat.rotmatrix {
	import org.libspark.flartoolkit.core.param.FLARPerspectiveProjectionMatrix;
	import org.libspark.flartoolkit.core.transmat.FLARTransMatResult;
	import org.libspark.flartoolkit.core.types.FLARDoublePoint3d;
	import org.libspark.flartoolkit.core.types.matrix.FLARDoubleMatrix33;	

	/**
	 * 回転行列計算用の、3x3行列
	 *
	 */
	public class FLARRotMatrix extends FLARDoubleMatrix33 {	

		/**
		 * インスタンスを準備します。
		 * 
		 * @param i_param
		 */
		public function FLARRotMatrix(i_matrix:FLARPerspectiveProjectionMatrix) {
			this.__initRot_vec1 = new FLARRotVector(i_matrix);
			this.__initRot_vec2 = new FLARRotVector(i_matrix);
			return;
		}

		private var __initRot_vec1:FLARRotVector;
		private var __initRot_vec2:FLARRotVector;
		
		
		public function initRotByPrevResult(i_prev_result:FLARTransMatResult):void {

			this.m00 = i_prev_result.m00;
			this.m01 = i_prev_result.m01;
			this.m02 = i_prev_result.m02;

			this.m10 = i_prev_result.m10;
			this.m11 = i_prev_result.m11;
			this.m12 = i_prev_result.m12;

			this.m20 = i_prev_result.m20;
			this.m21 = i_prev_result.m21;
			this.m22 = i_prev_result.m22;
			return;
		}	

		/**
		 * @param i_linear FLARLinear[]
		 * @param i_sqvertex FLARDoublePoint2d[]
		 */
		public function initRotBySquare( i_linear:Array,  i_sqvertex:Array):void {
			const vec1:FLARRotVector = this.__initRot_vec1;
			const vec2:FLARRotVector = this.__initRot_vec2;

			//向かい合った辺から、２本のベクトルを計算
		
			//軸１
			vec1.exteriorProductFromLinear(i_linear[0], i_linear[2]);
			vec1.checkVectorByVertex(i_sqvertex[0], i_sqvertex[1]);

			//軸２
			vec2.exteriorProductFromLinear(i_linear[1], i_linear[3]);
			vec2.checkVectorByVertex(i_sqvertex[3], i_sqvertex[0]);

			//回転の最適化？
			FLARRotVector.checkRotation(vec1, vec2);

			this.m00 = vec1.v1;
			this.m10 = vec1.v2;
			this.m20 = vec1.v3;
			this.m01 = vec2.v1;
			this.m11 = vec2.v2;
			this.m21 = vec2.v3;
		
			//最後の軸を計算
			const w02:Number = vec1.v2 * vec2.v3 - vec1.v3 * vec2.v2;
			const w12:Number = vec1.v3 * vec2.v1 - vec1.v1 * vec2.v3;
			const w22:Number = vec1.v1 * vec2.v2 - vec1.v2 * vec2.v1;
			const w:Number = Math.sqrt(w02 * w02 + w12 * w12 + w22 * w22);
			this.m02 = w02 / w;
			this.m12 = w12 / w;
			this.m22 = w22 / w;
			return;
		}

		
		
		/**
		 * int arGetAngle( double rot[3][3], double *wa, double *wb, double *wc )
		 * Optimize:2008.04.20:STEP[481→433]
		 * 3x3変換行列から、回転角を復元して返します。
		 * @param o_angle
		 * @return
		 */
		public function getAngle(o_angle:FLARDoublePoint3d):void {
			var a:Number,b:Number,c:Number;
			var sina:Number, cosa:Number, sinb:Number, cosb:Number, sinc:Number, cosc:Number;
		
			if (this.m22 > 1.0) {
				// <Optimize/>if( rot[2][2] > 1.0 ) {
				this.m22 = 1.0;// <Optimize/>rot[2][2] = 1.0;
			} else if (this.m22 < -1.0) {
				// <Optimize/>}else if( rot[2][2] < -1.0 ) {
				this.m22 = -1.0;// <Optimize/>rot[2][2] = -1.0;
			}
			cosb = this.m22;
			// <Optimize/>cosb = rot[2][2];
			b = Math.acos(cosb);
			sinb = Math.sin(b);
			const rot02:Number = this.m02;
			const rot12:Number = this.m12;
			if (b >= 0.000001 || b <= -0.000001) {
				cosa = rot02 / sinb;
				// <Optimize/>cosa = rot[0][2] / sinb;
				sina = rot12 / sinb;
				// <Optimize/>sina = rot[1][2] / sinb;
				if (cosa > 1.0) {
					/* printf("cos(alph) = %f\n", cosa); */
					cosa = 1.0;
					sina = 0.0;
				}
				if (cosa < -1.0) {
					/* printf("cos(alph) = %f\n", cosa); */
					cosa = -1.0;
					sina = 0.0;
				}
				if (sina > 1.0) {
					/* printf("sin(alph) = %f\n", sina); */
					sina = 1.0;
					cosa = 0.0;
				}
				if (sina < -1.0) {
					/* printf("sin(alph) = %f\n", sina); */
					sina = -1.0;
					cosa = 0.0;
				}
				a = Math.acos(cosa);
				if (sina < 0) {
					a = -a;
				}
				// <Optimize>
				// sinc = (rot[2][1]*rot[0][2]-rot[2][0]*rot[1][2])/(rot[0][2]*rot[0][2]+rot[1][2]*rot[1][2]);
				// cosc = -(rot[0][2]*rot[2][0]+rot[1][2]*rot[2][1])/(rot[0][2]*rot[0][2]+rot[1][2]*rot[1][2]);
				const tmp:Number = (rot02 * rot02 + rot12 * rot12);
				sinc = (this.m21 * rot02 - this.m20 * rot12) / tmp;
				cosc = -(rot02 * this.m20 + rot12 * this.m21) / tmp;
				// </Optimize>

				if (cosc > 1.0) {
					/* printf("cos(r) = %f\n", cosc); */
					cosc = 1.0;
					sinc = 0.0;
				}
				if (cosc < -1.0) {
					/* printf("cos(r) = %f\n", cosc); */
					cosc = -1.0;
					sinc = 0.0;
				}
				if (sinc > 1.0) {
					/* printf("sin(r) = %f\n", sinc); */
					sinc = 1.0;
					cosc = 0.0;
				}
				if (sinc < -1.0) {
					/* printf("sin(r) = %f\n", sinc); */
					sinc = -1.0;
					cosc = 0.0;
				}
				c = Math.acos(cosc);
				if (sinc < 0) {
					c = -c;
				}
			} else {
				a = b = 0.0;
				cosa = cosb = 1.0;
				sina = sinb = 0.0;
				cosc = this.m00;
				//cosc = rot[0];// <Optimize/>cosc = rot[0][0];
				sinc = this.m01;
				//sinc = rot[1];// <Optimize/>sinc = rot[1][0];
				if (cosc > 1.0) {
					/* printf("cos(r) = %f\n", cosc); */
					cosc = 1.0;
					sinc = 0.0;
				}
				if (cosc < -1.0) {
					/* printf("cos(r) = %f\n", cosc); */
					cosc = -1.0;
					sinc = 0.0;
				}
				if (sinc > 1.0) {
					/* printf("sin(r) = %f\n", sinc); */
					sinc = 1.0;
					cosc = 0.0;
				}
				if (sinc < -1.0) {
					/* printf("sin(r) = %f\n", sinc); */
					sinc = -1.0;
					cosc = 0.0;
				}
				c = Math.acos(cosc);
				if (sinc < 0) {
					c = -c;
				}
			}
			o_angle.x = a;
			// wa.value=a;//*wa = a;
			o_angle.y = b;
			// wb.value=b;//*wb = b;
			o_angle.z = c;
			// wc.value=c;//*wc = c;
			return;
		}

		/**
		 * 回転角から回転行列を計算してセットします。
		 * @param i_x
		 * @param i_y
		 * @param i_z
		 */
		public function setAngle(i_x:Number, i_y:Number, i_z:Number):void {
			const sina:Number = Math.sin(i_x);
			const cosa:Number = Math.cos(i_x);
			const sinb:Number = Math.sin(i_y);
			const cosb:Number = Math.cos(i_y);
			const sinc:Number = Math.sin(i_z);
			const cosc:Number = Math.cos(i_z);
			// Optimize
			const CACA:Number = cosa * cosa;
			const SASA:Number = sina * sina;
			const SACA:Number = sina * cosa;
			const SASB:Number = sina * sinb;
			const CASB:Number = cosa * sinb;
			const SACACB:Number = SACA * cosb;

			this.m00 = CACA * cosb * cosc + SASA * cosc + SACACB * sinc - SACA * sinc;
			this.m01 = -CACA * cosb * sinc - SASA * sinc + SACACB * cosc - SACA * cosc;
			this.m02 = CASB;
			this.m10 = SACACB * cosc - SACA * cosc + SASA * cosb * sinc + CACA * sinc;
			this.m11 = -SACACB * sinc + SACA * sinc + SASA * cosb * cosc + CACA * cosc;
			this.m12 = SASB;
			this.m20 = -CASB * cosc - SASB * sinc;
			this.m21 = CASB * sinc - SASB * cosc;
			this.m22 = cosb;
			return;
		}

		/**
		 * i_in_pointを変換行列で座標変換する。
		 * @param i_in_point
		 * @param i_out_point
		 */
		public function getPoint3d(i_in_point:FLARDoublePoint3d, i_out_point:FLARDoublePoint3d):void {
			const x:Number = i_in_point.x;
			const y:Number = i_in_point.y;
			const z:Number = i_in_point.z;
			i_out_point.x = this.m00 * x + this.m01 * y + this.m02 * z;
			i_out_point.y = this.m10 * x + this.m11 * y + this.m12 * z;
			i_out_point.z = this.m20 * x + this.m21 * y + this.m22 * z;
			return;
		}

		/**
		 * 複数の頂点を一括して変換する
		 * @param i_in_point	FLARDoublePoint3d[]
		 * @param i_out_point	FLARDoublePoint3d[]
		 * @param i_number_of_vertex
		 */
		public function getPoint3dBatch(i_in_point:Array, i_out_point:Array, i_number_of_vertex:int):void {
			for(var i:int = i_number_of_vertex - 1; i >= 0; i--) {
				var out_ptr:FLARDoublePoint3d = i_out_point[i];
				var in_ptr:FLARDoublePoint3d = i_in_point[i];
				var x:Number = in_ptr.x;
				var y:Number = in_ptr.y;
				var z:Number = in_ptr.z;
				out_ptr.x = this.m00 * x + this.m01 * y + this.m02 * z;
				out_ptr.y = this.m10 * x + this.m11 * y + this.m12 * z;
				out_ptr.z = this.m20 * x + this.m21 * y + this.m22 * z;
			}
			return;
		}	
	}
}