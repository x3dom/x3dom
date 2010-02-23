/* 
 * PROJECT: FLARManager
 * http://transmote.com/flar
 * Copyright 2009, Eric Socolofsky
 * --------------------------------------------------------------------------------
 * This work complements FLARToolkit, developed by Saqoosha as part of the Libspark project.
 *	http://www.libspark.org/wiki/saqoosha/FLARToolKit
 * FLARToolkit is Copyright (C)2008 Saqoosha,
 * and is ported from NYARToolkit, which is ported from ARToolkit.
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
 * For further information please contact:
 *	<eric(at)transmote.com>
 *	http://transmote.com/flar
 * 
 */

package com.transmote.flar.utils.threshold {
	import __AS3__.vec.Vector;
	
	import flash.display.BitmapData;
	import flash.filters.ColorMatrixFilter;
	import flash.geom.Point;
	
	
	/**
	 * IntegralImageThresholdAdapter applies thresholding directly to source BitmapData,
	 * using an <a href="http://en.wikipedia.org/wiki/Summed_area_table">integral image</a> algorithm.
	 * 
	 * @author	Eugene Zatepyakin
	 * @url		http://www.inspirit.ru/
	 * 
	 * @author	Eric Socolofsky
	 * @url		http://transmote.com/flar
 	 */
	public class IntegralImageThresholdAdapter implements IThresholdAdapter {
		private static const ZERO_POINT:Point = new Point();
		private static const MONO_FILTER:ColorMatrixFilter = new ColorMatrixFilter([
			0.2989, 0.5866, 0.1145, 0, 0,
			0.2989, 0.5866, 0.1145, 0, 0,
			0.2989, 0.5866, 0.1145, 0, 0,
			0, 0, 0, 1, 0
		]);
		
		private var inited:Boolean = false;
		private var w:int;
		private var h:int;
		private var size:int;
		private var S:int;
		private var S2:int;
		private const T:Number = 0.15;
		private const IT:Number = 1.0 - T;
		private var integral:Vector.<int>;
		private var threshold:Vector.<uint>;
		
		
		public function IntegralImageThresholdAdapter () {}
		
		/**
		 * init from a name-value paired object that contains parameters parsed from XML.
		 */
		public function initFromXML (paramsObj:Object) :void {
			// not implemented in this class.
		}
		
		/**
		 * IntegralImageThresholdAdapter directly modifies the source Bitmap data,
		 * and passes -1 for the threshold, to tell FLARToolkit not to apply its own thresholding.
		 * 
		 * @param	source				source BitmapData used for computer vision analysis.
		 * @param	currentThreshold	current threshold value.
		 * @return						new threshold value.
		 */
		public function calculateThreshold (source:BitmapData, currentThreshold:Number) :Number {
			if (!this.inited) {
				this.init(source);
			}
			
			source.applyFilter(source, source.rect, ZERO_POINT, MONO_FILTER);
			this.doThreshold(source);
			return -1;
		}
		
		/**
		 * reset calculations.
		 * @param	currentThreshold	current threshold value.
		 */
		public function resetCalculations (currentThreshold:Number) :void {
			//
		}
		
		/**
		 * free this instance for garbage collection.
		 */
		public function dispose () :void {
			//
		}
		
		/**
		 * IntegralImageThresholdAdapter must run every frame.
		 */
		public function get runsEveryFrame () :Boolean {
			return true;
		}
		
		private function init (source:BitmapData) :void {
			this.w = source.width;
			this.h = source.height;
			
			this.size = source.width * source.height;
			this.S = this.w / 8;
			this.S2 = this.S >> 1;
			
			this.integral = new Vector.<int>(size, true);
			this.threshold = new Vector.<uint>(size, true);
			
			this.inited = true;
		}
		
		private function doThreshold (source:BitmapData) :void {
			var data:Vector.<uint> = source.getVector(source.rect);
			data.fixed = true;
			var i:int, j:int, diff:int;
			var x1:int, y1:int, x2:int, y2:int, ind1:int, ind2:int, ind3:int;
			var sum:int = 0;
			var ind:int = 0;
			
			while( ind < size )
			{
				sum += data[ind] & 0xFF;
				integral[ind] = sum;
				ind += w;
			}
			 
			x1 = 0;
			for( i = 1; i < w; ++i )
			{
				sum = 0;
				ind = i;
				ind3 = ind - S2;
			 
				if( i > S ) x1 = i - S;
				diff = i - x1;
				for( j = 0; j < h; ++j )
				{
					sum += data[ind] & 0xFF;
					integral[ind] = integral[int(ind-1)] + sum;
					ind += w;
			 
					if(i < S2) continue;
					if(j < S2) continue;
			 
					y1 = (j < S ? 0 : j - S);
			 
					ind1 = y1 * w;
					ind2 = j * w;
			 
					if (((data[ind3]&0xFF)*(diff * (j - y1))) < ((integral[int(ind2 + i)] - integral[int(ind1 + i)] - integral[int(ind2 + x1)] + integral[int(ind1 + x1)])*IT))
					{
						threshold[ind3] = 0xFFFFFF;
					} else {
						threshold[ind3] = 0x00;
					}
					ind3 += w;
				}
			}
			 
			y1 = 0;
			for( j = 0; j < h; ++j )
			{
				i = 0;
				y2 = h - 1;
				if( j < h - S2 ) 
				{
					i = w - S2;
					y2 = j + S2;
				}
			 
				ind = j * w + i;
				if( j > S2 ) y1 = j - S2;
				ind1 = y1 * w;
				ind2 = y2 * w;
				diff = y2 - y1;
				for( ; i < w; ++i, ++ind )
				{
			 
					x1 = ( i < S2 ? 0 : i - S2);
					x2 = i + S2;
			 
					// check the border
					if (x2 >= w) x2 = w - 1;
			 
					if (((data[ind]&0xFF)*((x2 - x1) * diff)) < ((integral[int(ind2 + x2)] - integral[int(ind1 + x2)] - integral[int(ind2 + x1)] + integral[int(ind1 + x1)])*IT))
					{
						threshold[ind] = 0xFFFFFF;
					} else {
						threshold[ind] = 0x00;
					}
				}
			}
			 
			source.setVector(source.rect, threshold);
		}
	}
}