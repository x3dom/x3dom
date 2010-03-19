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
	
	/**
	 * HistogramThresholdAdapter calculates a threshold based on a histogram of the source image.
	 * for speed, the average of the values per histogram channel is used,
	 * rather than calculating valleys.
	 */
	public class HistogramThresholdAdapter implements IThresholdAdapter {
		private static const MAXIMUM_DISPLACEMENT_FROM_AVERAGE:Number = 50;
		private static const STEP_SIZE_INCREMENT:Number = 2;
		
		private var currentStepSize:Number = 0;
		private var lastSuccessfulThreshold:Number = 0;
		
		public function HistogramThresholdAdapter () {}
		
		/**
		 * init from a name-value paired object that contains parameters parsed from XML.
		 */
		public function initFromXML (paramsObj:Object) :void {
			// not implemented in this class.
		}
		
		/**
		 * calculate a new threshold.
		 * @param	source				source BitmapData used for computer vision analysis.
		 * @param	currentThreshold	current threshold value.
		 * @return						new threshold value.
		 */
		public function calculateThreshold (source:BitmapData, currentThreshold:Number) :Number {
			var histogram:Vector.<Vector.<Number>> = source.histogram();
			var numPx:Number = source.width * source.height;
			
			// calculate average brightness of source image
			var i:int = 255;
			var sum:Number = 0;
			while (i--) {
				sum += (histogram[0][i] + histogram[1][i] + histogram[2][i]) * i;
			}
			var avg:Number = sum / (numPx * 3) + this.currentStepSize;
			
			/*
			var dist:Number = avg - this.lastSuccessfulThreshold;
			if (dist > 0) {
				this.currentStepSize = Math.min(MAXIMUM_DISPLACEMENT_FROM_AVERAGE, this.currentStepSize + STEP_SIZE_INCREMENT);
			} else {
				this.currentStepSize = Math.max(-MAXIMUM_DISPLACEMENT_FROM_AVERAGE, this.currentStepSize - STEP_SIZE_INCREMENT);
			}
			*/
			
			// step away from average brightness,
			// alternately in positive and negative directions.
			this.currentStepSize *= -1;
			if (this.currentStepSize > 0) {
				this.currentStepSize = Math.min(MAXIMUM_DISPLACEMENT_FROM_AVERAGE, this.currentStepSize + STEP_SIZE_INCREMENT);
			} else {
				this.currentStepSize = Math.max(-MAXIMUM_DISPLACEMENT_FROM_AVERAGE, this.currentStepSize - STEP_SIZE_INCREMENT);
			}
			
			return Math.max(0, Math.min(avg, 255));
		}
		
		/**
		 * reset calculations.
		 * @param	currentThreshold	current threshold value.
		 */
		public function resetCalculations (currentThreshold:Number) :void {
			this.lastSuccessfulThreshold = currentThreshold;
			this.currentStepSize = 0;
		}
		
		/**
		 * free this instance for garbage collection.
		 */
		public function dispose () :void {
			//
		}
		
		/**
		 * returns false;
		 * HistogramThresholdAdapter runs only when confidence is low (poor marker detection).
		 */
		public function get runsEveryFrame () :Boolean {
			return false;
		}
	}
}