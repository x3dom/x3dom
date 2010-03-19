	package {
	
	import flash.display.Sprite;
	import flash.events.Event;
	
	import flash.external.ExternalInterface;
	import flash.system.*;
	
	import org.libspark.flartoolkit.core.transmat.FLARTransMatResult;
	import org.libspark.flartoolkit.pv3d.FLARBaseNode;
	import org.libspark.flartoolkit.pv3d.FLARCamera3D;
	import org.papervision3d.render.LazyRenderEngine;
	import org.papervision3d.scenes.Scene3D;
	import org.papervision3d.view.Viewport3D;
	import org.papervision3d.view.stats.StatsView;
	import org.papervision3d.core.math.Matrix3D;
	import org.papervision3d.core.math.Number3D;
	
	//import com.transmote.flar.utils.geom.FLARPVGeomUtils;
	
	public class PV3DARApp extends ARAppBase {
		
		protected var _base:Sprite;
		protected var _viewport:Viewport3D;
		protected var _camera3d:FLARCamera3D;
		protected var _scene:Scene3D;
		protected var _renderer:LazyRenderEngine;
		protected var _baseNode:FLARBaseNode;
		
		protected var _resultMat:FLARTransMatResult = new FLARTransMatResult();
		
		public function PV3DARApp() {
		}
		
		protected override function onInit():void {
			super.onInit();
			
			this._base = this.addChild(new Sprite()) as Sprite;
			
			this._capture.width = 640;
			this._capture.height = 480;
			this._base.addChild(this._capture);
			
			this._viewport = this._base.addChild(new Viewport3D(320, 240)) as Viewport3D;
			this._viewport.scaleX = 640 / 320;
			this._viewport.scaleY = 480 / 240;
			this._viewport.x = -4; // 4pix ???
			
			this._camera3d = new FLARCamera3D(this._param);
			
			this._scene = new Scene3D();
			this._baseNode = this._scene.addChild(new FLARBaseNode(FLARBaseNode.AXIS_MODE_PV3D)) as FLARBaseNode;
			//this._baseNode = this._scene.addChild(new FLARBaseNode(FLARBaseNode.AXIS_MODE_ORIGINAL)) as FLARBaseNode;
			
			this._renderer = new LazyRenderEngine(this._scene, this._camera3d, this._viewport);

			this.addEventListener(Event.ENTER_FRAME, this._onEnterFrame);
		}
		
		private function _onEnterFrame(e:Event = null):void {
			this._capture.bitmapData.draw(this._video);
			
			var detected:Boolean = false;
			try {
				detected = this._detector.detectMarkerLite(this._raster, 80) && this._detector.getConfidence() > 0.5;
			} catch (e:Error) {}
			
			if (detected) {
				this._detector.getTransformMatrix(this._resultMat);
				this._baseNode.setTransformMatrix(this._resultMat);
				this._baseNode.visible = true;
				// send Matrix to JS (WebGL)
				detected_js(e, this._resultMat);
			} else {
				this._baseNode.visible = false;
				notdetected_js(e);
			}
			
			this._renderer.render();
		}
		
		public function set mirror(value:Boolean):void {
			if (value) {
				this._base.scaleX = -1;
				this._base.x = 640;
			} else {
				this._base.scaleX = 1;
				this._base.x = 0;
			}
		}
		
		public function get mirror():Boolean {
			return this._base.scaleX < 0;
		}
		
		
		// ** JS Eventsender for WebGL Rendering **
		
		function notdetected_js(event:Event):void {
			var result:Object = ExternalInterface.call("js_notdetected", 0);
		}
		
		function detected_js(event:Event, matrix:FLARTransMatResult):void 
		{
			var js_matrix = this._baseNode.getMatrixArray();
			var js_viewM = this._camera3d.getProjectionArray();
			var result:Object = ExternalInterface.call("js_detected", 0);
			var result2:Object = ExternalInterface.call("get_js_transMatrix", js_matrix);  
			/* TODO: Implement Viewmatrix transfer */
			//var result3:Object = ExternalInterface.call("get_js_viewMatrix", js_viewM);  
		}		
		
	}
}