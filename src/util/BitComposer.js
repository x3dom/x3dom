/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */
 
 
 //begin hack
 var x3dom = {};
 
 x3dom.debug = {};
 x3dom.debug.logError = function(msg) {
	console.log(msg);
 };
 //end hack
 
 
 /**
  * This class does three things:
  *		- host a background WebWorker which performs the bitwise composition
  *		- wrap the message interface which is used to communicate with the worker
  *		- automatically provide the worker with refinement data in the correct order,
  *		  by utilizing the x3dom.DownloadManager
  *  todo: refactor attributeBuffers / attributeArrayBuffers and other variable names
  *
  */
 x3dom.BitComposer = function() {
	var self = this;
	this.worker = new Worker('BitComposerWorker.js');	
	this.worker.addEventListener('message', function(event){return self.messageFromWorker(event);}, false);
	
	this.refinementCallback = {};
 };
 
 
 x3dom.BitComposer.prototype.messageFromWorker = function(event) {
	//@todo: this is debug code!
	//this.refinementCallback();
	//message: refinement done
	if (event.data.msg == 'refinementDone') {
		console.log('-----------------------------------------------------------------------');
		console.log('Message received: Refinement done for level ' + event.data.lvl);
		
		var normalBuffer = new Uint8Array(event.data.attributeBuffers[0]);
		var coordBuffer  = new Uint16Array(event.data.attributeBuffers[1]);
				
		console.log('Returned attribute buffers:');
		console.log('Coords:');
		printBuffer(coordBuffer, 16, 3);
		console.log('Normals:');
		printBuffer(normalBuffer, 8);
		console.log('-----------------------------------------------------------------------');
				
		this.refine(event.data.attributeBuffers);
	}
	//message: debug text
	else {
		console.log('Worker said:');
		console.log(event.data);
	}
 }
 
 
 x3dom.BitComposer.prototype.init = function(attributeArrayBuffers, numAttributeComponents, numAttributeBytesPerComponent,
											 numAttributeBitsPerLevel, refinementDataURLs, refinementCallback) {
	var attributeOffsets = [];
	var i, off;
	var estimatedStride;
	var refinementBuffers;
		
	if (attributeArrayBuffers.length >   0 									  &&
		attributeArrayBuffers.length === numAttributeBytesPerComponent.length &&
		attributeArrayBuffers.length === numAttributeComponents.length 		  &&
		attributeArrayBuffers.length === numAttributeBitsPerLevel.length		) {
		
		this.refinementCallback = refinementCallback;
		
		off = 0, estimatedStride = 0;
		for (i = 0; i < attributeArrayBuffers.length; ++i) {
			attributeOffsets[i] = off;
			off 			+= numAttributeBitsPerLevel[i] * numAttributeComponents[i];
			estimatedStride += numAttributeBitsPerLevel[i];
		}
		
		//guess stride by checking the number of bits per refinement		
		estimatedStride = Math.ceil(estimatedStride / 8);
		
		this.worker.postMessage({cmd 		 	   : 'setAttributes',										  
								 numComponents 	   : numAttributeComponents,
								 bytesPerComponent : numAttributeBytesPerComponent,											  
								 bitsPerRefinement : numAttributeBitsPerLevel,
								 offset  		   : attributeOffsets,
								 stride			   : estimatedStride});

		//@todo: this is debug code!
		refinementBuffers = [new Uint8Array([0xD0, 0x91, 0x52, 0x13]), new Uint8Array([0xE0, 0x61, 0x62, 0x23])];
		
		//transfer the refinement buffers to the worker											  
		this.worker.postMessage({cmd 		 : 'transferRefinementData',
								 level		 : 0,
								 arrayBuffer : refinementBuffers[0].buffer},
								[refinementBuffers[0].buffer]);
								
		this.worker.postMessage({cmd 		 : 'transferRefinementData',
								 level		 : 1,
								 arrayBuffer : refinementBuffers[1].buffer},
								[refinementBuffers[1].buffer]);
								
		this.refine(attributeArrayBuffers);
	} else {
		 x3dom.debug.logError('Unable to initialize bit composer: the given attribute parameter arrays are not of the same length.');
	}	
 };
 
 
 x3dom.BitComposer.prototype.refine = function(attributeArrayBuffers) {	
	this.worker.postMessage({cmd : 'refine', attributeBuffers : attributeArrayBuffers},
							attributeArrayBuffers);	
 };
 