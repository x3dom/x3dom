package {
	
	import flash.events.Event;
	import org.papervision3d.lights.PointLight3D;
	import org.papervision3d.materials.WireframeMaterial;
	import org.papervision3d.materials.shadematerials.FlatShadeMaterial;
	import org.papervision3d.materials.utils.MaterialsList;
	import org.papervision3d.materials.special.CompositeMaterial;
	import org.papervision3d.materials.*;
	import org.papervision3d.objects.primitives.Cube;
	import org.papervision3d.objects.primitives.Plane;
	import org.papervision3d.objects.parsers.DAE;
	
	import flash.external.ExternalInterface;
	import flash.system.*;
		
	
	[SWF(width=640, height=480, backgroundColor=0x808080, frameRate=30)]
	
	public class X3DOMFLARToolKit extends PV3DARApp {
		
		private var _plane:Plane;
		private var _cube:Cube;
				
		
		public function X3DOMFLARToolKit() {
			// Initalize application with the path of camera calibration file and patter definition file.
			this.init('Data/camera_para.dat', 'Data/x3dom.pat');
		}
		
		protected override function onInit():void {
			super.onInit(); // You must call this. 
			
			var cmat:CompositeMaterial = new CompositeMaterial();
			var materials:MaterialsList = new MaterialsList();			
			
			// Create Plane with same size of the marker.
			var wmat:WireframeMaterial = new WireframeMaterial(0xff0000, 1, 2); // with wireframe. 
			this._plane = new Plane(wmat, 80, 80); // 80mm x 80mm。
			this._baseNode.addChild(this._plane); // attach to _baseNode to follow the marker. 

			// Place the light at upper front.
			var light:PointLight3D = new PointLight3D(true);
			light.x = 0;
			light.y = 500;
			light.z = 500;
			
			var fmat:FlatShadeMaterial = new FlatShadeMaterial(light, 0x003299, 0x6598FF, 100);
			cmat.doubleSided = true;
			cmat.addMaterial(fmat);
			materials.addMaterial(cmat, "all");

			
			this.addEventListener(Event.ENTER_FRAME, this._update);
		}
		
		private function _update(e:Event):void {
			//some PaperVision geometry
		}
		
		
		
	}
}