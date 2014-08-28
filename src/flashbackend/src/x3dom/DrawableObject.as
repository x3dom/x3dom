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
		
		private var _id:int;
		private var _refID:int;
		private var _type:String;
		private var _shape:Shape;
		private var _transform:Matrix3D;
		private var _updated:Boolean;
		private var _sortType:String;
		private var _sortKey:uint;
		private var _boundingBox:BoundingBox;
		
		public function DrawableObject(id:int=-1, refID:int=-1)
		{
			this._id		= id;
			this._refID		= refID;
			this._context3D	= FlashBackend.getContext();
			
			this._shape		= null;
			this._type		= "DEFAULT";
			this._transform	= new Matrix3D();
			this._updated	= true;
			
			this._boundingBox = new BoundingBox();
			updateBB();
		}
		
		/**
		 * 
		 */
		public function set id(id:int) : void
		{
			this._id = id;
		}
		
		/**
		 * @private
		 */
		public function get id() : int
		{
			return this._id;
		}
		
		/**
		 * 
		 */
		public function set refID(refID:int) : void
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
		public function get refID() : int
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
		 * @private
		 */
		private function updateBB() : void
		{
			var min:Vector3D = new Vector3D( 999999.0,  999999.0,  999999.0);
			var max:Vector3D = new Vector3D( -999999.0, -999999.0, -999999.0);
			
			if (this._shape == null) 
			{
				this._boundingBox = BoundingBox.Create(max.clone(), max.clone());
				return;
			}
			
			var sbb:BoundingBox = _shape.boundingBox;
			if (this._transform == null)
			{
				this._boundingBox = BoundingBox.Create(sbb.min.clone(), sbb.max.clone());
				return;
			}
			
			var bb:Array = new Array();
			bb[0] = this._transform.transformVector(new Vector3D(sbb.min.x, sbb.min.y, sbb.min.z));
			bb[1] = this._transform.transformVector(new Vector3D(sbb.min.x, sbb.min.y, sbb.max.z));
			bb[2] = this._transform.transformVector(new Vector3D(sbb.min.x, sbb.max.y, sbb.min.z));
			bb[3] = this._transform.transformVector(new Vector3D(sbb.min.x, sbb.max.y, sbb.max.z));
			bb[4] = this._transform.transformVector(new Vector3D(sbb.max.x, sbb.min.y, sbb.min.z));
			bb[5] = this._transform.transformVector(new Vector3D(sbb.max.x, sbb.min.y, sbb.max.z));
			bb[6] = this._transform.transformVector(new Vector3D(sbb.max.x, sbb.max.y, sbb.min.z));
			bb[7] = this._transform.transformVector(new Vector3D(sbb.max.x, sbb.max.y, sbb.max.z));
			
			for (var i:uint = 0; i < 8; i++)
			{
				if (bb[i].x < min.x) min.x = bb[i].x;
				if (bb[i].y < min.y) min.y = bb[i].y;
				if (bb[i].z < min.z) min.z = bb[i].z;
				
				if (bb[i].x > max.x) max.x = bb[i].x;
				if (bb[i].y > max.y) max.y = bb[i].y;
				if (bb[i].z > max.z) max.z = bb[i].z;
			}
			
			this._boundingBox = BoundingBox.Create(min, max);
		}
			
		/**
		 * 
		 */
		public function set shape(shape:Shape) : void
		{
			this._shape = shape;			
			updateBB();
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
			updateBB();			
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
			return this._boundingBox.min;
		}
		
		/**
		 * 
		 */
		public function get max() : Vector3D
		{
			return this._boundingBox.max;
		}
		
		/**
		 * 
		 */
		public function get center() : Vector3D
		{
			return this._boundingBox.center;
		}
	}
}