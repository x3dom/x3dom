package x3dom
{
	import flash.display.LoaderInfo;
	import flash.display.MovieClip;
	import flash.display.Sprite;
	import flash.display.Stage;
	import flash.display.Stage3D;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.display3D.Context3D;
	import flash.display3D.Context3DBlendFactor;
	import flash.display3D.Context3DProfile;
	import flash.display3D.Context3DRenderMode;
	import flash.events.Event;
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.external.ExternalInterface;
	import flash.system.LoaderContext;
	import flash.system.Security;
	
	[SWF(backgroundColor="#000000", width="550", height="400", frameRate="120")]
	
	public class FlashBackend extends MovieClip
	{	
		
		Security.allowDomain('*');
		
		[Embed(source="../../res/Library.swf", symbol="LoadingText")]
		private var LoadingScreen:Class;
		
		[Embed(source="../../res/Library.swf", symbol="InfoField")]
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
		 * LoaderContext for loading cross-domain images
		 */
		private static var _loaderContext:LoaderContext;
		
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
		 * 
		 */
		private var _renderType:String;
		
		/**
		 * Main entry point of the x3dom flash renderer
		 */
		public function FlashBackend()
		{
			_stage = stage;
					
			//Enable doubleClick feature for the stage
			_stage.doubleClickEnabled = true;
			
			//Set stage align to TopLeft
			_stage.align = StageAlign.TOP_LEFT;
			
			_stage.scaleMode = StageScaleMode.NO_SCALE;
			
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
			
			//Create LoaderContext for crossdomain loading
			_loaderContext = new LoaderContext();
			_loaderContext.checkPolicyFile = true;
			//_loaderContext.securityDomain = SecurityDomain.currentDomain;
			//_loaderContext.applicationDomain = ApplicationDomain.currentDomain; 
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
		
		public static function getLoaderContext() : LoaderContext 
		{
			return _loaderContext;
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
			_stageWidth  = _stage.stageWidth;//Number(param.width);
			_stageHeight = _stage.stageHeight;//Number(param.height);
			_renderType  = String(param.renderType);
		}
		
		/**
		 * Init EventListener for mouse interaction
		 */
		private function initEventListener() : void
		{
			_stage.addEventListener(MouseEvent.MOUSE_DOWN, handleMouseDown);
			_stage.addEventListener(MouseEvent.MOUSE_UP, handleMouseUp);
			_stage.addEventListener(MouseEvent.RIGHT_MOUSE_DOWN, handleRightMouseDown);
			_stage.addEventListener(MouseEvent.RIGHT_MOUSE_UP, handleMouseUp);
			_stage.addEventListener(MouseEvent.MIDDLE_MOUSE_DOWN, handleMiddleMouseDown);
			_stage.addEventListener(MouseEvent.MIDDLE_MOUSE_UP, handleMouseUp);
			_stage.addEventListener(MouseEvent.ROLL_OVER, handleMouseOver);
			_stage.addEventListener(Event.MOUSE_LEAVE, handleMouseOut);
			_stage.addEventListener(MouseEvent.DOUBLE_CLICK, handleDoubleClick);
			_stage.addEventListener(MouseEvent.MOUSE_WHEEL, handleMouseWheel);
			_stage.addEventListener(KeyboardEvent.KEY_DOWN, handleKeyDown);
			_stage.addEventListener(MouseEvent.MOUSE_MOVE, handleMouseMove);
			_stage.addEventListener(Event.RESIZE, handleResize);
		}
		
		/**
		 * Request Context3D and set viewport size and location
		 */
		private function createContext3D() : void
		{
			//Add EventListener for Context3D creation
			if(_stage.stage3Ds.length > 0)
			{
				var stage3D:Stage3D = _stage.stage3Ds[0]; 
				stage3D.addEventListener(Event.CONTEXT3D_CREATE, handleContext3DCreate);
				//Request Context3D
				stage3D.requestContext3D(Context3DRenderMode.AUTO, Context3DProfile.BASELINE);
			}
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
			_context3D.configureBackBuffer( _stageWidth, _stageHeight, 8, true );
			
			//Create X3DScene for scene managing
			this._scene = new X3DScene();
			
			if (this._renderType == "forward")
			{
				this._renderer = new ForwardRenderer(_scene);
			} else {
				this._renderer = new LPPRenderer(_scene);
			}
			
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
		 * Handle LeftMouseDown-Event and call the corresponding JS-Function
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
		 * Handle RightMouseDown-Event and call the corresponding JS-Function
		 */
		private function handleRightMouseDown(e:MouseEvent) : void
		{
			//Update mouse properties
			_mousePosX	 	= e.stageX;
			_mousePosY  	= e.stageY;
			_mouseButton 	= 2;
			_mouseDragging 	= true;
			
			//Check for special keys
			if (e.shiftKey) { _mouseButton = 1; }
			if (e.ctrlKey)  { _mouseButton = 4; }
			if (e.altKey)   { _mouseButton = 2; }
			
			//Call JS MouseDown function
			ExternalInterface.call("x3dom.bridge.onMouseDown", _mousePosX, _mousePosY, _mouseButton, _canvasIdx);		
		}
		
		/**
		 * Handle MiddleMouseDown-Event and call the corresponding JS-Function
		 */
		private function handleMiddleMouseDown(e:MouseEvent) : void
		{
			//Update mouse properties
			_mousePosX	 	= e.stageX;
			_mousePosY  	= e.stageY;
			_mouseButton 	= 4;
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
		
		/**
		 * Handle scene resize
		 */
		public function handleResize(event:Event):void
		{
			//Save new size
			_stageWidth = _stage.stageWidth;
			_stageHeight = _stage.stageHeight;
			
			//rearrange infofield
			_infoField.x = _stageWidth - _infoField.width - 10;
			
			_context3D.configureBackBuffer( _stageWidth, _stageHeight, 8, true );
		}
		
	}
}