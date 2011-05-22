/**
 * x3dom actionscript library 0.1
 * http://x3dom.org/
 *
 * Copyright (c) 2011 Johannes Behr, Yvonne Jung, Timo Sturm
 * Dual licensed under the MIT and GPL licenses.
 */

package x3dom
{
	import flash.display3D.Context3D;
	import flash.geom.Matrix3D;
	import flash.geom.Vector3D;

	public class DrawableObject
	{
		private var _context3D:Context3D;
		
		private var _id:uint;
		private var _refID:uint;
		private var _shape:Shape;
		private var _transform:Matrix3D;
		private var _updated:Boolean;
		
		public function DrawableObject(id:uint, refID:uint)
		{
			_id			= id;
			_refID		= refID;
			_context3D	= FlashBackend.getContext();
			
			_shape		= null;
			_transform	= new Matrix3D();
			_updated	= true;
		}
		
		/**
		 * 
		 */
		public function set id(id:uint) : void
		{
			_id = id;
		}
		
		/**
		 * @private
		 */
		public function get id() : uint
		{
			return _id;
		}
		
		/**
		 * 
		 */
		public function set refID(refID:uint) : void
		{
			_refID = refID;
		}
		
		/**
		 * @private
		 */
		public function get refID() : uint
		{
			return _refID;
		}
		
		/**
		 * 
		 */
		public function set updated(updated:Boolean) : void
		{
			_updated = updated;
		}
		
		/**
		 * @private
		 */
		public function get updated() : Boolean
		{
			return _updated;
		}
			
		/**
		 * 
		 */
		public function set shape(shape:Shape) : void
		{
			_shape = shape;
		}
		
		/**
		 * @private
		 */
		public function get shape() : Shape
		{
			if(_shape == null)
				_shape = new Shape();

			return _shape;
		}
		
		/**
		 * 
		 */
		public function set transform(transform:Matrix3D) : void
		{
			_updated = true;
			_transform = transform;
		}
		
		/**
		 * @private
		 */
		public function get transform() : Matrix3D
		{
			return _transform;
		}
		
		/**
		 * 
		 */
		public function get min() : Vector3D
		{
			return _transform.transformVector(_shape.boundingBox.min);
		}
		
		/**
		 * 
		 */
		public function get max() : Vector3D
		{
			return _transform.transformVector(_shape.boundingBox.max);
		}
		
		/**
		 * 
		 */
		public function get center() : Vector3D
		{
			return _transform.transformVector(_shape.boundingBox.center);
		}
	}
}