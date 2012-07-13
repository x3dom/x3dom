//a small AttributeArray wrapper class
var AttributeArray = function(numComponents, numBitsPerComponent, numBitsPerComponentPerLevel, readOffset) {
	//---------------------------------
	//static general information
	this.numComponents 	   	 = numComponents;	
	this.numBitsPerComponent = numBitsPerComponent;	
	
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
	//@todo: if it works, check if converting some bitops to *2, /2 or + ops gives better performance,
	//		 as, according to 'Javascript. The Good Parts.', the internal format is always 'double'
	
	var start = new Date();
	
	var i, c, nc, attrib, attributeLeftShift;
	var dataChunk;
	
	var m = attribArrays.length;
	
	for (i = 0; i < m; ++i) {
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
			
			baseIdx += nc;
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
			
			baseIdx += nc;
		}		
	//}
	//END INLINED LOOP	
	
	//renewed per call due to changing buffer ownership
	var attributeArrayBuffers = [];
		
	for (i = 0; i < attribArrays.length; ++i) {
		attributeArrayBuffers[i] = attribArrays[i].bufferView.buffer;		
	}
	
	//send back the attribute buffer references
	postMessage({msg			  	   : 'refinementDone',
				 attributeArrayBuffers : attributeArrayBuffers},
				 attributeArrayBuffers);
				 
	postMessage('I needed ' + ((new Date()) - start) + ' ms to do the job!');
				 				 
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
			for (i = 0; i < event.data.numAttributeComponents.length; ++i) {
				attribArrays[i] = new AttributeArray(event.data.numAttributeComponents[i],
													 event.data.numAttributeBitsPerComponent[i],
													 event.data.numAttributeBitsPerLevel[i] / event.data.numAttributeComponents[i],
													 event.data.attributeReadOffset[i]);
													 
				strideReading += event.data.numAttributeBitsPerLevel[i];
			}
			
			//if the offset and stride parameters are given, assume a single, interleaved output array
			if (event.data.offset && event.data.stride) {
				interleavedMode = true;
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
							//in interleaved mode, all attributeArrays refer to the same buffer
							if (i === 0) {
								numBitsPerElement = 0;
								for (j = 0; j < attribArrays.length; ++j) {
									numBitsPerElement += attribArrays[i].numBitsPerComponent * attribArrays[i].numComponents;
								}
								
								attributeArrayBuffer = new ArrayBuffer((numBitsPerElement / 8) * refinementBufferViews[refinementsDone].length);
							}
							else {
								attributeArrayBuffer = attribArrays[0].bufferView.buffer;
							}
						}
						else {
							numBitsPerElement    = attribArrays[i].numBitsPerComponent * attribArrays[i].numComponents;
							attributeArrayBuffer = new ArrayBuffer((numBitsPerElement / 8) * refinementBufferViews[refinementsDone].length);
						}
					}
					else {
						attributeArrayBuffer = event.data.attributeArrayBuffers[i];
					}
					
					switch (attribArrays[i].numBitsPerComponent) {						
						case 32 :
							attribArrays[i].bufferView = new Uint32Array(attributeArrayBuffer);
							break;
						case 16 :
							attribArrays[i].bufferView = new Uint16Array(attributeArrayBuffer);
							break;
						case 8 :
							attribArrays[i].bufferView = new Uint8Array(attributeArrayBuffer);
							break;
						default:		
							postMessage('Unable to start refinement: no valid value (' + attribArrays[i].numBitsPerComponent +
										+ ' instead of 1, 2 or 4) set for bytesPerComponent of attribute array ' + i + '.');
					}
				}
				refineAttributeData(refinementBufferViews[refinementsDone]);				
			} else {
				postMessage('Cannot process refinement: No refinement data loaded for the requested level ' + refinementsDone + '!');
			}
			break;
	}
}
