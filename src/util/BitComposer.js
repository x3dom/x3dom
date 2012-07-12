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
  * This class does three things:
  *		- host a background WebWorker which performs the bitwise composition
  *		- wrap the message interface which is used to communicate with the worker
  *		- automatically provide the worker with refinement data in the correct order,
  *		  by utilizing the x3dom.DownloadManager
  */
 x3dom.BitComposer = function(workerScriptfile) {
	var self = this;
	this.worker = new Worker(workerScriptfile ? workerScriptfile : 'BitComposerWorker.js');	
	this.worker.addEventListener('message', function(event){return self.messageFromWorker(event);}, false);
	
	this.refinementCallback   		= {};	
	this.refinementDataURLs   		= [];	
	this.nextLevelToSend  	  		= 0;	
	this.downloadedRefinementLevels = [];
	
	this.requestedRefinement  		= {pendingRequests 	   : 0,
									   attributeArrayBuffers : []	   };
								 
	this.useDebugOutput = false;
 };
 
 
 x3dom.BitComposer.prototype.toggleDebugOutput = function(flag) {
	this.useDebugOutput = flag;
 };
 
 
 x3dom.BitComposer.prototype.messageFromWorker = function(event) {	
	//forward refined attribute data by invoking the initially set callback function
	if (event.data.msg == 'refinementDone') {		
		this.refinementCallback({attributeArrayBuffers : event.data.attributeArrayBuffers});
	}
	//display error message text from worker
	else {
		x3dom.debug.logError('Error message from WebWorker context: ' + event.data);
	}
 }
 

 x3dom.BitComposer.prototype.run = function(numAttributeComponents, numAttributeBitsPerComponent,
											numAttributeBitsPerLevel, refinementDataURLs, refinementCallback) {
	var attributeReadOffset = [];
	var i, off;	
	var refinementBuffers;
	var self = this;

	if (numAttributeBitsPerComponent.length >   0 									  &&		
		numAttributeBitsPerComponent.length === numAttributeComponents.length 		  &&
		numAttributeBitsPerComponent.length === numAttributeBitsPerLevel.length		) {
		
		this.refinementCallback = refinementCallback;
		this.refinementDataURLs = refinementDataURLs;
		
		off = 0;
		for (i = 0; i < numAttributeBitsPerComponent.length; ++i) {
			attributeReadOffset[i] = off;			
			off 			 	  += numAttributeBitsPerLevel[i];
		}
		
		this.worker.postMessage({cmd 		 	   			   : 'setAttributes',										  
								 numAttributeComponents 	   : numAttributeComponents,
								 numAttributeBitsPerComponent  : numAttributeBitsPerComponent,											  
								 numAttributeBitsPerLevel 	   : numAttributeBitsPerLevel,
								 attributeReadOffset  		   : attributeReadOffset});

		//send priority-based requests for all refinement levels
		for (i = 0; i < refinementDataURLs.length; ++i) {
		    x3dom.DownloadManager.get(this.refinementDataURLs[i],
									  function(response){ self.refinementDataDownloaded(response); },
									  i);
		}

		//the call to this function includes a request for the first refinement
		this.refine([]);
	} else {
		 x3dom.debug.logError('Unable to initialize bit composer: the given attribute parameter arrays are not of the same length.');
	}	
 };
 
 
 x3dom.BitComposer.prototype.refine = function(attributeArrayBuffers) {
	this.requestedRefinement.pendingRequests++;
		
	this.refine_private(attributeArrayBuffers);
 };
 
 
 x3dom.BitComposer.prototype.refine_private = function(attributeArrayBuffers) {
	//check if the next level was already downloaded
	if (this.downloadedRefinementLevels.length && this.downloadedRefinementLevels[0] === this.nextLevelToSend) {
		this.worker.postMessage({cmd : 'refine', attributeArrayBuffers : attributeArrayBuffers},
								attributeArrayBuffers);

		this.downloadedRefinementLevels.shift();
		
		this.nextLevelToSend++;
		
		if (this.requestedRefinement.pendingRequests) {
			this.requestedRefinement.pendingRequests--;
		}
		else {
			x3dom.debug.logError('BitComposer error: a refinement job was sent to the worker without being requested by the user. ' + 
								 'This can mean that the worker received invalid data due to missing ArrayBuffer ownership.');
		}
		
		if (this.useDebugOutput) {
			x3dom.debug.logInfo('Refinement request processed! ' + this.requestedRefinement.pendingRequests +
								' request(s) pending.');
		}
	}
	//postpone refinement request until the matching data was downloaded
	else if (this.nextLevelToSend < this.refinementDataURLs.length) {		
		this.requestedRefinement.attributeArrayBuffers = attributeArrayBuffers;
		
		if (this.useDebugOutput) {
			x3dom.debug.logInfo('Refinement request postponed. '  + this.requestedRefinement.pendingRequests +
								' request(s) pending.');
		}
	}
	//no refinements left - we're done!
	else {
		if (this.useDebugOutput) {
			x3dom.debug.logInfo('No refinements left to process!');			
		}
	}
 },
 
 
 x3dom.BitComposer.prototype.refinementDataDownloaded = function(data) {
	var i;

	if (data.arrayBuffer) {
		//find level of the returned data
		for (i = 0; i < this.refinementDataURLs.length; ++i) {
			if (data.url === this.refinementDataURLs[i]) {
				break;
			}
		}

		if (i < this.refinementDataURLs.length) {
			if (this.useDebugOutput) {
				x3dom.debug.logInfo('Refinement level ' + i + ' has been loaded!');
			}
			
			this.worker.postMessage({cmd 		 : 'transferRefinementData',
									 level		 : i,
									 arrayBuffer : data.arrayBuffer},
									[data.arrayBuffer]);

			this.downloadedRefinementLevels.push(i);
			this.downloadedRefinementLevels.sort(function(a, b) { return a - b; });

			//if there is a pending request for refinement, try to process it
		    if (this.requestedRefinement.pendingRequests) {			
				this.refine_private(this.requestedRefinement.attributeArrayBuffers);
			}
		}
		else {
			x3dom.logError('Error when enqueueing refinement data: no level with the given URL could be found.');
		}
	}
	else {
		x3dom.debug.logError('Unable to use downloaded refinement data: no ArrayBuffer data recognized.');
	}
 }
 