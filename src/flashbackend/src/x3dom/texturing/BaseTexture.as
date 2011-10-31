package x3dom.texturing
{
	import x3dom.Utils;
	import flash.display3D.Context3D;
	import flash.display3D.textures.TextureBase;
	import flash.events.EventDispatcher;
	
	import x3dom.FlashBackend;
	
	public class BaseTexture extends EventDispatcher
	{
		/**
		 * Holds our 3D context
		 */
		protected var _context3D:Context3D;
		
		/**
		 * Flash Texture
		 */
		protected var _texture:TextureBase;
		
		/**
		 * Specify if Texture is complete loaded/generated
		 * @default false
		 */
		protected var _ready:Boolean;
		
		/**
		 * Specify if Texture is blending with Material. 
		 * Based on textures Channel count. Count of 1.0 or 2.0 blends
		 * @default false
		 */
		protected var _blending:Boolean;
		
		/**
		 * Specify how the texture wraps(repeat or clamp) in S direction.
		 * @default true (repeat)
		 */
		protected var _repeatS:Boolean
		
		/**
		 * Specify how the texture wraps(repeat or clamp) in T direction.
		 * @default true (repeat)
		 */
		protected var _repeatT:Boolean;
		
		
		public function BaseTexture(blending:Boolean = false, repeatS:Boolean = true, repeatT:Boolean = true)
		{
			//Get the 3D Context
			this._context3D = FlashBackend.getContext();
			
			//Set ready state
			this._ready = false
			
			//Set blending
			this._blending = blending
			
			//Set repeatS
			this._repeatS = repeatS;
			
			//Set repeatT
			this._repeatS = repeatT;
		}
		
		/**
		 * Flash Texture
		 */
		public function get texture() : TextureBase
		{
			return this._texture;
		}
		
		/**
		 * @private
		 */
		public function set texture(texture:TextureBase) : void
		{
			this._texture = texture;
		}
		
		/**
		 * Specify if Texture is blending with Material. 
		 */
		public function get blending() : Boolean
		{
			return this._blending;
		}
		
		/**
		 * @private
		 */
		public function set blending(blending:Boolean) : void
		{
			this._blending = blending;
		}
		
		/**
		 * Specify how the texture wraps(repeat or clamp) in S direction.
		 */
		public function get repeatS() : Boolean
		{
			return this._repeatS;
		}
		
		/**
		 * @private
		 */
		public function set repeatS(repeatS:Boolean) : void
		{
			this._repeatS = repeatS;
		}
		
		/**
		 * Specify how the texture wraps(repeat or clamp) in T direction. 
		 */
		public function get repeatT() : Boolean
		{
			return this._repeatT;
		}
		
		/**
		 * @private
		 */
		public function set repeatT(repeatT:Boolean) : void
		{
			this._repeatT = repeatT;
		}
		
		/**
		 * Specify if Texture is complete loaded/generated
		 */
		public function get ready() : Boolean
		{
			return this._ready;
		}
	}
}