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

	import org.libspark.flartoolkit.core.FLARMat;
	import org.libspark.flartoolkit.core.param.FLARParam;
	import org.libspark.flartoolkit.core.types.FLARIntSize;
	import org.libspark.flartoolkit.utils.ArrayUtil;
	import sandy.core.data.*;
	import sandy.core.scenegraph.*;

	/**
	 * @author	Makc the Great
	 * @url		http://makc3d.wordpress.com/
	 */
	public class FLARCamera3D extends Camera3D {

		public function FLARCamera3D(param:FLARParam, NEAR_CLIP:Number = 50, FAR_CLIP:Number = 10000 ) {

			const size:FLARIntSize = param.getScreenSize();
			const width:int  = size.w;
			const height:int = size.h;

			super ( size.w, size.h, 0 /* anything */, 2 /* TODO find why 2 */ * NEAR_CLIP, FAR_CLIP );
			this.z = 0;

			var m_projection:Array = new Array(16);
			var trans_mat:FLARMat = new FLARMat(3,4);
			var icpara_mat:FLARMat = new FLARMat(3,4);
			var p:Array = ArrayUtil.createJaggedArray(3, 3);
			var q:Array = ArrayUtil.createJaggedArray(4, 4);
			var i:int;
			var j:int;

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
			q[0][0] = (2.0 * p[0][0] / (width - 1));
			q[0][1] = (2.0 * p[0][1] / (width - 1));
			q[0][2] = -((2.0 * p[0][2] / (width - 1))  - 1.0);
			q[0][3] = 0.0;

			q[1][0] = 0.0;
			q[1][1] = -(2.0 * p[1][1] / (height - 1));
			q[1][2] = -((2.0 * p[1][2] / (height - 1)) - 1.0);
			q[1][3] = 0.0;

			q[2][0] = 0.0;
			q[2][1] = 0.0;
			q[2][2] = -(FAR_CLIP + NEAR_CLIP) / (NEAR_CLIP - FAR_CLIP);
			q[2][3] = 2.0 * FAR_CLIP * NEAR_CLIP / (NEAR_CLIP - FAR_CLIP);

			q[3][0] = 0.0;
			q[3][1] = 0.0;
			q[3][2] = 1.0;
			q[3][3] = 0.0;

			for (i = 0; i < 4; i++) { // Row.
				// First 3 columns of the current row.
				for (j = 0; j < 3; j++) { // Column.
					m_projection[i*4 + j] =
						q[i][0] * trans[0][j] +
						q[i][1] * trans[1][j] +
						q[i][2] * trans[2][j];
				}
				// Fourth column of the current row.
				m_projection[i*4 + 3]=
					q[i][0] * trans[0][3] +
					q[i][1] * trans[1][3] +
					q[i][2] * trans[2][3] +
					q[i][3];
			}

			// sandy's Camera3D is not designed to be extended, so we
			// will have to override each and every projection method
			m_nOffx = viewport.width2; 
			m_nOffy = viewport.height2;

			var args:Array = m_projection;
			mp11 = args[0];  mp12 = args[1];  mp13 = args[2];  mp14 = args[3];
			mp21 = args[4];  mp22 = args[5];  mp23 = args[6];  mp24 = args[7];
			mp31 = args[8];  mp32 = args[9];  mp33 = args[10]; mp34 = args[11];
			mp41 = args[12]; mp42 = args[13]; mp43 = args[14]; mp44 = args[15];

			//trace ("approximate sandy fov " + fov);
			//trace ("approximate sandy focal length " + focalLength);
			//trace ("approximate sandy near " + near + " vs exact " + (2 * NEAR_CLIP));
			//trace ("approximate sandy far " + far + " vs exact " + FAR_CLIP);
		}

		override public function projectArray( p_oList:Array ):void
		{
			const l_nX:Number = viewport.offset.x + m_nOffx;
			const l_nY:Number = viewport.offset.y + m_nOffy;
			var l_nCste:Number;
			var l_mp11_offx:Number = mp11 * m_nOffx;
			var l_mp22_offy:Number = mp22 * m_nOffy;
			for each( var l_oVertex:Vertex in p_oList )
			{
				if( l_oVertex.projected == false )//(l_oVertex.flags & SandyFlags.VERTEX_PROJECTED) == 0)
				{
					l_nCste = 	1 / l_oVertex.wz;
					l_oVertex.sx =  l_nCste * l_oVertex.wx * l_mp11_offx + l_nX;
					l_oVertex.sy = -l_nCste * l_oVertex.wy * l_mp22_offy + l_nY;
					//l_oVertex.flags |= SandyFlags.VERTEX_PROJECTED;
					l_oVertex.projected = true;
				}
			}
		}

		override public function projectVertex( p_oVertex:Vertex ):void
		{
			const l_nX:Number = (viewport.offset.x + m_nOffx);
			const l_nY:Number = (viewport.offset.y + m_nOffy);
			const l_nCste:Number = 	1 / p_oVertex.wz;
			p_oVertex.sx =  l_nCste * p_oVertex.wx * mp11 * m_nOffx + l_nX;
			p_oVertex.sy = -l_nCste * p_oVertex.wy * mp22 * m_nOffy + l_nY;
			//p_oVertex.flags |= SandyFlags.VERTEX_PROJECTED;
			//p_oVertex.projected = true;
		}

		override protected function setPerspectiveProjection(p_nFovY:Number, p_nAspectRatio:Number, p_nZNear:Number, p_nZFar:Number):void
		{
			changed = true;	
		}

		private var mp11:Number, mp21:Number, mp31:Number, mp41:Number,
					mp12:Number, mp22:Number, mp32:Number, mp42:Number,
					mp13:Number, mp23:Number, mp33:Number, mp43:Number,
					mp14:Number, mp24:Number, mp34:Number, mp44:Number,				
					m_nOffx:int, m_nOffy:int;

		override public function get projectionMatrix():Matrix4
		{
			return new Matrix4 (
				mp11, mp12, mp13, mp14,
				mp21, mp22, mp23, mp24,
				mp31, mp32, mp33, mp34,
				mp41, mp42, mp43, mp44 );
		}

		// getters for approximate values
		override public function set fov( p_nFov:Number ):void {}
		override public function get fov():Number { return Math.atan (1 / mp22) * 114.591559 /* 2 * 180 / Math.PI */; }

		override public function set focalLength( f:Number ):void {}
		override public function get focalLength():Number { return viewport.height2 / Math.tan (fov * 0.00872664626 /* 1 / 2 * (Math.PI / 180) */ ); }

		override public function set near( pNear:Number ):void {}
		override public function get near():Number { return -mp34 / mp33; }

		override public function set far( pFar:Number ):void {}
		override public function get far():Number { return near * mp33 / (mp33 - 1); }
	}
}