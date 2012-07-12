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
	this.url 	  = url;	
	this.priority = priority;
	this.xhr 	  = new XMLHttpRequest();
	
	this.xhr.onload = function() {
		//when loading has finished,
		//execute user-given onload callback
		onloadCallback(this.xhr);
		
		--x3dom.DownloadManager.activeDownloads;
		
		x3dom.DownloadManager.tryNextDownload();
	};
};


Request.prototype.send = function() {
	this.xhr.open('GET', encodeURI(this.url), true); //asynchronous	
	this.xhr.send(null);
};

 
x3dom.DownloadManager = {


requests 		: [], //map priority->[requests]

maxDownloads 	: 6,  //number of max. concurrent downloads

activeDownloads : 0,  //number of active downloads


tryNextDownload : function(){
	var firstRequest;
	var i;
		
	//if there are less then maxDownloads running, start a new one,
	//otherwise do nothing
	if (this.activeDownloads < this.maxDownloads) {		
		//remove first queue element, if any
		
		for (i = 0; i < this.requests.length; ++i) {
			//find the request queue with the highest priority
			if (this.requests[i] && this.requests[i].length > 0){
				//remove first request from the queue
				firstRequest = this.requests[i].shift();
				break;
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


get : function(url, onloadCallback, priority) {
	if (!url) {
		x3dom.debug.logError('No URL specified.');		
	}
	else if (!onloadCallback) {
		x3dom.debug.logError('No onload callback specified. Ignoring request for \"' +
							 url + '\"');
	} else {		
		var p = 0;
		
		//if a priority is given then take it,
		//otherwise assume 0
		if (priority) {
			p = priority;
		}
		
		var r = new Request(url, onloadCallback, p);
		
		//enqueue request priority-based
		this.insertRequest(r);
	}
}
	
	
};
