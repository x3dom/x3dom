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

package org.libspark.flartoolkit.core.types.matrix {
	
	import flash.utils.getQualifiedClassName;

	public class FLARDoubleMatrix34 implements IFLARDoubleMatrix {

		public var m00:Number;
		public var m01:Number;
		public var m02:Number;
		public var m03:Number;
		public var m10:Number;
		public var m11:Number;
		public var m12:Number;
		public var m13:Number;
		public var m20:Number;
		public var m21:Number;
		public var m22:Number;
		public var m23:Number;

		public function setValue(i_value:Array):void {
			this.m00 = i_value[0];
			this.m01 = i_value[1];
			this.m02 = i_value[2];
			this.m03 = i_value[3];
			this.m10 = i_value[4];
			this.m11 = i_value[5];
			this.m12 = i_value[6];
			this.m13 = i_value[7];
			this.m20 = i_value[8];
			this.m21 = i_value[9];
			this.m22 = i_value[10];
			this.m23 = i_value[11];
			return;
		}

		public function getValue(o_value:Array):void {
			o_value[0] = this.m00;
			o_value[1] = this.m01;
			o_value[2] = this.m02;
			o_value[3] = this.m03;
			o_value[4] = this.m10;
			o_value[5] = this.m11;
			o_value[6] = this.m12;
			o_value[7] = this.m13;
			o_value[8] = this.m20;
			o_value[9] = this.m21;
			o_value[10] = this.m22;
			o_value[11] = this.m23;
			return;
		}

		public function toString():String {
			return '[' + getQualifiedClassName(this) + '\n' + 
					'\t' + int(this.m00 * 1000) / 1000 + ',\t' + int(this.m01 * 1000) / 1000 + ',\t' + int(this.m02 * 1000) / 1000 + ',\t' + int(this.m03 * 1000) / 1000 + ',\n' +
					'\t' + int(this.m10 * 1000) / 1000 + ',\t' + int(this.m11 * 1000) / 1000 + ',\t' + int(this.m12 * 1000) / 1000 + ',\t' + int(this.m13 * 1000) / 1000 + ',\n' +
					'\t' + int(this.m20 * 1000) / 1000 + ',\t' + int(this.m21 * 1000) / 1000 + ',\t' + int(this.m22 * 1000) / 1000 + ',\t' + int(this.m23 * 1000) / 1000 + '\n]';
		}
	}
}