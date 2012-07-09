//a small AttributeArray wrapper class
var AttributeArray = function(numComponents, bytesPerComponent, bitsPerRefinement,
							  offset, arrayBuffer) {
	//---------------------------------
	//static general information
	this.numComponents 	   = numComponents;	
	this.bytesPerComponent = bytesPerComponent;	
	//@todo: throw error if bytesPerComponent is no valid number	
	switch (this.bytesPerComponent) {
		case 4	:
			this.bufferView = new Uint32Array(arrayBuffer);
			break;
		case 2	:
			this.bufferView = new Uint16Array(arrayBuffer);
			break;
		case 1	:		
		default :		
			this.bufferView = new Uint8Array(arrayBuffer);
	}
	
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


//the list of registered attribute arrays
var attribArrays    = [];

//the number of refinements that have already been processed
var refinementsDone 		  = 0;

var refinementBufferViews	  = [];

var stride;


/** 
 */
function transferAttributeArray(attribIndex, numComponents, bytesPerComponent, bitsPerRefinement,
								offset, arrayBuffer) {								
	attribArrays[attribIndex] = new AttributeArray(numComponents, bytesPerComponent, bitsPerRefinement,
												   offset, arrayBuffer);
}


/**
 * 
 */
function returnAttributeArray(attribIndex) {
	postMessage({attributeBuffer : attribArrays[attribIndex].arrayBuffer},
				[attribArrays[attribIndex].arrayBuffer]);
}


/** 
 */
function refineAttributeData(refinementBufferView) {
	
	if (refinementsDone >= refinementBufferViews.length)
		return;
		
	//@todo: Check parameters!
	//...
	
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
			
			//extract and apply all component data of the attribute	
			for (c = 0; c < attrib.numComponents; ++c) {		
				attrib.chunkComponents[c] = attrib.shiftedChunk & attrib.componentMask[c];			
				
				//shift component to the matching position
				attrib.chunkComponents[c] >>>= attrib.componentShift[c];
				attrib.chunkComponents[c]  <<= attrib.leftShift;
				
				//add data chunk to achieve a refinement
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
 *
 */
onmessage = function(event) {
	switch (event.data.cmd) {
		case 'transferAttributeArray':
			transferAttributeArray(event.data.attribIndex,
			
								   event.data.numComponents,
								   event.data.bytesPerComponent,
								   event.data.bitsPerRefinement,
								   event.data.offset,
								   
								   event.data.arrayBuffer);
			break;
			
		case 'transferRefinementData':			
			stride = event.data.stride;

			switch (stride) {
				case 4	:
					refinementBufferViews[event.data.level] = new Uint32Array(event.data.arrayBuffer);
					break;
				case 2	:
					refinementBufferViews[event.data.level] = new Uint16Array(event.data.arrayBuffer);
					break;
				case 1	:
				default :
					refinementBufferViews[event.data.level] = new Uint8Array(event.data.arrayBuffer);
			}
	
			break;
			
		case 'refine':
			refineAttributeData(refinementBufferViews[refinementsDone]);
			break;
	}	
}
