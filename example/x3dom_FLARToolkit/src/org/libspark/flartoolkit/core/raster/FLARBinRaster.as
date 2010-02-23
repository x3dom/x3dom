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

package org.libspark.flartoolkit.core.raster {
	import org.libspark.flartoolkit.core.rasterreader.FLARBufferFormat;
	import org.libspark.flartoolkit.core.rasterreader.FLARBufferReader;
	import org.libspark.flartoolkit.core.rasterreader.IFLARBufferReader;
	import org.libspark.flartoolkit.core.types.FLARIntSize;
	import org.libspark.flartoolkit.utils.ArrayUtil;	
	public final class FLARBinRaster extends FLARRaster_BasicClass {

		private var _buffer_reader:IFLARBufferReader;
		protected var _ref_buf:Array;//int[][] _ref_buf;

		public function FLARBinRaster(i_width:int, i_height:int) {
			super(new FLARIntSize(i_width, i_height));
			this._ref_buf = ArrayUtil.createJaggedArray(i_height, i_width);//this._ref_buf = new int[i_height][i_width];
			this._buffer_reader = new FLARBufferReader(this._ref_buf, FLARBufferFormat.BUFFERFORMAT_INT2D_BIN_8);
		}

		public override function getBufferReader():IFLARBufferReader {
			return this._buffer_reader;
		}
	}
}