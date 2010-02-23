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

package org.libspark.flartoolkit.detector {
	import org.libspark.flartoolkit.core.pickup.FLARDynamicRatioColorPatt_O3;
	import org.libspark.flartoolkit.FLARException;
	import org.libspark.flartoolkit.core.FLARCode;
	import org.libspark.flartoolkit.core.FLARSquare;
	import org.libspark.flartoolkit.core.FLARSquareDetector;
	import org.libspark.flartoolkit.core.FLARSquareStack;
	import org.libspark.flartoolkit.core.IFLARSquareDetector;
	import org.libspark.flartoolkit.core.match.FLARMatchPatt_Color_WITHOUT_PCA;
	import org.libspark.flartoolkit.core.param.FLARParam;
	import org.libspark.flartoolkit.core.pickup.FLARColorPatt_O3;
	import org.libspark.flartoolkit.core.pickup.IFLARColorPatt;
	import org.libspark.flartoolkit.core.raster.FLARRaster_BitmapData;
	import org.libspark.flartoolkit.core.raster.IFLARRaster;
	import org.libspark.flartoolkit.core.raster.rgb.IFLARRgbRaster;
	import org.libspark.flartoolkit.core.rasterfilter.rgb2bin.FLARRasterFilter_BitmapDataThreshold;
	import org.libspark.flartoolkit.core.rasterfilter.rgb2bin.IFLARRasterFilter_RgbToBin;
	import org.libspark.flartoolkit.core.transmat.FLARTransMat;
	import org.libspark.flartoolkit.core.transmat.FLARTransMatResult;
	import org.libspark.flartoolkit.core.transmat.IFLARTransMat;
	import org.libspark.flartoolkit.core.types.FLARIntSize;	

	/**
	 * 画像からARCodeに最も一致するマーカーを1個検出し、その変換行列を計算するクラスです。
	 * 
	 */
	public class FLARSingleMarkerDetector {

		private static const AR_SQUARE_MAX:int = 100;

		private var _sizeCheckEnabled:Boolean = true;
		private var _is_continue:Boolean = false;
		private var _match_patt:FLARMatchPatt_Color_WITHOUT_PCA;
		private var _square_detect:IFLARSquareDetector;

		private const _square_list:FLARSquareStack = new FLARSquareStack(AR_SQUARE_MAX);

		private var _code:FLARCode;

		protected var _transmat:IFLARTransMat;

		private var _marker_width:Number;

		// 検出結果の保存用
		private var _detected_direction:int;
		private var _detected_confidence:Number;
		private var _detected_square:FLARSquare;

		private var _patt:IFLARColorPatt;
		private var _bin_raster:IFLARRaster;
		private var _tobin_filter:IFLARRasterFilter_RgbToBin;

		public function get filter ():IFLARRasterFilter_RgbToBin { return _tobin_filter; }
		public function set filter (f:IFLARRasterFilter_RgbToBin):void { if (f != null) _tobin_filter = f; }

		/**
		 * 検出するARCodeとカメラパラメータから、1個のARCodeを検出するFLARSingleDetectMarkerインスタンスを作ります。
		 * 
		 * @param i_param
		 * カメラパラメータを指定します。
		 * @param i_code
		 * 検出するARCodeを指定します。
		 * @param i_marker_width
		 * ARコードの物理サイズを、ミリメートルで指定します。
		 * @throws FLARException
		 */
		public function FLARSingleMarkerDetector(i_param:FLARParam, i_code:FLARCode, i_marker_width:Number) {
			const scr_size:FLARIntSize = i_param.getScreenSize();		
			// 解析オブジェクトを作る
			this._square_detect = new FLARSquareDetector(i_param.getDistortionFactor(), scr_size);
			this._transmat = new FLARTransMat(i_param);
			// 比較コードを保存
			this._code = i_code;
			this._marker_width = i_marker_width;

			// 評価パターンのホルダを作る

			//マーカ幅を算出
			var markerWidthByDec:Number = this._code.markerPercentWidth/10;
			//マーカ高を算出
			var markerHeightByDec:Number = this._code.markerPercentHeight / 10;

			//評価パターンのホルダを作成
			this._patt = new FLARDynamicRatioColorPatt_O3(this._code.getWidth(), 
														  this._code.getHeight(),
														  markerWidthByDec,
														  markerHeightByDec);

			// 評価器を作る。
			this._match_patt = new FLARMatchPatt_Color_WITHOUT_PCA();
			//２値画像バッファを作る
			this._bin_raster = new FLARRaster_BitmapData(scr_size.w, scr_size.h);
			//2値画像化フィルタの作成
			this._tobin_filter= new FLARRasterFilter_BitmapDataThreshold(100);
		}

		/**
		 * i_imageにマーカー検出処理を実行し、結果を記録します。
		 * 
		 * @param i_raster
		 * マーカーを検出するイメージを指定します。イメージサイズは、カメラパラメータ
		 * と一致していなければなりません。
		 * @return マーカーが検出できたかを真偽値で返します。
		 * @throws FLARException
		 */
		public function detectMarkerLite(i_raster:IFLARRgbRaster, i_threshold:int):Boolean {
			//サイズチェック
			if (!this._bin_raster.getSize().isEqualSizeO(i_raster.getSize())) {
				if (this._sizeCheckEnabled ) 
					throw new FLARException("サイズ不一致(" + this._bin_raster.getSize() + ":" + i_raster.getSize());
				else {
					//サイズに合わせて、２値画像バッファを作る
					this._bin_raster = new FLARRaster_BitmapData(i_raster.getSize().w, i_raster.getSize().h);
				}
			}

			//ラスタを２値イメージに変換する.
			this._tobin_filter.setThreshold(i_threshold);
			this._tobin_filter.doFilter(i_raster, this._bin_raster);
		
		
			this._detected_square = null;
			var l_square_list:FLARSquareStack = this._square_list;
			// スクエアコードを探す
			this._square_detect.detectMarker(this._bin_raster, l_square_list);


			var number_of_square:int = l_square_list.getLength();
			// コードは見つかった？
			if (number_of_square < 1) {
				return false;
			}

			// 評価基準になるパターンをイメージから切り出す
			if (!this._patt.pickFromRaster(i_raster, l_square_list.getItem(0) as FLARSquare)) {
				// パターンの切り出しに失敗
				return false;
			}
			// パターンを評価器にセット
			if (!this._match_patt.setPatt(this._patt)) {
				// 計算に失敗した。
				return false;
			}
			// コードと比較する
			this._match_patt.evaluate(this._code);
			var square_index:int = 0;
			var direction:int = this._match_patt.getDirection();
			var confidence:Number = this._match_patt.getConfidence();
			
			var i:int;
			var c2:Number;
			for (i = 1;i < number_of_square; i++) {
				// 次のパターンを取得
				this._patt.pickFromRaster(i_raster, l_square_list.getItem(i) as FLARSquare);
				// 評価器にセットする。
				this._match_patt.setPatt(this._patt);
				// コードと比較する
				this._match_patt.evaluate(this._code);
				c2 = this._match_patt.getConfidence();
				if (confidence > c2) {
					continue;
				}
				// もっと一致するマーカーがあったぽい
				square_index = i;
				direction = this._match_patt.getDirection();
				confidence = c2;
			}
			// マーカー情報を保存
			this._detected_square = l_square_list.getItem(square_index) as FLARSquare;
			this._detected_direction = direction;
			this._detected_confidence = confidence;
			return true;
		}

		/**
		 * 検出したマーカーの変換行列を計算して、o_resultへ値を返します。
		 * 直前に実行したdetectMarkerLiteが成功していないと使えません。
		 * 
		 * @param o_result
		 * 変換行列を受け取るオブジェクトを指定します。
		 * @throws FLARException
		 */
		public function getTransformMatrix(o_result:FLARTransMatResult):void {
			// 一番一致したマーカーの位置とかその辺を計算
			if (this._is_continue) {
				this._transmat.transMatContinue(this._detected_square, this._detected_direction, this._marker_width, o_result);
			} else {
				this._transmat.transMat(this._detected_square, this._detected_direction, this._marker_width, o_result);
			}
			return;
		}

		/**
		 * 検出したマーカーの一致度を返します。
		 * 
		 * @return マーカーの一致度を返します。0～1までの値をとります。 一致度が低い場合には、誤認識の可能性が高くなります。
		 * @throws FLARException
		 */
		public function getConfidence():Number {
			return this._detected_confidence;
		}

		/**
		 * 検出したマーカーの方位を返します。
		 * 
		 * @return 0,1,2,3の何れかを返します。
		 */
		public function getDirection():int {
			return this._detected_direction;
		}

		/**
		 * getTransmationMatrixの計算モードを設定します。 初期値はTRUEです。
		 * 
		 * @param i_is_continue
		 * TRUEなら、transMatCont互換の計算をします。 FALSEなら、transMat互換の計算をします。
		 */
		public function setContinueMode(i_is_continue:Boolean):void {
			this._is_continue = i_is_continue;
		}
		
		/**
		 * @return 検出した FLARSquare 1 個返す。検出できなかったら null。
		 */
		public function getSquare():FLARSquare {
			return this._detected_square;
		}
		
		/**
		 * @return 検出した全ての四角形を含む FLARSquareStack を返す。
		 */
		public function getSquareList():FLARSquareStack {
			return this._square_list;
		}
		
		/**
		 * 入力画像のサイズチェックをする／しない的な。（デフォルトではチェックする）
		 */
		public function get sizeCheckEnabled():Boolean {
			return this._sizeCheckEnabled;
		}
		public function set sizeCheckEnabled(value:Boolean):void {
			this._sizeCheckEnabled = value;
		}
	}
}