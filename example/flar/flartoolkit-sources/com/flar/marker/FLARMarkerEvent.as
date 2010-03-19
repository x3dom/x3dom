/* 
 * PROJECT: FLARManager
 * http://transmote.com/flar
 * Copyright 2009, Eric Socolofsky
 * --------------------------------------------------------------------------------
 * This work complements FLARToolkit, developed by Saqoosha as part of the Libspark project.
 *	http://www.libspark.org/wiki/saqoosha/FLARToolKit
 * FLARToolkit is Copyright (C)2008 Saqoosha,
 * and is ported from NYARToolkit, which is ported from ARToolkit.
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
 * For further information please contact:
 *	<eric(at)transmote.com>
 *	http://transmote.com/flar
 * 
 */

package com.transmote.flar.marker {
	import flash.events.Event;

	/**
	 * event with notification of a change in an active FLARMarker.
	 * contains a reference to the changed marker.
	 * 
	 * @author	Eric Socolofsky
	 * @url		http://transmote.com/flar
	 */
	public class FLARMarkerEvent extends Event {
		public static const MARKER_ADDED:String = "markerAdded";
		public static const MARKER_UPDATED:String = "markerUpdated";
		public static const MARKER_REMOVED:String = "markerRemoved";
		
		private var _marker:FLARMarker;
		
		
		public function FLARMarkerEvent (type:String, marker:FLARMarker, bubbles:Boolean=false, cancelable:Boolean=false) {
			super(type, bubbles, cancelable);
			this._marker = marker;
		}
		
		public function get marker () :FLARMarker {
			return this._marker;
		}
		
		public override function clone () :Event {
			return new FLARMarkerEvent(this.type, this.marker, this.bubbles, this.cancelable);
		}
	}
}