package
{
	import com.transmote.flar.FLARManager;
	import com.transmote.flar.marker.FLARMarker;
	import com.transmote.flar.marker.FLARMarkerEvent;
	import com.transmote.flar.utils.geom.FLARPVGeomUtils;
	
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.external.ExternalInterface;
	
	import org.libspark.flartoolkit.support.pv3d.FLARCamera3D;
	import org.papervision3d.core.math.Matrix3D;
	import org.papervision3d.core.math.Number3D;
	import org.papervision3d.lights.PointLight3D;
	import org.papervision3d.objects.DisplayObject3D;
	import org.papervision3d.render.LazyRenderEngine;
	import org.papervision3d.scenes.Scene3D;
	import org.papervision3d.view.Viewport3D;
	
	public class X3DOMFLAR extends Sprite {
		private var flarManager:FLARManager;
		
		private var scene3D:Scene3D;
		private var camera3D:FLARCamera3D;
		private var viewport3D:Viewport3D;
		private var renderEngine:LazyRenderEngine;
		private var pointLight3D:PointLight3D;
		
		private var activeMarker:FLARMarker;
		private var modelContainer:DisplayObject3D;
		
		
		public function X3DOMFLAR () {
			// pass the path to the FLARManager xml config file into the FLARManager constructor.
			// FLARManager creates and uses a FLARCameraSource by default.
			// the image from the first detected camera will be used for marker detection.
			this.flarManager = new FLARManager("../resources/flar/flarConfig.xml");
			
			// add FLARManager.flarSource to the display list to display the video capture.
			this.addChild(Sprite(this.flarManager.flarSource));
			
			// begin listening for FLARMarkerEvents.
			this.flarManager.addEventListener(FLARMarkerEvent.MARKER_ADDED, this.onMarkerAdded);
			this.flarManager.addEventListener(FLARMarkerEvent.MARKER_UPDATED, this.onMarkerUpdated);
			this.flarManager.addEventListener(FLARMarkerEvent.MARKER_REMOVED, this.onMarkerRemoved);
			
			// wait for FLARManager to initialize before setting up Papervision3D environment.
			this.flarManager.addEventListener(Event.INIT, this.onFlarManagerInited);
		}
		
		private function onFlarManagerInited (evt:Event) :void {
			this.flarManager.removeEventListener(Event.INIT, this.onFlarManagerInited);
			
			/*
			this.scene3D = new Scene3D();
			
			// initialize FLARCamera3D with parsed camera parameters.
			this.camera3D = new FLARCamera3D(this.flarManager.cameraParams);
			
			this.viewport3D = new Viewport3D(this.stage.stageWidth, this.stage.stageHeight);
			this.addChild(this.viewport3D);
			this.viewport3D.
			
			this.renderEngine = new LazyRenderEngine(this.scene3D, this.camera3D, this.viewport3D);
			
			this.pointLight3D = new PointLight3D();
			this.pointLight3D.x = 1000;
			this.pointLight3D.y = 1000;
			this.pointLight3D.z = -1000;
			
			// load the model.
			// (this model has to be scaled and rotated to fit the marker; every model is different.)
			var model:DAE = new DAE(true, "model", true);
			model.load("../resources/assets/scout.dae");
			model.rotationX = 90;
			model.rotationZ = 90;
			model.scale = 0.5;
			
			// create a container for the model, that will accept matrix transformations.
			this.modelContainer = new DisplayObject3D();
			this.modelContainer.addChild(model);
			this.modelContainer.visible = false;
			this.scene3D.addChild(this.modelContainer);
			*/
			
			this.addEventListener(Event.ENTER_FRAME, this.onEnterFrame);
		}
		
		private function onMarkerAdded (evt:FLARMarkerEvent) :void {
			trace("["+evt.marker.patternId+"] added");
			//this.modelContainer.visible = true;
			this.activeMarker = evt.marker;
		}
		
		private function onMarkerUpdated (evt:FLARMarkerEvent) :void {
			//trace("["+evt.marker.patternId+"] updated");
			//this.modelContainer.visible = true;
			this.activeMarker = evt.marker;
		}
		
		private function onMarkerRemoved (evt:FLARMarkerEvent) :void {
			trace("["+evt.marker.patternId+"] removed");
			//this.modelContainer.visible = false;
			this.activeMarker = null;
		}
		
		private function onEnterFrame (evt:Event) :void {
			// apply the FLARToolkit transformation matrix to the Cube.
			if (this.activeMarker) {
				//ExternalInterface.call("set_marker", this.activeMarker.x, this.activeMarker.y, this.activeMarker.z,this.activeMarker.rotationX,this.activeMarker.rotationY,this.activeMarker.rotationZ);

				var mat:Matrix3D = new Matrix3D();
				mat = FLARPVGeomUtils.convertFLARMatrixToPVMatrix(this.activeMarker.transformMatrix);
					
				var obPosition:Number3D = new org.papervision3d.core.math.Number3D(mat.n14, mat.n24, mat.n34);
				var obRotation:Number3D = Matrix3D.matrix2euler(mat);
				
				//ExternalInterface.call("set_marker", obPosition.x, obPosition.y, obPosition.z, obRotation.x, obRotation.y, obRotation.z);
				ExternalInterface.call("set_marker_matrix", mat);
				//ExternalInterface.call("console.debug", obRotation);
			}
			
			// update the Papervision3D view.
			//this.renderEngine.render();
		}
	}
}