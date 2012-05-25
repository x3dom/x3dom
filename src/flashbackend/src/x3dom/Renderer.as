package x3dom
{
	import flash.display.BitmapData;
	import flash.display3D.*;
	import flash.display3D.textures.Texture;
	import flash.events.Event;
	import flash.geom.Matrix3D;
	import flash.geom.Vector3D;
	
	import x3dom.shaders.*;
	import x3dom.texturing.CubeMapTexture;
	
	
	public class Renderer
	{
		
		protected var _scene:X3DScene;
		protected var _context3D:Context3D;
		protected var _shaderCache:ShaderCache;
		
		protected var _bitmapBuffer:BitmapData;
		
		public function Renderer(scene:X3DScene)
		{
			this._scene = scene;
			this._context3D = FlashBackend.getContext();
			this._shaderCache = new ShaderCache();
			
			this._bitmapBuffer = new BitmapData(FlashBackend.getWidth(), FlashBackend.getHeight());
		}
		
		public function render() : void
		{		
			trace("Override this function");
		}
	}
}