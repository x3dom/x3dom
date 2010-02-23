package com.transmote.utils.time {
	import flash.display.Sprite;
	import flash.text.TextField;
	import flash.events.Event;
	import flash.text.TextFormat;
	
	/**
	 * simple framerate display.
	 * 
	 * @author	Eric Socolofsky
	 * @url		http://transmote.com/flar
	 */
	public class FramerateDisplay extends Sprite {
		private static var SAMPLE_LENGTH:Number = 15;
		
		private var tf:TextField;
		private var avgCtr:Number;
		private var lastTime:Number;
		
		
		public function FramerateDisplay () {
			this.init();
			this.mouseChildren = false;
		}
		
		private function init () :void {
			this.tf = new TextField();
			this.tf.width = 40;
			this.tf.height = 30;
			this.tf.defaultTextFormat = new TextFormat("_sans", 10, 0x33FF33, false, null, null, null, null, "left");
			this.addChild(this.tf);
			this.start();
		}
		
		private function start () :void {
			this.avgCtr = 0;
			this.lastTime = new Date().getTime();
			this.addEventListener(Event.ENTER_FRAME, this.update, false, 0, true);
		}
		
		private function update (evt:Event) :void {
			if (this.avgCtr++ >= FramerateDisplay.SAMPLE_LENGTH) {
				this.avgCtr = 0;
				this.sample();
			}
		}
		
		private function sample () :void {
			var now:Number = new Date().getTime();
			var elapsed:Number = now - this.lastTime;
			this.lastTime = now;
			var fps:Number = 1000 / (elapsed / FramerateDisplay.SAMPLE_LENGTH);
			this.tf.text = fps.toFixed(1);
		}
	}
}