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
	import __AS3__.vec.Vector;
	
	import flash.display.Loader;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.utils.Dictionary;
	
	import org.libspark.flartoolkit.FLARException;
	import org.libspark.flartoolkit.core.FLARCode;
	
	/**
	 * manages loading FLARPatterns and instantiating corresponding FLARCodes.
	 * 
	 * @author	Eric Socolofsky
	 * @url		http://transmote.com/flar
	 */
	public class FLARPatternLoader extends EventDispatcher {
		private var loadingPatterns:Vector.<FLARPattern>;
		private var _loadedPatterns:Array;	// :FLARCode
		private var _unscaledMarkerWidths:Array;
		
		private var patternsByLoader:Dictionary;
		private var flarPatternsByFlarCodes:Dictionary;
		
		private var numPatternsLoaded:uint = 0;
		private var bLoading:Boolean;
		
		
		/**
		 * constructor.
		 */
		public function FLARPatternLoader () {}
		
		/**
		 * get loaded patterns, as FLARCode instances.
		 * @throws	Error	if still loading.
		 */
		public function get loadedPatterns () :Array {
			if (this.bLoading) {
				throw new Error("currently loading patterns.  listen for Event.INIT to signal load completion.");
			}
			
			return this._loadedPatterns;
		}
		
		public function dispose () :void {
			if (this.bLoading) {
				this.loadingPatterns = null;
				var loader:Loader;
				for (var loaderKey:* in this.patternsByLoader) {
					loader = loaderKey as Loader;
					if (!loader) { continue; }
					delete this.patternsByLoader[loader];
					loader.removeEventListener(IOErrorEvent.IO_ERROR, this.onPatternLoadError);
					loader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, this.onPatternLoadError);
					loader.removeEventListener(Event.COMPLETE, this.onPatternLoaded);
					loader.close();
				}
				this.patternsByLoader = null;
			} else {
				var flarCode:FLARCode;
				for each (flarCode in this.loadedPatterns) {
					// NOTE: FLARToolkit classes do not implement any disposal functionality,
					//		 and will likely not be removed from memory on FLARManager disposal.
					//flarCode.dispose();
				}
				
				for (var flarCodeKey:* in this.flarPatternsByFlarCodes) {
					flarCode = flarCodeKey as FLARCode;
					if (!flarCode) { continue; }
					delete this.flarPatternsByFlarCodes[flarCode];
				}
				this.flarPatternsByFlarCodes = null;
			}
		}
		
		/**
		 * return unscaled marker widths, for use by FLARMultiMarkerDetector.
		 * this array is synchronized with this.loadedPatterns --
		 * the unscaledMarkerWidth at each index corresponds to the loaded pattern at each index.
		 */
		public function get unscaledMarkerWidths () :Array {
			return this._unscaledMarkerWidths;
		}
		
		/**
		 * load a list of FLARPatterns and store as FLARCodes,
		 * accessible as this.loadedPatterns.
		 * 
		 * @param	patterns	Vector of FLARPatterns to load.  
		 * @throws	Error		if pattern load is currently in progress.
		 */
		public function loadPatterns (patterns:Vector.<FLARPattern>) :void {
			if (this.bLoading) {
				throw new Error("currently loading patterns.");
			}
			this.bLoading = true;
			
			this.loadingPatterns = patterns;
			this.patternsByLoader = new Dictionary(true);
			this.flarPatternsByFlarCodes = new Dictionary(true);
			this._loadedPatterns = new Array(this.loadingPatterns.length);
			
			var i:uint = this.loadingPatterns.length;
			while (i--) {
				this.loadPattern(this.loadingPatterns[i]);
			}
		}
		
		private function loadPattern (pattern:FLARPattern) :void {
			var loader:URLLoader = new URLLoader();
			loader.dataFormat = URLLoaderDataFormat.TEXT;
			loader.addEventListener(IOErrorEvent.IO_ERROR, this.onPatternLoadError);
			loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, this.onPatternLoadError);
			loader.addEventListener(Event.COMPLETE, this.onPatternLoaded);
			this.patternsByLoader[loader] = pattern;
			loader.load(new URLRequest(pattern.filename));
		}
		
		private function onPatternLoadError (evt:Event) :void {
			var errorText:String = "Pattern load error.";
			if (evt is IOErrorEvent) {
				errorText += ("\n"+ IOErrorEvent(evt).text);
			} else if (evt is SecurityErrorEvent) {
				errorText += ("\n"+ SecurityErrorEvent(evt).text);
			}
			
			this.onPatternLoaded(evt, new Error(errorText));
		}
		
		private function onPatternLoaded (evt:Event, error:Error=null) :void {
			var loader:URLLoader = evt.target as URLLoader;
			loader.removeEventListener(IOErrorEvent.IO_ERROR, this.onPatternLoadError);
			loader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, this.onPatternLoadError);
			loader.removeEventListener(Event.COMPLETE, this.onPatternLoaded);
			
			var loadedPattern:FLARPattern = FLARPattern(this.patternsByLoader[loader]);
			delete this.patternsByLoader[loader];
			var loadedPatternIndex:int = this.loadingPatterns.indexOf(loadedPattern);
			
			if (error) {
				this.checkForLoadCompletion();
				// TODO: probably want to change this to trace(), not throw.
				trace(error);
			} else {
				// create the FLARCode from the loaded pattern data
				var flarCode:FLARCode = new FLARCode(loadedPattern._resolution, loadedPattern._resolution, loadedPattern._patternToBorderRatio, loadedPattern._patternToBorderRatio);
				try {
					flarCode.loadARPatt(String(loader.data));
				} catch (e:FLARException) {
					throw e;
				}
				
				// store the FLARCode in this.loadedPatterns
				this.flarPatternsByFlarCodes[flarCode] = loadedPattern;
				this._loadedPatterns[loadedPatternIndex] = flarCode;
			}
			
			this.numPatternsLoaded++;
			this.checkForLoadCompletion();
		}
		
		private function checkForLoadCompletion () :void {
			if (this.numPatternsLoaded == this.loadingPatterns.length) {
				this.sortPatternsAndUnscaledMarkerWidths();
				this.loadingPatterns = null;	// release reference to FLARPatterns Vector
				this.bLoading = false;
				this.dispatchEvent(new Event(Event.INIT));
			}
		}
		
		private function sortPatternsAndUnscaledMarkerWidths () :void {
			var i:int = this.loadingPatterns.length;
			this._unscaledMarkerWidths = new Array(i);
			while (i--) {
				if (this._loadedPatterns[i]) {
					this._unscaledMarkerWidths[i] = this.loadingPatterns[i].unscaledMarkerWidth;
				} else {
					// cull patterns that did not load successfully
					this._loadedPatterns.splice(i, 1);
					this._unscaledMarkerWidths.splice(i, 1);
				}
			}
		}
	}
}