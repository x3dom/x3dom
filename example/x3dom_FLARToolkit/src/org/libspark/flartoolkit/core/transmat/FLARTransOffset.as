/* 
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008 Saqoosha
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this framework; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 * 
 * For further information please contact.
 *	http://www.libspark.org/wiki/saqoosha/FLARToolKit
 *	<saq(at)saqoosha.net>
 * 
 */

package org.libspark.flartoolkit.core.transmat {
	import org.libspark.flartoolkit.core.types.FLARDoublePoint2d;
	import org.libspark.flartoolkit.core.types.FLARDoublePoint3d;	

	final public class FLARTransOffset {

		public var vertex:Array = FLARDoublePoint3d.createArray(4); // FLARDoublePoint3d[]
		public var point:FLARDoublePoint3d = new FLARDoublePoint3d();

		/**
		 * 中心位置と辺長から、オフセット情報を作成して設定する。
		 * @param i_width
		 * @param i_center
		 */
		public function setSquare(i_width:Number, i_center:FLARDoublePoint2d):void {
			const w_2:Number = i_width / 2.0;
		
			var vertex3d_ptr:FLARDoublePoint3d;
			vertex3d_ptr = this.vertex[0];
			vertex3d_ptr.x = -w_2;
			vertex3d_ptr.y = w_2;
			vertex3d_ptr.z = 0.0;
			vertex3d_ptr = this.vertex[1];
			vertex3d_ptr.x = w_2;
			vertex3d_ptr.y = w_2;
			vertex3d_ptr.z = 0.0;
			vertex3d_ptr = this.vertex[2];
			vertex3d_ptr.x = w_2;
			vertex3d_ptr.y = -w_2;
			vertex3d_ptr.z = 0.0;
			vertex3d_ptr = this.vertex[3];
			vertex3d_ptr.x = -w_2;
			vertex3d_ptr.y = -w_2;
			vertex3d_ptr.z = 0.0;
		
			this.point.x = -i_center.x;
			this.point.y = -i_center.y;
			this.point.z = 0;
			return;
		}
	}
}