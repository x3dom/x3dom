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

package org.libspark.flartoolkit.support.away3d_2 {
	
	import away3d.containers.ObjectContainer3D;
	import away3d.core.math.Matrix3D;
	
	import org.libspark.flartoolkit.core.transmat.FLARTransMatResult;

	public class FLARBaseNode extends ObjectContainer3D {
		
		public function FLARBaseNode(...initarray) {
			super(initarray);
		}

		private var _tmp:Matrix3D = new Matrix3D();
		public function setTransformMatrix(r:FLARTransMatResult):void {
			var m:Matrix3D = this._tmp;
			m.sxx =  r.m00; m.sxy =  r.m02; m.sxz =  r.m01; m.tx =  r.m03;
			m.syx = -r.m10; m.syy = -r.m12; m.syz = -r.m11; m.ty = -r.m13;
			m.szx =  r.m20; m.szy =  r.m22; m.szz =  r.m21; m.tz =  r.m23;
			this.transform = m;
		}
	}
}