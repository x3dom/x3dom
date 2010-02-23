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
	import flash.display.BitmapData;
	import flash.geom.Point;
	
	import org.libspark.flartoolkit.FLARException;
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
	import org.libspark.flartoolkit.core.raster.rgb.FLARRgbRaster_BitmapData;
	import org.libspark.flartoolkit.core.raster.rgb.IFLARRgbRaster;
	import org.libspark.flartoolkit.core.rasterfilter.rgb2bin.FLARRasterFilter_BitmapDataThreshold;
	import org.libspark.flartoolkit.core.transmat.FLARTransMat;
	import org.libspark.flartoolkit.core.transmat.FLARTransMatResult;
	import org.libspark.flartoolkit.core.transmat.IFLARTransMat;
	import org.libspark.flartoolkit.core.types.FLARIntSize;	

	/**
	 * 複数のマーカーを検出し、それぞれに最も一致するARコードを、コンストラクタで登録したARコードから 探すクラスです。
	 * 最大300個を認識しますが、ゴミラベルを認識したりするので100個程度が限界です。
	 * 
	 */
	public class FLARMultiMarkerDetector {

		private static const AR_SQUARE_MAX:int = 300;
		private var _sizeCheckEnabled:Boolean = true;

		private var _is_continue:Boolean = false;

		private var _match_patt:FLARMatchPatt_Color_WITHOUT_PCA;

		private var _square_detect:IFLARSquareDetector;

		private const _square_list:FLARSquareStack = new FLARSquareStack(AR_SQUARE_MAX);

		private var _codes:Array; // FLARCode[]

		protected var _transmat:IFLARTransMat;

		private var _marker_width:Array; // double[]

		private var _number_of_code:int;

		// 検出結果の保存用
		private var _patt:IFLARColorPatt;

		private var _result_holder:FLARMultiMarkerDetectorResultHolder = new FLARMultiMarkerDetectorResultHolder();

		/**
		 * 複数のマーカーを検出し、最も一致するARCodeをi_codeから検索するオブジェクトを作ります。
		 * 
		 * @param i_param
		 * カメラパラメータを指定します。
		 * @param i_code	FLARCode[] 
		 * 検出するマーカーのARCode配列を指定します。配列要素のインデックス番号が、そのままgetARCodeIndex関数で 得られるARCodeインデックスになります。 例えば、要素[1]のARCodeに一致したマーカーである場合は、getARCodeIndexは1を返します。
		 * 先頭からi_number_of_code個の要素には、有効な値を指定する必要があります。
		 * @param i_marker_width	double[] 
		 * i_codeのマーカーサイズをミリメートルで指定した配列を指定します。 先頭からi_number_of_code個の要素には、有効な値を指定する必要があります。
		 * @param i_number_of_code
		 * i_codeに含まれる、ARCodeの数を指定します。
		 * @throws FLARException
		 */
		public function FLARMultiMarkerDetector(i_param:FLARParam, i_code:Array, i_marker_width:Array, i_number_of_code:int) {
			const scr_size:FLARIntSize = i_param.getScreenSize();
			// 解析オブジェクトを作る
			this._square_detect = new FLARSquareDetector(i_param.getDistortionFactor(), scr_size);
			this._transmat = new FLARTransMat(i_param);
			// 比較コードを保存
			this._codes = i_code;
			// 比較コードの解像度は全部同じかな？（違うとパターンを複数種つくらないといけないから）
			const cw:int = i_code[0].getWidth();
			const ch:int = i_code[0].getHeight();
			for (var i:int = 1; i < i_number_of_code; i++) {
				if (cw != i_code[i].getWidth() || ch != i_code[i].getHeight()) {
					// 違う解像度のが混ざっている。
					//throw new FLARException();
					throw new FLARException("all patterns in an application must be the same width and height.");
				}
			}
			// 評価パターンのホルダを作る
			this._patt = new FLARColorPatt_O3(cw, ch);
			this._number_of_code = i_number_of_code;

			this._marker_width = i_marker_width;
			// 評価器を作る。
			this._match_patt = new FLARMatchPatt_Color_WITHOUT_PCA();
			//２値画像バッファを作る
//			this._bin_raster = new FLARBinRaster(scr_size.w, scr_size.h);
			this._bin_raster = new FLARRaster_BitmapData(scr_size.w, scr_size.h);
		}

		private var _bin_raster:IFLARRaster;

//		private var _tobin_filter:FLARRasterFilter_ARToolkitThreshold = new FLARRasterFilter_ARToolkitThreshold(100);
		private var _tobin_filter:FLARRasterFilter_BitmapDataThreshold = new FLARRasterFilter_BitmapDataThreshold(100);

		/**
		 * i_imageにマーカー検出処理を実行し、結果を記録します。
		 * 
		 * @param i_raster
		 * マーカーを検出するイメージを指定します。
		 * @param i_thresh
		 * 検出閾値を指定します。0～255の範囲で指定してください。 通常は100～130くらいを指定します。
		 * @return 見つかったマーカーの数を返します。 マーカーが見つからない場合は0を返します。
		 * @throws FLARException
		 */
		public function detectMarkerLite(i_raster:IFLARRgbRaster, i_threshold:int):int {
			// サイズチェック
			if(this._sizeCheckEnabled && !this._bin_raster.getSize().isEqualSizeO(i_raster.getSize())) {
				throw new FLARException("サイズ不一致(" + this._bin_raster.getSize() + ":" + i_raster.getSize());
			}

			// ラスタを２値イメージに変換する.
			// SOC: threshold incoming image according to brightness.
			//		passing -1 for threshold allows developers to apply custom thresholding algorithms
			//		prior to passing source image to FLARToolkit.
			if (i_threshold != -1) {
				// apply FLARToolkit thresholding
				this._tobin_filter.setThreshold(i_threshold);
				this._tobin_filter.doFilter(i_raster, this._bin_raster);
			} else {
				// copy source BitmapData as-is, without applying FLARToolkit thresholding
				var srcBitmapData:BitmapData = FLARRgbRaster_BitmapData(i_raster).bitmapData;
				var dstBitmapData:BitmapData = FLARRaster_BitmapData(this._bin_raster).bitmapData;
				dstBitmapData.copyPixels(srcBitmapData, srcBitmapData.rect, new Point());
			}

			var l_square_list:FLARSquareStack = this._square_list;
			// スクエアコードを探す
			// SOC: begin by detecting all possible markers ('square' outlines (may be rotated in any of three axes relative to camera))
			this._square_detect.detectMarker(this._bin_raster, l_square_list);

			const number_of_square:int = l_square_list.getLength();
			// コードは見つかった？
			if (number_of_square < 1) {
				// ないや。おしまい。
				// SOC: if no markers found, exit
				return 0;
			}
			// 保持リストのサイズを調整
			// SOC: ensure enough FLARMultiMarkerDetectorResult instances to hold all possible detected markers
			this._result_holder.reservHolder(number_of_square);

			// 1スクエア毎に、一致するコードを決定していく
			// SOC: loop through all found squares and compare each with all possible patterns
			var i:int;
			var square:FLARSquare;
			var code_index:int;
			var confidence:Number;
			var direction:int;
			var i2:int;
			var c2:Number;
			for (i = 0; i < number_of_square; i++) {
				square = l_square_list.getItem(i) as FLARSquare;
				// 評価基準になるパターンをイメージから切り出す
				// SOC: attempt to read a possible pattern from this found square
				if (!this._patt.pickFromRaster(i_raster, square)) {
					// イメージの切り出しは失敗することもある。
					// SOC: if a pattern cannot be extracted, skip to next square
					continue;
				}
				// パターンを評価器にセット
				// SOC: not clear on this part...
				if (!this._match_patt.setPatt(this._patt)) {
					// 計算に失敗した。
					throw new FLARException();
				}
				// コードと順番に比較していく
				// SOC: first, match against first pattern
				code_index = 0;
				_match_patt.evaluate(_codes[0]);
				confidence = _match_patt.getConfidence();
				direction = _match_patt.getDirection();
				//trace(i,0, confidence,"(",square.label.area,")");
				for (i2 = 1;i2 < this._number_of_code; i2++) {
					// コードと比較する
					// SOC: then, match against each additional pattern, looking for the best possible match
					_match_patt.evaluate(_codes[i2]);
					c2 = _match_patt.getConfidence();
					//trace(i, i2, c2,"(",square.label.area,")");
					if (confidence > c2) {
						continue;
					}
					// より一致するARCodeの情報を保存
					// SOC: if a better match, store values
					code_index = i2;
					direction = _match_patt.getDirection();
					confidence = c2;
				}
				// i番目のパターン情報を保存する。
				// SOC: store the values corresponding to the best pattern match
				var result:FLARMultiMarkerDetectorResult = this._result_holder.result_array[i];
				result._codeId = code_index;
				result._confidence = confidence;
				result._direction = direction;
				result._square = square;
			}
			return number_of_square;
		}

		/**
		 * i_indexのマーカーに対する変換行列を計算し、結果値をo_resultへ格納します。 直前に実行したdetectMarkerLiteが成功していないと使えません。
		 * 
		 * @param i_index
		 * マーカーのインデックス番号を指定します。 直前に実行したdetectMarkerLiteの戻り値未満かつ0以上である必要があります。
		 * @param o_result
		 * 結果値を受け取るオブジェクトを指定してください。
		 * @throws FLARException
		 */
		public function getTransmationMatrix(i_index:int, o_result:FLARTransMatResult):void {
			const result:FLARMultiMarkerDetectorResult = this._result_holder.result_array[i_index];
			// 一番一致したマーカーの位置とかその辺を計算
			if (_is_continue) {
				_transmat.transMatContinue(result.square, result.direction, _marker_width[result.codeId], o_result);
			} else {
				_transmat.transMat(result.square, result.direction, _marker_width[result.codeId], o_result);
			}
			return;
		}

		public function getResult(i_index:int):FLARMultiMarkerDetectorResult
		{
			return this._result_holder.result_array[i_index];
		}
		/**
		 * i_indexのマーカーの一致度を返します。
		 * 
		 * @param i_index
		 * マーカーのインデックス番号を指定します。 直前に実行したdetectMarkerLiteの戻り値未満かつ0以上である必要があります。
		 * @return マーカーの一致度を返します。0～1までの値をとります。 一致度が低い場合には、誤認識の可能性が高くなります。
		 * @throws FLARException
		 */
		public function getConfidence(i_index:int):Number {
			return this._result_holder.result_array[i_index].confidence;
		}

		/**
		 * i_indexのマーカーの方位を返します。
		 * 
		 * @param i_index
		 * マーカーのインデックス番号を指定します。 直前に実行したdetectMarkerLiteの戻り値未満かつ0以上である必要があります。
		 * @return 0,1,2,3の何れかを返します。
		 */
		public function getDirection(i_index:int):int {
			return this._result_holder.result_array[i_index].direction;
		}

		/**
		 * i_indexのマーカーのARCodeインデックスを返します。
		 * 
		 * @param i_index
		 * マーカーのインデックス番号を指定します。 直前に実行したdetectMarkerLiteの戻り値未満かつ0以上である必要があります。
		 * @return
		 */
		public function getARCodeIndex(i_index:int):int {
			// SOC: incorrect property name.
			//return this._result_holder.result_array[i_index].arcode_id;
			return this._result_holder.result_array[i_index].codeId;
		}

		/**
		 * getTransmationMatrixの計算モードを設定します。
		 * 
		 * @param i_is_continue
		 * TRUEなら、transMatContinueを使用します。 FALSEなら、transMatを使用します。
		 */
		public function setContinueMode(i_is_continue:Boolean):void {
			this._is_continue = i_is_continue;
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
		
		/**
		 * SOC: added accessor for thresholded BitmapData of source image,
		 * for use in debugging.
		 */
		public function get thresholdedBitmapData () :BitmapData {
			try {
				return FLARRaster_BitmapData(this._bin_raster).bitmapData;
			} catch (e:Error) {
				return null;
			}
			
			return null;
		}
		
		public function get labelingBitmapData () :BitmapData {
			return FLARSquareDetector(this._square_detect).labelingBitmapData;
		}
	}
}


