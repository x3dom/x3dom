/* 
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008,2009 Saqoosha
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

package org.libspark.flartoolkit.support.pv3d {
	
	import org.libspark.flartoolkit.core.transmat.FLARTransMatResult;
	import org.papervision3d.core.math.Matrix3D;
	import org.papervision3d.objects.DisplayObject3D;

	public class FLARBaseNode extends DisplayObject3D {
		
		public static const AXIS_MODE_ORIGINAL:int = 0;
		public static const AXIS_MODE_PV3D:int = 2;
		
		public var axisMode:int;
		
		public function FLARBaseNode(axisMode:int = AXIS_MODE_ORIGINAL) {
			super();
			this.axisMode = axisMode;
		}
		
		public function setTransformMatrix(r:FLARTransMatResult):void {
			var m:Matrix3D = this.transform;
			if (this.axisMode == AXIS_MODE_PV3D) {
				m.n11 =  r.m00;  m.n12 =  r.m01;  m.n13 = -r.m02;  m.n14 =  r.m03;
				m.n21 = -r.m10;  m.n22 = -r.m11;  m.n23 =  r.m12;  m.n24 = -r.m13;
				m.n31 =  r.m20;  m.n32 =  r.m21;  m.n33 = -r.m22;  m.n34 =  r.m23;
			} else {
				// ARToolKit original
				m.n11 =  r.m01;  m.n12 =  r.m00;  m.n13 =  r.m02;  m.n14 =  r.m03;
				m.n21 = -r.m11;  m.n22 = -r.m10;  m.n23 = -r.m12;  m.n24 = -r.m13;
				m.n31 =  r.m21;  m.n32 =  r.m20;  m.n33 =  r.m22;  m.n34 =  r.m23;
			}
		}
	}
}