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
	this.componentMask   			 = [];
	this.componentShift  			 = [];
	
	var c;
	for (c = 0; c < this.numComponents; ++c) {
		this.componentShift[c] 	 = (this.numComponents - 1 - c) * this.numBitsPerComponentPerLevel;
		this.componentMask[c] 	 = 0x00000000 | (Math.pow(2, this.numBitsPerComponentPerLevel) - 1);
		this.componentMask[c]  <<= this.componentShift[c];
	}
	
	//---------------------------------
	//dynamic refinement information
	this.rightShift 	 = 0;
	this.leftShift 	     = 0;
	this.baseIdx 		 = 0;
	this.shiftedChunk	 = 0;
	this.chunkComponents = [];
	
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
	
	var i, c, attrib;
	var dataChunk;
	
	for (i = 0; i < attribArrays.length; ++i) {
		attrib		  	  = attribArrays[i];
		
		attrib.rightShift = strideReading * 8 - attrib.readOffset - attrib.numBitsPerComponentPerLevel * attrib.numComponents;	
		attrib.leftShift  = attrib.numBitsPerComponent - attrib.numBitsPerComponentPerLevel -
							(refinementsDone * attrib.numBitsPerComponentPerLevel);
		attrib.baseIdx	  = 0;
	}
	
	for (i = 0; i < refinementBufferView.length; ++i) {		
		//extract refinement data chunk as 32 bit data
		dataChunk = 0x00000000 | refinementBufferView[i];
		
		//apply data chunk to all attribute arrays
		for (j = 0; j < attribArrays.length; ++j) {
			attrib = attribArrays[j];
			
			attrib.shiftedChunk = dataChunk >>> attrib.rightShift;
		
			for (c = 0; c < attrib.numComponents; ++c) {		
				attrib.chunkComponents[c] = attrib.shiftedChunk & attrib.componentMask[c];			
				
				attrib.chunkComponents[c] >>>= attrib.componentShift[c];
				attrib.chunkComponents[c]  <<= attrib.leftShift;
								
				attrib.bufferView[attrib.baseIdx + c] |= attrib.chunkComponents[c];			
			}
			
			attrib.baseIdx += attrib.numComponents;
		}
	}
	
	//renewed per call due to changing buffer ownership
	var attributeArrayBuffers = [];
		
	for (i = 0; i < attribArrays.length; ++i) {
		attributeArrayBuffers[i] = attribArrays[i].bufferView.buffer;		
	}
	
	//send back the attribute buffer references
	postMessage({msg			  	   : 'refinementDone',
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
	var numBytesPerElement;
	
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
								numBytesPerElement = 0;
								for (j = 0; j < attribArrays.length; ++j) {
									numBytesPerElement += attribArrays[i].numBitsPerComponent * attribArrays[i].numComponents;									
								}
								
								attributeArrayBuffer = new ArrayBuffer(numBytesPerElement * refinementBufferViews[refinementsDone].length);
							}
							else {
								attributeArrayBuffer = attribArrays[0].bufferView.buffer;
							}
						}
						else {
							numBytesPerElement   = attribArrays[i].numBitsPerComponent * attribArrays[i].numComponents;
							attributeArrayBuffer = new ArrayBuffer(numBytesPerElement * refinementBufferViews[refinementsDone].length);
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
