var IDList = function() {
		
	var content = document.getElementById("content");

	// run through all contained elements:
	var allContainedElements = content.getElementsByTagName("*");
	for (var i = 0; i < allContainedElements.length; i++) {
		var elem = allContainedElements[i];
		// do something with contained elem
		x3dom.debug.doLog('id: ' + elem.id, x3dom.debug.INFO)
		}
		
		//---
	}
	
function addIt2() {
       	 document.getElementById('IDList').addEventListener('click', IDList, false);
   	}