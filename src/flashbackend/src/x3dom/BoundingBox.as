/**
 * x3dom actionscript library 0.1
 * http://x3dom.org/
 *
 * Copyright (c) 2011 Johannes Behr, Yvonne Jung, Timo Sturm
 * Dual licensed under the MIT and GPL licenses.
 */

package x3dom
{
	import flash.geom.Vector3D;

	public class BoundingBox
	{
		private var _min:Vector3D = new Vector3D();
		private var _max:Vector3D = new Vector3D();
		private var _center:Vector3D = new Vector3D();
		private var _size:Vector3D = new Vector3D();
		
		public function BoundingBox()
		{

		}
		
		public static function Create(min:Vector3D, max:Vector3D) : BoundingBox
		{
			var result:BoundingBox = new BoundingBox();
			result._min = min;
			result._max = max;
			result._center = min.add(max);
			result._center.scaleBy(0.5);
			result._size = max.subtract(min);
			return result;
		}
		
		public function set min(min:Vector3D) : void
		{
			this._min = min;
		}
		
		public function get min() : Vector3D
		{
			return this._min;
		}
		
		public function set max(max:Vector3D) : void
		{
			this._max = max;
		}
		
		public function get max() : Vector3D
		{
			return this._max;
		}
		
		public function set center(center:Vector3D) : void
		{
			this._center = center;
		}
		
		public function get center() : Vector3D
		{
			return this._center;
		}

		public function get size():Vector3D
		{
			return this._size;
		}

		public function set size(value:Vector3D):void
		{
			this._size = value;
		}

	}
}