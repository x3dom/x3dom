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

package org.libspark.flartoolkit.core.types {

	public class FLARIntSize{

		public var h:int;
		public var w:int;

//		public function FLARIntSize() {
//			this.w = 0;
//			this.h = 0;
//			return;
//		}

		public function FLARIntSize(i_width:int = 0, i_height:int = 0) {
			this.w = i_width;
			this.h = i_height;
			return;
		}

		/**
		 * サイズが同一であるかを確認する。
		 * 
		 * @param i_width
		 * @param i_height
		 * @return
		 * @throws FLARException
		 */
		public function isEqualSizeII(i_width:int, i_height:int):Boolean {
			if (i_width == this.w && i_height == this.h) {
				return true;
			}
			return false;
		}

		/**
		 * サイズが同一であるかを確認する。
		 * 
		 * @param i_size
		 * @return
		 * @throws FLARException
		 */
		public function isEqualSizeO(i_size:FLARIntSize):Boolean {
			if (i_size.w == this.w && i_size.h == this.h) {
				return true;
			}
			return false;
		}
		
		public function toString():String 
		{
			return "(width=" + w + " , height=" + h + ")";
		}
	}
}