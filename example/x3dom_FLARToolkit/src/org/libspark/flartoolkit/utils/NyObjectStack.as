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

package org.libspark.flartoolkit.utils {
	import org.libspark.flartoolkit.FLARException;			

	/**
	 * オンデマンド割り当てをするオブジェクト配列。
	 * 配列には実体を格納します。
	 */
	public  class NyObjectStack {

		private static const ARRAY_APPEND_STEP:int = 64;
		private var _dataClass:Class;
		protected var  _items:Array; 
		private var _allocated_size:int;
		protected var _length:int;

		/**
		 * 最大ARRAY_MAX個の動的割り当てバッファを準備する。
		 * 
		 * @param i_array
		 */
		public function NyObjectStack(klass:Class, i_max_array_size:int) {
			this._dataClass = klass;
			// ポインタだけははじめに確保しておく
			this._items = new Array(i_max_array_size)
			var n:int = i_max_array_size;
			while (n--) {
				this._items[n] = new this._dataClass();
			}
			// アロケート済サイズと、使用中個数をリセット
			this._allocated_size = 0;
			this._length = 0;
		}

		/**
		 * ポインタを1進めて、その要素を予約し、その要素へのポインタを返します。
		 * 特定型に依存させるときには、継承したクラスでこの関数をオーバーライドしてください。
		 */
		public function prePush():Object {
			// 必要に応じてアロケート
			if (this._length >= this._allocated_size) {
				// 要求されたインデクスは範囲外
				if (this._length >= this._items.length) {
					throw new FLARException();
				}
				// 追加アロケート範囲を計算
				var range:int = this._length + ARRAY_APPEND_STEP;
				if (range >= this._items.length) {
					range = this._items.length;
				}
				// アロケート
				this.onReservRequest(this._allocated_size, range, this._items);
				this._allocated_size = range;
			}
			// 使用領域を+1して、予約した領域を返す。
			var ret:Object = this._items[this._length];
			this._length++;
			return ret;
		}

		/**
		 * 見かけ上の要素数を1減らして、最後尾のアイテムを返します。
		 * @return
		 */
		public function pop():Object {
			if(this._length < 1) {
				throw new FLARException();
			}
			this._length--;
			return this.getItem(this._length);
		}

		/**
		 * 0～i_number_of_item-1までの領域を予約します。
		 * 予約すると、見かけ上の要素数は0にリセットされます。
		 * @param i_number_of_reserv
		 */
		public function reserv(i_number_of_item:int):void {
			// 必要に応じてアロケート
			if (i_number_of_item >= this._allocated_size) {
				// 要求されたインデクスは範囲外
				if (i_number_of_item >= this._items.length) {
					throw new FLARException();
				}
				// 追加アロケート範囲を計算
				var range:int = i_number_of_item + ARRAY_APPEND_STEP;
				if (range >= this._items.length) {
					range = this._items.length;
				}
				// アロケート
				this.onReservRequest(this._allocated_size, range, this._items);
				this._allocated_size = range;
			}
			//見かけ上の配列サイズを指定
			this._length = i_number_of_item;
			return;
		}

		/**
		 * この関数を継承先クラスで実装して下さい。
		 * i_bufferの配列の、i_start番目からi_end-1番目までの要素に、オブジェクトを割り当てて下さい。
		 * 
		 * @param i_start
		 * @param i_end
		 * @param i_buffer
		 */
		protected virtual function onReservRequest(i_start:int, i_end:int, i_buffer:Array):void {
			for (var i:int = i_start; i < i_end; i++) {
				i_buffer[i] = new this._dataClass();
			}
		}

		/**
		 * 配列を返します。
		 * 
		 * @return
		 */
		public function getArray():Array {
			return this._items;
		}

		public function getItem(i_index:int):Object {
			return this._items[i_index];
		}

		/**
		 * 配列の見かけ上の要素数を返却します。
		 * @return
		 */
		public function getLength():int {
			return this._length;
		}

		/**
		 * 見かけ上の要素数をリセットします。
		 */
		public function clear():void {
			this._length = 0;
		}
	}
}