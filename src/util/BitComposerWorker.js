//THE MOST IMPORTANT LINE!!!
postMessage = (typeof webkitPostMessage !== 'undefined') ? webkitPostMessage : postMessage;
//

//a small AttributeArray wrapper class
var AttributeArray = function(numComponents, numBitsPerComponent, numBitsPerComponentPerLevel, readOffset) {
	//---------------------------------
	//static general information
	this.numComponents 	   	 = numComponents;	
	this.numBitsPerComponent = numBitsPerComponent	
	this.strideWriting		   = numComponents; //default value, gets changed for interleaved data
	//this.writeOffset set on demand
		
	//---------------------------------
	//static refinement information
	this.numBitsPerComponentPerLevel = numBitsPerComponentPerLevel;
	this.readOffset	     			       = readOffset;	
	
	//---------------------------------
	//dynamic refinement information
	this.componentMask   	   = [];
	this.componentLeftShift  = [];
	this.precisionOffset 	   = 0;
	
	this.bufferView		 = {}; //renewed on every refinement due to changing ownership
}


//flag for interleaved encoding - if this is true, each AttributeArray's bufferView
//members will refer to the same buffer, but use different offsets in their view
var interleavedMode = false;


//list of registered attribute arrays
var attribArrays = [];


//views on the refinement buffers
var refinementBufferViews = [];


//size in bytes of a single element of the refinement buffers
var strideReading = 0;


//size in bytes of a single element of the interleaved output buffer, if any
var strideWriting = 0;


var refinementDataURLs = 0;


var availableRefinementLevels = [];


//number of refinements that have already been processed
var refinementsDone = 0;


var requestedRefinements = 0;


/**
 * 
 */
function refineAttributeData(level) {
	var start = Date.now();
	
  refinementBufferView = refinementBufferViews[level];
  
	var i, c, nc, attrib, attributeLeftShift;
	var dataChunk;
	
	var m = attribArrays.length;
	
	for (i = 0; i < m; ++i) {
		attrib = attribArrays[i];
		nc	   = attrib.numComponents;
		
		attributeLeftShift 	   = (strideReading * 8) - attrib.readOffset - attrib.numBitsPerComponentPerLevel * nc;	
		attrib.precisionOffset = attrib.numBitsPerComponent - attrib.numBitsPerComponentPerLevel -
                             (level * attrib.numBitsPerComponentPerLevel);
							
		for (c = 0; c < nc; ++c) {
			attrib.componentLeftShift[c] = attributeLeftShift + (nc - c - 1) * attrib.numBitsPerComponentPerLevel;
			
			attrib.componentMask[c]    = 0 | (Math.pow(2, attrib.numBitsPerComponentPerLevel) - 1);
			attrib.componentMask[c]  <<= attrib.componentLeftShift[c];
		}
	}	
	
	var n = refinementBufferView.length;	
		
	var nc,
      writeTarget,
      baseIdx,
      idx;
		
	var component;
	
	//BEGIN STANDARD LOOP
	/*
	for (j = 0; j < m; ++j) {		
		attrib = attribArrays[j];
	
		nc		    = attrib.numComponents;
		writeTarget = attrib.bufferView;
		baseIdx		= 0;
		
		for (i = 0; i < n; ++i) {		
			dataChunk = refinementBufferView[i];
			
			for (c = 0; c < nc; ++c) {				
				component = dataChunk & attrib.componentMask[c];			
				
				component >>>= attrib.componentLeftShift[c];
				component  <<= attrib.precisionOffset;
							
				idx 			  = baseIdx + c;				
				writeTarget[idx] |= component;				
			}
			
			baseIdx += nc;
		}
	}
	
	//END STANDARD LOOP

	// BEGIN INLINED LOOP
	//{	
		//j = 0:
		attrib = attribArrays[0];
	
		nc		      = attrib.numComponents;
		writeTarget = attrib.bufferView;
		baseIdx		  = 0;
		
		for (i = 0; i < n; ++i) {		
			dataChunk = refinementBufferView[i];
			
			for (c = 0; c < nc; ++c) {
				component = dataChunk & attrib.componentMask[c];			
				
				component >>>= attrib.componentLeftShift[c];
				component  <<= attrib.precisionOffset;
				
				idx 			        = baseIdx + c;
				writeTarget[idx] |= component;
			}
			
			baseIdx += attrib.strideWriting;
		}
				
		//j = 1:
		attrib = attribArrays[1];
	
		nc		      = attrib.numComponents;
		writeTarget = attrib.bufferView;
		baseIdx		  = 0;
		
		for (i = 0; i < n; ++i) {	
			dataChunk = refinementBufferView[i];
			
			for (c = 0; c < nc; ++c) {
				component = dataChunk & attrib.componentMask[c];			
				
				component >>>= attrib.componentLeftShift[c];
				component  <<= attrib.precisionOffset;
				
				idx 			        = baseIdx + c;
				writeTarget[idx] |= component;
			}
			
			baseIdx += attrib.strideWriting;
		}		
	//}
	//END INLINED LOOP
*/
	//BEGIN OPTIMIZED LOOP
	//{		
		var writeTargetNor = attribArrays[0].bufferView;
		var writeTargetPos = attribArrays[1].bufferView;
		var norPrecOff	   = attribArrays[0].precisionOffset;
		var posPrecOff	   = attribArrays[1].precisionOffset;
		var idxNor   	     = 0;
		var idxPos   	     = 0;
    var norStrideWOff  = attribArrays[0].strideWriting - 2;
    var posStrideWOff  = attribArrays[1].strideWriting - 3;
		var n1, n2, p1, p2, p3;
		
		for (i = 0; i < n; ++i) {		
			dataChunk = refinementBufferView[i];
			
			n1   = (dataChunk & 0x80) >>> 7;
			n1 <<= norPrecOff;
			
			n2   = (dataChunk & 0x40) >>> 6;
			n2 <<= norPrecOff;
			
			writeTargetNor[idxNor++] |= n1;
			writeTargetNor[idxNor++] |= n2;
      
      idxNor += 4;
			
			p1   = (dataChunk & 0x30) >>> 4;
			p1 <<= posPrecOff; 
			
			p2   = (dataChunk & 0x0C) >>> 2;
			p2 <<= posPrecOff;
			
			p3 	 = (dataChunk & 0x03);
			p3 <<= posPrecOff;
			
			writeTargetPos[idxPos++] |= p1;
			writeTargetPos[idxPos++] |= p2;
			writeTargetPos[idxPos++] |= p3;
      
      idxPos += 3;
		}
	//}
	//END OPTIMIZED LOOP

	//renewed per call due to changing buffer ownership
	/*
  var attributeArrayBuffers = [];
	
	if (interleavedMode) {
		attributeArrayBuffers[0] = attribArrays[0].bufferView.buffer;
	}
	else {
		for (i = 0; i < attribArrays.length; ++i) {
			attributeArrayBuffers[i] = attribArrays[i].bufferView.buffer;		
		}
	}
	*/
  
	postMessage({msg  : 'decodeTime',
               time : (Date.now() - start)});
	
  if (true || refinementsDone === 7) {
    //send back the attribute buffer references
    postMessage(attribArrays[0].bufferView.buffer,
               [attribArrays[0].bufferView.buffer]);
    
    if (!interleavedMode) {
      postMessage(attribArrays[1].bufferView.buffer,
                  [attribArrays[1].bufferView.buffer]);
    }    
  }
  else {
    ++requestedRefinements;
  }
				 				 
	++refinementsDone;
}


/**
 * Handles an incoming message to the worker.
 */
onmessage = function(event) {
	var i, j;
	var attributeArrayBuffer;
	var numBitsPerElement;
	
  //COMMANDS
	if (event.data.cmd) {
  
		if (event.data.cmd === 'setAttributes') {
    
			if (!refinementsDone) {
				postMessage({msg 	     : 'workerSetUp',
                     timestamp : Date.now()});
			}
			
			for (i = 0; i < event.data.numAttributeComponents.length; ++i) {
				attribArrays[i] = new AttributeArray(event.data.numAttributeComponents[i],
													 event.data.numAttributeBitsPerComponent[i],
													 event.data.numAttributeBitsPerLevel[i] / event.data.numAttributeComponents[i],
													 event.data.attributeReadOffset[i]);

				strideReading += event.data.numAttributeBitsPerLevel[i];				
					
				if (event.data.attributeWriteOffset && event.data.strideWriting) {
					attribArrays[i].writeOffset   = event.data.attributeWriteOffset[i];					
					attribArrays[i].strideWriting = (event.data.strideWriting / attribArrays[i].numBitsPerComponent);
				}
			}
			
			//if the offset and stride parameters are given, assume a single, interleaved output array
			if (event.data.attributeWriteOffset && event.data.strideWriting) {
				interleavedMode = true;				
				strideWriting   = event.data.strideWriting;
			}
			
			//guess strideReading by checking the number of bits per refinement
		  //usually, we expect this to be an exact multiple of 8, as one doesn't
			//want to waste space in the encoded data
			strideReading = Math.ceil(strideReading / 8);
			
      refinementDataURLs = event.data.refinementDataURLs;
  
      for (i = 0; i < refinementDataURLs.length; ++i) {
        (function(idx) {
          var xhr = new XMLHttpRequest();
          
          xhr.onload = function(){
            refinementDataLoaded(xhr, idx);
          };
          
          xhr.open('GET', refinementDataURLs[i], true); //asynchronous
          xhr.responseType = 'arraybuffer';
          
          xhr.send(null);
        })(i);
      }
		}
  }
  //DATA
	else {
      ++requestedRefinements;
      	
      if (refinementsDone) {       
        //if this is not the first call, own the attribute array buffers
        for (i = 0; i < attribArrays.length; ++i) {
          //select buffer
          if (interleavedMode) {
            attributeArrayBuffer = event.data;
          }
          else {
            //@todo: what do we do now? :-P
            attributeArrayBuffer = event.data.attributeArrayBuffers[i];
          }
          
          //create views          
          var ArrayType;
        
          switch (attribArrays[i].numBitsPerComponent) {
            case 32 :
              ArrayType = Uint32Array;
              break;
            case 16 :
              ArrayType = Uint16Array;
              break;
            case 8 :
              ArrayType = Uint8Array;
              break;
            default:		
              postMessage('Unable to start refinement: no valid value (' + attribArrays[i].numBitsPerComponent +
                          ' instead of 1, 2 or 4) set for bytesPerComponent of attribute array ' + i + '.');
          }
          
          if (interleavedMode) {			
            attribArrays[i].bufferView = new ArrayType(attributeArrayBuffer, (attribArrays[i].writeOffset / 8));
          }
          else {
            attribArrays[i].bufferView = new ArrayType(attributeArrayBuffer);
          }
        }
      }
      
			tryNextRefinement();
	}
}


function refinementDataLoaded(xhr, l) {
  var i;
 
  switch (strideReading) {
    case 4 :
      refinementBufferViews[l] = new Uint32Array(xhr.response);
      break;
    case 2 :
      refinementBufferViews[l] = new Uint16Array(xhr.response);
      break;
    case 1 :
      refinementBufferViews[l] = new Uint8Array(xhr.response);
      break;
    default:		
      postMessage('Unable to start refinement: no valid value (' + attribArrays[i].numBitsPerComponent +
                  ' instead of 1, 2 or 4) set for bytesPerComponent of attribute array ' + i + '.');
  }
  
  availableRefinementLevels.push(l);
  availableRefinementLevels.sort(function(a, b){ return a - b; });
  
   
  if (!refinementsDone) {	
    for (i = 0; i < attribArrays.length; ++i) {  
      //create / select buffer
      if (interleavedMode) {        
        if (i === 0) {
          attributeArrayBuffer = new ArrayBuffer((strideWriting / 8) * refinementBufferViews[l].length);
        }
        else {
          attributeArrayBuffer = attribArrays[0].bufferView.buffer;
        }
      }
      else {
        numBitsPerElement    = attribArrays[i].numBitsPerComponent * attribArrays[i].numComponents;
        attributeArrayBuffer = new ArrayBuffer((numBitsPerElement / 8) * refinementBufferViews[l].length);
      }
      
      //create views          
      var ArrayType;
    
      switch (attribArrays[i].numBitsPerComponent) {
        case 32 :
          ArrayType = Uint32Array;
          break;
        case 16 :
          ArrayType = Uint16Array;
          break;
        case 8 :
          ArrayType = Uint8Array;
          break;
        default:		
          postMessage('Unable to start refinement: no valid value (' + attribArrays[i].numBitsPerComponent +
                      ' instead of 1, 2 or 4) set for bytesPerComponent of attribute array ' + i + '.');
      }
      
      if (interleavedMode) {			
        attribArrays[i].bufferView = new ArrayType(attributeArrayBuffer, (attribArrays[i].writeOffset / 8));
      }
      else {
        attribArrays[i].bufferView = new ArrayType(attributeArrayBuffer);
      }
    }
  }  
  
  tryNextRefinement();
}


function tryNextRefinement() {
  var nextLevel;
  
  if (requestedRefinements && availableRefinementLevels.length) {
    nextLevel = availableRefinementLevels.shift();
    --requestedRefinements;    
    refineAttributeData(nextLevel);    
  }
}
 