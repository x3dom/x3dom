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
		
		public function BoundingBox()
		{

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
	}
}