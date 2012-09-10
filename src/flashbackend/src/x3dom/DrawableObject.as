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
		private var _type:String;
		private var _shape:Shape;
		private var _transform:Matrix3D;
		private var _updated:Boolean;
		private var _sortType:String;
		private var _sortKey:uint;
		
		public function DrawableObject(id:uint=-1, refID:uint=-1)
		{
			this._id		= id;
			this._refID		= refID;
			this._context3D	= FlashBackend.getContext();
			
			this._shape		= null;
			this._type		= "DEFAULT";
			this._transform	= new Matrix3D();
			this._updated	= true;
		}
		
		/**
		 * 
		 */
		public function set id(id:uint) : void
		{
			this._id = id;
		}
		
		/**
		 * @private
		 */
		public function get id() : uint
		{
			return this._id;
		}
		
		/**
		 * 
		 */
		public function set refID(refID:uint) : void
		{
			this._refID = refID;
		}
		
		/**
		 * @private
		 */
		public function get type() : String
		{
			return this._type;
		}
		
		/**
		 * 
		 */
		public function set type(type:String) : void
		{
			this._type = type;
		}
		
		/**
		 * @private
		 */
		public function get refID() : uint
		{
			return this._refID;
		}
		
		/**
		 * 
		 */
		public function set sortType(sortType:String) : void
		{
			this._sortType = sortType.toLowerCase();
		}
		
		/**
		 * @private
		 */
		public function get sortKey() : uint
		{
			return this._sortKey;
		}
		
		/**
		 * 
		 */
		public function set sortKey(sortKey:uint) : void
		{
			this._sortKey = sortKey;
		}
		
		/**
		 * @private
		 */
		public function get sortType() : String
		{
			return this._sortType;
		}
		
		/**
		 * 
		 */
		public function set updated(updated:Boolean) : void
		{
			this._updated = updated;
		}
		
		/**
		 * @private
		 */
		public function get updated() : Boolean
		{
			return this._updated;
		}
			
		/**
		 * 
		 */
		public function set shape(shape:Shape) : void
		{
			this._shape = shape;
		}
		
		/**
		 * @private
		 */
		public function get shape() : Shape
		{
			if(this._shape == null) {
				if(this._type == "ImageGeometry") {
					this._shape = new ImageGeometry();
				} else if(this._type == "BinaryGeometry") {
					this._shape = new BinaryGeometry();
				} else if(this._type == "BitLODGeometry")  {
					this._shape = new BitLODGeometry();
				} else if(this._type == "Text")  {
					this._shape = new X3DText();
				} else {
					this._shape = new Shape();
				}
				
			}
			return this._shape;
		}
		
		/**
		 * 
		 */
		public function set transform(transform:Matrix3D) : void
		{
			this._updated = true;
			this._transform = transform;
		}
		
		/**
		 * @private
		 */
		public function get transform() : Matrix3D
		{
			return this._transform;
		}
		
		/**
		 * 
		 */
		public function get min() : Vector3D
		{
			return this._transform.transformVector(this._shape.boundingBox.min);
		}
		
		/**
		 * 
		 */
		public function get max() : Vector3D
		{
			return this._transform.transformVector(this._shape.boundingBox.max);
		}
		
		/**
		 * 
		 */
		public function get center() : Vector3D
		{
			return this._transform.transformVector(this._shape.boundingBox.center);
		}
	}
}