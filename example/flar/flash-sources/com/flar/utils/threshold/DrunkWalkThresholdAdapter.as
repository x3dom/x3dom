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
	import flash.display.BitmapData;
	
	/**
	 * DrunkWalkThresholdAdapter calculates a new threshold using weighted randomization.
	 * when marker detection is poor, DrunkWalkThresholdAdapter adjusts the threshold by moving a random amount
	 * away from the current threshold value based on this.speed and this.bias.
	 * 
	 * see the following URLs for more information:
	 * http://blog.jactionscripters.com/2009/05/18/adaptive-thresholding-experiment/comment-page-1/#comment-367
	 * http://makc3d.wordpress.com/2009/07/03/alternative-to-adaptive-thresholding/
	 */
	public class DrunkWalkThresholdAdapter implements IThresholdAdapter {
		private static const MIN_VARIANCE:Number = 5;
		private static const MAX_VARIANCE:Number = 50;
		
		private var _speed:Number;
		private var _bias:Number;
		
		private var adaptiveThresholdingStep:Number = MIN_VARIANCE;
		
		
		public function DrunkWalkThresholdAdapter (speed:Number=0.3, bias:Number=-0.1) {
			this._speed = speed;
			this._bias = bias;
		}
		
		/**
		 * init from a name-value paired object that contains parameters parsed from XML.
		 */
		public function initFromXML (paramsObj:Object) :void {
			if (!isNaN(paramsObj.speed)) {
				this.speed = parseFloat(paramsObj.speed);
			}
			if (!isNaN(paramsObj.bias)) {
				this.bias = parseFloat(paramsObj.bias);
			}
		}

		/**
		 * calculate a new threshold.
		 * @param	source				unused by DrunkWalkThresholdAdapter.
		 * @param	currentThreshold	current threshold value.
		 * @return						new threshold value.
		 */
		public function calculateThreshold (source:BitmapData, currentThreshold:Number) :Number {
			var thresholdAdaptationMod:Number = (Math.random()-0.5 + 0.5*this._bias);
			this.adaptiveThresholdingStep = Math.min(Math.pow(this.adaptiveThresholdingStep, 1+this._speed), MAX_VARIANCE);
			
			var newThreshold:Number = currentThreshold + (thresholdAdaptationMod * this.adaptiveThresholdingStep);
			newThreshold = Math.max(0, Math.min(newThreshold, 255));
			
			return newThreshold;
		}
		
		/**
		 * reset calculations.
		 */
		public function resetCalculations (currentThreshold:Number) :void {
			this.adaptiveThresholdingStep = MIN_VARIANCE;
		}
		
		/**
		 * free this instance for garbage collection.
		 */
		public function dispose () :void {
			//
		}
		
		/**
		 * returns false;
		 * DrunkWalkThresholdAdapter runs only when confidence is low (poor marker detection).
		 */
		public function get runsEveryFrame () :Boolean {
			return false;
		}
		
		/**
		 * the speed at which the threshold changes during adaptive thresholding.
		 * larger values may increase the speed at which the markers in uneven illumination are detected,
		 * but may also result in instability in marker detection.
		 * 
		 * value must be zero or greater.  the default is 0.3.
		 * a value of zero will disable adaptive thresholding.
		 */
		public function get speed () :Number {
			return this._speed;
		}
		public function set speed (val:Number) :void {
			this._speed = Math.max(0, val);
		}
		
		/**
		 * the direction toward which adaptive thresholding trends.
		 * lower thresholds favor environments with too little light;
		 * higher thresholds favor environments with too much light.
		 * a value of -1 will adapt only toward a lower threshold.
		 * a value of +1 will adapt only toward a higher threshold.
		 * a value of 0 will adapt randomly in both directions, with no bias.
		 * the default is -0.1, as darker environments tend to be more common
		 * for viewing web applications than oversaturated environments.
		 */
		public function get bias () :Number {
			return this._bias;
		}
		public function set bias (val:Number) :void {
			this._bias = val;
		}
	}
}