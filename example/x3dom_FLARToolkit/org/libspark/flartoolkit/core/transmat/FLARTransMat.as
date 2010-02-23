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

package org.libspark.flartoolkit.core.transmat {
	import org.libspark.flartoolkit.core.FLARSquare;
	import org.libspark.flartoolkit.core.param.FLARCameraDistortionFactor;
	import org.libspark.flartoolkit.core.param.FLARParam;
	import org.libspark.flartoolkit.core.param.FLARPerspectiveProjectionMatrix;
	import org.libspark.flartoolkit.core.transmat.fitveccalc.FLARFitVecCalculator;
	import org.libspark.flartoolkit.core.transmat.optimize.FLARRotTransOptimize;
	import org.libspark.flartoolkit.core.transmat.rotmatrix.FLARRotMatrix;
	import org.libspark.flartoolkit.core.types.FLARDoublePoint2d;
	import org.libspark.flartoolkit.core.types.FLARDoublePoint3d;	

	/**
	 * This class calculates ARMatrix from square information and holds it. --
	 * 変換行列を計算して、結果を保持するクラス。
	 * 
	 */
	public class FLARTransMat implements IFLARTransMat {

		private static const AR_GET_TRANS_CONT_MAT_MAX_FIT_ERROR:Number = 1.0;

		private var _rotmatrix:FLARRotMatrix;
		private const _center:FLARDoublePoint2d = new FLARDoublePoint2d(0, 0);
		private var _calculator:FLARFitVecCalculator;
		private const _offset:FLARTransOffset = new FLARTransOffset();
		private var _mat_optimize:FLARRotTransOptimize;

		
		public function FLARTransMat(i_param:FLARParam) {
			const dist:FLARCameraDistortionFactor = i_param.getDistortionFactor();
			const pmat:FLARPerspectiveProjectionMatrix = i_param.getPerspectiveProjectionMatrix();
			this._calculator = new FLARFitVecCalculator(pmat, dist);
			this._rotmatrix = new FLARRotMatrix(pmat);
			this._mat_optimize = new FLARRotTransOptimize(pmat);
		}

		public function setCenter(i_x:Number, i_y:Number):void {
			this._center.x = i_x;
			this._center.y = i_y;
		}

		
		
		
		/**
		 * 頂点順序をi_directionに対応して並べ替えます。
		 * @param i_square
		 * @param i_direction
		 * @param o_sqvertex_ref	FLARDoublePoint2d[]
		 * @param o_liner_ref	FLARLinear[]
		 */
		private function initVertexOrder(i_square:FLARSquare, i_direction:int, o_sqvertex_ref:Array, o_liner_ref:Array):void {
			//頂点順序を考慮した矩形の頂点情報
			o_sqvertex_ref[0] = i_square.sqvertex[(4 - i_direction) % 4];
			o_sqvertex_ref[1] = i_square.sqvertex[(5 - i_direction) % 4];
			o_sqvertex_ref[2] = i_square.sqvertex[(6 - i_direction) % 4];
			o_sqvertex_ref[3] = i_square.sqvertex[(7 - i_direction) % 4];	
			o_liner_ref[0] = i_square.line[(4 - i_direction) % 4];
			o_liner_ref[1] = i_square.line[(5 - i_direction) % 4];
			o_liner_ref[2] = i_square.line[(6 - i_direction) % 4];
			o_liner_ref[3] = i_square.line[(7 - i_direction) % 4];
			return;
		}

		
		private const __transMat_sqvertex_ref:Array = new Array(4); // FLARDoublePoint2d[]
		private const __transMat_linear_ref:Array = new Array(4); // FLARLinear[]
		private const __transMat_trans:FLARDoublePoint3d = new FLARDoublePoint3d();

		/**
		 * double arGetTransMat( ARMarkerInfo *marker_info,double center[2], double width, double conv[3][4] )
		 * 
		 * @param i_square
		 * 計算対象のFLARSquareオブジェクト
		 * @param i_direction
		 * @param i_width
		 * @return
		 * @throws FLARException
		 */
		public function transMat(i_square:FLARSquare, i_direction:int, i_width:Number, o_result_conv:FLARTransMatResult):void {
			const sqvertex_ref:Array = __transMat_sqvertex_ref; 
			// FLARDoublePoint2d[]
			const linear_ref:Array = __transMat_linear_ref; 
			// FLARLinear[]
			const trans:FLARDoublePoint3d = this.__transMat_trans;
		
			//計算用に頂点情報を初期化（順番調整）
			initVertexOrder(i_square, i_direction, sqvertex_ref, linear_ref);
		
			//基準矩形を設定
			this._offset.setSquare(i_width, this._center);

			// rotationを矩形情報から計算
			this._rotmatrix.initRotBySquare(linear_ref, sqvertex_ref);

			//平行移動量計算機にオフセット頂点をセット
			this._calculator.setOffsetSquare(this._offset);
		
			//平行移動量計算機に適応先矩形の情報をセット
			this._calculator.setFittedSquare(sqvertex_ref);	

			//回転行列の平行移動量の計算
			this._calculator.calculateTransfer(this._rotmatrix, trans);
		
			//計算結果の最適化(this._rotmatrix,trans)
			this._mat_optimize.optimize(this._rotmatrix, trans, this._calculator);
		
			// マトリクスの保存
			o_result_conv.updateMatrixValue(this._rotmatrix, this._offset.point, trans);
			return;
		}

		/**
		 * double arGetTransMatCont( ARMarkerInfo *marker_info, double prev_conv[3][4],double center[2], double width, double conv[3][4] )
		 * 
		 * @param i_square
		 * @param i_direction
		 * マーカーの方位を指定する。
		 * @param i_width
		 * @param io_result_conv
		 * 計算履歴を持つFLARTransMatResultオブジェクトを指定する。 履歴を持たない場合は、transMatと同じ処理を行う。
		 * @return
		 * @throws FLARException
		 */
		public function transMatContinue(i_square:FLARSquare, i_direction:int, i_width:Number, io_result_conv:FLARTransMatResult):void {
			const sqvertex_ref:Array = __transMat_sqvertex_ref; 
			// FLARDoublePoint2d[]
			const linear_ref:Array = __transMat_linear_ref; 
			// FLARLinear[]
			const trans:FLARDoublePoint3d = this.__transMat_trans;

			// io_result_convが初期値なら、transMatで計算する。
			if (!io_result_conv.hasValue()) {
				this.transMat(i_square, i_direction, i_width, io_result_conv);
				return;
			}

			//計算用に頂点情報を初期化（順番調整）
			initVertexOrder(i_square, i_direction, sqvertex_ref, linear_ref);
		
			//基準矩形を設定
			this._offset.setSquare(i_width, this._center);

			// rotationを矩形情報を一つ前の変換行列で初期化
			this._rotmatrix.initRotByPrevResult(io_result_conv);

			//平行移動量計算機に、オフセット頂点をセット
			this._calculator.setOffsetSquare(this._offset);
		
			//平行移動量計算機に、適応先矩形の情報をセット
			this._calculator.setFittedSquare(sqvertex_ref);	
				
			//回転行列の平行移動量の計算
			this._calculator.calculateTransfer(this._rotmatrix, trans);
		
			//計算結果の最適化(this._rotmatrix,trans)
			const err:Number = this._mat_optimize.optimize(this._rotmatrix, trans, this._calculator);
		
			//計算結果を保存
			io_result_conv.updateMatrixValue(this._rotmatrix, this._offset.point, trans);

			// エラー値が許容範囲でなければTransMatをやり直し
			if (err > AR_GET_TRANS_CONT_MAT_MAX_FIT_ERROR) {
				// rotationを矩形情報で初期化
				this._rotmatrix.initRotBySquare(linear_ref, sqvertex_ref);
				//回転行列の平行移動量の計算
				this._calculator.calculateTransfer(this._rotmatrix, trans);
				//計算結果の最適化(this._rotmatrix,trans)
				const err2:Number = this._mat_optimize.optimize(this._rotmatrix, trans, this._calculator);
				//エラー値が低かったら値を差換え
				if (err2 < err) {
					// 良い値が取れたら、差換え
					io_result_conv.updateMatrixValue(this._rotmatrix, this._offset.point, trans);
				}
			}
			return;
		}
	}
}