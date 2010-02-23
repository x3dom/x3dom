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

package org.libspark.flartoolkit.support.pv3d {
	
	import org.libspark.flartoolkit.core.FLARMat;
	import org.libspark.flartoolkit.core.param.FLARParam;
	import org.libspark.flartoolkit.core.types.FLARIntSize;
	import org.libspark.flartoolkit.utils.ArrayUtil;
	import org.papervision3d.cameras.Camera3D;
	import org.papervision3d.core.math.Matrix3D;

	public class FLARCamera3D extends Camera3D {
		
		private static const NEAR_CLIP:Number = 10;
		private static const FAR_CLIP:Number = 10000;
		
		public function FLARCamera3D(param:FLARParam=null) {
			super();
			this.z = 0;
			
			if (param) {
				this.setParam(param);
			}
		}
		
		public function setParam (param:FLARParam) :void {	
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
			
			this.useProjectionMatrix = true;
			// 巣の GreatWhite のままだと _projection が Camera3D の private プロパティなのでエラる。
			// ので protected とかにしてください。無理やり。害はない。つーかまーそれ以外に方法がない。
			this._projection = new Matrix3D(m_projection);
		}
		
		override public function transformView(transform:Matrix3D=null):void {
			// Camera3D の transformView はいらんことしやがるので super.transformView() しない。
			// ただし CameraObject3D の transformView は必要なのでそこでやってる処理をここに移植。
			this.eye.calculateMultiply(this.transform, _flipY);
			this.eye.invert(); 
			this.eye.calculateMultiply4x4(this._projection, this.eye);
		}
		
		// これも Camera3D の private になってるのでここにコピー。Camera3D のんを protected とかに変更でもいいけど。
		static private var _flipY :Matrix3D = Matrix3D.scaleMatrix( 1, -1, 1 );
	}
	
}