package x3dom
{
	import flash.display.*;
	import flash.display3D.*;
	import flash.events.*;
	import flash.external.ExternalInterface;
	import flash.geom.Rectangle;
	import flash.system.Security;
	
	[SWF(backgroundColor="#000000", width="550", height="400", frameRate="120")]
	
	public class FlashBackend extends MovieClip
	{	
		
		Security.allowDomain('*');
		
		[Embed(source="res/Library.swf", symbol="LoadingText")]
		private var LoadingScreen:Class;
		
		[Embed(source="res/Library.swf", symbol="InfoField")]
		private static var InfoField:Class;
		
		private static var _stage:Stage;
		
		/**
		 * Handle 3D Scene managing and rendering
		 */
		private static var _context3D:Context3D = null;
		
		/**
		 * Handle 3D Scene managing
		 */
		private var _scene:X3DScene = null;
		
		/**
		 * Contains all AS3 calback functions for JS
		 */
		private var _bridge:Bridge;
		
		/**
		 * Handle 3D Scene rendering
		 */
		private var _renderer:Renderer;
		//private var _renderer:LPPRenderer;
		
		/**
		 * Index of our SWFObject in the JavaScript x3dom.canvases array
		 */
		private var _canvasIdx:Number;
		
		/**
		 * The current stage width in pixels
		 */
		private static var _stageWidth:Number = 0;
		
		/**
		 * The current stage height in pixels
		 */
		private static var _stageHeight:Number = 0;
		
		/**
		 * The current stage height in pixels
		 */
		private var _mouseDragging:Boolean	= false;
		
		/**
		 * The current mouse x-position
		 */
		private static var _mousePosX:Number = 0;
		
		/**
		 * The current mouse y-position
		 */
		private static var _mousePosY:Number = 0;
		
		/**
		 * The current pressed mouse button 0=None, 1=Left, 2=Middle, 4=Right
		 */
		private var _mouseButton:Number = 0;
		
		/**
		 * 
		 */
		private static var _loadingScreen:Sprite;
		
		/**
		 * 
		 */
		private static var _infoField:Sprite;
		
		/**
		 * 
		 */
		private static var _texLoadWheel:Sprite;
		
		/**
		 * Main entry point of the x3dom flash renderer
		 */
		public function FlashBackend()
		{
			_stage = stage;
			
			//Enable doubleClick feature for the stage
			stage.doubleClickEnabled = true;
			
			//Set stage align to TopLeft
			stage.align = StageAlign.TOP_LEFT;
			
			stage.scaleMode = StageScaleMode.NO_SCALE;
			
			//Get FlashVars
			this.getFlashVars();
			
			//Init LoadingScreen
			this.initLoadingScreen();
			
			//Init EventListener for Mouse interaction
			this.initInfoField();
			
			//Init EventListener for Mouse interaction
			this.initEventListener();
			
			//Create Context3D
			this.createContext3D();
			
		}
		
		private function initLoadingScreen() : void
		{
			_loadingScreen = new LoadingScreen();
			_loadingScreen.x = _stageWidth/2;
			_loadingScreen.y = _stageHeight/2;
			addChild(_loadingScreen);
		}
		
		private function initInfoField() : void
		{
			_infoField = new InfoField();
			_infoField.x = _stageWidth - _infoField.width - 10;
			_infoField.y = 10;
			_infoField.visible = false;
			addChild(_infoField);
		}
		
		
		public static function getContext() : Context3D 
		{
			return _context3D
		}
		
		public static function getHeight() : Number 
		{
			return _stageHeight;
		}
		
		public static function getWidth() : Number 
		{
			return _stageWidth;
		}
		
		public static function getMouseX() : Number 
		{
			return _mousePosX;
		}
		
		public static function getMouseY() : Number 
		{
			return _mousePosY;
		}
		
		public static function setFPS(fps:Number) : void 
		{
			fps = Math.round(fps);
			InfoField(_infoField).txt_FPS.text = fps.toString();
		}
		
		public static function setObjs(objs:Number) : void 
		{
			InfoField(_infoField).txt_Objs.text = objs.toString();
		}
		
		public static function setTris(tris:Number) : void 
		{
			InfoField(_infoField).txt_Tris.text = tris.toString();
		}
		
		public static function stage() : Stage 
		{
			return _stage;
		}
		
		/**
		 * Get FlashVars from <object>-Tag
		 */
		private function getFlashVars() : void
		{
			//Get flashVars
			var param:Object = LoaderInfo(this.root.loaderInfo).parameters;
			
			//Set canvasIdx from flashVars
			this._canvasIdx = Number(param.canvasIdx);
			
			//Set stageWidth and stageHeight from flashVars
			_stageWidth  = Number(param.width);
			_stageHeight = Number(param.height);
		}
		
		/**
		 * Init EventListener for mouse interaction
		 */
		private function initEventListener() : void
		{
			stage.addEventListener(MouseEvent.MOUSE_DOWN, handleMouseDown);
			stage.addEventListener(MouseEvent.MOUSE_UP, handleMouseUp);
			stage.addEventListener(MouseEvent.ROLL_OVER, handleMouseOver);
			stage.addEventListener(Event.MOUSE_LEAVE, handleMouseOut);
			stage.addEventListener(MouseEvent.DOUBLE_CLICK, handleDoubleClick);
			stage.addEventListener(MouseEvent.MOUSE_WHEEL, handleMouseWheel);
			stage.addEventListener(KeyboardEvent.KEY_DOWN, handleKeyDown);
			stage.addEventListener(MouseEvent.MOUSE_MOVE, handleMouseMove);
		}
		
		/**
		 * Request Context3D and set viewport size and location
		 */
		private function createContext3D() : void
		{
			//Add EventListener for Context3D creation
			stage.stage3Ds[0].addEventListener(Event.CONTEXT3D_CREATE, handleContext3DCreate);
			
			//Request Context3D
			stage.stage3Ds[0].requestContext3D();
			
			//Set viewport size and location
			//stage.stage3Ds[0].viewPort = new Rectangle(0, 0, _stageWidth, _stageHeight);
			//stage.stage3Ds[0].x = 0;
			//stage.stage3Ds[0].y = 0;
		}
		
		/**
		 * Handle Context3D creation, create X3DScene and JS2ASBridge
		 */
		private function handleContext3DCreate(e:Event): void 
		{
			var stage3D:Stage3D = e.target as Stage3D;					
			_context3D = stage3D.context3D;
			
			//Check if 3D Context is avaible
			if ( _context3D == null ) 
			{
				x3dom.Debug.logError("Flash can't create 3D Context");
				return;
			}
			
			//Enable error checking for debugging
			_context3D.enableErrorChecking = true;
			
			_context3D.setBlendFactors(Context3DBlendFactor.SOURCE_ALPHA, Context3DBlendFactor.ONE_MINUS_SOURCE_ALPHA );
			
			// The back buffer size is in actual pixels
			_context3D.configureBackBuffer( _stageWidth, _stageHeight, 0, true );
			
			//Create X3DScene for scene managing
			this._scene = new X3DScene();
			
			this._renderer = new Renderer(_scene);
			//_renderer = new LPPRenderer(_scene);
			
			//Create JSToASBridge for communication
			this._bridge = new Bridge(_scene, _renderer);
			
			//Say JS that Flash is ready for rendering
			ExternalInterface.call("x3dom.bridge.setFlashReady", _context3D.driverInfo, _canvasIdx);
		}
		
		public static function getLoadingScreen() : Sprite
		{
			return _loadingScreen;
		}
		
		/**
		 * Handle MouseDown-Event and call the corresponding JS-Function
		 */
		private function handleMouseDown(e:MouseEvent) : void
		{
			//Update mouse properties
			_mousePosX	 	= e.stageX;
			_mousePosY  	= e.stageY;
			_mouseButton 	= 1;
			_mouseDragging 	= true;
			
			//Check for special keys
			if (e.shiftKey) { _mouseButton = 1; }
			if (e.ctrlKey)  { _mouseButton = 4; }
			if (e.altKey)   { _mouseButton = 2; }
			
			//Call JS MouseDown function
			ExternalInterface.call("x3dom.bridge.onMouseDown", _mousePosX, _mousePosY, _mouseButton, _canvasIdx);		
		}
		
		/**
		 * Handle MouseUp-Event and call the corresponding JS-Function
		 */
		private function handleMouseUp(e:MouseEvent) : void
		{
			//Update mouse properties
			_mouseButton   = 0;
			_mouseDragging = false;
			
			//Call JS MouseDown function
			ExternalInterface.call("x3dom.bridge.onMouseUp", _mousePosX, _mousePosY, _mouseButton, _canvasIdx);
		}
		
		/**
		 * Handle MouseOver-Event and call the corresponding JS-Function
		 */
		private function handleMouseOver(e:MouseEvent) : void
		{
			//Update mouse properties
			_mouseButton 	= 0;
			_mouseDragging 	= false;
			
			//Call JS MouseDown function
			ExternalInterface.call("x3dom.bridge.onMouseOver", _mousePosX, _mousePosY, _mouseButton, _canvasIdx);
		}
		
		/**
		 * Handle MouseOut-Event and call the corresponding JS-Function
		 */
		private function handleMouseOut(e:Event) : void
		{
			//Update mouse properties
			_mouseButton 	= 0;
			_mouseDragging 	= false;
			
			//Call JS MouseDown function
			ExternalInterface.call("x3dom.bridge.onMouseOut", _mousePosX, _mousePosY, _mouseButton, _canvasIdx);
		}
		
		/**
		 * Handle DoubleClick-Event and call the corresponding JS-Function
		 */
		private function handleDoubleClick(e:MouseEvent) : void
		{
			//Update mouse properties
			_mousePosX	 	= e.stageX;
			_mousePosY  	= e.stageY;
			_mouseButton 	= 0;
			_mouseDragging 	= false;
			
			//Call JS MouseDown function
			ExternalInterface.call("x3dom.bridge.onDoubleClick", _mousePosX, _mousePosY, _mouseButton, _canvasIdx);
		}
		
		/**
		 * Handle MouseMove-Event and call the corresponding JS-Function
		 */
		private function handleMouseMove(e:MouseEvent) : void
		{
			//Update mouse properties
			_mousePosX = e.stageX;
			_mousePosY = e.stageY;
			
			//Check for special keys
			if (e.shiftKey) { _mouseButton = 1; }
			if (e.ctrlKey)  { _mouseButton = 4; }
			if (e.altKey)   { _mouseButton = 2; }
			
			//Call JS MouseMove function
			if(_mouseDragging) {
				ExternalInterface.call("x3dom.bridge.onMouseDrag", _mousePosX, _mousePosY, _mouseButton, _canvasIdx);
			} else {
				ExternalInterface.call("x3dom.bridge.onMouseMove", _mousePosX, _mousePosY, _mouseButton, _canvasIdx);
			}
		}
		
		/**
		 * Handle MouseWheel-Event and call the corresponding JS-Function
		 */
		private function handleMouseWheel(e:MouseEvent) : void
		{
			//Update mouse properties
			_mousePosY -= 1.5 * e.delta;
			_mouseButton = 2;
			
			//Call JS MouseWheel function
			ExternalInterface.call("x3dom.bridge.onMouseWheel", _mousePosX, _mousePosY, _mouseButton, _canvasIdx);
		}
		
		/**
		 * Handle KeyDown-Event and call the corresponding JS-Function
		 */
		private function handleKeyDown(e:KeyboardEvent) : void
		{
			//Call JS KeyDown function
			ExternalInterface.call("x3dom.bridge.onKeyDown", e.charCode, _canvasIdx);
			
			//Show/Hide InfoFied
			if(e.charCode == 32) {
				if(FlashBackend._infoField.visible) {
					FlashBackend._infoField.visible = false;
				} else {
					FlashBackend._infoField.visible = true;
				}
			}
		}
		
	}
}