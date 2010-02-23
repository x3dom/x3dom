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

package org.libspark.flartoolkit.core.rasterreader {

	/**
	 * R8G8B8でピクセルを読み出すインタフェイス
	 * 
	 */
	public interface IFLARRgbPixelReader {

		/**
		 * 1ピクセルをint配列にして返します。
		 * 
		 * @param i_x
		 * @param i_y
		 * @param o_rgb
		 */
		function getPixel(i_x:int, i_y:int, o_rgb:Array):void;

		/**
		 * 複数のピクセル値をi_rgbへ返します。
		 * 
		 * @param i_x
		 * xのインデックス配列
		 * @param i_y
		 * yのインデックス配列
		 * @param i_num
		 * 返すピクセル値の数
		 * @param i_rgb
		 * ピクセル値を返すバッファ
		 */
		function getPixelSet(i_x:Array, i_y:Array, i_num:int, o_rgb:Array):void
	}
}