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

package org.libspark.flartoolkit.core.labeling {
	import org.libspark.flartoolkit.FLARException;
	import org.libspark.flartoolkit.core.raster.FLARRaster_BasicClass;
	import org.libspark.flartoolkit.core.rasterreader.IFLARBufferReader;
	import org.libspark.flartoolkit.core.types.FLARIntSize;
	
	import flash.display.BitmapData;		

	/**
	 *
	 */
	public class FLARLabelingImageBitmapData extends FLARRaster_BasicClass implements IFLARLabelingImage {

		private static const MAX_LABELS:int = 1024;// * 32;
//		protected var _ref_buf:Array; // int[][]
		protected var _labeled:BitmapData;
		private var _buffer_reader:IFLARBufferReader;
		protected var _label_list:FLARLabelingLabelStack;
//		protected var _index_table:Array; // int[]
		protected var _is_index_table_enable:Boolean;

		public function FLARLabelingImageBitmapData(i_width:int, i_height:int) {
			super(new FLARIntSize(i_width, i_height));
//			this._ref_buf = ArrayUtil.createJaggedArray(i_height, i_width);//this._ref_buf = new int[i_height][i_width];
			this._labeled = new BitmapData(i_width, i_height, false, 0x0);
			this._label_list = new FLARLabelingLabelStack(MAX_LABELS);
//			this._index_table = new Array(MAX_LABELS);//new int[MAX_LABELS];
			this._is_index_table_enable = false;
//			this._buffer_reader = new FLARBufferReader(this._ref_buf, FLARBufferFormat.BUFFERFORMAT_INT2D);
			return;
		}

		public override function getBufferReader():IFLARBufferReader {
			return this._buffer_reader;
		}
		
		public function get bitmapData():BitmapData {
			return this._labeled;
		}

		
		/**
		 * ラベリング結果がインデックステーブルを持つ場合、その配列を返します。
		 * 持たない場合、nullを返します。
		 * 
		 * 値がnullの時はラベル番号そのものがラスタに格納されていますが、
		 * null以外の時はラスタに格納されているのはインデクス番号です。
		 * 
		 * インデクス番号とラベル番号の関係は、以下の式で表されます。
		 * ラベル番号:=value[インデクス番号]
		 * 
		 * @return int[]
		 */
		public function getIndexArray():Array {
//			return this._is_index_table_enable ? this._index_table : null;
			return null;
		}

		public function getLabelStack():FLARLabelingLabelStack {
			return this._label_list;
		}

		public function reset(i_label_index_enable:Boolean):void {
			// assert(i_label_index_enable==true);//非ラベルモードは未実装
			this._label_list.clear();
			this._is_index_table_enable = i_label_index_enable;
			return;
		}

		protected const _getContour_xdir:Array = [0, 1, 1, 1, 0,-1,-1,-1]; // int[]
		protected const _getContour_ydir:Array = [-1,-1, 0, 1, 1, 1, 0,-1]; // int[]
		/**
		 * i_labelのラベルの、クリップ領域が上辺に接しているx座標を返します。
		 * @param i_index
		 * @return
		 */
		protected function getTopClipTangentX(i_label:FLARLabelingLabel):int {
			var w:int;
			var i_label_id:int = i_label.id;
//			var index_table:Array = this._index_table; // int[]
//			var limage_j:Array = this._ref_buf[i_label.clip_t]; // int[]
			const clip1:int = i_label.clip_r;
			// p1=ShortPointer.wrap(limage,j*xsize+clip.get());//p1 =&(limage[j*xsize+clip[0]]);
			var i:int;
			for (i = i_label.clip_l; i <= clip1; i++) { // for( i = clip[0]; i <=clip[1]; i++, p1++ ) {
//				w = limage_j[i];
				w = this._labeled.getPixel(i, i_label.clip_t);
				if (w > 0 && w == i_label_id) {
					return i;
				}
			}
			//あれ？見つからないよ？
			throw new FLARException();
		}

		/**
		 * i_index番目のラベルの輪郭線を配列に返します。
		 * @param i_index
		 * @param i_array_size
		 * @param o_coord_x	int[]
		 * @param o_coord_y	int[]
		 * @return
		 * 輪郭線の長さを返します。
		 * @throws FLARException
		 */
		public function getContour(i_index:int, i_array_size:int, o_coord_x:Array, o_coord_y:Array):int {
			const xdir:Array = this._getContour_xdir; // static int xdir[8] = { 0,1, 1, 1, 0,-1,-1,-1};
			const ydir:Array = this._getContour_ydir; // static int ydir[8] = {-1,-1,0, 1, 1, 1, 0,-1};
			const label:FLARLabelingLabel = this._label_list.getItem(i_index) as FLARLabelingLabel;		
			var i:int;
			//クリップ領域の上端に接しているポイントを得る。
			var sx:int = getTopClipTangentX(label);
			var sy:int = label.clip_t;

			var coord_num:int = 1; // marker_info2->coord_num = 1;
			o_coord_x[0] = sx; // marker_info2->x_coord[0] = sx;
			o_coord_y[0] = sy; // marker_info2->y_coord[0] = sy;
			var dir:int = 5;

//			var limage:Array = this._ref_buf; // int[][]
			var c:int = o_coord_x[0];
			var r:int = o_coord_y[0];
			for (;;) {
				dir = (dir + 5) % 8;
				for (i = 0; i < 8; i++) {
					// if (limage[r + ydir[dir]][c + xdir[dir]] > 0) {
					if (this._labeled.getPixel(c + xdir[dir], r + ydir[dir]) > 0) {
						break;
					}
					dir = (dir + 1) % 8;
				}
				if (i == 8) {
					//8方向全て調べたけどラベルが無いよ？
					throw new FLARException();// return(-1);
				}
				// xcoordとycoordをc,rにも保存
				c = c + xdir[dir]; // marker_info2->x_coord[marker_info2->coord_num]=marker_info2->x_coord[marker_info2->coord_num-1]+ xdir[dir];
				r = r + ydir[dir]; // marker_info2->y_coord[marker_info2->coord_num]=marker_info2->y_coord[marker_info2->coord_num-1]+ ydir[dir];
				o_coord_x[coord_num] = c; // marker_info2->x_coord[marker_info2->coord_num]=marker_info2->x_coord[marker_info2->coord_num-1]+ xdir[dir];
				o_coord_y[coord_num] = r; // marker_info2->y_coord[marker_info2->coord_num]=marker_info2->y_coord[marker_info2->coord_num-1]+ ydir[dir];
				// 終了条件判定
				if (c == sx && r == sy) {
					coord_num++;
					break;
				}
				coord_num++;
				if (coord_num == i_array_size) {
					// if( marker_info2.coord_num ==Config.AR_CHAIN_MAX-1 ){
					//輪郭が末端に達した
					return coord_num;
				}
			}
			return coord_num;		
		}
	}
}