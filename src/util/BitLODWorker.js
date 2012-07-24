BlobBuilder = (typeof BlobBuilder !== 'undefined') ? BlobBuilder : 
			  (typeof WebKitBlobBuilder !== 'undefined') ? WebKitBlobBuilder : 
			  (typeof MozBlobBuilder !== 'undefined') ? MozBlobBuilder : undefined;

URL = (typeof URL !== 'undefined') ? URL : 
	  (typeof webkitURL !== ' undefined') ? webkitURL : undefined;



x3dom.BitLODWorker = function()
{
	//flag for interleaved encoding - if this is true, each AttributeArray's bufferView
  //members will refer to the same buffer, but use different offsets in their view
  this.interleavedMode = false;


  //list of registered attribute arrays
  this.attribArrays = [];


  //views on the refinement buffers
  this.refinementBufferViews = [];


  //size in bytes of a single element of the refinement buffers
  this.strideReading = 0;


  //size in bytes of a single element of the interleaved output buffer, if any
  this.strideWriting = 0;


  this.refinementDataURLs = 0;


  this.availableRefinementLevels = [];


  //number of refinements that have already been processed
  this.refinementsDone = 0;


  this.requestedRefinements = 0;
  
};

/**
 * Refines the data stored in the registered attribute arrays, using the given refinement buffer.
 * Once the refinement is done, a message containing a JSON object with the 'msg' member value set
 * to 'refinementDone' is sent to the connected application. Additionally, the JSON object will
 * contain a reference to the attributes' ArrayBuffer objects (attributeArrayBuffers), meaning that
 * the worker looses the ownership of those buffers until they are re-transferred for the next refinement.
 */
x3dom.BitLODWorker.prototype.refineAttributeData = function (level) 
{
	var start = Date.now();
	
	var refinementBufferView = refinementBufferViews[level];
  
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

	//BEGIN OPTIMIZED LOOP
	//{		
  /*
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
  */
	//}
	//END OPTIMIZED LOOP

	postMessage({msg  : 'decodeTime',
               time : (Date.now() - start)});
                   
  //send back the attribute buffer references
  postMessage(attribArrays[0].bufferView.buffer,
             [attribArrays[0].bufferView.buffer]);
  			 				 
	++refinementsDone;	
};

/**
 * Handles an incoming message to the worker. Currently, the worker reacts on three different message types,
 * the command of choice can be specified as a string within the 'cmd' member of the transmitted JSON object.
 * The three possible values of this member are 'setAttributes', 'transferRefinementData' and 'refine'.
 * The commands and their arguments, specified as attributes of the transmitted JSON objects, are listed below.
 *
 * Please remember to send ArrayBuffer objects according to the rules for transferables, i.e. in the form
 * > postMessage({cmd: 'myCommand' , ... , arrayBuffer: myBuffer }, [myBuffer]);
 *
 * setAttributes: {attribIndex, numAttributeComponents, numAttributeBitsPerComponent, numAttributeBitsPerLevel, attributeOffset}
 *		Register attributes inside the worker and specify some information about them.
 *		The 'numAttributeBitsPerLevel' and 'offset' parameters provide information about the storage format of	the attributes'
 *		refinement data within the refinement buffers.
 *
 * transferRefinementData: {level, arrayBuffer}
 *		Sends a reference to the refinement data buffer at the given level to the worker.
 *
 * refine: {attributeBuffers}
 *		Continues refinement, using the given attribute arrays. This passes each attribute array's ownership back to the worker.
 *
 * Although refinement data can be set in any random order, the next refinement which is processed when calling 'refine' will
 * always be the lowest unprocessed level. If such a level has not been set up, e.g. if levels 0,1 and 3 have been set up and
 * level 2 is the lowest unprocessed level, the 'refine' function will post an error message.
 */
x3dom.BitLODWorker.prototype.onmessage = function(event) {
	var i, j;
	var attributeArrayBuffer;
	var numBitsPerElement;
	
  //COMMANDS
	if (event.data.cmd !== undefined) {
  
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

			interleavedMode = true;				
			strideWriting   = event.data.strideWriting;
			
			//guess strideReading by checking the number of bits per refinement
		  //usually, we expect this to be an exact multiple of 8, as one doesn't
			//want to waste space in the encoded data
			strideReading = Math.ceil(strideReading / 8);
		}
  }
  //DATA
	else {      
      //refinement data
      if (event.data.level !== undefined) {
        refinementDataLoaded(event.data.buffer, event.data.level);
      }
      //attribute data
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
                postMessage({msg  : 'log',
                             text : 'Unable to start refinement: no valid value (' + attribArrays[i].numBitsPerComponent +
                                    ' instead of 1, 2 or 4) set for bytesPerComponent of attribute array ' + i + '.'});
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
};


x3dom.BitLODWorker.prototype.refinementDataLoaded = function(buffer, l) {
  var i;
 
  switch (strideReading) {
    case 4 :
      refinementBufferViews[l] = new Uint32Array(buffer);
      break;
    case 2 :
      refinementBufferViews[l] = new Uint16Array(buffer);
      break;
    case 1 :
      refinementBufferViews[l] = new Uint8Array(buffer);
      break;
    default:		
      postMessage({msg  : 'log',
                   text : 'Unable to start refinement: no valid value (' + attribArrays[i].numBitsPerComponent +
                          ' instead of 1, 2 or 4) set for bytesPerComponent of attribute array ' + i + '.'});
  }
  
  availableRefinementLevels.push(l);
  availableRefinementLevels.sort(function(a, b){ return a - b; });
     
  if (!refinementsDone) {	
    for (i = 0; i < attribArrays.length; ++i) {  
      //create / select buffer      
      if (i === 0) {
        attributeArrayBuffer = new ArrayBuffer((strideWriting / 8) * refinementBufferViews[l].length);
      }
      else {
        attributeArrayBuffer = attribArrays[0].bufferView.buffer;
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
          postMessage({msg  : 'log',
                       text : 'Unable to start refinement: no valid value (' + attribArrays[i].numBitsPerComponent +
                              ' instead of 1, 2 or 4) set for bytesPerComponent of attribute array ' + i + '.'});
      }
      
      attribArrays[i].bufferView = new ArrayType(attributeArrayBuffer, (attribArrays[i].writeOffset / 8));      
    }
  }  
  
  tryNextRefinement();
}


x3dom.BitLODWorker.prototype.tryNextRefinement = function() {
  var nextLevel;
  
  if (requestedRefinements && availableRefinementLevels.length) {
    nextLevel = availableRefinementLevels.shift();
    --requestedRefinements;
                
    refineAttributeData(nextLevel);    
  }
}


//a small AttributeArray wrapper class
x3dom.BitLODWorker.prototype.AttributeArray = function(numComponents, numBitsPerComponent, numBitsPerComponentPerLevel, readOffset) {
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
};


x3dom.BitLODWorker.prototype.toBlob = function ()
{
	var str = '';
  
    str += 'postMessage = (typeof webkitPostMessage !== "undefined") ? webkitPostMessage : postMessage;\n';

    for (var p in this)
	{
		if(this[p] != x3dom.BitLODWorker.prototype.toBlob)
		{
			str += p + ' = ';
			
			if (this[p] instanceof String) 
			{
			  str += '"' + this[p] + '"';
			}
			else if (this[p] instanceof Array)
			{
				str += "[];\n";
			}
			else 
			{
			  str += this[p] + ';\n';
			}
		}
    }
  
	var bb = new BlobBuilder();
	bb.append(str);
	
	return URL.createObjectURL(bb.getBlob());
};
