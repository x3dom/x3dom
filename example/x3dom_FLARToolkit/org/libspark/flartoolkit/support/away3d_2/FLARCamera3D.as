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
	
	import away3d.cameras.*;
	import away3d.cameras.lenses.*;
	import away3d.core.math.*;
	
	import org.libspark.flartoolkit.core.FLARMat;
	import org.libspark.flartoolkit.core.param.FLARParam;
	import org.libspark.flartoolkit.core.types.FLARIntSize;
	import org.libspark.flartoolkit.utils.ArrayUtil;

	public class FLARCamera3D extends Camera3D {
		
		private var _projectionMatrix:Matrix3D;
		
		public function FLARCamera3D(init:Object = null) {
			super(init);
			
			lens = new PerspectiveLens();
		}

		public function setParam(param:FLARParam):void
		{
			var m_projection:Array = new Array(16);
			var trans_mat:FLARMat = new FLARMat(3,4);
			var icpara_mat:FLARMat = new FLARMat(3,4);
			var p:Array = ArrayUtil.createJaggedArray(3, 3);
			var q:Array = ArrayUtil.createJaggedArray(4, 4);
			var i:int;
			var j:int;
			const size:FLARIntSize = param.getScreenSize();
			const width:int  = size.w;
			const height:int = size.h;
			
			param.getPerspectiveProjectionMatrix().decompMat(icpara_mat, trans_mat);
			
			var icpara:Array = icpara_mat.getArray();
			var trans:Array = trans_mat.getArray();
			for (i = 0; i < 4; i++) {
				icpara[1][i] = (height - 1) * (icpara[2][i]) - icpara[1][i];
			}
			
			for(i = 0; i < 3; i++) {
				for(j = 0; j < 3; j++) {
					p[i][j] = icpara[i][j] / icpara[2][2];
				}
			}
			
			var div:Number = zoom*focus;
			
			q[0][0] = 2.0 * p[0][0]/div;
			q[0][1] = 2.0 * p[0][1]/div;
			q[0][2] = -(2.0 * p[0][2]  - (width - 1))/div;
			q[0][3] = 0.0;
			 
			q[1][0] = 0.0;
			q[1][1] = 2.0 * p[1][1]/div;
			q[1][2] = -(2.0 * p[1][2] - (height - 1))/div;
			q[1][3] = 0.0;
			
			q[2][0] = 0.0;
			q[2][1] = 0.0;
			q[2][2] = 1.0;
			q[2][3] = 0.0;
			
			q[3][0] = 0.0;
			q[3][1] = 0.0;
			q[3][2] = 0.0;
			q[3][3] = 1.0;
			
			for (i = 0; i < 4; i++) { // Row.
				// First 3 columns of the current row.
				for (j = 0; j < 3; j++) { // Column.
					m_projection[i*4 + j] = q[i][0] * trans[0][j] + q[i][1] * trans[1][j] + q[i][2] * trans[2][j];
				}
				// Fourth column of the current row.
				m_projection[i*4 + 3] = q[i][0] * trans[0][3] + q[i][1] * trans[1][3] + q[i][2] * trans[2][3] + q[i][3];
			}
			
			var m:Matrix3D = _projectionMatrix = new Matrix3D();
			m.sxx =  m_projection[0];
			m.sxy =  m_projection[1];
			m.sxz =  m_projection[2];
			m.tx  =  m_projection[3];
			m.syx =  m_projection[4];
			m.syy =  m_projection[5];
			m.syz =  m_projection[6];
			m.ty  =  m_projection[7];
			m.szx =  m_projection[8];
			m.szy =  m_projection[9];
			m.szz =  m_projection[10];
			m.tz  =  m_projection[11];
			m.swx =  m_projection[12];
			m.swy =  m_projection[13];
			m.swz =  m_projection[14];
			m.tw  =  m_projection[15];
		}
		
		public override function get viewMatrix():Matrix3D
        {
        	invViewMatrix.inverse(_projectionMatrix)
        	return _projectionMatrix;
        }
	}
}