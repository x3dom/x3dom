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
	import flash.display.BitmapData;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	
	import org.libspark.flartoolkit.core.raster.FLARRaster_BitmapData;
	import org.libspark.flartoolkit.core.raster.IFLARRaster;
	import org.libspark.flartoolkit.core.types.FLARIntSize;	

	/**
	 * ARToolKit互換のラベリングクラスです。 ARToolKitと同一な評価結果を返します。
	 * 
	 */
	public class FLARLabeling_BitmapData implements IFLARLabeling {
		public static var minimumLabelSize:Number = 100;

		private static const WORK_SIZE:int = 1024 * 32; // #define WORK_SIZE 1024*32
		private const work_holder:FLARWorkHolder = new FLARWorkHolder(WORK_SIZE);
		private var _dest_size:FLARIntSize;
		private var _out_image:FLARLabelingImageBitmapData;

		private static const ZERO_POINT:Point = new Point();
		private static const ONE_POINT:Point = new Point(1, 1);
		
	    private var tmp_img:BitmapData;
	    private var hSearch:BitmapData;
	    private var hLineRect:Rectangle;
	    
		public function attachDestination(i_destination_image:IFLARLabelingImage):void {
			// サイズチェック
			var size:FLARIntSize = i_destination_image.getSize();
			this._out_image = i_destination_image as FLARLabelingImageBitmapData;

			// NyLabelingImageのイメージ初期化(枠書き)
//			var img:Array = i_destination_image.getBufferReader().getBuffer() as Array; // int[][]
//			for (var i:int = 0; i < size.w; i++) {
//				img[0][i] = 0;
//				img[size.h - 1][i] = 0;
//			}
//			for (i = 0;i < size.h; i++) {
//				img[i][0] = 0;
//				img[i][size.w - 1] = 0;
//			}

			this.tmp_img = new BitmapData(size.w, size.h, false, 0x0);
			this.hSearch = new BitmapData(size.w, 1, false, 0x000000);
			this.hLineRect = new Rectangle(0, 0, 1, 1);
			
			// サイズ(参照値)を保存
			this._dest_size = size;
		}

		public function getAttachedDestination():IFLARLabelingImage {
			return this._out_image;
		}

		/**
		 * static ARInt16 *labeling2( ARUint8 *image, int thresh,int *label_num, int **area, double **pos, int **clip,int **label_ref, int LorR ) 関数の代替品
		 * ラスタimageをラベリングして、結果を保存します。 Optimize:STEP[1514->1493]
		 * 
		 * @param i_raster
		 * @throws FLARException
		 */
		public function labeling(image:IFLARRaster):void {
//			this.tmp_img.applyFilter(image.bitmapData, image.bitmapData.rect, ZERO_POINT, MONO_FILTER);
//			this.label_img.fillRect(this.label_img.rect, 0x0);
//			var rect:Rectangle = this.tmp_img.rect;
//			rect.inflate(-1, -1);
//			this.label_img.threshold(this.tmp_img, rect, ONE_POINT, '<=', thresh, 0xffffffff, 0xff);
			
//			this.label_num = 0;
//			var labels:Array = this.label_holder.labels;

			var label_img:BitmapData = this._out_image.bitmapData;
			label_img.fillRect(label_img.rect, 0x0);
			var rect:Rectangle = label_img.rect.clone();
			rect.inflate(-1, -1);
			label_img.copyPixels(FLARRaster_BitmapData(image).bitmapData, rect, ONE_POINT);
			
			var currentRect:Rectangle = label_img.getColorBoundsRect(0xffffff, 0xffffff, true);
			hLineRect.y = 0;
			hLineRect.width = label_img.width;
			var hSearchRect:Rectangle;
			var labelRect:Rectangle;
			var index:int = 0;
			var label_list:FLARLabelingLabelStack = this._out_image.getLabelStack();
			label_list.clear();
//			label_list.reserv(256);
			var labels:Array = label_list.getArray();
			var label:FLARLabelingLabel;
			
			// SOC: search image for contiguous areas of white (earlier thresholding process
			//		turns dark areas of the image into white pixels), and store as FLARLabelingLabel instances,
			//		which are areas marked for later analysis (for marker outline detection).
			while (!currentRect.isEmpty()) {
				hLineRect.y = currentRect.top;
				
				// SOC: grab one row of pixels to analyze
				hSearch.copyPixels(label_img, hLineRect, ZERO_POINT);
				
				// SOC: find bounds of all white pixels in this pixel row
				hSearchRect = hSearch.getColorBoundsRect(0xffffff, 0xffffff, true);
				
				// SOC: perform a flood fill starting with the leftmost white pixel in this row;
				//		the color used to flood fill (index) becomes the id for this labeled area.
				label_img.floodFill(hSearchRect.x, hLineRect.y, ++index);
				
				// SOC: get bounds of labeled (flood-filled) area
				labelRect = label_img.getColorBoundsRect(0xffffff, index, true);
				
				// SOC: only store labeled area if it's larger than the minimum size
				if (labelRect.width * labelRect.height > minimumLabelSize) {
					// SOC: instantiate new FLARLabelingLabel
					label = label_list.prePush() as FLARLabelingLabel;//labels[index++];
					
					// SOC: store information about labeled area
					label.id = index;
					label.area = labelRect.width * labelRect.height;
					label.clip_l = labelRect.left;
					label.clip_r = labelRect.right - 1;
					label.clip_t = labelRect.top;
					label.clip_b = labelRect.bottom - 1;
					label.pos_x = (labelRect.left + labelRect.right - 1) * 0.5;
					label.pos_y = (labelRect.top + labelRect.bottom - 1) * 0.5;
				}
				
				// SOC: decrease area of analysis for next iteration
				currentRect = label_img.getColorBoundsRect(0xffffff, 0xffffff, true);
			}
		}

		public function labeling1(i_raster:IFLARRaster):void {
			var m:int; /* work */
			var n:int;
			var i:int;
			var j:int;
			var k:int;
			var out_image:IFLARLabelingImage = this._out_image;

			// サイズチェック
			var in_size:FLARIntSize = i_raster.getSize();
			this._dest_size.isEqualSizeO(in_size);

			const lxsize:int = in_size.w;// lxsize = arUtil_c.arImXsize;
			const lysize:int = in_size.h;// lysize = arUtil_c.arImYsize;
			var label_img:Array = out_image.getBufferReader().getBuffer() as Array; // int[][]

			// 枠作成はインスタンスを作った直後にやってしまう。
		
			//ラベリング情報のリセット（ラベリングインデックスを使用）
			out_image.reset(true);
		
			var label_idxtbl:Array = out_image.getIndexArray(); // int[]

			var work2_pt:Array; // int[]
			var wk_max:int = 0;

			var label_pixel:int;
			var raster_buf:Array = i_raster.getBufferReader().getBuffer() as Array; // int[][]
			var line_ptr:Array; // int[]
			var work2:Array = this.work_holder.work2; // int[][]
			var label_img_pt0:Array; // int[]
			var label_img_pt1:Array; // int[]
			for (j = 1; j < lysize - 1; j++) {
				// for (int j = 1; j < lysize - 1;j++, pnt += poff*2, pnt2 += 2) {
				line_ptr = raster_buf[j];
				label_img_pt0 = label_img[j];
				label_img_pt1 = label_img[j - 1];
				for (i = 1; i < lxsize - 1; i++) {
					// for(int i = 1; i < lxsize-1;i++, pnt+=poff, pnt2++) {
					// RGBの合計値が閾値より小さいかな？
					if (line_ptr[i] == 0) {
						// pnt1 = ShortPointer.wrap(pnt2, -lxsize);//pnt1 =&(pnt2[-lxsize]);
						if (label_img_pt1[i] > 0) {
							// if( *pnt1 > 0 ) {
							label_pixel = label_img_pt1[i];
							// *pnt2 = *pnt1;

							work2_pt = work2[label_pixel - 1];
							work2_pt[0]++; // work2[((*pnt2)-1)*7+0] ++;
							work2_pt[1] += i; // work2[((*pnt2)-1)*7+1] += i;
							work2_pt[2] += j; // work2[((*pnt2)-1)*7+2] += j;
							work2_pt[6] = j;// work2[((*pnt2)-1)*7+6] = j;
						} else if (label_img_pt1[i + 1] > 0) {
							// }else if(*(pnt1+1) > 0 ) {
							if (label_img_pt1[i - 1] > 0) {
								// if( *(pnt1-1) > 0 ) {
								m = label_idxtbl[label_img_pt1[i + 1] - 1]; // m =work[*(pnt1+1)-1];
								n = label_idxtbl[label_img_pt1[i - 1] - 1]; // n =work[*(pnt1-1)-1];
								if (m > n) {
									label_pixel = n;
									// *pnt2 = n;
									// wk=IntPointer.wrap(work, 0);//wk =
									// &(work[0]);
									for (k = 0;k < wk_max; k++) {
										if (label_idxtbl[k] == m) {
											// if( *wk == m )
											label_idxtbl[k] = n;// *wk = n;
										}
									}
								} else if (m < n) {
									label_pixel = m;
									// *pnt2 = m;
									// wk=IntPointer.wrap(work,0);//wk = &(work[0]);
									for (k = 0;k < wk_max; k++) {
										if (label_idxtbl[k] == n) {
											// if( *wk == n ){
											label_idxtbl[k] = m;// *wk = m;
										}
									}
								} else {
									label_pixel = m;// *pnt2 = m;
								}
								work2_pt = work2[label_pixel - 1];
								work2_pt[0]++;
								work2_pt[1] += i;
								work2_pt[2] += j;
								work2_pt[6] = j;
							} else if ((label_img_pt0[i - 1]) > 0) {
								// }else if(*(pnt2-1) > 0) {
								m = label_idxtbl[(label_img_pt1[i + 1]) - 1]; // m =work[*(pnt1+1)-1];
								n = label_idxtbl[label_img_pt0[i - 1] - 1]; // n =work[*(pnt2-1)-1];
								if (m > n) {

									label_pixel = n;
									// *pnt2 = n;
									for (k = 0; k < wk_max; k++) {
										if (label_idxtbl[k] == m) {
											// if( *wk == m ){
											label_idxtbl[k] = n;// *wk = n;
										}
									}
								} else if (m < n) {
									label_pixel = m;
									// *pnt2 = m;
									for (k = 0; k < wk_max; k++) {
										if (label_idxtbl[k] == n) {
											// if( *wk == n ){
											label_idxtbl[k] = m;// *wk = m;
										}
									}
								} else {
									label_pixel = m;// *pnt2 = m;
								}
								work2_pt = work2[label_pixel - 1];
								work2_pt[0]++;
								// work2[((*pnt2)-1)*7+0] ++;
								work2_pt[1] += i;
								// work2[((*pnt2)-1)*7+1] += i;
								work2_pt[2] += j;// work2[((*pnt2)-1)*7+2] += j;
							} else {

								label_pixel = label_img_pt1[i + 1];
								// *pnt2 =
								// *(pnt1+1);

								work2_pt = work2[label_pixel - 1];
								work2_pt[0]++; // work2[((*pnt2)-1)*7+0] ++;
								work2_pt[1] += i; // work2[((*pnt2)-1)*7+1] += i;
								work2_pt[2] += j; // work2[((*pnt2)-1)*7+2] += j;
								if (work2_pt[3] > i) {
									// if(
									// work2[((*pnt2)-1)*7+3] >
									// i ){
									work2_pt[3] = i;// work2[((*pnt2)-1)*7+3] = i;
								}
								work2_pt[6] = j;// work2[((*pnt2)-1)*7+6] = j;
							}
						} else if ((label_img_pt1[i - 1]) > 0) {
							// }else if(
							// *(pnt1-1) > 0 ) {
							label_pixel = label_img_pt1[i - 1];
							// *pnt2 =
							// *(pnt1-1);

							work2_pt = work2[label_pixel - 1];
							work2_pt[0]++; // work2[((*pnt2)-1)*7+0] ++;
							work2_pt[1] += i; // work2[((*pnt2)-1)*7+1] += i;
							work2_pt[2] += j; // work2[((*pnt2)-1)*7+2] += j;
							if (work2_pt[4] < i) {
								// if( work2[((*pnt2)-1)*7+4] <i ){
								work2_pt[4] = i;// work2[((*pnt2)-1)*7+4] = i;
							}
							work2_pt[6] = j;// work2[((*pnt2)-1)*7+6] = j;
						} else if (label_img_pt0[i - 1] > 0) {
							// }else if(*(pnt2-1) > 0) {
							label_pixel = label_img_pt0[i - 1];
							// *pnt2 =*(pnt2-1);

							work2_pt = work2[label_pixel - 1];
							work2_pt[0]++; // work2[((*pnt2)-1)*7+0] ++;
							work2_pt[1] += i; // work2[((*pnt2)-1)*7+1] += i;
							work2_pt[2] += j; // work2[((*pnt2)-1)*7+2] += j;
							if (work2_pt[4] < i) {
								// if( work2[((*pnt2)-1)*7+4] <i ){
								work2_pt[4] = i;// work2[((*pnt2)-1)*7+4] = i;
							}
						} else {
							// 現在地までの領域を予約
							this.work_holder.reserv(wk_max);
							wk_max++;
							label_idxtbl[wk_max - 1] = wk_max;
							label_pixel = wk_max;
							// work[wk_max-1] = *pnt2 = wk_max;
							work2_pt = work2[wk_max - 1];
							work2_pt[0] = 1;
							work2_pt[1] = i;
							work2_pt[2] = j;
							work2_pt[3] = i;
							work2_pt[4] = i;
							work2_pt[5] = j;
							work2_pt[6] = j;
						}
						label_img_pt0[i] = label_pixel;
					} else {
						label_img_pt0[i] = 0;// *pnt2 = 0;
					}
				}
			}
			// インデックステーブルとラベル数の計算
			var wlabel_num:int = 1;
			// *label_num = *wlabel_num = j - 1;

			for (i = 0; i < wk_max; i++) {
				// for(int i = 1; i <= wk_max; i++,wk++) {
				label_idxtbl[i] = (label_idxtbl[i] == i + 1) ? wlabel_num++ : label_idxtbl[label_idxtbl[i] - 1];// *wk=(*wk==i)?j++:work[(*wk)-1];
			}
			wlabel_num -= 1;
			// *label_num = *wlabel_num = j - 1;
			if (wlabel_num == 0) {
				// if( *label_num == 0 ) {
				// 発見数0
				out_image.getLabelStack().clear();
				return;
			}
			// ラベル情報の保存等
			var label_list:FLARLabelingLabelStack = out_image.getLabelStack();

			// ラベルバッファを予約
			label_list.reserv(wlabel_num);

			// エリアと重心、クリップ領域を計算
			var label_pt:FLARLabelingLabel;
			var labels:Array = label_list.getArray(); // FLARLabelingLabel[]
			for (i = 0; i < wlabel_num; i++) {
				label_pt = labels[i];
				label_pt.id = i + 1;
				label_pt.area = 0;
				label_pt.pos_x = label_pt.pos_y = 0;
				label_pt.clip_l = lxsize; // wclip[i*4+0] = lxsize;
				label_pt.clip_t = lysize; // wclip[i*4+2] = lysize;
				label_pt.clip_r = label_pt.clip_b = 0;// wclip[i*4+3] = 0;
			}

			for (i = 0; i < wk_max; i++) {
				label_pt = labels[label_idxtbl[i] - 1];
				work2_pt = work2[i];
				label_pt.area += work2_pt[0];
				label_pt.pos_x += work2_pt[1];
				label_pt.pos_y += work2_pt[2];
				if (label_pt.clip_l > work2_pt[3]) {
					label_pt.clip_l = work2_pt[3];
				}
				if (label_pt.clip_r < work2_pt[4]) {
					label_pt.clip_r = work2_pt[4];
				}
				if (label_pt.clip_t > work2_pt[5]) {
					label_pt.clip_t = work2_pt[5];
				}
				if (label_pt.clip_b < work2_pt[6]) {
					label_pt.clip_b = work2_pt[6];
				}
			}

			for (i = 0; i < wlabel_num; i++) {
				// for(int i = 0; i < *label_num; i++ ) {
				label_pt = labels[i];
				label_pt.pos_x /= label_pt.area;
				label_pt.pos_y /= label_pt.area;
			}
			return;
		}
	}
}

import org.libspark.flartoolkit.FLARException;
import org.libspark.flartoolkit.utils.ArrayUtil;

/**
 * FLARLabeling_O2のworkとwork2を可変長にするためのクラス
 * 
 * 
 */
class FLARWorkHolder {

	private static const ARRAY_APPEND_STEP:int = 256;

	public var work2:Array; 
	// int[][]

	private var allocate_size:int;

	/**
	 * 最大i_holder_size個の動的割り当てバッファを準備する。
	 * 
	 * @param i_holder_size
	 */
	public function FLARWorkHolder(i_holder_size:int) {
		// ポインタだけははじめに確保しておく
		//		this.work2 = new int[i_holder_size][];
		this.work2 = ArrayUtil.createJaggedArray(i_holder_size, 0);
		this.allocate_size = 0;
	}

	/**
	 * i_indexで指定した番号までのバッファを準備する。
	 * 
	 * @param i_index
	 */
	public function reserv(i_index:int):void {
		// アロケート済みなら即リターン
		if (this.allocate_size > i_index) {
			return;
		}
		// 要求されたインデクスは範囲外
		if (i_index >= this.work2.length) {
			throw new FLARException();
		}
		// 追加アロケート範囲を計算
		var range:int = i_index + ARRAY_APPEND_STEP;
		if (range >= this.work2.length) {
			range = this.work2.length;
		}
		// アロケート
		for (var i:int = this.allocate_size;i < range; i++) {
			this.work2[i] = new Array(7);//new int[7];
		}
		this.allocate_size = range;
	}
}