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

package com.transmote.flar.source {
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.Loader;
	import flash.display.LoaderInfo;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.SecurityErrorEvent;
	import flash.geom.Matrix;
	import flash.geom.Rectangle;
	import flash.net.URLRequest;
	
	/**
	 * use the contents of a Loader as a source image for FLARToolkit marker detection.
	 * FLARLoaderSource samples the contents of a Loader against a white background,
	 * to provide maximum contrast for marker detection.
	 * this class can be used for testing marker detection without a camera,
	 * for example with a swf or jpeg with valid patterns within.
	 * 
	 * @author	Eric Socolofsky
	 * @url		http://transmote.com/flar
	 */
	public class FLARLoaderSource extends Sprite implements IFLARSource {
		private var _resultsToDisplayRatio:Number;
		
		private var loader:Loader;
		private var downsampleRatio:Number;
		
		private var displayWidth:Number;
		private var displayHeight:Number;
		private var displayBmpData:BitmapData;
		private var displayBitmap:Bitmap;
		private var displayMatrix:Matrix;
		
		private var sampleWidth:Number;
		private var sampleHeight:Number;
		private var sampleBmpData:BitmapData;
		private var sampleBitmap:Bitmap;
		private var sampleMatrix:Matrix;
		private var sampleMatRect:Rectangle;	// area of sampleBmpData to fill with a white background before sending to FLARToolkit 
		
		
		/**
		 * constructor.
		 * @param	contentPath			filename to load.
		 * @param	displayWidth		width of source file.
		 * @param	displayHeight		height of source file.
		 * @param	downsampleRatio		amount to downsample camera input.
		 * 								adjust to balance between image quality and marker tracking performance.
		 * 								a value of 1.0 results in no downsampling;
		 * 								a value of 0.5 (the default) downsamples the camera input by half.
		 */
		public function FLARLoaderSource (contentPath:String, displayWidth:Number, displayHeight:Number, downsampleRatio:Number=0.5) {
			this.downsampleRatio = downsampleRatio;
			
			this.displayWidth = displayWidth;
			this.displayHeight = displayHeight;
			this.sampleWidth = this.displayWidth * this.downsampleRatio;
			this.sampleHeight = this.displayHeight * this.downsampleRatio;
			
			this._resultsToDisplayRatio = this.sampleWidth / this.displayWidth;
			this.sampleMatRect = new Rectangle(0, 0, this.sampleWidth, this.sampleHeight);
			
			this.loadContent(contentPath);
		}
		
		/**
		 * update the BitmapData source used for analysis.
		 */
		public function update () :void {
			this.displayBmpData.draw(this.loader, this.displayMatrix);
			
			this.sampleBmpData.fillRect(this.sampleMatRect, 0xFFFFFFFF);
			this.sampleBmpData.draw(this.loader, this.sampleMatrix);
		}
		
		/**
		 * retrieve the BitmapData source used for analysis.
		 * NOTE: returns the actual BitmapData object, not a clone.
		 */
		public function get source () :BitmapData {
			return this.sampleBmpData;
		}
		
		/**
		 * size of BitmapData source used for analysis.
		 */
		public function get sourceSize () :Rectangle {
			return new Rectangle(0, 0, this.sampleWidth, this.sampleHeight);
		}
		
		/**
		 * ratio of area of reported results to display size.
		 * used to scale results of FLARToolkit analysis to correctly fit display area.
		 */
		public function get resultsToDisplayRatio () :Number {
			return this._resultsToDisplayRatio;
		}
		
		/**
		 * FLARLoaderSource cannot be mirrored;
		 * method is here only for compliance with IFLARSource.
		 */
		public function get mirrored () :Boolean {
			return false;
		}
		public function set mirrored (val:Boolean) :void {}
		
		/**
		 * returns true if initialization is complete.
		 * FLARLoaderSource is inited automatically in constructor.
		 */
		public function get inited () :Boolean {
			return true;
		}
		
		/**
		 * halts all processes and frees this instance for garbage collection.
		 */
		public function dispose () :void {
			this.loader.unloadAndStop();
			
			this.displayBmpData.dispose();
			this.displayBmpData = null;
			this.displayBitmap = null;
			this.displayMatrix = null;
			
			this.sampleBmpData.dispose();
			this.sampleBmpData = null;
			this.sampleBitmap = null;
			this.sampleMatrix = null;
		}
		
		private function loadContent (path:String) :void {
			this.loader = new Loader();
			this.loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, this.onLoadError, false, 0, true);
			this.loader.contentLoaderInfo.addEventListener(SecurityErrorEvent.SECURITY_ERROR, this.onLoadError, false, 0, true);
			this.loader.contentLoaderInfo.addEventListener(Event.COMPLETE, this.onLoaded, false, 0, true);
			this.loader.load(new URLRequest(path));
		}
		
		private function onLoadError (evt:Event) :void {
			var errorText:String = "FLARLoaderSource load error.";
			if (evt is IOErrorEvent) {
				errorText = IOErrorEvent(evt).text;
			} else if (evt is SecurityErrorEvent) {
				errorText = SecurityErrorEvent(evt).text;
			}
			
			this.onLoaded(evt, new Error(errorText));
		}
		
		private function onLoaded (evt:Event, error:Error=null) :void {
			var loaderInfo:LoaderInfo = evt.target as LoaderInfo;
			
			loaderInfo.removeEventListener(IOErrorEvent.IO_ERROR, this.onLoadError);
			loaderInfo.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, this.onLoadError);
			loaderInfo.removeEventListener(Event.COMPLETE, this.onLoaded);
			
			if (error) { throw error; }
			
			// BitmapData downsampled from source video, sent to FLARToolkit every frame
			this.sampleBmpData = new BitmapData(this.sampleWidth, this.sampleHeight, false, 0);
			this.sampleBitmap = new Bitmap(this.sampleBmpData);
			this.sampleBitmap.width = this.displayWidth;
			this.sampleBitmap.height = this.displayHeight;
			
			// cropped, full-res video displayed on-screen
			this.displayBmpData = new BitmapData(this.displayWidth, this.displayHeight, false, 0);
			this.displayBitmap = new Bitmap(this.displayBmpData);
			
			// full-res Bitmap for display
			this.addChild(this.displayBitmap);
			
			// uncomment to view downsampled BitmapData sent to FLARToolkit
//			this.addChild(this.sampleBitmap);
			
			this.buildSampleMatrices();
			
			this.dispatchEvent(new Event(Event.INIT));
		}
		
		private function buildSampleMatrices () :void {
			// construct transformation matrix used when updating displayed video
			// and when updating BitmapData source for FLARToolkit
			this.displayMatrix = new Matrix(1, 0, 0, 1);
			this.sampleMatrix = new Matrix(
				this._resultsToDisplayRatio, 0,
				0, this._resultsToDisplayRatio);
		}
	}
}