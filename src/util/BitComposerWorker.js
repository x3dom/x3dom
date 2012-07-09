//a small AttributeArray wrapper class
var AttributeArray = function(numComponents, bytesPerComponent, bitsPerRefinement,
							  offset, stride, arrayBuffer) {	
	this.numComponents 	   = numComponents;	
	this.bytesPerComponent = bytesPerComponent;	
	this.bitsPerRefinement = bitsPerRefinement;
	this.offset			   = offset;
	this.stride 		   = stride;
	this.refinedBits	   = 0;	
	this.refinementBuffers = [];
	
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
			bufferView = new Uint8Array(arrayBuffer);
			this.bufferView = arrayBuffer;
	}
}


//the list of registered attribute arrays
var attribArrays    = [];

//the number of refinements that have already been processed
var refinementsDone 		  = 0;
var availableRefinementLevels = 0;


/**
 * Registers an ArrayBuffer object which will be used for an attribute with the given index.
 * This passes the ownership of the ArrayBuffer object to the worker.
 * The ownership is returned by a message to the application each time the attribute array been
 * refined, see refineAttributeData(...).
 *
 * Parameters:
 *		attribIndex 	  - The index which will be used to indentify the attribute
 *		numComponents  	  - The number of components of each value, usually 1, 2, 3 or 4
 *		bytesPerComponent - The number of bytes per component, must be 1, 2 or 4
 *		arrayBuffer		  - The ArrayBuffer object which will be used for the attribute array
 */
function transferAttributeArray(attribIndex, numComponents, bytesPerComponent, bitsPerRefinement,
								offset, stride, arrayBuffer) {
	attribArrays[attribIndex] = new AttributeArray(numComponents, bytesPerComponent, bitsPerRefinement,
								offset, stride, arrayBuffer);
}


/**
 * Returns the ArrayBuffer corresponding to the attribute with the given index by sending a message
 * to the application. The buffer will be the first argument to the message receiver's callback,
 * denoted as 'attributeBuffer'.
 * For example, after registering a function as a message callback, you might receive data the following way:
 *
 *   > function messageFromWorker(event) {
 *	 >      if (event.data.attributeBuffer) {
 *	 >			var attributeBufferView   = new Uint32Array(event.data.attributeBuffer);
 *   >			//do something with the attribute buffer...
 *	 >		}
 *   > }
 *
 * Parameters:
 *		attribIndex - The index which will be used to indentify the attribute
 * 
 */
function returnAttributeArray(attribIndex) {
	postMessage({attributeBuffer : attribArrays[attribIndex].arrayBuffer},
				[attribArrays[attribIndex].arrayBuffer]);
}


/**
 * Refines the content of the attribute array with the given index, using the given ArrayBuffer.
 * The new bits will used instead of the most significant undefined (zero) bits in the registered
 * attribute array.
 * After refinement, the worker sends a message which returns the reference and ownership to the given
 * ArrayBuffer to the application. The buffer will be the first argument to the message receiver's callback,
 * denoted as 'refinementBuffer'.
 * For example, after registering a function as a message callback, you might receive data the following way:
 *
 *   > function messageFromWorker(event) {
 *	 >      if (event.data.refinementBuffer) {
 *	 >			var refinementBufferView   = new Uint8Array(event.data.refinementBuffer);
 *   >			//do something else with the refinement buffer...
 *	 >		}
 *   > }
 *
 * Note that the number of bits within the data chunk of a given attribute must be divisible by
 * the number of its components. You might for example use 6 bits to refine an attribute with three
 * components (e.g. x,y,z), but not to refine one with four components (e.g. x,y,z,w).
 *
 * With the use of the offset and stride parameters, interweaved data arrays, containing data of
 * several attributes at each index, can be used. Each element of the array will then consist of
 * [stride] bytes, where the data chunk of [numBits] bits for each attribute is located at the given
 * offset within the element.
 *
 * Parameters:
 *		attribIndex - The index of the attribute
 *		numBits		- The number of bits of the attribute. Must be divisible by the attribute's number of components
 *		offset		- The bit offset of the attribute inside each part of the buffer
 *		stride 		- The byte offset between consecutive values of the attribute inside the buffer, must be 1, 2 or 4
 *		buffer		- The ArrayBuffer object which contains data used for refinement
 *
 */
function refineAttributeData(attribIndex, refinementBuffer) {
	if (refinementsDone >= availableRefinementLevels)
		return;
		
	//@todo: Check parameters!
	//...
	
	//@todo: if it works, check if converting some bitops to *2, /2 or + ops gives better performance,
	//		 as, according to 'Javascript. The Good Parts.', the internal format is always 'double'
	
	var attrib			= attribArrays[attribIndex];
	var attribArrayView = attrib.bufferView;
	
	//depending on the size of each element, we have to pick a matching view on the ArrayBuffer
	var refinementBufferView;	
	
	switch (attrib.stride) {
		case 4	:
			refinementBufferView = new Uint32Array(refinementBuffer);
			break;
		case 2	:
			refinementBufferView = new Uint16Array(refinementBuffer);
			break;
		case 1	:
		default :
			refinementBufferView = new Uint8Array(refinementBuffer);
	}
	
	var c;
	
	//generate bitmasks which will be used during data extraction
	var componentMask  = [];
	var componentShift = [];
	
	var newBitsPerComponent = attrib.bitsPerRefinement / attrib.numComponents;
	
	for (c = 0; c < attrib.numComponents; ++c) {
		componentShift[c] 	= (attrib.numComponents - 1 - c) * newBitsPerComponent;
		componentMask[c] 	= 0x00000000 | (Math.pow(2, newBitsPerComponent) - 1);
		componentMask[c]  <<= componentShift[c];
	}
	
	var dataChunk;
	var chunkComponents 	= [];
	var refinedBits 		= refinementsDone * attrib.bitsPerRefinement;	
	var rightShift 			= (attrib.stride * 8) - attrib.offset - attrib.bitsPerRefinement;
	var leftShift			= (attrib.bytesPerComponent * 8) - newBitsPerComponent - refinedBits;
	
	var baseIdx = 0;
	var i;
	
	for (i = 0; i < refinementBufferView.length; ++i) {	
		//extract refinement data chunk for the corresponding attribute
		dataChunk    = 0x00000000 | refinementBufferView[i];
		dataChunk >>>= rightShift;
		
		//extract and apply all components of the data chunk		
		for (c = 0; c < attrib.numComponents; ++c) {			
			chunkComponents[c] = dataChunk & componentMask[c];
			
			//shift component to the matching position
			chunkComponents[c] >>>= componentShift[c];
			chunkComponents[c]  <<= leftShift;			
			
			//add data chunk to achieve a refinement			
			attribArrayView[baseIdx + c] |= chunkComponents[c];
		}
		
		baseIdx += attrib.numComponents;
	}
	
	postMessage({msg			 : 'refinementDone',
				 lvl		     : refinementsDone,
				 attributeBuffer : attribArrayView.buffer},
				 [attribArrayView.buffer]);
				 				 
	++refinementsDone;	
}


/**
 * Message receiver method for the worker.
 * To invoke a function of the worker, specify its name as a 'cmd' member of your JSON object which is
 * transmitted as the message content. As required for transferable objects within messages, ArrayBuffers
 * must be passed within the second argument within an array.
 *
 * Example 1: A call to
 *
 *				refineAttributeData(1, 2, 6, 1, buffer) 
 *
 * 			  is transmitted as a message with
 *
 *				postMessage({cmd 		 : 'refineAttributeData',
 *							 attribIndex : 1,
 *							 numBits	 : 2,
 *							 offset		 : 6,
 *							 stride		 : 1,
 *							 arrayBuffer : myBuffer},
 *							 [myBuffer]);
 */
onmessage = function(event) {
	switch (event.data.cmd) {
		case 'transferAttributeArray':
			transferAttributeArray(event.data.attribIndex,
								   event.data.numComponents,
								   event.data.bytesPerComponent,
								   event.data.bitsPerRefinement,
								   event.data.offset,
								   event.data.stride,
								   event.data.arrayBuffer);
			break;
			
		case 'transferRefinementData':
			attribArrays[event.data.attribIndex].refinementBuffers[event.data.level] = event.data.arrayBuffer;
			++availableRefinementLevels;
			break;
			
		case 'refine':
			refineAttributeData(0, attribArrays[0].refinementBuffers[refinementsDone]);
			break;
	}	
}
