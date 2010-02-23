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

package org.libspark.flartoolkit.core.transmat.fitveccalc {
	import org.libspark.flartoolkit.core.FLARMat;
	import org.libspark.flartoolkit.core.param.FLARCameraDistortionFactor;
	import org.libspark.flartoolkit.core.param.FLARPerspectiveProjectionMatrix;
	import org.libspark.flartoolkit.core.transmat.FLARTransOffset;
	import org.libspark.flartoolkit.core.types.FLARDoublePoint2d;	

	/**
	 * 平行移動量を計算するクラス
	 * 
	 * FLARPerspectiveProjectionMatrixに直接アクセスしてる場所があるけど、
	 * この辺の計算はFLARPerspectiveProjectionMatrixクラスの関数にして押し込む予定。
	 *
	 */
	public class FLARFitVecCalculator {

		private const _mat_b:FLARMat = new FLARMat(3, 8); //3,NUMBER_OF_VERTEX*2
		private const _mat_a:FLARMat = new FLARMat(8, 3); /*NUMBER_OF_VERTEX,3*/
		private const _mat_d:FLARMat = new FLARMat(3, 3);
		private var _projection_mat:FLARPerspectiveProjectionMatrix;
		private var _distortionfactor:FLARCameraDistortionFactor;
		
		//	private FLARDoublePoint2d[] _vertex_2d_ref;
		public function FLARFitVecCalculator(i_projection_mat_ref:FLARPerspectiveProjectionMatrix, i_distortion_ref:FLARCameraDistortionFactor) {
			// 変換マトリクスdとbの準備(arGetTransMatSubの一部)
			const a_array:Array = this._mat_a.getArray(); // double[][]
			const b_array:Array = this._mat_b.getArray(); // double[][]

			//変換用行列のcpara固定値の部分を先に初期化してしまう。
			var i:int;
			var x2:int;
			for (i = 0; i < 4; i++) {
				x2 = i * 2;
				a_array[x2][0] = b_array[0][x2] = i_projection_mat_ref.m00; // mat_a->m[j*6+0]=mat_b->m[num*0+j*2] =cpara[0][0];
				a_array[x2][1] = b_array[1][x2] = i_projection_mat_ref.m01; // mat_a->m[j*6+1]=mat_b->m[num*2+j*2]=cpara[0][1];
				//a_array[x2][2] = b_array[2][x2] = cpara[0 * 4 + 2] - o_marker_vertex_2d[i].x;// mat_a->m[j*6+2]=mat_b->m[num*4+j*2]=cpara[0][2]-pos2d[j][0];
				a_array[x2 + 1][0] = b_array[0][x2 + 1] = 0.0; // mat_a->m[j*6+3] =mat_b->m[num*0+j*2+1]= 0.0;
				a_array[x2 + 1][1] = b_array[1][x2 + 1] = i_projection_mat_ref.m11;// mat_a->m[j*6+4] =mat_b->m[num*2+j*2+1]= cpara[1][1];
				//a_array[x2 + 1][2] = b_array[2][x2 + 1] = cpara[1 * 4 + 2] - o_marker_vertex_2d[i].y;// mat_a->m[j*6+5]=mat_b->m[num*4+j*2+1]=cpara[1][2]-pos2d[j][1];
			}
			this._projection_mat = i_projection_mat_ref;
			this._distortionfactor = i_distortion_ref;
			return;
		}

		private const _fitsquare_vertex:Array = FLARDoublePoint2d.createArray(4); // FLARDoublePoint2d[]
		private var _offset_square:FLARTransOffset;

		public function setOffsetSquare(i_offset:FLARTransOffset):void {
			this._offset_square = i_offset;
			return;
		}

		/**
		 * @return FLARDoublePoint2d[]
		 */
		public function getFitSquare():Array {
			return this._fitsquare_vertex;
		}

		public function getOffsetVertex():FLARTransOffset {
			return this._offset_square;
		}

		/**
		 * 適合させる矩形座標を指定します。
		 * @param i_square_vertex	FLARDoublePoint2d[]
		 * @throws FLARException
		 */
		public function setFittedSquare(i_square_vertex:Array):void {
			const vertex:Array = _fitsquare_vertex; 
			// FLARDoublePoint2d[]
			//		int i;
			//		if (arFittingMode == AR_FITTING_TO_INPUT) {
			//			// arParamIdeal2Observをバッチ処理
			this._distortionfactor.ideal2ObservBatch(i_square_vertex, vertex, 4);
			//		} else {
			//			for (i = 0; i < NUMBER_OF_VERTEX; i++) {
			//				o_marker_vertex_2d[i].x = i_square_vertex[i].x;
			//				o_marker_vertex_2d[i].y = i_square_vertex[i].y;
			//			}
			//		}		

			
			const cpara02:Number = this._projection_mat.m02;
			const cpara12:Number = this._projection_mat.m12;		
			const mat_d:FLARMat = _mat_d;
			const mat_a:FLARMat = this._mat_a;
			const mat_b:FLARMat = this._mat_b;
			const a_array:Array = mat_a.getArray(); // double[][]
			const b_array:Array = mat_b.getArray(); // double[][]
			
			var i:int;
			var x2:int;
			for (i = 0; i < 4; i++) {
				x2 = i * 2;	
				a_array[x2][2] = b_array[2][x2] = cpara02 - vertex[i].x; // mat_a->m[j*6+2]=mat_b->m[num*4+j*2]=cpara[0][2]-pos2d[j][0];
				a_array[x2 + 1][2] = b_array[2][x2 + 1] = cpara12 - vertex[i].y; // mat_a->m[j*6+5]=mat_b->m[num*4+j*2+1]=cpara[1][2]-pos2d[j][1];
			}
			// mat_d
			mat_d.matrixMul(mat_b, mat_a);
			mat_d.matrixSelfInv();		
			return;
		}
		import org.libspark.flartoolkit.core.FLARMat;
		import org.libspark.flartoolkit.core.transmat.rotmatrix.FLARRotMatrix;
		import org.libspark.flartoolkit.core.types.FLARDoublePoint3d;

		private const _mat_e:FLARMat = new FLARMat(3, 1);
		private const _mat_f:FLARMat = new FLARMat(3, 1);
		private const __calculateTransferVec_mat_c:FLARMat = new FLARMat(8, 1); //NUMBER_OF_VERTEX * 2, 1
		private const __calculateTransfer_point3d:Array = FLARDoublePoint3d.createArray(4); 
		
		// FLARDoublePoint3d[]
	
		/**
		 * 現在のオフセット矩形、適合先矩形と、回転行列から、平行移動量を計算します。
		 * @param i_rotation
		 * @param o_transfer
		 * @throws FLARException
		 */
		public function calculateTransfer(i_rotation:FLARRotMatrix, o_transfer:FLARDoublePoint3d):void {
			// assert(this._offset_square!=null);
			const cpara00:Number = this._projection_mat.m00;
			const cpara01:Number = this._projection_mat.m01;
			const cpara02:Number = this._projection_mat.m02;
			const cpara11:Number = this._projection_mat.m11;
			const cpara12:Number = this._projection_mat.m12;
		
			const point3d:Array = this.__calculateTransfer_point3d; // FLARDoublePoint3d[]
			const vertex3d:Array = this._offset_square.vertex; // FLARDoublePoint3d[]		
			const vertex2d:Array = this._fitsquare_vertex; // FLARDoublePoint2d[]
			const mat_c:FLARMat = this.__calculateTransferVec_mat_c; // 次処理で値をもらうので、初期化の必要は無い。

			const f_array:Array = this._mat_f.getArray(); // double[][]
			const c_array:Array = mat_c.getArray(); // double[][]
		
		
			//（3D座標？）を一括請求
			i_rotation.getPoint3dBatch(vertex3d, point3d, 4);
			
			var i:int;
			var x2:int;
			var point3d_ptr:FLARDoublePoint3d;
			for (i = 0;i < 4; i++) {
				x2 = i + i;
				point3d_ptr = point3d[i];
				//			i_rotation.getPoint3d(vertex3d[i],point3d);
				//透視変換？
				c_array[x2][0] = point3d_ptr.z * vertex2d[i].x - cpara00 * point3d_ptr.x - cpara01 * point3d_ptr.y - cpara02 * point3d_ptr.z;
				// mat_c->m[j*2+0] = wz*pos2d[j][0]-cpara[0][0]*wx-cpara[0][1]*wy-cpara[0][2]*wz;
				c_array[x2 + 1][0] = point3d_ptr.z * vertex2d[i].y - cpara11 * point3d_ptr.y - cpara12 * point3d_ptr.z;// mat_c->m[j*2+1]= wz*pos2d[j][1]-cpara[1][1]*wy-cpara[1][2]*wz;
			}
			this._mat_e.matrixMul(this._mat_b, mat_c);
			this._mat_f.matrixMul(this._mat_d, this._mat_e);

			// double[] trans=wk_arGetTransMatSub_trans;//double trans[3];
			o_transfer.x = f_array[0][0]; // trans[0] = mat_f->m[0];
			o_transfer.y = f_array[1][0];
			o_transfer.z = f_array[2][0]; // trans[2] = mat_f->m[2];
			return;
		}
	}
}