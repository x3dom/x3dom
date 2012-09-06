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
  this.attributes[attributeId] = {resultBuffer : bufferView.buffer,
                                  jobs         : []                };  
};


x3dom.RefinementJobManager.prototype.addRefinementJob = function(attributeId, job) {
  job.state = JOB_WAITING_FOR_DATA;
  
  this.attributes[attributeId].jobs.push(job);
  
  //add download ...
  
  //on download:
  job.state = JOB_DATA_AVAILABLE;
  
  this.tryNextJob(attributeId);
};


x3dom.RefinementJobManager.prototype.tryNextJob = function(attributeId) {
  var i;
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
    jobs[availableIndex].state = JOB_GETTING_PROCESSED;
    
    buffer = this.attributes[attributeId].resultBuffer;
    
    this.worker.postMessage({msg          : 'processJob',
                             attributeId  : attributeId,
                             format       : jobs[availableIndex].format,
                             resultBuffer : buffer                      },
                            [buffer]);
                            
    //after postMessage, buffer should have been transfered and neutered
		if (buffer.byteLength > 0 && !x3dom.RefinementJobManager.suppressOnTransferablesNotSupported) {
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
      jobs[i].finishedCallback(attributeId, new Uint8Array(resultBuffer));
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
