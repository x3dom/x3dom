package {
	
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.PixelSnapping;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.SecurityErrorEvent;
	import flash.media.Camera;
	import flash.media.Video;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	
	import flash.system.*;
	
	import org.libspark.flartoolkit.core.FLARCode;
	import org.libspark.flartoolkit.core.param.FLARParam;
	import org.libspark.flartoolkit.core.raster.rgb.FLARRgbRaster_BitmapData;
	import org.libspark.flartoolkit.detector.FLARSingleMarkerDetector;
	
	[Event(name="init",type="flash.events.Event")]
	[Event(name="init",type="flash.events.Event")]
	[Event(name="ioError",type="flash.events.IOErrorEvent")]
	[Event(name="securityError",type="flash.events.SecurityErrorEvent")]

	public class ARAppBase extends Sprite {
		
		private var _loader:URLLoader;
		private var _cameraFile:String;
		private var _codeFile:String;
		private var _width:int;
		private var _height:int;
		private var _codeWidth:int;
		private var camIndex:String;
		
		protected var _param:FLARParam;
		protected var _code:FLARCode;
		protected var _raster:FLARRgbRaster_BitmapData;
		protected var _detector:FLARSingleMarkerDetector;
		
		protected var _webcam:Camera;
		protected var _video:Video;
		protected var _capture:Bitmap;
		
		public function ARAppBase() {
		}
		
		protected function init(cameraFile:String, codeFile:String, canvasWidth:int = 320, canvasHeight:int = 240, codeWidth:int = 80):void {
			this._cameraFile = cameraFile;
			this._width = canvasWidth;
			this._height = canvasHeight;
			this._codeFile = codeFile;
			this._codeWidth = codeWidth;
			
			this._loader = new URLLoader();
			this._loader.dataFormat = URLLoaderDataFormat.BINARY;
			this._loader.addEventListener(Event.COMPLETE, this._onLoadParam);
			this._loader.addEventListener(IOErrorEvent.IO_ERROR, this.dispatchEvent);
			this._loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, this.dispatchEvent);
			this._loader.load(new URLRequest(this._cameraFile));
		}
		
		private function _onLoadParam(e:Event):void {
			this._loader.removeEventListener(Event.COMPLETE, this._onLoadParam);
			this._param = new FLARParam();
			this._param.loadARParam(this._loader.data);
			this._param.changeScreenSize(this._width, this._height);
			
			this._loader.dataFormat = URLLoaderDataFormat.TEXT;
			this._loader.addEventListener(Event.COMPLETE, this._onLoadCode);
			this._loader.load(new URLRequest(this._codeFile));
		}
		
		private function _onLoadCode(e:Event):void {
			this._code = new FLARCode(16, 16);
			this._code.loadARPatt(this._loader.data);
			
			this._loader.removeEventListener(Event.COMPLETE, this._onLoadCode);
			this._loader.removeEventListener(IOErrorEvent.IO_ERROR, this.dispatchEvent);
			this._loader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, this.dispatchEvent);
			this._loader = null;

			// setup webcam
			
			var index:int = 0;
			
			for (var i=0; i<Camera.names.length; i++)
			{
				if (Camera.names[i] == "USB Video Class Video")
				{
					index = i;
				}
				
			}
			
			this._webcam = Camera.getCamera(String(index));
			//this._webcam = Camera.getCamera();
			if (!this._webcam) {
				throw new Error('No webcam!!!!');
			}
			this._webcam.setMode(this._width, this._height, 30);
			this._video = new Video(this._width, this._height);
			this._video.attachCamera(this._webcam);
			this._capture = new Bitmap(new BitmapData(this._width, this._height, false, 0), PixelSnapping.AUTO, true);
			
			// setup ARToolkit
			this._raster = new FLARRgbRaster_BitmapData(this._capture.bitmapData);
			this._detector = new FLARSingleMarkerDetector(this._param, this._code, this._codeWidth);
			this._detector.setContinueMode(true);
			
			this.onInit();
		}
		
		protected function onInit():void {
		}
	}
}