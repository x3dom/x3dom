package x3dom {
	
	import flash.external.ExternalInterface
	
	public class Debug {
		
		public static function logInfo(info:String) : void {
			ExternalInterface.call("x3dom.debug.logInfo", info);
		}
		
		public static function logWarning(warning:String) : void {
			ExternalInterface.call("x3dom.debug.logWarning", warning);
		}
		
		public static function logError(error:String) : void {
			ExternalInterface.call("x3dom.debug.logError", error);
		}
		
		public static function logException(exception:String) : void {
			ExternalInterface.call("x3dom.debug.logException", exception);
		}

	}
	
}
