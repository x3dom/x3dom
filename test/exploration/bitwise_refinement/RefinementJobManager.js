const JOB_WAITING_FOR_DATA  = 0;
const JOB_DATA_AVAILABLE    = 1;
const JOB_GETTING_PROCESSED = 2;
const JOB_FINISHED          = 3;


x3dom.RefinementJobManager = function() {
  var self = this;
  
  if (typeof Worker !== 'undefined') {
    this.worker = new Worker(new x3dom.RefinementJobWorker().toBlob());
    this.worker.postMessage = this.worker.webkitPostMessage || this.worker.postMessage;  
    this.worker.addEventListener('message', function(event){return self.messageFromWorker(event);}, false);
  }
  else if (!x3dom.RefinementJobManager.suppressOnWorkersNotSupported) {
    x3dom.RefinementJobManager.onWorkersNotSupported();
    x3dom.RefinementJobManager.suppressOnWorkersNotSupported = true;
  }
 
  
  this.attributes = [];
};
 

//global flags to avoid multiple popups with the same warning
x3dom.RefinementJobManager.suppressOnTransferablesNotSupported = false;
x3dom.RefinementJobManager.suppressOnWorkersNotSupported       = false;
 
 
x3dom.RefinementJobManager.onTransferablesNotSupported = function() {
  alert('Your browser does not support transferables.\n' +
        'This application might run slower than expected due to data cloning operations.');
};
               
               
x3dom.RefinementJobManager.onWorkersNotSupported = function() {
  alert('WebWorkers are not supported by your browser. Unable to use RefinementJobManager.');
};

 
x3dom.RefinementJobManager.prototype.addResultBuffer = function(attributeId, bufferView) {
  //at the moment, we assume that only unsigned integer types are used
  this.attributes[attributeId] = {resultBuffer                : bufferView.buffer,
                                  resultBufferBytesPerElement : bufferView.BYTES_PER_ELEMENT,
                                  jobs                        : []                };
};


x3dom.RefinementJobManager.prototype.addRefinementJob = function(attributeId, priority, url, finishedCallback, stride,
                                                                 numComponentsList, bitsPerLevelList, readOffsetList, writeOffsetList) {
  var self = this;  
  
  var job = {priority           : priority,        
              url               : url,
              finishedCallback  : finishedCallback,
              stride            : stride,
              numComponentsList : numComponentsList,
              bitsPerLevelList  : bitsPerLevelList,
              readOffsetList    : readOffsetList,
              writeOffsetList   : writeOffsetList,
              state             : JOB_WAITING_FOR_DATA,
              dataBuffer        : {}                   };
  
  this.attributes[attributeId].jobs.push(job);
  
  var downloadCallback;
  
  (function(attId, url) {
    downloadCallback = function(arrayBuffer) {
      self.jobInputDataLoaded(attId, url, arrayBuffer);
    };
  })(attributeId);
    
  //this is just an option:
  //it tells the download manager to return data only if there are no pending requests of higher priority left
  //this way, we ensure can guarantee to get all levels in the correct order, which is visually more satisfying
  //however, one may decide to leave this option out to allow for a random refinement processing order
  x3dom.DownloadManager.toggleStrictReturnOrder(true);
    
  x3dom.DownloadManager.get([url], [downloadCallback], [priority]);
};


x3dom.RefinementJobManager.prototype.jobInputDataLoaded = function(attributeId, url, dataBuffer) {
  var i;
  var jobs = this.attributes[attributeId].jobs;
  
  for (i = 0; i < jobs.length; ++i) {
    if (jobs[i].url === url) {      
      jobs[i].state      = JOB_DATA_AVAILABLE;  
      jobs[i].dataBuffer = dataBuffer;
      
      this.tryNextJob(attributeId);
    }
  }
}


x3dom.RefinementJobManager.prototype.tryNextJob = function(attributeId) {
  var i, job;
  var jobs           = this.attributes[attributeId].jobs;  
  var owningBuffer   = true;
  var availableIndex = -1;
  var bufferView;  
  
  for (i = 0; i < jobs.length; ++i) {
      if (jobs[i].state === JOB_GETTING_PROCESSED) {        
        owningBuffer = false;
        break;
      }
      if (availableIndex === -1 && jobs[i].state === JOB_DATA_AVAILABLE) {
        availableIndex = i;
      }
  }
  
  if (owningBuffer && availableIndex !== -1) {
    job = jobs[availableIndex];
    
    job.state = JOB_GETTING_PROCESSED;
    
    this.worker.postMessage({msg                         : 'processJob',
                             attributeId                 : attributeId,
                             stride                      : job.stride,
                             numComponentsList           : job.numComponentsList,
                             bitsPerLevelList            : job.bitsPerLevelList,
                             readOffsetList              : job.readOffsetList,
                             writeOffsetList             : job.writeOffsetList,                             
                             resultBufferBytesPerElement : this.attributes[attributeId].resultBufferBytesPerElement,
                             dataBuffer                  : job.dataBuffer,
                             resultBuffer                : this.attributes[attributeId].resultBuffer                },
                            [job.dataBuffer, this.attributes[attributeId].resultBuffer]);
                             
    //after postMessage, the buffers should have been transfered and neutered
		if ((job.dataBuffer.byteLength > 0 || this.attributes[attributeId].resultBuffer.byteLength > 0) &&
        !x3dom.RefinementJobManager.suppressOnTransferablesNotSupported                               ) {
		  x3dom.RefinementJobManager.onTransferablesNotSupported();
		  x3dom.RefinementJobManager.suppressOnTransferablesNotSupported = true;
		}
  }
};


x3dom.RefinementJobManager.prototype.processedDataAvailable = function(attributeId, resultBuffer) {
  var i;
  var jobs = this.attributes[attributeId].jobs;
  
  this.attributes[attributeId].resultBuffer = resultBuffer;
  
  for (i = 0; i < jobs.length; ++i) {
    if (jobs[i].state === JOB_GETTING_PROCESSED) {
      jobs[i].state = JOB_FINISHED;      
      jobs[i].finishedCallback(attributeId, this.getBufferView(attributeId));
      break;
    }
  }
};


x3dom.RefinementJobManager.prototype.continueProcessing = function(attributeId) {
  this.tryNextJob(attributeId);
};


x3dom.RefinementJobManager.prototype.messageFromWorker = function(message) {
  if (message.data.msg) {
    switch (message.data.msg) {
      
      case 'jobFinished':        
        this.processedDataAvailable(message.data.attributeId,
                                    message.data.resultBuffer);
        break;
                                    
      case 'log':
        console.log('Message from Worker Context: ' + message.data.txt);
        break;
    }
  }
};


x3dom.RefinementJobManager.prototype.getBufferView = function(attributeId) {
  var att = this.attributes[attributeId];
  
  switch (att.resultBufferBytesPerElement) {
    case 1:
      return new Uint8Array(att.resultBuffer);
    case 2:
      return new Uint16Array(att.resultBuffer);
    case 4:
      return new Uint32Array(att.resultBuffer);
  }
};
