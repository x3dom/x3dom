/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
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
	
  if (typeof Worker !== 'undefined') {
  
    this.worker = new Worker( new x3dom.BitLODWorker().toBlob() );
    
    this.worker.postMessage = this.worker.webkitPostMessage || this.worker.postMessage;
    
    this.worker.addEventListener('message', function(event){return self.messageFromWorker(event);}, false);
    
  }
  else if (!x3dom.BitLODComposer.suppressOnWorkersNotSupported) {
    x3dom.BitLODComposer.suppressOnWorkersNotSupported();
    x3dom.BitLODComposer.suppressOnWorkersNotSupported = true;
  }
  
  this.refinementCallback  = {};
                 
  this.useDebugOutput = false;
};
 
 
//global flags to avoid multiple popups with the same warning
x3dom.BitLODComposer.suppressOnTransferablesNotSupported = false;
x3dom.BitLODComposer.suppressOnWorkersNotSupported       = false;
 
 
x3dom.BitLODComposer.onTransferablesNotSupported = function() {
  alert('Your browser does not support transferables.\n' +
        'This application might run slower than expected due to data cloning operations.');
};
               
               
x3dom.BitLODComposer.suppressOnWorkersNotSupported = function() {
  alert('WebWorkers are not supported by your browser. Unable to run BitLODComposer.');
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
	}
 };
 

 x3dom.BitLODComposer.prototype.run = function(numAttributeComponents, numAttributeBitsPerComponent,
                                            numAttributeBitsPerLevel, refinementDataURLs, refinementCallback,
                                            attributeWriteOffset, strideWriting) {
	var attributeReadOffset = [];
	var i, off;	
	var refinementBuffers;
	var self = this;
  var downloadCallbacks, downloadPriorities;
  
	if (numAttributeBitsPerComponent.length >   0 								            &&		
		numAttributeBitsPerComponent.length === numAttributeComponents.length 	&&
		numAttributeBitsPerComponent.length === numAttributeBitsPerLevel.length	  ) {

		this.refinementCallback = refinementCallback;
		
		off = 0;
		for (i = 0; i < numAttributeBitsPerComponent.length; ++i) {
			attributeReadOffset[i] = off;			
			off 			 	  += numAttributeBitsPerLevel[i];
		}
		
    var testChunk = new ArrayBuffer(1);
    
		this.worker.postMessage({cmd 		 	   		  : 'setAttributes',										  
                             numAttributeComponents 	    : numAttributeComponents,
                             numAttributeBitsPerComponent : numAttributeBitsPerComponent,											  
                             numAttributeBitsPerLevel 	  : numAttributeBitsPerLevel,
                             attributeReadOffset  		    : attributeReadOffset,
                             attributeWriteOffset		      : attributeWriteOffset,
                             strideWriting				        : strideWriting,
                             testChunk                    : testChunk},
                            [testChunk]);
                            
    //after postMessage, testChunk should have been transfered and neutered
    if (testChunk.byteLength > 0 && !x3dom.BitLODComposer.suppressOnTransferablesNotSupported) {
      x3dom.BitLODComposer.onTransferablesNotSupported();
      x3dom.BitLODComposer.suppressOnTransferablesNotSupported = true;
    }
  
    downloadCallbacks  = [];
    downloadPriorities = [];
    
    for (i = 0; i < refinementDataURLs.length; ++i) {      
      downloadPriorities[i] = i;
      (function(idx) {
        
        downloadCallbacks[i] = function(arrayBuffer) {
          self.refinementDataLoaded(arrayBuffer, idx);
        };
      })(i);
    }
    
    //this is just an option:
    //it tells the download manager to return data only if there are no pending requests of higher priority left
    //this way, we ensure can guarantee to get all levels in the correct order, which is visually more satisfying
    //however, one may decide to leave this option out to allow for a random refinement processing order
    x3dom.DownloadManager.toggleStrictReturnOrder(true);
    
    x3dom.DownloadManager.get(refinementDataURLs, downloadCallbacks, downloadPriorities);
    
	} else {
		 x3dom.debug.logError('Unable to initialize bit composer: the given attribute parameter arrays are not of the same length.');
	}
  
  this.refine(new ArrayBuffer(0));
 };
 
 
 x3dom.BitLODComposer.prototype.refine = function(attributeArrayBuffer) {    
   this.worker.postMessage(attributeArrayBuffer, [attributeArrayBuffer]);
 };
 
 
 x3dom.BitLODComposer.prototype.refinementDataLoaded = function(arrayBuffer, l) {  
  this.worker.postMessage({buffer : arrayBuffer, level : l},
                          [arrayBuffer]);
 };
