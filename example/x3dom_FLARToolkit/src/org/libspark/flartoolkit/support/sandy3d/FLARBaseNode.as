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

package org.libspark.flartoolkit.support.sandy3d {
	
	import org.libspark.flartoolkit.core.transmat.FLARTransMatResult;
	import sandy.core.data.*;
	import sandy.core.scenegraph.*;
	
	/**
	 * @author	Makc the Great
	 * @url		http://makc3d.wordpress.com/
	 */
	public class FLARBaseNode extends TransformGroup {
		
		public function FLARBaseNode() {
			super();
		}
		
		public function setTransformMatrix(r:FLARTransMatResult):void {
			var m:Matrix4 = new Matrix4;
			m.n11 =  r.m01; m.n12 =  r.m00; m.n13 =  r.m02; m.n14 =  r.m03;
			m.n21 = -r.m11; m.n22 = -r.m10; m.n23 = -r.m12; m.n24 = -r.m13;
			m.n31 =  r.m21; m.n32 =  r.m20; m.n33 =  r.m22; m.n34 =  r.m23;
			resetCoords (); matrix = m;
			// update scales?
			scaleX = Math.sqrt(m.n11 * m.n11 + m.n21 * m.n21 + m.n31 * m.n31);
			scaleY = Math.sqrt(m.n12 * m.n12 + m.n22 * m.n22 + m.n32 * m.n32);
			scaleZ = Math.sqrt(m.n13 * m.n13 + m.n23 * m.n23 + m.n33 * m.n33);
		}
	}
}