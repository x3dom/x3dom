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
 * Class: x3dom.DownloadManager
 *
 * Simple priority-based download manager.
 * Before objects of priority n+1 are available,
 * all objects of priority n must have been already delivered.
 * The highest priority key is 0.
 * 
 */

//a small Request class
var Request = function(url, onloadCallback, priority){
	this.url 	  		 = url;	
	this.priority 		 = priority;
	this.xhr 	  		 = new XMLHttpRequest();
	this.onloadCallbacks = [onloadCallback];
	
	var self = this;

	this.xhr.onload = function() {		
		if (x3dom.DownloadManager.debugOutput) {
			x3dom.debug.logInfo('Download manager received data for URL \'' + self.url + '\', invoking callbacks.');
		}
		
		//check if object is loaded for the first time or if it has been set to dirty
		if (!x3dom.DownloadManager.loadedObjects[url]) {
			x3dom.DownloadManager.loadedObjects[url] = {arrayBuffer : self.xhr.response};
		}
	
		var i;
		for (i = 0; i < self.onloadCallbacks.length; ++i) {			
			self.onloadCallbacks[i]({arrayBuffer : x3dom.DownloadManager.loadedObjects[url].arrayBuffer,
									 url 		 : self.url});
		}
		
		--x3dom.DownloadManager.activeDownloads;
		
		x3dom.DownloadManager.removeDownload(self);
		
		x3dom.DownloadManager.tryNextDownload();
	};
};


Request.prototype.send = function() {
	this.xhr.open('GET', encodeURI(this.url), true); //asynchronous	
	
	//at the moment, ArrayBuffer is the only possible return type
	this.xhr.responseType = 'arraybuffer';
	
	this.xhr.send(null);
	
	if (x3dom.DownloadManager.debugOutput) {
		x3dom.debug.logInfo('Download manager posted XHR for URL \'' + this.url + '\'.');
	}
};

 
x3dom.DownloadManager = {


requests 		: [], //map priority->[requests]

maxDownloads 	: 6,  //number of max. concurrent downloads

activeDownloads : 0,  //number of active downloads

loadedObjects	: {}, //map from urls to arraybuffer data (encapsulated as {arraybuffer : buffer})

debugOutput		: false,


toggleDebugOutput : function(flag) {
	this.debugOutput = flag;	
},


removeDownload : function(req) {
	var i, j;
	var done = false;

	for (i = 0; i < this.requests.length && !done; ++i) {	
		if (this.requests[i]){			
			for (j = 0; j < this.requests[i].length; ++j) {
				if (this.requests[i][j] === req) {
					this.requests[i].splice(j, 1);
					done = true;
					break;
				}
			}
		}
	}
},


tryNextDownload : function() {
	var firstRequest;
	var i, j;
		
	//if there are less then maxDownloads running, start a new one,
	//otherwise do nothing
	if (this.activeDownloads < this.maxDownloads) {	
		//remove first queue element, if any
		for (i = 0; i < this.requests.length && !firstRequest; ++i) {
			//find the request queue with the highest priority
			if (this.requests[i]){
				//remove first unsent request from the queue, if any
				for (j = 0; j < this.requests[i].length; ++j) {					
					if (this.requests[i][j].xhr.readyState === XMLHttpRequest.UNSENT) {
						firstRequest = this.requests[i][j];
						break;						
					}
				}
			}
		}
		
		if (firstRequest) {		
			firstRequest.send();			
			
			++this.activeDownloads;
		}
	}
},


insertRequest : function(req) {	
	if (this.requests[req.priority]) {
		this.requests[req.priority].push(req);
	}
	else {
		this.requests[req.priority] = [req];
	}
	
	//try to download data
	this.tryNextDownload();
},


/**
 * Requests a download from the given URL, with the given onloadCallback and priority.
 * The callback function will be invoked with a JSON object as parameter, where the
 * 'arrayBuffer' member contains a reference to the requested data and the 'url' member
 * contains the original user-given URL of the object.
 *
 * If a request to the given url has already been processed, the data is directly returned.
 * 
 * If there is no data from the given url available, but there is already a running request
 * for it, the new callback is just appended to the old running request object. Note that,
 * in this special case, the priority of the old request is not changed, i.e. the priority
 * of the new request to the same url is ignored.
 */
get : function(url, onloadCallback, priority) {
	if (!url) {
		x3dom.debug.logError('No URL specified.');		
	}
	else if (!onloadCallback) {
		x3dom.debug.logError('No onload callback specified. Ignoring request for \"' +
							 url + '\"');
	} else {
		if (x3dom.DownloadManager.debugOutput) {
			x3dom.debug.logInfo('Download manager accepted request for URL \'' + url + '\'.');
		}
		//if the data has already been downloaded has not been set to dirty, return it
		if (x3dom.DownloadManager.loadedObjects[url]) {
			if (x3dom.DownloadManager.debugOutput) {
				x3dom.debug.logInfo('Download returns previously stored data for URL \'' + url + '\', invoking callback.');
			}
		
			onloadCallback({arrayBuffer : this.loadedObjects[url].arrayBuffer,
							url			: url});
		}
		//enqueue request priority-based or append callback to a matching active request
		else {
			//check if there is already an enqueued or sent request for the given url
			var i, j;
			var found = false;

			for (i = 0; i < this.requests.length && !found; ++i) {	
				if (this.requests[i]){			
					for (j = 0; j < this.requests[i].length; ++j) {
						if (this.requests[i][j].url === url) {							
							this.requests[i][j].onloadCallbacks.push(onloadCallback);
							if (x3dom.DownloadManager.debugOutput) {
								x3dom.debug.logInfo('Download manager appended onload callback for URL \'' + url +
													'\' to a running request using the same URL.');
							}
							
							found = true;
							break;
						}
					}
				}
			}
		
			if (!found) {
				var p = 0;
				
				//if a priority is given then take it, otherwise assume 0
				if (priority) {
					p = priority;
				}
				
				var r = new Request(url, onloadCallback, p);
				
				this.insertRequest(r);
			}
		}
	}
}
	
	
};
