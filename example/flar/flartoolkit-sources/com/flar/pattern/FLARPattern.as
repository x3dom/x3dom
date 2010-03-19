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

package com.transmote.flar.pattern {
	
	/**
	 * wrapper for all information needed by FLARToolkit to track an individual marker.
	 * 
	 * @author	Eric Socolofsky
	 * @url		http://transmote.com/flar
	 */
	public class FLARPattern {
		public static const DEFAULT_PATTERN_TO_BORDER_RATIO:Number = 50;
		public static const DEFAULT_UNSCALED_MARKER_WIDTH:Number = 80;
		public static const DEFAULT_MIN_CONFIDENCE:Number = 0.5;
		
		internal var _filename:String;
		internal var _resolution:int;
		internal var _patternToBorderRatio:Number;
		internal var _unscaledMarkerWidth:Number;
		internal var _minConfidence:Number;
		
		/**
		 * constructor.
		 * 
		 * @param	filename				location of marker pattern file.
		 * @param	resolution				resolution (width/height) of marker pattern file.
		 * @param	patternToBorderRatio	out of the entire width/height of a marker, the amount that
		 * 									the pattern occupies relative to the amount the border occupies.
		 * 									value is expressed as a percentage.
		 * 									for example, a value of 50 indicates that the width of the pattern area
		 * 									is equal to the total width (on either side of the pattern) of the border.
		 * 									defaults to 50.  not yet implemented in FLARToolkit for multiple markers;
		 * 									therefore, not yet implemented in FLARManager.
		 * @param	unscaledMarkerWidth		the width of a marker (in pixels) on-screen at which
		 * 									the scale of its transformation matrix is 1.0.
		 * 									defaults to 80.
		 * @param	minConfidence			'confidence' is a value assigned by FLARToolkit to each detected marker,
		 * 									that describes the algorithm's perceived accuracy of the pattern match.
		 * 									this value sets the minimum confidence required to signal a recognized marker.
		 * 									defaults to 0.5.
		 */
		public function FLARPattern (filename:String, resolution:int, patternToBorderRatio:Number=DEFAULT_PATTERN_TO_BORDER_RATIO,
									 unscaledMarkerWidth:Number=DEFAULT_UNSCALED_MARKER_WIDTH, minConfidence:Number=DEFAULT_MIN_CONFIDENCE) {
			this._filename = filename;
			this._resolution = resolution;
			
			// default parameters don't work with Numbers...
			if (isNaN(patternToBorderRatio) || patternToBorderRatio <= 0) {
				this._patternToBorderRatio = DEFAULT_PATTERN_TO_BORDER_RATIO;
			} else {
				this._patternToBorderRatio = patternToBorderRatio;
			}
			
			if (isNaN(unscaledMarkerWidth) || unscaledMarkerWidth <= 0) {
				this._unscaledMarkerWidth = DEFAULT_UNSCALED_MARKER_WIDTH;
			} else {
				this._unscaledMarkerWidth = unscaledMarkerWidth;
			}
			
			if (isNaN(minConfidence)) {
				this._minConfidence = DEFAULT_MIN_CONFIDENCE;
			} else {
				this._minConfidence = minConfidence;
			}
		}
		
		/**
		 * location of marker pattern file.
		 */
		public function get filename () :String {
			return this._filename;
		}
		
		/**
		 * resolution (width/height) of marker pattern file.
		 */
		public function get resolution () :Number {
			return this._resolution;
		}
		
		/**
		 * out of the entire width/height of a marker, the amount that
		 * the pattern occupies relative to the amount the border occupies.
		 * value is expressed as a percentage.
		 * for example, a value of 50 indicates that the width of the pattern area
		 * is equal to the total width (on either side of the pattern) of the border.
		 * not yet implemented in FLARToolkit for multiple markers;
		 * therefore, not yet implemented in FLARManager.
		 */
		public function get patternToBorderRatio () :Number {
			return this._patternToBorderRatio;
		}
		/**
		 * the width of a marker (in pixels) on-screen at which
		 * the scale of its transformation matrix is 1.0.
		 */
		public function get unscaledMarkerWidth () :Number {
			return this._unscaledMarkerWidth;
		}
		
		/**
		 * 'confidence' is a value assigned by FLARToolkit to each detected marker,
		 * that describes the algorithm's perceived accuracy of the pattern match.
		 * this value sets the minimum confidence required to signal a recognized marker.
		 */
		public function get minConfidence () :Number {
			return this._minConfidence;
		}
		public function set minConfidence (val:Number) :void {
			this._minConfidence = val;
		}
	}
}