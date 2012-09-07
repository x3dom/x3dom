URL = (typeof URL       !== 'undefined') ? URL : 
          (typeof webkitURL !== 'undefined') ? webkitURL : undefined;
        
         
x3dom.RefinementJobWorker = function() {
};


x3dom.RefinementJobWorker.prototype.log = function(logMessage) {
  postMessage({msg : 'log', txt : logMessage});
};


x3dom.RefinementJobWorker.prototype.processJob = function(attributeId, level, stride,
                                                          numComponentsList, bitsPerLevelList, readOffsetList, writeOffsetList,
                                                          dataBufferView, resultBufferView)
{ 
  var aPrecOff, bPrecOff;

  //optimized cases for decoding:
  //---------------------------------------------------------------------------------------------
  //Attrib. A (e.g. positions)        : 3 x 2 bit
  //Attrib. B (e.g. normals)          : 2 x 1 bit
  //Result Buffer Alignment / Padding : a1 a2 a3 0 b1 b2
  if (numComponentsList.length === 2 &&
      numComponentsList[0]     === 3 &&
      numComponentsList[1]     === 2 &&
      bitsPerLevelList[0]      === 6 &&
      bitsPerLevelList[1]      === 2   ) {      
    aPrecOff = resultBufferView.BYTES_PER_ELEMENT * 8 - 2 - (level * 2);  //2 bits per component per level
    bPrecOff = resultBufferView.BYTES_PER_ELEMENT * 8 - 1 - (level * 1);  //2 bit per component per level
    
    addBits_3x2_2x1(dataBufferView, resultBufferView, aPrecOff, bPrecOff);
  } 
  //---------------------------------------------------------------------------------------------
  // else if (...) {
  //  ...
  //}
  //---------------------------------------------------------------------------------------------
  //default non-optimized decoding:
  //(assuming interleaved output)
  else {
    addBits(level, stride, numComponentsList, bitsPerLevelList, readOffsetList, writeOffsetList, dataBufferView, resultBufferView);
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
        
        processJob(message.data.attributeId, message.data.level, message.data.stride,
                   message.data.numComponentsList, message.data.bitsPerLevelList, message.data.readOffsetList, message.data.writeOffsetList,
                   getBufferView(dataBufferBytesPerElement,                message.data.dataBuffer),
                   getBufferView(message.data.resultBufferBytesPerElement, message.data.resultBuffer));
        break;        
    }
  }
};


x3dom.RefinementJobWorker.prototype.getBufferView = function(bytesPerElement, buffer) {
  switch (bytesPerElement) {
    case 1:
      return new Uint8Array(buffer);
    case 2:
      return new Uint16Array(buffer);
    case 4:
      return new Uint32Array(buffer);
    default:
      log('ERROR: The estimated element length of ' + bytesPerElement + ' bytes does not match any known Uint buffer type.');
      break;
  }
};


x3dom.RefinementJobWorker.prototype.addBits_3x2_2x1 = function(dataBufferView, resultBufferView, aPrecOff, bPrecOff) {  
  //Optimized Decoding

  //Attrib. A (e.g. positions)        : 3 x 2 bit
  //Attrib. B (e.g. normals)          : 2 x 1 bit  
  //Result Buffer Alignment / Padding : a1 a2 a3 0 b1 b2
  
	//{
    var idx   	     = 0;
    var n            = dataBufferView.length;
    
		var i, dataChunk, a1, a2, a3, b1, b2;
		
		for (i = 0; i < n; ++i) {		
			dataChunk = dataBufferView[i];
			
			a1   = (dataChunk & 0xC0) >>> 6;
			a1 <<= aPrecOff; 
			
			a2   = (dataChunk & 0x30) >>> 4;
			a2 <<= aPrecOff;
			
			a3 	 = (dataChunk & 0x0C) >>> 2;
			a3 <<= aPrecOff;
			
			resultBufferView[idx++] |= a1;
			resultBufferView[idx++] |= a2
			resultBufferView[idx++] |= a3;
      
      ++idx;
      
      b1   = (dataChunk & 0x02) >>> 1;
			b1 <<= bPrecOff;
			
			b2   = (dataChunk & 0x01);
			b2 <<= bPrecOff;
			
			resultBufferView[idx++] |= b1;
			resultBufferView[idx++] |= b2;
		}
	//}
};


x3dom.RefinementJobWorker.prototype.addBits = function(level, stride,
                                                       numComponentsList, bitsPerLevelList, readOffsetList, writeOffsetList,
                                                       dataBufferView, resultBufferView) {
  var i, j, c, nc, attributeLeftShift;
	var dataChunk;
	
	var componentMasksList  = [], componentMasks;
  var componentShiftsList = [], componentShifts;
  var precisionOffsetList = [], precisionOffset;
  
  var m = numComponentsList.length;
  
  var strideInElements = stride / (resultBufferView.BYTES_PER_ELEMENT * 8);
  
  var bitsPerComponentPerLevel;

	for (i = 0; i < m; ++i) {
		nc = numComponentsList[i];
	
    bitsPerComponentPerLevel = (bitsPerLevelList[i]/numComponentsList[i]);
    
    //@todo: check this for non-interleaved output
		attributeLeftShift 	    = (dataBufferView.BYTES_PER_ELEMENT * 8) - readOffsetList[i] - bitsPerComponentPerLevel * nc;    
		precisionOffsetList[i] = (resultBufferView.BYTES_PER_ELEMENT * 8) - bitsPerComponentPerLevel - (level * bitsPerComponentPerLevel);

    componentMasks  = [];
    componentShifts = [];
    
		for (c = 0; c < nc; ++c) {
			componentShifts[c] = attributeLeftShift + (nc - c - 1) * bitsPerComponentPerLevel;
			
			componentMasks[c]    = 0 | (Math.pow(2, bitsPerComponentPerLevel) - 1);
			componentMasks[c]  <<= componentShifts[c];
		}
    
    componentMasksList.push(componentMasks);
    componentShiftsList.push(componentShifts);
	}	
	
	var n = dataBufferView.length;	
		
	var baseIdx, idx;
		
	var component;
	
	for (j = 0; j < m; ++j) {
		nc		           = numComponentsList[j];
    //@todo: check this for non-interleaved output
		baseIdx		       = writeOffsetList[j] / (resultBufferView.BYTES_PER_ELEMENT * 8);
    componentMasks   = componentMasksList[j];
    componentShifts  = componentShiftsList[j];
    precisionOffset  = precisionOffsetList[j];
		
		for (i = 0; i < n; ++i) {
			dataChunk = dataBufferView[i];
			
			for (c = 0; c < nc; ++c) {
				component = dataChunk & componentMasks[c];			
				
				component >>>= componentShifts[c];
				component  <<= precisionOffset;
				
				idx 			             = baseIdx + c;
        //@todo: check this for non-interleaved output
				resultBufferView[idx] |= component;
			}
			
      //@todo: check this for non-interleaved output
			baseIdx += strideInElements;
		}
  }
}


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
