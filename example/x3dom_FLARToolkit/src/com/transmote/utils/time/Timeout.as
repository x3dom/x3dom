/**
 * call a method one time, after a specified delay.
 * accepts optional parameters.
 * (wraps a simple Timer implementation.)
 * all active timeouts can be cleared via a static method. 
 */

package com.transmote.utils.time {
	import flash.utils.Timer;
	import flash.events.TimerEvent;
	
	public class Timeout {
		private static var activeTimeouts:Array;
		
		private var timer:Timer;
		private var func:Function;
		private var params:Array;
		
		public static function clearAllTimeouts () :void {
			var i:int = Timeout.activeTimeouts.length;
			while (i--) {
				var timeout:Timeout = Timeout(Timeout.activeTimeouts[i]);
				timeout.cancel();
			}
		}
		
		public function Timeout (func:Function, delay:Number, ...params:Array) {
			if (!Timeout.activeTimeouts) {
				Timeout.activeTimeouts = new Array();
			}
			Timeout.activeTimeouts.push(this);
			
			this.func = func;
			this.params = params;
			
			this.timer = new Timer(delay, 1);
			this.timer.addEventListener(TimerEvent.TIMER_COMPLETE, this.onTimerComplete);
			this.timer.start();
		}
		
		private function onTimerComplete (evt:TimerEvent=null) :void {
			this.timer.removeEventListener(TimerEvent.TIMER_COMPLETE, this.onTimerComplete);
			if (this.params.length) { this.func(this.params); }
			else { this.func(); }
			this.destroy();
		}
		
		public function cancel () :void {
			if (!this.timer) { return; }
			
			this.timer.stop();
			this.timer.removeEventListener(TimerEvent.TIMER_COMPLETE, this.onTimerComplete);
			this.destroy();
		}
		
		private function destroy () :void {
			Timeout.activeTimeouts.splice(Timeout.activeTimeouts.indexOf(this), 1);
			this.timer = null;
			this.func = null;
			this.params = null;
		}
	}
}