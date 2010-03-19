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
	
	public interface IThresholdAdapter {
		/**
		 * init from a name-value paired object that contains parameters parsed from XML.
		 */
		function initFromXML (paramsObj:Object) :void;
		
		/**
		 * calculate a new threshold.
		 * 
		 * this algorithm may just calculate a threshold and pass that back to FLARManager,
		 * which then passes it on to FLARToolkit for internal thresholding.
		 * 
		 * however, this algorithm may also modify the source BitmapData directly.
		 * in this case, the algorithm must return -1, to tell FLARToolkit to skip
		 * its internal thresholding algorithm, and use the source BitmapData as modified here.
		 * 
		 * @param	source				source BitmapData used for computer vision analysis.
		 * @param	currentThreshold	current threshold value.
		 * @return						new threshold value.
		 */
		function calculateThreshold (source:BitmapData, currentThreshold:Number) :Number;
		
		/**
		 * reset calculations.
		 * @param	currentThreshold	current threshold value.
		 */
		function resetCalculations (currentThreshold:Number) :void;
		
		/**
		 * returns true if this threshold adapter should run every frame;
		 * returns false if this threshold adapter should run only when no markers are found.
		 */
		function get runsEveryFrame () :Boolean;
		
		/**
		 * free this instance for garbage collection.
		 */
		function dispose () :void;
	}
}