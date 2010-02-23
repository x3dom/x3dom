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

package org.libspark.flartoolkit.core.pickup {
	import org.libspark.flartoolkit.core.FLARSquare;
	import org.libspark.flartoolkit.core.raster.rgb.IFLARRgbRaster;	

	public interface IFLARColorPatt {

		/**
		 * カラーパターンの幅をピクセル値で返します。
		 * 
		 * @return
		 */
		function getWidth():int;

		/**
		 * カラーパターンの高さをピクセル値で返します。
		 * 
		 * @return
		 */
		function getHeight():int;

		/**
		 * カメラパターンを格納した配列への参照値を返します。 配列は最低でも[height][wight][3]のサイズを持ちますが、
		 * 配列のlengthとwidth,heightの数は一致しないことがあります。
		 * setSize関数を実行すると、以前に呼び出されたgetPatArrayが返した値は不定になります。
		 * 
		 * @return
		 */
		function getPatArray():Array; //int[][][]

		/**
		 * ラスタイメージからi_square部分のカラーパターンを抽出して、保持します。
		 * 
		 * @param image
		 * @param i_square
		 * @return ラスターの取得に成功するとTRUE/失敗するとFALSE
		 * @throws FLARException
		 */
		function pickFromRaster(image:IFLARRgbRaster, i_square:FLARSquare):Boolean;
	}
}