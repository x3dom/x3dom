//a small AttributeArray wrapper class
var AttributeArray = function(numComponents, numBitsPerComponent, numBitsPerComponentPerLevel, readOffset) {
	//---------------------------------
	//static general information
	this.numComponents 	   	 = numComponents;	
	this.numBitsPerComponent = numBitsPerComponent	
	this.strideWriting		 = numComponents; //default value, gets changed for interleaved data
	//this.writeOffset set on demand
		
	//---------------------------------
	//static refinement information
	this.numBitsPerComponentPerLevel = numBitsPerComponentPerLevel;
	this.readOffset	     			 = readOffset;	
	
	//---------------------------------
	//dynamic refinement information
	this.componentMask   	 = [];
	this.componentLeftShift  = [];
	this.precisionOffset 	     = 0;
	
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


//number of refinements that have already been processed
var refinementsDone = 0;


/**
 * Refines the data stored in the registered attribute arrays, using the given refinement buffer.
 * Once the refinement is done, a message containing a JSON object with the 'msg' member value set
 * to 'refinementDone' is sent to the connected application. Additionally, the JSON object will
 * contain a reference to the attributes' ArrayBuffer objects (attributeArrayBuffers), meaning that
 * the worker looses the ownership of those buffers until they are re-transferred for the next refinement.
 */
function refineAttributeData(refinementBufferView) {
	var start = Date.now();
	
	var i, c, nc, attrib, attributeLeftShift;
	var dataChunk;
	
	var m = attribArrays.length;
	
	for (i = m; i--; ) {
		attrib = attribArrays[i];
		nc	   = attrib.numComponents;
		
		attributeLeftShift 	   = (strideReading * 8) - attrib.readOffset - attrib.numBitsPerComponentPerLevel * nc;	
		attrib.precisionOffset = attrib.numBitsPerComponent - attrib.numBitsPerComponentPerLevel -
								 (refinementsDone * attrib.numBitsPerComponentPerLevel);
							
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
	*/
	//END STANDARD LOOP
/*
	// BEGIN INLINED LOOP
	//{	
		//j = 0:
		attrib = attribArrays[0];
	
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
			
			baseIdx += attrib.strideWriting;
		}
				
		//j = 1:
		attrib = attribArrays[1];
	
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
		var idxNor   	   = 0;
		var idxPos   	   = 0;
		
		var n1, n2, p1, p2, p3;
		
		for (i = 0; i < n; ++i) {		
			dataChunk = refinementBufferView[i];
			
			n1   = (dataChunk & 0x80) >>> 7;
			n1 <<= norPrecOff;
			
			n2   = (dataChunk & 0x40) >>> 6;
			n2 <<= norPrecOff;
			
			writeTargetNor[idxNor++] |= n1;
			writeTargetNor[idxNor++] |= n2;
			
			p1   = (dataChunk & 0x30) >>> 4;
			p1 <<= posPrecOff; 
			
			p2   = (dataChunk & 0x0C) >>> 2;
			p2 <<= posPrecOff;
			
			p3 	 = (dataChunk & 0x03);
			p3 <<= posPrecOff;
			
			writeTargetPos[idxPos++] |= p1;
			writeTargetPos[idxPos++] |= p2;
			writeTargetPos[idxPos++] |= p3;
		}
	//}
	//END OPTIMIZED LOOP

	//renewed per call due to changing buffer ownership
	var attributeArrayBuffers = [];
	
	if (interleavedMode) {
		attributeArrayBuffers[0] = attribArrays[0].bufferView.buffer;
	}
	else {
		for (i = 0; i < attribArrays.length; ++i) {
			attributeArrayBuffers[i] = attribArrays[i].bufferView.buffer;		
		}
	}
	
	postMessage({msg  : 'decodeTime',
               time : (Date.now() - start)});
	
	//send back the attribute buffer references
	postMessage({msg			  	         : 'refinementDone',
               attributeArrayBuffers : attributeArrayBuffers},
               attributeArrayBuffers);
				 				 
	++refinementsDone;	
}


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
onmessage = function(event) {
	var i, j;
	var attributeArrayBuffer;
	var numBitsPerElement;
	
	switch (event.data.cmd) {
		case 'setAttributes':
			if (!refinementsDone) {
				postMessage({msg 	   : 'workerSetUp',
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
			
			break;
			
		case 'transferRefinementData':
			switch (strideReading) {
				case 4 :
					refinementBufferViews[event.data.level] = new Uint32Array(event.data.arrayBuffer);
					break;
				case 2 :
					refinementBufferViews[event.data.level] = new Uint16Array(event.data.arrayBuffer);
					break;
				case 1 :
					refinementBufferViews[event.data.level] = new Uint8Array(event.data.arrayBuffer);
					break;
				default:
					postMessage('Refinement data not accepted: strideReading was found to be ' + strideReading +
								' bytes, but must be set to 1, 2 or 4 before transferring refinement data.');
			}
			break;

		case 'refine':
			if (refinementsDone < refinementBufferViews.length && refinementBufferViews[refinementsDone]) {
				
				for (i = 0; i < attribArrays.length; ++i) {				
					//if this is the first call, create the attribute array buffers
					if (!refinementsDone) {						
						if (interleavedMode) {
							if (i === 0) {
								attributeArrayBuffer = new ArrayBuffer((strideWriting / 8) * refinementBufferViews[0].length);
							}
							else {
								attributeArrayBuffer = attribArrays[0].bufferView.buffer;
							}
						}						
						else {
							numBitsPerElement    = attribArrays[i].numBitsPerComponent * attribArrays[i].numComponents;
							attributeArrayBuffer = new ArrayBuffer((numBitsPerElement / 8) * refinementBufferViews[0].length);
						}
					}
					else {
						if (interleavedMode) {
							attributeArrayBuffer = event.data.attributeArrayBuffers[0];
						}
						else {
							attributeArrayBuffer = event.data.attributeArrayBuffers[i];
						}
					}
					
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
										+ ' instead of 1, 2 or 4) set for bytesPerComponent of attribute array ' + i + '.');
					}
					
					if (interleavedMode) {			
						attribArrays[i].bufferView = new ArrayType(attributeArrayBuffer, (attribArrays[i].writeOffset / 8));
					}
					else {
						attribArrays[i].bufferView = new ArrayType(attributeArrayBuffer);
					}
				}
				
				refineAttributeData(refinementBufferViews[refinementsDone]);				
				
			} else {
				postMessage('Cannot process refinement: No refinement data loaded for the requested level ' + refinementsDone + '!');
			}
			break;
	}
}
