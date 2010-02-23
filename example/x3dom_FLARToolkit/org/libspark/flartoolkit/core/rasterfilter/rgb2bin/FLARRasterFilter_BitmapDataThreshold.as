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
	
	import flash.display.BitmapData;
	import flash.filters.ColorMatrixFilter;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	
	import org.libspark.flartoolkit.core.raster.FLARRaster_BitmapData;
	import org.libspark.flartoolkit.core.raster.IFLARRaster;
	import org.libspark.flartoolkit.core.raster.rgb.FLARRgbRaster_BitmapData;
	import org.libspark.flartoolkit.core.raster.rgb.IFLARRgbRaster;

	public class FLARRasterFilter_BitmapDataThreshold implements IFLARRasterFilter_RgbToBin {
		
		private static const ZERO_POINT:Point = new Point();
		private static const ONE_POINT:Point = new Point(1, 1);
		private static const MONO_FILTER:ColorMatrixFilter = new ColorMatrixFilter([
			0.2989, 0.5866, 0.1145, 0, 0,
			0.2989, 0.5866, 0.1145, 0, 0,
			0.2989, 0.5866, 0.1145, 0, 0,
			0, 0, 0, 1, 0
		]);
		
		private var _threshold:int;
		private var _tmp:BitmapData;
		
		public function FLARRasterFilter_BitmapDataThreshold(i_threshold:int) {
			this._threshold = i_threshold;
		}

		public function setThreshold(i_threshold:int):void {
			this._threshold = i_threshold;
		}

		public function doFilter(i_input:IFLARRgbRaster, i_output:IFLARRaster):void {
			var inbmp:BitmapData = FLARRgbRaster_BitmapData(i_input).bitmapData;
			if (!this._tmp) {
				this._tmp = new BitmapData(inbmp.width, inbmp.height, false, 0x0);
			} else if (inbmp.width != this._tmp.width || inbmp.height != this._tmp.height) {
				this._tmp.dispose();
				this._tmp = new BitmapData(inbmp.width, inbmp.height, false, 0x0);
			}
			this._tmp.applyFilter(inbmp, inbmp.rect, ZERO_POINT, MONO_FILTER);
			var outbmp:BitmapData = FLARRaster_BitmapData(i_output).bitmapData;
			outbmp.fillRect(outbmp.rect, 0x0);
			var rect:Rectangle = outbmp.rect;
			rect.inflate(-1, -1);
			outbmp.threshold(this._tmp, rect, ONE_POINT, '<=', this._threshold, 0xffffffff, 0xff);
			
			// SOC:
			/*
			input bmpData (source image, e.g. from camera) is reduced to its brightness channel by applying MONO_FILTER.
			output bmpData is initialized to a black rect.
			pixels in B/W input that are <= this._threshold are set to 0xff.
			...seems odd that dark pixels are made white, instead of black...?
			*/ 
		}
	}
}