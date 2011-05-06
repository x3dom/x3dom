package
{
	import x3dom.*;
	import flash.display.*;
	import flash.display3D.*;
	import flash.events.*;
	import flash.geom.Rectangle;
	import flash.external.ExternalInterface;
	
	[SWF(backgroundColor="#000000", width="550", height="400", frameRate="120")]
	
	/**
	* Create Context3D, X3DScene, Bridge and handle the Mouse interaction
	*/
	public class x3dom extends MovieClip 
	{
		/**
		 * Handle 3D Scene managing and rendering
		 */
		private var _scene:X3DScene;
		
		/**
		 * Contains all AS3 calback functions for JS
		 */
		private var _bridge:Bridge;
		
		/**
		 * Index of our SWFObject in the JavaScript x3dom.canvases array
		 */
		private var _canvasIdx:Number;
		
		/**
		 * The current stage width in pixels
		 */
		private var _stageWidth:Number;
		
		/**
		 * The current stage height in pixels
		 */
		private var _stageHeight:Number;
		
		/**
		 * The current stage height in pixels
		 */
		private var _mouseDragging:Boolean	= false;
		
		/**
		* The current mouse x-position
		*/
		private var _mouseDragX:Number = 0;
		
		/**
		* The current mouse y-position
		*/
		private var _mouseDragY:Number = 0;
		
		/**
		* The current pressed mouse button 0=None, 1=Left, 2=Middle, 4=Right
		*/
		private var _mouseButton:Number = 0;
		
		/**
		* Main entry point of the x3dom flash renderer
		*/
		public function x3dom()
		{
			//Enable doubleClick feature for the stage
			stage.doubleClickEnabled = true;
			
			//Set stage align to TopLeft
			stage.align = StageAlign.TOP_LEFT;
			
			stage.scaleMode = StageScaleMode.NO_SCALE;
			
			//Get FlashVars
			getFlashVars();
			
			//Init EventListener for Mouse interaction
			initEventListener();
			
			//Create Context3D
			createContext3D();
		}
		
		/**
		* Get FlashVars from <object>-Tag
		*/
		private function getFlashVars() : void
		{
			//Get flashVars
			var param:Object = LoaderInfo(this.root.loaderInfo).parameters;
			
			//Set canvasIdx from flashVars
			_canvasIdx = Number(param.canvasIdx);
			
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
			stage.stage3Ds[0].viewPort = new Rectangle(0, 0, _stageWidth, _stageHeight);
		}
		
		/**
		* Handle Context3D creation, create X3DScene and JS2ASBridge
		*/
		private function handleContext3DCreate(e:Event): void 
		{
			var stage3D:Stage3D = e.target as Stage3D;					
			var context3D:Context3D = stage3D.context3D; 	

			//Check if 3D Context is avaible
			if ( context3D == null ) 
			{
				x3dom.Debug.logError("Flash can't create 3D Context");
				return;
			}
			
			//Enable error checking for debugging
			context3D.enableErrorChecking = true;
			
			context3D.setCulling(Context3DTriangleFace.FRONT);
			
			context3D.setBlendFactors(Context3DBlendFactor.SOURCE_ALPHA, Context3DBlendFactor.ONE_MINUS_SOURCE_ALPHA );
			
			// The back buffer size is in actual pixels
			context3D.configureBackBuffer( _stageWidth, _stageHeight, 0, true );
			
			//Create X3DScene for scene managing
			_scene = new X3DScene(context3D);
			
			//Create JSToASBridge for communication
			_bridge = new Bridge(_scene);
			
			//Say JS that Flash is ready for rendering
			ExternalInterface.call("x3dom.bridge.setFlashReady", context3D.driverInfo, _canvasIdx);
		}
		
		/**
		* Handle MouseDown-Event and call the corresponding JS-Function
		*/
		private function handleMouseDown(e:MouseEvent) : void
		{
			//Update mouse properties
			_mouseDragX	 	= e.stageX;
			_mouseDragY  	= e.stageY;
			_mouseButton 	= 1;
			_mouseDragging 	= true;
			
			//Check for special keys
			if (e.shiftKey) { _mouseButton = 1; }
			if (e.ctrlKey)  { _mouseButton = 4; }
			if (e.altKey)   { _mouseButton = 2; }
			
			//Call JS MouseDown function
			ExternalInterface.call("x3dom.bridge.onMouseDown", _mouseDragX, _mouseDragY, _mouseButton, _canvasIdx);
			
			//Add AS MouseMove listener 
			stage.addEventListener(MouseEvent.MOUSE_MOVE, handleMouseMove);
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
			ExternalInterface.call("x3dom.bridge.onMouseUp", _mouseDragX, _mouseDragY, _mouseButton, _canvasIdx);
			
			//Remove AS MouseMove listener 
			stage.removeEventListener(MouseEvent.MOUSE_MOVE, handleMouseMove);
			
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
			ExternalInterface.call("x3dom.bridge.onMouseOver", _mouseDragX, _mouseDragY, _mouseButton, _canvasIdx);
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
			ExternalInterface.call("x3dom.bridge.onMouseOut", _mouseDragX, _mouseDragY, _mouseButton, _canvasIdx);
		}
		
		/**
		* Handle DoubleClick-Event and call the corresponding JS-Function
		*/
		private function handleDoubleClick(e:MouseEvent) : void
		{
			//Update mouse properties
			_mouseDragX	 	= e.stageX;
			_mouseDragY  	= e.stageY;
			_mouseButton 	= 0;
			_mouseDragging 	= false;
			
			//Call JS MouseDown function
			ExternalInterface.call("x3dom.bridge.onDoubleClick", _mouseDragX, _mouseDragY, _mouseButton, _canvasIdx);
		}
		
		/**
		* Handle MouseMove-Event and call the corresponding JS-Function
		*/
		private function handleMouseMove(e:MouseEvent) : void
		{
			//Update mouse properties
			_mouseDragX = e.stageX;
			_mouseDragY = e.stageY;
			
			//Check for special keys
			if (e.shiftKey) { _mouseButton = 1; }
			if (e.ctrlKey)  { _mouseButton = 4; }
			if (e.altKey)   { _mouseButton = 2; }
			
			//Call JS MouseMove function
			ExternalInterface.call("x3dom.bridge.onMouseMove", _mouseDragX, _mouseDragY, _mouseButton, _canvasIdx);
		}
		
		/**
		* Handle MouseWheel-Event and call the corresponding JS-Function
		*/
		private function handleMouseWheel(e:MouseEvent) : void
		{
			//Update mouse properties
			_mouseDragY -= 1.5 * e.delta;
			_mouseButton = 2;
            
			//Call JS MouseWheel function
			ExternalInterface.call("x3dom.bridge.onMouseWheel", _mouseDragX, _mouseDragY, _mouseButton, _canvasIdx);
		}
		
		/**
		* Handle KeyDown-Event and call the corresponding JS-Function
		*/
		private function handleKeyDown(e:KeyboardEvent) : void
		{
			//Call JS KeyDown function
			ExternalInterface.call("x3dom.bridge.onKeyDown", e.charCode, _canvasIdx);
		}
		
	}
	
}
