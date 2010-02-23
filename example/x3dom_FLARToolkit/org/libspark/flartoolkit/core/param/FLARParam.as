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

package org.libspark.flartoolkit.core.param {
	import org.libspark.flartoolkit.core.types.FLARIntSize;
	
	import flash.utils.ByteArray;
	import flash.utils.Endian;	
	
	/**
	 * typedef struct { int xsize, ysize; double mat[3][4]; double dist_factor[4]; } ARParam;
	 * FLARの動作パラメータを格納するクラス
	 *
	 */
	public class FLARParam {

		protected var _screen_size:FLARIntSize = new FLARIntSize();
//		private static const SIZE_OF_PARAM_SET:int = 4 + 4 + (3 * 4 * 8) + (4 * 8);
		private var _dist:FLARCameraDistortionFactor = new FLARCameraDistortionFactor();
		private var _projection_matrix:FLARPerspectiveProjectionMatrix = new FLARPerspectiveProjectionMatrix();

		public function getScreenSize():FLARIntSize {
			return this._screen_size;
		}

		public function getPerspectiveProjectionMatrix():FLARPerspectiveProjectionMatrix {
			return this._projection_matrix;
		}

		public function getDistortionFactor():FLARCameraDistortionFactor {
			return this._dist;
		}

		/**
		 * ARToolKit標準ファイルから1個目の設定をロードする。
		 * 
		 * @param i_filename
		 * @throws FLARException
		 */
		//	public function loadARParamFromFile(i_filename:String):void
		//	{
		//		try {
		//			loadARParam(new FileInputStream(i_filename));
		//		} catch (Exception e) {
		//			throw new FLARException(e);
		//		}
		//	}

		/**
		 * int arParamChangeSize( ARParam *source, int xsize, int ysize, ARParam *newparam );
		 * 関数の代替関数 サイズプロパティをi_xsize,i_ysizeに変更します。
		 * @param i_xsize
		 * @param i_ysize
		 * @param newparam
		 * @return
		 * 
		 */
		public function changeScreenSize(i_xsize:int, i_ysize:int):void {
			const scale:Number = Number(i_xsize) / this._screen_size.w;
			// scale = (double)xsize / (double)(source->xsize);
			//スケールを変更
			this._dist.changeScale(scale);
			this._projection_matrix.changeScale(scale);
			//for (int i = 0; i < 4; i++) {
			//	array34[0 * 4 + i] = array34[0 * 4 + i] * scale;// newparam->mat[0][i]=source->mat[0][i]* scale;
			//	array34[1 * 4 + i] = array34[1 * 4 + i] * scale;// newparam->mat[1][i]=source->mat[1][i]* scale;
			//	array34[2 * 4 + i] = array34[2 * 4 + i];// newparam->mat[2][i] = source->mat[2][i];
			//}

			
			this._screen_size.w = i_xsize;
			// newparam->xsize = xsize;
			this._screen_size.h = i_ysize;
			// newparam->ysize = ysize;
			return;
		}

		
		/**
		 * int arParamLoad( const char *filename, int num, ARParam *param, ...);
		 * i_streamの入力ストリームからi_num個の設定を読み込み、パラメタを配列にして返します。
		 * 
		 * @param i_stream
		 * @throws Exception
		 */
		public function loadARParam(i_stream:ByteArray):void {
//			try {
//				byte[] buf = new byte[SIZE_OF_PARAM_SET];
//				i_stream.read(buf);
				var tmp:Array = new Array(12);//new double[12];
	
				// バッファを加工
//				ByteBuffer bb = ByteBuffer.wrap(buf);
//				bb.order(ByteOrder.BIG_ENDIAN);
				i_stream.endian = Endian.BIG_ENDIAN;
				this._screen_size.w = i_stream.readInt();//bb.getInt();
				this._screen_size.h = i_stream.readInt();//bb.getInt();
				//double値を12個読み込む
				for(var i:int = 0; i < 12; i++){
					tmp[i] = i_stream.readDouble();//bb.getDouble();
				}
				//Projectionオブジェクトにセット
				this._projection_matrix.setValue(tmp);
				//double値を4個読み込む
				for (i = 0; i < 4; i++) {
					tmp[i] = i_stream.readDouble();//bb.getDouble();
				}
				//Factorオブジェクトにセット
				this._dist.setValue(tmp);
//			} catch (Exception e) {
//				throw new FLARException(e);
//			}
			return;
		}

//		public function saveARParam(i_stream:OutputStream):void {
//		FLARException.trap("未チェックの関数");
//		byte[] buf = new byte[SIZE_OF_PARAM_SET];
//		// バッファをラップ
//		ByteBuffer bb = ByteBuffer.wrap(buf);
//		bb.order(ByteOrder.BIG_ENDIAN);
//
//		// 書き込み
//		bb.putInt(this._screen_size.w);
//		bb.putInt(this._screen_size.h);
//		double[] tmp=new double[12];
//		//Projectionを読み出し
//		this._projection_matrix.getValue(tmp);
//		//double値を12個書き込む
//		for(int i=0;i<12;i++){
//			tmp[i]=bb.getDouble();
//		}
//		//Factorを読み出し
//		this._dist.getValue(tmp);
//		//double値を4個書き込む
//		for (int i = 0; i < 4; i++) {
//			tmp[i]=bb.getDouble();
//		}
//		i_stream.write(buf);
//		return;
//		}
	}
}