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
	import org.libspark.flartoolkit.core.transmat.rotmatrix.FLARRotMatrix;
	import org.libspark.flartoolkit.core.types.FLARDoublePoint3d;
	import org.libspark.flartoolkit.core.types.matrix.FLARDoubleMatrix34;		

	/**
	 * FLARTransMat戻り値専用のFLARMat
	 * 
	 */
	public class FLARTransMatResult extends FLARDoubleMatrix34 {

		private var has_value:Boolean = false;

		
		/**
		 * パラメータで変換行列を更新します。
		 * 
		 * @param i_rot
		 * @param i_off
		 * @param i_trans
		 */
		public function updateMatrixValue(i_rot:FLARRotMatrix, i_off:FLARDoublePoint3d, i_trans:FLARDoublePoint3d):void {
			this.m00 = i_rot.m00;
			this.m01 = i_rot.m01;
			this.m02 = i_rot.m02;
			this.m03 = i_rot.m00 * i_off.x + i_rot.m01 * i_off.y + i_rot.m02 * i_off.z + i_trans.x;

			this.m10 = i_rot.m10;
			this.m11 = i_rot.m11;
			this.m12 = i_rot.m12;
			this.m13 = i_rot.m10 * i_off.x + i_rot.m11 * i_off.y + i_rot.m12 * i_off.z + i_trans.y;

			this.m20 = i_rot.m20;
			this.m21 = i_rot.m21;
			this.m22 = i_rot.m22;
			this.m23 = i_rot.m20 * i_off.x + i_rot.m21 * i_off.y + i_rot.m22 * i_off.z + i_trans.z;

			this.has_value = true;
			return;
		}

		public function hasValue():Boolean {
			return this.has_value;
		}
	}
}