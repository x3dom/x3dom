package {

	import flash.display.Sprite; // To extend this class
	import flash.events.Event; // To work out when a frame is entered.

	import org.papervision3d.view.Viewport3D; // We need a viewport
	import org.papervision3d.cameras.*; // Import all types of camera
	import org.papervision3d.scenes.Scene3D; // We'll need at least one scene
	import org.papervision3d.render.BasicRenderEngine; // And we need a renderer

	import org.papervision3d.lights.PointLight3D;
	import org.papervision3d.materials.WireframeMaterial;
	import org.papervision3d.materials.shadematerials.FlatShadeMaterial;
	import org.papervision3d.materials.utils.MaterialsList;
	import org.papervision3d.materials.*;
	import org.papervision3d.objects.primitives.Cube;
	import org.papervision3d.objects.primitives.Plane;
	import org.papervision3d.objects.parsers.DAE;
		
	
	public class PaperBase extends Sprite {
		
		public var viewport:Viewport3D; // The Viewport
		public var renderer:BasicRenderEngine; // Rendering engine
		// -- Scenes -- //
		public var default_scene:Scene3D; // A Scene
		// -- Cameras --//
		public var default_camera:Camera3D; // A Camera
             
		public function init(vpWidth:Number = 800, vpHeight:Number = 600):void {
			initPapervision(vpWidth, vpHeight); // Initialise papervision
			init3d(); // Initialise the 3d stuff..
			init2d(); // Initialise the interface..
			initEvents(); // Set up any event listeners..
		}
			  
		protected function initPapervision(vpWidth:Number, vpHeight:Number):void {
			// Here is where we initialise everything we need to
			// render a papervision scene.
			viewport = new Viewport3D(vpWidth, vpHeight);
			addChild(viewport);
			// Initialise the rendering engine.
			renderer = new BasicRenderEngine();
			// -- Initialise the Scenes -- //
			default_scene = new Scene3D();
			// -- Initialise the Cameras -- //
			default_camera = new Camera3D(); 
		}
             
		protected function init3d():void {
			// This function should hold all of the stages needed
			// to initialise everything used for papervision.
			// Models, materials, cameras etc.
		}
		protected function init2d():void {
			// This function should create all of the 2d items
			// that will be overlayed on your papervision project.
			// User interfaces, Heads up displays etc.
		}
		protected function initEvents():void {
			// This function makes the onFrame function get called for
			// every frame.
			addEventListener(Event.ENTER_FRAME, onEnterFrame);
			// This line of code makes the onEnterFrame function get
			// called when every frame is entered.
		}
		protected function processFrame():void {
			// Process any movement or animation here.
		}
		protected function onEnterFrame( ThisEvent:Event ):void {
			//We need to render the scene and update anything here.
			processFrame();
			renderer.renderScene(default_scene, default_camera, viewport);
		}
	}
		

}