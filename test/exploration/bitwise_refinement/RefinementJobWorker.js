URL = (typeof URL       !== 'undefined') ? URL : 
          (typeof webkitURL !== 'undefined') ? webkitURL : undefined;
        
        
x3dom.RefinementJobWorker = function() {
};


x3dom.RefinementJobWorker.prototype.processJob = function(attributeId, stride,
                                                          numComponentsList, bitsPerLevelList, readOffsetList, writeOffsetList,
                                                          dataBufferView, resultBufferView)
{  
  var aPrecOff, bPrecOff;
  
  if (numComponentsList.length === 2 &&
      numComponentsList[0]     === 6 &&
      numComponentsList[1]     === 2   ) {      
    aPrecOff = resultBufferView.BYTES_PER_ELEMENT * 8 - bitsPerLevelList[0] - (level * bitsPerLevelList[0]);
    bPrecOff = resultBufferView.BYTES_PER_ELEMENT * 8 - bitsPerLevelList[1] - (level * bitsPerLevelList[1]);
    
    addBits_6_2(dataBufferView, resultBufferView, aPrecOff, bPrecOff);
  }
  
  postMessage({msg          : 'jobFinished',
               attributeId  : attributeId,
               resultBuffer : resultBufferView.buffer},
              [resultBufferView.buffer]);
};


x3dom.RefinementJobWorker.prototype.onmessage = function(message) {
  var i, dataBufferBytesPerElement;
  
  if (message.data.msg) {
    switch (message.data.msg) {
    
      case 'processJob':
        dataBufferBytesPerElement = 0;
        
        for (i = 0; i < message.data.bitsPerLevelList.length; ++i) {
          dataBufferBytesPerElement += message.data.bitsPerLevelList[i];
        }
        
        //here, we assume that dataBufferBytesPerElement will be 1, 2 or 4 afterwards
        dataBufferBytesPerElement = Math.ceil(dataBufferBytesPerElement / 8.0);
        
        processJob(message.data.attributeId, message.data.stride,
                   message.data.numComponentsList, message.data.bitsPerLevelList, message.data.readOffsetList, message.data.writeOffsetList,
                   this.getBufferView(message.data.dataBufferBytesPerElement,   message.data.dataBuffer),
                   this.getBufferView(message.data.resultBufferBytesPerElement, message.data.resultBuffer));
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


x3dom.RefinementJobWorker.prototype.getBufferView = function(bytesPerElement, buffer) {
  switch (bytesPerElement) {
    case 1:
      return new Uint8Array(buffer);
    case 2:
      return new Uint16Array(buffer);
    case 4:
      return new Uint32Array(buffer);
  }
};


x3dom.RefinementJobWorker.prototype.addBits_6_2 = function(dataBufferView, resultBufferView, aPrecOff, bPrecOff) {
  //Optimized Decoding

  //Attrib. A (e.g. positions)        : 3 x 2 bit
  //Attrib. B (e.g. normals)          : 2 x 1 bit  
  //Result Buffer Alignment / Padding : a1 a2 a3 0 b1 b2
  
	//{
    var n            = dataBufferView.length;
		var idxA   	     = 0;
		var idxB   	     = 4;
		var a1, a2, a3, b1, b2;
		
		for (i = 0; i < n; ++i) {		
			dataChunk = dataBufferView[i];
			
			a1   = (dataChunk & 0x30) >>> 4;
			a1 <<= aPrecOff; 
			
			a2   = (dataChunk & 0x0C) >>> 2;
			a2 <<= aPrecOff;
			
			a3 	 = (dataChunk & 0x03);
			a3 <<= aPrecOff;
			
			resultBufferView[idxA++] |= a1;
			resultBufferView[idxA++] |= a2;
			resultBufferView[idxA++] |= a3;
      
      idxPos += 3;
      
      b1   = (dataChunk & 0x80) >>> 7;
			b1 <<= bPrecOff;
			
			b2   = (dataChunk & 0x40) >>> 6;
			b2 <<= bPrecOff;
			
			resultBufferView[idxB++] |= b1;
			resultBufferView[idxB++] |= b2;
      
      idxNor += 4;
		}
	//}
	//END OPTIMIZED LOOP
};