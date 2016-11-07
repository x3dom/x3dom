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
 * Class: x3dom.DownloadManager
 *
 * Simple priority-based download manager.
 * Before objects of priority n+1 are available,
 * all objects of priority n must have been already delivered.
 * The highest priority key is 0.
 * 
 */

/// a small Request class
var Request = function(url, onloadCallback, priority){
	this.url 	  		     = url;	
	this.priority 		   = priority;
	this.xhr 	  		     = new XMLHttpRequest();
	this.onloadCallbacks = [onloadCallback];
	
	var self = this;

	this.xhr.onload = function() {		
		if (x3dom.DownloadManager.debugOutput) {
			x3dom.debug.logInfo('Download manager received data for URL \'' + self.url + '\'.');
		}
		
		--x3dom.DownloadManager.activeDownloads;
	
    if ((x3dom.DownloadManager.stallToKeepOrder === false ) || (x3dom.DownloadManager.resultGetsStalled(self.priority) === false)) {
      var i;
      for (i = 0; i < self.onloadCallbacks.length; ++i) {			
        self.onloadCallbacks[i](self.xhr.response);
      }
      
      x3dom.DownloadManager.removeDownload(self);
      
      x3dom.DownloadManager.updateStalledResults();
    }
    else if (x3dom.DownloadManager.debugOutput) {
			x3dom.debug.logInfo('Download manager stalled downloaded result for URL \'' + self.url + '\'.');
		}
    
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

    requests 		     : [], //map priority->[requests]

    maxDownloads 	   : 6,  //number of max. concurrent downloads

    activeDownloads  : 0,  //number of active downloads

    debugOutput		   : false,

    stallToKeepOrder : false,


    toggleDebugOutput : function(flag) {
        this.debugOutput = flag;	
    },


    toggleStrictReturnOrder : function(flag) {
      //@todo: this is not working properly yet!
      this.stallToKeepOrder = false;
      //this.stallToKeepOrder = flag;
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
                if (this.requests[i]) {
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


    resultGetsStalled : function(priority) {
      var i;
      
      for (i = 0; i < priority; ++i) {
        if (this.requests[i] && this.requests[i].length) {
          return true;
        }
      }
      
      return false;
    },


    updateStalledResults : function() {
      if (x3dom.DownloadManager.stallToKeepOrder) {  
        var i, j, k;
        var req, pendingRequestFound = false;
        
        for (i = 0; i < this.requests.length && !pendingRequestFound; ++i) {
        
          if (this.requests[i]) {
            for (j = 0; j < this.requests[i].length; ++j) {
              //check if there is a stalled result and relase it, if so
              req = this.requests[i][j];
              
              if (req.xhr.readyState === XMLHttpRequest.DONE) {
              
                if (x3dom.DownloadManager.debugOutput) {
                  x3dom.debug.logInfo('Download manager releases stalled result for URL \'' + req.url + '\'.');
                }
                
                for (k = 0; k < req.onloadCallbacks.length; ++k) {
                  req.onloadCallbacks[k](req.xhr.response);
                }
                
                //remove request from the list
                this.requests[i].splice(j, 1);          
              }
              //if there is an unfinished result, stop releasing results of lower priorities
              else {
                pendingRequestFound = true;	
              }
            }
          }
          
        }
      }
    },


    /**
     * Requests a download from the given URL, with the given onloadCallback and priority.
     * The callback function will be invoked with a JSON object as parameter, where the
     * 'arrayBuffer' member contains a reference to the requested data and the 'url' member
     * contains the original user-given URL of the object.
     * 
     * If there is no data from the given url available, but there is already a registered request
     * for it, the new callback is just appended to the old registered request object. Note that,
     * in this special case, the priority of the old request is not changed, i.e. the priority
     * of the new request to the same url is ignored.
     */
    get : function(urls, onloadCallbacks, priorities) {
      var i, j, k, r;
      var found = false;
      var url, onloadCallback, priority;
      
      if (urls.length !== onloadCallbacks.length || urls.length !== priorities.length)
      {
        x3dom.debug.logError('DownloadManager: The number of given urls, onload callbacks and priorities is not equal. Ignoring requests.');
        return;
      }
      
      //insert requests
      for (k = 0; k < urls.length; ++k) {
        if (!onloadCallbacks[k] === undefined || !priorities[k] === undefined) {
          x3dom.debug.logError('DownloadManager: No onload callback and / or priority specified. Ignoring request for \"' + url + '\"');
          continue;
        }
        else {
          url            = urls[k];
          onloadCallback = onloadCallbacks[k];
          priority       = priorities[k];
          
          //enqueue request priority-based or append callback to a matching active request		
          
          //check if there is already an enqueued or sent request for the given url
          for (i = 0; i < this.requests.length && !found; ++i) {
            if (this.requests[i]) {			
              for (j = 0; j < this.requests[i].length; ++j) {
                if (this.requests[i][j].url === url) {
                  this.requests[i][j].onloadCallbacks.push(onloadCallback);
                  
                  if (x3dom.DownloadManager.debugOutput) {
                    x3dom.debug.logInfo('Download manager appended onload callback for URL \'' + url + '\' to a registered request using the same URL.');
                  }
                  
                  found = true;
                  break;
                }
              }
            }
          }
        
          if (!found) {
            r = new Request(url, onloadCallback, priority);
            
            if (this.requests[priority]) {
              this.requests[priority].push(r);
            }
            else {
              this.requests[priority] = [r];
            }
          }
        }
      }
      
      //try to download data
      for (i = 0; i < urls.length && this.activeDownloads < this.maxDownloads; ++i) {
        this.tryNextDownload();    
      }
    },

    abortAllDownloads : function()
    {
        var request;
        
        for ( var i = 0; i < this.requests.length; i++ )
        {
            if ( this.requests[ i ] )
            {
                for ( var j = 0; j < this.requests.length; j++ )
                {
                    //Get Request
                    request = this.requests[i][j];
                    
                    //Abort XHR
                    request.xhr.abort();
                    
                    //Remove Request
                    this.removeDownload( request );
                }
            }
        }
    }
	
};
