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
	import flash.display.BitmapData;
	
	import org.libspark.flartoolkit.core.labeling.FLARLabelingImageBitmapData;
	import org.libspark.flartoolkit.core.labeling.FLARLabelingLabel;
	import org.libspark.flartoolkit.core.labeling.FLARLabelingLabelStack;
	import org.libspark.flartoolkit.core.labeling.FLARLabeling_BitmapData;
	import org.libspark.flartoolkit.core.labeling.IFLARLabeling;
	import org.libspark.flartoolkit.core.labeling.IFLARLabelingImage;
	import org.libspark.flartoolkit.core.param.FLARCameraDistortionFactor;
	import org.libspark.flartoolkit.core.raster.IFLARRaster;
	import org.libspark.flartoolkit.core.types.FLARIntSize;
	import org.libspark.flartoolkit.core.types.FLARLinear;
	import org.libspark.flartoolkit.utils.ArrayUtil;	

	/**
	 * イメージから正方形候補を検出するクラス。
	 * このクラスは、arDetectMarker2.cとの置き換えになります。
	 * 
	 */
	public class FLARSquareDetector implements IFLARSquareDetector {

		private static const VERTEX_FACTOR:Number = 1.0; // 線検出のファクタ

		private static const AR_AREA_MAX:int = 100000; // #define AR_AREA_MAX 100000

		private static const AR_AREA_MIN:int = 70; // #define AR_AREA_MIN 70
		private var _width:int;
		private var _height:int;

		private var _labeling:IFLARLabeling;

		private var _limage:IFLARLabelingImage;

		private var _overlap_checker:OverlapChecker = new OverlapChecker();
		private var _dist_factor_ref:FLARCameraDistortionFactor;

		/**
		 * 最大i_squre_max個のマーカーを検出するクラスを作成する。
		 * 
		 * @param i_param
		 */
		public function FLARSquareDetector(i_dist_factor_ref:FLARCameraDistortionFactor, i_size:FLARIntSize) {
			this._width = i_size.w;
			this._height = i_size.h;
			this._dist_factor_ref = i_dist_factor_ref;
//			this._labeling = new FLARLabeling_ARToolKit();
			this._labeling = new FLARLabeling_BitmapData();
//			this._limage = new FLARLabelingImage(this._width, this._height);
			this._limage = new FLARLabelingImageBitmapData(this._width, this._height);
			this._labeling.attachDestination(this._limage);

			// 輪郭の最大長は画面に映りうる最大の長方形サイズ。
			var number_of_coord:int = (this._width + this._height) * 2;

			// 輪郭バッファは頂点変換をするので、輪郭バッファの２倍取る。
			this._max_coord = number_of_coord;
			this._xcoord = new Array(number_of_coord * 2);//new int[number_of_coord * 2];
			this._ycoord = new Array(number_of_coord * 2);//new int[number_of_coord * 2];
		}

		private var _max_coord:int;
		private var _xcoord:Array; // int[]
		private var _ycoord:Array; // int[]

		/**
		 * @param i_coord_x	int[]
		 * @param i_coord_y	int[]
		 */
		private function normalizeCoord(i_coord_x:Array, i_coord_y:Array, i_index:int, i_coord_num:int):void {
			// vertex1を境界にして、後方に配列を連結
			ArrayUtil.copy(i_coord_x, 1, i_coord_x, i_coord_num, i_index);
			ArrayUtil.copy(i_coord_y, 1, i_coord_y, i_coord_num, i_index);
//		System.arraycopy(i_coord_x, 1, i_coord_x, i_coord_num, i_index);
//		System.arraycopy(i_coord_y, 1, i_coord_y, i_coord_num, i_index);
		}

		//	private final int[] __detectMarker_mkvertex = new int[5];
		private var __detectMarker_mkvertex:Array = new Array(5);
		
		/**
		 * SOC: added accessor for labeled BitmapData of source image,
		 * for use in debugging.
		 */
		public function get labelingBitmapData () :BitmapData {
			return FLARLabelingImageBitmapData(this._limage).bitmapData;
		}

		/**
		 * ARMarkerInfo2 *arDetectMarker2( ARInt16 *limage, int label_num, int *label_ref,int *warea, double *wpos, int *wclip,int area_max, int area_min, double
		 * factor, int *marker_num ) 関数の代替品 ラベリング情報からマーカー一覧を作成してo_marker_listを更新します。 関数はo_marker_listに重なりを除外したマーカーリストを作成します。
		 * 
		 * @param i_raster
		 * 解析する２値ラスタイメージを指定します。
		 * @param o_square_stack
		 * 抽出した正方形候補を格納するリスト
		 * @throws FLARException
		 */
		public function detectMarker(i_raster:IFLARRaster, o_square_stack:FLARSquareStack):void {
			const labeling_proc:IFLARLabeling = this._labeling;
			const limage:IFLARLabelingImage = this._limage;

			// 初期化

			// マーカーホルダをリセット
			o_square_stack.clear();

			// ラベリング
			// SOC: the labeling process searches for contiguous areas of black in the thresholded image.
			//		these areas will then be analyzed to determine if they are marker outlines.
			labeling_proc.labeling(i_raster);

			// ラベル数が0ならここまで
			// SOC: exit if no black areas found
			const label_num:int = limage.getLabelStack().getLength();
			if (label_num < 1) {
				return;
			}
			
			const stack:FLARLabelingLabelStack = limage.getLabelStack();
			const labels:Array = stack.getArray(); 
			// FLARLabelingLabel[]
		
		
			// ラベルを大きい順に整列
			// SOC: arrange labeled areas in order of size
			stack.sortByArea();

			// デカいラベルを読み飛ばし
			// SOC: analyze only the labeled areas smaller than AR_AREA_MAX 
			var i:int;
			for (i = 0;i < label_num; i++) {
				// 検査対象内のラベルサイズになるまで無視
				if (labels[i].area <= AR_AREA_MAX) {
					break;
				}
			}

			const xsize:int = this._width;
			const ysize:int = this._height;
			const xcoord:Array = this._xcoord; // int[]
			const ycoord:Array = this._ycoord; // int[]
			const coord_max:int = this._max_coord;
			const mkvertex:Array = this.__detectMarker_mkvertex; // int[]
			const overlap:OverlapChecker = this._overlap_checker;
			var coord_num:int;
			var label_area:int;
			var label_pt:FLARLabelingLabel;

			//重なりチェッカの最大数を設定
			overlap.reset(label_num);

			var vertex1:int;
			var square_ptr:FLARSquare;
			for (;i < label_num; i++) {
				label_pt = labels[i];
				label_area = label_pt.area;
				// 検査対象サイズよりも小さくなったら終了
				if (label_area < AR_AREA_MIN) {
					break;
				}
				// クリップ領域が画面の枠に接していれば除外
				if (label_pt.clip_l == 1 || label_pt.clip_r == xsize - 2) {
					// if(wclip[i*4+0] == 1 || wclip[i*4+1] ==xsize-2){
					continue;
				}
				if (label_pt.clip_t == 1 || label_pt.clip_b == ysize - 2) {
					// if( wclip[i*4+2] == 1 || wclip[i*4+3] ==ysize-2){
					continue;
				}
				// 既に検出された矩形との重なりを確認
				if (!overlap.check(label_pt)) {
					// 重なっているようだ。
					continue;
				}

				// 輪郭を取得
				coord_num = limage.getContour(i, coord_max, xcoord, ycoord);
				if (coord_num == coord_max) {
					// 輪郭が大きすぎる。
					continue;
				}
				//頂点候補のインデクスを取得
				vertex1 = scanVertex(xcoord, ycoord, coord_num);

				// 頂点候補(vertex1)を先頭に並べなおした配列を作成する。
				normalizeCoord(xcoord, ycoord, vertex1, coord_num);

				// 領域を準備する。
				square_ptr = o_square_stack.prePush() as FLARSquare;

				// 頂点情報を取得
				if (!getSquareVertex(xcoord, ycoord, vertex1, coord_num, label_area, mkvertex)) {
					o_square_stack.pop();
					// 頂点の取得が出来なかったので破棄
					continue;
				}

				if (!getSquareLine(mkvertex, xcoord, ycoord, square_ptr)) {
					// 矩形が成立しなかった。
					o_square_stack.pop();
					continue;
				}
				// 検出済の矩形の属したラベルを重なりチェックに追加する。
				overlap.push(label_pt);
				
				// 後から参照できるように
				square_ptr.label = label_pt;
			}	
			return;
		}

		/**
		 * 辺からの対角線が最長になる点を対角線候補として返す。
		 * 
		 * @param i_xcoord	int[]
		 * @param i_ycoord	int[]
		 * @param i_coord_num	int
		 * @return
		 */
		private function scanVertex(i_xcoord:Array, i_ycoord:Array, i_coord_num:int):int {
			const sx:int = i_xcoord[0];
			const sy:int = i_ycoord[0];
			var d:int = 0;
			var w:int;
			var x:int;
			var y:int;
			var ret:int = 0;
			var i:int;
			for (i = 1; i < i_coord_num; i++) {
				x = i_xcoord[i] - sx;
				y = i_ycoord[i] - sy;
				w = x * x + y * y;
				if (w > d) {
					d = w;
					ret = i;
				}
			// ここでうまく終了条件入れられないかな。
			}
			return ret;
		}

		private const __getSquareVertex_wv1:FLARVertexCounter = new FLARVertexCounter();

		private const __getSquareVertex_wv2:FLARVertexCounter = new FLARVertexCounter();

		/**
		 * static int arDetectMarker2_check_square( int area, ARMarkerInfo2 *marker_info2, double factor ) 関数の代替関数 OPTIMIZED STEP [450->415] o_squareに頂点情報をセットします。
		 * 
		 * @param i_x_coord	int[]
		 * @param i_y_coord	int[]
		 * @param i_vertex1_index
		 * @param i_coord_num
		 * @param i_area
		 * @param o_vertex	int[]
		 * 要素数はint[4]である事
		 * @return
		 */
		private function getSquareVertex(i_x_coord:Array, i_y_coord:Array, i_vertex1_index:int, i_coord_num:int, i_area:int, o_vertex:Array):Boolean {
			const wv1:FLARVertexCounter = this.__getSquareVertex_wv1;
			const wv2:FLARVertexCounter = this.__getSquareVertex_wv2;
			const end_of_coord:int = i_vertex1_index + i_coord_num - 1;
			const sx:int = i_x_coord[i_vertex1_index];
			// sx = marker_info2->x_coord[0];
			const sy:int = i_y_coord[i_vertex1_index];
			// sy = marker_info2->y_coord[0];
			var dmax:int = 0;
			var v1:int = i_vertex1_index;
			var d:int;
			var i:int;
			for (i = 1 + i_vertex1_index; i < end_of_coord; i++) {
				// for(i=1;i<marker_info2->coord_num-1;i++)
				// {
				d = (i_x_coord[i] - sx) * (i_x_coord[i] - sx) + (i_y_coord[i] - sy) * (i_y_coord[i] - sy);
				if (d > dmax) {
					dmax = d;
					v1 = i;
				}
			}
			const thresh:Number = (i_area / 0.75) * 0.01 * VERTEX_FACTOR;

			o_vertex[0] = i_vertex1_index;

			if (!wv1.getVertex(i_x_coord, i_y_coord, i_vertex1_index, v1, thresh)) { 
				// if(get_vertex(marker_info2->x_coord,marker_info2->y_coord,0,v1,thresh,wv1,&wvnum1)<
				// 0 ) {
				return false;
			}
			if (!wv2.getVertex(i_x_coord, i_y_coord, v1, end_of_coord, thresh)) {
				// if(get_vertex(marker_info2->x_coord,marker_info2->y_coord,v1,marker_info2->coord_num-1,thresh,wv2,&wvnum2)
				// < 0) {
				return false;
			}

			var v2:int;
			if (wv1.number_of_vertex == 1 && wv2.number_of_vertex == 1) {
				// if(wvnum1 == 1 && wvnum2== 1) {
				o_vertex[1] = wv1.vertex[0];
				o_vertex[2] = v1;
				o_vertex[3] = wv2.vertex[0];
			} else if (wv1.number_of_vertex > 1 && wv2.number_of_vertex == 0) {
				// }else if( wvnum1 > 1 && wvnum2== 0) {
				//頂点位置を、起点から対角点の間の1/2にあると予想して、検索する。
				v2 = (v1 - i_vertex1_index) / 2 + i_vertex1_index;
				if (!wv1.getVertex(i_x_coord, i_y_coord, i_vertex1_index, v2, thresh)) {
					return false;
				}
				if (!wv2.getVertex(i_x_coord, i_y_coord, v2, v1, thresh)) {
					return false;
				}
				if (wv1.number_of_vertex == 1 && wv2.number_of_vertex == 1) {
					o_vertex[1] = wv1.vertex[0];
					o_vertex[2] = wv2.vertex[0];
					o_vertex[3] = v1;
				} else {
					return false;
				}
			} else if (wv1.number_of_vertex == 0 && wv2.number_of_vertex > 1) {
				//v2 = (v1-i_vertex1_index+ end_of_coord-i_vertex1_index) / 2+i_vertex1_index;
				v2 = (v1 + end_of_coord) / 2;

				if (!wv1.getVertex(i_x_coord, i_y_coord, v1, v2, thresh)) {
					return false;
				}
				if (!wv2.getVertex(i_x_coord, i_y_coord, v2, end_of_coord, thresh)) {
					return false;
				}
				if (wv1.number_of_vertex == 1 && wv2.number_of_vertex == 1) {
					o_vertex[1] = v1;
					o_vertex[2] = wv1.vertex[0];
					o_vertex[3] = wv2.vertex[0];
				} else {
					return false;
				}
			} else {
				return false;
			}
			o_vertex[4] = end_of_coord;
			return true;
		}

		private const __getSquareLine_input:FLARMat = new FLARMat(1, 2);

		private const __getSquareLine_evec:FLARMat = new FLARMat(2, 2);

		private const __getSquareLine_ev:FLARVec = new FLARVec(2);

		private const __getSquareLine_mean:FLARVec = new FLARVec(2);

		/**
		 * arGetLine(int x_coord[], int y_coord[], int coord_num,int vertex[], double line[4][3], double v[4][2]) arGetLine2(int x_coord[], int y_coord[], int
		 * coord_num,int vertex[], double line[4][3], double v[4][2], double *dist_factor) の２関数の合成品です。 マーカーのvertex,lineを計算して、結果をo_squareに保管します。
		 * Optimize:STEP[424->391]
		 * 
		 * @param i_mkvertex	int[]
		 * @param i_xcoord	int[]
		 * @param i_ycoord	int[]
		 * @param o_square
		 * @return
		 * @throws FLARException
		 */
		private function getSquareLine(i_mkvertex:Array, i_xcoord:Array, i_ycoord:Array, o_square:FLARSquare):Boolean {
			const l_line:Array = o_square.line; // FLARLinear[]
			const ev:FLARVec = this.__getSquareLine_ev; // matrixPCAの戻り値を受け取る
			const mean:FLARVec = this.__getSquareLine_mean; // matrixPCAの戻り値を受け取る
			const mean_array:Array = mean.getArray(); // double[]
			const dist_factor:FLARCameraDistortionFactor = this._dist_factor_ref;  
			const input:FLARMat = this.__getSquareLine_input;
			// 次処理で初期化される。
			const evec:FLARMat = this.__getSquareLine_evec;
			// アウトパラメータを受け取るから初期化不要//new FLARMat(2,2);
			const evec_array:Array = evec.getArray(); // double[][]
			
			var i:int;
			var w1:Number;
			var st:int;
			var ed:int;
			var n:int;
			var l_line_i:FLARLinear;
			for (i = 0; i < 4; i++) {
				w1 = (i_mkvertex[i + 1] - i_mkvertex[i] + 1) * 0.05 + 0.5;
				st = (i_mkvertex[i] + w1);
				ed = (i_mkvertex[i + 1] - w1);
				n = ed - st + 1;
				if (n < 2) {
					// nが2以下でmatrix.PCAを計算することはできないので、エラー
					return false;
				}
				// pcaの準備
				input.realloc(n, 2);
				// バッチ取得
				dist_factor.observ2IdealBatch(i_xcoord, i_ycoord, st, n, input.getArray());

				// 主成分分析
				input.matrixPCA(evec, ev, mean);
				l_line_i = l_line[i];
				l_line_i.run = evec_array[0][1];
				// line[i][0] = evec->m[1];
				l_line_i.rise = -evec_array[0][0];
				// line[i][1] = -evec->m[0];
				l_line_i.intercept = -(l_line_i.run * mean_array[0] + l_line_i.rise * mean_array[1]);// line[i][2] = -(line[i][0]*mean->v[0] + line[i][1]*mean->v[1]);
			}

			const l_sqvertex:Array = o_square.sqvertex; 
			// FLARDoublePoint2d[]
			const l_imvertex:Array = o_square.imvertex; 
			// FLARIntPoint[]
			
			var l_line_2:FLARLinear;
			for (i = 0; i < 4; i++) {
				l_line_i = l_line[i];
				l_line_2 = l_line[(i + 3) % 4];
				w1 = l_line_2.run * l_line_i.rise - l_line_i.run * l_line_2.rise;
				if (w1 == 0.0) {
					return false;
				}
				l_sqvertex[i].x = (l_line_2.rise * l_line_i.intercept - l_line_i.rise * l_line_2.intercept) / w1;
				l_sqvertex[i].y = (l_line_i.run * l_line_2.intercept - l_line_2.run * l_line_i.intercept) / w1;
				// 頂点インデクスから頂点座標を得て保存
				l_imvertex[i].x = i_xcoord[i_mkvertex[i]];
				l_imvertex[i].y = i_ycoord[i_mkvertex[i]];
			}
			return true;
		}
	}
}

import org.libspark.flartoolkit.core.labeling.FLARLabelingLabel;

/**
 * get_vertex関数を切り離すためのクラス
 * 
 */
class FLARVertexCounter {

	public const vertex:Array = new Array(10); // = new int[10];// 5まで削れる

	public var number_of_vertex:int;

	private var thresh:Number;

	private var x_coord:Array; // int[]

	private var y_coord:Array; // int[]

	/**
	 * @param i_x_coord	int[]
	 * @param i_y_coord	int[]
	 * @param st
	 * @param ed
	 * @param i_thresh
	 */
	public function getVertex(i_x_coord:Array, i_y_coord:Array, st:int, ed:int, i_thresh:Number):Boolean {
		this.number_of_vertex = 0;
		this.thresh = i_thresh;
		this.x_coord = i_x_coord;
		this.y_coord = i_y_coord;
		return get_vertex(st, ed);
	}

	/**
	 * static int get_vertex( int x_coord[], int y_coord[], int st, int ed,double thresh, int vertex[], int *vnum) 関数の代替関数
	 * 
	 * @param x_coord
	 * @param y_coord
	 * @param st
	 * @param ed
	 * @param thresh
	 * @return
	 */
	private function get_vertex(st:int, ed:int):Boolean {
		var v1:int = 0;
		const lx_coord:Array = this.x_coord; // int[]
		const ly_coord:Array = this.y_coord; // int[]
		const a:Number = ly_coord[ed] - ly_coord[st];
		const b:Number = lx_coord[st] - lx_coord[ed];
		const c:Number = lx_coord[ed] * ly_coord[st] - ly_coord[ed] * lx_coord[st];
		var dmax:Number = 0;
		
		var i:int;
		var d:Number;
		for (i = st + 1; i < ed; i++) {
			d = a * lx_coord[i] + b * ly_coord[i] + c;
			if (d * d > dmax) {
				dmax = d * d;
				v1 = i;
			}
		}
		if (dmax / (a * a + b * b) > thresh) {
			if (!get_vertex(st, v1)) {
				return false;
			}
			if (number_of_vertex > 5) {
				return false;
			}
			vertex[number_of_vertex] = v1;
			// vertex[(*vnum)] = v1;
			number_of_vertex++;
			// (*vnum)++;

			if (!get_vertex(v1, ed)) {
				return false;
			}
		}
		return true;
	}
}

/**
 * ラベル同士の重なり（内包関係）を調べるクラスです。 ラベルリストに内包するラベルを蓄積し、それにターゲットのラベルが内包されているか を確認します。
 */
class OverlapChecker {

	private var _labels:Array = new Array(32); // new FLARLabelingLabel[32];

	private var _length:int;

	/**
	 * 最大i_max_label個のラベルを蓄積できるようにオブジェクトをリセットする
	 * 
	 * @param i_max_label
	 */
	public function reset(i_max_label:int):void {
		if (i_max_label > this._labels.length) {
//			this._labels = new FLARLabelingLabel[i_max_label];
			this._labels = new Array(i_max_label);
			var n:int = i_max_label;
			while (n--) {
				this._labels[n] = new FLARLabelingLabel();
			}
		}
		this._length = 0;
	}

	/**
	 * チェック対象のラベルを追加する。
	 * 
	 * @param i_label_ref
	 */
	public function push(i_label_ref:FLARLabelingLabel):void {
		this._labels[this._length] = i_label_ref;
		this._length++;
	}

	/**
	 * 現在リストにあるラベルと重なっているかを返す。
	 * 
	 * @param i_label
	 * @return 何れかのラベルの内側にあるならばfalse,独立したラベルである可能性が高ければtrueです．
	 */
	public function check(i_label:FLARLabelingLabel):Boolean {
		// 重なり処理かな？
		const label_pt:Array = this._labels; // FLARLabelingLabel[]
		const px1:int = int(i_label.pos_x);
		const py1:int = int(i_label.pos_y);
		
		var i:int;
		var px2:int;
		var py2:int;
		var d:int;
		for (i = this._length - 1;i >= 0; i--) {
			px2 = int(label_pt[i].pos_x);
			py2 = int(label_pt[i].pos_y);
			d = (px1 - px2) * (px1 - px2) + (py1 - py2) * (py1 - py2);
			if (d < label_pt[i].area / 4) {
				// 対象外
				return false;
			}
		}
		// 対象
		return true;
	}
}