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

package org.libspark.flartoolkit.core {
	import org.libspark.flartoolkit.FLARException;
	import org.libspark.flartoolkit.core.pickup.IFLARColorPatt;
	import org.libspark.flartoolkit.utils.ArrayUtil;	

	/**
	 * ARToolKitのマーカーコードを1個保持します。
	 * 
	 */
	public class FLARCode {

		//	private int[][][][] pat;// static int
		// pat[AR_PATT_NUM_MAX][4][AR_PATT_SIZE_Y*AR_PATT_SIZE_X*3];
		private var pat:Array;

		//	private double[] patpow = new double[4];// static double patpow[AR_PATT_NUM_MAX][4];
		private var patpow:Array = new Array(4);

		//	private short[][][] patBW;// static int patBW[AR_PATT_NUM_MAX][4][AR_PATT_SIZE_Y*AR_PATT_SIZE_X*3];
		private var patBW:Array;

		//	private double[] patpowBW = new double[4];// static double patpowBW[AR_PATT_NUM_MAX][4];
		private var patpowBW:Array = new Array(4);

		private var width:int;
		private var height:int;
		private var averagePat:int;
		private var _markerPercentWidth:uint;
		private var _markerPercentHeight:uint;

		public function get averageOfPattern():int 
		{
			return this.averagePat;
		}
		
		public function get markerPercentWidth():uint { return _markerPercentWidth; }
		
		public function get markerPercentHeight():uint { return _markerPercentHeight; }
		
		public function set markerPercentHeight(value:uint):void 
		{
			_markerPercentHeight = value;
		}
		public function getPat():Array {
			return pat;
		}

		public function getPatPow():Array {
			return patpow;
		}

		public function getPatBW():Array {
			return patBW;
		}

		public function getPatPowBW():Array {
			return patpowBW;
		}

		public function getWidth():int {
			return width;
		}

		public function getHeight():int {
			return height;
		}

		/**
		 * 
		 * @param	i_width					幅方向の分割数
		 * @param	i_height				高さ方向の分割数
		 * @param	i_markerPercentWidth	マーカ全体(本体＋枠)における、マーカ本体部分の割合(幅)
		 * @param	i_markerPercentHeight	マーカ全体(本体＋枠)における、マーカ本体部分の割合(高さ)
		 */
		public function FLARCode(i_width:int, 
								 i_height:int, 
								 i_markerPercentWidth:uint = 50, 
								 i_markerPercentHeight:uint = 50)
		{
			width = i_width;
			height = i_height;
			if (i_markerPercentWidth > 100 || i_markerPercentHeight > 100) {
				throw new ArgumentError("illegal marker size[" + i_markerPercentWidth + " x " + i_markerPercentHeight + "]");
			}
			this._markerPercentWidth = i_markerPercentWidth;
			this._markerPercentHeight = i_markerPercentHeight;
			//		pat = new int[4][height][width][3];// static int pat[AR_PATT_NUM_MAX][4][AR_PATT_SIZE_Y*AR_PATT_SIZE_X*3];
			pat = ArrayUtil.createJaggedArray(4, height, width, 3);
			//		patBW = new short[4][height][width];// static int patBW[AR_PATT_NUM_MAX][4][AR_PATT_SIZE_Y*AR_PATT_SIZE_X*3];
			patBW = ArrayUtil.createJaggedArray(4, height, width);
		}

		/**
		 * int arLoadPatt( const char *filename ); ARToolKitのパターンファイルをロードする。
		 * ファイル形式はBGR形式で記録されたパターンファイルであること。
		 * 
		 * @param filename
		 * @return
		 * @throws Exception
		 */
		//		public function loadARPattFromFile(filename:String):void {
		//			try {
		//				loadARPatt(new FileInputStream(filename));
		//			} catch (e:Error) {
		//				// throw new FLARException(e);
		//				throw e;
		//			}
		//		}

		/**
		 * 
		 * @param i_stream
		 * @throws FLARException
		 */
		public function loadARPatt(i_stream:String):void {
			//			try {
			//				var st:StreamTokenizer = new StreamTokenizer(new InputStreamReader(i_stream));
			var token:Array = i_stream.match(/\d+/g);
			// パターンデータはGBRAで並んでる。
			
			var h:int;
			var l:int = 0;
			var i3:int;
			var i2:int;
			var i1:int;
			var val:int;
			var j:int;
			// SOC: loop through each of four marker orientations...
			for (h = 0;h < 4; h++) {
				// SOC: loop through blue, green, red channel in this marker orientation...
				for (i3 = 0;i3 < 3; i3++) {
					// SOC: parse this channel row-by-row... 
					for (i2 = 0;i2 < height; i2++) {
						for (i1 = 0;i1 < width; i1++) {
							// 数値のみ読み出す
							val = parseInt(token.shift());
							if (isNaN(val)) {
								// SOC: more descriptive error
								throw new FLARException("syntax error in pattern file.");
								//throw new Error();
							}
							//								switch (st.nextToken()) {// if( fscanf(fp, "%d",&j) != 1 ) {
							//									case StreamTokenizer.TT_NUMBER:
							//										break;
							//									default:
							//										throw new FLARException();
							//								}
							j = 255 - val;
							// j = 255-j;
							// 標準ファイルのパターンはBGRでならんでるからRGBに並べなおす
							switch (i3) {
								case 0:
									pat[h][i2][i1][2] = j;
									break;// pat[patno][h][(i2*Config.AR_PATT_SIZE_X+i1)*3+2]= j;break;
								case 1:
									pat[h][i2][i1][1] = j;
									break;// pat[patno][h][(i2*Config.AR_PATT_SIZE_X+i1)*3+1]= j;break;
								case 2:
									pat[h][i2][i1][0] = j;
									break;// pat[patno][h][(i2*Config.AR_PATT_SIZE_X+i1)*3+0]= j;break;
							}
							// SOC: calculate brightness-only (greyscale) version of pattern
							//		(stored as patBW), by averaging r/g/b for each pattern pixel
							// pat[patno][h][(i2*Config.AR_PATT_SIZE_X+i1)*3+i3]= j;
							if (i3 == 0) {
								patBW[h][i2][i1] = j;// patBW[patno][h][i2*Config.AR_PATT_SIZE_X+i1] = j;
							} else {
								patBW[h][i2][i1] += j;// patBW[patno][h][i2*Config.AR_PATT_SIZE_X+i1] += j;
							}
							if (i3 == 2) {
								patBW[h][i2][i1] /= 3;// patBW[patno][h][i2*Config.AR_PATT_SIZE_X+i1]/= 3;
							}
							l += j;
						}
					}
				}

				l /= (height * width * 3);
				this.averagePat = l;
				var m:int = 0;
				for (var i:int = 0;i < height; i++) {
					// for( i = 0; i < AR_PATT_SIZE_Y*AR_PATT_SIZE_X*3;i++ ) {
					for (i2 = 0;i2 < width; i2++) {
						for (i3 = 0;i3 < 3; i3++) {
							// SOC: express each value as deviation from average over the whole orientation
							pat[h][i][i2][i3] -= l;
							// SOC: calculate sum of all deviations squared... 
							m += (pat[h][i][i2][i3] * pat[h][i][i2][i3]);
						}
					}
				}
				// SOC: ...and store this value for each orientation in patpow.
				patpow[h] = Math.sqrt(m);
				if (patpow[h] == 0.0) {
					// SOC: avoid division by 0
					patpow[h] = 0.0000001;
				}
				
				// SOC: repeat average deviation process for greyscale pattern.
				m = 0;
				for (i = 0;i < height; i++) {
					for (i2 = 0;i2 < width; i2++) {
						patBW[h][i][i2] -= l;
						m += (patBW[h][i][i2] * patBW[h][i][i2]);
					}
				}
				patpowBW[h] = Math.sqrt(m);
				if (patpowBW[h] == 0.0) {
					patpowBW[h] = 0.0000001;
				}
			}
//			} catch (e:Error) {
//				//				throw new FLARException(e);
//				throw e;
//			}
		}

		/**
		 * FLARColorPatt_O3インスタンスからパターンを作る
		 * @param       pattern
		 * @see IFLARColorPatt
		 */
		public function fromPattern(pattern:IFLARColorPatt):void
		{
			var patArray:Array = pattern.getPatArray(); 
			var l:int;
			var m:int;
			var mbw:int;

			l = 0;
			m = 0;
			mbw = 0;

			//幅・高さのチェック
			if (this.height != patArray.length || this.width != patArray[0].length) {
				trace(this.height, patArray.length, this.width, patArray[0].length);
				throw new ArgumentError("パターンの幅・高さが、Codeの幅・高さと異なっています");
			}
			if (this.height != this.width) {
				throw new ArgumentError("正方形のインスタンスのみ有効です。");
			}
			for (var y:int = 0; y < this.height; y++) {//y : 行方向の添え字
				for (var x:int = 0; x < this.width ; x++) {//x : 列方向の添え字
					patBW[0][this.height - 1 - y][this.width -1 - x] = 0;
					patBW[1][x][this.width - 1 - y] = 0;
					patBW[2][y][x] = 0;
					patBW[3][this.height - 1 - x][y] = 0;
					for (var c:int = 0; c < 3; c++) {//c : 色情報(0:R/1:G/2:B)
						//傾き情報(0:上/1:左/2:下/3:右)
						//全方向に1度に値を代入している
						var j:int = 255 - int(patArray[y][x][c]);

						pat[0][this.height - 1 - y][this.width - 1 - x][c] = j;
						pat[1][x][this.width - 1 - y][c] = j;
						pat[2][y][x][c] = j
						pat[3][this.height - 1 - x][y][c] = j;
						patBW[0][this.height - 1 - y][this.width -1 - x] += j;
						patBW[1][x][this.width - 1 - y] += j;
						patBW[2][y][x] += j;
						patBW[3][this.height - 1 - x][y] += j;
						l += j;
					}
					patBW[0][this.height - 1 - y][this.width -1 - x] /= 3;
					patBW[1][x][this.width - 1 - y] /= 3;
					patBW[2][y][x] /= 3;
					patBW[3][this.height - 1 - x][y] /= 3;
				}
			}
			l /= (this.width * this.height * 3);
			this.averagePat = l;
			for (y = 0; y < this.height; y++) {
				for (x = 0; x < this.width; x++) {
					patBW[0][this.height - 1 - y][this.width - 1 - x] -= l;
					patBW[1][x][this.width - 1 - y] -= l;
					patBW[2][y][x] -= l;
					patBW[3][this.height - 1 - x][y] -= l;
					mbw += (patBW[2][y][x] * patBW[2][y][x]);
					for (c = 0; c < 3;c++) {
						pat[0][this.height - 1 - y][this.width - 1 - x][c] -= l;
						pat[1][x][this.width - 1 - y][c] -= l;
						pat[2][y][x][c] -= l;
						pat[3][this.height - 1 - x][y][c] -= l;
						m += (pat[2][y][x][c] * pat[2][y][x][c]);
					}
				}
			}
			patpow[0] = patpow[1] = patpow[2] = patpow[3] = m == 0 ? 0.0000001 : Math.sqrt(m);
			patpowBW[0] = patpowBW[1] = patpowBW[2] = patpowBW[3] = mbw == 0 ? 0.0000001 : Math.sqrt(mbw);
		}
		
		public function toString():String 
		{
			return this.generatePatFileString(this.pat);
		}
		
		private function generatePatFileString(pat:Array):String {
			var x:int, y:int, c:int, h:int;
			var out:String = '';
			var width:int = this.getWidth();
			var height:int = this.getHeight();
			for (h = 0; h < pat.length;h++) {
				for (c = 2; c >= 0; c--) {
					for (y = 0; y < height; y++) {
						for (x = 0; x < width; x++) {
							out += String('    ' + int((255-(pat[h][y][x][c])-this.averagePat)&0xFF)).substr(-4);
						}
						out += '\n';
					}
				}
				out += '\n';
			}
			return out;
		}

	}
}