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

package org.libspark.flartoolkit.core.rasterfilter.rgb2bin {
	import org.libspark.flartoolkit.FLARException;
	import org.libspark.flartoolkit.core.raster.IFLARRaster;
	import org.libspark.flartoolkit.core.raster.rgb.IFLARRgbRaster;
	import org.libspark.flartoolkit.core.rasterreader.FLARBufferFormat;
	import org.libspark.flartoolkit.core.rasterreader.IFLARBufferReader;
	import org.libspark.flartoolkit.core.types.FLARIntSize;	

	/**
	 * 定数閾値による2値化をする。
	 * 
	 */
	public class FLARRasterFilter_ARToolkitThreshold implements IFLARRasterFilter_RgbToBin {

		private var _threshold:int;

		public function FLARRasterFilter_ARToolkitThreshold(i_threshold:int) {
			this._threshold = i_threshold;
		}

		public function setThreshold(i_threshold:int):void {
			this._threshold = i_threshold;
		}

		public function doFilter(i_input:IFLARRgbRaster, i_output:IFLARRaster):void {
			var in_buffer_reader:IFLARBufferReader = i_input.getBufferReader();	
			var out_buffer_reader:IFLARBufferReader = i_output.getBufferReader();
			var in_buf_type:int = in_buffer_reader.getBufferType();

			//		assert (out_buffer_reader.isEqualBufferType(IFLARBufferReader.BUFFERFORMAT_INT2D_BIN_8));
			//		assert (checkInputType(in_buf_type)==true);	
			//		assert (i_input.getSize().isEqualSize(i_output.getSize()) == true);

			var out_buf:Array = out_buffer_reader.getBuffer() as Array; // int[][]
			var in_buf:Array = in_buffer_reader.getBuffer() as Array; // byte[] 

			var size:FLARIntSize = i_output.getSize();
			switch (in_buffer_reader.getBufferType()) {
				case FLARBufferFormat.BUFFERFORMAT_BYTE1D_B8G8R8_24:
				case FLARBufferFormat.BUFFERFORMAT_BYTE1D_R8G8B8_24:
					convert24BitRgb(in_buf, out_buf, size);
					break;
				case FLARBufferFormat.BUFFERFORMAT_BYTE1D_B8G8R8X8_32:
					convert32BitRgbx(in_buf, out_buf, size);
					break;
				default:
					throw new FLARException();
			}
			return;
		}

		/**
		 * @param i_in	byte[]
		 * @param i_out	int[][]
		 */
		private function convert24BitRgb(i_in:Array, i_out:Array, i_size:FLARIntSize):void {
			const size_w:int = i_size.w;
			const x_mod_end:int = size_w - (size_w % 8);
			const th:int = this._threshold * 3;
			var bp:int = (size_w * i_size.h - 1) * 3;	
			var w:int;
			var x:int;		
			for (var y:int = i_size.h - 1; y >= 0; y--) {
				//端数分
				for (x = size_w - 1; x >= x_mod_end;x--) {
					w = ((i_in[bp] & 0xff) + (i_in[bp + 1] & 0xff) + (i_in[bp + 2] & 0xff));
					i_out[y][x] = w <= th ? 0 : 1;
					bp -= 3;
				}
				//タイリング		
				for (; x >= 0; x -= 8) {
					w = ((i_in[bp] & 0xff) + (i_in[bp + 1] & 0xff) + (i_in[bp + 2] & 0xff));
					i_out[y][x] = w <= th ? 0 : 1;
					bp -= 3;
					w = ((i_in[bp] & 0xff) + (i_in[bp + 1] & 0xff) + (i_in[bp + 2] & 0xff));
					i_out[y][x - 1] = w <= th ? 0 : 1;
					bp -= 3;
					w = ((i_in[bp] & 0xff) + (i_in[bp + 1] & 0xff) + (i_in[bp + 2] & 0xff));
					i_out[y][x - 2] = w <= th ? 0 : 1;
					bp -= 3;
					w = ((i_in[bp] & 0xff) + (i_in[bp + 1] & 0xff) + (i_in[bp + 2] & 0xff));
					i_out[y][x - 3] = w <= th ? 0 : 1;
					bp -= 3;
					w = ((i_in[bp] & 0xff) + (i_in[bp + 1] & 0xff) + (i_in[bp + 2] & 0xff));
					i_out[y][x - 4] = w <= th ? 0 : 1;
					bp -= 3;
					w = ((i_in[bp] & 0xff) + (i_in[bp + 1] & 0xff) + (i_in[bp + 2] & 0xff));
					i_out[y][x - 5] = w <= th ? 0 : 1;
					bp -= 3;
					w = ((i_in[bp] & 0xff) + (i_in[bp + 1] & 0xff) + (i_in[bp + 2] & 0xff));
					i_out[y][x - 6] = w <= th ? 0 : 1;
					bp -= 3;
					w = ((i_in[bp] & 0xff) + (i_in[bp + 1] & 0xff) + (i_in[bp + 2] & 0xff));
					i_out[y][x - 7] = w <= th ? 0 : 1;
					bp -= 3;
				}
			}
			return;
		}

		/**
		 * @param i_in	byte[]
		 * @param i_out	int[][]
		 */
		private function convert32BitRgbx(i_in:Array, i_out:Array, i_size:FLARIntSize):void {
			const size_w:int = i_size.w;
			const x_mod_end:int = size_w - (size_w % 8);
			const th:int = this._threshold * 3;
			var bp:int = (size_w * i_size.h - 1) * 4;
			var w:int;
			var x:int;
			for (var y:int = i_size.h - 1; y >= 0; y--) {
				//端数分
				for (x = size_w - 1; x >= x_mod_end;x--) {
					w = ((i_in[bp] & 0xff) + (i_in[bp + 1] & 0xff) + (i_in[bp + 2] & 0xff));
					i_out[y][x] = w <= th ? 0 : 1;
					bp -= 4;
				}
				//タイリング
				for (; x >= 0; x -= 8) {
					w = ((i_in[bp] & 0xff) + (i_in[bp + 1] & 0xff) + (i_in[bp + 2] & 0xff));
					i_out[y][x] = w <= th ? 0 : 1;
					bp -= 4;
					w = ((i_in[bp] & 0xff) + (i_in[bp + 1] & 0xff) + (i_in[bp + 2] & 0xff));
					i_out[y][x - 1] = w <= th ? 0 : 1;
					bp -= 4;
					w = ((i_in[bp] & 0xff) + (i_in[bp + 1] & 0xff) + (i_in[bp + 2] & 0xff));
					i_out[y][x - 2] = w <= th ? 0 : 1;
					bp -= 4;
					w = ((i_in[bp] & 0xff) + (i_in[bp + 1] & 0xff) + (i_in[bp + 2] & 0xff));
					i_out[y][x - 3] = w <= th ? 0 : 1;
					bp -= 4;
					w = ((i_in[bp] & 0xff) + (i_in[bp + 1] & 0xff) + (i_in[bp + 2] & 0xff));
					i_out[y][x - 4] = w <= th ? 0 : 1;
					bp -= 4;
					w = ((i_in[bp] & 0xff) + (i_in[bp + 1] & 0xff) + (i_in[bp + 2] & 0xff));
					i_out[y][x - 5] = w <= th ? 0 : 1;
					bp -= 4;
					w = ((i_in[bp] & 0xff) + (i_in[bp + 1] & 0xff) + (i_in[bp + 2] & 0xff));
					i_out[y][x - 6] = w <= th ? 0 : 1;
					bp -= 4;
					w = ((i_in[bp] & 0xff) + (i_in[bp + 1] & 0xff) + (i_in[bp + 2] & 0xff));
					i_out[y][x - 7] = w <= th ? 0 : 1;
					bp -= 4;
				}	
			}
			return;
		}

		private function checkInputType(i_input_type:int):Boolean {
			switch(i_input_type) {
				case FLARBufferFormat.BUFFERFORMAT_BYTE1D_B8G8R8_24:
				case FLARBufferFormat.BUFFERFORMAT_BYTE1D_R8G8B8_24:
				case FLARBufferFormat.BUFFERFORMAT_BYTE1D_B8G8R8X8_32:
					return true;
				default:
					return false;
			}
		}
	}
}