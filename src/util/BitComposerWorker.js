//a small AttributeArray wrapper class
var AttributeArray = function(numComponents, bytesPerComponent, bitsPerRefinement, offset) {
	//---------------------------------
	//static general information
	this.numComponents 	   = numComponents;	
	this.bytesPerComponent = bytesPerComponent;	
	
	//---------------------------------
	//static refinement information
	this.bitsPerRefinement = bitsPerRefinement;
	this.offset			   = offset;
	this.componentMask     = [];
	this.componentShift    = [];
	
	var c;
	for (c = 0; c < this.numComponents; ++c) {
		this.componentShift[c] 	 = (this.numComponents - 1 - c) * this.bitsPerRefinement;
		this.componentMask[c] 	 = 0x00000000 | (Math.pow(2, this.bitsPerRefinement) - 1);
		this.componentMask[c]  <<= this.componentShift[c];
	}
	
	//---------------------------------
	//dynamic refinement information
	this.rightShift 	 = 0;
	this.leftShift 	     = 0;
	this.baseIdx 		 = 0;
	this.shiftedChunk	 = 0;
	this.chunkComponents = [];
}


//list of registered attribute arrays
var attribArrays = [];


//views on the refinement buffers
var refinementBufferViews = [];


//size of a single element within the refinement buffers
var stride = 0;


//number of refinements that have already been processed
var refinementsDone = 0;


/**
 * Refines the data stored in the registered attribute arrays, using the given refinement buffer.
 */
function refineAttributeData(refinementBufferView) {
	//@todo: if it works, check if converting some bitops to *2, /2 or + ops gives better performance,
	//		 as, according to 'Javascript. The Good Parts.', the internal format is always 'double'
	
	var i, c, attrib;
	var dataChunk;
	
	for (i = 0; i < attribArrays.length; ++i) {
		attrib		  	  = attribArrays[i];
		
		attrib.rightShift = stride * 8 - attrib.offset - attrib.bitsPerRefinement * attrib.numComponents;	
		attrib.leftShift  = (attrib.bytesPerComponent * 8) - attrib.bitsPerRefinement -
							(refinementsDone * attrib.bitsPerRefinement);
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
	var attribBuffers = [];
	for (i = 0; i < attribArrays.length; ++i) {
		attribBuffers[i] = attribArrays[i].bufferView.buffer;		
	}
	
	//send back the attribute buffer references
	postMessage({msg			  : 'refinementDone',
				 lvl		      : refinementsDone,
				 attributeBuffers : attribBuffers},
				 attribBuffers);
				 				 
	++refinementsDone;	
}


/**
 * Handles an incoming message to the worker. Currently, the worker reacts on three different message types,
 * the command of choice can be specified as a string within the 'cmd' member of the transmitted JSON object.
 * The three possible values of this member are 'setAttributes', 'transferRefinementData' and 'refine'.
 * The commands and their arguments, specified as attributes of the transmitted JSON objects, are listed below.
 *
 * Please remember to send transferable ArrayBuffer objects according to the rules, i.e. in the form
 * > postMessage({cmd: 'myCommand' , ... , arrayBuffer: myBuffer }, [myBuffer]);
 *
 * setAttributes: {attribIndex, numComponents, bytesPerComponent, bitsPerRefinement, offset}
 *		Register attributes inside the worker and specify some information about them.
 *		The 'bitsPerRefinement' and 'offset' parameters provide information about the storage format of	the attributes'
 *		refinement data within the refinement buffers.
 *
 * transferRefinementData: {stride, level, arrayBuffer}
 *		Sends a reference to the refinement data buffer at the given level to the worker. 'stride' should be equal for
 *		all calls to this function, specifiying the length of a refinement data element in bytes.
 *
 * refine: {attributeBuffers}
 *		Continues refinement, using the given attribute arrays. This passes each attribute array's ownership back to the worker.
 *
 * Although refinement data can be set in any random order, the next refinement which is processed when calling 'refine' will
 * always be the lowest unprocessed level. If such a level has not been set up, e.g. if levels 0,1 and 3 have been set up and
 * level is the lowest unprocessed level, the 'refine' function won't do anything.
 */
onmessage = function(event) {
	switch (event.data.cmd) {
		case 'setAttributes':
			var i;
			for (i = 0; i < event.data.numComponents.length; ++i) {
				attribArrays[i] = new AttributeArray(event.data.numComponents[i],
													 event.data.bytesPerComponent[i],
													 event.data.bitsPerRefinement[i],
													 event.data.offset[i]);				 
			}
			stride = event.data.stride;			
			break;
			
		case 'transferRefinementData':
			switch (stride) {
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
					postMessage('Refinement data not accepted: stride is ' + stride +
								', but must be set to 1, 2 or 4 before transferring refinement data.');
			}
			break;
			
		case 'refine':
			if (refinementsDone < refinementBufferViews.length && refinementBufferViews[refinementsDone]) {
				for (i = 0; i < attribArrays.length; ++i) {				
					switch (attribArrays[i].bytesPerComponent) {						
						case 4 :
							attribArrays[i].bufferView = new Uint32Array(event.data.attributeBuffers[i]);
							break;
						case 2 :
							attribArrays[i].bufferView = new Uint16Array(event.data.attributeBuffers[i]);
							break;
						case 1 :
							attribArrays[i].bufferView = new Uint8Array(event.data.attributeBuffers[i]);
							break;
						default:		
							postMessage('Unable to start refinement: no valid value (' + attribArrays[i].bytesPerComponent +
										+ ' instead of 1, 2 or 4) set for bytesPerComponent of attribute array ' + i + '.');
					}
				}
				refineAttributeData(refinementBufferViews[refinementsDone]);				
			}
			break;
	}
}
