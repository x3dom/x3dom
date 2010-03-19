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
	import __AS3__.vec.Vector;
	
	import com.transmote.utils.time.Timeout;
	
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.BlendMode;
	import flash.display.Sprite;
	import flash.events.ActivityEvent;
	import flash.events.ErrorEvent;
	import flash.events.StatusEvent;
	import flash.geom.Matrix;
	import flash.geom.Rectangle;
	import flash.media.Camera;
	import flash.media.Video;

	/**
	 * Use the contents of a Camera feed as a source image for FLARToolkit marker detection.
	 * 
	 * @author	Eric Socolofsky
	 * @url		http://transmote.com/flar
	 * @see		com.transmote.flar.FLARManager
	 */
	public class FLARCameraSource extends Sprite implements IFLARSource {
		private static const CAMERA_VALIDATION_TIME:Number = 3000;
		private static const VALID_CAMERA_MIN_FRAME_DIFFERENCE:uint = 10;
		
		private var _resultsToDisplayRatio:Number;
		private var _mirrored:Boolean;
		private var _useDefaultCamera:Boolean;
		private var _inited:Boolean;
		
		private var camera:Camera;
		private var video:Video;
		private var manualCameraIndex:int = -1;
		private var cameraValidationTimeout:Timeout;
		private var attemptedCameras:Vector.<Boolean>;
		private var cameraValidationBmpData:BitmapData;
		
		private var displayBmpData:BitmapData;
		private var displayBitmap:Bitmap;
		private var displayMatrix:Matrix;
		
		private var sampleWidth:Number;
		private var sampleHeight:Number;
		private var sampleBmpData:BitmapData;
		private var sampleBitmap:Bitmap;
		private var sampleMatrix:Matrix;
		private var downsampleRatio:Number;
		
		
		/**
		 * constructor.
		 */
		public function FLARCameraSource () {}
		
		/**
		 * Initialize this FLARCameraSource.
		 * @param	captureWidth		width at which to capture video.
		 * @param	captureHeight		height at which to capture video.
		 * @param	fps					framerate of camera capture.
		 * @param	mirrored			if true, video is flipped horizontally. 
		 * @param	displayWidth		width at which to display video.
		 * @param	displayHeight		height at which to display video.
		 * @param	downsampleRatio		amount to downsample camera input.
		 *								The captured video is scaled down by this value
		 * 								before being sent to FLARToolkit for analysis.  
		 * 								FLARToolkit runs faster with more downsampling,
		 * 								but also has more difficulty recognizing marker patterns.
		 * 								a value of 1.0 results in no downsampling;
		 * 								a value of 0.5 (the default) downsamples the camera input by half.
		 * 
		 * @throws	Error				if no camera is found.
		 * 								(thrown by this.initCamera, called from this method.)
		 */
		public function init (
			captureWidth:int=320, captureHeight:int=240,
			fps:Number=30, mirrored:Boolean=true,
			displayWidth:int=-1, displayHeight:int=-1,
			downsampleRatio:Number=0.5) :void {
			
			// NOTE: removed init from ctor and made public to allow instantiation and addition to display list
			//		 while waiting for configuration file to load.
			
			if (displayWidth == -1) {
				displayWidth = captureWidth;
			}
			if (displayHeight == -1) {
				displayHeight = captureHeight;
			}
			
			this.initCamera(captureWidth, captureHeight, fps);
			
			this.downsampleRatio = downsampleRatio;
			
			// sampleWidth/Height describe size of BitmapData sent to FLARToolkit every frame
			this.sampleWidth = captureWidth * this.downsampleRatio;
			this.sampleHeight = captureHeight * this.downsampleRatio;

			// scale and crop camera source to fit within specified display width/height.
			var fitWidthRatio:Number = displayWidth / captureWidth;
			var fitHeightRatio:Number = displayHeight / captureHeight;
			
			var videoWidth:Number, videoHeight:Number;
			var videoX:Number=0, videoY:Number=0;
			
			if (fitHeightRatio > fitWidthRatio) {
				// fit to height, center horizontally, crop left/right edges
				videoWidth = fitHeightRatio * captureWidth;
				videoHeight = displayHeight;
				videoX = -0.5 * (videoWidth - displayWidth);
				this._resultsToDisplayRatio = 1 / fitHeightRatio;
				this.sampleWidth = this.sampleHeight * (displayWidth/displayHeight);
			} else {
				// fit to width, center vertically, crop top/bottom edges
				videoWidth = displayWidth;
				videoHeight = fitWidthRatio * captureHeight;
				videoY = -0.5 * (videoHeight - displayHeight);
				this._resultsToDisplayRatio = 1 / fitWidthRatio;
				this.sampleHeight = this.sampleWidth / (displayWidth/displayHeight);
			}
			this._resultsToDisplayRatio *= this.downsampleRatio;
			
			// source video
			this.video = new Video(videoWidth, videoHeight);
			this.video.x = videoX;
			this.video.y = videoY;
			this.video.attachCamera(this.camera);
			
			// BitmapData downsampled from source video, sent to FLARToolkit every frame
			this.sampleBmpData = new BitmapData(this.sampleWidth, this.sampleHeight, false, 0);
			this.sampleBitmap = new Bitmap(this.sampleBmpData);
			this.sampleBitmap.width = displayWidth;
			this.sampleBitmap.height = displayHeight;
			
			// cropped, full-res video displayed on-screen
			this.displayBmpData = new BitmapData(displayWidth, displayHeight, false, 0);
			this.displayBitmap = new Bitmap(this.displayBmpData);
			
			// cropped, full-res video for display
			this.addChild(this.displayBitmap);
			
			// uncomment to view source video
//			this.addChild(this.video);
			
			// uncomment to view downsampled video sent to FLARToolkit
//			this.addChild(this.sampleBitmap);
			
			// calls buildSampleMatrices
			this.mirrored = mirrored;
			
			this._inited = true;
		}
		
		/**
		 * update the BitmapData source.
		 */
		public function update () :void {
			this.displayBmpData.draw(this.video, this.displayMatrix);
			this.sampleBmpData.draw(this.video, this.sampleMatrix);
		}
		
		/**
		 * validate that the selected Camera is active,
		 * by checking Camera.activityLevel.
		 * if camera is not active, FLARCameraSource attempts
		 * to reinitialize with next available camera.
		 * 
		 * @param	bSuppressReinit		if false (default), this method will reinitialize the camera with the next available camera.
		 * @return	true				if selected Camera is active (activityLevel != -1).
		 */
		public function validateCamera (bSuppressReinit:Boolean=false) :Boolean {
			if (this.camera.activityLevel == -1) {
				if (!bSuppressReinit) {
					this.initCamera(this.camera.width, this.camera.height, this.camera.fps);
				}
				return false;
			} else {
				this.onInitialCameraValidation();
				return true;
			}
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
		 * use to scale (multiply) results of FLARToolkit analysis to correctly fit display area.
		 */
		public function get resultsToDisplayRatio () :Number {
			return this._resultsToDisplayRatio;
		}
		
		/**
		 * set to true to flip the camera image horizontally.
		 */
		public function get mirrored () :Boolean {
			return this._mirrored;
		}
		public function set mirrored (val:Boolean) :void {
			this._mirrored = val;
			this.buildSampleMatrices();
		}
		
		/**
		 * if true, FLARCameraSource will use the default camera,
		 * acquired via a <tt>Camera.getCamera()</tt> with no parameters.
		 * if false (the default), FLARCameraSource will loop through the camera drivers
		 * available on the system until it finds one that reports activity.
		 */
		public function get useDefaultCamera () :Boolean {
			return this._useDefaultCamera;
		}
		public function set useDefaultCamera (val:Boolean) :void {
			this._useDefaultCamera = val;
			if (this.camera) {
				this.initCamera(this.camera.width, this.camera.height, this.camera.fps);
			}
		}
		
		/**
		 * returns true if initialization is complete.
		 */
		public function get inited () :Boolean {
			return this._inited;
		}
		
		/**
		 * halts all processes and frees this instance for garbage collection.
		 */
		public function dispose () :void {
			this.camera = null;
			this.video.clear();
			this.video.attachCamera(null);
			this.video = null;
			
			if (this.cameraValidationTimeout) {
				this.cameraValidationTimeout.cancel();
			}
			this.cameraValidationTimeout = null;
			
			this.attemptedCameras = null;
			
			this.displayBmpData.dispose();
			this.displayBmpData = null;
			this.displayBitmap = null;
			this.displayMatrix = null;
			
			this.sampleBmpData.dispose();
			this.sampleBmpData = null;
			this.sampleBitmap = null;
			this.sampleMatrix = null;
		}
		
		/**
		 * the index, in Camera.names, of the active camera.
		 * if no camera is currently active, returns -1.
		 * 
		 * setting this value will destroy any active camera,
		 * and reinitialize with the camera at the specified index.
		 */
		public function get cameraIndex () :int {
			if (this.camera) {
				return this.camera.index;
			} else {
				return -1;
			}
		}
		public function set cameraIndex (index:int) :void {
			this.manualCameraIndex = index;
			if (this.camera) {
				this.initCamera(this.camera.width, this.camera.height, this.camera.fps);
			}
		}
		
		private function initCamera (captureWidth:int, captureHeight:int, fps:int) :void {
			if (this.cameraValidationTimeout) {
				this.cameraValidationTimeout.cancel();
			}
			
			if (this.camera) {
				this.destroyCamera();
			}
			
			var names:Array = Camera.names;
			
			if (this.useDefaultCamera) {
				this.camera = Camera.getCamera();
			} else {
				// set up Camera to capture source video
				if (this.manualCameraIndex >= 0) {
					// use camera index specified via cameraIndex accessor (setter)
					this.camera = Camera.getCamera(this.manualCameraIndex.toString());
				} else {
					// attempt to init cameras one-by-one until an active camera is selected,
					// or all options are exhausted, starting with the default camera.
					if (!this.attemptedCameras || this.attemptedCameras.length != Camera.names.length) {
						// if no cameras attempted yet, start with default camera
						this.attemptedCameras = new Vector.<Boolean>(Camera.names.length, true);
						this.camera = Camera.getCamera();
						this.attemptedCameras[this.camera.index] = true;
					} else {
						// else, loop through available camera drivers that have not yet been attempted
						for (var i:int=0; i<this.attemptedCameras.length; i++) {
							if (!this.attemptedCameras[i]) {
								this.attemptedCameras[i] = true;
								this.camera = Camera.getCamera(i.toString());
								break;
							}
						}
					}
				}
			}
			
			if (!this.camera) {
				this.dispatchEvent(new ErrorEvent(ErrorEvent.ERROR, true, false,
					"Camera not found.  Please check your connections and ensure that your camera is not in use by another application."));
				return;
			}
			
			this.camera.setMode(captureWidth, captureHeight, fps);
			this.camera.addEventListener(ActivityEvent.ACTIVITY, this.onCameraActivity);
			this.camera.addEventListener(StatusEvent.STATUS, this.onCameraStatus);
			trace("[FLARManager] Initing camera '"+ this.camera.name +"'.");
			
			if (this.video) {
				// this is not the first attempt to create the camera,
				// so clear out the video object and reattach the camera.
				this.video.clear();
				this.video.attachCamera(this.camera);
			}
			
			if (!this.camera.muted) {
				// if user has already allowed camera,
				// validate the camera after CAMERA_VALIDATION_TIME milliseconds.
				this.cameraValidationTimeout = new Timeout(this.validateCamera, CAMERA_VALIDATION_TIME);
			}
		}
		
		private function onCameraActivity (evt:ActivityEvent) :void {
			this.onInitialCameraValidation();
		}
		
		private function onCameraStatus (evt:StatusEvent) :void {
			this.camera.removeEventListener(StatusEvent.STATUS, this.onCameraStatus);
			
			if (evt.code == "Camera.Muted") {
				this.destroyCamera();
				this.dispatchEvent(new ErrorEvent(ErrorEvent.ERROR, true, false,
					"Camera access denied by user.  If you wish to view this content, please right/ctrl-click here and click 'settings' to enable your camera, and then refresh this page."));
			} else {
				this.cameraValidationTimeout = new Timeout(this.validateCamera, CAMERA_VALIDATION_TIME);
			}
		}
		
		private function onInitialCameraValidation () :void {
			this.camera.removeEventListener(ActivityEvent.ACTIVITY, this.onCameraActivity);
			this.camera.removeEventListener(StatusEvent.STATUS, this.onCameraStatus);
			this.cameraValidationTimeout.cancel();
			
			trace("[FLARManager] Initial camera validation complete...");
			
			this.cameraValidationBmpData = new BitmapData(this.displayBmpData.width, this.displayBmpData.height);
			this.cameraValidationBmpData.draw(this.displayBmpData);
			this.cameraValidationTimeout = new Timeout(this.onSecondaryCameraValidation, Math.max(50, CAMERA_VALIDATION_TIME*0.1));
		}
		
		/**
		 * validates a selected camera by verifying a difference between the initial frame and a later frame.
		 * based on a suggestion and implementation by Jim Alliban (http://www.augmatic.co.uk),
		 * for properly detecting some non-active bluetooth cameras. 
		 * this method is public only for access by Timeout; it should not be called by developers.
		 */
		public function onSecondaryCameraValidation () :void {
			var currentCameraBmpData:BitmapData = new BitmapData(this.displayBmpData.width, this.displayBmpData.height);
			currentCameraBmpData.draw(this.displayBmpData);
			
			this.cameraValidationBmpData.draw(currentCameraBmpData, new Matrix(), null, BlendMode.DIFFERENCE);
			var difference:uint = this.cameraValidationBmpData.threshold(
				this.cameraValidationBmpData,
				this.cameraValidationBmpData.rect,
				this.cameraValidationBmpData.rect.topLeft,
				">", 0xFF111111, 0xFF00FF00, 0x00FFFFFF);
			
			this.cameraValidationBmpData.dispose();
			currentCameraBmpData.dispose();
			
			if (difference < VALID_CAMERA_MIN_FRAME_DIFFERENCE) {
				trace("[FLARManager] Secondary camera validation failed for camera '"+ this.camera.name +"'.  Reiniting camera.");
				this.initCamera(this.camera.width, this.camera.height, this.camera.fps);
			} else {
				trace("[FLARManager] Validated camera '"+ this.camera.name +"'.");
			}
		}
		
		private function destroyCamera () :void {
			this.camera.removeEventListener(ActivityEvent.ACTIVITY, this.onCameraActivity);
			this.camera.removeEventListener(StatusEvent.STATUS, this.onCameraStatus);
			this.camera = null;
		}
		
		private function buildSampleMatrices () :void {
			if (!this.video) { return; }
			
			// construct transformation matrix used when updating displayed video
			// and when updating BitmapData source for FLARToolkit
			if (this._mirrored) {
				this.displayMatrix = new Matrix(-1, 0, 0, 1, this.video.width+this.video.x, this.video.y);
			} else {
				this.displayMatrix = new Matrix(1, 0, 0, 1, this.video.x, this.video.y);
			}
			
			// source does not get mirrored;
			// FLARToolkit must be able to recognize non-mirrored patterns.
			// transformation mirroring happens in FLARManager.detectMarkers().
			this.sampleMatrix = new Matrix(
				this._resultsToDisplayRatio, 0,
				0, this._resultsToDisplayRatio,
				this._resultsToDisplayRatio*this.video.x,
				this._resultsToDisplayRatio*this.video.y);
		}
	}
}