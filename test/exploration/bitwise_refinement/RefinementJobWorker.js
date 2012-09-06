URL = (typeof URL       !== 'undefined') ? URL : 
          (typeof webkitURL !== 'undefined') ? webkitURL : undefined;
        
        
x3dom.RefinementJobWorker = function() {
};


x3dom.RefinementJobWorker.prototype.processJob = function(attributeId, format, resultBufferView) {
  //TEST CODE
  var i;
  for (i = 0; i < resultBufferView.length; ++i) {
    resultBufferView[i] *= format;
  }
  //END TEST CODE
  
  postMessage({msg          : 'jobFinished',
               attributeId  : attributeId,
               resultBuffer : resultBufferView.buffer},
              [resultBufferView.buffer]);
};


x3dom.RefinementJobWorker.prototype.onmessage = function(message) {
  if (message.data.msg) {
    switch (message.data.msg) {
    
      case 'processJob':        
        processJob(message.data.attributeId, message.data.format, new Uint8Array(message.data.resultBuffer));
        break;
        
    }
  }
};


x3dom.RefinementJobWorker.prototype.toBlob = function () {
	var str = '';
  
  str += 'postMessage = (typeof webkitPostMessage !== "undefined") ? webkitPostMessage : postMessage;\n';

  for (var p in this) {
		if(this[p] != x3dom.RefinementJobWorker.prototype.toBlob) {
			str += p + ' = ';
			
			if (this[p] instanceof String) {
			  str += '"' + this[p] + '"';
			}
			else if (this[p] instanceof Array) {
				str += "[];\n";
			}
			else {
			  str += this[p] + ';\n';
			}
		}
  }
  
  var blob = new Blob([str]);
  return URL.createObjectURL(blob);
};
