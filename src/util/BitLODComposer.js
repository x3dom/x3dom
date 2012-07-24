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
 
 
  /**
  * This class does two things:
  *		- host a background WebWorker which performs the bitwise composition
  *		- wrap the message interface which is used to communicate with the worker


  */
 x3dom.BitLODComposer = function() {

	var self = this;
	
	this.worker = new Worker( new x3dom.BitLODWorker().toBlob() );	
  
	this.worker.postMessage = this.worker.webkitPostMessage || this.worker.postMessage;
  
	this.worker.addEventListener('message', function(event){return self.messageFromWorker(event);}, false);
	
	this.refinementCallback  = {};
								 
	this.useDebugOutput = false; 
 };
 
 
 x3dom.BitLODComposer.prototype.toggleDebugOutput = function(flag) {
	this.useDebugOutput = flag;
 };
 
 
 x3dom.BitLODComposer.prototype.messageFromWorker = function(event) {
 
	  if (event.data.msg) {
		
		//display message text from worker
		if (event.data.msg == 'log') {		
		  x3dom.debug.logInfo('Message from WebWorker context: ' + event.data.text);
		}

		//@todo: debug hack
		//debug: measure time until attribute metadata has been set up inside the worker
		else if (event.data.msg == 'workerSetUp') {
		  var timerDisplay = document.getElementById('workerTimerElement');
		  if (timerDisplay && (typeof loadingTimer !== 'undefined')) {
			timerDisplay.textContent = 'Worker set up after ' + (event.data.timestamp - loadingTimer) + ' ms';
		  }
		}

		//@todo: debug hack
		//debug: measure time worker needed for decoding
		else if (event.data.msg == 'decodeTime') {	
		  x3dom.debug.logInfo('Worker needed ' + event.data.time + ' ms to do the job.');
		  

		  if (typeof UpdateDecode !== 'undefined') {
			UpdateDecode(event.data.time);
		  }
		}
	}	
	else {
		//forward refined attribute data by invoking the initially set callback function  		
		this.refinementCallback(event.data);
    
    //if (++refs === 8)    
    //this.refinementCallback(event.data);
    //else
    //this.refine(event.data);
	}
 }
 

 x3dom.BitLODComposer.prototype.run = function(numAttributeComponents, numAttributeBitsPerComponent,
                                            numAttributeBitsPerLevel, refinementDataURLs, refinementCallback,
                                            attributeWriteOffset, strideWriting) {
	var attributeReadOffset = [];
	var i, off;	
	var refinementBuffers;
	var self = this;

	if (numAttributeBitsPerComponent.length >   0 								&&		
		numAttributeBitsPerComponent.length === numAttributeComponents.length 	&&
		numAttributeBitsPerComponent.length === numAttributeBitsPerLevel.length	  ) {

		this.refinementCallback = refinementCallback;
		
		off = 0;
		for (i = 0; i < numAttributeBitsPerComponent.length; ++i) {
			attributeReadOffset[i] = off;			
			off 			 	  += numAttributeBitsPerLevel[i];
		}
		
		this.worker.postMessage({cmd 		 	   		  : 'setAttributes',										  
								 numAttributeComponents 	    : numAttributeComponents,
								 numAttributeBitsPerComponent : numAttributeBitsPerComponent,											  
								 numAttributeBitsPerLevel 	  : numAttributeBitsPerLevel,
								 attributeReadOffset  		    : attributeReadOffset,
								 attributeWriteOffset		      : attributeWriteOffset,
								 strideWriting				        : strideWriting});	
  
    for (i = 0; i < refinementDataURLs.length; ++i) {
      (function(idx) {
        var xhr = new XMLHttpRequest();
        
        xhr.onload = function() {
          self.refinementDataLoaded(xhr, idx);
        };
        
        xhr.open('GET', refinementDataURLs[i], true); //asynchronous         
        xhr.responseType = 'arraybuffer';
        
        xhr.send(null);
      })(i);
    }
	} else {
		 x3dom.debug.logError('Unable to initialize bit composer: the given attribute parameter arrays are not of the same length.');
	}
  
  this.refine(new ArrayBuffer(0));
 };
 
 
 x3dom.BitLODComposer.prototype.refine = function(attributeArrayBuffer) {    
   this.worker.postMessage(attributeArrayBuffer, [attributeArrayBuffer]);
 };
 
 
 x3dom.BitLODComposer.prototype.refinementDataLoaded = function(xhr, l) {  
  this.worker.postMessage({buffer : xhr.response, level : l},
                          [xhr.response]);
 }